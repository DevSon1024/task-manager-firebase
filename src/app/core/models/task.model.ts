import { Timestamp } from "firebase/firestore";

export interface Task {
  id?: string;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  userId: string;
}
