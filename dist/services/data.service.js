"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataService {
    constructor() {
        this.dataStore = [];
    }
    getAllData() {
        return this.dataStore;
    }
    saveData(data) {
        const newData = { ...data, timestamp: new Date() };
        this.dataStore.push(newData);
        return newData;
    }
}
exports.default = new DataService();
