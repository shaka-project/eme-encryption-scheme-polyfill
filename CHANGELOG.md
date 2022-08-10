# Changelog


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
