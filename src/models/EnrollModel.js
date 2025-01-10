const enrollSchema = new mongoose.Schema({
  appName: { type: String, required: true },
  version: { type: String, required: true },
  enrolledAt: { type: Date, default: Date.now },
  deviceInfo: {
    model: { type: String, required: true },
    manufacturer: { type: String, required: true },
    isPhysicalDevice: { type: Boolean, required: true },
    fingerprint: { type: String, required: true }, // Identifikasi unik build perangkat
  },
  androidVersion: {
    sdkInt: { type: Number, required: true },
    release: { type: String, required: true },
    securityPatch: { type: String },
  },
});

// Indeks unik yang mencakup fingerprint
enrollSchema.index(
  { appName: 1, version: 1, "deviceInfo.fingerprint": 1 },
  { unique: true }
);

module.exports = mongoose.model("Enroll", enrollSchema);
