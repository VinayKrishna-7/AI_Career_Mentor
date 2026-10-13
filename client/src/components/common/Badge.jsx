import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-[#222825] text-[#A2AAA5] border border-[#2A302D]',
    primary: 'bg-[#2A8278] text-[#F5F4EF] border border-[#2A8278] font-semibold',
    success: 'bg-[#222825] text-[#2A8278] border border-[#2A8278]/40',
    warning: 'bg-[#222825] text-[#D5B777] border border-[#D5B777]/40',
    danger: 'bg-[#222825] text-rose-400 border border-rose-500/30',
    outline: 'border border-[#2A302D] text-[#F5F4EF] bg-transparent'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
