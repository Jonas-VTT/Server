const Folder = require('../models/Folder')
const Scene = require('../models/Scene')
const Campaign = require('../models/Campaign')
const MapShape = require('../models/map/MapShape')
const MapCollision = require('../models/map/MapCollision')
const MapProp = require('../models/map/MapProp')
const MapToken = require('../models/map/MapToken')
const MapLight = require('../models/map/MapLight')

exports.createScene = async (req, res) => {
    try {
        const scene = await Scene.create(req.body)
        res.status(201).json(scene)
    } catch (error) {
        console.error("Erro ao criar cena:", error)
        res.status(500).json({ message: "Erro ao criar cena." })
    }
}
exports.getScenes = async (req, res) => {
    try {
        const { campaignId } = req.params
        const scenes = await Scene.find({ campaign: campaignId }).sort({ createdAt: -1 })

        res.json(scenes)
    }
    catch (error) {
        console.error("Erro ao buscar cenas:", error)
        res.status(500).json({ message: "Erro ao buscar cenas." })
    }
}
exports.getSceneById = async (req, res) => {
    try {
        const scene = await Scene.findById(req.params.id)
        if (!scene) {
            return res.status(404).json({ message: "Cena não encontrada" })
        }

        const [shapes, collisions, props, tokens, lights] = await Promise.all([
            MapShape.find({ scene: scene._id }),
            MapCollision.find({ scene: scene._id }),
            MapProp.find({ scene: scene._id }),
            MapToken.find({ scene: scene._id }),
            MapLight.find({ scene: scene._id })
        ])

        const sceneData = scene.toObject()
        sceneData.elements = [
            ...shapes,
            ...collisions,
            ...props,
            ...tokens,
            ...lights
        ]

        res.json(sceneData)
    } 
    catch (error) {
        console.error("Erro ao buscar cena:", error)
        res.status(500).json({ message: "Erro ao buscar cena" })
    }
}
exports.updateScene = async (req, res) => {
    try {
        const { id } = req.params
        const updates = req.body
        const updatedScene = await Scene.findByIdAndUpdate(id, updates, { new: true })
        if (!updatedScene) {
            return res.status(404).json({ message: "Cena não encontrada." })
        }
        res.json(updatedScene)
    } catch (error) {
        console.error("Erro ao atualizar cena:", error)
        res.status(500).json({ message: "Erro ao atualizar cena." })
    }
}
exports.activateScene = async (req, res) => {
    try {
        const { id } = req.params
        const { campaignId } = req.body

        if (!campaignId) {
            return res.status(400).json({ message: "CampaignId é obrigatório" })
        }

        await Scene.updateMany(
            { campaign: campaignId },
            { $set: { isActive: false } }
        )

        const activeScene = await Scene.findByIdAndUpdate(
            id,
            { $set: { isActive: true } },
            { new: true }
        )

        await Campaign.findByIdAndUpdate(
            campaignId,
            { $set: { activeScene: id } }
        )

        res.json(activeScene)

    } catch (error) {
        console.error("Erro ao ativar cena:", error)
        res.status(500).json({ message: "Erro ao ativar cena." })
    }
}
exports.deleteScene = async (req, res) => {
    try {
        const { id } = req.params

        await Scene.findByIdAndDelete(id)

        res.json({ message: "Cena deletada com sucesso." })
    } catch (error) {
        console.error("Erro ao deletar cena:", error)
        res.status(500).json({ message: "Erro ao deletar cena." })
    }
}

exports.createFolder = async (req, res) => {
    try {
        const folder = await Folder.create(req.body)
        res.status(201).json(folder)
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar pasta" })
    }
}
exports.deleteFolder = async (req, res) => {
    try {
        const { id } = req.params
        await Scene.updateMany({ folder: id }, { folder: null })
        await Folder.findByIdAndDelete(id)
        res.json({ message: "Pasta deletada" })
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar" })
    }
}
exports.getFolders = async (req, res) => {
    try {
        const folders = await Folder.find({ campaign: req.params.campaignId })
        res.json(folders)
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar pastas" })
    }
}