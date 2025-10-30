import { TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function SimpleTextarea({ className = '', ...props }: TextareaProps) {
  return (
    <textarea 
      className={`w-full px-3 py-2 border border-[#c5d9c5] rounded-md focus:outline-none focus:ring-2 focus:ring-[#7fb87f] focus:border-transparent resize-none ${className}`}
      {...props}
    />
  );
}
