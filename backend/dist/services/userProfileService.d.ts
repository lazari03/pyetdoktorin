export interface UserProfile {
    name?: string;
    surname?: string;
    email?: string;
    phone?: string;
    pharmacyName?: string;
    clinicName?: string;
}
export declare function getUserProfile(uid: string): Promise<UserProfile | null>;
export declare function buildDisplayName(profile: UserProfile | null, fallback: string): string;
//# sourceMappingURL=userProfileService.d.ts.map