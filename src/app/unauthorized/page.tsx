
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const { signOutUser, user } = useAuth();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-lg text-center shadow-xl">
          <CardHeader>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-destructive/20 mb-4">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle className="text-3xl font-headline text-destructive">Access Denied</CardTitle>
            <CardDescription className="text-muted-foreground text-lg">
              {user ? `Sorry ${user.displayName || user.email}, your GitHub account is not authorized to access this content.` : "Your GitHub account is not authorized to access this content."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">
              If you believe this is an error, please contact the administrator to request access.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={signOutUser} variant="outline" className="text-lg py-3 px-6">
              <LogOut className="mr-2 h-5 w-5" />
              Logout and Try Different Account
            </Button>
          </CardFooter>
        </Card>
      </main>
      <footer className="text-center py-4 text-sm text-muted-foreground">
         <p>&copy; {currentYear || new Date().getFullYear()} Gatedocs. All rights reserved.</p>
      </footer>
    </div>
  );
}
