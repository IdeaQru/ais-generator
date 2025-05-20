"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/combined.routes.ts
const express_1 = require("express");
const combined_controller_1 = require("../controllers/combined.controller");
const router = (0, express_1.Router)();
router.post('/combined-csv', combined_controller_1.handleCombinedData);
exports.default = router;
