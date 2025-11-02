"use client";

import Link from "next/link";
import { HTMLAttributeAnchorTarget } from "react";

interface SmoothScrollLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: HTMLAttributeAnchorTarget;
}

export function SmoothScrollLink({ href, children, className, target }: SmoothScrollLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only handle smooth scroll for anchor links on same page
    if (href.startsWith("#")) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} target={target}>
      {children}
    </Link>
  );
}
