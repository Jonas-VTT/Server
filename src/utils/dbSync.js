const mongoose = require('mongoose')

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
               const oldMestre = doc.get('mestre')

               if (oldMestre && !doc.master) {
                  console.log(`   👤 Campaign "${doc.title}": Migrando owner (${oldMestre})`)

                  doc.master = oldMestre
                  doc.set('mestre', undefined, { strict: false })
                  modified = true
               }
               if (doc.activeScene === undefined) {
                  doc.activeScene = null
                  doc.markModified('activeScene')
                  modified = true
               }
            }
            if (modelName === 'Scene') {
               const elementsRaw = doc.get('elements')

               if (elementsRaw && elementsRaw.length > 0) {
                  console.log(`   🛠️ Scene "${doc.name}": Migrando ${elementsRaw.length} elementos antigos...`)
                  
                  const db = mongoose.connection.db
                  
                  for (const el of elementsRaw) {
                     const elData = el.toObject ? el.toObject() : el
                     let DestModel;
                     let collectionName = 'mapprops'

                     if (elData.type === 'token') collectionName = 'maptokens'
                     else if (['wall', 'floor', 'shape'].includes(elData.type) || elData.shapeType) collectionName = 'mapshapes'

                     const exists = await db.collection(collectionName).findOne({ id: elData.id, scene: doc._id })
                     if (!exists) {
                        await db.collection(collectionName).insertOne({ ...elData, scene: doc._id })
                     }
                  }

                  doc.set('elements', undefined, { strict: false })
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