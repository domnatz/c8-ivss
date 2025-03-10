import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Tags } from '@/app/[assetId]/_section/tagsDetails';

export const uploadTags = async (file: File): Promise<void> => {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = async (e) => {
      const data = e.target?.result;
      let tags: Tags[] = [];
      if (file.name.endsWith('.csv')) {
        Papa.parse(data as string, {
          header: true,
          complete: (results) => {
            tags = results.data as Tags[];
          },
        });
      } else if (file.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        tags = XLSX.utils.sheet_to_json(sheet) as Tags[];
      }
      // Send tags to backend
      const response = await fetch('http://localhost:8000/upload_masterlist', {
        method: 'POST',
        body: JSON.stringify(tags),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        resolve();
      } else {
        reject(new Error('Failed to upload tags'));
      }
    };
    reader.readAsBinaryString(file);
  });
};