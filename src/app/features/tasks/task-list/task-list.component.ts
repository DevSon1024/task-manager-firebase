import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskItemComponent } from '../task-item/task-item.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { FormsModule } from '@angular/forms';
import { 
  CdkDragDrop, 
  moveItemInArray, 
  transferArrayItem, 
  DragDropModule 
} from '@angular/cdk/drag-drop';
import { ToastService } from '../../../core/services/toast.service';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent, TaskItemComponent, LoaderComponent, DragDropModule, ModalComponent, FormsModule, MarkdownModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  tasks$!: Observable<Task[]>;
  searchTerm$ = new BehaviorSubject<string>('');
  
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  isModalOpen = false;
  editingTask: Task | null = null;
  searchTerm: string = '';

  // View Mode
  isViewModalOpen = false;
  viewingTask: Task | null = null;
  
  // Drag configuration
  dragDelay = { touch: 500, mouse: 0 };

  ngOnInit() {
    this.tasks$ = combineLatest([
      this.taskService.getUserTasks(),
      this.searchTerm$
    ]).pipe(
      map(([tasks, term]) => {
        if (!term) return tasks;
        const lowerTerm = term.toLowerCase();
        return tasks.filter(task => 
          task.title.toLowerCase().includes(lowerTerm) ||
          task.description.toLowerCase().includes(lowerTerm) ||
          task.tags?.some(tag => tag.toLowerCase().includes(lowerTerm))
        );
      })
    );

    this.tasks$.subscribe(tasks => {
      this.todoTasks = tasks.filter(t => !t.status || t.status === 'todo');
      this.inProgressTasks = tasks.filter(t => t.status === 'in-progress');
      this.doneTasks = tasks.filter(t => t.status === 'done');
      
      // Sort each column by date descending (optional, but good for UX)
      // Note: original query sorts by createdAt desc. 
    });
  }

  onSearch(term: string) {
    this.searchTerm$.next(term);
  }

  openAddModal() {
    this.editingTask = null;
    this.isModalOpen = true;
  }

  openEditModal(task: Task) {
    this.editingTask = task;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.editingTask = null;
  }

  openViewModal(task: Task) {
    this.viewingTask = task;
    this.isViewModalOpen = true;
  }

  closeViewModal() {
    this.isViewModalOpen = false;
    this.viewingTask = null;
  }

  async toggleViewTaskComplete(task: Task) {
    if (!task.id) return;
    const newCompletedState = !task.completed;
    
    // Optimistic update
    task.completed = newCompletedState;
    
    try {
      await this.taskService.toggleTaskCompletion(task.id, newCompletedState);
      // Status update logic is handled in service/backend usually, but if we want to reflect it:
      if (newCompletedState && task.status !== 'done') {
         // task.status = 'done'; // Optional: let the backend/observable handle this source of truth? 
         // But if we want immediate feedback in modal, we might need to touch it.
         // For now, just toggle completion.
      }
    } catch (error: any) {
      console.error('Error toggling task:', error);
      task.completed = !newCompletedState; // Revert
      this.toastService.error('Failed to update task');
    }
  }

  async toggleViewSubtaskComplete(task: Task, index: number) {
    if (!task.id || !task.subtasks) return;
    
    const subtasks = [...task.subtasks];
    subtasks[index].completed = !subtasks[index].completed;
    
    // Optimistic update for the view
    task.subtasks[index].completed = subtasks[index].completed;

    try {
      await this.taskService.updateTask(task.id, { subtasks });
    } catch (error: any) {
      console.error('Error updating subtask:', error);
      task.subtasks[index].completed = !subtasks[index].completed; // Revert
      this.toastService.error('Failed to update subtask');
    }
  }

  async drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = event.container.id as 'todo' | 'in-progress' | 'done';
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      try {
        await this.taskService.updateTask(task.id!, { status: newStatus });
        // Optional: Update completed status if moved to done?
        if (newStatus === 'done' && !task.completed) {
          await this.taskService.toggleTaskCompletion(task.id!, true);
        } else if (newStatus !== 'done' && task.completed) {
           await this.taskService.toggleTaskCompletion(task.id!, false);
        }

      } catch (error) {
        console.error('Error updating task status:', error);
        this.toastService.error('Failed to update task status');
        // Revert change locally if failed (complex to do with arrays, usually we just reload)
      }
    }
  }
}