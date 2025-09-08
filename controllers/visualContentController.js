const visualContentService = require('../Model/services/visualContentService');

// Create visual content
async function createVisualContent(req, res) {
    try {
        const visualContent = await visualContentService.createVisualContent(req.body);
        res.status(201).json(visualContent);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

// Get visual content by ID
async function getVisualContent(req, res) {
    try {
        const visualContent = await visualContentService.getVisualContent(req.params.id);
        if (!visualContent) {
            return res.status(404).json({ error: 'Visual content not found' });
        }
        res.json(visualContent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

module.exports = {
    createVisualContent,
    getVisualContent
};