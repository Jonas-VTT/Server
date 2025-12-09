require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { Server } = require('socket.io')
const connectDB = require('./config/db')
const uploadConfig = require('./config/upload')

const app = express()
connectDB()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)


app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/campaigns', require('./routes/campaignRoutes'))
app.use('/api/characters', require('./routes/characterRoutes'))
app.use('/api/upload', require('./routes/uploadRoutes'))

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  console.log(`🔌 Jogador conectado: ${socket.id}`)

  socket.on('join_campaign', (campaignId) => {
    socket.join(campaignId)
    console.log(`Usuário ${socket.id} entrou na campanha ${campaignId}`)
  })

  socket.on('disconnect', () => {
    console.log('📴 Jogador desconectado')
  })
})

const PORT = process.env.PORT
server.listen(PORT, () => {
  console.log(`✅ Server: rodando na porta ${PORT}`)
})