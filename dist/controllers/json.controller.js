"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveJsonData = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const JSON_FILE_PATH = path_1.default.join(__dirname, '../../combined-data.json');
const saveJsonData = (req, res) => {
    const data = req.body;
    if (!data || Object.keys(data).length === 0) {
        res.status(400).json({ error: 'No data provided' });
        return;
    }
    fs_1.default.writeFile(JSON_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) {
            console.error('JSON save error:', err);
            res.status(500).json({ error: 'Failed to save JSON file' });
            return;
        }
        res.json({
            message: 'Data saved to JSON successfully',
            path: JSON_FILE_PATH
        });
    });
};
exports.saveJsonData = saveJsonData;
