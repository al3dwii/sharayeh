import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Users, DollarSign, Briefcase } from 'lucide-react'

interface AdminDashboardCardProps {
  title: string
  value: string
  description: string
  trend: number
  icon: 'users' | 'revenue' | 'projects'
}

export function AdminDashboardCard({ title, value, description, trend, icon }: AdminDashboardCardProps) {
  const getIcon = () => {
    switch (icon) {
      case 'users':
        return <Users className="h-4 w-4" />
      case 'revenue':
        return <DollarSign className="h-4 w-4" />
      case 'projects':
        return <Briefcase className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {getIcon()}
          {title}
        </CardTitle>
        <Badge variant={trend > 0 ? "default" : "destructive"} className="text-xs">
          {trend > 0 ? '+' : ''}{trend}%
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

