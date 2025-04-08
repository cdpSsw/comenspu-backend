const router = require("express").Router();
const initMYSQL = require("../../config/db");
const authorize = require("../middlewares/authorize");

const borrowHistory = "toolsBorrowHistory"
const returnHistory = "toolsReturnHistory"

router.get("/borrow", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${borrowHistory}`);
    res.send(result);

  } catch (err) {
    console.error(`Error getting ${borrowHistory}: ${err}`);
    res.status(500).send(`Error getting ${borrowHistory}`);
  }
});

router.get("/return", authorize(["admin", "student"]), async (_, res) => {
  try {
    const conn = await initMYSQL();
    const [result] = await conn.query(`SELECT * FROM ${returnHistory}`);
    res.send(result);

  } catch (err) {
    console.error(`Error getting ${returnHistory}: ${err}`);
    res.status(500).send(`Error getting ${returnHistory}`);
  }
});

module.exports = router;
