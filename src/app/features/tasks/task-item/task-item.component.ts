import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Timestamp } from 'firebase/firestore';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';

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
    if (!this.editTaskData.title.trim()) return;

    try {
      const updates: Partial<Task> = {
        title: this.editTaskData.title,
        description: this.editTaskData.description,
        dueDate: this.editTaskData.dueDate ? Timestamp.fromDate(new Date(this.editTaskData.dueDate)) : null
      };

      await this.taskService.updateTask(this.task.id!, updates);
      this.isEditing = false;
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async onDeleteTask() {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.taskService.deleteTask(this.task.id!);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  }

  async onToggleComplete(completed: boolean) {
    try {
      await this.taskService.toggleTaskCompletion(this.task.id!, !completed);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }
}
