import { EventEmitter } from 'eventemitter3';

export type NotificationType =
  | 'sync-success'
  | 'sync-failure'
  | 'sync-progress';

export interface NotificationPayload {
  type: NotificationType;
  message: string;
}

class NotificationService extends EventEmitter {
  notify(payload: NotificationPayload) {
    this.emit('notify', payload);
  }
}

const notificationService = new NotificationService();

export default notificationService;
