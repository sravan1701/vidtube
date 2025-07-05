import mongoose from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

// Helper to check ObjectId validity
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name || !description) {
        return res.status(400).json({
            message: "All fields are required: name, description"
        })
    }
    const { _id: userId } = req.user
    try {
        const playlist = new Playlist({
            name,
            description,
            owner: userId
        })
        await playlist.save()
        return res.status(201).json({ message: "Playlist created", playlist })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId || !isValidObjectId(userId)) {
        return res.status(400).json({
            message: "Valid userId is required"
        })
    }
    try {
        const playlists = await Playlist.find({ owner: userId })
        if (!playlists || playlists.length === 0) {
            return res.status(404).json({
                message: "No playlists found"
            })
        }
        return res.status(200).json(playlists)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Server error" })
    }
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId || !isValidObjectId(playlistId)) {
        return res.status(400).json({
            message: "Valid playlist id is required"
        })
    }
    try {
        const playlist = await Playlist.findById(playlistId).populate("videos")
        if (!playlist) {
            return res.status(404).json({
                message: "playlist not found"
            })
        }
        return res.status(200).json(playlist)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "internal error occurred"
        })
    }
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId || !isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return res.status(400).json({
            message: "Valid playlist Id and Video Id are required"
        })
    }
    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({
                message: "playlist not found"
            })
        }
        // Ownership check
        if (!playlist.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" })
        }
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({
                message: "video not found"
            })
        }
        if (!playlist.videos.includes(videoId)) {
            playlist.videos.push(videoId)
            await playlist.save()
        }
        return res.status(200).json(playlist)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId || !isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        return res.status(400).json({
            message: "Valid playlist Id and Video Id are required"
        })
    }
    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({
                message: "playlist not found"
            })
        }
        // Ownership check
        if (!playlist.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" })
        }
        if (!playlist.videos.includes(videoId)) {
            return res.status(404).json({
                message: "video not found in playlist"
            })
        }
        playlist.videos = playlist.videos.filter(id => id.toString() !== videoId.toString())
        await playlist.save()
        return res.status(200).json(playlist)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId || !isValidObjectId(playlistId)) {
        return res.status(400).json({
            message: "Valid playlist Id is required"
        })
    }
    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({
                message: "playlist not found"
            })
        }
        // Ownership check
        if (!playlist.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" })
        }
        await Playlist.findByIdAndDelete(playlistId)
        return res.status(200).json({
            message: "playlist deleted"
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!playlistId || !isValidObjectId(playlistId)) {
        return res.status(400).json({
            message: "Valid playlist Id is required"
        })
    }
    try {
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({
                message: "playlist not found"
            })
        }
        // Ownership check
        if (!playlist.owner.equals(req.user._id)) {
            return res.status(403).json({ message: "Unauthorized" })
        }
        if (name && name.trim() !== "") playlist.name = name
        if (description && description.trim() !== "") playlist.description = description
        await playlist.save()
        return res.status(200).json(playlist)
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
