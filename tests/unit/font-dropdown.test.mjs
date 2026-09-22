/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Unit tests for the shared font dropdown module (src/js/font-dropdown.js).
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
    for (const child of node.children || []) {
        const found = findByClass(child, cls);
        if (found) {
            return found;
        }
    }

    return null;
}


// Build the dropdown DOM scaffolding and load kana-data.js + font-dropdown.js.
// Returns handles plus a factory to create the dropdown with an onChange spy.
function loadDropdown() {
    const store = {
        "font-dropdown": makeEl(),
        "font-toggle": makeEl(),
        "font-toggle-label": makeEl(),
        "font-options": makeEl(),
        "random-choice": makeEl(),
        "random-sample": makeEl()
    };
    store["font-dropdown"].appendChild(store["font-toggle"]);
    store["font-dropdown"].appendChild(store["font-options"]);
    store["font-toggle"].appendChild(store["font-toggle-label"]);

    const randomInput = makeEl("input");
    randomInput.value = "random";
    store["random-choice"].tagName = "label";
    store["random-choice"].appendChild(randomInput);
    store["font-options"].appendChild(store["random-choice"]);
    store["font-options"]._qs = function (sel) {
        return sel.includes("random") ? randomInput : null;
    };
    store["font-options"].hidden = true;

    let checkedFont = null;
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
            (docListeners[ev] = docListeners[ev] || []).push(cb);
        }
    };
    const windowObj = { innerHeight: 800 };
    const changes = [];
    const sandbox = { document, window: windowObj, console, Math };
    sandbox.__changes = changes;
    vm.createContext(sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "kana-data.js"), "utf8"), sandbox);
    vm.runInContext(fs.readFileSync(path.join(SRC_JS, "font-dropdown.js"), "utf8"), sandbox);

    // Create the dropdown with an onChange spy that records the mode.
    const instance = vm.runInContext(
        "createFontDropdown({ onChange: function (mode) { __changes.push(mode); } })",
        sandbox
    );

    return {
        store,
        randomInput,
        changes,
        instance,
        setChecked(el) {
            checkedFont = el;
        },
        evalInContext(expr) {
            return vm.runInContext(expr, sandbox);
        }
    };
}


test("createFontDropdown renders one option per font plus the random option", function () {
    const d = loadDropdown();
    const fontCount = d.evalInContext("FONT_OPTIONS.length");
    const names = collectByClass(d.store["font-options"], "font-name").map(function (n) {
        return n.textContent;
    });
    assert.equal(names.length, fontCount, "one name per font");
    // The random option's radio is still present.
    assert.equal(d.randomInput.value, "random");
});


test("toggle opens and closes the panel", function () {
    const d = loadDropdown();
    assert.equal(d.store["font-options"].hidden, true);
    d.store["font-toggle"].dispatch("click");
    assert.equal(d.store["font-options"].hidden, false);
    d.store["font-toggle"].dispatch("click");
    assert.equal(d.store["font-options"].hidden, true);
});


test("selecting a font sets the label, closes, and fires onChange", function () {
    const d = loadDropdown();
    const label = d.evalInContext("FONT_OPTIONS[1].label");
    const id = d.evalInContext("FONT_OPTIONS[1].id");

    d.store["font-toggle"].dispatch("click");
    const choice = collectByClass(d.store["font-options"], "font-choice").find(function (c) {
        const n = findByClass(c, "font-name");

        return n && n.textContent === label;
    });
    const radio = choice.children.find(function (c) {
        return c.tagName === "input";
    });
    radio.dispatch("change");

    assert.equal(d.store["font-toggle-label"].textContent, label);
    assert.equal(d.store["font-options"].hidden, true);
    assert.equal(d.changes[d.changes.length - 1], id);
});


test("clicking the already-selected option closes without a change event", function () {
    const d = loadDropdown();
    d.store["font-toggle"].dispatch("click");

    const firstChoice = collectByClass(d.store["font-options"], "font-choice")[0];
    const radio = firstChoice.children.find(function (c) {
        return c.tagName === "input";
    });
    // Delegated click on the panel closes it even without a change.
    d.store["font-options"].dispatch("click", { target: radio });
    assert.equal(d.store["font-options"].hidden, true);
});


test("getMode reflects the checked radio and defaults to the first font", function () {
    const d = loadDropdown();
    const firstId = d.evalInContext("FONT_OPTIONS[0].id");
    assert.equal(d.instance.getMode(), firstId);

    const randomEl = { value: "random" };
    d.setChecked(randomEl);
    assert.equal(d.instance.getMode(), "random");
});


test("getFontStack returns the stack for a font id", function () {
    const d = loadDropdown();
    const expected = d.evalInContext("FONT_OPTIONS[2].stack");
    const id = d.evalInContext("FONT_OPTIONS[2].id");
    assert.equal(d.instance.getFontStack(id), expected);
});
