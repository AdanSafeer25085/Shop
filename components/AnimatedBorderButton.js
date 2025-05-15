import React from 'react';

const AnimatedBorderButton = ({ children = 'Hover me', href = '#', onClick, className = '' }) => {
  return (
    <div>
      <a
        href={href}
        onClick={onClick}
        className={`click-btn btn-style703 relative inline-block text-white px-6 py-3 font-semibold transition-all duration-300 ${className}`}
      >
        <span className="relative z-10">{children}</span>
      </a>
    </div>
  );
};

export default AnimatedBorderButton;
