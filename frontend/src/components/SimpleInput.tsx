import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function SimpleInput({ className = '', ...props }: InputProps) {
  return (
    <input 
      className={`w-full px-3 py-2 border border-[#c5d9c5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7fb87f] focus:border-transparent ${className}`}
      {...props}
    />
  );
}
