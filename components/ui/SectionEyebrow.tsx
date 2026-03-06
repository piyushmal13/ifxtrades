import { memo, type HTMLAttributes } from "react";

type SectionEyebrowProps = HTMLAttributes<HTMLParagraphElement>;

function SectionEyebrowComponent({ className = "", style, ...props }: SectionEyebrowProps) {
  const mergedClassName = `text-xs tracking-[0.2em] uppercase font-semibold ${className}`.trim();

  return (
    <p
      className={mergedClassName}
      style={{ color: "var(--gold-pure)", ...style }}
      {...props}
    />
  );
}

export const SectionEyebrow = memo(SectionEyebrowComponent);
SectionEyebrow.displayName = "SectionEyebrow";
