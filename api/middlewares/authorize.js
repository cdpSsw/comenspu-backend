const jwt = require("jsonwebtoken");
require("dotenv").config(); 

const SECRET_KEY = process.env.JWT_SECRET;

const authorize = (roles) => {
    return (req, res, next) => {
        const token = req.cookies.token; // อ่าน Token จาก Cookie

        // ตรวจสอบว่า token มีอยู่ใน cookies หรือไม่
        if (!token) {
            console.error("No token found in cookies.");
            return res.status(401).json({ message: "Unauthorized" });
        }

        try {
            // ตรวจสอบและ Decode Token
            const decoded = jwt.verify(token, SECRET_KEY);
            console.log("Decoded Token:", decoded);

            // เช็ค Role ว่าตรงกับที่กำหนดใน middleware หรือไม่
            if (!roles.includes(decoded.role)) {
                console.warn("🔴 Forbidden: Role does not match.");
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded;  // เก็บข้อมูลผู้ใช้ใน request object
            next();  // ถ้า Token และ Role ผ่านก็ให้ไปที่ route ต่อไป
        } catch (err) {
            // เช็คว่าเกิดข้อผิดพลาดจาก Token หมดอายุหรือไม่
            if (err.name === "TokenExpiredError") {
                console.error("🔴 JWT Token Expired:", err.message);
                return res.status(401).json({ message: "Session expired. Please login again." });
            } else {
                console.error("🔴 JWT Verification Error:", err.message);
                return res.status(401).json({ message: "Invalid or Expired Token" });
            }
        }
    };
};


module.exports = authorize;
