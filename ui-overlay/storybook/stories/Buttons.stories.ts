import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "IFX Overlay/Buttons",
  tags: ["autodocs"],
  render: () => `
    <div class="ifx-ui-overlay" data-theme="dark" style="padding: 32px; background: var(--ifx-color-bg); min-height: 100vh;">
      <div class="ifx-u-stack-lg">
        <h2>Button System</h2>
        <div class="ifx-u-cluster">
          <button class="ifx-btn ifx-btn--primary">Primary CTA</button>
          <button class="ifx-btn ifx-btn--secondary">Secondary</button>
          <button class="ifx-btn ifx-btn--ghost">Ghost</button>
          <button class="ifx-btn ifx-btn--destructive">Destructive</button>
          <button class="ifx-btn ifx-btn--icon" aria-label="Refresh">&#8635;</button>
        </div>
        <div class="ifx-u-cluster">
          <button class="ifx-btn ifx-btn--primary ifx-btn--sm">Small</button>
          <button class="ifx-btn ifx-btn--primary">Medium</button>
          <button class="ifx-btn ifx-btn--primary ifx-btn--lg">Large</button>
          <button class="ifx-btn ifx-btn--primary" disabled>Disabled</button>
        </div>
      </div>
    </div>
  `
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = {};

