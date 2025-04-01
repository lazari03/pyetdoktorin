import { useState, useEffect } from 'react';
import { db } from '../../config/firebaseconfig';
import { doc, getDoc } from 'firebase/firestore';

export function useUserProfiles(userIds: string[]) {
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchProfiles = async () => {
      const profileData: Record<string, any> = {};
      for (const userId of userIds) {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            profileData[userId] = userDoc.data();
          }
        } catch (error) {
          console.error(`Error fetching profile for user ID ${userId}:`, error);
        }
      }
      setProfiles(profileData);
    };

    if (userIds.length > 0) {
      fetchProfiles();
    }
  }, [userIds]);

  return profiles;
}
