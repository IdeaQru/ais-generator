"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_service_1 = __importDefault(require("../services/data.service"));
class DataController {
    getAllData(req, res) {
        const allData = data_service_1.default.getAllData();
        res.json({ success: true, data: allData });
    }
    saveData(req, res) {
        const { roll, pitch, yaw, heading, cardinalDirection, latitude, longitude } = req.body;
        if (roll === undefined || pitch === undefined || yaw === undefined ||
            heading === undefined || !cardinalDirection || !latitude || !longitude) {
            res.status(400).json({ success: false, message: 'Missing required fields' });
            return;
        }
        const savedData = data_service_1.default.saveData({
            roll,
            pitch,
            yaw,
            heading,
            cardinalDirection,
            latitude,
            longitude
        });
        res.status(201).json({
            success: true,
            message: 'Data saved successfully',
            data: savedData
        });
    }
}
exports.default = new DataController();
