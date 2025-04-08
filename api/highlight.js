const router = require('express').Router();
const initMYSQL = require('../config/db');
const tb = 'highlight';

router.get('/', async (_, res) => {
    try{
     const conn = await initMYSQL();
     const [result]  = await conn.query(`SELECT * FROM ${tb}`);
     res.json(result);

    } catch (err) {
        console.error('Error getting highlights: ', err);
        res.status(500).send('Error getting highlights');
    }
});

router.post('/', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const {main_topic, sub_topic, support_details} = req.body;
        const [result] = await conn.query(`INSERT INTO ${tb} 
            (main_topic, sub_topic, support_details) VALUES (?, ?, ?)`, 
            [main_topic, sub_topic, support_details]);
        
        res.json(result.insertId);

    } catch (err) {
        console.error('Error creating highlight: ', err);
        res.status(500).send('Error creating highlight');
    }
});

router.put('/:id', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const {main_topic, sub_topic, support_details} = req.body;
        const {id} = req.params;
        const [result] = await conn.query(`UPDATE ${tb} 
            SET main_topic = ?, sub_topic = ?, support_details = ? WHERE id = ?`, 
            [main_topic, sub_topic, support_details, id]);
        
        if(result.affectedRows === 0){
            res.status(404).send('Highlight not found');
        } else {
            res.send('Highlight updated');
        }

    } catch (err) {
        console.error('Error updating highlight: ', err);
        res.status(500).send('Error updating highlight');
    }
});

router.delete('/:id', async (req, res) => {
    try{
        const conn = await initMYSQL();
        const {id} = req.params;
        const [result] = await conn.query(`DELETE FROM ${tb} WHERE id = ?`, [id]);

        if(result.affectedRows === 0){
            res.status(404).send('Highlight not found');
        } else {
            res.send('Highlight deleted');
        }

    } catch (err) {
        console.error('Error deleting highlight: ', err);
        res.status(500).send('Error deleting highlight');
    }
});

module.exports = router;