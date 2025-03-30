import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../config/firebaseconfig';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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

        // Set the auth token as a session cookie (expires when the browser is closed)
        const isProduction = process.env.NODE_ENV === 'production';
        const sameSite = isProduction ? 'Strict' : 'Lax'; // Use 'Lax' for local development
        const secureFlag = isProduction ? 'Secure;' : ''; // Do not use 'Secure' in local development
        document.cookie = `auth-token=${token}; path=/; ${secureFlag} SameSite=${sameSite}`;
        console.log('Auth cookie set');

        return { user: userCredential.user, role }; // Return user with role
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to log in';
        console.error('Error during login:', errorMessage);
        throw new Error(errorMessage);
    }
};

// ✅ Register function (creates user & saves role and profile data)
export const register = async (email: string, password: string, role: string, formData: any) => {
    try {
      // Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Sanitize formData to avoid undefined values
      const sanitizedData = {
        name: formData.name || null,
        surname: formData.surname || null,
        phone: formData.phone || null,
        email: formData.email || null,
        role: formData.role || "patient", // Default to "patient" if role is undefined
        about: formData.about || null, // Default to null for optional fields
        specializations: formData.specializations || null,
        education: formData.education || null,
      };
  
      // Save the user data to Firestore
      await setDoc(doc(db, "users", user.uid), sanitizedData);
  
      return { user, role: sanitizedData.role };
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
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

export const isAuthenticated = (callback: (authState: { userId: string | null; role: string | null; error: string | null }) => void) => {
  const auth = getAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const role = localStorage.getItem("userRole"); // Retrieve role from localStorage
      callback({
        userId: user.uid,
        role,
        error: null,
      });
    } else {
      callback({
        userId: null,
        role: null,
        error: "User not authenticated. Please log in.",
      });
    }
  });
};

export const registerUser = async (email: string, password: string, role: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Store user role in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      email,
      role, // Store the role (doctor or patient)
    });

    // Store user role in localStorage
    localStorage.setItem('userRole', role);

    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};