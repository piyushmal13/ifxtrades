const test = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const OVERLAY_PATH = path.join(__dirname, "..", "overlay.js");
const OVERLAY_SOURCE = fs.readFileSync(OVERLAY_PATH, "utf8");

class ClassList {
  constructor() {
    this.values = new Set();
  }
  add(...tokens) {
    tokens.forEach((t) => this.values.add(t));
  }
  remove(...tokens) {
    tokens.forEach((t) => this.values.delete(t));
  }
  toggle(token, force) {
    if (force === true) {
      this.values.add(token);
      return true;
    }
    if (force === false) {
      this.values.delete(token);
      return false;
    }
    if (this.values.has(token)) {
      this.values.delete(token);
      return false;
    }
    this.values.add(token);
    return true;
  }
  contains(token) {
    return this.values.has(token);
  }
}

class FakeElement {
  constructor(name = "div") {
    this.name = name;
    this.attributes = new Map();
    this.classList = new ClassList();
    this.children = [];
    this.style = {};
    this.parentNode = null;
    this.textContent = "";
  }
  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }
  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }
  hasAttribute(name) {
    return this.attributes.has(name);
  }
  removeAttribute(name) {
    this.attributes.delete(name);
  }
  appendChild(node) {
    if (node) node.parentNode = this;
    this.children.push(node);
    return node;
  }
  removeChild(node) {
    const index = this.children.indexOf(node);
    if (index >= 0) this.children.splice(index, 1);
  }
  querySelectorAll() {
    return [];
  }
  querySelector() {
    return null;
  }
  closest() {
    return null;
  }
  focus() {}
  get offsetWidth() {
    return 1;
  }
  get offsetHeight() {
    return 1;
  }
  getClientRects() {
    return [1];
  }
}

function buildHarness(options = {}) {
  const listeners = new Map();

  function addListener(type, handler) {
    if (!listeners.has(type)) listeners.set(type, []);
    listeners.get(type).push(handler);
  }

  function dispatchEvent(type, event = {}) {
    const handlers = listeners.get(type) || [];
    handlers.forEach((fn) => fn(event));
  }

  const documentElement = new FakeElement("html");
  const body = new FakeElement("body");
  let activeElement = body;

  const document = {
    readyState: "complete",
    documentElement,
    body,
    activeElement,
    createElement: () => new FakeElement(),
    addEventListener: addListener,
    dispatchEvent: (evt) => dispatchEvent(evt.type, evt),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null
  };

  const location = { search: options.search || "" };

  const windowObj = {
    document,
    location,
    __IFX_FEATURE_FLAGS__: options.flags || {},
    __IFX_UI_OVERLAY_SETTINGS__: options.settings || {
      theme: "dark",
      motion: "off",
      enableHeroReveal: false,
      enableModalA11y: false,
      enableToasts: false
    },
    localStorage: {
      getItem(key) {
        if (key === "ifx.flag.feature/ui_overlay_v1") {
          return options.localStorageFlag ?? null;
        }
        return null;
      }
    },
    matchMedia() {
      return { matches: false };
    },
    setTimeout(fn) {
      if (typeof fn === "function") fn();
      return 1;
    },
    requestAnimationFrame(fn) {
      if (typeof fn === "function") fn();
      return 1;
    },
    dispatchEvent() {},
    addEventListener: addListener,
    URLSearchParams,
    CustomEvent: class CustomEvent {
      constructor(type, detail) {
        this.type = type;
        this.detail = detail;
      }
    },
    IFXOverlay: {}
  };

  const context = vm.createContext({
    window: windowObj,
    document,
    URLSearchParams,
    CustomEvent: windowObj.CustomEvent,
    requestAnimationFrame: windowObj.requestAnimationFrame,
    IntersectionObserver: undefined,
    setTimeout: windowObj.setTimeout,
    clearTimeout: () => {},
    console
  });

  return { context, documentElement, body, dispatchEvent };
}

function runOverlay(harness) {
  vm.runInContext(OVERLAY_SOURCE, harness.context, { filename: "overlay.js" });
}

test("overlay stays inactive when feature/ui_overlay_v1 is false", () => {
  const harness = buildHarness({
    flags: { "feature/ui_overlay_v1": false }
  });

  runOverlay(harness);

  assert.equal(harness.documentElement.classList.contains("ifx-ui-overlay"), false);
  assert.equal(harness.body.classList.contains("ifx-ui-overlay"), false);
});

test("overlay activates when feature/ui_overlay_v1 is true", () => {
  const harness = buildHarness({
    flags: { "feature/ui_overlay_v1": true }
  });

  runOverlay(harness);

  assert.equal(harness.documentElement.classList.contains("ifx-ui-overlay"), true);
  assert.equal(harness.body.classList.contains("ifx-ui-overlay"), true);
  assert.equal(harness.documentElement.getAttribute("data-ifx-overlay"), "v1");
});

