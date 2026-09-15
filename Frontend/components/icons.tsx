import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const Icon = ({ size = 20, children, ...props }: IconProps & { children?: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>
);

export const Home = (p: IconProps) => <Icon {...p}><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></Icon>;
export const BookOpen = (p: IconProps) => <Icon {...p}><path d="M2 4h7a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h7z"/></Icon>;
export const ClipboardList = (p: IconProps) => <Icon {...p}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4"/></Icon>;
export const GraduationCap = (p: IconProps) => <Icon {...p}><path d="m2 10 10-5 10 5-10 5z"/><path d="M6 12v5c3 2 9 2 12 0v-5M22 10v6"/></Icon>;
export const LogOut = (p: IconProps) => <Icon {...p}><path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/></Icon>;
export const Upload = (p: IconProps) => <Icon {...p}><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></Icon>;
export const Users = (p: IconProps) => <Icon {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></Icon>;
export const FileText = (p: IconProps) => <Icon {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></Icon>;
export const LayoutDashboard = (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Icon>;
export const Bell = (p: IconProps) => <Icon {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></Icon>;
export const Search = (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>;
export const Save = (p: IconProps) => <Icon {...p}><path d="M5 3h12l2 2v16H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></Icon>;
export const Plus = (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>;
export const CalendarClock = (p: IconProps) => <Icon {...p}><path d="M7 3v4M17 3v4M3 9h18"/><rect x="3" y="5" width="18" height="16" rx="2"/><circle cx="12" cy="15" r="3"/><path d="M12 13v2l1 1"/></Icon>;
export const Check = (p: IconProps) => <Icon {...p}><path d="m5 12 4 4L19 6"/></Icon>;
export const Download = (p: IconProps) => <Icon {...p}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></Icon>;
export const ClipboardCheck = (p: IconProps) => <Icon {...p}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2M9 11l2 2 4-4"/></Icon>;
export const CheckCircle2 = (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></Icon>;
export const LockKeyhole = (p: IconProps) => <Icon {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></Icon>;
export const Mail = (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></Icon>;
export const Pencil = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
  </Icon>
);

export const Trash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 15H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </Icon>
);

export const X = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </Icon>
);