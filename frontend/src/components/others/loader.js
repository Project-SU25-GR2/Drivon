import React from 'react';

const Loader = ({ text = "Loading...", className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-50 ${className}`}>
      <div className="relative">
        <style jsx>{`
          .car {
            animation: carMove 3s ease-in-out infinite;
          }

          .car__body {
            animation: shake 0.2s ease-in-out infinite alternate;
          }

          .car__line {
            transform-origin: center right;
            stroke-dasharray: 22;
            animation: line 0.8s ease-in-out infinite;
            animation-fill-mode: both;
          }

          .car__line--top {
            animation-delay: 0s;
          }

          .car__line--middle {
            animation-delay: 0.2s;
          }

          .car__line--bottom {
            animation-delay: 0.4s;
          }

          @keyframes carMove {
            0%, 100% { 
              transform: translateX(-50px);
            }
            50% { 
              transform: translateX(50px);
            }
          }

          @keyframes shake {
            0% {
              transform: translateY(-1%);
            }
            100% {
              transform: translateY(3%);
            }
          }

          @keyframes line {
            0% {
              stroke-dashoffset: 22;
            }
            25% {
              stroke-dashoffset: 22;
            }
            50% {
              stroke-dashoffset: 0;
            }
            51% {
              stroke-dashoffset: 0;
            }
            80% {
              stroke-dashoffset: -22;
            }
            100% {
              stroke-dashoffset: -22;
            }
          }

          @keyframes textPulse {
            0%, 100% { 
              opacity: 1; 
            }
            50% { 
              opacity: 0.5; 
            }
          }

          .loading-text {
            animation: textPulse 2s ease-in-out infinite;
          }
        `}</style>
        
        <svg 
          className="car" 
          width="102" 
          height="40" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g 
            transform="translate(2 1)" 
            stroke="#002742" 
            fill="none" 
            fillRule="evenodd" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path 
              className="car__body" 
              d="M47.293 2.375C52.927.792 54.017.805 54.017.805c2.613-.445 6.838-.337 9.42.237l8.381 1.863c2.59.576 6.164 2.606 7.98 4.531l6.348 6.732 6.245 1.877c3.098.508 5.609 3.431 5.609 6.507v4.206c0 .29-2.536 4.189-5.687 4.189H36.808c-2.655 0-4.34-2.1-3.688-4.67 0 0 3.71-19.944 14.173-23.902zM36.5 15.5h54.01" 
              strokeWidth="3"
            />
            <ellipse 
              className="car__wheel--left" 
              strokeWidth="3.2" 
              fill="#FFF" 
              cx="83.493" 
              cy="30.25" 
              rx="6.922" 
              ry="6.808"
            />
            <ellipse 
              className="car__wheel--right" 
              strokeWidth="3.2" 
              fill="#FFF" 
              cx="46.511" 
              cy="30.25" 
              rx="6.922" 
              ry="6.808"
            />
            <path 
              className="car__line car__line--top" 
              d="M22.5 16.5H2.475" 
              strokeWidth="3"
            />
            <path 
              className="car__line car__line--middle" 
              d="M20.5 23.5H.4755" 
              strokeWidth="3"
            />
            <path 
              className="car__line car__line--bottom" 
              d="M25.5 9.5h-19" 
              strokeWidth="3"
            />
          </g>
        </svg>
      </div>
      
      <div className="loading-text text-slate-800 text-base font-medium mt-8">
        {text}
      </div>
    </div>
  );
};

export default Loader;