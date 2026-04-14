import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'salaahtimesdisplay',
  standalone: false
})
export class SalaahtimesdisplayPipe implements PipeTransform {

  transform(value: any): any {
    let res = [];
    if (value && typeof value === 'object') {
      res.push({ 'name': 'FAJR', 'value': value['fajr'] || '' });
      res.push({ 'name': 'DHUHR', 'value': value['zuhr'] || '' });
      res.push({ 'name': 'ASR', 'value': value['asr'] || '' });
      res.push({ 'name': 'MAGHREB*', 'value': value['maghrib'] || '' });
      res.push({ 'name': 'ISHA', 'value': value['isha'] || '' });
      res.push({ 'name': 'JUMAH', 'value': value['jumah'] || '' });
    }

    return res;
  }

}
