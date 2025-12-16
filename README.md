# Dynamic Template Builder & Preview System

A full-stack application for creating dynamic templates (like invitation cards) using pre-built React components, populating them with data, and previewing the results.

## Tech Stack

- **Frontend**: React 18+ with TypeScript, Tailwind CSS, Zustand
- **Backend**: Node.js with Express.js, TypeScript
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: MongoDB GridFS

## Features

### Component Library
- Text blocks (headings, paragraphs with configurable fonts, sizes, colors)
- Image placeholders (with aspect ratio controls)
- Layout containers (flex, grid with spacing controls)
- Decorative elements (borders, dividers, shapes)
- Custom components (QR codes, date/time displays)

### Template Builder
- Drag-and-drop visual editor
- Component palette sidebar
- Real-time canvas preview
- Layer management (z-index control)
- Responsive preview modes (mobile, tablet, desktop)
- Variable placeholders for dynamic data (e.g., {{guestName}}, {{eventDate}})

### Template Preview System
- Real-time preview with actual data
- Variable interpolation
- Export options (PNG, HTML)
- Responsive preview modes

### Admin Management
- Template CRUD operations
- Media library with upload/search
- JWT authentication

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Shrishail20/devin.git
cd devin
```

2. Set up the backend:
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

3. Set up the frontend:
```bash
cd frontend/template-builder-frontend
cp .env.example .env
npm install
npm run dev
```

4. Open http://localhost:5173 in your browser

### Docker Setup

1. Create a `.env` file in the root directory:
```bash
JWT_SECRET=your-super-secret-jwt-key
```

2. Run with Docker Compose:
```bash
docker-compose up -d
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - Register new admin
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Templates
- `POST /api/templates` - Create new template
- `GET /api/templates` - List all templates (with pagination, filters)
- `GET /api/templates/:id` - Get single template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/templates/:id/duplicate` - Duplicate template
- `POST /api/templates/:id/publish` - Publish template
- `POST /api/templates/:id/preview` - Generate preview with data
- `POST /api/templates/:id/instances` - Create template instance

### Template Instances
- `GET /api/instances/:id` - Get instance with rendered output
- `GET /api/instances/:id/export` - Export as HTML

### Media
- `POST /api/media/upload` - Upload media files
- `GET /api/media` - List media library
- `GET /api/media/:id` - Get media file info
- `DELETE /api/media/:id` - Delete media
- `GET /api/media/serve/:filename` - Serve media file

### Components
- `GET /api/components` - List available components with schemas
- `GET /api/components/categories` - List component categories

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/template-builder
JWT_SECRET=your-super-secret-jwt-key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database and GridFS configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Auth, error handling, file upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities and component schemas
│   │   └── app.ts          # Express app entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   └── template-builder-frontend/
│       ├── src/
│       │   ├── components/
│       │   │   ├── auth/       # Login/Register forms
│       │   │   ├── builder/    # Canvas, palettes, panels
│       │   │   ├── layout/     # Header, protected routes
│       │   │   ├── media/      # Media library
│       │   │   └── template/   # Renderable components
│       │   ├── pages/          # Page components
│       │   ├── services/       # API client
│       │   ├── stores/         # Zustand stores
│       │   ├── types/          # TypeScript types
│       │   └── App.tsx         # Main app with routing
│       ├── Dockerfile
│       └── package.json
│
├── docker-compose.yml
└── README.md
```

## Component Types

| Type | Description | Props |
|------|-------------|-------|
| text | Text block | content, fontSize, fontWeight, fontFamily, textAlign, color |
| heading | Heading (h1-h6) | content, level, fontFamily, textAlign, color |
| image | Image with aspect ratio | src, alt, objectFit, borderRadius |
| container | Layout container | display, flexDirection, justifyContent, alignItems, gap, backgroundColor |
| divider | Horizontal/vertical line | orientation, thickness, color, style |
| shape | Rectangle/circle/ellipse | shape, backgroundColor, borderColor, borderWidth, borderRadius |
| qrcode | QR code generator | value, size, fgColor, bgColor |
| datetime | Date/time display | value, format, fontSize, fontFamily, color |

## Variable Interpolation

Use `{{variableName}}` syntax in component props to create dynamic templates:

```json
{
  "type": "text",
  "props": {
    "content": "Hello, {{guestName}}!"
  }
}
```

Then provide data when previewing:
```json
{
  "guestName": "John Doe"
}
```

## License

MIT
