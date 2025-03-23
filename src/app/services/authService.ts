import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

        // Retrieve user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return { user: userCredential.user, role: userData.role }; // Return user with role
        } else {
            throw new Error('User role not found in Firestore');
        }
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
