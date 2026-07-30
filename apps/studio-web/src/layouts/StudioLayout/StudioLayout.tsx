import { Outlet } from 'react-router-dom';
import styles from './StudioLayout.module.scss';

import Header from './Header';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
// Note: You no longer need to import Workspace here since the pages replace it

const StudioLayout = () => {
    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <Sidebar />
            </aside>

            <div className={styles.main}>
                <header className={styles.header}>
                    <Header />
                </header>

                <main className={styles.workspace}>
                    {/* The Outlet renders whatever child route is currently active */}
                    <Outlet />
                </main>

                <footer className={styles.statusBar}>
                    <StatusBar />
                </footer>
            </div>
        </div>
    );
};

export default StudioLayout;