import React from 'react';

interface SignatureProps {
  className?: string;
  width?: number;
}

/**
 * Realistic vector fountain pen signature in deep navy/indigo ink
 */
export const MilitarySignatureGraphic: React.FC<SignatureProps> = ({
  className = '',
  width = 180,
}) => {
  return (
    <svg
      width={width}
      height={width * 0.38}
      viewBox="0 0 220 84"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <g stroke="#1E3A8A" strokeLinecap="round" strokeLinejoin="round">
        {/* Initial 'C' large loop */}
        <path
          d="M38 52 C30 58 18 52 14 38 C10 22 22 8 36 10 C46 12 50 24 46 36 C42 46 32 54 20 54"
          strokeWidth="2.2"
        />
        {/* 'H' and swift loops */}
        <path
          d="M48 24 L52 64 M50 36 C54 30 62 26 66 38 L68 56"
          strokeWidth="2"
        />
        {/* Consecutive rhythmic signature loops (Mello style) */}
        <path
          d="M74 44 C76 34 84 32 88 42 C92 52 86 62 82 62 C80 62 78 54 84 40 C90 28 98 28 102 38 C106 48 102 58 98 58 C96 58 94 50 100 36 C106 24 116 26 120 38 C124 50 118 60 112 60 C110 60 108 52 114 38 C120 26 130 26 134 38 L140 54"
          strokeWidth="1.9"
        />
        {/* Tall sweeping loop 'Ferreira' accent */}
        <path
          d="M140 50 C146 30 156 12 162 14 C168 16 166 34 160 52 C156 64 162 66 172 58 L184 48"
          strokeWidth="2.2"
        />
        {/* Swift underline stroke & loop */}
        <path
          d="M18 68 C45 66 90 67 140 68 C175 69 205 66 212 64"
          strokeWidth="1.8"
        />
        {/* Final trailing pen flourish */}
        <path
          d="M190 64 C202 60 214 54 216 48 C218 42 208 44 202 50"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};
