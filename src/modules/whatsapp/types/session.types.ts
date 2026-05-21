import { WASocket } from '@whiskeysockets/baileys'

export type SessionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'qr_pending'
  | 'reconnecting'

export interface WhatsAppSession {
  sessionId: string
  socket: WASocket | null
  qr: string | null
  status: SessionStatus
}