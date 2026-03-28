import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import {
  classroomApi,
  ClassRoomResponse,
  ClassStudentResponse,
} from "../../services/api/classroomApi";
import {
  Users,
  Plus,
  LayoutGrid,
  X,
  Search,
  Loader2,
} from "lucide-react";

export default function ClassManagement() {
  const { user } = useAuthStore();
  const [classes, setClasses] = useState<ClassRoomResponse[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassRoomResponse | null>(
    null,
  );
  const [students, setStudents] = useState<ClassStudentResponse[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [studentKeyword, setStudentKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<ClassStudentResponse[]>(
    [],
  );
  const [searching, setSearching] = useState(false);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ClassStudentResponse | null>(null);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchClasses();
    } else if (!isLoading) {
      setIsLoading(false);
    }
  }, [user?.id]);

  const fetchClasses = async () => {
    setIsLoading(true);
    setActionMsg({ type: "", text: "" });
    try {
      const data = await classroomApi.getByTeacher(user!.id);
      setClasses(data);
      if (data.length > 0) {
        if (!selectedClass || !data.find((c) => c.id === selectedClass.id)) {
          setSelectedClass(data[0]);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch classes:", error);
      setActionMsg({ type: "error", text: "Không thể tải danh sách lớp học." });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async (classId: number) => {
    setStudentsLoading(true);
    try {
      const data = await classroomApi.getStudents(classId);
      setStudents(data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClass?.id) {
      fetchStudents(selectedClass.id);
    } else {
      setStudents([]);
    }
  }, [selectedClass?.id]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedCandidate) return;

    setIsSubmitting(true);
    setActionMsg({ type: "", text: "" });
    try {
      await classroomApi.addStudent(selectedClass.id, selectedCandidate.id);
      setActionMsg({
        type: "success",
        text: "Thêm học sinh vào lớp thành công!",
      });
      setStudentKeyword("");
      setSearchResults([]);
      setSelectedCandidate(null);
      setIsAddStudentOpen(false);
      // Refresh class data if student count increases
      fetchClasses();
      fetchStudents(selectedClass.id);
    } catch (err: any) {
      setActionMsg({
        type: "error",
        text: err.response?.data?.message || "Có lỗi xảy ra khi thêm học sinh.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAddStudentOpen || !selectedClass) return;
    const keyword = studentKeyword.trim();

    if (keyword.length < 2) {
      setSearchResults([]);
      setSearching(false);
      setSelectedCandidate(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await classroomApi.searchStudents(
          selectedClass.id,
          keyword,
        );
        setSearchResults(data || []);
        if (
          selectedCandidate &&
          !data.find((s) => s.id === selectedCandidate.id)
        ) {
          setSelectedCandidate(null);
        }
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [isAddStudentOpen, selectedClass?.id, studentKeyword]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1
            className="text-3xl font-bold flex items-center gap-3"
            style={{ color: "var(--color-text)" }}
          >
            {/* <Users className="w-8 h-8 text-blue-500" /> */}
            {/* <School className="w-8 h-8 text-blue-500" /> */}
            Quản lý lớp học
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Quản lý danh sách lớp và học viên của bạn.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* <div className="flex flex-col gap-8"> */}
        {/* Sidebar danh sách lớp */}
        <div className="lg:col-span-1 space-y-4">
          <h3
            className="text-sm font-bold uppercase tracking-wider px-2"
            style={{ color: "var(--color-text-secondary)" }}
          >
            Danh sách lớp ({classes.length})
          </h3>
          <div className="space-y-2">
            {classes.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setSelectedClass(cls)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  selectedClass?.id === cls.id
                    ? "bg-blue-500/10 border-blue-500 shadow-sm"
                    : "bg-card border-transparent hover:border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${selectedClass?.id === cls.id ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-500"}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "var(--color-text)" }}
                    >
                      {cls.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {cls.academicYear || "N/A"}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Nội dung chi tiết lớp học */}
        <div className="lg:col-span-3">
          {selectedClass ? (
            <div className="card h-full flex flex-col">
              <div
                className="p-6 border-b"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                      {/* <GraduationCap className="w-6 h-6" /> */}
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <div>
                      <h2
                        className="text-xl font-bold"
                        style={{ color: "var(--color-text)" }}
                      >
                        {selectedClass.name}
                      </h2>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Niên khóa: {selectedClass.academicYear} | Sĩ số:{" "}
                        {selectedClass.studentCount || 0}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddStudentOpen(true)}
                    className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm học sinh
                  </button>
                </div>
              </div>

              <div className="p-6 flex-1">
                <h3 className="text-lg font-bold mb-4">Danh sách học sinh</h3>
                {studentsLoading ? (
                  <div className="flex items-center justify-center min-h-[220px]">
                    <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="p-8 flex flex-col items-center justify-center text-center opacity-70 min-h-[220px]">
                    <div className="bg-blue-500/10 p-6 rounded-full mb-4">
                      <Users className="w-12 h-12 text-blue-500/50" />
                    </div>
                    <p
                      className="max-w-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Lớp này chưa có học sinh nào.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-xl border"
                        style={{
                          borderColor: "var(--color-border)",
                          background: "var(--color-bg-secondary)",
                        }}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="size-10 rounded-full overflow-hidden bg-blue-100 dark:bg-slate-700 flex items-center justify-center">
                            {student.avatarUrl ? (
                              <img
                                src={student.avatarUrl}
                                alt={student.fullName || student.username}
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-300">
                                {(student.fullName || student.username)
                                  ?.charAt(0)
                                  .toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p
                              className="font-medium truncate"
                              style={{ color: "var(--color-text)" }}
                            >
                              {student.fullName || student.username}
                            </p>
                            <p
                              className="text-sm truncate"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              @{student.username}{" "}
                              {student.email ? `• ${student.email}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">
                          {student.status || "ACTIVE"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center py-20 text-center">
              <Search className="w-12 h-12 text-gray-400 mb-4" />
              <p style={{ color: "var(--color-text-secondary)" }}>
                Chọn một lớp để xem chi tiết.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Thêm học sinh */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddStudentOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-500" />
              Thêm học sinh vào lớp
            </h2>

            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Tìm học sinh (tên / username / email)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={studentKeyword}
                    onChange={(e) => setStudentKeyword(e.target.value)}
                    className="input-field"
                    placeholder="Ví dụ: minhkhoa hoặc Trần Minh Khoa"
                    required
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" />
                  )}
                </div>
                <p
                  className="mt-2 text-xs"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Gõ ít nhất 2 ký tự để tìm kiếm học sinh chưa nằm trong lớp
                  này.
                </p>
              </div>

              {searchResults.length > 0 && (
                <div
                  className="max-h-56 overflow-y-auto rounded-xl border"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {searchResults.map((candidate) => (
                    <button
                      key={candidate.id}
                      type="button"
                      onClick={() => setSelectedCandidate(candidate)}
                      className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 transition-colors ${
                        selectedCandidate?.id === candidate.id
                          ? "bg-blue-500/10"
                          : "hover:bg-slate-500/5"
                      }`}
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <p
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {candidate.fullName || candidate.username}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        @{candidate.username} •{" "}
                        {candidate.email || `ID: ${candidate.id}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {studentKeyword.trim().length >= 2 &&
                !searching &&
                searchResults.length === 0 && (
                  <div className="p-3 rounded-lg text-sm border bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400">
                    Không tìm thấy học sinh phù hợp, thử bằng username hoặc
                    email.
                  </div>
                )}

              {selectedCandidate && (
                <div className="p-3 rounded-lg text-sm border bg-blue-500/10 border-blue-500/30">
                  <span className="font-medium">Đã chọn:</span>{" "}
                  {selectedCandidate.fullName || selectedCandidate.username}{" "}
                  (ID: {selectedCandidate.id})
                </div>
              )}

              {actionMsg.text && (
                <div
                  className={`p-3 rounded-lg text-sm border ${
                    actionMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-red-500/10 border-red-500/30 text-red-500"
                  }`}
                >
                  {actionMsg.text}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !selectedCandidate}
                  className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Thêm ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
