"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const csv_routes_1 = __importDefault(require("./routes/csv.routes"));
const combined_routes_1 = __importDefault(require("./routes/combined.routes"));
const encode_routes_1 = __importDefault(require("./routes/encode.routes"));
const data_routes_1 = __importDefault(require("./routes/data.routes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3018;
// Middleware configuration
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express_1.default.json());
app.use(body_parser_1.default.json({ limit: '5mb' }));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
const angularDistPath = path_1.default.join(__dirname, '../ais-generator');
// Route registration
app.use('/api', csv_routes_1.default);
app.use('/api', combined_routes_1.default);
app.use('/api', encode_routes_1.default);
app.use('/api', data_routes_1.default);
app.use(express_1.default.static(angularDistPath));
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(angularDistPath, 'index.html'));
});
app.listen(PORT, () => {
    console.log(`Server operational on port ${PORT}`);
});
