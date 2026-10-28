// SPDX-License-Identifier: Apache-2.0
// Separate helper process for private-channel transport qualification only.
import {randomBytes} from 'node:crypto';import {startBridge} from '../../core/bridge.mjs';
let bridge;process.once('message',async({root})=>{try{bridge=startBridge({root,port:0,token:randomBytes(32).toString('hex'),onOpen:async()=>({opened:false,reason:'Source transport qualification; no installed IDE'}),onDefinitions:async()=>[],onReferences:async()=>[]});await bridge.ready;bridge.cfg.port=bridge.server.address().port;process.send({ready:true,port:bridge.cfg.port,token:bridge.cfg.token,helper:bridge.helper,workspace:bridge.workspace});process.on('message',async m=>{if(m.close){await bridge.close();process.disconnect();}});}catch(e){process.send({error:e.message});process.disconnect();}});
process.once('disconnect',()=>{if(bridge)void bridge.close();});
