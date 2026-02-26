import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { NoteService } from '../../core/services/note.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { Note } from '../../core/models/note.model';
import { Task } from '../../core/models/task.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  host: { style: 'display: block; height: 100%;' }
})
export class NotesComponent implements OnInit, OnDestroy {
  private noteService = inject(NoteService);
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  notes: Note[] = [];
  tasks: Task[] = [];
  filteredNotes: Note[] = [];
  categories: string[] = [];

  // Sidebar filter state
  selectedCategory: string = 'All Notes';
  searchQuery: string = '';

  // Editor state
  isEditorOpen = false;
  editingNote: Note | null = null;
  isNewNote = false;

  // Note form
  noteForm: Partial<Note> = {
    title: '',
    content: '',
    category: 'General',
    tags: [],
    taskId: null,
    color: null
  };

  activeEditorTab: 'write' | 'preview' = 'write';
  newTagInput = '';
  isSubmitting = false;

  availableColors: { label: string; value: string | null; class: string }[] = [
    { label: 'None', value: null, class: 'bg-white border-2 border-gray-300' },
    { label: 'Yellow', value: 'yellow', class: 'bg-yellow-100' },
    { label: 'Blue', value: 'blue', class: 'bg-blue-100' },
    { label: 'Green', value: 'green', class: 'bg-green-100' },
    { label: 'Purple', value: 'purple', class: 'bg-purple-100' },
    { label: 'Pink', value: 'pink', class: 'bg-pink-100' },
  ];

  private notesSubscription?: Subscription;
  private tasksSubscription?: Subscription;
  private routeSub?: Subscription;

  ngOnInit(): void {
    this.notesSubscription = this.noteService.getUserNotes().subscribe(notes => {
      this.notes = notes;
      this.buildCategories();
      this.applyFilters();
    });

    this.tasksSubscription = this.taskService.getUserTasks().subscribe(tasks => {
      this.tasks = tasks;
    });

    // Check for open note in query params
    this.routeSub = this.route.queryParams.subscribe(params => {
       const openNoteId = params['open'];
       if (openNoteId && this.notes.length > 0) {
          const targetNote = this.notes.find(n => n.id === openNoteId);
          if (targetNote && this.editingNote?.id !== targetNote.id) {
             this.openEditNote(targetNote);
             // Default to preview mode for "viewing"
             this.activeEditorTab = 'preview'; 
          }
       }
    });
  }

  ngOnDestroy(): void {
    this.notesSubscription?.unsubscribe();
    this.tasksSubscription?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  buildCategories(): void {
    const cats = [...new Set(this.notes.map(n => n.category || 'General'))];
    this.categories = cats.sort();
  }

  applyFilters(): void {
    let result = [...this.notes];

    if (this.selectedCategory !== 'All Notes') {
      result = result.filter(n => (n.category || 'General') === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    this.filteredNotes = result;
  }

  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  openNewNote(taskId?: string, taskTitle?: string): void {
    this.isNewNote = true;
    this.editingNote = null;
    this.noteForm = {
      title: '',
      content: '',
      category: this.selectedCategory !== 'All Notes' ? this.selectedCategory : 'General',
      tags: [],
      taskId: taskId || null,
      taskTitle: taskTitle || null,
      color: null
    };
    this.activeEditorTab = 'write';
    this.isEditorOpen = true;
  }

  openEditNote(note: Note): void {
    this.isNewNote = false;
    this.editingNote = note;
    this.noteForm = { ...note, tags: [...(note.tags || [])] };
    this.activeEditorTab = 'write';
    this.isEditorOpen = true;
  }

  closeEditor(): void {
    this.isEditorOpen = false;
    this.editingNote = null;
    this.isNewNote = false;
    
    // Clear query params if any
    if (this.route.snapshot.queryParams['open']) {
       this.router.navigate([], { queryParams: { open: null }, queryParamsHandling: 'merge' });
    }
  }

  addTag(): void {
    const tag = this.newTagInput.trim();
    if (tag && !(this.noteForm.tags || []).includes(tag)) {
      this.noteForm.tags = [...(this.noteForm.tags || []), tag];
    }
    this.newTagInput = '';
  }

  removeTag(tag: string): void {
    this.noteForm.tags = (this.noteForm.tags || []).filter(t => t !== tag);
  }

  insertMarkdown(type: string): void {
    const textarea = document.querySelector('.note-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = this.noteForm.content || '';
    const before = text.substring(0, start);
    const after = text.substring(end);
    const selection = text.substring(start, end);

    const insertions: Record<string, string> = {
      bold: `**${selection || 'bold text'}**`,
      italic: `*${selection || 'italic text'}*`,
      h1: `\n# ${selection || 'Heading 1'}`,
      h2: `\n## ${selection || 'Heading 2'}`,
      h3: `\n### ${selection || 'Heading 3'}`,
      list: `\n- ${selection || 'item'}`,
      checklist: `\n- [ ] ${selection || 'task item'}`,
      link: `[${selection || 'link text'}](url)`,
      code: `\`${selection || 'code'}\``,
      codeblock: `\n\`\`\`\n${selection || 'code block'}\n\`\`\``,
      quote: `\n> ${selection || 'quote'}`,
      hr: `\n---\n`,
    };

    const insertion = insertions[type] || '';
    this.noteForm.content = before + insertion + after;

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + insertion.length, start + insertion.length);
    });
  }

  async saveNote(): Promise<void> {
    if (!this.noteForm.title?.trim()) {
      this.toastService.warning('Please enter a note title');
      return;
    }

    this.isSubmitting = true;
    try {
      if (this.editingNote?.id) {
        await this.noteService.updateNote(this.editingNote.id, this.noteForm);
        this.toastService.success('Note updated');
      } else {
        await this.noteService.createNote(this.noteForm);
        this.toastService.success('Note created');
      }
      this.closeEditor();
    } catch (err: any) {
      this.toastService.error(err.message || 'Failed to save note');
    } finally {
      this.isSubmitting = false;
    }
  }

  async deleteNote(note: Note, event: Event): Promise<void> {
    event.stopPropagation();
    if (!confirm(`Delete "${note.title}"?`)) return;
    try {
      await this.noteService.deleteNote(note.id!);
      this.toastService.success('Note deleted');
    } catch (err: any) {
      this.toastService.error('Failed to delete note');
    }
  }

  getCardColorClass(color?: string | null): string {
    const map: Record<string, string> = {
      yellow: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      pink: 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800',
    };
    return color ? (map[color] || 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700') 
                 : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  }

  formatDate(ts: any): string {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  getLinkedTaskTitle(taskId?: string | null): string {
    if (!taskId) return '';
    const task = this.tasks.find(t => t.id === taskId);
    return task?.title || 'Linked Task';
  }

  countInCategory(cat: string): number {
    return this.notes.filter(n => (n.category || 'General') === cat).length;
  }

  getColorPickerClass(color: string | null | undefined): string {
    const map: Record<string, string> = {
      yellow: 'bg-yellow-200',
      blue: 'bg-blue-200',
      green: 'bg-green-200',
      purple: 'bg-purple-200',
      pink: 'bg-pink-200',
    };
    return color ? (map[color] || 'bg-white border border-gray-300') : 'bg-white border border-gray-300';
  }
}
