# EzGrad

A web application that helps students track their degree progress by scraping course requirements from university catalogs and providing an intuitive interface to search and select degree programs.

## Features

- **Degree Program Search** - Autocomplete search to find your degree program
- **Course Scraping** - Automatically scrapes course requirements from RSU catalog
- **User Authentication** - Login and registration system
- **REST API** - Flask backend serving degree and course data

## Project Structure

```
EzGrad/
├── backend/
│   ├── api/
│   │   └── routes/
│   │       └── courses.py      # Flask API endpoints
│   ├── data/
│   │   └── degree_courses.json # Cached course data
│   ├── db/
│   │   └── userdata.db         # User database
│   ├── services/
│   │   └── scraper.py          # Web scraping logic
│   └── tests/
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── landing-page.js  # Degree selection component
│       │   ├── landing-page.css
│       │   ├── login.js         # Login/Register component
│       │   └── Login.css
│       ├── index.js
│       └── index.css
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.x
- Node.js & npm
- pip

### Backend Setup

1. Install Python dependencies:

   ```bash
   pip install flask flask-cors requests beautifulsoup4
   ```

2. Start the Flask API server:
   ```bash
   cd backend/api/routes
   python courses.py
   ```
   The API will run on `http://localhost:5000`

### Frontend Setup

1. Install Node dependencies:

   ```bash
   cd frontend
   npm install
   ```

2. Start the React development server:
   ```bash
   npm start
   ```
   The app will run on `http://localhost:3000`

## API Endpoints

| Method | Endpoint       | Description                                             |
| ------ | -------------- | ------------------------------------------------------- |
| GET    | `/api/degrees` | Returns list of all degree program names                |
| GET    | `/api/courses` | Returns all degree programs with their required courses |

## Tech Stack

- **Frontend:** React.js
- **Backend:** Flask (Python)
- **Database:** SQLite
- **Web Scraping:** BeautifulSoup4, Requests

## Team

CodingCats

## License

This project is for educational purposes.
