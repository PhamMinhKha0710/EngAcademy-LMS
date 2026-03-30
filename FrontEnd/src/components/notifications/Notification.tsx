import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../../store/authStore";
import api from "../../services/api/axios";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationComponent = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Setting up WebSocket for user:', user?.username);
    // Initial fetch
    fetchNotifications();
    fetchUnreadCount();

    // WebSocket setup
    const socket = new SockJS('/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      onConnect: (frame) => {
        console.log('Connected to STOMP broker:', frame);

        const destination = `/topic/notifications/${user?.username}`;
        console.log('Subscribing to:', destination);

        stompClient.subscribe(destination, (message) => {
          console.log('Received notification message:', message.body);
          const newNotification = JSON.parse(message.body);
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP Error:', frame.headers['message']);
        console.error('STOMP Details:', frame.body);
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
      },
      debug: (str) => {
        console.log('STOMP Debug:', str);
      },
    });

    stompClient.activate();

    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      stompClient.deactivate();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user?.username]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/me');
      if (response.data.success) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/me/unread-count');
      if (response.data.success) {
        setUnreadCount(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch unread count", error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/me/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/me/read-all');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true })),
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Thông báo</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Đọc tất cả
                </button>
              )}
              <span className="text-xs text-gray-500">
                {unreadCount} chưa đọc
              </span>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Không có thông báo nào
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    markAsRead(notification.id);
                    setIsOpen(false);
                    navigate(`/notifications/${notification.id}`);
                  }}
                  className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${!notification.isRead ? "bg-blue-50/30" : ""
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p
                        className={`text-sm ${!notification.isRead ? "font-bold" : "font-medium"} text-gray-900 line-clamp-1`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(notification.createdAt).toLocaleString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationComponent;
