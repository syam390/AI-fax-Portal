export enum ReferralStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected'
}

export interface ReferralData {
  ID: string;
  PatientName: string;
  ReferredBy: string;
  ReferredTo: string;
  Diagnosis: string;
  FilePath: string; // In this demo, this will be a base64 string, blob URL, or Azure URL
  MimeType?: string; // To help with rendering (pdf vs image vs docx)
  Status: ReferralStatus;
  DOB?: string;
  ReferralDate?: string;
  Notes?: string;
}

export interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
}