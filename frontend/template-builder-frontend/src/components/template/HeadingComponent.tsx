import React from 'react';

interface HeadingComponentProps {
  content: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
}

export const HeadingComponent: React.FC<HeadingComponentProps> = ({
  content,
  level = 1,
  fontFamily = 'Arial',
  textAlign = 'left',
  color = '#000000',
}) => {
  const fontSizes: Record<number, string> = {
    1: '2rem',
    2: '1.75rem',
    3: '1.5rem',
    4: '1.25rem',
    5: '1rem',
    6: '0.875rem',
  };

  const Tag = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Tag
      style={{
        fontSize: fontSizes[level],
        fontFamily,
        textAlign,
        color,
        margin: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {content}
    </Tag>
  );
};

export default HeadingComponent;
