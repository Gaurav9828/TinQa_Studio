import styles from './Workspace.module.scss';

const Workspace = () => {
    return (
        <div className={styles.workspace}>
            <div className={styles.card}>
                <h2>Welcome to TinQa Matrix Studio</h2>

                <p>
                    Your LED Matrix Development & Diagnostics Platform.
                </p>
            </div>
        </div>
    );
};

export default Workspace;