import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: ReactNode;
}

export const Button = ({ variant = 'primary', children, className, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-[#cc111f] hover:bg-[#a30e18] text-white',
    outline: 'border border-[#cc111f] text-[#cc111f] hover:bg-[#cc111f] hover:text-white',
    ghost: 'text-gray-400 hover:text-white'
  };

  return (
    <button 
      className={`px-4 py-2 rounded-md transition-all font-semibold flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};