import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

interface UserPackage {
  packageId: string
  acquiredAt: Date
  expiresAt: Date | null
  package: {
    name: string
    price: number
    credits: number
    presentations: number
    slidesPerPresentation: number
    canAddTransition: boolean
    canUploadPDF: boolean
  } | null
}

interface PackageCardProps {
  userPackage: UserPackage | null
}

export function PackageCard({ userPackage }: PackageCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Package</CardTitle>
      </CardHeader>
      <CardContent>
        {userPackage && userPackage.package ? (
          <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div>
              <dt className="font-medium">Package Name</dt>
              <dd className="text-muted-foreground">{userPackage.package.name}</dd>
            </div>
            <div>
              <dt className="font-medium">Price</dt>
              <dd className="text-muted-foreground">${userPackage.package.price}</dd>
            </div>
            <div>
              <dt className="font-medium">Credits</dt>
              <dd className="text-muted-foreground">{userPackage.package.credits}</dd>
            </div>
            <div>
              <dt className="font-medium">Acquired On</dt>
              <dd className="text-muted-foreground">
                {new Date(userPackage.acquiredAt).toLocaleDateString()}
              </dd>
            </div>
            {userPackage.expiresAt && (
              <div>
                <dt className="font-medium">Expires On</dt>
                <dd className="text-muted-foreground">
                  {new Date(userPackage.expiresAt).toLocaleDateString()}
                </dd>
              </div>
            )}
            <div>
              <dt className="font-medium">Features</dt>
              <dd className="text-muted-foreground">
                <ul className="list-disc pl-4">
                  <li>Presentations: {userPackage.package.presentations}</li>
                  <li>Slides per Presentation: {userPackage.package.slidesPerPresentation}</li>
                  <li>Can Add Transition: {userPackage.package.canAddTransition ? 'Yes' : 'No'}</li>
                  <li>Can Upload PDF: {userPackage.package.canUploadPDF ? 'Yes' : 'No'}</li>
                </ul>
              </dd>
            </div>
          </dl>
        ) : (
          <p className="text-muted-foreground">No package assigned to this user.</p>
        )}
      </CardContent>
    </Card>
  )
}

