import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthScreen, ResetPasswordScreen } from './components/AuthScreen'
import { Icon } from './components/Icon'
import { AccountsView, BudgetsView, DashboardView, RecurringView, SettingsView, TransactionsView } from './components/Views'
import { createCloudRepository, createLocalRepository, type LedgerRepository } from './lib/repository'
import { supabase, supabaseConfigured } from './lib/supabase'
import { monthKey } from './lib/format'
import type { LedgerData, ViewKey } from './types'

const emptyData: LedgerData = { accounts: [], categories: [], transactions: [], budgets: [], recurring: [] }

const nav: { key: ViewKey; label: string; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { key: 'transactions', label: 'Transactions', icon: 'transactions' },
  { key: 'accounts', label: 'Accounts', icon: 'accounts' },
  { key: 'budgets', label: 'Budgets', icon: 'budgets' },
  { key: 'recurring', label: 'Recurring', icon: 'repeat' },
  { key: 'settings', label: 'Settings', icon: 'settings' },
]

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(supabaseConfigured)
  const [data, setData] = useState<LedgerData>(emptyData)
  const [view, setView] = useState<ViewKey>('dashboard')
  const [month, setMonth] = useState(monthKey(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{message:string;kind:'success'|'error'}|null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [composeToken, setComposeToken] = useState(0)
  const [recoveryMode, setRecoveryMode] = useState(() => window.location.hash.includes('type=recovery'))

  useEffect(() => {
    if (!supabaseConfigured || !supabase) { setAuthLoading(false); return }
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setAuthLoading(false) })
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const repo: LedgerRepository | null = useMemo(() => {
    if (!supabaseConfigured) return createLocalRepository()
    if (session?.user.id) return createCloudRepository(session.user.id)
    return null
  }, [session?.user.id])

  const refresh = useCallback(async () => {
    if (!repo) return
    setError('')
    try { setData(await repo.load()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load Ledger data.') }
    finally { setLoading(false) }
  }, [repo])

  useEffect(() => { setLoading(true); void refresh() }, [refresh])

  const notify = useCallback((message:string, kind:'success'|'error'='success') => {
    setToast({message,kind}); window.setTimeout(()=>setToast(null),3200)
  }, [])

  async function signOut() { if (supabase) await supabase.auth.signOut() }

  if (authLoading) return <LoadingScreen label="Checking session…"/>
  if (supabaseConfigured && recoveryMode) return <ResetPasswordScreen onComplete={() => setRecoveryMode(false)}/>
  if (supabaseConfigured && !session) return <AuthScreen/>
  if (!repo) return <LoadingScreen label="Preparing Ledger…"/>

  const common = { data, repo, refresh, notify }
  return (
    <div className="min-h-dvh bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${menuOpen?'translate-x-0':'-translate-x-full'}`}>
        <div className="flex h-20 items-center gap-3 px-6"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white"><Icon name="wallet" size={20}/></div><div><div className="font-semibold tracking-tight">Ledger</div><div className="text-xs text-slate-400">Personal finance</div></div></div>
        <nav className="px-3">{nav.map(item=><button key={item.key} className={`nav-item ${view===item.key?'nav-item-active':''}`} onClick={()=>{setView(item.key);setMenuOpen(false)}}><Icon name={item.icon} size={19}/><span>{item.label}</span></button>)}</nav>
        <div className="absolute inset-x-3 bottom-4 rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><Icon name={supabaseConfigured?'cloud':'device'} size={15}/>{supabaseConfigured?'Cloud sync':'Local-only'}</div><div className="mt-1 text-[11px] leading-4 text-slate-400">{supabaseConfigured?'Supabase + row-level security':'Stored only in this browser'}</div></div>
      </aside>
      {menuOpen&&<button className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden" onClick={()=>setMenuOpen(false)} aria-label="Close menu"/>}

      <div className="lg:pl-64">
        <header className="mobile-app-header lg:hidden">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-400">Ledger</div>
            <div className="text-[17px] font-semibold tracking-tight text-slate-950">{nav.find(n=>n.key===view)?.label ?? 'Ledger'}</div>
          </div>
          <button className="mobile-avatar" onClick={()=>setView('settings')} aria-label="Open settings">
            {(session?.user.email?.[0] ?? 'L').toUpperCase()}
          </button>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          {error && <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><div className="font-semibold">Could not load data</div><div className="mt-1">{error}</div><button className="mt-3 text-xs font-semibold underline" onClick={()=>refresh()}>Try again</button></div>}
          {loading ? <div className="grid min-h-[50vh] place-items-center"><div className="text-sm text-slate-400">Loading records…</div></div> : <>
            {view==='dashboard'&&<DashboardView {...common} month={month} setMonth={setMonth}/>} 
            {view==='transactions'&&<TransactionsView {...common} month={month} setMonth={setMonth} composeToken={composeToken}/>}  
            {view==='accounts'&&<AccountsView {...common}/>} 
            {view==='budgets'&&<BudgetsView {...common} month={month} setMonth={setMonth}/>} 
            {view==='recurring'&&<RecurringView {...common}/>} 
            {view==='settings'&&<SettingsView {...common} cloudMode={supabaseConfigured} onSignOut={supabaseConfigured?signOut:undefined}/>} 
          </>}
        </main>
      </div>

      <nav className="mobile-dock lg:hidden">
        <button className={`mobile-dock-item ${view==='dashboard'?'mobile-dock-active':''}`} onClick={()=>setView('dashboard')}><Icon name="dashboard" size={20}/><span>Home</span></button>
        <button className={`mobile-dock-item ${view==='transactions'?'mobile-dock-active':''}`} onClick={()=>setView('transactions')}><Icon name="transactions" size={20}/><span>Activity</span></button>
        <button className="mobile-add" onClick={()=>{setView('transactions');setComposeToken(v=>v+1)}} aria-label="Add transaction"><Icon name="plus" size={24}/></button>
        <button className={`mobile-dock-item ${view==='budgets'?'mobile-dock-active':''}`} onClick={()=>setView('budgets')}><Icon name="budgets" size={20}/><span>Budget</span></button>
        <button className={`mobile-dock-item ${['accounts','recurring','settings'].includes(view)?'mobile-dock-active':''}`} onClick={()=>setMenuOpen(true)}><Icon name="menu" size={20}/><span>More</span></button>
      </nav>
      {toast&&<div className={`fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-xl lg:bottom-6 ${toast.kind==='error'?'bg-rose-700':'bg-slate-950'}`}>{toast.message}</div>}
    </div>
  )
}

function LoadingScreen({label}:{label:string}) { return <div className="grid min-h-dvh place-items-center bg-slate-950 text-white"><div className="text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white text-slate-950"><Icon name="wallet"/></div><div className="mt-4 text-sm text-slate-400">{label}</div></div></div> }
