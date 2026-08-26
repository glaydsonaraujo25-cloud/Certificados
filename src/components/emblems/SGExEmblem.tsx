import React from 'react';

interface EmblemProps {
  className?: string;
  size?: number;
}

/**
 * SGEx (Secretaria-Geral do Exército) official heraldic crest
 */
export const SGExEmblem: React.FC<EmblemProps> = ({ className = '', size = 80 }) => {
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
        <linearGradient id="sgexGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="sgexRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#DC2626" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>
        <linearGradient id="sgexBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <filter id="sgexShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Top Banner (S G EX) */}
      <rect x="10" y="4" width="80" height="20" rx="3" fill="url(#sgexBlue)" stroke="#D97706" strokeWidth="2" />
      <rect x="12" y="6" width="76" height="16" fill="none" stroke="#FDE68A" strokeWidth="0.8" opacity="0.6" />
      <text
        x="50"
        y="18"
        fill="#FBBF24"
        fontSize="11"
        fontWeight="900"
        fontFamily="sans-serif"
        textAnchor="middle"
        letterSpacing="2.5"
      >
        S G EX
      </text>

      {/* Main Shield Outline */}
      <g filter="url(#sgexShadow)">
        {/* Shield Outer Gold Border */}
        <path
          d="M10 26 H90 V72 C90 100 50 118 50 118 C50 118 10 100 10 72 Z"
          fill="url(#sgexGold)"
          stroke="#92400E"
          strokeWidth="1.5"
        />
        {/* Shield Inner Red Background */}
        <path
          d="M14 29 H86 V70 C86 94 50 112 50 112 C50 112 14 94 14 70 Z"
          fill="url(#sgexRed)"
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

        {/* Central Heraldic Insignia: Crossed Blades/Swords & 8-Pointed Star */}
        {/* Crossed Swords */}
        <g stroke="url(#sgexGold)" strokeWidth="3" strokeLinecap="round">
          <line x1="28" y1="42" x2="72" y2="86" />
          <line x1="72" y1="42" x2="28" y2="86" />
        </g>
        <g stroke="#FFFBEB" strokeWidth="1" strokeLinecap="round">
          <line x1="28" y1="42" x2="72" y2="86" />
          <line x1="72" y1="42" x2="28" y2="86" />
        </g>

        {/* Diamond / Star Rays */}
        <polygon
          points="50,38 56,58 76,64 56,70 50,90 44,70 24,64 44,58"
          fill="url(#sgexGold)"
          stroke="#78350F"
          strokeWidth="0.8"
        />
        <polygon
          points="50,44 54,59 69,64 54,69 50,84 46,69 31,64 46,59"
          fill="#FFFBEB"
          stroke="#D97706"
          strokeWidth="0.5"
        />

        {/* Center Star Center Circle / Ruby */}
        <circle cx="50" cy="64" r="5" fill="#DC2626" stroke="#FEF3C7" strokeWidth="1.2" />
        <circle cx="50" cy="64" r="2" fill="#FDE68A" />
      </g>
    </svg>
  );
};
