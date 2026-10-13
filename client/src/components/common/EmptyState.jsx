import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLink,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#ded6c5] bg-[#faf7f2]/50 p-10 text-center dark:border-[#2A302D] dark:bg-[#101312]/60">
      {Icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#f5efe4] text-[#2A8278] border border-[#ded6c5] dark:bg-[#222825] dark:text-[#D5B777] dark:border-[#2A302D] mb-3 shadow-xs">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-bold text-stone-900 dark:text-[#F5F4EF]">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-stone-500 dark:text-[#A2AAA5]">
        {description}
      </p>

      {actionText && (
        <div className="mt-5">
          {actionLink ? (
            <Link
              to={actionLink}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] px-4 py-2 text-xs font-semibold text-[#F5F4EF] shadow-xs transition-colors"
            >
              {actionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2A8278] hover:bg-[#236e66] px-4 py-2 text-xs font-semibold text-[#F5F4EF] shadow-xs transition-colors cursor-pointer"
            >
              {actionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
