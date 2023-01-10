export interface TimeInformation {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    milliseconds: number;
}

export class DatetimeHelper {
    public static millisecondsToTime = (milliseconds: number): TimeInformation => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        return {
            days,
            hours: hours - (days * 24),
            minutes: minutes - (hours * 60),
            seconds: seconds - (minutes * 60),
            milliseconds: milliseconds - (seconds * 1000)
        };
    }
}
