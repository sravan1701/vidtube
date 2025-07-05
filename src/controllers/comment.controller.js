import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query
    if (!videoId) {
        return res.status(400).json({
            message: "no videoId has been specified"
        })
    }
    const comments = await Comment.find({ video: videoId })
        .skip((page - 1) * limit)
        .limit(Number(limit))
    return res.status(200).json(comments)
})

const addComment = asyncHandler(async (req, res) => {
    const owner = req.user._id
    const { content } = req.body
    const { videoId } = req.params
    if (!videoId || !content || !owner) {
        return res.status(400).json({
            message: "all fields are required"
        })
    }
    const video = await Video.findById(videoId)
    if (!video) {
        return res.status(404).json({
            message: "video not found"
        })
    }
    const newComment = new Comment({ content, video: videoId, owner })
    await newComment.save()
    return res.status(201).json(newComment)
})

const updateComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId
    if (!commentId) {
        return res.status(400).json({
            message: "No comment id specified"
        })
    }
    const owner = req.user._id
    const comment = await Comment.findById(commentId)
    if (!comment) {
        return res.status(404).json({
            message: "No comment found"
        })
    }
    if (!comment.owner.equals(owner)) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    const { content } = req.body
    if (!content) {
        return res.status(400).json({
            message: "No content specified"
        })
    }
    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        { $set: { content } },
        { new: true }
    )
    return res.status(200).json(updatedComment)
})

const deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.commentId
    if (!commentId) {
        return res.status(400).json({
            message: "No comment id specified"
        })
    }
    const owner = req.user._id
    const comment = await Comment.findById(commentId)
    if (!comment) {
        return res.status(404).json({
            message: "No comment found"
        })
    }
    if (!comment.owner.equals(owner)) {
        return res.status(401).json({
            message: "unauthorized"
        })
    }
    await Comment.findByIdAndDelete(commentId)
    return res.status(200).json({
        message: "Deleted"
    })
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
