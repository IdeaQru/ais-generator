"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCombinedData = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sync_1 = require("csv-parse/sync");
const json_controller_1 = require("./json.controller");
// Path untuk menyimpan posisi terakhir
const positionFilePath = path_1.default.join(__dirname, '../../step_position.json');
// Fungsi untuk membaca posisi terakhir
const getLastPosition = () => {
    try {
        const data = fs_1.default.readFileSync(positionFilePath, 'utf-8');
        const position = JSON.parse(data);
        return position.index || 0;
    }
    catch (error) {
        return 0; // Default index jika file tidak ada atau error
    }
};
// Fungsi untuk menyimpan posisi terakhir
const savePosition = (index) => {
    const position = { index };
    fs_1.default.writeFileSync(positionFilePath, JSON.stringify(position), 'utf-8');
};
// Fungsi utama untuk menangani data
const handleCombinedData = async (req, res, next) => {
    try {
        // Inisialisasi dan load steps.csv saat server start
        const stepsCsvPath = path_1.default.join(__dirname, '../../steps.csv');
        const stepsCsvRaw = fs_1.default.readFileSync(stepsCsvPath, 'utf-8');
        let stepsData = (0, sync_1.parse)(stepsCsvRaw, {
            columns: true,
            skip_empty_lines: true
        });
        // Urutkan dari terbaru ke terlama
        stepsData = stepsData.sort((a, b) => {
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        });
        // Ambil posisi indeks terakhir dari penyimpanan
        let stepIndex = getLastPosition();
        console.log('Data received from CSV:', req.body);
        let data = req.body;
        // Cek jika manipulation true
        if (data.dynamic && data.dynamic.manipulation === false) {
            // Ambil data lat/lng dari stepsData sesuai index
            const currentStep = stepsData[stepIndex] || stepsData[stepsData.length - 1];
            data.dynamic.lat = parseFloat(currentStep.lat);
            data.dynamic.lon = parseFloat(currentStep.lng);
            console.log(currentStep.lat);
            console.log(currentStep.lng);
            // Update index untuk POST berikutnya
            if (stepIndex < stepsData.length - 1) {
                stepIndex++;
            }
        }
        // Simpan posisi terakhir agar bisa digunakan pada request berikutnya
        savePosition(stepIndex);
        // Gunakan type casting yang aman
        const modifiedReq = req;
        modifiedReq.body = data;
        // Lanjutkan dengan menyimpan data
        (0, json_controller_1.saveJsonData)(modifiedReq, res);
    }
    catch (error) {
        console.error('CSV conversion error:', error);
        res.status(500).json({ error: 'Data transformation failed' });
    }
};
exports.handleCombinedData = handleCombinedData;
