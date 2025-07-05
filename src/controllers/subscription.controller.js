import mongoose from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// Toggle subscription (subscribe/unsubscribe)
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const { _id: userId } = req.user

    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        return res.status(400).json({ message: "No valid channel Id specified" })
    }
    if (channelId === userId.toString()) {
        return res.status(400).json({ message: "You cannot subscribe to your own channel" })
    }

    try {
        const channelExist = await User.findById(channelId).select("-password -refreshToken")
        if (!channelExist) {
            return res.status(404).json({ message: "Channel not found" })
        }

        const existing = await Subscription.findOne({ subscriber: userId, channel: channelId })
        if (existing) {
            await Subscription.deleteOne({ _id: existing._id })
            return res.status(200).json({ message: "Unsubscribed from channel successfully" })
        } else {
            const newSubscriber = new Subscription({
                subscriber: userId,
                channel: channelId
            })
            await newSubscriber.save()
            return res.status(201).json({ message: "Subscribed to channel successfully" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" })
    }
})

// Get subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId || !mongoose.Types.ObjectId.isValid(channelId)) {
        return res.status(400).json({ message: "No valid channelId has been specified" })
    }
    try {
        const channelExist = await User.findById(channelId)
        if (!channelExist) {
            return res.status(404).json({ message: "No channel found" })
        }
        const subscriberList = await Subscription.aggregate([
            { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
            {
                $project: {
                    _id: 0,
                    subscriber: 1
                }
            }
        ])
        return res.status(200).json(subscriberList)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "internal server error" })
    }
})

// Get channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId || !mongoose.Types.ObjectId.isValid(subscriberId)) {
        return res.status(400).json({ message: "No valid subscriber Id specified" })
    }
    try {
        const channelList = await Subscription.aggregate([
            { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
            {
                $project: {
                    _id: 0,
                    channel: 1
                }
            }
        ])
        return res.status(200).json(channelList)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "internal server error" })
    }
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}