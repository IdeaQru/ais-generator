import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const CSV_FILE_PATH = path.join(__dirname, '../../steps.csv');

export const saveCSV = (req: Request, res: Response): void => {
  const { csv } = req.body;
  if (!csv) {
    res.status(400).json({ error: 'No CSV data provided' });
    return;
  }

  fs.writeFile(CSV_FILE_PATH, csv, (err) => {
    if (err) {
      console.error('File write error:', err);
      res.status(500).json({ error: 'Failed to persist CSV data' });
      return;
    }
    res.json({ message: 'CSV data persisted successfully' });
  });
};

export const resetCSV = (req: Request, res: Response): void => {
  fs.unlink(CSV_FILE_PATH, (err) => {
    if (err) {
      console.error('File delete error:', err);
      res.status(500).json({ error: 'Failed to reset CSV data' });
      return;
    }
    res.json({ message: 'CSV data reset successfully' });
  });
};