const express = require('express');
const cors = require('cors');
const path = require('path');
const initMYSQL = require('./config/db');
const cookieParser = require('cookie-parser');

require('dotenv').config(); 
const port = process.env.port || 3000;

// admin
const tools = require('./api/borrowReturn/tools');
const toolsHistory = require('./api/borrowReturn/toolsHistory');

// ... selected
const selectedShowcase = require('./api/selected/selectedShowcase');
const selectedShowTiktok = require('./api/selected/selectedShowTiktok');

const a_teams = require('./api/admin/teams');

// ... sign in / up
const signIn = require('./api/signInUpOut/SignIn');
const signUp = require('./api/signInUpOut/SignUp');
const signOut = require('./api/signInUpOut/SignOut')

// student
const stu_main = require('./api/student/Stu_Main');
const stu_showcase = require('./api/student/pages/Stu_Showcase');
const stu_showtiktok = require('./api/student/pages/Stu_ShowTiktok');

// pages
const contact = require('./api/pages/contact');

const app = express();
app.use(cookieParser());
app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    }
));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

app.get('/', (req, res) => {
    res.send('Hello Worlds!');
});
;


// admin
app.use('/tools', tools);
app.use('/tools/history', toolsHistory);

// ... selected
app.use('/selectedShowcase', selectedShowcase);
app.use('/selectedShowTiktok', selectedShowTiktok);

app.use('/teams', a_teams);

// ... sign in / up
app.use('/signUp', signUp);
app.use('/signIn', signIn);
app.use('/signOut', signOut);

// ... student [ +admin ]
app.use('/student', stu_main);
app.use('/studentShowcase', stu_showcase);
app.use('/studentShowTiktok', stu_showtiktok);

// pages
app.use('/contact', contact);

app.listen(port, async () => {
    try{
        await initMYSQL();
        console.log(`Example app listening at http://localhost:${port}`);

    } catch (err) {
        console.error('Error starting the app: ', err);
    }
});
