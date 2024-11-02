'use client'
import { faqs } from "./mock-data";
import { XIcon } from "lucide-react";
import { useCallback, useState } from "react";

export const Faqs = () => {
    const [active, setActive] = useState<number[]>([])

    const toggle = useCallback((id: number) => {
        setActive(prevActive => prevActive.includes(id) ? prevActive.filter(activeId => activeId !== id) : [...prevActive, id]);
    }, []);

    return (
        <section className={'bg-primary'}>
            <div
                className={' max-w-7xl mx-auto py-5 px-5 md:py-20 md:px-10 grid grid-cols-1 sm:grid-cols-2 gap-6 align-middle'}>
                <h1 className={'text-white text-2xl font-[800]'}>الأسئلة المتكررة</h1>
                <div>
                    {faqs.map(faq => (
                        <div onClick={() => toggle(faq.id)} key={faq.id}
                             className={'py-3 text-white group cursor-pointer'}>
                            <div className={'flex justify-between items-center border-b-white border-b-[1px] pb-3'}>
                                <h3 className={'text-lg font-[600]'}>{faq.question}</h3>
                                <div className={"border-black rounded-xl border-[1px] bg-secondary p-2"}>
                                    <XIcon
                                        className={active.includes(faq.id) ? "w-6 h-6 rotate-0" : "w-6 h-6 rotate-45 transition-transform duration-300 ease-in-out"}/>
                                </div>
                            </div>
                            <p className={active.includes(faq.id) ? 'max-h-[1000px] block text-black text-[16px] mt-3 transition-max-height duration-300 ease-in-out' : 'hidden'}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}