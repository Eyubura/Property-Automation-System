export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  userId: string;
}

export interface MarkReadRequest {
  notificationIds: string[];
}