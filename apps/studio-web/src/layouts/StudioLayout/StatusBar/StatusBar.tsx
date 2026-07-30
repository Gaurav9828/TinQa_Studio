import styles from './StatusBar.module.scss';

const StatusBar = () => {
    return (
        <div className={styles.statusBar}>
            <span>Disconnected</span>

            <span>FPS --</span>

            <span>Packets 0/s</span>

            <span>Latency -- ms</span>
        </div>
    );
};

export default StatusBar;