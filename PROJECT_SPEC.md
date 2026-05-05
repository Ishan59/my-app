# Project Specification: Notes & Checklists Web App

## Overview

A modern web application enabling users to create, manage, and edit personal notes, checklists, and add voice-based text notes via speech-to-text. The app supports user authentication and provides a clean, responsive user experience. Built with Next.js, Supabase, and Tailwind CSS, and intended for seamless deployment on Vercel.

---

## Goals

- Provide a simple, intuitive interface for taking notes, creating checklists, and adding text notes via voice (speech-to-text).
- Allow users to register, log in, and securely manage their own notes.
- Ensure data persistence and real-time updates via Supabase.
- Utilize a responsive UI for mobile and desktop access.

---

## Stack

- **Frontend**: Next.js (React)
- **Backend/Database**: Supabase (PostgreSQL, Auth, and Realtime)
- **Styling**: Tailwind CSS
- **Speech-to-Text**: Web Speech API (or a suitable browser-based speech recognition library)
- **Deployment**: Vercel

---

## Core Features

1. **User Authentication**
   - Sign up, log in, and log out functionality.
   - Only authenticated users can access and manage notes/checklists.
   - Supabase Auth (email/password, extensible to OAuth providers).

2. **Notes Management**
   - Create a new note with a title and content, optionally input via voice using speech-to-text.
   - Edit and update existing notes, including the ability to add or update content with speech-to-text.
   - View a list of all previously created notes.
   - Delete notes.

3. **Checklists Management**
   - Create checklists (with title).
   - Add, toggle, edit, or remove checklist items.
   - View, edit, and delete existing checklists.

4. **Voice Note Entry**
   - Add notes by dictating through the microphone using speech-to-text.
   - Option to convert spoken words directly into note content when creating or editing a note.
   - Clear visual indication of when the app is “listening” for speech input.
   - Accessibility support for hands-free note taking.

5. **User Experience**
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
  - `content`: Text (includes text entered manually or via speech-to-text)
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
- `/notes/[id]` : View/Edit a specific note (including speech-to-text for editing)
- `/checklists/[id]` : View/Edit a specific checklist
- `/notes/new` : Create note (with speech-to-text option)
- `/checklists/new` : Create checklist

---

## UI Components

- Auth forms (login, signup)
- Notes list and editor (including voice input controls)
- Checklist list and editor (with item toggle/edit)
- Navigation bar/user menu
- Voice note capture button and microphone activity indicators
- Responsive layout components
- Toasts or notifications on user actions

---

## Security & Privacy

- Data access restricted to authenticated users via Supabase RLS.
- User authentication tokens stored securely (e.g., HttpOnly cookies or NextAuth session if extended).
- If voice data or processing is not strictly browser-based, inform users regarding privacy of transcriptions.

---

## Deployment

- **Vercel**: For automatic CI/CD and hosting.
- **Environment Variables**: Supabase URL and Anon Key managed via Vercel dashboard/environment.

---

## Milestones

1. **Project setup**: Next.js, Tailwind CSS, Supabase SDK.
2. **Supabase schema & RLS**: Design tables, enable secure policies.
3. **Authentication UI & logic**.
4. **Notes CRUD (with initial text and speech-to-text entry support)**.
5. **Checklists CRUD (+ item management)**.
6. **Speech-to-text user interface and integration**.
7. **Styling & Responsive UI**.
8. **Testing, Deployment, and Polishing.**

---

## Stretch Goals

- Tagging or categorization for notes.
- Search & filtering.
- Sharing notes/checklists (if allowed by privacy constraints).
- Offline support (PWA enhancements).
- Voice notes playback (text-to-speech).
- Support for multiple languages in speech recognition.

---