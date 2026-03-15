export enum SafetyLevel {
  SAFE = 'Safe',
  MODERATE = 'Moderate',
  ELEVATED = 'Elevated',
  HIGH_RISK = 'High Risk'
}

export interface YearData {
  year: number;
  ipc_total: number;
  violent: number;
  property: number;
}

export interface RegionData {
  id: string;
  name: string;
  state: string;
  ipc_rate: number;
  violent: number;
  property: number;
  cyber: number;
  women_safety: number;
  economic: number;
  safety_score: number;
  safety_level: SafetyLevel;
  year_data: YearData[];
}

export interface DashboardStats {
  totalIpcCrimes: number;
  regionsTracked: number;
  safestState: string;
  nationalDetectionRate: string;
}
