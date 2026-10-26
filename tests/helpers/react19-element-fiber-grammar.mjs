// SPDX-License-Identifier: Apache-2.0
// Owned minimal source grammar. Not copied React, not a real native runtime.
export const elementFiberGrammar=`'use strict';
function createFiberFromTypeAndProps(type,key,props,owner,mode,lanes){return create(type,key,props,owner,mode,lanes);}
function useFiber(fiber,pendingProps){return reuse(fiber,pendingProps);}
function createFiberFromElement(element,mode,lanes){
 mode=createFiberFromTypeAndProps(element.type,element.key,element.props,element._owner,mode,lanes);
 finish(mode);return mode;
}
function updateElement(returnFiber,current,element,lanes){
 if(current)return (current=useFiber(current,element.props),finish(current),current);
 return createFiberFromElement(element,returnFiber.mode,lanes);
}
function reconcileChildFibersImpl(returnFiber,currentFirstChild,newChild,lanes){
 lanes=useFiber(currentFirstChild,newChild.props);finish(lanes);return lanes;
}
exports.create=createFiberFromElement;exports.update=updateElement;exports.single=reconcileChildFibersImpl;`;
