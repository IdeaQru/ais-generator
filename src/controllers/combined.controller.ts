import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import { saveJsonData } from './json.controller';

// Path untuk menyimpan posisi terakhir
const positionFilePath = path.join(__dirname, '../../step_position.json');

// Fungsi untuk membaca posisi terakhir
const getLastPosition = (): number => {
  try {
    const data = fs.readFileSync(positionFilePath, 'utf-8');
    const position = JSON.parse(data);
    return position.index || 0;
  } catch (error) {
    return 0; // Default index jika file tidak ada atau error
  }
};

// Fungsi untuk menyimpan posisi terakhir
const savePosition = (index: number): void => {
  const position = { index };
  fs.writeFileSync(positionFilePath, JSON.stringify(position), 'utf-8');
};

// Fungsi utama untuk menangani data
export const handleCombinedData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Inisialisasi dan load steps.csv saat server start
    const stepsCsvPath = path.join(__dirname, '../../steps.csv');
    const stepsCsvRaw = fs.readFileSync(stepsCsvPath, 'utf-8');
    let stepsData = parse(stepsCsvRaw, {
      columns: true,
      skip_empty_lines: true
    });

    // Urutkan dari terbaru ke terlama
    stepsData = stepsData.sort((a: any, b: any) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });

    // Ambil posisi indeks terakhir dari penyimpanan
    let stepIndex = getLastPosition();

    console.log('Data received from CSV:', req.body);

    let data = req.body;

    // Cek jika manipulation true
    if (data.dynamic && data.dynamic.manipulation === true) {
      // Ambil data lat/lng dari stepsData sesuai index
      const currentStep = stepsData[stepIndex] || stepsData[stepsData.length - 1];

      data.dynamic.lat = parseFloat(currentStep.lat);
      data.dynamic.lon = parseFloat(currentStep.lng);
      console.log(currentStep.lat);
      console.log(currentStep.lng);

      // Update index untuk POST berikutnya
      if (stepIndex < stepsData.length - 1) {
        stepIndex++;
      }
    }

    // Simpan posisi terakhir agar bisa digunakan pada request berikutnya
    savePosition(stepIndex);

    // Gunakan type casting yang aman
    const modifiedReq = req as Request;
    modifiedReq.body = data;

    // Lanjutkan dengan menyimpan data
    saveJsonData(modifiedReq, res);

  } catch (error) {
    console.error('CSV conversion error:', error);
    res.status(500).json({ error: 'Data transformation failed' });
  }
};
