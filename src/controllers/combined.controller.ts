import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { parse } from 'csv-parse/sync';
import { saveJsonData } from './json.controller';
import axios from 'axios'; // Library untuk HTTP request

// Path untuk menyimpan posisi terakhir
const positionFilePath = path.join(__dirname, '../../step_position.json');

// Fungsi untuk membaca posisi terakhir
const getLastPosition = (): number => {
  try {
    const data = fs.readFileSync(positionFilePath, 'utf-8');
    const position = JSON.parse(data);
    return position.index || 0;
  } catch (error) {
    console.error('Error reading last position:', error);
    return 0; // Default index jika file tidak ada atau error
  }
};

// Fungsi untuk menyimpan posisi terakhir
const savePosition = (index: number): void => {
  try {
    const position = { index };
    fs.writeFileSync(positionFilePath, JSON.stringify(position), 'utf-8');
  } catch (error) {
    console.error('Error saving position:', error);
  }
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
      skip_empty_lines: true,
    });

    // Urutkan dari terbaru ke terlama
    stepsData = stepsData.sort((a: any, b: any) => {
      return new Date(b.datetime).getTime() - new Date(a.datetime).getTime();
    });

    // Ambil posisi indeks terakhir dari penyimpanan
    let stepIndex = getLastPosition();

    console.log('Data received from request:', req.body);

    let data = req.body;

    // Cek jika manipulation true
    if (data.dynamic && data.dynamic.manipulation === true) {
      // Ambil data lat/lng dari stepsData sesuai index
      const currentStep = stepsData[stepIndex] || stepsData[stepsData.length - 1];

      data.dynamic.lat = parseFloat(currentStep.lat);
      data.dynamic.lon = parseFloat(currentStep.lng);
      console.log('CSV Lat:', currentStep.lat);
      console.log('CSV Lng:', currentStep.lng);

      // Update index untuk POST berikutnya
      if (stepIndex < stepsData.length - 1) {
        stepIndex++;
      }
      } else if (data.dynamic && data.dynamic.datasensor === true) {
        try {
          // Ambil data sensor dari endpoint API /datasensor
          const baseUrl = 'http://localhost:3718/api';
          console.log('Attempting to fetch data from:', `${baseUrl}/datasensor`);
          const response = await axios.get(`${baseUrl}/datasensor`, {
            timeout: 5000, // Timeout 5 detik untuk menghindari hanging
          });
          console.log('Response from /datasensor:', response.data);

          // Struktur data sesuai dengan response yang Anda tampilkan
          const sensorDataList = response.data.data; // Akses properti 'data' dari response

          // Ambil data terbaru (data terakhir) dari list jika ada
          if (sensorDataList && sensorDataList.length > 0) {
            const latestSensorData = sensorDataList[sensorDataList.length - 1];

            // Update data dynamic dengan data sensor (hanya latitude, longitude, dan heading)
            data.dynamic.lat = latestSensorData.latitude;
            data.dynamic.lon = latestSensorData.longitude;
            data.dynamic.heading = latestSensorData.heading;
            data.dynamic.cog = latestSensorData.heading;

            console.log('Sensor Data Used from API:', {
              latitude: latestSensorData.latitude,
              longitude: latestSensorData.longitude,
              heading: latestSensorData.heading,
            });
          } else {
            console.log('No sensor data available in response.data.data from /datasensor endpoint');
          }
        } catch (error:any) {
          console.error('Error fetching data from /datasensor:', error.message);
          if (error.response) {
            console.error('Response error details:', error.response.data);
          } else if (error.request) {
            console.error('No response received:', error.request);
          } else {
            console.error('Error setting up request:', error.message);
          }
          // Fallback ke data CSV jika gagal mengambil data sensor
        
      }
    }

    // Simpan posisi terakhir agar bisa digunakan pada request berikutnya
    savePosition(stepIndex);

    // Gunakan type casting yang aman
    const modifiedReq = req as Request;
    modifiedReq.body = data;

    // Lanjutkan dengan menyimpan data
    saveJsonData(modifiedReq, res);
  } catch (error:any) {
    console.error('Data processing error:', error.message);
    res.status(500).json({ error: 'Data transformation failed' });
  }
};
