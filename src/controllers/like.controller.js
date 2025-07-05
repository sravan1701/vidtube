import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { Tweet } from "../models/tweet.model.js"
import { Comment } from "../models/comment.model.js"

// Toggle like for a video
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { _id: userId } = req.user

    if (!videoId) {
        return res.status(400).json({ message: "No video Id is specified" })
    }

    const video = await Video.findById(videoId)
    if (!video) {
        return res.status(404).json({ message: "No video has been found" })
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId })
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).json({ message: "Unliked successfully" })
    }

    const newLike = new Like({ video: videoId, likedBy: userId })
    await newLike.save()
    return res.status(200).json({ message: "Liked successfully" })
})

// Toggle like for a comment
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { _id: userId } = req.user

    if (!commentId) {
        return res.status(400).json({ message: "No comment Id is specified" })
    }

    const comment = await Comment.findById(commentId)
    if (!comment) {
        return res.status(404).json({ message: "No comment has been found" })
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId })
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).json({ message: "Unliked successfully" })
    }

    const newLike = new Like({ comment: commentId, likedBy: userId })
    await newLike.save()
    return res.status(200).json({ message: "Liked successfully" })
})

// Toggle like for a tweet
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { _id: userId } = req.user

    if (!tweetId) {
        return res.status(400).json({ message: "No tweet Id is specified" })
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        return res.status(404).json({ message: "No tweet has been found" })
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId })
    if (existingLike) {
        await Like.deleteOne({ _id: existingLike._id })
        return res.status(200).json({ message: "Unliked successfully" })
    }

    const newLike = new Like({ tweet: tweetId, likedBy: userId })
    await newLike.save()
    return res.status(200).json({ message: "Liked successfully" })
})

// Get all liked videos for the user
const getLikedVideos = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user

    try {
        const likedVideos = await Like.aggregate([
            { $match: { likedBy: userId, video: { $exists: true, $ne: null } } },
            {
                $project: {
                    video: 1,
                    _id: 0,
                }
            }
        ])
        res.status(200).json(likedVideos)
    } catch (error) {
        res.status(500).json({ message: 'Error fetching liked videos', error })
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}