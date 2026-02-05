"use client";

import { DollarSign, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
          <div className="rounded-full bg-blue-50 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value={formatCurrency(stats.totalRevenue)}
        subtitle="All time"
        icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
      />
      <StatsCard
        title="Paid This Month"
        value={formatCurrency(stats.paidThisMonth)}
        subtitle={`${stats.invoiceCount.paid} invoices`}
        icon={<DollarSign className="h-5 w-5 text-green-600" />}
      />
      <StatsCard
        title="Outstanding"
        value={formatCurrency(stats.outstandingAmount)}
        subtitle={`${stats.invoiceCount.sent} invoices`}
        icon={<Clock className="h-5 w-5 text-yellow-600" />}
      />
      <StatsCard
        title="Overdue"
        value={formatCurrency(stats.overdueAmount)}
        subtitle={`${stats.invoiceCount.overdue} invoices`}
        icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
      />
    </div>
  );
}
