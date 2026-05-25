import dotenv from 'dotenv'
import app from './app.js'

import './database/db.js'

dotenv.config()

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})