/*!
 * @license
 * EME Encryption Scheme Polyfill
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// This special header is retained in minified bundle, and only adds ~120 bytes.

/**
 * A polyfill to add support for EncryptionScheme queries in EME.
 *
 * Because this polyfill can't know what schemes the UA or CDM actually support,
 * it assumes support for the historically-supported schemes of each well-known
 * key system.
 *
 * In source form, this is compatible with the Closure Compiler, CommonJS, and
 * AMD module formats.  It can also be directly included via a script tag.
 *
 * The minified bundle is a standalone module compatible with the CommonJS and
 * AMD module formats, and can also be directly included via a script tag.
 *
 * @see https://wicg.github.io/encrypted-media-encryption-scheme/
 * @see https://github.com/w3c/encrypted-media/pull/457
 * @export
 */
class EmeEncryptionSchemePolyfill {
  /**
   * Installs the polyfill.  To avoid the possibility of extra user prompts,
   * this will shim EME so long as it exists, without checking support for
   * encryptionScheme upfront.  The support check will happen on-demand the
   * first time EME is used.
   *
   * @export
   */
  static install() {
    if (EmeEncryptionSchemePolyfill.originalRMKSA_ ||
        navigator['emeEncryptionSchemePolyfilled']) {
      console.debug('EmeEncryptionSchemePolyfill: Already installed.');
      return;
    }
    if (!navigator.requestMediaKeySystemAccess ||
        !MediaKeySystemAccess.prototype.getConfiguration) {
      console.debug('EmeEncryptionSchemePolyfill: EME not found');
      // No EME.
      return;
    }

    // Save the original.
    EmeEncryptionSchemePolyfill.originalRMKSA_ =
        navigator.requestMediaKeySystemAccess;

    // Patch in a method which will check for support on the first call.
    console.debug('EmeEncryptionSchemePolyfill: ' +
        'Waiting to detect encryptionScheme support.');
    navigator.requestMediaKeySystemAccess =
        EmeEncryptionSchemePolyfill.probeRMKSA_;

    // Mark EME as polyfilled.  This keeps us from running into conflicts
    // between multiple versions of this (compiled Shaka lib vs
    // uncompiled source).
    navigator['emeEncryptionSchemePolyfilled'] = true;
  }

  /**
   * A shim for navigator.requestMediaKeySystemAccess to check for
   * encryptionScheme support.  Only used until we know if the browser has
   * native support for the encryptionScheme field.
   *
   * @this {Navigator}
   * @param {string} keySystem The key system ID.
   * @param {!Array.<!MediaKeySystemConfiguration>} supportedConfigurations An
   *   array of supported configurations the application can use.
   * @return {!Promise.<!MediaKeySystemAccess>} A Promise to a
   *   MediaKeySystemAccess instance.
   * @private
   */
  static async probeRMKSA_(keySystem, supportedConfigurations) {
    console.assert(this == navigator,
        'bad "this" for requestMediaKeySystemAccess');

    // Call the original version.  If the call succeeds, we look at the result
    // to decide if the encryptionScheme field is supported or not.
    const mediaKeySystemAccess =
        await EmeEncryptionSchemePolyfill.originalRMKSA_.call(
            this, keySystem, supportedConfigurations);

    if (hasEncryptionScheme(mediaKeySystemAccess)) {
      // The browser supports the encryptionScheme field!
      // No need for a patch.  Revert back to the original implementation.
      console.debug('EmeEncryptionSchemePolyfill: ' +
          'Native encryptionScheme support found.');
      // eslint-disable-next-line require-atomic-updates
      navigator.requestMediaKeySystemAccess =
          EmeEncryptionSchemePolyfill.originalRMKSA_;
      // Return the results, which are completely valid.
      return mediaKeySystemAccess;
    }

    // If we land here, the browser does _not_ support the encryptionScheme
    // field.  So we install another patch to check the encryptionScheme field
    // in future calls.
    console.debug('EmeEncryptionSchemePolyfill: ' +
        'No native encryptionScheme support found. '+
        'Patching encryptionScheme support.');
    // eslint-disable-next-line require-atomic-updates
    navigator.requestMediaKeySystemAccess =
        EmeEncryptionSchemePolyfill.polyfillRMKSA_;

    // The results we have may not be valid.  Run the query again through our
    // polyfill.
    return EmeEncryptionSchemePolyfill.polyfillRMKSA_.call(
        this, keySystem, supportedConfigurations);
  }

  /**
   * A polyfill for navigator.requestMediaKeySystemAccess to handle the
   * encryptionScheme field in browsers that don't support it.  It uses the
   * user-agent string to guess what encryption schemes are supported, then
   * those guesses are used to filter videoCapabilities and audioCapabilities
   * and reject unsupported schemes.
   *
   * @this {Navigator}
   * @param {string} keySystem The key system ID.
   * @param {!Array.<!MediaKeySystemConfiguration>} supportedConfigurations An
   *   array of supported configurations the application can use.
   * @return {!Promise.<!MediaKeySystemAccess>} A Promise to a
   *   MediaKeySystemAccess instance.
   * @private
   */
  static async polyfillRMKSA_(keySystem, supportedConfigurations) {
    console.assert(this == navigator,
        'bad "this" for requestMediaKeySystemAccess');

    const supportedScheme = guessSupportedScheme(keySystem);

    // Filter the application's configurations based on our guess of what
    // encryption scheme is supported.
    const filteredSupportedConfigurations = [];
    for (const configuration of supportedConfigurations) {
      const filteredVideoCapabilities =
          EmeEncryptionSchemePolyfill.filterCapabilities_(
              configuration.videoCapabilities, supportedScheme);
      const filteredAudioCapabilities =
          EmeEncryptionSchemePolyfill.filterCapabilities_(
              configuration.audioCapabilities, supportedScheme);

      if (configuration.videoCapabilities &&
          configuration.videoCapabilities.length &&
          !filteredVideoCapabilities.length) {
        // We eliminated all of the video capabilities, so this configuration
        // is unusable.
      } else if (configuration.audioCapabilities &&
          configuration.audioCapabilities.length &&
          !filteredAudioCapabilities.length) {
        // We eliminated all of the audio capabilities, so this configuration
        // is unusable.
      } else {
        // Recreate a clone of the configuration and modify that.  This way, we
        // don't modify the application-provided config objects.
        /** @type {!MediaKeySystemConfiguration} */
        const clonedConfiguration = Object.assign({}, configuration);
        clonedConfiguration.videoCapabilities = filteredVideoCapabilities;
        clonedConfiguration.audioCapabilities = filteredAudioCapabilities;
        filteredSupportedConfigurations.push(clonedConfiguration);
      }
    }

    if (!filteredSupportedConfigurations.length) {
      // None of the application's configurations passed our encryptionScheme
      // filters, so this request fails.

      // As spec'd, this should be a DOMException, but there is not a public
      // constructor for this in all browsers.  This should be close enough for
      // most applications.
      const unsupportedError = new Error(
          'Unsupported keySystem or supportedConfigurations.');
      unsupportedError.name = 'NotSupportedError';
      unsupportedError['code'] = DOMException.NOT_SUPPORTED_ERR;
      throw unsupportedError;
    }

    // At this point, we have some filtered configurations that we think could
    // work.  Pass this subset to the native version of RMKSA.
    const mediaKeySystemAccess =
        await EmeEncryptionSchemePolyfill.originalRMKSA_.call(
            this, keySystem, filteredSupportedConfigurations);

    // Wrap the MKSA object in ours to provide the missing field in the
    // returned configuration.
    let videoScheme = null;
    let audioScheme = null;
    if (filteredSupportedConfigurations[0]) {
      if (filteredSupportedConfigurations[0].videoCapabilities) {
        videoScheme = filteredSupportedConfigurations[0]
            .videoCapabilities[0].encryptionScheme;
      }
      if (filteredSupportedConfigurations[0].audioCapabilities) {
        audioScheme = filteredSupportedConfigurations[0]
            .audioCapabilities[0].encryptionScheme;
      }
    }
    return new EmeEncryptionSchemePolyfillMediaKeySystemAccess(
        mediaKeySystemAccess, videoScheme, audioScheme);
  }

  /**
   * Filters out capabilities that don't match the supported encryption scheme.
   *
   * @param {!Array.<!MediaKeySystemMediaCapability>|undefined} capabilities
   *   An array of capabilities, or null or undefined.
   * @param {?string} supportedScheme The encryption scheme that we think is
   *   supported by the key system.
   * @return {!Array.<!MediaKeySystemMediaCapability>|undefined} A filtered
   *   array of capabilities based on |supportedScheme|.  May be undefined if
   *   the input was undefined.
   * @private
   */
  static filterCapabilities_(capabilities, supportedScheme) {
    if (!capabilities) {
      return capabilities;
    }

    return capabilities.filter((capability) => {
      return checkSupportedScheme(
          capability['encryptionScheme'], supportedScheme);
    });
  }
}

/**
 * A polyfill to add support for EncryptionScheme queries in MediaCapabilities.
 *
 * Because this polyfill can't know what schemes the UA or CDM actually support,
 * it assumes support for the historically-supported schemes of each well-known
 * key system.
 *
 * In source form, this is compatible with the Closure Compiler, CommonJS, and
 * AMD module formats.  It can also be directly included via a script tag.
 *
 * The minified bundle is a standalone module compatible with the CommonJS and
 * AMD module formats, and can also be directly included via a script tag.
 *
 * @see https://wicg.github.io/encrypted-media-encryption-scheme/
 * @see https://github.com/w3c/encrypted-media/pull/457
 * @export
 */
class McEncryptionSchemePolyfill {
  /**
   * Installs the polyfill.  To avoid the possibility of extra user prompts,
   * this will shim MC so long as it exists, without checking support for
   * encryptionScheme upfront.  The support check will happen on-demand the
   * first time MC is used.
   *
   * @export
   */
  static install() {
    if (McEncryptionSchemePolyfill.originalDecodingInfo_ ||
        navigator['mediaCapabilitiesEncryptionSchemePolyfilled']) {
      console.debug('McEncryptionSchemePolyfill: Already installed.');
      return;
    }
    if (!navigator.mediaCapabilities) {
      console.debug('McEncryptionSchemePolyfill: MediaCapabilities not found');
      // No MediaCapabilities.
      return;
    }

    // Save the original.
    McEncryptionSchemePolyfill.originalDecodingInfo_ =
        navigator.mediaCapabilities.decodingInfo;

    // Patch in a method which will check for support on the first call.
    console.debug('McEncryptionSchemePolyfill: ' +
        'Waiting to detect encryptionScheme support.');
    navigator.mediaCapabilities.decodingInfo =
        McEncryptionSchemePolyfill.probeDecodingInfo_;

    // Mark MediaCapabilities as polyfilled.  This keeps us from running into
    // conflicts between multiple versions of this (compiled Shaka lib vs
    // uncompiled source).
    navigator['mediaCapabilitiesEncryptionSchemePolyfilled'] = true;
  }

  /**
   * A shim for mediaCapabilities.decodingInfo to check for encryptionScheme
   * support.  Only used until we know if the browser has native support for the
   * encryptionScheme field.
   *
   * @this {MediaCapabilities}
   * @param {!MediaDecodingConfiguration} requestedConfiguration The requested
   *   decoding configuration.
   * @return {!Promise.<!MediaCapabilitiesDecodingInfo>} A Promise to a result
   *   describing the capabilities of the browser in the request configuration.
   * @private
   */
  static async probeDecodingInfo_(requestedConfiguration) {
    console.assert(this == navigator.mediaCapabilities,
        'bad "this" for decodingInfo');

    // Call the original version.  If the call succeeds, we look at the result
    // to decide if the encryptionScheme field is supported or not.
    const capabilities =
        await McEncryptionSchemePolyfill.originalDecodingInfo_.call(
            this, requestedConfiguration);

    if (!requestedConfiguration.keySystemConfiguration) {
      // This was not a query regarding encrypted content.  The results are
      // valid, but won't tell us anything about native support for
      // encryptionScheme.  Just return the results.
      return capabilities;
    }

    const mediaKeySystemAccess = capabilities.keySystemAccess;

    if (mediaKeySystemAccess && hasEncryptionScheme(mediaKeySystemAccess)) {
      // The browser supports the encryptionScheme field!
      // No need for a patch.  Revert back to the original implementation.
      console.debug('McEncryptionSchemePolyfill: ' +
          'Native encryptionScheme support found.');
      // eslint-disable-next-line require-atomic-updates
      navigator.mediaCapabilities.decodingInfo =
          McEncryptionSchemePolyfill.originalDecodingInfo_;
      // Return the results, which are completely valid.
      return capabilities;
    }

    // If we land here, either the browser does not support the
    // encryptionScheme field, or the browser does not support EME-related
    // fields in MCap _at all_.

    // First, install a patch to check the mediaKeySystemAccess or
    // encryptionScheme field in future calls.
    console.debug('McEncryptionSchemePolyfill: ' +
        'No native encryptionScheme support found. '+
        'Patching encryptionScheme support.');
    // eslint-disable-next-line require-atomic-updates
    navigator.mediaCapabilities.decodingInfo =
        McEncryptionSchemePolyfill.polyfillDecodingInfo_;

    // Second, if _none_ of the EME-related fields of MCap are supported, fill
    // them in now before returning the results.
    if (!mediaKeySystemAccess) {
      capabilities.keySystemAccess =
          await McEncryptionSchemePolyfill.getMediaKeySystemAccess_(
              requestedConfiguration);
      return capabilities;
    }

    // If we land here, it's only the encryption scheme field that is missing.
    // The results we have may not be valid, since they didn't account for
    // encryption scheme.  Run the query again through our polyfill.
    return McEncryptionSchemePolyfill.polyfillDecodingInfo_.call(
        this, requestedConfiguration);
  }

  /**
   * A polyfill for mediaCapabilities.decodingInfo to handle the
   * encryptionScheme field in browsers that don't support it.  It uses the
   * user-agent string to guess what encryption schemes are supported, then
   * those guesses are used to reject unsupported schemes.
   *
   * @this {MediaCapabilities}
   * @param {!MediaDecodingConfiguration} requestedConfiguration The requested
   *   decoding configuration.
   * @return {!Promise.<!MediaCapabilitiesDecodingInfo>} A Promise to a result
   *   describing the capabilities of the browser in the request configuration.
   * @private
   */
  static async polyfillDecodingInfo_(requestedConfiguration) {
    console.assert(this == navigator.mediaCapabilities,
        'bad "this" for decodingInfo');

    let videoScheme = null;
    let audioScheme = null;

    if (requestedConfiguration.keySystemConfiguration) {
      const keySystemConfig = requestedConfiguration.keySystemConfiguration;

      const keySystem = keySystemConfig.keySystem;

      audioScheme = keySystemConfig.audio &&
          keySystemConfig.audio.encryptionScheme;
      videoScheme = keySystemConfig.video &&
          keySystemConfig.video.encryptionScheme;

      const supportedScheme = guessSupportedScheme(keySystem);

      const notSupportedResult = {
        powerEfficient: false,
        smooth: false,
        supported: false,
        keySystemAccess: null,
        configuration: requestedConfiguration,
      };

      if (!checkSupportedScheme(audioScheme, supportedScheme)) {
        return notSupportedResult;
      }
      if (!checkSupportedScheme(videoScheme, supportedScheme)) {
        return notSupportedResult;
      }
    }

    // At this point, either it's unencrypted or we assume the encryption scheme
    // is supported.  So delegate to the original decodingInfo() method.
    const capabilities =
        await McEncryptionSchemePolyfill.originalDecodingInfo_.call(
            this, requestedConfiguration);

    if (capabilities.keySystemAccess) {
      // If the result is supported and encrypted, this will be a
      // MediaKeySystemAccess instance.  Wrap the MKSA object in ours to provide
      // the missing field in the returned configuration.
      capabilities.keySystemAccess =
          new EmeEncryptionSchemePolyfillMediaKeySystemAccess(
              capabilities.keySystemAccess, videoScheme, audioScheme);
    } else if (requestedConfiguration.keySystemConfiguration) {
      // If the result is supported and the content is encrypted, we should have
      // a MediaKeySystemAccess instance as part of the result.  If we land
      // here, the browser doesn't support the EME-related fields of MCap.
      capabilities.keySystemAccess =
          await McEncryptionSchemePolyfill.getMediaKeySystemAccess_(
              requestedConfiguration);
    }

    return capabilities;
  }

  /**
   * Call navigator.requestMediaKeySystemAccess to get the MediaKeySystemAccess
   * information.
   *
   * @param {!MediaDecodingConfiguration} requestedConfiguration The requested
   *   decoding configuration.
   * @return {!Promise.<!MediaKeySystemAccess>} A Promise to a
   *   MediaKeySystemAccess instance.
   * @private
   */
  static async getMediaKeySystemAccess_(requestedConfiguration) {
    const mediaKeySystemConfig =
          McEncryptionSchemePolyfill.convertToMediaKeySystemConfig_(
              requestedConfiguration);
    const keySystemAccess =
          await navigator.requestMediaKeySystemAccess(
              requestedConfiguration.keySystemConfiguration.keySystem,
              [mediaKeySystemConfig]);
    return keySystemAccess;
  }

  /**
   * Convert the MediaDecodingConfiguration object to a
   * MediaKeySystemConfiguration object.
   *
   * @param {!MediaDecodingConfiguration} decodingConfig The decoding
   *   configuration.
   * @return {!MediaKeySystemConfiguration} The converted MediaKeys
   *   configuration.
   */
  static convertToMediaKeySystemConfig_(decodingConfig) {
    const mediaCapKeySystemConfig = decodingConfig.keySystemConfiguration;
    const audioCapabilities = [];
    const videoCapabilities = [];

    if (mediaCapKeySystemConfig.audio) {
      const capability = {
        robustness: mediaCapKeySystemConfig.audio.robustness || '',
        contentType: decodingConfig.audio.contentType,
        encryptionScheme: mediaCapKeySystemConfig.audio.encryptionScheme,
      };
      audioCapabilities.push(capability);
    }

    if (mediaCapKeySystemConfig.video) {
      const capability = {
        robustness: mediaCapKeySystemConfig.video.robustness || '',
        contentType: decodingConfig.video.contentType,
        encryptionScheme: mediaCapKeySystemConfig.video.encryptionScheme,
      };
      videoCapabilities.push(capability);
    }

    const initDataTypes = mediaCapKeySystemConfig.initDataType ?
        [mediaCapKeySystemConfig.initDataType] : [];

    /** @type {!MediaKeySystemConfiguration} */
    const mediaKeySystemConfig = {
      initDataTypes: initDataTypes,
      distinctiveIdentifier: mediaCapKeySystemConfig.distinctiveIdentifier,
      persistentState: mediaCapKeySystemConfig.persistentState,
      sessionTypes: mediaCapKeySystemConfig.sessionTypes,
    };

    // Only add the audio video capablities if they have valid data.
    // Otherwise the query will fail.
    if (audioCapabilities.length) {
      mediaKeySystemConfig.audioCapabilities = audioCapabilities;
    }
    if (videoCapabilities.length) {
      mediaKeySystemConfig.videoCapabilities = videoCapabilities;
    }
    return mediaKeySystemConfig;
  }
}

/**
 * A wrapper around MediaKeySystemAccess that adds encryptionScheme
 *   fields to the configuration, to emulate what a browser with native support
 *   for this field would do.
 *
 * @see https://github.com/w3c/encrypted-media/pull/457
 * @see https://github.com/WICG/encrypted-media-encryption-scheme/issues/13
 * @implements {MediaKeySystemAccess}
 */
class EmeEncryptionSchemePolyfillMediaKeySystemAccess {
  /**
   * @param {!MediaKeySystemAccess} mksa A native MediaKeySystemAccess instance
   *   to wrap.
   * @param {?string|undefined} videoScheme The encryption scheme to add to the
   *   configuration for video.
   * @param {?string|undefined} audioScheme The encryption scheme to add to the
   *   configuration for audio.
   */
  constructor(mksa, videoScheme, audioScheme) {
    /**
     * @const {!MediaKeySystemAccess}
     * @private
     */
    this.mksa_ = mksa;

    /**
     * @const {?string}
     * @private
     */
    this.videoScheme_ = videoScheme || null;

    /**
     * @const {?string}
     * @private
     */
    this.audioScheme_ = audioScheme || null;

    /** @const {string} */
    this.keySystem = mksa.keySystem;
  }

  /**
   * @override
   * @return {!MediaKeySystemConfiguration} A MediaKeys config with
   *   encryptionScheme fields added
   */
  getConfiguration() {
    // A browser which supports the encryptionScheme field would always return
    // that field in the resulting configuration.  So here, we emulate that.
    const configuration = this.mksa_.getConfiguration();

    if (configuration.videoCapabilities) {
      for (const capability of configuration.videoCapabilities) {
        capability['encryptionScheme'] = this.videoScheme_;
      }
    }

    if (configuration.audioCapabilities) {
      for (const capability of configuration.audioCapabilities) {
        capability['encryptionScheme'] = this.audioScheme_;
      }
    }

    return configuration;
  }

  /**
   * @override
   * @return {!Promise<!MediaKeys>} A passthru of the native MediaKeys object
   */
  createMediaKeys() {
    return this.mksa_.createMediaKeys();
  }
}

/**
 * Guess the supported encryption scheme for the key system.
 *
 * @param {string} keySystem The key system ID.
 * @return {?string} A guess at the encryption scheme this key system
 *   supports.
 */
function guessSupportedScheme(keySystem) {
  if (keySystem.startsWith('com.widevine')) {
    return 'cenc';
  } else if (keySystem.startsWith('com.microsoft')) {
    return 'cenc';
  } else if (keySystem.startsWith('com.chromecast')) {
    return 'cenc';
  } else if (keySystem.startsWith('com.adobe')) {
    return 'cenc';
  } else if (keySystem.startsWith('org.w3')) {
    return 'cenc';
  } else if (keySystem.startsWith('com.apple')) {
    return 'cbcs';
  }

  // We don't have this key system in our map!

  // Log a warning.  The only way the request will succeed now is if the
  // app doesn't specify an encryption scheme in their own configs.
  // Use bracket notation to keep this from being stripped from the build.
  console['warn']('EmeEncryptionSchemePolyfill: Unknown key system:',
      keySystem, 'Please contribute!');

  return null;
}

/**
 * @param {?MediaKeySystemAccess} mediaKeySystemAccess A native
 *   MediaKeySystemAccess instance from the browser.
 * @return {boolean} True if browser natively supports encryptionScheme.
 */
function hasEncryptionScheme(mediaKeySystemAccess) {
  const configuration = mediaKeySystemAccess.getConfiguration();

  // It doesn't matter which capability we look at.  For this check, they
  // should all produce the same result.
  const firstVideoCapability =
      configuration.videoCapabilities && configuration.videoCapabilities[0];
  const firstAudioCapability =
      configuration.audioCapabilities && configuration.audioCapabilities[0];
  const firstCapability = firstVideoCapability || firstAudioCapability;

  // If supported by the browser, the encryptionScheme field must appear in
  // the returned configuration, regardless of whether or not it was
  // specified in the supportedConfigurations given by the application.
  if (firstCapability && firstCapability['encryptionScheme'] !== undefined) {
    return true;
  }
  return false;
}

/**
 * @param {(string|undefined|null)} scheme Encryption scheme to check
 * @param {?string} supportedScheme A guess at the encryption scheme this
 *   supports.
 * @return {boolean} True if the scheme is compatible.
 */
function checkSupportedScheme(scheme, supportedScheme) {
  if (!scheme) {
    // Not encrypted = always supported
    return true;
  }

  if (scheme == supportedScheme) {
    // The assumed-supported legacy scheme for this platform.
    return true;
  }

  if (scheme == 'cbcs' || scheme == 'cbcs-1-9') {
    if (EncryptionSchemePolyfills.isRecentFirefox ||
        EncryptionSchemePolyfills.isChromecast) {
      // Firefox >= 100 supports CBCS, but doesn't support queries yet.
      // Older Chromecast devices are assumed to support CBCS as well.
      return true;
    }
  }

  return false;
}

/**
 * The original requestMediaKeySystemAccess, before we patched it.
 *
 * @type {
 *   function(this:Navigator,
 *     string,
 *     !Array.<!MediaKeySystemConfiguration>
 *   ):!Promise.<!MediaKeySystemAccess>
 * }
 * @private
 */
EmeEncryptionSchemePolyfill.originalRMKSA_;

/**
 * The original decodingInfo, before we patched it.
 *
 * @type {
 *   function(this:MediaCapabilities,
 *     !MediaDecodingConfiguration
 *   ):!Promise.<!MediaCapabilitiesDecodingInfo>
 * }
 * @private
 */
McEncryptionSchemePolyfill.originalDecodingInfo_;

/**
 * A single entry point for both polyfills (EME & MC).
 *
 * @export
 */
class EncryptionSchemePolyfills {
  /**
   * Installs both polyfills (EME & MC).
   *
   * @export
   */
  static install() {
    EmeEncryptionSchemePolyfill.install();
    McEncryptionSchemePolyfill.install();
  }
}

/**
 * @const {boolean}
 */
EncryptionSchemePolyfills.isChromecast =
    navigator.userAgent.includes('CrKey');

/**
 * @const {boolean}
 */
EncryptionSchemePolyfills.isRecentFirefox =
    parseInt(navigator.userAgent.split('Firefox/').pop(), 10) >= 100;

// Support for CommonJS and AMD module formats.
/** @suppress {undefinedVars} */
(() => {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EncryptionSchemePolyfills;
  }
})();
