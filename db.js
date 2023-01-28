const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

// const DB = process.env.DATABASE_LOCAL;
const DB = process.env.DATABASE;
mongoose.connect(DB).then(() => console.log('DB Connected Successfully'));
