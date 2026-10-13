import React from 'react';

const ProgressBar = ({
  label,
  value = 0,
  weight,
  showValue = true,
  size = 'md'
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round(value)));

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="font-semibold text-[#F5F4EF]">
          {label} {weight && <span className="text-[#A2AAA5] font-normal">({weight})</span>}
        </span>
        {showValue && (
          <span className="font-bold text-[#D5B777]">
            {percentage}%
          </span>
        )}
      </div>
      <div className={`w-full overflow-hidden rounded-full bg-[#222825] border border-[#2A302D] ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out bg-[#2A8278]`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
