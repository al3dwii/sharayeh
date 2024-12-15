
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

{/* <div className="mx-auto grid w-full max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
    <Skeleton className="h-[520px] w-full" />
    <Skeleton className="h-[520px] w-full" />
    <Skeleton className="h-[520px] w-full" />
  </div>

  <div className="mt-3 flex w-full flex-col items-center gap-2">
    <Skeleton className="h-4 w-2/6" />
    <Skeleton className="h-4 w-1/6" />
  </div> */}