/* Shared types for the frontend, mirroring the API contract from
   the backend brief. The Worker has its own copies; kept in sync by hand. */

export type ChallengeType = 'spot_it' | 'pick_stronger' | 'scenario' | 'real_ai';

export interface ApiOption {
  id: string;
  label: string;
}

export interface SpotItMetadata {
  presentation: 'sms' | 'email' | 'messenger' | 'whatsapp' | 'job_ad';
  sender?: string;
  senderNote?: string;
  verified?: boolean;
  time?: string;
  subject?: string;
  fromName?: string;
  fromAddr?: string;
  avatarLetter?: string;
  avatarColor?: string;
  body?: string[];
  bubbles?: Array<{ text: string; qr?: boolean }>;
  cta?: { label: string; url: string };
  sign?: string[];
}

export interface PickStrongerOption {
  id: string;
  label: string;
  value?: string;
  charCount?: number;
  weak?: boolean;
  hint?: string;
  person?: string;
  avatar?: string;
  avatarColor?: string;
  line?: string;
}

export interface PickStrongerMetadata {
  mode: 'string' | 'approach';
  options: PickStrongerOption[];
}

export type ScenarioVisualHint =
  | 'phone_with_call'
  | 'incoming_call_waveform'
  | 'parking_meter_qr'
  | 'fb_chat'
  | 'auth_choice'
  | null;

export interface ScenarioMetadata {
  setup?: string;
  visual_hint?: ScenarioVisualHint;
  attachmentData?: {
    from: string;
    avatar: string;
    avatarColor: string;
    preview: string;
    time: string;
  };
}

export type ChallengeMetadata =
  | SpotItMetadata
  | PickStrongerMetadata
  | ScenarioMetadata;

export interface ApiChallenge {
  key: string;
  type: ChallengeType;
  category: string;
  difficulty: number;
  metadata: ChallengeMetadata;
  prompt: string;
  options: ApiOption[];
  correct_answer: string;
  explanation: string;
}

export interface ChallengesResponse {
  session_id: string;
  challenges: ApiChallenge[];
}

export type Tier = 'learner' | 'aware' | 'defender' | 'champion';

export interface CompleteResponse {
  completion_id: number;
  session_id: string;
  tier: Tier;
  share_url: string;
  og_image_url: string;
}

export interface AnswerRecord {
  key: string;
  answer: string;
  correct: boolean;
  timeMs: number;
}

export interface CompletePayload {
  session_id: string;
  score: number;
  total: number;
  max_streak: number;
  duration_seconds: number;
  challenges_seen: string[];
  answers: AnswerRecord[];
  language: string;
}

export interface LeadPayload {
  session_id: string;
  first_name: string;
  email: string;
  phone?: string;
  consent_program: boolean;
  consent_marketing: boolean;
  turnstile_token: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
}

export interface LeadResponse {
  ok: boolean;
  lead_id: number;
}

export type SharePlatform = 'facebook' | 'whatsapp' | 'copy' | 'native' | 'twitter';

export interface SharePayload {
  session_id: string;
  platform: SharePlatform;
}

export interface AppConfig {
  apiBase: string;
  turnstileSiteKey: string;
  tribalHabitsEnrolUrl: string;
  workshopEnquiryUrl: string;
  scamwatchSubscribeUrl: string;
  primaryDomain: string;
}
