"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
            <div className={styles.inner}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>📖</span>
                    <span className={styles.logoText}>DoubtDesk</span>
                </Link>

                <div className={`${styles.links} ${menuOpen ? styles.open : ""}`}>
                    <Link href="#features" className={styles.link} onClick={() => setMenuOpen(false)}>
                        Features
                    </Link>
                    <Link href="#how-it-works" className={styles.link} onClick={() => setMenuOpen(false)}>
                        How It Works
                    </Link>
                    <Link href="#subjects" className={styles.link} onClick={() => setMenuOpen(false)}>
                        Subjects
                    </Link>
                    <Link href="#pricing" className={styles.link} onClick={() => setMenuOpen(false)}>
                        Pricing
                    </Link>
                </div>

                <div className={styles.actions}>
                    <Link href="/dashboard" className="btn btn-outline" style={{ padding: "8px 20px", fontSize: 14 }}>
                        Login
                    </Link>
                    <Link href="/dashboard" className="btn btn-primary" style={{ padding: "8px 20px", fontSize: 14 }}>
                        Start Free Class
                    </Link>
                </div>

                <button
                    className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    );
}
