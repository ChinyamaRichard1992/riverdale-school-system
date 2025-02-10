# Riverdale Academy School Management System

A comprehensive school management system with cross-device data synchronization using Supabase.

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure Supabase:
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Update the values in `supabase-config.js`

3. Run the application:
   - Open work.html in your browser
   - The system will automatically sync data across devices using Supabase

## Deployment

The system is configured for deployment on Netlify:

1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Configure the following environment variables in Netlify:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

## Features

- Cross-device data synchronization
- Student management
- Employee management
- Payroll system
- Real-time updates
- Offline support with IndexedDB
- Automatic data backup
