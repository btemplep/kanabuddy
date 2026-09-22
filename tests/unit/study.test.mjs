/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Unit tests for the study/reference page (src/js/study.js).
// Run with: node --test

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { test } from "node:test";

import { makeEl } from "../helpers/dom-stub.mjs";


const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC_JS = path.join(HERE, "..", "..", "src", "js");


// Recursively collect elements matching a class under a node.
function collectByClass(node, cls, out) {
    out = out || [];
    (node.children || []).forEach(function (child) {
        if (child._classes && child._classes.has(cls)) {
            out.push(child);
        }
        collectByClass(child, cls, out);
    });

    return out;
}


function findByClass(node, cls) {
    if (node._classes && node._classes.has(cls)) {
        return node;
    }
    const kids = node.children || [];
    for (const child of kids) {
        const found = findByClass(child, cls);
        if (found) {
            return found;
        }
    }

    return null;
}


// Load kana-data.js + study.js into a VM with the elements the study page
// needs (including the custom font dropdown scaffolding), then fire
// DOMContentLoaded and return handles.
function loadStudy() {
    const ids = [
        "study-content",
        "study-tabs",
        "reset-romaji-btn",
        "hide-romaji-btn",
        "font-dropdown",
        "font-toggle",
        "font-toggle-label",
        "font-options",
        "random-choice",
        "random-sample"
    ];
    const store = {};
    ids.forEach(function (id) {
        store[id] = makeEl();
    });

    // Font dropdown scaffolding, mirroring study.html.
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

    // content.querySelectorAll(".study-tile") for hideAllRomaji.
    store["study-content"].querySelectorAll = function (sel) {
        if (sel.includes("study-tile")) {
            return collectByClass(store["study-content"], "study-tile");
        }

        return [];
    };

    // Track the checked font radio so selectedFontMode() works.
    let checkedFont = null;

    let domReady = null;
    const docListeners = {};
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
                return checkedFont;
            }

            return null;
        },
        querySelectorAll() {
            return [];
        },
        addEventListener(ev, cb) {
            if (ev === "DOMContentLoaded") {
                domReady = cb;
            } else {
                (docListeners[ev] = docListeners[ev] || []).push(cb);
            }
        }
    };
    const windowObj = {
        innerHeight: 800
    };
    const sandbox = { document, window: windowObj, console, Math };
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "kana-data.js"), "utf8"), sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "font-dropdown.js"), "utf8"), sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "study.js"), "utf8"), sandbox);
    if (domReady) {
        domReady();
    }

    return {
        store,
        randomInput,
        setChecked(el) {
            checkedFont = el;
        },
        evalInContext(expr) {
            return vm.runInContext(expr, sandbox);
        }
    };
}


test("study page renders a tile for every kana in the data", function () {
    const study = loadStudy();
    const expected = study.evalInContext(
        "['hiragana','katakana'].reduce(function (sum, s) {" +
        "  return sum + ['main','dakuten','combo'].reduce(function (n, g) {" +
        "    return n + ((KANA_DATA[s] && KANA_DATA[s][g]) || []).length;" +
        "  }, 0);" +
        "}, 0)"
    );
    const tiles = collectByClass(study.store["study-content"], "study-tile");
    assert.equal(tiles.length, expected);
});


test("study tiles show kana and its romaji", function () {
    const study = loadStudy();
    const firstHiragana = study.evalInContext("KANA_DATA.hiragana.main[0]");
    const tiles = collectByClass(study.store["study-content"], "study-tile");
    const first = tiles[0];

    assert.equal(findByClass(first, "study-kana").textContent, firstHiragana.kana);
    assert.equal(findByClass(first, "study-romaji").textContent, firstHiragana.romaji[0]);
});


test("kana appear in gojuon order (a, i, u, e, o, ...)", function () {
    const study = loadStudy();
    const tiles = collectByClass(study.store["study-content"], "study-tile");
    const firstFive = tiles.slice(0, 5).map(function (t) {
        return findByClass(t, "study-romaji").textContent;
    });
    assert.deepEqual(firstFive, ["a", "i", "u", "e", "o"]);
});


test("study page renders a tab for each script, first one active", function () {
    const study = loadStudy();
    const tabs = collectByClass(study.store["study-tabs"], "study-tab");
    assert.equal(tabs.length, 2);
    assert.deepEqual(
        tabs.map(function (t) {
            return t.textContent;
        }),
        ["Hiragana", "Katakana"]
    );
    assert.ok(tabs[0]._classes.has("active"));
    assert.ok(!tabs[1]._classes.has("active"));
});


test("clicking a tab switches the visible script", function () {
    const study = loadStudy();
    const tabs = collectByClass(study.store["study-tabs"], "study-tab");
    const blocks = study.store["study-content"].children;

    tabs[1].dispatch("click");
    assert.equal(blocks[0].hidden, true);
    assert.equal(blocks[1].hidden, false);

    tabs[0].dispatch("click");
    assert.equal(blocks[0].hidden, false);
    assert.equal(blocks[1].hidden, true);
});


// ---- Romaji reveal / reset ----

test("romaji is shown by default on every tile", function () {
    const study = loadStudy();
    const tiles = collectByClass(study.store["study-content"], "study-tile");
    assert.ok(tiles.every(function (t) {
        return !t._classes.has("romaji-hidden");
    }), "no tile starts hidden");
    assert.ok(tiles.every(function (t) {
        return t.getAttribute("aria-pressed") === "true";
    }));
});


test("clicking a tile hides its romaji, clicking again shows it", function () {
    const study = loadStudy();
    const tile = collectByClass(study.store["study-content"], "study-tile")[0];

    tile.dispatch("click");
    assert.ok(tile._classes.has("romaji-hidden"), "hidden after first click");
    assert.equal(tile.getAttribute("aria-pressed"), "false");

    tile.dispatch("click");
    assert.ok(!tile._classes.has("romaji-hidden"), "shown again after second click");
    assert.equal(tile.getAttribute("aria-pressed"), "true");
});


test("the show-all button re-shows every hidden romaji", function () {
    const study = loadStudy();
    const tiles = collectByClass(study.store["study-content"], "study-tile");

    // Hide a few.
    tiles[0].dispatch("click");
    tiles[1].dispatch("click");
    tiles[2].dispatch("click");
    assert.ok(tiles[0]._classes.has("romaji-hidden"));

    study.store["reset-romaji-btn"].dispatch("click");
    assert.ok(tiles.every(function (t) {
        return !t._classes.has("romaji-hidden");
    }), "all shown after reset");
});


test("the hide-all button hides every romaji", function () {
    const study = loadStudy();
    const tiles = collectByClass(study.store["study-content"], "study-tile");

    // All shown by default.
    assert.ok(tiles.every(function (t) {
        return !t._classes.has("romaji-hidden");
    }));

    study.store["hide-romaji-btn"].dispatch("click");
    assert.ok(tiles.every(function (t) {
        return t._classes.has("romaji-hidden") && t.getAttribute("aria-pressed") === "false";
    }), "all hidden after hide-all");
});


// ---- Custom font dropdown ----

test("font dropdown is populated with all fonts plus a random option", function () {
    const study = loadStudy();
    const choices = collectByClass(study.store["font-options"], "font-choice");
    const fontCount = study.evalInContext("FONT_OPTIONS.length");
    // Each font adds a .font-choice; the random option is also a .font-choice.
    // renderFontOptions inserts font labels before the pre-existing random one.
    const names = collectByClass(study.store["font-options"], "font-name").map(function (n) {
        return n.textContent;
    });
    assert.equal(choices.length >= fontCount, true);
    assert.ok(names.length === fontCount, "one name per font option");
});


test("the font dropdown toggles open and closed", function () {
    const study = loadStudy();
    assert.equal(study.store["font-options"].hidden, true);
    study.store["font-toggle"].dispatch("click");
    assert.equal(study.store["font-options"].hidden, false);
    study.store["font-toggle"].dispatch("click");
    assert.equal(study.store["font-options"].hidden, true);
});


test("selecting a font sets the toggle label and closes the dropdown", function () {
    const study = loadStudy();
    const secondLabel = study.evalInContext("FONT_OPTIONS[1].label");

    study.store["font-toggle"].dispatch("click");
    // Find the radio for the second font and fire its change handler.
    const labels = collectByClass(study.store["font-options"], "font-choice");
    const targetLabel = labels.find(function (l) {
        const nameEl = findByClass(l, "font-name");

        return nameEl && nameEl.textContent === secondLabel;
    });
    const radio = targetLabel.children.find(function (c) {
        return c.tagName === "input";
    });
    radio.dispatch("change");

    assert.equal(study.store["font-toggle-label"].textContent, secondLabel);
    assert.equal(study.store["font-options"].hidden, true);
});


test("selecting a font applies its stack to the kana glyphs", function () {
    const study = loadStudy();
    const targetStack = study.evalInContext("FONT_OPTIONS[1].stack");
    const targetLabelText = study.evalInContext("FONT_OPTIONS[1].label");

    const labels = collectByClass(study.store["font-options"], "font-choice");
    const targetLabel = labels.find(function (l) {
        const nameEl = findByClass(l, "font-name");

        return nameEl && nameEl.textContent === targetLabelText;
    });
    const radio = targetLabel.children.find(function (c) {
        return c.tagName === "input";
    });
    radio.dispatch("change");

    const glyph = findByClass(study.store["study-content"], "study-kana");
    assert.equal(glyph.style.fontFamily, targetStack);
});
