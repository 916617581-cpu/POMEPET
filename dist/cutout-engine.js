export function removePetBackground(image,progress,signal){
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined')return import('./vendor/cutout.js').then(({removeBackground})=>removeBackground(image,{model:'isnet_quint8',device:'cpu',output:{format:'image/png'},progress}));
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./cutout-worker.js',import.meta.url),{type:'module'});
  const finish=(error,result)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);worker.terminate();error?reject(error):resolve(result);};
  const abort=()=>finish(new DOMException('Cancelled','AbortError'));
  const timer=setTimeout(()=>finish(new Error('Processing timed out')),180000);
  signal?.addEventListener('abort',abort,{once:true});
  worker.onmessage=({data})=>{if(data.progress)progress?.(...data.progress);else finish(data.error?new Error(data.error):null,data.result);};
  worker.onerror=()=>finish(new Error('Background processing unavailable'));
  worker.postMessage({image});
 });
}
