// SPDX-License-Identifier: Apache-2.0
// Owned minimal grammar/call controls; not a real React renderer or copied vendor body.
export const memoBranchGrammar=`'use strict';
function updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes){return update(current,workInProgress,Component,nextProps,renderLanes);}
function bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes){return skip(current,workInProgress,renderLanes);}
function updateSimpleMemoComponent(current,workInProgress,Component,nextProps,renderLanes){
 if(current!==null&&reusePrevious(current,nextProps)){
  nextProps=current.memoizedProps;workInProgress.pendingProps=nextProps;
  if(!hasUpdate(current,renderLanes))return bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes);
 }
 return updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes);
}
exports.run=updateSimpleMemoComponent;`;
