import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  collectionData,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, map } from 'rxjs';
import { Note } from '../models/note.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private injector: Injector = inject(Injector);
  private notesCollection = collection(this.firestore, 'notes');

  /** Get all notes for the current user, sorted by updatedAt descending (client-side) */
  getUserNotes(): Observable<Note[]> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const notesQuery = query(
      this.notesCollection,
      where('userId', '==', userId)
    );

    return runInInjectionContext(this.injector, () =>
      (collectionData(notesQuery, { idField: 'id' }) as Observable<Note[]>).pipe(
        map(notes => notes.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() ?? 0;
          const bTime = b.updatedAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        }))
      )
    );
  }

  /** Get notes linked to a specific task, sorted client-side */
  getNotesByTask(taskId: string): Observable<Note[]> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const notesQuery = query(
      this.notesCollection,
      where('userId', '==', userId),
      where('taskId', '==', taskId)
    );

    return runInInjectionContext(this.injector, () =>
      (collectionData(notesQuery, { idField: 'id' }) as Observable<Note[]>).pipe(
        map(notes => notes.sort((a, b) => {
          const aTime = a.updatedAt?.toMillis?.() ?? 0;
          const bTime = b.updatedAt?.toMillis?.() ?? 0;
          return bTime - aTime;
        }))
      )
    );
  }

  async createNote(note: Partial<Note>): Promise<string> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const docRef = await addDoc(this.notesCollection, {
      title: note.title || 'Untitled Note',
      content: note.content || '',
      category: note.category || 'General',
      tags: note.tags || [],
      taskId: note.taskId || null,
      taskTitle: note.taskTitle || null,
      color: note.color || null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId
    });
    return docRef.id;
  }

  async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    const noteDoc = doc(this.firestore, `notes/${noteId}`);
    await updateDoc(noteDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteNote(noteId: string): Promise<void> {
    const noteDoc = doc(this.firestore, `notes/${noteId}`);
    await deleteDoc(noteDoc);
  }
}
