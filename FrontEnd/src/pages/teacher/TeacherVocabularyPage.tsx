import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  vocabularyApi,
  VocabularyResponse,
  VocabularyRequest,
} from "../../services/api/vocabularyApi";
import api from "../../services/api/axios";
import DataTable from "../../components/ui/DataTable";
import Dialog from "../../components/ui/Dialog";
import EmptyState from "../../components/ui/EmptyState";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertTriangle,
  BookOpen,
  Inbox,
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Lesson {
  id: number;
  title: string;
}

interface VocabForm {
  word: string;
  meaning: string;
  pronunciation: string;
  exampleSentence: string;
  imageUrl: string;
  audioUrl: string;
  lessonId: number | "";
}

const emptyForm: VocabForm = {
  word: "",
  meaning: "",
  pronunciation: "",
  exampleSentence: "",
  imageUrl: "",
  audioUrl: "",
  lessonId: "",
};

export default function TeacherVocabularyPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLessonId = searchParams.get("lessonId") || "";

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<string>(initialLessonId);
  const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VocabForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchLessons = useCallback(async () => {
    setLessonsLoading(true);
    try {
      const res = await api.get("/lessons?page=0&size=100");
      setLessons(res.data.data.content || []);
    } catch {
      /* ignore */
    } finally {
      setLessonsLoading(false);
    }
  }, []);

  const fetchVocabulary = useCallback(async (lessonId: string) => {
    if (!lessonId) {
      setVocabulary([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await vocabularyApi.getByLesson(parseInt(lessonId));
      setVocabulary(data);
    } catch {
      setError(t("teacherVocabulary.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  useEffect(() => {
    fetchVocabulary(selectedLesson);
  }, [selectedLesson, fetchVocabulary]);

  const handleLessonChange = (val: string) => {
    setSelectedLesson(val);
    if (val) {
      setSearchParams({ lessonId: val });
    } else {
      setSearchParams({});
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      lessonId: selectedLesson ? parseInt(selectedLesson) : "",
    });
    setDialogOpen(true);
  };

  const openEdit = (v: VocabularyResponse) => {
    setEditingId(v.id);
    setForm({
      word: v.word,
      meaning: v.meaning,
      pronunciation: v.pronunciation || "",
      exampleSentence: v.exampleSentence || "",
      imageUrl: v.imageUrl || "",
      audioUrl: v.audioUrl || "",
      lessonId: v.lessonId ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.word.trim() || !form.meaning.trim()) return;
    setSaving(true);
    try {
      const payload: VocabularyRequest = {
        word: form.word.trim(),
        meaning: form.meaning.trim(),
        pronunciation: form.pronunciation.trim() || undefined,
        exampleSentence: form.exampleSentence.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        audioUrl: form.audioUrl.trim() || undefined,
        lessonId: form.lessonId ? Number(form.lessonId) : undefined,
      };
      if (editingId) {
        await vocabularyApi.update(editingId, payload);
      } else {
        await vocabularyApi.create(payload);
      }
      setDialogOpen(false);
      await fetchVocabulary(selectedLesson);
    } catch {
      alert(t("teacherVocabulary.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("teacherVocabulary.confirmDelete"))) return;
    try {
      await vocabularyApi.delete(id);
      await fetchVocabulary(selectedLesson);
    } catch {
      alert(t("teacherVocabulary.deleteFailed"));
    }
  };

  const columns = [
    {
      key: "word",
      label: t("teacherVocabulary.columns.word"),
      render: (item: Record<string, unknown>) => (
        <span className="font-semibold" style={{ color: "var(--color-text)" }}>
          {item.word as string}
        </span>
      ),
    },
    {
      key: "meaning",
      label: t("teacherVocabulary.columns.meaning"),
      render: (item: Record<string, unknown>) => (
        <span style={{ color: "var(--color-text-secondary)" }}>
          {item.meaning as string}
        </span>
      ),
    },
    {
      key: "pronunciation",
      label: t("teacherVocabulary.columns.pronunciation"),
      render: (item: Record<string, unknown>) => (
        <span
          className="italic"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {(item.pronunciation as string) || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("teacherVocabulary.columns.actions"),
      render: (item: Record<string, unknown>) => {
        const v = item as unknown as VocabularyResponse;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEdit(v);
              }}
              className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
              title={t("teacherVocabulary.actions.edit")}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(v.id);
              }}
              className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
              title={t("teacherVocabulary.actions.delete")}
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
            {t("teacherVocabulary.title")}
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            {selectedLesson
              ? t("teacherVocabulary.count", { count: vocabulary.length })
              : t("teacherVocabulary.selectLessonHelper")}
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={!selectedLesson}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl  text-white font-medium  transition-colors disabled:opacity-50"
          style={{
            backgroundColor: " rgb(244 157 37 / var(--tw-bg-opacity, 1))",
          }}
        >
          <Plus className="w-4 h-4" />
          Thêm từ vựng
        </button>
      </div>

      {/* Lesson selector */}
      <div className="flex items-center gap-3">
        <BookOpen
          className="w-4 h-4"
          style={{ color: "var(--color-text-secondary)" }}
        />
        <select
          value={selectedLesson}
          onChange={(e) => handleLessonChange(e.target.value)}
          disabled={lessonsLoading}
          className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[250px] appearance-none"
          style={{
            backgroundColor: "var(--color-bg-secondary)",
            borderColor: "var(--color-bg-secondary)",
            color: "var(--color-text)",
            backgroundImage: "none",
          }}
        >
          <option value="">{t("teacherVocabulary.selectLessonPlaceholder")}</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title}
            </option>
          ))}
        </select>
        {lessonsLoading && (
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
        )}
      </div>

      {/* Content */}
      {!selectedLesson ? (
          <EmptyState
          icon={<Inbox className="w-8 h-8" />}
          title={t("teacherVocabulary.selectLessonTitle")}
          description={t("teacherVocabulary.selectLessonDescription")}
        />
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <AlertTriangle className="w-10 h-10 text-red-400" />
          <p style={{ color: "var(--color-text-secondary)" }}>{error}</p>
          <button
            onClick={() => fetchVocabulary(selectedLesson)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {t("common.retry")}
          </button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={vocabulary as unknown as Record<string, unknown>[]}
          loading={loading}
          emptyMessage={t("teacherVocabulary.emptyMessage")}
        />
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={editingId ? t("teacherVocabulary.editTitle") : t("teacherVocabulary.createTitle")}
        footer={
          <>
            <button
              onClick={() => setDialogOpen(false)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700/50"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("common.cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.word.trim() || !form.meaning.trim()}
              className="px-4 py-2 rounded-lg  text-white text-sm font-medium  transition-colors disabled:opacity-50 flex items-center gap-2"
              style={{
                backgroundColor: " rgb(244 157 37 / var(--tw-bg-opacity, 1))",
              }}
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingId ? t("teacherVocabulary.updateButton") : t("teacherVocabulary.createButton")}
            </button>
          </>
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Lesson */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("teacherVocabulary.form.lesson")}
            </label>
            <select
              value={form.lessonId}
              onChange={(e) =>
                setForm({
                  ...form,
                  lessonId: e.target.value ? parseInt(e.target.value) : "",
                })
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 appearance-none"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
                backgroundImage: "none",
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
          {/* Word + Meaning */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("teacherVocabulary.form.word")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.word}
                onChange={(e) => setForm({ ...form, word: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-bg-secondary)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("teacherVocabulary.form.meaning")} <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.meaning}
                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-bg-secondary)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>
          {/* Pronunciation */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("teacherVocabulary.form.pronunciation")}
            </label>
            <input
              type="text"
              value={form.pronunciation}
              onChange={(e) =>
                setForm({ ...form, pronunciation: e.target.value })
              }
              placeholder="/prəˌnʌnsiˈeɪʃn/"
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            />
          </div>
          {/* Example */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {t("teacherVocabulary.form.example")}
            </label>
            <textarea
              rows={2}
              value={form.exampleSentence}
              onChange={(e) =>
                setForm({ ...form, exampleSentence: e.target.value })
              }
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-secondary)",
                color: "var(--color-text)",
              }}
            />
          </div>
          {/* URLs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("teacherVocabulary.form.imageUrl")}
              </label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-bg-secondary)",
                  color: "var(--color-text)",
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {t("teacherVocabulary.form.audioUrl")}
              </label>
              <input
                type="url"
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-bg-secondary)",
                  color: "var(--color-text)",
                }}
              />
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
