import React from 'react';

interface ShapeComponentProps {
  shape?: 'rectangle' | 'circle' | 'ellipse';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
}

export const ShapeComponent: React.FC<ShapeComponentProps> = ({
  shape = 'rectangle',
  backgroundColor = '#f0f0f0',
  borderColor = '#cccccc',
  borderWidth = 1,
  borderRadius = 0,
}) => {
  const getBorderRadius = () => {
    if (shape === 'circle') return '50%';
    if (shape === 'ellipse') return '50%';
    return `${borderRadius}px`;
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor,
        border: `${borderWidth}px solid ${borderColor}`,
        borderRadius: getBorderRadius(),
      }}
    />
  );
};

export default ShapeComponent;
