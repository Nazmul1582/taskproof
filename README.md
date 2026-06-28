# TaskProof - Smart Project & Task Collaboration System

A full-stack web application for teams to manage projects, tasks, members, and track work progress with role-based access control and real-time insights.

🔗 **Live App:** [taskproof-frontend.vercel.app](https://taskproof-frontend.vercel.app)

## Features

### Authentication & Role-Based Access
- User signup and login with email/password
- JWT-based secure session handling
- Demo login buttons (one-click as Admin / Project Manager / Team Member)
- Three roles with distinct permissions:
  - **Admin** — full system access, user management
  - **Project Manager** — create/manage projects, assign tasks
  - **Team Member** — update assigned tasks, view own workload

### Project Management
- Create, view, edit, and delete projects
- Fields: name, description, deadline, status (Active / Completed / On Hold)
- Project grid with search and status filtering
- Add/remove team members per project

### Task Management
- Create, edit, delete, and re-assign tasks
- Fields: title, description, assigned member, due date, priority (High/Medium/Low), status (To Do / In Progress / Completed)
- Task status workflow with quick-update dropdown
- View tasks by project, status, priority, or across all projects
- Duplicate title detection within the same project
- Prevent reassigning completed tasks

### Dashboard & Analytics
- KPI cards: total projects, total tasks, completed, pending, overdue
- Bar chart (tasks by priority) with gradient fill
- Pie chart (task status distribution) with inside labels
- Team workload summary table
- Upcoming deadlines and high-priority tasks
- Recent activity feed (last 5 activities)

### Team Collaboration
- Member workload view with per-member task counts
- Completion rate progress bars
- Team insights: top performer, most active, needs support
- Role-based team member management

### Search, Filtering & Sorting
- Search projects by name
- Search tasks by title or description
- Debounced search to reduce API calls
- Filter by project status, task status, priority, project
- Sort by latest created, nearest deadline, highest priority

### Notifications & Activity Log
- Real-time notification bell with unread count
- Auto-polling every 30 seconds
- Mark as read, mark all read, delete
- Automatic notifications on task assignment, completion, member addition
- Full activity log tracked across the system

### Additional Features
- Dark/Light mode with system preference detection (persisted)
- Responsive design (mobile-friendly sidebar)
- Task comments with add/delete
- File attachment upload UI (backend endpoint requires wiring)
- Custom 404 page

## Tech Stack

### Frontend
- **React 19** with **Vite 8**
- **Tailwind CSS v4** for styling
- **React Router v7** for routing
- **TanStack Query v5** for server state
- **Zustand v5** for client state (persisted)
- **Axios** for API calls
- **React Hook Form** + **Zod** for form validation
- **Recharts** for charts
- **Lucide React** for icons
- **React Hot Toast** for notifications

### Backend
- **Express 5** API server
- **Mongoose 9** with **MongoDB**
- **JWT** authentication (7-day tokens)
- **Zod v4** request validation
- **Bcryptjs** password hashing
- **Multer** file upload handling
- **Cloudinary** (configured for cloud storage)

## Project Structure

```
taskproof/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/database.js
│   │   │   ├── controllers/        # Route handlers
│   │   │   ├── middlewares/        # Auth, validation, error handling
│   │   │   ├── models/            # Mongoose schemas
│   │   │   ├── routes/            # Express routes
│   │   │   ├── validations/       # Zod schemas
│   │   │   ├── utils/             # JWT token generation
│   │   │   ├── app.js             # Express app setup
│   │   │   └── server.js          # Entry point
│   │   ├── uploads/
│   │   ├── .env.example
│   │   └── package.json
│   └── frontend/
│       ├── src/
│       │   ├── components/        # Reusable UI components
│       │   ├── pages/             # Route pages
│       │   ├── store/             # Zustand stores
│       │   ├── hooks/             # Custom hooks
│       │   ├── services/          # API service layer
│       │   ├── lib/               # Query client config
│       │   ├── App.jsx            # Router
│       │   ├── main.jsx           # Entry point
│       │   └── index.css          # Tailwind + theme
│       ├── index.html
│       ├── .env.example
│       └── package.json
├── render.yml
└── package.json                   # Monorepo root
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nazmul1582/taskproof.git
   cd taskproof
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Backend (`apps/backend/.env`):
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/taskproof?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_min_32_chars
   JWT_EXPIRE=7d
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   FRONTEND_URL=http://localhost:5173
   ```

   Frontend (`apps/frontend/.env`):
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Run the application**

   Start both backend and frontend in separate terminals:

   ```bash
   # Terminal 1 - Backend
   npm run dev:backend

   # Terminal 2 - Frontend
   npm run dev:frontend
   ```

   The app will be available at `http://localhost:5173`.

> **Live deployment:** [taskproof-frontend.vercel.app](https://taskproof-frontend.vercel.app)

## Demo Credentials

Click the **Demo Login** buttons on the login page to instantly log in as any role:

| Role | Pre-filled Demo |
|------|----------------|
| Admin | `admin@demo.com` |
| Project Manager | `pm@demo.com` |
| Team Member | `member@demo.com` |

Demo accounts are auto-created on first use.

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | Create account |
| `POST /api/auth/login` | Log in |
| `POST /api/auth/demo` | Demo login (send `{role}`) |
| `GET /api/projects` | List projects (paginated) |
| `POST /api/projects` | Create project |
| `GET /api/tasks` | List tasks (paginated, filterable) |
| `POST /api/tasks` | Create task |
| `PATCH /api/tasks/:id/status` | Update task status |
| `GET /api/dashboard/kpis` | Dashboard metrics |
| `GET /api/dashboard/charts` | Chart data |
| `GET /api/dashboard/workload` | Member workload |
| `GET /api/activities` | Activity log |
| `GET /api/notifications` | User notifications |

## Deployment

The project is configured for deployment on **Render**.

1. Push to GitHub
2. Create a new Web Service on Render
3. Set root directory to `apps/backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add environment variables (see `.env.example`)

The `render.yml` file contains the deployment configuration.

## Environment Variables

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Environment mode |
| `PORT` | Yes | Server port |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_EXPIRE` | No | Token expiry (default: 7d) |
| `FRONTEND_URL` | Yes | CORS allowed origin |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API base URL |

## License

ISC

## Author

**Md. Nazmul Hasan**
