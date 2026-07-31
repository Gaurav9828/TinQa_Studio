import styles from './PerformanceCard.module.scss';
import { useEmulatorStore } from '../store/emulatorStore';

const PerformanceCard = () => {
    const fps = useEmulatorStore((state) => state.fps);
    const isConnected = useEmulatorStore((state) => state.isConnected);
    const deviceStatus = useEmulatorStore((state) => state.deviceStatus);

    // Compute status text and badge dynamically
    const getStatusText = () => {
        if (!isConnected && deviceStatus === 'Disconnected') {
            return '🔴 Disconnected';
        }
        switch (deviceStatus) {
            case 'Paused':
                return '⏸️ Paused';
            case 'Stopped':
                return '🔴 Stopped';
            case 'Connected':
            default:
                return '🟢 Connected';
        }
    };

    const isRendererActive = isConnected && deviceStatus === 'Connected';
    const activeFps = isRendererActive ? fps : 0;

    return (
        <div className={styles.card}>
            <h3>Performance</h3>

            <ul>
                <li>Status: {getStatusText()}</li>
                <li>FPS : {activeFps}</li>
                <li>Renderer : {isRendererActive ? 'Active' : 'Idle'}</li>
            </ul>
        </div>
    );
};

export default PerformanceCard;