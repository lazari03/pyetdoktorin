import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebaseconfig';
import { getAuth } from 'firebase/auth';

// ✅ Login function (returns user + role)
export const login = async (email: string, password: string) => {
    try {
        console.log('Attempting to log in with email:', email);
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful:', userCredential.user);

        let role = 'patient'; // Default role
        
        // Try to retrieve user role from Firestore, but continue if it fails
        try {
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            console.log('User document exists:', userDoc.exists());
            
            if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('User data retrieved:', userData);
                role = userData.role || 'patient'; // Use 'patient' as fallback
                console.log('Determined role:', role);
            } else {
                console.log('No user document found, using default role: patient');
                // Skip creating the document if we couldn't read - we'll likely get permission error
                console.log('Skipping user document creation due to potential permission issues');
            }
        } catch (firestoreError) {
            console.error('Error accessing Firestore:', firestoreError);
            
            // Check if it's a permissions error
            if (firestoreError instanceof Error && 
                firestoreError.message.includes('Missing or insufficient permissions')) {
                console.warn('Firestore permission error detected. Using default role and proceeding with authentication only.');
            }
            
            // Continue with default role - auth still works
        }

        // Store role in localStorage for client-side access
        localStorage.setItem('userRole', role);

        // Get ID token for cookie-based auth
        const token = await userCredential.user.getIdToken();
        console.log('Token obtained successfully');

        // Set the auth token as a cookie
        document.cookie = `auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 1 week expiry
        console.log('Auth cookie set');

        return { user: userCredential.user, role }; // Return user with role
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to log in';
        console.error('Error during login:', errorMessage);
        throw new Error(errorMessage);
    }
};

// ✅ Register function (creates user & saves role)
export const register = async (email: string, password: string, role: string) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save the user's role in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: role,
        });

        return { user, role }; // Return user with role
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to register';
        throw new Error(errorMessage);
    }
};

// Add logout function to clear cookies
export const logout = async () => {
    try {
        await signOut(auth);
        // Clear localStorage
        localStorage.removeItem('userRole');
        // Clear auth cookie
        document.cookie = 'auth-token=; path=/; max-age=0';
        return true;
    } catch (error) {
        console.error('Error signing out:', error);
        return false;
    }
};
