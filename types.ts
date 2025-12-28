
export type LoanType = 'Personal' | 'Business' | 'Education' | 'Health' | 'Home' | 'Auto';

export interface FutureScenario {
  label: string;
  impact: string;
  probability: number;
}

export interface LoanApplication {
  fullName: string;
  email: string;
  income: number;
  employmentStatus: 'Employed' | 'Self-Employed' | 'Unemployed' | 'Student';
  loanAmount: number;
  loanType: LoanType;
  loanPurpose: string;
  existingDebt: number;
  creditScoreCategory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  hasProperty: boolean;
  propertyValue?: number;
  hasDocuments: string[]; // List of documents the user has
  photo?: string;
}

export interface RejectionRisk {
  reason: string;
  severity: 'High' | 'Medium' | 'Low';
  howToFix: string;
  description: string; // Added detailed explanation of why this causes rejection
}

export interface EligibilityAnalysis {
  status: 'Approved' | 'Review Required' | 'Likely Rejected';
  score: number;
  feedback: string;
  recommendations: string[];
  missingInfo: string[];
  rejectionRisks: RejectionRisk[];
  debtToIncomeRatio: number;
  futureScenarios: FutureScenario[];
  formFillingSteps: string[];
}

export enum FormStep {
  TYPE_SELECTION = 0,
  PERSONAL = 1,
  ASSETS = 2,
  DOCUMENTS = 3,
  SCANNING = 4,
  ANALYSIS = 5,
  FEEDBACK = 6,
  GUIDELINES = 7
}
