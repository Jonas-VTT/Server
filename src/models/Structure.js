const mongoose = require('mongoose')

const StructureSchema = new mongoose.Schema({
   name: { type: String, required: true },
   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
   
   // Categoria para organizar na biblioteca (ex: "Tavernas", "Cavernas", "Florestas")
   folder: { type: String, default: 'root' }, 
   
   // Dimensões da estrutura (para o gerador saber se cabe no mapa)
   width: { type: Number, default: 10 }, // Em grids
   height: { type: Number, default: 10 },
   
   // A Thumbnail é essencial para você escolher a estrutura visualmente depois
   thumbnail: { type: String }, // Base64 ou URL

   // Os elementos visuais (Paredes, Chãos, Props)
   // Exatamente a mesma estrutura do SceneElement, mas sem IDs de instância
   elements: [{
      type: { type: String }, // 'wall', 'floor', 'object'
      x: Number, // Posição Relativa ao centro da estrutura
      y: Number,
      rotation: Number,
      width: Number,
      height: Number,
      src: String, // Textura/Imagem
      
      // Propriedades específicas
      points: [Number], // Para paredes
      tilesX: Number,
      tilesY: Number,
      shapeType: String,
      layer: String,
      
      // Visibilidade e Bloqueio
      visible: { type: Boolean, default: true },
      locked: { type: Boolean, default: false }
   }],

   // O CORAÇÃO DO SISTEMA PROCEDURAL
   // Sockets definem onde essa peça se conecta com outras
   sockets: [{
      x: Number, // Grid X relativo
      y: Number, // Grid Y relativo
      direction: { type: String, enum: ['top', 'bottom', 'left', 'right'] }, 
      type: { type: String, default: 'generic' } // Ex: 'door', 'corridor', 'sewer'
   }],

   createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Structure', StructureSchema)