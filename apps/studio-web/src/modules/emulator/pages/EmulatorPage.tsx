import styles from './EmulatorPage.module.scss';

import Toolbar from '../controls/Toolbar';
import MatrixCanvas from '../canvas/MatrixCanvas';
import InfoPanel from '../components/InfoPanel';
import PerformanceCard from '../components/PerformanceCard';

const EmulatorPage = () => {
    return (
        <div className={styles.page}>
            <Toolbar />

            <div className={styles.content}>
                <div className={styles.canvasArea}>
                    <MatrixCanvas />
                </div>

                <aside className={styles.sidebar}>
                    <InfoPanel />
                    <PerformanceCard />
                </aside>
            </div>
        </div>
    );
};

export default EmulatorPage;