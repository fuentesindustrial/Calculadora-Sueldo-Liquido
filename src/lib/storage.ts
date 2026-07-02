export interface LiquidacionRecord {
  id: string;
  fecha: string;
  fechaIdentificador: string;
  params: any;
  result: any;
}

const STORAGE_KEY = 'sueldo_liquido_history';

export function getHistory(): LiquidacionRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading from local storage", error);
    return [];
  }
}

export function saveLiquidacion(record: Omit<LiquidacionRecord, 'id'>): LiquidacionRecord {
  const history = getHistory();
  const newRecord = {
    ...record,
    id: crypto.randomUUID()
  };
  
  history.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newRecord;
}

export function deleteLiquidacion(id: string): void {
  const history = getHistory();
  const filtered = history.filter(record => record.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
