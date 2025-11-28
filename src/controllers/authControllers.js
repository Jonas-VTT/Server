const user = require('../models/User')
const bcrypt = require('bcryptsjs')
const jwt = require('jsonwebtoken')

const generateToken = (id) => {
   return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: '90d'
   })
}

exports.register = async (req, res) => {
   try {
      const { username, email, password } = req.body
      const userExists = await user.findOne({ email })
      if (userExists) {
         return res.status(400).json({ message: 'E-mail já cadastrado' })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const user = await user.create({
         username,
         email,
         password: hashedPassword
      })

      if (user) {
         res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id)
         })
      }
      else {
         res.status(400).json({ message: 'Dados de usuários inválidos' })
      }
   }
   catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro no servidor' })
   }
}
exports.login = async (req, res) => {
   try {
      const { email, password } = req.body
      const user = await user.findOnde({ email })

      if (user && (await bcrypt.compare(password, user.password))) {
         res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id)
         })
      }
      else {
         res.status(401).json({ message: 'E-mail ou senha inválidos' })
      }
   }
   catch (error) {
      console.error(error)
      res.status(500).json({ message: 'Erro no servidor'})
   }
}