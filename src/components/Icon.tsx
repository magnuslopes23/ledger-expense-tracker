import type { ReactNode, SVGProps } from 'react'

type IconName =
  | 'dashboard' | 'transactions' | 'accounts' | 'budgets' | 'repeat' | 'settings'
  | 'plus' | 'search' | 'chevron-left' | 'chevron-right' | 'close' | 'edit' | 'trash'
  | 'download' | 'upload' | 'logout' | 'cloud' | 'device' | 'wallet' | 'arrow-up' | 'arrow-down'
  | 'calendar' | 'check' | 'archive' | 'restore' | 'menu' | 'shield'

const paths: Record<IconName, ReactNode> = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  transactions: <><path d="M4 6h16M4 12h16M4 18h16"/><path d="M8 3v6M16 9v6M10 15v6"/></>,
  accounts: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 10h5v5h-5a2.5 2.5 0 0 1 0-5Z"/><path d="M5 6V5a2 2 0 0 1 2-2h10"/></>,
  budgets: <><circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c0-1.4-1.3-2.5-3-2.5s-3 1-3 2.5 1.2 2 3 2.5 3 1 3 2.5-1.3 2.5-3 2.5-3-1.1-3-2.5"/></>,
  repeat: <><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.23.35.53.7 1 .9.35.15.7.2 1.1.2H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  'chevron-left': <path d="m15 18-6-6 6-6"/>,
  'chevron-right': <path d="m9 18 6-6-6-6"/>,
  close: <path d="M18 6 6 18M6 6l12 12"/>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 10v7M14 10v7"/></>,
  download: <><path d="M12 3v12M7 10l5 5 5-5"/><path d="M5 21h14"/></>,
  upload: <><path d="M12 21V9M7 14l5-5 5 5"/><path d="M5 3h14"/></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/></>,
  cloud: <path d="M17.5 19H7a5 5 0 0 1-.9-9.92A7 7 0 0 1 19.6 11.2 4 4 0 0 1 17.5 19Z"/>,
  device: <><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/></>,
  wallet: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M16 10h5v4h-5a2 2 0 0 1 0-4Z"/></>,
  'arrow-up': <path d="M12 19V5M6 11l6-6 6 6"/>,
  'arrow-down': <path d="M12 5v14M18 13l-6 6-6-6"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  archive: <><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v12h14V8M10 12h4"/></>,
  restore: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>,
}

export function Icon({ name, size = 20, ...props }: SVGProps<SVGSVGElement> & { name: IconName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {paths[name]}
    </svg>
  )
}
