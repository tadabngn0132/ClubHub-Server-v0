import { prisma } from "../libs/prisma.js";
import { POSITION_LEVEL, ROLE } from "../utils/constant.js";

const DEPARTMENT_SEEDS = [
  {
    name: "Committee Department",
    description:
      "Core committee responsible for leadership, governance, and club-wide coordination.",
  },
  {
    name: "Communication Department",
    description:
      "Manages communication plans, announcements, partnerships, and audience engagement.",
  },
  {
    name: "Design Department",
    description:
      "Creates visual assets, branding materials, and design deliverables for club activities.",
  },
  {
    name: "Human Resources Department",
    description:
      "Handles recruitment, member support, onboarding, and internal people operations.",
  },
  {
    name: "Logistics Department",
    description:
      "Coordinates venues, equipment, scheduling, and operational support for activities.",
  },
  {
    name: "Content Department",
    description:
      "Plans and produces written, educational, and campaign content for the club.",
  },
  {
    name: "Media Department",
    description:
      "Produces photo, video, and media coverage for events and campaigns.",
  },
];

const TOP_POSITION_TEMPLATES = [
  {
    title: "President",
    level: POSITION_LEVEL.TOP_HEAD,
    systemRole: ROLE.MODERATOR,
  },
  {
    title: "Vice President",
    level: POSITION_LEVEL.TOP_VICE_HEAD,
    systemRole: ROLE.MODERATOR,
  },
];

const buildDepartmentPositionTemplates = (departmentName) => [
  {
    title: `Head of ${departmentName}`,
    level: POSITION_LEVEL.MIDDLE_HEAD,
    systemRole: ROLE.MODERATOR,
  },
  {
    title: `Vice Head of ${departmentName}`,
    level: POSITION_LEVEL.MIDDLE_VICE_HEAD,
    systemRole: ROLE.MODERATOR,
  },
  {
    title: `Member of ${departmentName}`,
    level: POSITION_LEVEL.MEMBER,
    systemRole: ROLE.MEMBER,
  },
];

const getPositionTemplates = (departmentName) => {
  const departmentPositionTemplates =
    buildDepartmentPositionTemplates(departmentName);

  if (departmentName === "Committee Department") {
    return [...TOP_POSITION_TEMPLATES, ...departmentPositionTemplates];
  }

  return departmentPositionTemplates;
};

const findDepartmentByName = async (tx, name) => {
  return tx.department.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive",
      },
    },
  });
};

const findPositionByTitle = async (tx, departmentId, title) => {
  return tx.position.findFirst({
    where: {
      departmentId,
      title: {
        equals: title,
        mode: "insensitive",
      },
    },
  });
};

export const ensureClubStructure = async () => {
  const summary = {
    createdDepartments: 0,
    updatedDepartments: 0,
    createdPositions: 0,
    updatedPositions: 0,
  };

  await prisma.$transaction(async (tx) => {
    for (const departmentSeed of DEPARTMENT_SEEDS) {
      const existingDepartment = await findDepartmentByName(
        tx,
        departmentSeed.name,
      );

      let departmentRecord = existingDepartment;

      if (!existingDepartment) {
        departmentRecord = await tx.department.create({
          data: {
            name: departmentSeed.name,
            description: departmentSeed.description,
            isActive: true,
          },
        });
        summary.createdDepartments += 1;
      } else {
        const shouldUpdateDepartment =
          existingDepartment.description !== departmentSeed.description ||
          existingDepartment.isActive !== true;

        if (shouldUpdateDepartment) {
          departmentRecord = await tx.department.update({
            where: {
              id: existingDepartment.id,
            },
            data: {
              description: departmentSeed.description,
              isActive: true,
            },
          });
          summary.updatedDepartments += 1;
        }
      }

      const positionTemplates = getPositionTemplates(departmentSeed.name);

      for (const positionTemplate of positionTemplates) {
        const existingPosition = await findPositionByTitle(
          tx,
          departmentRecord.id,
          positionTemplate.title,
        );

        if (!existingPosition) {
          await tx.position.create({
            data: {
              title: positionTemplate.title,
              level: positionTemplate.level,
              systemRole: positionTemplate.systemRole,
              departmentId: departmentRecord.id,
            },
          });
          summary.createdPositions += 1;
          continue;
        }

        const shouldUpdatePosition =
          existingPosition.level !== positionTemplate.level ||
          existingPosition.systemRole !== positionTemplate.systemRole;

        if (shouldUpdatePosition) {
          await tx.position.update({
            where: {
              id: existingPosition.id,
            },
            data: {
              level: positionTemplate.level,
              systemRole: positionTemplate.systemRole,
            },
          });
          summary.updatedPositions += 1;
        }
      }
    }
  });

  console.log(
    `Club structure ready: ${summary.createdDepartments} departments created, ${summary.updatedDepartments} departments updated, ${summary.createdPositions} positions created, ${summary.updatedPositions} positions updated`,
  );

  return summary;
};
