const express = require('express');
const env = require('dotenv')
const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const app = express();

env.config();

app.use(express.json());

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/job', jobRoutes);

app.get('/', (req,res) => {
    res.json({message: 'PDF Converter Application is running!'});
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
