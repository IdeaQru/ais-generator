"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_controller_1 = __importDefault(require("../controllers/data.controller"));
const router = (0, express_1.Router)();
router.get('/datasensor', (req, res) => data_controller_1.default.getAllData(req, res));
router.post('/datasensor', (req, res) => data_controller_1.default.saveData(req, res));
//function post data sensorf
// export function postDatasensor(req: Request, res: Response) {
// }
exports.default = router;
