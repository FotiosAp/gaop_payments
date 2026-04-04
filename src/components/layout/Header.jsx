import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import styles from './Header.module.css';

const Header = () => {
    const { session, onLogout } = useAppContext();
    const username = session?.user?.email || 'admin@gaop.gr';

    const handleLogout = async () => {
        try {
            await onLogout();
        } catch (err) {
            console.error("Logout error", err);
            window.location.href = '/login';
        }
    };

    return (
        <div className={styles.headerContainer}>
            <div className={styles.brand}>
                <h2 className={styles.title}>
                    Γ.Α.Ο.Π / Εσοδα-Εξοδα
                </h2>
                <div className={styles.userSession}>
                    <User size={12} strokeWidth={3} />
                    <span>{username}</span>
                </div>
            </div>

            <button
                onClick={handleLogout}
                className={styles.logoutBtn}
            >
                <LogOut size={14} />
                <span className={styles.logoutText}>Έξοδος</span>
            </button>
        </div>
    );
};

export default Header;
