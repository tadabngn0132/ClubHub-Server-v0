import { prisma } from "../libs/prisma";

export const registerForActivity = async (req, res) => {
  try {
    const { userId, activityId } = req.body;
    const registration = await prisma.activityRegistration.create({
      userId: Number(userId),
      activityId,
    });
    res.status(201).json({
      success: true,
      message: "Registered for activity successfully",
      data: registration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Register for activity error: ${error.message}`,
    });
  }
};

export const getRegistrations = async (req, res) => {
  try {
    const registrations = await prisma.activityRegistration.findMany();
    res.status(200).json({
      success: true,
      message: 'Get all registrations successfully',
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get registrations error: ${error.message}`
    });
  }
};

export const getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await prisma.activityRegistration.findUnique({
      where: { id: Number(registrationId) },
    });
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: "Registration not found" 
      });
    }
    res.status(200).json({
      success: true,
      message: "Get registration by ID successfully",
      data: registration
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get registration by ID error: ${error.message}`
    });
  }
};

export const getRegistrationsByActivityId = async (req, res) => {
  try {
    const { activityId } = req.params;
    const registrations = await prisma.activityRegistration.findMany({
      where: { activityId: Number(activityId) },
    });
    res.status(200).json({
      success: true,
      message: "Get registrations by activity ID successfully",
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get registrations by activity ID error: ${error.message}`
    });
  }
};

export const getRegistrationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const registrations = await prisma.activityRegistration.findMany({
      where: { userId: Number(userId) },
    });
    res.status(200).json({
      success: true,
      message: "Get registrations by user ID successfully",
      data: registrations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Get registrations by user ID error: ${error.message}`
    });
  }
};

export const updateRegistrationStatus = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { status } = req.body;
    const registration = await prisma.activityRegistration.findUnique({
      where: { id: Number(registrationId) },
    });
    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Registration not found",
      });
    }
    const updatedRegistration = await prisma.activityRegistration.update({
      where: { id: Number(registrationId) },
      data: { status },
      });
    res.status(200).json({
      success: true,
      message: "Update registration status successfully",
      data: updatedRegistration,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Update registration status error: ${error.message}`,
    });
  }
};

export const deleteRegistration = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const registration = await prisma.activityRegistration.findUnique({
      where: { id: Number(registrationId) },
    });
    if (!registration) {
      return res.status(404).json({ 
        success: false,
        message: "Registration not found" 
      });
    }
    await prisma.activityRegistration.delete({
      where: { id: Number(registrationId) },
    });
    res.status(200).json({ 
      success: true,
      message: "Registration deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete registration error: ${error.message}`
    });
  }
};
