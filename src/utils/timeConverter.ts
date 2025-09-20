import { Pipe, PipeTransform } from "@angular/core";


@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
    transform(value: Date) {
        return convertTimeToString(value)
    }
}



@Pipe({name: 'localDate'})
export class LocalDatePipe implements PipeTransform {
    transform(value: Date) {
        return `${convertTimeToString(value)} ${value.toLocaleDateString()}`
    }
}

export function stringToDate(s: string) {
  return new Date(s)
}
function convertTimeToString(date: Date){
    return date.toLocaleTimeString(undefined, {"timeStyle": "short"})
}
