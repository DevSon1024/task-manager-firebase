import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.css']
})
export class TaskItemComponent {
  @Input() task!: Task;
  
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  
  isEditing = false;
  
  editTaskData = {
    title: '',
    description: '',
    dueDate: ''
  };

  startEdit() {
    this.isEditing = true;
    let dateStr = '';
    if (this.task.dueDate) {
      // Handle both Timestamp and Date objects safely
      const date = this.task.dueDate instanceof Timestamp ? this.task.dueDate.toDate() : this.task.dueDate;
       try {
        dateStr = date.toISOString().split('T')[0];
       } catch(e) { dateStr = '' }
    }

    this.editTaskData = {
      title: this.task.title,
      description: this.task.description,
      dueDate: dateStr
    };
  }

  cancelEdit() {
    this.isEditing = false;
  }

  async onUpdateTask() {
    if (!this.editTaskData.title.trim()) {
      this.toastService.warning('Please enter a task title');
      return;
    }

    try {
      const updates: Partial<Task> = {
        title: this.editTaskData.title,
        description: this.editTaskData.description,
        dueDate: this.editTaskData.dueDate ? Timestamp.fromDate(new Date(this.editTaskData.dueDate)) : null
      };

      await this.taskService.updateTask(this.task.id!, updates);
      this.toastService.success('Task updated');
      this.isEditing = false;
    } catch (error: any) {
      console.error('Error updating task:', error);
      this.toastService.error(error.message || 'Failed to update task');
    }
  }

  async onDeleteTask() {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.taskService.deleteTask(this.task.id!);
        this.toastService.success('Task deleted');
      } catch (error: any) {
        console.error('Error deleting task:', error);
        this.toastService.error(error.message || 'Failed to delete task');
      }
    }
  }

  async onToggleComplete(completed: boolean) {
    try {
      await this.taskService.toggleTaskCompletion(this.task.id!, !completed);
      // Optional: Toast for toggle might be too noisy, but requested "process notify".
      // Keeping it subtle or omitting if too noisy. Let's add it for completeness.
      this.toastService.info(completed ? 'Task marked active' : 'Task completed', 2000);
    } catch (error: any) {
      console.error('Error toggling task:', error);
      this.toastService.error(error.message || 'Failed to update task status');
    }
  }
}
