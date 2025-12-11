require('dotenv').config()
const express = require('express')
const http = require('http')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const { Server } = require('socket.io')
const connectDB = require('./config/db')
const { syncDatabase } = require('./utils/dbSync')
const uploadConfig = require('./config/upload')

const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

app.use('/uploads', express.static(path.join(process.cwd(), 'src', 'uploads')))

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/campaigns', require('./routes/campaignRoutes'))
app.use('/api/characters', require('./routes/characterRoutes'))
app.use('/api/upload', require('./routes/uploadRoutes'))
app.use('/api/scenes', require('./routes/sceneRoutes'))

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

io.on('connection', (socket) => {
  socket.on('join_campaign', (campaignId) => {
    socket.join(campaignId)
    console.log(`Usuário ${socket.id} entrou na campanha ${campaignId}`)

    const size = io.sockets.adapter.rooms.get(campaignId)?.size || 0
  })

  socket.on('gm_change_scene', ({ campaignId, scene }) => {
    io.to(campaignId).emit('scene_updated', scene)
  })

  socket.on('gm_media_command', ({ campaignId, action, value }) => {
    io.to(campaignId).emit('media_command_received', { action, value })
  })
})

const PORT = process.env.PORT
connectDB().then(async () => {
  await syncDatabase()

  server.listen(PORT, () => {
    console.log(`✅ Server: rodando na porta ${PORT}`)
  })
})