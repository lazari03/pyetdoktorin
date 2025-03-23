import { getFirestore, doc, getDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
    try {
        const db = getFirestore();
        const testDoc = doc(db, 'testCollection', 'testDocument'); // Replace with an actual collection/document
        const docSnapshot = await getDoc(testDoc);
        if (docSnapshot.exists()) {
            console.log('Firebase connection successful:', docSnapshot.data());
        } else {
            console.log('Document does not exist.');
        }
    } catch (error: any) {
        console.error('Error testing Firebase connection:', error.message || error);
    }
};
