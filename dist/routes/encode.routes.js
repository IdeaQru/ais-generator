"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const encode_controller_1 = require("../controllers/encode.controller");
const router = (0, express_1.Router)();
router.get('/encode', encode_controller_1.encodeAisData);
router.post('/encoded', encode_controller_1.encodeAisData2);
exports.default = router;
