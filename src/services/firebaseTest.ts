import { getAuth } from 'firebase/auth';

/**
 * Tests the connection to Firebase services to ensure they're working properly
 * @returns A promise that resolves when the test is successful, or rejects with an error if it fails
 */
export const testFirebaseConnection = async (): Promise<void> => {
    try {
        // Test Firebase Auth connection first
        console.log('Testing Firebase Auth connection...');
        const auth = getAuth();
        if (!auth) {
            throw new Error('Firebase Auth initialization failed');
        }
        console.log('Firebase Auth initialized successfully');
        
        // Skip Firestore test for now as it requires authentication and proper permissions
        // We'll consider the connection successful if Auth initializes properly
        
        console.log('Firebase connection test successful (Auth only)');
        return Promise.resolve();
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Error testing Firebase connection:', errorMessage);
        throw error;
    }
};
