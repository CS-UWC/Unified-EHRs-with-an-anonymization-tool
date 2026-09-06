import { apiRequest } from "./api";

export interface Patient {
  id: number;
  user_id: number;
  national_id: string;
  date_of_birth: string | null;
  gender: string | null;
  phone_number: string | null;
  address: string | null;
  province: string | null;
  blood_group: string | null;
  medical_aid: string | null;
  emergency_contact_name: string | null;
  emergency_contact_number: string | null;
}

export async function getMyPatient(): Promise<Patient> {
  return apiRequest<Patient>("/patients/me");
}

export async function updateMyAddress(
  address: string
): Promise<Patient> {
  return apiRequest<Patient>("/patients/me", {
    method: "PUT",
    body: JSON.stringify({
      address,
    }),
  });
}