import React from 'react';

const Badge = ({ children, type = 'pink' }) => {
  return (
    <span className={`badge badge-${type}`}>
      {children}
    </span>
  );
};

export default Badge;
