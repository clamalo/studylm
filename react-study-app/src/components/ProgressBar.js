import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ current, total }) => {
  const progressPercentage = (current / total) * 100;
  
  return (
    <div className="progress-container">
      <div className="progress-info">
        <span>Your Progress: {current} of {total} units completed</span>
        <span className="progress-percentage">{Math.round(progressPercentage)}%</span>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;