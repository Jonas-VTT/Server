const Asset = require('../models/Asset')
const AssetFolder = require('../models/AssetFolder')
const sizeOf = require('image-size')
const { uploadToB2, deleteFromB2 } = require('../utils/b2Storage')


exports.createFolder = async (req, res) => {
    try {
        const { name, campaign, parent } = req.body
        const folder = await AssetFolder.create({ name, campaign, parent })
        res.status(201).json(folder)
    } 
    catch (error) {
        res.status(500).json({ message: "Erro ao criar pasta de assets" })
    }
}
exports.getFolders = async (req, res) => {
    try {
        const { campaignId } = req.params
        const folders = await AssetFolder.find({ campaign: campaignId })
        res.json(folders)
    } 
    catch (error) {
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
            dimensions = sizeOf(req.file.buffer)
        }
        catch (e) {
            console.log("Não foi possível ler dimensões da imagem")
        }

        let subfolder = 'misc'
        if (req.file.mimetype.startsWith('image/')) subfolder = 'images'
        else if (req.file.mimetype.startsWith('video/')) subfolder = 'videos'

        const url = await uploadToB2(req.file.buffer, req.file.originalname, req.file.mimetype, subfolder)

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
            await deleteFromB2(asset.url)
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
            const oldAsset = await Asset.findById(id)
            if (oldAsset && oldAsset.url) {
                await deleteFromB2(oldAsset.url)
            }

            let subfolder = 'misc'
            if (req.file.mimetype.startsWith('image/')) subfolder = 'images'
            else if (req.file.mimetype.startsWith('video/')) subfolder = 'videos'

            updateData.url = await uploadToB2(req.file.buffer, req.file.originalname, req.file.mimetype, subfolder)
            try {
                const dimensions = sizeOf(req.file.buffer)
                updateData.width = dimensions.width
                updateData.height = dimensions.height
            }
            catch (e) { console.log("Não foi possível ler dimensões") }
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