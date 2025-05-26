import React from 'react';

const HomeContent = () => {
  return (
    <>
      <div className="hero-section">
        <div className="overlay"></div>
        <div className="hero-content">
            <div className="hero-subtitle">The best way of renting</div>
            <h1 className="hero-title">Best cars to make</h1>
            <h1 className="hero-title"><span>Your drive easy</span></h1>
            <div className="cta-buttons">
              <a href="#" className="cta-button">Best Offers</a>
              <a href="#" className="how-it-works-link">How it works</a>
            </div>
        </div>
         <div className="car-image-placeholder"></div>
         <div className="wave-placeholder"></div>
      </div>
       <div className="content-below-hero">
       </div>
    </>
  );
};

export default HomeContent; 