const env = import.meta.env

export const DEMO_EMAIL = env.VITE_DEMO_EMAIL || 'demo@kone.ci'
export const DEMO_PASSWORD = env.VITE_DEMO_PASSWORD || 'demo1234'
export const SYNC_DELAY_MS = Number(env.VITE_SYNC_DELAY_MS) || 900
