// components/admin-dashboard-card.tsx
'use client';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react'; // or any icon lib
import clsx from 'clsx';

export interface AdminDashboardCardProps {
  title:       string;
  value:       string | number;
  description: string;
  trend?:      number;                 // e.g. +12 or –3
  icon?:       React.ReactNode;        // optional custom icon
}

export function AdminDashboardCard({
  title,
  value,
  description,
  trend = 0,
  icon,
}: AdminDashboardCardProps) {
  const isPositive = trend >= 0;
  return (
    <div className="rounded-lg border p-6 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {icon ?? (
          isPositive ? (
            <ArrowUpRight className="h-4 w-4 text-emerald-600" />
          ) : (
            <ArrowDownRight className="h-4 w-4 text-red-600" />
          )
        )}
      </div>

      <div className="text-2xl font-bold">{value}</div>

      <p className="text-xs text-muted-foreground mt-1">
        {description}{' '}
        <span
          className={clsx(
            'font-semibold',
            isPositive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {isPositive ? '+' : ''}
          {trend}%
        </span>
      </p>
    </div>
  );
}

// export function AdminDashboardCard() { 
//   return ( <div className="rounded-lg border p-6 text-center"> 
//   {/* real metrics / charts here */} 
//   <p className="text-muted-foreground">Coming soon…</p> 
//   </div> ); }
