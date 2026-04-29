// CORS configuration
const whitelist = ["http://localhost:5173", "https://gdc22.vercel.app"];

const corsOptions = {
  origin: whitelist,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

export { corsOptions };
