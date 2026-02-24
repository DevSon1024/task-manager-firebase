import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { combineLatest } from 'rxjs';
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
export class UserDashboard implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  noteService = inject(NoteService);
  toastService = inject(ToastService);

  isLoading = true;
  userProfile: any = null;
  
  // Dashboard Data
  taskStats = { pending: 0, inProgress: 0, completed: 0 };
  urgentTasks: Task[] = [];
  recentNotes: Note[] = [];

  // Modal State
  isTaskModalOpen = false;
  
  // Quick Note State
  newQuickNote = '';

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userProfile$ = this.authService.userProfile$;
    const tasks$ = this.taskService.getUserTasks();
    const notes$ = this.noteService.getUserNotes();

    combineLatest([userProfile$, tasks$, notes$]).subscribe({
      next: ([profile, tasks, notes]) => {
        this.userProfile = profile;
        
        // Calculate Task Stats
        this.taskStats = {
          pending: tasks.filter(t => t.status === 'todo' || (!t.status && !t.completed)).length,
          inProgress: tasks.filter(t => t.status === 'in-progress').length,
          completed: tasks.filter(t => t.completed || t.status === 'done').length
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

        // Get Top 3 Recent Notes
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
}

