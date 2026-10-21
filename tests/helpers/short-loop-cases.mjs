// SPDX-License-Identifier: MIT
// Original short-loop case registration, extracted without criterion changes.
export function fixtureCases(mode,stack){
 return mode==='B'?[
  {id:'P1',selector:'#p1',property:'text',value:'13',expression:'shown',valueNames:['shown','allowance']},
  {id:'P2',selector:'#p2',property:'disabled',value:false,expression:'!eligible',valueNames:['eligible']},
  {id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']},
  {id:'P5',selector:'#p5',property:'disabled',value:true,expression:'form.length < 3',valueNames:['form']},
  {id:'row-first',selector:'.row >> nth=0',property:'text',value:'12',expression:stack==='vue'?'props.row.rules.quota':'row.rules.quota',valueNames:['rules.quota'],picker:true},
  {id:'row-second',selector:'.row >> nth=1',property:'text',value:'77',expression:stack==='vue'?'props.row.rules.quota':'row.rules.quota',valueNames:['rules.quota'],picker:true}
 ]:[
  {id:'P4',selector:'#p4',property:'disabled',value:true,expression:'creditHold || !canConfirm',valueNames:['creditHold']},
  {id:'P5',selector:'#p5',property:'disabled',value:true,expression:'form.length < 3',valueNames:['form']}
 ];
}
export function independentCases(stack){return[
 {id:'first-label',selector:'.todo-list li:nth-child(1) label',property:'text',value:'Alpha short',expression:stack==='vue'?'todo.title':'title',valueNames:['title'],picker:true},
 {id:'remaining-count',selector:'.todo-count',property:'text',value:stack==='vue'?'1 item left':'1 item left!',expression:stack==='vue'?'remaining':'activeTodos.length',valueNames:stack==='vue'?['remaining']:['activeTodos.length']},
 {id:'second-label',selector:'.todo-list li:nth-child(2) label',property:'text',value:'Beta short',expression:stack==='vue'?'todo.title':'title',valueNames:['title'],picker:true}
 ];}
export const remainingStrongVariant={id:'remaining-strong-variant',selector:'.todo-count strong',property:'text',value:'1',expression:'remaining',valueNames:['remaining']};
