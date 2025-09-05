const express = require('express');
const followService = require('../Model/services/followService');
const sessionService = require('../Model/services/sessionService');

// Get all users followed by the current user
async function getFollowedUsers(req, res) {
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

        const followed = await followService.getFollowedUsernames(session.user);
        res.json(followed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a follow relationship
async function createFollow(req, res) {
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

        const follower = session.user;
        const followed = req.body.followedUser;
        const follow = await followService.createFollow(follower, followed);
        res.status(201).json(follow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getFollowedUsers, createFollow };