
type ClassValue = string | number | null | undefined | Record<string, any> | Array<ClassValue>;

function simpleClsx(...inputs: ClassValue[]): string {
  const res: string[] = [];
  const push = (val: any) => { if (val || val === 0) res.push(String(val)); };

  const handle = (val: ClassValue) => {
    if (!val) return;
    if (typeof val === 'string' || typeof val === 'number') {
      push(val);
    } else if (Array.isArray(val)) {
      val.forEach(handle);
    } else if (typeof val === 'object') {
      for (const k in val) {
        if (Object.prototype.hasOwnProperty.call(val, k) && (val as any)[k]) push(k);
      }
    }
  };

  inputs.forEach(handle);
  return res.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return simpleClsx(...inputs);
}