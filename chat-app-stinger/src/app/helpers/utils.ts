export class Utils {
    static getUserId() {
        const accessToken = JSON.parse(localStorage.getItem('access_token') ?? '');
        return accessToken.user.uid;
    }

    static calculateBetweenTwoTime(date: any) {
        // date mà firebase trả về 1 đối tượng chứa seconds và nanoseconds nên cần convert qua Date bằng cách tính millisecond
        const dateInPass = new Date(date.seconds * 1000 + date.nanoseconds / (1000 * 1000));
        console.log(dateInPass);
        const now = new Date();
        if (now.getFullYear() != dateInPass.getFullYear()) {
            return `${now.getFullYear() - dateInPass.getFullYear()} years ago`;
        } else if (now.getMonth() != dateInPass.getMonth()) {
            return `${now.getMonth() - dateInPass.getMonth()} months ago`;
        } else if (now.getDate() != dateInPass.getDate()) {
            return `${now.getDate() - dateInPass.getDate()} days ago`;
        } else if (now.getHours() != dateInPass.getHours()) {
            return `${now.getHours() - dateInPass.getHours()} hours ago`;
        } else if (now.getMinutes() != dateInPass.getMinutes()) {
            return `${now.getMinutes() - dateInPass.getMinutes()} minutes ago`;
        } else {
            return `a few seconds ago`;
        }
    }
}