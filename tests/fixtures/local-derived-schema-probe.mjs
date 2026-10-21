// SPDX-License-Identifier: Apache-2.0
// Focused real API compatibility control; never part of the quality corpus.
import {localDerivedCorpus} from './local-derived-corpus.mjs';
export function localDerivedSchemaProbe(){
 const first=localDerivedCorpus()[0];
 return ['full','without-unique-items'].map(schemaVariant=>({...first,id:'schema-probe:'+schemaVariant,campaign:'schema-probe2',schemaVariant,expected:'Compatibility control only; no factual or usefulness acceptance.'}));
}
export function forwardDerivedSchemaProbe(schema,variant){
 if(!['full','without-unique-items'].includes(variant))throw Error('Unknown schema probe variant');
 if(schema?.properties?.factTokens?.uniqueItems!==true)throw Error('Historical probe requires its original full uniqueItems schema');
 const forwarded=JSON.parse(JSON.stringify(schema));
 if(variant==='without-unique-items')delete forwarded.properties.factTokens.uniqueItems;
 return forwarded;
}
