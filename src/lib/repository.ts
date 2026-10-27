import { supabase } from './supabase'
import { nextRecurringDate } from './format'
import type { Account, Budget, Category, LedgerData, RecurringTransaction, Transaction } from '../types'

type NewAccount=Omit<Account,'id'|'user_id'|'created_at'>&{id?:string}
type NewCategory=Omit<Category,'id'|'user_id'|'created_at'>&{id?:string}
type NewTransaction=Omit<Transaction,'id'|'user_id'|'created_at'|'updated_at'>&{id?:string}
type NewBudget=Omit<Budget,'id'|'user_id'|'created_at'|'updated_at'>&{id?:string}
type NewRecurring=Omit<RecurringTransaction,'id'|'user_id'|'created_at'|'updated_at'>&{id?:string}
export interface LedgerRepository{load():Promise<LedgerData>;saveAccount(v:NewAccount):Promise<void>;saveCategory(v:NewCategory):Promise<void>;deleteCategory(id:string):Promise<void>;saveTransaction(v:NewTransaction):Promise<void>;deleteTransaction(id:string):Promise<void>;saveBudget(v:NewBudget):Promise<void>;deleteBudget(id:string):Promise<void>;saveRecurring(v:NewRecurring):Promise<void>;deleteRecurring(id:string):Promise<void>;postRecurring(v:RecurringTransaction):Promise<void>;replaceAll(v:LedgerData):Promise<void>}
const uid=()=>crypto.randomUUID()
const defaults=():LedgerData=>{const categories:Category[]=[...['Groceries','Rent','Transport','Eating Out','Shopping','Bills','Subscriptions','Other'].map(name=>({id:uid(),name,kind:'expense' as const})),...['Salary','Other Income'].map(name=>({id:uid(),name,kind:'income' as const}))];return{accounts:[{id:uid(),name:'Current Account',type:'current',opening_balance:0,currency:'EUR',archived:false}],categories,transactions:[],budgets:[],recurring:[]}}
const KEY='ledger-data-v1'
const readLocal=()=>{try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw) as LedgerData:defaults()}catch{return defaults()}}
const writeLocal=(d:LedgerData)=>localStorage.setItem(KEY,JSON.stringify(d))
const clean=<T extends Record<string,unknown>>(v:T)=>Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined)) as T

export function createLocalRepository():LedgerRepository{return{
 async load(){const d=readLocal();if(!localStorage.getItem(KEY))writeLocal(d);return structuredClone(d)},
 async saveAccount(v){const d=readLocal();const id=v.id??uid();const item={...v,id} as Account;const i=d.accounts.findIndex(x=>x.id===id);i<0?d.accounts.push(item):d.accounts.splice(i,1,item);writeLocal(d)},
 async saveCategory(v){const d=readLocal();const id=v.id??uid();const item={...v,id} as Category;const i=d.categories.findIndex(x=>x.id===id);i<0?d.categories.push(item):d.categories.splice(i,1,item);writeLocal(d)},
 async deleteCategory(id){const d=readLocal();d.categories=d.categories.filter(x=>x.id!==id);d.transactions=d.transactions.map(t=>t.category_id===id?{...t,category_id:null}:t);d.recurring=d.recurring.map(t=>t.category_id===id?{...t,category_id:null}:t);d.budgets=d.budgets.filter(b=>b.category_id!==id);writeLocal(d)},
 async saveTransaction(v){const d=readLocal();const id=v.id??uid();const item={...v,id} as Transaction;const i=d.transactions.findIndex(x=>x.id===id);i<0?d.transactions.push(item):d.transactions.splice(i,1,item);writeLocal(d)},
 async deleteTransaction(id){const d=readLocal();d.transactions=d.transactions.filter(x=>x.id!==id);writeLocal(d)},
 async saveBudget(v){const d=readLocal();const id=v.id??uid();const item={...v,id} as Budget;const i=d.budgets.findIndex(x=>x.id===id);i<0?d.budgets.push(item):d.budgets.splice(i,1,item);writeLocal(d)},
 async deleteBudget(id){const d=readLocal();d.budgets=d.budgets.filter(x=>x.id!==id);writeLocal(d)},
 async saveRecurring(v){const d=readLocal();const id=v.id??uid();const item={...v,id} as RecurringTransaction;const i=d.recurring.findIndex(x=>x.id===id);i<0?d.recurring.push(item):d.recurring.splice(i,1,item);writeLocal(d)},
 async deleteRecurring(id){const d=readLocal();d.recurring=d.recurring.filter(x=>x.id!==id);writeLocal(d)},
 async postRecurring(v){const d=readLocal();d.transactions.push({id:uid(),date:v.next_date,type:v.type,amount:v.amount,account_id:v.account_id,category_id:v.category_id,merchant:v.merchant,notes:v.notes});d.recurring=d.recurring.map(x=>x.id===v.id?{...x,next_date:nextRecurringDate(x.next_date,x.frequency)}:x);writeLocal(d)},
 async replaceAll(v){writeLocal(structuredClone(v))}
}}

function db(){if(!supabase)throw new Error('Supabase is not configured.');return supabase}
async function ok<T>(p:PromiseLike<{data:T|null;error:{message:string}|null}>){const {data,error}=await p;if(error)throw new Error(error.message);return data}
export function createCloudRepository(userId:string):LedgerRepository{return{
 async load(){const s=db();const [accounts,categories,transactions,budgets,recurring]=await Promise.all([ok(s.from('accounts').select('*').order('created_at')),ok(s.from('categories').select('*').order('name')),ok(s.from('transactions').select('*').order('date',{ascending:false})),ok(s.from('budgets').select('*')),ok(s.from('recurring_transactions').select('*').order('next_date'))]);return{accounts:(accounts??[]) as Account[],categories:(categories??[]) as Category[],transactions:(transactions??[]) as Transaction[],budgets:(budgets??[]) as Budget[],recurring:(recurring??[]) as RecurringTransaction[]}},
 async saveAccount(v){const s=db();const payload={...clean(v),user_id:userId};v.id?await ok(s.from('accounts').update(payload).eq('id',v.id)):await ok(s.from('accounts').insert(payload))},
 async saveCategory(v){const s=db();const payload={...clean(v),user_id:userId};v.id?await ok(s.from('categories').update(payload).eq('id',v.id)):await ok(s.from('categories').insert(payload))},
 async deleteCategory(id){await ok(db().from('categories').delete().eq('id',id))},
 async saveTransaction(v){const s=db();const payload={...clean(v),user_id:userId};v.id?await ok(s.from('transactions').update(payload).eq('id',v.id)):await ok(s.from('transactions').insert(payload))},
 async deleteTransaction(id){await ok(db().from('transactions').delete().eq('id',id))},
 async saveBudget(v){const s=db();const payload={...clean(v),user_id:userId};v.id?await ok(s.from('budgets').update(payload).eq('id',v.id)):await ok(s.from('budgets').upsert(payload,{onConflict:'user_id,category_id,month'}))},
 async deleteBudget(id){await ok(db().from('budgets').delete().eq('id',id))},
 async saveRecurring(v){const s=db();const payload={...clean(v),user_id:userId};v.id?await ok(s.from('recurring_transactions').update(payload).eq('id',v.id)):await ok(s.from('recurring_transactions').insert(payload))},
 async deleteRecurring(id){await ok(db().from('recurring_transactions').delete().eq('id',id))},
 async postRecurring(v){const s=db();await ok(s.from('transactions').insert({user_id:userId,date:v.next_date,type:v.type,amount:v.amount,account_id:v.account_id,category_id:v.category_id,merchant:v.merchant,notes:v.notes}));await ok(s.from('recurring_transactions').update({next_date:nextRecurringDate(v.next_date,v.frequency)}).eq('id',v.id))},
 async replaceAll(v){const s=db();await Promise.all(['transactions','budgets','recurring_transactions'].map(t=>ok(s.from(t).delete().eq('user_id',userId))));await Promise.all(['accounts','categories'].map(t=>ok(s.from(t).delete().eq('user_id',userId))));if(v.accounts.length)await ok(s.from('accounts').insert(v.accounts.map(x=>({...x,user_id:userId}))));if(v.categories.length)await ok(s.from('categories').insert(v.categories.map(x=>({...x,user_id:userId}))));if(v.transactions.length)await ok(s.from('transactions').insert(v.transactions.map(x=>({...x,user_id:userId}))));if(v.budgets.length)await ok(s.from('budgets').insert(v.budgets.map(x=>({...x,user_id:userId}))));if(v.recurring.length)await ok(s.from('recurring_transactions').insert(v.recurring.map(x=>({...x,user_id:userId}))))}
}}
