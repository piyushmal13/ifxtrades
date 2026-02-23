import type { Meta, StoryObj } from "@storybook/html";

const meta = {
  title: "IFX Overlay/Forms",
  tags: ["autodocs"],
  render: () => `
    <div class="ifx-ui-overlay" data-theme="dark" style="padding: 32px; background: var(--ifx-color-bg); min-height: 100vh;">
      <div class="ifx-u-container">
        <div class="ifx-card ifx-card--e1">
          <h3 style="margin-bottom: 16px;">Investor Onboarding</h3>
          <form class="ifx-u-stack">
            <div class="ifx-form-field">
              <label for="company">Company name</label>
              <input id="company" name="company" placeholder="IFX Capital Partners" required />
              <div data-ifx-help-for="company" class="ifx-help-text">Use legal entity name as in registration.</div>
            </div>
            <div class="ifx-form-field">
              <label for="email">Work email</label>
              <input id="email" type="email" placeholder="name@firm.com" required />
            </div>
            <div class="ifx-form-field">
              <label for="aum">AUM range</label>
              <select id="aum" required>
                <option value="">Select one</option>
                <option>$10M - $50M</option>
                <option>$50M - $250M</option>
                <option>$250M+</option>
              </select>
            </div>
            <div class="ifx-form-field">
              <label for="notes">Mandate notes</label>
              <textarea id="notes" placeholder="Strategies, sectors, and risk constraints"></textarea>
            </div>
            <div class="ifx-u-cluster">
              <button type="submit" class="ifx-btn ifx-btn--primary">Submit</button>
              <button type="button" class="ifx-btn ifx-btn--ghost">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FormStates: Story = {};

