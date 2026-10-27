-- Ledger database schema. Run once in the Supabase SQL editor.
create extension if not exists pgcrypto;

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80), type text not null check (type in ('current','savings','cash','credit','other')),
  opening_balance numeric(14,2) not null default 0, currency text not null default 'EUR', archived boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 80), kind text not null check (kind in ('expense','income')),
  created_at timestamptz not null default now(), unique(user_id,name,kind)
);
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  date date not null, type text not null check (type in ('expense','income')), amount numeric(14,2) not null check (amount>0),
  account_id uuid not null references public.accounts(id), category_id uuid references public.categories(id) on delete set null,
  merchant text not null default '', notes text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade, month text not null check (month ~ '^\\d{4}-\\d{2}$'),
  amount numeric(14,2) not null check (amount>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(user_id,category_id,month)
);
create table if not exists public.recurring_transactions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id), category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('expense','income')), amount numeric(14,2) not null check (amount>0), merchant text not null default '', notes text not null default '',
  frequency text not null check (frequency in ('weekly','monthly','yearly')), next_date date not null, active boolean not null default true,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists transactions_user_date_idx on public.transactions(user_id,date desc);
create index if not exists recurring_user_date_idx on public.recurring_transactions(user_id,next_date);
create index if not exists budgets_user_month_idx on public.budgets(user_id,month);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists transactions_touch on public.transactions; create trigger transactions_touch before update on public.transactions for each row execute function public.touch_updated_at();
drop trigger if exists budgets_touch on public.budgets; create trigger budgets_touch before update on public.budgets for each row execute function public.touch_updated_at();
drop trigger if exists recurring_touch on public.recurring_transactions; create trigger recurring_touch before update on public.recurring_transactions for each row execute function public.touch_updated_at();

create or replace function public.validate_transaction_refs() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.accounts a where a.id=new.account_id and a.user_id=new.user_id) then raise exception 'Account does not belong to user'; end if;
 if new.category_id is not null and not exists(select 1 from public.categories c where c.id=new.category_id and c.user_id=new.user_id and c.kind=new.type) then raise exception 'Category does not belong to user or has wrong type'; end if;
 return new;
end $$;
drop trigger if exists transactions_validate on public.transactions; create trigger transactions_validate before insert or update on public.transactions for each row execute function public.validate_transaction_refs();

create or replace function public.validate_recurring_refs() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.accounts a where a.id=new.account_id and a.user_id=new.user_id) then raise exception 'Account does not belong to user'; end if;
 if new.category_id is not null and not exists(select 1 from public.categories c where c.id=new.category_id and c.user_id=new.user_id and c.kind=new.type) then raise exception 'Category does not belong to user or has wrong type'; end if;
 return new;
end $$;
drop trigger if exists recurring_validate on public.recurring_transactions; create trigger recurring_validate before insert or update on public.recurring_transactions for each row execute function public.validate_recurring_refs();

create or replace function public.validate_budget_ref() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if not exists(select 1 from public.categories c where c.id=new.category_id and c.user_id=new.user_id and c.kind='expense') then raise exception 'Budget category must be an expense category owned by user'; end if;
 return new;
end $$;
drop trigger if exists budgets_validate on public.budgets; create trigger budgets_validate before insert or update on public.budgets for each row execute function public.validate_budget_ref();

alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.recurring_transactions enable row level security;
revoke all on public.accounts,public.categories,public.transactions,public.budgets,public.recurring_transactions from anon;
grant select,insert,update,delete on public.accounts,public.categories,public.transactions,public.budgets,public.recurring_transactions to authenticated;

do $$ declare t text; begin foreach t in array array['accounts','categories','transactions','budgets','recurring_transactions'] loop
 execute format('drop policy if exists %I_select on public.%I',t,t); execute format('create policy %I_select on public.%I for select to authenticated using (auth.uid()=user_id)',t,t);
 execute format('drop policy if exists %I_insert on public.%I',t,t); execute format('create policy %I_insert on public.%I for insert to authenticated with check (auth.uid()=user_id)',t,t);
 execute format('drop policy if exists %I_update on public.%I',t,t); execute format('create policy %I_update on public.%I for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id)',t,t);
 execute format('drop policy if exists %I_delete on public.%I',t,t); execute format('create policy %I_delete on public.%I for delete to authenticated using (auth.uid()=user_id)',t,t);
 end loop; end $$;

create or replace function public.seed_ledger_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.accounts(user_id,name,type,opening_balance,currency) values(new.id,'Current Account','current',0,'EUR');
 insert into public.categories(user_id,name,kind) values
 (new.id,'Groceries','expense'),(new.id,'Rent','expense'),(new.id,'Transport','expense'),(new.id,'Eating Out','expense'),(new.id,'Shopping','expense'),(new.id,'Bills','expense'),(new.id,'Subscriptions','expense'),(new.id,'Other','expense'),(new.id,'Salary','income'),(new.id,'Other Income','income')
 on conflict do nothing; return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users; create trigger on_auth_user_created after insert on auth.users for each row execute function public.seed_ledger_user();

insert into public.accounts(user_id,name,type,opening_balance,currency)
select u.id,'Current Account','current',0,'EUR' from auth.users u where not exists(select 1 from public.accounts a where a.user_id=u.id);
