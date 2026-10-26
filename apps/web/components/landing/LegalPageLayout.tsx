"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";
import { SiteFooter, SiteHeader } from "./ekarvo/SiteChrome";

interface TableOfContentsItem {
    id: string;
    label: string;
}

interface LegalPageLayoutProps {
    children: React.ReactNode;
    title: string;
    eyebrow?: string;
    lastUpdated?: string;
    tableOfContents?: TableOfContentsItem[];
}

// The Website's inner-page pattern (PageHero + .reading) on its paper surface.
// `theme-ekarvo` without `dark` keeps the paper tokens even when the app runs in dark mode.
const LegalPageLayout = ({
    children,
    title,
    eyebrow = "Legal",
    lastUpdated,
    tableOfContents,
}: LegalPageLayoutProps) => {
    const reducedMotion = useReducedMotion();
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        if (!tableOfContents || tableOfContents.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -60% 0px" }
        );

        tableOfContents.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [tableOfContents]);

    return (
        <div className="ek-site theme-ekarvo">
            <SiteHeader />
            <motion.div className="read-progress" aria-hidden="true" style={{ scaleX }} />

            <main id="main-content" tabIndex={-1}>
                <section className="page-hero">
                    <div className="container">
                        <p className="eyebrow">{eyebrow}</p>
                        <h1>{title}</h1>
                        {lastUpdated && <p className="meta">Last updated {lastUpdated}</p>}
                    </div>
                </section>

                <div className="container reading-layout">
                    {tableOfContents && tableOfContents.length > 0 && (
                        <aside className="reading-index" aria-labelledby="reading-index-label">
                            <p className="eyebrow" id="reading-index-label">On this page</p>
                            <nav aria-labelledby="reading-index-label">
                                {tableOfContents.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        aria-current={activeId === item.id ? "true" : undefined}
                                        onClick={(e) => {
                                            const element = document.getElementById(item.id);
                                            if (!element) return;
                                            e.preventDefault();
                                            // scroll-margin-top in ekarvo.css clears the sticky header.
                                            element.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
                                            history.replaceState(null, "", `#${item.id}`);
                                            setActiveId(item.id);
                                        }}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        </aside>
                    )}

                    <article className="reading">{children}</article>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
};

export default LegalPageLayout;
