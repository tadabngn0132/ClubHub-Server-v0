import { prisma } from "../libs/prisma.js";

export const createDepartment = async (req, res) => {
  try {
    const departmentData = req.body;

    const newDepartment = await prisma.department.create({
      data: {
        name: departmentData.name,
        description: departmentData.description,
        isActive: departmentData.isActive,
      },
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: newDepartment,
    });
  } catch (err) {
    console.error("Error in createDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Create department error: ${err.message}`,
    });
  }
};

export const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany();

    res.status(200).json({
      success: true,
      message: "Get all departments successfully",
      data: departments,
    });
  } catch (err) {
    console.error("Error in getAllDepartments function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get all departments error: ${err.message}`,
    });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get department by ID successfully",
      data: department,
    });
  } catch (err) {
    console.error("Error in getDepartmentById function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Get department by ID error: ${err.message}`,
    });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const departmentData = req.body;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    const updatedDepartment = await prisma.department.update({
      where: {
        id: Number(id),
      },
      data: {
        name: departmentData.name,
        description: departmentData.description,
        isActive: departmentData.isActive,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data: updatedDepartment,
    });
  } catch (err) {
    console.error("Error in updateDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Update department error: ${err.message}`,
    });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const department = await prisma.department.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    await prisma.department.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteDepartment function:", err);
    res.status(500).json({
      success: false,
      message: `Internal server error / Delete department error: ${err.message}`,
    });
  }
};

export const createManyDepartments = async (req, res) => {
  try {
    const items = req.body?.items;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "items array is required and cannot be empty" });
    }

    const result = await prisma.department.createMany({ data: items, skipDuplicates: true });
    res.status(201).json({ success: true, message: "Departments createMany successful", data: result });
  } catch (err) {
    console.error("Error in createManyDepartments:", err);
    res.status(500).json({ success: false, message: `Internal server error / Create many departments error: ${err.message}` });
  }
};

export const getManyDepartments = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const records = await prisma.department.findMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Departments getMany successful", data: records });
  } catch (err) {
    console.error("Error in getManyDepartments:", err);
    res.status(500).json({ success: false, message: `Internal server error / Get many departments error: ${err.message}` });
  }
};

export const updateManyDepartments = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];
    const updateData = req.body?.data;

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }
    if (!updateData || typeof updateData !== "object" || Array.isArray(updateData) || Object.keys(updateData).length === 0) {
      return res.status(400).json({ success: false, message: "data object is required and cannot be empty" });
    }

    const result = await prisma.department.updateMany({ where: { id: { in: ids } }, data: updateData });
    res.status(200).json({ success: true, message: "Departments updateMany successful", data: result });
  } catch (err) {
    console.error("Error in updateManyDepartments:", err);
    res.status(500).json({ success: false, message: `Internal server error / Update many departments error: ${err.message}` });
  }
};

export const deleteManyDepartments = async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids.map((id) => Number(id)).filter((id) => Number.isFinite(id))
      : [];

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: "ids array is required and cannot be empty" });
    }

    const result = await prisma.department.deleteMany({ where: { id: { in: ids } } });
    res.status(200).json({ success: true, message: "Departments deleteMany successful", data: result });
  } catch (err) {
    console.error("Error in deleteManyDepartments:", err);
    res.status(500).json({ success: false, message: `Internal server error / Delete many departments error: ${err.message}` });
  }
};
