// server.ts
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import csvRoutes from './routes/csv.routes';
import combinedRoutes from './routes/combined.routes';
import encodeRoutes from './routes/encode.routes';
import dataRoutes from './routes/data.routes';
import path from 'path';

const app = express();
const PORT = 3718;

// Middleware configuration
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' }));

// Path to the Angular build directory (adjust to your build directory)
const angularDistPath = path.join(__dirname, '../dist/ais-generator');

// Log the angular dist path for debugging
console.log("Angular build path: ", angularDistPath);

// Serve static files (CSS, JS, etc.) from Angular build
app.use(express.static(angularDistPath));

// Route registration for API endpoints
app.use('/api', csvRoutes);
app.use('/api', combinedRoutes);
app.use('/api', encodeRoutes);
app.use('/api', dataRoutes);

// Catch-all route for Angular's index.html
app.get('/demn', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server operational on port http://localhost:${PORT}`);
});
