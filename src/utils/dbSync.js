const Campaign = require('../models/Campaign')
const Character = require('../models/Character')
const Folder = require('../models/Folder')
const Scene = require('../models/Scene')
const Tileset = require('../models/Tileset')
const User = require('../models/User')

const models = {
   Campaign,
   Character,
   Folder,
   Scene,
   Tileset,
   User
}

exports.syncDatabase = async () => {
   console.log('🔄 Iniciando Sincronização e Limpeza do Banco de Dados...')

   const start = Date.now()
   let totalUpdated = 0

   try {
      for (const [modelName, Model] of Object.entries(models)) {
         const documents = await Model.find({})
         let modelCount = 0

         for (const doc of documents) {
            let modified = false

            if (modelName === 'Campaign') {
               if (doc.activeScene === undefined) {
                  doc.activeScene = null
                  doc.markModified('activeScene')
                  modified = true
               }
            }

            if (!modified) {
               doc.markModified('updatedAt')
            }
            await doc.save()
            modelCount++
         }

         if (modelCount > 0) {
            console.log(`   ✅ ${modelName}: ${modelCount} documentos sincronizados.`)
         }
         totalUpdated += modelCount
      }

      const duration = ((Date.now() - start) / 1000).toFixed(2)
      console.log(`✨ Sincronização concluída! ${totalUpdated} documentos processados em ${duration}s.`)
   }
   catch (error) {
      console.error('❌ Erro fatal na sincronização do banco:', error)
   }
}