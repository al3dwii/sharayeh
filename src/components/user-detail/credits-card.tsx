import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface UserCredits {
  credits: number
  usedCredits: number
}

interface CreditsCardProps {
  userCredits: UserCredits | null
}

export function CreditsCard({ userCredits }: CreditsCardProps) {
  const totalCredits = userCredits?.credits || 0
  const usedCredits = userCredits?.usedCredits || 0
  const remainingCredits = totalCredits - usedCredits

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">الرصيد</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-right">
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">إجمالي الرصيد</dt>
            <dd className="text-2xl font-bold">{totalCredits}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">الرصيد المستخدم</dt>
            <dd className="text-2xl font-bold">{usedCredits}</dd>
          </div>
          <div className="space-y-1">
            <dt className="text-sm text-muted-foreground">الرصيد المتبقي</dt>
            <dd className="text-2xl font-bold">{remainingCredits}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}



// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui"

// interface UserCredits {
//   credits: number
//   usedCredits: number
// }

// interface CreditsCardProps {
//   userCredits: UserCredits | null
// }

// export function CreditsCard({ userCredits }: CreditsCardProps) {
//   const totalCredits = userCredits?.credits || 0
//   const usedCredits = userCredits?.usedCredits || 0
//   const remainingCredits = totalCredits - usedCredits

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Credits</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <dl className="grid grid-cols-1 gap-2 sm:grid-cols-3">
//           <div>
//             <dt className="font-medium">Total Credits</dt>
//             <dd className="text-2xl font-bold">{totalCredits}</dd>
//           </div>
//           <div>
//             <dt className="font-medium">Used Credits</dt>
//             <dd className="text-2xl font-bold">{usedCredits}</dd>
//           </div>
//           <div>
//             <dt className="font-medium">Remaining Credits</dt>
//             <dd className="text-2xl font-bold">{remainingCredits}</dd>
//           </div>
//         </dl>
//       </CardContent>
//     </Card>
//   )
// }

