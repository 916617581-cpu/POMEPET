import {removePetBackground} from './cutout-engine.js';
export async function photoData(file,transparent=false){
 const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas'),scale=Math.min(1,1000/Math.max(bitmap.width,bitmap.height));
 canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 if(transparent){const ctx=canvas.getContext('2d'),pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>16){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
  if(right>=left){const pad=Math.max(3,Math.ceil(Math.max(right-left+1,bottom-top+1)*.025));left=Math.max(0,left-pad);top=Math.max(0,top-pad);right=Math.min(canvas.width-1,right+pad);bottom=Math.min(canvas.height-1,bottom+pad);const fitted=document.createElement('canvas');fitted.width=right-left+1;fitted.height=bottom-top+1;fitted.getContext('2d').drawImage(canvas,left,top,fitted.width,fitted.height,0,0,fitted.width,fitted.height);return fitted.toDataURL('image/png');}
 }
 return canvas.toDataURL(transparent?'image/png':'image/jpeg',.82);
}
export function fitProfilePhoto(){const img=document.querySelector('.ui-profile-photo');if(!img?.src.startsWith('data:image/'))return;const original=img.src;fetch(original).then(r=>r.blob()).then(blob=>photoData(blob,true)).then(data=>{if(img.isConnected&&img.src===original)img.src=data;}).catch(()=>{});}
export function petPhotoDialog(file,onSave){
 if(file.size>20*1024*1024){onSave(null,'照片不能超过20MB');return;}
 const overlay=document.createElement('div');overlay.className='pet-photo-overlay';
 overlay.innerHTML=`<section class="pet-photo-dialog" role="dialog" aria-modal="true" aria-label="宠物照片"><h2>宠物照片</h2><div class="pet-photo-preview"><img alt="照片预览"></div><p role="status">正在读取照片…</p><small>照片在当前设备处理。首次抠图需要下载处理资源，可能稍久。</small><div class="pet-photo-actions"><button type="button" data-cutout>自动抠图</button><button type="button" data-original>保留原图</button></div><div class="pet-photo-actions"><button type="button" data-cancel>取消</button><button type="button" data-save disabled>保存照片</button></div></section>`;
 document.body.append(overlay);const dialog=overlay.firstElementChild,img=dialog.querySelector('img'),status=dialog.querySelector('[role=status]'),save=dialog.querySelector('[data-save]'),cut=dialog.querySelector('[data-cutout]');
 const previous=document.activeElement;let original='',result='',job=0,closed=false,controller;
 const stop=()=>{closed=true;job++;controller?.abort();overlay.remove();previous?.focus();document.removeEventListener('keydown',keydown);};
 const keydown=e=>{if(e.key==='Escape')stop();if(e.key==='Tab'){const controls=[...dialog.querySelectorAll('button:not(:disabled)')];if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus();}}};
 document.addEventListener('keydown',keydown);dialog.querySelector('[data-cancel]').onclick=stop;overlay.onclick=e=>{if(e.target===overlay)stop();};
 dialog.querySelector('[data-original]').onclick=()=>{if(!original)return;job++;controller?.abort();result=original;img.src=result;save.disabled=false;cut.disabled=false;status.textContent='已选择原图';};
 save.onclick=()=>{if(!result)return;const selected=result;stop();onSave(selected);};
 const process=async()=>{const current=++job;cut.disabled=true;save.disabled=true;status.textContent='正在自动抠图…';
  try{controller=new AbortController();const blob=await (await fetch(original)).blob();const foreground=await removePetBackground(blob,(key,done,total)=>{if(closed||current!==job)return;status.textContent=key.startsWith('fetch:')?'正在准备抠图资源'+(total?' '+Math.round(done/total*100)+'%':''):'正在识别宠物…';},controller.signal);const next=await photoData(foreground,true);if(closed||current!==job)return;result=next;img.src=next;status.textContent='抠图完成，可保存或切回原图';}
  catch{if(closed||current!==job)return;result=original;img.src=original;status.textContent='暂时无法抠图，可重试或保留原图';}
  finally{if(!closed&&current===job){cut.disabled=false;save.disabled=false;}}
 };
 cut.onclick=process;
 photoData(file,file.type==='image/png').then(data=>{if(closed)return;original=data;result=data;img.src=data;status.textContent='正在准备自动抠图…';cut.focus();process();}).catch(()=>{if(!closed){status.textContent='图片读取失败，请换一张照片';cut.disabled=true;}});
}
