export class Utils {
    static getUserId() {
        const accessToken = JSON.parse(localStorage.getItem('access_token') ?? '');
        return accessToken.user.uid;
    }

    static calculateBetweenTwoTime(date: any) {
        // date mà firebase trả về 1 đối tượng chứa seconds và nanoseconds nên cần convert qua Date bằng cách tính millisecond
        const dateInPass = new Date(date.seconds * 1000 + date.nanoseconds / (1000 * 1000));
        const now = new Date();
        const secondsDiff = Math.ceil((now.getTime() - dateInPass.getTime()) / 1000);
        const minutesDiff = Math.floor(secondsDiff / 60);
        const hoursDiff = Math.floor(minutesDiff / 60);
        const daysDiff = Math.floor(hoursDiff / 24);
        const monthsDiff = Math.floor(daysDiff / 30);
        const yearsDiff = Math.floor(monthsDiff / 12);
        if (yearsDiff !== 0) {
            return `${yearsDiff} years ago`;
        } else if (monthsDiff !== 0) {
            return `${monthsDiff} months ago`;
        } else if (daysDiff !== 0) {
            return `${daysDiff} days ago`;
        } else if (hoursDiff !== 0) {
            return `${hoursDiff} hours ago`;
        } else if (minutesDiff !== 0) {
            return `${minutesDiff} minutes ago`;
        } else {
            return `a few seconds ago`;
        }
    }
}