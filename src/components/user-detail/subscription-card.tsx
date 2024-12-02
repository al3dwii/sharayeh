import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

interface UserSubscription {
  stripeSubscriptionId: string | null
  stripeCurrentPeriodEnd: Date | null
}

interface SubscriptionCardProps {
  userSubscription: UserSubscription | null
}

export function SubscriptionCard({ userSubscription }: SubscriptionCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription</CardTitle>
      </CardHeader>
      <CardContent>
        {userSubscription ? (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Subscription ID</dt>
              <dd className="text-muted-foreground">{userSubscription.stripeSubscriptionId || 'N/A'}</dd>
            </div>
            <div>
              <dt className="font-medium">Next Billing Date</dt>
              <dd className="text-muted-foreground">
                {userSubscription.stripeCurrentPeriodEnd
                  ? new Date(userSubscription.stripeCurrentPeriodEnd).toLocaleDateString()
                  : 'N/A'}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted-foreground">No active subscription for this user.</p>
        )}
      </CardContent>
    </Card>
  )
}

