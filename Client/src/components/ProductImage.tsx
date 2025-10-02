import React from 'react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({ src, alt, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className || ''}`}
      onError={(e) => {
        e.currentTarget.src = '/placeholder-image.jpg'; // Fallback image
        e.currentTarget.onerror = null; // Prevent infinite loop
      }}
    />
  );
};