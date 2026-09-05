export type UserRole = "PATIENT" | "EXTERNAL_SYSTEM";

export interface AccessRequest {
  id: string;
  externalSystem: string;
  patientNationalId: string;
  canRead: boolean;
  canWrite: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED" | "REVOKED";
  requestedAt: string;
  respondedAt?: string;
}

export interface ResearchDemoData {
  ageGroup: string;
  gender: string;
  province: string;
  disease: string;
}
