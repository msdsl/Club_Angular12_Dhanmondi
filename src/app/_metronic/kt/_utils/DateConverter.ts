import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

export class DateConverter {
  readonly DELIMITER = '-';

  parseDate(value: string): NgbDateStruct | null {
    if (value) {
      const datePart = value.split('T')[0];

      const date = datePart.split(this.DELIMITER);
      return {
        year: parseInt(date[0], 10),
        month: parseInt(date[1], 10),
        day: parseInt(date[2], 10),
      };
    }
    return null;
  }

  dateModal(date: any) {
    
    if (!date.year) return new Date().toISOString();

    if (!date.month) return new Date().toISOString();

    if (!date.day) return new Date().toISOString();

    let idate = `${date.year}-${date.month}-${date.day}`;
    let parsedDate = new Date(idate);
    parsedDate.setHours(parsedDate.getHours() + 6);
    return parsedDate.toISOString();
  }

  avalablitydateModal(date: any) {
    let idate = `${date.year}-${date.month}-${date.day}`;
    let parsedDate = new Date(idate);

    return parsedDate.toISOString();
  }
}
