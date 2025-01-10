// src/routes/versionRoutes.js
const Version = require("../models/VersionModel");

module.exports = async function (fastify) {
  fastify.get("/versions", async (request, reply) => {
    const versions = await Version.find();
    reply.send(versions);
  });
  fastify.get("/versions/detail", async (request, reply) => {
    const { appName } = request.query;
    const versions = await Version.findOne({ appName });
    reply.send(versions);
  });
  fastify.get("/versions/v2/detail", async (request, reply) => {
    const { appName, abi } = request.query;
    const versions = await Version.findOne({ appName });
    versions.downloadLink = `http://103.150.191.156/downloads/${appName}/${abi}.apk`;
    reply.send(versions);
  });
  fastify.delete(
    "/versions/:id",
    { preHandler: [fastify.authenticate, fastify.authorize(["admin"])] },
    async (request, reply) => {
      try {
        const { id } = request.params;

        // Cari dan hapus versi berdasarkan ID
        const deletedVersion = await Version.findByIdAndDelete(id);

        if (!deletedVersion) {
          return reply.code(404).send({ error: "Version not found" });
        }

        reply.send({
          message: "Version deleted successfully",
          data: deletedVersion,
        });
      } catch (err) {
        fastify.log.error(err);
        reply
          .code(500)
          .send({ error: "Failed to delete version", details: err.message });
      }
    }
  );
  fastify.post(
    "/versions",
    { preHandler: [fastify.authenticate, fastify.authorize(["admin"])] },
    async (request, reply) => {
      const { version, changelog, downloadLink, appName } = request.body;
      const newVersion = new Version({
        version,
        changelog,
        downloadLink,
        appName,
      });
      await newVersion.save();
      reply.send({ message: "Version created" });
    }
  );
  fastify.put(
    "/versions/:id",
    { preHandler: [fastify.authenticate, fastify.authorize(["admin"])] },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { version, changelog, downloadLink } = request.body;

        // Cari dan update versi berdasarkan ID
        const updatedVersion = await Version.findByIdAndUpdate(
          id,
          { version, changelog, downloadLink },
          { new: true, runValidators: true } // Mengembalikan data setelah update
        );

        if (!updatedVersion) {
          return reply.code(404).send({ error: "Version not found" });
        }

        reply.send({
          message: "Version updated successfully",
          data: updatedVersion,
        });
      } catch (err) {
        fastify.log.error(err);
        reply
          .code(500)
          .send({ error: "Failed to update version", details: err.message });
      }
    }
  );
};
