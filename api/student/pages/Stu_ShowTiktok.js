const router = require("express").Router();
const initMYSQL = require("../../../config/db");
const tb = "stuShowTiktok";

const authorize = require('../../middlewares/authorize');

// -------------- admin (wait for middleware) -------------------------------------------
router.get("/", authorize(["admin"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(
      `SELECT * FROM ${tb} `);

    res.send(result);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

// -------------- showtiktok (only approved) ------------------------------------------
router.get('/approved', async (_, res) => {
  try{
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb} WHERE status = 'Approved'`);
    res.status(200).send(result);
    conn.end();
    
  } catch(err){
    return res.status(500).send({ message: `Internal server error: ${err}`});
  }
})

router.put("/status/:id", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { status } = req.body;
    // console.log(req.body);
    // console.log(req.params);

    // อัปเดตฐานข้อมูล
    await conn.query(
      `UPDATE ${tb} SET status = ? WHERE id = ?`,
      [status, id]
    );

    return res.status(200).json({ message: "Update Successful" });

  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

// ------------------------------- student ----------------------------------------------
router.get("/:studentID", authorize(["admin", "student"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { studentID } = req.params;
    const [result] = await conn.query(
      `SELECT * FROM ${tb} WHERE studentID = ?`,
      [studentID]
    );

    res.send(result);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
    
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/", authorize(["admin", "student"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { studentID, topic, embed } = req.body;
    console.log(req.body);

    const [result] = await conn.query(
      `INSERT INTO ${tb} (studentID, topic, embed) VALUES (?, ?, ?)`,
      [studentID, topic, embed]
    );

    res.status(200).send({ insertID: result.insertId });
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.put("/:id", authorize(["admin", "student"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const { id } = req.params;
    const { topic, embed } = req.body;
    // console.log(req.body);
    // console.log(req.params);

    // อัปเดตฐานข้อมูล
    await conn.query(
      `UPDATE ${tb} SET topic = ?, embed = ? WHERE id = ?`,
      [topic, embed, id]
    );

    res.status(200).send(`Update Successfully`);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

router.delete("/:id", authorize(["admin", "student"]), async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await initMYSQL();

    await conn.query(`DELETE FROM ${tb} WHERE id = ?`, [id]);
    return res.status(200).json({ message: "Delete Successful" });
    
  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

module.exports = router;
