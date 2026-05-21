import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())

app.use(express.json())

app.get('/', (req, res) => {
  return res.json({
    status: 'ok',
    message: 'GS CRM WhatsApp API'
  })
})

export default app