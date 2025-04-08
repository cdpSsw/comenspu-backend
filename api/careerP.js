const router = require("express").Router();
const initMYSQL = require("../config/db");
const tb = "careerP";

router.get('/', async (_, res) => {
    try{
        const conn = await initMYSQL();
        const [result] = await conn.query(`SELECT * FROM ${tb}`);
        res.json(result);

    } catch(err){
        console.error(`Internal server ${err}`);
        res.status(500).send(`Internal server ${err}`)
    }
})

router.post('/', async(req, res) => {
    try{
        const conn = await initMYSQL();
        const { icon, topic, description } = req.body;
        // console.log(req.body);

        if(!icon || !topic || !description){
            console.log(icon, topic, description);
            return res.status(400).json({ error: `Missing requre fields}`});
        }

        const [ result ] = await conn.query(`INSERT INTO ${tb} 
            (icon, topic, description) VALUES (?, ?, ?)`,
            [icon, topic, description]) 

        res.json({ insertID: result.insertId });

    } catch(err){
        console.error(`Internal server error: ${err}`);
        res.status(500).send(`Internal server error: ${err}`)
    }
})

router.put('/:id', async(req, res) => {
    try{
        const conn = await initMYSQL();
        const { id } = req.params;
        const { icon, topic, description } = req.body;
        console.log(req.body);

        if(!icon || !topic || !description){
            return res.status(400).send(`Missing required fields`);
        }

        await conn.query(
            `UPDATE ${tb} SET icon = ?, topic = ?, description = ? WHERE id = ?`,
            [icon, topic, description, id])
        
        res.status(200).send(`Update Successfully`);
        
    } catch(err){
        console.error(`Internal server, ${err}`);
        res.status(500).send(`Internal server, ${err}`);
    }
})

router.delete("/:id", async (req, res) => {
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