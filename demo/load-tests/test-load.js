/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
