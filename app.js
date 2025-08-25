const express = require('express');
const swaggerUI = require('swagger-ui-express');
const env = require('dotenv')
const authRoutes = require('./src/routes/authRoutes');
const fileRoutes = require('./src/routes/fileRoutes');
const jobRoutes = require('./src/routes/jobRoutes');
const fs = require('fs');
const path = require('path');
const loadSwaggerDocument = require('./src/swagger.js');
const app = express();

env.config();

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);
app.use('/api/job', jobRoutes);

// Load the swagger document and set up the UI
const swaggerDocument = loadSwaggerDocument();
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
