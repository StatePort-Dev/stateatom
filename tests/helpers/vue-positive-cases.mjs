// SPDX-License-Identifier: Apache-2.0
// Registered independently of the mechanism; never passed to the analyzer/page.
export const vuePositiveProperties=[
 {id:'direct',property:'text',value:'7',expression:'count',read:'count'},
 {id:'computed',property:'text',value:'21',expression:'scaled',read:'scaled'},
 {id:'condition',property:'disabled',value:true,expression:'scaled < 25',read:'scaled'},
 {id:'library',property:'disabled',value:true,expression:'routeBlocked',read:'routeBlocked'},
 {id:'row-value-first',property:'text',value:'4',expression:'shown',read:'shown'},
 {id:'row-value-second',property:'text',value:'10',expression:'shown',read:'shown'}
];
export const vuePositiveActions=[
 {id:'condition',symbol:'ordinary',status:'Code-linked'},
 {id:'method',symbol:'ordinary',status:'Code-linked'},
 {id:'composable',symbol:'submit',status:'Code-linked',relation:'returns-handler'},
 {id:'row-first',symbol:'submit',status:'Code-linked',relation:'returns-handler'},
 {id:'row-second',symbol:'submit',status:'Code-linked',relation:'returns-handler'},
 {id:'replaced',status:'Unknown/Unsupported'}
];
