import { ReferralData, ReferralStatus } from "../types";

const STORAGE_KEY = 'fax_referral_data';

const INITIAL_DATA: ReferralData[] = [
  {
    ID: 'REF-1001',
    PatientName: 'John Doe',
    ReferredBy: 'Dr. Smith (General Practice)',
    ReferredTo: 'Cardiology Dept',
    Diagnosis: 'I10 - Essential Hypertension',
    FilePath: 'https://picsum.photos/600/800', // Placeholder
    Status: ReferralStatus.PENDING,
    DOB: '1980-05-15',
    ReferralDate: '2023-10-25'
  },
  {
    ID: 'REF-1002',
    PatientName: 'Jane Roe',
    ReferredBy: 'City Health Clinic',
    ReferredTo: 'Dr. Adams (Orthopedics)',
    Diagnosis: 'M54.5 - Low Back Pain',
    FilePath: 'https://picsum.photos/601/801',
    Status: ReferralStatus.ACCEPTED,
    DOB: '1992-11-02',
    ReferralDate: '2023-10-24'
  },
  {
    ID: 'REF-1003',
    PatientName: 'Alice M.',
    ReferredBy: 'Westside Urgent Care',
    ReferredTo: 'Neurology',
    Diagnosis: 'R51 - Headache',
    FilePath: 'https://picsum.photos/602/802',
    Status: ReferralStatus.REJECTED,
    DOB: '1975-03-10',
    ReferralDate: '2023-10-20'
  }
];

export const getReferrals = (): ReferralData[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

export const getReferralById = (id: string): ReferralData | undefined => {
  const all = getReferrals();
  return all.find(r => r.ID === id);
};

export const saveReferral = (referral: ReferralData): void => {
  const all = getReferrals();
  const index = all.findIndex(r => r.ID === referral.ID);
  if (index >= 0) {
    all[index] = referral;
  } else {
    all.unshift(referral); // Add to top
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
};

export const updateReferralStatus = (id: string, status: ReferralStatus): void => {
  const all = getReferrals();
  const index = all.findIndex(r => r.ID === id);
  if (index >= 0) {
    all[index].Status = status;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
};
