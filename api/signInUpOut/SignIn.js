const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET;
const initMYSQL = require("../../config/db");
const tb = "users";

router.get("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    // console.log("Decoded Token:", decoded);

    // ตรวจสอบว่า role เป็น "admin" หรือ "student" เท่านั้น
    if (decoded.role !== "admin" && decoded.role !== "student") {
      return res
        .status(403)
        .json({ error: "Access denied! Only Admin and Student can access." });
    }

    res.status(200).json({ message: "Access granted", role: decoded.role });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});
// Login Route
router.post("/", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { studentID, password } = req.body;
    console.log(req.body);

    // ตรวจสอบว่ามีค่า id และ password หรือไม่
    if (!studentID || !password) {
      return res.status(400).json({ error: "Missing required field" });
    }

    // ดึงข้อมูลนักศึกษาจากฐานข้อมูล
    const [result] = await conn.query(
      `SELECT studentID, password, status, role FROM ${tb} WHERE studentID = ?`,
      [studentID]
    );

    if (result.length === 0) {
      return res.status(404).json({ error: `Student ID ${id} not found` });
    }

    const user = result[0];

    // เช็คว่าสถานะถูก Approve ไหม
    if (user.status !== "Approved") {
      return res.status(403).json({ error: "Account not approved yet" });
    }

    const isMatch = await bcrypt.compare(password, user.password.trim());
    if (!isMatch) {
      console.log("Passwords do not match!");
      return res.status(401).json({ error: "Invalid studentID or password" });
    }

    // สร้าง JWT Token
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: "1h",
    });

    // ส่ง token ไปยัง Client (ผ่าน cookie และ response)
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "Strict",
    //   maxAge: 360000000000000, // 1 ชั่วโมง
    // });
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // true if you're in production (HTTPS)
      sameSite: "None",  // necessary for cross-origin cookies
      domain: ".github.io",  // Change to the appropriate domain
      maxAge: 3600000,  // 1 hour
  });   

    return res
      .status(200)
      .json({ message: "Login Successful", role: user.role, token });
  } catch (err) {
    console.error(`Error getting ${tb}: ${err}`);
    res.status(500).json({ error: `Internal server error` });
  }
});

module.exports = router;
