import React from 'react';

interface IframePlayerProps {
  src: string;
  onError: () => void;
  className?: string;
}

const IframePlayer: React.FC<IframePlayerProps> = ({ src, onError, className }) => {
  return (
    <iframe
      src={src}
      className={className}
      allowFullScreen
      allow="autoplay; fullscreen; encrypted-media"
      onError={onError}
      style={{ border: 'none' }}
    />
  );
};

export default IframePlayer;