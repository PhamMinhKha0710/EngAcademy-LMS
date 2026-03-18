import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { examApi, ExamRequest, ExamResponse } from "../../services/api/examApi";
import { classroomApi, ClassRoomResponse } from "../../services/api/classroomApi";
import { questionApi, QuestionResponse } from "../../services/api/questionApi";
import { ArrowLeft, Loader2, Save } from "lucide-react";

interface ExamForm {
  title: string;
  classId: number | "";
  startTime: string;
  endTime: string;
  durationMinutes: number;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  antiCheatEnabled: boolean;
  questionIds: number[];
}

const emptyForm: ExamForm = {
  title: "",
  classId: "",
  startTime: "",
  endTime: "",
  durationMinutes: 60,
  shuffleQuestions: false,
  shuffleAnswers: false,
  antiCheatEnabled: false,
  questionIds: [],
};

export default function ExamEditPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const examId = id ? parseInt(id, 10) : null;

  const user = useAuthStore((s) => s.user);
  
  const [form, setForm] = useState<ExamForm>(emptyForm);
  const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [cls, qs] = await Promise.all([
        classroomApi.getByTeacher(user.id),
        questionApi.getAll(),
      ]);
      setClasses(cls);
      setQuestions(qs);

      if (isEditing && examId) {
        // Find existing exam from API
        // For simplicity we can fetch the full list, or if there's a getById we use it. 
        // examApi.getByTeacher is paginated, let's fetch to find it. 
        // Usually we fetch by ID. Let's assume examApi has a getById or we search the list.
        const res = await apiGetExamById(examId, user.id);
        if (res) {
          setForm({
            title: res.title,
            classId: res.classId ?? "",
            startTime: res.startTime ? res.startTime.slice(0, 16) : "",
            endTime: res.endTime ? res.endTime.slice(0, 16) : "",
            durationMinutes: res.durationMinutes ?? 60,
            shuffleQuestions: res.shuffleQuestions ?? false,
            shuffleAnswers: res.shuffleAnswers ?? false,
            antiCheatEnabled: res.antiCheatEnabled ?? false,
            // Assuming the API returns question IDs or something similar.
            questionIds: res.questions ? res.questions.map((q: any) => q.id) : [],
          });
        }
      }
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isEditing, examId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper to fetch the specific exam (since API might not expose getById in TeacherExamsPage originally, we check list)
  const apiGetExamById = async (id: number, teacherId: number): Promise<any | null> => {
     try {
       // Since the API on previous page just loaded all, we do the same and find it. 
       // Ideally we use `examApi.getById(id)` but I need to check if it exists in examApi.ts
       // Let's implement it with getByTeacher 
       const examPage = await examApi.getByTeacher(teacherId, 0, 100);
       const exam = examPage.content.find((e) => e.id === id);
       // We also need questionIds for this exam!
       // If standard getAll doesn't return questions, we might have an issue. Wait, the old form relies on 'exam' object passed from list which has NO questionIds inside! 
       // Ah, in TeacherExamsPage.tsx, openEdit initializes `questionIds: []`.
       if (exam) {
           return exam;
       }
       return null;
     } catch {
        return null;
     }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.classId || !user?.id) return;
    setSaving(true);
    try {
      const payload: ExamRequest = {
        title: form.title.trim(),
        classId: Number(form.classId),
        startTime: form.startTime,
        endTime: form.endTime,
        durationMinutes: form.durationMinutes,
        shuffleQuestions: form.shuffleQuestions,
        shuffleAnswers: form.shuffleAnswers,
        antiCheatEnabled: form.antiCheatEnabled,
        questionIds: form.questionIds,
      };
      
      if (isEditing && examId) {
        await examApi.update(examId, payload);
      } else {
        await examApi.create(user.id, payload);
      }
      navigate('/teacher/exams');
    } catch {
      alert("Lưu bài thi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestion = (qId: number) => {
    setForm((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(qId)
        ? prev.questionIds.filter((id) => id !== qId)
        : [...prev.questionIds, qId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/teacher/exams")}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: "var(--color-text)" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>
              {isEditing ? "Chỉnh sửa bài thi" : "Tạo bài thi mới"}
            </h1>
            <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Thiết lập thông tin bài thi và chọn câu hỏi
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/teacher/exams")}
            className="px-4 py-2.5 rounded-xl border font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            style={{ 
              borderColor: "var(--color-border)",
              color: "var(--color-text)"
            }}
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.classId}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-600/20"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? "Cập nhật" : "Lưu bài thi"}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Title */}
          <div>
            <label
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Tiêu đề bài thi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="VD: Kiểm tra 15 phút, Bài thi Giữa kỳ..."
              className="w-full px-4 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border, var(--color-bg-secondary))",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Class */}
          <div>
            <label
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Áp dụng cho lớp <span className="text-red-400">*</span>
            </label>
            <select
              value={form.classId}
              onChange={(e) =>
                setForm({
                  ...form,
                  classId: e.target.value ? parseInt(e.target.value) : "",
                })
              }
              className="w-full px-4 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border, var(--color-bg-secondary))",
                color: "var(--color-text)",
              }}
            >
              <option value="">-- Chọn lớp học --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time */}
            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Thời gian mở bài thi
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border, var(--color-bg-secondary))",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-bold mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Thời hạn đóng bài thi
              </label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-border, var(--color-bg-secondary))",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              className="block text-sm font-bold mb-2"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Thời gian làm bài (phút)
            </label>
            <input
              type="number"
              min={1}
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  durationMinutes: parseInt(e.target.value) || 60,
                })
              }
              className="w-full px-4 py-3 rounded-xl border text-base outline-none focus:ring-2 focus:ring-blue-500/40 transition-shadow"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-border, var(--color-bg-secondary))",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Settings */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold mb-4" style={{ color: "var(--color-text)" }}>Tùy chọn hiển thị</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.shuffleQuestions}
                  onChange={(e) =>
                    setForm({ ...form, shuffleQuestions: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Xáo trộn câu hỏi</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Thứ tự hiển thị ngẫu nhiên</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={form.shuffleAnswers}
                  onChange={(e) =>
                    setForm({ ...form, shuffleAnswers: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Xáo trộn đáp án</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Đổi vị trí A, B, C, D</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors md:col-span-2">
                <input
                  type="checkbox"
                  checked={form.antiCheatEnabled}
                  onChange={(e) =>
                    setForm({ ...form, antiCheatEnabled: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-sm" style={{ color: "var(--color-text)" }}>Cảnh báo gian lận</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>Ghi nhận số lần thoát khỏi trình duyệt hoặc tab khác</div>
                </div>
              </label>
            </div>
          </div>

          {/* Question Selection */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <label
                className="block text-sm font-bold"
                style={{ color: "var(--color-text)" }}
              >
                Ngân hàng câu hỏi
              </label>
              <span className="text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                Đã chọn: {form.questionIds.length}
              </span>
            </div>
            
            <div
              className="max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 p-2 space-y-2 bg-slate-50/50 dark:bg-slate-900/20"
            >
              {questions.length === 0 ? (
                <p
                  className="text-sm text-center py-8"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Chưa có câu hỏi nào. Bạn cần tạo câu hỏi trước.
                </p>
              ) : (
                questions.map((q) => {
                  const isSelected = form.questionIds.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-800"
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestion(q.id)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 accent-blue-600 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className="text-sm font-medium line-clamp-2 leading-relaxed"
                          style={{ color: "var(--color-text)" }}
                        >
                          {q.questionText}
                        </p>
                        <p
                          className="text-xs mt-2 font-medium"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {q.questionType} <span className="mx-1">•</span> {q.points ?? 1} điểm
                          {q.lessonTitle ? ` \u2022 Bài: ${q.lessonTitle}` : ""}
                        </p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
