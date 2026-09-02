import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'TimeMinusSixHoursPipe',
})
export class TimeMinusSixHoursPipe implements PipeTransform {
  transform(value: string): string {
    const originalDate = new Date(value);
    const modifiedDate = new Date(originalDate.getTime() - 6 * 60 * 60 * 1000); // Subtract 6 hours

    const datePipe = new DatePipe('en-US');
    return datePipe.transform(modifiedDate, 'h:mm a');
  }
}
