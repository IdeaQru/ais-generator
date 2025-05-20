"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetCSV = exports.saveCSV = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CSV_FILE_PATH = path_1.default.join(__dirname, '../../steps.csv');
const saveCSV = (req, res) => {
    const { csv } = req.body;
    if (!csv) {
        res.status(400).json({ error: 'No CSV data provided' });
        return;
    }
    fs_1.default.writeFile(CSV_FILE_PATH, csv, (err) => {
        if (err) {
            console.error('File write error:', err);
            res.status(500).json({ error: 'Failed to persist CSV data' });
            return;
        }
        res.json({ message: 'CSV data persisted successfully' });
    });
};
exports.saveCSV = saveCSV;
const resetCSV = (req, res) => {
    fs_1.default.unlink(CSV_FILE_PATH, (err) => {
        if (err) {
            console.error('File delete error:', err);
            res.status(500).json({ error: 'Failed to reset CSV data' });
            return;
        }
        res.json({ message: 'CSV data reset successfully' });
    });
};
exports.resetCSV = resetCSV;
