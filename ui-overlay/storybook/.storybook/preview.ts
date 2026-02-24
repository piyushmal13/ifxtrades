import "../../tokens.css";
import "../../overlay.css";

import type { Preview } from "@storybook/html";

const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      disable: true
    },
    controls: {
      expanded: true
    },
    a11y: {
      test: "todo"
    }
  }
};

export default preview;

