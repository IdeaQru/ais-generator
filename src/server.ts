import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import csvRoutes from './routes/csv.routes';
import combinedRoutes from './routes/combined.routes';
import encodeRoutes from './routes/encode.routes';
import dataRoutes from './routes/data.routes';
import locationRoutes from './routes/location.routes'; // Import route baru
import path from 'path';

const app = express();
const PORT = 3718;

// Middleware configuration
app.use(cors({
  origin: ['http://localhost:4200', '*'], // Tambahkan * untuk ESP32
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(bodyParser.json({ limit: '5mb' }));

// Trust proxy untuk mendapatkan IP yang benar
app.set('trust proxy', true);

// Path to the Angular build directory
const angularDistPath = path.join(__dirname, '../dist/ais-generator');

// Log the angular dist path for debugging
console.log("Angular build path: ", angularDistPath);

// Serve static files from Angular build
app.use(express.static(angularDistPath));

// Route registration for API endpoints
app.use('/api', csvRoutes);
app.use('/api', combinedRoutes);
app.use('/api', encodeRoutes);
app.use('/api', dataRoutes);
app.use('/api', locationRoutes); // Tambahkan route location

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Catch-all route for Angular's index.html
app.get('/demn', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server operational on port http://localhost:${PORT}`);
  console.log(`Location API available at http://localhost:${PORT}/api/location`);
});
