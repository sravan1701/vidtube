import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"

// Get all videos with pagination, search, and sorting
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);

    let filter = {};

    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }

    if (userId) {
        filter.owner = userId;
    }

    const sort = {};
    if (sortBy) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    try {
        const videos = await Video.find(filter)
            .sort(sort)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const total = await Video.countDocuments(filter);

        return res.status(200).json({
            page: pageNumber,
            limit: limitNumber,
            total,
            results: videos
        });
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
});

// Publish a new video
const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const videoFile = req.file
    const { _id: ownerId } = req.user

    if (!title || !description || !videoFile) {
        return res.status(400).json({ message: 'Title, description, and video file are required.' })
    }

    try {
        // Upload video and thumbnail to Cloudinary
        const videoUploadResponse = await uploadOnCloudinary(videoFile)
        // You may want to use a separate thumbnail file, here we use the same file for demo
        const thumbnailUploadResponse = await uploadOnCloudinary(videoFile)

        if (!videoUploadResponse) {
            return res.status(500).json({ message: 'Error occurred while uploading file' })
        }

        const newVideo = new Video({
            videoFile: videoUploadResponse.url,
            thumbnail: thumbnailUploadResponse.url || null,
            description: description,
            duration: videoUploadResponse.duration,
            title: title,
            owner: ownerId
        })

        await newVideo.save()
        return res.status(201).json({
            message: "Video published successfully",
            video: newVideo
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
})

// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        return res.status(400).json({ message: "videoId is required" })
    }
    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }
        return res.status(200).json(video)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

// Update video details
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    let thumbnailFile = req.file

    if (!videoId) {
        return res.status(400).json({ message: "videoId is required" })
    }

    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }

        if (title) video.title = title
        if (description) video.description = description

        if (thumbnailFile) {
            const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailFile)
            if (thumbnailUploadResponse && thumbnailUploadResponse.secure_url) {
                video.thumbnail = thumbnailUploadResponse.secure_url
            }
        }

        await video.save()
        return res.status(200).json({
            message: "Video updated successfully",
            video
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

// Delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        return res.status(400).json({ message: "videoId is required" })
    }
    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }
        await Video.findByIdAndDelete(videoId)
        return res.status(200).json({ message: "Video deleted successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

// Toggle publish status (published/unpublished)
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        return res.status(400).json({ message: "videoId is required" })
    }
    try {
        const video = await Video.findById(videoId)
        if (!video) {
            return res.status(404).json({ message: "Video not found" })
        }
        video.published = !video.published
        await video.save()
        return res.status(200).json({
            message: `Video ${video.published ? "published" : "unpublished"} successfully`,
            video
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
