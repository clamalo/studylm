# StudyLM: AI-Powered Study Guide Generator

StudyLM helps you create interactive study guides from your learning materials. Upload your study materials, and the AI will organize them into structured units with quizzes to test your knowledge.

## Installation Guide for Mac Users (No Technical Knowledge Required)

This guide will walk you through setting up StudyLM on your Mac, even if you've never used Terminal or programming tools before.

### Step 1: Install Required Software

1. **Install Homebrew** (a package manager for Mac):
   - Open the "Terminal" application
     - Click on the magnifying glass (Spotlight) in the top-right corner of your screen
     - Type "Terminal" and press Enter when it appears
   - Copy and paste this command into Terminal, then press Enter:
     ```
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Follow any on-screen prompts
   - When it asks for your password, type your Mac login password (note: you won't see any characters appear as you type)
   - Wait for the installation to complete (this might take a few minutes)

2. **Install Node.js and Git** using Homebrew:
   - In the same Terminal window, copy and paste this command, then press Enter:
     ```
     brew install node git
     ```
   - Wait for the installation to complete

### Step 2: Download StudyLM from GitHub

1. **Download the application**:
   - Go to the top of this GitHub page
   - Click the green "Code" button
   - Select "Download ZIP"
   - Wait for the download to complete
   - Find the downloaded ZIP file (usually in your Downloads folder)
   - Double-click the ZIP file to extract it
   - The extracted folder will be named "studylm-main" - this is your StudyLM application

2. **Move the application folder** (optional):
   - If you want to store the application somewhere specific (like your Documents folder):
   - Open Finder and navigate to where the extracted "studylm-main" folder is located
   - Drag it to your preferred location (such as Documents)

### Step 3: Start the Application

1. **Open Terminal**:
   - Click on the magnifying glass (Spotlight) in the top-right corner
   - Type "Terminal" and press Enter

2. **Navigate to your StudyLM folder**:
   - Type `cd` followed by a space
   - Open Finder and find your StudyLM folder ("studylm-main")
   - Drag and drop your StudyLM folder into the Terminal window (this adds the folder path)
   - Press Enter

3. **Install dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish (this might take a few minutes)

4. **Start the server**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - Keep this Terminal window open while using the application

5. **Open a new Terminal window** (while keeping the first one running):
   - Press Command+N to open a new Terminal window
   - Navigate to the React app folder:
     - Type `cd` followed by a space
     - In Finder, click into your StudyLM folder, then into the "react-study-app" folder
     - Drag the "react-study-app" folder into Terminal
     - Press Enter

6. **Install React app dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish

7. **Start the React app**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - A browser window should automatically open to the application
   - If it doesn't open automatically, open Safari or any web browser and go to: http://localhost:3000

### Step 4: Using StudyLM

Now that the application is running:

1. **Upload your study materials**:
   - When you first open the app, you'll see a welcome screen
   - Click "Upload Study Materials" or drag and drop your files into the upload area
   - You can upload PDFs, Word documents, text files, PowerPoint files, or images containing text
   - Click "Upload and Process"
   - Wait for the AI to process your materials (this may take a few minutes depending on how many files you uploaded)

2. **Study with your generated guide**:
   - Once processing is complete, your interactive study guide will appear
   - Navigate through the units using the "Next Unit" and "Previous Unit" buttons
   - Click the "+" buttons to expand sections and see the content
   - Take quizzes to test your knowledge
   - Your progress is saved automatically

3. **To close the application**:
   - Close your browser window
   - Go to each Terminal window and press Command+C to stop the servers
   - You can close the Terminal windows

4. **To restart the application later**:
   - Repeat steps 3.1 through 3.7, but you can skip the installation steps (3.3 and 3.6)
   - Just navigate to the correct folders and run `npm start` in both Terminal windows

## Troubleshooting

### If you see an error about "port already in use":
- In Terminal, press Command+C to stop the current process
- Try a different port by typing:
  ```
  PORT=5002 npm start
  ```
  for the server, or
  ```
  PORT=3001 npm start
  ```
  for the React app

### If the application doesn't connect to the server:
- Make sure both Terminal windows are still running
- Try restarting both the server and the React app

### If files don't upload or process correctly:
- Try uploading fewer files at once
- Make sure your files are in a supported format (PDF, DOCX, TXT, PPT, JPG, PNG)

### If you can't find Terminal:
- Click on the magnifying glass icon in the top-right corner of your screen
- Type "Terminal" and press Enter
- If it's not found, look in Applications → Utilities → Terminal

## Need Help?

If you encounter any issues not covered in this guide, please:
1. Check the issue tracker on this GitHub page
2. Open a new issue if your problem hasn't been reported yet, with detailed information about your problem

## Privacy & Data

- All your study materials are processed securely
- Files are only sent to Google's Gemini AI for processing
- Your study data is stored locally on your computer, not on any remote servers