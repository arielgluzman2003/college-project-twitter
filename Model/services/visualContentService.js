const Visualcontent = require('../schemas/visualcontent');

// Create visual content
async function createVisualContent(data) {
    const visualContent = new Visualcontent(data);
    return await visualContent.save();
}

// Get visual content by ID
async function getVisualContent(id) {
    return await Visualcontent.findById(id);
}

module.exports = {
    createVisualContent,
    getVisualContent
};