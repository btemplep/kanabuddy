/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Renders the kana study/reference page from KANA_DATA (kana-data.js).
// Kana are shown in gojuon ("alphabetical") order. Uses the shared font
// dropdown (font-dropdown.js) and lets each romaji be hidden/revealed by
// clicking its tile; romaji is shown by default.

(function () {
    "use strict";

    const SCRIPT_LABELS = {
        hiragana: "Hiragana",
        katakana: "Katakana"
    };

    const SCRIPTS = ["hiragana", "katakana"];
    const GROUP_ORDER = ["main", "dakuten", "combo"];

    const content = document.getElementById("study-content");
    const tabs = document.getElementById("study-tabs");
    const resetBtn = document.getElementById("reset-romaji-btn");
    const hideBtn = document.getElementById("hide-romaji-btn");

    // Rendered script blocks and tab buttons keyed by script name.
    const scriptBlocks = {};
    const tabButtons = {};
    // All kana glyph elements, so a font selection can restyle each one.
    const kanaGlyphs = [];

    let fontDropdown = null;


    // Apply the chosen font to every kana glyph. "random" assigns each glyph
    // its own randomly picked font.
    function applyFont(mode) {
        kanaGlyphs.forEach(function (glyph) {
            if (mode === "random") {
                const pick = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)];
                glyph.style.fontFamily = pick.stack;
            } else {
                glyph.style.fontFamily = fontDropdown.getFontStack(mode);
            }
        });
    }


    function buildGroup(script, group) {
        const entries = (KANA_DATA[script] && KANA_DATA[script][group]) || [];
        if (entries.length === 0) {
            return null;
        }

        const section = document.createElement("section");
        section.className = "study-group";

        const heading = document.createElement("h3");
        heading.className = "study-group-title";
        heading.textContent = GROUP_LABELS[group] || group;
        section.appendChild(heading);

        const grid = document.createElement("div");
        grid.className = "study-grid";
        entries.forEach(function (entry) {
            const tile = document.createElement("button");
            tile.type = "button";
            // Romaji is shown by default; clicking toggles it hidden.
            tile.className = "study-tile";
            tile.setAttribute("aria-pressed", "true");

            const kana = document.createElement("span");
            kana.className = "study-kana";
            kana.textContent = entry.kana;

            const romaji = document.createElement("span");
            romaji.className = "study-romaji";
            romaji.textContent = entry.romaji[0];

            tile.appendChild(kana);
            tile.appendChild(romaji);
            tile.addEventListener("click", function () {
                const hidden = tile.classList.toggle("romaji-hidden");
                tile.setAttribute("aria-pressed", hidden ? "false" : "true");
            });

            kanaGlyphs.push(kana);
            grid.appendChild(tile);
        });
        section.appendChild(grid);

        return section;
    }


    function buildScript(script) {
        const block = document.createElement("section");
        block.className = "study-script";
        block.id = "study-" + script;

        GROUP_ORDER.forEach(function (group) {
            const groupSection = buildGroup(script, group);
            if (groupSection) {
                block.appendChild(groupSection);
            }
        });

        return block;
    }


    function activateScript(script) {
        SCRIPTS.forEach(function (name) {
            const isActive = name === script;
            if (scriptBlocks[name]) {
                scriptBlocks[name].hidden = !isActive;
            }
            if (tabButtons[name]) {
                tabButtons[name].classList.toggle("active", isActive);
                tabButtons[name].setAttribute("aria-selected", isActive ? "true" : "false");
            }
        });
    }


    function buildTab(script, index) {
        const tab = document.createElement("button");
        tab.type = "button";
        tab.className = "study-tab";
        tab.setAttribute("role", "tab");
        tab.textContent = SCRIPT_LABELS[script] || script;
        if (index === 0) {
            tab.classList.add("active");
            tab.setAttribute("aria-selected", "true");
        } else {
            tab.setAttribute("aria-selected", "false");
        }
        tab.addEventListener("click", function () {
            activateScript(script);
        });

        return tab;
    }


    // Show all romaji again (default state).
    function showAllRomaji() {
        content.querySelectorAll(".study-tile").forEach(function (tile) {
            tile.classList.remove("romaji-hidden");
            tile.setAttribute("aria-pressed", "true");
        });
    }


    // Hide every romaji at once.
    function hideAllRomaji() {
        content.querySelectorAll(".study-tile").forEach(function (tile) {
            tile.classList.add("romaji-hidden");
            tile.setAttribute("aria-pressed", "false");
        });
    }


    function render() {
        // Shared font dropdown; applies the font to all glyphs on change.
        fontDropdown = createFontDropdown({
            onChange: applyFont
        });

        SCRIPTS.forEach(function (script, index) {
            const tab = buildTab(script, index);
            tabButtons[script] = tab;
            tabs.appendChild(tab);

            const block = buildScript(script);
            block.hidden = index !== 0;
            scriptBlocks[script] = block;
            content.appendChild(block);
        });

        // Apply the initial font once all glyphs exist.
        applyFont(fontDropdown.getMode());

        if (resetBtn) {
            resetBtn.addEventListener("click", showAllRomaji);
        }
        if (hideBtn) {
            hideBtn.addEventListener("click", hideAllRomaji);
        }
    }


    document.addEventListener("DOMContentLoaded", render);
})();
