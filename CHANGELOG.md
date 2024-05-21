# Changelog


## [2.1.5](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.1.4...v2.1.5) (2024-05-21)


### Bug Fixes

* Fix access to null properties ([#73](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/73)) ([339842e](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/339842e94372d2f1b5d9605b88b38908fc2a6459))

## [2.1.4](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.1.3...v2.1.4) (2024-05-16)


### Bug Fixes

* Fix conflicts with multiple installations ([#71](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/71)) ([d74823f](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/d74823fe9e537497f1ec858943d9c1c6d152c2c3))

## [2.1.3](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.1.2...v2.1.3) (2024-05-14)


### Bug Fixes

* **demo:** Log demo errors to the console ([#68](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/68)) ([ccfb179](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/ccfb1793ca80594a368cb669b97fa3ce0c50a09c))
* **demo:** Upgrade UI combo box component ([#67](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/67)) ([0d51ba6](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/0d51ba6b96ccadf556d8f6ef90501906258d3186))
* Populate requested scheme into output, not default scheme ([#69](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/69)) ([aa79c72](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/aa79c72fdab050d98c682fee2b0b1d2bcdeb47d6))

## [2.1.2](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.1.1...v2.1.2) (2024-05-07)


### Bug Fixes

* Fix CBCS support in some platforms ([#63](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/63)) ([3978d61](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/3978d619eb03534d89651a0cb11be8a9afad3387)), closes [#62](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/62)
* Use cbcs as default scheme for Safari ([#64](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/64)) ([5316552](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/53165526cd0297a987c7802bb2d7b190b7eb0c71))

## [2.1.1](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.1.0...v2.1.1) (2022-08-10)


### Bug Fixes

* Fix ES6 transpilation ([#49](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/49)) ([b170e12](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/b170e12db57f772470eb98dbbb5327b1a03caabc)), closes [#48](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/48)

## [2.1.0](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.0.5...v2.1.0) (2022-07-22)


### Features

* Add support for Chromecast version of PlayReady ([#45](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/45)) ([180f697](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/180f697d5d65527360c9d9096770f7eb74152d62))

## [2.0.5](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.0.4...v2.0.5) (2022-06-07)


### Bug Fixes

* Avoid duplicate calls to decodingInfo() ([#43](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/43)) ([fafd1dd](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/fafd1dd228e60f630274c77e28ed9ac7742d31cd))

### [2.0.4](https://github.com/shaka-project/eme-encryption-scheme-polyfill/compare/v2.0.3...v2.0.4) (2022-03-04)


### Bug Fixes

* **deps:** Update all dependencies ([#32](https://github.com/shaka-project/eme-encryption-scheme-polyfill/issues/32)) ([761dece](https://github.com/shaka-project/eme-encryption-scheme-polyfill/commit/761deceb36e28063ebf25077af10fea9a848901e))

## 2.0.3 (2021-04-19)

Bugfixes:
  - Fix MCap polyfill for browsers that support MCap but not the
    encryption-related parts of the MCap API.


## 2.0.2 (2021-02-05)

Bugfixes:
  - Fix infinite recursion when the MCap part of the polyfill is installed
    twice.
  - Fix exception when MCap returns a supported==false on encrypted content.


## 2.0.1 (2020-02-21)

Bugfixes:
  - Fix exception thrown on some legacy Edge versions


## 2.0.0 (2019-12-12)

Features:
  - Added support for polyfilling MediaCapabilities, too
    - https://github.com/w3c/media-capabilities/issues/100


## 1.0.3 (2019-12-05)

Bugfixes:
  - Update cbcs-recommended to cbcs-1-9 to keep up with spec changes


## 1.0.2 (2019-12-02)

Bugfixes:
  - Fix infinite recursion when the polyfill is installed twice.


## 1.0.1 (2019-11-22)

Bugfixes:
  - Fix RequireJS support
  - Workaround babel translation bug that resulted in undefined return value
  - Fix errors in Closure Compiler with strictest settings

Features:
  - Added a demo / manual testing page
    - https://shaka-project.github.io/eme-encryption-scheme-polyfill/demo/


## 1.0.0 (2019-11-18)

First public release.
