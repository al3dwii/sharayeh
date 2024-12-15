// /src/components/UI/Button.tsx

"use client";

import { ButtonHTMLAttributes, FC } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

const Button: FC<ButtonProps> = ({ variant = "primary", className, ...props }) => {
  const baseStyles = "px-4 py-2 rounded-md font-semibold focus:outline-none";
  const variantStyles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  };

  return (
    <button className={clsx(baseStyles, variantStyles[variant], className)} {...props} />
  );
};

export default Button;
