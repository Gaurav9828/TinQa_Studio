import styles from './PerformanceCard.module.scss';
import { useEmulatorStore } from '../store/emulatorStore';

const PerformanceCard = () => {
    const fps = useEmulatorStore((state) => state.fps);
    const isConnected = useEmulatorStore((state) => state.isConnected);

    return (
        <div className={styles.card}>
            <h3>Performance</h3>

            <ul>
                <li>Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}</li>
                <li>FPS : {fps}</li>
                <li>Renderer : {isConnected ? 'Active' : 'Idle'}</li>
            </ul>
        </div>
    );
};

export default PerformanceCard;