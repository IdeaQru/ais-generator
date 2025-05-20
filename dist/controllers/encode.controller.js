"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodeAisData2 = exports.encodeAisData = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const GGencode = require('ais-decoder');
const dgram_1 = __importDefault(require("dgram"));
const JSON_FILE_PATH = path_1.default.join(__dirname, '../../combined-data.json');
// Buat UDP client global (agar tidak membuat socket baru tiap request)
const udpClient = dgram_1.default.createSocket('udp4');
// Simpan interval timer agar tidak terjadi duplikasi interval antar request
let udpInterval = null;
const UDP_PORT = 4335; // Ganti sesuai kebutuhan
const UDP_HOST = '146.190.89.97'; // Ganti sesuai kebutuhan
// Simpan interval timer agar bisa dihentikan jika diperlukan
let udpIntervalTimer = null;
const encodeAisData = (req, res) => {
    fs_1.default.readFile(JSON_FILE_PATH, 'utf-8', (err, fileData) => {
        if (err) {
            res.status(500).json({ error: 'Gagal membaca file JSON', detail: err.message });
            return;
        }
        try {
            const jsonData = JSON.parse(fileData);
            const { static: staticData, dynamic: dynamicData, interval: interval } = jsonData;
            const results = [];
            // Handle Static Data
            const processSection = (section, sectionName) => {
                if (!section) {
                    results.push({ part: sectionName, error: 'Data tidak ditemukan' });
                    return;
                }
                const aistype = Number(section.aistype);
                if (isNaN(aistype)) {
                    results.push({
                        part: sectionName,
                        error: 'aistype harus berupa number',
                        data: section
                    });
                    return;
                }
                const encoder = new GGencode.AisEncode({ ...section, aistype });
                if (encoder.valid) {
                    results.push({
                        part: sectionName,
                        aistype: aistype,
                        nmea: encoder.nmea,
                    });
                }
                else {
                    results.push({
                        part: sectionName,
                        aistype: aistype,
                        error: 'Pesan AIS tidak valid',
                        data: section
                    });
                }
            };
            // Proses kedua bagian
            processSection(staticData, 'static');
            processSection(dynamicData, 'dynamic');
            // Fungsi untuk mengirim pesan UDP
            const sendUdpMessage = (message) => {
                udpClient.send(message, UDP_PORT, UDP_HOST, (err) => {
                    if (err) {
                        console.error('UDP send error:', err);
                    }
                    else {
                        console.log('UDP message sent:', message);
                    }
                });
            };
            // Kirim NMEA pertama langsung setelah proses
            results.forEach(item => {
                if (item.nmea) {
                    sendUdpMessage(item.nmea);
                }
            });
            res.json({
                success: results.every(item => !item.error),
                data: results,
                interval: interval
            });
        }
        catch (parseError) {
            res.status(500).json({
                error: 'Format JSON tidak valid',
                detail: parseError instanceof Error ? parseError.message : 'Unknown error'
            });
        }
    });
};
exports.encodeAisData = encodeAisData;
// controllers/encode.controller.ts
const encodeAisData2 = (req, res) => {
    const { static: staticData, dynamic: dynamicData, interval } = req.body;
    // Validasi basic request body
    if (!staticData || !dynamicData) {
        res.status(400).json({
            error: 'Invalid request format',
            message: 'Request body harus mengandung properti static dan dynamic'
        });
        return;
    }
    const results = [];
    // Fungsi helper untuk proses encoding
    const processSection = (section, sectionName) => {
        if (!section.aistype) {
            return {
                part: sectionName,
                error: 'aistype tidak ditemukan',
                data: section
            };
        }
        const aistype = Number(section.aistype);
        if (isNaN(aistype)) {
            return {
                part: sectionName,
                error: 'aistype harus berupa number',
                data: section
            };
        }
        try {
            const encoder = new GGencode.AisEncode({ ...section, aistype });
            return encoder.valid ? {
                part: sectionName,
                aistype: aistype,
                nmea: encoder.nmea
            } : {
                part: sectionName,
                aistype: aistype,
                error: 'Pesan AIS tidak valid',
                data: section
            };
        }
        catch (e) {
            return {
                part: sectionName,
                error: 'Gagal melakukan encoding',
                detail: e instanceof Error ? e.message : 'Unknown error'
            };
        }
    };
    // Proses kedua bagian
    results.push(processSection(staticData, 'static'));
    results.push(processSection(dynamicData, 'dynamic'));
    // Kirim NMEA hasil encode static dan dynamic via UDP
    const intervalMs = Number(interval) * 1000;
    // Fungsi untuk mengirim pesan UDP
    const sendUdpMessage = (message) => {
        udpClient.send(message, UDP_PORT, UDP_HOST, (err) => {
            if (err) {
                console.error('UDP send error:', err);
            }
            else {
                console.log('UDP message sent:', message);
            }
        });
    };
    // Kirim pesan pertama langsung
    results.forEach(item => {
        if (item.nmea) {
            sendUdpMessage(item.nmea);
        }
    });
    // Hapus interval lama agar tidak terjadi duplikasi
    if (udpInterval) {
        clearInterval(udpInterval);
    }
    // Kirim pesan berikutnya sesuai interval
    udpInterval = setInterval(() => {
        results.forEach(item => {
            if (item.nmea) {
                sendUdpMessage(item.nmea);
            }
        });
    }, intervalMs);
    res.json({
        success: results.every(item => !item.error),
        results
    });
};
exports.encodeAisData2 = encodeAisData2;
