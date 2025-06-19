
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut, updateProfile, GithubAuthProvider as FirebaseGithubAuthProvider, UserCredential } from 'firebase/auth';
import { auth, githubProvider } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthorized: boolean;
  signInWithGitHub: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hardcoded list of authorized GitHub usernames (the unique login/screen name from a GitHub profile, e.g., "khammami").
// Example for a single user: "khammami"
// Example for multiple users: "octocat,khammami,anotheruser"
const authorizedUsersString = process.env.NEXT_PUBLIC_AUTHORIZED_USERS || "";
const AUTHORIZED_USERS = authorizedUsersString.split(',').map(u => u.trim().toLowerCase()).filter(u => u.length > 0);
console.log("[AuthInit] Parsed AUTHORIZED_USERS from env (all lowercase):", AUTHORIZED_USERS);


const AUTH_CHECK_TIMEOUT_DURATION = 10000; 

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const authorizedUsersEnvVar = process.env.NEXT_PUBLIC_AUTHORIZED_USERS;
    if (!authorizedUsersEnvVar || authorizedUsersEnvVar.trim() === "" || AUTHORIZED_USERS.length === 0) {
      console.warn("[AuthInit] NEXT_PUBLIC_AUTHORIZED_USERS environment variable is not set or is empty. This should be a comma-separated list of GitHub usernames (e.g., for a single user: \"khammami\"; for multiple: \"octocat,khammami\"). Authorization will likely fail for all users if content is intended to be private. Please configure it if Gatedocs is meant to be restricted.");
      if (pathname !== '/login' && pathname !== '/unauthorized') {
        if (!authorizedUsersEnvVar || authorizedUsersEnvVar.trim() === "") {
            toast({
                title: "Authorization Warning",
                description: "No authorized GitHub users are configured. Access may be unrestricted or fail if intended to be private. Contact admin if you see this in production.",
                variant: "destructive",
                duration: 10000,
            });
        }
      }
    }
  }, [pathname, toast]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("[onAuthStateChanged] Auth state changed. currentUser present:", !!currentUser);
      setUser(currentUser);
      if (currentUser) {
        // For authorization, rely on currentUser.displayName.
        // This should have been updated during signInWithGitHub to be the GitHub username (login/screenName).
        const githubUsernameForAuthCheck = (currentUser.displayName || '').toLowerCase();
        console.log(`[onAuthStateChanged] Current Firebase user.displayName (expected GitHub username, converted to lowercase): "${githubUsernameForAuthCheck}"`);

        const authorized = AUTHORIZED_USERS.includes(githubUsernameForAuthCheck);
        setIsAuthorized(authorized);
        console.log(`[onAuthStateChanged] Is user authorized based on displayName (and AUTHORIZED_USERS list): ${authorized}`);

        if (!currentUser.displayName && AUTHORIZED_USERS.length > 0 && currentUser.providerData.some(p => p.providerId === FirebaseGithubAuthProvider.PROVIDER_ID)) {
            console.warn(`[onAuthStateChanged] Firebase currentUser.displayName is empty for GitHub user ${currentUser.uid}. The profile update with GitHub username might not have persisted or completed. Authorization may fail.`);
        }
      } else {
        setIsAuthorized(false);
        console.log("[onAuthStateChanged] No current user. isAuthorized set to false.");
      }
      setLoading(false);
    });

    const loadingTimeout = setTimeout(() => {
      if (loading) {
        console.log("[AuthInit] Auth loading timeout reached. Setting loading to false.");
        setLoading(false); 
      }
    }, AUTH_CHECK_TIMEOUT_DURATION + 2000); 

    return () => {
      unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []); 

  const signInWithGitHub = async () => {
    setLoading(true);
    console.log("[signInWithGitHub] Attempting GitHub sign-in.");
    try {
      const result: UserCredential = await signInWithPopup(auth, githubProvider);
      const firebaseUser = result.user; 
      
      console.log('[signInWithGitHub] Full sign-in result object:', result);
      console.log('[signInWithGitHub] Raw result.user object:', firebaseUser);
      console.log('[signInWithGitHub] Raw result.additionalUserInfo:', result.additionalUserInfo);
      console.log('[signInWithGitHub] Raw result.user.providerData:', firebaseUser.providerData);
      if ((firebaseUser as any).reloadUserInfo) {
        console.log('[signInWithGitHub] Raw (firebaseUser as any).reloadUserInfo:', (firebaseUser as any).reloadUserInfo);
      }
      console.log('[signInWithGitHub] Initial firebaseUser.displayName from result.user.displayName:', firebaseUser.displayName);


      let extractedGithubUsername: string | null = null;

      // Attempt 1: From additionalUserInfo.profile.login (most reliable for GitHub login/username)
      if (result.additionalUserInfo?.profile && typeof result.additionalUserInfo.profile.login === 'string') {
        extractedGithubUsername = result.additionalUserInfo.profile.login.trim();
        console.log(`[signInWithGitHub] Extracted username from additionalUserInfo.profile.login: "${extractedGithubUsername}"`);
      }

      // Attempt 2: From additionalUserInfo.username (fallback if profile.login isn't there)
      if (!extractedGithubUsername && result.additionalUserInfo && typeof result.additionalUserInfo.username === 'string') {
        extractedGithubUsername = result.additionalUserInfo.username.trim();
        console.log(`[signInWithGitHub] Extracted username from additionalUserInfo.username: "${extractedGithubUsername}"`);
      }
      
      // Attempt 3: From firebaseUser.providerData (looking for screenName)
      if (!extractedGithubUsername) {
        const githubProviderData = firebaseUser.providerData.find(
          (pd) => pd.providerId === FirebaseGithubAuthProvider.PROVIDER_ID
        );
        // The 'screenName' property is not standard in UserInfo, so we cast to 'any'
        if (githubProviderData && (githubProviderData as any).screenName && typeof (githubProviderData as any).screenName === 'string') {
          extractedGithubUsername = (githubProviderData as any).screenName.trim();
          console.log(`[signInWithGitHub] Extracted username from providerData.screenName: "${extractedGithubUsername}"`);
        }
      }

      // Attempt 4: From (firebaseUser as any).reloadUserInfo.screenName (as observed by user)
      // This is an internal property and should be used as a last resort.
      if (!extractedGithubUsername && (firebaseUser as any).reloadUserInfo && typeof (firebaseUser as any).reloadUserInfo.screenName === 'string') {
        extractedGithubUsername = (firebaseUser as any).reloadUserInfo.screenName.trim();
        console.warn(`[signInWithGitHub] Extracted username from (firebaseUser as any).reloadUserInfo.screenName: "${extractedGithubUsername}". Note: Using an internal property.`);
      }


      let githubUsernameToUseForAuthAndProfile: string;

      if (extractedGithubUsername && extractedGithubUsername !== '') {
        githubUsernameToUseForAuthAndProfile = extractedGithubUsername;
      } else {
        // Fallback if no specific GitHub username could be extracted.
        // This will likely use the user's full name if available, or be empty.
        githubUsernameToUseForAuthAndProfile = (firebaseUser.displayName || '').trim(); 
        console.warn(`[signInWithGitHub] Could not extract specific GitHub username (login/screenName) from additionalUserInfo, providerData, or reloadUserInfo. Falling back to existing Firebase displayName: "${githubUsernameToUseForAuthAndProfile}". This may affect authorization if the displayName is not the GitHub username and NEXT_PUBLIC_AUTHORIZED_USERS is configured.`);
        if (!githubUsernameToUseForAuthAndProfile && AUTHORIZED_USERS.length > 0) {
             toast({
                title: "Authorization Information Potentially Missing",
                description: "Could not reliably determine your GitHub username from sign-in details. Access might be denied if authorization relies on it.",
                variant: "destructive",
            });
        }
      }
      
      const finalUsernameForCheck = githubUsernameToUseForAuthAndProfile.toLowerCase();
      console.log(`[signInWithGitHub] Final username for profile update and auth check (lowercase): "${finalUsernameForCheck}"`);

      if (finalUsernameForCheck && firebaseUser.displayName?.toLowerCase() !== finalUsernameForCheck) {
        console.log(`[signInWithGitHub] Updating Firebase profile displayName from "${firebaseUser.displayName}" to "${finalUsernameForCheck}".`);
        try {
          await updateProfile(firebaseUser, { displayName: finalUsernameForCheck }); 
          console.log("[signInWithGitHub] Firebase profile displayName update initiated. The onAuthStateChanged listener will eventually pick up the updated user object.");
           setUser(auth.currentUser); 
        } catch (updateError) {
          console.error("[signInWithGitHub] Error updating Firebase user profile displayName:", updateError);
          toast({
            title: "Profile Update Issue",
            description: "Could not save GitHub username to your profile. Authorization might be affected on next load.",
            variant: "destructive",
          });
        }
      } else if (finalUsernameForCheck) {
          console.log(`[signInWithGitHub] Firebase profile displayName ("${firebaseUser.displayName}") already matches (case-insensitively) determined GitHub username ("${finalUsernameForCheck}"). No update needed.`);
      }
      
      console.log(`[signInWithGitHub] Checking authorization using determined GitHub username: "${finalUsernameForCheck}" against AUTHORIZED_USERS (all lowercase):`, AUTHORIZED_USERS);
      const authorized = AUTHORIZED_USERS.includes(finalUsernameForCheck);
      setIsAuthorized(authorized); 
      console.log(`[signInWithGitHub] Is user authorized (immediately after sign-in): ${authorized}`);

      if (authorized) {
        router.push('/docs');
      } else {
        router.push('/unauthorized');
      }
    } catch (error: any)
     {
      console.error("[signInWithGitHub] GitHub Sign-In Error:", error);
      let description = error.message || "Failed to sign in with GitHub. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "The sign-in popup was closed before completing. This might be due to a popup blocker, or a configuration issue with your GitHub OAuth settings (Authorization callback URL) or Firebase authorized domains for your preview environment. Please check these and try again.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        description = "Multiple sign-in popups were opened. Please complete the sign-in in one of them, or try again if all were closed."
      }
      toast({
        title: "Authentication Error",
        description: description,
        variant: "destructive",
      });
      setIsAuthorized(false); 
    } finally {
      // setLoading(false); // onAuthStateChanged will set loading to false after processing
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    console.log("[signOutUser] Attempting sign-out.");
    try {
      await signOut(auth);
      router.push('/login'); 
      console.log("[signOutUser] Sign-out successful. Navigated to /login.");
    } catch (error: any) {
      console.error("[signOutUser] Sign Out Error:", error);
      toast({
        title: "Sign Out Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      // setLoading(false); // onAuthStateChanged will handle this
    }
  };

  useEffect(() => {
    if (loading) return; 
    console.log(`[RouterEffect] Path: ${pathname}, User: ${!!user}, Authorized: ${isAuthorized}, Loading: ${loading}`);

    const publicPaths = ['/login', '/unauthorized'];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      console.log("[RouterEffect] No user, not public path. Redirecting to /login.");
      router.replace('/login');
    } else if (user && !isAuthorized && pathname !== '/unauthorized' && pathname !== '/login') {
      console.log("[RouterEffect] User exists, but not authorized. Redirecting to /unauthorized.");
      router.replace('/unauthorized');
    } else if (user && isAuthorized && (pathname === '/login' || pathname === '/unauthorized')) {
       console.log("[RouterEffect] User exists and authorized, but on login/unauthorized page. Redirecting to /docs.");
       router.replace('/docs');
    }
  }, [user, loading, isAuthorized, pathname, router]);


  if (loading && !['/login', '/unauthorized'].includes(pathname) && !user) {
     const authCheckTimeout = setTimeout(() => {
      if (loading && !user) { 
        console.log("[InitialLoadSpinner] Timeout while loading and no user. Forcing loading false. Path:", pathname);
        clearTimeout(authCheckTimeout);
        if (pathname !== '/login' && pathname !== '/unauthorized') { 
             console.log("[InitialLoadSpinner] Still no user after timeout, redirecting to /login from ", pathname);
             router.replace('/login');
        }
      }
    }, AUTH_CHECK_TIMEOUT_DURATION); 
    
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner key="auth-loading-spinner" /></div>;
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAuthorized, signInWithGitHub, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

