import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeComponentProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export const QRCodeComponent: React.FC<QRCodeComponentProps> = ({
  value = 'https://example.com',
  size = 128,
  fgColor = '#000000',
  bgColor = '#ffffff',
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
      }}
    >
      <QRCodeSVG
        value={value || 'https://example.com'}
        size={Math.min(size, 200)}
        fgColor={fgColor}
        bgColor={bgColor}
      />
    </div>
  );
};

export default QRCodeComponent;
