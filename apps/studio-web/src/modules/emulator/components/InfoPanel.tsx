import styles from './InfoPanel.module.scss';
import { useEmulatorStore } from '../store/emulatorStore';

const InfoPanel = () => {
    const width = useEmulatorStore((state) => state.width);
    const height = useEmulatorStore((state) => state.height);
    const totalLeds = width * height;

    return (
        <div className={styles.panel}>
            <h3>Matrix Information</h3>

            <ul>
                <li>Width : {width}</li>
                <li>Height : {height}</li>
                <li>LEDs : {totalLeds}</li>
                <li>Brightness : 100%</li>
            </ul>
        </div>
    );
};

export default InfoPanel;