import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">
          <span className="logo-icon">🎓</span>
          EzGrad
        </h1>
        <p className="tagline">Easy Grade Management Made Simple</p>
      </div>
    </header>
  );
};

export default Header;