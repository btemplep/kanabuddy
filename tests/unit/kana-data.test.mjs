/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Unit tests for the kana data layer (src/js/kana-data.js).
// Run with: node --test

import assert from "node:assert/strict";
import { test } from "node:test";

import { loadQuizHarness } from "../helpers/dom-stub.mjs";


test("hiragana main set has 46 kana", function () {
    const h = loadQuizHarness();
    const count = h.evalInContext("KANA_DATA.hiragana.main.length");
    assert.equal(count, 46);
});


test("hiragana dakuten set has 25 kana", function () {
    const h = loadQuizHarness();
    assert.equal(h.evalInContext("KANA_DATA.hiragana.dakuten.length"), 25);
});


test("katakana combo (yoon) set has 33 kana", function () {
    const h = loadQuizHarness();
    assert.equal(h.evalInContext("KANA_DATA.katakana.combo.length"), 33);
});


test("buildDeck combines selected scripts and groups", function () {
    const h = loadQuizHarness();
    const size = h.evalInContext(
        "buildDeck({ hiragana: ['main'], katakana: ['dakuten'] }).length"
    );
    // 46 hiragana main + 25 katakana dakuten
    assert.equal(size, 71);
});


test("buildDeck with an empty selection yields an empty deck", function () {
    const h = loadQuizHarness();
    const size = h.evalInContext("buildDeck({ hiragana: [], katakana: [] }).length");
    assert.equal(size, 0);
});


test("buildDeck entries carry kana, romaji, script, and group", function () {
    const h = loadQuizHarness();
    const entry = h.evalInContext("buildDeck({ hiragana: ['main'], katakana: [] })[0]");
    assert.ok(typeof entry.kana === "string" && entry.kana.length > 0);
    assert.ok(Array.isArray(entry.romaji) && entry.romaji.length > 0);
    assert.equal(entry.script, "hiragana");
    assert.equal(entry.group, "main");
});


test("shuffle preserves all elements (no loss or duplication)", function () {
    const h = loadQuizHarness();
    const result = h.evalInContext(
        "shuffle([1,2,3,4,5,6,7,8]).slice().sort(function (a, b) { return a - b; }).join(',')"
    );
    assert.equal(result, "1,2,3,4,5,6,7,8");
});


test("multiple romaji spellings are accepted for shi", function () {
    const h = loadQuizHarness();
    const romaji = h.evalInContext(
        "KANA_DATA.hiragana.main.find(function (e) { return e.kana === 'し'; }).romaji"
    );
    assert.ok(romaji.includes("shi"));
    assert.ok(romaji.includes("si"));
});


test("FONT_OPTIONS exposes the expected font ids", function () {
    const h = loadQuizHarness();
    const ids = h.evalInContext("FONT_OPTIONS.map(function (f) { return f.id; })");
    ["sans", "mincho", "rounded", "kaisei", "yuji", "klee", "hachimaru"].forEach(function (id) {
        assert.ok(ids.includes(id), "missing font id: " + id);
    });
    // Removed fonts should not reappear.
    assert.ok(!ids.includes("shippori"));
    assert.ok(!ids.includes("zenantique"));
});


test("GROUP_LABELS covers main, dakuten, and combo", function () {
    const h = loadQuizHarness();
    const labels = h.evalInContext("GROUP_LABELS");
    assert.ok(labels.main);
    assert.ok(labels.dakuten);
    assert.ok(labels.combo);
});
