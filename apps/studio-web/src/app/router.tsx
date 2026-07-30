import StudioLayout from '@layouts/StudioLayout';
import EmulatorPage from '@modules/emulator';
import { createBrowserRouter, Navigate } from 'react-router-dom';


export const router = createBrowserRouter([
    {
        path: '/',
        element: <StudioLayout />,
        children: [
            // {
            //     index: true,
            //     element: <DashboardPage />,
            // },
            // {
            //     path: 'devices',
            //     element: <DevicesPage />,
            // },
            {
                path: 'emulator',
                element: <EmulatorPage />,
            },
            // {
            //     path: 'diagnostics',
            //     element: <DiagnosticsPage />,
            // },
            // {
            //     path: 'monitoring',
            //     element: <MonitoringPage />,
            // },
            // {
            //     path: 'firmware',
            //     element: <FirmwarePage />,
            // },
            // {
            //     path: 'preferences',
            //     element: <PreferencesPage />,
            // },
        ],
    },
    {
        // Fallback route for unmatched paths
        path: '*',
        element: <Navigate to="/" replace />, // Or replace with <NotFoundPage />
    },
]);