# EME Encryption Scheme Polyfill

A polyfill to add support for EncryptionScheme queries in EME.

 - https://wicg.github.io/encrypted-media-encryption-scheme/
 - https://google.github.io/eme-encryption-scheme-polyfill/demo/
 - https://github.com/WICG/encrypted-media-encryption-scheme/issues/13

Because this polyfill can't know what schemes the UA or CDM actually support,
it assumes support for the historically-supported schemes of each well-known
key system.

In source form (`index.js`), this is compatible with the Closure Compiler and
the CommonJS module format.  It can also be directly included via a script tag.

The minified bundle (`dist/eme-encryption-scheme-polyfill.js`) is a standalone
module compatible with the CommonJS and AMD module formats, and can also be
directly included via a script tag.  It is about 3.1kB uncompressed, and gzips
to about 1.2kB.

To avoid the possibility of extra user prompts, this will shim EME so long as
it exists, without checking support for `encryptionScheme` upfront.  The
support check will happen on-demand the first time EME is used.


## Usage

```sh
npm install eme-encryption-scheme-polyfill
```

```html
<script src="node_modules/eme-encryption-scheme-polyfill/dist/eme-encryption-scheme-polyfill.js"></script>
```

```js
EmeEncryptionSchemePolyfill.install();
```
