import React from 'react';
import Quiz from './Quiz';
import { useProgress } from '../contexts/ProgressContext';
import './Quiz.css';

const UnitQuiz = ({ unitQuiz, unitIndex }) => {
  const { toggleSectionExpanded, isSectionExpanded } = useProgress();
  // Use a special sectionIndex (-1) to indicate this is the unit quiz
  const expanded = isSectionExpanded(unitIndex, -1);

  const handleToggle = () => {
    toggleSectionExpanded(unitIndex, -1);
  };

  if (!unitQuiz || !unitQuiz.length) {
    return null;
  }

  return (
    <div className={`unit-quiz ${expanded ? 'expanded' : ''}`}>
      <div className="unit-quiz-header" onClick={handleToggle}>
        <h3 className="unit-quiz-title">Unit Comprehensive Quiz</h3>
        <button className="expand-button">
          {expanded ? '−' : '+'}
        </button>
      </div>
      
      {expanded && (
        <div className="unit-quiz-content">
          <Quiz 
            quizzes={unitQuiz} 
            unitIndex={unitIndex} 
            sectionIndex={-1}
            isUnitQuiz={true}
          />
        </div>
      )}
    </div>
  );
};

export default UnitQuiz;