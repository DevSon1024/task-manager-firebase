import { Component, inject, Output, EventEmitter, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { TaskService } from '../../../core/services/task.service';
import { ToastService } from '../../../core/services/toast.service';
import { Task } from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  
  @Input() task: Task | null = null;
  @Output() cancel = new EventEmitter<void>();

  // Form State
  newTask: any = {
    title: '',
    description: '',
    dueDate: '',
    tags: [] as string[],
    subtasks: [] as { title: string; completed: boolean }[],
    priority: 'medium' as 'low' | 'medium' | 'high'
  };

  // UI State
  activeTab: 'write' | 'preview' = 'write';
  availableTags = ['Work', 'Personal', 'Urgent', 'Health', 'Finance'];
  newSubtaskTitle = '';
  isSubmitting = false;

  ngOnChanges(changes: any) {
    if (changes.task && this.task) {
      // Populate form with existing task data
      this.newTask = {
        ...this.task,
        dueDate: this.task.dueDate ? (this.task.dueDate as any).toDate().toISOString().split('T')[0] : ''
      };
    }
  }

  ngOnInit() {
    // Initial setup if needed
  }

  toggleTag(tag: string) {
    if (this.newTask.tags.includes(tag)) {
      this.newTask.tags = this.newTask.tags.filter((t: string) => t !== tag);
    } else {
      this.newTask.tags.push(tag);
    }
  }

  addSubtask() {
    if (this.newSubtaskTitle.trim()) {
      this.newTask.subtasks.push({ title: this.newSubtaskTitle.trim(), completed: false });
      this.newSubtaskTitle = '';
    }
  }

  removeSubtask(index: number) {
    this.newTask.subtasks.splice(index, 1);
  }

  // Markdown Toolbar Actions
  insertMarkdown(type: string) {
    const textarea = document.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.newTask.description;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const selection = text.substring(start, end);

    let insertion = '';
    
    switch (type) {
      case 'bold': insertion = `**${selection || 'bold text'}**`; break;
      case 'italic': insertion = `*${selection || 'italic text'}*`; break;
      case 'list': insertion = `\n- ${selection || 'list item'}`; break;
      case 'link': insertion = `[${selection || 'link text'}](url)`; break;
      case 'h1': insertion = `\n# ${selection || 'Heading 1'}`; break;
      case 'h2': insertion = `\n## ${selection || 'Heading 2'}`; break;
      case 'code': insertion = `\`${selection || 'code'}\``; break;
    }

    this.newTask.description = before + insertion + after;
    
    // Defer focus restoration to allow Angular to update model
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    });
  }

  async onCustomSubmit() {
    if (!this.newTask.title.trim()) {
      this.toastService.warning('Please enter a task title');
      return;
    }

    this.isSubmitting = true;
    try {
      const dueDateObj = this.newTask.dueDate ? new Date(this.newTask.dueDate) : null;
      
      if (this.task && this.task.id) {
        // Edit Mode
        const updates = {
           ...this.newTask,
           dueDate: dueDateObj
        };
        // Remove non-updateable fields if any, generally partial update is fine
        await this.taskService.updateTask(this.task.id, updates);
        this.toastService.success('Task updated successfully');
      } else {
        // Create Mode
        await this.taskService.createTask(
          this.newTask.title,
          this.newTask.description,
          dueDateObj,
          this.newTask.tags,
          this.newTask.subtasks,
          this.newTask.priority
        );
        this.toastService.success('Task created successfully');
      }

      this.resetForm();
      this.cancel.emit(); 
    } catch (error: any) {
      console.error('Error saving task:', error);
      this.toastService.error(error.message || 'Failed to save task');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm() {
      this.newTask = { 
        title: '', 
        description: '', 
        dueDate: '',
        tags: [],
        subtasks: [],
        priority: 'medium'
      };
      this.activeTab = 'write';
  }

  onCancel() {
    this.resetForm();
    this.cancel.emit();
  }
}
