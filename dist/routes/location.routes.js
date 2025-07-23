"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const geoip = require('geoip-lite');
const router = (0, express_1.Router)();
// Fungsi untuk mendapatkan IP client
function getClientIP(req) {
    const forwarded = req.headers['x-forwarded-for'];
    const cfConnecting = req.headers['cf-connecting-ip'];
    const clientIP = req.headers['x-client-ip'];
    return cfConnecting ||
        clientIP ||
        (forwarded ? forwarded.split(',')[0].trim() : '') ||
        req.socket.remoteAddress ||
        req.ip ||
        'unknown';
}
// POST /api/esp32/location - ESP32 kirim request dan terima longitude/latitude
router.post('/esp32/location', (req, res) => {
    try {
        const { device_id, ip_address } = req.body;
        if (!device_id) {
            return res.status(400).json({
                status: 'error',
                message: 'device_id is required',
                latitude: 0,
                longitude: 0,
                city: 'Unknown',
                country: 'Unknown',
                region: 'Unknown',
                timezone: 'Unknown',
                timestamp: Date.now()
            });
        }
        // Ambil IP dari body request atau dari client request
        const targetIP = ip_address || getClientIP(req);
        console.log(`Location request from ESP32 ${device_id} with IP: ${targetIP}`);
        // Gunakan geoip-lite untuk lookup offline
        const geo = geoip.lookup(targetIP);
        if (geo) {
            const response = {
                status: 'success',
                latitude: geo.ll[0], // latitude
                longitude: geo.ll[1], // longitude
                city: geo.city || 'Unknown',
                country: geo.country || 'Unknown',
                region: geo.region || 'Unknown',
                timezone: geo.timezone || 'Unknown',
                timestamp: Date.now()
            };
            console.log(`Location found: ${geo.city}, ${geo.country}`);
            res.json(response);
            // } else {
            // // Fallback untuk IP local/private ip ppns surabaya
            // const response: LocationResponse = {
            // status: 'success',
            // latitude: -7.255576,  // Default: PPNS SURABYA
            // longitude: 112.7500,
            // city: 'Surabaya',
            // country: 'Indonesia',
            // region: 'East Java',
            // timezone: 'Asia/Jakarta',
            // timestamp: Date.now()
            // }
            //   console.log(`Using default
            //      location for local IP: ${targetIP}`);
            //   res.json(response);
        }
    }
    catch (error) {
        console.error('Error in /esp32/location endpoint:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error',
            latitude: 0,
            longitude: 0,
            city: 'Error',
            country: 'Error',
            region: 'Error',
            timezone: 'Error',
            timestamp: Date.now()
        });
    }
});
// GET /api/location/test - Test endpoint untuk browser
router.get('/location/test', (req, res) => {
    try {
        const clientIP = getClientIP(req);
        const geo = geoip.lookup(clientIP);
        console.log(`Test request from IP: ${clientIP}`);
        console.log('GeoIP result:', geo);
        res.json({
            ip_address: clientIP,
            geo_data: geo,
            timestamp: Date.now()
        });
    }
    catch (error) {
        console.error('Error in test endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            timestamp: Date.now()
        });
    }
});
exports.default = router;
