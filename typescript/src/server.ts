import dotenv from 'dotenv'
dotenv.config()

import https from 'https'
import fs from 'fs'
import path from 'path'

import app from './app'

const PORT = Number(process.env.PORT || 5002)
const HOST = process.env.HOST || '0.0.0.0'

const sslOptions = {
  key: fs.readFileSync(
    path.resolve(__dirname, '../cert/local-key.pem')
  ),

  cert: fs.readFileSync(path.resolve(__dirname, '../cert/local.pem')),
}

https.createServer(sslOptions, app).listen(PORT, HOST, () => {
  console.log(`Leave management API running on https://localhost:${PORT}`)
})
