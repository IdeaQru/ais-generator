"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const csv_routes_1 = __importDefault(require("./routes/csv.routes"));
const combined_routes_1 = __importDefault(require("./routes/combined.routes"));
const encode_routes_1 = __importDefault(require("./routes/encode.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const location_routes_1 = __importDefault(require("./routes/location.routes")); // Import route baru
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3718;
// Middleware configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:4200', '*'], // Tambahkan * untuk ESP32
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: '5mb' }));
// Trust proxy untuk mendapatkan IP yang benar
app.set('trust proxy', true);
// Path to the Angular build directory
const angularDistPath = path_1.default.join(__dirname, '../dist/ais-generator');
// Log the angular dist path for debugging
console.log("Angular build path: ", angularDistPath);
// Serve static files from Angular build
app.use(express_1.default.static(angularDistPath));
// Route registration for API endpoints
app.use('/api', csv_routes_1.default);
app.use('/api', combined_routes_1.default);
app.use('/api', encode_routes_1.default);
app.use('/api', data_routes_1.default);
app.use('/api', location_routes_1.default); // Tambahkan route location
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
    res.sendFile(path_1.default.join(angularDistPath, 'index.html'));
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server operational on port http://localhost:${PORT}`);
    console.log(`Location API available at http://localhost:${PORT}/api/location`);
});
