import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import TrackLogin from './components/login';
import RecommendTest from './components/RecommendTest';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <React.StrictMode>
      {isLoggedIn ? <RecommendTest /> : <TrackLogin onLoginSuccess={handleLoginSuccess} />}
    </React.StrictMode>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);