import type { TimelineEvent, LabResult } from '@/lib/types';

// Mock timeline events used as fallback if DB is empty
export const mockTimelineEvents: Omit<TimelineEvent, 'id' | 'patient_id'>[] = [
  { event_type: 'visit', title: 'General OPD Visit', description: 'Routine checkup for hypertension', event_date: '2024-01-15', category: 'visit', severity: 'normal', metadata: { doctor: 'Dr. Sharma', diagnosis: 'Hypertension Stage 1' } },
  { event_type: 'lab', title: 'Complete Blood Count', description: 'Hemoglobin: 11.2 g/dL (low)', event_date: '2024-02-01', category: 'lab', severity: 'abnormal', metadata: { test: 'CBC', value: '11.2', unit: 'g/dL', range: '13-17' } },
  { event_type: 'prescription', title: 'Amlodipine 5mg', description: 'Once daily for BP control', event_date: '2024-02-01', category: 'prescription', severity: 'normal', metadata: { medication: 'Amlodipine', dose: '5mg', frequency: 'OD' } },
  { event_type: 'lab', title: 'Lipid Profile', description: 'Total cholesterol: 245 mg/dL (high)', event_date: '2024-03-10', category: 'lab', severity: 'abnormal', metadata: { test: 'Lipid Profile', value: '245', unit: 'mg/dL', range: '<200' } },
  { event_type: 'prescription', title: 'Atorvastatin 10mg', description: 'Once daily at bedtime', event_date: '2024-03-10', category: 'prescription', severity: 'normal', metadata: { medication: 'Atorvastatin', dose: '10mg', frequency: 'HS' } },
  { event_type: 'visit', title: 'Cardiology Consultation', description: 'Chest pain evaluation - ECG normal', event_date: '2024-04-20', category: 'visit', severity: 'normal', metadata: { doctor: 'Dr. Patel', diagnosis: 'Non-cardiac chest pain' } },
  { event_type: 'procedure', title: 'ECG', description: '12-lead ECG - normal sinus rhythm', event_date: '2024-04-20', category: 'procedure', severity: 'normal', metadata: { type: 'ECG', result: 'Normal sinus rhythm' } },
  { event_type: 'lab', title: 'HbA1c', description: '6.8% (borderline)', event_date: '2024-05-05', category: 'lab', severity: 'abnormal', metadata: { test: 'HbA1c', value: '6.8', unit: '%', range: '<5.7' } },
  { event_type: 'visit', title: 'Diabetes Screening', description: 'Pre-diabetic - lifestyle counseling', event_date: '2024-05-05', category: 'visit', severity: 'normal', metadata: { doctor: 'Dr. Gupta', diagnosis: 'Pre-diabetes' } },
  { event_type: 'prescription', title: 'Metformin 500mg', description: 'Twice daily with meals', event_date: '2024-05-05', category: 'prescription', severity: 'normal', metadata: { medication: 'Metformin', dose: '500mg', frequency: 'BD' } },
  { event_type: 'lab', title: 'Fasting Glucose', description: '126 mg/dL (borderline)', event_date: '2024-06-12', category: 'lab', severity: 'abnormal', metadata: { test: 'Fasting Glucose', value: '126', unit: 'mg/dL', range: '70-100' } },
  { event_type: 'document', title: 'Discharge Summary', description: 'Previous hospitalization for pneumonia', event_date: '2024-06-25', category: 'document', severity: 'normal', metadata: { source: 'City Hospital', type: 'Discharge summary' } },
  { event_type: 'lab', title: 'TSH', description: '3.2 mIU/L (normal)', event_date: '2024-07-15', category: 'lab', severity: 'normal', metadata: { test: 'TSH', value: '3.2', unit: 'mIU/L', range: '0.4-4.0' } },
  { event_type: 'visit', title: 'Quarterly Review', description: 'BP controlled, diabetes improving', event_date: '2024-08-01', category: 'visit', severity: 'normal', metadata: { doctor: 'Dr. Sharma', diagnosis: 'Stable' } },
  { event_type: 'lab', title: 'HbA1c Follow-up', description: '6.2% (improving)', event_date: '2024-09-05', category: 'lab', severity: 'abnormal', metadata: { test: 'HbA1c', value: '6.2', unit: '%', range: '<5.7' } },
  { event_type: 'prescription', title: 'Vitamin D3', description: 'Weekly for 8 weeks', event_date: '2024-09-05', category: 'prescription', severity: 'normal', metadata: { medication: 'Vitamin D3', dose: '60000 IU', frequency: 'Weekly' } },
  { event_type: 'procedure', title: 'Eye Examination', description: 'Fundus screening - no retinopathy', event_date: '2024-10-10', category: 'procedure', severity: 'normal', metadata: { type: 'Fundoscopy', result: 'No diabetic retinopathy' } },
  { event_type: 'lab', title: 'Kidney Function', description: 'Creatinine: 1.4 mg/dL (slightly high)', event_date: '2024-11-01', category: 'lab', severity: 'abnormal', metadata: { test: 'KFT', value: '1.4', unit: 'mg/dL', range: '0.6-1.2' } },
  { event_type: 'document', title: 'Lab Report Upload', description: 'Thyroid panel results', event_date: '2024-11-20', category: 'document', severity: 'normal', metadata: { source: 'Thyrocare', type: 'Lab report' } },
  { event_type: 'visit', title: 'Annual Checkup', description: 'Comprehensive health assessment', event_date: '2025-01-10', category: 'visit', severity: 'normal', metadata: { doctor: 'Dr. Sharma', diagnosis: 'Overall stable' } },
];

// Mock lab results for trend charts
export const mockLabResults: Omit<LabResult, 'id' | 'patient_id'>[] = [
  { test_name: 'HbA1c', value: 6.8, unit: '%', reference_range: '<5.7', flagged: true, category: 'Diabetes', test_date: '2024-05-05' },
  { test_name: 'HbA1c', value: 6.2, unit: '%', reference_range: '<5.7', flagged: true, category: 'Diabetes', test_date: '2024-09-05' },
  { test_name: 'HbA1c', value: 5.9, unit: '%', reference_range: '<5.7', flagged: true, category: 'Diabetes', test_date: '2025-01-10' },
  { test_name: 'Fasting Glucose', value: 126, unit: 'mg/dL', reference_range: '70-100', flagged: true, category: 'Diabetes', test_date: '2024-06-12' },
  { test_name: 'Fasting Glucose', value: 118, unit: 'mg/dL', reference_range: '70-100', flagged: true, category: 'Diabetes', test_date: '2024-09-05' },
  { test_name: 'Fasting Glucose', value: 105, unit: 'mg/dL', reference_range: '70-100', flagged: true, category: 'Diabetes', test_date: '2025-01-10' },
  { test_name: 'Total Cholesterol', value: 245, unit: 'mg/dL', reference_range: '<200', flagged: true, category: 'Lipids', test_date: '2024-03-10' },
  { test_name: 'Total Cholesterol', value: 210, unit: 'mg/dL', reference_range: '<200', flagged: true, category: 'Lipids', test_date: '2024-08-01' },
  { test_name: 'Total Cholesterol', value: 195, unit: 'mg/dL', reference_range: '<200', flagged: false, category: 'Lipids', test_date: '2025-01-10' },
  { test_name: 'Creatinine', value: 1.4, unit: 'mg/dL', reference_range: '0.6-1.2', flagged: true, category: 'Renal', test_date: '2024-11-01' },
  { test_name: 'Creatinine', value: 1.3, unit: 'mg/dL', reference_range: '0.6-1.2', flagged: true, category: 'Renal', test_date: '2025-01-10' },
  { test_name: 'Hemoglobin', value: 11.2, unit: 'g/dL', reference_range: '13-17', flagged: true, category: 'CBC', test_date: '2024-02-01' },
  { test_name: 'Hemoglobin', value: 12.5, unit: 'g/dL', reference_range: '13-17', flagged: true, category: 'CBC', test_date: '2024-08-01' },
  { test_name: 'Hemoglobin', value: 13.1, unit: 'g/dL', reference_range: '13-17', flagged: false, category: 'CBC', test_date: '2025-01-10' },
  { test_name: 'TSH', value: 3.2, unit: 'mIU/L', reference_range: '0.4-4.0', flagged: false, category: 'Thyroid', test_date: '2024-07-15' },
  { test_name: 'TSH', value: 2.8, unit: 'mIU/L', reference_range: '0.4-4.0', flagged: false, category: 'Thyroid', test_date: '2024-11-20' },
];

// Red flag keywords for detection
export const redFlagRules: { keywords: string[]; severity: 'high' | 'critical' | 'medium'; label: string }[] = [
  { keywords: ['severe chest pain', 'chest pain', 'crushing chest'], severity: 'critical', label: 'Severe chest pain' },
  { keywords: ['shortness of breath', 'breathing difficulty', 'cant breathe', 'cannot breathe'], severity: 'critical', label: 'Breathing difficulty' },
  { keywords: ['sudden weakness', 'one side', 'face drooping', 'slurred speech'], severity: 'critical', label: 'Possible stroke symptoms' },
  { keywords: ['fainting', 'lost consciousness', 'passed out', 'unconscious'], severity: 'high', label: 'Loss of consciousness' },
  { keywords: ['severe bleeding', 'blood loss', 'hemorrhage'], severity: 'critical', label: 'Severe bleeding' },
  { keywords: ['suicidal', 'self harm', 'kill myself', 'end my life'], severity: 'critical', label: 'Mental health crisis' },
  { keywords: ['severe abdominal pain', 'acute abdomen'], severity: 'high', label: 'Acute abdominal pain' },
  { keywords: ['high fever', 'very high fever', 'fever with rash'], severity: 'medium', label: 'High fever' },
  { keywords: ['vomiting blood', 'blood in vomit', 'hematemesis'], severity: 'critical', label: 'GI bleeding' },
  { keywords: ['severe headache', 'worst headache', 'thunderclap headache'], severity: 'high', label: 'Severe headache' },
];

export function detectRedFlags(text: string): { triggered: boolean; matchedRules: typeof redFlagRules } {
  const lower = text.toLowerCase();
  const matched = redFlagRules.filter(rule =>
    rule.keywords.some(kw => lower.includes(kw))
  );
  return { triggered: matched.length > 0, matchedRules: matched };
}

// SOCRATES question flow
export const socratesQuestions = [
  { id: 'chief', question: "What brings you to the hospital today? What is your main complaint?", quickReplies: ['Fever', 'Headache', 'Chest pain', 'Stomach pain', 'Joint pain', 'Other'], section: 'chief_complaint' },
  { id: 'site', question: "Can you point to exactly where you feel the problem? Which part of your body is affected?", quickReplies: ['Head', 'Chest', 'Abdomen', 'Left arm', 'Right leg', 'Back'], section: 'hpi.site' },
  { id: 'onset', question: "When did this problem start? Was it sudden or gradual?", quickReplies: ['Today', 'Yesterday', 'Few days ago', 'Last week', 'Over a month', 'Long time ago'], section: 'hpi.onset' },
  { id: 'character', question: "How would you describe the sensation? Is it a sharp pain, dull ache, burning, or throbbing?", quickReplies: ['Sharp pain', 'Dull ache', 'Burning', 'Throbbing', 'Cramping', 'Numbness'], section: 'hpi.character' },
  { id: 'radiation', question: "Does the sensation spread to any other part of your body?", quickReplies: ['No, stays in one place', 'Spreads to arm', 'Spreads to back', 'Spreads to jaw', 'Spreads to legs'], section: 'hpi.radiation' },
  { id: 'associations', question: "Do you have any other symptoms along with this? Like nausea, dizziness, or sweating?", quickReplies: ['Nausea', 'Dizziness', 'Sweating', 'Vomiting', 'Fever', 'No other symptoms'], section: 'hpi.associations' },
  { id: 'time', question: "Does the problem stay all the time, or does it come and go? Is it worse at any particular time?", quickReplies: ['Constant', 'Comes and goes', 'Worse at night', 'Worse in morning', 'Worse after eating', 'Worse with movement'], section: 'hpi.time' },
  { id: 'exacerbating', question: "What makes the problem worse? Does any activity or position increase your discomfort?", quickReplies: ['Movement', 'Eating', 'Lying down', 'Stress', 'Cold weather', 'Nothing makes it worse'], section: 'hpi.exacerbating' },
  { id: 'relieving', question: "What makes it better? Does rest, medication, or any position give you relief?", quickReplies: ['Rest', 'Medication', 'Sitting up', 'Cold compress', 'Warm compress', 'Nothing helps'], section: 'hpi.relieving' },
  { id: 'severity', question: "On a scale of 1 to 10, how would you rate your discomfort? Where 1 is mild and 10 is the worst you have ever felt.", quickReplies: ['1-2 (Mild)', '3-4 (Moderate)', '5-6 (Significant)', '7-8 (Severe)', '9-10 (Very severe)'], section: 'hpi.severity' },
  { id: 'past_medical', question: "Do you have any existing medical conditions like diabetes, high blood pressure, or thyroid problems?", quickReplies: ['Diabetes', 'Hypertension', 'Thyroid', 'Asthma', 'Heart disease', 'None'], section: 'past_medical' },
  { id: 'past_surgical', question: "Have you had any surgeries or operations in the past?", quickReplies: ['Yes, major surgery', 'Yes, minor procedure', 'No surgeries', 'Not sure'], section: 'past_surgical' },
  { id: 'allergies', question: "Are you allergic to any medicines, foods, or other substances?", quickReplies: ['No allergies', 'Penicillin', 'Sulfa drugs', 'Aspirin', 'Food allergy', 'Not sure'], section: 'drug_allergy' },
  { id: 'family', question: "Does anyone in your family have conditions like diabetes, heart disease, or high blood pressure?", quickReplies: ['Diabetes in family', 'Heart disease in family', 'BP in family', 'Cancer in family', 'No family history', 'Not sure'], section: 'family_history' },
  { id: 'personal', question: "Do you smoke, consume alcohol, or use tobacco products?", quickReplies: ['Non-smoker', 'Smoker', 'Alcohol consumer', 'Tobacco user', 'Former smoker', 'None of these'], section: 'personal_history' },
];

// AYUSH / Dashavidha Pariksha questions
export const ayushQuestions = [
  { id: 'prakriti', question: "What is your body constitution (Prakriti)? Do you feel you are more Vata (slender, energetic), Pitta (medium build, intense), or Kapha (solid, calm) type?", quickReplies: ['Vata', 'Pitta', 'Kapha', 'Vata-Pitta', 'Pitta-Kapha', 'Not sure'], section: 'ayush.prakriti' },
  { id: 'vikriti', question: "What is your current imbalance (Vikriti)? Do you feel any particular dosha is aggravated right now?", quickReplies: ['Vata aggravated', 'Pitta aggravated', 'Kapha aggravated', 'Balanced', 'Not sure'], section: 'ayush.vikriti' },
  { id: 'sara', question: "How is the quality of your tissues (Sara)? Do you feel your body is well-nourished and strong?", quickReplies: ['Excellent', 'Good', 'Average', 'Poor', 'Very weak'], section: 'ayush.sara' },
  { id: 'samhanana', question: "How is your body build and compactness (Samhanana)? Is your body well-proportioned and compact?", quickReplies: ['Well-built', 'Compact', 'Average', 'Loose build', 'Frail'], section: 'ayush.samhanana' },
  { id: 'pramana', question: "What are your body measurements (Pramana)? Is your height-to-weight ratio proportionate?", quickReplies: ['Proportionate', 'Slightly overweight', 'Slightly underweight', 'Obese', 'Very thin'], section: 'ayush.pramana' },
  { id: 'satmya', question: "What foods and habits are you accustomed to (Satmya)? Do you tolerate spicy, cold, or heavy foods well?", quickReplies: ['Tolerate all', 'Prefer warm food', 'Prefer mild food', 'Sensitive to cold', 'Sensitive to spicy'], section: 'ayush.satmya' },
  { id: 'sattva', question: "How is your mental state and temperament (Sattva)? Are you generally calm, anxious, or easily disturbed?", quickReplies: ['Very calm', 'Generally calm', 'Moderate', 'Anxious', 'Easily disturbed'], section: 'ayush.sattva' },
  { id: 'ahara_shakti', question: "How is your digestive and food intake capacity (Ahara Shakti)? Do you digest food well and have good appetite?", quickReplies: ['Excellent appetite', 'Good digestion', 'Variable appetite', 'Poor appetite', 'Indigestion issues'], section: 'ayush.ahara_shakti' },
  { id: 'vyayama_shakti', question: "What is your physical stamina and exercise capacity (Vyayama Shakti)? Can you do moderate physical exertion without fatigue?", quickReplies: ['Excellent stamina', 'Good capacity', 'Average', 'Low stamina', 'Easily fatigued'], section: 'ayush.vyayama_shakti' },
  { id: 'vaya', question: "What is your age category (Vaya)? This helps us understand your life stage.", quickReplies: ['Child (0-12)', 'Youth (13-30)', 'Adult (31-60)', 'Elderly (60+)'], section: 'ayush.vaya' },
  { id: 'ahara_vihara', question: "Describe your daily diet and lifestyle (Ahara-Vihara). Do you follow any specific dietary practices or daily routine?", quickReplies: ['Vegetarian', 'Non-vegetarian', 'Vegan', 'Fasting regularly', 'Irregular meals', 'Regular routine'], section: 'ayush.ahara_vihara' },
  { id: 'chief', question: "What brings you to the hospital today? What is your main health concern?", quickReplies: ['Digestive issues', 'Joint pain', 'Stress/Anxiety', 'Sleep problems', 'Skin issues', 'Other'], section: 'chief_complaint' },
];

// Mock OCR extracted data
export const mockOcrResults = [
  {
    diagnosis: ['Type 2 Diabetes Mellitus', 'Hypertension'],
    medications: ['Metformin 500mg BD', 'Amlodipine 5mg OD', 'Atorvastatin 10mg HS'],
    labValues: [
      { name: 'HbA1c', value: '6.8', unit: '%', referenceRange: '<5.7', confidence: 0.95 },
      { name: 'Fasting Glucose', value: '126', unit: 'mg/dL', referenceRange: '70-100', confidence: 0.92 },
      { name: 'Total Cholesterol', value: '245', unit: 'mg/dL', referenceRange: '<200', confidence: 0.88 },
    ],
    patientName: 'Rajesh Kumar',
    date: '2024-03-10',
    hospital: 'City General Hospital',
  },
  {
    diagnosis: ['Hypothyroidism'],
    medications: ['Thyronorm 50mcg OD'],
    labValues: [
      { name: 'TSH', value: '8.5', unit: 'mIU/L', referenceRange: '0.4-4.0', confidence: 0.91 },
      { name: 'T3', value: '95', unit: 'ng/dL', referenceRange: '80-200', confidence: 0.85 },
      { name: 'T4', value: '6.2', unit: 'mcg/dL', referenceRange: '4.5-12', confidence: 0.87 },
    ],
    patientName: 'Rajesh Kumar',
    date: '2024-07-15',
    hospital: 'Thyrocare Labs',
  },
];

// Translations for key UI strings
export const translations: Record<string, Record<string, string>> = {
  en: {
    startVisit: 'Start My Visit',
    welcome: 'Welcome to MediKiosk',
    tagline: 'AI-powered clinical history intake for better care',
    loginMobile: 'Login with Mobile OTP',
    loginAbha: 'Connect ABHA ID',
    walkIn: 'Continue as Walk-in Patient',
    consent: 'Consent & Privacy',
    consentDesc: 'Please review and agree to the following before we begin',
    chatbotDisclaimer: 'This assistant collects information for your doctor. It does not diagnose or treat.',
    ayushMode: 'AYUSH / Ayurveda Mode',
    uploadDocs: 'Upload Documents',
    reviewSummary: 'Review Your Summary',
    submitToDoctor: 'Submit to Doctor',
  },
  hi: {
    startVisit: 'अपनी विज़िट शुरू करें',
    welcome: 'मेडिकियोस्क में आपका स्वागत है',
    tagline: 'बेहतर देखभाल के लिए एआई-संचालित नैदानिक इतिहास',
    loginMobile: 'मोबाइल ओटीपी से लॉगिन करें',
    loginAbha: 'एभा आईडी कनेक्ट करें',
    walkIn: 'नए मरीज के रूप में जारी रखें',
    consent: 'सहमति और गोपनीयता',
    consentDesc: 'शुरू करने से पहले कृपया निम्नलिखित की समीक्षा करें',
    chatbotDisclaimer: 'यह सहायक आपके डॉक्टर के लिए जानकारी एकत्र करता है। यह निदान या उपचार नहीं करता।',
    ayushMode: 'आयुष / आयुर्वेद मोड',
    uploadDocs: 'दस्तावेज़ अपलोड करें',
    reviewSummary: 'अपना सारांश देखें',
    submitToDoctor: 'डॉक्टर को भेजें',
  },
};
