// controllers/json.controller.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const JSON_FILE_PATH = path.join(__dirname, '../../combined-data.json');

export const saveJsonData = (req: Request, res: Response): void => {
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No data provided' });
    return;
  }

  fs.writeFile(
    JSON_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf-8',
    (err) => {
      if (err) {
        console.error('JSON save error:', err);
        res.status(500).json({ error: 'Failed to save JSON file' });
        return;
      }
      res.json({
        message: 'Data saved to JSON successfully',
        path: JSON_FILE_PATH
      });
    }
  );
};

