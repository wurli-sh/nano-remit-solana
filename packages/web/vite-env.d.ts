/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_NANO_USD: string
  readonly VITE_RECEIPT: string
  readonly VITE_VAULT: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_WALLET_CONNECT_PROJECT_ID: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
