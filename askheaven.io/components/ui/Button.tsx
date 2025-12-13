import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  icon,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed font-medium";
  
  const variants = {
    primary: "bg-stone-900 text-white hover:bg-stone-800 focus:ring-stone-900",
    secondary: "bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 focus:ring-stone-200 shadow-sm",
    ghost: "text-stone-600 hover:bg-stone-100 hover:text-stone-900 focus:ring-stone-200",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};