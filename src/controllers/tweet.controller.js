import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { _id: userId } = req.user
    if (!content) {
        return res.status(400).json({
            message: "content is required"
        })
    }
    const newTweet = new Tweet({
        content: content,
        owner: userId
    })
    try {
        await newTweet.save()
        return res.status(201).json(newTweet)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        return res.status(400).json({
            message: "userId is required"
        })
    }
    try {
        const userExist = await User.findById(userId)
        if (!userExist) {
            return res.status(404).json({
                message: "user not found"
            })
        }
        const userTweets = await Tweet.find({ owner: userId })
        return res.status(200).json(userTweets)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if (!tweetId) {
        return res.status(400).json({
            message: "tweetId is required"
        })
    }
    if (!content) {
        return res.status(400).json({
            message: "content is required"
        })
    }
    try {
        const tweetExist = await Tweet.findById(tweetId)
        if (!tweetExist) {
            return res.status(404).json({
                message: "tweet not found"
            })
        }
        tweetExist.content = content
        await tweetExist.save()
        return res.status(200).json(tweetExist)
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        return res.status(400).json({
            message: "tweetId is required"
        })
    }
    try {
        const tweetExist = await Tweet.findById(tweetId)
        if (!tweetExist) {
            return res.status(404).json({
                message: "tweet not found"
            })
        }
        await Tweet.findByIdAndDelete(tweetId)
        return res.status(200).json({
            message: "Tweet Deleted"
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
