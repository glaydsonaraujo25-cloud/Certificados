import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * B ADM QGEx (Base Administrativa do Quartel-General do Exército) official heraldic crest
 */
export const BAdmQgexEmblem: React.FC<EmblemProps> = ({ className = '', size = 80 }) => {
  return (
    <svg
      width={size}
      height={size * 1.25}
      viewBox="0 0 100 125"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-xs select-none ${className}`}
    >
      <defs>
        <linearGradient id="badmGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="badmRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="badmYellow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <filter id="badmShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Top Banner (B ADM QGEX) */}
      <rect x="10" y="4" width="80" height="20" rx="3" fill="url(#badmYellow)" stroke="#B91C1C" strokeWidth="2" />
      <rect x="12" y="6" width="76" height="16" fill="none" stroke="#DC2626" strokeWidth="0.8" opacity="0.6" />
      <text
        x="50"
        y="18"
        fill="#991B1B"
        fontSize="9.5"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="1"
      >
        B ADM QGEX
      </text>

      {/* Main Shield Outline */}
      <g filter="url(#badmShadow)">
        {/* Shield Outer Gold Border */}
        <path
          d="M10 26 H90 V72 C90 100 50 118 50 118 C50 118 10 100 10 72 Z"
          fill="url(#badmGold)"
          stroke="#92400E"
          strokeWidth="1.5"
        />
        {/* Shield Inner Red Background */}
        <path
          d="M14 29 H86 V70 C86 94 50 112 50 112 C50 112 14 94 14 70 Z"
          fill="url(#badmRed)"
          stroke="#FCD34D"
          strokeWidth="1.5"
        />
        {/* Fine Inner Line */}
        <path
          d="M18 32 H82 V68 C82 89 50 106 50 106 C50 106 18 89 18 68 Z"
          fill="none"
          stroke="#FEF3C7"
          strokeWidth="0.75"
          opacity="0.7"
        />

        {/* Heraldic Insignia: Stylized Flaming Arrow / Sword / Wings downward */}
        {/* Horizontal Crossbar */}
        <path
          d="M24 50 H76 V56 H24 Z"
          fill="url(#badmGold)"
          stroke="#78350F"
          strokeWidth="0.8"
        />
        {/* Central Vertical Spear/Arrow */}
        <path
          d="M47 38 H53 V82 L50 94 L47 82 Z"
          fill="url(#badmGold)"
          stroke="#78350F"
          strokeWidth="0.8"
        />
        {/* Arrow Point */}
        <polygon
          points="50,98 38,76 46,78 50,86 54,78 62,76"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="0.8"
        />
        {/* Heraldic side flukes / wings */}
        <path
          d="M34 66 C38 60 46 64 46 68 C42 74 34 76 34 66 Z"
          fill="url(#badmGold)"
          stroke="#92400E"
          strokeWidth="0.6"
        />
        <path
          d="M66 66 C62 60 54 64 54 68 C58 74 66 76 66 66 Z"
          fill="url(#badmGold)"
          stroke="#92400E"
          strokeWidth="0.6"
        />
        <path
          d="M28 58 C32 54 38 58 38 62 C34 66 28 66 28 58 Z"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="0.6"
        />
        <path
          d="M72 58 C68 54 62 58 62 62 C66 66 72 66 72 58 Z"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="0.6"
        />
      </g>
    </svg>
  );
};
