import styles from './Header.module.scss';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <h1>TinQa Matrix Studio</h1>
            </div>

            <div className={styles.right}>
                <span className={styles.version}>v0.1.0</span>
            </div>
        </header>
    );
};

export default Header;