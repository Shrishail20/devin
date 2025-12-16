import React from 'react';

interface ImageComponentProps {
  src: string;
  alt?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  borderRadius?: number;
}

export const ImageComponent: React.FC<ImageComponentProps> = ({
  src,
  alt = 'Image',
  objectFit = 'cover',
  borderRadius = 0,
}) => {
  if (!src) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: `${borderRadius}px`,
          color: '#999',
          fontSize: '14px',
        }}
      >
        No image
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit,
        borderRadius: `${borderRadius}px`,
      }}
    />
  );
};

export default ImageComponent;
