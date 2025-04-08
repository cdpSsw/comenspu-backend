const router = require("express").Router();

router.post("/", (_, res) => {
  // res.clearCookie("token", {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "None", // ต้องใช้ "None" และ `Secure: true` สำหรับ cross-site cookies
  //   domain: "localhost", // หรือ `yourdomain.com` ใน production
  // });

  res.clearCookie("token", {
    httpOnly: true,
    secure: true, // ✅ ต้องเป็น true ถ้าใช้ sameSite: "None"
    sameSite: "None", // ✅
    // ❌ อย่าใส่ domain ถ้าคุณไม่ได้กำหนดตอน set
    // ถ้า set cookie ไม่ได้กำหนด domain ก็ห้ามกำหนดตอน clear
  });

  res.status(200).json({ message: "Signed out successfully" });
});

module.exports = router;
