// SPDX-License-Identifier: Apache-2.0
import {SOURCE_PARSE_WIRE_BYTES} from '../../../core/source-parse-wire.mjs';
import {sourceParseError} from '../../../core/source-parse-contract.mjs';
export const SOURCE_PARSE_PORT='stateatom.source-parser/1',SOURCE_PARSE_CHANNEL='stateatom.source-parser-port/1';
export function sourceParseFrame(m,keys){
 if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).sort().join(',')!==keys.slice().sort().join(',')||m.schema!==SOURCE_PARSE_CHANNEL)throw sourceParseError('SOURCE_PARSE_INVALID');
 let n;try{n=new TextEncoder().encode(JSON.stringify(m)).length;}catch{throw sourceParseError('SOURCE_PARSE_INVALID');}if(n>SOURCE_PARSE_WIRE_BYTES)throw sourceParseError('SOURCE_PARSE_BUDGET');
}
