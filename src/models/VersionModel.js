// src/models/VersionModel.js
const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  version: { type: String, required: true },
  changelog: { type: String, required: true },
  downloadLink: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Version", versionSchema);
