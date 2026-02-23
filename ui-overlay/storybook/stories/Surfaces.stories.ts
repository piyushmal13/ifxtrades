import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "IFX Overlay/Surfaces",
  tags: ["autodocs"],
  render: () => `
    <div class="ifx-ui-overlay" data-theme="dark" style="padding: 32px; background: var(--ifx-color-bg); min-height: 100vh;">
      <div class="ifx-u-container ifx-u-stack-lg">
        <section class="ifx-hero" data-testid="ifx-overlay-hero">
          <div data-ifx-hero-reveal class="ifx-u-stack">
            <span class="ifx-hero__eyebrow">Institutional Capital Intelligence</span>
            <h1>Enterprise-grade market clarity for decision makers.</h1>
            <p>Refined data surfaces, trusted execution, and real-time strategic insight.</p>
            <div class="ifx-u-cluster">
              <button class="ifx-btn ifx-btn--primary">Request Demo</button>
              <button class="ifx-btn ifx-btn--secondary">Explore Platform</button>
            </div>
          </div>
        </section>

        <section class="ifx-u-grid-3">
          <article class="ifx-card ifx-card--e1">
            <h3>Deal Flow</h3>
            <p>Curated institutional opportunities with confidence scoring.</p>
          </article>
          <article class="ifx-card ifx-card--e2">
            <h3>Risk Lens</h3>
            <p>Scenario-driven views for drawdown and liquidity stress.</p>
          </article>
          <article class="ifx-card ifx-card--e3">
            <h3>Execution</h3>
            <p>High-signal actions linked directly to governance workflows.</p>
          </article>
        </section>

        <section class="ifx-table-wrap">
          <table class="ifx-table">
            <thead>
              <tr>
                <th data-ifx-sortable aria-sort="none">Asset</th>
                <th data-ifx-sortable aria-sort="descending">Signal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>Macro FX Basket</td><td>0.82</td><td>Active</td></tr>
              <tr><td>Rates Dispersion</td><td>0.71</td><td>Watch</td></tr>
              <tr><td>Credit Rotation</td><td>0.65</td><td>Review</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  `
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const HeroCardsTable: Story = {};

