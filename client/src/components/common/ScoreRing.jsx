import React from 'react';

const ScoreRing = ({
  score = 0,
  size = 130,
  strokeWidth = 10,
  label = 'Match Score',
  sublabel = ''
}) => {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedScore / 100) * circumference;

  let ratingText = 'Strong Match';
  if (normalizedScore < 40) {
    ratingText = 'Needs Attention';
  } else if (normalizedScore < 70) {
    ratingText = 'Moderate Match';
  }

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="h-full w-full -rotate-90 transform" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="stroke-[#222825]"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out stroke-[#2A8278]"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold tracking-tight text-[#F5F4EF]">
            {normalizedScore}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#D5B777]">
            / 100
          </span>
        </div>
      </div>

      <div className="mt-3">
        <h4 className="text-sm font-semibold text-[#F5F4EF]">
          {label}
        </h4>
        <p className="mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
          <span className="inline-block rounded-md px-2 py-0.5 bg-[#222825] text-[#A2AAA5] border border-[#2A302D]">
            {sublabel || ratingText}
          </span>
        </p>
      </div>
    </div>
  );
};

export default ScoreRing;
