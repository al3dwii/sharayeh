
import { Skeleton } from "@/components/ui/skeleton";

const Skel = () => {
  return (

<div className="flex w-full flex-col gap-2 py-2 md:py-2">
<section className="container flex flex-col items-center">
  <div className="mx-auto flex w-full flex-col items-center gap-2">
    <Skeleton className="mb-2 h-4 w-1/12" />
    <Skeleton className="h-2 w-2/6" />
    <Skeleton className="mb-3 mt-2 h-2 w-1/5" />
  </div>

  
</section>

<hr className="container" />
</div>

)
}

export default Skel


// import { Skeleton } from "@/components/ui/skeleton"

// export default function Skel() {
//   return (
//     <div className="w-1/2 bg-blue-50/40 rounded-2xl p-6 m-auto">
//       <div className="flex flex-col gap-4">
//         {/* Points text container */}
//         <div className="flex justify-end items-center gap-1 text-right">
//           <Skeleton className="h-5 w-12" /> {/* First number */}
//           <span className="mx-1 text-slate-600">/</span>
//           <Skeleton className="h-5 w-12" /> {/* Second number */}
//           <span className="mr-2 text-slate-600">:</span>
//           <Skeleton className="h-5 w-32" /> {/* Arabic text */}
//         </div>
        
//         {/* Progress bar container */}
//         <div className="relative w-full">
//           <Skeleton className="h-1.5 w-full rounded-full bg-slate-100" />
//           <Skeleton className="absolute left-0 top-0 h-1.5 w-[10%] rounded-full bg-blue-100" />
//         </div>
//       </div>
//     </div>
//   )
// }





{/* <div className="mx-auto grid w-full max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
    <Skeleton className="h-[520px] w-full" />
    <Skeleton className="h-[520px] w-full" />
    <Skeleton className="h-[520px] w-full" />
  </div>

  <div className="mt-3 flex w-full flex-col items-center gap-2">
    <Skeleton className="h-4 w-2/6" />
    <Skeleton className="h-4 w-1/6" />
  </div> */}