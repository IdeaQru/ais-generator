"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToCSV = void 0;
// services/csv.service.ts
const json_2_csv_1 = require("json-2-csv");
const convertToCSV = async (data) => {
    try {
        const options = {
            emptyFieldValue: '',
            keys: ['static', 'dynamic', 'interval'],
            unwindArrays: true
        };
        return await (0, json_2_csv_1.json2csv)([data], options);
    }
    catch (error) {
        throw new Error(`CSV conversion failed: ${error.message}`);
    }
};
exports.convertToCSV = convertToCSV;
