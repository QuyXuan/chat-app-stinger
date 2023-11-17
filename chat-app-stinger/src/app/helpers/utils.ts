export class Utils {
    static getUserId() {
        const accessToken = JSON.parse(localStorage.getItem('access_token') ?? '');
        return accessToken.user.uid;
    }
}