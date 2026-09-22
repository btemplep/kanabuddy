/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */ 
// KanaBuddy quiz logic.
// Relies on globals from kana-data.js:
//   KANA_DATA, GROUP_LABELS, FONT_OPTIONS, buildDeck, shuffle

(function () {
    "use strict";

    const GROUP_ORDER = ["main", "dakuten", "combo"];

    const setupView = document.getElementById("setup-view");
    const quizView = document.getElementById("quiz-view");
    const hiraganaGroups = document.getElementById("hiragana-groups");
    const katakanaGroups = document.getElementById("katakana-groups");
    const setupError = document.getElementById("setup-error");
    const startBtn = document.getElementById("start-btn");

    const quizProgress = document.getElementById("quiz-progress");
    const quizProgressBottom = document.getElementById("quiz-progress-bottom");
    const finishBtn = document.getElementById("finish-btn");
    const finishBtnBottom = document.getElementById("finish-btn-bottom");
    const kanaGrid = document.getElementById("kana-grid");

    const resultsOverlay = document.getElementById("results-overlay");
    const resultsPercent = document.getElementById("results-percent");
    const resultsDetail = document.getElementById("results-detail");
    const summaryCorrect = document.getElementById("summary-correct");
    const summaryWrong = document.getElementById("summary-wrong");
    const summaryMissing = document.getElementById("summary-missing");
    const breakdownList = document.getElementById("breakdown-list");
    const resultsReview = document.getElementById("results-review");
    const resultsNew = document.getElementById("results-new");

    // Per-quiz state.
    let deck = [];
    // cellState[i] = { firstAttempt: null|true|false, solved: bool, attempted: bool }
    let cellState = [];
    // Shared font dropdown instance (created in init).
    let fontDropdown = null;

    function renderGroupChecks(container, script) {
        GROUP_ORDER.forEach(function (group) {
            const id = script + "-" + group;
            const row = document.createElement("label");
            row.className = "check-row";

            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = group;
            input.dataset.script = script;
            input.id = id;
            if (group === "main") {
                input.checked = true;
            }

            const span = document.createElement("span");
            span.textContent = GROUP_LABELS[group];

            row.appendChild(input);
            row.appendChild(span);
            container.appendChild(row);
        });
    }

    function readSelection() {
        const selection = {
            hiragana: [],
            katakana: []
        };
        const checked = document.querySelectorAll(
            "#hiragana-groups input:checked, #katakana-groups input:checked"
        );
        checked.forEach(function (input) {
            selection[input.dataset.script].push(input.value);
        });

        return selection;
    }

    function normalize(value) {
        return value.trim().toLowerCase().replace(/\s+/g, "");
    }

    function isCorrect(entry, value) {
        const answer = normalize(value);
        if (answer === "") {
            return false;
        }

        return entry.romaji.some(function (accepted) {
            return accepted.toLowerCase() === answer;
        });
    }

    function focusInput(index, preventScroll) {
        if (index < 0 || index >= deck.length) {
            return;
        }
        const input = kanaGrid.querySelector('.kana-input[data-index="' + index + '"]');
        if (input) {
            try {
                input.focus({ preventScroll: preventScroll === true });
            } catch (err) {
                // Older browsers may not support the options object.
                input.focus();
            }
            input.select();
        }
    }

    function nextUnsolved(fromIndex) {
        for (let i = fromIndex + 1; i < deck.length; i++) {
            if (!cellState[i].solved) {
                return i;
            }
        }
        // Wrap around to catch any earlier unsolved cells.
        for (let j = 0; j <= fromIndex; j++) {
            if (!cellState[j].solved) {
                return j;
            }
        }

        return -1;
    }

    function updateProgress() {
        let solved = 0;
        cellState.forEach(function (state) {
            if (state.solved) {
                solved++;
            }
        });
        quizProgress.textContent = "Solved " + solved + " / " + deck.length;
        if (quizProgressBottom) {
            quizProgressBottom.textContent = "Solved " + solved + " / " + deck.length;
        }
    }

    function gradeCell(index, options) {
        const focusNext = !options || options.focusNext !== false;
        const cell = kanaGrid.querySelector('.kana-cell[data-index="' + index + '"]');
        const input = cell.querySelector(".kana-input");
        const entry = deck[index];
        const correct = isCorrect(entry, input.value);

        if (cellState[index].firstAttempt === null) {
            cellState[index].firstAttempt = correct;
            cellState[index].firstAnswer = input.value.trim();
        }
        cellState[index].attempted = true;

        cell.classList.remove("correct", "wrong");
        if (correct) {
            cell.classList.add("correct");
            cellState[index].solved = true;
            input.value = entry.romaji[0];
            input.readOnly = true;
            updateProgress();

            const allSolved = cellState.every(function (state) {
                return state.solved;
            });
            if (allSolved) {
                // Every box is filled in correctly — show the results.
                showResults();
            } else if (focusNext) {
                const next = nextUnsolved(index);
                if (next !== -1) {
                    focusInput(next);
                }
            }
        } else {
            cell.classList.add("wrong");
            // Show the attempted answer as shadow (placeholder) text and clear
            // the field so the user can retype.
            const attempt = input.value.trim();
            if (attempt !== "") {
                input.placeholder = attempt;
            }
            input.value = "";
        }
    }

    function buildCells(fontMode) {
        kanaGrid.innerHTML = "";
        deck.forEach(function (entry, index) {
            const cell = document.createElement("div");
            cell.className = "kana-cell";
            cell.dataset.index = String(index);

            const char = document.createElement("div");
            char.className = "kana-char";
            char.textContent = entry.kana;
            if (fontMode === "random") {
                const pick = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)];
                char.style.fontFamily = pick.stack;
            } else {
                char.style.fontFamily = fontDropdown.getFontStack(fontMode);
            }

            const input = document.createElement("input");
            input.type = "text";
            input.className = "kana-input";
            input.dataset.index = String(index);
            input.setAttribute("autocomplete", "off");
            input.setAttribute("autocapitalize", "off");
            input.setAttribute("autocorrect", "off");
            input.setAttribute("spellcheck", "false");
            // Prefer a "done" action key on mobile rather than "next", which
            // would otherwise jump to the following field on a wrong answer.
            input.setAttribute("enterkeyhint", "done");
            input.setAttribute("aria-label", "Romaji for " + entry.kana);

            input.addEventListener("keydown", function (event) {
                if (event.key === "Enter") {
                    event.preventDefault();
                    if (!cellState[index].solved) {
                        gradeCell(index);
                    } else {
                        const next = nextUnsolved(index);
                        if (next !== -1) {
                            focusInput(next);
                        }
                    }
                }
            });

            input.addEventListener("input", function () {
                // Clear a previous "wrong" state as the user edits.
                if (!cellState[index].solved) {
                    cell.classList.remove("wrong");
                }
            });

            input.addEventListener("blur", function () {
                // Evaluate when the user clicks/tabs away, but only if they
                // typed something. Don't steal focus back to another cell.
                if (!cellState[index].solved && input.value.trim() !== "") {
                    gradeCell(index, { focusNext: false });
                }
            });

            cell.appendChild(char);
            cell.appendChild(input);
            kanaGrid.appendChild(cell);
        });
    }

    function startQuiz() {
        const selection = readSelection();
        const rawDeck = buildDeck(selection);

        if (rawDeck.length === 0) {
            setupError.textContent = "Select at least one kana group to begin.";

            return;
        }
        setupError.textContent = "";

        deck = shuffle(rawDeck);
        cellState = deck.map(function () {
            return {
                firstAttempt: null,
                firstAnswer: "",
                solved: false,
                attempted: false
            };
        });

        buildCells(fontDropdown.getMode());
        updateProgress();

        setupView.classList.add("hidden");
        quizView.classList.remove("hidden");
        resultsOverlay.classList.remove("open");

        // Reset the page to the top so the quiz starts in view, even if the
        // user had scrolled down on the setup screen. Focus without scrolling
        // so it doesn't fight the reset (mobile focus can auto-scroll).
        focusInput(0, true);
        window.scrollTo(0, 0);
    }

    function computeResults() {
        let correct = 0;
        let wrong = 0;
        let missing = 0;
        const breakdown = [];

        deck.forEach(function (entry, index) {
            const state = cellState[index];
            let status;
            if (state.firstAttempt === true) {
                status = "correct";
                correct++;
            } else if (state.firstAttempt === false) {
                status = "wrong";
                wrong++;
            } else {
                status = "missing";
                missing++;
            }

            breakdown.push({
                kana: entry.kana,
                given: state.firstAnswer || "",
                correctAnswer: entry.romaji[0],
                allAnswers: entry.romaji,
                status: status
            });
        });

        const total = deck.length;
        const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

        return {
            correct: correct,
            wrong: wrong,
            missing: missing,
            total: total,
            percent: percent,
            breakdown: breakdown
        };
    }


    function renderBreakdown(breakdown) {
        breakdownList.innerHTML = "";
        breakdown.forEach(function (item) {
            const row = document.createElement("div");
            row.className = "breakdown-row " + item.status;

            const kana = document.createElement("span");
            kana.className = "bd-kana";
            kana.textContent = item.kana;

            const given = document.createElement("span");
            given.className = "bd-given";
            if (item.status === "missing") {
                given.textContent = "—";
                given.classList.add("bd-empty");
            } else {
                given.textContent = item.given;
            }

            const answer = document.createElement("span");
            answer.className = "bd-correct";
            answer.textContent = item.correctAnswer;

            row.appendChild(kana);
            row.appendChild(given);
            row.appendChild(answer);
            breakdownList.appendChild(row);
        });
    }


    function showResults() {
        const stats = computeResults();
        resultsPercent.textContent = stats.percent + "%";
        resultsDetail.textContent =
            stats.correct + " of " + stats.total + " correct on the first try.";

        summaryCorrect.textContent = String(stats.correct);
        summaryWrong.textContent = String(stats.wrong);
        summaryMissing.textContent = String(stats.missing);

        renderBreakdown(stats.breakdown);
        resultsOverlay.classList.add("open");
    }

    function returnToSetup() {
        resultsOverlay.classList.remove("open");
        quizView.classList.add("hidden");
        setupView.classList.remove("hidden");
        // Keep the font dropdown label in sync with the actual selection.
        fontDropdown.syncLabel();
        window.scrollTo(0, 0);
    }

    function init() {
        renderGroupChecks(hiraganaGroups, "hiragana");
        renderGroupChecks(katakanaGroups, "katakana");

        // Shared font dropdown (renders options, handles open/close, etc.).
        fontDropdown = createFontDropdown();

        startBtn.addEventListener("click", startQuiz);
        finishBtn.addEventListener("click", showResults);
        if (finishBtnBottom) {
            finishBtnBottom.addEventListener("click", showResults);
        }
        resultsNew.addEventListener("click", returnToSetup);
        resultsReview.addEventListener("click", function () {
            resultsOverlay.classList.remove("open");
        });

        // Clicking the backdrop (outside the results card) closes the modal,
        // returning to the quiz. Clicks on the card itself are ignored.
        resultsOverlay.addEventListener("click", function (event) {
            if (event.target === resultsOverlay) {
                resultsOverlay.classList.remove("open");
            }
        });
    }

    document.addEventListener("DOMContentLoaded", init);
})();
