import React from 'react';

export const PlayingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    stroke="currentColor"
    {...props}
    >
    <path d="M6 15V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 18V6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 15V9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 12V12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
);