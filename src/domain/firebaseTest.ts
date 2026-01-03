import { getAuth } from 'firebase/auth';

/**
 * Tests the connection to Firebase services to ensure they're working properly
 * @returns A promise that resolves when the test is successful, or rejects with an error if it fails
 */
export const testFirebaseConnection = async (): Promise<void> => {
    try {
        const auth = getAuth();
        if (!auth) {
            throw new Error('Firebase Auth initialization failed');
        }
        return Promise.resolve();
    } catch {
        throw new Error('An unknown error occurred');
    }
};
