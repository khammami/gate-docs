"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, BookLock } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOutUser, loading } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href={user ? "/docs" : "/login"} className="flex items-center gap-2">
          <BookLock className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-bold">Gatedocs</h1>
        </Link>
        {user && !loading && (
          <Button variant="ghost" onClick={signOutUser} className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground">
            <LogOut className="mr-2 h-5 w-5" />
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
