const Asset = require('../models/Asset')
const AssetFolder = require('../models/AssetFolder')
const sizeOf = require('image-size')
const path = require('path')
const fs = require('fs')


exports.createFolder = async (req, res) => {
    try {
        const { name, campaign, parent } = req.body
        const folder = await AssetFolder.create({ name, campaign, parent })
        res.status(201).json(folder)
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar pasta de assets" })
    }
}
exports.getFolders = async (req, res) => {
    try {
        const { campaignId } = req.params
        // Busca pastas raiz (parent: null) ou todas, dependendo de como vamos montar a UI
        // Por enquanto vamos buscar TODAS da campanha e montar a árvore no front
        const folders = await AssetFolder.find({ campaign: campaignId })
        res.json(folders)
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar pastas" })
    }
}
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params
        await Asset.updateMany({ folder: id }, { folder: null })
        await AssetFolder.updateMany({ parent: id }, { parent: null })

        await AssetFolder.findByIdAndDelete(id)
        res.json({ message: "Pasta deletada" })
    } 
    catch (error) {
        res.status(500).json({ message: "Erro ao deletar pasta" })
    }
}

exports.uploadAsset = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" })

        const { campaignId, folderId, name, type } = req.body

        let dimensions = { width: 100, height: 100 }
        try {
            dimensions = sizeOf(req.file.path)
        }
        catch (e) {
            console.log("Não foi possível ler dimensões da imagem")
        }

        let subfolder = 'misc'
        if (req.file.mimetype.startsWith('image/')) subfolder = 'images'
        else if (req.file.mimetype.startsWith('video/')) subfolder = 'videos'

        const url = `/uploads/${subfolder}/${req.file.filename}`

        const asset = await Asset.create({
            name: name || req.file.originalname,
            url,
            campaign: campaignId,
            folder: folderId || null,
            width: dimensions.width,
            height: dimensions.height,
            type: type || 'prop'
        })

        res.status(201).json(asset)
    }
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro no upload do asset" })
    }
}
exports.deleteAsset = async (req, res) => {
    try {
        const { id } = req.params

        const asset = await Asset.findById(id)
        if (!asset) return res.status(404).json({ message: "Asset não encontrado" })

        if (asset.url) {
            const filePath = path.join(__dirname, '..', asset.url)
            
            if (fs.existsSync(filePath)) {
                fs.unlink(filePath, (err) => {
                    if (err) console.error("Erro ao deletar arquivo físico:", err)
                    else console.log("Arquivo físico deletado:", filePath)
                })
            }
        }

        await Asset.findByIdAndDelete(id)
        res.json({ message: "Asset deletado" })
    } 
    catch (error) {
        res.status(500).json({ message: "Erro ao deletar asset" })
    }
}
exports.updateAsset = async (req, res) => {
    try {
        const { id } = req.params
        const { name, type, folderId, defaultGridWidth, defaultGridHeight, isTiled } = req.body
        const updateData = { name, type, defaultGridWidth, defaultGridHeight, isTiled }

        if (folderId !== undefined) {
            updateData.folder = folderId
        }

        if (req.file) {
            let subfolder = 'misc'
            if (req.file.mimetype.startsWith('image/')) subfolder = 'images'
            else if (req.file.mimetype.startsWith('video/')) subfolder = 'videos'

            updateData.url = `/uploads/${subfolder}/${req.file.filename}`
            try {
                const dimensions = sizeOf(req.file.path)
                updateData.width = dimensions.width
                updateData.height = dimensions.height
            } 
            catch (e) { }
        }

        const updatedAsset = await Asset.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        )

        res.json(updatedAsset)
    } 
    catch (error) {
        console.error(error)
        res.status(500).json({ message: "Erro ao atualizar asset", error: error.message })
    }
}
exports.getAssets = async (req, res) => {
    try {
        const { campaignId } = req.params
        const assets = await Asset.find({ campaign: campaignId }).sort({ createdAt: -1 })
        res.json(assets)
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar assets" })
    }
}