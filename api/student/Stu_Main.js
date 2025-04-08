const router = require("express").Router();
const initMYSQL = require("../../config/db");
const tb = "users";

// ---------------------------- personal information ------------------------------
router.get('/:studentID', async (req, res) => {
    try {
        const { studentID } = req.params;
        console.log(studentID);
        if (!studentID) return res.status(400).send("studentID is required");

        const conn = await initMYSQL();
        const [result] = await conn.query(`SELECT * FROM ${tb} WHERE studentID = ?`, [studentID]);

        res.status(200).json(result);
    } catch (err) {
        res.status(500).send(`Internal server error: ${err.message}`);
    }
});

module.exports = router;