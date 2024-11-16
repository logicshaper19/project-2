# DealFinder AI

## Project Structure
```
dealfinder/
├── frontend/           # React frontend
│   ├── src/           # Frontend source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Python backend
│   ├── app/          # FastAPI application
│   ├── api/          # API routes and models
│   ├── scraper/      # Deal scraping logic
│   ├── alembic/      # Database migrations
│   └── requirements.txt
└── package.json      # Root package.json for project scripts
```

## Setup Instructions

1. Install dependencies:
```bash
npm run install:all
pip install -r backend/requirements.txt
```

2. Set up the database:
```bash
npm run setup:db
```

3. Start the development servers:
```bash
# In one terminal:
npm run dev:frontend

# In another terminal:
npm run dev:backend
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000