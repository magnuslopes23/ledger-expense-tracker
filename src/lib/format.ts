export const formatCurrency=(value:number,currency='EUR')=>new Intl.NumberFormat('en-IE',{style:'currency',currency,maximumFractionDigits:2}).format(value||0)
export const formatDate=(date:string)=>new Intl.DateTimeFormat('en-IE',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`))
export const todayISO=()=>new Date().toISOString().slice(0,10)
export const monthKey=(date:string|Date)=>typeof date==='string'?date.slice(0,7):`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
export const monthLabel=(month:string)=>new Intl.DateTimeFormat('en-IE',{month:'long',year:'numeric'}).format(new Date(`${month}-01T12:00:00`))
export function addMonths(month:string,delta:number){const d=new Date(`${month}-01T12:00:00`);d.setMonth(d.getMonth()+delta);return monthKey(d)}
export const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))
export function nextRecurringDate(date:string,frequency:'weekly'|'monthly'|'yearly'){const d=new Date(`${date}T12:00:00`);if(frequency==='weekly')d.setDate(d.getDate()+7);else if(frequency==='monthly')d.setMonth(d.getMonth()+1);else d.setFullYear(d.getFullYear()+1);return d.toISOString().slice(0,10)}
