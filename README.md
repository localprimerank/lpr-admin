# LPR Agency Admin Panel

Next.js admin panel for content management (separate repository).

## Features

- Dashboard with analytics overview
- CRUD operations for all content types
- Image upload via Cloudinary
- Authentication with JWT
- Responsive design

## Setup

```bash
npm install
npm run dev  # Development: http://localhost:3002
```

## Project Structure

```
admin/
├── app/
│   ├── layout.js
│   ├── page.js                   # Dashboard
│   ├── login/page.js             # Admin login
│   ├── services/
│   │   ├── page.js               # Services list
│   │   └── [id]/page.js          # Edit service
│   ├── blogs/
│   │   ├── page.js               # Blogs list
│   │   └── [id]/page.js          # Edit blog
│   ├── projects/
│   │   ├── page.js               # Projects list
│   │   └── [id]/page.js          # Edit project
│   ├── clients/
│   │   └── page.js               # Clients management
│   ├── skills/
│   │   └── page.js               # Skills management
│   ├── testimonials/
│   │   └── page.js               # Testimonials management
│   ├── contacts/
│   │   └── page.js               # Contact submissions
│   └── settings/
│       └── page.js               # Site settings
├── components/
│   ├── layout/
│   │   ├── Sidebar.js            # Navigation sidebar
│   │   └── Header.js             # Top header
│   └── ui/
│       ├── DataTable.js          # Reusable table
│       └── FormFields.js         # Form inputs
├── lib/
│   └── api.js                    # API client
└── middleware.ts                 # Auth middleware
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
BACKEND_API_URL=https://your-backend-url.com
NEXT_PUBLIC_ADMIN_URL=http://localhost:3002
```

Use `NEXT_PUBLIC_API_URL` for direct browser calls to the backend API. If you leave it unset, the admin uses `/backend-api/*` and `BACKEND_API_URL` to proxy requests through the admin deployment.

## Authentication

### Login Flow
1. POST `/api/auth/login` with email/password
2. Store JWT in httpOnly cookie
3. Redirect to dashboard

### Protected Routes
All admin routes use middleware to verify JWT token:

```javascript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthPage = request.nextUrl.pathname === '/login';
  
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

## API Client

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  login: (credentials) => fetch(`${API_URL}/auth/login`, { /* ... */ }),
  getServices: () => fetch(`${API_URL}/services`),
  createService: (data) => fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  updateService: (id, data) => fetch(`${API_URL}/services/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }),
  deleteService: (id) => fetch(`${API_URL}/services/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  }),
  // Similar for blogs, projects, clients, skills, testimonials, contacts, hero
};
```

## Content Management Pages

### Services Management
- Fields: title, price, features (array), image, buttonText
- Drag-drop reordering

### Blogs Management
- Fields: title, excerpt, content (rich text), category, image, date, readTime, published

### Projects Management
- Fields: title, desc, type, tags, img, accent, published

### Clients Management
- Fields: name, logo, website

### Skills Management
- Fields: title, description, icon

### Testimonials Management
- Fields: name, role, avatar, text, stars

### Contact Submissions
- View all submissions
- Mark as read/replied
- Export to CSV

## UI Components

### DataTable
Reusable table with:
- Search & filtering
- Pagination
- Actions (edit/delete)
- Bulk operations

### FormFields
Standardized inputs:
- TextField
- TextArea
- Select
- MultiSelect
- ImageUpload
- Toggle (for published status)

## Deployment

Deploy separately from frontend:
```bash
npm run build
npm run start
```

Set environment variables in hosting platform.
