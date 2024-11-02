import Link from 'next/link';

interface ServiceCardProps {
  boxId: string;
  Icon: React.ComponentType;
  link: string;
  title?: string;
  description?: string;
}

export default function ServiceCard({ boxId, Icon, link, title, description }: ServiceCardProps) {
  
  return (
    <div className="w-full min-w-1/4 md:w-1/4  p-2">
      <Link href={link} className="bg-white border border-gray-300 flex h-full flex-col items-center rounded-lg p-4 text-center hover:border-2 hover:border-blue-500  transition-all duration-100 ease-in-out transform cursor-pointer">
          <div>
          <div className="text-sm">
              <Icon />
            </div>           
             <h5 className="mt-4 text-lg font-semibold">{title}</h5>
            <p className="text-sm">{description}</p>
          </div>
      </Link>
    </div>
  );
}

// // Adjust Tailwind CSS classes as needed for your layout
// <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/5 p-2 ">
// <Link href={link} passHref className="bg-white border border-gray-300 flex h-full flex-col items-center rounded-lg p-4 text-center hover:border-2 hover:border-blue-500  transition-all duration-100 ease-in-out transform cursor-pointer">
//       {Icon && (
//         <div className="flex justify-center items-center text-blue-500">
//           <Icon className="text-6xl" />
//         </div>
//       )}
    
//   </Link>


  // <Link href={link} className="bg-white border border-gray-300 flex h-full flex-col items-center rounded-lg p-4 text-center hover:border-2 hover:border-blue-500  transition-all duration-100 ease-in-out transform cursor-pointer">
  //         <div>
  //           <Icon />
  //           <h5 className="mt-4 text-lg font-semibold">{title}</h5>
  //           <p className="text-sm">{description}</p>
  //         </div>
  //     </Link>



  // <Link href={link} passHref className="bg-white border border-gray-300 flex h-full flex-col items-center rounded-lg p-4 text-center hover:border-2 hover:border-blue-500  transition-all duration-100 ease-in-out transform cursor-pointer">
  //     {Icon && (
  //       <div className="flex justify-center items-center text-blue-500">
  //         <Icon className="text-6xl" />
  //       </div>
  //     )}
    
  // </Link>




// import Link from 'next/link';
// import { Locale } from '@/i18n.config'
// import { getDictionary} from '../../lib/dictionary'

// interface Home {
//   title: string;
//   description: string;
//   h1: string;
//   arabictext: string;
//   arabictextdes: string; // Make sure this matches the property in your actual dictionary
// }

// export default async function ServiceCard({ lang, boxId, Icon, link, title, description }: { lang: Locale, boxId: string, Icon: React.ComponentType, link: string }) {
//   const { pages } = await getDictionary(lang);
  

  
//   return (

//     <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/5 p-2">
//       <Link href={link}>
//         <Icon />
//           <h5 className="mt-4 text-lg font-semibold">{title}</h5>
//           <p className="text-sm">{description}</p>
//            </Link>
//     </div>


//     // <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/5 p-2 ">
//     //   <h5 className="mt-4 text-lg font-semibold">{title}</h5>
//     //   <p className="text-sm">{description}</p>
//     // </div>
//   );
// }




// import Link from 'next/link';
// import { Locale } from '@/i18n.config'
// import { getDictionary} from '../../lib/dictionary'



// export default async function ServiceCard( { lang }: { lang: Locale }) {
//   const { page } = await getDictionary(lang)


//   return (
//     <div className="w-full sm:w-1/2 md:w-1/4 lg:w-1/5 xl:w-1/5 p-2 ">
   
//       <h5 className="mt-4 text-lg font-semibold">{page.home.arabictext}</h5>
//           <p className="text-sm">{page.home.arabictectdes}</p>
//     </div>
//   );
// }
