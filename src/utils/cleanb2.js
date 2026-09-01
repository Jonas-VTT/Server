require('dotenv').config()
const mongoose = require('mongoose')
const { S3Client, ListObjectsV2Command, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const Character = require('../models/Character')
const Asset = require('../models/Asset')

const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT,
    region: process.env.AWS_REGION || 'us-east-005',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME
const CDN_URL = process.env.B2_PUBLIC_URL // A URL raiz do seu B2

const runCleanup = async () => {
    try {
        console.log('🔄 Conectando ao banco de dados...')
        await mongoose.connect(process.env.MONGO_URI)
        console.log('✅ Banco conectado!')

        console.log('🔍 Coletando URLs em uso no MongoDB...')
        const characters = await Character.find({ imageUrl: { $ne: null, $ne: '' } }, 'imageUrl')
        const assets = await Asset.find({ url: { $ne: null, $ne: '' } }, 'url')

        const usedKeys = new Set()
        
        const extractKey = (url) => {
            if (!url || !url.startsWith(CDN_URL)) return null
            return url.replace(`${CDN_URL}/`, '')
        }

        characters.forEach(c => {
            const key = extractKey(c.imageUrl)
            if (key) usedKeys.add(key)
        })
        assets.forEach(a => {
            const key = extractKey(a.url)
            if (key) usedKeys.add(key)
        })

        console.log(`📊 Arquivos em uso (MongoDB): ${usedKeys.size}`)

        console.log('☁️  Buscando arquivos armazenados no Backblaze B2...')
        const listCommand = new ListObjectsV2Command({ Bucket: B2_BUCKET_NAME })
        const b2Response = await s3.send(listCommand)
        
        const b2Files = b2Response.Contents || []
        console.log(`📊 Arquivos armazenados (B2): ${b2Files.length}`)

        let deletedCount = 0

        console.log('🧹 Iniciando varredura de arquivos órfãos...')
        for (const file of b2Files) {
            if (!usedKeys.has(file.Key)) {
                console.log(`   🗑️ Deletando arquivo órfão: ${file.Key}`)
                const deleteCmd = new DeleteObjectCommand({
                    Bucket: B2_BUCKET_NAME,
                    Key: file.Key
                })
                await s3.send(deleteCmd)
                deletedCount++
            }
        }

        console.log(`\n✨ Faxina concluída! ${deletedCount} arquivos mortos foram removidos.`)
        process.exit(0)

    } 
    catch (error) {
        console.error('❌ Erro durante a faxina:', error)
        process.exit(1)
    }
}

runCleanup()