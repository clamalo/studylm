/**
 * Utility function to load study concepts data from localStorage or public folder.
 * If no data is found, it returns null instead of throwing an error.
 */
export const loadStudyConceptsData = async () => {
  // First, try to load from file
  try {
    const response = await fetch('/study_concepts.json', { 
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Validate data structure from file
      if (validateStudyData(data)) {
        // Update localStorage to match the file
        localStorage.setItem('studyConcepts', JSON.stringify(data));
        return data;
      } else {
        // Clear localStorage if file is invalid
        localStorage.removeItem('studyConcepts');
        return null;
      }
    }
    
    // File doesn't exist or isn't accessible, clear localStorage to avoid stale data
    // This ensures deleted files actually result in cleared data
    localStorage.removeItem('studyConcepts');
    
    // Fall back to localStorage only if file isn't available
    const storedData = localStorage.getItem('studyConcepts');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      
      // Validate data structure
      if (validateStudyData(parsedData)) {
        return parsedData;
      } else {
        localStorage.removeItem('studyConcepts');
      }
    }
    
    return null;
  } catch (error) {
    // Clear localStorage if there's any error
    localStorage.removeItem('studyConcepts');
    return null;
  }
};

/**
 * Validates that the study data has the expected structure
 * @param {*} data The study data to validate
 * @returns {boolean} True if valid, false otherwise
 */
function validateStudyData(data) {
  // Check if data is array
  if (!Array.isArray(data)) {
    return false;
  }
  
  // Check if data is not empty
  if (data.length === 0) {
    return false;
  }
  
  // Check first unit for required properties
  const firstUnit = data[0];
  if (!firstUnit.hasOwnProperty('unit') || 
      !firstUnit.hasOwnProperty('overview') || 
      !firstUnit.hasOwnProperty('sections')) {
    return false;
  }
  
  // Check sections array
  if (!Array.isArray(firstUnit.sections)) {
    return false;
  }
  
  return true;
}