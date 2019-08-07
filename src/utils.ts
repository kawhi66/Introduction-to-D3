export function unique<T>(rawArray: Array<T>): Array<T> {
  return Array.from(new Set(rawArray));
}

export interface Row {
  year: number;
  age_group: number;
  sex: number;
  people: number;
}

export function isYearAndSex(row: Row, year: number, sex: number) {
  return row.year === year && row.sex === sex;
}
