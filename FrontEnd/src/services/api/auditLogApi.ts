import api from "./axios";

export interface AuditLogResponse {
  id: number;
  action: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export const auditLogApi = {
  getRecentLogs: async (): Promise<AuditLogResponse[]> => {
    const response = await api.get("/audit-logs/recent");
    return response.data.data;
  },
};
