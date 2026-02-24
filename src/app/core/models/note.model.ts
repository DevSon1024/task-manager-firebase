export interface Note {
  id?: string;
  title: string;
  content: string; // Markdown content
  category: string; // Notebook/folder name
  tags: string[];
  taskId?: string | null; // Linked task ID
  taskTitle?: string | null; // Cached task title for display
  createdAt?: any;
  updatedAt?: any;
  userId?: string;
  color?: string | null; // Optional note card color
}
