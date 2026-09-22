# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- 
## [Unreleased] - YYYY-MM-DD

### Added

### Changed

### Deprecated

### Removed

### Fixed

### Security 
-->

## [0.4.0] - 2026-09-21

### Added

- New Study Guide page: a reference of all hiragana and katakana 
- A "Study Guide" button on the home page and a "Study" link in the site
  navigation.

### Changed

- Extracted the custom font dropdown into a shared module used by both the quiz
  and study pages.

## [0.3.0] - 2026-09-16

### Added

- Site logo (pixel art) is now used as the favicon, logo, and shown on the home page
- Clicking outside the results card (on the backdrop) now closes the results
  modal.
  - The results modal now opens automatically once every box has been answered
  correctly, without needing to press "Finish".


### Removed

- Removed the "New Quiz" buttons from the top and bottom of the quiz view. A new
  quiz can still be started from the results screen after finishing.

### Fixed

- The font dropdown label now stays in sync with the selected font. Previously,
  after starting a quiz and returning via "New Quiz", the label could show the
  first font while a different font was still selected.


## [0.2.0] - 2026-09-09

### Added

- License and copyright everywhere
- Site footer now includes a "Source" link to the GitHub repository and a
  copyright notice ("© 2026 Brandon Temple Paul") alongside the version.
- On a wrong answer, the typed romaji is now cleared and shown as shadow
  (placeholder) text in the box instead of remaining as the value.

### Fixed

- A wrong answer no longer advances to the next box on mobile; the cursor stays
  on the current box, matching desktop behavior.


### Security

## [0.1.0] - 2026-09-09

Initial Release