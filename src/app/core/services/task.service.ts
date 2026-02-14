import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  collectionData,
  Timestamp
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore: Firestore = inject(Firestore);
  private authService: AuthService = inject(AuthService);
  private tasksCollection = collection(this.firestore, 'tasks');

  // Get all tasks for current user
  getUserTasks(): Observable<Task[]> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const tasksQuery = query(
      this.tasksCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return collectionData(tasksQuery, { idField: 'id' }) as Observable<Task[]>;
  }

  // Create new task with optional due date, tags, subtasks, and priority
  async createTask(
    title: string, 
    description: string, 
    dueDate: Date | null,
    tags: string[] = [],
    subtasks: { title: string; completed: boolean }[] = [],
    priority: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const userId = this.authService.getCurrentUser()?.uid;
    if (!userId) throw new Error('User not authenticated');

    const task: any = {
      title,
      description,
      completed: false,
      dueDate: dueDate ? Timestamp.fromDate(dueDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      userId,
      tags,
      subtasks,
      priority
    };

    await addDoc(this.tasksCollection, task);
  }

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    await updateDoc(taskDoc, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    const taskDoc = doc(this.firestore, `tasks/${taskId}`);
    await deleteDoc(taskDoc);
  }

  async toggleTaskCompletion(taskId: string, completed: boolean): Promise<void> {
    const status = completed ? 'done' : 'todo';
    await this.updateTask(taskId, { completed, status });
  }
}