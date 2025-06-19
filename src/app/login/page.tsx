
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Github, BookLock } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { signInWithGitHub, loading, user, isAuthorized } = useAuth();
  const router = useRouter();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  useEffect(() => {
    if (!loading && user && isAuthorized) {
      router.replace('/docs');
    }
  }, [user, loading, isAuthorized, router]);

  if (loading && !user) { 
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="inline-flex justify-center items-center mb-4">
            <BookLock className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to Gatedocs</CardTitle>
          <CardDescription className="text-muted-foreground">
            Access exclusive documentation by signing in with your GitHub account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && user ? ( 
             <div className="flex justify-center py-4">
                <LoadingSpinner />
             </div>
          ) : (
            <Button
              onClick={signInWithGitHub}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6"
              disabled={loading}
            >
              <Github className="mr-2 h-6 w-6" />
              Sign in with GitHub
            </Button>
          )}
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {currentYear || new Date().getFullYear()} Gatedocs. All rights reserved.</p>
      </footer>
    </div>
  );
}
