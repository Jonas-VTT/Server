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
const server = http.createServer(app)

app.use(cors())
app.use(express.json({ limit: '5gb' }))
app.use(express.urlencoded({ limit: '5gb', extended: true }))
app.use(express.static(path.join(__dirname, 'dist')))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const io = new Server(server, {
  cors: {
    origin: "*", // Libera para qualquer um (Localhost, IP de rede, etc)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true // Necessário se houver cookies, mas com * as vezes dá conflito em alguns browsers, tente false se der erro
  }
})
app.use((req, res, next) => {
  req.io = io
  next()
})

app.use('/api/auth', require('./routes/authRoutes'))
app.use('/api/campaigns', require('./routes/campaignRoutes'))
app.use('/api/characters', require('./routes/characterRoutes'))
app.use('/api/upload', require('./routes/uploadRoutes'))
app.use('/api/scenes', require('./routes/sceneRoutes'))
app.use('/api/library', require('./routes/libraryRoutes'))
app.use('/api/assets', require('./routes/assetRoutes'))
app.use('/api/structures', require('./routes/structureRoutes'))

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

  socket.on('gm_force_view', ({ campaignId, x, y, scale }) => {
    socket.to(campaignId).emit('force_view', { x, y, scale })
  })

  socket.on('gm_sync_view', ({ campaignId, x, y, scale }) => {
    socket.to(campaignId).emit('sync_view', { x, y, scale })
  })
})

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
})

server.timeout = 0
server.keepAliveTimeout = 0

const PORT = process.env.PORT
connectDB().then(async () => {
  await syncDatabase()

  server.listen(PORT, () => {
    console.log(`✅ Server: rodando na porta ${PORT}`)
  })
})