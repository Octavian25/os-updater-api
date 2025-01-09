// src/routes/authRoutes.js
const User = require("../models/UserModel");
const createAdmin = require("../utils/createAdmin");
const bcrypt = require("bcrypt");

module.exports = async function (fastify) {
  fastify.get("/users", async (request, reply) => {
    const users = await User.find();
    reply.send(users);
  });
  fastify.post("/create-admin", async (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply
        .code(400)
        .send({ error: "Username and password are required" });
    }

    const result = await createAdmin(username, password);

    if (result.success) {
      reply.code(200).send({ message: result.message });
    } else {
      reply.code(500).send({ error: result.message });
    }
  });

  fastify.post("/register", async (request, reply) => {
    try {
      const { username, password, role } = request.body;
      const user = new User({ username, password, role });
      await user.save();
      reply.send({ message: "User created" });
    } catch (err) {
      reply.send(err);
    }
  });

  fastify.post("/login", async (request, reply) => {
    const { username, password } = request.body;
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return reply.code(401).send({ error: "Invalid credentials" });
    }

    const token = fastify.jwt.sign({ id: user._id, role: user.role });
    reply.send({ token });
  });

  fastify.put(
    "/users/:id/role",
    { preHandler: [fastify.authenticate, fastify.authorize(["admin"])] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { role } = request.body;

        // Validasi role
        if (!["admin", "user"].includes(role)) {
          return reply.code(400).send({ error: "Invalid role value" });
        }

        // Cari dan update role user
        const updatedUser = await User.findByIdAndUpdate(
          id,
          { role },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          return reply.code(404).send({ error: "User not found" });
        }

        reply.send({
          message: "User role updated successfully",
          data: updatedUser,
        });
      } catch (err) {
        fastify.log.error(err);
        reply
          .code(500)
          .send({ error: "Failed to update role", details: err.message });
      }
    }
  );

  fastify.delete(
    "/users/:id",
    { preHandler: [fastify.authenticate, fastify.authorize(["admin"])] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        // Cari dan hapus user berdasarkan ID
        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
          return reply.code(404).send({ error: "User not found" });
        }

        reply.send({ message: "User deleted successfully", data: deletedUser });
      } catch (err) {
        fastify.log.error(err);
        reply
          .code(500)
          .send({ error: "Failed to delete user", details: err.message });
      }
    }
  );
};
