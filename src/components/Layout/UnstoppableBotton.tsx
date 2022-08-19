import React from 'react';

interface Props {
  children?: React.ReactNode;
  onClick: () => void;
  width: string;
}

const UnstoppableBotton: React.FC<Props> = ({ 
    children,
    onClick, 
    width
  }) => { 
  return (
    <button 
      onClick={onClick}
      className="square-btn square-btn--teal square-btn--sm flex items-center justify-center"
    >
    {children}
    </button>
  );
}


export default UnstoppableBotton