# MenuGen

MenuGen is a full-stack application that transforms menu images into stunning visual representations using AI technology.

## Features

- 📸 **Photo Upload**: Take photos, upload from library, or choose files
- 🤖 **AI Processing**: Uses OpenAI's GPT-4 Vision and DALL-E 3 to analyze menus and generate food images
- 📱 **Responsive Design**: Works seamlessly on mobile and desktop
- ⚡ **Real-time Processing**: Live progress indicators during AI processing

## Project Structure

```
menugen-1/
├── frontend/          # React/Vite frontend application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js backend API
│   ├── index.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## Setup Instructions

### Frontend (React/Vite)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Configure the API URL in `public/config.js`:
   ```javascript
   window.config = {
     apiUrl: 'http://localhost:3001'
   };
   ```

### Backend (Express.js)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/process-menu` - Process menu image and generate visualizations

## Environment Variables

### Backend
- `PORT`: Server port (default: 3001)
- `OPENAI_API_KEY`: Your OpenAI API key (optional, can be provided via frontend)

## Deployment

### Frontend
- Build pack: React
- Node version: 20
- Build command: `npm install && npm run build`
- Output directory: `dist`

### Backend
- Build pack: Node.js
- Language version: 20.x.x
- Start command: `npm start`

## Technologies Used

- **Frontend**: React, Vite, Lucide React (icons)
- **Backend**: Express.js, Multer, OpenAI API, CORS
- **AI Services**: OpenAI GPT-4 Vision, DALL-E 3

## License

MIT License
