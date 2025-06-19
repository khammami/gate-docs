"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const { user, loading, isAuthorized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login');
      } else if (isAuthorized) {
        router.replace('/docs');
      } else {
        router.replace('/unauthorized');
      }
    }
  }, [user, loading, isAuthorized, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <LoadingSpinner />
      <p className="mt-4 text-foreground">Loading Gatedocs...</p>
    </div>
  );
}
