# Auth Handling in Next.js with Supabase (Server/Client Separation)

Below is a concise reference for handling authentication in our Next.js App Router setup with Supabase, illustrating the separation of server logic (server actions + Supabase server client) and client logic (React components + Supabase browser client). This structure ensures best practices for performance, security, and maintainability.

---

## 1. Folder Structure

Here’s an example directory layout for an “auth” flow, demonstrating both server and client usage (showing only the file structure, without code):

• app/  
 └── (auth)  
    ├── login/  
    │   ├── page.tsx  
    │   ├── actions.ts  
    │   └── login-form.tsx  
    └── signup/  
        ├── page.tsx  
        ├── actions.ts  
        └── signup-form.tsx  
• lib/  
 ├── supabase/  
 │   ├── server.ts  
 │   └── client.ts  

The key point is that any server-specific logic (like server actions) must import and use the **“server”** Supabase client, while **client** components should import and use the **“browser”** Supabase client.

---

## 2. Supabase Server Client

In `server.ts`, we create the Supabase client for server usage. This file includes:

1. A function that imports and configures the Supabase server client library.  
2. Uses Next.js server headers/cookies.  
3. Throws an error if environment variables are missing.  

Use this function in server components or server actions only.

---

## 3. Supabase Browser Client

For client components, use the “browser” client, which persists sessions in local storage. This file, `client.ts`, includes:

1. A check to confirm environment variables are present.  
2. A function to create the browser-based Supabase client, enabling session persistence.  
3. An exported singleton instance to use across client components for convenience.

---

## 4. Server Actions (actions.ts)

Server actions live in the same directory as the page component, but should import the server client. This pattern keeps your business logic isolated from the page UI components.

1. Contain the “`use server`” directive at the top.  
2. Import the **server** Supabase client creation function.  
3. Handle form data, call Supabase Auth methods, and handle revalidation or redirects as needed.

Example:
```ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Perform sign in
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    // Handle error, redirect or return a message
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  // Optionally revalidate paths that depend on auth
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signUpUser(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) {
    redirect('/error?message=' + encodeURIComponent(error.message))
  }

  // Typical flow: assign a default role or create a user record in a table
  // revalidate or redirect
  redirect('/patient')
}
```

---

## 5. Page Component (page.tsx)

The page component typically:

1. Imports the server actions defined in `actions.ts`.  
2. Renders the client form or other UI elements.  
3. Optionally calls the server actions via form actions, or passes them as props to the client form.

Because the server actions run on the server, you should not place them inside your client component.

Example:
```tsx
import { loginUser, signUpUser } from './actions'
import { LoginForm } from './login-form'

export default function LoginPage() {
  return (
    <div className="max-w-sm mx-auto">
      {/* You can place the custom <LoginForm /> here, or inline the form */}
      <LoginForm
        loginAction={loginUser}
        signupAction={signUpUser}
      />
    </div>
  )
}
```

---

## 6. Client Form Component (login-form.tsx)

A client-side form component:

1. Imports the **browser** client only if necessary, or receives server actions as props from the page.  
2. Manages local state (loading, errors, etc.) via React.  
3. Submits a `FormData` object to a server action when the user interacts with the form.

The actual UI of the login form is a client component (so it can handle states, errors, UI events). 
It can reference server actions as props. For custom validations, you might use Zod or React Hook Form. Here’s a basic example:

```tsx
'use client'

import { FormEvent, useState } from 'react'

interface LoginFormProps {
  loginAction: (formData: FormData) => Promise<void>
  signupAction: (formData: FormData) => Promise<void>
}

export function LoginForm({ loginAction, signupAction }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
    actionFn: (data: FormData) => Promise<void>
  ) {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      await actionFn(formData)
    } catch (error) {
      console.error('Login/Signup Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={(e) => handleSubmit(e, loginAction)}
      className="flex flex-col space-y-4"
    >
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" required className="input" />

      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" required className="input" />

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Log In'}
      </button>

      {/* For signup, you can provide a separate button that triggers the signUpUser action */}
      <button
        type="button"
        onClick={(e) => handleSubmit(e as unknown as FormEvent<HTMLFormElement>, signupAction)}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

---

## 7. Summary of Key Points

1. **Server Logic**  
   • Use server actions with “`use server`.”  
   • Import and use the **server** Supabase client for Auth and data operations.  
   • Revalidate or redirect on the server as needed.

2. **Client Logic**  
   • Write your UI in client components.  
   • Use the **browser** Supabase client for anonymous reads or real-time features.  
   • Manage local component state, handle user input, and gracefully handle errors.

3. **Clear Separation**  
   • Keep server logic and client logic separate.  
   • Use form actions or pass server functions into client components as needed.  

Following these guidelines ensures a secure and maintainable approach to handling authentication with Supabase in a Next.js (App Router) project.