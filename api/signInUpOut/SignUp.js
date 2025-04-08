const router = require("express").Router();
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const imagePath = path.join(__dirname, "../../../public/images/stu_showcase");

const initMYSQL = require("../../config/db");
const tb = "users";
const tbShowcase = "stuShowcase";
const tbShowTiktok = "stuShowTiktok";

require("dotenv").config();

const authorize = require('../middlewares/authorize');

// ----------------------------- admin ( waiting middleware ) -------------------------------------
router.get("/", authorize(["admin"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb}`);
    res.send(result);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    console.error(`Error getting ${tb}: ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

router.put("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { studentID, role, email, password, fname, lname } = req.body;
    // console.log('Put ID: ',req.params);
    // console.log('Put Info: ', req.body);
    // console.log("Table Name:", tb);

    const saltRounds = parseInt(process.env.PASS_SALT, 10) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPassword = await bcrypt.hash(password, salt);
    // console.log(newPassword);

    const [result] = await conn.query(
      `UPDATE ${tb} SET studentID = ?, role = ?, email = ?, password = ?, fname = ?, lname = ? WHERE id = ?`,
      [studentID, role, email, newPassword, fname, lname, id]
    );
    console.log(result)
    res.status(200).send(`Insert ID: ${result.insertId}`);
    conn.end();

  } catch (err) {
    console.error(`Inserting: ${tb}, ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

// ... Approve
router.put("/status/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { status } = req.body;
    // console.log(req.body);
    // console.log(req.params);

    await conn.query(`UPDATE ${tb} SET status = ? WHERE id = ?`,
      [status, id]
    );

    return res.status(200).json({ message: "Update Successful" });

  } catch (err) {
    console.error(`Inserting: ${tb}, ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    // console.log(req.params);
  
    await conn.query(`DELETE FROM ${tb} WHERE id = ?`, [id]);
    // await conn.query(`DELETE FROM ${tbShowTiktok} WHERE id = ?`, [id]);
    // const [imageResult] = await conn.query(
    //   `SELECT image FROM ${tbShowcase} WHERE id = ?`,
    //   [id]
    // );

    // if (imageResult.length === 0) {
    //   return res.status(404).json({ error: "image not found" });
    // }

    // const filename = imageResult[0].image;
    // const filePath = path.join(imagePath, filename);

    // // ลบข้อมูลจากฐานข้อมูล
    // const [deleteResult] = await conn.query(`DELETE FROM ${tbShowcase} WHERE id = ?`, [
    //   id,
    // ]);

    // if (deleteResult.affectedRows === 0) {
    //   return res
    //     .status(400)
    //     .json({ error: "Failed to delete data from database" });
    // }

    // console.log("Database Delete Successful");

    // // ตรวจสอบไฟล์ว่ามีอยู่จริงก่อนลบ
    // try {
    //   await fs.promises.access(filePath, fs.constants.F_OK);
    //   await fs.promises.unlink(filePath);
    //   console.log(`Deleted file: ${filePath}`);
    // } catch (fileErr) {
    //   console.error(
    //     `File not found or failed to delete: ${filePath}, error: ${fileErr}`
    //   );
    // }

    return res.status(200).json({ message: "Delete Successful" });

  } catch (err) {
    console.error(`Inserting: ${tb}, ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

// ----------------------------- users -------------------------------------
router.post("/", async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { studentID, role, email, password, fname, lname } = req.body;
    // console.log(req.body);
    
    const saltRounds = parseInt(process.env.PASS_SALT, 10) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const newPassword = await bcrypt.hash(password, salt);
    // console.log(newPassword);

    const [result] = await conn.query(
      `INSERT INTO ${tb} (studentID, role, email, password, fname, lname)
        VALUES (?, ?, ? , ?, ?, ?)`,
      [studentID, role, email, newPassword, fname, lname]
    );
    res.status(200).send(`Insert ID: ${result.insertId}`);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    console.error(`Inserting: ${tb}, ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

module.exports = router;
