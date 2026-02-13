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
    dueDate: '',
    tags: [] as string[],
    subtasks: [] as { title: string; completed: boolean }[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  };

  availableTags = ['Work', 'Personal', 'Urgent', 'Health', 'Finance'];
  newSubtaskTitle = '';

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
      dueDate: dateStr,
      tags: this.task.tags ? [...this.task.tags] : [],
      subtasks: this.task.subtasks ? JSON.parse(JSON.stringify(this.task.subtasks)) : [],
      priority: this.task.priority || 'medium'
    };
  }

  toggleTag(tag: string) {
    if (this.editTaskData.tags.includes(tag)) {
      this.editTaskData.tags = this.editTaskData.tags.filter(t => t !== tag);
    } else {
      this.editTaskData.tags.push(tag);
    }
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.editTaskData.subtasks.push({ title: this.newSubtaskTitle.trim(), completed: false });
      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number) {
    this.editTaskData.subtasks.splice(index, 1);
  }

  async toggleSubtaskCompletion(subtaskIndex: number) {
    if (!this.task.subtasks) return;
    
    // Create a deep copy to modify
    const updatedSubtasks = JSON.parse(JSON.stringify(this.task.subtasks));
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    try {
      await this.taskService.updateTask(this.task.id!, { subtasks: updatedSubtasks });
      // Optimistically update local state or rely on observable? 
      // Since it's observable based, it should auto-update, but for better UX on slow networks we might want local update.
      // For now, let's rely on Firebase realtime updates.
    } catch (error: any) {
      console.error('Error toggling subtask:', error);
      this.toastService.error('Failed to update subtask');
    }
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
        dueDate: this.editTaskData.dueDate ? Timestamp.fromDate(new Date(this.editTaskData.dueDate)) : null,
        tags: this.editTaskData.tags,
        subtasks: this.editTaskData.subtasks,
        priority: this.editTaskData.priority
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
