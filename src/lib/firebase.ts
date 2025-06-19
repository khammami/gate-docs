
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GithubAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// IMPORTANT NOTES FOR FIREBASE AUTH & PREVIEW ENVIRONMENTS (e.g., on *.cloudworkstations.dev):
//
// 1. `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`:
//    - This environment variable (used above in `firebaseConfig`) tells Firebase which domain to use for auth operations.
//    - For most setups, including previews on custom domains like `your-preview.cloudworkstations.dev`, this should be set to
//      your Firebase project's default auth domain (e.g., `your-project-id.firebaseapp.com`).
//
// 2. Firebase Console - Authorized Domains:
//    - Go to your Firebase project -> Authentication -> Settings -> Authorized domains.
//    - You MUST add the domain of your preview environment (e.g., `your-specific-preview.cloudworkstations.dev`) to this list.
//      Firebase needs to know that it's okay for an app running on this domain to initiate auth requests.
//
// 3. GitHub OAuth App - Authorization Callback URL:
//    - Go to your GitHub OAuth App settings on github.com (Developer settings -> OAuth Apps -> Your App).
//    - The "Authorization callback URL" field needs to be set correctly. Firebase constructs this URL based on the `authDomain`
//      from your `firebaseConfig`.
//    - It will typically be: `https://<value_of_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN>/__/auth/handler`
//    - Example: If `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is `your-project-id.firebaseapp.com`, then the GitHub callback URL
//      should be `https://your-project-id.firebaseapp.com/__/auth/handler`.
//
// By keeping `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` as your project's default Firebase domain, GitHub redirects back to Firebase,
// which then securely communicates the auth result to your application running on the authorized `cloudworkstations.dev` domain.

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const githubProvider = new GithubAuthProvider();

export { app, auth, githubProvider };
