const router = require('express').Router();
const initMYSQL = require('../config/db');
const tb = 'faqs';

router.get('/', async (_, res) => {
    try{
        const conn = await initMYSQL();
        const [result] = await conn.query(`SELECT * FROM ${tb}`);
        res.send(result);

    } catch(err){
        console.error(`Error getting ${tb}: ${err}`);
        res.status(500).send(`Error getting ${tb}`);
    }
});

router.post('/', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const { question, answer } = req.body;
        const [result] = await conn.query(`INSERT INTO ${tb} 
            (question, answer) VALUES (?, ?)`,
            [question, answer]);
            
        res.json(result.insertId);

    } catch (err) {
        console.error(`Error creating ${tb}: ${err}`);
        res.status(500).send(`Error creating ${tb}`);
    }
});

router.put('/:id', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const { question, answer } = req.body;
        const { id } = req.params;
        console.log(req.body);

        const [result] = await conn.query(`UPDATE ${tb} 
            SET question = ?, answer = ? WHERE id = ?`,
            [question, answer, id]);

        if(result.affectedRows === 0){
            res.status(404).send(`${tb} not found`);
        } else{
            res.send(`${tb} updated`);
        }

    } catch(err){
        console.error(`Error creating ${tb}: ${err}`);
        res.status(500).send(`Error creating ${tb}`);
    }
});

router.delete('/:id', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const { id } = req.params;
        const [result] = await conn.query(`DELETE FROM ${tb} WHERE id = ?`, [id]);

        if(result.affectedRows === 0){
            res.status(404).send(`${tb} not found`);
        } else {
            res.send(`${tb} deleted`);
        }

    } catch(err){
        console.error(`Error creating ${tb}: ${err}`);
        res.status(500).send(`Error creating ${tb}`);
    }
});

module.exports = router;