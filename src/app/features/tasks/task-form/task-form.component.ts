import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  
  // Optional: Emit event when cancelled to close form in parent
  @Output() cancel = new EventEmitter<void>();

  newTask = {
    title: '',
    description: '',
    dueDate: ''
  };

  isSubmitting = false;

  async onAddTask() {
    if (!this.newTask.title.trim()) {
      this.toastService.warning('Please enter a task title');
      return;
    }

    this.isSubmitting = true;
    try {
      const dueDateObj = this.newTask.dueDate ? new Date(this.newTask.dueDate) : null;
      
      await this.taskService.createTask(
        this.newTask.title,
        this.newTask.description,
        dueDateObj
      );
      this.toastService.success('Task created successfully');
      this.newTask = { title: '', description: '', dueDate: '' };
      this.cancel.emit(); // Close form after success
    } catch (error: any) {
      console.error('Error adding task:', error);
      this.toastService.error(error.message || 'Failed to create task');
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
