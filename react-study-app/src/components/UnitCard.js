import React from 'react';
import Section from './Section';
import UnitQuiz from './UnitQuiz';
import { useProgress } from '../contexts/ProgressContext';
import './UnitCard.css';

const UnitCard = ({ unit, index, totalUnits }) => {
  const { 
    toggleUnitComplete, 
    goToNextUnit, 
    goToPreviousUnit, 
    completedUnits 
  } = useProgress();

  const isCompleted = completedUnits.includes(index);
  const isLastUnit = index === totalUnits - 1;

  const handleToggleComplete = () => {
    toggleUnitComplete(index);
    
    // Only auto-navigate to next unit when marking as complete (not when unmarking)
    if (!isCompleted && !isLastUnit) {
      goToNextUnit();
    }
  };

  return (
    <div className={`unit-card ${isCompleted ? 'completed' : ''}`}>
      <div className="unit-header">
        <h2 className="unit-title">{unit.unit}</h2>
        {isCompleted && <span className="completion-badge">✓</span>}
      </div>
      
      <div className="unit-overview">
        <p>{unit.overview}</p>
      </div>
      
      <div className="unit-sections">
        {unit.sections.map((section, sectionIndex) => (
          <Section 
            key={sectionIndex} 
            section={section} 
            unitIndex={index}
            sectionIndex={sectionIndex}
          />
        ))}
        
        {unit.unit_quiz && (
          <UnitQuiz unitQuiz={unit.unit_quiz} unitIndex={index} />
        )}
      </div>

      <div className="unit-navigation">
        <button 
          className="nav-button prev" 
          onClick={goToPreviousUnit} 
          disabled={index === 0}
        >
          ← Previous Unit
        </button>
        
        <button 
          className={`complete-button ${isCompleted ? 'completed' : ''}`}
          onClick={handleToggleComplete}
        >
          {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
        </button>
        
        <button 
          className="nav-button next" 
          onClick={goToNextUnit} 
          disabled={isLastUnit}
        >
          Next Unit →
        </button>
      </div>
    </div>
  );
};

export default UnitCard;