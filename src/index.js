const express = require('express');
const bodyParser = require('body-parser');
const authRouter = require('./Routers/auth.route');

const app = express();
app.use(bodyParser.json());

app.use('/auth', authRouter);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
