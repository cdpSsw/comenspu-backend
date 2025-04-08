const router = require("express").Router();
const initMYSQL = require("../../config/db");
const authorize = require("../middlewares/authorize");
const tb = "tools";

const borrowHistory = "toolsBorrowHistory"
const returnHistory = "toolsReturnHistory"

const path = require("path");
const fs = require("fs");
const multer = require("multer");

const imagePath = path.join(__dirname, "../../public/images/tools");
const imagePathBorrowHist = path.join(__dirname, "../../public/images/tools/BorrowHistory");
const imagePathReturnHist = path.join(__dirname, "../../public/images/tools/ReturnHistory");

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath, { recursive: true });
}

if (!fs.existsSync(imagePathBorrowHist)) {
  fs.mkdirSync(imagePathBorrowHist, { recursive: true });
}

if (!fs.existsSync(imagePathReturnHist)) {
  fs.mkdirSync(imagePathReturnHist, { recursive: true });
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

const storageBorrowHist = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePathBorrowHist);
  },
  filename: (_, file, cb) => {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now();
    const fileName = `${timestamp}_${randomString}_${file.originalname}`;
    return cb(null, fileName);
  },
});

const storageReturnHist = multer.diskStorage({
  destination: (_, __, cb) => {
    return cb(null, imagePathReturnHist);
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

const uploadBorrowHist = multer({
  storage: storageBorrowHist,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

const uploadReturnHist = multer({
  storage: storageReturnHist,
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"));
    }
    cb(null, true);
  },
});

router.get("/", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb}`);
    res.send(result);
  } catch (err) {
    console.error(`Error getting ${tb}: ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

router.post(
  "/",
  authorize(["admin"]),
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, description, quantity, available } = req.body;
      const img1 = req.files["img1"]?.[0]?.filename || null;
      const img2 = req.files["img2"]?.[0]?.filename || null;
      const img3 = req.files["img3"]?.[0]?.filename || null;
      const img4 = req.files["img4"]?.[0]?.filename || null;

      console.log(req.body);
      console.log(req.files);

      const conn = await initMYSQL();
      const [result] = await conn.query(
        `INSERT INTO ${tb} (name, description, quantity, available, img1, img2, img3, img4) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, description, quantity, available, img1, img2, img3, img4]
      );

      res.json({ insertId: result.insertId });
    } catch (err) {
      console.error(`Error inserting ${tb}: ${err}`);
      res.status(500).send(`Error inserting ${tb}`);
    }
  }
);

router.put(
  "/:id",
  authorize(["admin"]),
  upload.fields([
    { name: "img1", maxCount: 1 },
    { name: "img2", maxCount: 1 },
    { name: "img3", maxCount: 1 },
    { name: "img4", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { name, description, quantity, available } = req.body;
      // console.log(req.body);
      // console.log(req.params);

      // ดึงข้อมูลกิจกรรมเก่าจากฐานข้อมูล
      const [existingActivity] = await conn.query(
        `SELECT img1, img2, img3, img4 FROM ${tb} WHERE id = ?`,
        [id]
      );

      if (existingActivity.length === 0) {
        return res.status(404).json({ error: "Activity not found" });
      }

      const oldImage1 = existingActivity[0].img1;
      const oldImage2 = existingActivity[0].img2;
      const oldImage3 = existingActivity[0].img3;
      const oldImage4 = existingActivity[0].img4;
      const newImage1 = req.files?.img1?.[0]?.filename || oldImage1;
      const newImage2 = req.files?.img2?.[0]?.filename || oldImage2;
      const newImage3 = req.files?.img3?.[0]?.filename || oldImage3;
      const newImage4 = req.files?.img4?.[0]?.filename || oldImage4;

      // ตรวจสอบว่ามีข้อมูลครบหรือไม่
      if (!name || !description || !quantity) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // อัปเดตฐานข้อมูล
      const [result] = await conn.query(
        `UPDATE ${tb} 
        SET name = ?, description = ?, quantity = ?, available = ?, img1 = ?, img2 = ?, img3 = ?, img4 = ? 
        WHERE id = ?`,
        [
          name,
          description,
          quantity,
          available,
          newImage1,
          newImage2,
          newImage3,
          newImage4,
          id,
        ]
      );

      if (result.affectedRows > 0) {
        const imageFields = [
          { key: "img1", old: oldImage1, new: newImage1 },
          { key: "img2", old: oldImage2, new: newImage2 },
          { key: "img3", old: oldImage3, new: newImage3 },
          { key: "img4", old: oldImage4, new: newImage4 },
        ];

        for (const field of imageFields) {
          if (field.old && field.old !== field.new) {
            const oldFilePath = path.join(imagePath, field.old);
            try {
              await fs.promises.access(oldFilePath, fs.constants.F_OK);
              await fs.promises.unlink(oldFilePath);
              console.log(`Deleted old image for ${field.key}: ${field.old}`);
            } catch (err) {
              console.error(
                `Failed to delete old image for ${field.key}: ${err}`
              );
            }
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
      `SELECT img1, img2, img3, img4 FROM ${tb} WHERE id = ?`,
      [id]
    );

    if (imageResult.length === 0) {
      return res.status(404).json({ error: "image not found" });
    }

    const filename1 = imageResult[0].img1;
    const filename2 = imageResult[0].img2;
    const filename3 = imageResult[0].img3;
    const filename4 = imageResult[0].img4;

    const filePath1 = path.join(imagePath, filename1);
    const filePath2 = path.join(imagePath, filename2);
    const filePath3 = path.join(imagePath, filename3);
    const filePath4 = path.join(imagePath, filename4);

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

    // สร้าง array ของไฟล์ทั้งหมด
    const filePaths = [filePath1, filePath2, filePath3, filePath4];

    // ลบไฟล์ทั้งหมด
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await fs.promises.access(filePath, fs.constants.F_OK);
          await fs.promises.unlink(filePath);
          console.log(`Deleted file: ${filePath}`);
        } catch (fileErr) {
          console.error(
            `File not found or failed to delete: ${filePath}, error: ${fileErr.message}`
          );
        }
      })
    );

    return res.status(200).json({ message: "Delete Successful" });
  } catch (err) {
    console.error(`Error: ${err}`);
    return res.status(500).json({ error: `Internal Server Error: ${err}` });
  }
});

// ----------------------------------- student (borrow) ---------------------------------------
router.put(
  "/borrow/:id",
  authorize(["admin", "student"]),
  uploadBorrowHist.array("imgsBefore", 4),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { borrowCode, studentID, toolName, borrowCount } = req.body;
      const count = Number(borrowCount);

      if (isNaN(count) || count < 1) {
        return res.status(400).send("Invalid borrow count.");
      }

      const [quantityResult] = await conn.query(
        `SELECT quantity, available FROM ${tb} WHERE id = ?`,
        [id]
      );

      const currentAvailable = quantityResult[0]?.available;

      if (currentAvailable === undefined) {
        return res.status(404).send("Tool not found.");
      }

      const newAvailable = currentAvailable - count;

      if (newAvailable < 0) {
        return res.status(400).send("Not enough tools available.");
      }

      // อัปเดตจำนวนอุปกรณ์
      await conn.query(`UPDATE ${tb} SET available = ? WHERE id = ?`, [
        newAvailable,
        id,
      ]);

      // เตรียมข้อมูลรูปภาพ
      const filenames = req.files.map((file) => file.filename);
      const images = JSON.stringify(filenames);

      // บันทึกประวัติการยืม
      const [result] = await conn.query(
        `INSERT INTO ${borrowHistory} (borrowCode, studentID, toolName, quantity, images)
         VALUES (?, ?, ?, ?, ?)`,
        [borrowCode, studentID, toolName, count, images]
      );

      return res
        .status(200)
        .json({ message: "Borrowed successfully", insertId: result.insertId });
    } catch (err) {
      console.error("Borrowing error:", err);
      return res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
);

// ----------------------------------- student (return) ---------------------------------------
router.put(
  "/return/:id",
  authorize(["admin", "student"]),
  uploadReturnHist.array("imgsAfter", 4),
  async (req, res) => {
    try {
      const conn = await initMYSQL();
      const { id } = req.params;
      const { returnCode, studentID, toolName, returnCount } = req.body;
      const count = Number(returnCount);

      if (isNaN(count) || count < 1) {
        return res.status(400).send("Invalid return count.");
      }

      const [quantityResult] = await conn.query(
        `SELECT quantity, available FROM ${tb} WHERE id = ?`,
        [id]
      );

      const currentAvailable = quantityResult[0]?.available;

      if (currentAvailable === undefined) {
        return res.status(404).send("Tool not found.");
      }

      const newAvailable = currentAvailable + count;

      if (newAvailable < 0) {
        return res.status(400).send("Not enough tools available.");
      }

      // อัปเดตจำนวนอุปกรณ์
      await conn.query(`UPDATE ${tb} SET available = ? WHERE id = ?`, [
        newAvailable,
        id,
      ]);

      // เตรียมข้อมูลรูปภาพ
      const filenames = req.files.map((file) => file.filename);
      const images = JSON.stringify(filenames);

      // บันทึกประวัติการยืม
      const [result] = await conn.query(
        `INSERT INTO ${returnHistory} (returnCode, studentID, toolName, quantity, images)
         VALUES (?, ?, ?, ?, ?)`,
        [returnCode, studentID, toolName, count, images]
      );

      return res
        .status(200)
        .json({ message: "Returned successfully", insertId: result.insertId });
    } catch (err) {
      console.error("Returning error:", err);
      return res.status(500).send(`Internal server error: ${err.message}`);
    }
  }
);

module.exports = router;
