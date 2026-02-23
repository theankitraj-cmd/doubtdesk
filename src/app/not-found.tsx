import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
    return (
        <div className={styles.notFoundPage}>
            <div className={styles.content}>
                <div className={styles.errorCode}>404</div>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.subtitle}>
                    Oops! This page doesn&apos;t exist. Maybe it&apos;s taking a class somewhere else.
                </p>
                <div className={styles.illustration}>📖 🤔</div>
                <div className={styles.actions}>
                    <Link href="/dashboard" className={styles.primaryBtn}>
                        🎓 Go to Classroom
                    </Link>
                    <Link href="/" className={styles.secondaryBtn}>
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
