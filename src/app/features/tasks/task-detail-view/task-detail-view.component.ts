import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';
import { Task } from '../../../core/models/task.model';
import { Note } from '../../../core/models/note.model';
import { TaskService } from '../../../core/services/task.service';
import { NoteService } from '../../../core/services/note.service';
import { ToastService } from '../../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-task-detail-view',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule, RouterModule],
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

      <!-- ===================== LINKED NOTES SECTION ===================== -->
      <div class="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            Linked Notes ({{ linkedNotes.length }})
          </h4>
          <a [routerLink]="['/notes']" 
             class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            View all notes
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>

        <!-- Quick note form -->
        <div *ngIf="isAddingNote" class="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 space-y-2">
          <input 
            [(ngModel)]="newNoteTitle"
            placeholder="Note title..."
            class="w-full bg-transparent border-none outline-none text-sm font-semibold text-gray-800 dark:text-gray-200 placeholder-gray-400">
          <textarea 
            [(ngModel)]="newNoteContent"
            placeholder="Write your note in Markdown..."
            rows="3"
            class="w-full bg-transparent border-none outline-none text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none font-mono">
          </textarea>
          <div class="flex items-center justify-end gap-2">
            <button (click)="cancelAddNote()" class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">Cancel</button>
            <button (click)="saveLinkedNote()" [disabled]="isSavingNote"
              class="text-xs bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
              {{ isSavingNote ? 'Saving...' : 'Save Note' }}
            </button>
          </div>
        </div>

        <!-- Notes list -->
        <div *ngIf="linkedNotes.length > 0" class="space-y-2 mb-3">
          <div *ngFor="let note of linkedNotes"
            class="flex items-start gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-colors cursor-pointer"
            [routerLink]="['/notes']">
            <svg class="h-4 w-4 text-blue-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-800 dark:text-white truncate">{{ note.title }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">{{ note.content }}</p>
            </div>
          </div>
        </div>

        <!-- Empty linked notes state -->
        <div *ngIf="linkedNotes.length === 0 && !isAddingNote" 
             class="text-center py-4 text-gray-400 dark:text-gray-500 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-xs">
          No notes linked to this task yet
        </div>

        <!-- Add Note button -->
        <button *ngIf="!isAddingNote"
          (click)="startAddNote()"
          class="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add a linked note
        </button>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 flex justify-end">
          <button (click)="edit.emit(task!)" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mr-2">Edit</button>
          <button (click)="close.emit()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium">Close</button>
      </div>
    </div>
  `
})
export class TaskDetailViewComponent implements OnInit, OnChanges {
  @Input() task: Task | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Task>();

  private taskService = inject(TaskService);
  private noteService = inject(NoteService);
  private toastService = inject(ToastService);

  linkedNotes: Note[] = [];
  isAddingNote = false;
  newNoteTitle = '';
  newNoteContent = '';
  isSavingNote = false;

  private notesSubscription?: Subscription;

  ngOnInit(): void {
    this.loadLinkedNotes();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task?.id) {
      this.loadLinkedNotes();
    }
  }

  private loadLinkedNotes(): void {
    if (!this.task?.id) return;
    this.notesSubscription?.unsubscribe();
    this.notesSubscription = this.noteService.getNotesByTask(this.task.id).subscribe(notes => {
      this.linkedNotes = notes;
    });
  }

  startAddNote(): void {
    this.newNoteTitle = '';
    this.newNoteContent = '';
    this.isAddingNote = true;
  }

  cancelAddNote(): void {
    this.isAddingNote = false;
  }

  async saveLinkedNote(): Promise<void> {
    if (!this.newNoteTitle.trim()) {
      this.toastService.warning('Please enter a note title');
      return;
    }
    this.isSavingNote = true;
    try {
      await this.noteService.createNote({
        title: this.newNoteTitle,
        content: this.newNoteContent,
        category: 'Task Notes',
        tags: [],
        taskId: this.task?.id,
        taskTitle: this.task?.title,
      });
      this.toastService.success('Note linked to task');
      this.cancelAddNote();
    } catch (err: any) {
      this.toastService.error('Failed to save note');
    } finally {
      this.isSavingNote = false;
    }
  }

  async toggleTaskComplete() {
    if (!this.task || !this.task.id) return;
    const newCompletedState = !this.task.completed;
    
    // Optimistic update
    this.task.completed = newCompletedState;
    if (newCompletedState) {
        this.task.status = 'done';
    } else {
        this.task.status = 'todo';
    }
    
    try {
      await this.taskService.toggleTaskCompletion(this.task.id, newCompletedState);
    } catch (error: any) {
      console.error('Error toggling task:', error);
      this.task.completed = !newCompletedState;
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
      this.task.subtasks[index].completed = !subtasks[index].completed;
      this.toastService.error('Failed to update subtask');
    }
  }
}
