export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role?: 'admin' | 'user'; // Default 'user'
  lastSeen?: any; // Firestore Timestamp
  isOnline?: boolean;
}
