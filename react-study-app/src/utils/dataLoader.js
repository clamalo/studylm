/**
 * Utility function to load study concepts data from localStorage or public folder.
 * If no data is found, it returns null instead of throwing an error.
 */
export const loadStudyConceptsData = async () => {
  // First, try to load from localStorage
  try {
    const storedData = localStorage.getItem('studyConcepts');
    if (storedData) {
      console.log('Loaded study concepts from localStorage.');
      const parsedData = JSON.parse(storedData);
      
      // Validate data structure
      if (validateStudyData(parsedData)) {
        return parsedData;
      } else {
        console.error('Invalid data structure in localStorage, clearing data');
        localStorage.removeItem('studyConcepts');
      }
    }
  } catch (error) {
    console.error('Error parsing localStorage data:', error);
    // Clear potentially corrupted data
    localStorage.removeItem('studyConcepts');
  }
  
  console.log('Attempting to load study concepts data from public folder...');
  
  // Try to load from public folder
  try {
    const response = await fetch('/study_concepts.json', { 
      cache: 'no-store'
    });
    
    if (!response.ok) {
      // Instead of throwing error, return null to indicate no data available
      console.log('No study_concepts.json found in public folder.');
      return null;
    }
    
    const data = await response.json();
    console.log('Successfully loaded data from public folder');
    
    // Validate data structure from file
    if (validateStudyData(data)) {
      return data;
    } else {
      console.error('Invalid data structure in study_concepts.json');
      return null;
    }
  } catch (error) {
    console.log('No study_concepts.json found or not valid JSON.');
    return null; // Return null instead of throwing error
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
    console.error('Study data is not an array');
    return false;
  }
  
  // Check if data is not empty
  if (data.length === 0) {
    console.error('Study data is empty array');
    return false;
  }
  
  // Check first unit for required properties
  const firstUnit = data[0];
  if (!firstUnit.hasOwnProperty('unit') || 
      !firstUnit.hasOwnProperty('overview') || 
      !firstUnit.hasOwnProperty('sections')) {
    console.error('Study data units missing required properties', Object.keys(firstUnit));
    return false;
  }
  
  // Check sections array
  if (!Array.isArray(firstUnit.sections)) {
    console.error('Sections is not an array');
    return false;
  }
  
  return true;
}