import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  linkWithCredential,
  EmailAuthProvider
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  docData
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private router: Router = inject(Router);
  
  user$: Observable<FirebaseUser | null>;
  userProfile$: Observable<User | null>;

  constructor() {
    // Set persistence to LOCAL to keep user logged in even after browser close
    this.initializePersistence();
    this.user$ = authState(this.auth);
    
    // Create an observable for the user profile from Firestore
    this.userProfile$ = this.user$.pipe(
      switchMap(user => {
        if (user) {
          const userDoc = doc(this.firestore, 'users', user.uid);
          return docData(userDoc) as Observable<User>;
        } else {
          return of(null);
        }
      })
    );

    // Auto-logout suspended users in real-time
    this.userProfile$.subscribe(profile => {
      if (profile && profile.isActive === false) {
        if (this.auth.currentUser) {
          this.logoutSuspendedUser();
        }
      }
    });
  }

  // Force-logout a suspended user and display an alert
  private async logoutSuspendedUser(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/'], { replaceUrl: true });
      alert('Your account has been suspended by an administrator.');
    } catch (e) {
      console.error('Error logging out suspended user:', e);
    }
  }

  // Initialize persistence settings
  private async initializePersistence(): Promise<void> {
    try {
      // Try indexedDB first, fallback to localStorage
      await setPersistence(this.auth, indexedDBLocalPersistence);
      // console.log('Auth persistence set to IndexedDB');
    } catch (error) {
      try {
        await setPersistence(this.auth, browserLocalPersistence);
        // console.log('Auth persistence set to Local Storage');
      } catch (err) {
        console.error('Error setting persistence:', err);
      }
    }
  }

  // Email & Password Login
  async login(email: string, password: string): Promise<void> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      
      // Check for active suspension FIRST
      const profileInfo = await this.getUserProfile(result.user.uid);
      if (profileInfo && profileInfo.isActive === false) {
        await signOut(this.auth);
        throw new Error('Your account is suspended. Please contact the administrator.');
      }

      // Sync user profile on login
      await this.syncUserProfile(result.user);
      await this.updateUserStatus(result.user.uid, true);
      
      // Check role and redirect
      await this.redirectBasedOnRole(result.user.uid);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Email & Password Registration
  async register(email: string, password: string): Promise<void> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      await this.syncUserProfile(result.user);
      await this.updateUserStatus(result.user.uid, true);
      // New users are always 'user' role initially, so /dashboard is fine, but let's use the helper
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Google Sign-In
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      
      // Check for active suspension FIRST
      const profileInfo = await this.getUserProfile(result.user.uid);
      if (profileInfo && profileInfo.isActive === false) {
        await signOut(this.auth);
        throw new Error('Your account is suspended. Please contact the administrator.');
      }

      await this.syncUserProfile(result.user);
      await this.updateUserStatus(result.user.uid, true);
      
       // Check role and redirect
       await this.redirectBasedOnRole(result.user.uid);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (user) {
        await this.updateUserStatus(user.uid, false);
      }
      await signOut(this.auth);
      this.router.navigate(['/'], { replaceUrl: true });
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get Current User
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  // Sync User Profile with Firestore
  async syncUserProfile(user: FirebaseUser): Promise<void> {
    const userRef = doc(this.firestore, 'users', user.uid);
    const userSnapshot = await getDoc(userRef);

    const userData: Partial<User> = {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'User',
      photoURL: user.photoURL || '',
      lastSeen: serverTimestamp(),
      isOnline: true
    };

    if (!userSnapshot.exists()) {
      // New user, set default role & active status
      userData.role = 'user';
      userData.isActive = true;
      await setDoc(userRef, userData);
    } else {
      // Existing user: check if role exists, if not, set default
      const currentData = userSnapshot.data() as User;
      if (!currentData.role) {
        userData.role = 'user';
      }
      // Update info
      await updateDoc(userRef, userData);
    }
  }

  // Update User Status (Online/Offline)
  async updateUserStatus(uid: string, isOnline: boolean): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      isOnline: isOnline,
      lastSeen: serverTimestamp()
    });
  }

  // Get User Profile by ID (for Admin)
  async getUserProfile(uid: string): Promise<User | undefined> {
    const userRef = doc(this.firestore, 'users', uid);
    const snapshot = await getDoc(userRef);
    return snapshot.data() as User;
  }

  public async redirectBasedOnRole(uid: string): Promise<void> {
    const profile = await this.getUserProfile(uid);
    if (profile && profile.role === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  // Get provider IDs for the current user (e.g. 'password', 'google.com')
  getProviders(): string[] {
    const user = this.auth.currentUser;
    if (!user) return [];
    return user.providerData.map(p => p.providerId);
  }

  // Send a password-reset email to the current user's email
  async sendPasswordResetEmail(): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found.');
    try {
      await sendPasswordResetEmail(this.auth, user.email);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Change password for email/password users (requires re-authentication)
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found.');
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await firebaseUpdatePassword(user, newPassword);
    } catch (error: any) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Incorrect current password. Please try again.');
      }
      throw new Error(error.message);
    }
  }

  // Link email+password to a Google-only account so user can also sign in with email/password
  async linkEmailPassword(password: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error('No authenticated user found.');
    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await linkWithCredential(user, credential);
    } catch (error: any) {
      if (error.code === 'auth/provider-already-linked') {
        throw new Error('This account already has a password set.');
      }
      throw new Error(error.message);
    }
  }
}
