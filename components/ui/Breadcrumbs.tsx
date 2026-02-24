import React from "react";
import Link from "next/link";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

/**
 * WCAG 2.4.8 compliant breadcrumb navigation.
 * Uses <nav aria-label="Breadcrumb"> with <ol> and schema.org BreadcrumbList JSON-LD.
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.label,
            ...(item.href ? { item: `https://www.ifxtrades.com${item.href}` } : {}),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className={`breadcrumb-nav ${className}`}>
                <ol className="flex items-center gap-2 list-none p-0 m-0">
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;
                        return (
                            <li key={index} className="flex items-center gap-2">
                                {index > 0 && (
                                    <svg
                                        width="12" height="12" viewBox="0 0 24 24"
                                        fill="none" stroke="currentColor" strokeWidth={2}
                                        className="breadcrumb-separator" aria-hidden="true"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                                {isLast || !item.href ? (
                                    <span
                                        className={isLast ? "current" : ""}
                                        aria-current={isLast ? "page" : undefined}
                                    >
                                        {item.label}
                                    </span>
                                ) : (
                                    <Link href={item.href} className="hover:text-jpm-gold transition-colors">
                                        {item.label}
                                    </Link>
                                )}
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
}
