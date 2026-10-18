// SPDX-License-Identifier: Apache-2.0
for (const id of ['default-button', 'primary-button', 'icon-button', 'long-button']) {
  document.getElementById(id).addEventListener('click', () => {
    document.getElementById('action-status').textContent = 'Completed local action: ' + id;
  });
}
