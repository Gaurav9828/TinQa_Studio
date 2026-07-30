export interface NavigationItem {
    id: string;
    title: string;
    path: string;
}

export const navigation: NavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/',
    },
    {
        id: 'devices',
        title: 'Devices',
        path: '/devices',
    },
    {
        id: 'emulator',
        title: 'Emulator',
        path: '/emulator',
    },
    {
        id: 'diagnostics',
        title: 'Diagnostics',
        path: '/diagnostics',
    },
    {
        id: 'monitoring',
        title: 'Monitoring',
        path: '/monitoring',
    },
    {
        id: 'firmware',
        title: 'Firmware',
        path: '/firmware',
    },
    {
        id: 'preferences',
        title: 'Preferences',
        path: '/preferences',
    },
];