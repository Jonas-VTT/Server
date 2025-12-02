const jwt = require('jsonwebtoken')
const User = require('../models/User')

const verifyToken = async (req, res, next) => {
   let token

   if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
         token = req.headers.authorization.split(' ')[1]
         const decoded = jwt.verify(token, process.env.JWT_SECRET)

         req.user = await User.findById(decoded.id).select('-password')
         next()
      }
      catch (error){
         console.error(error)
         res.status(401).json({ message: 'Não autorizado, token falhou' })
      }
   }

   if (!token) {
      console.log("Erro na Auth: Sem token no header")
      res.status(401).json({ message: 'Não autorizado, sem token' })
   }
}

module.exports = { verifyToken }