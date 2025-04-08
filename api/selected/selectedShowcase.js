const router = require("express").Router();
const initMYSQL = require("../../config/db");
const tb = "selectedShowcase";

const authorize = require("../middlewares/authorize");

router.get("/", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb}`);
    res.send(result);
    conn.end(); // ปิดการเชื่อมต่อหลังใช้งานเสร็จ
  } catch (err) {
    res.status(500).json({ error: `Internal server error: ${err}` });
    console.error(`Internal server error: ${err}`);
  }
});

router.get("/images", async (_, res) => {
  // console.log(`-----> second get()`);
  try {
    const conn = await initMYSQL();

    const [results] = await conn.query(
      `SELECT id, image_data, image_mime_type FROM ${tb}`
    );

    // console.log("SQL results:", results);

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    const images = results.map((row) => ({
      id: row.id,
      image: `data:${row.image_mime_type};base64,${row.image_data.toString(
        "base64"
      )}`,
    }));

    // console.log("Base64 images:", images);

    res.json(images);

    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post("/", authorize(["admin"]), async (req, res) => {
  try {
    const conn = await initMYSQL();
    const selectedShowcaseArray = req.body;
    // console.log(req.body);

    if (
      !Array.isArray(selectedShowcaseArray) ||
      selectedShowcaseArray.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Invalid data format or empty array" });
    }

    const values = selectedShowcaseArray.map(
      ({
        id,
        studentID,
        image,
        topic,
        description,
        status,
        image_data,
        image_mime_type,
      }) => {
        let imageBuffer = null;
        let mimeType = null;

        if (image_data && image_mime_type) {
          mimeType = image_mime_type;

          // ถ้า image_data เป็น Buffer อยู่แล้วไม่ต้องแปลง
          if (Buffer.isBuffer(image_data)) {
            imageBuffer = image_data;
          } else if (typeof image_data === "object" && image_data.data) {
            imageBuffer = Buffer.from(image_data.data);
          } else if (typeof image_data === "string") {
            const base64String = image_data.replace(/^data:.+;base64,/, "");
            imageBuffer = Buffer.from(base64String, "base64");
          }
        }

        return [
          id,
          studentID,
          image,
          topic,
          description,
          status,
          imageBuffer,
          mimeType,
        ];
      }
    );

    try {
      // ลบข้อมูลเก่าทั้งหมด
      await conn.query(`DELETE FROM ${tb}`);

      // เพิ่มข้อมูลใหม่เข้าไป
      const postQuery = `INSERT INTO ${tb} (id, studentID, image, topic, description, status, image_data, image_mime_type) VALUES ?`;
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
});

module.exports = router;
