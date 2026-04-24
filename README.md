# Notes & Checklists Web App

A modern web application built with **Next.js**, **Supabase**, and **Tailwind CSS** for creating, editing, and managing your notes and checklists. 

## Features

- **User Authentication:** Create an account and securely log in/out.
- **Notes:** Create, view, edit, and delete multiple personal notes.
- **Checklists:** Create, manage, and delete checklists for any task.
- **Responsive Design:** Looks great on desktop and mobile.
- **Modern UI:** Styled with Tailwind CSS for a clean, intuitive experience.
- **Realtime & Secure:** Data is persisted and secured in Supabase.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- Supabase project & API keys

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure environment variables**

   Create a `.env.local` file in the root directory:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Replace with your Supabase project's credentials.

4. **Start the development server**
   ```bash
   yarn dev
   # or
   npm run dev
   ```

   The app will be running at **http://localhost:3000**

## Project Structure

- `pages/` — Next.js pages (routes)
- `lib/` — Helper libraries, including Supabase client setup
- `components/` — React UI components
- `styles/` — Tailwind CSS configuration

## Supabase Setup

1. Create a [Supabase](https://supabase.com/) project.
2. Set up authentication (Email/Password enabled).
3. Create tables for `notes` and `checklists` with relevant columns (e.g., title, content, user_id, created_at).
4. [Optional] Add Row-level security (RLS) policies so users only access their own data.

## Customization

- Tweak Tailwind styles in `tailwind.config.js`
- Extend functionality with new features like reminders or tags

## License

MIT

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)