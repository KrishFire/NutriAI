import React, { useState } from 'react';
interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  fallback?: string;
}
export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'medium',
  fallback
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-14 h-14'
  };
  const [error, setError] = useState(false);
  const handleError = () => {
    setError(true);
  };
  return <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
      {!error && src ? <img src={src} alt={alt} className="w-full h-full object-cover" onError={handleError} /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 font-medium">
          {fallback || alt.charAt(0).toUpperCase()}
        </div>}
    </div>;
};