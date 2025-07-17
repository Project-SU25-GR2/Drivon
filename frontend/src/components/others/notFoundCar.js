import React from 'react';

const NotFoundCar = ({ 
  title = "No cars found", 
  message = "Sorry, we couldn't find the car you're looking for.",
  onRetry,
  onGoBack,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 ${className}`}>
      <div className="text-center max-w-md">
        <style jsx>{`
          .car-broken {
            animation: carShake 2s ease-in-out infinite;
          }

          .question-mark {
            animation: questionFloat 3s ease-in-out infinite;
          }

          .search-line {
            stroke-dasharray: 20;
            animation: searchScan 2s linear infinite;
          }

          .fade-in {
            animation: fadeInUp 1s ease-out;
          }

          .smoke {
            animation: smokeRise 3s ease-out infinite;
          }

          .fire {
            animation: fireFlicker 0.5s ease-in-out infinite alternate;
          }

          @keyframes carShake {
            0%, 100% { 
              transform: translateX(0) rotate(0deg);
            }
            25% { 
              transform: translateX(-3px) rotate(-1.5deg);
            }
            50% { 
              transform: translateX(0) rotate(0deg);
            }
            75% { 
              transform: translateX(3px) rotate(1.5deg);
            }
          }

          @keyframes questionFloat {
            0%, 100% { 
              transform: translateY(0) scale(1);
              opacity: 0.7;
            }
            50% { 
              transform: translateY(-10px) scale(1.1);
              opacity: 1;
            }
          }

          @keyframes searchScan {
            0% {
              stroke-dashoffset: 40;
            }
            100% {
              stroke-dashoffset: -40;
            }
          }

          @keyframes fadeInUp {
            0% {
              opacity: 0;
              transform: translateY(30px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes smokeRise {
            0% {
              transform: translateY(0) scale(1);
              opacity: 0.8;
            }
            100% {
              transform: translateY(-20px) scale(1.5);
              opacity: 0;
            }
          }

          @keyframes fireFlicker {
            0% {
              transform: scale(1) rotate(-2deg);
              opacity: 0.8;
            }
            100% {
              transform: scale(1.1) rotate(2deg);
              opacity: 1;
            }
          }
        `}</style>
        
        {/* Broken car icon */}
        <div className="relative mb-8">
          <svg 
            className="car-broken mx-auto" 
            width="140" 
            height="80" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <g transform="translate(10 10)">
              {/* Dented car body */}
              <path 
                d="M15 35 Q20 30 35 32 L45 30 Q50 28 60 30 L75 32 Q85 35 90 38 L95 42 Q98 45 95 48 L90 50 Q85 52 75 50 L60 48 Q50 50 45 48 L35 50 Q25 52 20 48 L15 45 Q12 42 15 35 Z" 
                fill="#d1d5db" 
                stroke="#6b7280" 
                strokeWidth="2"
                opacity="0.9"
              />
              
              {/* Broken window */}
              <path 
                d="M25 35 L35 32 L45 30 L55 32 L65 35 L55 38 L45 36 L35 38 Z" 
                fill="#e5e7eb" 
                stroke="#374151" 
                strokeWidth="1.5"
                opacity="0.3"
              />
              
              {/* Cracks on glass */}
              <path d="M30 33 L40 35 M35 32 L45 37 M42 30 L38 40" stroke="#ef4444" strokeWidth="2" opacity="0.8"/>
              <path d="M50 33 L60 36 M55 31 L52 39" stroke="#ef4444" strokeWidth="2" opacity="0.8"/>
              
              {/* Flat and torn wheels */}
              <ellipse 
                cx="30" 
                cy="52" 
                rx="8" 
                ry="3" 
                fill="#374151" 
                stroke="#1f2937"
                strokeWidth="2"
                opacity="0.8"
              />
              <ellipse 
                cx="75" 
                cy="52" 
                rx="8" 
                ry="3" 
                fill="#374151" 
                stroke="#1f2937"
                strokeWidth="2"
                opacity="0.8"
              />
              
              {/* Vết rách trên bánh xe */}
              <path d="M25 52 L35 52 M28 50 L32 54" stroke="#ef4444" strokeWidth="1.5" opacity="0.9"/>
              <path d="M70 52 L80 52 M73 50 L77 54" stroke="#ef4444" strokeWidth="1.5" opacity="0.9"/>
              
              {/* Cửa xe bị móp */}
              <path d="M40 40 Q45 38 50 40 Q48 42 45 44 Q42 42 40 40" fill="#9ca3af" stroke="#6b7280" strokeWidth="1"/>
              
              {/* Đèn xe vỡ */}
              <circle cx="20" cy="42" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.5"/>
              <path d="M18 40 L22 44 M18 44 L22 40" stroke="#ef4444" strokeWidth="2" opacity="0.8"/>
              
              <circle cx="88" cy="42" r="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1" opacity="0.5"/>
              <path d="M86 40 L90 44 M86 44 L90 40" stroke="#ef4444" strokeWidth="2" opacity="0.8"/>
              
              {/* Gương chiếu hậu rơi */}
              <path d="M12 38 L8 35 M10 36 L6 39" stroke="#374151" strokeWidth="2" opacity="0.6"/>
              
              {/* Khói đen từ động cơ */}
              <g className="smoke">
                <circle cx="60" cy="25" r="3" fill="#6b7280" opacity="0.6"/>
                <circle cx="58" cy="20" r="2.5" fill="#6b7280" opacity="0.5"/>
                <circle cx="62" cy="15" r="2" fill="#6b7280" opacity="0.4"/>
                <circle cx="59" cy="10" r="1.5" fill="#6b7280" opacity="0.3"/>
              </g>
              
              <g className="smoke" style={{animationDelay: '0.5s'}}>
                <circle cx="65" cy="28" r="2.5" fill="#6b7280" opacity="0.5"/>
                <circle cx="67" cy="23" r="2" fill="#6b7280" opacity="0.4"/>
                <circle cx="63" cy="18" r="1.5" fill="#6b7280" opacity="0.3"/>
              </g>
              
              {/* Lửa nhỏ từ động cơ */}
              <g className="fire">
                <path d="M55 30 Q57 28 59 30 Q58 32 57 34 Q56 32 55 30" fill="#f59e0b" opacity="0.8"/>
                <path d="M57 32 Q58 30 59 32 Q58 33 57 32" fill="#ef4444" opacity="0.9"/>
              </g>
              
              {/* Fallen screws and debris */}
              <circle cx="45" cy="55" r="1" fill="#6b7280" opacity="0.7"/>
              <circle cx="52" cy="57" r="0.8" fill="#6b7280" opacity="0.6"/>
              <rect x="48" y="56" width="2" height="1" fill="#9ca3af" opacity="0.5" transform="rotate(45 49 56)"/>
              
              {/* Oil stains */}
              <ellipse cx="40" cy="58" rx="8" ry="2" fill="#374151" opacity="0.3"/>
              <ellipse cx="65" cy="58" rx="6" ry="1.5" fill="#374151" opacity="0.2"/>
            </g>
          </svg>
          
          {/* Floating question mark */}
          <div className="question-mark absolute -top-2 -right-2">
            <svg width="40" height="40" className="text-orange-500">
              <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.1"/>
              <text 
                x="20" 
                y="28" 
                textAnchor="middle" 
                className="text-2xl font-bold fill-current"
              >
                ?
              </text>
            </svg>
          </div>
          
          {/* Search line */}
          <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2" width="100" height="20">
            <path 
              className="search-line" 
              d="M10 10 L90 10" 
              stroke="#3b82f6" 
              strokeWidth="2"
              opacity="0.6"
            />
          </svg>
        </div>
        
        {/* Content */}
        <div className="fade-in">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {title}
          </h1>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {message}
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try Again
              </button>
            )}
            
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Go Back
              </button>
            )}
          </div>
          
          {/* Additional info */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 <strong>Suggestion:</strong> Try searching with different keywords or check the car information again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundCar;