const ROLE_PERMISSIONS = {
  superAdmin: {
    users: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: true
    }
  },
  admin: {
    users: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: true,
      hardDelete: false
    }
  },
  moderator: {
    users: {
      create: false,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false
    },
    activities: {
      create: true,
      read: true,
      update: true,
      softDelete: false,
      hardDelete: false
    }
  },
  member: {
    users: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false
    },
    activities: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false
    }
  },
  guest: {
    users: {
      create: false,
      read: false,
      update: false,
      softDelete: false,
      hardDelete: false
    },
    activities: {
      create: false,
      read: true,
      update: false,
      softDelete: false,
      hardDelete: false
    }
  }
}

export const HandlePermission = (req, res, next) => {
  // Implement the permission handling
}