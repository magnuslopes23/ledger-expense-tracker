# Ledger — Personal Expense Tracker

A mobile-first personal finance PWA designed for GitHub Pages. It works in two modes:

- **Local-only:** no backend, no login, data stays in the browser's local storage.
- **Cloud sync:** Supabase Auth + PostgreSQL + Row Level Security (RLS).

The app supports transactions, accounts, category budgets, recurring items, dashboard charts, CSV export/import, full JSON backup/restore, responsive desktop/mobile layouts, and PWA installation on iPhone.

## 1. Run locally

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

With no environment variables the app automatically runs in **local-only mode**.

## 2. Enable Supabase cloud sync

Create a Supabase project, then open **SQL Editor** and run:

```text
supabase/schema.sql
```

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Use the **publishable/anon client key only**. Never place a `service_role` key in a frontend application.

In Supabase, configure **Authentication → URL Configuration** so the Site URL / allowed redirect URL includes your deployed GitHub Pages URL.

The SQL migration:

- creates `accounts`, `categories`, `transactions`, `budgets`, and `recurring_transactions`;
- seeds new users with starter accounts/categories;
- enables RLS on every public table;
- revokes anonymous table access;
- grants only authenticated CRUD operations;
- creates separate select/insert/update/delete policies using `auth.uid()`;
- validates referenced accounts/categories belong to the same user.

## 3. Deploy to GitHub Pages

Create a GitHub repository and push this project to the `main` branch.

For **local-only mode**, no GitHub secrets are required.

For **cloud mode**, add repository secrets:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Then open:

```text
Repository Settings → Pages → Build and deployment → Source → GitHub Actions
```

The included `.github/workflows/deploy.yml` builds and publishes automatically on every push to `main`.

## 4. Install on iPhone

After deployment:

1. Open the GitHub Pages URL in Safari.
2. Tap Share.
3. Choose **Add to Home Screen**.
4. Launch **Ledger** from the home screen.

No Apple Developer membership is required because this is a PWA rather than a native App Store binary.

## 5. Backups and portability

Under **Settings & data**:

- **Export CSV** exports transactions in a conventional spreadsheet-friendly format.
- **Import CSV** accepts Ledger CSV exports and compatible files with `date,type,amount,account,category,merchant,notes` headings.
- **Full JSON backup** preserves accounts, categories, transactions, budgets and recurring items.
- **Restore JSON** replaces the current Ledger dataset with a previous full backup.

A local-only installation should be backed up periodically because clearing Safari/browser site data can remove local records.

## 6. Security model

### Cloud mode

```text
Browser / PWA
    |
    | HTTPS + authenticated JWT
    v
Supabase Data API
    |
    v
PostgreSQL RLS
    |
    +-- user A can access only user A rows
    +-- user B can access only user B rows
```

The frontend contains the Supabase publishable key. That is expected for Supabase browser apps; authorization is enforced by authentication, grants and RLS. The privileged service-role key must remain server-side and is not used by Ledger.

### Local-only mode

No financial records are sent to an application backend. They are stored in browser local storage on the current device/browser profile.

## 7. Data model

```text
auth.users
  ├─ accounts
  ├─ categories
  ├─ transactions ── account + category
  ├─ budgets ─────── category + month
  └─ recurring_transactions ── account + category
```

Amounts are stored as positive numeric values and transaction `type` determines whether the amount is income or expense.

## 8. Recurring transactions

Recurring items are deliberately **posted manually** when due. This avoids accidental duplicate expenses from multiple devices or browser sessions. The **Post** button creates the transaction and advances the next date according to weekly/monthly/yearly frequency.

## 9. Project structure

```text
.github/workflows/deploy.yml   GitHub Pages deployment
supabase/schema.sql            Database + RLS migration
src/App.tsx                    Application shell and navigation
src/components/Views.tsx       Dashboard and finance screens
src/components/AuthScreen.tsx  Supabase authentication
src/lib/repository.ts          Local/cloud data adapters
src/lib/csv.ts                 CSV import/export
src/lib/format.ts              Formatting/date helpers
vite.config.ts                 Vite + Tailwind + PWA
```

## 10. Production checklist

Before using Ledger for real financial records:

- Run `supabase/schema.sql` completely.
- Confirm email authentication is working.
- Verify GitHub secrets contain the **publishable** key, not service-role credentials.
- Test with two separate test users and verify they cannot see each other's rows.
- Export a JSON backup and test restoring it.
- Keep the GitHub repository free of `.env.local` and any private credentials.

## License

MIT
