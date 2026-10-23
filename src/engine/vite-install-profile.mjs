// SPDX-License-Identifier: Apache-2.0
// Installed-package admission only; these checks confer no observation authority.
export function assertVue3Profile({node,vite,appVite,vue,vuePlugin}) {
  if(node!=='18.18.2'||vite!=='4.4.9'||appVite!=='4.4.9'||vue!=='3.3.4'||vuePlugin!=='4.3.2') {
    throw Error('StateAtom Vue profile requires Node18.18.2, Vite4.4.9 in app and plugin, Vue3.3.4 and @vitejs/plugin-vue4.3.2. Disable StateAtom for an unsupported pipeline; do not replace application dependencies to bypass this check.');
  }
}

export function assertDefaultProfile({node,vite,appVite}) {
  if(!/^24\.\d+\.\d+$/.test(node)||vite!=='7.3.7'||appVite!=='7.3.7') {
    throw Error('StateAtom default installed profile requires Node24 and Vite7.3.7 in app and plugin. The separate experimental Vue profile requires profile:"vue3" and its exact documented versions. Disable StateAtom for other pipelines.');
  }
}
