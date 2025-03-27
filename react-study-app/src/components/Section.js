import React from 'react';
import { useProgress } from '../contexts/ProgressContext';
import Quiz from './Quiz';
import './Section.css';

const Section = ({ section, unitIndex, sectionIndex }) => {
  const { toggleSectionExpanded, isSectionExpanded } = useProgress();
  const expanded = isSectionExpanded(unitIndex, sectionIndex);

  const handleToggle = () => {
    toggleSectionExpanded(unitIndex, sectionIndex);
  };

  return (
    <div className={`section ${expanded ? 'expanded' : ''}`}>
      <div className="section-header" onClick={handleToggle}>
        <h3 className="section-title">{section.section_title}</h3>
        <button className="expand-button">
          {expanded ? '−' : '+'}
        </button>
      </div>
      
      {expanded && (
        <div className="section-content">
          <div className="section-narrative">
            <p>{section.narrative}</p>
          </div>
          
          <div className="key-points">
            <h4>Key Points</h4>
            <ul>
              {section.key_points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          
          {section.quizzes && section.quizzes.length > 0 && (
            <Quiz 
              quizzes={section.quizzes} 
              unitIndex={unitIndex} 
              sectionIndex={sectionIndex} 
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Section;