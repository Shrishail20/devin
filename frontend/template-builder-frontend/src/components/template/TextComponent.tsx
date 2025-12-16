import React from 'react';

interface TextComponentProps {
  content: string;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
}

export const TextComponent: React.FC<TextComponentProps> = ({
  content,
  fontSize = 16,
  fontWeight = 'normal',
  fontFamily = 'Arial',
  textAlign = 'left',
  color = '#000000',
}) => {
  return (
    <div
      style={{
        fontSize: `${fontSize}px`,
        fontWeight,
        fontFamily,
        textAlign,
        color,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {content}
    </div>
  );
};

export default TextComponent;
