export type TransactionType = 'expense' | 'income'
export type AccountType = 'current' | 'savings' | 'cash' | 'credit' | 'other'
export type CategoryKind = 'expense' | 'income'
export type RecurringFrequency = 'weekly' | 'monthly' | 'yearly'

export interface Account {
  id: string
  user_id?: string
  name: string
  type: AccountType
  opening_balance: number
  currency: string
  archived: boolean
  created_at?: string
}

export interface Category {
  id: string
  user_id?: string
  name: string
  kind: CategoryKind
  created_at?: string
}

export interface Transaction {
  id: string
  user_id?: string
  date: string
  type: TransactionType
  amount: number
  account_id: string
  category_id: string | null
  merchant: string
  notes: string
  created_at?: string
  updated_at?: string
}

export interface Budget {
  id: string
  user_id?: string
  category_id: string
  month: string
  amount: number
  created_at?: string
  updated_at?: string
}

export interface RecurringTransaction {
  id: string
  user_id?: string
  account_id: string
  category_id: string | null
  type: TransactionType
  amount: number
  merchant: string
  notes: string
  frequency: RecurringFrequency
  next_date: string
  active: boolean
  created_at?: string
  updated_at?: string
}

export interface LedgerData {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  budgets: Budget[]
  recurring: RecurringTransaction[]
}

export type ViewKey = 'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'recurring' | 'settings'
