export const EMULATOR_CONFIG = {
    HOST: 'localhost',
    PORT: 21324,
    LED_PATH: 'api/v1/led',
    get API_BASE_URL() {
        return `http://${this.HOST}:${this.PORT}`;
    },
    get WS_URL() {
        return `ws://${this.HOST}:${this.PORT}/ws/led-stream`;
    },
};