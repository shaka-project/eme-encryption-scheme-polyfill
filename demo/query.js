document.addEventListener('DOMContentLoaded', () => {
  const formatObjectToString = (obj) => JSON.stringify(obj, null, 2);

  const emeRunButton = document.querySelector('#emeRun');

  emeRunButton.addEventListener('click', async () => {
    // Pull contents of query form.
    const keySystem = window.keySystem.input.value;
    // If encryptionScheme is black, default to null.
    const encryptionScheme = window.encryptionScheme.input.value || null;
    const audio = window.audio.input.value;
    const video = window.video.input.value;

    const config = {};

    if (audio) {
      config.audioCapabilities = [{
        contentType: audio,
        encryptionScheme,
      }];
    }

    if (video) {
      config.videoCapabilities = [{
        contentType: video,
        encryptionScheme,
      }];
    }

    try {
      const mksa =
          await navigator.requestMediaKeySystemAccess(keySystem, [config]);
      results.textContent = formatObjectToString(mksa.getConfiguration());
    } catch (error) {
      results.textContent = formatObjectToString({error: error.message});
    }
  });  // emeRunButton click listener
});  // DOMContentLoaded listener
