import type { AnchorHTMLAttributes, ReactNode } from "react";

/**
 * ExternalLink — always applies rel="noopener noreferrer" and target="_blank"
 * for safe outbound navigation that prevents tab-nabbing.
 */
interface ExternalLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
}

export function ExternalLink({ href, children, className, ...rest }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      {...rest}
    >
      {children}
    </a>
  );
}
