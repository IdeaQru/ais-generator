"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/csv.routes.ts
const express_1 = require("express"); // Import Request and Response
const csv_controller_1 = require("../controllers/csv.controller");
const router = (0, express_1.Router)();
router.post('/save-csv', csv_controller_1.saveCSV);
router.delete('/reset-csv', csv_controller_1.resetCSV);
exports.default = router;
