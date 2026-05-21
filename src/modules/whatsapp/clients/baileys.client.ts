import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState
} from '@whiskeysockets/baileys'

import path from 'path'
import sessionManager from '../managers/session.manager.js'



export async function createWhatsAppConnection(
  sessionId: string
) {
  const sessionPath = path.resolve(
    'sessions',
    sessionId
  )

  const { state, saveCreds } =
    await useMultiFileAuthState(sessionPath)

  const { version } =
    await fetchLatestBaileysVersion()

  const socket = makeWASocket({
    version,
    auth: state,
  })

  sessionManager.createSession({
    sessionId,
    socket,
    qr: null,
    status: 'connecting'
  })

  socket.ev.on('creds.update', saveCreds)

  socket.ev.on('connection.update', update => {
    const { connection, qr } = update

    if (qr) {
      sessionManager.updateSession(sessionId, {
        qr,
        status: 'qr_pending'
      })
    }

    if (connection === 'open') {
      console.log('✅ WhatsApp connected')

      sessionManager.updateSession(sessionId, {
        status: 'connected',
        qr: null
      })
    }

    if (connection === 'close') {
      console.log('❌ WhatsApp disconnected')

      sessionManager.updateSession(sessionId, {
        status: 'disconnected'
      })
    }
  })

  return socket
}