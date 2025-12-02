# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/290b80e4-ce28-463f-843c-9cb9cf72b62e

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/290b80e4-ce28-463f-843c-9cb9cf72b62e) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/290b80e4-ce28-463f-843c-9cb9cf72b62e) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## Setting Up Admin Access

To create elections, you need to have admin role assigned to your user account. Here's how to set it up:

### Option 1: Using Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the following SQL query (replace `YOUR_USER_EMAIL` with your actual email):

```sql
-- First, get your user ID from auth.users
-- Replace 'YOUR_USER_EMAIL' with your actual email address
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'YOUR_USER_EMAIL'
ON CONFLICT (user_id, role) DO NOTHING;
```

### Option 2: Using Supabase Dashboard

1. Go to Authentication > Users in your Supabase dashboard
2. Find your user and copy the User UID
3. Go to Table Editor > user_roles
4. Insert a new row with:
   - `user_id`: Your User UID
   - `role`: `admin`

### Troubleshooting

If you're unable to create elections:

1. **Check browser console** - Open Developer Tools (F12) and check the Console tab for error messages
2. **Verify admin role** - Check if your user has an entry in the `user_roles` table with `role = 'admin'`
3. **Check RLS policies** - Ensure Row Level Security policies are correctly set up in your database
4. **Verify authentication** - Make sure you're logged in and your session is valid

The create election function will now show detailed error messages to help diagnose issues.