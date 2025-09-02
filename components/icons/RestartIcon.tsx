import React from 'react';

export const RestartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M20 11a8.1 8.1 0 0 0-15.5-2 8 8 0 1 0 15.5 2v0Z"></path>
    <path d="M22 4v4h-4"></path>
  </svg>
);