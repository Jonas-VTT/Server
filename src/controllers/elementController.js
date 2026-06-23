const Scene = require('../models/Scene')
const MapShape = require('../models/map/MapShape')
const MapWall = require('../models/map/MapWall')
const MapProp = require('../models/map/MapProp')
const MapToken = require('../models/map/MapToken')
const MapLight = require('../models/map/MapLight')

const getModel = (type) => {
    const models = {
        shape: MapShape,
        wall: MapWall,
        prop: MapProp,
        token: MapToken,
        light: MapLight
    }
    return models[type]
}

exports.addElement = async (req, res) => {
    try {
        const { sceneId, collectionType } = req.params
        const Model = getModel(collectionType)
        
        if (!Model) return res.status(400).json({ message: "Tipo de elemento inválido." })

        const newElement = await Model.create({ ...req.body, scene: sceneId })

        const scene = await Scene.findById(sceneId)
        if (req.io && scene) {
            req.io.to(scene.campaign.toString()).emit('element_added', { collectionType, element: newElement })
        }

        res.status(201).json(newElement)
    } catch (error) {
        console.error("Erro ao adicionar elemento:", error)
        res.status(500).json({ message: "Erro ao criar elemento." })
    }
}

exports.updateElement = async (req, res) => {
    try {
        const { collectionType, elementId } = req.params
        const Model = getModel(collectionType)

        if (!Model) return res.status(400).json({ message: "Tipo de elemento inválido." })

        const updatedElement = await Model.findOneAndUpdate(
            { id: elementId },
            { $set: req.body },
            { new: true }
        )

        if (!updatedElement) return res.status(404).json({ message: "Elemento não encontrado." })

        const scene = await Scene.findById(updatedElement.scene)
        if (req.io && scene) {
            req.io.to(scene.campaign.toString()).emit('element_updated', { collectionType, element: updatedElement })
        }

        res.json(updatedElement)
    } 
    catch (error) {
        console.error("Erro ao atualizar elemento:", error)
        res.status(500).json({ message: "Erro ao atualizar." })
    }
}

exports.removeElement = async (req, res) => {
    try {
        const { collectionType, elementId } = req.params
        const Model = getModel(collectionType)

        if (!Model) return res.status(400).json({ message: "Tipo de elemento inválido." })

        const deletedElement = await Model.findOneAndDelete({ id: elementId })

        if (deletedElement) {
            const scene = await Scene.findById(deletedElement.scene)
            if (req.io && scene) {
                req.io.to(scene.campaign.toString()).emit('element_removed', { collectionType, elementId })
            }
        }

        res.json({ message: "Elemento removido." })
    } 
    catch (error) {
        console.error("Erro ao remover elemento:", error)
        res.status(500).json({ message: "Erro ao remover." })
    }
}