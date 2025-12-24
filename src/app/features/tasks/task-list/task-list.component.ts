import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Timestamp } from 'firebase/firestore'; // Import Timestamp
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  tasks$!: Observable<Task[]>;
  showAddForm = false;
  editingTaskId: string | null = null;

  // Added dueDate string for form binding
  newTask = {
    title: '',
    description: '',
    dueDate: ''
  };

  editTask = {
    id: '',
    title: '',
    description: '',
    dueDate: ''
  };

  ngOnInit() {
    this.tasks$ = this.taskService.getUserTasks();
  }

  async onAddTask() {
    if (!this.newTask.title.trim()) return;

    try {
      // Convert string date to Date object if present
      const dueDateObj = this.newTask.dueDate ? new Date(this.newTask.dueDate) : null;
      
      await this.taskService.createTask(
        this.newTask.title,
        this.newTask.description,
        dueDateObj
      );
      this.newTask = { title: '', description: '', dueDate: '' };
      this.showAddForm = false;
    } catch (error) {
      console.error('Error adding task:', error);
    }
  }

  startEdit(task: Task) {
    this.editingTaskId = task.id!;
    
    // Convert Firestore Timestamp to YYYY-MM-DD string for input
    let dateStr = '';
    if (task.dueDate) {
      dateStr = task.dueDate.toDate().toISOString().split('T')[0];
    }

    this.editTask = {
      id: task.id!,
      title: task.title,
      description: task.description,
      dueDate: dateStr
    };
  }

  cancelEdit() {
    this.editingTaskId = null;
    this.editTask = { id: '', title: '', description: '', dueDate: '' };
  }

  async onUpdateTask() {
    if (!this.editTask.title.trim()) return;

    try {
      const updates: Partial<Task> = {
        title: this.editTask.title,
        description: this.editTask.description,
        // Convert string back to Timestamp for update
        dueDate: this.editTask.dueDate ? Timestamp.fromDate(new Date(this.editTask.dueDate)) : null
      };

      await this.taskService.updateTask(this.editTask.id, updates);
      this.cancelEdit();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  async onDeleteTask(taskId: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await this.taskService.deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  }

  async onToggleComplete(taskId: string, completed: boolean) {
    try {
      await this.taskService.toggleTaskCompletion(taskId, !completed);
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }

  async onLogout() {
    await this.authService.logout();
  }
}