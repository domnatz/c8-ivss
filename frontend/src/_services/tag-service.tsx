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

export const fetchTagsByFileId = async (fileId: number): Promise<Tags[]> => {
  const response = await fetch(`http://localhost:8000/tags?file_id=${fileId}`);
  if (response.ok) {
    const data = await response.json();
    return data as Tags[];
  } else {
    throw new Error('Failed to fetch tags');
  }
};

export const fetchLatestMasterList = async (): Promise<{ file_id: number; file_name: string }> => {
  const response = await fetch('http://localhost:8000/masterlist/latest');
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Failed to fetch latest master list');
  }
};

// Add the new function here
export function addTagToSubgroup(
  subgroupId: number,
  tagData: { tag_id: number; tag_name: string }
) {
  return fetch(`http://localhost:8000/subgroups/${subgroupId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tag_id: tagData.tag_id,
      tag_name: tagData.tag_name,
    }),
  });
}