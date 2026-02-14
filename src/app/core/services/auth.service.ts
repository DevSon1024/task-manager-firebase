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
  indexedDBLocalPersistence
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
      // New users are always 'user' role initially, so /tasks is fine, but let's use the helper
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Google Sign-In
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
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
      // New user, set default role
      userData.role = 'user';
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
      this.router.navigate(['/tasks']);
    }
  }
}
