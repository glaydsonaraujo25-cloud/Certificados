import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QrCodeRendererProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  includeMargin?: boolean;
}

export const QrCodeRenderer: React.FC<QrCodeRendererProps> = ({
  value,
  size = 64,
  fgColor = '#000000',
  bgColor = '#ffffff',
  includeMargin = false,
}) => {
  return (
    <div className="inline-block p-1 bg-white rounded shadow-2xs border border-slate-200">
      <QRCodeSVG
        value={value}
        size={size}
        fgColor={fgColor}
        bgColor={bgColor}
        level="M"
        includeMargin={includeMargin}
      />
    </div>
  );
};
