import React from 'react';

interface FiligreeProps {
  className?: string;
  color?: string;
  width?: number;
}

/**
 * Upper Victorian filigree flourish above the title "CERTIFICADO"
 */
export const TopFiligree: React.FC<FiligreeProps> = ({
  className = '',
  color = '#111827',
  width = 240,
}) => {
  return (
    <svg
      width={width}
      height={width * 0.16}
      viewBox="0 0 240 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      <path
        d="M120 18 C115 10 102 6 92 14 C84 21 88 32 99 30 C108 28 110 18 116 12 C118 10 120 10 120 10 C120 10 122 10 124 12 C130 18 132 28 141 30 C152 32 156 21 148 14 C138 6 125 10 120 18 Z"
        fill={color}
      />
      {/* Left scroll wing */}
      <path
        d="M90 15 C75 9 55 12 40 22 C34 26 28 24 30 18 C33 9 48 5 66 8 C78 10 86 14 90 15 Z"
        fill={color}
      />
      <path
        d="M40 22 C30 28 18 24 12 16 C8 10 14 4 22 6 C28 8 30 14 26 18 C22 22 17 20 16 16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="16" cy="12" r="3" fill={color} />
      <circle cx="5" cy="20" r="2" fill={color} />

      {/* Right scroll wing */}
      <path
        d="M150 15 C165 9 185 12 200 22 C206 26 212 24 210 18 C207 9 192 5 174 8 C162 10 154 14 150 15 Z"
        fill={color}
      />
      <path
        d="M200 22 C210 28 222 24 228 16 C232 10 226 4 218 6 C212 8 210 14 214 18 C218 22 223 20 224 16"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="224" cy="12" r="3" fill={color} />
      <circle cx="235" cy="20" r="2" fill={color} />

      {/* Center finial beads */}
      <circle cx="120" cy="6" r="3.5" fill={color} />
      <circle cx="112" cy="18" r="2.2" fill={color} />
      <circle cx="128" cy="18" r="2.2" fill={color} />
    </svg>
  );
};

/**
 * Bottom filigree divider with horizontal lines flanking center curls
 */
export const BottomFiligree: React.FC<FiligreeProps> = ({
  className = '',
  color = '#111827',
  width = 340,
}) => {
  return (
    <svg
      width={width}
      height={width * 0.1}
      viewBox="0 0 340 34"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${className}`}
    >
      {/* Left horizontal line */}
      <line x1="0" y1="17" x2="115" y2="17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      
      {/* Right horizontal line */}
      <line x1="225" y1="17" x2="340" y2="17" stroke={color} strokeWidth="2.5" strokeLinecap="round" />

      {/* Center ornamental curls */}
      <path
        d="M170 17 C166 11 155 7 146 13 C139 18 142 27 150 25 C157 23 159 15 164 11 C167 8 170 8 170 8 C170 8 173 8 176 11 C181 15 183 23 190 25 C198 27 201 18 194 13 C185 7 174 11 170 17 Z"
        fill={color}
      />
      <circle cx="170" cy="5" r="3" fill={color} />
      <circle cx="170" cy="28" r="2" fill={color} />
      <circle cx="134" cy="17" r="3.5" fill={color} />
      <circle cx="206" cy="17" r="3.5" fill={color} />
      <circle cx="122" cy="17" r="2.2" fill={color} />
      <circle cx="218" cy="17" r="2.2" fill={color} />

      {/* Flanking leaf curls */}
      <path
        d="M125 17 C132 10 144 14 140 22 C137 27 128 25 127 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M215 17 C208 10 196 14 200 22 C203 27 212 25 213 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
