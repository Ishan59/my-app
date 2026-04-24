# Project Specification: Notes & Checklists Web App

## Overview

A modern web application enabling users to create, manage, and edit personal notes and checklists. The app supports user authentication and provides a clean, responsive user experience. Built with Next.js, Supabase, and Tailwind CSS, and intended for seamless deployment on Vercel.

---

## Goals

- Provide a simple, intuitive interface for taking notes and creating checklists.
- Allow users to register, log in, and securely manage their own notes.
- Ensure data persistence and real-time updates via Supabase.
- Utilize a responsive UI for mobile and desktop access.

---

## Stack

- **Frontend**: Next.js (React)
- **Backend/Database**: Supabase (PostgreSQL, Auth, and Realtime)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

---

## Core Features

1. **User Authentication**
   - Sign up, log in, and log out functionality.
   - Only authenticated users can access and manage notes/checklists.
   - Supabase Auth (email/password, extensible to OAuth providers).

2. **Notes Management**
   - Create a new note with a title and content.
   - Edit and update existing notes.
   - View a list of all previously created notes.
   - Delete notes.

3. **Checklists Management**
   - Create checklists (with title).
   - Add, toggle, edit, or remove checklist items.
   - View, edit, and delete existing checklists.

4. **User Experience**
   - Responsive design for desktop and mobile.
   - Clean, modern UI with Tailwind CSS.
   - Loading and empty states.

---

## Data Model

**Users:** Managed by Supabase Auth.

**Tables:**
- `notes`
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key to auth.users)
  - `title`: Text
  - `content`: Text
  - `created_at`: Timestamp
  - `updated_at`: Timestamp

- `checklists`
  - `id`: UUID (Primary Key)
  - `user_id`: UUID (Foreign Key)
  - `title`: Text
  - `created_at`: Timestamp

- `checklist_items`
  - `id`: UUID (Primary Key)
  - `checklist_id`: UUID (Foreign Key)
  - `content`: Text
  - `checked`: Boolean
  - `created_at`: Timestamp

**Security**: Row-level security (RLS) policies restrict access to users’ own notes/checklists.

---

## Key Pages / Routes

- `/` : Dashboard / home (list notes & checklists, quick access to create new)
- `/login` : Login/Signup
- `/notes/[id]` : View/Edit a specific note
- `/checklists/[id]` : View/Edit a specific checklist
- `/notes/new` : Create note
- `/checklists/new` : Create checklist

---

## UI Components

- Auth forms (login, signup)
- Notes list and editor
- Checklist list and editor (with item toggle/edit)
- Navigation bar/user menu
- Responsive layout components
- Toasts or notifications on user actions

---

## Security & Privacy

- Data access restricted to authenticated users via Supabase RLS.
- User authentication tokens stored securely (e.g., HttpOnly cookies or NextAuth session if extended).

---

## Deployment

- **Vercel**: For automatic CI/CD and hosting.
- **Environment Variables**: Supabase URL and Anon Key managed via Vercel dashboard/environment.

---

## Milestones

1. **Project setup**: Next.js, Tailwind CSS, Supabase SDK.
2. **Supabase schema & RLS**: Design tables, enable secure policies.
3. **Authentication UI & logic**.
4. **Notes CRUD**.
5. **Checklists CRUD (+ item management)**.
6. **Styling & Responsive UI**.
7. **Testing, Deployment, and Polishing.**

---

## Stretch Goals

- Tagging or categorization for notes.
- Search & filtering.
- Sharing notes/checklists (if allowed by privacy constraints).
- Offline support (PWA enhancements).

---