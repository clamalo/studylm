import React, { createContext, useState, useContext, useEffect } from 'react';

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
  // Initialize state from localStorage if available; otherwise, use defaults.
  let initialProgress = {};
  try {
    initialProgress = JSON.parse(localStorage.getItem('studyProgress')) || {};
  } catch (e) {
    initialProgress = {};
  }
  
  // Check URL parameters for mode override - this ensures we only go straight to learning
  // if the URL explicitly requests it (like when redirected after processing new content)
  const getInitialStudyMode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const modeParam = urlParams.get('mode');
    
    if (modeParam === 'learning') {
      return 'learning';
    }
    
    // Otherwise default to welcome mode unless we have a saved preference
    return initialProgress.studyMode || 'welcome';
  };
  
  const [currentUnitIndex, setCurrentUnitIndex] = useState(initialProgress.currentUnitIndex || 0);
  const [expandedSections, setExpandedSections] = useState(initialProgress.expandedSections || {});
  const [completedUnits, setCompletedUnits] = useState(initialProgress.completedUnits || []);
  const [studyMode, setStudyMode] = useState(getInitialStudyMode());
  const [activeTab, setActiveTab] = useState(initialProgress.activeTab || 'learn');
  const [quizResponses, setQuizResponses] = useState(initialProgress.quizResponses || {});
  const [unitQuizResponses, setUnitQuizResponses] = useState(initialProgress.unitQuizResponses || {});

  // Load progress from localStorage on mount (in case there is updated info)
  useEffect(() => {
    const savedProgress = localStorage.getItem('studyProgress');
    if (savedProgress) {
      const { 
        currentUnitIndex, 
        expandedSections, 
        completedUnits, 
        studyMode, 
        activeTab,
        quizResponses,
        unitQuizResponses 
      } = JSON.parse(savedProgress);
      
      setCurrentUnitIndex(currentUnitIndex);
      setExpandedSections(expandedSections);
      setCompletedUnits(completedUnits);
      
      // Only load the studyMode from localStorage if we're not overriding via URL
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has('mode')) {
        setStudyMode(studyMode || 'welcome');
      }
      
      if (activeTab) setActiveTab(activeTab);
      if (quizResponses) setQuizResponses(quizResponses);
      if (unitQuizResponses) setUnitQuizResponses(unitQuizResponses);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('studyProgress', JSON.stringify({
      currentUnitIndex,
      expandedSections,
      completedUnits,
      studyMode,
      activeTab,
      quizResponses,
      unitQuizResponses
    }));
  }, [currentUnitIndex, expandedSections, completedUnits, studyMode, activeTab, quizResponses, unitQuizResponses]);
  
  const startLearning = () => {
    setStudyMode('learning');
    setActiveTab('learn');
  };
  
  // Add new function to go back to welcome page
  const goToWelcomePage = () => {
    setStudyMode('welcome');
  };
  
  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };
  
  const markUnitComplete = (unitIndex) => {
    if (!completedUnits.includes(unitIndex)) {
      setCompletedUnits([...completedUnits, unitIndex]);
    }
  };
  
  // New function to toggle unit completion status
  const toggleUnitComplete = (unitIndex) => {
    if (completedUnits.includes(unitIndex)) {
      // Remove the unit from completed units
      setCompletedUnits(completedUnits.filter(idx => idx !== unitIndex));
    } else {
      // Add the unit to completed units
      setCompletedUnits([...completedUnits, unitIndex]);
    }
  };
  
  const goToNextUnit = () => {
    setCurrentUnitIndex(prevIndex => prevIndex + 1);
  };
  
  const goToPreviousUnit = () => {
    setCurrentUnitIndex(prevIndex => Math.max(0, prevIndex - 1));
  };
  
  const resetProgress = () => {
    setCurrentUnitIndex(0);
    setExpandedSections({});
    setCompletedUnits([]);
    setStudyMode('welcome');
    setActiveTab('learn');
    setQuizResponses({});
    setUnitQuizResponses({});
    localStorage.removeItem('studyProgress');
  };
  
  const toggleSectionExpanded = (unitIndex, sectionIndex) => {
    const key = `${unitIndex}-${sectionIndex}`;
    setExpandedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };
  
  const isSectionExpanded = (unitIndex, sectionIndex) => {
    const key = `${unitIndex}-${sectionIndex}`;
    return expandedSections[key] || false;
  };
  
  const saveQuizResponse = (unitIndex, sectionIndex, response, isUnitQuiz = false) => {
    const key = `${unitIndex}-${sectionIndex}`;
    
    if (isUnitQuiz) {
      setUnitQuizResponses(prev => ({
        ...prev,
        [key]: response
      }));
    } else {
      setQuizResponses(prev => ({
        ...prev,
        [key]: response
      }));
    }
  };
  
  const getQuizResponse = (unitIndex, sectionIndex, isUnitQuiz = false) => {
    const key = `${unitIndex}-${sectionIndex}`;
    return isUnitQuiz 
      ? unitQuizResponses[key] || null
      : quizResponses[key] || null;
  };
  
  const getQuizStats = () => {
    // Calculate stats from section quizzes
    const calculateStats = (responses) => {
      let totalAnswered = 0;
      let totalCorrect = 0;
      
      Object.values(responses).forEach(response => {
        if (response && response.results) {
          response.results.forEach(result => {
            if (result !== null) {
              totalAnswered++;
              if (result === true) {
                totalCorrect++;
              }
            }
          });
        }
      });
      
      return {
        totalAnswered,
        totalCorrect
      };
    };
    
    // Get stats for both section quizzes and unit quizzes
    const sectionStats = calculateStats(quizResponses);
    const unitStats = calculateStats(unitQuizResponses);
    
    const totalAnswered = sectionStats.totalAnswered + unitStats.totalAnswered;
    const totalCorrect = sectionStats.totalCorrect + unitStats.totalCorrect;
    
    return {
      total: totalAnswered,
      correct: totalCorrect,
      percentage: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
      sectionStats,
      unitStats
    };
  };
  
  return (
    <ProgressContext.Provider
      value={{
        currentUnitIndex,
        completedUnits,
        studyMode,
        activeTab,
        startLearning,
        goToWelcomePage,
        changeTab,
        markUnitComplete,
        toggleUnitComplete,
        goToNextUnit,
        goToPreviousUnit,
        resetProgress,
        toggleSectionExpanded,
        isSectionExpanded,
        saveQuizResponse,
        getQuizResponse,
        getQuizStats
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};

export const useProgress = () => useContext(ProgressContext);