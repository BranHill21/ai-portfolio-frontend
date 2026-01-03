# StockfolioAI Frontend

[Link to Backend](https://github.com/BranHill21/ai-portfolio-backend)
[Link to ML service](https://github.com/BranHill21/ai-portfolio-mlservice)

StockfolioAI is a modern, full-stack investment analytics application that brings institution-grade predictive insights, automated asset tracking, and financial reasoning to individual users.

This repository contains the React frontend, which serves as the primary user interface for authentication, asset management, and predictive modeling visualization.

The frontend is built with React, React Router, CSS Modules, and a custom dark theme inspired by Apple’s design language.

It integrates with a Spring Boot backend and communicates with a Python machine learning inference API.

This README describes the application’s architecture, required environment variables, setup instructions, and production deployment considerations.

The frontend is currently hosted through Netlify at stockfolioai.netlify.app

Feel free to check it out and provide your user input as it helps improve website for everyone.

## Table of Contents
1.	Project Overview
2.	Features
3.	Technology Stack
4.	File Structure
5.	Environment Variables
6.	Running Locally
7.	Building for Production
8.	Deployment Considerations
9.	API Routes Used by the Frontend
10.	Styling and Theming Notes
11.	Additional Development Notes
12.	License



### 1. Project Overview

StockfolioAI provides market insights generated from machine learning models trained on both long-term and short-term financial indicators.
Users can create an account, log in, register assets they hold, and receive predictions and reasoning from the analytics engine.

The frontend handles:
•	User authentication and session persistence
•	Asset CRUD operations (create, read, update, delete)
•	Predictive model interactions and data visualization
•	Multi-page navigation
•	Responsive UI rendering
•	Apple-inspired dark mode styling
•	Dynamic page behavior based on route and user state

The application is intended to be deployed as a full production system consisting of:
•	React frontend (this repository)
•	Spring Boot backend (authentication + asset management)
•	Python/ML backend (prediction engine)

### 2. Features

User Authentication
•	Login, registration, and persistent sessions via localStorage.
•	Protected routes for dashboard and insights pages.

Asset Management
•	Add, update, delete, and view tracked assets.
•	Pagination and search tools built in.
•	Table-based asset interface with modal editing.

Predictive Analytics
•	Full and short predictions for stocks/crypto.
•	Real-time request to ML API endpoint on insights page.
•	Mode selection based on route parameters and user interaction.
•	Display of reasoning, sentiment, short-term forecast, long-term forecast, and technical indicators.

Routing
•	Dynamic routes for /insights/:symbol?.
•	Conditional auto-prediction based on navigation source.

Styling
•	Clean dark theme modeled after modern Apple aesthetics.
•	Fully modular CSS using CSS Modules.
•	Mobile-friendly responsive design.

### 3. Technology Stack

Frontend
•	React 18
•	React Router DOM
•	Axios for HTTP requests
•	CSS Modules for styling
•	React Bootstrap (only for modal components, gradually reduced)

Backend Integration

The frontend expects two backend services:
1. Spring Boot API
        Used for users, authentication, and asset CRUD.
2. Python ML Inference API
        Used for predictions and reasoning output.

The URLs for both are configurable via environment variables.

### 4. File Structure

A representative structure:

src/
  api/
    index.js                # Axios configuration
  components/
    NavBar/
      NavBar.jsx
      NavBar.module.css
    ...
  pages/
    Login/
      LoginPage.jsx
      LoginPage.module.css
    Register/
      RegisterPage.jsx
      RegisterPage.module.css
    Dashboard/
      Dashboard.jsx
      Dashboard.module.css
    Insights/
      Insights.jsx
      Insights.module.css
  hooks/
  assets/
  App.js
  index.js

### 5. Environment Variables

The frontend requires the following environment variables, placed in a .env file at the root of the project.

REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_PREDICT_BASE_URL=http://localhost:8080

Explanation:
	•	REACT_APP_API_BASE_URL
        URL for the Spring Boot backend.
	•	REACT_APP_PREDICT_BASE_URL
        URL for the Python ML prediction backend.

All environment variables must begin with REACT_APP_ for Create React App to load them.

### 6. Running Locally

Prerequisites

Install the following:
	•	Node.js 18+
	•	npm or yarn
	•	Access to the backend APIs described above

Steps
1.	Clone the repository
```
    git clone https://github.com/yourusername/yourrepo.git
    cd yourrepo
```
2.	Install dependencies
```
    npm install
```
3.	Create .env file

```
REACT_APP_API_BASE_URL=http://localhost:5000
REACT_APP_PREDICT_BASE_URL=http://localhost:8080
```

4.	Start development server
```
    npm start
```

The frontend will run on http://localhost:3000.

The application requires both backend services to be running in parallel for full functionality.

### 7. Building for Production

To generate a production build:

`npm run build`

This outputs an optimized build/ directory.

Production Build Includes:
	•	Minified and tree-shaken JavaScript
	•	Hashed asset filenames for long-term caching
	•	Optimized CSS Modules
	•	Stripped development warnings
	•	Public folder assets copied into the root of the build

This output can be deployed to:
	•	Netlify
	•	Vercel
	•	AWS Amplify
	•	GitHub Pages
	•	Nginx or Apache
	•	Any static hosting service

⸻

### 8. Deployment Considerations

CORS

Ensure both backends allow requests from the deployed frontend origin.

Environment Variables

In production hosting platforms (Netlify, Vercel), environment variables must be configured through dashboard settings.

Routing

If using Netlify or static hosting, include the following public/_redirects:

/*    /index.html   200

This enables React Router to handle client-side navigation.

⸻

### 9. API Routes Used by the Frontend

User Routes

POST /api/users/login
POST /api/users/register

Asset Routes

GET    /api/assets/:userId
POST   /api/assets/create
PUT    /api/assets/update/:assetId
DELETE /api/assets/delete/:assetId

Prediction Routes

Provided by the ML backend:

POST /predict
POST /predict/simple

Payload typically includes:

`{
  "symbol": "AAPL",
  "buyPrice": 150.23,
  "quantity": 10
}`

### 10. Styling and Theming Notes
•	Entire UI uses custom CSS Modules for page-level styling.
•	Global theme follows an Apple-inspired dark mode design.
•	Typography, spacing, and shadows are consistent across pages.
•	Components like the navbar, login page, register page, dashboard, and insights page each have their own isolated CSS modules.
•	React Bootstrap modals are overridden with custom CSS for dark mode appearance.
•	No inline styles are used except for layout exceptions that require dynamic calculation.

### 11. Additional Development Notes

Code Style
•	Written in functional components with React Hooks.
•	Avoids legacy lifecycle methods.
•	Uses Axios instances for clean API calls.
•	Ensures persistent authentication via localStorage.

Prediction Behavior
•	When navigating from the dashboard, the insights page automatically triggers the backend prediction.
•	When navigating manually via navbar, predictions do not trigger until the user submits the form.
•	Route parsing is used to extract symbol, buyPrice, and quantity parameters.

Future Improvements
•	Transition remaining Bootstrap components to fully custom components.
•	Add chart animations and transitions.
•	Implement more advanced caching for prediction results.
•	Add portfolio-level insight aggregation.
