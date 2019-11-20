function checkDefinition(polyfill) {
  console.debug('Polyfill:', polyfill, polyfill && polyfill.install);
  const polyfillIsCorrectlyDefined = !!polyfill && !!polyfill.install;
  return polyfillIsCorrectlyDefined;
}

document.addEventListener('DOMContentLoaded', async () => {
  const title = document.title.split('-')[1];

  if (window.parent != window) {
    const popOutButton = document.createElement('button');
    popOutButton.textContent = 'pop out';
    popOutButton.style.marginRight = '1em';
    popOutButton.addEventListener('click', () => {
      window.parent.location = location.href;
    });
    document.body.appendChild(popOutButton);
  }

  const titleDiv = document.createElement('span');
  titleDiv.textContent = `Testing ${title}`;
  document.body.appendChild(titleDiv);

  const status = document.createElement('span');
  titleDiv.appendChild(status);

  status.textContent = '...';

  try {
    const okay = await testLoader() ? 'OK' : 'FAILED!';
    status.textContent = `: ${okay}`;
  } catch (error) {
    status.textContent = `: Error "${error.message}"`;
  }
});
