import type { Metadata } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";
import { AuthProvider } from "@/components/auth/auth-provider";
import { SiteHeader } from "@/components/layout/site-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "MediCRM",
  description: "Modern healthcare CRM",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let userRole: string | null = null;
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    userRole = userData?.role ?? null;
  }

  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} min-h-screen bg-background font-sans antialiased`}>
        <AuthProvider>
          <SiteHeader userRole={userRole} />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
