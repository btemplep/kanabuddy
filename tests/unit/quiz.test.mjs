/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Unit tests for the quiz behavior (src/js/quiz.js).
// Run with: node --test

import assert from "node:assert/strict";
import { test } from "node:test";

import { loadQuizHarness } from "../helpers/dom-stub.mjs";


// Start a quiz and return the harness with cells mapped.
function startedQuiz(fontValue) {
    const h = loadQuizHarness(fontValue);
    h.fireDomReady();
    h.startQuiz();

    return h;
}


function pressEnter(input) {
    input.dispatch("keydown", { key: "Enter", preventDefault() {} });
}


test("starting a quiz builds a non-empty grid of cells", function () {
    const h = startedQuiz();
    assert.ok(h.grid.children.length > 0);
});


test("a correct answer turns the cell green, locks it, and advances focus", function () {
    const h = startedQuiz();
    const first = h.cells["0"];
    const before = h.cells["1"].input._focusCount;

    first.input.value = h.romajiFor(first.kana)[0];
    pressEnter(first.input);

    assert.ok(first.cell.classList.contains("correct"), "cell should be green");
    assert.equal(first.input.readOnly, true, "input should be locked");
    assert.ok(h.cells["1"].input._focusCount > before, "focus should advance");
});


test("a wrong Enter clears the box and shows the attempt as placeholder", function () {
    const h = startedQuiz();
    const cell = h.cells["0"];

    cell.input.value = "zzz";
    pressEnter(cell.input);

    assert.ok(cell.cell.classList.contains("wrong"), "cell should be red");
    assert.equal(cell.input.value, "", "value should be cleared");
    assert.equal(cell.input.placeholder, "zzz", "attempt shown as shadow text");
});


test("a wrong Enter does NOT synchronously advance to the next box", function () {
    const h = startedQuiz();
    const next = h.cells["1"].input._focusCount;

    h.cells["0"].input.value = "zzz";
    pressEnter(h.cells["0"].input);

    assert.equal(h.cells["1"].input._focusCount, next, "next box must not be focused");
});


// NOTE: The deferred pull-back is temporarily disabled while testing whether
// enterkeyhint="done" alone prevents the mobile jump. This test asserts the
// current (disabled) behavior; re-enable the assertions below along with the
// setTimeout block in quiz.js when the pull-back is restored.
test("wrong Enter does not schedule a deferred re-focus (pull-back disabled)", function () {
    const h = startedQuiz();
    const box = h.cells["0"];
    const before = box.input._focusCount;

    box.input.value = "zzz";
    pressEnter(box.input);

    assert.equal(h.timers.length, 0, "no deferred re-focus while disabled");
    assert.equal(box.input._focusCount, before, "no synchronous re-focus");

    // When re-enabled, the following should hold:
    // assert.ok(h.timers.length > 0, "a deferred re-focus should be scheduled");
    // h.cells["1"].input._focusCount += 1; // simulate native mobile jump
    // h.runTimers();
    // assert.ok(box.input._focusCount > before, "deferred tick re-focuses same box");
});


test("wrong on blur sets the shadow but does NOT re-focus (deliberate tap respected)", function () {
    const h = startedQuiz();
    const cell = h.cells["2"];
    const before = cell.input._focusCount;

    cell.input.value = "qqq";
    cell.input.dispatch("blur");

    assert.equal(cell.input.placeholder, "qqq", "attempt shown as shadow text");
    assert.equal(cell.input.value, "", "value cleared");
    assert.equal(h.timers.length, 0, "no deferred re-focus scheduled on blur");
    assert.equal(cell.input._focusCount, before, "focus not pulled back on blur");
});


test("the mobile insertLineBreak action grades like Enter", function () {
    const h = startedQuiz();
    const box = h.cells["0"];

    box.input.value = "zzz";
    box.input.dispatch("beforeinput", { inputType: "insertLineBreak", preventDefault() {} });

    // Still grades the box (marks wrong, clears value, shows shadow); the
    // deferred pull-back is disabled for now, so no timer is scheduled.
    assert.ok(box.cell.classList.contains("wrong"), "cell marked wrong");
    assert.equal(box.input.value, "", "value cleared");
    assert.equal(box.input.placeholder, "zzz", "attempt shown as shadow text");
    assert.equal(h.timers.length, 0, "no deferred re-focus while disabled");
});


test("inputs carry enterkeyhint=done and inputmode for mobile", function () {
    const h = startedQuiz();
    const input = h.cells["0"].input;
    assert.equal(input.getAttribute("enterkeyhint"), "done");
    assert.equal(input.getAttribute("inputmode"), "latin");
});


test("finishing computes correct / wrong / missing and a breakdown", function () {
    const h = startedQuiz();
    const total = h.grid.children.length;

    // index 0 correct, index 1 wrong, the rest left missing.
    h.cells["0"].input.value = h.romajiFor(h.cells["0"].kana)[0];
    pressEnter(h.cells["0"].input);
    h.cells["1"].input.value = "zzz";
    pressEnter(h.cells["1"].input);

    h.store["finish-btn"].dispatch("click");

    assert.equal(h.store["summary-correct"].textContent, "1");
    assert.equal(h.store["summary-wrong"].textContent, "1");
    assert.equal(h.store["summary-missing"].textContent, String(total - 2));
    assert.equal(h.store["breakdown-list"].children.length, total);
});


test("breakdown wrong row shows the given answer and the correct answer", function () {
    const h = startedQuiz();
    const correctAnswer = h.romajiFor(h.cells["1"].kana)[0];

    h.cells["1"].input.value = "zzz";
    pressEnter(h.cells["1"].input);
    h.store["finish-btn"].dispatch("click");

    const row = h.store["breakdown-list"].children[1];
    assert.ok(row.classList.contains("wrong"), "row flagged wrong");
    const given = row.children.find(function (c) {
        return c._classes && c._classes.has("bd-given");
    });
    const correct = row.children.find(function (c) {
        return c._classes && c._classes.has("bd-correct");
    });
    assert.equal(given.textContent, "zzz");
    assert.equal(correct.textContent, correctAnswer);
});


test("breakdown missing row shows a dash for the unattempted answer", function () {
    const h = startedQuiz();
    h.store["finish-btn"].dispatch("click");

    const row = h.store["breakdown-list"].children[0];
    assert.ok(row.classList.contains("missing"));
    const given = row.children.find(function (c) {
        return c._classes && c._classes.has("bd-given");
    });
    assert.equal(given.textContent, "—");
});


test("starting a quiz scrolls the page to the top", function () {
    const h = startedQuiz();
    const scrolls = h.window._scrolls || [];
    assert.ok(
        scrolls.some(function (s) {
            return s[0] === 0 && s[1] === 0;
        }),
        "window.scrollTo(0, 0) should be called on start"
    );
});


test("the font dropdown toggles open and closed", function () {
    const h = loadQuizHarness();
    h.fireDomReady();

    assert.equal(h.store["font-options"].hidden, true, "starts closed");
    h.store["font-toggle"].dispatch("click");
    assert.equal(h.store["font-options"].hidden, false, "opens on toggle");
    h.store["font-toggle"].dispatch("click");
    assert.equal(h.store["font-options"].hidden, true, "closes on second toggle");
});


test("clicking the already-selected font still closes the dropdown", function () {
    const h = loadQuizHarness();
    h.fireDomReady();

    h.store["font-toggle"].dispatch("click");
    assert.equal(h.store["font-options"].hidden, false);

    // Simulate clicking an option (delegated click handler on the panel).
    const optionLabel = h.store["font-options"].children.find(function (c) {
        return c.tagName === "label" && c !== h.store["random-choice"];
    });
    const radio = optionLabel.children.find(function (c) {
        return c.tagName === "input";
    });
    h.store["font-options"].dispatch("click", { target: radio });

    assert.equal(h.store["font-options"].hidden, true, "closes when an option is clicked");
});


test("clicking the dropdown panel padding (not an option) keeps it open", function () {
    const h = loadQuizHarness();
    h.fireDomReady();

    h.store["font-toggle"].dispatch("click");
    h.store["font-options"].dispatch("click", { target: h.store["font-options"] });

    assert.equal(h.store["font-options"].hidden, false, "stays open on non-option click");
});
