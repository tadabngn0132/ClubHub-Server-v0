import { prisma } from '../libs/prisma.js'

// ==========CHƯA ĐẾN SPRINT -> CHƯA TRIỂN KHAI CHÍNH XÁC -> CHƯA TEST==========

export const createActivity = async (req, res) => {
  try {
    const payload = req.body
    
    const newActivity = await prisma.activity.create({
      data: payload
    })

    res.status(201).json({
      success: true,
      message: 'Activity created successfully',
      data: newActivity
    })
  } catch (err) {
    console.log("Error create activity function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Create activity error: ${err.message}`
    })
  }
}

export const getActivities = async (req, res) => {
  try {
    const activities = await prisma.activity.findMany()

    res.status(200).json({
      success: true,
      message: 'Get all activities successfully',
      data: activities
    })
  } catch (err) {
    console.log("Error get activities function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activities error: ${err.message}`
    })
  }
}

export const getActivityById = async (req, res) => {
  try {
    const { id } = req.params

    const storedActivity = await prisma.activity.findUnique({
      where: { id: Number(id) }
    })

    if (!storedActivity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Get activity by ID successfully',
      data: storedActivity
    })
  } catch (err) {
    console.log("Error get activity by ID function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activity by ID error: ${err.message}`
    })
  }
}

export const getActivitiesBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const activity = await prisma.activity.findUnique({
      where: { slug: slug }
    })

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Get activities by slug successfully',
      data: activity
    })
  } catch (err) {
    console.log("Error get activities by slug function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Get activities by slug error: ${err.message}`
    })
  }
}

export const updateActivity = async (req, res) => {
  try {
    const { id } = req.params
    const payload = req.body

    const updatedActivity = await prisma.activity.update({
      where: { id: Number(id) },
      data: payload
    })

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully',
      data: updatedActivity
    })
  } catch (err) {
    console.log("Error update activity function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Update activity error: ${err.message}`
    })
  }
}

export const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params

    const deletedActivity = await prisma.activity.delete({
      where: { id: Number(id) }
    })

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully',
      data: deletedActivity
    })
  } catch (err) {
    console.log("Error delete activity function: ", err.message)
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete activity error: ${err.message}`
    })
  }
}