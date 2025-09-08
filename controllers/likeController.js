const express = require('express');
const likesService = require('../Model/services/likeService');
const sessionService = require('../Model/services/sessionService');

async function removeLike(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
       }
         const session = await sessionService.getSessionById(sessionId);
         if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
         }
         const postId = req.body.postId;
         if (!postId) {
             return res.status(400).json({ error: 'postId is required' });
         }
         await likesService.removeLike(postId, session.user);
         res.status(200).json({ message: 'Like removed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Get all users followed by the current user
async function createLike(req, res) {
    try {
        const sessionId = req.cookies.sessionId;
        if (!sessionId) {
            return res.status(401).json({ error: 'Unauthorized' });
       }
       const session = await sessionService.getSessionById(sessionId);
       if (!session) {
            return res.status(401).json({ error: 'Unauthorized' });
       }
        
        const sessionExpiryDate = session.expiryDate;
        if (sessionExpiryDate < new Date()) {
            return res.status(401).json({ error: 'Session expired' });
        }

        if (!req.body.postId) {
            return res.status(400).json({ error: 'postId is required' });
        }

        const postid = req.body.postId;
        if (typeof postid !== 'string' || postid.trim() === '') {
            return res.status(400).json({ error: 'postId must be a non-empty string' });
        }

        const like = await likesService.createLike(postid, session.user);
        res.status(200).json(like);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


module.exports = { createLike, removeLike };