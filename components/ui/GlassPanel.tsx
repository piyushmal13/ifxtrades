import { memo, type HTMLAttributes } from "react";

type GlassPanelProps = HTMLAttributes<HTMLDivElement> & {
  tier?: 1 | 2 | 3;
};

function GlassPanelComponent({ tier = 2, className = "", ...props }: GlassPanelProps) {
  const tierClass = tier === 1 ? "glass-1" : tier === 2 ? "glass-2" : "glass-3";
  const mergedClassName = `${tierClass} ${className}`.trim();

  return <div className={mergedClassName} {...props} />;
}

export const GlassPanel = memo(GlassPanelComponent);
GlassPanel.displayName = "GlassPanel";
