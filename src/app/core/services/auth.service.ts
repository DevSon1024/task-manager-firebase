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
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  
  user$: Observable<FirebaseUser | null>;

  constructor() {
    // Set persistence to LOCAL to keep user logged in even after browser close
    this.initializePersistence();
    this.user$ = authState(this.auth);
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
      await signInWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Email & Password Registration
  async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Google Sign-In
  async loginWithGoogle(): Promise<void> {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(this.auth, provider);
      this.router.navigate(['/tasks']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
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
}