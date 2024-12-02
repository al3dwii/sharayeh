import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "./types/user"

interface UserProfileCardProps {
  user?: User
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">بيانات المستخدم غير متوفرة</p>
        </CardContent>
      </Card>
    )
  }

  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'غير معروف'
  const initials = fullName !== 'غير معروف' ? fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'م'
  const email = user.emailAddresses && user.emailAddresses[0]?.emailAddress || 'غير متوفر'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-primary/10 pb-2">
        <CardTitle className="text-xl p-2 text-right">تفاصيل المستخدم</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 ">
        <div className="flex  items-center  ">
          <Avatar className="h-24 w-24 ml-4 border-4 border-background shadow-lg">
            <AvatarImage src={user.imageUrl} alt={fullName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="text-right">
            <h2 className="text-xl font-bold mb-1" dir="rtl">{fullName}</h2>
            <p className="text-muted-foreground mb-1" dir="rtl">
              {email}
            </p>
            <p className="text-sm text-muted-foreground" dir="rtl">
              معرف المستخدم: {user.id || 'غير متوفر'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}



// import { User } from "@clerk/nextjs/server"
// import { Card, CardHeader, CardTitle, CardContent, Avatar } from "@/components/ui"

// interface UserInfoCardProps {
//   user: User
// }

// export function UserInfoCard({ user }: UserInfoCardProps) {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>User Details</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center space-x-4">
//           <Avatar
//             src={user.imageUrl}
//             alt={`${user.firstName || ''} ${user.lastName || ''}`}
//             className="h-16 w-16"
//           />
//           <div>
//             <h2 className="text-lg font-medium">
//               {user.firstName || ''} {user.lastName || ''}
//             </h2>
//             <p className="text-muted-foreground">
//               {user.emailAddresses[0]?.emailAddress || 'N/A'}
//             </p>
//             <p className="text-sm text-muted-foreground">User ID: {user.id}</p>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

