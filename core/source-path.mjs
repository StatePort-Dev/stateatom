// SPDX-License-Identifier: Apache-2.0
export function portableSourcePath(x){return typeof x==='string'&&x.length<=512&&!/^(?:\/|[a-z]+:)/i.test(x)&&!/[\\%\u0000-\u001f\u007f]/.test(x)&&!x.split('/').some(p=>p==='..'||p==='.')&&x.length>0?x:null;}
