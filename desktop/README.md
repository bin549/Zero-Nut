# Posts Manager Desktop Application

A simple desktop application for managing posts in a JSON file.

## Features

- View all existing posts
- Add new posts with custom text and dates (defaults to current time)
- Edit existing posts to update content or dates
- Delete unwanted posts
- One-click sync to GitHub with automatic timestamp
- Automatic ID assignment for new posts
- Modern and clean user interface

## Installation

1. Clone this repository
2. Navigate to the desktop directory
3. Install dependencies with npm:

```bash
cd desktop
npm install
```

## Usage

To start the application in development mode:

```bash
npm start
```

To build the application:

```bash
npm run build
```

To package the application for macOS:

```bash
npm run pack
```

## GitHub Sync

The application supports syncing your posts.json file directly to GitHub with a single click:

1. Make sure your directory is a Git repository initialized with the proper remote
2. Click the "Sync to GitHub" button in the top navbar
3. Changes will be committed with an automatic timestamp and pushed to your repository

The commit message format is: `Update posts (YYYY-MM-DD_HH-MM-SS)`

Note: This feature requires that the directory already be a properly configured git repository with appropriate remote settings.

## File Structure

The application manages posts in the following JSON file:

```
src/data/tg/posts.json
```

This file contains an array of post objects, each with:
- `id`: Unique identifier for the post
- `date`: ISO format date string
- `text`: Content of the post
- `images`: Array of image URLs (currently not used)

## Development

This application is built with:
- Electron
- HTML/CSS/JavaScript

To modify the application, edit the following files:
- `index.js` - Main Electron process
- `index.html` - Main UI for post management

## License

ISC 