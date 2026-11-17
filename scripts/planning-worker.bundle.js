(()=>{var ta=1;var ea=3,ms=0,Fr=1,li=2;var mr=0,gr=1,_r=2,xr=3,yr=4,vr=5,Sr=6,Mr=7,na=0,ia=1,sa=2;var Ur=1,Or=2,Br=3,zr=4,kr=5,Vr=6,Gr=7;var Hr=300;var ra=302;var br=1e3,Qn=1001,wr=1002;var oa=1006;var aa=1008;var la=1009;var ca=1015;var ua=1023;var ni=2300,Ki=2301,$i=2302,Tr=2303,Er=2400,Ar=2401,Cr=2402;var Wr="",ne="srgb",Rr="srgb-linear",Pr="linear",Zi="srgb";var ha=35044;var ti=2e3,Ir=2001;function Hl(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Wl(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Lr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}var Oo={},ji=null;function fa(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Ct(...s){s=fa(s);let t="THREE."+s.shift();if(ji)ji("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function St(...s){s=fa(s);let t="THREE."+s.shift();if(ji)ji("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Ji(...s){let t=s.join(" ");t in Oo||(Oo[t]=!0,Ct(...s))}var ql={[mr]:mr,[_r]:Sr,[yr]:yr,[xr]:vr,[gr]:gr,[Sr]:_r,[Mr]:Mr,[vr]:xr},Ze=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let i=n[t];if(i!==void 0){let r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}},Ft=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Bo=1234567,da=Math.PI/180,qr=180/Math.PI;function ci(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ft[s&255]+Ft[s>>8&255]+Ft[s>>16&255]+Ft[s>>24&255]+"-"+Ft[t&255]+Ft[t>>8&255]+"-"+Ft[t>>16&15|64]+Ft[t>>24&255]+"-"+Ft[e&63|128]+Ft[e>>8&255]+"-"+Ft[e>>16&255]+Ft[e>>24&255]+Ft[n&255]+Ft[n>>8&255]+Ft[n>>16&255]+Ft[n>>24&255]).toLowerCase()}function Z(s,t,e){return Math.max(t,Math.min(e,s))}function Xr(s,t){return(s%t+t)%t}function Xl(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function Yl(s,t,e){return s!==t?(e-s)/(t-s):0}function ei(s,t,e){return(1-e)*s+e*t}function $l(s,t,e,n){return ei(s,t,1-Math.exp(-e*n))}function Zl(s,t=1){return t-Math.abs(Xr(s,t*2)-t)}function Jl(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function Kl(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function jl(s,t){return s+Math.floor(Math.random()*(t-s+1))}function Ql(s,t){return s+Math.random()*(t-s)}function tc(s){return s*(.5-Math.random())}function ec(s){s!==void 0&&(Bo=s);let t=Bo+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function nc(s){return s*da}function ic(s){return s*qr}function sc(s){return s>0&&Number.isInteger(s)&&2**Math.round(Math.log2(s))===s}function rc(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function pa(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function oc(s,t,e,n,i){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),u=o((t+n)/2),f=r((t-n)/2),h=o((t-n)/2),d=r((n-t)/2),p=o((n-t)/2);switch(i){case"XYX":s.set(a*u,l*f,l*h,a*c);break;case"YZY":s.set(l*h,a*u,l*f,a*c);break;case"ZXZ":s.set(l*f,l*h,a*u,a*c);break;case"XZX":s.set(a*u,l*p,l*d,a*c);break;case"YXY":s.set(l*d,a*u,l*p,a*c);break;case"ZYZ":s.set(l*p,l*d,a*u,a*c);break;default:Ct("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Yr(s){switch(s.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function ma(s,t){if(t.constructor===Float32Array)return s;let e=Yr(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(s/e,-1)}function ga(s,t){if(t.constructor===Float32Array)return s;let e=Yr(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(s*e)}var ui={DEG2RAD:da,RAD2DEG:qr,generateUUID:ci,clamp:Z,euclideanModulo:Xr,mapLinear:Xl,inverseLerp:Yl,lerp:ei,damp:$l,pingpong:Zl,smoothstep:Jl,smootherstep:Kl,randInt:jl,randFloat:Ql,randFloatSpread:tc,seededRandom:ec,degToRad:nc,radToDeg:ic,isPowerOfTwo:sc,ceilPowerOfTwo:rc,floorPowerOfTwo:pa,setQuaternionFromProperEuler:oc,normalize:ga,denormalize:ma},mt=class{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Z(this.x,t.x,e.x),this.y=Z(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Z(this.x,t,e),this.y=Z(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Z(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Z(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},J=class{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let l=n[i+0],c=n[i+1],u=n[i+2],f=n[i+3],h=r[o+0],d=r[o+1],p=r[o+2],m=r[o+3];if(f!==m||l!==h||c!==d||u!==p){let v=l*h+c*d+u*p+f*m;v<0&&(h=-h,d=-d,p=-p,m=-m,v=-v);let _=1-a;if(v<.9995){let g=Math.acos(v),S=Math.sin(g);_=Math.sin(_*g)/S,a=Math.sin(a*g)/S,l=l*_+h*a,c=c*_+d*a,u=u*_+p*a,f=f*_+m*a}else{l=l*_+h*a,c=c*_+d*a,u=u*_+p*a,f=f*_+m*a;let g=1/Math.sqrt(l*l+c*c+u*u+f*f);l*=g,c*=g,u*=g,f*=g}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=f}static multiplyQuaternionsFlat(t,e,n,i,r,o){let a=n[i],l=n[i+1],c=n[i+2],u=n[i+3],f=r[o],h=r[o+1],d=r[o+2],p=r[o+3];return t[e]=a*p+u*f+l*d-c*h,t[e+1]=l*p+u*h+c*f-a*d,t[e+2]=c*p+u*d+a*h-l*f,t[e+3]=u*p-a*f-l*h-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(i/2),f=a(r/2),h=l(n/2),d=l(i/2),p=l(r/2);switch(o){case"XYZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"YXZ":this._x=h*u*f+c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"ZXY":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f-h*d*p;break;case"ZYX":this._x=h*u*f-c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f+h*d*p;break;case"YZX":this._x=h*u*f+c*d*p,this._y=c*d*f+h*u*p,this._z=c*u*p-h*d*f,this._w=c*u*f-h*d*p;break;case"XZY":this._x=h*u*f-c*d*p,this._y=c*d*f-h*u*p,this._z=c*u*p+h*d*f,this._w=c*u*f+h*d*p;break;default:Ct("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],f=e[10],h=n+a+f;if(h>0){let d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-l)*d,this._y=(r-c)*d,this._z=(o-i)*d}else if(n>a&&n>f){let d=2*Math.sqrt(1+n-a-f);this._w=(u-l)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(r+c)/d}else if(a>f){let d=2*Math.sqrt(1+a-n-f);this._w=(r-c)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(l+u)/d}else{let d=2*Math.sqrt(1+f-n-a);this._w=(o-i)/d,this._x=(r+c)/d,this._y=(l+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Z(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+i*c-r*l,this._y=i*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-i*a,this._w=o*u-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,i=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),u=Math.sin(c);l=Math.sin(l*c)/u,e=Math.sin(e*c)/u,this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+i*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},E=class{static{this.prototype.isVector3=!0}constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zo.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zo.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),u=2*(a*e-r*i),f=2*(r*n-o*e);return this.x=e+l*c+o*f-a*u,this.y=n+l*u+a*c-r*f,this.z=i+l*f+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Z(this.x,t.x,e.x),this.y=Z(this.y,t.y,e.y),this.z=Z(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Z(this.x,t,e),this.y=Z(this.y,t,e),this.z=Z(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Z(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Js.copy(this).projectOnVector(t),this.sub(Js)}reflect(t){return this.sub(Js.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Z(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Js=new E,zo=new J,Y=class{static{this.prototype.isMatrix3=!0}constructor(t,e,n,i,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c)}set(t,e,n,i,r,o,a,l,c){let u=this.elements;return u[0]=t,u[1]=i,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],f=n[7],h=n[2],d=n[5],p=n[8],m=i[0],v=i[3],_=i[6],g=i[1],S=i[4],x=i[7],y=i[2],T=i[5],w=i[8];return r[0]=o*m+a*g+l*y,r[3]=o*v+a*S+l*T,r[6]=o*_+a*x+l*w,r[1]=c*m+u*g+f*y,r[4]=c*v+u*S+f*T,r[7]=c*_+u*x+f*w,r[2]=h*m+d*g+p*y,r[5]=h*v+d*S+p*T,r[8]=h*_+d*x+p*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+i*r*c-i*o*l}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],f=u*o-a*c,h=a*l-u*r,d=c*r-o*l,p=e*f+n*h+i*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return t[0]=f*m,t[1]=(i*c-u*n)*m,t[2]=(a*n-i*o)*m,t[3]=h*m,t[4]=(u*e-i*l)*m,t[5]=(i*r-a*e)*m,t[6]=d*m,t[7]=(n*l-c*e)*m,t[8]=(o*e-n*r)*m,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return Ji("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ks.makeScale(t,e)),this}rotate(t){return Ji("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ks.makeRotation(-t)),this}translate(t,e){return Ji("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ks.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Ks=new Y,ko=new Y().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Vo=new Y().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ac(){let s={enabled:!0,workingColorSpace:Rr,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Zi&&(i.r=Te(i.r),i.g=Te(i.g),i.b=Te(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Zi&&(i.r=An(i.r),i.g=An(i.g),i.b=An(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Wr?Pr:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Rr]:{primaries:t,whitePoint:n,transfer:Pr,toXYZ:ko,fromXYZ:Vo,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ne},outputColorSpaceConfig:{drawingBufferColorSpace:ne}},[ne]:{primaries:t,whitePoint:n,transfer:Zi,toXYZ:ko,fromXYZ:Vo,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ne}}}),s}var ee=ac();function Te(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function An(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var pn,Qi=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{pn===void 0&&(pn=Lr("canvas")),pn.width=t.width,pn.height=t.height;let i=pn.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),n=pn}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Lr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Te(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Te(e[n]/255)*255):e[n]=Te(e[n]);return{data:e,width:t.width,height:t.height}}else return Ct("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},lc=0,ts=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:lc++}),this.uuid=ci(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(js(i[o].image)):r.push(js(i[o]))}else r=js(i);n.url=r}return e||(t.images[this.uuid]=n),n}};function js(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Qi.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Ct("Texture: Unable to serialize Texture."),{})}var cc=0,Qs=new E,Cn=class s extends Ze{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,n=Qn,i=Qn,r=oa,o=aa,a=ua,l=la,c=s.DEFAULT_ANISOTROPY,u=Wr){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:cc++}),this.uuid=ci(),this.name="",this.source=new ts(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new mt(0,0),this.repeat=new mt(1,1),this.center=new mt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Y,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Qs).x}get height(){return this.source.getSize(Qs).y}get depth(){return this.source.getSize(Qs).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Ct(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let i=this[e];if(i===void 0){Ct(`Texture.setValues(): property '${e}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Hr)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case br:t.x=t.x-Math.floor(t.x);break;case Qn:t.x=t.x<0?0:1;break;case wr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case br:t.y=t.y-Math.floor(t.y);break;case Qn:t.y=t.y<0?0:1;break;case wr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Cn.DEFAULT_IMAGE=null;Cn.DEFAULT_MAPPING=Hr;Cn.DEFAULT_ANISOTROPY=1;var Rn=class{static{this.prototype.isVector4=!0}constructor(t=0,e=0,n=0,i=1){this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r,l=t.elements,c=l[0],u=l[4],f=l[8],h=l[1],d=l[5],p=l[9],m=l[2],v=l[6],_=l[10];if(Math.abs(u-h)<.01&&Math.abs(f-m)<.01&&Math.abs(p-v)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+m)<.1&&Math.abs(p+v)<.1&&Math.abs(c+d+_-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let S=(c+1)/2,x=(d+1)/2,y=(_+1)/2,T=(u+h)/4,w=(f+m)/4,b=(p+v)/4;return S>x&&S>y?S<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(S),i=T/n,r=w/n):x>y?x<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(x),n=T/i,r=b/i):y<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(y),n=w/r,i=b/r),this.set(n,i,r,e),this}let g=Math.sqrt((v-p)*(v-p)+(f-m)*(f-m)+(h-u)*(h-u));return Math.abs(g)<.001&&(g=1),this.x=(v-p)/g,this.y=(f-m)/g,this.z=(h-u)/g,this.w=Math.acos((c+d+_-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Z(this.x,t.x,e.x),this.y=Z(this.y,t.y,e.y),this.z=Z(this.z,t.z,e.z),this.w=Z(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Z(this.x,t,e),this.y=Z(this.y,t,e),this.z=Z(this.z,t,e),this.w=Z(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Z(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};var H=class s{static{this.prototype.isMatrix4=!0}constructor(t,e,n,i,r,o,a,l,c,u,f,h,d,p,m,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c,u,f,h,d,p,m,v)}set(t,e,n,i,r,o,a,l,c,u,f,h,d,p,m,v){let _=this.elements;return _[0]=t,_[4]=e,_[8]=n,_[12]=i,_[1]=r,_[5]=o,_[9]=a,_[13]=l,_[2]=c,_[6]=u,_[10]=f,_[14]=h,_[3]=d,_[7]=p,_[11]=m,_[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,i=1/mn.setFromMatrixColumn(t,0).length(),r=1/mn.setFromMatrixColumn(t,1).length(),o=1/mn.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),u=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let h=o*u,d=o*f,p=a*u,m=a*f;e[0]=l*u,e[4]=-l*f,e[8]=c,e[1]=d+p*c,e[5]=h-m*c,e[9]=-a*l,e[2]=m-h*c,e[6]=p+d*c,e[10]=o*l}else if(t.order==="YXZ"){let h=l*u,d=l*f,p=c*u,m=c*f;e[0]=h+m*a,e[4]=p*a-d,e[8]=o*c,e[1]=o*f,e[5]=o*u,e[9]=-a,e[2]=d*a-p,e[6]=m+h*a,e[10]=o*l}else if(t.order==="ZXY"){let h=l*u,d=l*f,p=c*u,m=c*f;e[0]=h-m*a,e[4]=-o*f,e[8]=p+d*a,e[1]=d+p*a,e[5]=o*u,e[9]=m-h*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let h=o*u,d=o*f,p=a*u,m=a*f;e[0]=l*u,e[4]=p*c-d,e[8]=h*c+m,e[1]=l*f,e[5]=m*c+h,e[9]=d*c-p,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let h=o*l,d=o*c,p=a*l,m=a*c;e[0]=l*u,e[4]=m-h*f,e[8]=p*f+d,e[1]=f,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=d*f+p,e[10]=h-m*f}else if(t.order==="XZY"){let h=o*l,d=o*c,p=a*l,m=a*c;e[0]=l*u,e[4]=-f,e[8]=c*u,e[1]=h*f+m,e[5]=o*u,e[9]=d*f-p,e[2]=p*f-d,e[6]=a*u,e[10]=m*f+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(uc,t,hc)}lookAt(t,e,n){let i=this.elements;return qt.subVectors(t,e),qt.lengthSq()===0&&(qt.z=1),qt.normalize(),Le.crossVectors(n,qt),Le.lengthSq()===0&&(Math.abs(n.z)===1?qt.x+=1e-4:qt.z+=1e-4,qt.normalize(),Le.crossVectors(n,qt)),Le.normalize(),Oi.crossVectors(qt,Le),i[0]=Le.x,i[4]=Oi.x,i[8]=qt.x,i[1]=Le.y,i[5]=Oi.y,i[9]=qt.y,i[2]=Le.z,i[6]=Oi.z,i[10]=qt.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],f=n[5],h=n[9],d=n[13],p=n[2],m=n[6],v=n[10],_=n[14],g=n[3],S=n[7],x=n[11],y=n[15],T=i[0],w=i[4],b=i[8],C=i[12],M=i[1],R=i[5],A=i[9],P=i[13],F=i[2],N=i[6],z=i[10],G=i[14],I=i[3],D=i[7],B=i[11],O=i[15];return r[0]=o*T+a*M+l*F+c*I,r[4]=o*w+a*R+l*N+c*D,r[8]=o*b+a*A+l*z+c*B,r[12]=o*C+a*P+l*G+c*O,r[1]=u*T+f*M+h*F+d*I,r[5]=u*w+f*R+h*N+d*D,r[9]=u*b+f*A+h*z+d*B,r[13]=u*C+f*P+h*G+d*O,r[2]=p*T+m*M+v*F+_*I,r[6]=p*w+m*R+v*N+_*D,r[10]=p*b+m*A+v*z+_*B,r[14]=p*C+m*P+v*G+_*O,r[3]=g*T+S*M+x*F+y*I,r[7]=g*w+S*R+x*N+y*D,r[11]=g*b+S*A+x*z+y*B,r[15]=g*C+S*P+x*G+y*O,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],f=t[6],h=t[10],d=t[14],p=t[3],m=t[7],v=t[11],_=t[15],g=l*d-c*h,S=a*d-c*f,x=a*h-l*f,y=o*d-c*u,T=o*h-l*u,w=o*f-a*u;return e*(m*g-v*S+_*x)-n*(p*g-v*y+_*T)+i*(p*S-m*y+_*w)-r*(p*x-m*T+v*w)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],i=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],u=t[10];return e*(o*u-a*c)-n*(r*u-a*l)+i*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],f=t[9],h=t[10],d=t[11],p=t[12],m=t[13],v=t[14],_=t[15],g=e*a-n*o,S=e*l-i*o,x=e*c-r*o,y=n*l-i*a,T=n*c-r*a,w=i*c-r*l,b=u*m-f*p,C=u*v-h*p,M=u*_-d*p,R=f*v-h*m,A=f*_-d*m,P=h*_-d*v,F=g*P-S*A+x*R+y*M-T*C+w*b;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/F;return t[0]=(a*P-l*A+c*R)*N,t[1]=(i*A-n*P-r*R)*N,t[2]=(m*w-v*T+_*y)*N,t[3]=(h*T-f*w-d*y)*N,t[4]=(l*M-o*P-c*C)*N,t[5]=(e*P-i*M+r*C)*N,t[6]=(v*x-p*w-_*S)*N,t[7]=(u*w-h*x+d*S)*N,t[8]=(o*A-a*M+c*b)*N,t[9]=(n*M-e*A-r*b)*N,t[10]=(p*T-m*x+_*g)*N,t[11]=(f*x-u*T-d*g)*N,t[12]=(a*C-o*R-l*b)*N,t[13]=(e*R-n*C+i*b)*N,t[14]=(m*S-p*y-v*g)*N,t[15]=(u*y-f*S+h*g)*N,this}scale(t){let e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,u*a+n,u*l-i*o,0,c*l-i*a,u*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){let i=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,f=a+a,h=r*c,d=r*u,p=r*f,m=o*u,v=o*f,_=a*f,g=l*c,S=l*u,x=l*f,y=n.x,T=n.y,w=n.z;return i[0]=(1-(m+_))*y,i[1]=(d+x)*y,i[2]=(p-S)*y,i[3]=0,i[4]=(d-x)*T,i[5]=(1-(h+_))*T,i[6]=(v+g)*T,i[7]=0,i[8]=(p+S)*w,i[9]=(v-g)*w,i[10]=(1-(h+m))*w,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){let i=this.elements;t.x=i[12],t.y=i[13],t.z=i[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=mn.set(i[0],i[1],i[2]).length(),a=mn.set(i[4],i[5],i[6]).length(),l=mn.set(i[8],i[9],i[10]).length();r<0&&(o=-o),le.copy(this);let c=1/o,u=1/a,f=1/l;return le.elements[0]*=c,le.elements[1]*=c,le.elements[2]*=c,le.elements[4]*=u,le.elements[5]*=u,le.elements[6]*=u,le.elements[8]*=f,le.elements[9]*=f,le.elements[10]*=f,e.setFromRotationMatrix(le),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,i,r,o,a=ti,l=!1){let c=this.elements,u=2*r/(e-t),f=2*r/(n-i),h=(e+t)/(e-t),d=(n+i)/(n-i),p,m;if(l)p=r/(o-r),m=o*r/(o-r);else if(a===ti)p=-(o+r)/(o-r),m=-2*o*r/(o-r);else if(a===Ir)p=-o/(o-r),m=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=f,c[9]=d,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=ti,l=!1){let c=this.elements,u=2/(e-t),f=2/(n-i),h=-(e+t)/(e-t),d=-(n+i)/(n-i),p,m;if(l)p=1/(o-r),m=o/(o-r);else if(a===ti)p=-2/(o-r),m=-(o+r)/(o-r);else if(a===Ir)p=-1/(o-r),m=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=f,c[9]=0,c[13]=d,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},mn=new E,le=new H,uc=new E(0,0,0),hc=new E(1,1,1),Le=new E,Oi=new E,qt=new E,Go=new H,Ho=new J,Je=class s{constructor(t=0,e=0,n=0,i=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let i=t.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],u=i[9],f=i[2],h=i[6],d=i[10];switch(e){case"XYZ":this._y=Math.asin(Z(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Z(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Z(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Z(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Z(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Z(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Ct("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Go.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Go,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ho.setFromEuler(this),this.setFromQuaternion(Ho,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Je.DEFAULT_ORDER="XYZ";var es=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},fc=0,Wo=new E,gn=new J,ve=new H,Bi=new E,Zn=new E,dc=new E,pc=new J,qo=new E(1,0,0),Xo=new E(0,1,0),Yo=new E(0,0,1),$o={type:"added"},mc={type:"removed"},_n={type:"childadded",child:null},tr={type:"childremoved",child:null},Ke=class s extends Ze{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:fc++}),this.uuid=ci(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new E,e=new Je,n=new J,i=new E(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new H},normalMatrix:{value:new Y}}),this.matrix=new H,this.matrixWorld=new H,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new es,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return gn.setFromAxisAngle(t,e),this.quaternion.multiply(gn),this}rotateOnWorldAxis(t,e){return gn.setFromAxisAngle(t,e),this.quaternion.premultiply(gn),this}rotateX(t){return this.rotateOnAxis(qo,t)}rotateY(t){return this.rotateOnAxis(Xo,t)}rotateZ(t){return this.rotateOnAxis(Yo,t)}translateOnAxis(t,e){return Wo.copy(t).applyQuaternion(this.quaternion),this.position.add(Wo.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(qo,t)}translateY(t){return this.translateOnAxis(Xo,t)}translateZ(t){return this.translateOnAxis(Yo,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ve.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Bi.copy(t):Bi.set(t,e,n);let i=this.parent;this.updateWorldMatrix(!0,!1),Zn.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ve.lookAt(Zn,Bi,this.up):ve.lookAt(Bi,Zn,this.up),this.quaternion.setFromRotationMatrix(ve),i&&(ve.extractRotation(i.matrixWorld),gn.setFromRotationMatrix(ve),this.quaternion.premultiply(gn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(St("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent($o),_n.child=t,this.dispatchEvent(_n),_n.child=null):St("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(mc),tr.child=t,this.dispatchEvent(tr),tr.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ve.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ve.multiply(t.parent.matrixWorld)),t.applyMatrix4(ve),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent($o),_n.child=t,this.dispatchEvent(_n),_n.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zn,t,dc),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Zn,pc,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,i=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*i,r[13]+=n-r[1]*e-r[5]*n-r[9]*i,r[14]+=i-r[2]*e-r[6]*n-r[10]*i}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let i={};i.uuid=this.uuid,i.type=this.type,i.name=this.name,i.castShadow=this.castShadow,i.receiveShadow=this.receiveShadow,i.visible=this.visible,i.frustumCulled=this.frustumCulled,i.renderOrder=this.renderOrder,i.static=this.static,i.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.pivot!==null&&(i.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(i.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(i.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(t),i.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];i.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),f=o(t.shapes),h=o(t.skeletons),d=o(t.animations),p=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),p.length>0&&(n.nodes=p)}return n.object=i,n;function o(a){let l=[];for(let c in a){let u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let i=t.children[n];this.add(i.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ke.DEFAULT_UP=new E(0,1,0);Ke.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ke.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var _a={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ne={h:0,s:0,l:0},zi={h:0,s:0,l:0};function er(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Nt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ne){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ee.colorSpaceToWorking(this,e),this}setRGB(t,e,n,i=ee.workingColorSpace){return this.r=t,this.g=e,this.b=n,ee.colorSpaceToWorking(this,i),this}setHSL(t,e,n,i=ee.workingColorSpace){if(t=Xr(t,1),e=Z(e,0,1),n=Z(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=er(o,r,t+1/3),this.g=er(o,r,t),this.b=er(o,r,t-1/3)}return ee.colorSpaceToWorking(this,i),this}setStyle(t,e=ne){function n(r){r!==void 0&&parseFloat(r)<1&&Ct("Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Ct("Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Ct("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ne){let n=_a[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Ct("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Te(t.r),this.g=Te(t.g),this.b=Te(t.b),this}copyLinearToSRGB(t){return this.r=An(t.r),this.g=An(t.g),this.b=An(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ne){return ee.workingToColorSpace(Ut.copy(this),t),Math.round(Z(Ut.r*255,0,255))*65536+Math.round(Z(Ut.g*255,0,255))*256+Math.round(Z(Ut.b*255,0,255))}getHexString(t=ne){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ee.workingColorSpace){ee.workingToColorSpace(Ut.copy(this),e);let n=Ut.r,i=Ut.g,r=Ut.b,o=Math.max(n,i,r),a=Math.min(n,i,r),l,c,u=(a+o)/2;if(a===o)l=0,c=0;else{let f=o-a;switch(c=u<=.5?f/(o+a):f/(2-o-a),o){case n:l=(i-r)/f+(i<r?6:0);break;case i:l=(r-n)/f+2;break;case r:l=(n-i)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=ee.workingColorSpace){return ee.workingToColorSpace(Ut.copy(this),e),t.r=Ut.r,t.g=Ut.g,t.b=Ut.b,t}getStyle(t=ne){ee.workingToColorSpace(Ut.copy(this),t);let e=Ut.r,n=Ut.g,i=Ut.b;return t!==ne?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(Ne),this.setHSL(Ne.h+t,Ne.s+e,Ne.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Ne),t.getHSL(zi);let n=ei(Ne.h,zi.h,e),i=ei(Ne.s,zi.s,e),r=ei(Ne.l,zi.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ut=new Nt;Nt.NAMES=_a;var ce=new E,Se=new E,nr=new E,Me=new E,xn=new E,yn=new E,Zo=new E,ir=new E,sr=new E,rr=new E,or=new Rn,ar=new Rn,lr=new Rn,he=class s{constructor(t=new E,e=new E,n=new E){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),ce.subVectors(t,e),i.cross(ce);let r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){ce.subVectors(i,e),Se.subVectors(n,e),nr.subVectors(t,e);let o=ce.dot(ce),a=ce.dot(Se),l=ce.dot(nr),c=Se.dot(Se),u=Se.dot(nr),f=o*c-a*a;if(f===0)return r.set(0,0,0),null;let h=1/f,d=(c*l-a*u)*h,p=(o*u-a*l)*h;return r.set(1-d-p,p,d)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Me)===null?!1:Me.x>=0&&Me.y>=0&&Me.x+Me.y<=1}static getInterpolation(t,e,n,i,r,o,a,l){return this.getBarycoord(t,e,n,i,Me)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Me.x),l.addScaledVector(o,Me.y),l.addScaledVector(a,Me.z),l)}static getInterpolatedAttribute(t,e,n,i,r,o){return or.setScalar(0),ar.setScalar(0),lr.setScalar(0),or.fromBufferAttribute(t,e),ar.fromBufferAttribute(t,n),lr.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(or,r.x),o.addScaledVector(ar,r.y),o.addScaledVector(lr,r.z),o}static isFrontFacing(t,e,n,i){return ce.subVectors(n,e),Se.subVectors(t,e),ce.cross(Se).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ce.subVectors(this.c,this.b),Se.subVectors(this.a,this.b),ce.cross(Se).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return s.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,i=this.b,r=this.c,o,a;xn.subVectors(i,n),yn.subVectors(r,n),ir.subVectors(t,n);let l=xn.dot(ir),c=yn.dot(ir);if(l<=0&&c<=0)return e.copy(n);sr.subVectors(t,i);let u=xn.dot(sr),f=yn.dot(sr);if(u>=0&&f<=u)return e.copy(i);let h=l*f-u*c;if(h<=0&&l>=0&&u<=0&&l-u>0)return o=l/(l-u),e.copy(n).addScaledVector(xn,o);rr.subVectors(t,r);let d=xn.dot(rr),p=yn.dot(rr);if(p>=0&&d<=p)return e.copy(r);let m=d*c-l*p;if(m<=0&&c>=0&&p<=0)return a=c/(c-p),e.copy(n).addScaledVector(yn,a);let v=u*p-d*f;if(v<=0&&f-u>=0&&d-p>=0)return Zo.subVectors(r,i),a=(f-u)/(f-u+(d-p)),e.copy(i).addScaledVector(Zo,a);let _=1/(v+m+h);return o=m*_,a=h*_,e.copy(n).addScaledVector(xn,o).addScaledVector(yn,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},ft=class{constructor(t=new E(1/0,1/0,1/0),e=new E(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(ue.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(ue.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=ue.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,ue):ue.fromBufferAttribute(r,o),ue.applyMatrix4(t.matrixWorld),this.expandByPoint(ue);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ki.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ki.copy(n.boundingBox)),ki.applyMatrix4(t.matrixWorld),this.union(ki)}let i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,ue),ue.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Jn),Vi.subVectors(this.max,Jn),vn.subVectors(t.a,Jn),Sn.subVectors(t.b,Jn),Mn.subVectors(t.c,Jn),De.subVectors(Sn,vn),Fe.subVectors(Mn,Sn),Ye.subVectors(vn,Mn);let e=[0,-De.z,De.y,0,-Fe.z,Fe.y,0,-Ye.z,Ye.y,De.z,0,-De.x,Fe.z,0,-Fe.x,Ye.z,0,-Ye.x,-De.y,De.x,0,-Fe.y,Fe.x,0,-Ye.y,Ye.x,0];return!cr(e,vn,Sn,Mn,Vi)||(e=[1,0,0,0,1,0,0,0,1],!cr(e,vn,Sn,Mn,Vi))?!1:(Gi.crossVectors(De,Fe),e=[Gi.x,Gi.y,Gi.z],cr(e,vn,Sn,Mn,Vi))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,ue).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(ue).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(be[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),be[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),be[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),be[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),be[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),be[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),be[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),be[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(be),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},be=[new E,new E,new E,new E,new E,new E,new E,new E],ue=new E,ki=new ft,vn=new E,Sn=new E,Mn=new E,De=new E,Fe=new E,Ye=new E,Jn=new E,Vi=new E,Gi=new E,$e=new E;function cr(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){$e.fromArray(s,r);let a=i.x*Math.abs($e.x)+i.y*Math.abs($e.y)+i.z*Math.abs($e.z),l=t.dot($e),c=e.dot($e),u=n.dot($e);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}var At=new E,Hi=new mt,gc=0,Yt=class extends Ze{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:gc++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=ha,this.updateRanges=[],this.gpuType=ca,this.version=0,this._normalizationScale=t!==void 0?Yr(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Hi.fromBufferAttribute(this,e),Hi.applyMatrix3(t),this.setXY(e,Hi.x,Hi.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)At.fromBufferAttribute(this,e),At.applyMatrix3(t),this.setXYZ(e,At.x,At.y,At.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)At.fromBufferAttribute(this,e),At.applyMatrix4(t),this.setXYZ(e,At.x,At.y,At.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)At.fromBufferAttribute(this,e),At.applyNormalMatrix(t),this.setXYZ(e,At.x,At.y,At.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)At.fromBufferAttribute(this,e),At.transformDirection(t),this.setXYZ(e,At.x,At.y,At.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=this._denormalize(n)),n}setComponent(t,e,n){return this.normalized&&(n=this._normalize(n)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),i=this._normalize(i)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),n=this._normalize(n),i=this._normalize(i),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):ma(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):ga(t,this.array)}};var ns=class extends Yt{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var is=class extends Yt{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Lt=class extends Yt{constructor(t,e,n){super(new Float32Array(t),e,n)}},_c=new ft,Kn=new E,ur=new E,ss=class{constructor(t=new E,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):_c.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Kn.subVectors(t,this.center);let e=Kn.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Kn,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ur.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Kn.copy(t.center).add(ur)),this.expandByPoint(Kn.copy(t.center).sub(ur))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},xc=0,te=new H,hr=new Ke,bn=new E,Xt=new ft,jn=new ft,It=new E,Ee=class s extends Ze{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xc++}),this.uuid=ci(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Hl(t)?is:ns)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Y().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return te.makeRotationFromQuaternion(t),this.applyMatrix4(te),this}rotateX(t){return te.makeRotationX(t),this.applyMatrix4(te),this}rotateY(t){return te.makeRotationY(t),this.applyMatrix4(te),this}rotateZ(t){return te.makeRotationZ(t),this.applyMatrix4(te),this}translate(t,e,n){return te.makeTranslation(t,e,n),this.applyMatrix4(te),this}scale(t,e,n){return te.makeScale(t,e,n),this.applyMatrix4(te),this}lookAt(t){return hr.lookAt(t),hr.updateMatrix(),this.applyMatrix4(hr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bn).negate(),this.translate(bn.x,bn.y,bn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let i=0,r=t.length;i<r;i++){let o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Lt(n,3))}else{let n=Math.min(t.length,e.count);for(let i=0;i<n;i++){let r=t[i];e.setXYZ(i,r.x,r.y,r.z||0)}t.length>e.count&&Ct("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ft);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){St("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new E(-1/0,-1/0,-1/0),new E(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){let r=e[n];Xt.setFromBufferAttribute(r),this.morphTargetsRelative?(It.addVectors(this.boundingBox.min,Xt.min),this.boundingBox.expandByPoint(It),It.addVectors(this.boundingBox.max,Xt.max),this.boundingBox.expandByPoint(It)):(this.boundingBox.expandByPoint(Xt.min),this.boundingBox.expandByPoint(Xt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&St('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ss);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){St("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new E,1/0);return}if(t){let n=this.boundingSphere.center;if(Xt.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];jn.setFromBufferAttribute(a),this.morphTargetsRelative?(It.addVectors(Xt.min,jn.min),Xt.expandByPoint(It),It.addVectors(Xt.max,jn.max),Xt.expandByPoint(It)):(Xt.expandByPoint(jn.min),Xt.expandByPoint(jn.max))}Xt.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)It.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(It));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)It.fromBufferAttribute(a,c),l&&(bn.fromBufferAttribute(t,c),It.add(bn)),i=Math.max(i,n.distanceToSquared(It))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&St('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){St("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,i=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Yt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[],c=new Uint8Array(n.count);for(let C=0;C<n.count;C++)a[C]=new E,l[C]=new E;let u=new E,f=new E,h=new E,d=new mt,p=new mt,m=new mt,v=new E,_=new E;function g(C,M,R){c[C]=c[M]=c[R]=1,u.fromBufferAttribute(n,C),f.fromBufferAttribute(n,M),h.fromBufferAttribute(n,R),d.fromBufferAttribute(r,C),p.fromBufferAttribute(r,M),m.fromBufferAttribute(r,R),f.sub(u),h.sub(u),p.sub(d),m.sub(d);let A=1/(p.x*m.y-m.x*p.y);isFinite(A)&&(v.copy(f).multiplyScalar(m.y).addScaledVector(h,-p.y).multiplyScalar(A),_.copy(h).multiplyScalar(p.x).addScaledVector(f,-m.x).multiplyScalar(A),a[C].add(v),a[M].add(v),a[R].add(v),l[C].add(_),l[M].add(_),l[R].add(_))}let S=this.groups;S.length===0&&(S=[{start:0,count:t.count}]);for(let C=0,M=S.length;C<M;++C){let R=S[C],A=R.start,P=R.count;for(let F=A,N=A+P;F<N;F+=3)g(t.getX(F+0),t.getX(F+1),t.getX(F+2))}let x=new E,y=new E,T=new E,w=new E;function b(C){T.fromBufferAttribute(i,C),w.copy(T);let M=a[C];x.copy(M),x.sub(T.multiplyScalar(T.dot(M))).normalize(),y.crossVectors(w,M);let A=y.dot(l[C])<0?-1:1;o.setXYZW(C,x.x,x.y,x.z,A)}for(let C=0,M=n.count;C<M;++C)c[C]&&b(C);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new Yt(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);let i=new E,r=new E,o=new E,a=new E,l=new E,c=new E,u=new E,f=new E;if(t)for(let h=0,d=t.count;h<d;h+=3){let p=t.getX(h+0),m=t.getX(h+1),v=t.getX(h+2);i.fromBufferAttribute(e,p),r.fromBufferAttribute(e,m),o.fromBufferAttribute(e,v),u.subVectors(o,r),f.subVectors(i,r),u.cross(f),a.fromBufferAttribute(n,p),l.fromBufferAttribute(n,m),c.fromBufferAttribute(n,v),a.add(u),l.add(u),c.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(m,l.x,l.y,l.z),n.setXYZ(v,c.x,c.y,c.z)}else for(let h=0,d=e.count;h<d;h+=3)i.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),o.fromBufferAttribute(e,h+2),u.subVectors(o,r),f.subVectors(i,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)It.fromBufferAttribute(t,e),It.normalize(),t.setXYZ(e,It.x,It.y,It.z)}toNonIndexed(){function t(a,l){let c=a.array,u=a.itemSize,f=a.normalized,h=new c.constructor(l.length*u),d=0,p=0;for(let m=0,v=l.length;m<v;m++){a.isInterleavedBufferAttribute?d=l[m]*a.data.stride+a.offset:d=l[m]*u;for(let _=0;_<u;_++)h[p++]=c[d++]}return new Yt(h,u,f)}if(this.index===null)return Ct("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,n=this.index.array,i=this.attributes;for(let a in i){let l=i[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let u=0,f=c.length;u<f;u++){let h=c[u],d=t(h,n);l.push(d)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let i={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let f=0,h=c.length;f<h;f++){let d=c[f];u.push(d.toJSON(t.data))}u.length>0&&(i[l]=u,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let i=t.attributes;for(let c in i){let u=i[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],f=r[c];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,u=o.length;c<u;c++){let f=o[c];this.addGroup(f.start,f.count,f.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var fr=new E,yc=new E,vc=new Y,je=class{constructor(t=new E(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let i=fr.subVectors(n,e).cross(yc.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let i=t.delta(fr),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(i,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||vc.getNormalMatrix(t),i=this.coplanarPoint(fr).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}};var we=new E,dr=new E,Wi=new E,qi=new E,Ae=class{constructor(t=new E,e=new E(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,we)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=we.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(we.copy(this.origin).addScaledVector(this.direction,e),we.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){dr.copy(t).add(e).multiplyScalar(.5),Wi.copy(e).sub(t).normalize(),qi.copy(this.origin).sub(dr);let r=t.distanceTo(e)*.5,o=-this.direction.dot(Wi),a=qi.dot(this.direction),l=-qi.dot(Wi),c=qi.lengthSq(),u=Math.abs(1-o*o),f,h,d,p;if(u>0)if(f=o*l-a,h=o*a-l,p=r*u,f>=0)if(h>=-p)if(h<=p){let m=1/u;f*=m,h*=m,d=f*(f+o*h+2*a)+h*(o*f+h+2*l)+c}else h=r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h=-r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;else h<=-p?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c):h<=p?(f=0,h=Math.min(Math.max(-r,-l),r),d=h*(h+2*l)+c):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+h*(h+2*l)+c);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,f),i&&i.copy(dr).addScaledVector(Wi,h),d}intersectSphere(t,e){if(t.radius<0)return null;we.subVectors(t.center,this.origin);let n=we.dot(this.direction),i=we.dot(we)-n*n,r=t.radius*t.radius;if(i>r)return null;let o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,l,c=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,i=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,i=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,o=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,o=(t.min.y-h.y)*u),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),f>=0?(a=(t.min.z-h.z)*f,l=(t.max.z-h.z)*f):(a=(t.max.z-h.z)*f,l=(t.min.z-h.z)*f),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,we)!==null}intersectTriangle(t,e,n,i,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,u=a.z,f=t.x-o.x,h=t.y-o.y,d=t.z-o.z,p=e.x-o.x,m=e.y-o.y,v=e.z-o.z,_=n.x-o.x,g=n.y-o.y,S=n.z-o.z,x=Math.abs(l),y=Math.abs(c),T=Math.abs(u),w,b,C,M,R,A,P,F,N,z,G,I;if(x>=y&&x>=T?(C=l,A=f,N=p,I=_,l>=0?(w=c,b=u,M=h,R=d,P=m,F=v,z=g,G=S):(w=u,b=c,M=d,R=h,P=v,F=m,z=S,G=g)):y>=T?(C=c,A=h,N=m,I=g,c>=0?(w=u,b=l,M=d,R=f,P=v,F=p,z=S,G=_):(w=l,b=u,M=f,R=d,P=p,F=v,z=_,G=S)):(C=u,A=d,N=v,I=S,u>=0?(w=l,b=c,M=f,R=h,P=p,F=m,z=_,G=g):(w=c,b=l,M=h,R=f,P=m,F=p,z=g,G=_)),C===0)return null;let D=w/C,B=b/C,O=1/C,U=M-D*A,L=R-B*A,V=P-D*N,tt=F-B*N,lt=z-D*I,et=G-B*I,pt=lt*tt-et*V,jt=U*et-L*lt,oe=V*L-tt*U;if(i){if(pt<0||jt<0||oe<0)return null}else if((pt<0||jt<0||oe<0)&&(pt>0||jt>0||oe>0))return null;let Bt=pt+jt+oe;if(Bt===0)return null;let Wt=O*(pt*A+jt*N+oe*I);return(Bt>0?Wt<0:Wt>0)?null:this.at(Wt/Bt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}};var ii=class s extends Ee{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};let a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],u=[],f=[],h=0,d=0;p("z","y","x",-1,-1,n,e,t,o,r,0),p("z","y","x",1,-1,n,e,-t,o,r,1),p("x","z","y",1,1,t,n,e,i,o,2),p("x","z","y",1,-1,t,n,-e,i,o,3),p("x","y","z",1,-1,t,e,n,i,r,4),p("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Lt(c,3)),this.setAttribute("normal",new Lt(u,3)),this.setAttribute("uv",new Lt(f,2));function p(m,v,_,g,S,x,y,T,w,b,C){let M=x/w,R=y/b,A=x/2,P=y/2,F=T/2,N=w+1,z=b+1,G=0,I=0,D=new E;for(let B=0;B<z;B++){let O=B*R-P;for(let U=0;U<N;U++){let L=U*M-A;D[m]=L*g,D[v]=O*S,D[_]=F,c.push(D.x,D.y,D.z),D[m]=0,D[v]=0,D[_]=T>0?1:-1,u.push(D.x,D.y,D.z),f.push(U/w),f.push(1-B/b),G+=1}}for(let B=0;B<b;B++)for(let O=0;O<w;O++){let U=h+O+N*B,L=h+O+N*(B+1),V=h+(O+1)+N*(B+1),tt=h+(O+1)+N*B;l.push(U,L,tt),l.push(L,V,tt),I+=6}a.addGroup(d,I,C),d+=I,h+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var si=class s extends Ee{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;i=Math.floor(i),r=Math.floor(r);let u=[],f=[],h=[],d=[],p=0,m=[],v=n/2,_=0;g(),o===!1&&(t>0&&S(!0),e>0&&S(!1)),this.setIndex(u),this.setAttribute("position",new Lt(f,3)),this.setAttribute("normal",new Lt(h,3)),this.setAttribute("uv",new Lt(d,2));function g(){let x=new E,y=new E,T=0,w=(e-t)/n;for(let b=0;b<=r;b++){let C=[],M=b/r,R=M*(e-t)+t;for(let A=0;A<=i;A++){let P=A/i,F=P*l+a,N=Math.sin(F),z=Math.cos(F);y.x=R*N,y.y=-M*n+v,y.z=R*z,f.push(y.x,y.y,y.z),x.set(N,w,z).normalize(),h.push(x.x,x.y,x.z),d.push(P,1-M),C.push(p++)}m.push(C)}for(let b=0;b<i;b++)for(let C=0;C<r;C++){let M=m[C][b],R=m[C+1][b],A=m[C+1][b+1],P=m[C][b+1];(t>0||C!==0)&&(u.push(M,R,P),T+=3),(e>0||C!==r-1)&&(u.push(R,A,P),T+=3)}c.addGroup(_,T,0),_+=T}function S(x){let y=p,T=new mt,w=new E,b=0,C=x===!0?t:e,M=x===!0?1:-1;for(let A=1;A<=i;A++)f.push(0,v*M,0),h.push(0,M,0),d.push(.5,.5),p++;let R=p;for(let A=0;A<=i;A++){let F=A/i*l+a,N=Math.cos(F),z=Math.sin(F);w.x=C*z,w.y=v*M,w.z=C*N,f.push(w.x,w.y,w.z),h.push(0,M,0),T.x=N*.5+.5,T.y=z*.5*M+.5,d.push(T.x,T.y),p++}for(let A=0;A<i;A++){let P=y+A,F=R+A;x===!0?u.push(F,F+1,P):u.push(F+1,F,P),b+=3}c.addGroup(_,b,x===!0?1:2),_+=b}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var ri=class s extends Ee{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,u=l+1,f=t/a,h=e/l,d=[],p=[],m=[],v=[];for(let _=0;_<u;_++){let g=_*h-o;for(let S=0;S<c;S++){let x=S*f-r;p.push(x,-g,0),m.push(0,0,1),v.push(S/a),v.push(1-_/l)}}for(let _=0;_<l;_++)for(let g=0;g<a;g++){let S=g+c*_,x=g+c*(_+1),y=g+1+c*(_+1),T=g+1+c*_;d.push(S,x,T),d.push(x,y,T)}this.setIndex(d),this.setAttribute("position",new Lt(p,3)),this.setAttribute("normal",new Lt(m,3)),this.setAttribute("uv",new Lt(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}};var oi=class s extends Ee{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,u=[],f=new E,h=new E,d=[],p=[],m=[],v=[];for(let _=0;_<=n;_++){let g=[],S=_/n,x=o+S*a,y=t*Math.cos(x),T=Math.sqrt(t*t-y*y),w=0;_===0&&o===0?w=.5/e:_===n&&l===Math.PI&&(w=-.5/e);for(let b=0;b<=e;b++){let C=b/e,M=i+C*r;f.x=-T*Math.cos(M),f.y=y,f.z=T*Math.sin(M),p.push(f.x,f.y,f.z),h.copy(f).normalize(),m.push(h.x,h.y,h.z),v.push(C+w,1-S),g.push(c++)}u.push(g)}for(let _=0;_<n;_++)for(let g=0;g<e;g++){let S=u[_][g+1],x=u[_][g],y=u[_+1][g],T=u[_+1][g+1];(_!==0||o>0)&&d.push(S,x,T),(_!==n-1||l<Math.PI)&&d.push(x,y,T)}this.setIndex(d),this.setAttribute("position",new Lt(p,3)),this.setAttribute("normal",new Lt(m,3)),this.setAttribute("uv",new Lt(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function xa(s){let t={};for(let e in s){t[e]={};for(let n in s[e]){let i=s[e][n];if(Jo(i))i.isRenderTargetTexture?(Ct("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone();else if(Array.isArray(i))if(Jo(i[0])){let r=[];for(let o=0,a=i.length;o<a;o++)r[o]=i[o].clone();t[e][n]=r}else t[e][n]=i.slice();else t[e][n]=i}}return t}function kt(s){let t={};for(let e=0;e<s.length;e++){let n=xa(s[e]);for(let i in n)t[i]=n[i]}return t}function Jo(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function wn(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Xi(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var Ue=class{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,i=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=e[++n],t<i)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let o=0;o!==i;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},rs=class extends Ue{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Er,endingEnd:Er}}intervalChanged_(t,e,n){let i=this.parameterPositions,r=t-2,o=t+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ar:r=t,a=2*e-n;break;case Cr:r=i.length-2,a=e+i[r]-i[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Ar:o=t,l=2*n-e;break;case Cr:o=1,l=n+i[1]-i[0];break;default:o=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,p=(n-e)/(i-e),m=p*p,v=m*p,_=-h*v+2*h*m-h*p,g=(1+h)*v+(-1.5-2*h)*m+(-.5+h)*p+1,S=(-1-d)*v+(1.5+d)*m+.5*p,x=d*v-d*m;for(let y=0;y!==a;++y)r[y]=_*o[u+y]+g*o[c+y]+S*o[l+y]+x*o[f+y];return r}},os=class extends Ue{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=(n-e)/(i-e),f=1-u;for(let h=0;h!==a;++h)r[h]=o[c+h]*f+o[l+h]*u;return r}},as=class extends Ue{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}},ls=class extends Ue{interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,u=this.inTangents,f=this.outTangents;if(!u||!f){let p=(n-e)/(i-e),m=1-p;for(let v=0;v!==a;++v)r[v]=o[c+v]*m+o[l+v]*p;return r}let h=a*2,d=t-1;for(let p=0;p!==a;++p){let m=o[c+p],v=o[l+p],_=d*h+p*2,g=f[_],S=f[_+1],x=t*h+p*2,y=u[x],T=u[x+1],w=Mc(n,e,g,y,i);r[p]=ya(w,m,S,T,v)}return r}};function ya(s,t,e,n,i){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*n+s*s*s*i}function Sc(s,t,e,n,i){let r=1-s;return 3*r*r*(e-t)+6*r*s*(n-e)+3*s*s*(i-n)}function Mc(s,t,e,n,i){let r=(s-t)/(i-t);for(let o=0;o<8;o++){let a=ya(r,t,e,n,i)-s;if(Math.abs(a)<1e-10)break;let l=Sc(r,t,e,n,i);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var $t=class{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=wn(e,this.TimeBufferType),this.values=wn(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:wn(t.times,Array),values:wn(t.values,Array)};let i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i),Xi(t.settings)&&(n.settings={inTangents:wn(t.settings.inTangents,Array),outTangents:wn(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new as(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new os(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new rs(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ls(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case ni:e=this.InterpolantFactoryMethodDiscrete;break;case Ki:e=this.InterpolantFactoryMethodLinear;break;case $i:e=this.InterpolantFactoryMethodSmooth;break;case Tr:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ct("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ni;case this.InterpolantFactoryMethodLinear:return Ki;case this.InterpolantFactoryMethodSmooth:return $i;case this.InterpolantFactoryMethodBezier:return Tr}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t;Xi(this.settings)&&(Ko(this.settings.inTangents,t),Ko(this.settings.outTangents,t))}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t;Xi(this.settings)&&(jo(this.settings.inTangents,t),jo(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,i=n.length,r=0,o=i-1;for(;r!==i&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(St("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,i=this.values,r=n.length;r===0&&(St("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){St("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){St("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(i!==void 0&&Wl(i))for(let a=0,l=i.length;a!==l;++a){let c=i[a];if(isNaN(c)){St("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===$i,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],u=t[a+1];if(c!==u&&(a!==1||c!==t[0]))if(i)l=!0;else{let f=a*n,h=f-n,d=f+n;for(let p=0;p!==n;++p){let m=e[f+p];if(m!==e[h+p]||m!==e[d+p]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let f=a*n,h=o*n;for(let d=0;d!==n;++d)e[h+d]=e[f+d]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,Xi(this.settings)&&(i.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),i}};function Ko(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]+=t}function jo(s,t){for(let e=0,n=s.length;e!==n;e+=2)s[e]*=t}$t.prototype.ValueTypeName="";$t.prototype.TimeBufferType=Float32Array;$t.prototype.ValueBufferType=Float32Array;$t.prototype.DefaultInterpolation=Ki;var Oe=class extends $t{constructor(t,e,n){super(t,e,n)}};Oe.prototype.ValueTypeName="bool";Oe.prototype.ValueBufferType=Array;Oe.prototype.DefaultInterpolation=ni;Oe.prototype.InterpolantFactoryMethodLinear=void 0;Oe.prototype.InterpolantFactoryMethodSmooth=void 0;var cs=class extends $t{constructor(t,e,n,i){super(t,e,n,i)}};cs.prototype.ValueTypeName="color";var us=class extends $t{constructor(t,e,n,i){super(t,e,n,i)}};us.prototype.ValueTypeName="number";var hs=class extends Ue{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(i-e),c=t*a;for(let u=c+a;c!==u;c+=4)J.slerpFlat(r,0,o,c-a,o,c,l);return r}},ai=class extends $t{constructor(t,e,n,i){super(t,e,n,i)}InterpolantFactoryMethodLinear(t){return new hs(this.times,this.values,this.getValueSize(),t)}};ai.prototype.ValueTypeName="quaternion";ai.prototype.InterpolantFactoryMethodSmooth=void 0;var Be=class extends $t{constructor(t,e,n){super(t,e,n)}};Be.prototype.ValueTypeName="string";Be.prototype.ValueBufferType=Array;Be.prototype.DefaultInterpolation=ni;Be.prototype.InterpolantFactoryMethodLinear=void 0;Be.prototype.InterpolantFactoryMethodSmooth=void 0;var fs=class extends $t{constructor(t,e,n,i){super(t,e,n,i)}};fs.prototype.ValueTypeName="vector";var ds=class{constructor(t,e,n){let i=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&i.onStart!==void 0&&i.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,i.onProgress!==void 0&&i.onProgress(u,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(u){i.onError!==void 0&&i.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,f){return c.push(u,f),this},this.removeHandler=function(u){let f=c.indexOf(u);return f!==-1&&c.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=c.length;f<h;f+=2){let d=c[f],p=c[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},va=new ds,ps=class{constructor(t){this.manager=t!==void 0?t:va,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}};ps.DEFAULT_MATERIAL_NAME="__DEFAULT";var $r="\\[\\]\\.:\\/",bc=new RegExp("["+$r+"]","g"),Zr="[^"+$r+"]",wc="[^"+$r.replace("\\.","")+"]",Tc=/((?:WC+[\/:])*)/.source.replace("WC",Zr),Ec=/(WCOD+)?/.source.replace("WCOD",wc),Ac=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Zr),Cc=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Zr),Rc=new RegExp("^"+Tc+Ec+Ac+Cc+"$"),Pc=["material","materials","bones","map"],Nr=class{constructor(t,e,n){let i=n||xt.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},xt=class s{constructor(t,e,n){this.path=e,this.parsedPath=n||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,n):new s(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(bc,"")}static parseTrackName(t){let e=Rc.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){let r=n.nodeName.substring(i+1);Pc.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,i=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Ct("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){St("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){St("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){St("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){St("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){St("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){St("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){St("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[i];if(o===void 0){let c=e.nodeName;St("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){St("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){St("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=Nr;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var yd=new Float32Array(1);var Dr=class{static{this.prototype.isMatrix2=!0}constructor(t,e,n,i){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,i)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,i){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=i,this}};var Qo=new E,Yi=new E,Tn=new E,En=new E,pr=new E,Ic=new E,Lc=new E,zt=class{constructor(t=new E,e=new E){this.start=t,this.end=e}set(t,e){return this.start.copy(t),this.end.copy(e),this}copy(t){return this.start.copy(t.start),this.end.copy(t.end),this}getCenter(t){return t.addVectors(this.start,this.end).multiplyScalar(.5)}delta(t){return t.subVectors(this.end,this.start)}distanceSq(){return this.start.distanceToSquared(this.end)}distance(){return this.start.distanceTo(this.end)}at(t,e){return this.delta(e).multiplyScalar(t).add(this.start)}closestPointToPointParameter(t,e){Qo.subVectors(t,this.start),Yi.subVectors(this.end,this.start);let n=Yi.dot(Yi);if(n===0)return 0;let r=Yi.dot(Qo)/n;return e&&(r=Z(r,0,1)),r}closestPointToPoint(t,e,n){let i=this.closestPointToPointParameter(t,e);return this.delta(n).multiplyScalar(i).add(this.start)}distanceSqToLine3(t,e=Ic,n=Lc){let i=10000000000000001e-32,r,o,a=this.start,l=t.start,c=this.end,u=t.end;Tn.subVectors(c,a),En.subVectors(u,l),pr.subVectors(a,l);let f=Tn.dot(Tn),h=En.dot(En),d=En.dot(pr);if(f<=i&&h<=i)return e.copy(a),n.copy(l),e.distanceToSquared(n);if(f<=i)r=0,o=d/h,o=Z(o,0,1);else{let p=Tn.dot(pr);if(h<=i)o=0,r=Z(-p/f,0,1);else{let m=Tn.dot(En),v=f*h-m*m;v!==0?r=Z((m*d-p*h)/v,0,1):r=0,o=(m*r+d)/h,o<0?(o=0,r=Z(-p/f,0,1)):o>1&&(o=1,r=Z((m-p)/f,0,1))}}return e.copy(a).addScaledVector(Tn,r),n.copy(l).addScaledVector(En,o),e.distanceToSquared(n)}applyMatrix4(t){return this.start.applyMatrix4(t),this.end.applyMatrix4(t),this}equals(t){return t.start.equals(this.start)&&t.end.equals(this.end)}clone(){return new this.constructor().copy(this)}};typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Ct("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");var Nc=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Dc=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Fc=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Uc=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Oc=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Bc=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zc=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,kc=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vc=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Gc=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Hc=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wc=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,qc=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Xc=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Yc=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,$c=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Zc=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jc=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Kc=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jc=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Qc=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,tu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,eu=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,nu=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,iu=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,su=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,ru=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,ou=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,au=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lu="gl_FragColor = linearToOutputTexel( gl_FragColor );",cu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,uu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,hu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,fu=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,du=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,pu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,mu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,gu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_u=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,xu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,yu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,vu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Su=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mu=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,bu=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,wu=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Tu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Eu=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Au=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Cu=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ru=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pu=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Iu=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Lu=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Nu=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Du=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Fu=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Uu=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ou=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Bu=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,zu=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ku=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Vu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Gu=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hu=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Wu=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,qu=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Xu=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Yu=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$u=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Zu=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ju=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ku=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ju=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qu=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,th=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,eh=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,nh=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ih=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,sh=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,rh=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,oh=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ah=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,lh=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,ch=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,uh=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hh=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,fh=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,dh=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ph=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,mh=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,gh=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,_h=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,xh=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,yh=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,vh=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Sh=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Mh=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,bh=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,wh=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Th=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Eh=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Ah=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ch=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Rh=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ph=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Ih=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Lh=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Nh=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dh=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Fh=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Uh=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Oh=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Bh=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,zh=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,kh=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Vh=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Gh=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Hh=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wh=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,qh=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Xh=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Yh=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$h=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zh=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Jh=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Kh=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jh=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Qh=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,tf=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ef=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,sf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,rf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,of=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,af=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,lf=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,cf=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,uf=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hf=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ff=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Q={alphahash_fragment:Nc,alphahash_pars_fragment:Dc,alphamap_fragment:Fc,alphamap_pars_fragment:Uc,alphatest_fragment:Oc,alphatest_pars_fragment:Bc,aomap_fragment:zc,aomap_pars_fragment:kc,batching_pars_vertex:Vc,batching_vertex:Gc,begin_vertex:Hc,beginnormal_vertex:Wc,bsdfs:qc,iridescence_fragment:Xc,bumpmap_pars_fragment:Yc,clipping_planes_fragment:$c,clipping_planes_pars_fragment:Zc,clipping_planes_pars_vertex:Jc,clipping_planes_vertex:Kc,color_fragment:jc,color_pars_fragment:Qc,color_pars_vertex:tu,color_vertex:eu,common:nu,defaultnormal_vertex:iu,displacementmap_pars_vertex:su,displacementmap_vertex:ru,emissivemap_fragment:ou,emissivemap_pars_fragment:au,colorspace_fragment:lu,colorspace_pars_fragment:cu,envmap_fragment:uu,envmap_common_pars_fragment:hu,envmap_pars_fragment:fu,envmap_pars_vertex:du,envmap_physical_pars_fragment:wu,envmap_vertex:pu,fog_vertex:mu,fog_pars_vertex:gu,fog_fragment:_u,fog_pars_fragment:xu,gradientmap_pars_fragment:yu,lightmap_pars_fragment:vu,lights_lambert_fragment:Su,lights_lambert_pars_fragment:Mu,lights_pars_begin:bu,lights_toon_fragment:Tu,lights_toon_pars_fragment:Eu,lights_phong_fragment:Au,lights_phong_pars_fragment:Cu,lights_physical_fragment:Ru,lights_physical_pars_fragment:Pu,lights_fragment_begin:Iu,lights_fragment_maps:Lu,lights_fragment_end:Nu,lightprobes_pars_fragment:Du,logdepthbuf_fragment:Fu,logdepthbuf_pars_fragment:Uu,logdepthbuf_pars_vertex:Ou,logdepthbuf_vertex:Bu,map_fragment:zu,map_pars_fragment:ku,map_particle_fragment:Vu,map_particle_pars_fragment:Gu,metalnessmap_fragment:Hu,metalnessmap_pars_fragment:Wu,morphinstance_vertex:qu,morphcolor_vertex:Xu,morphnormal_vertex:Yu,morphtarget_pars_vertex:$u,morphtarget_vertex:Zu,normal_fragment_begin:Ju,normal_fragment_maps:Ku,normal_pars_fragment:ju,normal_pars_vertex:Qu,normal_vertex:th,normalmap_pars_fragment:eh,clearcoat_normal_fragment_begin:nh,clearcoat_normal_fragment_maps:ih,clearcoat_pars_fragment:sh,iridescence_pars_fragment:rh,opaque_fragment:oh,packing:ah,premultiplied_alpha_fragment:lh,project_vertex:ch,dithering_fragment:uh,dithering_pars_fragment:hh,roughnessmap_fragment:fh,roughnessmap_pars_fragment:dh,shadowmap_pars_fragment:ph,shadowmap_pars_vertex:mh,shadowmap_vertex:gh,shadowmask_pars_fragment:_h,skinbase_vertex:xh,skinning_pars_vertex:yh,skinning_vertex:vh,skinnormal_vertex:Sh,specularmap_fragment:Mh,specularmap_pars_fragment:bh,tonemapping_fragment:wh,tonemapping_pars_fragment:Th,transmission_fragment:Eh,transmission_pars_fragment:Ah,uv_pars_fragment:Ch,uv_pars_vertex:Rh,uv_vertex:Ph,worldpos_vertex:Ih,background_vert:Lh,background_frag:Nh,backgroundCube_vert:Dh,backgroundCube_frag:Fh,cube_vert:Uh,cube_frag:Oh,depth_vert:Bh,depth_frag:zh,distance_vert:kh,distance_frag:Vh,equirect_vert:Gh,equirect_frag:Hh,linedashed_vert:Wh,linedashed_frag:qh,meshbasic_vert:Xh,meshbasic_frag:Yh,meshlambert_vert:$h,meshlambert_frag:Zh,meshmatcap_vert:Jh,meshmatcap_frag:Kh,meshnormal_vert:jh,meshnormal_frag:Qh,meshphong_vert:tf,meshphong_frag:ef,meshphysical_vert:nf,meshphysical_frag:sf,meshtoon_vert:rf,meshtoon_frag:of,points_vert:af,points_frag:lf,shadow_vert:cf,shadow_frag:uf,sprite_vert:hf,sprite_frag:ff},k={common:{diffuse:{value:new Nt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Y}},envmap:{envMap:{value:null},envMapRotation:{value:new Y},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Y}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Y}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Y},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Y},normalScale:{value:new mt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Y},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Y}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Y}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Y}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Nt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Nt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0},uvTransform:{value:new Y}},sprite:{diffuse:{value:new Nt(16777215)},opacity:{value:1},center:{value:new mt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Y},alphaMap:{value:null},alphaMapTransform:{value:new Y},alphaTest:{value:0}}},Sa={basic:{uniforms:kt([k.common,k.specularmap,k.envmap,k.aomap,k.lightmap,k.fog]),vertexShader:Q.meshbasic_vert,fragmentShader:Q.meshbasic_frag},lambert:{uniforms:kt([k.common,k.specularmap,k.envmap,k.aomap,k.lightmap,k.emissivemap,k.bumpmap,k.normalmap,k.displacementmap,k.fog,k.lights,{emissive:{value:new Nt(0)},envMapIntensity:{value:1}}]),vertexShader:Q.meshlambert_vert,fragmentShader:Q.meshlambert_frag},phong:{uniforms:kt([k.common,k.specularmap,k.envmap,k.aomap,k.lightmap,k.emissivemap,k.bumpmap,k.normalmap,k.displacementmap,k.fog,k.lights,{emissive:{value:new Nt(0)},specular:{value:new Nt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Q.meshphong_vert,fragmentShader:Q.meshphong_frag},standard:{uniforms:kt([k.common,k.envmap,k.aomap,k.lightmap,k.emissivemap,k.bumpmap,k.normalmap,k.displacementmap,k.roughnessmap,k.metalnessmap,k.fog,k.lights,{emissive:{value:new Nt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag},toon:{uniforms:kt([k.common,k.aomap,k.lightmap,k.emissivemap,k.bumpmap,k.normalmap,k.displacementmap,k.gradientmap,k.fog,k.lights,{emissive:{value:new Nt(0)}}]),vertexShader:Q.meshtoon_vert,fragmentShader:Q.meshtoon_frag},matcap:{uniforms:kt([k.common,k.bumpmap,k.normalmap,k.displacementmap,k.fog,{matcap:{value:null}}]),vertexShader:Q.meshmatcap_vert,fragmentShader:Q.meshmatcap_frag},points:{uniforms:kt([k.points,k.fog]),vertexShader:Q.points_vert,fragmentShader:Q.points_frag},dashed:{uniforms:kt([k.common,k.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Q.linedashed_vert,fragmentShader:Q.linedashed_frag},depth:{uniforms:kt([k.common,k.displacementmap]),vertexShader:Q.depth_vert,fragmentShader:Q.depth_frag},normal:{uniforms:kt([k.common,k.bumpmap,k.normalmap,k.displacementmap,{opacity:{value:1}}]),vertexShader:Q.meshnormal_vert,fragmentShader:Q.meshnormal_frag},sprite:{uniforms:kt([k.sprite,k.fog]),vertexShader:Q.sprite_vert,fragmentShader:Q.sprite_frag},background:{uniforms:{uvTransform:{value:new Y},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Q.background_vert,fragmentShader:Q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Y}},vertexShader:Q.backgroundCube_vert,fragmentShader:Q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Q.cube_vert,fragmentShader:Q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Q.equirect_vert,fragmentShader:Q.equirect_frag},distance:{uniforms:kt([k.common,k.displacementmap,{referencePosition:{value:new E},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Q.distance_vert,fragmentShader:Q.distance_frag},shadow:{uniforms:kt([k.lights,k.fog,{color:{value:new Nt(0)},opacity:{value:1}}]),vertexShader:Q.shadow_vert,fragmentShader:Q.shadow_frag}};Sa.physical={uniforms:kt([Sa.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Y},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Y},clearcoatNormalScale:{value:new mt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Y},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Y},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Y},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Y},sheen:{value:0},sheenColor:{value:new Nt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Y},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Y},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Y},transmissionSamplerSize:{value:new mt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Y},attenuationDistance:{value:0},attenuationColor:{value:new Nt(0)},specularColor:{value:new Nt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Y},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Y},anisotropyVector:{value:new mt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Y}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag};var df=new Y;df.set(-1,0,0,0,1,0,0,0,1);var Ux={[Ur]:"LINEAR_TONE_MAPPING",[Or]:"REINHARD_TONE_MAPPING",[Br]:"CINEON_TONE_MAPPING",[zr]:"ACES_FILMIC_TONE_MAPPING",[Vr]:"AGX_TONE_MAPPING",[Gr]:"NEUTRAL_TONE_MAPPING",[kr]:"CUSTOM_TONE_MAPPING"};var Ox=new Float32Array(16),Bx=new Float32Array(9),zx=new Float32Array(4);var kx={[Ur]:"Linear",[Or]:"Reinhard",[Br]:"Cineon",[zr]:"ACESFilmic",[Vr]:"AgX",[Gr]:"Neutral",[kr]:"Custom"};var Vx={[ta]:"SHADOWMAP_TYPE_PCF",[ea]:"SHADOWMAP_TYPE_VSM"};var Gx={[ra]:"ENVMAP_MODE_REFRACTION"};var Hx={[na]:"ENVMAP_BLENDING_MULTIPLY",[ia]:"ENVMAP_BLENDING_MIX",[sa]:"ENVMAP_BLENDING_ADD"};var pf=new Y;pf.set(-1,0,0,0,1,0,0,0,1);var Wx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);var mf=new Set(["fixed","revolute","continuous","prismatic"]),gs=(s,t,e)=>{if(!Array.isArray(s)||s.length!==t||!s.every(Number.isFinite))throw new Error(`${e} needs ${t} finite numbers.`);return s},Kr=(s,t)=>{let e=s?.elements?[...s.elements]:s==null?new H().elements.slice():[...s];return gs(e,16,t)};function _s({joints:s,tipLink:t,toolTransform:e,worldFromBase:n}={}){if(!t||!Array.isArray(s))throw new Error("IK needs a tip link and a joint array.");let i=new Map;for(let c of s){let u=c.get?.("child")?.link??c.child;if(!u||i.has(u))throw new Error("IK requires one parent joint per link.");i.set(u,c)}let r=[],o=new Set,a=t;for(;i.has(a);){if(o.has(a))throw new Error("IK requires an acyclic joint tree.");o.add(a);let c=i.get(a),u=c.get?.("parent")?.link??c.parent,f=c.type;if(!mf.has(f))throw new Error(`IK does not support ${f} joints.`);if(c.mimic&&f!=="fixed")throw new Error(`IK cannot directly drive mimic joint ${c.name}.`);let h=c.axis?.toArray?c.axis.toArray():c.axis??[1,0,0];gs(h,3,`Joint ${c.name} axis`);let d=new E(...h);if(f!=="fixed"&&d.lengthSq()<1e-20)throw new Error(`Joint ${c.name} axis is zero.`);d.normalize();let p=f==="continuous"||f==="fixed"?null:Number(c.lower),m=f==="continuous"||f==="fixed"?null:Number(c.upper);if(f!=="continuous"&&f!=="fixed"&&(!Number.isFinite(p)||!Number.isFinite(m)||p>m))throw new Error(`Joint ${c.name} needs valid limits.`);r.push({name:c.name??c.get?.("name")??child,parent:u,child:a,type:f,axis:d.toArray(),origin:Kr(c.basicMatrix??c.origin,`Joint ${c.name} origin`),lower:p,upper:m,initial:f==="fixed"?null:Number(c.theta??0)}),a=u}r.reverse();let l=r.map((c,u)=>c.type==="fixed"?null:u).filter(c=>c!=null);if(!l.length)throw new Error("IK chain has no movable joints.");for(let c of l)if(!Number.isFinite(r[c].initial))throw new Error(`Joint ${r[c].name} has an invalid position.`);return{baseLink:a,tipLink:t,joints:r,active:l,jointNames:l.map(c=>r[c].name),initial:l.map(c=>r[c].initial),toolTransform:Kr(e,"Tool transform"),worldFromBase:Kr(n,"Robot base transform")}}function Qe(s,t){return gs(t,s.active.length,"Joint configuration"),t.map((e,n)=>{let i=s.joints[s.active[n]];return i.type==="continuous"?e:Math.max(i.lower,Math.min(i.upper,e))})}function ut(s,t,{frames:e=!1}={}){gs(t,s.active.length,"Joint configuration");let n=new H().fromArray(s.worldFromBase),i=[],r=0;for(let u of s.joints){if(n.multiply(new H().fromArray(u.origin)),u.type==="fixed")continue;let f=new E().setFromMatrixPosition(n),h=new E(...u.axis).transformDirection(n);i.push({origin:f,axis:h,type:u.type});let d=t[r++],p=u.type==="prismatic"?new H().makeTranslation(u.axis[0]*d,u.axis[1]*d,u.axis[2]*d):new H().makeRotationAxis(new E(...u.axis),d);n.multiply(p)}n.multiply(new H().fromArray(s.toolTransform));let o=new E,a=new J,l=new E;n.decompose(o,a,l);let c={position:o.toArray(),quaternion:a.toArray()};return e&&(c.frames=i),c}var Qr=s=>Math.hypot(...s),jr=(s,t)=>Array.isArray(s)&&s.length===t&&s.every(Number.isFinite);function gf(s,t){let e=new J(...s).normalize(),i=new J(...t).normalize().multiply(e.invert()).normalize();i.w<0&&i.set(-i.x,-i.y,-i.z,-i.w);let r=Math.hypot(i.x,i.y,i.z),o=2*Math.atan2(r,i.w);return r<1e-12?[0,0,0]:[i.x*o/r,i.y*o/r,i.z*o/r]}function Vt(s,t){let e=t.position.map((i,r)=>i-s.position[r]),n=gf(s.quaternion,t.quaternion);return{translation:e,rotation:n,positionError:Qr(e),orientationError:Qr(n)}}function _f(s,t){let e=t.length,n=s.map((i,r)=>[...i,t[r]]);for(let i=0;i<e;i++){let r=i;for(let a=i+1;a<e;a++)Math.abs(n[a][i])>Math.abs(n[r][i])&&(r=a);if(Math.abs(n[r][i])<1e-15)return null;[n[i],n[r]]=[n[r],n[i]];let o=n[i][i];for(let a=i;a<=e;a++)n[i][a]/=o;for(let a=0;a<e;a++){if(a===i)continue;let l=n[a][i];for(let c=i;c<=e;c++)n[a][c]-=l*n[i][c]}}return n.map(i=>i[e])}function xf(s,t,e,n,i){let r=new E(...e);return n.map(({origin:o,axis:a,type:l})=>{let c=l==="prismatic"?a:new E().crossVectors(a,r.clone().sub(o)),u=l==="prismatic"?new E:a;return[...c.toArray(),...u.multiplyScalar(i).toArray()]})}function Ma(s,t){return Math.hypot(s.positionError,s.orientationError*t)}function Pn(s,t,e={}){if(!jr(t?.position,3)||!jr(t?.quaternion,4)||Qr(t.quaternion)<1e-12)return{status:"invalid_target",reason:"Target needs a finite position and nonzero quaternion."};let n=s.active.length,i=e.seed??s.initial;if(!jr(i,n))return{status:"invalid_target",reason:"Seed configuration is invalid."};let r=e.positionTolerance??1e-4,o=e.orientationTolerance??.001,a=e.orientationWeight??.25,l=e.maxIterations??160,c=e.maxStarts??1+n*4;if(![r,o,a].every(m=>Number.isFinite(m)&&m>0)||!Number.isInteger(l)||l<0||!Number.isInteger(c)||c<1)return{status:"invalid_target",reason:"IK tolerances and weight must be positive; iteration and restart budgets must be valid integers."};let u=e.isStateValid??(()=>!0),f=[Qe(s,[...i])],h=[.12,-.12,.5,-.5];for(let m=0;m<n&&f.length<c;m++)for(let v of h){if(f.length>=c)break;let _=[...i];_[m]+=s.joints[s.active[m]].type==="prismatic"?v*.1:v,f.push(Qe(s,_))}let d=null;for(let m of f){let v=m,_=.03;for(let g=0;g<=l;g++){let S=ut(s,v,{frames:!0}),x=Vt(S,t),y=Ma(x,a);if((!d||y<d.score)&&(d={q:[...v],pose:S,residual:x,score:y,iteration:g}),x.positionError<=r&&x.orientationError<=o&&u(v))return{status:"reached",q:[...v],pose:{position:S.position,quaternion:S.quaternion},positionError:x.positionError,orientationError:x.orientationError,iterations:g};if(g===l)break;let T=xf(s,v,S.position,S.frames,a),w=[...x.translation,...x.rotation.map(A=>A*a)],b=T.map((A,P)=>T.map((F,N)=>A.reduce((z,G,I)=>z+G*F[I],P===N?_*_:0))),C=T.map(A=>A.reduce((P,F,N)=>P+F*w[N],0)),M=_f(b,C);if(!M)break;let R=!1;for(let A of[1,.5,.25,.125]){let P=Qe(s,v.map((N,z)=>{let I=s.joints[s.active[z]].type==="prismatic"?.05:.25;return N+Math.max(-I,Math.min(I,M[z]))*A})),F=Vt(ut(s,P),t);if(Ma(F,a)<y-1e-11){v=P,_=Math.max(.003,_*.7),R=!0;break}}if(!R&&(_*=5,_>10))break}}let p=d.residual.positionError<=r&&d.residual.orientationError<=o;return{status:p?"collision":"unreachable",reason:p?"IK reached the pose only in a configuration rejected by collision/state validation.":"No joint configuration met the position and orientation tolerances.",q:d.q,pose:{position:d.pose.position,quaternion:d.pose.quaternion},positionError:d.residual.positionError,orientationError:d.residual.orientationError}}var to=s=>new J(...s).normalize(),ba=s=>new E(...s);function hi(s,t){let e=to(s),n=to(t);e.dot(n)<0&&n.set(-n.x,-n.y,-n.z,-n.w);let i=e.clone().invert().multiply(n).normalize(),r=new E(i.x,i.y,i.z),o=r.length();return o<1e-12?r.multiplyScalar(2):r.multiplyScalar(2*Math.atan2(o,i.w)/o)}function yf(s){let t=s.length();return t<1e-10?new J(s.x/2,s.y/2,s.z/2,1).normalize():new J().setFromAxisAngle(s.clone().divideScalar(t),t)}function vf(s,t){let e=s.length(),n=new E().crossVectors(s,t),i=new E().crossVectors(s,n);return e<1e-6?t.clone().addScaledVector(n,-.5).addScaledVector(i,1/6):t.clone().addScaledVector(n,-(1-Math.cos(e))/e**2).addScaledVector(i,(e-Math.sin(e))/e**3)}function Sf(s,t){let e=s.length(),n=new E().crossVectors(s,t),i=new E().crossVectors(s,n),r=e<1e-6?1/12+e**2/720:1/e**2-1/(2*e*Math.tan(e/2));return t.clone().addScaledVector(n,.5).addScaledVector(i,r)}function wa(s,t,e,n,i){if(!(Number.isFinite(i)&&i>0))throw new Error("Orientation transition needs positive span.");let r=to(s),o=hi(s,t),a=ba(e).multiplyScalar(i),l=Sf(o,ba(n)).multiplyScalar(i),c=[new E,a.clone().divideScalar(3),o.clone().addScaledVector(l,-1/3),o.clone()],u=c.slice(0,3).map((m,v)=>c[v+1].clone().sub(m).multiplyScalar(3)),f=Math.max(...u.map(m=>m.length()))/i,h=c.slice(0,3).reduce((m,v,_)=>m+c[_+1].distanceTo(v),0),d=m=>{let v=Math.max(0,Math.min(1,m)),_=1-v;return c[0].clone().multiplyScalar(_**3).addScaledVector(c[1],3*_**2*v).addScaledVector(c[2],3*_*v**2).addScaledVector(c[3],v**3)},p=m=>{let v=Math.max(0,Math.min(1,m)),_=1-v;return u[0].clone().multiplyScalar(_**2).addScaledVector(u[1],2*_*v).addScaledVector(u[2],v**2)};return{relativeAngle:o.length(),angleBound:h,rateBound:f,at(m){return r.clone().multiply(yf(d(m))).normalize().toArray()},bodyRateAt(m){return vf(d(m),p(m)).divideScalar(i).toArray()}}}var fi=1e-10,di=s=>new E(...s.position),pi=s=>new J(...s.quaternion).normalize(),Ta=(s,t)=>({position:s.toArray(),quaternion:t.toArray()}),eo=(s,t)=>2*Math.acos(Math.min(1,Math.abs(s.dot(t)))),no=s=>Array.isArray(s?.position)&&s.position.length===3&&s.position.every(Number.isFinite)&&Array.isArray(s.quaternion)&&s.quaternion.length===4&&s.quaternion.every(Number.isFinite)&&Math.hypot(...s.quaternion)>fi;function In(s,t){if(!no(s)||!no(t))throw new Error("LIN needs two finite TCP poses.");let e=di(s),n=di(t),i=pi(s),r=pi(t),o=hi(i.toArray(),r.toArray()).divideScalar(Math.max(e.distanceTo(n),fi)).toArray();return{type:"LIN",length:e.distanceTo(n),rotationAngle:eo(i,r),start:s,end:t,tangentAt(){return n.clone().sub(e).normalize().toArray()},curvatureAt(){return[0,0,0]},angularVelocityAt(){return o},at(a){let l=Math.max(0,Math.min(1,a));return Ta(e.clone().lerp(n,l),i.clone().slerp(r,l))}}}function Ln(s,t,e){if(![s,t,e].every(no))throw new Error("CIRC needs three finite TCP poses.");let n=di(s),i=di(t),r=di(e),o=i.clone().sub(n),a=r.clone().sub(n),l=new E().crossVectors(o,a),c=Math.max(o.lengthSq(),a.lengthSq());if(o.lengthSq()<fi||a.lengthSq()<fi||i.distanceToSquared(r)<fi||l.lengthSq()<c*c*1e-12)throw new Error("CIRC start, via, and end must be distinct non-collinear positions.");let u=n.clone().addScaledVector(a.clone().cross(l),o.lengthSq()/(2*l.lengthSq())).addScaledVector(l.clone().cross(o),a.lengthSq()/(2*l.lengthSq())),f=l.normalize(),h=n.clone().sub(u),d=h.length(),p=R=>{let A=R.clone().sub(u),P=Math.atan2(f.dot(new E().crossVectors(h,A)),h.dot(A));return P<0?P+2*Math.PI:P},m=p(i),v=p(r),_=v>=m?v:v-2*Math.PI,S=(_>=0?m:m-2*Math.PI)/_,x=new E().crossVectors(f,h),y=pi(s),T=pi(t),w=pi(e),b=Math.abs(_)*d,C=hi(y.toArray(),T.toArray()).divideScalar(S*b).toArray(),M=hi(T.toArray(),w.toArray()).divideScalar((1-S)*b).toArray();return{type:"CIRC",length:b,rotationAngle:eo(y,T)+eo(T,w),radius:d,center:u.toArray(),sweep:_,viaFraction:S,start:s,via:t,end:e,tangentAt(R){let A=new E(...this.at(R).position).sub(u).normalize();return new E().crossVectors(f,A).multiplyScalar(Math.sign(_)).toArray()},curvatureAt(R){return u.clone().sub(new E(...this.at(R).position)).divideScalar(d*d).toArray()},angularVelocityAt(R){return R<S?C:M},at(R){let A=Math.max(0,Math.min(1,R)),P=_*A,F=u.clone().addScaledVector(h,Math.cos(P)).addScaledVector(x,Math.sin(P)),N=A<=S?y.clone().slerp(T,A/S):T.clone().slerp(w,(A-S)/(1-S));return Ta(F,N)}}}function ze(s,t,e={}){let n=e.translationStep??.01,i=e.orientationStep??Math.PI/90;if(!(n>0&&i>0))throw new Error("Path sample steps must be positive.");let r=Math.max(1,Math.ceil(t.length/n),Math.ceil(t.rotationAngle/i));if(r>(e.maxSamples??1e4))return{status:"sample_budget",reason:"Cartesian path requires too many IK samples."};let o=[t.viaFraction,...t.requiredFractions??[]].filter(d=>Number.isFinite(d)&&d>0&&d<1),a=Array.from({length:r+1},(d,p)=>p/r).filter((d,p)=>p===0||p===r||o.every(m=>Math.abs(d-m)>=.5/r));a.push(...o),a.sort((d,p)=>d-p);let l=a.filter((d,p)=>p===0||d-a[p-1]>1e-12),c=e.start??s.initial,u=Vt(ut(s,c),t.at(0));if(u.positionError>(e.positionTolerance??1e-4)||u.orientationError>(e.orientationTolerance??.001))return{status:"invalid_start",reason:"Current TCP pose does not match the path start.",at:0,...u};let f=[{s:0,q:[...c],tcp:t.at(0)}];if(e.isStateValid&&!e.isStateValid(c))return{status:"collision",reason:"Start configuration collides.",at:0};let h=[...c];for(let d of l.slice(1)){let p=t.at(d),{isEdgeValid:m,...v}=e,_=Pn(s,p,{...v,seed:h});if(_.status!=="reached")return{status:_.status==="collision"?"collision":"ik_failed",reason:_.reason,at:d,result:_};let g=e.maxJointJump??.5;if(_.q.some((S,x)=>Math.abs(S-h[x])>g))return{status:"ik_jump",reason:"IK changed branches along the Cartesian path.",at:d,q:_.q};if(e.isStateValid&&!e.isStateValid(_.q))return{status:"collision",reason:"TCP path intersects an obstacle.",at:d,q:_.q};if(e.isEdgeValid&&!e.isEdgeValid(h,_.q))return{status:"collision",reason:"Joint interpolation between TCP samples intersects an obstacle.",at:d};f.push({s:d,q:_.q,tcp:p}),h=_.q}return{status:"planned",type:t.type,jointPath:f,length:t.length,samples:f.length-1}}var mi=s=>[...s],Ea=(s,t,e)=>Math.hypot(...s.map((n,i)=>(n-t[i])/e[i])),Aa=(s,t,e)=>s.map((n,i)=>n+(t[i]-n)*e);function Mf(s){let t=s>>>0||1;return()=>(t^=t<<13,t^=t>>>17,t^=t<<5,(t>>>0)/4294967296)}function ke(s,t=()=>!0,{maxRevoluteStep:e=.04,maxPrismaticStep:n=.01}={}){if(![e,n].every(r=>Number.isFinite(r)&&r>0))throw new Error("Collision sample steps must be finite positive numbers.");return{isStateValid:t,isEdgeValid:(r,o)=>{if(!t(r)||!t(o))return!1;let a=1;for(let l=0;l<s.active.length;l++){let u=s.joints[s.active[l]].type==="prismatic"?n:e;a=Math.max(a,Math.ceil(Math.abs(o[l]-r[l])/u))}for(let l=1;l<a;l++)if(!t(Aa(r,o,l/a)))return!1;return!0}}}function xs(s,t,e,n={}){let i=s.active.length;if(![t,e].every(x=>Array.isArray(x)&&x.length===i&&x.every(Number.isFinite)))return{status:"invalid_target",reason:"PTP needs one finite value per active joint."};let r=Qe(s,t),o=Qe(s,e);if(r.some((x,y)=>Math.abs(x-t[y])>1e-10)||o.some((x,y)=>Math.abs(x-e[y])>1e-10))return{status:"joint_limit",reason:"PTP start or target exceeds joint limits."};let a=n.isStateValid??(()=>!0),l=n.isEdgeValid??ke(s,a,n).isEdgeValid;if(!a(r))return{status:"collision",reason:"PTP start is in collision."};if(!a(o))return{status:"collision",reason:"PTP target is in collision."};if(l(r,o))return{status:"planned",type:"PTP",jointPath:[{s:0,q:mi(r)},{s:1,q:mi(o)}],direct:!0,stopAtInternalNodes:!1};let c=s.active.map((x,y)=>{let T=s.joints[x];return T.type==="continuous"?[Math.min(r[y],o[y])-Math.PI,Math.max(r[y],o[y])+Math.PI]:[T.lower,T.upper]}),u=s.active.map(x=>s.joints[x].type==="prismatic"?.25:1),f=Mf(n.seed??1597463007),h=n.maxNodes??6e3,d=n.stepSize??.25;if(!(Number.isInteger(h)&&h>0&&h<=1e5&&Number.isFinite(d)&&d>0))return{status:"invalid_target",reason:"PTP planner limits must be finite positive values."};let p=Number.isFinite(n.timeBudgetMs)&&n.timeBudgetMs>0?performance.now()+n.timeBudgetMs:1/0,m=[{root:"start",nodes:[{q:mi(r),parent:-1}]},{root:"goal",nodes:[{q:mi(o),parent:-1}]}],v=(x,y)=>{let T=0,w=1/0;return x.nodes.forEach((b,C)=>{let M=Ea(b.q,y,u);M<w&&(w=M,T=C)}),T},_=(x,y)=>{let T=v(x,y),w=x.nodes[T].q,b=Ea(w,y,u);if(b<1e-10)return{status:"reached",index:T};let C=Aa(w,y,Math.min(1,d/b));if(!l(w,C))return{status:"trapped",index:T};let M=x.nodes.push({q:C,parent:T})-1;return{status:b<=d?"reached":"advanced",index:M}},g=(x,y)=>{let T=[];for(;y>=0;)T.push(mi(x.nodes[y].q)),y=x.nodes[y].parent;return T.reverse()},S=x=>{let y=[...x];for(let T=0;T<Math.min(200,y.length*20)&&y.length>2;T++){let w=Math.floor(f()*(y.length-2)),b=w+2+Math.floor(f()*(y.length-w-2));l(y[w],y[b])&&y.splice(w+1,b-w-1)}return y};for(let x=0;x<h;x++){if(n.signal?.aborted)return{status:"cancelled",reason:"PTP planning was cancelled."};if(performance.now()>p)return{status:"time_budget",reason:"PTP planning exceeded its time budget.",nodesExplored:m[0].nodes.length+m[1].nodes.length};let y=f()<.15?m[1].nodes[0].q:c.map(([w,b])=>w+f()*(b-w)),T=_(m[0],y);if(T.status!=="trapped"){let w=m[0].nodes[T.index].q,b;do b=_(m[1],w);while(b.status==="advanced"&&m[0].nodes.length+m[1].nodes.length<h);if(b.status==="reached"){let C=g(m[0],T.index),M=g(m[1],b.index),R=m[0].root==="start"?[...C,...M.reverse().slice(1)]:[...M,...C.reverse().slice(1)],A=S(R);return{status:"planned",type:"PTP",jointPath:A.map((P,F)=>({s:F/(A.length-1),q:P})),direct:!1,stopAtInternalNodes:A.length>2,nodesExplored:m[0].nodes.length+m[1].nodes.length}}}if(m.reverse(),m[0].nodes.length+m[1].nodes.length>=h)break}return{status:"no_path",reason:"RRT-Connect found no collision-free joint path within the node budget.",nodesExplored:m[0].nodes.length+m[1].nodes.length}}function tn(s,t,e){let n=t.time-s.time;if(!(n>0)||!Number.isFinite(e))throw new Error("Timed interpolation needs a finite time and increasing samples.");let i=Math.max(0,Math.min(1,(e-s.time)/n));if(!(s.velocity&&s.acceleration&&t.velocity&&t.acceleration))return{q:s.q.map((c,u)=>c+(t.q[u]-c)*i),velocity:s.q.map((c,u)=>(t.q[u]-c)/n),acceleration:s.q.map(()=>0)};let o=[],a=[],l=[];for(let c=0;c<s.q.length;c++){let u=s.q[c],f=s.velocity[c]*n,h=s.acceleration[c]*n*n/2,d=t.q[c]-u-f-h,p=t.velocity[c]*n-f-2*h,m=t.acceleration[c]*n*n-2*h,v=10*d-4*p+m/2,_=-15*d+7*p-m,g=6*d-3*p+m/2;o.push(u+i*(f+i*(h+i*(v+i*(_+i*g))))),a.push((f+i*(2*h+i*(3*v+i*(4*_+i*5*g))))/n),l.push((2*h+i*(6*v+i*(12*_+i*20*g)))/(n*n))}return{q:o,velocity:a,acceleration:l}}function Ca(s,t){if(!Number.isFinite(t))throw new Error("Timed joint lookup needs a finite time.");if(t<=0||s.length===1)return{q:[...s[0].q],velocity:[...s[0].velocity??s[0].q.map(()=>0)],acceleration:[...s[0].acceleration??s[0].q.map(()=>0)]};if(t>=s.at(-1).time){let i=s.at(-1);return{q:[...i.q],velocity:[...i.velocity??i.q.map(()=>0)],acceleration:[...i.acceleration??i.q.map(()=>0)]}}let e=0,n=s.length-1;for(;n-e>1;){let i=Math.floor((e+n)/2);s[i].time<=t?e=i:n=i}return tn(s[e],s[n],t)}var gi=s=>10*s**3-15*s**4+6*s**5,Ra=s=>30*s**2*(1-s)**2,Pa=s=>60*s*(1-s)*(1-2*s);function bf(s){if(s<=0)return 0;if(s>=1)return 1;let t=0,e=1;for(let n=0;n<48;n++){let i=(t+e)/2;gi(i)<s?t=i:e=i}return(t+e)/2}function Ia(s,t){let e=Array.from({length:t+1},(n,i)=>i/t);for(let n=0;n<s.length-1;n++){let i=s[n].s,r=s[n+1].s;for(let o=0;o<=16;o++)e.push(bf(i+(r-i)*o/16))}return e.sort((n,i)=>n-i),e.filter((n,i)=>i===0||n-e[i-1]>1e-12)}function La(s,t,e=!1){let n=0;for(;n<s.length-2&&t>s[n+1].s;)n++;let i=s[n],r=s[n+1],o=r.s-i.s;if(!(o>0))throw new Error("Path fractions must increase strictly.");let a=Math.max(0,Math.min(1,(t-i.s)/o)),l=(h,d)=>{if(e&&h>0&&h<s.length-1)return 0;let p=s[Math.max(0,h-1)],m=s[Math.min(s.length-1,h+1)];return(m.q[d]-p.q[d])/(m.s-p.s)},c=[],u=[],f=[];for(let h=0;h<i.q.length;h++){let d=l(n,h),p=l(n+1,h),m=i.q[h],v=r.q[h],_=2*a**3-3*a**2+1,g=a**3-2*a**2+a,S=-2*a**3+3*a**2,x=a**3-a**2;c.push(_*m+g*o*d+S*v+x*o*p),u.push(((6*a**2-6*a)*m+(3*a**2-4*a+1)*o*d+(-6*a**2+6*a)*v+(3*a**2-2*a)*o*p)/o),f.push(((12*a-6)*m+(6*a-4)*o*d+(-12*a+6)*v+(6*a-2)*o*p)/(o*o))}return{q:c,d1:u,d2:f}}function wf(s,t){if(!Array.isArray(s)||s.length<2||s[0].s!==0||s.at(-1).s!==1)return"Path needs at least two knots from s=0 to s=1.";let e=s[0].q?.length;return!(e>0)||!s.every((n,i)=>Number.isFinite(n.s)&&(i===0||n.s>s[i-1].s)&&Array.isArray(n.q)&&n.q.length===e&&n.q.every(Number.isFinite))?"Path knots must have increasing fractions and finite joint vectors.":!Array.isArray(t?.velocity)||!Array.isArray(t?.acceleration)||t.velocity.length!==e||t.acceleration.length!==e||![...t.velocity,...t.acceleration].every(n=>Number.isFinite(n)&&n>0)?"Each joint needs positive velocity and acceleration limits.":null}function Na(s,t,e,n){let i=e.model,r=Ia(s,200),o=e.minimumDuration??.01;for(let a of r){let l=gi(a),{d1:c,d2:u}=La(s,l,n),f=Ra(a),h=Pa(a);for(let d=0;d<c.length;d++)o=Math.max(o,Math.abs(c[d]*f)/t.velocity[d]),o=Math.max(o,Math.sqrt(Math.abs(u[d]*f*f+c[d]*h)/t.acceleration[d]))}o*=1.02;for(let a=0;a<4;a++){let l=Math.max(2,Math.ceil(o/Math.min(e.dt??.02,.02)));if(l+s.length*17>(e.maxPoints??2e5))return{status:"sample_budget",reason:"Timed path would exceed the playback sample budget."};let c=[],u=1;for(let f of Ia(s,l)){let h=gi(f),{q:d,d1:p,d2:m}=La(s,h,n),v=Ra(f)/o,_=Pa(f)/(o*o),g=p.map(x=>x*v),S=m.map((x,y)=>x*v*v+p[y]*_);for(let x=0;x<d.length;x++)u=Math.max(u,Math.abs(g[x])/t.velocity[x],Math.sqrt(Math.abs(S[x])/t.acceleration[x]));if(e.isStateValid&&!e.isStateValid(d))return{status:"collision",reason:"Timed path intersects an obstacle.",at:h};if(i&&d.some((x,y)=>{let T=i.joints[i.active[y]];return T.type!=="continuous"&&(x<T.lower-1e-9||x>T.upper+1e-9)}))return{status:"joint_limit",reason:"Smoothed path crosses a joint limit.",at:h};if(i&&e.cartesianPath){let x=Vt(ut(i,d),e.cartesianPath.at(h));if(x.positionError>(e.pathTolerance??.002)||x.orientationError>(e.orientationPathTolerance??.02))return{status:"geometry_deviation",reason:"Timed joint interpolation deviates from the commanded TCP path.",at:h,positionError:x.positionError,orientationError:x.orientationError}}c.push({time:f*o,q:d,velocity:g,acceleration:S,s:h})}for(let f=1;f<c.length;f++){let h=c[f-1],d=c[f],p=[h];for(let m of[.25,.5,.75]){let v=h.time+(d.time-h.time)*m,_=tn(h,d,v),g=gi(v/o);for(let S=0;S<_.q.length;S++)u=Math.max(u,Math.abs(_.velocity[S])/t.velocity[S],Math.sqrt(Math.abs(_.acceleration[S])/t.acceleration[S]));if(e.isStateValid&&!e.isStateValid(_.q))return{status:"collision",reason:"Rendered trajectory intersects an obstacle between timed samples.",at:g};if(i&&_.q.some((S,x)=>{let y=i.joints[i.active[x]];return y.type!=="continuous"&&(S<y.lower-1e-9||S>y.upper+1e-9)}))return{status:"joint_limit",reason:"Rendered trajectory crosses a joint limit between timed samples.",at:g};if(i&&e.cartesianPath){let S=Vt(ut(i,_.q),e.cartesianPath.at(g));if(S.positionError>(e.pathTolerance??.002)||S.orientationError>(e.orientationPathTolerance??.02))return{status:"geometry_deviation",reason:"Rendered trajectory deviates from the commanded TCP path between timed samples.",at:g,positionError:S.positionError,orientationError:S.orientationError}}p.push(_)}if(p.push(d),e.isEdgeValid){for(let m=1;m<p.length;m++)if(!e.isEdgeValid(p[m-1].q,p[m].q))return{status:"collision",reason:"Rendered trajectory crosses an obstacle between timed samples.",at:gi((h.time+(d.time-h.time)*m/4)/o)}}}if(u<=1+1e-9)return{status:"timed",duration:o,points:c,internalStops:n&&s.length>2};o*=u*1.02}return{status:"limit_violation",reason:"Could not time-scale the path within velocity and acceleration limits."}}function ge(s,t,e={}){let n=wf(s,t);if(n)return{status:"invalid_target",reason:n};if(!(e.dt==null||Number.isFinite(e.dt)&&e.dt>0))return{status:"invalid_target",reason:"Playback sample interval must be positive."};if(!(e.minimumDuration==null||Number.isFinite(e.minimumDuration)&&e.minimumDuration>0))return{status:"invalid_target",reason:"Minimum duration must be positive."};let i=Na(s,t,e,!1);if(["collision","joint_limit","geometry_deviation"].includes(i.status)&&e.allowInternalStops&&s.length>2){let r=[],o=[],a=0,l=null;for(let c=0;c<s.length-1;c++){let u=s[c],f=s[c+1],h=Na([{s:0,q:u.q},{s:1,q:f.q}],t,{...e,cartesianPath:e.cartesianPath?{at:d=>e.cartesianPath.at(u.s+(f.s-u.s)*d)}:null},!1);if(h.status!=="timed"){l=h;break}for(let d of h.points.slice(c?1:0))r.push({...d,time:d.time+a,s:u.s+(f.s-u.s)*d.s});a+=h.duration,o.push(h.duration)}l||(i={status:"timed",duration:a,points:r,internalStops:!0,segmentDurations:o})}return i}function io({type:s,model:t,start:e,goal:n,via:i,limits:r,isStateValid:o,options:a={}}){let l=ke(t,o,a.collision??{}),c,u;if(s==="PTP"){let h=n;if(!Array.isArray(n)){let d=Pn(t,n,{seed:e,isStateValid:l.isStateValid,...a.ik});if(d.status!=="reached")return{status:"ik_failed",type:s,reason:d.reason,result:d};h=d.q}u=xs(t,e,h,{...l,...a.ptp})}else if(s==="LIN"||s==="CIRC"){let h=ut(t,e);try{c=s==="LIN"?In(h,n):Ln(h,i,n)}catch(d){return{status:"invalid_target",type:s,reason:d.message}}u=ze(t,c,{start:e,...l,...a.ik,...a.cartesian})}else return{status:"invalid_target",reason:`Unknown move type ${s}.`};if(u.status!=="planned")return{...u,type:s};let f=ge(u.jointPath,r,{model:t,cartesianPath:c,...l,allowInternalStops:s==="PTP",...a.timing});for(let h=0;h<2&&f.status==="geometry_deviation"&&c;h++){let d=(a.cartesian?.translationStep??.01)/2**(h+1),p=(a.cartesian?.orientationStep??Math.PI/90)/2**(h+1);if(u=ze(t,c,{start:e,...l,...a.ik,...a.cartesian,translationStep:d,orientationStep:p}),u.status!=="planned")return{...u,type:s};f=ge(u.jointPath,r,{model:t,cartesianPath:c,...l,...a.timing})}return f.status!=="timed"?{...f,type:s}:{status:"planned",type:s,jointPath:u.jointPath,duration:f.duration,points:f.points,internalStops:f.internalStops,direct:u.direct??null,length:u.length??null}}var nt={c:null,u:[new E,new E,new E],e:[]},st={c:null,u:[new E,new E,new E],e:[]},Mt=[[],[],[]],$=[[],[],[]],yt=[],en=new E,nn=new E,sn=new E,Rt=new E,Da=new E,Fa=new E,fe=new Y,Ua=new ft,ys=new H,Oa=new H,Ba=new Ae,_i=class{constructor(t=new E,e=new E,n=new Y){this.center=t,this.halfSize=e,this.rotation=n}set(t,e,n){return this.center=t,this.halfSize=e,this.rotation=n,this}copy(t){return this.center.copy(t.center),this.halfSize.copy(t.halfSize),this.rotation.copy(t.rotation),this}clone(){return new this.constructor().copy(this)}getSize(t){return t.copy(this.halfSize).multiplyScalar(2)}clampPoint(t,e){let n=this.halfSize;Rt.subVectors(t,this.center),this.rotation.extractBasis(en,nn,sn),e.copy(this.center);let i=ui.clamp(Rt.dot(en),-n.x,n.x);e.add(en.multiplyScalar(i));let r=ui.clamp(Rt.dot(nn),-n.y,n.y);e.add(nn.multiplyScalar(r));let o=ui.clamp(Rt.dot(sn),-n.z,n.z);return e.add(sn.multiplyScalar(o)),e}containsPoint(t){return Rt.subVectors(t,this.center),this.rotation.extractBasis(en,nn,sn),Math.abs(Rt.dot(en))<=this.halfSize.x&&Math.abs(Rt.dot(nn))<=this.halfSize.y&&Math.abs(Rt.dot(sn))<=this.halfSize.z}intersectsBox3(t){return this.intersectsOBB(Tf.fromBox3(t))}intersectsSphere(t){return this.clampPoint(t.center,Fa),Fa.distanceToSquared(t.center)<=t.radius*t.radius}intersectsOBB(t,e=Number.EPSILON){nt.c=this.center,nt.e[0]=this.halfSize.x,nt.e[1]=this.halfSize.y,nt.e[2]=this.halfSize.z,this.rotation.extractBasis(nt.u[0],nt.u[1],nt.u[2]),st.c=t.center,st.e[0]=t.halfSize.x,st.e[1]=t.halfSize.y,st.e[2]=t.halfSize.z,t.rotation.extractBasis(st.u[0],st.u[1],st.u[2]);for(let r=0;r<3;r++)for(let o=0;o<3;o++)Mt[r][o]=nt.u[r].dot(st.u[o]);Rt.subVectors(st.c,nt.c),yt[0]=Rt.dot(nt.u[0]),yt[1]=Rt.dot(nt.u[1]),yt[2]=Rt.dot(nt.u[2]);for(let r=0;r<3;r++)for(let o=0;o<3;o++)$[r][o]=Math.abs(Mt[r][o])+e;let n,i;for(let r=0;r<3;r++)if(n=nt.e[r],i=st.e[0]*$[r][0]+st.e[1]*$[r][1]+st.e[2]*$[r][2],Math.abs(yt[r])>n+i)return!1;for(let r=0;r<3;r++)if(n=nt.e[0]*$[0][r]+nt.e[1]*$[1][r]+nt.e[2]*$[2][r],i=st.e[r],Math.abs(yt[0]*Mt[0][r]+yt[1]*Mt[1][r]+yt[2]*Mt[2][r])>n+i)return!1;return n=nt.e[1]*$[2][0]+nt.e[2]*$[1][0],i=st.e[1]*$[0][2]+st.e[2]*$[0][1],!(Math.abs(yt[2]*Mt[1][0]-yt[1]*Mt[2][0])>n+i||(n=nt.e[1]*$[2][1]+nt.e[2]*$[1][1],i=st.e[0]*$[0][2]+st.e[2]*$[0][0],Math.abs(yt[2]*Mt[1][1]-yt[1]*Mt[2][1])>n+i)||(n=nt.e[1]*$[2][2]+nt.e[2]*$[1][2],i=st.e[0]*$[0][1]+st.e[1]*$[0][0],Math.abs(yt[2]*Mt[1][2]-yt[1]*Mt[2][2])>n+i)||(n=nt.e[0]*$[2][0]+nt.e[2]*$[0][0],i=st.e[1]*$[1][2]+st.e[2]*$[1][1],Math.abs(yt[0]*Mt[2][0]-yt[2]*Mt[0][0])>n+i)||(n=nt.e[0]*$[2][1]+nt.e[2]*$[0][1],i=st.e[0]*$[1][2]+st.e[2]*$[1][0],Math.abs(yt[0]*Mt[2][1]-yt[2]*Mt[0][1])>n+i)||(n=nt.e[0]*$[2][2]+nt.e[2]*$[0][2],i=st.e[0]*$[1][1]+st.e[1]*$[1][0],Math.abs(yt[0]*Mt[2][2]-yt[2]*Mt[0][2])>n+i)||(n=nt.e[0]*$[1][0]+nt.e[1]*$[0][0],i=st.e[1]*$[2][2]+st.e[2]*$[2][1],Math.abs(yt[1]*Mt[0][0]-yt[0]*Mt[1][0])>n+i)||(n=nt.e[0]*$[1][1]+nt.e[1]*$[0][1],i=st.e[0]*$[2][2]+st.e[2]*$[2][0],Math.abs(yt[1]*Mt[0][1]-yt[0]*Mt[1][1])>n+i)||(n=nt.e[0]*$[1][2]+nt.e[1]*$[0][2],i=st.e[0]*$[2][1]+st.e[1]*$[2][0],Math.abs(yt[1]*Mt[0][2]-yt[0]*Mt[1][2])>n+i))}intersectsPlane(t){this.rotation.extractBasis(en,nn,sn);let e=this.halfSize.x*Math.abs(t.normal.dot(en))+this.halfSize.y*Math.abs(t.normal.dot(nn))+this.halfSize.z*Math.abs(t.normal.dot(sn)),n=t.distanceToPoint(this.center);return Math.abs(n)<=e}intersectRay(t,e){return this.getSize(Da),Ua.setFromCenterAndSize(Rt.set(0,0,0),Da),ys.setFromMatrix3(this.rotation),ys.setPosition(this.center),Oa.copy(ys).invert(),Ba.copy(t).applyMatrix4(Oa),Ba.intersectBox(Ua,e)?e.applyMatrix4(ys):null}intersectsRay(t){return this.intersectRay(t,Rt)!==null}fromBox3(t){return t.getCenter(this.center),t.getSize(this.halfSize).multiplyScalar(.5),this.rotation.identity(),this}equals(t){return t.center.equals(this.center)&&t.halfSize.equals(this.halfSize)&&t.rotation.equals(this.rotation)}applyMatrix4(t){let e=t.elements,n=Rt.set(e[0],e[1],e[2]).length(),i=Rt.set(e[4],e[5],e[6]).length(),r=Rt.set(e[8],e[9],e[10]).length();t.determinant()<0&&(n=-n),fe.setFromMatrix4(t);let a=1/n,l=1/i,c=1/r;return fe.elements[0]*=a,fe.elements[1]*=a,fe.elements[2]*=a,fe.elements[3]*=l,fe.elements[4]*=l,fe.elements[5]*=l,fe.elements[6]*=c,fe.elements[7]*=c,fe.elements[8]*=c,this.rotation.premultiply(fe),this.halfSize.x*=Math.abs(n),this.halfSize.y*=i,this.halfSize.z*=r,Rt.setFromMatrixPosition(t),this.center.add(Rt),this}},Tf=new _i;var Nn=Math.pow(2,-24),xi=Symbol("SKIP_GENERATION"),vs={strategy:0,maxDepth:40,targetLeafSize:10,useSharedArrayBuffer:!1,setBoundingBox:!0,onProgress:null,indirect:!1,verbose:!0,range:null,[xi]:!1};function gt(s,t,e){return e.min.x=t[s],e.min.y=t[s+1],e.min.z=t[s+2],e.max.x=t[s+3],e.max.y=t[s+4],e.max.z=t[s+5],e}function yi(s){let t=-1,e=-1/0;for(let n=0;n<3;n++){let i=s[n+3]-s[n];i>e&&(e=i,t=n)}return t}function so(s,t,e){for(let n=0;n<3;n++){let i=t[s+2*n],r=t[s+2*n+1],o=i-r,a=i+r;o<e[n]&&(e[n]=o),a>e[n+3]&&(e[n+3]=a)}}function Ss(s){let t=s[3]-s[0],e=s[4]-s[1],n=s[5]-s[2];return 2*(t*e+e*n+n*t)}function it(s,t){return t[s+15]===65535}function at(s,t){return t[s+6]}function dt(s,t){return t[s+14]}function rt(s){return s+8}function ot(s,t){let e=t[s+6];return s+e*8}function Dn(s,t){return t[s+7]}function Ms(s,t,e,n,i){let r=1/0,o=1/0,a=1/0,l=-1/0,c=-1/0,u=-1/0,f=1/0,h=1/0,d=1/0,p=-1/0,m=-1/0,v=-1/0,_=s.offset||0;for(let g=(t-_)*6,S=(t+e-_)*6;g<S;g+=6){let x=s[g+0],y=s[g+1],T=x-y,w=x+y;T<r&&(r=T),w>l&&(l=w),x<f&&(f=x),x>p&&(p=x);let b=s[g+2],C=s[g+3],M=b-C,R=b+C;M<o&&(o=M),R>c&&(c=R),b<h&&(h=b),b>m&&(m=b);let A=s[g+4],P=s[g+5],F=A-P,N=A+P;F<a&&(a=F),N>u&&(u=N),A<d&&(d=A),A>v&&(v=A)}n[0]=r,n[1]=o,n[2]=a,n[3]=l,n[4]=c,n[5]=u,i[0]=f,i[1]=h,i[2]=d,i[3]=p,i[4]=m,i[5]=v}var xe=8,oo=8,ro=new Int32Array(xe),_e=new Float32Array(xe*6),Fn=new Float32Array(xe*6),de=new Float32Array(6),bs=new Float32Array(6),Ve=new Int32Array(oo),ka=new Float32Array(oo*6);function Cf(s,t,e,n){for(let i=0;i<3;i++){let r=t[s+2*i],o=t[s+2*i+1],a=r-o,l=r+o;a<e[n+i]&&(e[n+i]=a),l>e[n+i+3]&&(e[n+i+3]=l)}}function Va(s,t){let e=s[t+3]-s[t],n=s[t+4]-s[t+1],i=s[t+5]-s[t+2];return 2*(e*n+n*i+i*e)}function Ga(s,t,e,n,i,r){let o=-1,a=0;if(r===0)o=yi(t),o!==-1&&(a=(t[o]+t[o+3])/2);else if(r===1)o=yi(s),o!==-1&&(a=Rf(e,n,i,o));else if(r===2){let l=Ss(s),c=1.25*i,u=e.offset||0,f=(n-u)*6,h=(n+i-u)*6;for(let d=0;d<3;d++){let p=t[d],_=(t[d+3]-p)/xe;if(i<oo){for(let g=0;g<i;g++){let S=f+g*6,x=e[S+2*d],y=g;for(;y>0&&e[Ve[y-1]+2*d]>x;)Ve[y]=Ve[y-1],y--;Ve[y]=S}for(let g=0;g<3;g++)de[g]=1/0,de[g+3]=-1/0,bs[g]=1/0,bs[g+3]=-1/0;for(let g=i-1;g>=0;g--)so(Ve[g],e,bs),ka.set(bs,g*6);for(let g=0;g<i-1;g++){so(Ve[g],e,de);let S=e[Ve[g+1]+2*d];if(e[Ve[g]+2*d]===S)continue;let x=g+1,y=i-x,T=Ss(de)/l,w=Va(ka,x*6)/l,b=1+1.25*(T*x+w*y);b<c&&(o=d,c=b,a=S)}}else{for(let x=0;x<xe;x++){ro[x]=0;for(let y=0;y<3;y++)_e[x*6+y]=1/0,_e[x*6+y+3]=-1/0}for(let x=f;x<h;x+=6){let w=~~((e[x+2*d]-p)/_);w>=xe&&(w=xe-1),ro[w]++,Cf(x,e,_e,w*6)}let g=(xe-1)*6;for(let x=0;x<6;x++)Fn[g+x]=_e[g+x];for(let x=xe-2;x>=0;x--){let y=x*6,T=y+6;for(let w=0;w<3;w++)Fn[y+w]=Math.min(_e[y+w],Fn[T+w]),Fn[y+w+3]=Math.max(_e[y+w+3],Fn[T+w+3])}let S=0;for(let x=0;x<xe-1;x++){let y=x*6,T=ro[x];if(T!==0)for(let R=0;R<3;R++)S===0?(de[R]=_e[y+R],de[R+3]=_e[y+R+3]):(de[R]=Math.min(de[R],_e[y+R]),de[R+3]=Math.max(de[R+3],_e[y+R+3]));S+=T;let w=0,b=0;S!==0&&(w=Ss(de)/l);let C=i-S;C!==0&&(b=Va(Fn,y+6)/l);let M=1+1.25*(w*S+b*C);M<c&&(o=d,c=M,a=p+_+x*_)}}}}else console.warn(`BVH: Invalid build strategy value ${r} used.`);return{axis:o,pos:a}}function Rf(s,t,e,n){let i=0,r=s.offset;for(let o=t,a=t+e;o<a;o++)i+=s[(o-r)*6+n*2];return i/e}function Ha(s,t,e,n,i,r){let o=n,a=n+i-1,l=r.pos,c=r.axis*2,u=e.offset||0;for(;;){for(;o<=a&&e[(o-u)*6+c]<l;)o++;for(;o<=a&&e[(a-u)*6+c]>=l;)a--;if(o<a){for(let f=0;f<t;f++){let h=s[o*t+f];s[o*t+f]=s[a*t+f],s[a*t+f]=h}for(let f=0;f<6;f++){let h=o-u,d=a-u,p=e[h*6+f];e[h*6+f]=e[d*6+f],e[d*6+f]=p}o++,a--}else return o}}var Pf=Math.pow(2,32),Un=new Float32Array(6),ws=new Float32Array(6);function If(s,t,e,n,i,r){let{maxDepth:o,verbose:a,targetLeafSize:l,_strictLeafSize:c=1/0,strategy:u,onProgress:f,useSharedArrayBuffer:h=!1}=i,d=s.primitiveBuffer,p=s.primitiveBufferStride,m=h?SharedArrayBuffer:ArrayBuffer,v=new m(32*Math.max(1,2*Math.ceil(n)-1)),_=new Float32Array(v),g=new Uint32Array(v),S=new Uint16Array(v),x=0,y=!1;return Ms(t,e,n,Un,ws),b(e,n,0),v.slice(0,x*32);function T(C){f&&f((C-r.offset)/r.count)}function w(C,M,R){let A=C*2;g[C+6]=M,S[A+14]=R,S[A+15]=65535,T(M+R)}function b(C,M,R){let A=x++,P=A*8;_.set(Un,P),!y&&R>=o&&(y=!0,a&&console.warn(`BVH: Max depth of ${o} reached when generating BVH. Consider increasing maxDepth.`));let F=M>c;if(M<=l&&!F||R>=o){w(P,C,M);return}let N=Ga(Un,ws,t,C,M,u),z=N.axis===-1?-1:Ha(d,p,t,C,M,N);if(N.axis===-1||z===C||z===C+M){if(!F){w(P,C,M);return}N.axis=Math.max(0,yi(Un)),z=C+Math.max(1,Math.floor(M/2))}g[P+7]=N.axis;let G=z-C;Ms(t,C,G,Un,ws),b(C,G,R+1);let I=x-A;if(I>Pf)throw new Error("MeshBVH: Cannot store relative child node offset greater than 32 bits.");g[P+6]=I;let D=M-G;Ms(t,z,D,Un,ws),b(z,D,R+1)}}function Wa(s,t){let e=s.getRootRanges(t.range),n=e[0],i=e[e.length-1],r={offset:n.offset,count:i.offset+i.count-n.offset},o=new Float32Array(6*r.count);o.offset=r.offset,s.computePrimitiveBounds(r.offset,r.count,o),s._roots=e.map(a=>If(s,o,a.offset,a.count,t,r))}var Ge=class{constructor(t){this._getNewPrimitive=t,this._primitives=[]}getPrimitive(){let t=this._primitives;return t.length===0?this._getNewPrimitive():t.pop()}releasePrimitive(t){this._primitives.push(t)}};var ao=class{constructor(){this.float32Array=null,this.uint16Array=null,this.uint32Array=null;let t=[],e=null;this.setBuffer=n=>{e&&t.push(e),e=n,this.float32Array=new Float32Array(n),this.uint16Array=new Uint16Array(n),this.uint32Array=new Uint32Array(n)},this.clearBuffer=()=>{e=null,this.float32Array=null,this.uint16Array=null,this.uint32Array=null,t.length!==0&&this.setBuffer(t.pop())}}},K=new ao;var He,Bn,On=[],Ts=new Ge(()=>new ft);function qa(s,t,e,n,i,r){He=Ts.getPrimitive(),Bn=Ts.getPrimitive(),On.push(He,Bn),K.setBuffer(s._roots[t]);let o=lo(0,s.geometry,e,n,i,r);K.clearBuffer(),Ts.releasePrimitive(He),Ts.releasePrimitive(Bn),On.pop(),On.pop();let a=On.length;return a>0&&(Bn=On[a-1],He=On[a-2]),o}function lo(s,t,e,n,i=null,r=0,o=0){let{float32Array:a,uint16Array:l,uint32Array:c}=K,u=s*2;if(it(u,l)){let h=at(s,c),d=dt(u,l);return gt(s,a,He),n(h,d,!1,o,r+s/8,He)}else{let M=function(A){let{uint16Array:P,uint32Array:F}=K,N=A*2;for(;!it(N,P);)A=rt(A),N=A*2;return at(A,F)},R=function(A){let{uint16Array:P,uint32Array:F}=K,N=A*2;for(;!it(N,P);)A=ot(A,F),N=A*2;return at(A,F)+dt(N,P)},h=rt(s),d=ot(s,c),p=h,m=d,v,_,g,S;if(i&&(g=He,S=Bn,gt(p,a,g),gt(m,a,S),v=i(g),_=i(S),_<v)){p=d,m=h;let A=v;v=_,_=A,g=S}g||(g=He,gt(p,a,g));let x=it(p*2,l),y=e(g,x,v,o+1,r+p/8),T;if(y===2){let A=M(p),F=R(p)-A;T=n(A,F,!0,o+1,r+p/8,g)}else T=y&&lo(p,t,e,n,i,r,o+1);if(T)return!0;S=Bn,gt(m,a,S);let w=it(m*2,l),b=e(S,w,_,o+1,r+m/8),C;if(b===2){let A=M(m),F=R(m)-A;C=n(A,F,!0,o+1,r+m/8,S)}else C=b&&lo(m,t,e,n,i,r,o+1);return!!C}}var vi=new K.constructor,Es=new K.constructor,We=new Ge(()=>new ft),zn=new ft,kn=new ft,uo=new ft,ho=new ft,fo=!1;function Xa(s,t,e,n){if(fo)throw new Error("MeshBVH: Recursive calls to bvhcast not supported.");fo=!0;let i=s._roots,r=t._roots,o,a=0,l=0,c=new H().copy(e).invert();for(let u=0,f=i.length;u<f;u++){vi.setBuffer(i[u]),l=0;let h=We.getPrimitive();gt(0,vi.float32Array,h),h.applyMatrix4(c);for(let d=0,p=r.length;d<p&&(Es.setBuffer(r[d]),o=pe(0,0,e,c,n,a,l,0,0,h),Es.clearBuffer(),l+=r[d].byteLength/32,!o);d++);if(We.releasePrimitive(h),vi.clearBuffer(),a+=i[u].byteLength/32,o)break}return fo=!1,o}function pe(s,t,e,n,i,r=0,o=0,a=0,l=0,c=null,u=!1){let f,h;u?(f=Es,h=vi):(f=vi,h=Es);let d=f.float32Array,p=f.uint32Array,m=f.uint16Array,v=h.float32Array,_=h.uint32Array,g=h.uint16Array,S=s*2,x=t*2,y=it(S,m),T=it(x,g),w=!1;if(T&&y)u?w=i(at(t,_),dt(t*2,g),at(s,p),dt(s*2,m),l,o+t/8,a,r+s/8):w=i(at(s,p),dt(s*2,m),at(t,_),dt(t*2,g),a,r+s/8,l,o+t/8);else if(T){let b=We.getPrimitive();gt(t,v,b),b.applyMatrix4(e);let C=rt(s),M=ot(s,p);gt(C,d,zn),gt(M,d,kn);let R=b.intersectsBox(zn),A=b.intersectsBox(kn);w=R&&pe(t,C,n,e,i,o,r,l,a+1,b,!u)||A&&pe(t,M,n,e,i,o,r,l,a+1,b,!u),We.releasePrimitive(b)}else{let b=rt(t),C=ot(t,_);gt(b,v,uo),gt(C,v,ho);let M=c.intersectsBox(uo),R=c.intersectsBox(ho);if(M&&R)w=pe(s,b,e,n,i,r,o,a,l+1,c,u)||pe(s,C,e,n,i,r,o,a,l+1,c,u);else if(M)if(y)w=pe(s,b,e,n,i,r,o,a,l+1,c,u);else{let A=We.getPrimitive();A.copy(uo).applyMatrix4(e);let P=rt(s),F=ot(s,p);gt(P,d,zn),gt(F,d,kn);let N=A.intersectsBox(zn),z=A.intersectsBox(kn);w=N&&pe(b,P,n,e,i,o,r,l,a+1,A,!u)||z&&pe(b,F,n,e,i,o,r,l,a+1,A,!u),We.releasePrimitive(A)}else if(R)if(y)w=pe(s,C,e,n,i,r,o,a,l+1,c,u);else{let A=We.getPrimitive();A.copy(ho).applyMatrix4(e);let P=rt(s),F=ot(s,p);gt(P,d,zn),gt(F,d,kn);let N=A.intersectsBox(zn),z=A.intersectsBox(kn);w=N&&pe(C,P,n,e,i,o,r,l,a+1,A,!u)||z&&pe(C,F,n,e,i,o,r,l,a+1,A,!u),We.releasePrimitive(A)}}return w}var As=new class{constructor(){let s=null,t=null,e=null,n=!1;this.root=null,this.buffer=null,this.uint32Array=null,this.uint16Array=null,this.setBVH=(r,o)=>{if(n)throw new Error("BVHTraversalHelper: cannot call setBVH during an active traversal.");this.root=o,this.buffer=s=r._roots[o],this.uint16Array=e=new Uint16Array(s),this.uint32Array=t=new Uint32Array(s)},this.reset=()=>{this.root=null,this.buffer=s=null,this.uint16Array=e=null,this.uint32Array=t=null},this.getRangeStart=r=>{let o=r*2;for(;!it(o,e);)r=rt(r),o=r*2;return at(r,t)},this.getRangeEnd=r=>{let o=r*2;for(;!it(o,e);)r=ot(r,t),o=r*2;return at(r,t)+dt(o,e)};let i=(r,o,a)=>{let l=o*2,c=it(l,e);if(!r(a,c,o)&&!c){let f=rt(o),h=ot(o,t);i(r,f,a+1),i(r,h,a+1)}};this.traverseBuffer=r=>{if(n)throw new Error("BVHTraversalHelper: cannot start a traversal during an active traversal.");n=!0;try{i(r,0,0)}finally{n=!1}},this.traverse=r=>{this.traverseBuffer((o,a,l)=>{if(a){let c=l*2,u=t[l+6],f=e[c+14];return r(o,a,new Float32Array(s,l*4,6),u,f)}else{let c=Dn(l,t);return r(o,a,new Float32Array(s,l*4,6),c)}})}}};var Ya=new ft,Vn=new Float32Array(6),Cs=class{constructor(){this._roots=null,this.primitiveBuffer=null,this.primitiveBufferStride=null}init(t){t={...vs,...t},"maxLeafSize"in t&&(console.warn('BVH: "maxLeafSize" option has been deprecated. Use "targetLeafSize", instead.'),t={...t,targetLeafSize:t.maxLeafSize}),Wa(this,t)}getRootRanges(){throw new Error("BVH: getRootRanges() not implemented")}writePrimitiveBounds(){throw new Error("BVH: writePrimitiveBounds() not implemented")}writePrimitiveRangeBounds(t,e,n,i){let r=1/0,o=1/0,a=1/0,l=-1/0,c=-1/0,u=-1/0;for(let f=t,h=t+e;f<h;f++){this.writePrimitiveBounds(f,Vn,0);let[d,p,m,v,_,g]=Vn;d<r&&(r=d),v>l&&(l=v),p<o&&(o=p),_>c&&(c=_),m<a&&(a=m),g>u&&(u=g)}return n[i+0]=r,n[i+1]=o,n[i+2]=a,n[i+3]=l,n[i+4]=c,n[i+5]=u,n}computePrimitiveBounds(t,e,n){let i=n.offset||0;for(let r=t,o=t+e;r<o;r++){this.writePrimitiveBounds(r,Vn,0);let[a,l,c,u,f,h]=Vn,d=(a+u)/2,p=(l+f)/2,m=(c+h)/2,v=(u-a)/2,_=(f-l)/2,g=(h-c)/2,S=(r-i)*6;n[S+0]=d,n[S+1]=v+(Math.abs(d)+v)*Nn,n[S+2]=p,n[S+3]=_+(Math.abs(p)+_)*Nn,n[S+4]=m,n[S+5]=g+(Math.abs(m)+g)*Nn}return n}shiftPrimitiveOffsets(t){let e=this._indirectBuffer;if(e)for(let n=0,i=e.length;n<i;n++)e[n]+=t;else{let n=this._roots;for(let i=0;i<n.length;i++){let r=n[i],o=new Uint32Array(r),a=new Uint16Array(r),l=r.byteLength/32;for(let c=0;c<l;c++){let u=8*c,f=2*u;it(f,a)&&(o[u+6]+=t)}}}}traverse(t,e=0){As.setBVH(this,e),As.traverse(t),As.reset()}refit(){let t=this._roots;for(let e=0,n=t.length;e<n;e++){let i=t[e],r=new Uint32Array(i),o=new Uint16Array(i),a=new Float32Array(i),l=i.byteLength/32;for(let c=l-1;c>=0;c--){let u=c*8,f=u*2;if(it(f,o)){let d=at(u,r),p=dt(f,o);this.writePrimitiveRangeBounds(d,p,Vn,0),a.set(Vn,u)}else{let d=rt(u),p=ot(u,r);for(let m=0;m<3;m++){let v=a[d+m],_=a[d+m+3],g=a[p+m],S=a[p+m+3];a[u+m]=v<g?v:g,a[u+m+3]=_>S?_:S}}}}}getBoundingBox(t){return t.makeEmpty(),this._roots.forEach(n=>{gt(0,new Float32Array(n),Ya),t.union(Ya)}),t}shapecast(t){let{boundsTraverseOrder:e,intersectsBounds:n,intersectsRange:i,intersectsPrimitive:r,scratchPrimitive:o,iterate:a}=t;if(i&&r){let f=i;i=(h,d,p,m,v)=>f(h,d,p,m,v)?!0:a(h,d,this,r,p,m,o)}else i||(r?i=(f,h,d,p)=>a(f,h,this,r,d,p,o):i=(f,h,d)=>d);let l=!1,c=0,u=this._roots;for(let f=0,h=u.length;f<h;f++){let d=u[f];if(l=qa(this,f,n,i,e,c),l)break;c+=d.byteLength/32}return l}bvhcast(t,e,n){let{intersectsRanges:i}=n;return Xa(this,t,e,i)}};function $a(){return typeof SharedArrayBuffer<"u"}function po(s){return s.index?s.index.count:s.attributes.position.count}function qe(s){return po(s)/3}function Nf(s,t=ArrayBuffer){return s>65535?new Uint32Array(new t(4*s)):new Uint16Array(new t(2*s))}function Za(s,t){if(!s.index){let e=s.attributes.position.count,n=t.useSharedArrayBuffer?SharedArrayBuffer:ArrayBuffer,i=Nf(e,n);s.setIndex(new Yt(i,1));for(let r=0;r<e;r++)i[r]=r}}function Df(s,t,e){let n=po(s)/e,i=t||s.drawRange,r=i.start/e,o=(i.start+i.count)/e,a=Math.max(0,r),l=Math.min(n,o)-a;return{offset:Math.floor(a),count:Math.floor(l)}}function Ff(s,t){return s.groups.map(e=>({offset:e.start/t,count:e.count/t}))}function mo(s,t,e){let n=Df(s,t,e),i=Ff(s,e);if(!i.length)return[n];let r=[],o=n.offset,a=n.offset+n.count,l=po(s)/e,c=[];for(let h of i){let{offset:d,count:p}=h,m=d,v=isFinite(p)?p:l-d,_=d+v;m<a&&_>o&&(c.push({pos:Math.max(o,m),isStart:!0}),c.push({pos:Math.min(a,_),isStart:!1}))}c.sort((h,d)=>h.pos!==d.pos?h.pos-d.pos:h.type==="end"?-1:1);let u=0,f=null;for(let h of c){let d=h.pos;u!==0&&d!==f&&r.push({offset:f,count:d-f}),u+=h.isStart?1:-1,f=d}return r}function Uf(s,t){let e=s[s.length-1],n=e.offset+e.count>2**16,i=s.reduce((c,u)=>c+u.count,0),r=n?4:2,o=t?new SharedArrayBuffer(i*r):new ArrayBuffer(i*r),a=n?new Uint32Array(o):new Uint16Array(o),l=0;for(let c=0;c<s.length;c++){let{offset:u,count:f}=s[c];for(let h=0;h<f;h++)a[l+h]=u+h;l+=f}return a}var Rs=class extends Cs{get indirect(){return!!this._indirectBuffer}get primitiveStride(){return null}get primitiveBufferStride(){return this.indirect?1:this.primitiveStride}set primitiveBufferStride(t){}get primitiveBuffer(){return this.indirect?this._indirectBuffer:this.geometry.index.array}set primitiveBuffer(t){}constructor(t,e={}){if(t.isBufferGeometry){if(t.index&&t.index.isInterleavedBufferAttribute)throw new Error("BVH: InterleavedBufferAttribute is not supported for the index attribute.")}else throw new Error("BVH: Only BufferGeometries are supported.");if(e.useSharedArrayBuffer&&!$a())throw new Error("BVH: SharedArrayBuffer is not available.");super(),this.geometry=t,this.resolvePrimitiveIndex=e.indirect?n=>this._indirectBuffer[n]:n=>n,this.primitiveBuffer=null,this.primitiveBufferStride=null,this._indirectBuffer=null,e={...vs,...e},e[xi]||this.init(e)}init(t){let{geometry:e,primitiveStride:n}=this;if(t.indirect){let i=mo(e,t.range,n),r=Uf(i,t.useSharedArrayBuffer);this._indirectBuffer=r}else Za(e,t);super.init(t),!e.boundingBox&&t.setBoundingBox&&(e.boundingBox=this.getBoundingBox(new ft))}getRootRanges(t){return this.indirect?[{offset:0,count:this._indirectBuffer.length}]:mo(this.geometry,t,this.primitiveStride)}raycastObject3D(){throw new Error("BVH: raycastObject3D() not implemented")}};var Jt=class{constructor(){this.min=1/0,this.max=-1/0}setFromPointsField(t,e){let n=1/0,i=-1/0;for(let r=0,o=t.length;r<o;r++){let l=t[r][e];n=l<n?l:n,i=l>i?l:i}this.min=n,this.max=i}setFromPoints(t,e){let n=1/0,i=-1/0;for(let r=0,o=e.length;r<o;r++){let a=e[r],l=t.dot(a);n=l<n?l:n,i=l>i?l:i}this.min=n,this.max=i}isSeparated(t){return this.min>t.max||t.min>this.max}};Jt.prototype.setFromBox=(function(){let s=new E;return function(e,n){let i=n.min,r=n.max,o=1/0,a=-1/0;for(let l=0;l<=1;l++)for(let c=0;c<=1;c++)for(let u=0;u<=1;u++){s.x=i.x*l+r.x*(1-l),s.y=i.y*c+r.y*(1-c),s.z=i.z*u+r.z*(1-u);let f=e.dot(s);o=Math.min(f,o),a=Math.max(f,a)}this.min=o,this.max=a}})();var Of=(function(){let s=new E,t=new E,e=new E;return function(i,r,o){let a=i.start,l=s,c=r.start,u=t;e.subVectors(a,c),s.subVectors(i.end,i.start),t.subVectors(r.end,r.start);let f=e.dot(u),h=u.dot(l),d=u.dot(u),p=e.dot(l),v=l.dot(l)*d-h*h,_,g;v!==0?_=(f*h-p*d)/v:_=0,g=(f+_*h)/d,o.x=_,o.y=g}})(),Si=(function(){let s=new mt,t=new E,e=new E;return function(i,r,o,a){Of(i,r,s);let l=s.x,c=s.y;if(l>=0&&l<=1&&c>=0&&c<=1){i.at(l,o),r.at(c,a);return}else if(l>=0&&l<=1){c<0?r.at(0,a):r.at(1,a),i.closestPointToPoint(a,!0,o);return}else if(c>=0&&c<=1){l<0?i.at(0,o):i.at(1,o),r.closestPointToPoint(o,!0,a);return}else{let u;l<0?u=i.start:u=i.end;let f;c<0?f=r.start:f=r.end;let h=t,d=e;if(i.closestPointToPoint(f,!0,t),r.closestPointToPoint(u,!0,e),h.distanceToSquared(f)<=d.distanceToSquared(u)){o.copy(h),a.copy(f);return}else{o.copy(u),a.copy(d);return}}}})(),Ja=(function(){let s=new E,t=new E,e=new je,n=new zt;return function(r,o){let{radius:a,center:l}=r,{a:c,b:u,c:f}=o;if(n.start=c,n.end=u,n.closestPointToPoint(l,!0,s).distanceTo(l)<=a||(n.start=c,n.end=f,n.closestPointToPoint(l,!0,s).distanceTo(l)<=a)||(n.start=u,n.end=f,n.closestPointToPoint(l,!0,s).distanceTo(l)<=a))return!0;let m=o.getPlane(e);if(Math.abs(m.distanceToPoint(l))<=a){let _=m.projectPoint(l,t);if(o.containsPoint(_))return!0}return!1}})();var Bf=["x","y","z"],Ce=1e-15,Ka=Ce*Ce;function ie(s){return Math.abs(s)<Ce}var Dt=class extends he{constructor(...t){super(...t),this.isExtendedTriangle=!0,this.satAxes=new Array(4).fill().map(()=>new E),this.satBounds=new Array(4).fill().map(()=>new Jt),this.points=[this.a,this.b,this.c],this.plane=new je,this.isDegenerateIntoSegment=!1,this.isDegenerateIntoPoint=!1,this.degenerateSegment=new zt,this.needsUpdate=!0}intersectsSphere(t){return Ja(t,this)}update(){let t=this.a,e=this.b,n=this.c,i=this.points,r=this.satAxes,o=this.satBounds,a=r[0],l=o[0];this.getNormal(a),l.setFromPoints(a,i);let c=r[1],u=o[1];c.subVectors(t,e),u.setFromPoints(c,i);let f=r[2],h=o[2];f.subVectors(e,n),h.setFromPoints(f,i);let d=r[3],p=o[3];d.subVectors(n,t),p.setFromPoints(d,i);let m=c.length(),v=f.length(),_=d.length();this.isDegenerateIntoPoint=!1,this.isDegenerateIntoSegment=!1,m<Ce?v<Ce||_<Ce?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(t),this.degenerateSegment.end.copy(n)):v<Ce?_<Ce?this.isDegenerateIntoPoint=!0:(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(e),this.degenerateSegment.end.copy(t)):_<Ce&&(this.isDegenerateIntoSegment=!0,this.degenerateSegment.start.copy(n),this.degenerateSegment.end.copy(e)),this.plane.setFromNormalAndCoplanarPoint(a,t),this.needsUpdate=!1}};Dt.prototype.closestPointToSegment=(function(){let s=new E,t=new E,e=new zt;return function(i,r=null,o=null){this.needsUpdate&&this.update();let{start:a,end:l}=i,c=this.points,u,f=1/0,h=this.plane.distanceToPoint(a),d=this.plane.distanceToPoint(l);if(h*d<0&&this.plane.intersectLine(i,s)!==null&&this.containsPoint(s))return r&&r.copy(s),o&&o.copy(s),0;for(let p=0;p<3;p++){let m=(p+1)%3;e.start.copy(c[p]),e.end.copy(c[m]),Si(e,i,s,t),u=s.distanceToSquared(t),u<f&&(f=u,r&&r.copy(s),o&&o.copy(t))}return this.closestPointToPoint(a,s),u=a.distanceToSquared(s),u<f&&(f=u,r&&r.copy(s),o&&o.copy(a)),this.closestPointToPoint(l,s),u=l.distanceToSquared(s),u<f&&(f=u,r&&r.copy(s),o&&o.copy(l)),Math.sqrt(f)}})();Dt.prototype.intersectsTriangle=(function(){let s=new Dt,t=new Jt,e=new Jt,n=new E,i=new E,r=new E,o=new E,a=new zt,l=new zt,c=new E,u=new mt,f=new mt;function h(S,x,y,T){let w=n;!S.isDegenerateIntoPoint&&!S.isDegenerateIntoSegment?w.copy(S.plane.normal):w.copy(x.plane.normal);let b=S.satBounds,C=S.satAxes;for(let A=1;A<4;A++){let P=b[A],F=C[A];if(t.setFromPoints(F,x.points),P.isSeparated(t)||(o.copy(w).cross(F),t.setFromPoints(o,S.points),e.setFromPoints(o,x.points),t.isSeparated(e)))return!1}let M=x.satBounds,R=x.satAxes;for(let A=1;A<4;A++){let P=M[A],F=R[A];if(t.setFromPoints(F,S.points),P.isSeparated(t)||(o.crossVectors(w,F),t.setFromPoints(o,S.points),e.setFromPoints(o,x.points),t.isSeparated(e)))return!1}return y&&(T||console.warn("ExtendedTriangle.intersectsTriangle: Triangles are coplanar which does not support an output edge. Setting edge to 0, 0, 0."),y.start.set(0,0,0),y.end.set(0,0,0)),!0}function d(S,x,y,T,w,b,C,M,R,A,P){let F=C/(C-M);A.x=T+(w-T)*F,P.start.subVectors(x,S).multiplyScalar(F).add(S),F=C/(C-R),A.y=T+(b-T)*F,P.end.subVectors(y,S).multiplyScalar(F).add(S)}function p(S,x,y,T,w,b,C,M,R,A,P){if(w>0)d(S.c,S.a,S.b,T,x,y,R,C,M,A,P);else if(b>0)d(S.b,S.a,S.c,y,x,T,M,C,R,A,P);else if(M*R>0||C!=0)d(S.a,S.b,S.c,x,y,T,C,M,R,A,P);else if(M!=0)d(S.b,S.a,S.c,y,x,T,M,C,R,A,P);else if(R!=0)d(S.c,S.a,S.b,T,x,y,R,C,M,A,P);else return!0;return!1}function m(S,x,y,T){let w=x.degenerateSegment,b=S.plane.distanceToPoint(w.start),C=S.plane.distanceToPoint(w.end);return ie(b)?ie(C)?h(S,x,y,T):(y&&(y.start.copy(w.start),y.end.copy(w.start)),S.containsPoint(w.start)):ie(C)?(y&&(y.start.copy(w.end),y.end.copy(w.end)),S.containsPoint(w.end)):S.plane.intersectLine(w,n)!=null?(y&&(y.start.copy(n),y.end.copy(n)),S.containsPoint(n)):!1}function v(S,x,y){let T=x.a;return ie(S.plane.distanceToPoint(T))&&S.containsPoint(T)?(y&&(y.start.copy(T),y.end.copy(T)),!0):!1}function _(S,x,y){let T=S.degenerateSegment,w=x.a;return T.closestPointToPoint(w,!0,n),w.distanceToSquared(n)<Ka?(y&&(y.start.copy(w),y.end.copy(w)),!0):!1}function g(S,x,y,T){if(S.isDegenerateIntoSegment)if(x.isDegenerateIntoSegment){let w=S.degenerateSegment,b=x.degenerateSegment,C=i,M=r;w.delta(C),b.delta(M);let R=n.subVectors(b.start,w.start),A=C.x*M.y-C.y*M.x;if(ie(A))return!1;let P=(R.x*M.y-R.y*M.x)/A,F=-(C.x*R.y-C.y*R.x)/A;if(P<0||P>1||F<0||F>1)return!1;let N=w.start.z+C.z*P,z=b.start.z+M.z*F;return ie(N-z)?(y&&(y.start.copy(w.start).addScaledVector(C,P),y.end.copy(w.start).addScaledVector(C,P)),!0):!1}else return x.isDegenerateIntoPoint?_(S,x,y):m(x,S,y,T);else{if(S.isDegenerateIntoPoint)return x.isDegenerateIntoPoint?x.a.distanceToSquared(S.a)<Ka?(y&&(y.start.copy(S.a),y.end.copy(S.a)),!0):!1:x.isDegenerateIntoSegment?_(x,S,y):v(x,S,y);if(x.isDegenerateIntoPoint)return v(S,x,y);if(x.isDegenerateIntoSegment)return m(S,x,y,T)}}return function(x,y=null,T=!1){this.needsUpdate&&this.update(),x.isExtendedTriangle?x.needsUpdate&&x.update():(s.copy(x),s.update(),x=s);let w=g(this,x,y,T);if(w!==void 0)return w;let b=this.plane,C=x.plane,M=C.distanceToPoint(this.a),R=C.distanceToPoint(this.b),A=C.distanceToPoint(this.c);ie(M)&&(M=0),ie(R)&&(R=0),ie(A)&&(A=0);let P=M*R,F=M*A;if(P>0&&F>0)return!1;let N=b.distanceToPoint(x.a),z=b.distanceToPoint(x.b),G=b.distanceToPoint(x.c);ie(N)&&(N=0),ie(z)&&(z=0),ie(G)&&(G=0);let I=N*z,D=N*G;if(I>0&&D>0)return!1;i.copy(b.normal),r.copy(C.normal);let B=i.cross(r),O=0,U=Math.abs(B.x),L=Math.abs(B.y);L>U&&(U=L,O=1),Math.abs(B.z)>U&&(O=2);let tt=Bf[O],lt=this.a[tt],et=this.b[tt],pt=this.c[tt],jt=x.a[tt],oe=x.b[tt],Bt=x.c[tt];if(p(this,lt,et,pt,P,F,M,R,A,u,a))return h(this,x,y,T);if(p(x,jt,oe,Bt,I,D,N,z,G,f,l))return h(this,x,y,T);if(u.y<u.x){let Wt=u.y;u.y=u.x,u.x=Wt,c.copy(a.start),a.start.copy(a.end),a.end.copy(c)}if(f.y<f.x){let Wt=f.y;f.y=f.x,f.x=Wt,c.copy(l.start),l.start.copy(l.end),l.end.copy(c)}return u.y<f.x||f.y<u.x?!1:(y&&(f.x>u.x?y.start.copy(l.start):y.start.copy(a.start),f.y<u.y?y.end.copy(l.end):y.end.copy(a.end)),!0)}})();Dt.prototype.distanceToPoint=(function(){let s=new E;return function(e){return this.closestPointToPoint(e,s),e.distanceTo(s)}})();Dt.prototype.distanceToTriangle=(function(){let s=new E,t=new E,e=["a","b","c"],n=new zt,i=new zt;return function(o,a=null,l=null){let c=a||l?n:null;if(this.intersectsTriangle(o,c,!0))return(a||l)&&(a&&c.getCenter(a),l&&c.getCenter(l)),0;let u=1/0;for(let f=0;f<3;f++){let h,d=e[f],p=o[d];this.closestPointToPoint(p,s),h=p.distanceToSquared(s),h<u&&(u=h,a&&a.copy(s),l&&l.copy(p));let m=this[d];o.closestPointToPoint(m,s),h=m.distanceToSquared(s),h<u&&(u=h,a&&a.copy(m),l&&l.copy(s))}for(let f=0;f<3;f++){let h=e[f],d=e[(f+1)%3];n.set(this[h],this[d]);for(let p=0;p<3;p++){let m=e[p],v=e[(p+1)%3];i.set(o[m],o[v]),Si(n,i,s,t);let _=s.distanceToSquared(t);_<u&&(u=_,a&&a.copy(s),l&&l.copy(t))}}return Math.sqrt(u)}})();var bt=class{constructor(t,e,n){this.isOrientedBox=!0,this.min=new E,this.max=new E,this.matrix=new H,this.invMatrix=new H,this.points=new Array(8).fill().map(()=>new E),this.satAxes=new Array(3).fill().map(()=>new E),this.satBounds=new Array(3).fill().map(()=>new Jt),this.alignedSatBounds=new Array(3).fill().map(()=>new Jt),this.needsUpdate=!1,t&&this.min.copy(t),e&&this.max.copy(e),n&&this.matrix.copy(n)}set(t,e,n){this.min.copy(t),this.max.copy(e),this.matrix.copy(n),this.needsUpdate=!0}copy(t){this.min.copy(t.min),this.max.copy(t.max),this.matrix.copy(t.matrix),this.needsUpdate=!0}};bt.prototype.update=(function(){return function(){let t=this.matrix,e=this.min,n=this.max,i=this.points;for(let c=0;c<=1;c++)for(let u=0;u<=1;u++)for(let f=0;f<=1;f++){let h=1*c|2*u|4*f,d=i[h];d.x=c?n.x:e.x,d.y=u?n.y:e.y,d.z=f?n.z:e.z,d.applyMatrix4(t)}let r=this.satBounds,o=this.satAxes,a=i[0];for(let c=0;c<3;c++){let u=o[c],f=r[c],h=1<<c,d=i[h];u.subVectors(a,d),f.setFromPoints(u,i)}let l=this.alignedSatBounds;l[0].setFromPointsField(i,"x"),l[1].setFromPointsField(i,"y"),l[2].setFromPointsField(i,"z"),this.invMatrix.copy(this.matrix).invert(),this.needsUpdate=!1}})();bt.prototype.intersectsBox=(function(){let s=new Jt;return function(e){this.needsUpdate&&this.update();let n=e.min,i=e.max,r=this.satBounds,o=this.satAxes,a=this.alignedSatBounds;if(s.min=n.x,s.max=i.x,a[0].isSeparated(s)||(s.min=n.y,s.max=i.y,a[1].isSeparated(s))||(s.min=n.z,s.max=i.z,a[2].isSeparated(s)))return!1;for(let l=0;l<3;l++){let c=o[l],u=r[l];if(s.setFromBox(c,e),u.isSeparated(s))return!1}return!0}})();bt.prototype.intersectsTriangle=(function(){let s=new Dt,t=new Array(3),e=new Jt,n=new Jt,i=new E;return function(o){this.needsUpdate&&this.update(),o.isExtendedTriangle?o.needsUpdate&&o.update():(s.copy(o),s.update(),o=s);let a=this.satBounds,l=this.satAxes;t[0]=o.a,t[1]=o.b,t[2]=o.c;for(let h=0;h<3;h++){let d=a[h],p=l[h];if(e.setFromPoints(p,t),d.isSeparated(e))return!1}let c=o.satBounds,u=o.satAxes,f=this.points;for(let h=0;h<3;h++){let d=c[h],p=u[h];if(e.setFromPoints(p,f),d.isSeparated(e))return!1}for(let h=0;h<3;h++){let d=l[h];for(let p=0;p<4;p++){let m=u[p];if(i.crossVectors(d,m),e.setFromPoints(i,t),n.setFromPoints(i,f),e.isSeparated(n))return!1}}return!0}})();bt.prototype.closestPointToPoint=(function(){return function(t,e){return this.needsUpdate&&this.update(),e.copy(t).applyMatrix4(this.invMatrix).clamp(this.min,this.max).applyMatrix4(this.matrix),e}})();bt.prototype.distanceToPoint=(function(){let s=new E;return function(e){return this.closestPointToPoint(e,s),e.distanceTo(s)}})();bt.prototype.distanceToBox=(function(){let s=["x","y","z"],t=new Array(12).fill().map(()=>new zt),e=new Array(12).fill().map(()=>new zt),n=new E,i=new E;return function(o,a=0,l=null,c=null){if(this.needsUpdate&&this.update(),this.intersectsBox(o))return(l||c)&&(o.getCenter(i),this.closestPointToPoint(i,n),o.closestPointToPoint(n,i),l&&l.copy(n),c&&c.copy(i)),0;let u=a*a,f=o.min,h=o.max,d=this.points,p=1/0;for(let v=0;v<8;v++){let _=d[v];i.copy(_).clamp(f,h);let g=_.distanceToSquared(i);if(g<p&&(p=g,l&&l.copy(_),c&&c.copy(i),g<u))return Math.sqrt(g)}let m=0;for(let v=0;v<3;v++)for(let _=0;_<=1;_++)for(let g=0;g<=1;g++){let S=(v+1)%3,x=(v+2)%3,y=_<<S|g<<x,T=1<<v|_<<S|g<<x,w=d[y],b=d[T];t[m].set(w,b);let M=s[v],R=s[S],A=s[x],P=e[m],F=P.start,N=P.end;F[M]=f[M],F[R]=_?f[R]:h[R],F[A]=g?f[A]:h[A],N[M]=h[M],N[R]=_?f[R]:h[R],N[A]=g?f[A]:h[A],m++}for(let v=0;v<=1;v++)for(let _=0;_<=1;_++)for(let g=0;g<=1;g++){i.x=v?h.x:f.x,i.y=_?h.y:f.y,i.z=g?h.z:f.z,this.closestPointToPoint(i,n);let S=i.distanceToSquared(n);if(S<p&&(p=S,l&&l.copy(n),c&&c.copy(i),S<u))return Math.sqrt(S)}for(let v=0;v<12;v++){let _=t[v];for(let g=0;g<12;g++){let S=e[g];Si(_,S,n,i);let x=n.distanceToSquared(i);if(x<p&&(p=x,l&&l.copy(n),c&&c.copy(i),x<u))return Math.sqrt(x)}}return Math.sqrt(p)}})();var go=class extends Ge{constructor(){super(()=>new Dt)}},Gt=new go;var Mi=new E,_o=new E;function ja(s,t,e={},n=0,i=1/0){let r=n*n,o=i*i,a=1/0,l=null;if(s.shapecast({boundsTraverseOrder:u=>(Mi.copy(t).clamp(u.min,u.max),Mi.distanceToSquared(t)),intersectsBounds:(u,f,h)=>h<a&&h<o,intersectsTriangle:(u,f)=>{u.closestPointToPoint(t,Mi);let h=t.distanceToSquared(Mi);return h<a&&(_o.copy(Mi),a=h,l=f),h<r}}),a===1/0)return null;let c=Math.sqrt(a);return e.point?e.point.copy(_o):e.point=_o.clone(),e.distance=c,e.faceIndex=l,e}var Ps=parseInt("187")>=169,zf=parseInt("187")<=161,rn=new E,on=new E,an=new E,Is=new mt,Ls=new mt,Ns=new mt,Qa=new E,tl=new E,el=new E,bi=new E;function kf(s,t,e,n,i,r,o,a){let l;if(r===Fr?l=s.intersectTriangle(n,e,t,!0,i):l=s.intersectTriangle(t,e,n,r!==li,i),l===null)return null;let c=s.origin.distanceTo(i);return c<o||c>a?null:{distance:c,point:i.clone()}}function nl(s,t,e,n,i,r,o,a,l,c,u){rn.fromBufferAttribute(t,r),on.fromBufferAttribute(t,o),an.fromBufferAttribute(t,a);let f=kf(s,rn,on,an,bi,l,c,u);if(f){if(n){Is.fromBufferAttribute(n,r),Ls.fromBufferAttribute(n,o),Ns.fromBufferAttribute(n,a),f.uv=new mt;let d=he.getInterpolation(bi,rn,on,an,Is,Ls,Ns,f.uv);Ps||(f.uv=d)}if(i){Is.fromBufferAttribute(i,r),Ls.fromBufferAttribute(i,o),Ns.fromBufferAttribute(i,a),f.uv1=new mt;let d=he.getInterpolation(bi,rn,on,an,Is,Ls,Ns,f.uv1);Ps||(f.uv1=d),zf&&(f.uv2=f.uv1)}if(e){Qa.fromBufferAttribute(e,r),tl.fromBufferAttribute(e,o),el.fromBufferAttribute(e,a),f.normal=new E;let d=he.getInterpolation(bi,rn,on,an,Qa,tl,el,f.normal);f.normal.dot(s.direction)>0&&f.normal.multiplyScalar(-1),Ps||(f.normal=d)}let h={a:r,b:o,c:a,normal:new E,materialIndex:0};if(he.getNormal(rn,on,an,h.normal),f.face=h,f.faceIndex=r,Ps){let d=new E;he.getBarycoord(bi,rn,on,an,d),f.barycoord=d}}return f}function il(s){return s&&s.isMaterial?s.side:s}function Gn(s,t,e,n,i,r,o){let a=n*3,l=a+0,c=a+1,u=a+2,{index:f,groups:h}=s;s.index&&(l=f.getX(l),c=f.getX(c),u=f.getX(u));let{position:d,normal:p,uv:m,uv1:v}=s.attributes;if(Array.isArray(t)){let _=n*3;for(let g=0,S=h.length;g<S;g++){let{start:x,count:y,materialIndex:T}=h[g];if(_>=x&&_<x+y){let w=il(t[T]),b=nl(e,d,p,m,v,l,c,u,w,r,o);if(b)if(b.faceIndex=n,b.face.materialIndex=T,i)i.push(b);else return b}}}else{let _=il(t),g=nl(e,d,p,m,v,l,c,u,_,r,o);if(g)if(g.faceIndex=n,g.face.materialIndex=0,i)i.push(g);else return g}return null}function _t(s,t,e,n){let i=s.a,r=s.b,o=s.c,a=t,l=t+1,c=t+2;e&&(a=e.getX(a),l=e.getX(l),c=e.getX(c)),i.x=n.getX(a),i.y=n.getY(a),i.z=n.getZ(a),r.x=n.getX(l),r.y=n.getY(l),r.z=n.getZ(l),o.x=n.getX(c),o.y=n.getY(c),o.z=n.getZ(c)}function sl(s,t,e,n,i,r,o,a){let{geometry:l,_indirectBuffer:c}=s;for(let u=n,f=n+i;u<f;u++)Gn(l,t,e,u,r,o,a)}function rl(s,t,e,n,i,r,o){let{geometry:a,_indirectBuffer:l}=s,c=1/0,u=null;for(let f=n,h=n+i;f<h;f++){let d;d=Gn(a,t,e,f,null,r,o),d&&d.distance<c&&(u=d,c=d.distance)}return u}function ol(s,t,e,n,i,r,o){let{geometry:a}=e,{index:l}=a,c=a.attributes.position;for(let u=s,f=t+s;u<f;u++){let h;if(h=u,_t(o,h*3,l,c),o.needsUpdate=!0,n(o,h,i,r))return!0}return!1}function al(s,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=s.geometry,n=e.index?e.index.array:null,i=e.attributes.position,r,o,a,l,c=0,u=s._roots;for(let h=0,d=u.length;h<d;h++)r=u[h],o=new Uint32Array(r),a=new Uint16Array(r),l=new Float32Array(r),f(0,c),c+=r.byteLength;function f(h,d,p=!1){let m=h*2;if(it(m,a)){let v=at(h,o),_=dt(m,a),g=1/0,S=1/0,x=1/0,y=-1/0,T=-1/0,w=-1/0;for(let b=3*v,C=3*(v+_);b<C;b++){let M=n[b],R=i.getX(M),A=i.getY(M),P=i.getZ(M);R<g&&(g=R),R>y&&(y=R),A<S&&(S=A),A>T&&(T=A),P<x&&(x=P),P>w&&(w=P)}return l[h+0]!==g||l[h+1]!==S||l[h+2]!==x||l[h+3]!==y||l[h+4]!==T||l[h+5]!==w?(l[h+0]=g,l[h+1]=S,l[h+2]=x,l[h+3]=y,l[h+4]=T,l[h+5]=w,!0):!1}else{let v=rt(h),_=ot(h,o),g=p,S=!1,x=!1;if(t){if(!g){let M=v/8+d/32,R=_/8+d/32;S=t.has(M),x=t.has(R),g=!S&&!x}}else S=!0,x=!0;let y=g||S,T=g||x,w=!1;y&&(w=f(v,d,g));let b=!1;T&&(b=f(_,d,g));let C=w||b;if(C)for(let M=0;M<3;M++){let R=v+M,A=_+M,P=l[R],F=l[R+3],N=l[A],z=l[A+3];l[h+M]=P<N?P:N,l[h+M+3]=F>z?F:z}return C}}}function Ot(s,t,e,n,i){let r,o,a,l,c,u,f=1/e.direction.x,h=1/e.direction.y,d=1/e.direction.z,p=e.origin.x,m=e.origin.y,v=e.origin.z,_=t[s],g=t[s+3],S=t[s+1],x=t[s+3+1],y=t[s+2],T=t[s+3+2];return f>=0?(r=(_-p)*f,o=(g-p)*f):(r=(g-p)*f,o=(_-p)*f),h>=0?(a=(S-m)*h,l=(x-m)*h):(a=(x-m)*h,l=(S-m)*h),r>l||a>o||((a>r||isNaN(r))&&(r=a),(l<o||isNaN(o))&&(o=l),d>=0?(c=(y-v)*d,u=(T-v)*d):(c=(T-v)*d,u=(y-v)*d),r>u||c>o)?!1:((c>r||r!==r)&&(r=c),(u<o||o!==o)&&(o=u),r<=i&&o>=n)}function ll(s,t,e,n,i,r,o,a){let{geometry:l,_indirectBuffer:c}=s;for(let u=n,f=n+i;u<f;u++){let h=c?c[u]:u;Gn(l,t,e,h,r,o,a)}}function cl(s,t,e,n,i,r,o){let{geometry:a,_indirectBuffer:l}=s,c=1/0,u=null;for(let f=n,h=n+i;f<h;f++){let d;d=Gn(a,t,e,l?l[f]:f,null,r,o),d&&d.distance<c&&(u=d,c=d.distance)}return u}function ul(s,t,e,n,i,r,o){let{geometry:a}=e,{index:l}=a,c=a.attributes.position;for(let u=s,f=t+s;u<f;u++){let h;if(h=e.resolveTriangleIndex(u),_t(o,h*3,l,c),o.needsUpdate=!0,n(o,h,i,r))return!0}return!1}function hl(s,t,e,n,i,r,o){K.setBuffer(s._roots[t]),Ot(0,K.float32Array,n,r,o)&&xo(0,s,e,n,i,r,o),K.clearBuffer()}function xo(s,t,e,n,i,r,o){let{float32Array:a,uint16Array:l,uint32Array:c}=K,u=s*2;if(it(u,l)){let h=at(s,c),d=dt(u,l);sl(t,e,n,h,d,i,r,o)}else{let h=rt(s);Ot(h,a,n,r,o)&&xo(h,t,e,n,i,r,o);let d=ot(s,c);Ot(d,a,n,r,o)&&xo(d,t,e,n,i,r,o)}}var Vf=["x","y","z"];function fl(s,t,e,n,i,r){K.setBuffer(s._roots[t]);let o=null;return Ot(0,K.float32Array,n,i,r)&&(o=yo(0,s,e,n,i,r)),K.clearBuffer(),o}function yo(s,t,e,n,i,r){let{float32Array:o,uint16Array:a,uint32Array:l}=K,c=s*2;if(it(c,a)){let f=at(s,l),h=dt(c,a);return rl(t,e,n,f,h,i,r)}else{let f=Dn(s,l),h=Vf[f],p=n.direction[h]>=0,m,v;p?(m=rt(s),v=ot(s,l)):(m=ot(s,l),v=rt(s));let g=Ot(m,o,n,i,r)?yo(m,t,e,n,i,r):null;if(g){let y=g.point[h];if(p?y<=o[v+f]:y>=o[v+f+3])return g}let x=Ot(v,o,n,i,r)?yo(v,t,e,n,i,r):null;return g&&x?g.distance<=x.distance?g:x:g||x||null}}var Ds=new ft,Hn=new Dt,Wn=new Dt,wi=new H,dl=new bt,Fs=new bt;function pl(s,t,e,n){K.setBuffer(s._roots[t]);let i=vo(0,s,e,n);return K.clearBuffer(),i}function vo(s,t,e,n,i=null){let{float32Array:r,uint16Array:o,uint32Array:a}=K,l=s*2;if(i===null&&(e.boundingBox||e.computeBoundingBox(),dl.set(e.boundingBox.min,e.boundingBox.max,n),i=dl),it(l,o)){let u=t.geometry,f=u.index,h=u.attributes.position,d=e.index,p=e.attributes.position,m=at(s,a),v=dt(l,o);if(wi.copy(n).invert(),e.boundsTree)return gt(s,r,Fs),Fs.matrix.copy(wi),Fs.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:g=>Fs.intersectsBox(g),intersectsTriangle:g=>{g.a.applyMatrix4(n),g.b.applyMatrix4(n),g.c.applyMatrix4(n),g.needsUpdate=!0;for(let S=m*3,x=(v+m)*3;S<x;S+=3)if(_t(Wn,S,f,h),Wn.needsUpdate=!0,g.intersectsTriangle(Wn))return!0;return!1}});{let _=qe(e);for(let g=m*3,S=(v+m)*3;g<S;g+=3){_t(Hn,g,f,h),Hn.a.applyMatrix4(wi),Hn.b.applyMatrix4(wi),Hn.c.applyMatrix4(wi),Hn.needsUpdate=!0;for(let x=0,y=_*3;x<y;x+=3)if(_t(Wn,x,d,p),Wn.needsUpdate=!0,Hn.intersectsTriangle(Wn))return!0}}}else{let u=rt(s),f=ot(s,a);return gt(u,r,Ds),!!(i.intersectsBox(Ds)&&vo(u,t,e,n,i)||(gt(f,r,Ds),i.intersectsBox(Ds)&&vo(f,t,e,n,i)))}}var Us=new H,So=new bt,Ti=new bt,Gf=new E,Hf=new E,Wf=new E,qf=new E;function ml(s,t,e,n={},i={},r=0,o=1/0){t.boundingBox||t.computeBoundingBox(),So.set(t.boundingBox.min,t.boundingBox.max,e),So.needsUpdate=!0;let a=s.geometry,l=a.attributes.position,c=a.index,u=t.attributes.position,f=t.index,h=Gt.getPrimitive(),d=Gt.getPrimitive(),p=Gf,m=Hf,v=null,_=null;i&&(v=Wf,_=qf);let g=1/0,S=null,x=null;return Us.copy(e).invert(),Ti.matrix.copy(Us),s.shapecast({boundsTraverseOrder:y=>So.distanceToBox(y),intersectsBounds:(y,T,w)=>w<g&&w<o?(T&&(Ti.min.copy(y.min),Ti.max.copy(y.max),Ti.needsUpdate=!0),!0):!1,intersectsRange:(y,T)=>{if(t.boundsTree)return t.boundsTree.shapecast({boundsTraverseOrder:b=>Ti.distanceToBox(b),intersectsBounds:(b,C,M)=>M<g&&M<o,intersectsRange:(b,C)=>{for(let M=b,R=b+C;M<R;M++){_t(d,3*M,f,u),d.a.applyMatrix4(e),d.b.applyMatrix4(e),d.c.applyMatrix4(e),d.needsUpdate=!0;for(let A=y,P=y+T;A<P;A++){_t(h,3*A,c,l),h.needsUpdate=!0;let F=h.distanceToTriangle(d,p,v);if(F<g&&(m.copy(p),_&&_.copy(v),g=F,S=A,x=M),F<r)return!0}}}});{let w=qe(t);for(let b=0,C=w;b<C;b++){_t(d,3*b,f,u),d.a.applyMatrix4(e),d.b.applyMatrix4(e),d.c.applyMatrix4(e),d.needsUpdate=!0;for(let M=y,R=y+T;M<R;M++){_t(h,3*M,c,l),h.needsUpdate=!0;let A=h.distanceToTriangle(d,p,v);if(A<g&&(m.copy(p),_&&_.copy(v),g=A,S=M,x=b),A<r)return!0}}}}}),Gt.releasePrimitive(h),Gt.releasePrimitive(d),g===1/0?null:(n.point?n.point.copy(m):n.point=m.clone(),n.distance=g,n.faceIndex=S,i&&(i.point?i.point.copy(_):i.point=_.clone(),i.point.applyMatrix4(Us),m.applyMatrix4(Us),i.distance=m.sub(i.point).length(),i.faceIndex=x),n)}function gl(s,t=null){t&&Array.isArray(t)&&(t=new Set(t));let e=s.geometry,n=e.index?e.index.array:null,i=e.attributes.position,r,o,a,l,c=0,u=s._roots;for(let h=0,d=u.length;h<d;h++)r=u[h],o=new Uint32Array(r),a=new Uint16Array(r),l=new Float32Array(r),f(0,c),c+=r.byteLength;function f(h,d,p=!1){let m=h*2;if(it(m,a)){let v=at(h,o),_=dt(m,a),g=1/0,S=1/0,x=1/0,y=-1/0,T=-1/0,w=-1/0;for(let b=v,C=v+_;b<C;b++){let M=3*s.resolveTriangleIndex(b);for(let R=0;R<3;R++){let A=M+R;A=n?n[A]:A;let P=i.getX(A),F=i.getY(A),N=i.getZ(A);P<g&&(g=P),P>y&&(y=P),F<S&&(S=F),F>T&&(T=F),N<x&&(x=N),N>w&&(w=N)}}return l[h+0]!==g||l[h+1]!==S||l[h+2]!==x||l[h+3]!==y||l[h+4]!==T||l[h+5]!==w?(l[h+0]=g,l[h+1]=S,l[h+2]=x,l[h+3]=y,l[h+4]=T,l[h+5]=w,!0):!1}else{let v=rt(h),_=ot(h,o),g=p,S=!1,x=!1;if(t){if(!g){let M=v/8+d/32,R=_/8+d/32;S=t.has(M),x=t.has(R),g=!S&&!x}}else S=!0,x=!0;let y=g||S,T=g||x,w=!1;y&&(w=f(v,d,g));let b=!1;T&&(b=f(_,d,g));let C=w||b;if(C)for(let M=0;M<3;M++){let R=v+M,A=_+M,P=l[R],F=l[R+3],N=l[A],z=l[A+3];l[h+M]=P<N?P:N,l[h+M+3]=F>z?F:z}return C}}}function _l(s,t,e,n,i,r,o){K.setBuffer(s._roots[t]),Ot(0,K.float32Array,n,r,o)&&Mo(0,s,e,n,i,r,o),K.clearBuffer()}function Mo(s,t,e,n,i,r,o){let{float32Array:a,uint16Array:l,uint32Array:c}=K,u=s*2;if(it(u,l)){let h=at(s,c),d=dt(u,l);ll(t,e,n,h,d,i,r,o)}else{let h=rt(s);Ot(h,a,n,r,o)&&Mo(h,t,e,n,i,r,o);let d=ot(s,c);Ot(d,a,n,r,o)&&Mo(d,t,e,n,i,r,o)}}var Xf=["x","y","z"];function xl(s,t,e,n,i,r){K.setBuffer(s._roots[t]);let o=null;return Ot(0,K.float32Array,n,i,r)&&(o=bo(0,s,e,n,i,r)),K.clearBuffer(),o}function bo(s,t,e,n,i,r){let{float32Array:o,uint16Array:a,uint32Array:l}=K,c=s*2;if(it(c,a)){let f=at(s,l),h=dt(c,a);return cl(t,e,n,f,h,i,r)}else{let f=Dn(s,l),h=Xf[f],p=n.direction[h]>=0,m,v;p?(m=rt(s),v=ot(s,l)):(m=ot(s,l),v=rt(s));let g=Ot(m,o,n,i,r)?bo(m,t,e,n,i,r):null;if(g){let y=g.point[h];if(p?y<=o[v+f]:y>=o[v+f+3])return g}let x=Ot(v,o,n,i,r)?bo(v,t,e,n,i,r):null;return g&&x?g.distance<=x.distance?g:x:g||x||null}}var Os=new ft,qn=new Dt,Xn=new Dt,Ei=new H,yl=new bt,Bs=new bt;function vl(s,t,e,n){K.setBuffer(s._roots[t]);let i=wo(0,s,e,n);return K.clearBuffer(),i}function wo(s,t,e,n,i=null){let{float32Array:r,uint16Array:o,uint32Array:a}=K,l=s*2;if(i===null&&(e.boundingBox||e.computeBoundingBox(),yl.set(e.boundingBox.min,e.boundingBox.max,n),i=yl),it(l,o)){let u=t.geometry,f=u.index,h=u.attributes.position,d=e.index,p=e.attributes.position,m=at(s,a),v=dt(l,o);if(Ei.copy(n).invert(),e.boundsTree)return gt(s,r,Bs),Bs.matrix.copy(Ei),Bs.needsUpdate=!0,e.boundsTree.shapecast({intersectsBounds:g=>Bs.intersectsBox(g),intersectsTriangle:g=>{g.a.applyMatrix4(n),g.b.applyMatrix4(n),g.c.applyMatrix4(n),g.needsUpdate=!0;for(let S=m,x=v+m;S<x;S++)if(_t(Xn,3*t.resolveTriangleIndex(S),f,h),Xn.needsUpdate=!0,g.intersectsTriangle(Xn))return!0;return!1}});{let _=qe(e);for(let g=m,S=v+m;g<S;g++){let x=t.resolveTriangleIndex(g);_t(qn,3*x,f,h),qn.a.applyMatrix4(Ei),qn.b.applyMatrix4(Ei),qn.c.applyMatrix4(Ei),qn.needsUpdate=!0;for(let y=0,T=_*3;y<T;y+=3)if(_t(Xn,y,d,p),Xn.needsUpdate=!0,qn.intersectsTriangle(Xn))return!0}}}else{let u=rt(s),f=ot(s,a);return gt(u,r,Os),!!(i.intersectsBox(Os)&&wo(u,t,e,n,i)||(gt(f,r,Os),i.intersectsBox(Os)&&wo(f,t,e,n,i)))}}var zs=new H,To=new bt,Ai=new bt,Yf=new E,$f=new E,Zf=new E,Jf=new E;function Sl(s,t,e,n={},i={},r=0,o=1/0){t.boundingBox||t.computeBoundingBox(),To.set(t.boundingBox.min,t.boundingBox.max,e),To.needsUpdate=!0;let a=s.geometry,l=a.attributes.position,c=a.index,u=t.attributes.position,f=t.index,h=Gt.getPrimitive(),d=Gt.getPrimitive(),p=Yf,m=$f,v=null,_=null;i&&(v=Zf,_=Jf);let g=1/0,S=null,x=null;return zs.copy(e).invert(),Ai.matrix.copy(zs),s.shapecast({boundsTraverseOrder:y=>To.distanceToBox(y),intersectsBounds:(y,T,w)=>w<g&&w<o?(T&&(Ai.min.copy(y.min),Ai.max.copy(y.max),Ai.needsUpdate=!0),!0):!1,intersectsRange:(y,T)=>{if(t.boundsTree){let w=t.boundsTree;return w.shapecast({boundsTraverseOrder:b=>Ai.distanceToBox(b),intersectsBounds:(b,C,M)=>M<g&&M<o,intersectsRange:(b,C)=>{for(let M=b,R=b+C;M<R;M++){let A=w.resolveTriangleIndex(M);_t(d,3*A,f,u),d.a.applyMatrix4(e),d.b.applyMatrix4(e),d.c.applyMatrix4(e),d.needsUpdate=!0;for(let P=y,F=y+T;P<F;P++){let N=s.resolveTriangleIndex(P);_t(h,3*N,c,l),h.needsUpdate=!0;let z=h.distanceToTriangle(d,p,v);if(z<g&&(m.copy(p),_&&_.copy(v),g=z,S=P,x=M),z<r)return!0}}}})}else{let w=qe(t);for(let b=0,C=w;b<C;b++){_t(d,3*b,f,u),d.a.applyMatrix4(e),d.b.applyMatrix4(e),d.c.applyMatrix4(e),d.needsUpdate=!0;for(let M=y,R=y+T;M<R;M++){let A=s.resolveTriangleIndex(M);_t(h,3*A,c,l),h.needsUpdate=!0;let P=h.distanceToTriangle(d,p,v);if(P<g&&(m.copy(p),_&&_.copy(v),g=P,S=M,x=b),P<r)return!0}}}}}),Gt.releasePrimitive(h),Gt.releasePrimitive(d),g===1/0?null:(n.point?n.point.copy(m):n.point=m.clone(),n.distance=g,n.faceIndex=S,i&&(i.point?i.point.copy(_):i.point=_.clone(),i.point.applyMatrix4(zs),m.applyMatrix4(zs),i.distance=m.sub(i.point).length(),i.faceIndex=x),n)}function Eo(s,t,e){return s===null?null:(s.point.applyMatrix4(t.matrixWorld),s.distance=s.point.distanceTo(e.ray.origin),s.object=t,s)}var ks=new bt,Vs=new Ae,Ml=new E,bl=new H,wl=new E,Ao=["getX","getY","getZ"],Gs=class s extends Rs{static serialize(t,e={}){e={cloneBuffers:!0,...e};let n=t.geometry,i=t._roots,r=t._indirectBuffer,o=n.getIndex(),a={version:1,roots:null,index:null,indirectBuffer:null};return e.cloneBuffers?(a.roots=i.map(l=>l.slice()),a.index=o?o.array.slice():null,a.indirectBuffer=r?r.slice():null):(a.roots=i,a.index=o?o.array:null,a.indirectBuffer=r),a}static deserialize(t,e,n={}){n={setIndex:!0,indirect:!!t.indirectBuffer,...n};let{index:i,roots:r,indirectBuffer:o}=t;t.version||(console.warn("MeshBVH.deserialize: Serialization format has been changed and will be fixed up. It is recommended to regenerate any stored serialized data."),l(r));let a=new s(e,{...n,[xi]:!0});if(a._roots=r,a._indirectBuffer=o||null,n.setIndex){let c=e.getIndex();if(c===null){let u=new Yt(t.index,1,!1);e.setIndex(u)}else c.array!==i&&(c.array.set(i),c.needsUpdate=!0)}return a;function l(c){for(let u=0;u<c.length;u++){let f=c[u],h=new Uint32Array(f),d=new Uint16Array(f);for(let p=0,m=f.byteLength/32;p<m;p++){let v=8*p,_=2*v;it(_,d)||(h[v+6]=h[v+6]/8-p)}}}}get primitiveStride(){return 3}get resolveTriangleIndex(){return this.resolvePrimitiveIndex}constructor(t,e={}){e.maxLeafTris&&(console.warn('MeshBVH: "maxLeafTris" option has been deprecated. Use "targetLeafSize", instead.'),e={...e,targetLeafSize:e.maxLeafTris}),super(t,e)}shiftTriangleOffsets(t){return super.shiftPrimitiveOffsets(t)}writePrimitiveBounds(t,e,n){let i=this.geometry,r=this._indirectBuffer,o=i.attributes.position,a=i.index?i.index.array:null,c=(r?r[t]:t)*3,u=c+0,f=c+1,h=c+2;a&&(u=a[u],f=a[f],h=a[h]);for(let d=0;d<3;d++){let p=o[Ao[d]](u),m=o[Ao[d]](f),v=o[Ao[d]](h),_=p;m<_&&(_=m),v<_&&(_=v);let g=p;m>g&&(g=m),v>g&&(g=v),e[n+d]=_,e[n+d+3]=g}return e}computePrimitiveBounds(t,e,n){let i=this.geometry,r=this._indirectBuffer,o=i.attributes.position,a=i.index?i.index.array:null,l=o.normalized;if(t<0||e+t-n.offset>n.length/6)throw new Error("MeshBVH: compute triangle bounds range is invalid.");let c=o.array,u=o.offset||0,f=3;o.isInterleavedBufferAttribute&&(f=o.data.stride);let h=["getX","getY","getZ"],d=n.offset;for(let p=t,m=t+e;p<m;p++){let _=(r?r[p]:p)*3,g=(p-d)*6,S=_+0,x=_+1,y=_+2;a&&(S=a[S],x=a[x],y=a[y]),l||(S=S*f+u,x=x*f+u,y=y*f+u);for(let T=0;T<3;T++){let w,b,C;l?(w=o[h[T]](S),b=o[h[T]](x),C=o[h[T]](y)):(w=c[S+T],b=c[x+T],C=c[y+T]);let M=w;b<M&&(M=b),C<M&&(M=C);let R=w;b>R&&(R=b),C>R&&(R=C);let A=(R-M)/2,P=T*2;n[g+P+0]=M+A,n[g+P+1]=A+(Math.abs(M)+A)*Nn}}return n}raycastObject3D(t,e,n=[]){let{material:i}=t;if(i===void 0)return;bl.copy(t.matrixWorld).invert(),Vs.copy(e.ray).applyMatrix4(bl),wl.setFromMatrixScale(t.matrixWorld),Ml.copy(Vs.direction).multiply(wl);let r=Ml.length(),o=e.near/r,a=e.far/r;if(e.firstHitOnly===!0){let l=this.raycastFirst(Vs,i,o,a);l=Eo(l,t,e),l&&n.push(l)}else{let l=this.raycast(Vs,i,o,a);for(let c=0,u=l.length;c<u;c++){let f=Eo(l[c],t,e);f&&n.push(f)}}return n}refit(t=null){return(this.indirect?gl:al)(this,t)}raycast(t,e=ms,n=0,i=1/0){let r=this._roots,o=[],a=this.indirect?_l:hl;for(let l=0,c=r.length;l<c;l++)a(this,l,e,t,o,n,i);return o}raycastFirst(t,e=ms,n=0,i=1/0){let r=this._roots,o=null,a=this.indirect?xl:fl;for(let l=0,c=r.length;l<c;l++){let u=a(this,l,e,t,n,i);u!=null&&(o==null||u.distance<o.distance)&&(o=u)}return o}intersectsGeometry(t,e){let n=!1,i=this._roots,r=this.indirect?vl:pl;for(let o=0,a=i.length;o<a&&(n=r(this,o,t,e),!n);o++);return n}shapecast(t){let e=Gt.getPrimitive(),n=super.shapecast({...t,intersectsPrimitive:t.intersectsTriangle,scratchPrimitive:e,iterate:this.indirect?ul:ol});return Gt.releasePrimitive(e),n}bvhcast(t,e,n){let{intersectsRanges:i,intersectsTriangles:r}=n,o=Gt.getPrimitive(),a=this.geometry.index,l=this.geometry.attributes.position,c=this.indirect?p=>{let m=this.resolveTriangleIndex(p);_t(o,m*3,a,l)}:p=>{_t(o,p*3,a,l)},u=Gt.getPrimitive(),f=t.geometry.index,h=t.geometry.attributes.position,d=t.indirect?p=>{let m=t.resolveTriangleIndex(p);_t(u,m*3,f,h)}:p=>{_t(u,p*3,f,h)};if(r){if(!(t instanceof s))throw new Error('MeshBVH: "intersectsTriangles" callback can only be used with another MeshBVH.');let p=(m,v,_,g,S,x,y,T)=>{for(let w=_,b=_+g;w<b;w++){d(w),u.a.applyMatrix4(e),u.b.applyMatrix4(e),u.c.applyMatrix4(e),u.needsUpdate=!0;for(let C=m,M=m+v;C<M;C++)if(c(C),o.needsUpdate=!0,r(o,u,C,w,S,x,y,T))return!0}return!1};if(i){let m=i;i=function(v,_,g,S,x,y,T,w){return m(v,_,g,S,x,y,T,w)?!0:p(v,_,g,S,x,y,T,w)}}else i=p}return super.bvhcast(t,e,{intersectsRanges:i})}intersectsBox(t,e){return ks.set(t.min,t.max,e),ks.needsUpdate=!0,this.shapecast({intersectsBounds:n=>ks.intersectsBox(n),intersectsTriangle:n=>ks.intersectsTriangle(n)})}intersectsSphere(t){return this.shapecast({intersectsBounds:e=>t.intersectsBox(e),intersectsTriangle:e=>e.intersectsSphere(t)})}closestPointToGeometry(t,e,n={},i={},r=0,o=1/0){return(this.indirect?Sl:ml)(this,t,e,n,i,r,o)}closestPointToPoint(t,e={},n=0,i=1/0){return ja(this,t,e,n,i)}};var Ro=new H,Kf=new E(.923,.517,.377).normalize(),Re=1e-6,Kt=(s,t,e)=>{let n=Array.isArray(s)?s.map(Number):String(s??"").trim().split(/\s+/).map(Number);if(n.length!==t||!n.every(Number.isFinite))throw new Error(`${e} needs ${t} finite numbers.`);return n},Ci=s=>s?.isMatrix4?s.clone():new H().fromArray(s??Ro.elements),jf=(s=[0,0,0],t=[0,0,0])=>new H().makeRotationFromEuler(new Je(...t,"ZYX")).setPosition(...s);var Ri=(s,t)=>{if(!(Number.isFinite(s)&&s>0))throw new Error(`${t} must be positive.`);return s},Pi=s=>Math.max(s-Re,s*.5);function Ii(s){if(typeof DOMParser>"u")throw new Error("URDF collision parsing needs a DOMParser on the browser side.");let t=new DOMParser().parseFromString(s,"application/xml");if(t.querySelector("parsererror")||t.documentElement?.tagName!=="robot")throw new Error("Invalid URDF XML.");let e=[];for(let n of t.querySelectorAll("robot > link")){let i=n.getAttribute("name"),r=[...n.querySelectorAll(":scope > collision")];if(!r.length&&n.querySelector(":scope > visual"))throw new Error(`Planning collision geometry missing for robot ${t.documentElement.getAttribute("name")||"unnamed"}, visible link ${i}. Add a <collision> shape to that URDF link.`);for(let o of r){let a=o.querySelector(":scope > origin"),l=a?.getAttribute("xyz")?Kt(a.getAttribute("xyz"),3,"URDF collision xyz"):[0,0,0],c=a?.getAttribute("rpy")?Kt(a.getAttribute("rpy"),3,"URDF collision rpy"):[0,0,0],u=o.querySelector(":scope > geometry")?.firstElementChild;if(!u)throw new Error(`Missing collision geometry on ${i}.`);let f;if(u.tagName==="box")f={type:"box",size:Kt(u.getAttribute("size"),3,"URDF box size")};else if(u.tagName==="sphere")f={type:"sphere",radius:Number(u.getAttribute("radius"))};else if(u.tagName==="cylinder")f={type:"cylinder",radius:Number(u.getAttribute("radius")),length:Number(u.getAttribute("length"))};else if(u.tagName==="mesh")f={type:"mesh",uri:u.getAttribute("filename"),scale:u.getAttribute("scale")?Kt(u.getAttribute("scale"),3,"URDF mesh scale"):[1,1,1]};else throw new Error(`Unsupported collision geometry ${u.tagName} on ${i}.`);e.push({link:i,geometry:f,origin:jf(l,c).elements.slice()})}}if(!e.length)throw new Error("Robot has no explicit URDF collision geometry.");return e}function Qf(s,t){let e;switch(s.type){case"box":e=new ii(...Kt(s.size,3,"Box size").map(n=>Pi(Ri(n,"Box size"))));break;case"sphere":e=new oi(Pi(Ri(Number(s.radius),"Sphere radius")),32,24);break;case"cylinder":e=new si(Pi(Ri(Number(s.radius),"Cylinder radius")),Pi(Number(s.radius)),Pi(Ri(Number(s.length),"Cylinder length")),48),e.rotateX(Math.PI/2);break;case"plane":{e=new ri(...Kt(s.size,2,"Plane size").map(i=>Ri(i,"Plane size")));let n=new E(...Kt(s.normal,3,"Plane normal"));if(n.lengthSq()<1e-20)throw new Error("Plane normal is zero.");e.applyQuaternion(new J().setFromUnitVectors(new E(0,0,1),n.normalize()));break}case"mesh":{let n=s.uri??s.filename,i=t?.(n);if(!i?.isBufferGeometry)throw new Error(`Missing local collision mesh ${n}.`);e=i.clone();let r=Kt(s.scale??[1,1,1],3,"Collision mesh scale");if(r.some(l=>l===0))throw new Error("Collision mesh scale cannot be zero.");e.scale(...r),e.computeBoundingBox();let o=e.boundingBox.getCenter(new E),a=e.boundingBox.getSize(new E);e.translate(-o.x,-o.y,-o.z),e.scale(...a.toArray().map(l=>l>Re?1-Re/l:1)),e.translate(o.x,o.y,o.z);break}default:throw new Error(`Unsupported collision geometry ${s.type}.`)}if(e.computeBoundingBox(),!e.getAttribute("position")?.count||e.boundingBox.isEmpty())throw new Error("Collision geometry has no triangles.");return e}function Tl(s,t,e,n){let i=Qf(t,n);return{owner:s,shape:t,source:e,geometry:i,bvh:new Gs(i),localBox:i.boundingBox.clone(),world:new H,worldBox:new ft,worldOBB:new _i}}function td(s){let t=o=>s.get?.(o),e=s.type??t("type"),n=s.axis?.toArray?.()??s.axis??[1,0,0],i=s.basicMatrix?.elements??s.origin??Ro.elements,r=s.mimic??t("mimic");return{name:s.name??t("name"),parent:t("parent")?.link??s.parent,child:t("child")?.link??s.child,type:e,axis:Kt(n,3,"Joint axis"),origin:[...i],initial:Number(s.theta??0),mimic:r?{joint:r.joint,multiplier:Number(r.multiplier??1),offset:Number(r.offset??0)}:null}}function ed(s){let t=new Map,e=i=>(t.has(i)||t.set(i,i),t.get(i)!==i&&t.set(i,e(t.get(i))),t.get(i));for(let i of s)i.type==="fixed"&&t.set(e(i.child),e(i.parent));let n=new Set;for(let i of s){let r=e(i.parent),o=e(i.child);r!==o&&n.add([r,o].sort().join("\0"))}return(i,r)=>{let o=e(i),a=e(r);return o===a||n.has([o,a].sort().join("\0"))}}function El(s,t,e){if(s.type==="plane")return!1;let n=e.clone().applyMatrix4(t.world.clone().invert());if(s.type==="box")return Kt(s.size,3,"Box size").every((a,l)=>Math.abs(n.getComponent(l))<a/2-1e-8);if(s.type==="sphere")return n.lengthSq()<s.radius**2-1e-8;if(s.type==="cylinder")return n.x*n.x+n.y*n.y<s.radius**2-1e-8&&Math.abs(n.z)<s.length/2-1e-8;let i=t.bvh.raycast(new Ae(n,Kf),li).filter(a=>a.distance>1e-8),r=0,o=-1/0;for(let a of i.sort((l,c)=>l.distance-c.distance))a.distance-o>1e-7&&(r++,o=a.distance);return r%2===1}function Al(s,t){let e=new E().setFromMatrixPosition(s.world).applyMatrix4(t.world.clone().invert()),n=Kt(t.shape.size,3,"Box size"),i=Math.max(0,Math.abs(e.x)-n[0]/2),r=Math.max(0,Math.abs(e.y)-n[1]/2),o=Math.max(0,Math.abs(e.z)-n[2]/2);return i*i+r*r+o*o<Math.max(0,s.shape.radius-Re)**2}function Cl(s,t){let e=new E(...Kt(s.shape.normal,3,"Plane normal")).normalize(),i=s.world.clone().multiply(new H().makeRotationFromQuaternion(new J().setFromUnitVectors(new E(0,0,1),e))).invert(),r=Kt(s.shape.size,2,"Plane size").map(h=>h/2),o=1/0,a=1/0,l=-1/0,c=1/0,u=-1/0,f=t.worldBox;for(let h of[f.min.x,f.max.x])for(let d of[f.min.y,f.max.y])for(let p of[f.min.z,f.max.z]){let m=new E(h,d,p).applyMatrix4(i);o=Math.min(o,m.z),a=Math.min(a,m.x),l=Math.max(l,m.x),c=Math.min(c,m.y),u=Math.max(u,m.y)}return o<-Re&&a<r[0]&&l>-r[0]&&c<r[1]&&u>-r[1]}function Co(s,t){if(s.shape.type==="plane")return Cl(s,t);if(t.shape.type==="plane")return Cl(t,s);if(!s.worldBox.intersectsBox(t.worldBox))return!1;if(s.shape.type==="box"&&t.shape.type==="box")return s.worldOBB.intersectsOBB(t.worldOBB,1e-10);if(s.shape.type==="sphere"&&t.shape.type==="sphere"){let r=new E().setFromMatrixPosition(s.world),o=new E().setFromMatrixPosition(t.world);return r.distanceToSquared(o)<Math.max(0,s.shape.radius+t.shape.radius-Re)**2}if(s.shape.type==="sphere"&&t.shape.type==="box")return Al(s,t);if(t.shape.type==="sphere"&&s.shape.type==="box")return Al(t,s);let e=s.world.clone().invert().multiply(t.world);if(s.bvh.intersectsGeometry(t.geometry,e))return!0;let n=s.localBox.getCenter(new E).applyMatrix4(s.world),i=t.localBox.getCenter(new E).applyMatrix4(t.world);return El(s.shape,s,i)||El(t.shape,t,n)}function Rl(s,t){s.world.copy(t),s.worldBox.copy(s.localBox).applyMatrix4(s.world),s.worldOBB.fromBox3(s.localBox).applyMatrix4(s.world),s.worldOBB.center.copy(s.localBox.getCenter(new E)).applyMatrix4(s.world),s.shape.type==="box"&&s.worldOBB.halfSize.set(Math.max(0,s.worldOBB.halfSize.x-Re/2),Math.max(0,s.worldOBB.halfSize.y-Re/2),Math.max(0,s.worldOBB.halfSize.z-Re/2))}function nd(s,t,e=!1){let n=t.clone().applyMatrix4(s.world.clone().invert()),i=s.shape;if(i.type==="box"){let a=i.size.map(l=>l/2).map((l,c)=>Math.abs(n.getComponent(c))-l);return e&&a.every(l=>l<=0)?-Math.max(...a):Math.hypot(...a.map(l=>Math.max(0,l)))}if(i.type==="sphere")return e?Math.abs(n.length()-i.radius):Math.max(0,n.length()-i.radius);if(i.type==="cylinder"){let o=Math.hypot(n.x,n.y)-i.radius,a=Math.abs(n.z)-i.length/2;return e&&o<=0&&a<=0?-Math.max(o,a):Math.hypot(Math.max(0,o),Math.max(0,a))}let r=s.bvh.closestPointToPoint(n);if(!r?.point)throw new Error(`Collision geometry ${s.owner} has no nearest point.`);return t.distanceTo(r.point.clone().applyMatrix4(s.world))}function Hs({robotName:s,robotModel:t,allJoints:e,robotCollisionShapes:n,sceneModel:i,meshGeometry:r,allowedCollisionPairs:o=[]}){if(!t||!Array.isArray(e)||!Array.isArray(n)||!n.length)throw new Error("Planning collision scene needs the robot model, all joints, and explicit URDF collision shapes.");if(!i)throw new Error("Planning collision scene needs a loaded SceneModel.");let a=e.map(td),l=ed(a),c=new Set(o.map(I=>{if(!Array.isArray(I)||I.length!==2||I.some(D=>typeof D!="string"||!D)||I[0]===I[1])throw new Error("Allowed collision pairs need two distinct link names.");return[...I].sort().join("\0")})),u=(I,D)=>l(I,D)||c.has([I,D].sort().join("\0")),f=new Set([t.baseLink]),h=!0;for(;h;){h=!1;for(let I of a)I.type==="fixed"&&(f.has(I.parent)&&!f.has(I.child)&&(f.add(I.child),h=!0),f.has(I.child)&&!f.has(I.parent)&&(f.add(I.parent),h=!0))}let d=i.robotMountRecord?.(s)?.frame.split("/")[1]??null,p=n.map((I,D)=>({...Tl(`robot:${I.link}:${D}`,I.geometry,{kind:"robot",link:I.link,origin:Ci(I.origin)},r),link:I.link}));r??=i.meshGeometry,i.scene.updateMatrixWorld(!0);let m=new Map;for(let[I,D]of i.models)m.set(I,{name:I,fixedWorld:D.group.matrixWorld.clone(),attachment:null,shapes:[]});let v=new Map;for(let[I,D]of i.frames){if(!I.startsWith("model/"))continue;let B=I.split("/")[1],O=m.get(B);O&&v.set(I,{name:B,local:O.fixedWorld.clone().invert().multiply(D.matrixWorld)})}for(let[I,D]of i.collisionEntries.entries()){let B=m.get(D.model);if(!B)throw new Error(`Unknown scene collision model ${D.model}.`);let O=B.fixedWorld.clone().invert().multiply(D.frame.matrixWorld);B.shapes.push(Tl(`scene:${D.model}:${I}`,D.geometry,{kind:"scene",model:D.model,local:O},r))}let _=[...m.values()].flatMap(I=>I.shapes),g=new Map(t.jointNames.map((I,D)=>[I,D])),S=new Map(a.map(I=>[I.name,I])),x=I=>{if(!Array.isArray(I)||I.length!==t.active.length||!I.every(Number.isFinite))throw new Error("Collision query needs one finite value per active joint.");let D=new Map,B=new Set,O=U=>{if(D.has(U.name))return D.get(U.name);if(B.has(U.name))throw new Error("Mimic joint cycle in collision scene.");B.add(U.name);let L=U.mimic?O(S.get(U.mimic.joint))*U.mimic.multiplier+U.mimic.offset:g.has(U.name)?I[g.get(U.name)]:U.initial;if(!Number.isFinite(L))throw new Error(`Invalid joint position ${U.name}.`);return D.set(U.name,L),B.delete(U.name),L};return new Map(a.map(U=>[U.name,O(U)]))},y=I=>{let D=x(I),B=new Map([[t.baseLink,Ci(t.worldFromBase)]]),O=[...a];for(;O.length;){let U=[],L=!1;for(let V of O){let tt=B.get(V.parent);if(!tt){U.push(V);continue}let lt=tt.clone().multiply(Ci(V.origin)),et=D.get(V.name);if(V.type==="prismatic")lt.multiply(new H().makeTranslation(...V.axis.map(pt=>pt*et)));else if(V.type==="revolute"||V.type==="continuous")lt.multiply(new H().makeRotationAxis(new E(...V.axis).normalize(),et));else if(V.type!=="fixed")throw new Error(`Unsupported collision joint ${V.type}.`);B.set(V.child,lt),L=!0}if(!L)throw new Error("Robot collision joints do not form a tree rooted at the IK base.");O=U}return B},T=(I,D,B,O=new Set)=>{if(I==="world")return Ro;if(I==="tool"){let V=B.get(t.tipLink);if(!V)throw new Error(`Missing tip link ${t.tipLink}.`);return V.clone().multiply(Ci(t.toolTransform))}let U=`robot/${s}/link/`;if(I===`robot/${s}`)return Ci(t.worldFromBase);if(I.startsWith(U)){let V=B.get(I.slice(U.length));if(!V)throw new Error(`Unknown robot attachment link ${I}.`);return V}let L=v.get(I);if(!L)throw new Error(`Unknown planning attachment frame ${I}.`);return w(m.get(L.name),D,B,O).clone().multiply(L.local)},w=(I,D,B,O=new Set)=>{if(!I.attachment)return I.fixedWorld;if(O.has(I.name))throw new Error(`Model attachment cycle at ${I.name}.`);O.add(I.name);try{return T(I.attachment.frame,D,B,O).clone().multiply(I.attachment.local)}finally{O.delete(I.name)}},b=(I,D)=>{if(I==="world")return new H;let B=y(D);return I==="tool"||I.startsWith(`robot/${s}`),T(I,D,B).clone()},C=I=>{let D=y(I);for(let B of p){let O=D.get(B.link);if(!O)throw new Error(`Collision shape refers to missing robot link ${B.link}.`);Rl(B,O.clone().multiply(B.source.origin))}for(let B of m.values()){let O=w(B,I,D);for(let U of B.shapes)Rl(U,O.clone().multiply(U.source.local))}return D},M=I=>{let D=I.attachment&&v.get(I.attachment.frame);return D?m.get(D.name):null},R=I=>{let D=new Set;for(;M(I);){if(D.has(I.name))throw new Error(`Model attachment cycle at ${I.name}.`);D.add(I.name),I=M(I)}return I},A=I=>{let D=I.attachment?.frame;if(D==="tool")return t.tipLink;if(D?.startsWith(`robot/${s}/link/`))return D.slice(`robot/${s}/link/`.length);let B=M(I);return B?A(B):null},P=null,F=I=>{P=null,C(I);for(let D=0;D<p.length;D++)for(let B=D+1;B<p.length;B++)if(!u(p[D].link,p[B].link)&&Co(p[D],p[B]))return P=[p[D].link,p[B].link],!1;for(let D of p)for(let B of m.values())for(let O of B.shapes){if(B.name===d&&f.has(D.link))continue;let U=A(B);if(!(U&&l(D.link,U))&&Co(D,O))return P=[D.link,B.name],!1}for(let D=0;D<_.length;D++)for(let B=D+1;B<_.length;B++){let O=m.get(_[D].source.model),U=m.get(_[B].source.model);if((O.attachment||U.attachment)&&O!==U&&R(O)!==R(U)&&Co(_[D],_[B]))return P=[O.name,U.name],!1}return!0},N=(I,D,B)=>{let O=m.get(I);if(!O)throw new Error(`Unknown attachable object ${I}.`);let U=v.get(D),L=U?m.get(U.name):null,V=D==="tool"||D===`robot/${s}`||D.startsWith(`robot/${s}/link/`)||L&&A(L)!=null;if(d&&V){let et=m.get(d);for(;et;){if(et===O)throw new Error(`Model attachment cycle: ${I} carries the mounted robot base.`);et=M(et)}}if(U){let et=m.get(U.name),pt=new Set;for(;et;){if(et===O)throw new Error(`Model attachment cycle: ${I} cannot join ${D}.`);if(pt.has(et.name))throw new Error(`Model attachment cycle at ${et.name}.`);pt.add(et.name),et=M(et)}}let tt=y(B),lt=w(O,B,tt);O.attachment={frame:D,local:T(D,B,tt).clone().invert().multiply(lt)}},z=(I,D)=>{let B=m.get(I);if(!B)throw new Error(`Unknown attachable object ${I}.`);B.attachment&&(B.fixedWorld=w(B,D,y(D)).clone(),B.attachment=null)},G=(I,D,B,O)=>{let U=m.get(I);if(!U)throw new Error(`Unknown scene object ${I}.`);if(!U.shapes.length)throw new Error(`Scene object ${I} has no collision geometry for grasp proximity.`);let L=D?.isVector3?D:new E(...D);if(![L.x,L.y,L.z].every(Number.isFinite))throw new Error("Grasp position must be finite.");return C(B),Math.min(...U.shapes.map(V=>nd(V,L,O)))};for(let[I,D]of i.attached)m.has(I)&&N(I,D,t.initial);return{isStateValid:F,attach:N,release:z,get lastCollision(){return P?[...P]:null},distanceToObject:(I,D,B)=>G(I,D,B,!1),distanceToObjectSurface:(I,D,B)=>G(I,D,B,!0),linkTransforms:y,getFrameWorld:b,getObjectWorld:(I,D)=>{let B=m.get(I);if(!B)throw new Error(`Unknown scene object ${I}.`);return w(B,D,y(D)).clone()},snapshot:()=>[...m].map(([I,D])=>({name:I,attachment:D.attachment?.frame??null})),dispose:()=>[...p,..._].forEach(I=>I.geometry.dispose())}}function Li(s,t,e={}){if(!s?.jointNames||!Array.isArray(t)||!e||typeof e!="object")throw new Error("Robot model and motion settings are required.");let n=new Map(t.map(r=>[r.name??r.get?.("name"),r])),i=s.jointNames.map((r,o)=>{let a=n.get(r),l=s.joints[s.active[o]].type,c=Number(a?.get?.("limit")?.velocity??a?.attributes?.limit?.velocity),u=Number.isFinite(c)&&c>0?c:l==="prismatic"?.25:1,f=2*u,h=e[r]||{},d=h.velocity==null?u:Number(h.velocity),p=h.acceleration==null?f:Number(h.acceleration);if(![d,p].every(m=>Number.isFinite(m)&&m>0))throw new Error(`Joint ${r} needs positive velocity and acceleration limits.`);return{name:r,velocity:d,acceleration:p,velocitySource:h.velocity==null?c>0?"URDF":"simulation default":"project setting",accelerationSource:h.acceleration==null?"simulation default":"project setting"}});return{velocity:i.map(r=>r.velocity),acceleration:i.map(r=>r.acceleration),details:i}}function id(s,t){return{time:t,q:Ca(s,t).q}}function Po(s,t,e){return{time:e,...tn(s,t,e)}}function sd(s,t,e,n,i){let r=s[t].time,o=s[e].time,a=[...Array.from({length:i+1},(c,u)=>({time:r+(o-r)*u/i,priority:0})),...s.slice(t,e+1).map(c=>({time:c.time,priority:1})),{time:n,priority:2},{time:r,priority:3},{time:o,priority:3}].sort((c,u)=>c.time-u.time||u.priority-c.priority),l=[];for(let c of a){let u=l.at(-1);u&&c.time-u.time<2e-9?c.priority>u.priority&&(l[l.length-1]=c):l.push(c)}return l.map(c=>c.time)}function Pl(s,{boundaryTime:t,leftStart:e,rightEnd:n,radius:i,model:r,limits:o,isStateValid:a,collisionOptions:l={}}){if(!(Number.isFinite(i)&&i>0))return{status:"invalid_target",reason:"ZONE radius must be positive and finite."};let c=s.findIndex(m=>Math.abs(m.time-t)<1e-9);if(c<=0||c>=s.length-1)return{status:"invalid_target",reason:"ZONE needs samples on both sides of the PTP waypoint."};let u=ut(r,s[c].q),f=Math.min((t-e)/4,(n-t)/4,.5);if(!(f>0))return{status:"invalid_target",reason:"ZONE needs two nonzero-duration PTP moves."};let h=ke(r,a,l),d="No C2 blend fits the requested ZONE and motion limits.",p=new Set;for(let m=0;m<12;m++){let v=f/2**m,_=c-1,g=c+1;for(;_>0&&s[_-1].time>=t-v;)_--;for(;g<s.length-1&&s[g+1].time<=t+v;)g++;if(s[_].time<=e||s[g].time>=n)continue;let S=`${_}:${g}`;if(p.has(S))continue;p.add(S);let x=s[_],y=s[g],T=Math.max(2,Math.ceil((y.time-x.time)/.005)),w=sd(s,_,g,t,T),b=(t-x.time)/(y.time-x.time),C={time:t,q:x.q.map((N,z)=>{let G=.25*(Math.abs(x.velocity[z])-Math.abs(y.velocity[z]))/(Math.abs(x.velocity[z])+Math.abs(y.velocity[z])+1e-12),I=Math.max(.05,Math.min(.95,b+G));return N+(y.q[z]-N)*I}),velocity:y.q.map((N,z)=>(N-x.q[z])/(y.time-x.time)),acceleration:x.q.map(()=>0)},M=w.map(N=>N<=t?Po(x,C,N):Po(C,y,N)),R=[];for(let N=0;N<M.length;N++){if(N)for(let z of[.25,.5,.75]){let G=M[N-1],I=M[N],D=G.time+(I.time-G.time)*z;R.push(Po(G,I,D))}R.push(M[N])}let A=!0;for(let N=0;N<R.length;N++){let z=R[N];if(N&&z.q.some((U,L)=>{let V=Math.sign(y.q[L]-x.q[L]);return V?V*(U-R[N-1].q[L])<-1e-8:Math.abs(U-x.q[L])>1e-7})){d="ZONE blend would reverse a joint near the corner.",A=!1;break}let G=z.q.findIndex((U,L)=>{let V=r.joints[r.active[L]];return V.type!=="continuous"&&(U<V.lower-1e-9||U>V.upper+1e-9)||Math.abs(z.velocity[L])>o.velocity[L]*(1+1e-6)||Math.abs(z.acceleration[L])>o.acceleration[L]*(1+1e-6)});if(G>=0){d=`ZONE blend violates a joint position, velocity, or acceleration limit at joint ${r.jointNames[G]} and t=${z.time.toFixed(4)} s (q=${z.q[G].toFixed(4)}, v=${z.velocity[G].toFixed(4)}, a=${z.acceleration[G].toFixed(4)}).`,A=!1;break}let I=ut(r,z.q),D=ut(r,id(s,z.time).q),B=Math.hypot(...I.position.map((U,L)=>U-u.position[L])),O=Vt(I,D);if(B>i+1e-8||O.positionError>i+1e-8||O.orientationError>.05+1e-8){d="ZONE blend leaves the TCP tolerance around the waypoint or original path.",A=!1;break}try{if(!h.isStateValid(z.q)||N&&!h.isEdgeValid(R[N-1].q,z.q)){d="ZONE blend intersects an obstacle.",A=!1;break}}catch(U){d=U.message,A=!1;break}}if(!A)continue;let P=M.find(N=>Math.abs(N.time-t)<1e-9),F=P?Math.max(...P.velocity.map((N,z)=>Math.abs(N)/o.velocity[z])):0;if(F<1e-5){d="ZONE blend cannot maintain nonzero speed through the corner.";continue}if(!h.isEdgeValid(s[_-1].q,M[0].q)||!h.isEdgeValid(M.at(-1).q,s[g+1].q)){d="ZONE splice crosses an obstacle at its entry or exit.";continue}return{status:"blended",samples:[...s.slice(0,_+1),...M.slice(1,-1),...s.slice(g)],entryTime:x.time,exitTime:y.time,waypointTime:t,waypointDeviation:Vt(ut(r,P.q),u).positionError,cornerSpeedFraction:F,radius:i}}return{status:"zone_infeasible",reason:d}}var Ht=s=>new E(...s),rd=(s,t)=>2*Math.acos(Math.min(1,Math.abs(new J(...s).normalize().dot(new J(...t).normalize())))),od=(s,t,e)=>(s===5?[1,5,10,10,5,1]:[1,4,6,4,1])[t]*e**t*(1-e)**(s-t),ad=(s,t)=>s.reduce((e,n,i)=>e.addScaledVector(n,od(5,i,t)),new E);function Io(s){return Math.max(Ht(s.angularVelocityAt(0)).length(),Ht(s.angularVelocityAt(1)).length())}function Il(s,t,e,{trimScale:n=1}={}){if(!(Number.isFinite(e)&&e>0&&e<=.2))return{status:"invalid_target",reason:"Cartesian ZONE needs a radius from 0 to 0.2 m."};if(![s,t].every(O=>["LIN","CIRC"].includes(O?.type)&&O.length>1e-8))return{status:"zone_infeasible",reason:"Cartesian ZONE needs two non-degenerate LIN/CIRC paths."};let i=s.at(1),r=t.at(0);if(Ht(i.position).distanceTo(Ht(r.position))>1e-7||rd(i.quaternion,r.quaternion)>1e-4)return{status:"zone_infeasible",reason:"Cartesian ZONE paths must share one nominal TCP waypoint."};let o=s.type==="CIRC"?(1-s.viaFraction)*s.length:1/0,a=t.type==="CIRC"?t.viaFraction*t.length:1/0,l=Math.min(e*.75,s.length/3,o*.5)*n,c=Math.min(e*.75,t.length/3,a*.5)*n;if(l<1e-4||c<1e-4)return{status:"zone_infeasible",reason:"ZONE cannot trim either Cartesian move without losing a via pose or a usable transition."};let u=1-l/s.length,f=c/t.length,h=Ht(s.at(u).position),d=Ht(t.at(f).position),p=Ht(s.tangentAt(u)),m=Ht(t.tangentAt(f)),v=Ht(s.curvatureAt(u)),_=Ht(t.curvatureAt(f));if(p.dot(m)<-.98)return{status:"zone_infeasible",reason:"Cartesian ZONE cannot fly through a near-reversal cusp."};let g=l+c,S=p.clone().multiplyScalar(g),x=m.clone().multiplyScalar(g),y=v.clone().multiplyScalar(g*g),T=_.clone().multiplyScalar(g*g),w=[h,h.clone().addScaledVector(S,1/5),h.clone().addScaledVector(S,2/5).addScaledVector(y,1/20),d.clone().addScaledVector(x,-2/5).addScaledVector(T,1/20),d.clone().addScaledVector(x,-1/5),d],b=Ht(i.position);if(w.some(O=>O.distanceTo(b)>e-1e-6))return{status:"zone_infeasible",reason:"Cartesian blend control hull leaves the waypoint ZONE ball."};let C=d.clone().sub(h);if(C.lengthSq()<1e-12||w.slice(0,5).some((O,U)=>w[U+1].clone().sub(O).dot(C)<=1e-9))return{status:"zone_infeasible",reason:"Cartesian blend would loop or reverse near the waypoint."};let M=s.length-l,R=s.length+t.length,A=M/R,P=(M+g/2)/R,F=(M+g)/R,N=[A,P,F];s.type==="CIRC"&&N.push(s.viaFraction*s.length/R),t.type==="CIRC"&&N.push((M+g+t.viaFraction*t.length-c)/R),N.sort((O,U)=>O-U);let z=new J(...s.at(u).quaternion).normalize(),G=new J(...t.at(f).quaternion).normalize(),I=wa(z.toArray(),G.toArray(),s.angularVelocityAt(u),t.angularVelocityAt(f),g),D=Math.max(I.rateBound,Io(s),Io(t));return{status:"built",path:{type:"CARTESIAN_ZONE",length:R,rotationAngle:s.rotationAngle+t.rotationAngle+I.angleBound,angularRateBound:D,orientationTransitionAngle:I.relativeAngle,requiredFractions:N,entryFraction:A,boundaryFraction:P,exitFraction:F,at(O){let U=Math.max(0,Math.min(1,O))*R;if(U<=M)return s.at(U/s.length);if(U>=M+g)return t.at((U-M-g+c)/t.length);let L=(U-M)/g;return{position:ad(w,L).toArray(),quaternion:I.at(L)}}},controls:w.map(O=>O.toArray()),orientation:I,trimIn:l,trimOut:c,waypoint:i.position,radius:e}}function ld(s,t,{trimScale:e=1}={}){if(!Array.isArray(s)||s.length<3||t?.length!==s.length-1)return{status:"invalid_target",reason:"Cartesian ZONE chain needs at least three paths and one radius per corner."};let n=s.reduce((l,c)=>l+c.length,0),i=[0];for(let l of s)i.push(i.at(-1)+l.length);let r=[];for(let l=0;l<t.length;l++){let c=Il(s[l],s[l+1],t[l],{trimScale:e});if(c.status!=="built")return{...c,cornerIndex:l};let u=i[l+1]-c.trimIn,f=i[l+1]+c.trimOut;if(r.length&&u<=r.at(-1).exitDistance+1e-6)return{status:"zone_infeasible",cornerIndex:l,reason:"Adjacent Cartesian ZONE trims overlap on their shared move."};r.push({...c,index:l,entryDistance:u,exitDistance:f,boundaryDistance:i[l]+c.path.boundaryFraction*c.path.length})}let o=[];for(let l=0;l<s.length;l++)s[l].type==="CIRC"&&o.push((i[l]+s[l].viaFraction*s[l].length)/n);for(let l of r)o.push(l.entryDistance/n,l.boundaryDistance/n,l.exitDistance/n);return o.sort((l,c)=>l-c),{status:"built",path:{type:"CARTESIAN_ZONE_CHAIN",length:n,rotationAngle:s.reduce((l,c)=>l+c.rotationAngle,0)+r.reduce((l,c)=>l+c.orientation.angleBound,0),angularRateBound:Math.max(...s.map(Io),...r.map(l=>l.orientation.rateBound)),requiredFractions:o,at(l){let c=Math.max(0,Math.min(1,l))*n;for(let f of r)if(c>=f.entryDistance&&c<=f.exitDistance)return f.path.at((c-i[f.index])/f.path.length);let u=s.length-1;for(let f=0;f<s.length-1;f++)if(c<=i[f+1]){u=f;break}return s[u].at((c-i[u])/s[u].length)}},corners:r,offsets:i,total:n}}function Ll({model:s,start:t,paths:e,radii:n,limits:i,isStateValid:r,options:o={}}){let a=o.cartesianZone?.maxAngularSpeed??1;if(!(Number.isFinite(a)&&a>0))return{status:"invalid_target",reason:"Cartesian ZONE angular speed limit must be positive and finite."};let l=ke(s,r,o.collision??{}),c=null;for(let u=0;u<7;u++){let f=ld(e,n,{trimScale:1/2**u});if(f.status==="invalid_target")return f;if(f.status!=="built"){c=f;continue}let h=f.path,d=Math.min(...n),p=y=>({...y,cornerIndex:y.cornerIndex??(Number.isFinite(y.at)?f.corners.reduce((T,w)=>Math.abs(w.boundaryDistance/h.length-y.at)<Math.abs(f.corners[T].boundaryDistance/h.length-y.at)?w.index:T,0):0)}),m=Math.max(o.timing?.minimumDuration??.01,1.875*h.length*h.angularRateBound/a),v=Math.min(o.cartesian?.translationStep??.01,d/8,.005),_=ze(s,h,{start:t,...l,...o.ik,...o.cartesian,translationStep:v});if(_.status!=="planned"){c=p(_);continue}let g=ge(_.jointPath,i,{model:s,cartesianPath:h,...l,...o.timing,minimumDuration:m,allowInternalStops:!1,pathTolerance:Math.min(o.timing?.pathTolerance??.002,d/10),orientationPathTolerance:Math.min(o.timing?.orientationPathTolerance??.02,1e-4)});for(let y=2;g.status==="geometry_deviation"&&y<=8;y*=2){let T=ze(s,h,{start:t,...l,...o.ik,...o.cartesian,translationStep:v/y,orientationStep:Math.min(o.cartesian?.orientationStep??Math.PI/90,Math.PI/(90*y))});if(T.status!=="planned"){g=T;break}g=ge(T.jointPath,i,{model:s,cartesianPath:h,...l,...o.timing,minimumDuration:m,allowInternalStops:!1,pathTolerance:Math.min(o.timing?.pathTolerance??.002,d/10),orientationPathTolerance:Math.min(o.timing?.orientationPathTolerance??.02,1e-4)}),g.status==="timed"&&(_=T)}if(g.status!=="timed"){c=p(g);continue}if(g.internalStops){c={reason:"Cartesian ZONE chain timing introduced an internal stop."};continue}let S=1.875*h.length*h.angularRateBound/g.duration;if(S>a*(1+1e-9)){c={reason:"Cartesian ZONE chain orientation exceeds its angular speed limit."};continue}let x=[];for(let y of f.corners){let T=N=>g.points.find(z=>Math.abs(z.s-N/h.length)<1e-9),w=T(y.entryDistance),b=T(y.boundaryDistance),C=T(y.exitDistance);if(!w||!b||!C){c={reason:"Timed Cartesian ZONE chain omitted a mandatory corner sample.",cornerIndex:y.index};break}let M=Math.max(...b.velocity.map((N,z)=>Math.abs(N)/i.velocity[z]));if(M<1e-5){c={reason:"Cartesian ZONE chain has zero joint speed at a corner.",cornerIndex:y.index};break}let R=Ht(y.waypoint),P=g.points.filter(N=>N.s>=y.entryDistance/h.length-1e-10&&N.s<=y.exitDistance/h.length+1e-10).reduce((N,z)=>Math.max(N,Ht(ut(s,z.q).position).distanceTo(R)),0);if(P>y.radius+1e-7){c={reason:"Timed TCP leaves a Cartesian ZONE ball.",cornerIndex:y.index};break}let F=Vt(ut(s,b.q),h.at(b.s));if(F.positionError>Math.min(.002,y.radius/10)||F.orientationError>1e-4){c={reason:"Timed Cartesian ZONE corner misses its declared TCP curve.",cornerIndex:y.index};break}x.push({index:y.index,radius:y.radius,entryTime:w.time,boundaryTime:b.time,exitTime:C.time,trimIn:y.trimIn,trimOut:y.trimOut,maxWaypointDistance:P,speedFraction:M,orientationTransitionAngle:y.orientation.relativeAngle})}if(x.length===f.corners.length)return{status:"planned",duration:g.duration,points:g.points,jointPath:_.jointPath,internalStops:!1,corners:x,maxAngularSpeedBound:S,requiredFractions:h.requiredFractions,path:h}}return{status:"zone_infeasible",causeStatus:c?.status??null,cornerIndex:c?.cornerIndex??null,reason:c?.reason??"No Cartesian ZONE chain passed IK, timing, and collision checks."}}function Nl({model:s,start:t,inbound:e,outbound:n,radius:i,limits:r,isStateValid:o,options:a={}}){let l=a.cartesianZone?.maxAngularSpeed??1;if(!(Number.isFinite(l)&&l>0))return{status:"invalid_target",reason:"Cartesian ZONE angular speed limit must be positive and finite."};let c=ke(s,o,a.collision??{}),u=null;for(let f=0;f<7;f++){let h=Il(e,n,i,{trimScale:1/2**f});if(h.status==="invalid_target")return h;if(h.status!=="built"){u??=h;continue}let d=h.path,p=1.875*d.length*d.angularRateBound/l,m=Math.max(a.timing?.minimumDuration??.01,p),v=Math.min(a.cartesian?.translationStep??.01,i/8,.005),_=ze(s,d,{start:t,...c,...a.ik,...a.cartesian,translationStep:v});if(_.status!=="planned"){u=_;continue}let g=ge(_.jointPath,r,{model:s,cartesianPath:d,...c,...a.timing,minimumDuration:m,allowInternalStops:!1,pathTolerance:Math.min(a.timing?.pathTolerance??.002,i/10),orientationPathTolerance:Math.min(a.timing?.orientationPathTolerance??.02,1e-4)});for(let A=2;g.status==="geometry_deviation"&&A<=8;A*=2){let P=ze(s,d,{start:t,...c,...a.ik,...a.cartesian,translationStep:v/A,orientationStep:Math.min(a.cartesian?.orientationStep??Math.PI/90,Math.PI/(90*A))});if(P.status!=="planned"){g=P;break}g=ge(P.jointPath,r,{model:s,cartesianPath:d,...c,...a.timing,minimumDuration:m,allowInternalStops:!1,pathTolerance:Math.min(a.timing?.pathTolerance??.002,i/10),orientationPathTolerance:Math.min(a.timing?.orientationPathTolerance??.02,1e-4)}),g.status==="timed"&&(_.jointPath=P.jointPath)}if(g.status!=="timed"){u=g;continue}if(g.internalStops){u={reason:"Cartesian ZONE timing introduced an internal stop."};continue}let S=1.875*d.length*d.angularRateBound/g.duration;if(S>l*(1+1e-9)){u={reason:"Cartesian ZONE orientation exceeds its angular speed limit."};continue}let x=g.points.find(A=>Math.abs(A.s-d.boundaryFraction)<1e-9);if(!x){u={reason:"Timed Cartesian ZONE omitted its logical boundary."};continue}let y=Math.max(...x.velocity.map((A,P)=>Math.abs(A)/r.velocity[P]));if(y<1e-5){u={reason:"Cartesian ZONE cannot maintain nonzero joint speed through its boundary."};continue}let T=g.points.filter(A=>A.s>=d.entryFraction-1e-10&&A.s<=d.exitFraction+1e-10),w=g.points.find(A=>Math.abs(A.s-d.entryFraction)<1e-9),b=g.points.find(A=>Math.abs(A.s-d.exitFraction)<1e-9);if(!w||!b||!T.length){u={reason:"Timed Cartesian ZONE omitted a mandatory entry or exit sample."};continue}let C=Ht(h.waypoint),M=T.reduce((A,P)=>Math.max(A,Ht(ut(s,P.q).position).distanceTo(C)),0);if(M>i+1e-7){u={reason:"Timed TCP leaves the Cartesian ZONE ball."};continue}let R=Vt(ut(s,x.q),d.at(d.boundaryFraction));if(R.positionError>Math.min(.002,i/10)||R.orientationError>1e-4){u={reason:"Timed Cartesian boundary misses its declared TCP curve."};continue}return{status:"planned",duration:g.duration,points:g.points,jointPath:_.jointPath,internalStops:!1,boundaryTime:x.time,boundaryFraction:d.boundaryFraction,entryTime:w.time,exitTime:b.time,trimIn:h.trimIn,trimOut:h.trimOut,maxWaypointDistance:M,speedFraction:y,maxAngularSpeedBound:S,orientationTransitionAngle:d.orientationTransitionAngle,requiredFractions:d.requiredFractions,path:d}}return{status:"zone_infeasible",causeStatus:u?.status??null,reason:u?.reason??"No Cartesian ZONE candidate passed IK, timing, and collision checks."}}var cd=new H().elements.slice(),Ws=2*Math.PI,se=1e-8,qs=(s,t)=>Array.isArray(s)&&s.length===t&&s.every(Number.isFinite),Lo=s=>[Math.cos(s),Math.sin(s)],Dl=(s,t)=>[s[0]-t[0],s[1]-t[1]],No=s=>Math.hypot(...s),re=(s,t)=>({status:s,reason:t});function Do(s,t){let e=s?.elements?[...s.elements]:s==null?[...cd]:[...s];if(!qs(e,16))throw new Error(`${t} needs a 4x4 finite matrix.`);return e}function Ni(s,t){let e=Do(s,t);for(let n of[0,5,10,15])if(Math.abs(e[n]-1)>se)throw new Error(`${t} must have identity rotation and scale.`);for(let n of[1,2,3,4,6,7,8,9,11,14])if(Math.abs(e[n])>se)throw new Error(`${t} must be an XY translation.`);for(let n of[12,13])if(!Number.isFinite(e[n]))throw new Error(`${t} has invalid coordinates.`);return[e[12],e[13]]}function ud(s){let t=i=>s.get?.(i),e=s.axis?.toArray?s.axis.toArray():s.axis??[1,0,0],n=i=>typeof i=="string"?i:i?.link;return{name:s.name??t("name"),type:s.type??t("type"),parent:n(t("parent"))??n(s.parent),child:n(t("child"))??n(s.child),origin:Do(s.basicMatrix??s.origin??t("basicMatrix"),`Joint ${s.name} origin`),axis:e,lower:Number(s.lower??t("lower")),upper:Number(s.upper??t("upper")),initial:Number(s.theta??t("theta")??0),mimic:s.mimic??t("mimic"),velocity:Number(s.velocity??t("velocity")),acceleration:Number(s.acceleration??t("acceleration"))}}function Fl(s,t,e){let[n,i]=t,r=Number.isFinite(e)?e:(n+i)/2,o=Math.ceil((n-s-1e-10)/Ws),a=Math.floor((i-s+1e-10)/Ws);return o>a?null:s+Math.max(o,Math.min(a,Math.round((r-s)/Ws)))*Ws}function Ul(s,t,e){let n=s[0]*t[1]-s[1]*t[0];return Math.abs(n)<1e-12?null:[(e[0]*t[1]-e[1]*t[0])/n,(s[0]*e[1]-s[1]*e[0])/n]}function Ol({descriptor:s,joints:t,worldFromBase:e,tipLink:n}={}){if(s?.format!=="modelrobot-kinematic-constraints"||s.version!==1||!Array.isArray(s.mechanisms)||s.mechanisms.length!==1)throw new Error("Four-bar needs one version 1 kinematic constraint descriptor.");let i=s.mechanisms[0];if(i?.type!=="planar-four-bar"||![-1,1].includes(i.branch))throw new Error("Four-bar type or assembly branch is invalid.");let r=[i.driverJoint,i.couplerJoint,i.outputJoint];if(r.some(b=>typeof b!="string"||!b)||new Set(r).size!==3||!i.leftClosureLink||!i.rightClosureLink||i.leftClosureLink===i.rightClosureLink)throw new Error("Four-bar joint and closure link names must be distinct.");if(!Array.isArray(t))throw new Error("Four-bar needs URDF joint snapshots.");let o=t.map(ud),a=new Map,l=new Map;for(let b of o){if(!b.name||!b.parent||!b.child||a.has(b.name)||l.has(b.child))throw new Error(`Four-bar needs a uniquely named acyclic cut-tree joint snapshot (${b.name}, ${b.parent}, ${b.child}).`);a.set(b.name,b),l.set(b.child,b)}let c=a.get(r[0]),u=a.get(r[1]),f=a.get(r[2]),h=l.get(i.leftClosureLink),d=l.get(i.rightClosureLink);if(!c||!u||!f||!h||!d||c.parent!==f.parent||u.parent!==c.child||h.parent!==u.child||d.parent!==f.child||h.type!=="fixed"||d.type!=="fixed")throw new Error("Four-bar cut-tree topology must be ground\u2192input\u2192coupler\u2192C_left and ground\u2192output\u2192C_right.");if(o.some(b=>b.type!=="fixed"&&!r.includes(b.name)))throw new Error("Four-bar supports exactly three movable cut-tree joints.");for(let b of[c,u,f]){if(b.type!=="revolute"||b.mimic)throw new Error(`Four-bar joint ${b.name} must be an independent revolute joint.`);if(!qs(b.axis,3)||Math.hypot(...b.axis)<se||Math.abs(b.axis[0])>se||Math.abs(b.axis[1])>se||b.axis[2]<=0)throw new Error(`Four-bar joint ${b.name} needs a +Z axis.`);if(!Number.isFinite(b.lower)||!Number.isFinite(b.upper)||b.lower>b.upper)throw new Error(`Four-bar joint ${b.name} needs finite limits.`)}let p=Ni(c.origin,"Input pivot"),m=Ni(f.origin,"Output pivot"),v=Ni(u.origin,"Coupler pivot"),_=Ni(h.origin,"Left closure pin"),g=Ni(d.origin,"Right closure pin");if(No(p)>se||Math.abs(m[1])>se||Math.abs(v[1])>se||Math.abs(_[1])>se||Math.abs(g[1])>se||[m[0],v[0],_[0],g[0]].some(b=>b<=se))throw new Error("Four-bar frames need A=(0,0) and positive +X dimensions d,a,b,c.");if(n!=null&&n!==i.leftClosureLink&&n!==i.rightClosureLink)throw new Error("Four-bar TCP must be one of the two closure endpoint links.");let S=[c,u,f].map(b=>[b.lower,b.upper]),x=[c,u,f].map(b=>b.initial),y={kind:"planar-four-bar",robot:i.robot??null,baseLink:c.parent,tipLink:n??i.leftClosureLink,branch:i.branch,jointNames:[c.name],expandedJointNames:r,closureLinks:[i.leftClosureLink,i.rightClosureLink],dimensions:{a:v[0],b:_[0],c:g[0],d:m[0]},limits:S,initialJointValues:x,velocityLimits:[c,u,f].map(b=>Number.isFinite(b.velocity)&&b.velocity>0?b.velocity:null),accelerationLimits:[c,u,f].map(b=>Number.isFinite(b.acceleration)&&b.acceleration>0?b.acceleration:null),worldFromBase:Do(e,"Robot base transform")},T=c.initial;(!Number.isFinite(T)||T<c.lower||T>c.upper)&&(T=(c.lower+c.upper)/2);let w=Pe(y,T,{seed:x});if(w.status!=="expanded")for(let b=0;b<=128&&w.status!=="expanded";b++)T=c.lower+(c.upper-c.lower)*b/128,w=Pe(y,T,{seed:x});if(w.status!=="expanded")throw new Error(`Four-bar has no valid home configuration: ${w.reason}`);return y.initial=[T],y.expandedInitial=w.q,y}function Pe(s,t,{seed:e}={}){if(!Number.isFinite(t))return re("invalid_target","Input angle must be finite.");if(t<s.limits[0][0]-1e-10||t>s.limits[0][1]+1e-10)return re("joint_limit","Input angle exceeds driver limits.");let{a:n,b:i,c:r,d:o}=s.dimensions,a=[0,0],l=[o,0],c=Lo(t),u=[n*c[0],n*c[1]],f=Dl(l,u),h=No(f);if(h<=se||h>i+r+1e-12||h<Math.abs(i-r)-1e-12)return re("unreachable","Bar circles do not intersect.");let d=(h*h+i*i-r*r)/(2*h),p=i*i-d*d;if(p<-1e-12)return re("unreachable","Bar circles do not intersect.");let m=Math.sqrt(Math.max(0,p));if(m<=1e-6)return re("toggle","Four-bar is at a toggle singularity.");let v=[f[0]/h,f[1]/h],_=[u[0]+d*v[0]-s.branch*m*v[1],u[1]+d*v[1]+s.branch*m*v[0]],g=Math.atan2(_[1]-u[1],_[0]-u[0]),S=Math.atan2(_[1]-l[1],_[0]-l[0]),x=Array.isArray(e)&&e.length===3?e:s.expandedInitial??s.initialJointValues,y=Fl(g-t,s.limits[1],x?.[1]),T=Fl(S,s.limits[2],x?.[2]);if(y==null||T==null)return re("joint_limit","Passive joint angle exceeds URDF limits.");let w=Lo(t+y),b=Lo(T),C=[u[0]+i*w[0],u[1]+i*w[1]],M=[l[0]+r*b[0],l[1]+r*b[1]],R=No(Dl(C,M));if(R>1e-7)return re("closure","Cut-tree endpoint positions do not close.");let A=[-i*w[1],i*w[0]],P=[r*b[1],-r*b[0]],F=Ul(A,P,[n*c[1],-n*c[0]]);if(!F)return re("toggle","Passive velocity Jacobian is singular.");let N=Ul(A,P,[n*c[0]+i*w[0]*F[0]**2-r*b[0]*F[1]**2,n*c[1]+i*w[1]*F[0]**2-r*b[1]*F[1]**2]);return N?{status:"expanded",theta:t,q:[t,y,T],phi:t+y,psi:T,points:{A:a,B:u,C,D:l,Cleft:C,Cright:M},closureResidual:R,ratePerTheta:[1,F[0]-1,F[1]],secondPerTheta2:[0,N[0],N[1]],branch:s.branch}:re("toggle","Passive acceleration Jacobian is singular.")}function hd(s,t,e={}){let n=Pe(s,t,e);if(n.status!=="expanded")return n;let i=new H().fromArray(s.worldFromBase),r=new E(n.points.C[0],n.points.C[1],0).applyMatrix4(i),o=new J().setFromRotationMatrix(i),a=s.tipLink===s.closureLinks[0]?n.phi:n.psi,l=o.multiply(new J().setFromAxisAngle(new E(0,0,1),a));return{status:"expanded",position:r.toArray(),quaternion:l.toArray(),q:n.q,theta:t,closureResidual:n.closureResidual}}function Bl(s,t,e={}){if(!qs(t?.position,3)||!qs(t?.quaternion,4)||Math.hypot(...t.quaternion)<1e-12)return re("invalid_target","Target needs a finite position and nonzero quaternion.");let n=e.positionTolerance??1e-4,i=e.orientationTolerance??.001,r=e.orientationWeight??.25,o=e.samples??512;if(![n,i,r].every(v=>Number.isFinite(v)&&v>0)||!Number.isInteger(o)||o<8)return re("invalid_target","IK search options are invalid.");let[a,l]=s.limits[0],c=Array.isArray(e.seed)?e.seed[0]:e.seed??s.initial[0],u=v=>{let _=hd(s,v);if(_.status!=="expanded")return null;let g=Vt(_,t);return{theta:v,pose:_,residual:g,score:Math.hypot(g.positionError,r*g.orientationError)}},f=Array.from({length:o+1},(v,_)=>u(a+(l-a)*_/o)),h=f.filter(Boolean).sort((v,_)=>v.score-_.score).slice(0,12);if(Number.isFinite(c)){let v=u(Math.max(a,Math.min(l,c)));v&&h.push(v)}for(let v=1;v<o;v++){if(!f[v]||f[v-1]&&f[v-1].score<f[v].score||f[v+1]&&f[v+1].score<f[v].score)continue;let _=a+(l-a)*(v-1)/o,g=a+(l-a)*(v+1)/o;for(let x=0;x<90;x++){let y=_+(g-_)*.3819660112501051,T=g-(g-_)*.3819660112501051,w=u(y)?.score??1/0,b=u(T)?.score??1/0;w<b?g=T:_=y}let S=u((_+g)/2);S&&h.push(S)}if(!h.length)return re("unreachable","No valid four-bar configuration exists in the driver limits.");h.sort((v,_)=>v.score-_.score||Math.abs(v.theta-c)-Math.abs(_.theta-c));let d=e.isStateValid??(()=>!0),p=!1;for(let v of h)if(!(v.residual.positionError>n||v.residual.orientationError>i)){if(!d([v.theta],v)){p=!0;continue}return{status:"reached",theta:v.theta,q:[v.theta],expandedQ:v.pose.q,pose:{position:v.pose.position,quaternion:v.pose.quaternion},positionError:v.residual.positionError,orientationError:v.residual.orientationError}}let m=h[0];return{status:p?"collision":"unreachable",reason:p?"The target pose is reachable only in a disallowed state.":"No four-bar configuration met the full pose tolerances.",theta:m.theta,q:[m.theta],expandedQ:m.pose.q,pose:{position:m.pose.position,quaternion:m.pose.quaternion},positionError:m.residual.positionError,orientationError:m.residual.orientationError}}var Pt=(s,t,e)=>({status:"error",diagnostics:[{line:s,column:1,code:t,message:e}]}),fd=s=>{let t=Math.floor(s),e=Math.round((s-t)*1e9);return{sec:t+Math.floor(e/1e9),nanosec:e%1e9}},ln=(s,t)=>{let e=Pe(s,t);if(e.status!=="expanded")throw new Error(e.reason||`Four-bar closure failed at ${t} rad (${e.status}).`);return e};function dd(s,t){let e=i=>{let r=Pe(s,i[0]);return r.status==="expanded"&&t.isStateValid(r.q)};return{isStateValid:e,isEdgeValid:(i,r)=>{if(!e(i)||!e(r))return!1;let o=Math.sign(r[0]-i[0]);if(!o)return!0;let a=i[0],l=ln(s,a),c=0;for(;o*(r[0]-a)>1e-12;){if(++c>1e5)throw new Error("Four-bar collision edge exceeds the sample budget.");let u=Math.max(1,...l.ratePerTheta.map(Math.abs)),f=Math.min(.005,.02/u,Math.abs(r[0]-a)),h=null;for(let d=0;d<24;d++){if(h=Pe(s,a+o*f),h.status!=="expanded")return!1;if(h.q.every((p,m)=>Math.abs(p-l.q[m])<=.020000000100000002))break;f/=2}if(!h?.q.every((d,p)=>Math.abs(d-l.q[p])<=.020000000100000002))throw new Error("Four-bar collision edge cannot be sampled at the requested angular resolution.");if(a+=o*f,l=h,!t.isStateValid(h.q))return!1}return!0}}}function pd(s,t,e,n){if(!s)throw new Error("Missing pose target.");let i=n.getFrameWorld(s.frame,ln(e,t).q),r=new H().compose(new E(...s.position),new J(...s.quaternion),new E(1,1,1)),o=i.clone().multiply(r),a=new E,l=new J,c=new E;return o.decompose(a,l,c),{position:a.toArray(),quaternion:l.toArray()}}function zl(s,t){let{robotName:e,robotRoot:n,jointModels:i,robotXml:r,robotCollisionShapes:o,sceneModel:a,meshGeometry:l,motionLimits:c={},planningOptions:u={},kinematicConstraints:f}=t;if(!s?.ok)return{status:"error",diagnostics:s?.diagnostics||[]};let h=f?.mechanisms?.[0];if(!h||h.type!=="planar-four-bar"||h.robot!==e)return Pt(1,"FOUR_BAR_DESCRIPTOR","The active robot has no matching planar four-bar descriptor.");let d,p,m,v,_,g,S=null,x=0,y=[],T=[],w=[],b=[];try{for(let M of s.steps){if(M.kind==="ROBOT"){if(M.args[0]!==e)return Pt(M.line,"UNKNOWN_ROBOT",`Loaded robot is ${e}; program selected ${M.args[0]}.`);continue}if(M.kind==="TOOL"){if(d&&S!==M.args[0])return Pt(M.line,"TOOL_CHANGE","Changing the TCP link within one program is unsupported.");if(d)continue;S=M.args[0],a.getFrame(`robot/${e}/link/${S}`),n.updateWorldMatrix(!0,!1),d=Ol({descriptor:f,joints:i,worldFromBase:n.matrixWorld,tipLink:S}),g=d.initial[0];let O=ln(d,g),L={..._s({joints:i,tipLink:S,worldFromBase:n.matrixWorld}),active:[0,1,2],jointNames:[h.driverJoint,h.couplerJoint,h.outputJoint],initial:O.q};p=Hs({robotName:e,robotModel:L,allJoints:i,robotCollisionShapes:o??Ii(r),sceneModel:a,meshGeometry:l,allowedCollisionPairs:[[h.leftClosureLink,h.rightClosureLink]]});let V=i.find(lt=>(lt.name??lt.get?.("name"))===h.driverJoint);m={joints:[{name:h.driverJoint,type:V.type,lower:Number(V.lower),upper:Number(V.upper)}],active:[0],jointNames:[h.driverJoint],initial:[g]},v=Li(m,i,c);let tt={...m,joints:[h.driverJoint,h.couplerJoint,h.outputJoint].map(lt=>({name:lt,type:"revolute"})),active:[0,1,2],jointNames:[h.driverJoint,h.couplerJoint,h.outputJoint]};if(_=Li(tt,i,c),!p.isStateValid(O.q))return Pt(M.line,"SCENE_COLLISION","The closed initial four-bar collides with the scene.");y.push({time:0,q:[g],velocity:[0],acceleration:[0]}),b.push({time:0,q:O.q,closureResidual:O.closureResidual});continue}if(!d)return Pt(M.line,"TOOL_REQUIRED",`Select a TCP link with TOOL before ${M.kind}.`);if(M.kind==="ZONE"){if(M.radius>0)return Pt(M.line,"FOUR_BAR_ZONE","ZONE blending for a constrained four-bar is not available; use ZONE 0.");continue}if(M.kind==="PAUSE"){M.seconds>0&&(x+=M.seconds,y.push({time:x,q:[g],velocity:[0],acceleration:[0]}),b.push({time:x,q:ln(d,g).q,closureResidual:0}));continue}if(M.kind==="GRAB"||M.kind==="RELEASE"){let O=ln(d,g).q,U=M.args[0],L=p.snapshot().find(V=>V.name===U)?.attachment;if(M.kind==="GRAB"){if(L?.startsWith("model/"))return Pt(M.line,"GRAB_JOINED",`${U} is joined to another scene model.`);let V=new E().setFromMatrixPosition(p.getFrameWorld("tool",O)),tt=p.distanceToObject(U,V,O);if(tt>.04)return Pt(M.line,"GRASP_DISTANCE",`GRAB ${U} is ${tt.toFixed(3)} m from the TCP; reach within 0.040 m.`);p.attach(U,"tool",O)}else{if(!(L==="tool"||L?.startsWith("robot/")))return Pt(M.line,"RELEASE_NOT_HELD",`${U} is not held by the robot.`);p.release(U,O)}if(!p.isStateValid(O))return Pt(M.line,"SCENE_COLLISION",`${M.kind} ${U} would leave the scene in collision.`);T.push({time:x,kind:M.kind,object:U,frame:`robot/${e}/link/${S}`,line:M.line});continue}if(M.kind!=="MOVEJ")return Pt(M.line,"FOUR_BAR_PATH",`${M.kind} requires a Cartesian path on the four-bar manifold; this command is not supported for the constrained mechanism.`);let R=M.args[0],A=s.joints.get(R),P;if(A){let O=Object.keys(A.values);if(O.length!==1||O[0]!==h.driverJoint)return Pt(M.line,"FOUR_BAR_JOINT_TARGET",`JOINTS ${R} must specify only ${h.driverJoint}; passive joints are solved by closure.`);P=A.values[h.driverJoint]}else{let O=pd(s.poses.get(R),g,d,p),U=Bl(d,O,{seed:g,isStateValid:L=>{let V=Array.isArray(L)?L[0]:L,tt=Pe(d,V);return tt.status==="expanded"&&p.isStateValid(tt.q)},...u.ik});if(U.status!=="reached")return Pt(M.line,"FOUR_BAR_IK",`MOVEJ ${R}: ${U.reason||U.status}.`);P=Array.isArray(U.q)?U.q[0]:U.theta}let F=Pe(d,P);if(F.status!=="expanded")return Pt(M.line,"FOUR_BAR_CLOSURE",F.reason||`The target angle ${P} cannot close the four-bar.`);let N=dd(d,p),z=xs(m,[g],[P],{...N,...u.ptp});if(z.status!=="planned")return Pt(M.line,`FOUR_BAR_${z.status.toUpperCase()}`,`MOVEJ: ${z.reason||z.status}.`);let G=ge(z.jointPath,v,{model:m,...N,allowInternalStops:!0,...u.timing});if(G.status!=="timed")return Pt(M.line,`FOUR_BAR_${G.status.toUpperCase()}`,`MOVEJ: ${G.reason||G.status}.`);let I=1,D=O=>{let U=ln(d,O.q[0]);for(let L=0;L<3;L++){let V=U.ratePerTheta[L]*O.velocity[0],tt=U.ratePerTheta[L]*O.acceleration[0]+U.secondPerTheta2[L]*O.velocity[0]**2;I=Math.max(I,Math.abs(V)/_.velocity[L],Math.sqrt(Math.abs(tt)/_.acceleration[L]))}};for(let O of G.points)D(O);for(let O=1;O<G.points.length;O++){let U=G.points[O-1],L=G.points[O];for(let V of[.25,.5,.75])D(tn(U,L,U.time+(L.time-U.time)*V))}I*=1.02;let B=x;for(let O of G.points.slice(1)){let U={time:x+O.time*I,q:[...O.q],velocity:O.velocity.map(V=>V/I),acceleration:O.acceleration.map(V=>V/I**2)},L=ln(d,U.q[0]);y.push(U),b.push({time:U.time,q:L.q,closureResidual:L.closureResidual})}x+=G.duration*I,g=P,w.push({line:M.line,type:"PTP",startTime:B,endTime:x,duration:x-B,jointPath:z.jointPath,constrained:!0})}if(!d||!y.length)return Pt(1,"NO_ROBOT","Select a robot and TOOL link.");if(!w.length)return Pt(1,"NO_MOTION","Program has no MOVEJ command.");let C={header:{frame_id:"world"},joint_names:[h.driverJoint],points:y.map(M=>({positions:[...M.q],velocities:[...M.velocity],accelerations:[...M.acceleration],time_from_start:fd(M.time)}))};return{status:"planned",model:d,constrained:!0,samples:y,expandedTrace:b,events:T,plans:w,zoneBlends:[],cartesianZoneBlends:[],weld:{segments:[],events:[]},processTrajectory:{header:{frame_id:"world"},events:[],segments:[]},duration:x,trajectory:C,limitDetails:_.details,diagnostics:[]}}catch(C){return Pt(s.steps.findLast(M=>M.kind==="MOVEJ")?.line||1,"FOUR_BAR_PLAN",C.message)}finally{p?.dispose()}}function cn(s,t,e){let n=e.getFrameWorld(s.frame,t),i=new H().compose(new E(...s.position),new J(...s.quaternion),new E(1,1,1)),r=n.clone().multiply(i),o=new E,a=new J,l=new E;return r.decompose(o,a,l),{position:o.toArray(),quaternion:a.toArray()}}function j(s,t,e){return{status:"error",diagnostics:[{line:s,column:1,code:t,message:e}]}}function md(s){let t=Math.floor(s),e=Math.round((s-t)*1e9);return{sec:t+Math.floor(e/1e9),nanosec:e%1e9}}var Xs=1.45;function gd(s){let t=new Set,e=0,n=null;for(let i of s){if(i.kind==="ZONE"){e=i.radius;continue}i.kind==="MOVEJ"?(n&&n.zone>0&&e>0&&(t.add(n.line),t.add(i.line)),n={line:i.line,zone:e}):n=null}return t}function Fo(s,t,e,n){let i=e,r=n,o=t+1;for(;s[o]?.kind==="ZONE";)i=s[o].radius,r=s[o].line,o++;return["MOVEL","MOVEC"].includes(s[o]?.kind)?{step:s[o],index:o,zone:i,zoneLine:r}:null}function kl(s,{robotName:t,robotRoot:e,jointModels:n,robotXml:i,robotCollisionShapes:r,sceneModel:o,meshGeometry:a,motionLimits:l={},planningOptions:c={},kinematicConstraints:u=null}){if(!s?.ok)return{status:"error",diagnostics:s?.diagnostics||[{line:1,code:"PROGRAM",message:"Compile the program first."}]};if(u)return zl(s,{robotName:t,robotRoot:e,jointModels:n,robotXml:i,robotCollisionShapes:r,sceneModel:o,meshGeometry:a,motionLimits:l,planningOptions:c,kinematicConstraints:u});let f=[...n],h=gd(s.steps),d=null,p=null,m=null,v=null,_=null,g=0,S=1,x=!1,y=null,T=0,w=0,b=0,C=!1,M=[],R=[],A=[],P=[],F=[],N=[],z=[],G=[],I=[];try{for(let U=0;U<s.steps.length;U++){let L=s.steps[U];if(S=L.line,x&&!["MOVEL","MOVEC","WELD"].includes(L.kind))return j(L.line,"WELD_MOTION",`Only MOVEL or MOVEC is allowed while WELD is ON; switch it OFF before ${L.kind}.`);if(L.kind==="ROBOT"){if(L.args[0]!==t)return j(L.line,"UNKNOWN_ROBOT",`Loaded robot is ${t}; program selected ${L.args[0]}.`);C=!1;continue}if(L.kind==="ZONE"){if(!(Number.isFinite(L.radius)&&L.radius>=0&&L.radius<=.2))return j(L.line,"ZONE_RANGE","ZONE radius must be from 0 through 0.2 m.");w=L.radius,b=L.line;continue}if(L.kind==="TOOL"){if(p&&L.args[0]!==d)return j(L.line,"TOOL_CHANGE","Changing the TCP link within one program is not supported yet.");if(p){C=!1;continue}d=L.args[0],o.getFrame(`robot/${t}/link/${d}`),e.updateWorldMatrix(!0,!1),p=_s({joints:f,tipLink:d,worldFromBase:e.matrixWorld}),_=[...p.initial];let W=r??Ii(i);m=Hs({robotName:t,robotModel:p,allJoints:f,robotCollisionShapes:W,sceneModel:o,meshGeometry:a}),v=Li(p,f,l),M.push({time:0,q:[..._],velocity:_.map(()=>0),acceleration:_.map(()=>0)}),C=!1;continue}if(!p||!m)return j(L.line,"TOOL_REQUIRED",`Select a TCP link with TOOL name before ${L.kind}.`);if(L.kind==="WELD"){if(C=!1,L.state!=="ON"&&L.state!=="OFF")return j(L.line,"WELD_SYNTAX","Use WELD ON object or WELD OFF.");if(L.state==="ON"===x)return j(L.line,"WELD_STATE",`WELD is already ${x?"ON":"OFF"}.`);if(L.state==="ON"){if(!L.object)return j(L.line,"WELD_SYNTAX","WELD ON needs a scene object.");let W=ut(p,_).position,q;try{q=m.distanceToObjectSurface(L.object,W,_)}catch(wt){return j(L.line,"WELD_OBJECT",wt.message)}if(q>.04)return j(L.line,"WELD_DISTANCE",`WELD ON ${L.object} is ${q.toFixed(3)} m from the TCP; stay within 0.040 m of its collision surface.`);y=L.object,T=0}else T&&I.push(y);x=L.state==="ON",G.push({time:g,kind:x?"WELD_ON":"WELD_OFF",line:L.line,object:y,frame:`robot/${t}/link/${d}`,pose:ut(p,_)}),x||(y=null,T=0);continue}if(L.kind==="WELD_JOIN"){C=!1;let{child:W,parent:q}=L;if(!W||!q||W===q)return j(L.line,"WELD_JOIN","WELD JOIN needs distinct child and parent scene objects.");let wt=I.findLastIndex(ct=>ct===W||ct===q);if(wt<0)return j(L.line,"WELD_SEAM_REQUIRED","WELD JOIN needs a completed seam involving its child or parent.");let vt=m.snapshot().find(ct=>ct.name===W)?.attachment;if(vt?.startsWith("model/"))return j(L.line,"WELD_ALREADY_JOINED",`${W} is already joined to ${vt}; an already joined child cannot be joined again.`);let un=ut(p,_).position,hn,fn;try{hn=m.distanceToObjectSurface(W,un,_),fn=m.distanceToObjectSurface(q,un,_)}catch(ct){return j(L.line,"WELD_JOIN",ct.message)}if(hn>.04||fn>.04)return j(L.line,"WELD_JOIN_DISTANCE",`WELD JOIN ${W} ${q} needs the TCP within 0.040 m of both collision surfaces; distances are ${hn.toFixed(3)} m and ${fn.toFixed(3)} m.`);let Yn=`model/${q}`;try{m.attach(W,Yn,_)}catch(ct){return j(L.line,"WELD_JOIN",ct.message)}if(!m.isStateValid(_))return j(L.line,"SCENE_COLLISION",`WELD JOIN ${W} ${q} would leave the assembly in collision.`);I.splice(wt,1),R.push({time:g,kind:"WELD_JOIN",object:W,child:W,parent:q,frame:Yn,line:L.line}),G.push({time:g,kind:"WELD_JOIN",line:L.line,object:W,child:W,parent:q,frame:Yn,pose:ut(p,_)});continue}if(L.kind==="PAUSE"){C=!1,L.seconds>0&&(g+=L.seconds,M.push({time:g,q:[..._],velocity:_.map(()=>0),acceleration:_.map(()=>0)}));continue}if(L.kind==="GRAB"||L.kind==="RELEASE"){C=!1;let W=L.args[0],q=m.snapshot().find(wt=>wt.name===W)?.attachment;if(L.kind==="GRAB"){if(q?.startsWith("model/"))return j(L.line,"GRAB_JOINED",`GRAB ${W} would separate it from ${q}; grab the assembly parent instead.`);let wt=new E().setFromMatrixPosition(m.getFrameWorld("tool",_)),vt=m.distanceToObject(W,wt,_);if(vt>.04)return j(L.line,"GRASP_DISTANCE",`GRAB ${W} is ${vt.toFixed(3)} m from the TCP; bring the TCP within 0.040 m of its collision surface.`);m.attach(W,"tool",_)}else{if(q?.startsWith("model/"))return j(L.line,"RELEASE_JOINED",`RELEASE ${W} would separate it from ${q}; release the assembly parent instead.`);if(!(q==="tool"||q?.startsWith("robot/")))return j(L.line,"RELEASE_NOT_HELD",`RELEASE ${W} requires an object attached to the robot tool.`);m.release(W,_)}if(!m.isStateValid(_))return j(L.line,"SCENE_COLLISION",`${L.kind} ${W} would leave the robot or carried object in collision.`);R.push({time:g,kind:L.kind,object:W,frame:`robot/${t}/link/${d}`,line:L.line});continue}let V,tt;if(L.kind==="MOVEJ"){let W=L.args[0],q=s.joints.get(W);if(q){let wt=Object.keys(q.values);if(wt.length!==p.jointNames.length||wt.some(vt=>!p.jointNames.includes(vt)))return j(L.line,"JOINT_TARGET",`JOINTS ${W} must name every active joint in ${p.jointNames.join(", ")}.`);V=p.jointNames.map(vt=>q.values[vt])}else V=cn(s.poses.get(W),_,m)}else V=cn(s.poses.get(L.args.at(-1)),_,m),L.kind==="MOVEC"&&(tt=cn(s.poses.get(L.args[0]),_,m));let lt=L.kind==="MOVEJ"?"PTP":L.kind==="MOVEL"?"LIN":"CIRC",et=lt!=="PTP"&&w>0?Fo(s.steps,U,w,b):null;if(et?.zone>0){if(x)return j(b||L.line,"ZONE_WELD_UNSUPPORTED","Cartesian ZONE flybys are not supported while a weld seam is active.");if(Fo(s.steps,et.index,et.zone,et.zoneLine)?.zone>0){let ht=[{step:L,index:U,zone:w,zoneLine:b}],dn={step:L,index:U,zone:w,zoneLine:b};for(;;){let X=Fo(s.steps,dn.index,dn.zone,dn.zoneLine);if(!X||!(X.zone>0))break;ht.push(X),dn=X}let $s=[],Uo=[],Fi=[..._],Zs=ut(p,_);for(let X=0;X<ht.length;X++){let Et=ht[X],ae=Et.step.kind==="MOVEL"?"LIN":"CIRC",ye,Ie;try{ye=X?cn(s.poses.get(Et.step.args.at(-1)),Fi,m):V,Ie=X&&Et.step.kind==="MOVEC"?cn(s.poses.get(Et.step.args[0]),Fi,m):tt,$s.push(ae==="LIN"?In(Zs,ye):Ln(Zs,Ie,ye))}catch(me){return j(Et.step.line,"CARTESIAN_TARGET",`${Et.step.kind}: ${me.message}`)}if((ht[X+1]?.step?.args.map(me=>s.poses.get(me)?.frame)??[]).some(me=>me!=="world")){let me=Pn(p,ye,{...c.ik,seed:Fi});if(me.status!=="reached")return j(Et.step.line,"IK_FAILED",`${ae}: nominal waypoint cannot resolve a following frame: ${me.reason||me.status}.`);Fi=[...me.q]}Zs=$s.at(-1).at(1),X&&Uo.push(Math.min(ht[X-1].zone,Et.zone))}let Qt=Ll({model:p,start:_,paths:$s,radii:Uo,limits:v,isStateValid:m.isStateValid,options:c});if(Qt.status!=="planned"){let X=Qt.cornerIndex??0,Et=ht[X],ae=ht[X+1],ye=ae.zone<Et.zone?ae.zoneLine:Et.zoneLine,Ie=X?ae.step.line:ye||ae.step.line;return j(Ie,Qt.causeStatus==="collision"?"ZONE_COLLISION":"ZONE_INFEASIBLE",`Cartesian ZONE after ${Et.step.kind} on line ${Et.step.line}: ${Qt.reason||Qt.status}.`)}let Ui=g;for(let X of Qt.points.slice(1))M.push({time:g+X.time,q:[...X.q],velocity:[...X.velocity],acceleration:[...X.acceleration]});g+=Qt.duration,_=[...Qt.points.at(-1).q];let Xe=Qt.corners.map((X,Et)=>({afterLine:ht[Et].step.line,beforeLine:ht[Et+1].step.line,radius:X.radius,entryTime:Ui+X.entryTime,boundaryTime:Ui+X.boundaryTime,exitTime:Ui+X.exitTime,maxWaypointDistance:X.maxWaypointDistance,speedFraction:X.speedFraction,maxAngularSpeedBound:Qt.maxAngularSpeedBound,orientationTransitionAngle:X.orientationTransitionAngle,requiredFractions:Qt.requiredFractions}));N.push(...Xe);for(let X=0;X<ht.length;X++){let Et=X?Xe[X-1].boundaryTime:Ui,ae=X<Xe.length?Xe[X].boundaryTime:g,ye=ht[X].step.kind==="MOVEL"?"LIN":"CIRC",Ie={line:ht[X].step.line,type:ye,startTime:Et,endTime:ae,duration:ae-Et,jointPath:Qt.jointPath};X&&(Ie.cartesianZoneBlendIn=Xe[X-1]),X<Xe.length&&(Ie.cartesianZoneBlendOut=Xe[X]),A.push(Ie),P.push({line:ht[X].step.line,type:ye,startTime:Et,endTime:ae,zoneRadius:ht[X].zone,zoneLine:ht[X].zoneLine,canBlendBefore:X?!0:C})}C=!0,w=ht.at(-1).zone,b=ht.at(-1).zoneLine,U=ht.at(-1).index;continue}let q=io({type:lt,model:p,start:_,goal:V,via:tt,limits:v,isStateValid:m.isStateValid,options:c});if(q.status!=="planned")return j(L.line,q.status.toUpperCase(),`${lt}: ${q.reason||q.result?.reason||q.status}.`);let wt=q.points.at(-1).q,vt=et.step,un=lt==="LIN"?In(ut(p,_),V):Ln(ut(p,_),tt,V),hn;try{let ht=cn(s.poses.get(vt.args.at(-1)),wt,m),dn=vt.kind==="MOVEC"?cn(s.poses.get(vt.args[0]),wt,m):null;hn=vt.kind==="MOVEL"?In(un.at(1),ht):Ln(un.at(1),dn,ht)}catch(ht){return j(vt.line,"CARTESIAN_TARGET",`${vt.kind}: ${ht.message}`)}let fn=Math.min(w,et.zone),Yn=et.zone<w?et.zoneLine:b,ct=Nl({model:p,start:_,inbound:un,outbound:hn,radius:fn,limits:v,isStateValid:m.isStateValid,options:c});if(ct.status!=="planned")return j(Yn||L.line,ct.causeStatus==="collision"?"ZONE_COLLISION":"ZONE_INFEASIBLE",`Cartesian ZONE after ${L.kind} on line ${L.line}: ${ct.reason||ct.status}.`);let Di=g,$n=g+ct.boundaryTime;for(let ht of ct.points.slice(1))M.push({time:g+ht.time,q:[...ht.q],velocity:[...ht.velocity],acceleration:[...ht.acceleration]});g+=ct.duration,_=[...ct.points.at(-1).q];let Ys={afterLine:L.line,beforeLine:vt.line,radius:fn,entryTime:Di+ct.entryTime,boundaryTime:$n,exitTime:Di+ct.exitTime,maxWaypointDistance:ct.maxWaypointDistance,speedFraction:ct.speedFraction,maxAngularSpeedBound:ct.maxAngularSpeedBound,orientationTransitionAngle:ct.orientationTransitionAngle,requiredFractions:ct.requiredFractions};N.push(Ys),A.push({line:L.line,type:lt,startTime:Di,endTime:$n,duration:ct.boundaryTime,jointPath:ct.jointPath,cartesianZoneBlendOut:Ys}),A.push({line:vt.line,type:vt.kind==="MOVEL"?"LIN":"CIRC",startTime:$n,endTime:g,duration:ct.duration-ct.boundaryTime,jointPath:ct.jointPath,cartesianZoneBlendIn:Ys}),P.push({line:L.line,type:lt,startTime:Di,endTime:$n,zoneRadius:w,zoneLine:b,canBlendBefore:C}),P.push({line:vt.line,type:vt.kind==="MOVEL"?"LIN":"CIRC",startTime:$n,endTime:g,zoneRadius:et.zone,zoneLine:et.zoneLine,canBlendBefore:!0}),C=!0,w=et.zone,b=et.zoneLine,U=et.index;continue}let pt=io({type:lt,model:p,start:_,goal:V,via:tt,limits:v,isStateValid:m.isStateValid,options:c});if(pt.status!=="planned")return j(L.line,pt.status.toUpperCase(),`${lt}: ${pt.reason||pt.result?.reason||pt.status}.`);if(lt==="PTP"&&h.has(L.line)){pt.duration*=Xs;for(let W of pt.points)W.time*=Xs,W.velocity=W.velocity.map(q=>q/Xs),W.acceleration=W.acceleration.map(q=>q/Xs**2)}let jt=g,oe=null;if(x){oe=[];for(let W of pt.points){let q=ut(p,W.q),wt=jt+W.time,vt=m.distanceToObjectSurface(y,q.position,W.q);if(vt>.04)return j(L.line,"WELD_DISTANCE",`${lt} leaves ${y}'s collision surface by ${vt.toFixed(3)} m at ${wt.toFixed(3)} s; stay within 0.040 m.`);oe.push({time:wt,...q})}}for(let W of pt.points.slice(1))M.push({time:g+W.time,q:[...W.q],velocity:[...W.velocity],acceleration:[...W.acceleration]});g+=pt.duration,_=[...pt.points.at(-1).q],A.push({line:L.line,type:lt,startTime:jt,endTime:g,duration:pt.duration,jointPath:pt.jointPath,internalStops:pt.internalStops}),P.push({line:L.line,type:lt,startTime:jt,endTime:g,zoneRadius:w,zoneLine:b,canBlendBefore:C});let Bt=P.at(-2),Wt=P.at(-1);if(Bt&&Wt.canBlendBefore&&Bt.type==="PTP"&&Wt.type==="PTP"){let W=Math.min(Bt.zoneRadius,Wt.zoneRadius);if(W>0){let q=Pl(M,{boundaryTime:Bt.endTime,leftStart:Bt.startTime,rightEnd:Wt.endTime,radius:W,model:p,limits:v,isStateValid:m.isStateValid,collisionOptions:c.collision});if(q.status!=="blended")return j(Bt.zoneLine||Bt.line,"ZONE_INFEASIBLE",`ZONE after MOVEJ on line ${Bt.line}: ${q.reason}`);M.splice(0,M.length,...q.samples);let wt={afterLine:Bt.line,beforeLine:Wt.line,radius:W,entryTime:q.entryTime,waypointTime:q.waypointTime,exitTime:q.exitTime,waypointDeviation:q.waypointDeviation,cornerSpeedFraction:q.cornerSpeedFraction};F.push(wt),A.at(-2).zoneBlendOut=wt,A.at(-1).zoneBlendIn=wt}}C=!0,x&&(z.push({line:L.line,type:lt,object:y,startTime:jt,endTime:g,samples:oe}),T++)}if(x)return j(S,"WELD_UNCLOSED","End the weld path with WELD OFF.");if(!p||!M.length)return j(1,"NO_ROBOT","Select a robot and TOOL link to plan this program.");if(!A.length)return j(1,"NO_MOTION","Program has no movement command.");let D={header:{frame_id:"world"},joint_names:[...p.jointNames],points:M.map(U=>({positions:[...U.q],velocities:[...U.velocity],accelerations:[...U.acceleration],time_from_start:md(U.time)}))};return{status:"planned",model:p,samples:M,events:R,plans:A,zoneBlends:F,cartesianZoneBlends:N,duration:g,trajectory:D,weld:{segments:z,events:G},processTrajectory:{header:{frame_id:"world"},events:G,segments:z},limitDetails:v.details,diagnostics:[]}}catch(D){return j(S,"PREFLIGHT",D.message)}finally{m?.dispose()}}function Vl(s){let t=r=>new H().fromArray(r),e={scene:{updateMatrixWorld(){}},models:new Map(s.scene.models.map(r=>[r.name,{group:{matrixWorld:t(r.world)}}])),frames:new Map(s.scene.frames.map(r=>[r.name,{matrixWorld:t(r.world)}])),collisionEntries:s.scene.collisionEntries.map(r=>({model:r.model,link:r.link,geometry:r.geometry,frame:{matrixWorld:t(r.world)}})),attached:new Map(s.scene.attached),robotMountRecord(r){let o=s.scene.robotMount??null;return o&&(!r||r===o.robot)?structuredClone(o):null},getFrame(r){if(r.startsWith(`robot/${s.robotName}/link/`)&&s.joints.some(o=>o.child===r.split("/").at(-1)||o.parent===r.split("/").at(-1)))return!0;throw new Error(`Unknown robot frame ${r}.`)}},n=new Map(s.scene.meshes.map(([r,o])=>{let a=new Ee;return a.setAttribute("position",new Lt(o.positions,3)),o.indices&&a.setIndex([...o.indices]),[r,a]})),i={matrixWorld:t(s.worldFromBase),updateWorldMatrix(){}};return{robotName:s.robotName,robotRoot:i,jointModels:s.joints,robotCollisionShapes:s.robotCollisionShapes,sceneModel:e,meshGeometry:r=>n.get(r),motionLimits:s.motionLimits,planningOptions:s.planningOptions,kinematicConstraints:s.kinematicConstraints??null,dispose:()=>{for(let r of n.values())r.dispose()}}}function Gl(s,t){let e=Vl(t);try{return kl(s,e)}finally{e.dispose()}}self.onmessage=s=>{let{id:t,compiled:e,snapshot:n}=s.data;try{self.postMessage({id:t,result:Gl(e,n)})}catch(i){self.postMessage({id:t,result:{status:"error",diagnostics:[{line:1,column:1,code:"WORKER_PREFLIGHT",message:i?.message??String(i)}]}})}};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
