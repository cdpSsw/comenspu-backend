const router = require("express").Router();
const initMYSQL = require("../../config/db");
const tb = "selectedShowTiktok";

const authorize = require('../middlewares/authorize');

router.get('/', async (_, res) => {
    try{
        const conn =  await initMYSQL();
        const [result] = await conn.query(`SELECT * FROM ${tb}`);
        res.send(result);
        conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
    } catch (err){
        res.status(500).json({ error: `Internal server error: ${err}` });
        console.error(`Internal server error: ${err}`);
    }
})

router.post('/', authorize(["admin"]), async (req, res) => {
    try {
        const conn = await initMYSQL();
        const selectedShowTiktok = req.body[0];

        console.log("Selected-Showcase: ", selectedShowTiktok);

        if (!Array.isArray(selectedShowTiktok) || selectedShowTiktok.length === 0) {
            return res.status(400).json({ error: "Invalid data format or empty array" });
        }

    const values = selectedShowTiktok.map(({ id, studentID, topic, embed, status }) => [
        id ?? null,  // Handle potential undefined id
        studentID,
        topic,
        embed,
        status
    ]);
    
      try {
          // ลบข้อมูลเก่าทั้งหมด
          await conn.query(`DELETE FROM ${tb}`);
      
          // เพิ่มข้อมูลใหม่เข้าไป
          const postQuery = `INSERT INTO ${tb} (id, studentID, topic, embed, status) VALUES ?`;
          const [result] = await conn.query(postQuery, [values]);
      
          res.send({ insertedIds: result.insertId });
          
      } catch (err) {
          console.error(`Internal server error: ${err}`);
          res.status(500).json({ error: `Internal server error: ${err}` });
      }
      conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
    
      } catch (err) {
        res.status(500).json({ error: `Internal server error: ${err}` });
        console.error(`Internal server error: ${err}`);
      }
})

module.exports = router;