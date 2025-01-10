const fastify = require("fastify");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("@fastify/cors");
const fs = require("fs");

dotenv.config();

// Cek apakah SSL diaktifkan
let serverOptions = {
  logger: true,
};

if (process.env.USE_SSL === "true") {
  try {
    const SSL_OPTIONS = {
      key: fs.readFileSync("/home/nodeapp/cert/private.key"),
      cert: fs.readFileSync("/home/nodeapp/cert/certificate.crt"),
      ca: fs.readFileSync("/home/nodeapp/cert/ca_bundle.crt"),
    };
    serverOptions = { https: SSL_OPTIONS, logger: true };
    console.log("SSL enabled: Using HTTPS");
  } catch (err) {
    console.error("Failed to load SSL certificates:", err.message);
    process.exit(1);
  }
} else {
  console.log("SSL disabled: Using HTTP");
}

const app = fastify(serverOptions);

// Register CORS
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

app.register(require("@fastify/mongodb"), {
  forceClose: true,
  url: process.env.MONGO_URI,
});

app.register(require("@fastify/jwt"), {
  secret: process.env.JWT_SECRET,
});

// Plugins
app.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

app.decorate("authorize", (roles) => async (request, reply) => {
  const { role } = request.user;
  if (!roles.includes(role)) {
    reply.code(403).send({ error: "Forbidden" });
  }
});

// Routes
app.register(require("./routes/versionRoutes"));
app.register(require("./routes/authRoutes"));
app.register(require("./routes/enrollRoutes"));

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected successfully.");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected.");
});

mongoose.connect(process.env.MONGO_URI, {});

const start = async () => {
  try {
    const port = process.env.PORT || 8729;
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(
      `Server running at: ${
        process.env.USE_SSL === "true" ? "https" : "http"
      }://localhost:${port}`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
