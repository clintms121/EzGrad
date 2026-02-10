import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TrackLogin from './components/login';
import ChooseDegree from './components/landing-page';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <React.StrictMode>
      {isLoggedIn ? <ChooseDegree /> : <TrackLogin onLoginSuccess={handleLoginSuccess} />}
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);