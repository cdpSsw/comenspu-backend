const router = require("express").Router();
const initMYSQL = require("../../config/db");
const tb = "teams";

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const imagePath = path.join(__dirname, "../../public/images/teams");

const authorize = require("../middlewares/authorize");

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePath);
  },
  filename: (_, file, cb) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomString}_${file.originalname}`;
    return cb(null, fileName);
  },
});

const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

router.get("/", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb} `);
    res.send(result);
    conn.end();
  } catch (err) {
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.get("/images", async (req, res) => {
  console.log(`-----> second get()`);
  try {
    const conn = await initMYSQL();

    const [results] = await conn.query(
      `SELECT id, image_data, image_mime_type FROM ${tb}`
    );

    console.log("SQL results:", results);

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    const images = results.map((row) => ({
      id: row.id,
      image: `data:${row.image_mime_type};base64,${row.image_data.toString(
        "base64"
      )}`,
    }));

    console.log("Base64 images:", images);

    res.json(images);

    conn.end();
  } catch (err) {
    console.error(err);
    res.status(500).send(`Internal server error: ${err.message}`);
  }
});

router.post(
  "/",
  authorize(["admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const {
        position,
        name,
        tel,
        email,
        website,
        education,
        expertise,
        expLocation,
        expPosition,
        research,
      } = req.body;
      const image = req.file ? req.file.filename : null;
      // console.log(req.body);
      // console.log(res.files);

      let imageBuffer = null;
      let mimeType = null;

      if (req.file) {
        imageBuffer = fs.readFileSync(req.file.path);
        mimeType = req.file.mimetype;

        fs.unlinkSync(req.file.path);
      }

      const [result] = await conn.query(
        `INSERT INTO ${tb} (position, name, tel, email, website, education, expertise, expLocation, expPosition, research, image, image_data, image_mime_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          position,
          name,
          tel,
          email,
          website,
          education,
          expertise,
          expLocation,
          expPosition,
          research,
          image,
          imageBuffer, 
          mimeType
        ]
      );

      res.status(200).send({ insertID: result.insertId });
      conn.end();
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
);

router.put(
  "/:id",
  authorize(["admin"]),
  upload.single("image"),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const {
        position,
        name,
        tel,
        email,
        website,
        education,
        expertise,
        expLocation,
        expPosition,
        research,
      } = req.body;
      // console.log(req.body);
      // console.log(req.params);

      // ดึงข้อมูลกิจกรรมเก่าจากฐานข้อมูล
      const [existingActivity] = await conn.query(
        `SELECT image FROM ${tb} WHERE id = ?`,
        [id]
      );
      if (existingActivity.length === 0) {
        return res.status(404).json({ error: "Activity not found" });
      }

      const oldImage = existingActivity[0].image;
      const newImage = req.file ? req.file.filename : oldImage;

      // ตรวจสอบว่ามีข้อมูลครบหรือไม่
      if (
        !position ||
        !name ||
        !tel ||
        !email ||
        !website ||
        !education ||
        !expertise ||
        !expLocation ||
        !expPosition ||
        !research
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // อัปเดตฐานข้อมูล
      const [result] = await conn.query(
        `UPDATE ${tb} SET position = ?, name = ?, tel = ?, email = ?, website = ?, education = ?, expertise = ?, expLocation = ?, expPosition = ?, research = ?, image = ? WHERE id = ?`,
        [
          position,
          name,
          tel,
          email,
          website,
          education,
          expertise,
          expLocation,
          expPosition,
          research,
          newImage,
          id,
        ]
      );

      if (result.affectedRows > 0) {
        // ถ้ามีการอัปโหลดรูปใหม่ ให้ลบรูปเก่าทิ้ง
        if (req.file && oldImage) {
          const oldFilePath = path.join(imagePath, oldImage);
          try {
            await fs.promises.access(oldFilePath, fs.constants.F_OK);
            await fs.promises.unlink(oldFilePath);
            console.log(`Deleted old image: ${oldImage}`);
          } catch (err) {
            console.error(`Failed to delete old image: ${err}`);
          }
        }
        return res.status(200).json({ message: "Update Successful" });
      } else {
        return res.status(400).json({ message: "Update failed" });
      }
    } catch (err) {
      console.error(`Error: ${err}`);
      return res.status(500).json({ error: `Internal Server Error: ${err}` });
    }
  }
);

router.delete("/:id", authorize(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const conn = await initMYSQL();

    // ดึงชื่อไฟล์จากฐานข้อมูล
    const [imageResult] = await conn.query(
      `SELECT image FROM ${tb} WHERE id = ?`,
      [id]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: "image not found" });
    }

    const filename = imageResult[0].image;
    const filePath = path.join(imagePath, filename);

    // ลบข้อมูลจากฐานข้อมูล
    const [deleteResult] = await conn.query(`DELETE FROM ${tb} WHERE id = ?`, [
      id,
    ]);

    if (deleteResult.affectedRows === 0) {
      return res
        .status(400)
        .json({ error: "Failed to delete data from database" });
    }

    console.log("Database Delete Successful");

    // ตรวจสอบไฟล์ว่ามีอยู่จริงก่อนลบ
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      await fs.promises.unlink(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (fileErr) {
      console.error(
        `File not found or failed to delete: ${filePath}, error: ${fileErr}`
      );
    }

    return res.status(200).json({ message: "Delete Successful" });
  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

module.exports = router;
