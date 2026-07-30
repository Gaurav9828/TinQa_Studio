import { NavLink } from 'react-router-dom';

import styles from './Sidebar.module.scss';

import { navigation } from '@shared/config/navigation';

const Sidebar = () => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>TinQa Studio</div>

            <nav className={styles.navigation}>
                {navigation.map((item) => (
                    <NavLink
                        key={item.id}
                        to={item.path}
                        className={({ isActive }) =>
                            isActive
                                ? `${styles.link} ${styles.active}`
                                : styles.link
                        }
                    >
                        {item.title}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;