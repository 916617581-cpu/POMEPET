import {removeBackground} from './vendor/cutout.js';
self.onmessage=async({data})=>{
 try{const result=await removeBackground(data.image,{model:'isnet_quint8',device:'cpu',proxyToWorker:false,output:{format:'image/png',quality:1},progress:(key,current,total)=>self.postMessage({progress:[key,current,total]})});self.postMessage({result});}
 catch(error){self.postMessage({error:error.message});}
};
