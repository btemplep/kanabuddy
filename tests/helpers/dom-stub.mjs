/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Zero-dependency DOM stub and harness loader for the KanaBuddy test suite.
// The real site runs in a browser; these helpers provide just enough of the
// DOM/window surface for the app scripts to run under `node --test` without
// any external dependencies.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";


const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_JS = path.join(HERE, "..", "..", "src", "js");


function makeEl(tag) {
    const classes = new Set();
    const listeners = {};
    const el = {
        tagName: tag || "div",
        children: [],
        dataset: {},
        style: {},
        attributes: {},
        _text: "",
        value: "",
        placeholder: "",
        checked: false,
        readOnly: false,
        hidden: false,
        parentNode: null,
        _focusCount: 0,
        _listeners: listeners,
        appendChild(child) {
            this.children.push(child);
            if (child && typeof child === "object" && "parentNode" in child) {
                child.parentNode = this;
            }

            return child;
        },
        insertBefore(child) {
            this.children.push(child);
            if (child && typeof child === "object" && "parentNode" in child) {
                child.parentNode = this;
            }

            return child;
        },
        setAttribute(key, val) {
            this.attributes[key] = val;
        },
        getAttribute(key) {
            return this.attributes[key];
        },
        addEventListener(ev, cb) {
            listeners[ev] = cb;
        },
        dispatch(ev, payload) {
            if (listeners[ev]) {
                listeners[ev](payload || {});
            }
        },
        querySelector(sel) {
            return this._qs ? this._qs(sel) : null;
        },
        querySelectorAll() {
            return [];
        },
        closest(sel) {
            let node = this;
            while (node) {
                if (sel.includes("label") && node.tagName === "label") {
                    return node;
                }
                node = node.parentNode;
            }

            return null;
        },
        contains(node) {
            let cur = node;
            while (cur) {
                if (cur === this) {
                    return true;
                }
                cur = cur.parentNode;
            }

            return false;
        },
        getBoundingClientRect() {
            return this._rect || { top: 0, bottom: 0 };
        },
        focus() {
            this._focusCount += 1;
            if (listeners.focus) {
                listeners.focus({});
            }
        },
        select() {},
        get textContent() {
            return this._text;
        },
        set textContent(v) {
            this._text = v;
        },
        get innerHTML() {
            return "";
        },
        set innerHTML(v) {
            this.children = [];
        },
        get className() {
            return [...classes].join(" ");
        },
        set className(v) {
            classes.clear();
            String(v).split(/\s+/).filter(Boolean).forEach(function (c) {
                classes.add(c);
            });
        }
    };
    el.classList = {
        add(...c) {
            c.forEach(function (x) {
                classes.add(x);
            });
        },
        remove(...c) {
            c.forEach(function (x) {
                classes.delete(x);
            });
        },
        contains(x) {
            return classes.has(x);
        },
        toggle(x, force) {
            const on = force === undefined ? !classes.has(x) : force;
            if (on) {
                classes.add(x);
            } else {
                classes.delete(x);
            }

            return on;
        }
    };
    el._classes = classes;

    return el;
}


// The element IDs that quiz.js looks up via getElementById.
const ELEMENT_IDS = [
    "setup-view",
    "quiz-view",
    "hiragana-groups",
    "katakana-groups",
    "font-options",
    "font-dropdown",
    "font-toggle",
    "font-toggle-label",
    "setup-error",
    "start-btn",
    "quiz-progress",
    "quiz-progress-bottom",
    "restart-btn",
    "restart-btn-bottom",
    "finish-btn",
    "finish-btn-bottom",
    "kana-grid",
    "results-overlay",
    "results-percent",
    "results-detail",
    "summary-correct",
    "summary-wrong",
    "summary-missing",
    "breakdown-list",
    "results-review",
    "results-new",
    "random-sample",
    "random-choice"
];


// Load kana-data.js + quiz.js into a fresh VM context wired to a stub DOM.
// Returns handles the tests use to drive and inspect the app.
function loadQuizHarness(fontValue) {
    const store = {};
    ELEMENT_IDS.forEach(function (id) {
        store[id] = makeEl();
    });

    // Font dropdown scaffolding.
    const dropdown = store["font-dropdown"];
    dropdown.appendChild(store["font-toggle"]);
    dropdown.appendChild(store["font-options"]);
    store["font-toggle"].appendChild(store["font-toggle-label"]);

    const randomInput = makeEl("input");
    randomInput.value = "random";
    const randomLabel = store["random-choice"];
    randomLabel.tagName = "label";
    randomLabel.appendChild(randomInput);
    store["font-options"].appendChild(randomLabel);
    store["font-options"]._qs = function (sel) {
        return sel.includes("random") ? randomInput : null;
    };
    store["font-options"].hidden = true;

    // Grid cell lookups by data-index.
    const cells = {};
    store["kana-grid"]._qs = function (sel) {
        const match = sel.match(/data-index="(\d+)"/);
        if (!match) {
            return null;
        }
        const i = match[1];
        if (sel.includes("kana-cell")) {
            return cells[i] && cells[i].cell;
        }
        if (sel.includes("kana-input")) {
            return cells[i] && cells[i].input;
        }

        return null;
    };
    const grid = store["kana-grid"];
    grid.appendChild = function (child) {
        this.children.push(child);
    };
    Object.defineProperty(grid, "innerHTML", {
        set() {
            this.children = [];
        },
        get() {
            return "";
        }
    });

    // Selection: hiragana "main" checked; a chosen font radio.
    const hiraganaMain = makeEl("input");
    hiraganaMain.value = "main";
    hiraganaMain.dataset.script = "hiragana";
    hiraganaMain.checked = true;
    const checkedGroups = [hiraganaMain];

    const chosenFont = makeEl("input");
    chosenFont.value = fontValue || "sans";

    const docListeners = {};
    const timers = [];

    const document = {
        getElementById(id) {
            return store[id] || makeEl();
        },
        createElement: makeEl,
        createTextNode(t) {
            return { nodeType: 3, textContent: t, parentNode: null };
        },
        documentElement: { clientHeight: 800 },
        querySelector(sel) {
            if (sel.includes("random")) {
                return randomInput;
            }
            if (sel.includes(":checked")) {
                return chosenFont;
            }

            return null;
        },
        querySelectorAll(sel) {
            if (sel.includes("input:checked")) {
                return checkedGroups;
            }

            return [];
        },
        addEventListener(ev, cb) {
            if (ev === "DOMContentLoaded") {
                document._domReady = cb;
            } else {
                (docListeners[ev] = docListeners[ev] || []).push(cb);
            }
        }
    };

    const windowObj = {
        innerHeight: 800,
        scrollTo(x, y) {
            windowObj._scrolls = windowObj._scrolls || [];
            windowObj._scrolls.push([x, y]);
        }
    };

    const sandbox = {
        document,
        window: windowObj,
        Math,
        console,
        setTimeout(cb) {
            timers.push(cb);

            return timers.length;
        }
    };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "kana-data.js"), "utf8"), sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "quiz.js"), "utf8"), sandbox);

    function fireDomReady() {
        if (document._domReady) {
            document._domReady();
        }
    }

    function startQuiz() {
        store["start-btn"].dispatch("click");
        mapCells();
    }

    function mapCells() {
        grid.children.forEach(function (cell) {
            const idx = cell.dataset.index;
            const input = cell.children.find(function (ch) {
                return ch.dataset && ch.dataset.index === idx && ch.tagName === "input";
            });
            const charEl = cell.children.find(function (ch) {
                return ch._classes && ch._classes.has("kana-char");
            });
            cell._qs = function (sel) {
                return sel.includes("kana-input") ? input : null;
            };
            cells[idx] = {
                cell: cell,
                input: input,
                kana: charEl ? charEl._text : ""
            };
        });
    }

    function evalInContext(expr) {
        return vm.runInContext(expr, sandbox);
    }

    function romajiFor(kana) {
        const data = evalInContext("KANA_DATA");
        const scripts = ["hiragana", "katakana"];
        const groups = ["main", "dakuten", "combo"];
        for (const script of scripts) {
            for (const group of groups) {
                const list = (data[script] && data[script][group]) || [];
                const entry = list.find(function (e) {
                    return e.kana === kana;
                });
                if (entry) {
                    return entry.romaji;
                }
            }
        }

        return null;
    }

    function runTimers() {
        const pending = timers.slice();
        timers.length = 0;
        pending.forEach(function (fn) {
            fn();
        });
    }

    return {
        store,
        cells,
        grid,
        randomInput,
        timers,
        window: windowObj,
        docListeners,
        fireDomReady,
        startQuiz,
        mapCells,
        evalInContext,
        romajiFor,
        runTimers
    };
}


export {
    makeEl,
    loadQuizHarness
};
