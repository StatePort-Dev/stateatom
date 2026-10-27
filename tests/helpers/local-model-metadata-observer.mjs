// SPDX-License-Identifier: Apache-2.0
// Self-contained test observer for one real native metadata invocation. No session API.
// Serialized into the owned top-level extension document by the native driver.
export async function observeNativeModelMetadata(timeoutMs=30000){
 if(!Number.isFinite(timeoutMs)||timeoutMs<1||timeoutMs>30000)throw Error('MODEL_METADATA_DEADLINE');
 const options={expectedInputs:[{type:'text',languages:['en']}],expectedOutputs:[{type:'text',languages:['en']}]};
 const started=performance.now();let model,method,invocations=0,timer;
 const finish=record=>({languageModelType:typeof model,methodType:typeof method,availabilityInvocations:invocations,options,timeoutMs,elapsedMs:performance.now()-started,state:null,...record});
 const exception=error=>{
  let errorName='Unknown';try{const name=error?.name;if(['Error','TypeError','NotSupportedError','InvalidStateError','NotAllowedError','OperationError','AbortError','SecurityError','QuotaExceededError','NetworkError','UnknownError'].includes(name))errorName=name;}catch{}
  return {outcome:'exception',errorName};
 };
 try{
  model=globalThis.LanguageModel;if(!model)return finish({outcome:'api-missing'});
  method=model.availability;if(typeof method!=='function')return finish({outcome:'method-missing'});
  const pending=new Promise(resolve=>{timer=setTimeout(()=>resolve({outcome:'pending'}),timeoutMs);});
  const observation=Promise.resolve().then(()=>{invocations++;return Reflect.apply(method,model,[options]);}).then(value=>['available','downloadable','downloading','unavailable'].includes(value)?{outcome:'resolved',state:value}:{outcome:'unrecognized',valueType:typeof value},exception);
  return finish(await Promise.race([observation,pending]));
 }catch(error){return finish(exception(error));}
 finally{clearTimeout(timer);}
}
