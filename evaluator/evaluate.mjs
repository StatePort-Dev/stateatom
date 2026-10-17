// Evaluator owns truth. Runtime modules never import this directory.
export function score(state,experiment,truth,expected){
 const source=state.analysis.sources.find(s=>s.file===(expected[4]?.file||'')&&s.line===expected[4]?.line&&s.column===expected[4]?.column&&s.endLine===expected[4]?.endLine&&s.endColumn===expected[4]?.endColumn);
 const definition=source?.definitions.find(d=>d.name===expected[2]&&d.line===expected[3]&&d.column===expected[4]?.definitionColumn);
 const field=experiment?.field;
 const correctField=field?.url.endsWith(truth.request)&&field?.path===truth.path;
 const influence=experiment?.status==='Experimentally verified';
 const candidate=state.analysis.fields.some(f=>f.url.endsWith(truth.request)&&f.path===truth.path&&f.status==='Candidate');
 const stable=experiment?.trials?.every(t=>t.a===truth.baseline&&t.rollback===truth.baseline&&t.control===truth.baseline&&(!truth.positive||t.b===truth.changed));
 return {sourceRange:!!source,variableDefinition:!!definition,request:!!(influence&&correctField),jsonPath:!!(influence&&correctField),candidateField:candidate,influence:!!(influence&&correctField&&stable),unknown:!influence,falsePositive:influence&&(!truth.positive||!correctField),passed:truth.positive?!!(influence&&correctField&&stable):!influence,intermediateRuntimeDataflow:false};
}
