const router = require('express').Router();
const initMYSQL = require('../config/db');
const tb = 'activitiesSelected';

router.get('/', async (_, res) => {
    try{
        const conn = await initMYSQL();
        const [result] = await conn.query(`SELECT * FROM ${tb}`);
        res.status(200).send(result);

    } catch(err){
        res.status(500).json({ error: `Internal server error: ${err}`});
        console.error(`Internal server error: ${err}`);
    }
})

router.post("/", async (req, res) => {
    try {
      const conn = await initMYSQL();
      const newsList = req.body;
    //   console.log("news-List:", newsList);
  
      if (!Array.isArray(newsList) || newsList.length === 0) {
        return res.status(400).json({ error: "Invalid data format or empty array" });
      }
  
      const values = newsList.map(({ id, topic, newsDesc, poster }) => [id, topic, newsDesc, poster]);
  
    //   console.log("values:", values);
  
    //   const postQuery = `REPLACE INTO ${tb} (id, topic, newsDesc, poster) VALUES ?`;
    try {
        // ลบข้อมูลเก่าทั้งหมด
        await conn.query(`DELETE FROM ${tb}`);
    
        // เพิ่มข้อมูลใหม่เข้าไป
        const postQuery = `INSERT INTO ${tb} (id, topic, newsDesc, poster) VALUES ?`;
        const [result] = await conn.query(postQuery, [values]);
    
        res.send({ insertedIds: result.insertId });
    } catch (err) {
        console.error(`Internal server error: ${err}`);
        res.status(500).json({ error: `Internal server error: ${err}` });
    }
    
  
    } catch (err) {
      res.status(500).json({ error: `Internal server error: ${err}` });
      console.error(`Internal server error: ${err}`);
    }
});

router.put('/', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const { id, topic, newsDesc, poster } = req.body;

        const updateQuery = `UPDATE ${tb} set id = ?, topic = ?, newsDesc = ?, poster = ? WHERE id = ?`;
        const [result] = await conn.query(updateQuery, [ id, topic, newsDesc, poster]);
        
        if(result.affectedRows === 0){
            res.status(404).send(`${tb} not found`);
        } else{
            res.send(`${tb} updated`);
        }

    } catch(err){
        res.status(500).json({ error: `Internal server error: ${err}`});
        console.error(`Internal server error: ${err}`);
    }
})

module.exports = router;