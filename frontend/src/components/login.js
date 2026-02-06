import React, { useState } from 'react';
import './Login.css';

function TrackLogin() {
  const[user, setUser] = useState("");
  const[pass, setPass] = useState("");
  const[confirmPass, setConfirmPass] = useState("");
  const[message, setMessage] = useState("");
  const[isError, setIsError] = useState(false);
  const[isRegistering, setIsRegistering] = useState(false);

  const trackUser = (e) => {
    setUser(e.target.value);
  }

  const trackPass = (e) => {
    setPass(e.target.value)
  }

  const trackConfirmPass = (e) => {
    setConfirmPass(e.target.value)
  }

  // clear form and message when switching modes
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setUser("");
    setPass("");
    setConfirmPass("");
    setMessage("");
    setIsError(false);
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password: pass }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        setIsError(false);
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setIsError(true);
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault();

    // validate passwords match
    if (pass !== confirmPass) {
      setMessage("Passwords do not match");
      setIsError(true);
      return;
    }

    // TODO: create password validation logic
    
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password: pass }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message + " - You can now log in.");
        setIsError(false);
        // switch to login mode after successful registration
        setTimeout(() => {
          setIsRegistering(false);
          setPass("");
          setConfirmPass("");
        }, 2000);
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage("Error connecting to server");
      setIsError(true);
    }
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isRegistering ? "Register" : "Login"}</h1>
        {message && (
          <p className={isError ? "error-message" : "success-message"}>
            {message}
          </p>
        )}
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <input 
            className="login-input"
            type="text"
            placeholder="Username"
            value={user}
            onChange={trackUser}
          />
          <input 
            className="login-input"
            type="password"
            placeholder="Password"
            value={pass}
            onChange={trackPass}
          />
          {isRegistering && (
            <input 
              className="login-input"
              type="password"
              placeholder="Confirm Password"
              value={confirmPass}
              onChange={trackConfirmPass}
            />
          )}
          <button type="submit" className="login-button">
            {isRegistering ? "Register" : "Sign In"}
          </button>
        </form>
        <p className="toggle-text">
          {isRegistering ? "Already have an account? " : "Don't have an account? "}
          <span className="toggle-link" onClick={toggleMode}>
            {isRegistering ? "Sign In" : "Register"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default TrackLogin;