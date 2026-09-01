const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')
const crypto = require('crypto')
const path = require('path')

const s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT, 
    region: process.env.AWS_REGION || 'us-east-005', // B2 exige uma região, mesmo genérica
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME
const CDN_URL = process.env.B2_PUBLIC_URL

exports.uploadToB2 = async (fileBuffer, originalName, mimetype, folder) => {
    const hash = crypto.randomBytes(6).toString('hex')
    const ext = path.extname(originalName)
    const fileName = `${folder}/${hash}-${Date.now()}${ext}`

    const command = new PutObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimetype
    })

    await s3.send(command)

    return `${CDN_URL}/${fileName}`
}

exports.deleteFromB2 = async (fileUrl) => {
    if (!fileUrl || !fileUrl.startsWith(CDN_URL)) return

    const fileName = fileUrl.replace(`${CDN_URL}/`, '')

    const command = new DeleteObjectCommand({
        Bucket: B2_BUCKET_NAME,
        Key: fileName
    })

    try {
        await s3.send(command)
        console.log(`🗑️ Arquivo deletado da nuvem: ${fileName}`)
    } 
    catch (error) {
        console.error(`Erro ao deletar ${fileName} do B2:`, error)
    }
}