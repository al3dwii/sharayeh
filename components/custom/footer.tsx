import {mockCompany, mockKnowledgeBase, mockTools} from "./mock-data";
// import {socialLinks} from "@/lib/utils";
import Link from "next/link";
import Image from "next/image"

import Socialicons from "./socialicons"


const Header = ({text}: { text: string }) => <h3
    className={'uppercase font-[700] text-white text-sm leading-2'}>{text}</h3>;

export const Footer = () => {
    const year = new Date().getFullYear();
    return (
        <>
        <footer className={'footer-bg'}>
<div className={'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 md:gap-2 p-2 text-[#fff] max-w-7xl mx-auto '}>                <div className={'flex flex-col justify-start space-y-4'}>
<div className="flex items-center gap-x-3 sm:gap-x-6">
    <Link href="/">
        
            <Image 
                src="/logo.png" 
                alt="Logo" 
                width={50} // Specify width as needed
                height={50} // Specify height as needed
                
            />

    </Link>
    <div className="text-xl  font-semibold">sharayh.com</div>

</div>                    <p className={'text-white'}>
                           انشاء بوربوينت بالذكاء الصناعي في دقائق من ملف وورد
                    </p>
                    {/* <div className={'flex items-center gap-2'}>
                        {socialLinks.map((item) => (
                            <a key={item.id} href={item.href}
                               className={'border-slate-300 rounded-xl border-[1px] bg-[#2b2154] p-3'}>
                                <item.icon className={'w-4 h-4'}/>
                            </a>
                        ))
                        }
                    </div> */}
                </div>
                {/* <div className={'flex flex-col space-y-3 text-right lg:text-right md:px-4'}>      
                     <Header text={'الخدمات'}/>
                    <ul className={'flex flex-col space-y-2'}>
                        {mockTools.map((item) => (
                            <li key={item.id}>
                                <a target={'_blank'} href={item.href} className={'text-white'}>
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div> */}

      {/* معلومات Section */}
      <div className="flex flex-col space-y-3 text-right lg:text-right md:px-4">
        <Header text="المعلومات" />
        <ul className="flex flex-col space-y-2">
          {mockKnowledgeBase.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="text-white hover:underline">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* الشركة Section */}
      <div className="flex flex-col pb-8 space-y-3 text-right lg:text-right md:px-4">
        <Header text="الشركة" />
        <ul className="flex flex-col space-y-2">
          {mockCompany.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="text-white hover:underline">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
                
                {/* <div className={'flex flex-col space-y-3 text-right lg:text-right md:px-4'}>
                      <Header text={'المعلومات'}/>
                    <ul className={'flex flex-col space-y-2'}>
                        {mockKnowledgeBase.map((item) => (
                            <li key={item.id}>
                                <a target={'_blank'} href={item.href} className={'text-white'}>
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={'flex flex-col pb-8 space-y-3 text-right lg:text-right md:px-4'}>
                     <Header text={'الشركة'}/>
                    <ul className={'flex flex-col space-y-2'}>
                        {mockCompany.map((item) => (
                            <li key={item.id}>
                                <a  href={item.href} className={'text-white'}>
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul> */}

                </div>
                <div >

                <Socialicons />
            </div>
            <div className={'   p-2 '}>
    </div>
            <div className={' bg-[#000]  justify-center p-2 text-[#ccc] text-[16px]   items-center'}>
           
        <div >
        © {year} sharayh.com 
    </div>
    </div>
            
        </footer>
        
    </>
    );
};

