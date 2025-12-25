import React from 'react';

interface DividerComponentProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export const DividerComponent: React.FC<DividerComponentProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = '#cccccc',
  style = 'solid',
}) => {
  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      style={{
        width: isHorizontal ? '100%' : `${thickness}px`,
        height: isHorizontal ? `${thickness}px` : '100%',
        backgroundColor: style === 'solid' ? color : 'transparent',
        borderStyle: style !== 'solid' ? style : undefined,
        borderColor: style !== 'solid' ? color : undefined,
        borderWidth: style !== 'solid' ? `${thickness}px` : undefined,
        borderTopWidth: style !== 'solid' && isHorizontal ? `${thickness}px` : undefined,
        borderLeftWidth: style !== 'solid' && !isHorizontal ? `${thickness}px` : undefined,
      }}
    />
  );
};

export default DividerComponent;
