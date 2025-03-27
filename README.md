# StudyLM: AI-Powered Study Guide Generator

StudyLM helps you create interactive study guides from your learning materials. Upload your study materials, and the AI will organize them into structured units with quizzes to test your knowledge.

## Installation Guide for Complete Beginners

This guide will walk you through setting up StudyLM on your computer, even if you've never used a command line or coding tools before.

### Step 1: Install Required Software

#### For Windows Users:

1. **Install Node.js**:
   - Visit [Node.js download page](https://nodejs.org/)
   - Download the "LTS" (Long Term Support) version
   - Run the downloaded installer
   - Click "Next" through the installation prompts
   - Make sure "Automatically install the necessary tools" is checked
   - Complete the installation

2. **Install Git**:
   - Visit [Git download page](https://git-scm.com/download/win)
   - Download the latest version for Windows
   - Run the installer
   - Accept the default options through the installation
   - Click "Install"
   - When installation completes, click "Finish"

#### For Mac Users:

1. **Install Homebrew** (a package manager for Mac):
   - Open the "Terminal" application (find it in Applications → Utilities → Terminal)
   - Copy and paste this command, then press Enter:
     ```
     /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
     ```
   - Follow any on-screen prompts
   - When it asks for your password, type your Mac login password (it won't show as you type)

2. **Install Node.js and Git** using Homebrew:
   - In the same Terminal window, copy and paste this command, then press Enter:
     ```
     brew install node git
     ```
   - Wait for the installation to complete

### Step 2: Download StudyLM from GitHub

1. **Create a folder** to store StudyLM:
   - On Windows, open File Explorer, navigate to a location you want to store the app (like Documents), right-click and select "New" → "Folder". Name it "StudyLM".
   - On Mac, open Finder, navigate to where you want to store the app (like Documents), right-click and select "New Folder". Name it "StudyLM".

2. **Download the application**:
   - Go to the top of this GitHub page
   - Click the green "Code" button
   - Select "Download ZIP"
   - Save the ZIP file to your computer
   - Find the downloaded ZIP file and extract/unzip it:
     - On Windows: Right-click the ZIP file and select "Extract All..."
     - On Mac: Double-click the ZIP file
   - Move or copy all the extracted files into the "StudyLM" folder you created earlier

### Step 3: Set Up Your API Key

To use StudyLM, you need a free Google API key for the Gemini AI model:

1. **Get a Google AI Studio API key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account (or create one if needed)
   - Click "Create API Key"
   - Copy the API key (it looks like a long string of letters and numbers)

2. **Add your API key to the application**:
   - Inside your StudyLM folder, find the file called `.env` (it might be hidden)
   - If you can't see the file:
     - On Windows: In File Explorer, click "View" at the top and check "Hidden items"
     - On Mac: In Finder, press `Command+Shift+.` to show hidden files
   - Open the `.env` file with a text editor (like Notepad on Windows or TextEdit on Mac)
   - Find the line that says `GEMINI_API_KEY=` and replace everything after the equals sign with your copied API key
   - Save and close the file

### Step 4: Start the Application

#### For Windows Users:

1. **Open Command Prompt**:
   - Press the Windows key, type "cmd" and press Enter
   - Type `cd` followed by a space
   - Drag and drop your StudyLM folder into the Command Prompt window (this adds the folder path)
   - Press Enter

2. **Install dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish (this might take a few minutes)

3. **Start the server**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - Keep this window open while using the application

4. **Open a new Command Prompt window** (while keeping the first one running):
   - Press the Windows key, type "cmd" and press Enter
   - Navigate to the React app folder by typing:
     ```
     cd \path\to\your\StudyLM\react-study-app
     ```
     (replace "\path\to\your\" with the actual path to your StudyLM folder)
   - Or repeat the drag-and-drop process to get the full path, but add `\react-study-app` at the end

5. **Install React app dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish

6. **Start the React app**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - A browser window should automatically open to the application
   - If it doesn't open automatically, open your web browser and go to: http://localhost:3000

#### For Mac Users:

1. **Open Terminal**:
   - Open the Terminal application (Applications → Utilities → Terminal)
   - Type `cd` followed by a space
   - Drag and drop your StudyLM folder into the Terminal window (this adds the folder path)
   - Press Enter

2. **Install dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish (this might take a few minutes)

3. **Start the server**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - Keep this window open while using the application

4. **Open a new Terminal window** (while keeping the first one running):
   - Press Command+N to open a new Terminal window
   - Navigate to the React app folder by typing:
     ```
     cd /path/to/your/StudyLM/react-study-app
     ```
     (replace "/path/to/your/" with the actual path to your StudyLM folder)
   - Or repeat the drag-and-drop process to get the full path, but add `/react-study-app` at the end

5. **Install React app dependencies**:
   - Type the following command and press Enter:
     ```
     npm install
     ```
   - Wait for it to finish

6. **Start the React app**:
   - Type the following command and press Enter:
     ```
     npm start
     ```
   - A browser window should automatically open to the application
   - If it doesn't open automatically, open your web browser and go to: http://localhost:3000

### Step 5: Using StudyLM

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
   - Go to each Terminal/Command Prompt window and press Ctrl+C (or Command+C on Mac) to stop the servers
   - You can close the Terminal/Command Prompt windows

4. **To restart the application later**:
   - Follow steps 4.3 to 4.6 again to start both the server and the React app

## Troubleshooting

### If you see an error about "port already in use":
- In the Terminal/Command Prompt, press Ctrl+C (or Command+C on Mac) to stop the current process
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
- Make sure both Terminal/Command Prompt windows are still running
- Check that you've set up your API key correctly in the .env file
- Try restarting both the server and the React app

### If files don't upload or process correctly:
- Make sure your API key is valid
- Try uploading fewer files at once
- Make sure your files are in a supported format (PDF, DOCX, TXT, PPT, JPG, PNG)

## Need Help?

If you encounter any issues not covered in this guide, please:
1. Check the issue tracker on this GitHub page
2. Open a new issue if your problem hasn't been reported yet, with detailed information about your problem

## Privacy & Data

- All your study materials are processed securely
- Files are only sent to Google's Gemini AI for processing
- Your study data is stored locally on your computer, not on any remote servers