import { User } from "@clerk/nextjs/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

interface AccountInfoCardProps {
  user: User
}

export function AccountInfoCard({ user }: AccountInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div>
            <dt className="font-medium">Email</dt>
            <dd className="text-muted-foreground">{user.emailAddresses[0]?.emailAddress || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-medium">Phone</dt>
            <dd className="text-muted-foreground">{user.phoneNumbers[0]?.phoneNumber || 'N/A'}</dd>
          </div>
          <div>
            <dt className="font-medium">Joined On</dt>
            <dd className="text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}

