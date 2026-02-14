import { Injectable, inject } from '@angular/core';
import { Firestore, collection, query, where, onSnapshot, Timestamp } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { ToastService } from './toast.service';
import { Task } from '../models/task.model';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private toastService = inject(ToastService);
  
  private tasksSubscription: any; // Unsubscribe function from onSnapshot
  private trackedTasks: Task[] = [];
  private checkInterval: any;

  constructor() {
    this.init();
  }

  private init() {
    // Monitor auth state to start/stop tracking
    authState(this.auth).subscribe(user => {
      if (user) {
        this.requestPermission();
        this.startTracking(user.uid);
      } else {
        this.stopTracking();
      }
    });
  }

  requestPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  private startTracking(userId: string) {
    if (this.tasksSubscription) return; // Already tracking

    const tasksRef = collection(this.firestore, `users/${userId}/tasks`);
    // Only track incomplete tasks that have a due date
    const q = query(
      tasksRef, 
      where('completed', '==', false)
      // We can't easily filter by "dueDate != null" in Firestore without composite index sometimes,
      // so we'll filter in memory or rely on the fact that we only care about tasks with due dates.
      // Let's just get all incomplete tasks.
    );

    this.tasksSubscription = onSnapshot(q, (snapshot) => {
      this.trackedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task))
        .filter(t => t.dueDate); // Only care about tasks with due dates
    });

    // Check every minute
    this.checkInterval = setInterval(() => this.checkDueTasks(), 60000);
    // Also check immediately
    setTimeout(() => this.checkDueTasks(), 5000);
  }

  private stopTracking() {
    if (this.tasksSubscription) {
      this.tasksSubscription(); // Unsubscribe from Firestore
      this.tasksSubscription = null;
    }
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.trackedTasks = [];
  }

  private checkDueTasks() {
    const now = new Date();
    
    this.trackedTasks.forEach(task => {
      if (!task.dueDate) return;

      const dueDate = (task.dueDate as Timestamp).toDate();
      const timeDiff = dueDate.getTime() - now.getTime();

      // Notify if due within the next minute (and hasn't passed by too much)
      // logic: if diff is between -60000 (1 min ago) and 60000 (1 min future)
      // Actually, let's just say "is it due now?"
      // Simple logic: If we match the minute. 
      // Better: if it's due in <= 0 and > -1 min (just became due or slightly passed)
      // BUT we run every minute. 
      // Let's verify: 
      // If due time is 10:00. 
      // Run A at 09:59:30. Diff = 30s. 
      // Run B at 10:00:30. Diff = -30s. 
      
      // Let's alert if it's "Time's Up!" (within the last minute)
      if (timeDiff <= 0 && timeDiff > -60000) {
        this.triggerNotification(task);
      }
      // Optional: Warning 5 mins before?
      // For now, just "Time to do task!"
    });
  }

  private triggerNotification(task: Task) {
    const title = 'Task Due Now!';
    const body = `It's time for: ${task.title}`;

    // 1. In-App Toast
    this.toastService.info(`${title}: ${task.title}`);

    // 2. Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/assets/icons/icon-72x72.png' // Adjust path if exists, else default chrome icon
      });
    }
  }
}
