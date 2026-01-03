# Admin Firestore Rules Guide

This guide explains how to let admins edit any user and doctor profile while regular users can only edit their own profile. It also covers the current logic for appointments and notifications.

## Overview

- Regular users:
  - Can update only their own `users/{userId}` document.
  - Cannot write to doctor subcollection.
- Admins:
  - Can update any `users/{userId}` document.
  - Can write to `/users/{userId}/doctors/{doctorId}` subcollection.
- Reads remain open as per your existing policy.

## Firestore Rules (copy-paste)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      // Allow reads for all
      allow read: if true;

      // Allow user to write own doc OR allow admins to write any user doc
      allow write: if request.auth != null &&
        (
          request.auth.uid == userId ||
          request.auth.token.admin == true
        );
    }

    // Doctors subcollection under users
    match /users/{userId}/doctors/{doctorId} {
      // Allow reads for all
      allow read: if true;

      // Only admins can write doctor profiles
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Appointments collection
    match /appointments/{appointmentId} {
      // Allow reads for all
      allow read: if true;

      // Allow creation if authenticated and patientId matches
      allow create: if request.auth != null &&
        request.resource.data.patientId == request.auth.uid;

      // Allow update if authenticated and patient/doctor matches,
      // and patientId/doctorId are not changed
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.patientId || request.auth.uid == resource.data.doctorId) &&
        request.resource.data.patientId == resource.data.patientId &&
        request.resource.data.doctorId == resource.data.doctorId;

      // Prevent deletion
      allow delete: if false;
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow delete: if false;
    }
  }
}
```

## Admin Claim Setup

Admins must have a custom claim `admin: true` on their Firebase Auth user so rules can recognize them:

```ts
// Run on your server using Firebase Admin SDK
import admin from 'firebase-admin';

await admin.auth().setCustomUserClaims('<ADMIN_UID>', { admin: true });

// After setting the claim, have the admin sign out/in to refresh ID token
```

## Why prefer Admin API for writes

While these rules let admins write directly from the client, best practice is to use a server-side Admin API for admin operations:

- Stronger security and auditability
- Centralized validation and normalization
- Easier to evolve multi-document updates

You can still keep these rules so regular users are constrained, and route admin edits via Next.js API routes for maximum control.

## Troubleshooting

- "Missing or insufficient permissions":
  - Ensure the admin user has `admin: true` claim and has refreshed their token.
  - Confirm the client is authenticated (`request.auth != null`).
- "Unsupported field value: undefined":
  - Only send defined fields to Firestore. Sanitize payloads so arrays (e.g., `specializations`) are always arrays, not `undefined`.
