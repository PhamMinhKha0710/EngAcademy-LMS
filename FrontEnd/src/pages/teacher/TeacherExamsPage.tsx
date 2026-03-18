import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { examApi, ExamResponse } from "../../services/api/examApi";

import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import {
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Send,
  Lock,
  BarChart3,
  Clock,
  Megaphone,
  CheckCircle2,
} from "lucide-react";



export default function TeacherExamsPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [exams, setExams] = useState<ExamResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const examPage = await examApi.getByTeacher(user.id, 0, 100);
      setExams(examPage.content);
    } catch {
      setError("Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    navigate("/teacher/exams/new");
  };

  const openEdit = (exam: ExamResponse) => {
    navigate(`/teacher/exams/${exam.id}/edit`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài thi này?")) return;
    try {
      await examApi.delete(id);
      await fetchData();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  const handlePublish = async (id: number) => {
    if (!confirm("Phát hành bài thi?")) return;
    try {
      await examApi.publish(id);
      await fetchData();
    } catch {
      alert("Phát hành thất bại.");
    }
  };

  const handleClose = async (id: number) => {
    if (!confirm("Đóng bài thi?")) return;
    try {
      await examApi.close(id);
      await fetchData();
    } catch {
      alert("Đóng thất bại.");
    }
  };

  const handlePublishScores = async (id: number) => {
    if (!confirm("Công bố điểm để học sinh xem kết quả?")) return;
    try {
      await examApi.publishScores(id);
      await fetchData();
    } catch {
      alert("Công bố điểm thất bại.");
    }
  };



  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
        <button
          onClick={fetchData}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <Badge variant="success">Đang mở</Badge>;
      case "CLOSED":
        return <Badge variant="danger">Đã đóng</Badge>;
      default:
        return <Badge variant="warning">Nháp</Badge>;
    }
  };

  const formatDateTime = (dt?: string) => {
    if (!dt) return "—";
    return new Date(dt).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columns = [
    {
      key: "title",
      label: "Tiêu đề",
      render: (item: Record<string, unknown>) => (
        <span className="font-medium" style={{ color: "var(--color-text)" }}>
          {item.title as string}
        </span>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (item: Record<string, unknown>) =>
        statusBadge(item.status as string),
    },
    {
      key: "className",
      label: "Lớp",
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {(item.className as string) || "—"}
        </span>
      ),
    },
    {
      key: "startTime",
      label: "Bắt đầu",
      render: (item: Record<string, unknown>) => (
        <span
          className="text-xs flex items-center gap-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          <Clock className="w-3 h-3" />
          {formatDateTime(item.startTime as string)}
        </span>
      ),
    },
    {
      key: "submittedCount",
      label: "Đã nộp",
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {(item.submittedCount as number) ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const exam = item as unknown as ExamResponse;
        return (
          <div className="flex items-center gap-1">
            {exam.status === "DRAFT" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePublish(exam.id);
                }}
                className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                title="Phát hành"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
            {exam.status === "PUBLISHED" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose(exam.id);
                }}
                className="p-2 rounded-lg hover:bg-orange-500/15 text-orange-400 transition-colors"
                title="Đóng bài thi"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}
            {(exam.status === "PUBLISHED" || exam.status === "CLOSED") &&
              !exam.scorePublished && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePublishScores(exam.id);
                  }}
                  className="p-2 rounded-lg hover:bg-violet-500/15 text-violet-400 transition-colors"
                  title="Công bố điểm"
                >
                  <Megaphone className="w-4 h-4" />
                </button>
              )}
            {Boolean(exam.scorePublished) && (
              <span
                className="p-2 rounded-lg text-emerald-400"
                title="Đã công bố điểm"
              >
                <CheckCircle2 className="w-4 h-4" />
              </span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/exams/${exam.id}/results`);
              }}
              className="p-2 rounded-lg hover:bg-blue-500/15 text-blue-400 transition-colors"
              title="Xem kết quả"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(exam);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(exam.id);
              }}
              className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
              title="Xóa"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Quản lý bài thi
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {exams.length} bài thi
          </p>
        </div>
        {/* <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                
                > */}
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl  text-white font-medium  transition-colors"
          style={{
            backgroundColor: " rgb(244 157 37 / var(--tw-bg-opacity, 1))",
          }}
        >
          <Plus className="w-4 h-4" />
          Tạo bài thi
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={exams as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="Chưa có bài thi nào"
      />

    </div>
  );
}
