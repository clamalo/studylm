import os
import json
from google import genai
from pydantic import BaseModel

# GEMINI CONFIG
system_instruction = (
    "You are a helpful assistant specialized in extracting and synthesizing concepts from course materials. "
    "Always provide clear and organized responses. Never provide any sort of introduction or meta-level commentary. "
    "Just get straight into the response and be as thorough as possible."
)

# Updated Pydantic models for the structured study guide including quizzes
class Quiz(BaseModel):
    question: str
    choices: list[str]
    correct_answer: str

class Section(BaseModel):
    section_title: str
    narrative: str
    key_points: list[str]
    quizzes: list[Quiz]  # Three quiz questions per section

class UnitConcepts(BaseModel):
    unit: str
    overview: str
    sections: list[Section]
    unit_quiz: list[Quiz]  # Ten quiz questions at the end of each unit

client = genai.Client(api_key="AIzaSyDCFi4E7uEaxZMks-aW7hZ6cX5-7yQXfu8")

# List all files in the specified directory, excluding .DS_Store
directory = "/Users/clamalo/downloads/brainmind/"
file_paths = [
    os.path.join(directory, filename)
    for filename in os.listdir(directory)
    if filename != ".DS_Store" and os.path.isfile(os.path.join(directory, filename))
]

# Upload each file and store the uploaded file objects
uploaded_files = []
for path in file_paths:
    uploaded_file = client.files.upload(file=path)
    uploaded_files.append(uploaded_file)
    print(f"Uploaded file: {uploaded_file}")

# --- Structured Narrative Study Guide Response ---
contents = []
for uploaded_file in uploaded_files:
    contents.append(uploaded_file)
    contents.append("\n\n")

contents.append(
    "Organize all concepts extracted from the files into a structured study guide. The output should be a JSON array of units. Each unit must contain a 'unit' (the title of the unit) and an 'overview' that summarizes the key ideas of that unit. Each unit should also have a 'sections' array. Every section within the unit must include a 'section_title', a 'narrative' explanation that details the concepts in that section, and a 'key_points' array that lists the essential takeaways. For each section, generate three quiz questions that test understanding of the material. Each quiz question should be a JSON object with a 'question', an array of four 'choices', and a 'correct_answer' that matches one of the choices. Additionally, at the end of each unit, generate a unit-level quiz consisting of ten quiz questions in the same format. Ensure that the units progressively build on each other to form a cohesive understanding of the course material. Use information primarily from the lecture slides, and supplement with additional details as needed."
)

response = client.models.generate_content(
    # model='gemini-2.5-pro-exp-03-25',
    model='gemini-2.0-flash',
    contents=contents,
    config={
        'system_instruction': system_instruction,
        'response_mime_type': 'application/json',
        'response_schema': list[UnitConcepts],
    },
)

# Use the response as a JSON string.
print("Structured Study Guide JSON:")
print(response.text)

# Instantiate objects from the JSON response.
parsed_json = json.loads(response.text)
study_units = [UnitConcepts(**item) for item in parsed_json]

# Save the JSON to a file
output_file = "/Users/clamalo/documents/studylm/react-study-app/public/study_concepts.json"
with open(output_file, "w") as f:
    json.dump([unit.dict() for unit in study_units], f, indent=2)
    
print(f"Saved concepts to {output_file}")