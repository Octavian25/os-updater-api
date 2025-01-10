const Enroll = require("../models/EnrollModel");

module.exports = async function (fastify) {
  // Endpoint untuk mencatat enroll
  fastify.post("/enroll", async (request, reply) => {
    const appsKey = request.headers["x-apps-key"]; // Ambil APPS_KEY dari header
    const requestTime = request.headers["x-request-time"]; // Waktu request dari aplikasi
    const maxTimeDifference = 5000; // Maksimal selisih waktu dalam milidetik (5 detik)

    // Validasi APPS_KEY
    if (!appsKey || appsKey !== process.env.APPS_KEY) {
      return reply.code(403).send({ error: "Invalid or missing APPS_KEY" });
    }

    // Validasi waktu request
    if (!requestTime) {
      return reply.code(400).send({ error: "Missing x-request-time header" });
    }

    const currentTime = Date.now(); // Waktu server dalam milidetik
    const requestTimeMillis = parseInt(requestTime, 10); // Konversi waktu request ke milidetik

    if (isNaN(requestTimeMillis)) {
      return reply.code(400).send({ error: "Invalid x-request-time format" });
    }

    const timeDifference = Math.abs(currentTime - requestTimeMillis); // Selisih waktu

    if (timeDifference > maxTimeDifference) {
      return reply
        .code(408) // HTTP Status 408: Request Timeout
        .send({ error: "Request time difference exceeds the allowed limit" });
    }

    const { appName, version, deviceInfo, androidVersion } = request.body;

    try {
      if (!appName || !version || !deviceInfo?.fingerprint || !androidVersion) {
        return reply.code(400).send({
          error:
            "appName, version, deviceInfo.fingerprint, and androidVersion are required",
        });
      }

      // Cari data enroll berdasarkan fingerprint perangkat
      const existingEnroll = await Enroll.findOne({
        "deviceInfo.fingerprint": deviceInfo.fingerprint,
      });

      if (existingEnroll) {
        // Perbarui data dengan versi terbaru
        existingEnroll.appName = appName;
        existingEnroll.version = version;
        existingEnroll.enrolledAt = new Date();
        existingEnroll.deviceInfo = deviceInfo;
        existingEnroll.androidVersion = androidVersion;

        await existingEnroll.save();

        return reply.code(200).send({
          message: "Version updated successfully",
          data: existingEnroll,
        });
      }

      // Simpan data baru jika tidak ada
      const newEnroll = new Enroll({
        appName,
        version,
        enrolledAt: new Date(),
        deviceInfo,
        androidVersion,
      });

      await newEnroll.save();

      reply.send({ message: "Version enrolled successfully", data: newEnroll });
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Failed to enroll version", details: err.message });
    }
  });

  // Endpoint untuk mendapatkan data analitik enroll
  fastify.get("/enroll/analytics", async (request, reply) => {
    try {
      const { appName } = request.query; // Ambil appName dari query parameter

      if (!appName) {
        return reply
          .code(400)
          .send({ error: "appName query parameter is required" });
      }

      const enrollData = await Enroll.aggregate([
        {
          $match: {
            appName: appName,
          },
        },
        {
          $group: {
            _id: {
              day: { $dayOfMonth: "$enrolledAt" },
              month: { $month: "$enrolledAt" },
              year: { $year: "$enrolledAt" },
              version: "$version", // Tambahkan versi ke grouping
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      ]);

      reply.send({ data: enrollData });
    } catch (err) {
      reply
        .code(500)
        .send({ error: "Failed to fetch analytics", details: err.message });
    }
  });
};
