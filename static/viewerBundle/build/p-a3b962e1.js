import{g as e}from"./p-5f82f117.js";const t=Symbol(),n=Symbol(),r="a",o="w";let a=(e,t)=>new Proxy(e,t);const i=Object.getPrototypeOf,s=new WeakMap,c=e=>e&&(s.has(e)?s.get(e):i(e)===Object.prototype||i(e)===Array.prototype),l=e=>"object"==typeof e&&null!==e,u=e=>{if(Array.isArray(e))return Array.from(e);const t=Object.getOwnPropertyDescriptors(e);return Object.values(t).forEach((e=>{e.configurable=!0})),Object.create(i(e),t)},f=e=>e[n]||e,d=(e,i,s,l)=>{if(!c(e))return e;let v=l&&l.get(e);if(!v){const t=f(e);v=(e=>Object.values(Object.getOwnPropertyDescriptors(e)).some((e=>!e.configurable&&!e.writable)))(t)?[t,u(t)]:[t],null==l||l.set(e,v)}const[p,b]=v;let m=s&&s.get(p);return m&&m[1].f===!!b||(m=((e,a)=>{const i={f:a};let s=!1;const c=(t,n)=>{if(!s){let a=i[r].get(e);if(a||(a={},i[r].set(e,a)),t===o)a[o]=!0;else{let e=a[t];e||(e=new Set,a[t]=e),e.add(n)}}},l={get:(t,o)=>o===n?e:(c("k",o),d(Reflect.get(t,o),i[r],i.c,i.t)),has:(n,o)=>o===t?(s=!0,i[r].delete(e),!0):(c("h",o),Reflect.has(n,o)),getOwnPropertyDescriptor:(e,t)=>(c("o",t),Reflect.getOwnPropertyDescriptor(e,t)),ownKeys:e=>(c(o),Reflect.ownKeys(e))};return a&&(l.set=l.deleteProperty=()=>!1),[l,i]})(p,!!b),m[1].p=a(b||p,m[0]),s&&s.set(p,m)),m[1][r]=i,m[1].c=s,m[1].t=l,m[1].p},v=(e,t,n,r)=>{if(Object.is(e,t))return!1;if(!l(e)||!l(t))return!0;const a=n.get(f(e));if(!a)return!0;if(r){const n=r.get(e);if(n&&n.n===t)return n.g;r.set(e,{n:t,g:!1})}let i=null;try{for(const n of a.h||[])if(i=Reflect.has(e,n)!==Reflect.has(t,n),i)return i;if(!0===a[o]){if(i=((e,t)=>{const n=Reflect.ownKeys(e),r=Reflect.ownKeys(t);return n.length!==r.length||n.some(((e,t)=>e!==r[t]))})(e,t),i)return i}else for(const n of a.o||[])if(i=!!Reflect.getOwnPropertyDescriptor(e,n)!=!!Reflect.getOwnPropertyDescriptor(t,n),i)return i;for(const o of a.k||[])if(i=v(e[o],t[o],n,r),i)return i;return null===i&&(i=!0),i}finally{r&&r.set(e,{n:t,g:i})}},p=e=>!!c(e)&&t in e,b=e=>c(e)&&e[n]||null,m=(e,t=!0)=>{s.set(e,t)},g=(e,t,n)=>{const r=[],a=new WeakSet,i=(e,s)=>{if(a.has(e))return;l(e)&&a.add(e);const c=l(e)&&t.get(f(e));if(c){var u,d;if(null==(u=c.h)||u.forEach((e=>{const t=`:has(${String(e)})`;r.push(s?[...s,t]:[t])})),!0===c[o]){const e=":ownKeys";r.push(s?[...s,e]:[e])}else{var v;null==(v=c.o)||v.forEach((e=>{const t=`:hasOwn(${String(e)})`;r.push(s?[...s,t]:[t])}))}null==(d=c.k)||d.forEach((t=>{n&&!("value"in(Object.getOwnPropertyDescriptor(e,t)||{}))||i(e[t],s?[...s,t]:[t])}))}else s&&r.push(s)};return i(e),r},w=e=>{a=e};const h=Object.freeze({__proto__:null,affectedToPathList:g,createProxy:d,getUntracked:b,isChanged:v,markToTrack:m,replaceNewProxy:w,trackMemo:p});const y=e(h);var O=y;var j=function e(t){return typeof t==="object"&&t!==null};var I=new WeakMap;var W=new WeakSet;var k=function e(t,n,r,o,a,i,s,c,l){if(t===void 0){t=Object.is}if(n===void 0){n=function e(t,n){return new Proxy(t,n)}}if(r===void 0){r=function e(t){return j(t)&&!W.has(t)&&(Array.isArray(t)||!(Symbol.iterator in t))&&!(t instanceof WeakMap)&&!(t instanceof WeakSet)&&!(t instanceof Error)&&!(t instanceof Number)&&!(t instanceof Date)&&!(t instanceof String)&&!(t instanceof RegExp)&&!(t instanceof ArrayBuffer)}}if(o===void 0){o=function e(t){switch(t.status){case"fulfilled":return t.value;case"rejected":throw t.reason;default:throw t}}}if(a===void 0){a=new WeakMap}if(i===void 0){i=function(e){function t(t,n,r){return e.apply(this,arguments)}t.toString=function(){return e.toString()};return t}((function(e,t,n){if(n===void 0){n=o}var r=a.get(e);if((r==null?void 0:r[0])===t){return r[1]}var s=Array.isArray(e)?[]:Object.create(Object.getPrototypeOf(e));O.markToTrack(s,true);a.set(e,[t,s]);Reflect.ownKeys(e).forEach((function(t){if(Object.getOwnPropertyDescriptor(s,t)){return}var r=Reflect.get(e,t);var o={value:r,enumerable:true,configurable:true};if(W.has(r)){O.markToTrack(r,false)}else if(r instanceof Promise){delete o.value;o.get=function(){return n(r)}}else if(I.has(r)){var a=I.get(r),c=a[0],l=a[1];o.value=i(c,l(),n)}Object.defineProperty(s,t,o)}));return Object.preventExtensions(s)}))}if(s===void 0){s=new WeakMap}if(c===void 0){c=[1,1]}if(l===void 0){l=function e(o){if(!j(o)){throw new Error("object required")}var a=s.get(o);if(a){return a}var u=c[0];var f=new Set;var d=function e(t,n){if(n===void 0){n=++c[0]}if(u!==n){u=n;f.forEach((function(e){return e(t,n)}))}};var v=c[1];var p=function e(t){if(t===void 0){t=++c[1]}if(v!==t&&!f.size){v=t;m.forEach((function(e){var n=e[0];var r=n[1](t);if(r>u){u=r}}))}return u};var b=function e(t){return function(e,n){var r=[].concat(e);r[1]=[t].concat(r[1]);d(r,n)}};var m=new Map;var g=function e(t,n){if(f.size){var r=n[3](b(t));m.set(t,[n,r])}else{m.set(t,[n])}};var w=function e(t){var n=m.get(t);if(n){var r;m.delete(t);(r=n[1])==null?void 0:r.call(n)}};var h=function e(t){f.add(t);if(f.size===1){m.forEach((function(e,t){var n=e[0];var r=n[3](b(t));m.set(t,[n,r])}))}var n=function e(){f.delete(t);if(f.size===0){m.forEach((function(e,t){var n=e[0],r=e[1];if(r){r();m.set(t,[n])}}))}};return n};var y=Array.isArray(o)?[]:Object.create(Object.getPrototypeOf(o));var k={deleteProperty:function e(t,n){var r=Reflect.get(t,n);w(n);var o=Reflect.deleteProperty(t,n);if(o){d(["delete",[n],r])}return o},set:function e(n,o,a,i){var c=Reflect.has(n,o);var u=Reflect.get(n,o,i);if(c&&(t(u,a)||s.has(a)&&t(u,s.get(a)))){return true}w(o);if(j(a)){a=O.getUntracked(a)||a}var f=a;if(a instanceof Promise){a.then((function(e){a.status="fulfilled";a.value=e;d(["resolve",[o],e])})).catch((function(e){a.status="rejected";a.reason=e;d(["reject",[o],e])}))}else{if(!I.has(a)&&r(a)){f=l(a)}var v=!W.has(f)&&I.get(f);if(v){g(o,v)}}Reflect.set(n,o,f,i);d(["set",[o],a,u]);return true}};var C=n(y,k);s.set(o,C);var L=[y,p,i,h];I.set(C,L);Reflect.ownKeys(o).forEach((function(e){var t=Object.getOwnPropertyDescriptor(o,e);if("value"in t){C[e]=o[e];delete t.value;delete t.writable}Object.defineProperty(y,e,t)}));return C}}return[l,I,W,t,n,r,o,a,i,s,c]};var C=k(),L=C[0];function R(e){if(e===void 0){e={}}return L(e)}function A(e,t,n){var r=I.get(e);var o;var a=[];var i=r[3];var s=false;var c=function e(r){a.push(r);if(n){t(a.splice(0));return}if(!o){o=Promise.resolve().then((function(){o=undefined;if(s){t(a.splice(0))}}))}};var l=i(c);s=true;return function(){s=false;l()}}function S(e,t){var n=I.get(e);var r=n,o=r[0],a=r[1],i=r[2];return i(o,a(),t)}var M=R;var E=S;var U=A;const D=M({history:["ConnectWallet"],view:"ConnectWallet",data:void 0}),$={state:D,subscribe(e){return U(D,(()=>e(D)))},push(e,t){e!==D.view&&(D.view=e,t&&(D.data=t),D.history.push(e))},reset(e){D.view=e,D.history=[e]},replace(e){D.history.length>1&&(D.history[D.history.length-1]=e,D.view=e)},goBack(){if(D.history.length>1){D.history.pop();const[e]=D.history.slice(-1);D.view=e}},setData(e){D.data=e}},x={WALLETCONNECT_DEEPLINK_CHOICE:"WALLETCONNECT_DEEPLINK_CHOICE",WCM_VERSION:"WCM_VERSION",RECOMMENDED_WALLET_AMOUNT:9,isMobile(){return typeof window<"u"?Boolean(window.matchMedia("(pointer:coarse)").matches||/Android|webOS|iPhone|iPad|iPod|BlackBerry|Opera Mini/u.test(navigator.userAgent)):!1},isAndroid(){return x.isMobile()&&navigator.userAgent.toLowerCase().includes("android")},isIos(){const e=navigator.userAgent.toLowerCase();return x.isMobile()&&(e.includes("iphone")||e.includes("ipad"))},isHttpUrl(e){return e.startsWith("http://")||e.startsWith("https://")},isArray(e){return Array.isArray(e)&&e.length>0},formatNativeUrl(e,t,n){if(x.isHttpUrl(e))return this.formatUniversalUrl(e,t,n);let r=e;r.includes("://")||(r=e.replaceAll("/","").replaceAll(":",""),r=`${r}://`),r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,n);const o=encodeURIComponent(t);return`${r}wc?uri=${o}`},formatUniversalUrl(e,t,n){if(!x.isHttpUrl(e))return this.formatNativeUrl(e,t,n);let r=e;r.endsWith("/")||(r=`${r}/`),this.setWalletConnectDeepLink(r,n);const o=encodeURIComponent(t);return`${r}wc?uri=${o}`},async wait(e){return new Promise((t=>{setTimeout(t,e)}))},openHref(e,t){window.open(e,t,"noreferrer noopener")},setWalletConnectDeepLink(e,t){try{localStorage.setItem(x.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:e,name:t}))}catch{console.info("Unable to set WalletConnect deep link")}},setWalletConnectAndroidDeepLink(e){try{const[t]=e.split("?");localStorage.setItem(x.WALLETCONNECT_DEEPLINK_CHOICE,JSON.stringify({href:t,name:"Android"}))}catch{console.info("Unable to set WalletConnect android deep link")}},removeWalletConnectDeepLink(){try{localStorage.removeItem(x.WALLETCONNECT_DEEPLINK_CHOICE)}catch{console.info("Unable to remove WalletConnect deep link")}},setModalVersionInStorage(){try{typeof localStorage<"u"&&localStorage.setItem(x.WCM_VERSION,"2.6.2")}catch{console.info("Unable to set Web3Modal version in storage")}},getWalletRouterData(){var e;const t=(e=$.state.data)==null?void 0:e.Wallet;if(!t)throw new Error('Missing "Wallet" view data');return t}},P=typeof location<"u"&&(location.hostname.includes("localhost")||location.protocol.includes("https")),_=M({enabled:P,userSessionId:"",events:[],connectedWalletId:void 0}),N={state:_,subscribe(e){return U(_.events,(()=>e(E(_.events[_.events.length-1]))))},initialize(){_.enabled&&typeof(crypto==null?void 0:crypto.randomUUID)<"u"&&(_.userSessionId=crypto.randomUUID())},setConnectedWalletId(e){_.connectedWalletId=e},click(e){if(_.enabled){const t={type:"CLICK",name:e.name,userSessionId:_.userSessionId,timestamp:Date.now(),data:e};_.events.push(t)}},track(e){if(_.enabled){const t={type:"TRACK",name:e.name,userSessionId:_.userSessionId,timestamp:Date.now(),data:e};_.events.push(t)}},view(e){if(_.enabled){const t={type:"VIEW",name:e.name,userSessionId:_.userSessionId,timestamp:Date.now(),data:e};_.events.push(t)}}},T=M({chains:void 0,walletConnectUri:void 0,isAuth:!1,isCustomDesktop:!1,isCustomMobile:!1,isDataLoaded:!1,isUiLoaded:!1}),B={state:T,subscribe(e){return U(T,(()=>e(T)))},setChains(e){T.chains=e},setWalletConnectUri(e){T.walletConnectUri=e},setIsCustomDesktop(e){T.isCustomDesktop=e},setIsCustomMobile(e){T.isCustomMobile=e},setIsDataLoaded(e){T.isDataLoaded=e},setIsUiLoaded(e){T.isUiLoaded=e},setIsAuth(e){T.isAuth=e}},V=M({projectId:"",mobileWallets:void 0,desktopWallets:void 0,walletImages:void 0,chains:void 0,enableAuthMode:!1,enableExplorer:!0,explorerExcludedWalletIds:void 0,explorerRecommendedWalletIds:void 0,termsOfServiceUrl:void 0,privacyPolicyUrl:void 0}),K={state:V,subscribe(e){return U(V,(()=>e(V)))},setConfig(e){var t,n;N.initialize(),B.setChains(e.chains),B.setIsAuth(Boolean(e.enableAuthMode)),B.setIsCustomMobile(Boolean((t=e.mobileWallets)==null?void 0:t.length)),B.setIsCustomDesktop(Boolean((n=e.desktopWallets)==null?void 0:n.length)),x.setModalVersionInStorage(),Object.assign(V,e)}};var H=Object.defineProperty,J=Object.getOwnPropertySymbols,q=Object.prototype.hasOwnProperty,z=Object.prototype.propertyIsEnumerable,F=(e,t,n)=>t in e?H(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,G=(e,t)=>{for(var n in t||(t={}))q.call(t,n)&&F(e,n,t[n]);if(J)for(var n of J(t))z.call(t,n)&&F(e,n,t[n]);return e};const Q="https://explorer-api.walletconnect.com",X="wcm",Y="js-2.6.2";async function Z(e,t){const n=G({sdkType:X,sdkVersion:Y},t),r=new URL(e,Q);return r.searchParams.append("projectId",K.state.projectId),Object.entries(n).forEach((([e,t])=>{t&&r.searchParams.append(e,String(t))})),(await fetch(r)).json()}const ee={async getDesktopListings(e){return Z("/w3m/v1/getDesktopListings",e)},async getMobileListings(e){return Z("/w3m/v1/getMobileListings",e)},async getInjectedListings(e){return Z("/w3m/v1/getInjectedListings",e)},async getAllListings(e){return Z("/w3m/v1/getAllListings",e)},getWalletImageUrl(e){return`${Q}/w3m/v1/getWalletImage/${e}?projectId=${K.state.projectId}&sdkType=${X}&sdkVersion=${Y}`},getAssetImageUrl(e){return`${Q}/w3m/v1/getAssetImage/${e}?projectId=${K.state.projectId}&sdkType=${X}&sdkVersion=${Y}`}};var te=Object.defineProperty,ne=Object.getOwnPropertySymbols,re=Object.prototype.hasOwnProperty,oe=Object.prototype.propertyIsEnumerable,ae=(e,t,n)=>t in e?te(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ie=(e,t)=>{for(var n in t||(t={}))re.call(t,n)&&ae(e,n,t[n]);if(ne)for(var n of ne(t))oe.call(t,n)&&ae(e,n,t[n]);return e};const se=x.isMobile(),ce=M({wallets:{listings:[],total:0,page:1},search:{listings:[],total:0,page:1},recomendedWallets:[]}),le={state:ce,async getRecomendedWallets(){const{explorerRecommendedWalletIds:e,explorerExcludedWalletIds:t}=K.state;if(e==="NONE"||t==="ALL"&&!e)return ce.recomendedWallets;if(x.isArray(e)){const t={recommendedIds:e.join(",")},{listings:n}=await ee.getAllListings(t),r=Object.values(n);r.sort(((t,n)=>{const r=e.indexOf(t.id),o=e.indexOf(n.id);return r-o})),ce.recomendedWallets=r}else{const{chains:e,isAuth:n}=B.state,r=e?.join(","),o=x.isArray(t),a={page:1,sdks:n?"auth_v1":void 0,entries:x.RECOMMENDED_WALLET_AMOUNT,chains:r,version:2,excludedIds:o?t.join(","):void 0},{listings:i}=se?await ee.getMobileListings(a):await ee.getDesktopListings(a);ce.recomendedWallets=Object.values(i)}return ce.recomendedWallets},async getWallets(e){const t=ie({},e),{explorerRecommendedWalletIds:n,explorerExcludedWalletIds:r}=K.state,{recomendedWallets:o}=ce;if(r==="ALL")return ce.wallets;o.length?t.excludedIds=o.map((e=>e.id)).join(","):x.isArray(n)&&(t.excludedIds=n.join(",")),x.isArray(r)&&(t.excludedIds=[t.excludedIds,r].filter(Boolean).join(",")),B.state.isAuth&&(t.sdks="auth_v1");const{page:a,search:i}=e,{listings:s,total:c}=se?await ee.getMobileListings(t):await ee.getDesktopListings(t),l=Object.values(s),u=i?"search":"wallets";return ce[u]={listings:[...ce[u].listings,...l],total:c,page:a??1},{listings:l,total:c}},getWalletImageUrl(e){return ee.getWalletImageUrl(e)},getAssetImageUrl(e){return ee.getAssetImageUrl(e)},resetSearch(){ce.search={listings:[],total:0,page:1}}},ue=M({open:!1}),fe={state:ue,subscribe(e){return U(ue,(()=>e(ue)))},async open(e){return new Promise((t=>{const{isUiLoaded:n,isDataLoaded:r}=B.state;if(x.removeWalletConnectDeepLink(),B.setWalletConnectUri(e?.uri),B.setChains(e?.chains),$.reset("ConnectWallet"),n&&r)ue.open=!0,t();else{const e=setInterval((()=>{const n=B.state;n.isUiLoaded&&n.isDataLoaded&&(clearInterval(e),ue.open=!0,t())}),200)}}))},close(){ue.open=!1}};var de=Object.defineProperty,ve=Object.getOwnPropertySymbols,pe=Object.prototype.hasOwnProperty,be=Object.prototype.propertyIsEnumerable,me=(e,t,n)=>t in e?de(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,ge=(e,t)=>{for(var n in t||(t={}))pe.call(t,n)&&me(e,n,t[n]);if(ve)for(var n of ve(t))be.call(t,n)&&me(e,n,t[n]);return e};function we(){return typeof matchMedia<"u"&&matchMedia("(prefers-color-scheme: dark)").matches}const he=M({themeMode:we()?"dark":"light"}),ye={state:he,subscribe(e){return U(he,(()=>e(he)))},setThemeConfig(e){const{themeMode:t,themeVariables:n}=e;t&&(he.themeMode=t),n&&(he.themeVariables=ge({},n))}},Oe=M({open:!1,message:"",variant:"success"}),je={state:Oe,subscribe(e){return U(Oe,(()=>e(Oe)))},openToast(e,t){Oe.open=!0,Oe.message=e,Oe.variant=t},closeToast(){Oe.open=!1}};class Ie{constructor(e){this.openModal=fe.open,this.closeModal=fe.close,this.subscribeModal=fe.subscribe,this.setTheme=ye.setThemeConfig,ye.setThemeConfig(e),K.setConfig(e),this.initUi()}async initUi(){if(typeof window<"u"){await import("./p-64010d56.js");const e=document.createElement("wcm-modal");document.body.insertAdjacentElement("beforeend",e),B.setIsUiLoaded(!0)}}}const We=Object.freeze({__proto__:null,WalletConnectModal:Ie});export{N as R,$ as T,x as a,We as i,ye as n,je as o,B as p,fe as s,le as t,K as y};
//# sourceMappingURL=p-a3b962e1.js.map