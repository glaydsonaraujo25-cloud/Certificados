import React from 'react';

interface CornerProps {
  className?: string;
  color?: string;
  size?: number;
}

/**
 * High-fidelity baroque floral corner ornament (Top-Left)
 */
export const VintageCornerTL: React.FC<CornerProps> = ({
  className = '',
  color = '#111827',
  size = 76,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none pointer-events-none ${className}`}
    >
      {/* Outer corner solid framing curls */}
      <path
        d="M6 6 L6 42 C6 30 18 22 28 32 C34 38 30 46 22 44 C14 42 14 30 22 26 C28 22 36 26 38 34"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 6 L42 6 C30 6 22 18 32 28 C38 34 46 30 44 22 C42 14 30 14 26 22 C22 28 26 36 34 38"
        stroke={color}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Main diagonal ornate leaf / acanthus */}
      <path
        d="M10 10 C18 22 26 38 48 48 C38 26 22 18 10 10 Z"
        fill={color}
      />
      <path
        d="M18 18 C28 34 44 46 64 56 C52 42 36 28 18 18 Z"
        fill={color}
      />

      {/* Extended leaf flourishes along Top Edge */}
      <path
        d="M40 8 C52 7 66 12 76 6 C68 15 56 16 46 14 Z"
        fill={color}
      />
      <path
        d="M74 6 C82 4 90 9 86 16 C82 22 74 18 76 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="86" cy="12" r="3" fill={color} />
      <circle cx="94" cy="8" r="2" fill={color} />

      {/* Extended leaf flourishes along Left Edge */}
      <path
        d="M8 40 C7 52 12 66 6 76 C15 68 16 56 14 46 Z"
        fill={color}
      />
      <path
        d="M6 74 C4 82 9 90 16 86 C22 82 18 74 12 76"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="86" r="3" fill={color} />
      <circle cx="8" cy="94" r="2" fill={color} />

      {/* Diagonal interior floral scroll */}
      <path
        d="M32 32 C42 42 56 46 62 60 C66 68 58 76 48 72 C40 68 44 56 54 58 C60 60 62 68 56 70"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="56" cy="64" r="2.8" fill={color} />
      <circle cx="68" cy="52" r="3" fill={color} />
      <circle cx="48" cy="48" r="2.5" fill={color} />

      {/* Small decorative beads */}
      <circle cx="10" cy="10" r="4" fill={color} />
      <circle cx="20" cy="8" r="2" fill={color} />
      <circle cx="8" cy="20" r="2" fill={color} />
    </svg>
  );
};

export const VintageCornerTR: React.FC<CornerProps> = (props) => {
  return (
    <div style={{ transform: 'scaleX(-1)' }} className="origin-center">
      <VintageCornerTL {...props} />
    </div>
  );
};

export const VintageCornerBL: React.FC<CornerProps> = (props) => {
  return (
    <div style={{ transform: 'scaleY(-1)' }} className="origin-center">
      <VintageCornerTL {...props} />
    </div>
  );
};

export const VintageCornerBR: React.FC<CornerProps> = (props) => {
  return (
    <div style={{ transform: 'scale(-1, -1)' }} className="origin-center">
      <VintageCornerTL {...props} />
    </div>
  );
};
