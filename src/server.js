require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const connectDB = require('./config/db')

const app = express()
connectDB()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)

app.use('/api/auth', require('./routes/authRoutes'))

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

const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log(`✅ Server: rodando na porta ${PORT}`)
})