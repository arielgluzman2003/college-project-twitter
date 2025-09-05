const express = require('express');
const router = express.Router();
const followService = require('../Model/services/followService');

// Get all users followed by :username
async function getFollowedUsers(req, res) {
    try {
        const followed = await followService.getFollowedUsernames(req.params.username);
        res.json(followed);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Create a follow relationship
async function createFollow(req, res) {
    try {
        const { follower, followed } = req.body;
        const follow = await followService.createFollow(follower, followed);
        res.status(201).json(follow);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
}

module.exports = { getFollowedUsers, createFollow };