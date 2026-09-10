<!-- 
SPDX-FileCopyrightText: 2026 Brandon Temple Paul
SPDX-License-Identifier: GPL-3.0-or-later
-->
# KanaBuddy

Simple static website for practicing Japanese Kana.

Practice at [KanaBuddy](https://kanabuddy.org)!

## Development

KanaBuddy is plain HTML, CSS, and JavaScript with no build step, frameworks, or
Node installs required.

To work on it locally:

1. Clone the repository.
2. Open `src/index.html` in your browser.

> Note: the styled fonts load from Google Fonts, so an internet connection is
> needed for those to display (otherwise the site falls back to local fonts).

### Versioning

The app version lives in a single place: `src/js/version.js`.

```javascript
const APP_VERSION = "0.1.0";
```

When cutting a release, update `APP_VERSION` and add a matching entry to
`CHANGELOG.md`. The version is displayed in the site footer automatically (it
links to the changelog), so there is only one value to edit.

## License

This project is licensed under the GNU General Public License v3.0 or
later (GPL-3.0-or-later). See the [LICENSE](LICENSE) file for details.