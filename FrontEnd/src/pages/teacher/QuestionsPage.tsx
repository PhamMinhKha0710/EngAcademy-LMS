import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  questionApi,
  QuestionResponse,
  QuestionRequest,
} from "../../services/api/questionApi";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Dialog from "../../components/ui/Dialog";
import Badge from "../../components/ui/Badge";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  PlusCircle,
  XCircle,
  Filter,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
}

interface OptionForm {
  optionText: string;
  isCorrect: boolean;
}

interface QuestionForm {
  lessonId: number | "";
  questionType: string;
  questionText: string;
  points: number;
  explanation: string;
  options: OptionForm[];
}

const emptyForm: QuestionForm = {
  lessonId: "",
  questionType: "MULTIPLE_CHOICE",
  questionText: "",
  points: 1,
  explanation: "",
  options: [
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ],
};

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Trắc nghiệm" },
  { value: "TRUE_FALSE", label: "Đúng / Sai" },
  { value: "FILL_IN_BLANK", label: "Điền từ" },
];

export default function QuestionsPage() {
  const [searchParams] = useSearchParams();
  const initialLessonId = searchParams.get("lessonId");

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterLesson, setFilterLesson] = useState<string>(
    initialLessonId || "",
  );
  const [filterType, setFilterType] = useState<string>("");

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<QuestionForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      /* ignore */
    }
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await questionApi.getAll();
      setQuestions(data);
    } catch {
      setError("Không thể tải danh sách câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
    fetchQuestions();
  }, [fetchLessons, fetchQuestions]);

  // Filtered questions
  const filtered = questions.filter((q) => {
    if (filterLesson && q.lessonId?.toString() !== filterLesson) return false;
    if (filterType && q.questionType !== filterType) return false;
    return true;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      lessonId: filterLesson ? parseInt(filterLesson) : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (q: QuestionResponse) => {
    setEditingId(q.id);
    setForm({
      lessonId: q.lessonId ?? "",
      questionType: q.questionType,
      questionText: q.questionText,
      points: q.points ?? 1,
      explanation: q.explanation ?? "",
      options: q.options.map((o) => ({
        optionText: o.optionText,
        isCorrect: o.isCorrect,
      })),
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.questionText.trim()) return;
    setSaving(true);
    try {
      const payload: QuestionRequest = {
        lessonId: form.lessonId ? Number(form.lessonId) : undefined,
        questionType: form.questionType,
        questionText: form.questionText,
        points: form.points,
        explanation: form.explanation || undefined,
        options: form.options.filter((o) => o.optionText.trim()),
      };
      if (editingId) {
        await questionApi.update(editingId, payload);
      } else {
        await questionApi.create(payload);
      }
      setDialogOpen(false);
      await fetchQuestions();
    } catch {
      alert("Lưu câu hỏi thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await questionApi.delete(id);
      await fetchQuestions();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  // Option helpers
  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { optionText: "", isCorrect: false }],
    });
  };

  const removeOption = (idx: number) => {
    setForm({ ...form, options: form.options.filter((_, i) => i !== idx) });
  };

  const updateOption = (
    idx: number,
    field: keyof OptionForm,
    value: string | boolean,
  ) => {
    const opts = [...form.options];
    opts[idx] = { ...opts[idx], [field]: value };
    setForm({ ...form, options: opts });
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
        <button
          onClick={fetchQuestions}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const columns = [
    {
      key: "questionText",
      label: "Câu hỏi",
      render: (item: Record<string, unknown>) => {
        const text = item.questionText as string;
        return (
          <span className="font-medium" style={{ color: "var(--color-text)" }}>
            {text.length > 80 ? text.slice(0, 80) + "…" : text}
          </span>
        );
      },
    },
    {
      key: "questionType",
      label: "Loại",
      render: (item: Record<string, unknown>) => {
        const type = item.questionType as string;
        const variant =
          type === "MULTIPLE_CHOICE"
            ? "info"
            : type === "TRUE_FALSE"
              ? "success"
              : "warning";
        const label =
          QUESTION_TYPES.find((t) => t.value === type)?.label || type;
        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: "points",
      label: "Điểm",
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {(item.points as number) ?? 1}
        </span>
      ),
    },
    {
      key: "lessonTitle",
      label: "Bài học",
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {(item.lessonTitle as string) || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const q = item as unknown as QuestionResponse;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(q);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(q.id);
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
    <div className="p-6 lg:p-8 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-full">
      <section className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1
              className="text-2xl md:text-3xl font-black"
              style={{ color: "var(--color-text)" }}
            >
              Ngân hàng câu hỏi
            </h1>
            <p
              className="mt-2 text-sm md:text-base"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Quản lý, lọc và cập nhật câu hỏi theo bài học.
            </p>
          </div>
          {/* <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo câu hỏi
          </button> */}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl  text-white font-semibold  transition-colors shadow-sm"
            style={{
              backgroundColor: " rgb(244 157 37 / var(--tw-bg-opacity, 1))",
            }}
          >
            <Plus className="w-4 h-4" />
            Tạo câu hỏi
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex items-center gap-2 text-sm font-semibold"
            style={{ color: "var(--color-text-secondary)" }}
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </div>
          <select
            value={filterLesson}
            onChange={(e) => setFilterLesson(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[220px] bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
            style={{ color: "var(--color-text)" }}
          >
            <option value="">Tất cả bài học</option>
            {lessons.map((l) => (
              <option key={l.id} value={l.id}>
                {l.title}
              </option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 min-w-[180px] bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700"
            style={{ color: "var(--color-text)" }}
          >
            <option value="">Tất cả loại</option>
            {QUESTION_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="ml-auto text-sm font-medium text-slate-500">
            {filtered.length} câu hỏi
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:p-5 shadow-sm">
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage="Không tìm thấy câu hỏi nào"
        />
      </section>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
        footer={
          <>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700/50"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.questionText.trim()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? "Cập nhật" : "Tạo mới"}
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Lesson select */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Bài học
            </label>
            <select
              value={form.lessonId}
              onChange={(e) =>
                setForm({
                  ...form,
                  lessonId: e.target.value ? parseInt(e.target.value) : "",
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            >
              <option value="">-- Chọn bài học --</option>
              {lessons.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.title}
                </option>
              ))}
            </select>
          </div>

          {/* Question type */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Loại câu hỏi
            </label>
            <select
              value={form.questionType}
              onChange={(e) =>
                setForm({ ...form, questionType: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            >
              {QUESTION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Question text */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Nội dung câu hỏi <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={3}
              value={form.questionText}
              onChange={(e) =>
                setForm({ ...form, questionText: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Points */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Điểm
            </label>
            <input
              type="number"
              min={1}
              value={form.points}
              onChange={(e) =>
                setForm({ ...form, points: parseInt(e.target.value) || 1 })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Explanation */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Giải thích
            </label>
            <textarea
              rows={2}
              value={form.explanation}
              onChange={(e) =>
                setForm({ ...form, explanation: e.target.value })
              }
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30 resize-y"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            />
          </div>

          {/* Options builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                className="text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Đáp án
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Thêm đáp án
              </button>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={(e) =>
                        updateOption(idx, "isCorrect", e.target.checked)
                      }
                      className="w-4 h-4 rounded border-slate-600 accent-emerald-600"
                    />
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Đúng
                    </span>
                  </label>
                  <input
                    type="text"
                    value={opt.optionText}
                    onChange={(e) =>
                      updateOption(idx, "optionText", e.target.value)
                    }
                    placeholder={`Đáp án ${idx + 1}`}
                    className="flex-1 px-3 py-2 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      borderColor: "var(--color-bg-secondary)",
                      color: "var(--color-text)",
                    }}
                  />
                  {form.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-1 rounded text-red-400 hover:bg-red-500/15 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
