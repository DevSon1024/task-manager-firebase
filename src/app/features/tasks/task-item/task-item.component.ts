import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { MarkdownModule } from 'ngx-markdown';
import { Timestamp } from 'firebase/firestore';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, MarkdownModule, DragDropModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  @Input() task!: Task;
  @Output() edit = new EventEmitter<Task>();

  onEdit() {
    this.edit.emit(this.task);
  }

  async onToggleComplete(completed: boolean) {
    if (!this.task.id) return;
    try {
      await this.taskService.toggleTaskCompletion(this.task.id, !completed);
    } catch (error: any) {
      console.error('Error toggling task:', error);
      this.toastService.error(error.message || 'Failed to update task');
    }
  }

  async toggleSubtaskCompletion(index: number) {
    if (!this.task.id || !this.task.subtasks) return;
    
    const subtasks = [...this.task.subtasks];
    subtasks[index].completed = !subtasks[index].completed;

    try {
      await this.taskService.updateTask(this.task.id, { subtasks });
    } catch (error: any) {
      console.error('Error updating subtask:', error);
      this.toastService.error('Failed to update subtask');
    }
  }

  async onDeleteTask() {
    if (!this.task.id) return;
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.taskService.deleteTask(this.task.id);
        this.toastService.success('Task deleted');
      } catch (error: any) {
        console.error('Error deleting task:', error);
        this.toastService.error('Failed to delete task');
      }
    }
  }
}
