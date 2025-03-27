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
  
  const [currentUnitIndex, setCurrentUnitIndex] = useState(initialProgress.currentUnitIndex || 0);
  const [expandedSections, setExpandedSections] = useState(initialProgress.expandedSections || {});
  const [completedUnits, setCompletedUnits] = useState(initialProgress.completedUnits || []);
  const [studyMode, setStudyMode] = useState(initialProgress.studyMode || 'welcome'); // 'welcome', 'learning', 'review'
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
        quizResponses,
        unitQuizResponses 
      } = JSON.parse(savedProgress);
      
      setCurrentUnitIndex(currentUnitIndex);
      setExpandedSections(expandedSections);
      setCompletedUnits(completedUnits);
      setStudyMode(studyMode);
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
      quizResponses,
      unitQuizResponses
    }));
  }, [currentUnitIndex, expandedSections, completedUnits, studyMode, quizResponses, unitQuizResponses]);
  
  const startLearning = () => {
    setStudyMode('learning');
  };
  
  const markUnitComplete = (unitIndex) => {
    if (!completedUnits.includes(unitIndex)) {
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
        startLearning,
        markUnitComplete,
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