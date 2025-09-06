import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

// Types for notification system
export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // Auto-dismiss duration in ms, 0 = no auto-dismiss
}

interface NotificationContextType {
  notifications: Notification[];
  showNotification: (notification: Omit<Notification, "id">) => void;
  hideNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

// Custom hook to use notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

// Notification Provider Component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000, // Default 5 seconds
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-dismiss if duration is set
      if (newNotification.duration > 0) {
        setTimeout(() => {
          hideNotification(id);
        }, newNotification.duration);
      }
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onHide={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

// Notification Container Component
interface NotificationContainerProps {
  notifications: Notification[];
  onHide: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  onHide,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[70] space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onHide={onHide}
        />
      ))}
    </div>
  );
};

// Individual Notification Item Component
interface NotificationItemProps {
  notification: Notification;
  onHide: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onHide,
}) => {
  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700",
          icon: "text-green-400",
          title: "text-green-800 dark:text-green-200",
          message: "text-green-700 dark:text-green-300",
        };
      case "error":
        return {
          container:
            "bg-red-50 dark:bg-red-900 border-red-200 dark:border-red-700",
          icon: "text-red-400",
          title: "text-red-800 dark:text-red-200",
          message: "text-red-700 dark:text-red-300",
        };
      case "warning":
        return {
          container:
            "bg-yellow-50 dark:bg-yellow-900 border-yellow-200 dark:border-yellow-700",
          icon: "text-yellow-400",
          title: "text-yellow-800 dark:text-yellow-200",
          message: "text-yellow-700 dark:text-yellow-300",
        };
      case "info":
        return {
          container:
            "bg-blue-50 dark:bg-blue-900 border-blue-200 dark:border-blue-700",
          icon: "text-blue-400",
          title: "text-blue-800 dark:text-blue-200",
          message: "text-blue-700 dark:text-blue-300",
        };
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "error":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        );
      case "info":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
    }
  };

  const styles = getNotificationStyles(notification.type);

  return (
    <div
      className={`${styles.container} border rounded-lg p-4 shadow-lg transform transition-all duration-300 ease-in-out`}
      role="alert"
    >
      <div className="flex items-start">
        <div className={`${styles.icon} flex-shrink-0 mr-3`}>
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`${styles.title} text-sm font-medium`}>
            {notification.title}
          </h4>
          <p className={`${styles.message} text-sm mt-1`}>
            {notification.message}
          </p>
        </div>
        <button
          onClick={() => onHide(notification.id)}
          className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Convenience functions for common notification types
export const useNotificationHelpers = () => {
  const { showNotification } = useNotifications();

  return {
    showSuccess: (title: string, message: string, duration?: number) =>
      showNotification({ type: "success", title, message, duration }),
    showError: (title: string, message: string, duration?: number) =>
      showNotification({ type: "error", title, message, duration }),
    showWarning: (title: string, message: string, duration?: number) =>
      showNotification({ type: "warning", title, message, duration }),
    showInfo: (title: string, message: string, duration?: number) =>
      showNotification({ type: "info", title, message, duration }),
  };
};
