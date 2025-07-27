import { cn } from "@/components/ui/cn";
import { IconType } from "react-icons";

import React from "react";

interface ButtonProps {
    text?: string;
    secondaryText?: string;
    // onClick: () => void;
    variant?: 'primary' | 'secondary' | 'dimmed' | 'link';
    className?: string;
    icon?: IconType;
    iconClassName?: string;
}

export const buttonVariants = ({variant}: {
    variant: 'link' | 'primary' | 'secondary' | 'dimmed';
}) => {
    const whiteBtn = 'bg-white text-[#2b2154] px-8 py-4';
    const blueBtn = 'bg-[#7859ff] hover:bg-[#7859ff]/80 text-white font-bold py-3 px-6';
    const dimmedBtn = 'bg-[#554a83b5] text-[#f7faff] font-bold p-3 px-6';

    const buttonVariants = {
        primary: blueBtn,
        secondary: whiteBtn,
        dimmed: dimmedBtn,
        link: 'text-blue-500 underline',
    };

    return cn(
        buttonVariants[variant],
        'transition duration-300 ease-in-out flex items-center gap-2 rounded-xl',
    );
}


export const Button = ({
                           text,
                           secondaryText,
                           icon,
                           iconClassName,
                           variant = 'primary',
                           className
                       }: ButtonProps) => {


    return (
        <button
            className={cn(buttonVariants({variant}), className)}
        >
            {icon && React.createElement(icon, {className: cn('w-6 h-6', iconClassName)})}
            {text && <p className={"flex flex-col justify-center items-start"}>
                {text}
                {secondaryText && <span className={'text-xs font-thin'}>{secondaryText}</span>}
            </p>}
        </button>
    );
};


