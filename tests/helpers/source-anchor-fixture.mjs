// SPDX-License-Identifier: Apache-2.0
export function sourceAnchorFixture(){
 const context={schema:1,tabId:7,frameId:'frame-main',run:'run',inspection:1,sourceGeneration:0,document:'cdp:101',instance:'cdp:109',build:'b'.repeat(64),observedAt:100};
 const binding={id:'native:0',event:'click',status:'Observed',mechanism:'dom-listener',registeredOn:'selected-element',freshness:'snapshot',identity:{...context,sourceRevision:null},execution:{status:'not-observed'},registration:{scriptId:'9',line:1,column:4,positionBase:'one-based',selectedDocument:context.document,selectedNode:context.instance,registeredNode:context.instance,snapshotId:'native-read-1',readAt:101,nodeId:9}};
 const maps={status:'Connected',epoch:'run',scripts:[{scriptId:'9',executionContextId:3,frameId:context.frameId,cdpHash:'a'.repeat(64),cdpHashDomain:'v8-script-content-sha256',startLine:0,startColumn:0,endLine:0,endColumn:32,special:false,map:null}]};return{context,binding,maps};
}
