/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE44_APP_ID: string;
  readonly VITE_BASE44_BASE_URL: string;
  readonly VITE_AUDIT_ENCRYPTION_KEY: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
