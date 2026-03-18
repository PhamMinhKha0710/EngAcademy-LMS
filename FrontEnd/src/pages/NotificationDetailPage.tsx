import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bell, ArrowLeft, Clock, Calendar, CheckCircle } from "lucide-react";
import api from "../services/api/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  imageUrl?: string;
  createdAt: string;
}

const NotificationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        // Since there is no single notification fetch endpoint yet, we might need to fetch all and filter
        // or add a new endpoint. For now, let's assume we fetch by ID if possible, 
        // or fetch all and find the one.
        // Better: I'll add a getSingleNotification endpoint in Backend later if needed, 
        // but often we just mark as read on visit.
        
        // Actually, let's just fetch all and filter for now to avoid too many backend changes
        const response = await api.get(`/notifications/user/me`);
        const list = response.data.data;
        const found = list.find((n: Notification) => n.id === Number(id));
        
        if (found) {
          setNotification(found);
          if (!found.isRead) {
            await api.put(`/notifications/${id}/read`);
          }
        }
      } catch (error) {
        console.error("Failed to fetch notification detail", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotification();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800">Không tìm thấy thông báo</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 flex items-center justify-center gap-2 mx-auto text-blue-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-blue-50/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{notification.title}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(notification.createdAt), "dd MMMM, yyyy", { locale: vi })}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(new Date(notification.createdAt), "HH:mm", { locale: vi })}
                  </div>
                </div>
              </div>
            </div>
            {notification.isRead && (
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                Đã đọc
              </div>
            )}
          </div>
        </div>

        <div className="p-8">
          {notification.imageUrl && (
            <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 max-h-[400px]">
              <img
                src={notification.imageUrl}
                alt={notification.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="prose prose-blue max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailPage;
