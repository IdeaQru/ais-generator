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
const axios_1 = __importDefault(require("axios")); // Library untuk HTTP request
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
        console.error('Error reading last position:', error);
        return 0; // Default index jika file tidak ada atau error
    }
};
// Fungsi untuk menyimpan posisi terakhir
const savePosition = (index) => {
    try {
        const position = { index };
        fs_1.default.writeFileSync(positionFilePath, JSON.stringify(position), 'utf-8');
    }
    catch (error) {
        console.error('Error saving position:', error);
    }
};
// Fungsi utama untuk menangani data
const handleCombinedData = async (req, res, next) => {
    try {
        // Inisialisasi dan load steps.csv saat server start
        const stepsCsvPath = path_1.default.join(__dirname, '../../steps.csv');
        const stepsCsvRaw = fs_1.default.readFileSync(stepsCsvPath, 'utf-8');
        let stepsData = (0, sync_1.parse)(stepsCsvRaw, {
            columns: true,
            skip_empty_lines: true,
        });
        // Urutkan dari terbaru ke terlama
        stepsData = stepsData.sort((a, b) => {
            return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
        });
        // Ambil posisi indeks terakhir dari penyimpanan
        let stepIndex = getLastPosition();
        console.log('Data received from request:', req.body);
        let data = req.body;
        // Cek jika manipulation true
        if (data.dynamic && data.dynamic.manipulation === true) {
            // Ambil data lat/lng dari stepsData sesuai index
            const currentStep = stepsData[stepIndex] || stepsData[stepsData.length - 1];
            data.dynamic.lat = parseFloat(currentStep.lat);
            data.dynamic.lon = parseFloat(currentStep.lng);
            console.log('CSV Lat:', currentStep.lat);
            console.log('CSV Lng:', currentStep.lng);
            // Update index untuk POST berikutnya
            if (stepIndex < stepsData.length - 1) {
                stepIndex++;
            }
        }
        else if (data.dynamic && data.dynamic.datasensor === true) {
            try {
                // Ambil data sensor dari endpoint API /datasensor
                const baseUrl = 'http://localhost:3718/api';
                console.log('Attempting to fetch data from:', `${baseUrl}/datasensor`);
                const response = await axios_1.default.get(`${baseUrl}/datasensor`, {
                    timeout: 5000, // Timeout 5 detik untuk menghindari hanging
                });
                console.log('Response from /datasensor:', response.data);
                // Struktur data sesuai dengan response yang Anda tampilkan
                const sensorDataList = response.data.data; // Akses properti 'data' dari response
                // Ambil data terbaru (data terakhir) dari list jika ada
                if (sensorDataList && sensorDataList.length > 0) {
                    const latestSensorData = sensorDataList[sensorDataList.length - 1];
                    // Update data dynamic dengan data sensor (hanya latitude, longitude, dan heading)
                    data.dynamic.lat = latestSensorData.latitude;
                    data.dynamic.lon = latestSensorData.longitude;
                    data.dynamic.heading = latestSensorData.heading;
                    data.dynamic.cog = latestSensorData.heading;
                    console.log('Sensor Data Used from API:', {
                        latitude: latestSensorData.latitude,
                        longitude: latestSensorData.longitude,
                        heading: latestSensorData.heading,
                    });
                }
                else {
                    console.log('No sensor data available in response.data.data from /datasensor endpoint');
                }
            }
            catch (error) {
                console.error('Error fetching data from /datasensor:', error.message);
                if (error.response) {
                    console.error('Response error details:', error.response.data);
                }
                else if (error.request) {
                    console.error('No response received:', error.request);
                }
                else {
                    console.error('Error setting up request:', error.message);
                }
                // Fallback ke data CSV jika gagal mengambil data sensor
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
        console.error('Data processing error:', error.message);
        res.status(500).json({ error: 'Data transformation failed' });
    }
};
exports.handleCombinedData = handleCombinedData;
