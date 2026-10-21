// SPDX-License-Identifier: Apache-2.0
import test from 'node:test';
import assert from 'node:assert/strict';
import {localDerivedSchemaProbe,forwardDerivedSchemaProbe} from './fixtures/local-derived-schema-probe.mjs';
import {projectDerivedAnnotation,derivedAnnotationResponseConstraint,buildDerivedAnnotationPrompt,validateDerivedAnnotationStructure} from '../core/derived-annotations.mjs';
test('real schema probe compares identical genuine facts/prompt with exactly one forwarded keyword omitted',()=>{
 const rows=localDerivedSchemaProbe();assert.equal(rows.length,2);
 assert.equal(rows[0].facts,rows[1].facts);assert.deepEqual(rows.map(c=>c.schemaVariant),['full','without-unique-items']);
 const p=projectDerivedAnnotation(rows[0].facts),schema=derivedAnnotationResponseConstraint(p),before=JSON.stringify(schema);
 const full=forwardDerivedSchemaProbe(schema,rows[0].schemaVariant),variant=forwardDerivedSchemaProbe(schema,rows[1].schemaVariant);
 assert.deepEqual(full,schema);assert.equal(full.properties.factTokens.uniqueItems,true);
 assert(!Object.hasOwn(variant.properties.factTokens,'uniqueItems'));
 variant.properties.factTokens.uniqueItems=true;assert.deepEqual(variant,full);assert.equal(JSON.stringify(schema),before);
 assert.equal(buildDerivedAnnotationPrompt(projectDerivedAnnotation(rows[0].facts)),buildDerivedAnnotationPrompt(projectDerivedAnnotation(rows[1].facts)));
 assert.throws(()=>forwardDerivedSchemaProbe(schema,'unknown'));
 assert.throws(()=>validateDerivedAnnotationStructure(JSON.stringify({schema:'stateatom.local-derived-annotation/1',text:'A separate test.',factTokens:['summary','summary']}),p,rows[0].facts));
});
