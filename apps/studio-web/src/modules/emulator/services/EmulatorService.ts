import { EMULATOR_CONFIG } from "@core/config";

export interface ThemeOption {
    id: string;
    name: string;
}

export const emulatorApi = {
    async fetchThemes(): Promise<ThemeOption[]> {
        const res = await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/themes`);
        const data = await res.json();
        return data.themes || [];
    },

    async fetchStatus() {
        const res = await fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/status`);
        return res.json();
    },

    async setTheme(themeId: string) {
        return fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/theme`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme: themeId }),
        });
    },

    async setColor(color: string) {
        return fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/color`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ color }),
        });
    },

    async setPower(power: boolean) {
        return fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/power`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ power }),
        });
    },

    async setBrightness(value: number) {
        return fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/brightness`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ value }),
        });
    },

    async setGrid(width: number, height: number) {
        return fetch(`${EMULATOR_CONFIG.API_BASE_URL}/${EMULATOR_CONFIG.LED_PATH}/grid`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ width, height }),
        });
    },
};