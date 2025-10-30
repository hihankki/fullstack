import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export function SimpleButton({ 
  className = '', 
  variant = 'default',
  children,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const variantStyles = variant === 'outline' 
    ? 'border border-[#7fb87f] text-[#7fb87f] hover:bg-[#7fb87f]/10'
    : 'bg-[#7fb87f] text-white hover:bg-[#6fa76f]';
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
