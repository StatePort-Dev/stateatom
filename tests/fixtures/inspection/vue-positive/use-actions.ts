export function useCounter(counter:{value:number}){
 function submit(){(window as any).vueInvocations++;counter.value+=2;}
 return {submit};
}
