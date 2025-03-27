import React, { useState, useEffect } from 'react';
import UnitCard from './components/UnitCard';
import WelcomePage from './components/WelcomePage/WelcomePage';
import ProgressBar from './components/ProgressBar';
import { ProgressProvider, useProgress } from './contexts/ProgressContext';
import { loadStudyConceptsData } from './utils/dataLoader';
import './App.css';

// Main content component that uses the progress context
const MainContent = () => {
  const [studyData, setStudyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    studyMode, 
    currentUnitIndex, 
    completedUnits, 
    getQuizStats, 
    resetProgress, 
    startLearning,
    goToWelcomePage  // Import the new function
  } = useProgress();

  // Check for URL parameters that might override normal behavior
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');

    // If mode=learning is in the URL, ensure we're in learning mode
    if (modeParam === 'learning') {
      startLearning();

      // Clean up the URL to avoid persistent parameters
      if (window.history && window.history.replaceState) {
        const cleanUrl =
          window.location.protocol + '//' + window.location.host + window.location.pathname;
        window.history.replaceState(null, null, cleanUrl);
      }
    }
  }, [startLearning]);

  useEffect(() => {
    // Use our utility function to load the data
    loadStudyConceptsData()
      .then((data) => {
        setStudyData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading study data:', error);
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // Debug reload function
  const debugReloadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await loadStudyConceptsData();
      setStudyData(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading">Loading study content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error">
          <h3>Error loading study data:</h3>
          <p>{error}</p>
          <p>The application is trying to load study_concepts.json from multiple locations.</p>
          <button onClick={debugReloadData} className="debug-button">
            Try Reload
          </button>
        </div>
      </div>
    );
  }

  // If we're not in learning mode, show the Welcome Page
  if (studyMode !== 'learning') {
    return <WelcomePage />;
  }

  // If in learning mode but no study data exists, reset progress and show WelcomePage
  if (!studyData || studyData.length === 0) {
    resetProgress();
    return <WelcomePage />;
  }

  // Study mode is active and study data exists; show the Study Guide view
  const quizStats = getQuizStats();

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Study Guide</h1>
        <p className="app-subtitle">Step-by-step learning guide</p>
        
        {/* Add a button to return to the welcome page */}
        <button 
          onClick={goToWelcomePage} 
          className="back-to-welcome-button">
          ← Back to Welcome Page
        </button>
      </header>

      <ProgressBar current={completedUnits.length} total={studyData.length} />

      {quizStats.total > 0 && (
        <div className="quiz-stats-overview">
          <h3>Your Quiz Progress</h3>
          <div className="quiz-stats-container">
            <div className="quiz-stats">
              <h4>Overall</h4>
              <div className="quiz-stats-score">
                <span className="score-value">{quizStats.percentage}%</span>
                <span className="score-details">
                  ({quizStats.correct}/{quizStats.total} correct)
                </span>
              </div>
            </div>

            <div className="quiz-stats">
              <h4>Section Quizzes</h4>
              <div className="quiz-stats-score">
                <span className="score-value">
                  {quizStats.sectionStats.totalAnswered > 0
                    ? Math.round(
                        (quizStats.sectionStats.totalCorrect / quizStats.sectionStats.totalAnswered) * 100
                      )
                    : 0}
                  %
                </span>
                <span className="score-details">
                  ({quizStats.sectionStats.totalCorrect}/{quizStats.sectionStats.totalAnswered} correct)
                </span>
              </div>
            </div>

            <div className="quiz-stats">
              <h4>Unit Quizzes</h4>
              <div className="quiz-stats-score">
                <span className="score-value">
                  {quizStats.unitStats.totalAnswered > 0
                    ? Math.round(
                        (quizStats.unitStats.totalCorrect / quizStats.unitStats.totalAnswered) * 100
                      )
                    : 0}
                  %
                </span>
                <span className="score-details">
                  ({quizStats.unitStats.totalCorrect}/{quizStats.unitStats.totalAnswered} correct)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        <UnitCard unit={studyData[currentUnitIndex]} index={currentUnitIndex} totalUnits={studyData.length} />
      </main>
      <div className="debug-info">
        <p>
          Current Unit: {currentUnitIndex + 1} of {studyData.length}
        </p>
        <p>Unit Title: {studyData[currentUnitIndex]?.unit || 'Unknown'}</p>
        <p>Sections: {studyData[currentUnitIndex]?.sections?.length || 0}</p>
      </div>
    </div>
  );
};

// App wrapper that provides the progress context
function App() {
  return (
    <ProgressProvider>
      <MainContent />
    </ProgressProvider>
  );
}

export default App;