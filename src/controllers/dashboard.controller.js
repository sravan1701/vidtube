import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
  const { _id: ownerId } = req.user;

  if (!ownerId) {
    return res.status(400).json({ message: "No user ID specified" });
  }

  try {
    // Total Likes on all videos of this user
    const totalLike = await Video.aggregate([
      { $match: { owner: ownerId } },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likes"
        }
      },
      {
        $addFields: {
          likeCount: { $size: "$likes" }
        }
      },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: "$likeCount" }
        }
      },
      {
        $project: {
          _id: 0,
          totalLikes: 1
        }
      }
    ]);

    // Total Views of all videos by this user
    const videoViews = await Video.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          viewsCount: { $sum: "$views" }
        }
      },
      {
        $project: {
          _id: 0,
          viewsCount: 1
        }
      }
    ]);

    // Total Subscribers
    const totalSubscribers = await User.aggregate([
      { $match: { _id: ownerId } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscriber"
        }
      },
      {
        $addFields: {
          subscriberCount: { $size: "$subscriber" }
        }
      },
      {
        $project: {
          _id: 0,
          subscriberCount: 1
        }
      }
    ]);

    // Total number of videos by this user
    const totalVideos = await Video.aggregate([
      { $match: { owner: ownerId } },
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          totalVideos: 1
        }
      }
    ]);

    return res.status(200).json({
      totalLikes: totalLike[0]?.totalLikes || 0,
      viewsCount: videoViews[0]?.viewsCount || 0,
      subscriberCount: totalSubscribers[0]?.subscriberCount || 0,
      totalVideos: totalVideos[0]?.totalVideos || 0
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const { _id: ownerId } = req.user;
  if (!ownerId) {
    return res.status(400).json({ message: "No user ID specified" });
  }
  try {
    const videos = await Video.find({ owner: ownerId });
    return res.status(200).json({ videos });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export {
  getChannelStats,
  getChannelVideos
}