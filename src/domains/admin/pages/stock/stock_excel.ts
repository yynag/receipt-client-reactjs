import * as XLSX from 'xlsx';

interface ExcelRow {
  A: string;
  B: string;
  C: number;
  D: number;
  E: string;
  F: string;
  G: string;
  H: number;
  I: string;
  J: number;
}

export interface Receipt {
  package_name: string;
  product_code: string;
  order_id: number;
  receipt: string;
  receipt_create_unix: number;
  currency_code: string;
  price: number;
}

export const parse_stock_excel = (data: ArrayBuffer): Receipt[] => {
  const wb = XLSX.read(data, { type: 'binary', cellStyles: true, cellNF: false, cellHTML: false });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<ExcelRow>(ws, {
    header: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], // 指定列名
    range: 1,
    defval: '',
  });
  return jsonData.map((row) => ({
    package_name: row.A,
    product_code: row.B,
    order_id: row.C,
    receipt: row.E,
    receipt_create_unix: row.H,
    currency_code: row.I,
    price: row.J,
  }));
};
