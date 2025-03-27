import React, { useState, useEffect } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import FileUpload from '../FileUpload';
import './WelcomePage.css';

const WelcomePage = () => {
  const { startLearning } = useProgress();
  const [showUpload, setShowUpload] = useState(false);
  const [hasStudyData, setHasStudyData] = useState(false);
  const [studyInfo, setStudyInfo] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem('studyConcepts');
    setHasStudyData(!!data);
    
    if (!data) {
      setShowUpload(true);
    } else {
      try {
        // Get basic info about the study data for display
        const parsedData = JSON.parse(data);
        setStudyInfo({
          unitCount: parsedData.length,
          title: parsedData[0]?.unit || 'Study Guide'
        });
      } catch (e) {
        console.error("Error parsing study data:", e);
      }
    }
  }, []);

  const handleProcessComplete = (studyGuide) => {
    // Simply start learning without reloading the page
    // This will directly navigate to the learning interface
    startLearning();
  };

  const handleStartLearning = () => {
    startLearning();
  };

  const handleReupload = () => {
    setShowUpload(true);
  };

  const handleCancelUpload = () => {
    if (hasStudyData) {
      setShowUpload(false);
    }
  };

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Interactive Study Guide</h1>
        
        {!showUpload && (
          <>
            <div className="welcome-hero">
              <div className="welcome-icon">📚</div>
              <p className="welcome-description">
                This interactive study guide will help you learn at your own pace.
                We use AI to organize concepts and create quizzes to make learning more effective.
              </p>
            </div>

            {hasStudyData && (
              <div className="study-data-info">
                <h3>Ready to Continue Learning</h3>
                {studyInfo && (
                  <p>Your study guide contains {studyInfo.unitCount} units on "{studyInfo.title}"</p>
                )}
              </div>
            )}

            <div className="welcome-actions">
              {hasStudyData ? (
                <>
                  <button className="primary-button" onClick={handleStartLearning}>
                    Continue Learning
                  </button>
                  <button className="secondary-button" onClick={handleReupload}>
                    Reupload/Reprocess Materials
                  </button>
                </>
              ) : (
                <p className="no-data-message">
                  Get started by uploading your learning materials below
                </p>
              )}
            </div>
          </>
        )}
        
        {showUpload && (
          <div className="upload-section">
            {hasStudyData && (
              <div className="upload-warning">
                <p><strong>Note:</strong> Uploading new materials will replace your current study guide.</p>
                <button className="text-button" onClick={handleCancelUpload}>
                  Cancel and return to existing guide
                </button>
              </div>
            )}
            <FileUpload onProcessComplete={handleProcessComplete} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WelcomePage;