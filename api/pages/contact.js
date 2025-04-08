const router = require("express").Router();
const nodemailer = require("nodemailer");
const initMYSQL = require("../../config/db");
const tb = "contact";

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.CONTACT_MAIL,
    pass: process.env.CONTACT_PASS,
  },
});

router.get("/", async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${tb}`);
    res.send(result);
  } catch (err) {
    console.error(`Error getting ${tb}: ${err}`);
    res.status(500).send(`Error getting ${tb}`);
  }
});

router.post("/", async (req, res) => {
    const { name, email, message } = req.body;
  
    if (!name || !email || !message) {
      return res.status(400).send("Name, email, and message are required.");
    }
  
    try {
      const conn = await initMYSQL();
  
      const [result] = await conn.query(
        `INSERT INTO ${tb} (name, email, message) VALUES (?, ?, ?)`,
        [name, email, message]
      );
  
      const mailOptions = {
        from: email,
        to: process.env.CONTACT_MAIL,
        subject: `Get In Touch From CPE-Website : ${name} / ${email}`,
        text: message,
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).send(`InsertID: ${result.insertId}`);
      conn.end();
    } catch (err) {
      console.error(`Error in POST /${tb}:`, err);
      res.status(500).send("Error saving contact or sending email.");
    }
  });
  

module.exports = router;
