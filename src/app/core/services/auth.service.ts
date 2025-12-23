import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  authState,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
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
    this.user$ = authState(this.auth);
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
      this.router.navigate(['/login']);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Get Current User
  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser;
  }
}
