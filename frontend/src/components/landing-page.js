/* 
Insert landing page logic here

TODO:
Create landing page componenets
Needed: 
Signup and Login Buttons
Displayed Logo 
Clean footer and header
*/

import React, { useEffect, useState } from 'react';
import './landing-page.css';


// Component for choosing degree program with autocomplete
function ChooseDegree() {
    const [text, setText] = useState("");
    const [filteredDegrees, setFilteredDegrees] = useState([]);
    const [degrees, setDegrees] = useState([]);

    // fetch degrees 
    useEffect(() => {
        fetch('http://localhost:5000/api/degrees')
            .then(response => response.json())
            .then(data => setDegrees(data))
            .catch(error => console.error('Error:', error));
    }, []);

    const trackText = (e) => {
        const value = e.target.value;
        setText(value);

        if (value.trim() === "") {
            setFilteredDegrees([]);
        } else {
            const matches = degrees.filter(degree =>
                degree.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredDegrees(matches);
        }
    };

    const selectDegree = (degree) => {
        setText(degree);
        setFilteredDegrees([]);
    };

    return (
        <div className="Degree-Selection-Container">
            <h2>Select Your Degree Program</h2>
            <input
                type="text"
                placeholder="Enter Degree Program"
                value={text}
                onChange={trackText}
            />
            {filteredDegrees.length > 0 && (
                <ul className="degree-dropdown">
                    {filteredDegrees.map((degree, index) => (
                        <li key={index} onClick={() => selectDegree(degree)}>
                            {degree}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ChooseDegree;