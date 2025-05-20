import { Request, Response } from 'express';
import dataService from '../services/data.service';

class DataController {
  getAllData(req: Request, res: Response): void {
    const allData = dataService.getAllData();
    res.json({ success: true, data: allData });
  }

  saveData(req: Request, res: Response): void {
    const { roll, pitch, yaw, heading, cardinalDirection, latitude, longitude } = req.body;

    if (
      roll === undefined || pitch === undefined || yaw === undefined ||
      heading === undefined || !cardinalDirection || !latitude || !longitude
    ) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    const savedData = dataService.saveData({
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

export default new DataController();
