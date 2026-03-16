import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Dialog from "../../components/ui/Dialog";
import Badge from "../../components/ui/Badge";
import EmptyState from "../../components/ui/EmptyState";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import { 
  ClassicEditor, Essentials, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  Paragraph, Heading, FontFamily, FontSize, FontColor, FontBackgroundColor,
  Alignment, List, ListProperties, TodoList, Link, BlockQuote, Table, TableToolbar, 
  MediaEmbed, Image, ImageUpload, Undo, Highlight, HorizontalLine, Autoformat, 
  Indent, IndentBlock, Code, CodeBlock
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { vocabularyApi, VocabularyResponse } from "../../services/api/vocabularyApi";
import { questionApi, QuestionResponse } from "../../services/api/questionApi";
import {
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  FileText,
  Star,
  Dumbbell,
  Book,
  HelpCircle,
  Loader2,
  AlertTriangle,
  Volume2,
  Check,
  Inbox,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  contentHtml?: string;
  grammarHtml?: string;
  difficultyLevel?: number;
  orderIndex?: number;
  isPublished?: boolean;
  vocabularyCount?: number;
  questionCount?: number;
}

interface LessonForm {
  title: string;
  contentHtml: string;
  grammarHtml: string;
  difficultyLevel: number;
  orderIndex: number;
  isPublished: boolean;
}

const emptyForm: LessonForm = {
  title: "",
  contentHtml: "",
  grammarHtml: "",
  difficultyLevel: 1,
  orderIndex: 0,
  isPublished: false,
};

export default function TeacherLessonsPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extra data for Review
  const [vocabs, setVocabs] = useState<VocabularyResponse[]>([]);
  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [extrasLoading, setExtrasLoading] = useState(false);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LessonForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Editor Modes
  const [isRawContent, setIsRawContent] = useState(false);
  const [isRawGrammar, setIsRawGrammar] = useState(false);

  // Review System
  const [activeTab, setActiveTab] = useState<"edit" | "review">("edit");
  const [reviewSubTab, setReviewSubTab] = useState<"content" | "grammar" | "vocabulary" | "practice">("content");
  const [showSaveReview, setShowSaveReview] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      setError("Không thể tải danh sách bài học.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const openCreate = () => {
    setEditingId(null);
    setVocabs([]);
    setQuestions([]);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const fetchLessonExtras = async (lessonId: number) => {
    setExtrasLoading(true);
    try {
      const [vData, qData] = await Promise.all([
        vocabularyApi.getByLesson(lessonId),
        questionApi.getByLesson(lessonId)
      ]);
      setVocabs(vData || []);
      setQuestions(qData || []);
    } catch (err) {
      console.error("Failed to fetch extras:", err);
    } finally {
      setExtrasLoading(false);
    }
  };

  const openEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    fetchLessonExtras(lesson.id);
    setForm({
      title: lesson.title,
      contentHtml: lesson.contentHtml || "",
      grammarHtml: lesson.grammarHtml || "",
      difficultyLevel: lesson.difficultyLevel ?? 1,
      orderIndex: lesson.orderIndex ?? 0,
      isPublished: lesson.isPublished ?? false,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    setShowSaveReview(true);
  };

  const confirmSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/lessons/${editingId}`, form);
      } else {
        await api.post("/lessons", form);
      }
      setShowSaveReview(false);
      setDialogOpen(false);
      await fetchLessons();
    } catch {
      alert("Lưu bài học thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài học này?")) return;
    try {
      await api.delete(`/lessons/${id}`);
      await fetchLessons();
    } catch {
      alert("Xóa thất bại.");
    }
  };

  if (error && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <AlertTriangle className="w-10 h-10 text-red-400" />
        <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
        <button
          onClick={fetchLessons}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

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
      key: "difficultyLevel",
      label: "Độ khó",
      render: (item: Record<string, unknown>) => {
        const lvl = (item.difficultyLevel as number) || 1;
        return (
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i < lvl ? "bg-blue-400" : "bg-slate-600"}`}
              />
            ))}
            <span
              className="ml-1 text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {lvl}/5
            </span>
          </div>
        );
      },
    },
    {
      key: "isPublished",
      label: "Trạng thái",
      render: (item: Record<string, unknown>) => (
        <Badge variant={item.isPublished ? "success" : "warning"}>
          {item.isPublished ? "Đã xuất bản" : "Nháp"}
        </Badge>
      ),
    },
    {
      key: "orderIndex",
      label: "Thứ tự",
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {(item.orderIndex as number) ?? 0}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (item: Record<string, unknown>) => {
        const lesson = item as unknown as Lesson;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/vocabulary?lessonId=${lesson.id}`);
              }}
              className="p-2 rounded-lg hover:bg-blue-500/15 text-blue-400 transition-colors"
              title="Từ vựng"
            >
              <BookOpen className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/teacher/questions?lessonId=${lesson.id}`);
              }}
              className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400 transition-colors"
              title="Câu hỏi"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(lesson);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title="Sửa"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(lesson.id);
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
            Quản lý bài học
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {lessons.length} bài học
          </p>
        </div>
        {/* <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tạo bài học
                </button> */}

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl  text-white font-medium  transition-colors"
          style={{
            backgroundColor: " rgb(244 157 37 / var(--tw-bg-opacity, 1))",
          }}
        >
          <Plus className="w-4 h-4" />
          Tạo bài học
        </button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={lessons as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="Chưa có bài học nào"
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? "Chỉnh sửa bài học" : "Tạo bài học mới"}
        maxWidth="4xl"
        className="lesson-editor-dialog group/editor"
        footer={
          <>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
              className="px-10 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold uppercase tracking-widest hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-xl shadow-blue-500/20 dark:shadow-2xl dark:shadow-blue-500/30 active:scale-105"
            >
              Xem lại & Lưu cập nhật
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Tab Selector */}
          <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800/50 mb-4 px-2">
            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-4 px-4 text-[13px] font-bold tracking-widest transition-all relative group ${
                activeTab === "edit" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              BÀI GIẢNG SỐ
              {activeTab === "edit" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_-4px_10px_rgba(59,130,246,0.3)] dark:shadow-[0_-4px_10px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("review")}
              className={`pb-4 px-4 text-[13px] font-bold tracking-widest transition-all relative group ${
                activeTab === "review" ? "text-blue-600 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
            >
              XEM TRƯỚC (REVIEW)
              {activeTab === "review" && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_-4px_10px_rgba(168,85,247,0.3)] dark:shadow-[0_-4px_10px_rgba(168,85,247,0.5)]"></div>
              )}
            </button>
          </div>

          {activeTab === "edit" ? (
            <div className="-mx-6 -mb-6 mt-4 p-8 bg-slate-50/50 dark:bg-[#0f172a] min-h-[700px] space-y-10 relative overflow-hidden transition-colors duration-500">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05] dark:opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600 rounded-full blur-[140px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700 rounded-full blur-[140px]"></div>
                </div>

                {/* Top Section: Basic Info */}
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 p-10 rounded-[2.5rem] bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] group hover:border-blue-500/20 dark:hover:border-white/10 transition-all duration-500">
                    {/* Title */}
                    <div className="md:col-span-12 lg:col-span-6 space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase  text-slate-500 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            TIÊU ĐỀ BÀI HỌC <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative group/input">
                            <input
                                type="text"
                                placeholder="Nhập tiêu đề bài học ấn tượng..."
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-slate-800/50 text-slate-900 dark:text-white text-base font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner placeholder:text-slate-400 dark:placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div className="md:col-span-4 lg:col-span-2 space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase  text-slate-500 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            ĐỘ KHÓ
                        </label>
                        <div className="relative">
                            <select
                                value={form.difficultyLevel}
                                onChange={(e) => setForm({ ...form, difficultyLevel: parseInt(e.target.value) })}
                                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-slate-800/50 text-slate-900 dark:text-white text-base font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer"
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Mức {n}</option>
                                ))}
                            </select>
                            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <Plus className="w-4 h-4 rotate-45" />
                            </div>
                        </div>
                    </div>

                    {/* Order */}
                    <div className="md:col-span-4 lg:col-span-2 space-y-3">
                        <label className="flex items-center gap-2 text-[11px] font-bold uppercase  text-slate-500 dark:text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            THỨ TỰ
                        </label>
                        <input
                            type="number"
                            min={0}
                            value={form.orderIndex}
                            onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-black/40 border-2 border-slate-100 dark:border-slate-800/50 text-slate-900 dark:text-white text-base font-bold outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                        />
                    </div>

                    {/* Published Status */}
                    <div className="md:col-span-4 lg:col-span-2 flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-5 cursor-pointer group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={form.isPublished}
                                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-16 h-8 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-slate-400 dark:after:bg-slate-500 after:rounded-full after:h-[24px] after:w-[24px] after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white shadow-md dark:shadow-lg"></div>
                            </div>
                            <span className="text-[12px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                Xuất bản
                            </span>
                        </label>
                    </div>
                </div>

          <style>{`
            .lesson-editor-dialog {
                background-color: white !important;
                border-color: #e2e8f0 !important;
            }
            .dark .lesson-editor-dialog {
                background-color: #0f172a !important;
                border-color: #1e293b !important;
            }
            .lesson-editor-dialog h2 {
                color: #0f172a !important;
                font-weight: 700 !important;
                letter-spacing: -0.01em;
                font-family: 'Spline Sans', system-ui, sans-serif !important;
            }
            .dark .lesson-editor-dialog h2 {
                color: #f8fafc !important;
            }
            .lesson-editor-dialog .border-b, 
            .lesson-editor-dialog .border-t {
                border-color: #f1f5f9 !important;
            }
            .dark .lesson-editor-dialog .border-b, 
            .dark .lesson-editor-dialog .border-t {
                border-color: rgba(255, 255, 255, 0.05) !important;
            }
            .lesson-editor-dialog button svg {
                color: #94a3b8 !important;
            }
            .lesson-editor-dialog button:hover svg {
                color: #475569 !important;
            }
            .dark .lesson-editor-dialog button:hover svg {
                color: #f8fafc !important;
            }
            
            .ck-editor__editable_inline {
              min-height: 450px;
              color: #1e293b;
              background-color: white !important;
              padding: 40px 60px !important;
              font-size: 16px;
              line-height: 1.6;
              font-family: 'Spline Sans', system-ui, -apple-system, sans-serif;
              border: none !important;
            }
            .dark .ck-editor__editable_inline {
                color: #f8fafc;
                background-color: #020617 !important;
            }
            .ck-editor__editable_inline p {
              margin-bottom: 1.2em;
            }
            .ck.ck-editor__main>.ck-editor__editable:not(.ck-focused) {
              border: none !important;
            }
            .ck.ck-editor__main>.ck-editor__editable.ck-focused {
              border: none !important;
              box-shadow: inset 0 0 0 2px #3b82f6;
            }
            .ck.ck-toolbar {
              border-top-left-radius: 24px !important;
              border-top-right-radius: 24px !important;
              background-color: #f8fafc !important;
              border: 1px solid #e2e8f0 !important;
              border-bottom: none !important;
              padding: 10px 16px !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
            }
            .dark .ck.ck-toolbar {
              background-color: #1e293b !important;
              border: 1px solid #334155 !important;
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
            }
            .ck.ck-toolbar__items {
              flex-wrap: wrap !important;
              gap: 6px;
            }
            .ck.ck-button {
              color: #64748b !important;
              border-radius: 10px !important;
              transition: all 0.2s !important;
            }
            .dark .ck.ck-button {
                color: #94a3b8 !important;
            }
            .ck.ck-button:hover {
              background: #f1f5f9 !important;
              color: #1e293b !important;
            }
            .dark .ck.ck-button:hover {
                background: #334155 !important;
                color: #f8fafc !important;
            }
            .ck.ck-button.ck-on {
              background: #3b82f6 !important;
              color: #ffffff !important;
            }
            .ck.ck-content {
              border-bottom-left-radius: 24px !important;
              border-bottom-right-radius: 24px !important;
              border: 1px solid #e2e8f0 !important;
              overflow: hidden;
            }
            .dark .ck.ck-content {
                border: 1px solid #334155 !important;
            }
            .ck-editor {
              filter: drop-shadow(0 25px 30px rgba(0, 0, 0, 0.3));
            }
            .shadow-input {
              box-shadow: inset 0 2px 10px 0 rgba(0, 0, 0, 0.02);
            }
            .dark .shadow-input {
                box-shadow: inset 0 2px 10px 0 rgba(0, 0, 0, 0.4);
            }
            .raw-html-textarea {
                width: 100%;
                min-height: 450px;
                padding: 40px 60px;
                background-color: white;
                color: #0369a1;
                font-family: 'Fira Code', 'Cascadia Code', monospace;
                font-size: 14px;
                line-height: 1.6;
                border: none;
                resize: vertical;
                outline: none;
            }
            .dark .raw-html-textarea {
                background-color: #020617;
                color: #38bdf8;
            }
            .mode-toggle-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 16px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: 800;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .mode-toggle-btn.active {
                background: #3b82f6;
                color: white;
                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
            }
            .dark .mode-toggle-btn.active {
                box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
            }
            .mode-toggle-btn.inactive {
                color: #94a3b8;
            }
            .dark .mode-toggle-btn.inactive {
                color: #64748b;
            }
            .mode-toggle-btn.inactive:hover {
                color: #94a3b8;
                background: white/5;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.8);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(0, 0, 0, 0.05);
                box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.05);
            }
            .dark .glass-card {
                background: rgba(30, 41, 59, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.08);
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }
            .section-label {
                background: linear-gradient(90deg, #2563eb, #7c3aed);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                font-weight: 700;
            }
            .dark .section-label {
                background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            }
          `}</style>

          {/* Editors Section */}
          <div className="grid grid-cols-1 gap-12">
            {/* Content editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* <div className="w-3 h-10 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.2)] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]"></div> */}
                  <label className="text-sm font-bold  uppercase text-slate-800 dark:text-white/90">
                    Nội dung bài giảng
                  </label>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700/30">
                  <button 
                    onClick={() => setIsRawContent(false)}
                    className={`mode-toggle-btn ${!isRawContent ? 'active' : 'inactive'}`}
                  >
                    Màn hình rộng
                  </button>
                  <button 
                    onClick={() => setIsRawContent(true)}
                    className={`mode-toggle-btn ${isRawContent ? 'active' : 'inactive'}`}
                  >
                    Mã HTML
                  </button>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl bg-white dark:bg-slate-900/40">
                {isRawContent ? (
                  <textarea
                    value={form.contentHtml}
                    onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                    className="raw-html-textarea"
                    placeholder="Nhập mã HTML của bạn tại đây..."
                  />
                ) : (
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.contentHtml}
                    onChange={(_event: any, editor: any) => {
                      setForm({ ...form, contentHtml: editor.getData() });
                    }}
                    config={{
                      plugins: [
                        Essentials, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
                        Paragraph, Heading, FontFamily, FontSize, FontColor, FontBackgroundColor,
                        Alignment, List, ListProperties, TodoList, Link, BlockQuote, Table, TableToolbar, 
                        MediaEmbed, Image, ImageUpload, Undo, Highlight, HorizontalLine, Autoformat, 
                        Indent, IndentBlock, Code, CodeBlock
                      ],
                      toolbar: {
                        items: [
                          'undo', 'redo', '|',
                          'heading', '|',
                          'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                          'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', '|',
                          'alignment', '|',
                          'bulletedList', 'numberedList', 'todoList', '|',
                          'outdent', 'indent', '|',
                          'link', 'insertTable', 'mediaEmbed', 'highlight', 'horizontalLine', 'codeBlock', 'blockQuote'
                        ],
                        shouldNotGroupWhenFull: true
                      },
                      fontSize: {
                        options: [ 9, 11, 13, 'default', 17, 19, 21 ],
                        supportAllValues: true
                      },
                      fontFamily: {
                        options: [
                          'default',
                          'Arial, Helvetica, sans-serif',
                          'Courier New, Courier, monospace',
                          'Georgia, serif',
                          'Lucida Sans Unicode, Lucida Grande, sans-serif',
                          'Tahoma, Geneva, sans-serif',
                          'Times New Roman, Times, serif',
                          'Trebuchet MS, Helvetica, sans-serif',
                          'Verdana, Geneva, sans-serif'
                        ],
                        supportAllValues: true
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Grammar editor */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {/* <div className="w-3 h-10 bg-gradient-to-b from-purple-500 to-fuchsia-600 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.2)] dark:shadow-[0_0_20px_rgba(168,85,247,0.4)]"></div> */}
                  <label className="text-sm font-bold  uppercase text-slate-800 dark:text-white/90">
                    Cấu trúc ngữ pháp
                  </label>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700/30">
                  <button 
                    onClick={() => setIsRawGrammar(false)}
                    className={`mode-toggle-btn ${!isRawGrammar ? 'active' : 'inactive'}`}
                  >
                    Màn hình rộng
                  </button>
                  <button 
                    onClick={() => setIsRawGrammar(true)}
                    className={`mode-toggle-btn ${isRawGrammar ? 'active' : 'inactive'}`}
                  >
                    Mã HTML
                  </button>
                </div>
              </div>
              <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl bg-white dark:bg-slate-900/40">
                {isRawGrammar ? (
                  <textarea
                    value={form.grammarHtml}
                    onChange={(e) => setForm({ ...form, grammarHtml: e.target.value })}
                    className="raw-html-textarea"
                    placeholder="Nhập mã HTML của bạn tại đây..."
                  />
                ) : (
                  <CKEditor
                    editor={ClassicEditor}
                    data={form.grammarHtml}
                    onChange={(_event: any, editor: any) => {
                      setForm({ ...form, grammarHtml: editor.getData() });
                    }}
                    config={{
                      plugins: [
                        Essentials, Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
                        Paragraph, Heading, FontFamily, FontSize, FontColor, FontBackgroundColor,
                        Alignment, List, ListProperties, TodoList, Link, BlockQuote, Table, TableToolbar, 
                        MediaEmbed, Image, ImageUpload, Undo, Highlight, HorizontalLine, Autoformat, 
                        Indent, IndentBlock, Code, CodeBlock
                      ],
                      toolbar: {
                        items: [
                          'undo', 'redo', '|',
                          'heading', '|',
                          'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
                          'bold', 'italic', 'underline', 'strikethrough', 'subscript', 'superscript', 'code', '|',
                          'alignment', '|',
                          'bulletedList', 'numberedList', 'todoList', '|',
                          'outdent', 'indent', '|',
                          'link', 'insertTable', 'mediaEmbed', 'highlight', 'horizontalLine', 'codeBlock', 'blockQuote'
                        ],
                        shouldNotGroupWhenFull: true
                      },
                      fontSize: {
                        options: [ 9, 11, 13, 'default', 17, 19, 21 ],
                        supportAllValues: true
                      },
                      fontFamily: {
                        options: [
                          'default',
                          'Arial, Helvetica, sans-serif',
                          'Courier New, Courier, monospace',
                          'Georgia, serif',
                          'Lucida Sans Unicode, Lucida Grande, sans-serif',
                          'Tahoma, Geneva, sans-serif',
                          'Times New Roman, Times, serif',
                          'Trebuchet MS, Helvetica, sans-serif',
                          'Verdana, Geneva, sans-serif'
                        ],
                        supportAllValues: true
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
          ) : (
            <div className="min-h-[700px] flex flex-col bg-slate-50 dark:bg-[#0f172a] -mx-6 -mb-6 rounded-b-[2rem] overflow-hidden relative shadow-inner transition-colors duration-500">
                {/* Review Sub-Tabs */}
                <div className="flex bg-white/80 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-slate-200 dark:border-white/5 px-8 overflow-x-auto no-scrollbar relative z-10 shrink-0 h-16 items-center gap-2">
                    {[
                        { id: 'content', label: 'NỘI DUNG', icon: BookOpen },
                        { id: 'grammar', label: 'NGỮ PHÁP', icon: FileText },
                        { id: 'vocabulary', label: 'TỪ VỰNG', icon: Star },
                        { id: 'practice', label: 'LUYỆN TẬP', icon: Dumbbell }
                    ].map((sub) => (
                        <button
                            key={sub.id}
                            onClick={() => setReviewSubTab(sub.id as any)}
                            className={`h-10 px-6 rounded-xl flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
                                reviewSubTab === sub.id
                                    ? 'bg-blue-600/10 text-blue-600 dark:bg-blue-600/20 dark:text-blue-400 shadow-[inset_0_0_10px_rgba(59,130,246,0.1)] dark:shadow-[inset_0_0_15px_rgba(59,130,246,0.2)]'
                                    : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                        >
                            <sub.icon className={`w-4 h-4 ${reviewSubTab === sub.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                            {sub.label}
                        </button>
                    ))}
                </div>

                {/* Student View Content Area */}
                <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {reviewSubTab === "content" ? (
                            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden">
                                {/* Lesson Header Card */}
                                <div className="p-8 border-b border-slate-100 flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                                        <Book className="w-7 h-7 text-orange-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase ">GIỚI THIỆU BÀI HỌC</span>
                                        <h2 className="text-xl font-bold text-[#221a10]">{form.title || "Tên bài học"}</h2>
                                    </div>
                                </div>
                                
                                {/* HTML Content */}
                                <div className="p-10 min-h-[400px]">
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:text-slate-700">
                                        <div dangerouslySetInnerHTML={{ __html: form.contentHtml || '<p class="text-slate-400 italic">Vui lòng quay lại tab "Bài giảng số" để thêm nội dung...</p>' }} />
                                    </div>
                                </div>

                                {/* Bottom Action */}
                                <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <p className="text-sm font-medium text-slate-500 italic">
                                        Xong phần lý thuyết, chuyển sang học từ vựng và luyện tập nhé.
                                    </p>
                                    <button 
                                        onClick={() => setReviewSubTab("grammar")}
                                        className="px-10 py-3.5 rounded-full bg-[#f49d25] text-white font-bold text-[15px] hover:bg-[#e08d20] shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>
                        ) : reviewSubTab === "grammar" ? (
                            <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden">
                                {/* Grammar Header Card */}
                                <div className="p-8 border-b border-slate-100 flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                                        <FileText className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[11px] font-bold text-slate-400 uppercase ">NGỮ PHÁP TRỌNG TÂM</span>
                                        <p className="text-sm font-bold text-slate-500">Tóm tắt nhanh các cấu trúc và quy tắc quan trọng trong bài này.</p>
                                    </div>
                                </div>
                                
                                {/* HTML Content */}
                                <div className="p-10 min-h-[400px]">
                                    <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:text-slate-700">
                                        <div dangerouslySetInnerHTML={{ __html: form.grammarHtml || '<p class="text-slate-400 italic">Vui lòng quay lại tab "Bài giảng số" để thêm cấu trúc ngữ pháp...</p>' }} />
                                    </div>
                                </div>

                                {/* Bottom Action */}
                                <div className="px-10 py-8 border-t border-slate-50 flex items-center justify-end bg-slate-50/50">
                                    <button 
                                        onClick={() => setReviewSubTab("vocabulary")}
                                        className="px-10 py-3.5 rounded-full bg-[#f49d25] text-white font-bold text-[15px] hover:bg-[#e08d20] shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                    >
                                        Tiếp tục
                                    </button>
                                </div>
                            </div>
                        ) : reviewSubTab === "vocabulary" ? (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#221a10]">Từ vựng bài học</h3>
                                        <p className="text-sm text-slate-500 font-medium">Danh sách các từ mới sẽ xuất hiện trong bài này.</p>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 font-bold text-orange-500">
                                        {vocabs.length} từ
                                    </div>
                                </div>

                                {extrasLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                                        <p className="font-bold">Đang tải từ vựng...</p>
                                    </div>
                                ) : vocabs.length === 0 ? (
                                    <div className="bg-white rounded-[2rem] p-12 border border-slate-200">
                                        <EmptyState
                                            icon={<Inbox className="w-12 h-12" />}
                                            title="Chưa có từ vựng"
                                            description="Hãy thêm từ vựng cho bài học này trong trang Quản lý từ vựng."
                                        />
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {vocabs.map((v) => (
                                            <div key={v.id} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 space-y-5 transition-all hover:shadow-xl group">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <h3 className="text-2xl font-bold text-[#221a10] group-hover:text-orange-500 transition-colors">{v.word}</h3>
                                                        <p className="text-blue-500 font-bold text-sm tracking-widest">{v.pronunciation}</p>
                                                    </div>
                                                    <button className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-90">
                                                        <Volume2 className="w-6 h-6" />
                                                    </button>
                                                </div>
                                                <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-100">
                                                    <p className="text-[#221a10] font-bold">{v.meaning}</p>
                                                </div>
                                                {v.exampleSentence && (
                                                    <div className="space-y-2 pt-2">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VÍ DỤ TRỰC QUAN:</span>
                                                        <p className="text-slate-600 leading-relaxed font-medium italic">"{v.exampleSentence}"</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button 
                                        onClick={() => setReviewSubTab("practice")}
                                        className="px-10 py-3.5 rounded-full bg-[#f49d25] text-white font-bold text-[15px] hover:bg-[#e08d20] shadow-xl shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                    >
                                        Chuyển sang Luyện tập
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <div>
                                        <h3 className="text-2xl font-bold text-[#221a10]">Luyện tập & Kiểm tra</h3>
                                        <p className="text-sm text-slate-500 font-medium">Hệ thống câu hỏi trắc nghiệm giúp học sinh củng cố kiến thức.</p>
                                    </div>
                                    <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl border border-slate-200 font-bold text-emerald-500">
                                        {questions.length} câu hỏi
                                    </div>
                                </div>

                                {extrasLoading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                                        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                        <p className="font-bold">Đang tải câu hỏi...</p>
                                    </div>
                                ) : questions.length === 0 ? (
                                    <div className="bg-white rounded-[2rem] p-12 border border-slate-200">
                                        <EmptyState
                                            icon={<Inbox className="w-12 h-12" />}
                                            title="Chưa có câu hỏi"
                                            description="Hãy thêm câu hỏi cho bài học này trong trang Ngân hàng câu hỏi."
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {questions.map((q, qIndex) => (
                                            <div key={q.id} className="bg-white rounded-[2rem] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-200 space-y-8 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div className="flex items-start gap-5">
                                                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-lg shadow-slate-900/20">
                                                        {qIndex + 1}
                                                    </div>
                                                    <h3 className="text-xl font-bold text-[#221a10] leading-tight pt-1">{q.questionText}</h3>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {q.options.map((opt) => (
                                                        <div 
                                                            key={opt.id} 
                                                            className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between group/opt ${
                                                                opt.isCorrect 
                                                                    ? 'border-emerald-500 bg-emerald-50 shadow-[0_4px_20px_rgba(16,185,129,0.1)]' 
                                                                    : 'border-slate-100 bg-slate-50/30'
                                                            }`}
                                                        >
                                                            <span className={`font-bold text-[15px] ${opt.isCorrect ? 'text-emerald-700' : 'text-slate-700'}`}>
                                                                {opt.optionText}
                                                            </span>
                                                            {opt.isCorrect && (
                                                                <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                                                                    <Check className="w-4 h-4 stroke-[3]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {q.explanation && (
                                                    <div className="p-6 bg-[#fefce8] rounded-[1.5rem] border border-[#fef08a] flex gap-4">
                                                        <div className="w-8 h-8 rounded-xl bg-[#facc15] flex items-center justify-center text-white shrink-0 font-bold">?</div>
                                                        <div className="space-y-1">
                                                            <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">GIẢI THÍCH CHI TIẾT:</p>
                                                            <p className="text-sm font-bold text-amber-900 leading-relaxed">{q.explanation}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button 
                                        onClick={() => setShowSaveReview(true)}
                                        className="px-12 py-4 rounded-full bg-[#f49d25] text-white font-bold text-lg hover:bg-[#e08d20] shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                    >
                                        Xác nhận & Lưu Bài học
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                             <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] shrink-0 font-bold">!</div>
                             <p className="text-[13px] font-bold text-blue-700">Đây là chế độ xem trước dành cho giáo viên, tương tự trải nghiệm của học sinh.</p>
                        </div>
                    </div>
                </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Save Review Modal */}
      <Dialog
        open={showSaveReview}
        onClose={() => setShowSaveReview(false)}
        title="Xác nhận lưu thay đổi"
        maxWidth="md"
        className="lesson-editor-dialog"
        footer={
            <>
                <button
                    onClick={() => setShowSaveReview(false)}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-all active:scale-95"
                >
                    Quay lại sửa
                </button>
                <button
                    onClick={confirmSave}
                    disabled={saving}
                    className="px-10 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 dark:shadow-2xl dark:shadow-emerald-500/30 flex items-center gap-2 active:scale-105"
                >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    Xác nhận & Lưu ngay
                </button>
            </>
        }
      >
        <div className="space-y-6 py-4 bg-white dark:bg-transparent">
            <div className="flex items-center gap-5 p-5 rounded-3xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 backdrop-blur-md">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
                    <BookOpen className="w-7 h-7" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-xl leading-tight">{form.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Vui lòng kiểm tra kỹ nội dung trước khi hệ thống cập nhật.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase  block mb-2">Mức độ khó</span>
                    <div className="flex items-center gap-2 mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div key={i} className={`w-4 h-2 rounded-full ${i < form.difficultyLevel ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-800'}`}></div>
                        ))}
                        <span className="ml-2 text-sm font-bold text-slate-900 dark:text-white">{form.difficultyLevel}/5</span>
                    </div>
                </div>
                <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-inner">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase  block mb-2">Trạng thái</span>
                    <div className="flex items-center gap-3 mt-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${form.isPublished ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'}`}></div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{form.isPublished ? 'SẴN SÀNG XUẤT BẢN' : 'LƯU BẢN NHÁP'}</span>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-black/40 border border-slate-100 dark:border-slate-800 text-sm space-y-4 relative overflow-hidden text-slate-600 dark:text-slate-400">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-bold uppercase tracking-widest text-[10px]">Thứ tự hiển thị:</span>
                    <span className="text-slate-900 dark:text-white font-bold text-base">{form.orderIndex}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-bold uppercase tracking-widest text-[10px]">Độ dài nội dung:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-base">{form.contentHtml.length} <span className="text-[11px] opacity-70">ký tự</span></span>
                </div>
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                    <span className="font-bold uppercase tracking-widest text-[10px]">Cấu trúc ngữ pháp:</span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold text-base">{form.grammarHtml.length} <span className="text-[11px] opacity-70">ký tự</span></span>
                </div>
            </div>
        </div>
      </Dialog>
    </div>
  );
}
