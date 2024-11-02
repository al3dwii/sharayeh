// src/components/StatsCards.tsx

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';

type Stats = {
  totalRevenue: number;
  subscriptions: number;
  sales: number;
  activeNow: number;
};

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsData = [
    {
      title: 'Total Revenue',
    //   value: `$${stats.totalRevenue.toLocaleString()}`,
      change: '+20.1% from last month',
      icon: <DollarSign className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Subscriptions',
    //   value: `+${stats.subscriptions.toLocaleString()}`,
      change: '+180.1% from last month',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Sales',
    //   value: `+${stats.sales.toLocaleString()}`,
      change: '+19% from last month',
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Active Now',
    //   value: `+${stats.activeNow.toLocaleString()}`,
      change: '+201 since last hour',
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {statsData.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            {stat.icon}
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{stat.value}</div> */}
            <p className="text-xs text-muted-foreground">{stat.change}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
