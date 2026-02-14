import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-task-detail-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  template: `
    <div *ngIf="task" class="p-1">
      <!-- Header with Checkbox and Status -->
      <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <input 
              type="checkbox" 
              [checked]="task.completed" 
              (change)="toggleTaskComplete()"
              class="h-6 w-6 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer">
            
            <span [ngClass]="{
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300': !task.status || task.status === 'todo',
                'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300': task.status === 'in-progress',
                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300': task.status === 'done'
            }" class="px-2.5 py-0.5 rounded-full text-sm font-medium">
                {{ (task.status || 'To Do') | titlecase }}
            </span>
          </div>
      </div>

      <!-- Description -->
      <div *ngIf="task.description" class="prose dark:prose-invert max-w-none mb-6">
          <div class="flex items-center justify-between mb-2">
            <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider">Description</h4>
          </div>
          <div [class.opacity-50]="task.completed" class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 transition-opacity">
            <markdown [data]="task.description"></markdown>
          </div>
      </div>

      <!-- Subtasks -->
      <div *ngIf="task.subtasks && task.subtasks.length > 0" class="mb-6">
          <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Subtasks</h4>
          <div class="space-y-2">
            <div *ngFor="let sumbtask of task.subtasks; let i = index" class="flex items-start space-x-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input 
                  type="checkbox" 
                  [checked]="sumbtask.completed" 
                  (change)="toggleSubtaskComplete(i)"
                  class="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded cursor-pointer">
                <span [class.line-through]="sumbtask.completed" class="text-gray-700 dark:text-gray-300">{{ sumbtask.title }}</span>
            </div>
          </div>
      </div>

      <!-- Meta Info -->
      <div class="grid grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div>
            <span class="block text-xs font-bold uppercase text-gray-400">Due Date</span>
            <span>{{ task.dueDate ? (task.dueDate.toDate() | date:'medium') : 'No date' }}</span>
          </div>
          <div>
            <span class="block text-xs font-bold uppercase text-gray-400">Priority</span>
            <span [ngClass]="{
                'text-red-500': task.priority === 'high',
                'text-yellow-500': task.priority === 'medium',
                'text-green-500': task.priority === 'low'
            }" class="font-medium capitalize">{{ task.priority || 'None' }}</span>
          </div>
      </div>
      
      <div class="mt-6 flex justify-end">
          <button (click)="edit.emit(task!)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-2">Edit</button>
          <button (click)="close.emit()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Close</button>
      </div>
    </div>
  `
})
export class TaskDetailViewComponent {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Task>();

  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  async toggleTaskComplete() {
    if (!this.task || !this.task.id) return;
    const newCompletedState = !this.task.completed;
    
    // Optimistic update
    this.task.completed = newCompletedState;
    // Also update status locally for immediate feedback (though service handles db)
    if (newCompletedState) {
        this.task.status = 'done';
    } else {
        this.task.status = 'todo'; // or previous status if we tracked it, but 'todo' is safe default
    }
    
    try {
      await this.taskService.toggleTaskCompletion(this.task.id, newCompletedState);
    } catch (error: any) {
      console.error('Error toggling task:', error);
      this.task.completed = !newCompletedState; // Revert
      this.toastService.error('Failed to update task');
    }
  }

  async toggleSubtaskComplete(index: number) {
    if (!this.task || !this.task.id || !this.task.subtasks) return;
    
    const subtasks = [...this.task.subtasks];
    subtasks[index].completed = !subtasks[index].completed;
    
    // Optimistic update
    this.task.subtasks[index].completed = subtasks[index].completed;

    try {
      await this.taskService.updateTask(this.task.id, { subtasks });
    } catch (error: any) {
      console.error('Error updating subtask:', error);
      this.task.subtasks[index].completed = !subtasks[index].completed; // Revert
      this.toastService.error('Failed to update subtask');
    }
  }
}
