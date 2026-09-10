/*
 * SPDX-FileCopyrightText: 2026 Brandon Temple Paul
 * SPDX-License-Identifier: GPL-3.0-or-later
 */   
// Stamps the app version (from version.js) into any element with
// [data-app-version]. Loaded after version.js on each page.

(function () {
    "use strict";

    function stampVersion() {
        const version = typeof APP_VERSION === "string" ? APP_VERSION : "";
        const targets = document.querySelectorAll("[data-app-version]");
        targets.forEach(function (el) {
            el.textContent = "v" + version;
        });
    }

    document.addEventListener("DOMContentLoaded", stampVersion);
})();
