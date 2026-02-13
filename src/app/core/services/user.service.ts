import { Injectable, inject } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore = inject(Firestore);

  // Get all users
  getUsers(): Observable<User[]> {
    const usersCollection = collection(this.firestore, 'users');
    // Order by lastSeen descending to show active users first? or displayName
    // const q = query(usersCollection, orderBy('lastSeen', 'desc'));
    // Return all users for now to avoid filtering issues
    return collectionData(usersCollection, { idField: 'uid' }) as Observable<User[]>;
  }

  // Update a user's role
  async updateUserRole(uid: string, role: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, { role });
  }

  // Delete a user from Firestore
  // Note: This does not delete from Authentication. Admin SDK/Cloud Functions needed for that.
  async deleteUser(uid: string): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await deleteDoc(userRef);
  }
}
