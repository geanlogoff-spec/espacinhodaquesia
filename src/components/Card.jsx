import React from 'react';

// Using inline styles/classes from global css (card)
const Card = ({ children, className = '', title, action }) => {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          {title && <h2 className="text-subtitle">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;
