var r={};r.byteLength=o;r.toByteArray=h;r.fromByteArray=l;var a=[];var v=[];var t=typeof Uint8Array!=="undefined"?Uint8Array:Array;var n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";for(var f=0,i=n.length;f<i;++f){a[f]=n[f];v[n.charCodeAt(f)]=f}v["-".charCodeAt(0)]=62;v["_".charCodeAt(0)]=63;function e(r){var a=r.length;if(a%4>0){throw new Error("Invalid string. Length must be a multiple of 4")}var v=r.indexOf("=");if(v===-1)v=a;var t=v===a?0:4-v%4;return[v,t]}function o(r){var a=e(r);var v=a[0];var t=a[1];return(v+t)*3/4-t}function u(r,a,v){return(a+v)*3/4-v}function h(r){var a;var n=e(r);var f=n[0];var i=n[1];var o=new t(u(r,f,i));var h=0;var s=i>0?f-4:f;var M;for(M=0;M<s;M+=4){a=v[r.charCodeAt(M)]<<18|v[r.charCodeAt(M+1)]<<12|v[r.charCodeAt(M+2)]<<6|v[r.charCodeAt(M+3)];o[h++]=a>>16&255;o[h++]=a>>8&255;o[h++]=a&255}if(i===2){a=v[r.charCodeAt(M)]<<2|v[r.charCodeAt(M+1)]>>4;o[h++]=a&255}if(i===1){a=v[r.charCodeAt(M)]<<10|v[r.charCodeAt(M+1)]<<4|v[r.charCodeAt(M+2)]>>2;o[h++]=a>>8&255;o[h++]=a&255}return o}function s(r){return a[r>>18&63]+a[r>>12&63]+a[r>>6&63]+a[r&63]}function M(r,a,v){var t;var n=[];for(var f=a;f<v;f+=3){t=(r[f]<<16&16711680)+(r[f+1]<<8&65280)+(r[f+2]&255);n.push(s(t))}return n.join("")}function l(r){var v;var t=r.length;var n=t%3;var f=[];var i=16383;for(var e=0,o=t-n;e<o;e+=i){f.push(M(r,e,e+i>o?o:e+i))}if(n===1){v=r[t-1];f.push(a[v>>2]+a[v<<4&63]+"==")}else if(n===2){v=(r[t-2]<<8)+r[t-1];f.push(a[v>>10]+a[v>>4&63]+a[v<<2&63]+"=")}return f.join("")}var c={};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */c.read=function(r,a,v,t,n){var f,i;var e=n*8-t-1;var o=(1<<e)-1;var u=o>>1;var h=-7;var s=v?n-1:0;var M=v?-1:1;var l=r[a+s];s+=M;f=l&(1<<-h)-1;l>>=-h;h+=e;for(;h>0;f=f*256+r[a+s],s+=M,h-=8){}i=f&(1<<-h)-1;f>>=-h;h+=t;for(;h>0;i=i*256+r[a+s],s+=M,h-=8){}if(f===0){f=1-u}else if(f===o){return i?NaN:(l?-1:1)*Infinity}else{i=i+Math.pow(2,t);f=f-u}return(l?-1:1)*i*Math.pow(2,f-t)};c.write=function(r,a,v,t,n,f){var i,e,o;var u=f*8-n-1;var h=(1<<u)-1;var s=h>>1;var M=n===23?Math.pow(2,-24)-Math.pow(2,-77):0;var l=t?0:f-1;var c=t?1:-1;var y=a<0||a===0&&1/a<0?1:0;a=Math.abs(a);if(isNaN(a)||a===Infinity){e=isNaN(a)?1:0;i=h}else{i=Math.floor(Math.log(a)/Math.LN2);if(a*(o=Math.pow(2,-i))<1){i--;o*=2}if(i+s>=1){a+=M/o}else{a+=M*Math.pow(2,1-s)}if(a*o>=2){i++;o/=2}if(i+s>=h){e=0;i=h}else if(i+s>=1){e=(a*o-1)*Math.pow(2,n);i=i+s}else{e=a*Math.pow(2,s-1)*Math.pow(2,n);i=0}}for(;n>=8;r[v+l]=e&255,l+=c,e/=256,n-=8){}i=i<<n|e;u+=n;for(;u>0;r[v+l]=i&255,l+=c,i/=256,u-=8){}r[v+l-c]|=y*128};export{r as b,c as i};
//# sourceMappingURL=p-a1e2c03e.js.map