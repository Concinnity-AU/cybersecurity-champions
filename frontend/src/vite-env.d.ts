/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_TRIBAL_HABITS_ENROL_URL?: string;
  readonly VITE_WORKSHOP_ENQUIRY_URL?: string;
  readonly VITE_SCAMWATCH_SUBSCRIBE_URL?: string;
  readonly VITE_PRIMARY_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
