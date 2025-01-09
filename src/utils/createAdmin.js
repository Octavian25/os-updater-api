const User = require("../models/UserModel"); // Pastikan path sesuai lokasi UserModel Anda

async function createAdmin(username, password) {
  try {
    const existingAdmin = await User.findOne({ username });
    if (existingAdmin) {
      console.log("Admin dengan username ini sudah ada.");
      return { success: false, message: "Admin already exists" };
    }

    const admin = new User({
      username,
      password,
      role: "admin",
    });

    await admin.save();
    console.log("Admin berhasil dibuat.");
    return { success: true, message: "Admin created successfully" };
  } catch (error) {
    console.error("Error saat membuat admin:", error.message);
    return { success: false, message: "Error creating admin", error };
  }
}

module.exports = createAdmin;
