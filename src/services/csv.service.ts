// services/csv.service.ts
import { json2csv } from 'json-2-csv';

export const convertToCSV = async (data: any) => {
  try {
    const options = {
      emptyFieldValue: '',
      keys: ['static', 'dynamic', 'interval'],
      unwindArrays: true
    };

    return await json2csv([data], options);
  } catch (error:any) {
    throw new Error(`CSV conversion failed: ${error.message}`);
  }
};
