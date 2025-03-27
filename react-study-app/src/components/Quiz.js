import React, { useState, useEffect } from 'react';
import { useProgress } from '../contexts/ProgressContext';
import './Quiz.css';

// Individual quiz question component - no longer has its own submit button
const QuizQuestion = ({ question, choices, correctAnswer, onAnswerSelect, selectedAnswer, showResults }) => {
  const isCorrect = selectedAnswer === correctAnswer;

  const handleAnswerSelect = (choice) => {
    if (!showResults) {
      onAnswerSelect(choice);
    }
  };

  return (
    <div className="quiz-question-container">
      <div className="quiz-question">
        <p>{question}</p>
      </div>
      
      <div className="quiz-choices">
        {choices.map((choice, index) => (
          <div 
            key={index}
            className={`quiz-choice ${selectedAnswer === choice ? 'selected' : ''} 
                      ${showResults && choice === correctAnswer ? 'correct' : ''}
                      ${showResults && selectedAnswer === choice && choice !== correctAnswer ? 'incorrect' : ''}`}
            onClick={() => handleAnswerSelect(choice)}
          >
            <span className="choice-letter">{String.fromCharCode(65 + index)}</span>
            <span className="choice-text">{choice}</span>
            {showResults && choice === correctAnswer && (
              <span className="result-icon correct">✓</span>
            )}
            {showResults && selectedAnswer === choice && choice !== correctAnswer && (
              <span className="result-icon incorrect">✗</span>
            )}
          </div>
        ))}
      </div>
      
      {showResults && (
        <div className="question-feedback">
          <p className={isCorrect ? 'feedback-correct' : 'feedback-incorrect'}>
            {isCorrect 
              ? 'Correct!' 
              : `Incorrect. The correct answer is: ${correctAnswer}`}
          </p>
        </div>
      )}
    </div>
  );
};

// Fisher-Yates (Knuth) shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Main Quiz component that handles multiple questions
const Quiz = ({ quizzes, unitIndex, sectionIndex, isUnitQuiz = false }) => {
  const { saveQuizResponse, getQuizResponse } = useProgress();
  const [responses, setResponses] = useState(Array(quizzes.length).fill(null));
  const [showResults, setShowResults] = useState(false);
  const [shuffledQuizzes, setShuffledQuizzes] = useState([]);
  
  // Initialize shuffled quiz choices
  useEffect(() => {
    const shuffled = quizzes.map(quiz => {
      // Create a shuffled copy of the choices array
      const shuffledChoices = shuffleArray(quiz.choices);
      
      return {
        ...quiz,
        shuffledChoices,
      };
    });
    
    setShuffledQuizzes(shuffled);
  }, [quizzes]);
  
  // Load saved responses if available
  useEffect(() => {
    const savedResponse = getQuizResponse(unitIndex, sectionIndex, isUnitQuiz);
    if (savedResponse && savedResponse.responses) {
      setResponses(savedResponse.responses);
      setShowResults(savedResponse.showResults || false);
      
      // If we have saved shuffled choices, use those
      if (savedResponse.shuffledQuizzes) {
        setShuffledQuizzes(savedResponse.shuffledQuizzes);
      }
    }
  }, [getQuizResponse, unitIndex, sectionIndex, isUnitQuiz]);
  
  const handleAnswerSelect = (questionIndex, answer) => {
    if (!showResults) {
      const newResponses = [...responses];
      newResponses[questionIndex] = answer;
      setResponses(newResponses);
    }
  };
  
  const handleCheckAnswers = () => {
    setShowResults(true);
    
    // Calculate results
    const results = responses.map((response, index) => 
      response === quizzes[index].correct_answer
    );
    
    // Save responses to context with the shuffled choices
    saveQuizResponse(unitIndex, sectionIndex, {
      responses,
      results,
      showResults: true,
      timestamp: new Date().toISOString(),
      isUnitQuiz,
      shuffledQuizzes
    }, isUnitQuiz);
  };
  
  const handleReset = () => {
    // Reshuffle the choices for each question
    const reshuffled = quizzes.map(quiz => {
      const shuffledChoices = shuffleArray(quiz.choices);
      return {
        ...quiz,
        shuffledChoices,
      };
    });
    
    setShuffledQuizzes(reshuffled);
    setResponses(Array(quizzes.length).fill(null));
    setShowResults(false);
    
    // Update saved response
    saveQuizResponse(unitIndex, sectionIndex, null, isUnitQuiz);
  };
  
  // Calculate quiz score
  const getResults = () => {
    if (!showResults) return null;
    
    const totalQuestions = quizzes.length;
    const correctAnswers = responses.filter((response, index) => 
      response === quizzes[index].correct_answer
    ).length;
    const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    return {
      totalQuestions,
      correctAnswers,
      scorePercentage
    };
  };
  
  const results = getResults();
  const allQuestionsAnswered = responses.every(response => response !== null);
  
  // Don't render until shuffled quizzes are prepared
  if (shuffledQuizzes.length === 0) {
    return <div>Loading questions...</div>;
  }
  
  return (
    <div className="quiz-container">
      <h4 className="quiz-title">{isUnitQuiz ? 'Unit Quiz' : 'Section Quiz'}</h4>
      
      {showResults && (
        <div className="quiz-score">
          <span>Score: {results.correctAnswers}/{results.totalQuestions} ({results.scorePercentage}%)</span>
        </div>
      )}
      
      {shuffledQuizzes.map((quiz, index) => (
        <div key={index} className="quiz-item">
          <h5 className="quiz-item-number">Question {index + 1}</h5>
          <QuizQuestion 
            question={quiz.question}
            choices={quiz.shuffledChoices}
            correctAnswer={quiz.correct_answer}
            onAnswerSelect={(answer) => handleAnswerSelect(index, answer)}
            selectedAnswer={responses[index]}
            showResults={showResults}
          />
        </div>
      ))}
      
      <div className="quiz-actions">
        {!showResults ? (
          <button 
            className="quiz-submit-btn"
            onClick={handleCheckAnswers}
            disabled={!allQuestionsAnswered}
          >
            Check Answers
          </button>
        ) : (
          <button className="quiz-reset-btn" onClick={handleReset}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;