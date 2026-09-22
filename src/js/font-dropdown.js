/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
// Shared custom font dropdown used by the quiz and the study guide.
// Loaded as a plain script (after kana-data.js) and exposed as the global
// `createFontDropdown`. Relies on FONT_OPTIONS from kana-data.js.
//
// Expected DOM (ids configurable):
//   <div id="font-dropdown">
//     <button id="font-toggle"><span id="font-toggle-label"></span> ...</button>
//     <div id="font-options" hidden>
//       <label id="random-choice"><input value="random"> ... <span id="random-sample"></span></label>
//     </div>
//   </div>

function createFontDropdown(config) {
    "use strict";

    config = config || {};
    const dropdown = document.getElementById(config.dropdownId || "font-dropdown");
    const toggle = document.getElementById(config.toggleId || "font-toggle");
    const toggleLabel = document.getElementById(config.toggleLabelId || "font-toggle-label");
    const options = document.getElementById(config.optionsId || "font-options");
    const randomSampleId = config.randomSampleId || "random-sample";
    const onChange = typeof config.onChange === "function" ? config.onChange : function () {};

    const SAMPLE_FALLBACK = "あいうえ　アイウエ";


    function getFontStack(fontId) {
        const match = FONT_OPTIONS.find(function (f) {
            return f.id === fontId;
        });

        return match ? match.stack : FONT_OPTIONS[0].stack;
    }


    function getMode() {
        const checked = document.querySelector('input[name="font"]:checked');

        return checked ? checked.value : FONT_OPTIONS[0].id;
    }


    function setLabel(text) {
        if (toggleLabel) {
            toggleLabel.textContent = text;
        }
    }


    // Sync the toggle label to whichever radio is actually checked.
    function syncLabel() {
        const value = getMode();
        if (value === "random") {
            setLabel("Randomize");

            return;
        }
        const match = FONT_OPTIONS.find(function (f) {
            return f.id === value;
        });
        setLabel(match ? match.label : (FONT_OPTIONS[0] && FONT_OPTIONS[0].label) || "");
    }


    function renderRandomSample() {
        const container = document.getElementById(randomSampleId);
        if (!container) {
            return;
        }
        container.innerHTML = "";
        const text = (FONT_OPTIONS[0] && FONT_OPTIONS[0].sample) || SAMPLE_FALLBACK;
        text.split("").forEach(function (ch) {
            if (ch.trim() === "") {
                container.appendChild(document.createTextNode(ch));

                return;
            }
            const glyph = document.createElement("span");
            const pick = FONT_OPTIONS[Math.floor(Math.random() * FONT_OPTIONS.length)];
            glyph.style.fontFamily = pick.stack;
            glyph.textContent = ch;
            container.appendChild(glyph);
        });
    }


    function renderOptions() {
        const randomLabel = options.querySelector('input[value="random"]');
        FONT_OPTIONS.forEach(function (font, index) {
            const label = document.createElement("label");
            label.className = "font-choice";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = "font";
            input.value = font.id;
            if (index === 0) {
                input.checked = true;
            }
            input.addEventListener("change", function () {
                setLabel(font.label);
                close();
                onChange(font.id);
            });

            const info = document.createElement("span");
            info.className = "font-info";

            const name = document.createElement("span");
            name.className = "font-name";
            name.textContent = font.label;

            const note = document.createElement("span");
            note.className = "font-note";
            note.textContent = font.note ? font.note : "";

            info.appendChild(name);
            info.appendChild(note);

            const sample = document.createElement("span");
            sample.className = "font-sample";
            sample.textContent = font.sample || font.label;
            sample.style.fontFamily = font.stack;

            label.appendChild(input);
            label.appendChild(info);
            label.appendChild(sample);
            options.insertBefore(label, randomLabel.parentNode);
        });
    }


    function open() {
        dropdown.classList.add("open");
        options.hidden = false;
        toggle.setAttribute("aria-expanded", "true");

        // Choose drop direction based on available space (measure after show).
        const toggleRect = toggle.getBoundingClientRect();
        const viewportH = window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = viewportH - toggleRect.bottom;
        const spaceAbove = toggleRect.top;
        const panelH = options.offsetHeight || 0;
        const dropUp = spaceBelow < panelH + 12 && spaceAbove > spaceBelow;
        dropdown.classList.toggle("drop-up", dropUp);
    }


    function close() {
        dropdown.classList.remove("open");
        dropdown.classList.remove("drop-up");
        options.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
    }


    function toggleOpen() {
        if (dropdown.classList.contains("open")) {
            close();
        } else {
            open();
        }
    }


    function init() {
        renderOptions();
        renderRandomSample();
        syncLabel();

        toggle.addEventListener("click", toggleOpen);

        // Close when an option is clicked, even if it's the already-selected
        // one (in which case no "change" event fires).
        options.addEventListener("click", function (event) {
            const label = event.target.closest ? event.target.closest("label") : null;
            if (label) {
                if (event.target.value === "random") {
                    setLabel("Randomize");
                    renderRandomSample();
                    onChange("random");
                }
                close();
            }
        });

        // Close when clicking outside the dropdown.
        document.addEventListener("click", function (event) {
            if (!dropdown.contains(event.target)) {
                close();
            }
        });

        // Close on Escape for keyboard users.
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                close();
            }
        });
    }


    init();

    return {
        getMode: getMode,
        getFontStack: getFontStack,
        syncLabel: syncLabel,
        close: close
    };
}
