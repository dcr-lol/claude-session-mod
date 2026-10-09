export type SessionDir = string | null

declare module 'claude-code' {
  interface PluginState {
    'session-dir-button': { dir: SessionDir }
  }
}
