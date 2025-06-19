
"use client";

import Header from "@/components/Header";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (!isAuthorized) {
        router.replace('/unauthorized');
      }
    }
  }, [user, loading, isAuthorized, router]);

  if (loading || !user || !isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground border-t">
         <p>&copy; {currentYear || new Date().getFullYear()} Gatedocs. All rights reserved.</p>
      </footer>
    </div>
  );
}
