import type { ReactNode } from 'react'
import type { LedgerRepository } from '../../lib/repository'
import type { LedgerData } from '../../types'
import { addMonths, monthLabel } from '../../lib/format'
import { Icon } from '../Icon'

export type CommonProps={data:LedgerData;repo:LedgerRepository;refresh:()=>Promise<void>;notify:(m:string,k?:'success'|'error')=>void}
export const cat=(d:LedgerData,id:string|null)=>d.categories.find(x=>x.id===id)?.name??'Uncategorised'
export const acc=(d:LedgerData,id:string)=>d.accounts.find(x=>x.id===id)?.name??'Unknown account'
export function Header({title,subtitle,action}:{title:string;subtitle?:string;action?:ReactNode}){return <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="page-title">{title}</h1>{subtitle&&<p className="page-subtitle">{subtitle}</p>}</div>{action}</div>}
export function Month({month,setMonth}:{month:string;setMonth:(m:string)=>void}){return <div className="month-control"><button className="icon-button" onClick={()=>setMonth(addMonths(month,-1))}><Icon name="chevron-left" size={18}/></button><div className="min-w-36 text-center text-sm font-semibold">{monthLabel(month)}</div><button className="icon-button" onClick={()=>setMonth(addMonths(month,1))}><Icon name="chevron-right" size={18}/></button></div>}
export function Empty({text}:{text:string}){return <div className="card py-10 text-center text-sm text-slate-400">{text}</div>}
export function Stat({label,value,tone=''}:{label:string;value:string;tone?:string}){return <div className="card"><div className="text-xs font-semibold uppercase tracking-[.12em] text-slate-400">{label}</div><div className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</div></div>}
