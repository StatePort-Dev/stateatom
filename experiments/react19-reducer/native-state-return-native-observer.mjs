// SPDX-License-Identifier: Apache-2.0
// Same private App token, separate source-path and native-reference companions.
import {createAppMainPropsObserver} from './app-main-props-observer.mjs';
import {createNativeStateReturnObserver} from './native-state-return-observer.mjs';
export function createNativeStateReturnNativeObserver({page,enabled=true,policy}={}){
 const create=Object.create,define=Object.defineProperty,freeze=Object.freeze,keys=Object.keys,own=Object.getOwnPropertyDescriptor,has=Object.hasOwn;
 const value=(o,k)=>{const d=own(o,k);if(!d||!has(d,'value'))throw TypeError('Owned compositor policy required');return d.value;};
 const dto=fields=>{const o=create(null),names=keys(fields);for(let i=0;i<names.length;i++){const d=create(null);d.value=fields[names[i]];d.enumerable=true;define(o,names[i],d);}return freeze(o);};
 const appPolicy=value(policy,'app'),base=createAppMainPropsObserver({page,enabled,policy:{app:appPolicy,main:value(policy,'main'),configSite:value(policy,'configSite')}}),native=createNativeStateReturnObserver({page,enabled,policy:{app:appPolicy,native:value(policy,'native')}});
 const a=base.appHook;
 const appHook=dto({appEnter(tag,component){const token=a.appEnter(tag);native.appEnter(token,component,tag);return token;},
  result(token,tuple,method,tag){const r=a.result(token,tuple,method,tag);native.result(token,tuple,method,tag);return r;},
  bound(token,tuple,state,dispatch,tag){a.bound(token,tuple,state,dispatch,tag);native.bound(token,tuple,state,dispatch,tag);},
  config:a.config,
  appReturned(token,v){const r=a.appReturned(token,v);native.returned(token,v);return r;},
  appExit(token){a.appExit(token);native.exit(token);}
 });
 const retention=()=>dto({...base.retention(),nativeReturn:native.retention()});
 function sealWindow(){const source=base.sealWindow(),n=native.sealWindow();return dto({...source,retention:retention(),nativeReturn:n});}
 function startWindow(label){const source=base.startWindow(label);native.startWindow(label);return source;}
 function stop(){base.stop();native.stop();}
 return dto({appHook,mainInput:base.mainInput,tap:base.tap,config:base.config,nativeTap:native.nativeTap,snapshot:base.snapshot,lookup:base.lookup,retention,sealWindow,startWindow,stop});
}
