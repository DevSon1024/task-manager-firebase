import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { combineLatest, Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { NoteService } from '../../../core/services/note.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../core/models/task.model';
import { Note } from '../../../core/models/note.model';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { TaskFormComponent } from '../../tasks/task-form/task-form.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-dashboard', 
  imports: [
    CommonModule, 
    RouterModule,
    LoaderComponent, 
    ModalComponent, 
    TaskFormComponent,
    FormsModule
  ],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard implements OnInit, OnDestroy {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  noteService = inject(NoteService);
  toastService = inject(ToastService);

  isLoading = true;
  userProfile: any = null;
  
  // Dashboard Data
  taskStats = { 
    total: 0,
    pending: 0, 
    inProgress: 0, 
    dueTodayInProgress: 0,
    completed: 0,
    completionPercentage: 0
  };
  urgentTasks: Task[] = [];
  recentNotes: Note[] = [];
  
  // Recent Activities
  recentActivities = {
    createdTasks: [] as Task[],
    completedTasks: [] as Task[],
    lastNotesEdited: [] as Note[]
  };

  // Modal State
  isTaskModalOpen = false;
  
  // Quick Note State
  newQuickNote = '';

  private dashboardSub?: Subscription;

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userProfile$ = this.authService.userProfile$;
    const tasks$ = this.taskService.getUserTasks();
    const notes$ = this.noteService.getUserNotes();

    this.dashboardSub = combineLatest([userProfile$, tasks$, notes$]).subscribe({
      next: ([profile, tasks, notes]) => {
        this.userProfile = profile;
        
        // Calculate Task Stats
        const total = tasks.length;
        const pending = tasks.filter(t => t.status === 'todo' || (!t.status && !t.completed)).length;
        const inProgressList = tasks.filter(t => t.status === 'in-progress');
        const inProgress = inProgressList.length;
        const completed = tasks.filter(t => t.completed || t.status === 'done').length;
        const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Tasks due today (In Progress)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        const dueTodayInProgress = inProgressList.filter(t => {
          if (!t.dueDate) return false;
          const dueMillis = (t.dueDate as any).toMillis ? (t.dueDate as any).toMillis() : (t.dueDate as any).seconds * 1000;
          return dueMillis >= todayStart.getTime() && dueMillis <= todayEnd.getTime();
        }).length;

        this.taskStats = {
          total,
          pending,
          inProgress,
          dueTodayInProgress,
          completed,
          completionPercentage
        };

        // Get Top 5 Urgent Tasks (Needs due date, prioritize sooner dates, skip completed)
        this.urgentTasks = tasks
          .filter(t => !t.completed)
          .sort((a, b) => {
            // Sort by priority first
            const priorityWeight = { 'high': 3, 'medium': 2, 'low': 1, undefined: 0 };
            const pwA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
            const pwB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
            
            if (pwA !== pwB) return pwB - pwA;

            // Then sort by due date if available
            if (a.dueDate && b.dueDate) {
               return (a.dueDate as any).seconds - (b.dueDate as any).seconds;
            }
            if (a.dueDate) return -1;
            if (b.dueDate) return 1;
            return 0;
          })
          .slice(0, 5);

        // Recent Activities calculations
        this.recentActivities.createdTasks = [...tasks]
          .filter(t => t.createdAt)
          .sort((a, b) => {
             const tA = (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : (a.createdAt as any).seconds * 1000;
             const tB = (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : (b.createdAt as any).seconds * 1000;
             return tB - tA;
          })
          .slice(0, 3);
          
        this.recentActivities.completedTasks = tasks
          .filter(t => (t.completed || t.status === 'done') && t.updatedAt)
          .sort((a, b) => {
             const tA = (a.updatedAt as any).toMillis ? (a.updatedAt as any).toMillis() : (a.updatedAt as any).seconds * 1000;
             const tB = (b.updatedAt as any).toMillis ? (b.updatedAt as any).toMillis() : (b.updatedAt as any).seconds * 1000;
             return tB - tA;
          })
          .slice(0, 3);

        this.recentActivities.lastNotesEdited = [...notes]
          .filter(n => n.updatedAt)
          .sort((a, b) => {
             const tA = (a.updatedAt as any).toMillis ? (a.updatedAt as any).toMillis() : (a.updatedAt as any).seconds * 1000;
             const tB = (b.updatedAt as any).toMillis ? (b.updatedAt as any).toMillis() : (b.updatedAt as any).seconds * 1000;
             return tB - tA;
          })
          .slice(0, 3);

        // Get Top 3 Recent Notes (already sorted descending by API)
        this.recentNotes = notes.slice(0, 3);
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.toastService.error('Failed to load dashboard data');
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy() {
    this.dashboardSub?.unsubscribe();
  }

  async quickCompleteTask(task: Task, event: Event) {
    event.preventDefault(); // Prevent default checkbox behavior temporarily to handle state manually
    try {
      if (!task.id) return;
      await this.taskService.toggleTaskCompletion(task.id, true);
      this.toastService.success(`Task "${task.title}" completed!`);
    } catch (error) {
      console.error('Failed to complete task', error);
      this.toastService.error('Failed to complete task');
    }
  }

  async addQuickNote() {
    if (!this.newQuickNote.trim()) return;
    
    try {
      await this.noteService.createNote({
        title: 'Quick Note',
        content: this.newQuickNote.trim(),
        category: 'General',
        tags: ['Quick Note']
      });
      this.toastService.success('Quick note saved!');
      this.newQuickNote = ''; // Reset input
    } catch (error) {
      console.error('Failed to save quick note', error);
      this.toastService.error('Failed to save quick note');
    }
  }

  openCreateTaskModal() {
    this.isTaskModalOpen = true;
  }

  closeCreateTaskModal() {
    this.isTaskModalOpen = false;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning';
    if (hour >= 12 && hour < 17) return 'Good Afternoon';
    if (hour >= 17 && hour < 21) return 'Good Evening';
    return 'Good Night';
  }
}

