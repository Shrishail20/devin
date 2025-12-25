import React from 'react';

interface ContainerComponentProps {
  display?: 'flex' | 'grid' | 'block';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch';
  gap?: number;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export const ContainerComponent: React.FC<ContainerComponentProps> = ({
  display = 'flex',
  flexDirection = 'column',
  justifyContent = 'flex-start',
  alignItems = 'flex-start',
  gap = 8,
  backgroundColor = 'transparent',
  children,
}) => {
  return (
    <div
      style={{
        display,
        flexDirection: display === 'flex' ? flexDirection : undefined,
        justifyContent: display === 'flex' ? justifyContent : undefined,
        alignItems: display === 'flex' ? alignItems : undefined,
        gap: `${gap}px`,
        backgroundColor,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export default ContainerComponent;
