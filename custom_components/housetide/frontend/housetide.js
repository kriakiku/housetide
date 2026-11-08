var ir=globalThis,qr=ir.ShadowRoot&&(ir.ShadyCSS===void 0||ir.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Br=Symbol(),Ti=new WeakMap;class Wr{constructor(e,t,r){if(this._$cssResult$=!0,r!==Br)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(qr&&e===void 0){let r=t!==void 0&&t.length===1;if(r)e=Ti.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),r)Ti.set(t,e)}}return e}toString(){return this.cssText}}var il=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},ol=(e)=>new Wr(typeof e==="string"?e:String(e),void 0,Br),F=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((n,s,a)=>n+il(s)+e[a+1],e[0]);return new Wr(r,e,Br)},Si=(e,t)=>{if(qr)e.adoptedStyleSheets=t.map((r)=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let n=document.createElement("style"),s=ir.litNonce;if(s!==void 0)n.setAttribute("nonce",s);n.textContent=r.cssText,e.appendChild(n)}},sl=(e)=>{let t="";for(let r of e.cssRules)t+=r.cssText;return ol(t)},jr=qr?(e)=>e:(e)=>e instanceof CSSStyleSheet?sl(e):e;var{is:al,defineProperty:ll,getOwnPropertyDescriptor:Ci,getOwnPropertyNames:cl,getOwnPropertySymbols:dl,getPrototypeOf:Li}=Object,ul=!1,j=globalThis;if(ul)j.customElements??=customElements;var K=!0,oe,Di=j.trustedTypes,pl=Di?Di.emptyScript:"",Pi=K?j.reactiveElementPolyfillSupportDevMode:j.reactiveElementPolyfillSupport;if(K)j.litIssuedWarnings??=new Set,oe=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!j.litIssuedWarnings.has(t)&&!j.litIssuedWarnings.has(e))console.warn(t),j.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(oe("dev-mode","Lit is in dev mode. Not recommended for production!"),j.ShadyDOM?.inUse&&Pi===void 0)oe("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var hl=K?(e)=>{if(!j.emitLitDebugLogEvents)return;j.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,Ke=(e,t)=>e,Yr={toAttribute(e,t){switch(t){case Boolean:e=e?pl:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch(n){r=null}break}return r}},Hi=(e,t)=>!al(e,t),Ei={attribute:!0,type:String,converter:Yr,reflect:!1,useDefault:!1,hasChanged:Hi};Symbol.metadata??=Symbol("metadata");j.litPropertyMetadata??=new WeakMap;class G extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=Ei){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let r=K?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),n=this.getPropertyDescriptor(e,r,t);if(n!==void 0)ll(this.prototype,e,n)}}static getPropertyDescriptor(e,t,r){let{get:n,set:s}=Ci(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};if(K&&n==null){if("value"in(Ci(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);oe("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:n,set(a){let l=n?.call(this);s?.call(this,a),this.requestUpdate(e,l,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Ei}static __prepare(){if(this.hasOwnProperty(Ke("elementProperties",this)))return;let e=Li(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ke("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(Ke("properties",this))){let t=this.properties,r=[...cl(t),...dl(t)];for(let n of r)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,n]of t)this.elementProperties.set(r,n)}this.__attributeToPropertyMap=new Map;for(let[t,r]of this.elementProperties){let n=this.__attributeNameForProperty(t,r);if(n!==void 0)this.__attributeToPropertyMap.set(n,t)}if(this.elementStyles=this.finalizeStyles(this.styles),K){if(this.hasOwnProperty("createProperty"))oe("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))oe("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let n of r)t.unshift(jr(n))}else if(e!==void 0)t.push(jr(e));return t}static __attributeNameForProperty(e,t){let r=t.attribute;return r===!1?void 0:typeof r==="string"?r:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())if(this.hasOwnProperty(r))e.set(r,this[r]),delete this[r];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Si(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$attributeToProperty(e,r)}__propertyToAttribute(e,t){let n=this.constructor.elementProperties.get(e),s=this.constructor.__attributeNameForProperty(e,n);if(s!==void 0&&n.reflect===!0){let l=(n.converter?.toAttribute!==void 0?n.converter:Yr).toAttribute(t,n.type);if(K&&this.constructor.enabledWarnings.includes("migration")&&l===void 0)oe("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,l==null)this.removeAttribute(s);else this.setAttribute(s,l);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let r=this.constructor,n=r.__attributeToPropertyMap.get(e);if(n!==void 0&&this.__reflectingProperty!==n){let s=r.getPropertyOptions(n),a=typeof s.converter==="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Yr;this.__reflectingProperty=n;let l=a.fromAttribute(t,s.type);this[n]=l??this.__defaultValues?.get(n)??l,this.__reflectingProperty=null}}requestUpdate(e,t,r,n=!1,s){if(e!==void 0){if(K&&e instanceof Event)oe("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let a=this.constructor;if(n===!1)s=this[e];if(r??=a.getPropertyOptions(e),(r.hasChanged??Hi)(s,t)||r.useDefault&&r.reflect&&s===this.__defaultValues?.get(e)&&!this.hasAttribute(a.__attributeNameForProperty(e,r)))this._$changeProperty(e,t,r);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:r,reflect:n,wrapped:s},a){if(r&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,a??t??this[e]),s!==!0||a!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!r)t=void 0;this._$changedProperties.set(e,t)}if(n===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(K&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")oe("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(hl?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),K){let s=[...this.constructor.elementProperties.keys()].filter((a)=>this.hasOwnProperty(a)&&(a in Li(this)));if(s.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${s.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[n,s]of this.__instanceProperties)this[n]=s;this.__instanceProperties=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[n,s]of r){let{wrapped:a}=s,l=this[n];if(a===!0&&!this._$changedProperties.has(n)&&l!==void 0)this._$changeProperty(n,void 0,s,l)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((r)=>r.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(r){throw e=!1,this.__markUpdated(),r}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),K&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))oe("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}G.elementStyles=[];G.shadowRootOptions={mode:"open"};G[Ke("elementProperties",G)]=new Map;G[Ke("finalized",G)]=new Map;Pi?.({ReactiveElement:G});if(K){G.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(Ke("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};G.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},G.disableWarning=function(t){e(this);let r=this.enabledWarnings.indexOf(t);if(r>=0)this.enabledWarnings.splice(r,1)}}(j.reactiveElementVersions??=[]).push("2.1.2");if(K&&j.reactiveElementVersions.length>1)queueMicrotask(()=>{oe("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var X=globalThis,H=(e)=>{if(!X.emitLitDebugLogEvents)return;X.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},fl=0,xt;X.litIssuedWarnings??=new Set,xt=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!X.litIssuedWarnings.has(t)&&!X.litIssuedWarnings.has(e))console.warn(t),X.litIssuedWarnings.add(t)},queueMicrotask(()=>{xt("dev-mode","Lit is in dev mode. Not recommended for production!")});var se=X.ShadyDOM?.inUse&&X.ShadyDOM?.noPatch===!0?X.ShadyDOM.wrap:(e)=>e,or=X.trustedTypes,Vi=or?or.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,ml=(e)=>e,cr=(e,t,r)=>ml,gl=(e)=>{if(Fe!==cr)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");Fe=e},yl=()=>{Fe=cr},en=(e,t,r)=>Fe(e,t,r),tn="$lit$",ge=`lit$${Math.random().toFixed(9).slice(2)}$`,rn="?"+ge,bl=`<${rn}>`,Qe=document,vt=()=>Qe.createComment(""),Mt=(e)=>e===null||typeof e!="object"&&typeof e!="function",nn=Array.isArray,Zi=(e)=>nn(e)||typeof e?.[Symbol.iterator]==="function",Kr=`[ 	
\f\r]`,kl=`[^ 	
\f\r"'\`<>=]`,$l=`[^\\s"'>=/]`,_t=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ri=1,Gr=2,_l=3,Oi=/-->/g,Ii=/>/g,Me=new RegExp(`>|${Kr}(?:(${$l}+)(${Kr}*=${Kr}*(?:${kl}|("|')|))|$)`,"g"),wl=0,Ni=1,xl=2,Qi=3,Xr=/'/g,Jr=/"/g,zi=/^(?:script|style|textarea|title)$/i,Ui=1,sr=2,ar=3,on=1,lr=2,vl=3,Ml=4,Al=5,sn=6,Tl=7,an=(e)=>(t,...r)=>{if(t.some((n)=>n===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(r.some((n)=>n?._$litStatic$))xt("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:r}},g=an(Ui),i=an(sr),t0=an(ar),ae=Symbol.for("lit-noChange"),k=Symbol.for("lit-nothing"),Fi=new WeakMap,Ne=Qe.createTreeWalker(Qe,129),Fe=cr;function qi(e,t){if(!nn(e)||!e.hasOwnProperty("raw")){let r="invalid template strings array";throw r=`
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `.trim().replace(/\n */g,`
`),Error(r)}return Vi!==void 0?Vi.createHTML(t):t}var Bi=(e,t)=>{let r=e.length-1,n=[],s=t===sr?"<svg>":t===ar?"<math>":"",a,l=_t;for(let p=0;p<r;p++){let m=e[p],b=-1,x,S=0,M;while(S<m.length){if(l.lastIndex=S,M=l.exec(m),M===null)break;if(S=l.lastIndex,l===_t){if(M[Ri]==="!--")l=Oi;else if(M[Ri]!==void 0)l=Ii;else if(M[Gr]!==void 0){if(zi.test(M[Gr]))a=new RegExp(`</${M[Gr]}`,"g");l=Me}else if(M[_l]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(l===Me)if(M[wl]===">")l=a??_t,b=-1;else if(M[Ni]===void 0)b=-2;else b=l.lastIndex-M[xl].length,x=M[Ni],l=M[Qi]===void 0?Me:M[Qi]==='"'?Jr:Xr;else if(l===Jr||l===Xr)l=Me;else if(l===Oi||l===Ii)l=_t;else l=Me,a=void 0}console.assert(b===-1||l===Me||l===Xr||l===Jr,"unexpected parse state B");let C=l===Me&&e[p+1].startsWith("/>")?" ":"";s+=l===_t?m+bl:b>=0?(n.push(x),m.slice(0,b)+tn+m.slice(b))+ge+C:m+ge+(b===-2?p:C)}let u=s+(e[r]||"<?>")+(t===sr?"</svg>":t===ar?"</math>":"");return[qi(e,u),n]};class At{constructor({strings:e,["_$litType$"]:t},r){this.parts=[];let n,s=0,a=0,l=e.length-1,u=this.parts,[p,m]=Bi(e,t);if(this.el=At.createElement(p,r),Ne.currentNode=this.el.content,t===sr||t===ar){let b=this.el.content.firstChild;b.replaceWith(...b.childNodes)}while((n=Ne.nextNode())!==null&&u.length<l){if(n.nodeType===1){{let b=n.localName;if(/^(?:textarea|template)$/i.test(b)&&n.innerHTML.includes(ge)){let x=`Expressions are not supported inside \`${b}\` elements. See https://lit.dev/msg/expression-in-${b} for more information.`;if(b==="template")throw Error(x);else xt("",x)}}if(n.hasAttributes()){for(let b of n.getAttributeNames())if(b.endsWith(tn)){let x=m[a++],M=n.getAttribute(b).split(ge),C=/([.?@])?(.*)/.exec(x);u.push({type:on,index:s,name:C[2],strings:M,ctor:C[1]==="."?cn:C[1]==="?"?dn:C[1]==="@"?un:Xe}),n.removeAttribute(b)}else if(b.startsWith(ge))u.push({type:sn,index:s}),n.removeAttribute(b)}if(zi.test(n.tagName)){let b=n.textContent.split(ge),x=b.length-1;if(x>0){n.textContent=or?or.emptyScript:"";for(let S=0;S<x;S++)n.append(b[S],vt()),Ne.nextNode(),u.push({type:lr,index:++s});n.append(b[x],vt())}}}else if(n.nodeType===8)if(n.data===rn)u.push({type:lr,index:s});else{let x=-1;while((x=n.data.indexOf(ge,x+1))!==-1)u.push({type:Tl,index:s}),x+=ge.length-1}s++}if(m.length!==a)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");H&&H({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let r=Qe.createElement("template");return r.innerHTML=e,r}}function Ze(e,t,r=e,n){if(t===ae)return t;let s=n!==void 0?r.__directives?.[n]:r.__directive,a=Mt(t)?void 0:t._$litDirective$;if(s?.constructor!==a){if(s?._$notifyDirectiveConnectionChanged?.(!1),a===void 0)s=void 0;else s=new a(e),s._$initialize(e,r,n);if(n!==void 0)(r.__directives??=[])[n]=s;else r.__directive=s}if(s!==void 0)t=Ze(e,s._$resolve(e,t.values),s,n);return t}class ln{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:r}=this._$template,n=(e?.creationScope??Qe).importNode(t,!0);Ne.currentNode=n;let s=Ne.nextNode(),a=0,l=0,u=r[0];while(u!==void 0){if(a===u.index){let p;if(u.type===lr)p=new Ge(s,s.nextSibling,this,e);else if(u.type===on)p=new u.ctor(s,u.name,u.strings,this,e);else if(u.type===sn)p=new pn(s,this,e);this._$parts.push(p),u=r[++l]}if(a!==u?.index)s=Ne.nextNode(),a++}return Ne.currentNode=Qe,n}_update(e){let t=0;for(let r of this._$parts){if(r!==void 0)if(H&&H({kind:"set part",part:r,value:e[t],valueIndex:t,values:e,templateInstance:this}),r.strings!==void 0)r._$setValue(e,r,t),t+=r.strings.length-2;else r._$setValue(e[t]);t++}}}class Ge{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,r,n){this.type=lr,this._$committedValue=k,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=r,this.options=n,this.__isConnected=n?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=se(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=Ze(this,e,t),Mt(e)){if(e===k||e==null||e===""){if(this._$committedValue!==k)H&&H({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=k}else if(e!==this._$committedValue&&e!==ae)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(Zi(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return se(se(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),Fe!==cr){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let r="Forbidden";if(t==="STYLE")r="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else r="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(r)}}H&&H({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==k&&Mt(this._$committedValue)){let t=se(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=en(t,"data","property");e=this._textSanitizer(e),H&&H({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=Qe.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=en(t,"data","property");e=this._textSanitizer(e),H&&H({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:r}=e,n=typeof r==="number"?this._$getTemplate(e):(r.el===void 0&&(r.el=At.createElement(qi(r.h,r.h[0]),this.options)),r);if(this._$committedValue?._$template===n)H&&H({kind:"template updating",template:n,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let s=new ln(n,this),a=s._clone(this.options);H&&H({kind:"template instantiated",template:n,instance:s,parts:s._$parts,options:this.options,fragment:a,values:t}),s._update(t),H&&H({kind:"template instantiated and updated",template:n,instance:s,parts:s._$parts,options:this.options,fragment:a,values:t}),this._commitNode(a),this._$committedValue=s}}_$getTemplate(e){let t=Fi.get(e.strings);if(t===void 0)Fi.set(e.strings,t=new At(e));return t}_commitIterable(e){if(!nn(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,r=0,n;for(let s of e){if(r===t.length)t.push(n=new Ge(this._insert(vt()),this._insert(vt()),this,this.options));else n=t[r];n._$setValue(s),r++}if(r<t.length)this._$clear(n&&se(n._$endNode).nextSibling,r),t.length=r}_$clear(e=se(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let r=se(e).nextSibling;se(e).remove(),e=r}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class Xe{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,r,n,s){if(this.type=on,this._$committedValue=k,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=n,this.options=s,r.length>2||r[0]!==""||r[1]!=="")this._$committedValue=Array(r.length-1).fill(new String),this.strings=r;else this._$committedValue=k;this._sanitizer=void 0}_$setValue(e,t=this,r,n){let s=this.strings,a=!1;if(s===void 0){if(e=Ze(this,e,t,0),a=!Mt(e)||e!==this._$committedValue&&e!==ae,a)this._$committedValue=e}else{let l=e;e=s[0];let u,p;for(u=0;u<s.length-1;u++){if(p=Ze(this,l[r+u],t,u),p===ae)p=this._$committedValue[u];if(a||=!Mt(p)||p!==this._$committedValue[u],p===k)e=k;else if(e!==k)e+=(p??"")+s[u+1];this._$committedValue[u]=p}}if(a&&!n)this._commitValue(e)}_commitValue(e){if(e===k)se(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=Fe(this.element,this.name,"attribute");e=this._sanitizer(e??""),H&&H({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),se(this.element).setAttribute(this.name,e??"")}}}class cn extends Xe{constructor(){super(...arguments);this.type=vl}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=Fe(this.element,this.name,"property");e=this._sanitizer(e),H&&H({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===k?void 0:e}}class dn extends Xe{constructor(){super(...arguments);this.type=Ml}_commitValue(e){H&&H({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==k),options:this.options}),se(this.element).toggleAttribute(this.name,!!e&&e!==k)}}class un extends Xe{constructor(e,t,r,n,s){super(e,t,r,n,s);if(this.type=Al,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=Ze(this,e,t,0)??k,e===ae)return;let r=this._$committedValue,n=e===k&&r!==k||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,s=e!==k&&(r===k||n);if(H&&H({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:n,addListener:s,oldListener:r}),n)this.element.removeEventListener(this.name,this,r);if(s)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class pn{constructor(e,t,r){this.element=e,this.type=sn,this._$disconnectableChildren=void 0,this._$parent=t,this.options=r}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){H&&H({kind:"commit to element binding",element:this.element,value:e,options:this.options}),Ze(this,e)}}var Wi={_boundAttributeSuffix:tn,_marker:ge,_markerMatch:rn,_HTML_RESULT:Ui,_getTemplateHtml:Bi,_TemplateInstance:ln,_isIterable:Zi,_resolveDirective:Ze,_ChildPart:Ge,_AttributePart:Xe,_BooleanAttributePart:dn,_EventPart:un,_PropertyPart:cn,_ElementPart:pn},Sl=X.litHtmlPolyfillSupportDevMode;Sl?.(At,Ge);(X.litHtmlVersions??=[]).push("3.3.3");if(X.litHtmlVersions.length>1)queueMicrotask(()=>{xt("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var wt=(e,t,r)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let n=fl++,s=r?.renderBefore??t,a=s._$litPart$;if(H&&H({kind:"begin render",id:n,value:e,container:t,options:r,part:a}),a===void 0){let l=r?.renderBefore??null;s._$litPart$=a=new Ge(t.insertBefore(vt(),l),l,void 0,r??{})}return a._$setValue(e),H&&H({kind:"end render",id:n,value:e,container:t,options:r,part:a}),a};wt.setSanitizer=gl,wt.createSanitizer=en,wt._testOnlyClearSanitizerFactoryDoNotCallOrElse=yl;var Cl=(e,t)=>e,hn=!0,we=globalThis,ji;if(hn)we.litIssuedWarnings??=new Set,ji=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!we.litIssuedWarnings.has(t)&&!we.litIssuedWarnings.has(e))console.warn(t),we.litIssuedWarnings.add(t)};class z extends G{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=wt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return ae}}z._$litElement$=!0;z[Cl("finalized",z)]=!0;we.litElementHydrateSupport?.({LitElement:z});var Ll=hn?we.litElementPolyfillSupportDevMode:we.litElementPolyfillSupport;Ll?.({LitElement:z});(we.litElementVersions??=[]).push("4.2.2");if(hn&&we.litElementVersions.length>1)queueMicrotask(()=>{ji("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var dr={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ur=(e)=>(...t)=>({["_$litDirective$"]:e,values:t});class Tt{constructor(e){}get _$isConnected(){return this._$parent._$isConnected}_$initialize(e,t,r){this.__part=e,this._$parent=t,this.__attributeIndex=r}_$resolve(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}var{_ChildPart:Dl}=Wi,El=!0,Je=El&&window.ShadyDOM?.inUse&&window.ShadyDOM?.noPatch===!0?window.ShadyDOM.wrap:(e)=>e;var Yi=()=>document.createComment(""),et=(e,t,r)=>{let n=Je(e._$startNode).parentNode,s=t===void 0?e._$endNode:t._$startNode;if(r===void 0){let a=Je(n).insertBefore(Yi(),s),l=Je(n).insertBefore(Yi(),s);r=new Dl(a,l,e,e.options)}else{let a=Je(r._$endNode).nextSibling,l=r._$parent,u=l!==e;if(u){r._$reparentDisconnectables?.(e),r._$parent=e;let p;if(r._$notifyConnectionChanged!==void 0&&(p=e._$isConnected)!==l._$isConnected)r._$notifyConnectionChanged(p)}if(a!==s||u){let p=r._$startNode;while(p!==a){let m=Je(p).nextSibling;Je(n).insertBefore(p,s),p=m}}}return r},Ae=(e,t,r=e)=>(e._$setValue(t,r),e),Pl={},Ki=(e,t=Pl)=>e._$committedValue=t,Gi=(e)=>e._$committedValue,pr=(e)=>{e._$clear(),e._$startNode.remove()};var Xi=(e,t,r)=>{let n=new Map;for(let s=t;s<=r;s++)n.set(e[s],s);return n};class Ji extends Tt{constructor(e){super(e);if(e.type!==dr.CHILD)throw Error("repeat() can only be used in text expressions")}_getValuesAndKeys(e,t,r){let n;if(r===void 0)r=t;else if(t!==void 0)n=t;let s=[],a=[],l=0;for(let u of e)s[l]=n?n(u,l):l,a[l]=r(u,l),l++;return{values:a,keys:s}}render(e,t,r){return this._getValuesAndKeys(e,t,r).values}update(e,[t,r,n]){let s=Gi(e),{values:a,keys:l}=this._getValuesAndKeys(t,r,n);if(!Array.isArray(s))return this._itemKeys=l,a;let u=this._itemKeys??=[],p=[],m,b,x=0,S=s.length-1,M=0,C=a.length-1;while(x<=S&&M<=C)if(s[x]===null)x++;else if(s[S]===null)S--;else if(u[x]===l[M])p[M]=Ae(s[x],a[M]),x++,M++;else if(u[S]===l[C])p[C]=Ae(s[S],a[C]),S--,C--;else if(u[x]===l[C])p[C]=Ae(s[x],a[C]),et(e,p[C+1],s[x]),x++,C--;else if(u[S]===l[M])p[M]=Ae(s[S],a[M]),et(e,s[x],s[S]),S--,M++;else{if(m===void 0)m=Xi(l,M,C),b=Xi(u,x,S);if(!m.has(u[x]))pr(s[x]),x++;else if(!m.has(u[S]))pr(s[S]),S--;else{let Q=b.get(l[M]),Y=Q!==void 0?s[Q]:null;if(Y===null){let _e=et(e,s[x]);Ae(_e,a[M]),p[M]=_e}else p[M]=Ae(Y,a[M]),et(e,s[x],Y),s[Q]=null;M++}}while(M<=C){let Q=et(e,p[C+1]);Ae(Q,a[M]),p[M++]=Q}while(x<=S){let Q=s[x++];if(Q!==null)pr(Q)}return this._itemKeys=l,Ki(e,p),ae}}var te=ur(Ji);var Hl={app_title:"Housetide",tab_today:"Today",tab_tasks:"Tasks",tab_history:"History",card_title:"Today",card_empty:"All clear. Nothing due today.",card_loading:"Loading tasks…",card_error:"Housetide is not available",config_tasks:"Tasks",config_show:"Show",config_show_today:"Today only",config_show_all:"All tasks",config_layout:"Layout",config_layout_list:"List",config_layout_scenes:"Scenes",config_title:"Title",config_animations:"Animations",action_advance:"Done",action_start:"Start",action_early:"Do early",action_early_confirm:"Sure?",action_skip:"Skip",action_undo:"Undo",action_save:"Save",action_cancel:"Cancel",action_delete:"Delete",action_edit:"Edit",action_add:"Add",action_add_stage:"Add stage",action_remove:"Remove",action_load_more:"Load more",action_new_task:"New task",action_move_up:"Move up",action_move_down:"Move down",status_upcoming:"Upcoming",status_due:"Due",status_overdue:"Overdue",status_in_progress:"In progress",status_clean:"Clean",status_done:"Done",status_disabled:"Paused",automated:"Automatic",due_now:"Due now",due_when:"Due {when}",next_when:"Next {when}",overdue_for:"Overdue · {duration}",started_when:"Started {when}",done_when:"Done {when}",not_scheduled:"Not scheduled",stage_progress:"Step {current} of {total}",template_laundry:"Laundry",template_pills:"Pills",template_plant:"Water the plant",template_teeth:"Brush your teeth",template_bed:"Change the sheets",template_dishes:"Do the dishes",template_trash:"Take out the trash",template_vacuum:"Vacuum",template_pet:"Feed the cat",template_bathroom:"Clean the bathroom",template_fridge:"Tidy the fridge",template_window:"Wash the windows",template_water:"Drink some water",template_one_off:"One-off task",template_prompt:"Start from a template",field_title:"Title",field_icon:"Icon",field_color:"Colour",field_notes:"Notes",field_assignee:"Assignee",field_enabled:"Enabled",field_scene:"Scene",field_on_missed:"If missed",field_clean_for:"Stays clean for (minutes)",field_grace:"Grace period (hours)",field_schedule:"Schedule",field_schedule_type:"Repeats",field_due:"Due",field_time:"Time",field_weekdays:"Weekdays",field_every_days:"Every (days)",field_anchor:"Count from",field_stages:"Stages",field_stage_title:"Stage",field_action:"Button label",field_role:"Role",field_stale_after:"Gets stale after (minutes)",field_trigger:"Advances automatically",field_entity:"When this entity",field_condition:"Is",field_value:"Value",field_for_seconds:"For (seconds)",field_current_value:"Current value: {value}",field_retention:"Keep history (days)",condition_above:"Above",condition_below:"Below",condition_state:"Equal to",condition_none:"By hand only",schedule_once:"Once",schedule_daily:"Daily",schedule_weekly:"Weekly",schedule_interval:"Interval",schedule_daily_at:"Every day at {time}",schedule_weekly_at:"{days} at {time}",schedule_interval_at:"{every} at {time}",anchor_completion:"Last completion",anchor_schedule:"Previous due date",on_missed_carry:"Keep it overdue",on_missed_skip:"Skip to the next",role_todo:"To do",role_running:"Running",role_waiting:"Waiting",scene_generic:"Tide",scene_pills:"Pills",scene_laundry:"Laundry",scene_plant:"Plant",scene_teeth:"Teeth",scene_bed:"Bed",scene_dishes:"Dishes",scene_trash:"Trash",scene_vacuum:"Vacuum",scene_pet:"Pet",scene_bathroom:"Bathroom",scene_fridge:"Fridge",scene_window:"Windows",scene_water:"Water",event_started:"Started",event_advanced:"Advanced",event_completed:"Completed",event_skipped:"Skipped",event_missed:"Missed",event_undone:"Undone",event_created:"Created",event_deleted:"Deleted",source_manual:"By hand",source_trigger:"By sensor",source_service:"By service",source_schedule:"By schedule",source_todo:"From the to-do list",on_time:"On time",late:"Late",history_all_tasks:"All tasks",field_filter_task:"Task",history_empty:"Nothing has happened yet.",stats_current_streak:"Current streak",stats_best_streak:"Best streak",stats_completed:"Completed",stats_skipped:"Skipped",stats_missed:"Missed",stats_on_time:"On time",stats_no_data:"—",tasks_empty:"No tasks yet. Start from a template.",tasks_read_only:"Only administrators can change tasks.",confirm_delete:"Delete “{title}”? History is kept.",error_generic:"Something went wrong: {message}",error_required:"This field is required",settings_title:"Settings",disconnected:"Connection lost. Reconnecting…",loading:"Loading…",card_error_hint:"Check that the Housetide integration is set up.",action_retry:"Try again",action_clear:"Clear",action_close:"Close",action_menu:"Menu",today_later:"Coming up",today_clear_title:"All clear",section_details:"Details",section_behaviour:"If life gets in the way",field_stage_n:"Stage {n}",hint_clean_for:"How long it shows as freshly done.",hint_grace:"After this it counts as overdue and starts to smell.",hint_icon:"For example mdi:washing-machine",hint_stale_after:"Leave empty if it can wait forever.",hint_assignee:"A name or a person entity",entity_placeholder:"Search by name or entity id",entity_not_found:"This entity does not exist right now",entity_unavailable:"The entity is unavailable right now",entity_no_matches:"No matching entities",trigger_met:"True right now",trigger_unmet:"Not true right now",trigger_none:"Moves on only when you tap the button.",trigger_above:"Moves on when {entity} goes above {value}",trigger_below:"Moves on when {entity} drops below {value}",trigger_state:"Moves on when {entity} becomes “{value}”",trigger_held:"{sentence} and stays there for {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Choose an entity and a value to finish this rule.",error_number:"Enter a number",error_whole:"Enter a whole number",error_min:"Must be at least {min}",error_max:"Must be at most {max}",error_weekdays:"Pick at least one day",error_entity:"Pick an entity, or turn off automatic advance",error_entity_format:"That is not a valid entity id",error_state:"This state can never match",error_datetime:"Choose a date and time",error_time:"Choose a time",error_form:"Some fields need attention.",error_templates:"Could not load the templates.",template_stage_load:"Collect and load",template_action_load:"Loaded",template_stage_wash:"Washing",template_action_wash:"Finished",template_stage_hang:"Hang it up",template_action_hang:"Hung up",template_stage_take:"Take pills",template_action_take:"Taken",template_stage_water:"Water",template_action_water:"Watered",template_stage_do:"Do it",template_action_do:"Done",template_stage_brush:"Brush",template_action_brush:"Brushed",template_stage_change_sheets:"Change the sheets",template_action_change_sheets:"Changed",template_stage_wash_up:"Wash up",template_action_wash_up:"Washed",template_stage_take_out:"Take it out",template_action_take_out:"Taken out",template_stage_vacuum_floor:"Vacuum the floor",template_action_vacuum_floor:"Vacuumed",template_stage_feed:"Feed",template_action_feed:"Fed",template_stage_scrub:"Scrub it",template_action_scrub:"Cleaned",template_stage_tidy:"Clear it out",template_action_tidy:"Tidied",template_stage_wipe_glass:"Wash the glass",template_action_wipe_glass:"Washed",template_stage_drink:"Drink",template_action_drink:"Drank",history_window:"Last 90 days",history_day_hint:"Tap a day to see what happened.",history_day:"{date}: {completed} done, {skipped} skipped, {missed} missed",history_day_empty:"{date}: nothing recorded",history_stage:"{event} · {stage}",stats_scope:"{completed} done · {skipped} skipped · {missed} missed"},Vl={app_title:"Housetide",tab_today:"Сьогодні",tab_tasks:"Задачі",tab_history:"Історія",card_title:"Сьогодні",card_empty:"Усе чисто. На сьогодні нічого немає.",card_loading:"Завантаження задач…",card_error:"Housetide недоступний",config_tasks:"Задачі",config_show:"Показувати",config_show_today:"Лише сьогодні",config_show_all:"Усі задачі",config_layout:"Вигляд",config_layout_list:"Список",config_layout_scenes:"Сцени",config_title:"Заголовок",config_animations:"Анімації",action_advance:"Готово",action_start:"Почати",action_early:"Раніше",action_early_confirm:"Точно?",action_skip:"Пропустити",action_undo:"Скасувати",action_save:"Зберегти",action_cancel:"Скасувати",action_delete:"Видалити",action_edit:"Змінити",action_add:"Додати",action_add_stage:"Додати етап",action_remove:"Прибрати",action_load_more:"Показати ще",action_new_task:"Нова задача",action_move_up:"Вище",action_move_down:"Нижче",status_upcoming:"Заплановано",status_due:"Час виконати",status_overdue:"Прострочено",status_in_progress:"Виконується",status_clean:"Чисто",status_done:"Виконано",status_disabled:"На паузі",automated:"Автоматично",due_now:"Час виконати",due_when:"Термін: {when}",next_when:"Наступне: {when}",overdue_for:"Прострочено · {duration}",started_when:"Почато {when}",done_when:"Виконано {when}",not_scheduled:"Без розкладу",stage_progress:"Етап {current} з {total}",template_laundry:"Прання",template_pills:"Таблетки",template_plant:"Полити рослину",template_teeth:"Почистити зуби",template_bed:"Змінити постіль",template_dishes:"Помити посуд",template_trash:"Винести сміття",template_vacuum:"Пропилососити",template_pet:"Погодувати кота",template_bathroom:"Прибрати у ванній",template_fridge:"Розібрати холодильник",template_window:"Помити вікна",template_water:"Випити води",template_one_off:"Разова задача",template_prompt:"Почати із шаблону",field_title:"Назва",field_icon:"Іконка",field_color:"Колір",field_notes:"Нотатки",field_assignee:"Виконавець",field_enabled:"Увімкнено",field_scene:"Сцена",field_on_missed:"Якщо пропущено",field_clean_for:"Залишається чистим (хвилин)",field_grace:"Запас часу (годин)",field_schedule:"Розклад",field_schedule_type:"Повторення",field_due:"Термін",field_time:"Час",field_weekdays:"Дні тижня",field_every_days:"Кожні (днів)",field_anchor:"Рахувати від",field_stages:"Етапи",field_stage_title:"Етап",field_action:"Напис на кнопці",field_role:"Роль",field_stale_after:"Застоюється через (хвилин)",field_trigger:"Перемикається автоматично",field_entity:"Коли ця сутність",field_condition:"Має значення",field_value:"Значення",field_for_seconds:"Протягом (секунд)",field_current_value:"Поточне значення: {value}",field_retention:"Зберігати історію (днів)",condition_above:"Більше ніж",condition_below:"Менше ніж",condition_state:"Дорівнює",condition_none:"Лише вручну",schedule_once:"Один раз",schedule_daily:"Щодня",schedule_weekly:"Щотижня",schedule_interval:"Інтервал",schedule_daily_at:"Щодня о {time}",schedule_weekly_at:"{days} о {time}",schedule_interval_at:"{every} о {time}",anchor_completion:"Останнього виконання",anchor_schedule:"Попереднього терміну",on_missed_carry:"Залишати простроченою",on_missed_skip:"Переходити до наступної",role_todo:"Зробити",role_running:"Триває",role_waiting:"Очікує",scene_generic:"Приплив",scene_pills:"Таблетки",scene_laundry:"Прання",scene_plant:"Рослина",scene_teeth:"Зуби",scene_bed:"Постіль",scene_dishes:"Посуд",scene_trash:"Сміття",scene_vacuum:"Пилосос",scene_pet:"Улюбленець",scene_bathroom:"Ванна",scene_fridge:"Холодильник",scene_window:"Вікна",scene_water:"Вода",event_started:"Розпочато",event_advanced:"Наступний етап",event_completed:"Виконано",event_skipped:"Пропущено",event_missed:"Не виконано",event_undone:"Скасовано",event_created:"Створено",event_deleted:"Видалено",source_manual:"Вручну",source_trigger:"За датчиком",source_service:"Через сервіс",source_schedule:"За розкладом",source_todo:"Зі списку справ",on_time:"Вчасно",late:"Із запізненням",history_all_tasks:"Усі задачі",field_filter_task:"Задача",history_empty:"Поки що нічого не сталося.",stats_current_streak:"Поточна серія",stats_best_streak:"Найкраща серія",stats_completed:"Виконано",stats_skipped:"Пропущено",stats_missed:"Не виконано",stats_on_time:"Вчасно",stats_no_data:"—",tasks_empty:"Задач поки немає. Почніть із шаблону.",tasks_read_only:"Змінювати задачі можуть лише адміністратори.",confirm_delete:"Видалити «{title}»? Історія збережеться.",error_generic:"Щось пішло не так: {message}",error_required:"Це поле обовʼязкове",settings_title:"Налаштування",disconnected:"Звʼязок втрачено. Перепідключення…",loading:"Завантаження…",card_error_hint:"Перевірте, чи налаштовано інтеграцію Housetide.",action_retry:"Спробувати ще",action_clear:"Очистити",action_close:"Закрити",action_menu:"Меню",today_later:"Незабаром",today_clear_title:"Усе чисто",section_details:"Основне",section_behaviour:"Якщо щось пішло не так",field_stage_n:"Етап {n}",hint_clean_for:"Скільки часу показувати як щойно зроблене.",hint_grace:"Після цього задача прострочена і починає смердіти.",hint_icon:"Наприклад, mdi:washing-machine",hint_stale_after:"Залиште порожнім, якщо може чекати вічно.",hint_assignee:"Імʼя або сутність person",entity_placeholder:"Пошук за назвою або id сутності",entity_not_found:"Такої сутності зараз немає",entity_unavailable:"Сутність зараз недоступна",entity_no_matches:"Нічого не знайдено",trigger_met:"Зараз виконується",trigger_unmet:"Зараз не виконується",trigger_none:"Перемикається лише натисканням кнопки.",trigger_above:"Перемикається, коли {entity} перевищить {value}",trigger_below:"Перемикається, коли {entity} впаде нижче {value}",trigger_state:"Перемикається, коли {entity} стане «{value}»",trigger_held:"{sentence} і так триматиметься {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Оберіть сутність і значення, щоб завершити правило.",error_number:"Введіть число",error_whole:"Введіть ціле число",error_min:"Має бути не менше {min}",error_max:"Має бути не більше {max}",error_weekdays:"Оберіть хоча б один день",error_entity:"Оберіть сутність або вимкніть автоматичне перемикання",error_entity_format:"Це не схоже на id сутності",error_state:"Такий стан ніколи не настане",error_datetime:"Оберіть дату й час",error_time:"Оберіть час",error_form:"Деякі поля потребують уваги.",error_templates:"Не вдалося завантажити шаблони.",template_stage_load:"Зібрати й завантажити",template_action_load:"Завантажено",template_stage_wash:"Прання",template_action_wash:"Завершено",template_stage_hang:"Розвісити",template_action_hang:"Розвішано",template_stage_take:"Випити таблетки",template_action_take:"Випито",template_stage_water:"Полити",template_action_water:"Полито",template_stage_do:"Зробити",template_action_do:"Готово",template_stage_brush:"Почистити",template_action_brush:"Почищено",template_stage_change_sheets:"Змінити постіль",template_action_change_sheets:"Змінено",template_stage_wash_up:"Помити",template_action_wash_up:"Помито",template_stage_take_out:"Винести",template_action_take_out:"Винесено",template_stage_vacuum_floor:"Пропилососити",template_action_vacuum_floor:"Готово",template_stage_feed:"Погодувати",template_action_feed:"Погодовано",template_stage_scrub:"Прибрати",template_action_scrub:"Прибрано",template_stage_tidy:"Розібрати",template_action_tidy:"Розібрано",template_stage_wipe_glass:"Помити скло",template_action_wipe_glass:"Помито",template_stage_drink:"Випити",template_action_drink:"Випито",history_window:"Останні 90 днів",history_day_hint:"Торкніться дня, щоб побачити подробиці.",history_day:"{date}: виконано {completed}, пропущено {skipped}, не виконано {missed}",history_day_empty:"{date}: нічого не записано",history_stage:"{event} · {stage}",stats_scope:"виконано {completed} · пропущено {skipped} · не виконано {missed}"},Rl={days:{one:"{n} day",other:"{n} days"},every_days:{one:"Every day",other:"Every {n} days"},tasks_due:{one:"{n} task due",other:"{n} tasks due"},occurrences:{one:"{n} in a row",other:"{n} in a row"},seconds:{one:"{n} second",other:"{n} seconds"}},Ol={days:{one:"{n} день",few:"{n} дні",many:"{n} днів",other:"{n} дня"},every_days:{one:"Кожен {n} день",few:"Кожні {n} дні",many:"Кожні {n} днів",other:"Кожні {n} дня"},tasks_due:{one:"{n} задача на зараз",few:"{n} задачі на зараз",many:"{n} задач на зараз",other:"{n} задачі на зараз"},occurrences:{one:"{n} поспіль",few:"{n} поспіль",many:"{n} поспіль",other:"{n} поспіль"},seconds:{one:"{n} секунду",few:"{n} секунди",many:"{n} секунд",other:"{n} секунди"}};var Il=Date.UTC(2024,0,1);function eo(e,t){if(!t)return e;return e.replaceAll(/\{(\w+)\}/g,(r,n)=>String(t[n]??r))}function Nl(e,t){return e.charAt(0).toLocaleUpperCase(t)+e.slice(1)}function Ql(e){let t=(e??"en").replace("_","-");if(/^uk\b/i.test(t))return{language:"uk",locale:t};if(/^en\b/i.test(t))return{language:"en",locale:t};return{language:"en",locale:"en"}}function xe(e){return e instanceof Date?e:new Date(e)}function Fl(e){if(!e)return;try{return Intl.DateTimeFormat("en",{timeZone:e}),e}catch{return}}function fn(e,t={}){let r=Ql(e),{locale:n}=r,s=Fl(t.timeZone),{hour12:a}=t,l=a===void 0?{}:{hour12:a},p=a??new Intl.DateTimeFormat(n,{hour:"numeric"}).resolvedOptions().hour12?"numeric":"2-digit",m=r.language==="uk"?Vl:Hl,b=r.language==="uk"?Ol:Rl,x=new Intl.PluralRules(n),S=new Intl.NumberFormat(n),M=new Intl.NumberFormat(n,{style:"percent",maximumFractionDigits:0}),C=new Intl.RelativeTimeFormat(n,{numeric:"auto"}),Q=new Intl.DateTimeFormat(n,{dateStyle:"medium",timeZone:s}),Y=new Intl.DateTimeFormat(n,{day:"numeric",month:"short",timeZone:s}),_e=new Intl.DateTimeFormat(n,{hour:p,minute:"2-digit",timeZone:s,...l}),bt=new Intl.DateTimeFormat(n,{day:"numeric",month:"short",hour:p,minute:"2-digit",timeZone:s,...l}),Zr=new Intl.DateTimeFormat(n,{hour:p,minute:"2-digit",timeZone:"UTC",...l}),Oe=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:s}),pe={short:new Intl.DateTimeFormat(n,{weekday:"short",timeZone:"UTC"}),long:new Intl.DateTimeFormat(n,{weekday:"long",timeZone:"UTC"}),narrow:new Intl.DateTimeFormat(n,{weekday:"narrow",timeZone:"UTC"})},he=(T)=>new Intl.NumberFormat(n,{style:"unit",unit:T,unitDisplay:"long"}),fe={minute:he("minute"),hour:he("hour"),day:he("day"),week:he("week")},kt=(T)=>{let P=(Z)=>Number(Oe.formatToParts(T).find((me)=>me.type===Z)?.value);return Date.UTC(P("year"),P("month")-1,P("day"))/86400000},W=(T,P)=>eo(m[T],P),xi=(T,P)=>{let Z=b[T],me=Z[x.select(P)]??Z.other;return eo(me,{n:S.format(P)})},$t=(T,P)=>{let Z=xe(T),me=xe(P),zr=(Z.getTime()-me.getTime())/1000,Ur=Math.abs(zr);if(Ur<45)return C.format(0,"second");if(Ur<3570)return C.format(Math.round(zr/60),"minute");if(Ur<84600)return C.format(Math.round(zr/3600),"hour");let Ie=kt(Z)-kt(me);if(Math.abs(Ie)<7)return C.format(Ie,"day");if(Math.abs(Ie)<30)return C.format(Math.round(Ie/7),"week");if(Math.abs(Ie)<365)return C.format(Math.round(Ie/30),"month");return C.format(Math.round(Ie/365),"year")},vi=(T)=>{let P=Math.max(0,Math.round(T));if(P<3570)return fe.minute.format(Math.max(1,Math.round(P/60)));if(P<84600)return fe.hour.format(Math.round(P/3600));if(P<1209600)return fe.day.format(Math.round(P/86400));return fe.week.format(Math.round(P/604800))},Mi=(T)=>{let[P=0,Z=0]=T.split(":").map(Number);return Zr.format(Date.UTC(2024,0,1,P,Z))},Ai=(T,P="short")=>pe[P].format(Il+(T%7+7)%7*86400*1000),rl=(T)=>{if(T.type==="once")return bt.format(xe(T.due));let P=Mi(T.time);if(T.type==="daily")return W("schedule_daily_at",{time:P});if(T.type==="weekly"){let Z=T.weekdays.map((me)=>Ai(me)).join(", ");return W("schedule_weekly_at",{days:Z,time:P})}return W("schedule_interval_at",{every:xi("every_days",T.every_days),time:P})},nl=(T,P)=>{let{status:Z}=T;if(Z==="disabled")return W("status_disabled");if(Z==="done"||Z==="clean")return T.last_completed_at?W("done_when",{when:$t(T.last_completed_at,P)}):W("status_done");if(Z==="in_progress")return T.started_at?W("started_when",{when:$t(T.started_at,P)}):W("status_in_progress");if(Z==="overdue"){let me=T.due_at?(xe(P).getTime()-xe(T.due_at).getTime())/1000:T.overdue_seconds;return W("overdue_for",{duration:vi(me)})}if(Z==="due")return W("due_now");if(T.due_at)return W("due_when",{when:$t(T.due_at,P)});if(T.next_due_at)return W("next_when",{when:$t(T.next_due_at,P)});return W("not_scheduled")};return{language:r.language,locale:n,t:W,plural:xi,number:(T)=>S.format(T),percent:(T)=>M.format(T),relative:$t,duration:vi,date:(T)=>Q.format(xe(T)),shortDate:(T)=>Y.format(xe(T)),time:(T)=>_e.format(xe(T)),dateTime:(T)=>bt.format(xe(T)),clock:Mi,weekday:Ai,scheduleText:(T)=>Nl(rl(T),n),dueText:nl}}function to(e){let t=e.locale?.time_format,r={};if(t==="12")r.hour12=!0;if(t==="24")r.hour12=!1;if(e.config?.time_zone)r.timeZone=e.config.time_zone;return fn(e.locale?.language??e.language,r)}function le(e,t={}){let r=Object.entries(t).filter(([,n])=>n!==void 0);return{type:`housetide/${e}`,...Object.fromEntries(r)}}function ro(e,t){return e.connection.subscribeMessage(t,le("subscribe"))}function no(e,t){return e.callWS(le("advance",{task_id:t}))}function io(e,t){return e.callWS(le("skip",{task_id:t}))}function oo(e,t){return e.callWS(le("undo",{task_id:t}))}async function mn(e,t={}){let r=await e.callWS(le("history",t));return Array.isArray(r)?r:r.events}function so(e,t={}){return e.callWS(le("stats",t))}function Zl(e){return"templates"in e}async function gn(e){let t=await e.callWS(le("templates"));return Zl(t)?t.templates:t}function ao(e,t){return e.callWS(le("task/create",{task:t}))}function lo(e,t){return e.callWS(le("task/update",{task:t}))}function co(e,t){return e.callWS(le("task/delete",{task_id:t}))}function uo(e,t){return e.callWS(le("settings/update",{settings:t}))}var zl=/^[a-z0-9_]+\.[a-z0-9_]+$/,Ul=/^(?:[01]\d|2[0-3]):[0-5]\d$/,ql=/^\d+$/,Bl=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,yo=new Set(["unknown","unavailable"]);function bo(){return Intl.DateTimeFormat().resolvedOptions().timeZone}var po=new Map;function Wl(e){let t=po.get(e);if(t)return t;let r=new Intl.DateTimeFormat("en-CA",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});return po.set(e,r),r}function hr(e,t){let r=Wl(t).formatToParts(e),n=(s)=>Number(r.find((a)=>a.type===s)?.value??0);return{year:n("year"),month:n("month"),day:n("day"),hour:n("hour"),minute:n("minute"),second:n("second")}}function ho(e,t){let r=hr(new Date(e),t);return Date.UTC(r.year,r.month-1,r.day,r.hour,r.minute,r.second)-Math.floor(e/1000)*1000}function Te(e){return String(e).padStart(2,"0")}function jl(e){let t=Math.round(Math.abs(e)/60000);return`${e<0?"-":"+"}${Te(Math.floor(t/60))}:${Te(t%60)}`}function bn(e,t){let r=Bl.exec(e);if(!r)return null;let[,n,s,a,l,u]=r,p=Date.UTC(Number(n),Number(s)-1,Number(a),Number(l),Number(u));if(Number.isNaN(p))return null;let m=ho(p-ho(p,t),t);return`${n}-${s}-${a}T${l}:${u}:00${jl(m)}`}function Yl(e,t){let r=new Date(e);if(Number.isNaN(r.getTime()))return"";let n=hr(r,t);return`${String(n.year).padStart(4,"0")}-${Te(n.month)}-${Te(n.day)}T${Te(n.hour)}:${Te(n.minute)}`}function Ct(e,t){let r=hr(e,t);return(new Date(Date.UTC(r.year,r.month-1,r.day)).getUTCDay()+6)%7}function ko(e,t){return bn(`${e}T12:00`,t)??e}function Kl(e,t){let r=hr(e,t),n=new Date(Date.UTC(r.year,r.month-1,r.day+1));return`${n.getUTCFullYear()}-${Te(n.getUTCMonth()+1)}-${Te(n.getUTCDate())}T09:00`}function Gl(e){if(!e)return"none";if(e.above!==null)return"above";if(e.below!==null)return"below";return"state"}function Xl(e){if(!e)return"";let t=e.above??e.below??e.state;return t===null?"":String(t)}function Jl(e){return{id:e.id,title:e.title,action:e.action??"",role:e.role,stale:e.stale_after_minutes===null?"":String(e.stale_after_minutes),condition:Gl(e.complete_when),entity:e.complete_when?.entity_id??"",value:Xl(e.complete_when),hold:e.complete_when?String(e.complete_when.for_seconds):"0"}}function $o(e,t,r){let{schedule:n}=e;return{id:e.id??null,title:e.title,icon:e.icon??"",color:e.color??"",notes:e.notes??"",assignee:e.assignee??"",enabled:e.enabled,scene:e.scene,on_missed:e.on_missed,clean_for:String(e.clean_for_minutes),grace:String(e.grace_hours),schedule:n.type,due:n.type==="once"?Yl(n.due,t):Kl(r,t),time:n.type==="once"?"09:00":n.time,weekdays:n.type==="weekly"?[...n.weekdays]:[Ct(r,t)],every_days:n.type==="interval"?String(n.every_days):"7",anchor:n.type==="interval"?n.anchor:"completion",stages:e.stages.map((s)=>Jl(s))}}function _o(e){let t=new Set(e.stages.map((s)=>s.id)),r=e.stages.length+1;while(t.has(`stage_${r}`))r+=1;let n={id:`stage_${r}`,title:"",action:"",role:"todo",stale:"",condition:"none",entity:"",value:"",hold:"0"};return{...e,stages:[...e.stages,n]}}function wo(e,t){if(e.stages.length<=1)return e;return{...e,stages:e.stages.filter((r,n)=>n!==t)}}function kn(e,t,r){let n=t+r,s=e.stages[t];if(!s||n<0||n>=e.stages.length)return e;let a=e.stages.filter((l,u)=>u!==t);return a.splice(n,0,s),{...e,stages:a}}function $n(e){let t=e.trim().replace(",",".");if(t==="")return null;let r=Number(t);return Number.isFinite(r)?r:null}function St(e,t,r,n){let s=r.trim();if(!ql.test(s))e[t]={key:"error_whole"};else if(Number(s)<n)e[t]={key:"error_min",vars:{min:n}}}function ec(e,t,r){let n=`stages.${r}`;if(!t.title.trim())e[`${n}.title`]={key:"error_required"};if(t.stale.trim())St(e,`${n}.stale`,t.stale,1);if(t.condition==="none")return;let s=t.entity.trim();if(!s)e[`${n}.entity`]={key:"error_entity"};else if(!zl.test(s))e[`${n}.entity`]={key:"error_entity_format"};if(St(e,`${n}.hold`,t.hold,0),t.condition==="state"){let a=t.value.trim();if(!a)e[`${n}.value`]={key:"error_required"};else if(yo.has(a))e[`${n}.value`]={key:"error_state"}}else if($n(t.value)===null)e[`${n}.value`]={key:"error_number"}}function _n(e,t){let r={};if(!e.title.trim())r.title={key:"error_required"};if(St(r,"clean_for",e.clean_for,0),St(r,"grace",e.grace,0),e.schedule==="once"){if(!bn(e.due,t))r.due={key:"error_datetime"}}else if(!Ul.test(e.time))r.time={key:"error_time"};if(e.schedule==="weekly"&&e.weekdays.length===0)r.weekdays={key:"error_weekdays"};if(e.schedule==="interval")St(r,"every_days",e.every_days,1);return e.stages.forEach((n,s)=>{ec(r,n,s)}),r}function tt(e){let t=e.trim();return t===""?null:t}function tc(e,t){switch(e.schedule){case"once":return{type:"once",due:bn(e.due,t)??e.due};case"daily":return{type:"daily",time:e.time};case"weekly":return{type:"weekly",weekdays:[...e.weekdays].toSorted((r,n)=>r-n),time:e.time};default:return{type:"interval",every_days:Number(e.every_days.trim()),time:e.time,anchor:e.anchor}}}function rc(e){if(e.condition==="none")return null;let t=$n(e.value);return{entity_id:e.entity.trim(),above:e.condition==="above"?t:null,below:e.condition==="below"?t:null,state:e.condition==="state"?e.value.trim():null,for_seconds:Number(e.hold.trim())}}function nc(e){let t=tt(e.stale);return{id:e.id,title:e.title.trim(),action:tt(e.action),role:e.role,complete_when:rc(e),stale_after_minutes:t===null?null:Number(t)}}function xo(e,t){let r={title:e.title.trim(),icon:tt(e.icon),color:tt(e.color),notes:tt(e.notes),assignee:tt(e.assignee),enabled:e.enabled,schedule:tc(e,t),on_missed:e.on_missed,scene:e.scene,stages:e.stages.map((n)=>nc(n)),clean_for_minutes:Number(e.clean_for.trim()),grace_hours:Number(e.grace.trim())};return e.id===null?r:{...r,id:e.id}}function vo(e,t){return Object.hasOwn(e,t)?e[t]:void 0}function yn(e){let t=e.attributes.friendly_name;return typeof t==="string"?t:e.entity_id}function Mo(e){return e.trim()!==""&&Number.isFinite(Number(e))}function fo(e,t){if(t==="state")return 0;let r=e.attributes.device_class;if(r==="power")return 0;if(r==="current"||r==="voltage")return 1;return Mo(e.state)?2:3}function Ao(e,t,r,n=6){let s=t.trim().toLowerCase().split(/\s+/).filter(Boolean);return Object.values(e).filter((u)=>{let p=`${u.entity_id} ${yn(u)}`.toLowerCase();return s.every((m)=>p.includes(m))}).toSorted((u,p)=>fo(u,r)-fo(p,r)||u.entity_id.localeCompare(p.entity_id)).slice(0,n).map((u)=>({entity_id:u.entity_id,name:yn(u),state:u.state}))}function To(e,t){if(e.condition==="none"||!e.entity.trim())return"idle";if(!t)return"missing";if(yo.has(t.state))return"unavailable";if(e.condition==="state"){if(!e.value.trim())return"idle";return t.state===e.value.trim()?"met":"unmet"}let r=$n(e.value);if(r===null)return"idle";if(!Mo(t.state))return"unavailable";let n=Number(t.state);return(e.condition==="above"?n>r:n<r)?"met":"unmet"}function So(e){let t=e?.attributes.unit_of_measurement;return typeof t==="string"?t:""}function Co(e){let t=So(e);return t?`${e.state} ${t}`:e.state}function ic(e,t){return e<90?t.plural("seconds",e):t.duration(e)}function Lo(e,t,r){if(e.condition==="none")return r.t("trigger_none");let n=e.value.trim();if(!e.entity.trim()||!n)return r.t("trigger_incomplete");let s=t?yn(t):e.entity.trim(),a=e.condition==="state"?"":So(t),l=r.t(`trigger_${e.condition}`,{entity:s,value:a?`${n} ${a}`:n}),u=Number(e.hold.trim());if(!Number.isInteger(u)||u<=0)return r.t("trigger_instant",{sentence:l});return r.t("trigger_held",{sentence:l,hold:ic(u,r)})}var mo={laundry:"template_laundry",pills:"template_pills",plant:"template_plant",teeth:"template_teeth",bed:"template_bed",dishes:"template_dishes",trash:"template_trash",vacuum:"template_vacuum",pet:"template_pet",bathroom:"template_bathroom",fridge:"template_fridge",window:"template_window",water:"template_water",one_off:"template_one_off"},go={load:["template_stage_load","template_action_load"],wash:["template_stage_wash","template_action_wash"],hang:["template_stage_hang","template_action_hang"],take:["template_stage_take","template_action_take"],water:["template_stage_water","template_action_water"],do:["template_stage_do","template_action_do"],brush:["template_stage_brush","template_action_brush"],change_sheets:["template_stage_change_sheets","template_action_change_sheets"],wash_up:["template_stage_wash_up","template_action_wash_up"],take_out:["template_stage_take_out","template_action_take_out"],vacuum_floor:["template_stage_vacuum_floor","template_action_vacuum_floor"],feed:["template_stage_feed","template_action_feed"],scrub:["template_stage_scrub","template_action_scrub"],tidy:["template_stage_tidy","template_action_tidy"],wipe_glass:["template_stage_wipe_glass","template_action_wipe_glass"],drink:["template_stage_drink","template_action_drink"]};function wn(e,t){let r=Object.hasOwn(mo,e)?mo[e]:void 0;return r?t.t(r):null}function Do(e,t,r){return{...t,title:wn(e,r)??t.title,stages:t.stages.map((n)=>{let s=Object.hasOwn(go,n.id)?go[n.id]:void 0;return s?{...n,title:r.t(s[0]),action:r.t(s[1])}:n})}}function Eo(e){let t=e[0];if(!t)return{days:[],columns:0};let r=(new Date(`${t.date}T00:00:00Z`).getUTCDay()+6)%7,n=e.map((s,a)=>({...s,column:Math.floor((a+r)/7),row:(a+r)%7,level:Math.min(3,s.completed),trouble:s.missed+s.skipped>0}));return{days:n,columns:(n.at(-1)?.column??0)+1}}var oc=30000,Po=12000,Ho=700,sc=900,ac=6000,lc=4000;function Se(e,t){if(!e||!t)return e!==t;return e.connection!==t.connection||e.connected!==t.connected||e.language!==t.language||e.locale!==t.locale||e.config?.time_zone!==t.config?.time_zone||e.user?.is_admin!==t.user?.is_admin}function fr(e){return typeof e==="object"&&e!==null&&"connection"in e&&"states"in e}var xn;function J(e){let t=[e.locale?.language??e.language,e.locale?.time_format,e.config?.time_zone].join("|");if(xn?.key!==t)xn={key:t,i18n:to(e)};return xn.i18n}function ye(e){return e.config?.time_zone??bo()}function ze(e){return e?.connected===!1}function mr(){return document.hidden}class Lt{state=null;failed=!1;now=new Date;host;hass;onState;connected=!1;connection;unsubscribe;generation=0;timer;clockOffset=0;constructor(e,t,r){this.host=e,this.hass=t,this.onState=r,e.addController(this)}hostConnected(){this.connected=!0,this.timer=setInterval(this.tick,oc),document.addEventListener("visibilitychange",this.onVisibility),this.sync()}hostDisconnected(){this.connected=!1,clearInterval(this.timer),document.removeEventListener("visibilitychange",this.onVisibility),this.stop()}sync(){let e=this.hass();if(!this.connected||!e||e.connection===this.connection)return;this.stop(),this.connection=e.connection,this.start(e)}retry(){this.stop(),this.failed=!1,this.host.requestUpdate(),this.sync()}async start(e){this.generation+=1;let{generation:t}=this;try{let r=await ro(e,(n)=>{if(t===this.generation)this.receive(n)});if(t===this.generation)this.unsubscribe=r;else await r()}catch{if(t!==this.generation)return;this.connection=void 0,this.failed=!0,this.host.requestUpdate()}}stop(){this.generation+=1,this.connection=void 0;let{unsubscribe:e}=this;if(this.unsubscribe=void 0,!e)return;Promise.resolve().then(()=>e()).catch(()=>{return})}receive(e){this.state=e,this.failed=!1;let t=Date.parse(e.now);this.clockOffset=Number.isNaN(t)?0:t-Date.now(),this.refreshClock(),this.onState?.(e),this.host.requestUpdate()}refreshClock(){this.now=new Date(Date.now()+this.clockOffset)}tick=()=>{if(this.refreshClock(),this.failed)this.sync();this.host.requestUpdate()};onVisibility=()=>{if(!document.hidden)this.refreshClock();this.host.requestUpdate()}}var cc={overdue:0,due:0,in_progress:0,upcoming:1,clean:2,done:3,disabled:4};function rt(e){let t=Date.parse(e.due_at??e.next_due_at??"");return[cc[e.status],Number.isNaN(t)?Number.MAX_SAFE_INTEGER:t,e.title]}function gr(e,t){return e[0]-t[0]||e[1]-t[1]||e[2].localeCompare(t[2])}function vn(e){return e.status==="upcoming"||e.status==="clean"}class Dt{host;hass;pending=new Set;recent=new Map;errors=new Map;celebrating=new Map;armed=new Map;timers=new Set;constructor(e,t){this.host=e,this.hass=t,e.addController(this)}hostDisconnected(){for(let e of this.timers)clearTimeout(e);this.timers.clear(),this.recent.clear(),this.celebrating.clear(),this.errors.clear(),this.armed.clear()}isPending(e){return this.pending.has(e)}error(e){return this.errors.get(e)}celebration(e){return this.celebrating.get(e)}isRecent(e){return this.recent.has(e)}justCompleted(e){return this.recent.get(e)?.completed??!1}frozenKey(e){return this.recent.get(e)?.key}isArmed(e){return this.armed.has(e)}async press(e){if(!vn(e)){await this.advance(e);return}let t=e.task_id,r=this.armed.get(t);if(!r){let n={readyAt:Date.now()+Ho};this.armed.set(t,n),this.later(lc,()=>{if(this.armed.get(t)===n)this.armed.delete(t)}),this.host.requestUpdate();return}if(r.readyAt>Date.now())return;this.armed.delete(t),await this.advance(e)}async advance(e){let t=e.task_id,r=this.recent.get(t);if(this.pending.has(t)||r&&r.coolUntil>Date.now())return;let n=e.stage_index+1>=e.stage_count;if(this.celebrate(t,n?"done":"stage"),!await this.track(e,n,(a)=>no(a,t)))this.celebrating.delete(t);this.host.requestUpdate()}async skip(e){let t=e.task_id;await this.track(e,!1,(r)=>io(r,t)),this.host.requestUpdate()}async undo(e){let t=e.task_id;if(await this.run(t,(n)=>oo(n,t)))this.recent.delete(t);this.host.requestUpdate()}async track(e,t,r){let n=e.task_id;if(!this.hass()||this.pending.has(n))return!1;let s=this.recent.get(n),a=this.remember(e,t),l=await this.run(n,r);if(l)window.dispatchEvent(new CustomEvent("haptic",{detail:t?"success":"light"}));else if(this.recent.get(n)===a)if(s)this.recent.set(n,s);else this.recent.delete(n);return l}remember(e,t){let r=e.task_id,n=Date.now(),s={completed:t,until:n+Po,coolUntil:n+Ho,key:this.recent.get(r)?.key??rt(e)};return this.recent.set(r,s),this.later(Po,()=>{if(this.recent.get(r)===s)this.recent.delete(r)}),s}celebrate(e,t){this.celebrating.set(e,t),this.later(sc,()=>{this.celebrating.delete(e)})}later(e,t){let r=setTimeout(()=>{this.timers.delete(r),t(),this.host.requestUpdate()},e);this.timers.add(r)}async run(e,t){let r=this.hass();if(!r||this.pending.has(e))return!1;this.pending.add(e),this.errors.delete(e),this.host.requestUpdate();try{return await t(r),!0}catch(n){return this.errors.set(e,ve(n)),this.later(ac,()=>{this.errors.delete(e)}),!1}finally{this.pending.delete(e)}}}function ve(e){if(e instanceof Error)return e.message;if(typeof e==="object"&&e!==null&&"message"in e)return String(e.message);return String(e)}var Vo="important",Ro=" !"+Vo,dc=0-Ro.length;class Oo extends Tt{constructor(e){super(e);if(e.type!==dr.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{let n=e[r];if(n==null)return t;return r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase(),t+`${r}:${n};`},"")}update(e,[t]){let{style:r}=e.element;if(this._previousStyleProperties===void 0)return this._previousStyleProperties=new Set(Object.keys(t)),this.render(t);for(let n of this._previousStyleProperties)if(t[n]==null)if(this._previousStyleProperties.delete(n),n.includes("-"))r.removeProperty(n);else r[n]=null;for(let n in t){let s=t[n];if(s!=null){this._previousStyleProperties.add(n);let a=typeof s==="string"&&s.endsWith(Ro);if(n.includes("-")||a)r.setProperty(n,a?s.slice(0,dc):s,a?Vo:"");else r[n]=s}}return ae}}var Mn=ur(Oo);var ce="#1b1f33",o={coral:"#ff7a6b",coralDark:"#d9574b",sun:"#ffc857",sunDark:"#e0a233",mint:"#5fd6a8",mintDark:"#3bb286",sky:"#5ab4ff",skyDark:"#3a8fdb",lilac:"#b79bff",lilacDark:"#9176e0",pink:"#ff8fc7",pinkDark:"#de6aa4",cream:"#f6f1e4",creamDark:"#d9d2bf",metal:"#e8ecf5",metalMid:"#c5cde0",metalDark:"#8c96b3",glass:"#223258",water:"#6cc8f5",waterDark:"#3f9ad6",wicker:"#dd9f5f",wickerDark:"#b97a3f",wickerLight:"#f0bd82",terracotta:"#e0784f",terracottaDark:"#b95a38",soil:"#4a3429",soilWet:"#2f2019",leaf:"#5ccf7a",leafDark:"#3aa65b",stench:"#b4e65a",musty:"#8a9a5e",mustyDark:"#6f7f49",fly:"#2a2d3e",wing:"#dfe7f5",spark:"#fff3c4",check:"#4fd18b"},Tn={resting:{wall:"#262c49",floor:"#1d2239"},accumulating:{wall:"#2b2f55",floor:"#212542"},due:{wall:"#43305f",floor:"#33254a"},running:{wall:"#1f3f6b",floor:"#183154"},waiting:{wall:"#2c4358",floor:"#213443"},clean:{wall:"#17555c",floor:"#114247"}},Io={wall:"#3e4a2b",floor:"#2d3720"};function L(e){return Number.isFinite(e)?Math.min(1,Math.max(0,e)):0}function w(e,t){return t.filter((r)=>e>=r).length}function No(e){let t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function y(e,t,r){let n=L(r),s=No(e),a=No(t);return`#${s.map((u,p)=>Math.round(u+((a[p]??u)-u)*n)).map((u)=>u.toString(16).padStart(2,"0")).join("")}`}function _(e){return Math.round(e*100)/100}function d(e,t,r,n=0,s=1){let a=n?` rotate(${_(n)})`:"",l=s===1?"":` scale(${_(s)})`;return i`<g transform="translate(${_(e)} ${_(t)})${a}${l}">${r}</g>`}function h(e,t,r=0){let n=r?`ht-a-${e} ht-d${r}`:`ht-a-${e}`;return i`<g class=${n}>${t}</g>`}function c(e,t,r){return r===void 0?i`<g data-part=${e}>${t}</g>`:i`<g data-part=${e} data-index=${r}>${t}</g>`}function f(e,t){return e?t():k}function An(e,t){let r=Tn[e],n=e==="clean"?0:L(t)*0.85;return{wall:y(r.wall,Io.wall,n),floor:y(r.floor,Io.floor,n)}}var uc=1.6,Qo=12;function nt(e,t,r,n){let s=2/2**uc,a=(l)=>Math.sign(l)*Math.abs(l)**s;return Array.from({length:Qo+1},(l,u)=>{let p=(n+u*90/Qo)*Math.PI/180;return`L${_(e+r*a(Math.cos(p)))} ${_(t+r*a(Math.sin(p)))}`}).join("")}function yr(e,t,r,n,s){let a=e+r-s,l=t+n-s;return`M${[nt(a,t+s,s,-90),nt(a,l,s,0),nt(e+s,l,s,90),nt(e+s,t+s,s,180)].join("").slice(1)}Z`}var pc=192,hc=yr(0,0,200,200,28),fc="M0 168H200V200H0Z",mc=`M0 168H200V172${nt(172,172,28,0)}${nt(28,172,28,90)}Z`;function I(e,t,r,n,s=!0){let a=r?.animations!==!1,l=r?.bleed===!0,u=An(t.state,t.stink),p=`ht-scene ht-scene-${e}${a?" ht-animated":""}`,m=r?.label??e;return g`<svg
    class=${p}
    viewBox=${l?`0 0 200 ${pc}`:"0 0 200 200"}
    role="img"
    aria-label=${m}
    data-scene=${e}
    data-state=${t.state}
  >
    ${l?i`<rect data-part="tile" width="200" height="200" fill=${u.wall} />`:i`<path data-part="tile" d=${hc} fill=${u.wall} />`}
    ${s?i`<circle cx="100" cy="98" r="86" fill="#fff" opacity=".05" /><path data-part="floor" d=${l?fc:mc} fill=${u.floor} />`:k}
    ${n}
  </svg>`}function Fo(e){if(e.name!=="generic")return An(e.state,e.stink);let{wall:t}=An(e.state,0);return{wall:t,floor:t}}function A(e,t,r,n=0.28){return i`<ellipse cx=${e} cy=${t} rx=${r} ry="6" fill="#0c0f1e" opacity=${n} />`}function V(e,t,r,n,s=1){let a=(p)=>i`<path d=${p} fill="none" stroke=${n} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,l=(p,m=3.2)=>i`<circle cx=${p} cy="0" r=${m} fill=${n} />`,u={happy:[a("M-15 1q4-6 8 0"),a("M7 1q4-6 8 0"),a("M-5 7q5 6 10 0")],calm:[l(-11),l(11),a("M-4 8q4 3 8 0")],sleepy:[a("M-15 0h8"),a("M7 0h8"),a("M-3 9h6")],worried:[l(-11),l(11),a("M-16-8l7-3"),a("M16-8l-7-3"),a("M-6 11q3-5 6-2t6-1")],pleading:[i`<circle cx="-11" cy="0" r="5" fill=${n} /><circle cx="-9.4" cy="-1.8" r="1.7" fill="#fff" />`,i`<circle cx="11" cy="0" r="5" fill=${n} /><circle cx="12.6" cy="-1.8" r="1.7" fill="#fff" />`,a("M-3 10q3-3 6 0")],sick:[a("M-15-4l7 7m0-7l-7 7"),a("M8-4l7 7m0-7l-7 7"),a("M-8 12q4-5 8-1t8-1")]};return c("face",d(e,t,u[r],0,s))}function v(e,t,r,n){return c("sparkle",d(e,t,h("twinkle",i`<path d=${"M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z"} fill=${o.spark} />`,n),0,r))}var gc="M0 0c-9-7 9-13 0-20c-9-7 9-13 0-20";function R(e,t=0){return e.map(([r,n],s)=>c("stench",d(r,n,h("waft",i`<path d=${gc} fill="none" stroke=${o.stench} stroke-width="5.5" stroke-linecap="round" />`,s+t+1)),s+t))}function N(e,t,r){let n=i`<path d="M-24 10q10 12 17-1" fill="none" stroke=${o.wing} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 5" opacity=".75" />`,s=i`
    <ellipse cx="-3.5" cy="-7" rx="6" ry="3.4" transform="rotate(30 -3.5 -7)" fill=${o.wing} />
    <ellipse cx="3.5" cy="-7" rx="6" ry="3.4" transform="rotate(-30 3.5 -7)" fill=${o.wing} />
    <ellipse rx="5.2" ry="6.2" fill=${o.fly} stroke=${o.wing} stroke-width="1.4" />
  `;return c("fly",d(e,t,h("buzz",[n,s],r%3+1)),r)}function O(e,t,r,n=1){return d(e,t,i`<path d=${"M0-8C4-3 6 0 6 3a6 6 0 0 1-12 0C-6 0-4-3 0-8Z"} fill=${r} />`,0,n)}function de(e,t){let r=(n,s)=>`${_(n*e)} ${_(s*t)}`;return[`M${r(-1,0.25)}`,`C${r(-1.05,-0.55)} ${r(-0.45,-1)} ${r(0.05,-0.92)}`,`C${r(0.75,-1)} ${r(1.08,-0.4)} ${r(1,0.2)}`,`C${r(1,0.8)} ${r(0.55,0.96)} ${r(0,0.92)}`,`C${r(-0.6,1)} ${r(-1,0.75)} ${r(-1,0.25)}Z`].join("")}function B(e,t,r,n,s,a,l=0){let u=`M${_(-r*0.45)} ${_(n*0.05)}q${_(r*0.35)} ${_(-n*0.5)} ${_(r*0.8)} ${_(n*0.05)}`;return d(e,t,i`<path d=${de(r,n)} fill=${s} /><path d=${u} fill="none" stroke=${a} stroke-width="3" stroke-linecap="round" />`,l)}var yc="M-11-24L-30-13L-24 2L-15-2V24H15V-2L24 2L30-13L11-24C8-18-8-18-11-24Z";function br(e,t,r,n,s=0,a=1){return d(e,t,i`<path d=${yc} fill=${r} stroke-linejoin="round" /><path d="M-15-2V8M15-2V8" stroke=${n} stroke-width="2.6" stroke-linecap="round" /><path d="M-11-24C-8-18 8-18 11-24" fill="none" stroke=${n} stroke-width="3" stroke-linecap="round" />`,s,a)}function Ce(e,t,r,n,s=0,a=1){return d(e,t,i`<path d="M-8-22H8V2L20 10C27 15 22 25 13 22L-4 15C-7 13-8 11-8 8Z" fill=${r} /><path d="M-8-15H8" stroke=${n} stroke-width="5" /><path d="M-8-22H8" stroke=${n} stroke-width="4" stroke-linecap="round" />`,s,a)}var kr=6,bc=[0.05,0.25,0.45,0.65,0.85],kc=[0.15,0.4,0.7],$c=[0.45,0.7,0.92],_c=[0.55,0.85],wc=[0.65,0.9],xc=2;function Zo(e,t){if(e>=0.5)return"horrified";if(e>=0.2)return"worried";return t}function vc(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink),a={scale:0,mould:w(n,bc)*xc,stench:w(n,kc),flies:0,sludge:w(n,_c),duck:"calm",bottle:"none",foam:0,sponge:!1,timer:!1,gleam:!1,dim:!1,mood:"calm"};if(t==="clean")return{...a,duck:"happy",gleam:!0,mood:"happy"};if(t==="running")return{...a,scale:Math.min(2,Math.floor(r*kr)),duck:"happy",bottle:"spraying",foam:2,sponge:!0,mood:"happy"};if(t==="waiting")return{...a,flies:w(n,wc),duck:Zo(n,"calm"),foam:1,timer:!0,mood:n>=0.5?"worried":"calm"};let l=t==="due",u=l?kr:Math.min(kr-1,Math.floor(r*kr)),p=u>=4?"worried":"calm";if(t==="resting")p="sleepy";if(l)p="pleading";if(n>=0.45)p="sick";let m=u>=4?"worried":"calm";if(t==="resting")m="asleep";if(l)m="pleading";return{...a,scale:u,flies:w(n,$c),duck:Zo(n,m),bottle:l?"waiting":"none",dim:t==="resting",mood:p}}var zo="#3a4466",Et="#d9c98a",Mc="#a9a463",it="#3d5a48",Uo="#ff9a3d",Sn="#6f8f35",qo=26,Bo=29,Ac=32,Wo=5,Cn=7;function Tc(e){let t=e.gleam?0.13:e.dim?0.04:0.07,r=Array.from({length:Wo*Cn},(n,s)=>s);return c("tiles",[r.map((n)=>{let s=n%Cn,a=Math.floor(n/Cn),l=Ac+a*Bo,u=a===Wo-1?20:qo,p=(s+a)%2===0;return i`<rect x=${s*Bo} y=${l} width=${qo} height=${u} rx="3" fill=${p?"#fff":o.sky} opacity=${p?t:t*1.4} />`}),i`<rect y="26" width="200" height="4" fill="#fff" opacity=${t*1.3} />`])}var Sc=[[85.5,30.5,1.05],[143.5,88.5,1],[27.5,59.5,1.05],[114.5,88.5,0.9],[114.5,30.5,1],[13.5,117.5,0.8],[56.5,30.5,1.15],[186.5,117.5,0.8],[172.5,59.5,0.85],[85.5,88.5,0.95]];function Cc(e,t,r,n){let s=n%2===0?1:-1;return c("mould",d(e,t,i`
        <circle cx="-3" cy="1" r="9" fill=${it} />
        <circle cx="7" cy="-5" r="6.5" fill=${it} />
        <circle cx="6" cy="6" r="5.5" fill=${it} />
        <circle cx="-11" cy="-6" r="4.5" fill=${it} />
        <circle cx="-15" cy="5" r="2.2" fill=${it} />
        <circle cx="15" cy="3" r="2" fill=${it} />
        <circle cx="-5" cy="-2" r="2.6" fill=${o.musty} />
        <circle cx="6" cy="-6" r="1.9" fill=${o.musty} />
        <circle cx="4" cy="6" r="1.6" fill=${o.musty} />
      `,s*6,r),n)}var Lc=[[50,16,1],[150,22,2],[74,12,3],[130,15,4],[61,8,5],[162,30,6]];function Dc(e,t){return i`<path d=${`M${e-4} 114V${114+t}a4 4 0 0 0 8 0V114Z`} fill=${Et} />`}function Ec(e){return[Lc.filter(([,,t])=>e>=t).map(([t,r,n])=>c("limescale",Dc(t,r),n)),f(e>=3,()=>c("scale-ring",i`<path d="M34 138Q66 131 80 133M120 133Q140 131 166 138" fill="none" stroke=${Et} stroke-width="4" stroke-linecap="round" />`)),f(e>=5,()=>c("scale-ring",i`<path d="M38 150Q50 147 62 147M138 147Q150 147 162 150" fill="none" stroke=${Et} stroke-width="3.4" stroke-linecap="round" opacity=".85" />`))]}function Pc(e){return c("head-crust",[[131,59,3.4],[144,60,2.8],[153,59,3.1]].slice(0,Math.ceil(e/2)).map(([r,n,s])=>i`<circle cx=${r} cy=${n} r=${s} fill=${Et} />`))}function Hc(e,t,r){return c("shower",[i`<path d="M170 106V48Q170 26 150 26H142V38" fill="none" stroke=${r} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />`,i`<path d="M170 106V48Q170 26 150 26H142V38" fill="none" stroke=${t} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,i`<path d="M124 53Q124 36 142 36Q160 36 160 53Z" fill=${t} />`,i`<rect x="120" y="51" width="44" height="7" rx="3.5" fill=${r} />`,i`<rect x="160" y="82" width="20" height="9" rx="4.5" fill=${r} />`,i`<circle cx="160" cy="86.5" r="6" fill=${o.sky} /><circle cx="180" cy="86.5" r="6" fill=${o.coral} />`,f(e.scale>=2,()=>Pc(e.scale))])}function Vc(e){let t=e.sludge/2,r=Math.max(e.scale*0.03,t*0.5+e.mould*0.015),n=e.dim?0.36:0,s=(b)=>y(y(b,e.scale>0&&!e.mould?Et:Mc,r),"#262c49",n),a=e.gleam?"#ffffff":s("#fbfcff"),l=e.gleam?"#f3f7ff":s("#e8edf7"),u=e.gleam?"#d7e2f5":s(o.metalMid),p=e.dim?y(o.sun,"#262c49",n):o.sun,m=e.dim?y(o.sunDark,"#262c49",n):o.sunDark;return c("tub",[[50,150].map((b)=>i`<path d=${`M${b-11} 166H${b+11}L${b+7} 180Q${b+6} 184 ${b+2} 184H${b-2}Q${b-6} 184 ${b-7} 180Z`} fill=${p} /><path d=${`M${b-10} 170H${b+10}`} stroke=${m} stroke-width="3" stroke-linecap="round" />`),i`<path d="M28 108H172V140Q172 174 138 174H62Q28 174 28 140Z" fill=${l} />`,i`<path d="M28 140Q28 174 62 174H138Q172 174 172 140V137Q168 164 134 164H66Q32 164 28 137Z" fill=${u} />`,i`<rect x="20" y="100" width="160" height="15" rx="7.5" fill=${a} />`,i`<path d="M20 110.5Q20 115 27.5 115H172.5Q180 115 180 110.5Z" fill=${u} opacity=".55" />`,i`<path d="M40 122V142" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=${e.gleam?1:0.55} />`,f(e.gleam,()=>c("gleam",i`<path d="M160 122V136M40 150Q44 156 50 158" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" />`))])}var Rc="#2b2740",Oc="M19-36Q31-36 33-32Q31-27 19-28Z";function Ic(e){let t=Rc,r=(n)=>i`<path d=${n} fill="none" stroke=${t} stroke-width="2.6" stroke-linecap="round" />`;if(e==="asleep")return r("M6-34q4 3.6 8 0");if(e==="happy")return r("M6-33q4-6 8 0");if(e==="pleading")return i`<circle cx="11" cy="-34" r="5" fill=${t} /><circle cx="12.8" cy="-36" r="1.9" fill="#fff" />`;if(e==="horrified")return i`<circle cx="10" cy="-35" r="6.6" fill="#fff" /><circle cx="10.5" cy="-35" r="1.8" fill=${t} />`;if(e==="worried")return[i`<circle cx="11" cy="-34" r="2.8" fill=${t} />`,r("M5-41.5l8-2.5")];return i`<circle cx="11" cy="-34" r="2.8" fill=${t} />`}function Nc(e,t,r){if(e==="horrified")return i`<path d="M20-35H31L30-25H20Z" fill="#6b2233" /><path d="M20-41Q30-43 35-38Q30-33 20-34Z" fill=${t} /><path d="M20-26Q27-27 31-25Q27-19 20-20Z" fill=${r} />`;return i`<path d=${Oc} fill=${t} /><path d="M21-32H32" stroke=${r} stroke-width="1.6" stroke-linecap="round" />`}function Qc(){return c("foam-hat",i`
      <circle cx="9" cy="-46" r="8" fill="#dbe6f7" />
      <circle cx="1" cy="-44" r="5.5" fill="#fff" />
      <circle cx="9" cy="-48" r="7.5" fill="#fff" />
      <circle cx="17" cy="-45" r="5" fill="#fff" />
      <circle cx="10" cy="-56" r="3.8" fill="#fff" />
    `)}function Fc(e,t,r){let n=t?y(o.sun,"#262c49",0.3):o.sun,s=t?y(o.sunDark,"#262c49",0.3):o.sunDark,a=t?y(Uo,"#262c49",0.3):Uo,l=t?y(o.coralDark,"#262c49",0.3):o.coralDark;return[i`<path d="M-26-27C-21-19-16-20-8-22C3-24 19-21 22-9C24 1 13 2 0 2H-8C-22 2-29-11-26-27Z" fill=${n} />`,i`<circle cx="9" cy="-33" r="13.5" fill=${n} />`,i`<path d="M-13-13Q-3-20 7-12Q1-3-8-5Q-13-7-13-13Z" fill=${s} />`,Nc(e,a,l),Ic(e),f(e==="happy",()=>i`<circle cx="6" cy="-27" r="3" fill=${o.pink} opacity=".75" />`),f(r,Qc)]}function Zc(){return c("snooze",[d(94,42,h("drift",i`<path d=${"M0 0h9l-9 10h9"} fill="none" stroke=${o.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,1)),d(108,24,h("drift",i`<path d=${"M0 0h9l-9 10h9"} fill="none" stroke=${o.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,3),0,0.7)])}function zc(){return c("panic",[d(28,58,h("drip",O(0,0,o.water,0.9),1)),d(74,42,h("drip",O(0,0,o.water,0.72),3))])}function Uc(e){let t=e.foam>0,r=e.foam===2?-2:0,n={asleep:7,calm:0,pleading:-4,worried:-6,horrified:-12,happy:0},s=Fc(e.duck,e.dim,t),a=e.duck==="happy"?h("bob",s):e.duck==="horrified"?h("rumble",s):s;return c("duck",d(e.bottle==="spraying"?44:50,101-r,a,n[e.duck],1.12))}function jo(){return[i`<path d="M-14 0H14V-26C14-34 7-36 6-42H-6C-7-36-14-34-14-26Z" fill=${o.mint} />`,i`<rect x="-14" y="-24" width="28" height="15" fill=${o.cream} />`,i`<circle cy="-16.5" r="4.6" fill=${o.sky} />`,i`<rect x="-5.5" y="-49" width="11" height="8" rx="2" fill=${o.coralDark} />`,i`<path d="M-27-61H9Q13-61 13-57V-52Q13-48 9-48H-11L-15-54H-27Q-30-54-30-57.5Q-30-61-27-61Z" fill=${o.coral} />`,i`<path d="M-5-47Q-14-44-15-33" fill="none" stroke=${o.coralDark} stroke-width="4.4" stroke-linecap="round" />`,i`<path d="M-9-37V-5" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".4" />`]}function qc(){return c("spray-bottle",d(106,101,h("wobble",jo()),0,0.9))}function Bc(e){return[e.map(([t,r,n])=>i`<circle cx=${t} cy=${r} r=${n+1.6} fill="#c8d6ee" /><circle cx=${t-0.8} cy=${r-1.2} r=${n} fill="#fff" />`)]}var Wc=[[94,89,13],[132,90,13],[76,94,10],[150,96,9],[113,94,12]],jc=[[104,70,10],[78,74,9],[130,73,9],[92,82,18],[136,86,16],[70,88,15],[154,92,11],[116,90,15],[50,92,12],[32,96,9]];function Yc(e){return c("foam",Bc(e===2?jc:Wc))}function Kc(e){return c("foam-drip",(e===2?[[64,26],[136,14]]:[[78,20],[122,14],[150,16]]).map(([r,n])=>i`<path d=${`M${r-7} 106V${108+n}a7 7 0 0 0 14 0V106Z`} fill="#fff" />`))}function Ue(e,t,r,n){return c("bubble",d(e,t,h("rise",i`<circle r=${r} fill=${o.water} opacity=".22" /><circle r=${r} fill="none" stroke="#d6f2ff" stroke-width="2.2" /><circle cx=${-r*0.35} cy=${-r*0.35} r=${r*0.24} fill="#fff" />`,n)))}function Gc(){return c("spray-bottle",[c("mist",[[78,44,3.6,1],[70,54,2.8,2],[84,58,3.2,3],[66,42,2.4,4],[94,66,2.6,2]].map(([t,r,n,s])=>d(t,r,h("flicker",i`<circle r=${n} fill="#eaf8ff" />`,s)))),d(122,74,h("rumble",jo()),-30,0.8)])}function Xc(){return c("sponge",d(142,136,h("wobble",[i`<circle cx="-18" cy="10" r="7" fill="#fff" /><circle cx="17" cy="11" r="6" fill="#fff" /><circle cx="-4" cy="15" r="6" fill="#fff" />`,i`<rect x="-20" y="-6" width="40" height="17" rx="6" fill=${o.mint} />`,i`<rect x="-20" y="-15" width="40" height="17" rx="6" fill=${o.sun} />`,i`<circle cx="-10" cy="-8" r="2.4" fill=${o.sunDark} /><circle cx="1" cy="-10" r="1.8" fill=${o.sunDark} /><circle cx="11" cy="-7" r="2.6" fill=${o.sunDark} />`]),-10))}function Jc(){return c("hourglass",d(106,72,[i`<path d="M-13-22H13V-12Q13-5 3.5 0Q13 5 13 12V22H-13V12Q-13 5-3.5 0Q-13-5-13-12Z" fill="#d6ecff" />`,i`<path d="M-9-11H9Q7-5 0-1Q-7-5-9-11Z" fill=${o.sun} />`,i`<path d="M-11 20Q-8 9 0 8Q8 9 11 20Z" fill=${o.sun} />`,h("drip",i`<rect x="-1.2" y="-1" width="2.4" height="9" fill=${o.sunDark} />`),i`<rect x="-18" y="-29" width="36" height="8" rx="4" fill=${o.wicker} />`,i`<rect x="-18" y="21" width="36" height="8" rx="4" fill=${o.wicker} />`]))}function ed(){return c("plea",[d(134,86,h("pulse",i`<path d="M0-13V2" stroke=${o.sun} stroke-width="6" stroke-linecap="round" /><circle cy="11" r="3.6" fill=${o.sun} />`))])}function td(e){return c("sludge",[f(e>=1,()=>i`<path d="M116 106Q116 98 124 99Q132 96 140 99Q150 96 158 99Q168 98 168 106V112Q168 118 160 118H158V134a5 5 0 0 1-10 0V118H136V126a4.5 4.5 0 0 1-9 0V118H124Q116 118 116 112Z" fill=${Sn} /><path d="M124 105Q130 102 136 104" fill="none" stroke=${o.stench} stroke-width="3" stroke-linecap="round" />`),f(e>=2,()=>i`<ellipse cx="60" cy="182" rx="26" ry="5.5" fill=${Sn} /><ellipse cx="140" cy="186" rx="18" ry="3.6" fill=${Sn} />`)])}function Yo(e,t){let r=vc(e),n=r.dim?y(o.metal,"#262c49",0.4):o.metal,s=r.dim?y(o.metalDark,"#262c49",0.4):o.metalDark,a=[[15,98],[185,78],[185,164]],l=[[100,22],[188,40],[20,34]],u=[Tc(r),Sc.slice(0,r.mould).map(([p,m,b],x)=>Cc(p,m,b,x)),A(100,184,78),Hc(r,n,s),f(r.dim,()=>d(142,66,h("drip",O(0,0,o.waterDark,0.8)))),f(r.foam>0,()=>Yc(r.foam)),Vc(r),Ec(r.scale),f(r.foam>0,()=>Kc(r.foam)),f(r.sludge>0,()=>td(r.sludge)),V(100,146,r.mood,r.dim?y(zo,"#262c49",0.3):zo,1.05),Uc(r),f(r.duck==="asleep",Zc),f(r.duck==="horrified",zc),f(r.bottle==="waiting",()=>[qc(),ed()]),f(r.bottle==="spraying",Gc),f(r.sponge,Xc),f(r.timer,Jc),f(r.foam===2,()=>[Ue(182,62,7,1),Ue(24,40,6,2),Ue(148,66,5,3),Ue(17,72,7,4),Ue(52,20,5,5)]),f(r.gleam,()=>[v(116,76,1.25,1),v(184,128,0.9,2),v(92,50,0.75,3),v(24,46,0.85,4),v(16,136,0.7,5),Ue(142,88,7,2),Ue(84,84,5,4)]),R(a.slice(0,r.stench)),l.slice(0,r.flies).map(([p,m],b)=>N(p,m,b))];return I("bathroom",e,t,u)}var Ln=5,rd=[0.05,0.25,0.5],nd=[0.15,0.4],id=[0.45,0.65,0.85],od=[0.2,0.5,0.75],sd=[0.7,0.92];function ad(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink),s={stains:w(n,rd),crumbs:w(n,nd),mites:w(n,id),stench:w(n,od),flies:w(n,sd)},a={rumple:0,stool:!1,night:!1,pretty:!1,...s};if(t==="clean")return{...a,view:"made",pretty:!0,mood:"happy"};if(t==="running")return{...a,view:"changing",stains:Math.min(s.stains,2),mites:0,mood:"happy"};if(t==="waiting")return{...a,view:"bare",mood:n>=0.6?"sick":"calm"};if(t==="due")return{...a,view:"made",rumple:Ln,stool:!0,mood:n>=0.45?"sick":"pleading"};let l=t==="resting"?0:Math.min(Ln-1,Math.floor(r*Ln)),u=t==="resting"?"sleepy":l>=3?"worried":"calm";if(n>=0.45)u="sick";return{...a,view:"made",rumple:l,night:t==="resting",mood:u}}var ld="#2b3566",Ko="#e7dfff",En="#a8925a",cd="#5b3413",dd="#c9dcf3",Pt=122,Ht=154,$r=175,Go=[1,-0.7,1.15,-0.9,0.8,-1.1];function is(e){let t=e.stains*0.13,r=(n,s=!0)=>y(s?y(n,"#8f8a66",t):n,ld,e.night?0.3:0);return{wood:r(o.wicker,!1),woodDark:r(o.wickerDark,!1),woodLight:r(o.wickerLight,!1),top:r(o.lilac),side:r(y(o.lilac,o.lilacDark,0.7)),crease:r(y(o.lilacDark,"#5f4aa8",0.45)),cuff:r(Ko),cuffShade:r(y(Ko,o.lilac,0.55)),pillow:r(o.cream),pillowShade:r(o.creamDark)}}function Dn(e,t,r,n,s,a){return Array.from({length:a},(l,u)=>{let p=(u+0.5)/a,m=(u+1)/a,b=Go[u%Go.length]??1;return`Q${_(e+(r-e)*p)} ${_(t+(n-t)*p+s*b)} ${_(e+(r-e)*m)} ${_(t+(n-t)*m)}`}).join("")}function os(e,t,r){return d(t,184,d(-100,-184,e),0,r)}function ss(e,t){return c("headboard",[i`<rect x="26" y="70" width="14" height="110" rx="6" fill=${e.woodDark} /><rect x="160" y="70" width="14" height="110" rx="6" fill=${e.woodDark} />`,i`<circle cx="33" cy="66" r="9" fill=${e.woodLight} /><circle cx="167" cy="66" r="9" fill=${e.woodLight} />`,i`<path d="M36 134V84C36 62 66 50 100 50C134 50 164 62 164 84V134Z" fill=${e.wood} />`,i`<path d="M46 134V88C46 70 72 60 100 60C128 60 154 70 154 88V134Z" fill=${e.woodLight} />`,V(100,76,t,cd,1)])}function as(e){return c("frame",[i`<rect x="30" y="172" width="14" height="13" rx="3" fill=${e.woodDark} /><rect x="156" y="172" width="14" height="13" rx="3" fill=${e.woodDark} />`,i`<rect x="20" y="164" width="160" height="14" rx="6" fill=${e.wood} />`])}var Vt="M-27-15Q0-21 27-15Q33 0 27 15Q0 21-27 15Q-33 0-27-15Z";function Xo(e,t,r,n,s,a,l){return c("pillow",d(e,t,[i`<path d=${Vt} fill=${a} stroke=${a} stroke-width="7" stroke-linejoin="round" />`,i`<path d=${Vt} fill=${s} stroke=${s} stroke-width="3" stroke-linejoin="round" />`,l?i`<path d="M-14 1q14 10 28-2" fill="none" stroke=${a} stroke-width="3.5" stroke-linecap="round" />`:i`<path d="M-22-9q5 3 3 8" fill="none" stroke=${a} stroke-width="3" stroke-linecap="round" />`],r,n))}function ud(e,t){let r=e.rumple,n=e.pretty?1.06:1,s=r>=2;return[Xo((e.pretty?67:70)-r*1.2,108+r*0.5,-r*2.6,n,t.pillow,t.pillowShade,s),Xo((e.pretty?133:130)+r*2,108+r*1.2,r*5,n,t.pillow,t.pillowShade,s)]}var pd=[[1,"M58 142q14-8 28 0"],[1,"M122 136q12 7 26-1"],[2,"M92 147q11-8 24-1"],[2,"M46 164q8 5 15 0"],[3,"M138 164q9-5 17 1"],[3,"M84 141q9 4 17-1"],[4,"M96 166q9-6 18 0"],[4,"M36 148q10-6 19-1"],[5,"M146 148q9 5 19-2"],[5,"M70 170q7-5 13 0"]];function hd(e,t,r,n,s){let a=[0,72,144,216,288].map((l)=>i`<ellipse cx="0" cy="-5.2" rx="3.4" ry="4.4" transform=${`rotate(${l})`} fill=${r} />`);return d(e,t,[a,i`<circle r="2.8" fill=${n} />`],0,s)}function fd(){return c("pattern",[[70,145,0.82],[100,145,0.82],[130,145,0.82],[40,166,1],[80,166,1],[120,166,1],[160,166,1]].map(([t,r,n])=>hd(t,r,o.cream,o.sun,n)))}function md(){return Array.from({length:11},()=>"q-5.8 9-11.6 0").join("")}function gd(e,t){let r=e.rumple,n=[0,2,3.5,5.5,8,11][r]??0,s=r*1.1,a=r*1.1,l=Dn(177,$r,23,$r,n,6),u=`M44 ${Pt}L156 ${Pt}Q${167+a} ${Pt+18} 177 ${Ht}L177 ${$r}${l}L23 ${Ht}Q${33-a} ${Pt+18} 44 ${Pt}Z`,p=`M23 ${Ht}${Dn(23,Ht,177,Ht,s,5)}L177 ${$r}${l}Z`,m=e.pretty?md():Dn(166,134,34,134,r*1.2,4);return c("blanket",[i`<path d=${u} fill=${t.top} stroke=${t.top} stroke-width="5" stroke-linejoin="round" />`,i`<path d=${p} fill=${t.side} stroke=${t.side} stroke-width="5" stroke-linejoin="round" />`,f(e.pretty,fd),i`<path d=${`M42 120H158L${e.pretty?165.8:166} 134${m}L42 120Z`} fill=${t.cuff} stroke=${t.cuff} stroke-width="3" stroke-linejoin="round" data-part="cuff" />`,i`<path d="M50 127H150" stroke=${t.cuffShade} stroke-width="2.6" stroke-linecap="round" />`,pd.filter(([b])=>r>=b).map(([,b])=>i`<path d=${b} fill="none" stroke=${t.crease} stroke-width="3.4" stroke-linecap="round" data-part="crease" />`),f(r>=4,()=>c("flipped",i`<path d="M176 155L146 153Q160 149 164 136Q172 146 176 155Z" fill=${t.cuff} stroke=${t.cuff} stroke-width="3" stroke-linejoin="round" /><path d="M150 151Q160 146 164 140" fill="none" stroke=${t.cuffShade} stroke-width="2.4" stroke-linecap="round" />`))])}function yd(e){return[[120,141,13,6.5],[58,160,11,7.5],[146,162,9,6.5]].slice(0,e).map(([r,n,s,a],l)=>c("stain",d(r,n,i`<path d=${de(s,a)} fill=${En} /><path d=${de(s*0.55,a*0.5)} fill=${y(En,"#6d5a30",0.55)} />`),l))}var Jo=[[78,141,2.6],[86,147,2],[71,148,1.8],[96,139,1.6],[150,146,2.6],[142,151,2],[156,153,1.7],[108,158,2.3]];function ls(e){let t=e>=2?Jo.length:4;return e>0?c("crumbs",Jo.slice(0,t).map(([r,n,s])=>i`<circle cx=${r} cy=${n} r=${s} fill=${o.sunDark} />`)):[]}function bd(e,t,r){return c("mite",d(e,t,h("wobble",[i`<path d=${"M-9-3l-6-3M-10 2h-7M-8 6l-6 4M9-3l6-3M10 2h7M8 6l6 4"} fill="none" stroke=${o.mustyDark} stroke-width="2.4" stroke-linecap="round" />`,i`<path d="M-4-10l-3-6M4-10l3-6" fill="none" stroke=${o.mustyDark} stroke-width="2.2" stroke-linecap="round" />`,i`<circle r="11.5" fill=${o.musty} />`,i`<circle cx="-4.6" cy="-1.6" r="4.2" fill="#fff" /><circle cx="4.6" cy="-1.6" r="4.2" fill="#fff" />`,i`<circle cx="-3.8" cy="-1" r="2.2" fill=${o.fly} /><circle cx="5.4" cy="-1" r="2.2" fill=${o.fly} />`,i`<path d="M-3 6q3 2.6 6 0" fill="none" stroke=${o.fly} stroke-width="1.8" stroke-linecap="round" />`],r%3+1)),r)}var kd=[[62,142],[140,150],[100,164]];function cs(e){return kd.slice(0,e).map(([t,r],n)=>bd(t,r,n))}function ds(e,t,r){return c("fresh-set",d(e,t,[i`<rect x="-24" y="-13" width="48" height="13" rx="6" fill=${o.lilac} />`,i`<rect x="-22" y="-25" width="44" height="13" rx="6" fill=${o.cream} />`,i`<rect x="-20" y="-37" width="40" height="13" rx="6" fill=${o.pink} />`,i`<path d="M-18-6.5h36M-16-18.5h32M-14-30.5h28" stroke="#000" stroke-opacity=".12" stroke-width="2.6" stroke-linecap="round" />`,i`<rect x="-3.5" y="-37" width="7" height="37" fill=${o.sun} />`,i`<path d="M0-38C-12-49-16-37-3-37M0-38C12-49 16-37 3-37" fill=${o.sun} stroke=${o.sunDark} stroke-width="1.6" stroke-linejoin="round" />`],0,r))}function $d(){return c("stool",[A(162,184,24),i`<path d="M148 146L142 184M176 146L182 184" stroke=${o.wickerDark} stroke-width="6.5" stroke-linecap="round" />`,i`<path d="M146 168H178" stroke=${o.wickerDark} stroke-width="4.5" stroke-linecap="round" />`,i`<rect x="138" y="138" width="48" height="10" rx="5" fill=${o.wickerLight} />`])}function _d(){return c("moon",d(42,36,h("bob",i`<path d="M6-17A18 18 0 1 0 17 8A14.5 14.5 0 0 1 6-17Z" fill=${o.sun} />`)))}function es(e,t,r,n){return c("zed",d(e,t,h("drift",i`<path d="M-7-7H7L-7 7H7" fill="none" stroke=${o.cream} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`,n),-8,r))}function wd(){return[_d(),es(134,42,0.9,1),es(153,28,1.2,2),d(84,24,h("twinkle",i`<circle r="2.6" fill=${o.spark} />`,2)),d(178,66,h("twinkle",i`<circle r="2.2" fill=${o.spark} />`,3)),d(18,76,h("twinkle",i`<circle r="2" fill=${o.spark} />`,1))]}var xd=[[18,128],[182,122],[100,46]],vd=[[40,34],[152,22]],Md=[[72,26],[120,28]],Ad=[[40,34],[96,28]];function ts(e){return[R(xd.slice(0,e.stench)),(e.night?Md:vd).slice(0,e.flies).map(([t,r],n)=>N(t,r,n))]}function rs(e){let t=is(e);return[A(100,184,80),ss(t,e.mood),as(t),ud(e,t),gd(e,t),yd(e.stains),ls(e.crumbs),cs(e.mites)]}function Td(e){if(e.stool)return[os(rs(e),78,0.82),$d(),d(162,138,h("bob",ds(0,0,0.92))),v(176,82,0.7,2),v(142,92,0.5,4),ts(e)];return[rs(e),f(e.night,wd),f(e.pretty,()=>[v(26,46,1.25,1),v(174,40,1.05,2),v(100,26,0.85,3),v(20,134,0.7,4),v(180,130,0.8,5)]),ts(e)]}function Sd(){let e=Array.from({length:7},(t,r)=>(r+1)/8);return c("mattress",[i`<path d="M44 116H156L178 150V172H22V150Z" fill=${o.metal} stroke=${o.metal} stroke-width="6" stroke-linejoin="round" />`,e.map((t)=>i`<path d=${`M${_(44+112*t)} 118L${_(22+156*t)} 150V172`} fill="none" stroke=${dd} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`),i`<path d="M21 150H179" stroke=${o.metalMid} stroke-width="4.5" stroke-linecap="round" />`])}function ns(e,t){return c("bare-pillow",d(e,107,[i`<path d=${Vt} fill=${o.metalDark} stroke=${o.metalDark} stroke-width="7" stroke-linejoin="round" />`,i`<path d=${Vt} fill=${o.metalMid} stroke=${o.metalMid} stroke-width="3" stroke-linejoin="round" />`,i`<path d="M-18-13V13M-6-15V15M6-15V15M18-13V13" stroke=${o.metalDark} stroke-opacity=".55" stroke-width="2.6" stroke-linecap="round" />`],t,0.92))}function us(e,t){let r=is({...e,night:!1,stains:0});return[A(100,184,80),ss(r,t),as(r),Sd()]}var Cd="M14 60C22 28 52 36 76 22C100 8 126 30 150 18C168 9 182 24 187 42",Ld="C176 68 154 50 130 64C108 76 88 58 66 68C44 78 26 66 14 60Z";function Dd(){let e=[[36,48],[58,40],[80,34],[104,28],[130,36],[152,30],[172,36],[48,60],[72,52],[96,50],[120,52],[144,48],[166,50]],t=y(o.creamDark,o.sky,0.35);return c("sheet",h("bob",d(100,46,h("sway",d(-100,-46,[i`<path d="M14 60C26 78 46 84 66 76C88 66 108 84 130 72C154 58 176 76 187 42C176 54 154 42 130 54C108 66 88 48 66 58C44 68 26 66 14 60Z" fill=${t} stroke=${t} stroke-width="3" stroke-linejoin="round" />`,i`<path d=${Cd+Ld} fill=${o.cream} stroke=${o.cream} stroke-width="4" stroke-linejoin="round" />`,e.map(([r,n])=>i`<circle cx=${r} cy=${n} r="2.8" fill=${o.sky} />`),i`<path d="M66 66Q70 50 62 38M130 62Q124 46 134 32" fill="none" stroke=${o.creamDark} stroke-width="3.4" stroke-linecap="round" />`])))))}function Ed(){return c("swoosh",[[10,108,"M0 0q10-8 20-4"],[170,104,"M0-4q10-4 20 4"],[14,132,"M0 0q7-6 15-3"],[171,129,"M0-3q8-3 15 3"]].map(([t,r,n],s)=>d(t,r,h("flicker",i`<path d=${n} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,s%2+1))))}function ps(e){return[[78,138,13,6.5],[132,160,11,6.5],[58,160,9,6]].slice(0,e).map(([r,n,s,a],l)=>c("stain",d(r,n,i`<path d=${de(s,a)} fill=${En} />`),l))}function Pd(e){return[os([us(e,e.mood),ps(e.stains)],100,0.84),Dd(),Ed(),R([[62,170],[138,170],[100,170]].slice(0,e.stench))]}function Hd(){return c("wish",[i`<circle cx="120" cy="50" r="3.6" fill=${o.cream} /><circle cx="130" cy="42" r="5.6" fill=${o.cream} />`,d(158,30,h("pulse",[i`<circle r="22" fill=${o.cream} />`,d(0,0,i`<path d=${Vt} fill=${o.lilac} />`,-6,0.5)]))])}function Vd(e){let t=[[18,128],[182,122],[62,46]];return[us(e,e.mood),ns(67,-6),ns(133,6),ps(e.stains),ls(e.crumbs),cs(Math.min(e.mites,2)),d(100,162,h("bob",ds(0,0,1))),Hd(),R(t.slice(0,e.stench)),Ad.slice(0,e.flies).map(([r,n],s)=>N(r,n,s))]}function hs(e,t){let r=ad(e);return I("bed",e,t,{made:()=>Td(r),changing:()=>Pd(r),bare:()=>Vd(r)}[r.view]())}var Pn=6,fs=[0.05,0.3,0.55],Rd=[0.45,0.7,0.92],Od=[0.02,0.4,0.75],Id=[0.65,0.9];function Nd(e){let{state:t,fill:r,stink:n}=e;if(t==="clean")return{view:"drying",pile:0,overflow:!1,stench:0,flies:0,cloud:0,mood:"happy"};if(t==="running")return{view:"washing",pile:0,overflow:!1,stench:w(n,fs),flies:0,cloud:0,mood:"happy"};if(t==="waiting"){let m=w(n,Od);return{view:"wet",pile:0,overflow:!1,stench:0,flies:w(n,Id),cloud:m,mood:m>=2?"sick":"pleading"}}let s=t==="due",a=s?Pn:Math.min(Pn-1,Math.floor(r*Pn)),l=w(n,fs),u=w(n,Rd),p=t==="resting"?"sleepy":"calm";if(s||a>=4)p="worried";if(n>=0.45)p="sick";return{view:"basket",pile:a,overflow:s,stench:l,flies:u,cloud:0,mood:p}}var Qd=[[1,[[100,106,()=>B(100,106,54,15,o.sky,o.skyDark,-3)]]],[2,[[70,98,()=>B(70,98,26,19,o.coral,o.coralDark,-12)],[135,92,()=>Ce(135,92,o.sun,o.coral,24)]]],[3,[[112,86,()=>B(112,86,36,21,o.mint,o.mintDark,8)],[74,80,()=>B(74,80,22,16,o.pink,o.pinkDark,-10)]]],[4,[[96,66,()=>br(96,66,o.sun,o.sunDark,-14,0.98)],[138,70,()=>Ce(138,70,o.lilac,o.cream,34)]]],[5,[[122,52,()=>B(122,52,26,18,o.lilac,o.lilacDark,14)],[74,48,()=>B(74,48,25,17,o.sky,o.skyDark,-18)]]],[6,[[100,32,()=>br(100,32,o.coral,o.coralDark,10,0.9)],[142,42,()=>B(142,42,16,13,o.mint,o.mintDark,20)],[58,40,()=>Ce(58,40,o.pink,o.cream,-38,0.9)]]]];function Fd(){let e=[132,148,164];return[i`<path d="M36 114H164L154 174Q153 180 146 180H54Q47 180 46 174Z" fill=${o.wicker} />`,e.map((t)=>i`<rect x=${42+(t-132)*0.14} y=${t} width=${116-(t-132)*0.28} height="5" rx="2.5" fill=${o.wickerDark} opacity=".55" />`),i`<rect x="29" y="108" width="142" height="17" rx="8.5" fill=${o.wickerLight} />`,i`<rect x="86" y="112.5" width="28" height="8" rx="4" fill=${o.wickerDark} />`]}var Zd="#5b3413";function zd(e){return[Fd(),V(100,150,e,Zd,1.05)]}function Ud(e){return Qd.filter(([t])=>e>=t).map(([t,r])=>c("pile-step",r.map(([,,n])=>n()),t))}function qd(){return c("overflow",[Ce(34,164,o.sky,o.cream,62,0.82),B(170,172,20,10,o.coral,o.coralDark,6),d(160,106,h("wobble",Ce(0,22,o.mint,o.sun,-18,0.92)))])}function Bd(e){let t=[[22,100],[178,96],[172,46]],r=[[34,44],[146,20],[58,18]];return[A(100,182,70),i`<ellipse cx="100" cy="112" rx="62" ry="9" fill=${o.wickerDark} />`,Ud(e.pile),f(e.overflow,qd),zd(e.mood),R(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function Wd(){return[i`<rect x="42" y="172" width="20" height="9" rx="3" fill=${o.metalDark} /><rect x="138" y="172" width="20" height="9" rx="3" fill=${o.metalDark} />`,i`<rect x="32" y="22" width="136" height="154" rx="16" fill=${o.metal} />`,i`<path d="M32 66V38a16 16 0 0 1 16-16H152a16 16 0 0 1 16 16V66Z" fill=${o.metalMid} />`,i`<circle cx="56" cy="44" r="11.5" fill=${o.metal} /><rect x="54" y="33" width="4" height="12" rx="2" fill=${o.metalDark} />`,i`<circle cx="100" cy="118" r="47" fill=${o.metalMid} />`]}function jd(e,t){return i`<circle cx=${e} cy="44" r="4.5" fill=${t?o.mint:o.metalDark} />`}function gs(e,t){return[Wd(),[0,1,2].map((r)=>jd(132+r*14,r<t)),V(100,42,e,o.fly,0.85)]}function ys(e){return d(100,181,d(-100,-181,e),0,0.84)}function E(e,t,r,n){return c("bubble",d(e,t,h("rise",i`<circle r=${r} fill=${o.water} opacity=".22" /><circle r=${r} fill="none" stroke="#d6f2ff" stroke-width="2.4" /><circle cx=${-r*0.35} cy=${-r*0.35} r=${r*0.22} fill="#fff" />`,n)))}function Yd(){let e=[B(0,-18,15,12,o.coral,o.coralDark,20),B(16,11,14,11,o.sun,o.sunDark,140),B(-16,10,14,12,o.mint,o.mintDark,250)];return[c("drum",d(100,118,h("spin",e))),d(100,118,h("slosh",i`<path d="M-37 8Q-27 1-18 7T0 7T18 7T37 8A38 38 0 0 1-37 8Z" fill=${o.water} opacity=".78" /><g fill="#eaf8ff"><circle cx="-20" cy="6" r="5" /><circle cx="-10" cy="4" r="6.5" /><circle cx="4" cy="6" r="5" /><circle cx="17" cy="4" r="6" /><circle cx="27" cy="7" r="3.5" /></g>`))]}function Kd(){return c("shake",[[28,102,"M0 0q-6 12 0 24"],[18,124,"M0 0q-6 12 0 24"],[172,102,"M0 0q6 12 0 24"],[182,124,"M0 0q6 12 0 24"]].map(([t,r,n],s)=>d(t,r,h("flicker",i`<path d=${n} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,s%2+1))))}function Gd(e){return[A(100,183,76),c("machine",h("rumble",ys([gs(e.mood,2),i`<circle cx="100" cy="118" r="39" fill=${o.glass} />`,Yd(),i`<circle cx="100" cy="118" r="39" fill="none" stroke=${o.metalDark} stroke-width="6" />`,i`<path d="M74 100a32 32 0 0 1 22-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`]))),E(142,44,11,1),E(58,40,8,2),E(174,58,7,3),E(26,62,9,4),E(100,36,6,5),Kd(),R([[68,44],[132,44],[100,40]].slice(0,e.stench))]}function Hn(e,t,r,n){return c("cloud",d(e,t,h("drift",i`<g fill=${o.musty} opacity=".9"><circle cx="-16" cy="4" r="13" /><circle cx="3" cy="-5" r="17" /><circle cx="20" cy="5" r="12" /><rect x="-27" y="3" width="56" height="14" rx="7" /></g><path d="M-14 6q3 3 6 0M4 6q3 3 6 0" fill="none" stroke=${o.mustyDark} stroke-width="3" stroke-linecap="round" />`,n),0,r))}function Xd(){return c("wet-clothes",[B(100,120,26,20,"#3b6f93","#2b5473",-6),B(84,136,18,13,"#a55a55","#7f413e",12),B(114,139,19,13,"#3f8f76","#2e6e5a",-10),i`<path d="M70 139Q71 164 80 172Q88 164 86 142Z" fill="#a55a55" />`,i`<path d="M112 142Q112 160 120 166Q128 160 128 139Z" fill="#3f8f76" />`])}function Jd(){return c("door",[i`<ellipse cx="38" cy="118" rx="17" ry="46" fill=${o.metalDark} />`,i`<ellipse cx="38" cy="118" rx="11" ry="35" fill=${o.glass} />`,i`<path d="M33 96q-3 12-2 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`])}function eu(){return c("drip",[[84,173,1],[119,168,2],[101,166,3]].map(([e,t,r])=>d(e,t,h("drip",O(0,0,o.water,0.85),r))))}function tu(){return c("ding",d(170,54,h("pulse",i`<path d="M-14 4a14 14 0 0 1 28 0v5l5 7H-19l5-7ZM-5 19a5 5 0 0 0 10 0Z" fill=${o.sun} />`),-16))}function ru(){return i`<ellipse cx="94" cy="184" rx="30" ry="6" fill=${o.water} opacity=".65" data-part="puddle" />`}function nu(e){let t=[[148,30,1],[50,32,0.9],[100,18,0.72]],r=[[176,96],[20,92]];return[A(100,183,76),ru(),c("machine",ys([gs(e.mood,3),i`<circle cx="100" cy="118" r="39" fill="#141a33" />`,Xd(),Jd()])),eu(),tu(),t.slice(0,e.cloud).map(([n,s,a],l)=>Hn(n,s,a,l+1)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function iu(e,t){return i`<rect x=${e-2.5} y=${t-7} width="5" height="13" rx="2" fill=${o.sun} />`}var ms=[{x:50,y:77,pegs:[[38,50],[62,53]],art:()=>h("sway",br(0,0,o.sky,o.skyDark,0,1.12),1)},{x:102,y:58,pegs:[[89,55],[115,55]],art:()=>h("sway",[Ce(-13,25,o.coral,o.cream,0,0.92),Ce(13,25,o.coral,o.cream,0,0.92)],2)},{x:164,y:52,pegs:[[150,53],[178,50]],art:()=>h("sway",i`<rect x="-20" y="0" width="40" height="66" rx="5" fill=${o.sun} /><rect x="-20" y="44" width="40" height="8" fill=${o.coral} /><rect x="-20" y="55" width="40" height="4" fill=${o.coral} />`,3)}];function ou(){return i`<path d="M-4 44Q100 66 204 44" fill="none" stroke="#bfe8e0" stroke-width="4" />`}function su(){return c("folded",[A(100,181,54),i`<rect x="58" y="162" width="84" height="16" rx="7" fill=${o.lilac} />`,i`<rect x="63" y="147" width="74" height="16" rx="7" fill=${o.mint} />`,i`<rect x="68" y="132" width="64" height="16" rx="7" fill=${o.cream} />`,i`<path d="M66 170h68M71 155h58M76 140h48" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round" />`])}var au=[[30,134,1.3,1],[168,138,1.05,2],[100,112,0.9,3],[180,26,0.8,4]];function lu(){return[ou(),c("line",[ms.map((e)=>d(e.x,e.y,e.art())),ms.flatMap((e)=>e.pegs.map(([t,r])=>iu(t,r)))]),su(),au.map(([e,t,r,n])=>v(e,t,r,n))]}function bs(e,t){let r=Nd(e);return I("laundry",e,t,{basket:()=>Bd(r),washing:()=>Gd(r),wet:()=>nu(r),drying:lu}[r.view]()??k)}var Vn=6,ks=[0.05,0.3,0.55],$s=[0.02,0.25,0.5],cu=[0.3,0.6,0.85],du=[0.4,0.7,0.92],uu=[0.02,0.4,0.75],pu=[0.65,0.9];function hu(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink),s={stack:0,teeter:!1,crust:0,mould:0,stench:0,flies:0,cloud:0,drip:!1,wet:!1,towel:!1};if(t==="clean")return{...s,view:"rack",towel:!0,mood:"happy"};if(t==="running")return{...s,view:"washing",crust:w(n,$s),stench:w(n,ks),mood:"happy"};if(t==="waiting"){let m=w(n,uu);return{...s,view:"rack",wet:!0,cloud:m,flies:w(n,pu),mood:m>=2?"sick":"calm"}}let a=t==="due",l=0;if(a)l=Vn;else if(t==="accumulating")l=Math.min(Vn-1,1+Math.floor(r*5));let u=w(n,du),p=t==="resting"?"sleepy":l>=4?"worried":"calm";if(a)p="pleading";if(u>0)p="sick";return{...s,view:"sink",stack:l,teeter:a,crust:w(n,$s),mould:w(n,cu),stench:w(n,ks),flies:u,drip:t==="resting",mood:p}}var _r=84,_s=107,Le=118,fu="#124d39",mu="#a5472d",gu="#7c3120",yu="#f4fbff",bu="#cfeaf9",ws="#c2a878";function ot(e,t,r,n,s,a=0){let l=y(o.cream,ws,s/3*0.75),u=y(n,ws,s/3*0.7);return d(e,t,[i`<path d=${`M${-r+3}-6H${r-3}L${r-11} 0H${-r+11}Z`} fill=${u} />`,i`<rect x=${-r} y="-9" width=${2*r} height="5.5" rx="2.75" fill=${l} />`],a)}function ku(e,t,r){let n=y(o.terracotta,"#6e4a2e",r/3),s=y(o.terracottaDark,"#553722",r/3);return d(e,t,[i`<path d="M-3-10L-40-20" stroke=${o.wicker} stroke-width="7" stroke-linecap="round" />`,i`<path d="M-24-12H24L21-3Q20 0 16 0H-16Q-20 0-21-3Z" fill=${n} />`,i`<rect x="-26" y="-15" width="52" height="5" rx="2.5" fill=${s} />`])}function $u(e,t,r=0){return d(e,t,[i`<path d="M-24-12H24C24-4 14 0 8 0H-8C-14 0-24-4-24-12Z" fill=${o.sun} />`,i`<rect x="-26" y="-15" width="52" height="5.5" rx="2.75" fill=${o.sunDark} />`,i`<path d="M-15-7q6 3 11 3" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".5" />`],r)}function xs(e,t,r,n,s=0,a=1){return d(e,t,[i`<path d="M10-15h3a6 6 0 0 1 0 12h-3" fill="none" stroke=${n} stroke-width="4" />`,i`<path d="M-11-19H11V-5Q11 0 6 0H-6Q-11 0-11-5Z" fill=${r} />`,i`<rect x="-12" y="-21" width="24" height="4.5" rx="2.25" fill=${n} />`],s,a)}function Rn(e,t,r=1){return d(e,t,[i`<path d="M-11-2Q0-5 11-2C12 3 8 3 7 5S4 12 2 11 0 5-2 6-5 9-7 7-12 3-11-2Z" fill=${mu} />`,i`<circle cx="4" cy="1" r="1.8" fill=${gu} />`],0,r)}function Rt(e,t,r){return r.filter(([n=1])=>e>=n).map(([,n=0,s=0,a=1])=>c("crust",Rn(n,s,a),t))}function _u(e){let{stack:t,crust:r}=e,n=_r;return[[1,[ot(n,110,32,o.sky,r),ot(n+2,102,32,o.skyDark,r),ot(n-1,94,32,o.sky,r),Rt(r,1,[[1,n+19,87,0.75],[3,n-20,95,0.7]])]],[2,[ku(n+1,87,r),Rt(r,2,[[2,n-10,74,0.7]])]],[3,[$u(n-2,72),Rt(r,3,[[1,n+8,59,0.8]])]],[4,[ot(n+1,59,25,o.lilac,r),ot(n-2,51,25,o.lilacDark,r),Rt(r,4,[[2,n-12,44,0.65]])]],[5,[c("side-mug",xs(124,110,o.coral,o.coralDark))]]].filter(([a])=>t>=a).map(([a,l])=>c("stack-step",l,a))}function wu(e){let t=_r,r=[ot(t+4,44,22,o.pink,e.crust,5),xs(t+7,36,o.sky,o.skyDark,-8,0.82),Rt(e.crust,6,[[1,t+19,37,0.55]])];return c("stack-step",d(t,46,h("wobble",d(-t,-46,r))),Vn)}function xu(){return c("teeter",[[58,20,"M0 0q-6 9 0 18",1],[46,26,"M0 0q-5 7 0 14",2],[118,16,"M0 0q6 9 0 18",1],[130,20,"M0 0q5 7 0 14",2]].map(([e,t,r,n])=>d(e,t,h("flicker",i`<path d=${r} fill="none" stroke="#e6d9ff" stroke-width="3.6" stroke-linecap="round" />`,n))))}function vu(e){return c("mouldy-cup",[f(e>=3,()=>c("mushroom",[d(34,86,[i`<rect x="-2" y="-12" width="4" height="13" rx="2" fill=${o.cream} />`,i`<path d="M-9-11A9 8 0 0 1 9-11Z" fill=${o.coral} />`,i`<circle cx="-3" cy="-14" r="1.6" fill=${o.cream} /><circle cx="3" cy="-15" r="1.3" fill=${o.cream} />`])])),i`<path d="M-13-16h-3a6 6 0 0 0 0 12h3" transform=${"translate(41 110)"} fill="none" stroke=${o.mustyDark} stroke-width="4" />`,d(41,110,[i`<path d="M-13-23H13V-5Q13 0 8 0H-8Q-13 0-13-5Z" fill=${o.musty} />`,i`<circle cx="-4" cy="-14" r="3" fill=${o.mustyDark} /><circle cx="6" cy="-9" r="2.2" fill=${o.mustyDark} />`]),d(41,87,[i`<g fill=${o.stench}><circle cx="-9" cy="-1" r="6" /><circle cx="0" cy="-3" r="7" /><circle cx="9" cy="-1" r="6" /><rect x="-14" y="-2" width="28" height="6" rx="3" /></g>`,f(e>=2,()=>[i`<circle cx="-11" cy="7" r="3.2" fill=${o.stench} /><rect x="-13.5" y="2" width="5" height="12" rx="2.5" fill=${o.stench} />`,i`<rect x="7" y="2" width="4.6" height="9" rx="2.3" fill=${o.stench} />`,i`<circle cx="-2" cy="-7" r="5" fill=${o.leafDark} /><circle cx="7" cy="-5" r="3.2" fill=${o.leafDark} />`])])])}function On(){return c("tap",[i`<path d=${"M150 104V60a16 16 0 0 0-32 0V68"} fill="none" stroke=${o.metalMid} stroke-width="10" stroke-linecap="round" />`,i`<path d="M146.6 70V60a12.6 12.6 0 0 0-8-11.7" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".7" />`,i`<rect x=${Le-8} y="66" width="16" height="8" rx="3" fill=${o.metalDark} />`,i`<rect x="141" y="96" width="18" height="11" rx="3" fill=${o.metalDark} />`,i`<path d="M157 90L173 82" stroke=${o.metalMid} stroke-width="6" stroke-linecap="round" />`,i`<circle cx="152" cy="91" r="7" fill=${o.metalDark} />`,i`<circle cx="174" cy="81.5" r="4.5" fill=${o.coral} />`])}function In(){return c("sink",[i`<ellipse cx=${_r} cy=${_s} rx="56" ry="10" fill=${o.metalMid} />`,i`<ellipse cx=${_r} cy=${_s} rx="50" ry="7" fill="#59648a" />`])}function Nn(e,t){let r=y(o.mint,o.musty,t),n=y(o.mintDark,o.mustyDark,t);return[i`<rect x="38" y="172" width="18" height="10" rx="3" fill=${o.metalDark} /><rect x="144" y="172" width="18" height="10" rx="3" fill=${o.metalDark} />`,c("cabinet",[i`<rect x="24" y="116" width="152" height="60" rx="9" fill=${r} />`,i`<rect x="84" y="124" width="32" height="6.5" rx="3.25" fill=${n} />`,i`<path d="M24 136H176" stroke=${n} stroke-width="3" />`]),c("counter",[i`<rect x="12" y="105" width="176" height="15" rx="7" fill=${o.cream} />`,i`<path d="M20 116.5H180" stroke=${o.creamDark} stroke-width="3" stroke-linecap="round" />`]),V(100,157,e.mood,fu,1.05)]}function vs(e){return[[1,26,106,0.7],[2,170,106,0.6],[3,104,107,0.8]].filter(([t])=>e>=t).map(([,t,r,n])=>c("crust",Rn(t,r,n)))}function Mu(){return c("zzz",[[76,84,0.65,1],[60,64,0.95,2],[40,40,1.3,3]].map(([t,r,n,s])=>d(t,r,h("drift",i`<path d=${"M-6-6H6L-6 6H6"} fill="none" stroke=${o.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,s),0,n)))}function Au(e,t){let r=[[20,98],[178,76],[38,58]],n=[[22,34],[138,26],[172,22]];return[A(100,183,80),On(),In(),f(e.drip,()=>c("tap-drop",[O(Le,80,o.water,0.8),d(Le,97,h("drip",O(0,0,o.water,0.8),2))])),_u(e),f(e.mould>0,()=>vu(e.mould)),f(e.teeter,()=>wu(e)),f(e.teeter&&e.stench<2,xu),Nn(e,t),vs(e.crust),f(e.drip&&e.stench===0,Mu),R(r.slice(0,e.stench)),n.slice(0,e.flies).map(([s,a],l)=>N(s,a,l))]}function Tu(){return c("sponge",[i`<rect x="-20" y="-12" width="40" height="24" rx="7" fill=${o.sun} />`,i`<path d="M-20-3V-5a7 7 0 0 1 7-7H13a7 7 0 0 1 7 7V-3Z" fill=${o.leafDark} />`,i`<circle cx="-8" cy="5" r="2" fill=${o.sunDark} /><circle cx="3" cy="7" r="1.6" fill=${o.sunDark} /><circle cx="11" cy="3" r="2" fill=${o.sunDark} />`])}function Su(e){return c("washing-plate",[i`<circle cx="74" cy="64" r="36" fill=${o.cream} />`,i`<circle cx="74" cy="64" r="36" fill="none" stroke=${o.sky} stroke-width="4" />`,i`<circle cx="74" cy="64" r="23" fill=${o.creamDark} opacity=".55" />`,[[0,52,56,1.25],[1,62,80,0.9],[2,58,36,0.9],[3,88,88,0.8]].filter(([t])=>e>=t).map(([,t,r,n])=>c("crust",Rn(t,r,n)))])}function Cu(){let e=[[36,100,11],[52,94,15],[72,98,15],[92,94,14],[110,98,12],[126,100,10]];return c("foam",[e.map(([t,r,n])=>i`<circle cx=${t+1} cy=${r+3} r=${n} fill=${bu} />`),e.map(([t,r,n])=>i`<circle cx=${t} cy=${r} r=${n-1} fill=${yu} />`)])}function Lu(){return c("water",[i`<path d=${`M${Le-4} 74H${Le+4}L${Le+3} 100H${Le-3}Z`} fill=${o.water} />`,h("flicker",i`<path d=${`M${Le-1} 76V98`} stroke="#d6f2ff" stroke-width="2.4" stroke-linecap="round" />`),[[130,90,1],[136,96,3],[108,84,2]].map(([e,t,r])=>d(e,t,h("fall",O(0,0,o.water,0.65),r)))])}function Du(e,t){return[A(100,183,80),On(),In(),Su(e.crust),Lu(),d(90,62,h("bob",d(0,0,Tu(),-18))),Cu(),Nn(e,t),vs(e.crust),E(26,50,10,1),E(24,30,7,2),E(122,28,8,3),E(160,30,10,4),E(74,21,6,5),R([[20,100],[178,76]].slice(0,e.stench))]}var Eu=["#dfe9ee","#c8def0","#dfe9ee","#c8def0"],Pu=[o.coral,o.sun,o.mint,o.cream],Hu=[36,50,64,78];function Vu(e,t,r,n){let s=r?"#9fb9cf":y(t,"#000000",0.14);return c("rack-plate",[i`<circle cx=${e} cy="68" r="25" fill=${t} />`,i`<circle cx=${e} cy="68" r="25" fill="none" stroke=${s} stroke-width="3" />`,i`<circle cx=${e} cy="68" r="15" fill=${s} opacity=".35" />`,f(!r,()=>i`<path d=${`M${e-15} 58a19 19 0 0 1 11-9`} fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" opacity=".85" />`)],n)}function Ru(e,t){let r=e?Eu.map((l)=>y(l,o.musty,t)):Pu,n=o.metalMid,s=e?y("#c8def0",o.musty,t):o.sky,a=e?y("#9fb9cf",o.mustyDark,t):o.skyDark;return c("rack",[Hu.map((l,u)=>Vu(l,r[u]??o.cream,e,u)),d(102,94,[i`<path d="M10-14h3a5 5 0 0 1 0 10h-3" fill="none" stroke=${a} stroke-width="4" />`,i`<path d="M-11 0H11V-16Q11-21 6-21H-6Q-11-21-11-16Z" fill=${s} />`,i`<rect x="-12" y="-3" width="24" height="4.5" rx="2.25" fill=${a} />`]),i`<path d="M20 96V106M118 96V106" stroke=${o.metalDark} stroke-width="5" stroke-linecap="round" />`,Array.from({length:8},(l,u)=>26+u*13).map((l)=>i`<path d=${`M${l} 82V96`} stroke=${n} stroke-width="3" stroke-linecap="round" />`),i`<rect x="14" y="80" width="110" height="5" rx="2.5" fill=${n} />`,i`<rect x="14" y="93" width="110" height="6" rx="3" fill=${o.metal} />`])}function Ou(){return c("drip",[[38,104,1],[66,106,2],[94,104,3]].map(([e,t,r])=>d(e,t,h("drip",O(0,0,o.water,0.85),r))))}function Iu(){return c("wet",[[30,62],[48,50],[78,58],[90,72],[66,70]].map(([e,t])=>O(e,t,o.waterDark,0.62)))}function Nu(){return c("wish",[i`<circle cx="151" cy="36" r="3.6" fill=${o.cream} /><circle cx="143" cy="42" r="2.4" fill=${o.cream} />`,d(170,33,h("pulse",[i`<circle r="17" fill=${o.cream} />`,i`<rect x="-9" y="-9" width="18" height="18" rx="3" fill=${o.coral} />`,i`<rect x="-9" y="2" width="18" height="3.4" fill=${o.cream} />`]))])}function Qu(){return c("towel",[i`<rect x="36" y="102" width="34" height="46" rx="5" fill=${o.pinkDark} />`,i`<rect x="39" y="102" width="34" height="42" rx="5" fill=${o.pink} />`,i`<rect x="39" y="130" width="34" height="4.5" fill=${o.cream} />`,i`<rect x="39" y="137" width="34" height="2.6" fill=${o.cream} />`,i`<path d="M39 106H73" stroke=${o.pinkDark} stroke-width="2.4" stroke-linecap="round" />`])}function Fu(e,t){let r=[[58,30,0.75],[112,26,0.6],[22,28,0.55]],n=[[180,68],[136,88]];return[A(100,183,80),On(),In(),f(e.wet,Ou),Nn(e,t),Ru(e.wet,t),f(e.wet,Iu),f(e.wet,Nu),f(e.towel,Qu),f(e.towel,()=>[v(160,34,1.15,1),v(24,32,0.95,2),v(104,30,0.8,3),v(178,62,0.7,4)]),r.slice(0,e.cloud).map(([s,a,l],u)=>Hn(s,a,l,u+1)),n.slice(0,e.flies).map(([s,a],l)=>N(s,a,l))]}function Ms(e,t){let r=hu(e),n=e.state==="clean"?0:L(e.stink)*0.55;return I("dishes",e,t,{sink:()=>Au(r,n),washing:()=>Du(r,n),rack:()=>Fu(r,n)}[r.view]())}var Qn=6,Zu=[0.05,0.35,0.65],zu=[0.5,0.75,0.92],Uu=[0.15,0.45,0.8],qu=[0.6,0.85];function Bu(e){let{state:t,fill:r,stink:n}=e,s=w(n,Zu),a=w(n,zu),l=w(n,Uu);if(t==="clean")return{view:"fresh",stack:0,overfull:!1,stench:0,flies:0,mould:0,mood:"happy"};if(t==="running")return{view:"wiping",stack:0,overfull:!1,stench:Math.min(1,s),flies:0,mould:0,mood:"happy"};if(t==="waiting")return{view:"emptied",stack:0,overfull:!1,stench:s,flies:w(n,qu),mould:0,mood:n>=0.65?"worried":"calm"};let u=n>=0.45;if(t==="resting")return{view:"closed",stack:0,overfull:!1,stench:s,flies:a,mould:l,mood:u?"sick":"sleepy"};let p=t==="due",m=Number.isFinite(r)?r:0,b=p?Qn:Math.max(0,Math.min(Qn-1,Math.floor(m*Qn))),x=b>=4?"worried":"calm";if(p)x="pleading";if(u)x="sick";return{view:"stuffed",stack:b,overfull:p,stench:s,flies:a,mould:l,mood:x}}var Ee="#86dcc8",It="#57b7a3",Nt="#aeeadb",qe="#e4f4fd",Wn="#bcdff2",re="#8fcbea",Es="#ffa63d",st="#86b94b",Ot="#5d8a33",Ps="#c4e27f",Wu="#a8a84a",Fn="#7f7c30",As="#68709c",Ts="#4b5279",ju="M60 46a28 28 0 0 1 28-28H152a28 28 0 0 1 28 28V164q0 12-12 12H72q-12 0-12-12Z",zn=69,Un=102,De=86,be=121;function Qt(e){return[i`<rect x="74" y="172" width="20" height="12" rx="3" fill=${o.metalDark} /><rect x="146" y="172" width="20" height="12" rx="3" fill=${o.metalDark} />`,i`<path d=${ju} fill=${e} />`]}function Ft(){return[i`<rect x="84" y="162" width="72" height="9" rx="4.5" fill=${o.metalMid} />`,i`<path d="M96 164.5v4M108 164.5v4M120 164.5v4M132 164.5v4M144 164.5v4" stroke=${o.metalDark} stroke-width="2.6" stroke-linecap="round" />`]}function Yu(){return c("handle",[i`<rect x="154" y="92" width="11" height="10" rx="3" fill=${o.metalDark} /><rect x="154" y="130" width="11" height="10" rx="3" fill=${o.metalDark} />`,i`<rect x="150" y="88" width="10" height="56" rx="5" fill=${o.metal} />`,i`<rect x="152.5" y="93" width="2.6" height="34" rx="1.3" fill="#fff" />`])}function Ss(e,t,r,n){return d(e,t,h("bob",i`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${o.spark} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,n),0,r)}function Ku(){return c("magnet",[i`<rect x="78" y="106" width="36" height="42" rx="3" fill=${o.cream} transform="rotate(-5 96 127)" />`,i`<path d="M85 122l22-2M85.6 130l22-2M86.3 138l13-1" stroke=${o.creamDark} stroke-width="3" stroke-linecap="round" />`,i`<path d="M96 116c-7-5-9-11-5-14c3-2 5 0 5 2c0-2 3-4 6-2c3 3 1 9-6 14Z" fill=${o.coral} />`,i`<circle cx="130" cy="136" r="8" fill=${o.sun} /><path d="M130 128q2-4 5-4" fill="none" stroke=${o.leafDark} stroke-width="2.6" stroke-linecap="round" />`])}function Gu(e,t,r){return c("goo",[i`<path d="M84 154h62v5q0 5-5 5c-3 0-5-2-5-5c0 5-3 11-7 11s-6-5-6-10c0 3-3 5-6 5s-5-3-5-6c0 4-3 6-6 6s-5-2-6-6q-1 4-6 4t-6-4c0 7-3 12-6 12c-3 0-4-6-4-13Z" fill=${e} />`,i`<path d="M92 158h40" stroke=${t} stroke-width="2.6" stroke-linecap="round" opacity=".6" />`,f(r>=2,()=>[i`<path d="M66 184c-6-8 4-13 14-11c14-3 30-3 42-1c14-2 26 2 22 10c-2 4-74 6-78 2Z" fill=${e} />`])])}function Cs(e,t,r,n){return`M${Array.from({length:e*2},(a,l)=>{let u=l*Math.PI/e,p=l%2?1-n:1;return`${_(Math.cos(u)*t*p)} ${_(Math.sin(u)*r*p)}`}).join("L")}Z`}function Xu(e,t,r,n){return[i`<circle cx=${e-n} cy=${t} r=${r} fill="#fff" /><circle cx=${e+n} cy=${t} r=${r} fill="#fff" />`,i`<circle cx=${e-n+r*0.28} cy=${t+r*0.2} r=${r*0.55} fill=${o.fly} /><circle cx=${e+n+r*0.28} cy=${t+r*0.2} r=${r*0.55} fill=${o.fly} />`]}function Hs(e,t,r){return c("mould",d(e,t,d(0,-19,h("bob",[i`<path d=${Cs(16,23,20,0.22)} fill=${st} stroke=${st} stroke-width="3" stroke-linejoin="round" />`,i`<path d=${Cs(11,15,11,0.2)} transform="translate(-5 7)" fill=${Ps} opacity=".55" />`,i`<circle cx="15" cy="9" r="3" fill=${Ot} /><circle cx="-16" cy="-8" r="2.4" fill=${Ot} /><circle cx="10" cy="-13" r="2" fill=${Ot} />`,Xu(0,-3,7,9),i`<path d="M-5 10q5-5 10 0" fill="none" stroke=${Ot} stroke-width="3" stroke-linecap="round" />`])),0,r))}function vr(e){return[De,be].map((t)=>i`<rect x=${zn} y=${t} width=${Un} height="4.5" fill=${e} /><rect x=${zn} y=${t} width=${Un} height="1.5" fill="#fff" opacity=".7" />`)}function Mr(e,t,r){return[i`<rect x=${zn} y="52" width=${Un} height="106" rx="7" fill=${e} />`,i`<path d="M69 59a7 7 0 0 1 7-7h2v106h-2a7 7 0 0 1-7-7ZM171 59a7 7 0 0 0-7-7h-2v106h2a7 7 0 0 0 7-7Z" fill=${t} />`,i`<rect x="104" y="52" width="32" height="6" rx="3" fill=${r} />`]}function Ar(e,t){return c("drawer",[t,i`<rect x="75" y="142" width="90" height="16" rx="4" fill=${e} />`,i`<rect x="75" y="142" width="90" height="3" rx="1.5" fill="#fff" opacity=".85" />`,i`<rect x="106" y="148.5" width="28" height="5" rx="2.5" fill="#fff" opacity=".9" />`])}function Zt(e){return i`<path d="M72 44a18 18 0 0 1 16-16H110" fill="none" stroke=${e} stroke-width="4" stroke-linecap="round" />`}function Tr(e,t,r){return[i`<path d="M62 26L30 16Q18 14 18 27V171Q18 184 30 183L62 174Z" fill=${t} />`,i`<path d="M60 31L33 23Q25 22 25 31V167Q25 176 33 175L60 169Z" fill=${r} />`,i`<path d="M18 27Q18 14 30 16L34 17Q24 17 24 29V169Q24 182 34 182L30 183Q18 184 18 171Z" fill=${e} />`]}function Sr(e){return[i`<path d="M25 72L60 76V100L25 104Z" fill=${e} opacity=".85" />`,i`<path d="M25 132L60 130V156L25 162Z" fill=${e} opacity=".85" />`,i`<path d="M25 72L60 76M25 132L60 130" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".85" />`]}function Ju(e,t){return c("milk",d(e,t,[i`<path d="M-8 0V-24L-4-34V-42H4V-34L8-24V0Z" fill="#fff" />`,i`<rect x="-5" y="-47" width="10" height="7" rx="2" fill=${o.sky} />`,i`<rect x="-8" y="-20" width="16" height="10" fill=${o.sky} />`]))}function Ls(e,t,r,n){return d(e,t,[i`<path d="M-6 0V-16Q-6-22-3-25V-32H3V-25Q6-22 6-16V0Z" fill=${r} />`,i`<rect x="-3.5" y="-37" width="7" height="6" rx="1.5" fill=${n} />`,i`<rect x="-6" y="-14" width="12" height="7" fill="#fff" opacity=".75" />`])}function Vs(){return c("door-stock",[Ju(43,92),Ls(35,152,o.coral,o.coralDark),Ls(50,150,o.sun,o.sunDark)])}function xr(e,t,r,n,s,a=0,l=0.86){return d(e,t,[i`<rect x="-19" y="-14" width="38" height="14" rx="4" fill="#fff" opacity=".9" />`,i`<path d="M-13-3q2-8 8-5q4-3 8 0q5-2 7 2q3 0 3 3Z" fill=${s} />`,i`<rect x="-21" y="-18" width="42" height="6.5" rx="3.25" fill=${r} />`,i`<rect x="-5" y="-21" width="10" height="4" rx="2" fill=${n} />`],a,l)}function Rs(e,t,r=0,n=0.76){return d(e,t,[i`<path d="M-14-30Q0-48 14-30" fill="none" stroke=${o.metalDark} stroke-width="2.2" />`,i`<path d="M-15-30H15L11-1Q11 0 9 0H-9Q-11 0-11-1Z" fill="#fff" />`,i`<path d="M-15-30L-8-36H8L15-30Z" fill=${o.creamDark} />`,i`<circle cy="-15" r="6.5" fill=${o.coral} />`],r,n)}function e1(e,t){return d(e,t,[i`<rect x="-26" y="-18" width="52" height="5" rx="2.5" fill=${o.coralDark} />`,i`<path d="M-20-20H20V-5Q20 0 15 0H-15Q-20 0-20-5Z" fill=${o.coral} />`,i`<path d="M-21-20Q0-33 21-20Z" fill=${o.coralDark} />`,i`<circle cy="-29" r="3.6" fill=${o.fly} />`,i`<rect x="-14" y="-13" width="4" height="9" rx="2" fill="#fff" opacity=".5" />`],0,0.88)}function t1(e,t){return d(e,t,[i`<rect x="-12" y="-27" width="24" height="27" rx="5" fill=${o.mint} />`,i`<circle cx="-4" cy="-16" r="4.4" fill=${o.mintDark} /><circle cx="5" cy="-8" r="4" fill=${o.mintDark} /><circle cx="5" cy="-20" r="2.8" fill=${o.mintDark} />`,i`<rect x="-13" y="-33" width="26" height="8" rx="2.5" fill=${o.sun} />`,i`<rect x="-9" y="-23" width="3" height="16" rx="1.5" fill="#fff" opacity=".55" />`])}function r1(e,t,r=0){return d(e,t,[i`<path d="M-17-5C-18-20-8-27 0-26C8-27 18-20 17-5Z" fill=${o.metalMid} />`,i`<path d="M-10-12l6-7l4 8l6-9M6-8l5-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`,i`<rect x="-23" y="-6" width="46" height="6" rx="3" fill=${o.lilac} />`],r)}var n1=[[1,()=>xr(94,be,o.coral,o.coralDark,o.sun)],[2,()=>Rs(147,De)],[3,()=>e1(143,be)],[4,()=>t1(87,De)],[5,()=>[xr(94,be-13.5,o.lilac,o.lilacDark,o.coral),r1(117,De)]]];function i1(e,t,r=1){return d(e,t,[i`<path d="M0-22C-8-26-16-22-16-12C-16-3-9 0-5 0C-3 0-2-1 0-1C2-1 3 0 5 0C9 0 16-3 16-12C16-22 8-26 0-22Z" fill=${o.coral} />`,i`<path d="M0-22Q0-28 3-31" fill="none" stroke=${o.soil} stroke-width="2.6" stroke-linecap="round" />`,i`<path d="M2-26C6-33 13-32 15-29C11-24 6-24 2-26Z" fill=${o.leaf} />`,i`<path d="M-10-15q0-5 4-6" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7" />`],0,r)}function o1(e,t){return d(e,t,[i`<circle cy="-13" r="13.5" fill=${Es} />`,i`<path d="M-3-24q3 3 6 0" fill="none" stroke=${o.leafDark} stroke-width="3" stroke-linecap="round" />`,i`<path d="M-8-15q0-5 4-6" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".7" />`])}function s1(e,t){return d(e,t,[i`<path d="M0-30C-6-30-7-24-8-19C-9-14-14-12-14-7C-14-2-8 0 0 0C8 0 14-2 14-7C14-12 9-14 8-19C7-24 6-30 0-30Z" fill=${o.sun} />`,i`<path d="M0-30Q0-34 3-36" fill="none" stroke=${o.soil} stroke-width="2.6" stroke-linecap="round" />`,i`<path d="M-8-9q0-4 3-5" fill="none" stroke="#fff" stroke-width="2.8" stroke-linecap="round" opacity=".7" />`],0,0.88)}function a1(e,t){return d(e,t,[i`<path d="M-5 0L-4-13H4L5 0Z" fill=${o.leaf} />`,i`<g fill=${o.leafDark}><circle cx="-10" cy="-15" r="7.5" /><circle cx="10" cy="-15" r="7.5" /><circle cy="-21" r="9" /></g>`,i`<circle cx="-3" cy="-23" r="2.4" fill=${o.leaf} /><circle cx="7" cy="-17" r="2" fill=${o.leaf} />`])}function l1(e,t){return d(e,t,[i`<path d="M-17 0V-14L14-26Q17-26 17-22V0Z" fill=${o.sun} />`,i`<path d="M-17-14L14-26Q17-26 17-22L-17-14Z" fill=${o.spark} />`,i`<circle cx="-6" cy="-7" r="3.4" fill=${o.sunDark} /><circle cx="8" cy="-10" r="4.2" fill=${o.sunDark} /><circle cx="6" cy="-3" r="1.8" fill=${o.sunDark} />`])}function qn(e,t){return d(e,t,[i`<ellipse cy="-11" rx="13" ry="11" fill=${o.coralDark} />`,i`<path d="M0-22l-7-1l4 4l-4 4l6-3l2 4l2-4l6 3l-4-4l4-4Z" fill=${o.leafDark} />`,i`<path d="M-8-12q0-3 2-4" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".6" />`])}function Bn(e,t,r,n=0.72){return d(e,t,[i`<path d="M0-30q-7-9-9-5q2 6 7 8M0-30q0-11 3-10q3 4-1 11M0-30q6-8 9-6q-1 6-7 9" fill=${o.leaf} stroke=${o.leaf} stroke-width="2" stroke-linejoin="round" />`,i`<path d="M-7-30H7L2 8Q0 11-2 8Z" fill=${Es} />`,i`<path d="M-5-21h4M2-13h3M-3-5h3" stroke=${o.terracottaDark} stroke-width="2" stroke-linecap="round" />`],r,n)}function Os(e,t,r,n){return d(e,t,[i`<path d="M-24 0C-29-8-24-14-20-14C-22-22-12-27-7-23C-5-29 7-29 8-23C14-27 23-21 20-14C25-14 29-7 24 0Z" fill=${r} />`,i`<path d="M0 0V-20M0-6L-11-15M0-6L11-15" fill="none" stroke=${n} stroke-width="2.6" stroke-linecap="round" />`])}function c1(){return c("wilted-lettuce",[i`<path d="M135 140C143 146 147 158 142 162C136 165 134 152 126 146ZM93 142C84 146 79 156 83 160C88 163 92 152 98 148Z" fill=${Fn} />`,i`<path d="M92 143C86 137 89 128 97 130C98 123 108 121 113 127C118 121 128 123 129 130C136 128 140 136 135 143C133 150 128 148 124 145C126 156 121 170 115 168C110 166 113 152 108 146C106 154 100 164 95 161C90 158 96 149 92 143Z" fill=${Wu} />`,i`<circle cx="130" cy="136" r="2.2" fill=${Fn} /><circle cx="94" cy="136" r="1.8" fill=${Fn} />`,i`<path d="M100 137q2-2 4 0M116 137q2-2 4 0" fill="none" stroke=${o.fly} stroke-width="2.4" stroke-linecap="round" />`,i`<path d="M105 145q5-4 10 0" fill="none" stroke=${o.fly} stroke-width="2.4" stroke-linecap="round" />`])}function d1(){return c("grime",[i`<g fill=${st}><circle cx="86" cy="108" r="4.5" /><circle cx="94" cy="114" r="2.8" /><circle cx="150" cy="78" r="4" /><circle cx="134" cy="106" r="3.4" /><circle cx="150" cy="111" r="2.4" /></g>`,i`<g fill=${Ps}><circle cx="85" cy="107" r="1.6" /><circle cx="150" cy="77" r="1.4" /></g>`])}function u1(){return c("shelf-goo",[i`<path d="M84 90.5h30v2q0 4-4 4c-3 0-4-2-4-3c0 5-2 10-5 10s-5-5-5-10c0 2-2 3-4 3s-4-2-5-4q-1 3-2 3t-1-3Z" fill=${st} />`,d(101,108,h("drip",i`<circle r="2.8" fill=${st} />`,2))])}function p1(){return c("overflow",[xr(98,be-27,o.sky,o.skyDark,o.mint,-8),d(162,be-4,h("wobble",xr(-4,2,o.mint,o.mintDark,o.pink,18,0.92))),d(164,178,Rs(0,0,64,0.72))])}function h1(e,t){let r=y(Ee,o.musty,t*0.55),n=y(It,o.mustyDark,t*0.6),s=y(Nt,o.musty,t*0.5),a=y(qe,"#d6d39a",t),l=y(Wn,"#b3ac70",t),u=y("#fff3b0","#c9bf6b",t),p=y(qe,"#d6d39a",t),m=e.mould>=2;return[A(100,184,86),Tr(r,n,p),Sr(y(re,o.musty,t)),Vs(),Qt(r),Zt(s),Mr(a,l,u),vr(y(re,o.musty,t)),Ar(y(re,o.musty,t),[f(e.stack>=1&&!m,()=>Os(120,150,o.leaf,o.leafDark)),f(e.stack>=2,()=>Bn(151,151,8)),f(e.stack>=3,()=>qn(90,146))]),f(m,c1),n1.filter(([b])=>e.stack>=b).map(([b,x])=>c("stack",x(),b)),f(e.overfull,p1),f(e.overfull&&e.mould<2,()=>c("sweat",d(150,28,h("drip",O(0,0,o.water,1))))),f(e.mould>=1,d1),f(e.mould>=2,()=>Hs(119,De,e.mould>=3?0.92:0.72)),f(e.mould>=3,u1),Ft(),V(120,35,e.mood,o.fly,0.9),Is(e)]}function Is(e){let t=[[187,96],[9,92],[187,56]],r=[[172,142],[34,44],[150,28]];return[R(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function f1(e,t){let r=y(Ee,o.musty,t*0.6),n=y(It,o.mustyDark,t*0.7),s=y(Nt,o.musty,t*0.5);return[A(100,184,72),d(-20,0,[Qt(r),i`<path d="M66 50a24 24 0 0 1 24-24H150a24 24 0 0 1 24 24V156H66Z" fill=${s} opacity=".35" />`,i`<path d="M66 50a24 24 0 0 1 24-24H150a24 24 0 0 1 24 24V156H66Z" fill="none" stroke=${n} stroke-width="2.6" />`,Zt("#fff"),i`<rect x="102" y="34" width="36" height="9" rx="4.5" fill=${o.metal} /><rect x="108" y="37" width="24" height="3" rx="1.5" fill=${o.metalDark} />`,Yu(),Ku(),Ft(),f(e.mould>=1,()=>Gu(st,Ot,e.mould)),V(120,72,e.mood,o.fly,1.15)]),f(e.mood==="sleepy",()=>c("snore",[Ss(168,34,1,1),Ss(180,19,0.75,2)])),f(e.mould>=3,()=>Hs(40,184,0.72)),Is(e)]}function Ds(e,t,r,n){return d(e,t,h("drift",i`<g fill="#eaf7ff" opacity=".5"><circle cx="-11" r="10" /><circle cx="3" cy="-5" r="13" /><circle cx="15" cy="1" r="9" /><circle cx="2" cy="5" r="11" /></g>`,n),0,r)}function m1(){return c("mist",[Ds(46,177,0.5,2),Ds(168,179,0.5,3),h("drift",i`<path d="M28 188c-7-6 3-13 13-9c5-9 22-11 31-5c9-8 30-8 39 0c10-7 29-5 34 4c12-4 23 5 15 11c-3 4-12 6-21 5H46c-8 0-15-2-18-6Z" fill="#eaf7ff" opacity=".4" />`,1)])}function wr(e,t,r,n){return d(e,t,h("rise",i`<circle r=${r} fill="#fff" opacity=".5" /><circle r=${r} fill="none" stroke=${o.water} stroke-width="1.8" /><circle cx=${-r*0.35} cy=${-r*0.35} r=${r*0.22} fill="#fff" />`,n))}function Zn(e,t,r,n){return d(e,t,h("twinkle",i`<path d="M0-8V8M-7-4L7 4M-7 4L7-4" stroke=${o.sky} stroke-width="2.6" stroke-linecap="round" />`,n),0,r)}function g1(){return c("cloth",d(120,190,h("slosh",d(0,-190+be-1,[i`<rect x="-28" y="-20" width="56" height="23" rx="6" fill=${o.sun} />`,i`<path d="M-28-5H28V-3Q28 3 22 3H-22Q-28 3-28-3Z" fill=${o.mint} />`,i`<circle cx="-15" cy="-13" r="2.6" fill=${o.sunDark} /><circle cx="-3" cy="-10" r="2" fill=${o.sunDark} /><circle cx="9" cy="-14" r="2.8" fill=${o.sunDark} /><circle cx="19" cy="-10" r="1.8" fill=${o.sunDark} />`]))))}function y1(e){return[A(100,184,86),Tr(Ee,It,qe),Sr(re),Qt(Ee),Zt(Nt),Mr(qe,Wn,"#fff3b0"),vr(re),c("shine",[i`<path d="M84 80L104 58H116L96 80ZM102 80L122 58H128L108 80Z" fill="#fff" />`]),Ar(re,[]),Zn(148,70,1,1),Zn(130,64,0.65,3),Zn(152,133,0.7,2),g1(),wr(84,106,6.5,1),wr(156,104,8,2),wr(146,96,4.5,3),wr(96,132,5,4),Ft(),V(120,35,e.mood,o.fly,0.9),m1(),R([[187,66]].slice(0,e.stench))]}function b1(){return c("bin-bag",d(46,184,h("throb",d(-46,-184,[i`<path d="M46 126C24 130 12 150 13 168C14 182 28 184 46 184C64 184 80 182 80 168C81 150 68 130 46 126Z" fill=${As} />`,i`<path d="M24 150q-5 12-4 24M36 146q-3 10-2 18" fill="none" stroke=${Ts} stroke-width="3.4" stroke-linecap="round" />`,i`<path d="M40 110C38 118 42 124 46 127C50 124 55 118 53 110C49 114 44 114 40 110Z" fill=${As} />`,i`<rect x="39" y="122" width="15" height="6" rx="3" fill=${o.sun} />`,i`<path d="M52 152C60 146 74 148 77 156C74 164 58 166 52 160Z" fill=${Ts} />`,k1()]))))}function k1(){return c("fishbone",d(60,157,[i`<path d="M0 0H24" stroke=${o.cream} stroke-width="3.2" stroke-linecap="round" />`,i`<path d="M6-6V6M12-7V7M18-6V6" stroke=${o.cream} stroke-width="2.6" stroke-linecap="round" />`,i`<path d="M24 0C26-8 36-9 40-3C41 1 40 3 38 5C33 9 26 8 24 0Z" fill=${o.cream} />`,i`<circle cx="33" cy="-2" r="2" fill=${o.fly} />`],-8))}function $1(e){let t=[[46,104],[20,124],[74,122]],r=[[14,106],[80,104]];return[A(100,184,86),Tr(Ee,It,qe),Sr(re),Qt(Ee),Zt(Nt),Mr(qe,Wn,"#fff3b0"),vr(re),Ar(re,[]),Ft(),V(120,35,e.mood,o.fly,0.9),A(46,184,38,0.4),b1(),v(120,74,1,1),v(146,108,0.75,3),R(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function _1(e){return[A(100,184,86),Tr(Ee,It,"#f2fbff"),Sr(re),Vs(),Qt(Ee),Zt(Nt),Mr("#f4fcff",qe,"#fff7c6"),i`<path d="M104 58H136L166 158H74Z" fill="#fff7c6" opacity=".4" />`,vr(re),c("fruit",[i1(90,De),o1(120,De),s1(150,De)]),c("veg",[a1(90,be),l1(121,be),qn(151,be)]),Ar(re,[Os(100,150,o.leaf,o.leafDark),qn(133,148),Bn(151,151,6),Bn(160,152,18)]),Ft(),V(120,35,e.mood,o.fly,0.9),v(28,30,1,1),v(188,34,0.85,2),v(180,130,1.1,3),v(12,100,0.8,4)]}function Ns(e,t){let r=Bu(e),n=r.mould/3;return I("fridge",e,t,{closed:()=>f1(r,n),stuffed:()=>h1(r,n),wiping:()=>y1(r),emptied:()=>$1(r),fresh:()=>_1(r)}[r.view]())}function w1(e){let{state:t,fill:r,progress:n,stink:s}=e,a=t==="running"||t==="waiting",l=L(r);if(t==="clean"||t==="due")l=1;if(a)l=Math.max(0.12,L(n));if(t==="resting")l=Math.min(l,0.12);return{level:l,tilt:t==="clean"?0:Math.round(L(s)*14),arc:a?L(n):0,tint:t==="clean"?0:L(s),pulse:t==="due",check:t==="clean",idle:t==="resting"}}var ee=66,x1=[o.water,"#a2dca0","#ffc65c","#ff7a4f"],v1=[o.waterDark,"#6fb777","#dd9a35","#c9502f"];function Qs(e,t){let r=L(t)*(e.length-1),n=Math.min(e.length-2,Math.floor(r));return y(e[n]??o.water,e[n+1]??o.water,r-n)}var Cr=66;function Fs(e,t){let r=`M-66 ${e}`;for(let n=-66;n<266;n+=Cr)r+=`q${Cr/4} ${-t} ${Cr/2} 0t${Cr/2} 0`;return`${r}V172H-66Z`}function M1(){return[i`<path d="M-1-30V-6H-19Z" fill=${o.cream} />`,i`<path d="M3-23V-6H16Z" fill=${o.coral} />`,i`<path d="M-27-3H27L19 13H-19Z" fill=${o.sun} />`,i`<path d="M-27-3H27L24 3H-24Z" fill=${o.sunDark} />`]}function jn(e,t){let r=w1(e),n=Qs(x1,r.tint),s=Qs(v1,r.tint),a=Tn[e.state].wall,l=r.check?0.84:r.level*0.74,u=_(100+ee-l*ee*2),p=y(o.metalMid,"#ffd29a",r.tint),m=2*Math.PI*(ee+3),b=`M0 28A28 28 0 0 1 28 0H172A28 28 0 0 1 200 28V172A28 28 0 0 1 172 200H28A28 28 0 0 1 0 172ZM${100-ee} 100a${ee} ${ee} 0 1 0 ${ee*2} 0a${ee} ${ee} 0 1 0 ${-ee*2} 0Z`,x=i`<circle cx="100" cy="100" r=${ee} fill="#0e1228" opacity=".55" /><g fill=${o.spark}><circle cx="70" cy="66" r="2.2" /><circle cx="128" cy="58" r="2.8" /><circle cx="146" cy="96" r="1.9" /><circle cx="58" cy="108" r="1.7" /></g>`,S=[h("tide-back",i`<path d=${Fs(u-7,7)} fill=${s} />`),f(!r.check,()=>c("boat",d(100,u-8,h("bob",d(0,0,M1(),r.tilt,0.8))))),h("tide",i`<path d=${Fs(u,9)} fill=${n} />`)],M=[i`<circle cx="100" cy="100" r=${ee+3} fill="none" stroke=${p} stroke-width="10" />`,f(r.arc>0,()=>c("arc",i`<circle cx="100" cy="100" r=${ee+3} fill="none" stroke=${o.sun} stroke-width="10" stroke-linecap="round" stroke-dasharray=${`${_(m*r.arc)} ${_(m)}`} transform="rotate(-90 100 100)" />`))];return I("generic",{...e,stink:0},t,[x,c("water",S),i`<path d=${b} fill=${a} fill-rule="evenodd" />`,c("ring",r.pulse?d(100,100,h("pulse",d(-100,-100,M))):M),f(r.check,()=>c("check",[i`<path d="M72 102l20 21 38-44" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />`,v(30,34,1.3,1),v(172,42,1,2),v(170,166,1.15,3),v(30,162,0.85,4)])),f(r.idle,()=>c("moon",d(100,92,i`<path d="M9-24A26 26 0 1 0 24 14 21 21 0 0 1 9-24Z" fill=${o.spark} />`)))],!1)}var at=5,A1=[0.05,0.3,0.6],T1=[0.35,0.7],Zs=[0.25,0.55,0.8],Yn=[0.45,0.7,0.92],S1=0.2,C1=0.6,zs=0.5;function L1(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink),s={scratches:w(n,A1),cup:n>=S1,shreds:n>=C1,grime:w(n,Zs)},a={hunger:0,dream:0,worry:0,flies:0};if(t==="clean")return{view:"purring",level:1,...a,scratches:0,cup:!1,shreds:!1,grime:0,mood:"happy"};if(t==="running")return{view:"pouring",level:3,...s,...a,mood:"happy"};if(t==="waiting")return{view:"eating",level:2,...s,...a,flies:Math.min(1,w(n,Yn)),mood:n>=zs?"calm":"happy"};if(t==="resting")return{view:"curled",level:at,...s,...a,flies:Math.min(1,w(n,Yn)),mood:n>=0.7?"sick":"sleepy"};let l=t==="due",u=l?at:Math.min(at-1,Math.floor(r*at)),p=n>=zs,m=w(n,Zs),b=w(n,T1)+(l?1:0),x=l?"pleading":u>=3?"worried":"calm";if(p)x=n>=0.75?"sick":"worried";return{view:p?"sprawled":l?"begging":"watching",level:at-u,hunger:u,...s,dream:b,worry:m,flies:w(n,Yn),mood:x}}var D1="#f9a94e",E1="#dd8430",P1="#ff9fb0",Us="#f0708a",H1="#43240f",ue=["#c98345","#a9652f","#e3a767"],V1="#8a5226",R1="#7a2f56",zt=178;function O1(e){let t=e*0.13;return{fur:y(D1,"#a89070",t),dark:y(E1,"#7d6a4f",t)}}function D(e,t,r){return i`<path d=${e} fill="none" stroke=${t} stroke-width=${r} stroke-linecap="round" stroke-linejoin="round" />`}var I1=[[1,[[-15,-33],[-2,-32],[13,-33],[-8,-37],[6,-37]]],[2,[[-22,-36],[21,-36],[-14,-41],[0,-42],[14,-41]]],[3,[[-19,-45],[-7,-47],[7,-47],[19,-45]]],[4,[[-12,-52],[1,-53],[13,-51]]],[5,[[-6,-58],[6,-58],[0,-63]]]];function N1(e){if(e<=0)return k;let t=20+Math.min(e,3)*2.8,r=3+e*6.2;return c("kibble",[i`<path d=${`M${-t}-31A${t} ${r} 0 0 1 ${t}-31Z`} fill=${V1} />`,I1.filter(([n])=>e>=n).map(([n,s])=>c("kibble-step",s.map(([a,l],u)=>i`<circle cx=${a} cy=${l} r="5.4" fill=${ue[(u+n)%ue.length]} />`),n))])}function qs(e){return[i`<ellipse cx="0" cy="-32" rx="37" ry="9.5" fill=${o.pinkDark} />`,i`<ellipse cx="0" cy="-32" rx="31" ry="6.5" fill=${R1} />`,f(e===0,()=>c("empty",[D("M-17-32q7-3 13-3","#fff",2.2),i`<circle cx="9" cy="-30" r="1.8" fill=${ue[0]} /><circle cx="15" cy="-33" r="1.4" fill=${ue[1]} />`])),N1(e)]}function Bs(e,t){return[i`<path d="M-16 0C-8-11 8-11 14-2L24-10C26-3 26 3 24 10L14 2C8 11-8 11-16 0Z" fill=${e} />`,D("M-4-6q4 6 0 12",t,2.4),i`<circle cx="-9" cy="-1.6" r="2.3" fill=${o.glass} />`]}function Ws(){return[i`<path d="M-37-32A37 9.5 0 0 0 37-32L30-5Q29 0 23 0H-23Q-29 0-30-5Z" fill=${o.pink} />`,D("M-35-29.5A36 9 0 0 0 35-29.5",o.pinkDark,3.5),d(0,-11,Bs(o.cream,o.creamDark),0,0.48)]}function lt(e){return c("bowl",[qs(e),Ws()],e)}function Q1(e){let t=(r)=>i`<g transform=${`scale(${r} 1)`}><path d="M12-22L33-46Q37-49 38-44L37-6Z" fill=${e.fur} /><path d="M21-23L33-38Q34-39 34.5-37L34-15Z" fill=${P1} /></g>`;return[t(-1),t(1),i`<ellipse rx="38" ry="30" fill=${e.fur} />`,i`<path d="M-34 0L-47 8L-38 10L-43 18L-26 22ZM34 0L47 8L38 10L43 18L26 22Z" fill=${e.fur} />`]}function Be(e,t,r=0,n=1,s=!1){return c("head",[f(s,()=>i`<g opacity=".55">${d(-2,2,i`<ellipse rx="42" ry="34" fill=${t.dark} /><path d="M-41-4L-37-49L-6-30ZM41-4L37-49L6-30Z" fill=${t.dark} />`)}</g>`),Q1(t),d(r*0.5,0,D("M-9-29V-20M0-30V-18M9-29V-20",t.dark,4.4)),d(r,0,[i`<ellipse cx="-24" cy="10" rx="6.5" ry="4" fill=${o.pink} opacity=".55" /><ellipse cx="24" cy="10" rx="6.5" ry="4" fill=${o.pink} opacity=".55" />`,D("M-28 4L-47 0M-28 11L-46 13M28 4L47 0M28 11L46 13",o.cream,2),V(0,-3,e,H1,n),i`<path d="M-3.2 3H3.2Q4.2 3 3.6 3.9L.8 6.6Q0 7.2-.8 6.6L-3.6 3.9Q-4.2 3-3.2 3Z" fill=${Us} />`])])}function We(e,t,r,n,s=!1){let a=([l,u])=>s?`M${l} ${u-4.5}v9`:`M${l-4.5} ${u}h9`;return c("tail",[D(t,e.fur,13),D(r.map(a).join(""),e.dark,4.6),D(n,e.dark,13)])}function Ut(e,t=!1){return[i`<path d=${t?"M-48-4C-60-42-32-74 0-74C32-74 60-42 48-4Q46 0 38 0H-38Q-46 0-48-4Z":"M-36-4C-44-36-26-74 0-74C26-74 44-36 36-4Q34 0 28 0H-28Q-34 0-36-4Z"} fill=${e.fur} />`,i`<ellipse cx="0" cy=${t?-30:-28} rx=${t?35:21} ry=${t?27:25} fill=${o.cream} />`,i`<ellipse cx="0" cy="-60" rx="27" ry="6.5" fill=${e.dark} opacity=".5" />`,D(t?"M-49-34h7M-52-22h8M49-34h-7M52-22h-8":"M-35-34h6M-37-22h7M35-34h-6M37-22h-7",e.dark,4)]}function js(e,t=12){let r=(n)=>[i`<rect x=${n-9.5} y="-15" width="19" height="16" rx="8" fill=${e.fur} />`,D(`M${n-3}-4v-4M${n+3}-4v-4`,e.dark,2)];return c("paws",[r(-t),r(t)])}function F1(e,t,r,n){if(r<=0)return k;let s=[0,17,22,28][r]??28,[a,l]=n,u=[[a,l,3.5],[a+(e-a)*0.38,l+(t-l)*0.38,5.5]];return c("dream",[u.map(([p,m,b])=>i`<circle cx=${p} cy=${m} r=${b} fill=${o.cream} />`),d(e,t,h("pulse",[i`<circle r=${s} fill=${o.cream} />`,d(-2,0,Bs(o.sky,o.skyDark),0,s/29)]))],r)}function Z1(e,t,r,n,s){return c("scratch",d(e,t,D("M0 0L5 30M10-4L16 34M21-2L26 28M31 3L35 24",o.cream,3.4),r,n),s)}function z1(e,t){return e.slice(0,t).map(([r,n,s,a],l)=>i`<g opacity=".42">${Z1(r,n,s,a,l)}</g>`)}function U1(e,t,r=1){return c("cup",d(e,t,[i`<ellipse cx=${r*20} cy="5" rx="18" ry="4.2" fill=${o.cream} />`,d(0,-7,[i`<path d="M-11-10H11V6Q11 11 6 11H-6Q-11 11-11 6Z" fill=${o.lilac} />`,D("M11-5Q19-5 18 1T11 6",o.lilacDark,3.6),i`<ellipse cx="0" cy="-10" rx="11" ry="3" fill=${o.lilacDark} />`],r*96)]))}function q1(e){let t=[o.cream,o.coral,o.creamDark,o.sun];return c("shreds",e.map(([r,n,s],a)=>d(r,n,i`<path d="M-7-3L-2-5L1-2L7-4L5 3L0 2L-5 5Z" fill=${t[a%t.length]} />`,s)))}function B1(e,t){return e.slice(0,t).map(([r,n,s],a)=>c("worry",d(r,n,h("drip",O(0,0,o.water,1.05),a+1),s),a))}function W1(e,t){return c("scribble",d(e,t,h("wobble",D("M-13 0C-13-11 10-13 12-3C14 8-9 10-8 0C-7-8 7-8 6 0C5 5-3 5-2 0",o.glass,3.2))))}function Kn(e,t,r,n){return c("zzz",d(e,t,h("rise",D("M-7-7H7L-7 7H7",o.cream,4),n),0,r))}function Gn(e,t,r,n,s){return c("heart",d(e,t,h("rise",i`<path d="M0 11C-16-1-11-11-5-11C-2-11 0-8 0-6C0-8 2-11 5-11C11-11 16-1 0 11Z" fill=${n} />`,s),0,r))}function j1(e,t){return[A(84,183,64),c("cushion",[i`<ellipse cx="78" cy="170" rx="62" ry="13" fill=${o.lilacDark} />`,i`<ellipse cx="78" cy="165" rx="60" ry="11" fill=${o.lilac} />`]),c("cat",[d(78,165,h("throb",d(-78,-165,[i`<path d="M22 150C22 112 56 100 86 102C118 104 134 124 132 150C131 164 120 168 100 168H42C28 168 22 162 22 150Z" fill=${t.fur} />`,D("M46 113q2 8 0 15M62 106q2 9 0 17",t.dark,5)])))]),d(100,139,Be(e.mood,t,0,0.92,!0),7,0.86),c("cat-tail",[D("M30 158C42 176 88 176 104 165",t.dark,16),We(t,"M30 158C42 176 88 176 104 165",[[50,170.5],[68,172.5],[85,171]],"M102 166.5l2-1.5",!0)]),d(166,182,lt(at),0,0.68),Kn(140,96,0.8,1),Kn(156,72,1.05,2),Kn(173,44,1.35,3)]}function Y1(e,t){let r=e.hunger*3,n=e.hunger*2.2,s=(a)=>e.hunger>=a;return[A(112,183,80),c("cat",d(72,zt,[d(-26,-8,h("sway",We(t,"M0 2C-28 4-30-30-16-44",[[-22,-9],[-24,-25]],"M-17-42l.5-1"))),Ut(t),js(t),d(n,-88,Be(e.mood,t,3+e.hunger*1.4),r)])),d(150,182,lt(e.level)),f(s(3),()=>c("gaze",[h("flicker",D("M134 126l-3-7",o.spark,4),1),h("flicker",D("M150 121v-8",o.spark,4),2),h("flicker",D("M166 126l3-7",o.spark,4),3)])),f(s(4),()=>c("drool",d(100,109,h("drip",O(0,0,o.water,0.72),2))))]}function K1(e,t){return[A(100,183,56),c("cat",h("bob",d(100,zt,[d(-28,-8,h("sway",We(t,"M0 2C-30 6-38-30-22-48",[[-26,-9],[-30,-27]],"M-23-46l.5-1"))),Ut(t),i`<ellipse cx="-24" cy="-5" rx="13" ry="7" fill=${t.fur} /><ellipse cx="24" cy="-5" rx="13" ry="7" fill=${t.fur} />`,d(0,-86,Be(e.mood,t,0,1.16)),d(0,-12,lt(0),-4,0.9),c("paws",[i`<ellipse cx="-33" cy="-37" rx="10" ry="12" fill=${t.fur} /><ellipse cx="33" cy="-37" rx="10" ry="12" fill=${t.fur} />`,D("M-36-45v5M-30-45v5M36-45v5M30-45v5",t.dark,2.2)])]))),c("meow",[h("flicker",D("M44 92q-8 8-1 18M32 86q-12 14-2 30",o.cream,4),1)])]}function G1(e,t){return[A(92,183,80),d(168,182,lt(0),0,0.62),c("cat",[d(134,158,h("wobble",[D("M0 0L14-38",t.fur,14),D("M14-38l.1-.1",t.dark,16)])),d(120,154,h("wobble",[D("M0 0L4-42",t.fur,14),D("M4-42l.01-.1",t.dark,16)],2)),i`<path d="M60 150C62 130 96 126 122 132C146 138 152 158 142 170Q138 176 128 176H78C62 176 58 164 60 150Z" fill=${t.fur} />`,i`<ellipse cx="102" cy="150" rx="33" ry="13" fill=${o.cream} transform="rotate(5 102 150)" />`,We(t,"M138 170C154 176 150 186 128 185",[[146,181]],"M129 185l-1 0",!0),D("M72 168C72 176 66 180 60 183",t.fur,13),D("M60 183l-.1 0",t.dark,14),d(50,141,Be(e.mood,t,0,1,!0),-16,0.82)]),B1([[90,118,-25],[13,124,25],[74,100,-12]],e.worry),f(e.worry>=3,()=>W1(40,88))]}function X1(){return c("scoop",[d(165,60,[D("M26-12L46-22",o.metalDark,10),i`<path d="M-26-22H26V8Q26 18 16 18H-16Q-26 18-26 8Z" fill=${o.metal} />`,i`<rect x="-30" y="-27" width="60" height="10" rx="5" fill=${o.metalMid} />`,D("M-14 6V-8","#fff",4)],-48,0.76)])}var J1=[[136,82,1],[146,92,3],[141,76,2],[138,112,4],[152,114,5],[148,72,4]];function ep(e,t){return[A(72,183,40,0.2),A(150,183,40),c("cat",h("bob",d(70,zt-20,[d(-26,-8,h("wobble",We(t,"M0 2C-26 2-34-30-20-50",[[-21,-9],[-26,-28]],"M-21-48l.5-1"))),i`<ellipse cx="-20" cy="0" rx="11" ry="9" fill=${t.fur} /><ellipse cx="20" cy="0" rx="11" ry="9" fill=${t.fur} />`,Ut(t),D("M-27-50C-52-58-58-88-52-110",t.fur,14),D("M27-50C52-58 58-88 52-110",t.fur,14),D("M-52-110v-.1",t.dark,15),D("M52-110v-.1",t.dark,15),d(3,-88,Be(e.mood,t,4),6)]))),c("hop",[h("flicker",D("M46 175l-3 6M72 177v6M98 175l3 6",o.cream,4),1)]),d(150,182,lt(e.level)),c("pour",J1.map(([r,n,s],a)=>d(r,n,h("fall",i`<circle r="5.4" fill=${ue[a%ue.length]} />`,s)))),X1()]}var tp=[[128,108,1,3.4],[176,112,3,4],[186,148,2,3],[112,176,4,3.4],[186,182,5,2.8],[120,186,2,2.4]];function rp(e,t){return[A(112,183,80),c("crumbs-floor",[i`<circle cx="104" cy="181" r="3" fill=${ue[0]} /><circle cx="184" cy="178" r="3.4" fill=${ue[2]} /><circle cx="187" cy="186" r="2.6" fill=${ue[1]} />`]),c("cat",[d(64,zt,[d(-26,-8,h("sway",We(t,"M0 2C-22 4-30-26-14-46",[[-18,-9],[-22,-26]],"M-15-44l.5-1"))),Ut(t),js(t)],8)]),d(148,182,qs(e.level)),d(120,120,h("bob",[D("M-42-6L-14 0",t.fur,34),d(0,0,Be(e.mood,t,5,1,!0),15)])),d(148,182,c("bowl",Ws())),c("crumbs",tp.map(([r,n,s,a],l)=>d(r,n,h("drip",i`<circle r=${a} fill=${ue[l%ue.length]} />`,s))))]}function np(e,t){return[A(86,183,64),c("cat",[d(86,zt,[d(-40,-10,h("sway",We(t,"M0 2C-26 6-34-22-20-38",[[-20,-6],[-25,-21]],"M-21-36l.5-1"))),h("rumble",[Ut(t,!0),i`<ellipse cx="-30" cy="-4" rx="14" ry="7" fill=${t.fur} /><ellipse cx="30" cy="-4" rx="14" ry="7" fill=${t.fur} />`,c("tummy-paw",[D("M38-48C30-36 20-30 8-30",t.fur,13),D("M4-34v8M9-35v9",t.dark,2.2)]),d(0,-88,[Be(e.mood,t),c("tongue",i`<path d="M-1 9q5 8 9 1Z" fill=${Us} />`)])])])]),c("purr",[h("flicker",D("M32 84q-7 10 0 20M22 78q-10 16 0 32",o.cream,3.6),1)]),d(166,182,lt(e.level),0,0.62),Gn(150,92,1,o.coral,1),Gn(172,66,0.75,o.pink,3),Gn(142,42,0.62,o.pink,2),v(26,50,1.2,1),v(180,126,0.8,2),v(16,146,0.7,3),v(118,22,0.85,4)]}var ip={curled:[[28,40,-8,1],[84,26,6,0.85],[40,92,10,0.75]],watching:[[134,30,6,1],[22,22,-8,0.8],[160,80,-10,0.72]],begging:[[14,24,-8,0.82],[150,96,8,0.85],[160,20,0,0.6]],sprawled:[[16,24,-8,1],[158,64,8,0.85],[64,44,4,0.72]],pouring:[[18,28,-8,0.8],[170,104,10,0.72],[100,22,4,0.62]],eating:[[150,34,6,1],[22,22,-8,0.8],[100,26,10,0.72]],purring:[]},op={curled:[120,180,-1],watching:[24,180,1],begging:[160,180,-1],sprawled:[26,180,1],pouring:[18,180,1],eating:[22,180,1],purring:[0,0,1]},sp={curled:[[18,178,10],[150,174,40],[32,186,80]],watching:[[108,186,20],[14,170,-30],[52,186,60]],begging:[[28,180,20],[46,188,-30],[176,170,60]],sprawled:[[104,186,20],[84,184,-40],[150,188,70]],pouring:[[104,178,20],[116,187,70],[90,187,-30]],eating:[[92,186,20],[40,186,70],[14,168,-30]],purring:[]},ap={curled:[[116,84]],watching:[[178,124],[126,74],[176,50]],begging:[[40,130],[160,128],[150,60]],sprawled:[[172,134],[168,92],[78,60]],pouring:[],eating:[[172,66]],purring:[]},lp={curled:[[0,0],[0,0]],watching:[[150,58],[114,76]],begging:[[160,44],[134,74]],sprawled:[[124,58],[96,104]],pouring:[[0,0],[0,0]],eating:[[0,0],[0,0]],purring:[[0,0],[0,0]]};function Ys(e,t){let r=L1(e),n=O1(r.grime),s={curled:()=>j1(r,n),watching:()=>Y1(r,n),begging:()=>K1(r,n),sprawled:()=>G1(r,n),pouring:()=>ep(r,n),eating:()=>rp(r,n),purring:()=>np(r,n)},[a,l]=lp[r.view],[u,p,m]=op[r.view],b=[z1(ip[r.view],r.scratches),s[r.view](),f(r.cup,()=>U1(u,p,m)),f(r.shreds,()=>q1(sp[r.view])),F1(a[0],a[1],r.dream,l),ap[r.view].slice(0,r.flies).map(([x,S],M)=>N(x,S,M))];return I("pet",e,t,b)}var Bt=[[52,72],[84,72],[116,72],[148,72],[52,124],[84,124],[116,124]],Gs="#8f8a84",Xs="#aaa497",cp=y(o.coral,Gs,0.5),dp=y(o.cream,Xs,0.5),up=0.35,pp=[0.15,0.45,0.75],hp=[0.25,0.5,0.75];function fp(e,t=3){let{state:r,stink:n,fill:s}=e,a=Number.isFinite(t)?(Math.trunc(t)%7+7)%7:3,l=e.slots?.length===Bt.length?e.slots:void 0,u=l??Bt.map((C,Q)=>Q<a?"taken":"full"),p=a;if(l)p=r==="clean"?l.lastIndexOf("taken"):l.indexOf("current");let m=l?.[p]==="current",b=r==="clean"?0:w(n,pp),S={resting:"quiet",accumulating:"quiet",due:"ready",running:"lifted",waiting:"taken-pending",clean:"popped"}[r],M=r==="resting"?"sleepy":"calm";if(r==="due")M="pleading";if(r==="clean"||r==="running")M="happy";if(b>=1)M="worried";if(b>=2)M="sick";return{day:p,cells:u,phase:S,pulse:r==="due"||m,glow:r==="accumulating"?w(s,hp):0,neglect:b,fade:r==="clean"?0:L(n)*0.7,tilt:[0,-3,-6,-10][b]??0,mood:M}}function qt(e,t,r=0.6){return i`
    <rect x="-10" y="-22" width="20" height="44" rx="10" fill=${e} />
    <path d="M-10 0H10V12A10 10 0 0 1-10 12Z" fill=${t} />
    <rect x="-5.5" y="-16" width="4" height="13" rx="2" fill="#fff" opacity=${r} />
  `}function ct(e,t,r){return r?i`<rect x=${e-13} y=${t-25} width="26" height="50" rx="13" fill="#545c78" /><path d=${`M${e-8} ${t+8}a8 11 0 0 0 16 0`} fill="none" stroke="#7d86a3" stroke-width="3.4" stroke-linecap="round" />`:i`<rect x=${e-13.5} y=${t-25.5} width="27" height="51" rx="13.5" fill=${o.metal} />`}function mp(e,t,r){return d(e,t,qt(y(cp,Gs,r),y(dp,Xs,r),up))}function Ks(e,t){return c("glass",d(e,t,[i`<path d="M-17-30H17L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="#cfe8ff" opacity=".35" />`,i`<path d="M-15.5-10H15.5L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill=${o.water} />`,i`<path d="M-9-2L-7 22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`]))}function gp(e,t){return c("check",d(e,t,[i`<circle r="19" fill=${o.check} /><path d="M-9 0l6.5 7L9.5-7" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`]))}function yp(e){return c("dust",[[44,46,2.6],[132,104,2.2],[150,134,3],[66,100,2],[104,46,2.4],[36,148,2.2],[128,150,2.8],[92,98,2.2]].slice(0,e*3).map(([r,n,s])=>i`<circle cx=${r} cy=${n} r=${s} fill="#b9b3a3" opacity=".85" />`))}function bp(){return c("cobweb",i`<g fill="none" stroke=${"#d7dce8"} stroke-width="2" stroke-linecap="round" opacity=".8">
      <path d="M200 28L146 34M200 28L154 8M172 0L166 22" />
      <path d="M178 2Q180 14 200 16M162 6Q164 24 200 40M150 18Q156 34 170 28" />
    </g>`)}function kp(){return c("spider",[i`<path d="M160 24V66" stroke="#d7dce8" stroke-width="1.8" />`,d(160,70,h("bob",i`<g fill="none" stroke=${o.fly} stroke-width="2.6" stroke-linecap="round">
            <path d="M-6-3L-15-9M-6 0L-16 0M-6 3L-15 9M6-3L15-9M6 0L16 0M6 3L15 9" />
          </g><circle r="9" fill=${o.fly} stroke=${o.wing} stroke-width="1.4" /><circle cx="-3.2" cy="-1.5" r="2.1" fill="#fff" /><circle cx="3.2" cy="-1.5" r="2.1" fill="#fff" />`))])}function Js(e,t){let r=fp(e,t?.day),n=y(o.metalMid,"#8c8a80",r.fade),s=y(o.coral,"#a59a90",r.fade),a=y(o.cream,"#b3ad9e",r.fade),l=y(o.sun,"#a59a90",r.fade),u=Bt[r.day]??Bt[3]??[84,72],[p,m]=u,b=Bt.flatMap(([pe,he],fe)=>{if(fe===r.day)return[];let kt=r.cells[fe];if(kt==="taken")return[c("empty-well",ct(pe,he,!0),fe)];if(kt==="missed")return[c("missed-pill",[ct(pe,he,!1),mp(pe,he,r.fade)],fe)];return[c("pill",[ct(pe,he,!1),d(pe,he,qt(s,a))],fe)]}),x=r.day>=0,S=(pe)=>d(p,m,r.pulse?h("pulse",pe):pe),M=r.phase==="ready"?1:Math.max(r.glow*0.3,r.pulse?0.45:0),C=f(r.pulse||r.glow>0,()=>c("halo",S(i`<rect x="-18.5" y="-30.5" width="37" height="61" rx="18.5" fill="none" stroke=${o.sun} stroke-width="5" opacity=${M} />`))),Q;if(!x)Q=k;else if(r.phase==="popped"||r.phase==="taken-pending")Q=[C,c("empty-well",ct(p,m,!0),r.day)];else if(r.phase==="lifted")Q=[C,c("empty-well",ct(p,m,!0),r.day),c("next-pill",d(p,m-16,h("bob",qt(l,a)),18),r.day)];else Q=[C,ct(p,m,!1),c("next-pill",d(p,m,r.pulse?h("throb",qt(l,a)):qt(l,a)),r.day)];let Y=r.phase==="popped"||r.phase==="taken-pending",Zr=d(Y?86:100,Y?90:100,d(-100,-100,[i`<rect x="30" y="36" width="140" height="124" rx="16" fill=${n} />`,i`<path d="M30 92H170" stroke=${y(o.metalDark,"#6d6b62",r.fade)} stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" />`,b,Q,V(148,124,r.mood,y(o.fly,"#4d4b45",r.fade),0.82),f(r.neglect>0,()=>yp(r.neglect)),f(x&&r.phase==="popped",()=>gp(p,m))]),r.tilt,Y?0.84:1),Oe=[];if(r.phase==="popped")Oe.push(Ks(168,146),v(26,30,1.2,1),v(178,34,0.95,2),v(24,130,0.85,3));if(r.phase==="taken-pending")Oe.push(Ks(168,146));if(r.neglect>=2)Oe.push(bp());if(r.neglect>=3)Oe.push(kp());return I("pills",e,t,[A(100,176,72),Zr,Oe])}var Lr=4,$p=[0.1,0.4,0.75];function _p(e){let{state:t,fill:r,stink:n}=e;if(t==="clean")return{droop:0,wilt:0,petals:8,fallen:0,wet:!0,drops:!0,can:!1,thirst:!1,mood:"happy"};let s=w(n,$p);if(t==="running"||t==="waiting")return{droop:Math.min(1,Math.floor(r*(Lr+1))),wilt:s,petals:8-s*2,fallen:s,wet:!0,drops:!1,can:t==="running",thirst:!1,mood:t==="running"?"happy":"calm"};let a=Math.min(Lr,Math.floor(r*(Lr+1))),l=t==="due"?Lr:a,u=t==="resting"?"sleepy":l>=2?"worried":"calm";if(t==="due")u="pleading";if(s>=2)u="sick";return{droop:l,wilt:s,petals:8-s*2,fallen:s,wet:!1,drops:!1,can:!1,thirst:t==="due",mood:u}}var ea=78,ta="M0 0C-14-7-15-27 0-40C15-27 14-7 0 0Z",wp=[0.12,0.65,1.3,1.95,2.55];function Wt(e,t){let r=ea*t;if(Math.abs(e)<0.001)return{x:0,y:-r,angle:0};let n=e/ea;return{x:(1-Math.cos(n*r))/n,y:-Math.sin(n*r)/n,angle:n*r}}function ra(e){return e*180/Math.PI}function xp(e){return Array.from({length:9},(r,n)=>Wt(e,n/8)).map((r,n)=>`${n?"L":"M"}${_(r.x)} ${_(r.y)}`).join("")}function vp(e,t,r){return[Array.from({length:8},(s,a)=>a).filter((s)=>s<e).map((s)=>i`<ellipse cx="0" cy="-17" rx="8" ry="12" transform=${`rotate(${s*45})`} fill=${t} data-part="petal" />`),i`<circle r="11" fill=${r} />`]}function Xn(e,t,r,n,s,a){return d(e.x,e.y,[i`<path d=${ta} fill=${n} />`,i`<path d="M0-4V-32" stroke=${s} stroke-width="2.6" stroke-linecap="round" />`],ra(e.angle)+t*r,a)}function Mp(){return c("watering-can",[d(150,42,[i`<rect x="-20" y="-14" width="46" height="34" rx="7" fill=${o.sky} />`,i`<path d="M-20-2L-48-20" stroke=${o.sky} stroke-width="8" stroke-linecap="round" />`,i`<rect x="-56" y="-30" width="9" height="20" rx="3" transform="rotate(-32 -52 -20)" fill=${o.skyDark} />`,i`<path d="M26-6a14 14 0 0 1 0 22" fill="none" stroke=${o.skyDark} stroke-width="6" stroke-linecap="round" />`],-10),[[92,60,1],[104,74,2],[84,82,3],[96,96,4]].map(([e,t,r])=>d(e,t,h("fall",O(0,0,o.water,0.9),r)))])}function na(e,t){let r=_p(e),n=r.wilt/3,s=(wp[r.droop]??0)+r.wilt*0.12,a=y(o.leaf,"#9b7a3e",n),l=y(o.leafDark,"#7a5d2c",n),u=y(o.leafDark,"#7f6a35",n),p=y(o.pink,"#a98a6b",n),m=y(o.sun,"#8d6b37",n),b=52+r.droop*14,x=Wt(s,1),S=r.droop===0&&r.wilt===0&&!r.can,M=[i`<path d=${xp(s)} fill="none" stroke=${u} stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />`,Xn(Wt(s,0.26),-1,b,a,l,1.05),Xn(Wt(s,0.48),1,b,a,l,1),Xn(Wt(s,0.7),-1,b+8,a,l,0.82),c("flower",d(x.x,x.y,vp(r.petals,p,m),ra(x.angle),0.98))],C=[[46,172,-30],[158,176,40],[62,180,70]].slice(0,r.fallen).map(([Q,Y,_e],bt)=>c("fallen-leaf",d(Q,Y,[i`<path d=${ta} fill=${y("#9b7a3e","#6d4f28",r.wilt/3)} />`],_e,0.5),bt));return I("plant",e,t,[A(100,183,52),C,d(100,138,c("stem",S?h("sway",M):M)),i`<path d="M62 134H138L130 176Q129 182 122 182H78Q71 182 70 176Z" fill=${o.terracotta} />`,i`<rect x="55" y="122" width="90" height="19" rx="8" fill=${o.terracottaDark} />`,i`<ellipse cx="100" cy="124" rx="38" ry="4.5" fill=${r.wet?o.soilWet:o.soil} data-part="soil" />`,f(!r.wet&&r.wilt>0,()=>c("cracks",i`<path d="M78 124l6 2 3-2M108 123l5 2 4-2" fill="none" stroke="#7a5a44" stroke-width="2" stroke-linecap="round" />`)),V(100,158,r.mood,"#5b2612",0.95),f(r.thirst,()=>c("thirst",[i`<circle cx="64" cy="82" r="4.5" fill=${o.cream} /><circle cx="54" cy="69" r="7.5" fill=${o.cream} />`,d(42,40,h("pulse",[i`<circle r="24" fill=${o.cream} />`,O(0,1,o.waterDark,1.7)]))])),f(r.can,Mp),f(r.drops,()=>c("drops",[[52,34,1],[148,26,2],[32,80,3],[170,74,4]].map(([Q,Y,_e])=>d(Q,Y,h("fall",O(0,0,o.water,1.05),_e))))),f(r.drops,()=>[v(40,112,1,2),v(164,118,0.85,3),v(100,16,0.9,1)])])}var Jn=6,jt=5,Ap=[0.08,0.35,0.6],Tp=[0.05,0.4,0.7],Sp=[0.25,0.5,0.8],Cp=[0.6,0.9],Lp=[0.5,0.85];function Dp(e){let{state:t}=e,r=L(e.fill),n=L(e.stink);if(t==="clean")return{view:"gleaming",specks:0,film:0,plaque:0,germs:0,stench:0,flies:0,mood:"happy"};let s=w(n,Ap),a=w(n,Tp),l=w(n,Sp),u=w(n,Cp),p=n>=0.5;if(t==="running")return{view:"scrubbing",specks:0,film:1,plaque:s,germs:Math.min(1,l),stench:a,flies:0,mood:"happy"};if(t==="waiting")return{view:"rinsing",specks:0,film:0,plaque:Math.max(0,s-1),germs:w(n,Lp),stench:a,flies:0,mood:p?"worried":"calm"};if(t==="due")return{view:"pleading",specks:Jn,film:jt,plaque:s,germs:l,stench:a,flies:u,mood:p?"sick":"pleading"};if(t==="resting")return{view:"sleeping",specks:0,film:0,plaque:s,germs:l,stench:a,flies:u,mood:p?"sick":"sleepy"};let m=Math.min(Jn,Math.floor(r*(Jn+1))),b=Math.min(jt,Math.floor(r*(jt+1))),x=m>=4?"worried":"calm";if(p)x="sick";return{view:"dirty",specks:m,film:b,plaque:s,germs:l,stench:a,flies:u,mood:x}}var ti="M-57-34C-61.5-60-34-72-18-66C-9-63-4.5-59 0-59C4.5-59 9-63 18-66C34-72 61.5-60 57-34",Ep=`${ti}C54.7-14 52.4-2 47.9 18C43.3 40 41 66 25 66C11.4 66 13.7 34 0 34C-13.7 34-11.4 66-25 66C-41 66-43.3 40-47.9 18C-52.4-2-54.7-14-57-34Z`,Pp="M34.5-66.65C47.8-63.5 60.2-52.2 57-34C54.7-14 52.4-2 47.9 18C43.3 40 41 66 25 66C17.7 66 14.8 56 12.5 47C27.4 56 33 32 37.6 12C42.2-8 47.9-24 45.6-42C44.5-54 41-62 34.5-66.65Z",Hp=`${ti}q-12 12-23 3t-23 2t-22-1t-23 2t-23-6Z`,Vp=`${ti}q-8 16-20 8t-22 4t-24-2t-24 4t-24-14Z`,Rp="#4a3a5c",Op="#fdfbf2",ia="#e9ca72",Ip="#b8ab60",oa="#ffffff",Yt="#cfeaff";function Np(e){if(e.view==="gleaming")return"#ffffff";return y(y(Op,ia,e.film/jt*0.82),Ip,e.plaque/3*0.6)}function Qp(){return[i`<path d="M-2 2L1 12" stroke="#7fbf63" stroke-width="5" stroke-linecap="round" />`,i`<g fill=${o.leafDark}><circle cx="-6" cy="-1" r="5.5" /><circle cx="5" cy="0" r="5" /><circle cx="0" cy="-6" r="6" /></g>`]}function Fp(){return[i`<path d=${de(9,7.5)} fill="#b9814a" />`,i`<g fill="#6d4526"><circle cx="-3" cy="-1" r="1.6" /><circle cx="3" cy="1.5" r="1.6" /></g>`]}function Zp(){return i`<path d="M-9 3Q-2-11 10-4Q7 5-2 8Q-7 9-9 3Z" fill=${o.coralDark} />`}function zp(){return i`<rect x="-8" y="-4" width="16" height="8" rx="3.2" fill="#f79a3e" /><path d="M-3-4V1M3-1V4" stroke="#d97a22" stroke-width="1.8" stroke-linecap="round" />`}function Up(){return i`<g fill="#39304a"><ellipse cx="-6" cy="1" rx="3" ry="2" transform="rotate(-24 -6 1)" /><ellipse cx="2" cy="-3" rx="3" ry="2" transform="rotate(30 2 -3)" /><ellipse cx="5" cy="4" rx="3" ry="2" transform="rotate(-8 5 4)" /></g>`}function qp(){return i`<path d="M0-8C9-9 14-2 11 7C9 15 2 21-1 14C-3 8-8 5-7-1C-6-6-4-7 0-8Z" fill=${o.leafDark} /><path d="M1-5Q3 3 1 12" fill="none" stroke=${o.leaf} stroke-width="2" stroke-linecap="round" />`}var Bp=[[-33,-44,-14,Qp],[32,-46,10,Fp],[-35,24,0,Zp],[37,22,-28,zp],[-4,-38,0,Up],[1,-56,0,qp]],Wp=[[-27,-31,13,8],[33,-28,16,11],[-29,48,9,10]];function jp(e){return i`<path d="M0-58q-3 9 0 15M-32-55q-5 5-6 12M32-55q5 5 6 12" fill="none" stroke=${e} stroke-width="3.2" stroke-linecap="round" />`}function Yp(){return i`<g fill=${o.pink} opacity=".55"><ellipse cx="-36" cy="10" rx="7.5" ry="4.8" /><ellipse cx="36" cy="10" rx="7.5" ry="4.8" /></g>`}function Kp(e){return Array.from({length:8},(t,r)=>{let n=r*Math.PI/4+0.39;return i`<circle cx=${_(Math.cos(n)*12.5)} cy=${_(Math.sin(n)*12.5)} r="3.8" fill=${e} />`})}var Gp=[[-50,-22,2,o.mintDark],[38,-82,1,o.lilacDark],[47,56,3,o.coralDark]];function sa(e,t,r,n,s){return c("germ",d(e,t,h("wobble",[Kp(r),i`<circle r="13" fill=${r} />`,i`<circle cx="-5" cy="-2.5" r="4.6" fill="#fff" /><circle cx="5" cy="-2.5" r="4.6" fill="#fff" />`,i`<circle cx="-3.8" cy="-1.8" r="2.3" fill=${o.fly} /><circle cx="3.8" cy="-1.8" r="2.3" fill=${o.fly} />`,i`<path d="M-9-8.5l6 2.6M9-8.5l-6 2.6" stroke=${o.fly} stroke-width="2.2" stroke-linecap="round" />`,i`<path d="M-6 6l3 3l3-3l3 3l3-3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />`],s)),n)}function Xp(e){return Gp.slice(0,e).map(([t,r,n,s],a)=>sa(t,r,s,a,n))}function je(e,t,r){return i`<circle cx=${e} cy=${t+2.4} r=${r} fill=${Yt} /><circle cx=${e} cy=${t} r=${r} fill=${oa} />`}function Jp(){return c("foam",[[[-46,-56,11],[-30,-68,13],[-9,-63,12],[12,-69,13],[33,-65,12],[49,-51,9.5],[-52,-42,7.5],[-24,-52,9],[16,-51,8.5]].map(([t,r,n])=>je(t,r,n)),i`<path d="M-50-30v8M54-38v12" stroke=${oa} stroke-width="8" stroke-linecap="round" />`,i`<circle cx="-33" cy="-71" r="2.8" fill=${Yt} /><circle cx="11" cy="-72" r="2.4" fill=${Yt} />`])}function eh(){return c("nightcap",d(-2,-56,[i`<path d="M-41 2C-40-34-14-58 14-54C38-50 58-32 64-6C66 2 58 8 53 1C47-12 40-14 36 2Z" fill=${o.lilac} />`,i`<path d="M-30-24Q2-20 36 2L43-8Q8-34-20-38ZM2-52Q28-34 47-11L56-20Q38-44 16-54Z" fill=${o.lilacDark} />`,i`<rect x="-46" y="-6" width="88" height="15" rx="7.5" fill=${o.cream} />`,i`<circle cx="58" cy="9" r="10" fill=${o.cream} />`],-7,1.12))}function th(e){return c("arms",[i`<path d="M-52-6Q-70-10-76-30" fill="none" stroke=${e} stroke-width="9" stroke-linecap="round" />`,i`<path d="M52-6Q70-10 76-30" fill="none" stroke=${e} stroke-width="9" stroke-linecap="round" />`])}function dt(e,t={}){let r=Np(e),n=y(r,"#7f7795",0.26),s=e.view==="gleaming",a=-2;return[t.before??k,c("tooth",i`<path d=${Ep} fill=${r} />`),f(e.film>=2,()=>c("film",i`<path d=${e.film>=4?Vp:Hp} fill=${y(ia,o.sunDark,e.film/jt*0.7)} opacity=".7" />`)),i`<path d=${Pp} fill=${n} opacity=${s?0.35:0.55} />`,jp(s?"#dbe9f5":n),Wp.slice(0,e.plaque).map(([l,u,p,m],b)=>c("plaque",d(l,u,[i`<path d=${de(p,m)} fill="#8f9a45" />`,i`<path d=${de(p*0.5,m*0.45)} fill="#6f7a32" />`]),b)),s?c("shine",i`<path d="M-42-22L-28-54" stroke="#bfe4ff" stroke-width="9" stroke-linecap="round" /><path d="M-46-5L-43-13" stroke="#bfe4ff" stroke-width="9" stroke-linecap="round" />`):i`<path d="M-45-30Q-43-46-33-53" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" opacity=".75" />`,Bp.slice(0,e.specks).map(([l,u,p,m],b)=>c("speck",d(l,u,m(),p),b)),Yp(),V(0,-2,e.mood,Rp,1.3),Xp(e.germs),t.after??k]}function ut(e,t,r,n){let s=d(0,-66,r),a=n?h(n,s):s;return d(e,182,a,0,t)}function ri(e,t,r){let n=[0,1,2,3,4];return c("toothbrush",[i`<path d="M-5.5-2Q-6.5-44-4-74H4Q6.5-44 5.5-2A5.5 5.5 0 0 1-5.5-2Z" fill=${e} />`,i`<path d="M1.5-6Q2.6-44 1-72" fill="none" stroke=${t} stroke-width="3" stroke-linecap="round" />`,i`<rect x="-7.5" y="-122" width="15" height="52" rx="7.5" fill=${e} />`,n.map((s)=>i`<rect x="-23" y=${-119+s*9.2} width="17" height="8" rx="2.6" fill=${s%2?"#a8dcff":"#ffffff"} />`),f(r,()=>c("paste",i`<path d="M-24-116q-8 5-1 10t0 10t0 10t1 9" fill="none" stroke=${o.mint} stroke-width="8" stroke-linecap="round" stroke-linejoin="round" /><path d="M-24-116q-8 5-1 10t0 10t0 10t1 9" fill="none" stroke="#c9f5e2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`))])}function rh(e,t,r){return[r,i`<path d="M-24-52H24L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill=${e} />`,i`<path d="M-24-52H24L23.2-43H-23.2Z" fill=${t} />`,i`<path d="M-15-36L-13-12" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" />`]}function ei(e,t,r,n){return d(e,t,h("pulse",i`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${o.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,n),-10,r)}function nh(e){return[A(72,184,50),A(158,184,28),ut(72,0.86,dt(e,{after:eh()}),"sway"),c("cup",d(158,182,rh(o.sky,o.skyDark,d(4,-32,ri(o.coral,o.coralDark,!1),12,0.78)))),c("zzz",[ei(140,58,1,3),ei(154,44,1.3,2),ei(174,26,1.6,1)]),R([[20,162],[126,152],[20,68]].slice(0,e.stench)),ni(e,[[128,24],[44,22]])]}function ni(e,t){return t.slice(0,e.flies).map(([r,n],s)=>N(r,n,s))}function ih(e){return[A(100,184,54),ut(100,1,dt(e)),R([[20,136],[180,124],[174,76]].slice(0,e.stench)),ni(e,[[40,30],[168,22]])]}function oh(e){return[A(76,184,52),A(178,184,14),ut(76,0.95,dt(e)),d(53,130,h("drip",O(0,0,o.water,0.8))),c("waiting-brush",d(178,180,h("sway",ri(o.sky,o.skyDark,!0)),-3)),R([[20,150],[146,158],[168,54]].slice(0,e.stench)),ni(e,[[32,36],[86,24]])]}function sh(e){return[A(84,184,54),ut(84,0.95,dt({...e,germs:0},{after:c("foam",[je(-36,-60,11),je(-15,-66,13),je(9,-62,12),je(32,-60,11),je(-24,-48,8),je(20,-47,8)])}),"rumble"),d(186,44,h("slosh",d(0,0,ri(o.coral,o.coralDark,!1),-99,0.98))),E(20,74,9,1),E(166,92,8,2),E(146,112,6,3),E(52,40,6.5,4),E(18,104,6,5),f(e.germs>0,()=>d(20,168,sa(0,0,o.mintDark,0,2),0,0.72)),R([[176,164],[18,132],[150,158]].slice(0,e.stench))]}function ah(){return c("rinse-cup",d(162,182,h("throb",[i`<path d="M-25-62H25L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill="#dff3ff" opacity=".42" />`,i`<path d="M-22.6-40Q-14-46-6-40T9-40T22.6-40L20-6Q19.5 0 13 0H-13Q-19.5 0-20-6Z" fill=${o.water} />`,i`<path d="M-14-30L-12-11" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`,i`<path d="M-25-62H25" stroke="#eaf8ff" stroke-width="5" stroke-linecap="round" />`])))}function lh(e){return[A(76,184,54),A(162,184,28),ut(76,0.95,dt(e,{after:Jp()})),ah(),f(e.germs===0,()=>d(28,110,h("drip",O(0,0,Yt,0.8),1))),d(127,106,h("drip",O(0,0,Yt,0.7),3)),E(152,96,6.5,1),E(174,86,5,3),R([[16,164],[142,66],[176,62]].slice(0,e.stench))]}function ch(e){return[A(100,184,54),ut(100,0.96,dt(e,{before:th("#ffffff")}),"bob"),v(140,50,1.9,1),v(34,66,1.5,2),v(172,118,1.15,3),v(26,134,0.95,4),v(92,22,1,5)]}function aa(e,t){let r=Dp(e);return I("teeth",e,t,{sleeping:()=>nh(r),dirty:()=>ih(r),pleading:()=>oh(r),scrubbing:()=>sh(r),rinsing:()=>lh(r),gleaming:()=>ch(r)}[r.view]())}var ii=4,dh=[0,14,23,32,40],uh=[0.05,0.3,0.55],ph=[0.4,0.65,0.88],hh=[0.15,0.5,0.8],fh=[0.6,0.9],mh=0.3,gh=0.75,yh=0.45;function bh(e){let{state:t,fill:r,stink:n}=e,s={pile:0,lid:0,stench:0,flies:0,grime:0,bone:!1,raccoon:!1};if(t==="clean")return{...s,view:"fresh",lid:26,mood:"happy"};let a=w(n,uh),l=w(n,hh);if(t==="running")return{...s,view:"carrying",lid:76,stench:a,grime:l,mood:"happy"};if(t==="waiting")return{...s,view:"empty",lid:76,stench:a,grime:l,flies:w(n,fh),mood:n>=0.6?"sick":"calm"};let u=w(n,ph),p=n>=mh,m=n>=gh,b=n>=yh;if(t==="due")return{view:"heap",pile:ii,lid:0,stench:a,flies:u,grime:l,bone:p,raccoon:m,mood:b?"sick":"pleading"};let x=t==="resting"?0:Math.min(ii,Math.floor(L(r)*(ii+1))),S=t==="resting"?"sleepy":x>=3?"worried":"calm";if(b)S="sick";return{view:"filling",pile:x,lid:dh[x]??0,stench:a,flies:u,grime:l,bone:p,raccoon:m,mood:S}}var kh="#124a3a",Pe="#171b30",pt="#4f5a2c";function Kt(e,t,r=0,n=1,s=o.cream){return d(e,t,[i`<path d="M-15-5L-7-15L3-11L13-14L16-3L12 8L3 14L-9 12L-16 3Z" fill=${s} stroke-linejoin="round" />`,i`<path d="M-8-6L0 0L9-6M0 0L-3 9" fill="none" stroke=${o.creamDark} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />`],r,n)}function oi(e,t,r=0,n=1){return d(e,t,[i`<rect x="-12" y="-17" width="24" height="34" rx="4" fill=${o.metalMid} />`,i`<rect x="-12" y="-9" width="24" height="18" fill=${o.coral} />`,i`<circle r="5" fill=${o.cream} />`,i`<ellipse cy="-17" rx="12" ry="3.6" fill=${o.metal} />`,i`<path d="M-5-17h7" stroke=${o.metalDark} stroke-width="2.4" stroke-linecap="round" />`],r,n)}function la(e,t,r=0,n=1){return d(e,t,[i`<path d="M-13-8L-8-22H8L13-8Z" fill=${o.skyDark} />`,i`<rect x="-8" y="-27" width="16" height="6" rx="1.5" fill=${o.cream} />`,i`<rect x="-13" y="-8" width="26" height="36" rx="2.5" fill=${o.sky} />`,i`<path d="M-13 12q6.5-7 13 0t13 0v14h-26Z" fill=${o.cream} />`],r,n)}function ca(e,t,r=0,n=1){return d(e,t,[i`<path d="M-12-14Q0-20 12-14Q5-6 5 0Q5 6 12 14Q0 20-12 14Q-5 6-5 0Q-5-6-12-14Z" fill=${o.spark} />`,i`<path d="M-12-14Q0-20 12-14Q6-10 0-10T-12-14ZM-12 14Q0 20 12 14Q6 10 0 10T-12 14Z" fill=${o.coral} />`,i`<path d="M0-16q0-6 4-9" fill="none" stroke=${o.wickerDark} stroke-width="3.2" stroke-linecap="round" />`],r,n)}function $h(e,t,r=0,n=1){return c("banana",d(e,t,[i`<path d="M-4-22H4L5-6H-5Z" fill=${o.sunDark} />`,i`<path d="M-5-10C-18-11-28 2-28 20C-20 19-10 10-2 2Z" fill=${o.sun} />`,i`<path d="M5-10C18-11 28 2 28 20C20 19 10 10 2 2Z" fill=${o.sun} />`,i`<path d="M-6-8C-8 6-6 18 0 26C6 18 8 6 6-8Z" fill=${o.spark} />`,i`<path d="M-28 20l5-1M28 20l-5-1" stroke=${o.soil} stroke-width="4" stroke-linecap="round" />`],r,n))}function da(e,t,r=0,n=1){return c("fishbone",d(e,t,[i`<path d="M-24 0H18M-32-9L-24 0L-32 9M-14-9V9M-5-12V12M4-12V12M12-10V10" fill="none" stroke=${o.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,i`<path d="M14-14Q32-13 37 0Q32 13 14 14Q18 0 14-14Z" fill=${o.cream} />`,i`<path d="M23-5l5 5m0-5l-5 5" stroke=${Pe} stroke-width="2.4" stroke-linecap="round" />`],r,n))}var _h=[[1,()=>Kt(66,84,-8,0.95)],[2,()=>la(92,74,-8,0.92)],[3,()=>oi(62,62,-26,1)],[4,()=>[ca(118,73,16,0.85),Kt(44,86,20,0.72,"#fff")]]];function wh(e){return _h.filter(([t])=>e>=t).map(([t,r])=>c("pile-step",r(),t))}function xh(e){return c("heap",[i`<path d="M46 98C38 74 52 62 66 58C76 42 124 42 134 58C150 62 162 76 154 98Z" fill=${o.lilac} />`,i`<path d="M58 84q10-12 24-10M122 66q16 2 22 16" fill="none" stroke=${o.lilacDark} stroke-width="4" stroke-linecap="round" />`,la(66,72,-24,1),Kt(108,62,12,1.05),oi(138,76,24,1.1),ca(88,60,-22,0.9),Kt(44,90,-14,0.8,"#fff"),f(e,()=>da(114,84,-14,0.82))])}function ua(e){return[i`<rect x="-55.5" y="-46" width="15" height="8.5" rx="4.2" fill=${o.metalDark} />`,i`<rect x="-51" y="-40" width="6" height="8" fill=${o.metalDark} />`,i`<path d="M-100-6C-98-46-6-46-4-6Z" fill=${e} />`,i`<path d="M-86-14Q-78-29-58-31" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".5" />`,i`<rect x="-106" y="-8" width="110" height="9.5" rx="4.7" fill=${o.metal} />`]}function Dr(e,t){return c("lid",d(152,92,ua(t),e))}function vh(e){return c("grime",[f(e>=1,()=>[i`<path d="M60 102H78V116a4.5 4.5 0 0 1-9 0V110a3 3 0 0 0-6 0V122a3.5 3.5 0 0 1-3.5 3.5L60 102Z" fill=${pt} />`]),f(e>=2,()=>[i`<path d="M118 102H142L141 128a4 4 0 0 1-8 0V114a3 3 0 0 0-6 0V118a4.5 4.5 0 0 1-9 0Z" fill=${pt} />`,i`<ellipse cx="74" cy="154" rx="7" ry="5" fill=${pt} opacity=".75" />`]),f(e>=3,()=>[i`<ellipse cx="126" cy="152" rx="10" ry="7" fill=${pt} opacity=".75" /><circle cx="114" cy="161" r="3" fill=${pt} opacity=".75" /><circle cx="86" cy="164" r="2.6" fill=${pt} opacity=".75" />`])])}function pa(e){return f(e>=2,()=>c("ooze",i`<path d=${e>=3?"M34 184C30 176 56 174 72 178C96 174 132 174 160 179C176 178 176 188 160 188H46C38 188 36 187 34 184Z":"M46 185C42 178 66 176 84 180C96 178 112 180 112 185C112 189 54 190 46 185Z"} fill=${o.mustyDark} />`))}function Gt({mood:e,grime:t,shine:r=!1,draped:n=!1}){let s=t/3*0.72,a=y(o.mint,o.musty,s),l=y(o.mintDark,o.mustyDark,s);return[c("body",[i`<path d="M53 98H147L140 173Q139 180 132 180H68Q61 180 60 173Z" fill=${a} />`,i`<path d="M128 98H147L140 173Q139 180 132 180H118Q126 180 126.5 172Z" fill=${l} opacity=".55" />`,i`<path d="M59.3 164H140.700L140 173Q139 180 132 180H68Q61 180 60 173Z" fill=${l} />`,i`<path d="M66 110L71 158" fill="none" stroke="#fff" stroke-width=${r?7:5} stroke-linecap="round" opacity=${r?0.75:0.34} />`,f(r,()=>i`<path d="M81 110L82.5 124" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".6" />`)]),f(t>0,()=>vh(t)),c("pedal",[i`<rect x="93" y="170" width="14" height="9" rx="2" fill=${o.metalDark} />`,i`<path d="M84 176H116L124 183Q126 187 121 187H79Q74 187 76 183Z" fill=${o.metalMid} />`,i`<path d="M84 181H116" stroke=${o.metal} stroke-width="2.6" stroke-linecap="round" />`]),i`<rect x="46" y="92" width="108" height="11" rx="5.5" fill=${o.metalMid} data-part="rim" />`,f(n,()=>c("new-bag",[i`<path d="M45 90H155V104Q148 113 139 105Q131 114 121 105Q111 114 100 105Q89 114 79 105Q69 114 61 105Q52 113 45 104Z" fill=${o.lilac} />`,i`<path d="M56 96H104" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".5" />`])),V(100,136,e,kh,1.16)]}function Xt(e=Pe){return i`<ellipse cx="100" cy="93" rx="50" ry="10" fill=${e} data-part="opening" />`}function ha(e,t,r){return d(e,181,d(-100,-181,r),0,t)}function Er(e){return y(o.mint,o.musty,e/3*0.72)}function fa(){return c("raccoon",[i`<path d="M172 140Q164 154 146 151" fill="none" stroke=${"#7a8299"} stroke-width="11" stroke-linecap="round" />`,d(163,126,h("bob",[i`<path d="M-18-9L-20-24L-5-15ZM18-9L20-24L5-15Z" fill=${"#7a8299"} />`,i`<ellipse cy="1" rx="22" ry="18" fill=${"#7a8299"} />`,i`<path d="M-21-4Q-10-10 0-3Q10-10 21-4Q19 9 8 7Q2 5 0 3Q-2 5-8 7Q-19 9-21-4Z" fill=${Pe} />`,i`<ellipse cy="12" rx="10" ry="6.5" fill=${o.cream} />`,i`<ellipse cy="9" rx="3.5" ry="2.6" fill=${Pe} />`,i`<circle cx="-9" cy="-1" r="4.2" fill="#fff" /><circle cx="9" cy="-1" r="4.2" fill="#fff" /><circle cx="-10.5" cy="0" r="2" fill=${Pe} /><circle cx="7.5" cy="0" r="2" fill=${Pe} />`]))])}function ma(){return i`<g data-part="raccoon-paw"><ellipse cx="143" cy="151" rx="8.5" ry="6.5" fill="#7a8299" /><path d="M138 148.5v5M143 148v6" stroke=${Pe} stroke-width="1.8" stroke-linecap="round" /></g>`}function Mh(){return c("snooze",[d(150,62,h("pulse",i`<path d=${"M-6-6H6L-6 6H6"} fill="none" stroke=${o.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,1),0,0.75),d(168,40,h("pulse",i`<path d=${"M-6-6H6L-6 6H6"} fill="none" stroke=${o.cream} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" />`,3),0,1.15)])}function ga(e){let t=[[22,112],[178,100],[24,66]],r=[[172,42],[50,22],[40,146]];return[R(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function Ah(e){return[A(100,182,64),pa(e.grime),f(e.raccoon,fa),Xt(),wh(e.pile),Gt({mood:e.mood,grime:e.grime}),f(e.raccoon,ma),Dr(e.lid,Er(e.grime)),f(e.bone,()=>da(30,176,6,0.62)),f(e.mood==="sleepy",Mh),ga(e)]}function Th(e){return[A(100,182,70),pa(e.grime),f(e.raccoon,fa),Xt(),xh(e.bone),Gt({mood:e.mood,grime:e.grime}),f(e.raccoon,ma),d(72,104,h("sway",$h(0,0,8,0.8))),c("lid",d(103,52,h("sway",d(44,-2,ua(Er(e.grime)),0,0.84),2),-9)),c("spill",[Kt(30,172,14,0.82),oi(170,172,78,0.82)]),ga(e)]}function Sh(){return c("bag",[i`<path d="M-6-36C-32-30-46-4-40 20C-36 40 36 40 40 20C46-4 32-30 6-36Z" fill=${o.lilac} />`,i`<path d="M12-34C32-24 44-2 40 20C37 33 14 37-6 36C22 30 32 2 12-34Z" fill=${o.lilacDark} opacity=".6" />`,i`<path d="M-4-34L-9-12M3-34L6-14" fill="none" stroke=${o.lilacDark} stroke-width="3.2" stroke-linecap="round" />`,i`<path d="M-27-6Q-30 8-24 20" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`,i`<path d="M-5-38L-20-53C-11-55-5-53 0-45C5-53 11-55 20-53L5-38Z" fill=${o.lilac} />`,i`<rect x="-9" y="-42" width="18" height="8" rx="4" fill=${o.sun} />`])}function Ch(){return c("glove",[i`<rect x="-44" y="-11" width="34" height="22" fill=${o.sun} />`,i`<rect x="-100" y="-16" width="62" height="32" fill=${o.coral} />`,i`<rect x="-46" y="-18" width="11" height="36" rx="4" fill=${o.coralDark} />`,i`<rect x="-20" y="-17" width="38" height="34" rx="13" fill=${o.sun} />`,i`<path d="M-3-8.5H13M-3 0H14M-3 8.5H13" stroke=${o.sunDark} stroke-width="2.6" stroke-linecap="round" />`,i`<path d="M-15-11Q-4-20 7-14" fill="none" stroke=${o.sunDark} stroke-width="10.5" stroke-linecap="round" />`,i`<path d="M-15-11Q-4-20 7-14" fill="none" stroke=${o.sun} stroke-width="7.5" stroke-linecap="round" />`])}function Lh(e){let t=[[52,135,"M0 0V14",1],[74,140,"M0 0V20",2],[96,135,"M0 0V14",3]],r=[[22,122],[127,78],[160,50]];return[A(140,182,42),ha(140,0.66,[Xt(),Gt({mood:e.mood,grime:e.grime}),Dr(e.lid,Er(e.grime))]),c("motion-lines",t.map(([n,s,a,l])=>d(n,s,h("flicker",i`<path d=${a} fill="none" stroke="#a9c8f0" stroke-width="5" stroke-linecap="round" />`,l)))),R(r.slice(0,e.stench)),d(74,90,h("bob",[Sh(),d(0,-54,Ch())]))]}function Dh(){return c("bag-roll",[i`<path d="M-16 5H-10V19H-40Q-46 19-44 14Q-30 15-16 5Z" fill=${o.lilacDark} />`,i`<rect x="-26" y="-17" width="42" height="34" rx="6" fill=${o.lilac} />`,i`<path d="M-14-17V17M-2-17V17" stroke=${o.lilacDark} stroke-width="2.4" stroke-dasharray="3.5 3.5" />`,i`<path d="M-22-11H-18" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".6" />`,i`<ellipse cx="16" rx="10" ry="17" fill=${o.lilacDark} />`,i`<ellipse cx="16" rx="5.5" ry="9.5" fill=${o.wickerLight} />`,i`<ellipse cx="16" rx="2.8" ry="5" fill=${Pe} />`])}function Eh(e){let t=[[56,96],[34,76],[76,76]],r=[[40,38],[84,22]];return[A(78,182,52),A(160,182,28),ha(76,0.86,[Xt(),Gt({mood:e.mood,grime:e.grime}),Dr(e.lid,Er(e.grime))]),d(160,163,Dh()),c("pending",d(160,116,h("bob",i`<path d="M0 14L-13 0H-6V-14H6V0H13Z" fill=${o.sun} stroke=${o.sun} stroke-width="3" stroke-linejoin="round" />`))),R(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function Ph(e){return[A(100,182,64),Xt(o.lilacDark),Gt({mood:e.mood,grime:0,shine:!0,draped:!0}),Dr(e.lid,o.mint),v(30,112,1.3,1),v(172,128,1.05,2),v(40,62,0.95,3),v(176,34,0.8,4),v(36,160,0.6,5)]}function ya(e,t){let r=bh(e),s={filling:()=>Ah(r),heap:()=>Th(r),carrying:()=>Lh(r),empty:()=>Eh(r),fresh:()=>Ph(r)}[r.view]();return I("trash",e,t,s)}var si=9,Hh=[0.2,0.5,0.8],Vh=[0.1,0.3,0.55],ai=[0.6,0.85],Rh=[0.7,0.92],Oh=[0.25,0.6],Ih=[0.6,0.9];function Nh(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink),a={bunnies:0,grime:w(n,Hh),crumbs:0,web:!1,spider:!1,stench:0,flies:0,burst:0,raised:!1};if(t==="clean")return{...a,view:"shine",grime:0,rug:"bright",mood:"happy"};if(t==="running")return{...a,view:"suck",bunnies:2,stench:w(n,ai),rug:"stripe",mood:"happy"};if(t==="waiting")return{...a,view:"full",grime:0,burst:w(n,Oh),stench:w(n,ai),flies:w(n,Ih),rug:"bright",mood:n>=0.6?"sick":"worried"};let l={crumbs:w(n,Vh),web:n>=0.4,spider:n>=0.65,stench:w(n,ai),flies:w(n,Rh)};if(t==="due")return{...a,...l,view:"hunt",bunnies:si,raised:!0,rug:"dull",mood:n>=0.5?"sick":"pleading"};if(t==="accumulating"){let u=Math.min(si-2,1+Math.floor(r*(si-2)));return{...a,...l,view:"hunt",bunnies:u,rug:"dull",mood:n>=0.5?"sick":u>=5?"worried":"calm"}}return{...a,...l,view:"sleep",rug:"dull",mood:"sleepy"}}var q={top:144,bottom:186,topL:32,topR:168,bottomL:15,bottomR:185};function He(e,t){let r=q.top+(q.bottom-q.top)*t,n=q.topL+(q.bottomL-q.topL)*t,s=q.topR+(q.bottomR-q.topR)*t;return`${_(n+(s-n)*e)} ${_(r)}`}function Ye(e,t,r,n){return`M${He(e,r)}L${He(t,r)}L${He(t,n)}L${He(e,n)}Z`}function Qh(e,t,r,n){return`M${He(e-r,t)}L${He(e,t-n)}L${He(e+r,t)}L${He(e,t+n)}Z`}function Fh(e){let t=[0.08,0.26,0.44,0.62,0.8,0.96].map((r)=>{let n=q.top+(q.bottom-q.top)*r,s=(q.topL-q.bottomL)*r;return`M${_(q.topL-s)} ${_(n)}h-6M${_(q.topR+s)} ${_(n)}h6`});return i`<path d=${t.join("")} stroke=${e} stroke-width="2.4" stroke-linecap="round" />`}function Jt(e){let t=e.rug==="bright",r=e.grime/3,n=t?o.lilac:y("#6a5ca3","#55553f",r),s=t?o.cream:y("#8e8aa8","#6b6c52",r),a=t?o.sun:y("#57508a","#47472f",r),l=y(o.lilac,"#fff",0.45),u=[0.3,0.44,0.58,0.72].map((p)=>0.5+(p-0.5)*1.9);return c("rug",[Fh(s),i`<path d=${Ye(0,1,0,1)} fill=${s} stroke=${s} stroke-width="4" stroke-linejoin="round" />`,i`<path d=${Ye(0.035,0.965,0.1,0.9)} fill=${a} />`,i`<path d=${Ye(0.05,0.95,0.15,0.85)} fill=${n} />`,f(t,()=>[c("vacuum-lines",[[0.15,0.26],[0.37,0.49],[0.61,0.73]].map(([p=0,m=0])=>i`<path d=${Ye(0.05,0.95,p,m)} fill=${l} />`)),u.map((p,m)=>i`<path d=${Qh(p,0.95,0.018,0.03)} fill=${m%2?o.pink:o.sky} />`)]),f(e.rug==="stripe",()=>c("clean-stripe",[i`<path d=${Ye(0.3,0.95,0.56,0.85)} fill=${o.lilac} />`,i`<path d=${Ye(0.3,0.95,0.62,0.68)} fill=${l} />`,i`<path d=${Ye(0.3,0.95,0.74,0.8)} fill=${l} />`]))])}function ht(e){let t=o.metalDark,r=y(o.metalDark,o.glass,0.42);return[i`<path d=${e} fill="none" stroke=${t} stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />`,i`<path d=${e} fill="none" stroke=${r} stroke-width="11" stroke-dasharray="2.4 6" />`]}function ft(e,t,r=0){return c("nozzle",d(e,t,[i`<path d="M-24 6H24V9Q24 11 21 11H-21Q-24 11-24 9Z" fill=${o.glass} />`,i`<rect x="-25" y="-7" width="50" height="14" rx="7" fill=${o.sun} />`,i`<path d="M-17-2H10" stroke=${o.spark} stroke-width="3" stroke-linecap="round" />`],r))}function Pr(e,t){return i`<path d=${`M${e[0]} ${e[1]}L${t[0]} ${t[1]}`} stroke=${o.metalMid} stroke-width="8" stroke-linecap="round" />`}function er(e){let t=(e.dust??0)/3,r=y(o.coral,"#a58a78",t*0.8),n=y(o.coralDark,"#7d6a5c",t*0.8),s=y("#ffa79b","#c0a999",t*0.8),a=e.lookLeft===!0?-9:0;return c("vacuum",[i`<circle cx="-36" cy="-9" r="11" fill=${o.glass} /><circle cx="36" cy="-9" r="11" fill=${o.glass} />`,i`<circle cx="-36" cy="-9" r="4.5" fill=${o.metalMid} /><circle cx="36" cy="-9" r="4.5" fill=${o.metalMid} />`,i`<path d="M-54-20V-52C-54-84-30-98 0-98C30-98 54-84 54-52V-20Q54-8 42-8H-42Q-54-8-54-20Z" fill=${r} />`,i`<path d="M-54-30H54V-20Q54-8 42-8H-42Q-54-8-54-20Z" fill=${n} />`,i`<path d="M-44-54C-44-68-37-78-26-84" fill="none" stroke=${s} stroke-width="5.5" stroke-linecap="round" />`,f(e.cap!==!1,()=>ka()),i`<circle cx="-30" cy="-19" r="4" fill=${o.mint} /><rect x="-18" y="-22" width="48" height="6" rx="3" fill=${y(n,ce,0.3)} />`,f(e.blush===!0,()=>i`<ellipse cx="-30" cy="-44" rx="7" ry="4.5" fill=${o.pink} opacity=".75" /><ellipse cx="30" cy="-44" rx="7" ry="4.5" fill=${o.pink} opacity=".75" />`),V(a,-53,e.mood,"#5b1e18",1.2)])}function ka(){return c("cap",[i`<path d="M-42-78C-34-92-18-100 0-100C18-100 34-92 42-78Q43-74 38-74H-38Q-43-74-42-78Z" fill=${o.cream} />`,i`<path d="M-42-78Q-43-74-38-74H38Q43-74 42-78L40.5-81H-40.5Z" fill=${o.creamDark} />`,i`<rect x="-11" y="-108" width="22" height="11" rx="5.5" fill=${o.sun} />`])}function tr(e,t){return i`<circle cx=${e} cy=${t} r="9.5" fill=${o.metalDark} /><circle cx=${e} cy=${t} r="5" fill=${o.glass} />`}var Zh=[[72,184,1.05],[116,186,0.9],[32,184,0.92],[52,168,0.74],[152,186,1],[170,180,0.8],[28,166,0.68],[94,186,0.72],[124,62,0.62]],zh=Array.from({length:10},(e,t)=>{let r=t*Math.PI/5;return[_(Math.cos(r)*10.5),_(Math.sin(r)*10.5-12)]});function li(e,t,r,n,s){let a=n/3,l=y("#d8dcea","#7c7b86",a),u=y("#b3b9cf","#5f5e69",a),p=n>=2;return c("bunny",d(e,t,h(s%2?"wobble":"bob",[i`<ellipse cx="-5.5" cy="-27" rx="3.6" ry="8.5" transform="rotate(-14 -5.5 -27)" fill=${l} />`,i`<ellipse cx="5.5" cy="-27" rx="3.6" ry="8.5" transform="rotate(14 5.5 -27)" fill=${l} />`,i`<ellipse cx="-5.8" cy="-26" rx="1.5" ry="5" transform="rotate(-14 -5.8 -26)" fill=${o.pink} opacity=".7" />`,i`<ellipse cx="5.8" cy="-26" rx="1.5" ry="5" transform="rotate(14 5.8 -26)" fill=${o.pink} opacity=".7" />`,zh.map(([m,b])=>i`<circle cx=${m} cy=${b} r="4" fill=${l} />`),i`<circle cy="-12" r="11" fill=${l} />`,i`<path d="M-7-5q7 4 14 0" fill="none" stroke=${u} stroke-width="2" stroke-linecap="round" />`,i`<circle cx="-4.2" cy="-13" r="2.5" fill=${ce} /><circle cx="4.2" cy="-13" r="2.5" fill=${ce} />`,i`<circle cx="-3.5" cy="-13.9" r=".8" fill="#fff" /><circle cx="4.9" cy="-13.9" r=".8" fill="#fff" />`,f(p,()=>i`<path d="M-8-18l6 2.4M8-18l-6 2.4" stroke=${ce} stroke-width="1.8" stroke-linecap="round" />`)],s%5+1),0,_(r*(1+n*0.2))),s)}function Uh(e,t){return Zh.slice(0,e).map(([r,n,s],a)=>({x:r,y:n,size:s,i:a})).toSorted((r,n)=>r.y-n.y).map(({x:r,y:n,size:s,i:a})=>li(r,n,s,t,a))}function $a(e){return c("crumbs",[[[60,178,2.6],[112,176,2],[84,176,1.8]],[[150,174,2.8],[30,170,2],[168,184,2.2]],[[128,178,3.2],[52,186,2.6],[20,184,2.2]]].slice(0,e).flat().map(([r,n,s])=>i`<circle cx=${r} cy=${n} r=${s} fill=${o.wicker} /><circle cx=${r-s*0.3} cy=${n-s*0.3} r=${s*0.35} fill=${o.wickerDark} />`))}function qh(){return c("cobweb",i`<path d=${"M188 16L128 16M188 16L138 40M188 16L160 58M188 16L188 76M144 16Q148 28 150 32Q159 37 165 45Q176 48 188 60M162 16Q164 22 166 24Q171 27 175 32Q181 34 188 42"} fill="none" stroke="#e7ecf7" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" opacity=".62" />`)}function Bh(){return c("spider",[i`<path d="M172 44V62" stroke="#e7ecf7" stroke-width="1.5" opacity=".7" />`,d(172,70,h("bob",[i`<path d=${"M-7-3Q-15-11-19-3M-7 0Q-16-3-21 5M-7 3Q-14 5-17 13M7-3Q15-11 19-3M7 0Q16-3 21 5M7 3Q14 5 17 13"} fill="none" stroke=${o.wing} stroke-width="2.2" stroke-linecap="round" />`,i`<circle r="9.5" fill=${o.fly} stroke=${o.wing} stroke-width="1.5" />`,i`<circle cx="-3.4" cy="-1" r="2.9" fill="#fff" /><circle cx="3.4" cy="-1" r="2.9" fill="#fff" />`,i`<circle cx="-3.8" cy="-.2" r="1.4" fill=${ce} /><circle cx="3" cy="-.2" r="1.4" fill=${ce} />`],2))])}function _a(e){return[f(e.web,qh),f(e.spider,Bh),R([[18,134],[46,118]].slice(0,e.stench)),[[18,66],[94,26]].slice(0,e.flies).map(([t,r],n)=>N(t,r,n))]}function ba(e,t,r,n){return d(e,t,h("drift",i`<path d="M-6-6H6L-6 6H6" fill="none" stroke=${o.cream} stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />`,n),0,r)}function Wh(){return c("zzz",[ba(50,58,0.8,1),ba(34,40,1.05,2)])}function jh(e,t){let r=[0,1,2,3].map((n)=>i`<ellipse cy=${-5-n*6.5} rx=${22-n*0.6} ry="7.5" fill="none" stroke=${n%2?o.metalMid:o.metal} stroke-width="5.5" />`);return c("cord",d(e,t,[i`<ellipse cy="-2" rx="25" ry="9" fill="#0c0f1e" opacity=".25" />`,r,i`<rect x="-5" y="-33" width="10" height="33" rx="3" fill=${o.sun} />`,i`<path d="M-12-30q-7-5-5-13" fill="none" stroke=${o.metal} stroke-width="4.5" stroke-linecap="round" />`,d(-16,-49,[i`<path d="M-3.5-7v-7M3.5-7v-7" stroke=${o.metal} stroke-width="3" stroke-linecap="round" />`,i`<rect x="-8" y="-8" width="16" height="14" rx="4" fill=${o.sky} />`],-10)]))}function Yh(e){return[Jt(e),A(118,169,60),jh(40,174),d(118,168,er({mood:e.mood,dust:e.grime})),c("hose",[ht("M66 108C54 38 182 38 170 108"),tr(66,108)]),ft(174,122,90),Wh(),$a(e.crumbs),_a(e)]}function Kh(e){let r=e.raised?c("hose",[ht("M74 104C50 96 26 74 32 50C36 34 54 32 62 42"),Pr([62,42],[68,60]),ft(70,66,16)]):c("hose",[ht("M74 104C52 92 26 92 26 118"),Pr([26,118],[30,146]),ft(36,151)]);return[Jt(e),A(124,169,60),d(124,168,er({mood:e.mood,lookLeft:e.bunnies>=3,dust:e.grime})),r,tr(74,104),$a(e.crumbs),Uh(e.bunnies,e.grime),_a(e)]}function Gh(){let e=[[40,160,3.6,1],[34,182,2.8,2],[46,148,2.8,3],[34,116,2.4,4]];return c("dust-stream",[[["M26 170q8-2 16 2",1],["M28 156q8 3 16 10",2],["M28 184q8-3 15-7",3]].map(([r,n])=>h("flicker",i`<path d=${r} fill="none" stroke="#cdd5ea" stroke-width="3" stroke-linecap="round" />`,n)),e.map(([r,n,s,a])=>d(r,n,h("drift",i`<circle r=${s} fill="#cdd5ea" />`,a)))])}function Xh(e,t){return[[20,174,0.78,40],[24,134,0.66,74]].slice(0,t).map(([r,n,s,a],l)=>c("tumbling",d(r,n,li(0,0,s,e,l),a),l))}function Jh(e){let r=[[68,66,"M0 0q-6 10 0 20",1],[187,60,"M0 0q6 10 0 20",2],[187,100,"M0 0q6 10 0 20",1]];return[Jt(e),A(130,169,60),h("rumble",[d(130,168,er({mood:e.mood,blush:!0})),c("hose",[ht("M80 104C58 92 52 116 60 146"),Pr([60,146],[68,170]),ft(70,176)]),tr(80,104)]),Gh(),Xh(e.grime,e.bunnies),v(176,177,0.7,2),c("shake",r.map(([n,s,a,l])=>d(n,s,h("flicker",i`<path d=${a} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,l)))),R([[100,50],[150,48]].slice(0,e.stench))]}function ef(e,t,r,n){return c("puff",d(e,t,h("drift",i`<g fill="#b9bfd2"><circle cx="-7" cy="1" r="6" /><circle cx="1" cy="-4" r="8" /><circle cx="9" cy="2" r="5.5" /></g>`,n),0,r))}function tf(e){let t=y(o.cream,"#b4ae97",e/2),r=y(o.creamDark,"#8f8a74",e/2);return c("bag",h("throb",[[[-38,-92,26],[38,-92,26],[-15,-106,27],[17,-106,26]].map(([s,a,l])=>i`<circle cx=${s} cy=${a} r=${l} fill=${t} />`),i`<path d="M-62-90Q-66-68-48-66H48Q66-68 62-90Z" fill=${t} />`,i`<path d="M-30-124Q-40-108-22-96M4-124Q-2-110 10-98M42-114Q30-104 32-90" fill="none" stroke=${r} stroke-width="3.2" stroke-linecap="round" />`,i`<path d="M-56-84C-60-96-54-104-44-108" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".75" />`,i`<path d="M-54-68C-30-62 30-62 54-68" fill="none" stroke=${r} stroke-width="3.5" stroke-linecap="round" />`,d(36,-84,[i`<rect x="-12" y="-10" width="24" height="20" rx="4" fill=${o.sky} />`,i`<path d="M-8-6l3 3M5-6l3 3M-8 3l3 3M5 3l3 3" stroke=${o.cream} stroke-width="2" stroke-linecap="round" />`],9),f(e>0,()=>i`<path d="M-30-86l6 4-6 4 6 4-6 4" fill="none" stroke=${r} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`)]))}function rf(){return c("wish",[i`<circle cx="50" cy="82" r="4.5" fill=${o.cream} /><circle cx="42" cy="70" r="7" fill=${o.cream} />`,d(34,42,h("pulse",[i`<circle r="24" fill=${o.cream} />`,i`<path d="M-10-4H10L7.5 13Q7 15 5 15H-5Q-7 15-7.5 13Z" fill=${o.metalDark} />`,i`<rect x="-13" y="-10" width="26" height="5" rx="2.5" fill=${o.skyDark} /><rect x="-4" y="-14" width="8" height="5" rx="2" fill=${o.skyDark} />`,i`<path d="M-3 0V10M3 0V10" stroke=${o.metalMid} stroke-width="2" stroke-linecap="round" />`]))])}function nf(e){let r=[[176,62,0.8,1],[168,92,0.6,2]];return[Jt(e),A(120,169,60),d(120,168,[er({mood:e.mood,cap:!1}),c("stowaway",li(30,-127,0.66,e.burst,3)),tf(e.burst),d(-20,-123,d(0,74,ka()),-13,0.68)]),c("hose",[ht("M70 112C44 112 26 124 28 150"),ft(36,170)]),tr(70,112),rf(),r.slice(0,e.burst).map(([n,s,a,l])=>ef(n,s,a,l)),R([[180,150],[20,130]].slice(0,e.stench)),[[18,108],[80,26]].slice(0,e.flies).map(([n,s],a)=>N(n,s,a))]}function of(e){return[Jt(e),A(124,165,57),h("bob",d(124,164,er({mood:e.mood,blush:!0}),0,0.95)),c("hose",[ht("M77 103C56 90 34 96 36 122"),Pr([36,122],[40,146]),ft(44,152)]),tr(77,103),v(26,72,1.3,1),v(180,52,1.05,2),v(72,40,0.85,3),v(40,172,0.95,4),v(164,174,1.15,5)]}function wa(e,t){let r=Nh(e);return I("vacuum",e,t,{sleep:()=>Yh(r),hunt:()=>Kh(r),suck:()=>Jh(r),full:()=>nf(r),shine:()=>of(r)}[r.view]())}var mt=4,hi=[84,100,116,154,160],xa=165,va=[116,108,100,92],ci=70,sf=[0.05,0.3,0.55],Ma=[0.12,0.45,0.75],af=[0.25,0.6],lf=[0.5,0.85],cf=0.8,df=0.7,uf=0.6,Hr={capDropped:!1,thought:!1,shimmer:0,cracks:0,cactus:0,tumbleweed:!1,shades:!1,flies:0,evaporated:0,sun:0};function pf(e){let{state:t}=e,r=L(e.fill),n=t==="clean"?0:L(e.stink);if(t==="clean")return{...Hr,level:ci,step:0,capped:!1,extra:"party",mood:"happy"};let s=w(n,sf),a=w(n,Ma),l=n>=uf;if(t==="running"){let x=Math.min(va.length-1,Math.floor(L(e.progress)*4));return{...Hr,level:va[x]??ci,step:x,capped:!1,extra:"jug",shimmer:Math.min(1,s),mood:"happy"}}if(t==="waiting")return{...Hr,level:ci+8,step:0,capped:!0,extra:"glass",shimmer:s,cracks:a,flies:w(n,lf),evaporated:w(n,Ma),mood:l?"sick":"calm"};let u=t==="due",p=u?mt:Math.min(mt,Math.floor(r*(mt+1))),m=t==="resting",b=m?"sleepy":p>=2?"worried":"calm";if(u)b="pleading";if(l)b="sick";return{...Hr,level:u?xa:m?hi[0]:hi[p]??xa,step:m?0:p,capped:!u,capDropped:u,extra:m?"moon":"none",sun:m?0:u?mt+1:p+(p>0||r>0?1:0),thought:u,shimmer:s,cracks:u?Math.max(1,a):a,cactus:w(n,af),tumbleweed:n>=cf,shades:n>=df,mood:b}}var Aa=23,hf=47,Ta=60,Ea=100,Sa=48,Ca=180,Vr=6,ff=22,Rr="#f3fbff",mf="#c6e6f7",Pa="#14406e",gf="#f4e2b4",La="#ffe27a",yf="#fff6d6";function rr(e,t){let r=L((e-Ta)/(Ea-Ta));return Aa+(hf-Aa)*r*r*(3-2*r)-t}function di(e,t,r){let n=Ca-t,s=rr(e,t),a=rr(Ca,t),l=ff-t,u=[];for(let M=Math.ceil(e/3)*3;M<=Ea;M+=3)u.push([_(rr(M,t)),M]);let p=u.map(([M,C])=>`L${M} ${C}`).join(""),m=u.toReversed().map(([M,C])=>`L${-M} ${C}`).join(""),b=_(s/2),x=_(s);return[r===0?`M${-x} ${e}L${x} ${e}`:`M${-x} ${e}Q${-b} ${e-r} 0 ${e}T${x} ${e}`,p,`L${a} ${n-l}Q${a} ${n} ${a-l} ${n}`,`L${l-a} ${n}Q${-a} ${n} ${-a} ${n-l}`,m,"Z"].join("")}function Da(e,t){let r=Math.max(4,rr(e,Vr)-1),n=_(r/2),s=_(r);return i`<path d=${`M${-s} ${e+1}Q${-n} ${e-3} 0 ${e+1}T${s} ${e+1}`} fill="none" stroke=${t} stroke-width="5" stroke-linecap="round" />`}function bf(e,t){return c("tide-marks",hi.filter((r)=>r<e-6).map((r)=>{let n=_(rr(r,Vr)-5);return i`<path d=${`M${-n} ${r}H${n}`} stroke=${t} stroke-width="2.4" stroke-linecap="round" opacity=".32" />`}))}function kf(){return[i`<rect x="-28" y="26" width="56" height="30" rx="8" fill=${o.coral} />`,i`<rect x="-28" y="46" width="56" height="10" rx="5" fill=${o.coralDark} />`,i`<path d="M-17 33v9M-6 33v9M6 33v9M17 33v9" stroke=${o.coralDark} stroke-width="3.2" stroke-linecap="round" />`]}function $f(){return c("cap",d(29,170,[i`<rect x="-16" y="-10" width="32" height="20" rx="6" fill=${o.coral} />`,i`<rect x="-16" y="3" width="32" height="7" rx="3.5" fill=${o.coralDark} />`],-24))}var _f=["M31 104l-8 9 6 6-9 11M23 113l9 3","M-34 112l9 6-7 9 8 7","M-14 76l6 7-6 5 5 8"],wf=["M38 186l11-6 9 3 8-7M49 180l-3-6","M136 187l10-7 11 3 9-7M157 183l4 5","M72 188l6-4 11 2M112 188l8-4 8 2"];function xf(e,t){let r=y(o.water,"#b9c98a",t*0.55),n=e.level>140?o.waterDark:y(o.water,"#ffffff",0.42),s=y(mf,gf,Math.max(t,e.step/mt)*0.8),a=y(o.waterDark,"#a9894f",e.step/mt);return[i`<path d=${di(Sa,0,0)} fill=${Rr} data-part="bottle" />`,i`<path d=${di(Sa,Vr,0)} fill=${s} />`,bf(e.level,a),c("water",[i`<path d=${di(e.level,Vr,3)} fill=${r} />`,e.extra==="jug"?h("bob",Da(e.level,n)):Da(e.level,n)])]}function vf(){return i`<rect x="-28" y="44" width="56" height="13" rx="6.5" fill=${Rr} />`}function Mf(){return i`<path d="M-33 112V150" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".62" /><path d="M-33 160v2" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".62" />`}function Af(e,t){return c("cracks",_f.slice(0,e).map((r)=>i`<path d=${r} fill="none" stroke=${t} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`))}function Tf(e){return c("floor-cracks",wf.slice(0,e).map((t)=>i`<path d=${t} fill="none" stroke="#0c0f1e" stroke-opacity=".5" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />`))}function ui(e,t,r,n,s){let a=r/2;return c("ice",d(e,t,h("bob",d(0,0,[i`<rect x=${-a} y=${-a} width=${r} height=${r} rx="5" fill="#effaff" />`,i`<path d=${`M${-a+5} ${a-6}V${-a+5}H${a-6}`} fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,i`<rect x=${-a+9} y=${-a+9} width=${r-13} height=${r-13} rx="3" fill=${y(o.water,"#ffffff",0.55)} />`],n),s)))}function Sf(e,t,r,n){let s=Array.from({length:8},(u,p)=>p*360/8),a=_(r*0.78),l=_(r*0.26);return c("lemon",d(e,t,[i`<circle r=${r} fill=${o.sun} />`,i`<circle r=${_(r*0.86)} fill=${yf} />`,s.map((u)=>i`<path d=${`M0-${_(r*0.14)}L${-l}-${_(a*0.76)}Q0-${a+2} ${l}-${_(a*0.76)}Z`} transform=${`rotate(${u})`} fill=${La} stroke=${La} stroke-width="1.5" stroke-linejoin="round" />`)],n))}function Cf(){return c("mint",[d(-10,50,i`<path d=${"M0 0C-9-5-10-17 0-26C10-17 9-5 0 0Z"} fill=${o.leafDark} />`,-34,0.95),d(-2,50,i`<path d=${"M0 0C-9-5-10-17 0-26C10-17 9-5 0 0Z"} fill=${o.leaf} />`,6,1.1),d(-2,47,i`<path d="M0 0V-18" stroke=${o.leafDark} stroke-width="2" stroke-linecap="round" />`,6)])}function pi(e,t,r,n){return d(e,t,h("drift",d(0,0,i`<path d="M-8-8H8L-8 8H8" fill="none" stroke=${o.cream} stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />`,0,r),n))}function Lf(){return c("zzz",[pi(144,58,0.72,1),pi(160,38,1,2),pi(178,24,0.62,3)])}function Df(){return c("moon",d(42,46,[i`<path d="M6-20A21 21 0 1 0 20 12A17 17 0 0 1 6-20Z" fill=${o.spark} />`,i`<circle cx="30" cy="-18" r="2.4" fill=${o.spark} /><circle cx="-24" cy="-24" r="1.8" fill=${o.spark} />`],-8))}function Ef(e,t){let r=10+e*2.2,n=r+5,s=n+3+e*1.2,a=Array.from({length:8},(u,p)=>{let m=p*Math.PI/4,b=_(Math.cos(m)*n),x=_(Math.sin(m)*n),S=_(Math.cos(m)*s),M=_(Math.sin(m)*s);return i`<path d=${`M${b} ${x}L${S} ${M}`} stroke=${o.sun} stroke-width="5" stroke-linecap="round" />`}),l=f(t,()=>c("shades",[i`<path d="M-19-4H19" stroke=${o.fly} stroke-width="3" stroke-linecap="round" />`,i`<path d="M-17-4h14v5a6 6 0 0 1-14 0ZM3-4h14v5a6 6 0 0 1-14 0Z" fill=${o.fly} />`,i`<path d="M-5 11q5 4 10 0" fill="none" stroke=${o.sunDark} stroke-width="3" stroke-linecap="round" />`]));return c("sun",d(152,50,[h("throb",a),i`<circle r=${_(r)} fill=${o.sun} />`,l]))}function Pf(e){return f(e>0,()=>c("warmth",i`<circle cx="100" cy="98" r="86" fill=${o.terracotta} opacity=${_(e*0.045)} />`))}function Hf(e,t){return t.slice(0,e).map(([n,s],a)=>c("shimmer",d(n,s,h("waft",i`<path d=${"M0 0c-7-6 7-11 0-17c-7-6 7-11 0-17"} fill="none" stroke=${y(o.sun,"#ffffff",0.2)} stroke-width="4.5" stroke-linecap="round" opacity=".85" />`,a+1)),a))}function Vf(){return c("thirst",[i`<circle cx="50" cy="93" r="3.5" fill=${o.cream} /><circle cx="47" cy="79" r="6" fill=${o.cream} />`,d(40,44,h("pulse",[i`<circle r="25" fill=${o.cream} />`,O(0,1,o.waterDark,1.8)]))])}function Rf(){return c("sweat",d(157,100,h("drip",O(0,0,o.water,0.95),2)))}function Of(e){let t=e>=2?"#9a9a55":"#6fb56a",r=e>=2?"#7b7c41":"#4c8f52",n=e>=2?"M0-8C0-30 5-36 12-33C19-30 19-22 19-15":"M0-8C0-26 2-38 12-40",s=e>=2?"M3-22C-6-20-11-14-12-6":"M1-20C-8-20-12-26-12-32",a=e>=2?"M2-20l-5-2M8-33l-3-5M20-33l4-4M26-20l5-1":"M-1-18l5 0M3-33l-5-3M12-40l3-5";return c("cactus",[i`<path d=${s} fill="none" stroke=${r} stroke-width="7.5" stroke-linecap="round" />`,i`<path d=${n} fill="none" stroke=${t} stroke-width="11" stroke-linecap="round" />`,i`<path d=${a} fill="none" stroke=${o.cream} stroke-width="1.8" stroke-linecap="round" />`,i`<path d="M-13-6H13L10 11Q9.5 14 6 14H-6Q-9.5 14-10 11Z" fill=${o.terracotta} />`,i`<rect x="-16" y="-10" width="32" height="8" rx="4" fill=${o.terracottaDark} />`])}function If(){return c("tumbleweed",d(34,160,h("wobble",[i`<circle r="17" fill="#8a6b3f" opacity=".28" />`,i`<path d="M-15-4C-6-16 8-16 15-5M-14 7C-7-3 8-4 14 8M-8 14C-13 2-8-11 1-16M8 14C14 3 10-10 0-16M-16 2C-6 8 7 9 16 1" fill="none" stroke="#b08a52" stroke-width="2.8" stroke-linecap="round" />`])))}function Nf(){return c("jug",[d(160,38,[i`<path d="M24-14a15 15 0 0 1 0 28" fill="none" stroke=${o.lilacDark} stroke-width="7" stroke-linecap="round" />`,i`<path d="M-24-22H24L27 20Q27 26 21 26H-21Q-27 26-27 20L-26-5L-40-20Q-34-24-24-22Z" fill=${o.lilac} />`,i`<path d="M-16 8H18" stroke=${o.lilacDark} stroke-width="3.4" stroke-linecap="round" />`],-26,0.82)])}function Qf(e){let t=`M122 37C108 38 100 46 100 60V${e}`;return c("stream",[i`<path d=${t} fill="none" stroke=${o.water} stroke-width="12" stroke-linecap="round" />`,h("flicker",i`<path d=${t} fill="none" stroke="#dff5ff" stroke-width="3.6" stroke-linecap="round" stroke-dasharray="9 13" />`)])}function Ff(e){let t=[[-26,e-8,0.8,1],[24,e-11,0.9,2],[-12,e-14,0.62,3],[14,e-6,0.58,4]];return c("splash",t.map(([r,n,s,a])=>d(100+r,n,h("drip",O(0,0,"#dff5ff",s),a))))}function ke(e){return _(-26+(e-104)*0.09)}function Zf(e){let t=116+e.evaporated*9,r=y(o.water,"#b9c98a",e.evaporated/3),n=e.evaporated>=2;return c("glass",d(148,0,[A(0,183,28,0.24),i`<path d="M4 150L20 86L34 80" fill="none" stroke=${o.coral} stroke-width="6.5" stroke-linecap="round" stroke-linejoin="round" />`,i`<path d="M4 150L20 86L34 80" fill="none" stroke=${o.cream} stroke-width="6.5" stroke-linejoin="round" stroke-dasharray="7 9" />`,i`<rect x="-30" y="99" width="60" height="6" rx="3" fill=${Rr} />`,i`<path d="M-27 102H27L21 174Q20.5 180 15 180H-15Q-20.5 180-21 174Z" fill=${Rr} opacity=".42" />`,i`<path d=${`M${ke(t)} ${t}H${-ke(t)}L${-ke(176)} 172Q${-ke(176)-0.5} 176 ${-ke(176)-5} 176H${ke(176)+5}Q${ke(176)+0.5} 176 ${ke(176)} 172Z`} fill=${r} />`,i`<path d=${`M${ke(t)+1.5} ${t+1}H${-ke(t)-1.5}`} stroke=${y(r,"#ffffff",0.5)} stroke-width="4.5" stroke-linecap="round" />`,V(0,148,n?"worried":"pleading",Pa,0.78),i`<path d="M-20 112L-16.5 150" stroke="#fff" stroke-width="4.5" stroke-linecap="round" opacity=".6" />`]))}function zf(){return c("drink-me",d(138,80,h("bob",i`<path d="M0-15V4M-11-6L0 6L11-6" fill="none" stroke=${o.sun} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />`)))}function Uf(e,t){let r=e.extra==="party";return[xf(e,t),e.capped?kf():vf(),f(e.extra==="jug",()=>[E(-30,166,6,1),E(28,160,7.5,2),E(12,168,4.5,3),E(-30,132,4,4),E(32,128,3.5,5)]),f(r,()=>[E(34,154,5.5,1),E(-34,162,4.5,3),E(30,122,3.5,4),ui(-25,96,25,-14,1),ui(27,98,25,16,2),ui(1,86,21,42,3)]),Af(e.cracks,y(o.metalDark,"#6b5a3a",0.4)),Mf(),V(0,140,e.mood,Pa,1.25),f(r,()=>[Cf(),Sf(29,54,22,12)])]}function qf(e){return e?[[16,142],[186,122],[114,62]]:[[18,136],[182,124],[40,120]]}function Ha(e,t){let r=pf(e),n=Math.max(r.cracks,r.evaporated)/3,s=r.extra==="glass",a=r.extra==="party",l=d(100,0,Uf(r,n)),u=s?d(71,180,d(-100,-180,l),0,0.8):l;return I("water",e,t,[Pf(r.sun),f(r.sun>0,()=>Ef(r.sun,r.shades)),f(r.extra==="moon",Df),f(r.extra==="moon",Lf),f(!s,()=>Tf(r.cracks)),A(s?71:100,183,s?44:56),f(r.cactus>0,()=>d(164,168,Of(r.cactus))),f(r.tumbleweed,If),f(r.capDropped&&!r.tumbleweed,$f),c("carafe",a?h("bob",u):u),f(a,()=>[v(32,62,1.2,1),v(172,118,1.05,2),v(26,140,0.8,3),v(170,34,0.85,4)]),f(r.thought,Vf),f(r.thought,Rf),f(r.extra==="jug",()=>[Qf(r.level),Nf(),Ff(r.level)]),f(s,()=>[Zf(r),zf()]),Bf(r.flies),Hf(r.shimmer,qf(s))])}function Bf(e){return[[172,52],[116,96]].slice(0,e).map(([r,n],s)=>N(r,n,s))}var fi=6,Wf=[0.1],jf=[0.25,0.5,0.75],Yf=[0.3,0.55,0.8],Kf=[0.4,0.7],Va=[0.65,0.9],Gf=[0.8,0.92],Xf=[0,0.08,0.14,0.2,0.27,0.34,0.44];function Jf(e){let{state:t,fill:r,stink:n}=e,s={web:!1,runs:0,deadFlies:0,flies:0,stench:0,droop:0,bucket:!1,scrubbing:!1,droplets:!1,cloth:!1,dazzle:!1};if(t==="clean")return{...s,sky:"bright",drape:"open",smudges:0,haze:0,dazzle:!0,mood:"happy"};let a={web:w(n,Wf)>0,deadFlies:w(n,Yf),droop:w(n,Kf)};if(t==="running")return{...s,...a,sky:"day",drape:"open",smudges:0,haze:0,scrubbing:!0,mood:"happy"};if(t==="waiting")return{...s,...a,flies:w(n,Va),sky:"day",drape:"open",smudges:0,haze:0,droplets:!0,cloth:!0,mood:n>=0.55?"worried":"calm"};let l=t==="due",u=Math.min(fi-1,Math.floor(L(r)*fi)),p=t==="resting"?0:l?fi:u,m=w(n,jf),b=t==="resting"?"sleepy":p>=3?"worried":"calm";if(l)b="pleading";if(n>=0.55)b="sick";return{...s,...a,sky:t==="resting"?"night":"day",drape:t==="resting"?"half":"tied",smudges:p,haze:_((Xf[p]??0)+m*0.11),runs:m,flies:w(n,Va),stench:w(n,Gf),bucket:l,mood:b}}var em=`${yr(26,24,148,104,14)}${yr(38,34,124,88,7)}`,tm={night:{sky:"#16204d",back:"#26366b",front:"#1c2a58"},day:{sky:"#8ed2fb",back:o.leaf,front:o.leafDark},bright:{sky:"#b4e8ff",back:"#7fe8a0",front:o.leaf}};function rm(e,t,r,n){let s=Array.from({length:8},(a,l)=>l*45);return c("sun",[f(n,()=>d(e,t,h("spin",s.map((a)=>i`<rect x="-2.5" y=${-r-10} width="5" height="7" rx="2.5" transform=${`rotate(${a})`} fill=${o.sun} />`)))),i`<circle cx=${e} cy=${t} r=${r} fill=${o.sun} />`])}function Ra(e,t,r,n){return c("cloud",d(e,t,h("drift",i`<g fill="#fff"><circle cx="-9" cy="1" r="6.5" /><circle cx="1" cy="-3" r="9" /><circle cx="11" cy="2" r="6" /><rect x="-15" y="1" width="31" height="7" rx="3.5" /></g>`,n),0,r))}function nm(){return c("moon",[i`<circle cx="118" cy="52" r="20" fill=${o.spark} opacity=".12" />`,i`<path d="M124 39a14 14 0 1 0 7 24a12 12 0 0 1-7-24Z" fill=${o.spark} />`])}function im(){return[[78,48,2.2,1],[90,64,1.5,2],[84,86,1.8,3],[106,42,1.6,4],[128,84,1.8,5],[112,80,1.3,2]].map(([t,r,n,s],a)=>c("star",d(t,r,h("twinkle",i`<circle r=${n} fill="#fff" />`,s)),a))}function om(){let e=[o.coral,o.sun,o.mint,o.sky,o.lilac];return c("rainbow",e.map((t,r)=>{let n=54-r*6;return i`<path d=${`M${106-n} 104A${n} ${n} 0 0 1 ${106+n} 104`} fill="none" stroke=${t} stroke-width="6.4" />`}))}function sm(e){let t=[i`<rect x="124" y="80" width="17" height="14" fill=${e?"#33427a":o.cream} />`,i`<path d="M120.5 81L132.5 70L144.5 81Z" fill=${e?"#26366b":o.coralDark} />`,e?h("flicker",i`<rect x="129" y="83.5" width="7" height="6.5" rx="1" fill=${o.sun} />`):i`<rect x="129" y="83.5" width="7" height="6.5" rx="1" fill=${o.skyDark} />`];return c("cottage",e?d(-20,7,t):t)}function am(e){let t=tm[e.sky],r=e.sky==="night",n=e.sky==="bright";return c("view",[i`<rect x="32" y="30" width="136" height="96" fill=${t.sky} data-part="sky" />`,r?[im(),nm()]:rm(n?68:118,n?48:56,n?9:13,n),f(n,om),f(!r&&!n,()=>[Ra(82,54,1,1),Ra(134,72,0.6,3)]),i`<path d="M32 104Q66 70 104 96T168 90V128H32Z" fill=${t.back} data-part="hill" />`,sm(r),i`<path d="M32 116Q78 92 122 112T168 106V128H32Z" fill=${t.front} data-part="hill" />`])}var lm=[[84,54,15,10,14],[124,92,13,11,-12],[76,100,14,9,10],[126,46,13,9,-8],[110,66,10,8,30],[66,76,8,12,5]];function cm(e,t,r){let n=[[-7,-7,-10,-16],[-2.5,-9,-3.5,-20],[2.5,-9,3.5,-20],[7,-7,10,-15],[8,1,15,-3]];return c("handprint",d(e,t,[i`<ellipse rx="9.5" ry="9" fill=${r} />`,n.map(([s,a,l,u])=>i`<path d=${`M${s} ${a}L${l} ${u}`} stroke=${r} stroke-width="4.6" stroke-linecap="round" />`)]))}function dm(e){let t=y("#6d5b3c","#4c3f28",e.runs/3),r=["M68 34q2 22-1 40","M116 34q-2 26 1 54","M92 34q2 16 0 30","M136 34q-1 20 1 34","M78 34q-2 12 0 20","M104 34q1 14 0 24"];return[f(e.haze>0,()=>c("haze",i`<rect x="32" y="30" width="136" height="96" fill="#94815a" opacity=${e.haze} />`)),lm.slice(0,e.smudges).map(([n,s,a,l,u],p)=>c("smudge",d(n,s,[i`<path d=${de(a,l)} fill=${t} opacity=".6" />`,i`<circle cx=${_(a*1.25)} cy=${_(-l*0.7)} r="2.6" fill=${t} opacity=".6" />`,i`<circle cx=${_(-a*1.2)} cy=${_(l*0.8)} r="2" fill=${t} opacity=".6" />`],u),p)),f(e.smudges>=4,()=>cm(112,104,y(t,"#000000",0.08))),f(e.runs>0,()=>c("runs",i`<path d=${r.slice(0,e.runs*2).join("")} fill="none" stroke=${t} stroke-width="4.2" stroke-linecap="round" opacity=".75" />`))]}var um="#ecf7ff";function pm(){return c("suds",i`<path d=${"M32 30H168V126H32ZM72 30H128V88Q100 94 72 88Z"} fill=${um} fill-rule="evenodd" opacity=".8" />`)}var hm=[[40,96,9],[52,110,8],[62,92,6],[66,72,7.5],[64,48,6.5],[50,62,5],[78,104,8],[94,110,9.5],[108,102,7],[124,110,8.5],[146,100,8],[156,112,8],[136,88,6.5],[136,58,7],[137,40,5.5],[152,66,6]];function fm(){return c("foam",hm.map(([e,t,r],n)=>d(e,t,h("pulse",[i`<circle r=${r} fill="#fff" />`,i`<path d=${`M${_(-r*0.5)} ${_(-r*0.15)}a${_(r*0.55)} ${_(r*0.55)} 0 0 1 ${_(r*0.5)}-${_(r*0.42)}`} fill="none" stroke=${o.water} stroke-width="1.8" stroke-linecap="round" />`],n%5+1))))}function mm(){return c("muntins",i`<rect x="97.5" y="30" width="5" height="96" fill=${o.cream} /><rect x="32" y="74" width="136" height="5" fill=${o.cream} />`)}function gm(e,t){if(e==="half")return{top:72,waist:70,waistY:72,hem:72,hemY:122,sag:0,tie:!1,ragged:!1};if(t>=2)return{top:54,waist:50,waistY:90,hem:54,hemY:146,sag:12,tie:!1,ragged:!0};if(t===1)return{top:56,waist:47,waistY:100,hem:52,hemY:122,sag:6,tie:!0,ragged:!1};if(e==="open")return{top:52,waist:41,waistY:76,hem:50,hemY:122,sag:0,tie:!0,ragged:!1};return{top:60,waist:46,waistY:78,hem:56,hemY:122,sag:0,tie:!0,ragged:!1}}function ym(e){let r=`M22 21Q${_((22+e.top)/2)} ${21+e.sag} ${e.top} 21`,n=`C${e.top} ${e.waistY-30} ${e.waist+3} ${e.waistY-14} ${e.waist} ${e.waistY}`,s=`C${e.waist+3} ${e.waistY+14} ${e.hem} ${e.hemY-16} ${e.hem} ${e.hemY}`,a=e.ragged?`L${e.hem-6} ${e.hemY-9}L${e.hem-12} ${e.hemY+2}L${e.hem-18} ${e.hemY-7}L${e.hem-23} ${e.hemY+3}L22 ${e.hemY-6}Z`:"H22Z";return`${r}${n}${s}${a}`}function Oa(e,t,r,n,s){let a=_((22+t.waist)/2),l=e.drape==="half"?"M36 24V120M50 24V120M62 24V120":`M33 ${21+t.sag}Q34 ${t.waistY-24} ${a-2} ${t.waistY}M${a+8} ${21+t.sag}Q${a+8} ${t.waistY-24} ${a+6} ${t.waistY}M${a-2} ${t.waistY}Q32 ${t.waistY+18} 33 ${t.hemY-6}M${a+6} ${t.waistY}Q${a+8} ${t.waistY+18} ${a+8} ${t.hemY-6}`;return c("curtain",[i`<path d=${ym(t)} fill=${r} />`,i`<path d=${l} fill="none" stroke=${n} stroke-width="3" stroke-linecap="round" />`,f(t.tie,()=>i`<rect x="20" y=${t.waistY-5} width=${t.waist-16} height="10" rx="5" fill=${s} data-part="tie" />`)])}function bm(e){return i`<g transform="translate(200 0) scale(-1 1)">${e}</g>`}function km(e){let t=gm(e.drape,e.droop),r=e.droop/2,n=e.drape==="half"?0.28:0,s=y(y(o.coral,"#16204d",n),"#8d7a5c",r*0.85),a=y(y(o.coralDark,"#16204d",n),"#6d5c44",r*0.85),l=y(o.sun,"#8d7a5c",r),u=Oa(e,t,s,a,l),p=bm(Oa(e,{...t,sag:t.sag*0.6},s,a,l));return e.drape==="open"&&e.droop===0?[h("sway",u,1),h("sway",p,2)]:[u,p]}function $m(){return c("rod",[i`<rect x="16" y="16" width="168" height="6" rx="3" fill=${o.wickerDark} />`,i`<circle cx="17" cy="19" r="6" fill=${o.wicker} /><circle cx="183" cy="19" r="6" fill=${o.wicker} />`])}function _m(){let r=[98,118,138,158,176].map((l)=>l*Math.PI/180),n=(l,u)=>`${_(172+Math.cos(l)*u)} ${_(26+Math.sin(l)*u)}`,s=r.map((l)=>`M172 26L${n(l,54)}`).join(""),a=[18,33,48].map((l)=>r.slice(1).map((u,p)=>{let m=r[p]??u,b=(m+u)/2;return`M${n(m,l)}Q${n(b,l*0.8)} ${n(u,l)}`}).join("")).join("");return c("web",[i`<path d=${`${s}${a}`} fill="none" stroke="#f1f4fb" stroke-width="2" stroke-linecap="round" opacity=".92" />`,c("spider",[i`<path d="M148 42V68" stroke="#f1f4fb" stroke-width="1.6" />`,d(148,72,h("bob",[i`<path d="M-5-2L-12-8M-5 0L-13-1M-5 2L-12 7M-4 4L-9 11M5-2L12-8M5 0L13-1M5 2L12 7M4 4L9 11" stroke=${ce} stroke-width="2" stroke-linecap="round" />`,i`<circle r="7" fill=${ce} />`,i`<circle cx="-2.6" cy="-1" r="1.7" fill="#fff" /><circle cx="2.6" cy="-1" r="1.7" fill="#fff" />`]))])])}function wm(e,t,r){return c("dead-fly",d(e,115,[i`<path d="M-4-3L-7-10M0-4V-11M4-3L7-10" stroke=${o.fly} stroke-width="2" stroke-linecap="round" />`,i`<ellipse cx="-7" cy="3" rx="6" ry="2.8" fill=${o.wing} transform="rotate(-14 -7 3)" />`,i`<ellipse cx="7" cy="3" rx="6" ry="2.8" fill=${o.wing} transform="rotate(14 7 3)" />`,i`<ellipse rx="6.4" ry="5" fill=${o.fly} />`],t),r)}function Ia(e,t){return c("squeegee",[i`<path d=${`M0 6L${e} ${t}`} stroke=${o.sun} stroke-width="7" stroke-linecap="round" />`,i`<path d=${`M${_(e*0.72)} ${_(t*0.72)}L${e} ${t}`} stroke=${o.coral} stroke-width="8.5" stroke-linecap="round" />`,i`<rect x="-32" y="-7" width="64" height="5" rx="2.5" fill=${o.fly} />`,i`<rect x="-30" y="-3" width="60" height="9" rx="4" fill=${o.metalMid} />`])}function Na(e){return c("bucket",[f(e,()=>d(40,100,Ia(-4,62),-6,0.8)),i`<g fill="#fff"><circle cx="26" cy="141" r="7" /><circle cx="39" cy="138" r="9" /><circle cx="52" cy="141" r="6.5" /></g>`,i`<path d="M17 147H63L58 178Q57 184 51 184H29Q23 184 22 178Z" fill=${o.sky} />`,i`<rect x="13" y="142" width="54" height="9" rx="4.5" fill=${o.skyDark} />`,i`<path d="M20 152Q40 176 60 152" fill="none" stroke=${o.metal} stroke-width="3.4" stroke-linecap="round" />`])}function xm(){return[[[84,112,1],[116,104,2],[100,118,3]].map(([t,r,n])=>d(t,r,h("drip",O(0,0,o.water,0.85),n))),d(100,92,h("wobble",Ia(40,56))),Na(!1),E(26,128,6,1),E(56,124,4.5,3),E(176,150,7,2),E(170,120,4.5,4)]}function vm(){return c("droplets",[[70,46,0.8,0],[88,66,0.6,1],[120,48,0.75,0],[134,66,0.6,2],[66,92,0.65,3],[90,98,0.85,0],[116,88,0.7,4],[138,104,0.8,0]].map(([t,r,n,s])=>{let a=O(0,0,"#e8f7ff",n);return d(t,r,s?h("drip",a,s):a)}))}function Mm(){return c("cloth",[d(146,118,h("sway",[i`<path d="M-20 0H20Q23 0 23 4L25 44Q25 48 21 47L13 44L5 48L-4 44L-12 48L-20 45Q-24 44-23 40L-23 4Q-23 0-20 0Z" fill=${o.lilac} />`,i`<path d="M-23 10H24M-23 36H25" stroke=${o.cream} stroke-width="4" />`,i`<path d="M-22 16q22 5 46 0" fill="none" stroke=${o.lilacDark} stroke-width="3" stroke-linecap="round" />`]))])}function Am(){return c("glint",[i`<path d="M62 122L108 34H128L82 122Z" fill="#fff" opacity=".2" />`,i`<path d="M92 122L138 34H146L100 122Z" fill="#fff" opacity=".28" />`])}function Tm(){return c("bird",[d(136,108,h("bob",[i`<path d="M12-1L24-7L21 3Z" fill=${o.sunDark} />`,i`<ellipse rx="12.5" ry="11" fill=${o.sun} />`,i`<path d="M-4 0Q5-4 11 2Q6 8-1 6Z" fill=${o.sunDark} />`,i`<path d="M-12-4L-21-1L-12 2Z" fill=${o.coral} />`,i`<circle cx="-6" cy="-4" r="2.2" fill=${ce} />`,i`<path d="M-4 11V13M3 11V13" stroke=${o.coralDark} stroke-width="2.4" stroke-linecap="round" />`]))])}function Qa(e,t){let r=Jf(e),n=[[34,78],[172,106]],s=[[76,-8],[124,8],[100,-3]];return I("window",e,t,[A(100,184,78),i`<rect x="36" y="124" width="128" height="56" rx="10" fill=${o.wicker} data-part="panel" />`,i`<rect x="46" y="136" width="108" height="36" rx="7" fill=${o.wickerLight} opacity=".55" />`,am(r),dm(r),f(r.droplets,()=>i`<rect x="32" y="30" width="136" height="96" fill="#fff" opacity=".08" />`),f(r.dazzle,Am),f(r.scrubbing,pm),mm(),f(r.scrubbing,fm),f(r.droplets,vm),c("window-frame",i`<path d=${em} fill=${o.cream} fill-rule="evenodd" />`),i`<rect x="18" y="120" width="164" height="13" rx="5" fill=${o.wickerLight} data-part="sill" />`,i`<rect x="26" y="130" width="148" height="3" fill=${o.wickerDark} opacity=".55" />`,s.slice(0,r.deadFlies).map(([a,l],u)=>wm(a,l,u)),km(r),$m(),f(r.dazzle,Tm),f(r.cloth,Mm),V(100,153,r.mood,"#5b3413",1),f(r.web,_m),f(r.bucket,()=>Na(!0)),f(r.scrubbing,xm),R([[178,112],[22,118]].slice(0,r.stench)),n.slice(0,r.flies).map(([a,l],u)=>N(a,l,u)),f(r.dazzle,()=>[v(20,60,1,1),v(179,48,1,2),v(128,46,0.85,3),v(176,146,0.8,4),v(22,150,0.9,5)])])}var Fa={generic:jn,laundry:bs,pills:Js,plant:na,teeth:aa,bed:hs,dishes:Ms,trash:ya,vacuum:wa,pet:Ys,bathroom:Yo,fridge:Ns,window:Qa,water:Ha};function Sm(e){return Object.hasOwn(Fa,e)}function Cm(e){return Sm(e)?Fa[e]:jn}function ne(e,t){return Cm(e.name)(e,t)}var Lm={check:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",undo:"M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z",skip:"M16,18H18V6H16M6,18L14.5,12L6,6V18Z",bolt:"M7,2V13H10V22L17,10H13L17,2H7Z",menu:"M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",plus:"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",up:"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",down:"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",trash:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",alert:"M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",chevron:"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",list:"M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z",tiles:"M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z"};function U(e){return g`<svg class="ht-icon" viewBox="0 0 24 24" aria-hidden="true">
    ${i`<path d=${Lm[e]} fill="currentColor"></path>`}
  </svg>`}function Or(e,t){let{tracker:r}=t,n=t.ids?.length?t.ids:void 0,s=e.filter((l)=>{if(n&&!n.includes(l.task_id))return!1;if(t.show==="all")return!0;return l.is_today||l.status==="clean"||(r?.isRecent(l.task_id)??!1)});if(n)return s.toSorted((l,u)=>n.indexOf(l.task_id)-n.indexOf(u.task_id));return s.map((l)=>({view:l,key:r?.frozenKey(l.task_id)??rt(l)})).toSorted((l,u)=>gr(l.key,u.key)).map(({view:l})=>l)}function gt(e){return e.status==="due"||e.status==="overdue"||e.status==="in_progress"}function Dm(e){let t=/^#([0-9a-f]{6})$/i.exec(e);if(!t?.[1])return;let r=Number.parseInt(t[1],16),n=(a)=>r>>a&255;return 0.299*n(16)+0.587*n(8)+0.114*n(0)>150?"#14182a":"#ffffff"}function Za(e){let{wall:t,floor:r}=Fo(e.scene),n={"--ht-wall":t,"--ht-floor":r};if(!e.color)return n;let s=Dm(e.color);return{...n,"--ht-task":e.color,...s?{"--ht-on-task":s}:{}}}function Em(e,t){if(e.action)return e.action;if(e.stage_index===0&&e.stage_count>1)return t.t("action_start");return t.t("action_advance")}function za(e,t){return ne(e.scene,{animations:t.animations,bleed:!0,day:t.day,label:`${e.title}: ${t.i18n.t(`status_${e.status}`)}`})}function Ua(e){if(!e.icon||e.scene.name!=="generic")return k;return g`<span class="badge" aria-hidden="true"><ha-icon .icon=${e.icon}></ha-icon></span>`}function Pm(e,t){let{i18n:r,tracker:n}=t,s=e.task_id,a=n.justCompleted(s),l=!e.can_advance,u=!a&&!l&&vn(e),p=u&&n.isArmed(s),m=Em(e,r);if(a)m=r.t("status_done");else if(l)m=r.t(`status_${e.status}`);else if(u)m=r.t(p?"action_early_confirm":"action_early");let b=!p&&(!gt(e)||e.automated);return g`<button
    class="go ${b?"quiet":"loud"} ${a?"finished":""}"
    data-action="advance"
    aria-label="${m}: ${e.title}"
    ?disabled=${l||a||t.offline}
    ?data-pending=${n.isPending(s)}
    @click=${()=>{n.press(e)}}
  >
    ${a?U("check"):k}
    <span>${m}</span>
  </button>`}function qa(e,t){return e.can_undo&&t.tracker.isRecent(e.task_id)}function Ba(e,t){let{i18n:r,tracker:n}=t;if(!qa(e,t))return k;return g`<button
    class="undo ${t.animations?"enter":""}"
    data-action="undo"
    aria-label="${r.t("action_undo")}: ${e.title}"
    ?disabled=${t.offline||n.isPending(e.task_id)}
    @click=${()=>{n.undo(e)}}
  >
    ${U("undo")}
  </button>`}function Hm(e,t){if(!t.animations||t.tracker.celebration(e.task_id)!=="done")return k;return g`<span class="burst" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </span>`}function Vm(e,t){if(e.stage_count<2||e.stage_count>8)return k;let r=t.i18n.t("stage_progress",{current:e.stage_index+1,total:e.stage_count});return g`<span class="dots" role="img" aria-label=${r}>
    ${Array.from({length:e.stage_count},(n,s)=>g`<i
          class=${s<e.stage_index?"past":s===e.stage_index?"now":""}
        ></i>`)}
  </span>`}function Rm(e,t){return g`<div class="stage">
    ${Vm(e,t)}<span class="stage-name">${e.stage_title}</span>
    ${e.automated?g`<span class="auto" data-part="automated"
            >${U("bolt")}${t.i18n.t("automated")}</span
          >`:k}
  </div>`}function Om(e,t){let r=t.tracker.error(e.task_id);return r?g`<div class="due failed" role="alert">
        ${t.i18n.t("error_generic",{message:r})}
      </div>`:g`<div class="due">${t.i18n.dueText(e,t.now)}</div>`}function Wa(e,t,r){let n=t.animations?t.tracker.celebration(e.task_id):void 0;return`${r} is-${e.status}${n?` pop-${n}`:""}`}function Im(e,t,r){let{i18n:n,tracker:s}=t;if(!r||!e.can_skip||!gt(e))return k;return g`<button
    class="skip"
    data-action="skip"
    aria-label="${n.t("action_skip")}: ${e.title}"
    ?disabled=${t.offline||s.isPending(e.task_id)}
    @click=${()=>{s.skip(e)}}
  >
    ${U("skip")}
  </button>`}function ja(e,t){let r=t.tracker.error(e.task_id)!==void 0;return g`<div class="text">
    <div class="title">${e.title}</div>
    <div class="meta">
      ${r?k:Rm(e,t)}
      <div class="when">${Om(e,t)}</div>
    </div>
  </div>`}function Ya(e,t,r){return g`<div class="actions">
    <div class="go-wrap">${Pm(e,t)}${Hm(e,t)}</div>
    ${Im(e,t,r)}
  </div>`}function Ir(e,t,r={}){return g`<div
    class=${Wa(e,t,"row")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${Mn(Za(e))}
  >
    <div class="thumb">${za(e,t)} ${Ua(e)}</div>
    ${ja(e,t)} ${Ba(e,t)}
    ${Ya(e,t,r.skip===!0&&!qa(e,t))}
  </div>`}function Nr(e,t,r={}){return g`<article
    class=${Wa(e,t,"tile")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${Mn(Za(e))}
  >
    <div class="art">${za(e,t)} ${Ua(e)} ${Ba(e,t)}</div>
    ${ja(e,t)} ${Ya(e,t,r.skip===!0)}
  </article>`}function nr(e,t){return Array.from({length:e},()=>g`<div class="${t} skeleton" aria-hidden="true"></div>`)}var $e=F`
  .ht-icon {
    width: 20px;
    height: 20px;
    flex: none;
  }
`,Qr=F`
  .list {
    display: grid;
    gap: 8px;
  }

  .row,
  .tile {
    --ht-fg: #f4f2fa;
    --ht-muted: rgba(255, 255, 255, 0.74);
    --ht-divider: rgba(255, 255, 255, 0.28);
    position: relative;
    box-sizing: border-box;
    border-radius: calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    color: var(--ht-fg);
  }

  .row {
    display: grid;
    grid-template-columns: 68px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    height: 68px;
    padding-right: 10px;
    background: linear-gradient(var(--ht-wall) 86%, var(--ht-floor) 86%);
  }

  .thumb,
  .art {
    position: relative;
    overflow: hidden;
    border-radius: calc(var(--ht-radius) * 0.9);
    corner-shape: var(--ht-corner);
    background: var(--ht-surface-alt);
  }

  .thumb {
    width: 72px;
    height: 72px;
  }

  .art {
    aspect-ratio: 1;
  }

  .row .thumb {
    width: 68px;
    height: 68px;
    border-radius: calc(var(--ht-radius) * 1.3) 0 0 calc(var(--ht-radius) * 1.3);
    corner-shape: var(--ht-corner);
    background: none;
  }

  .tile .art {
    aspect-ratio: 200 / 192;
    border-radius: calc(var(--ht-radius) * 1.3) calc(var(--ht-radius) * 1.3) 0 0;
    corner-shape: var(--ht-corner);
    background: none;
  }

  .badge {
    position: absolute;
    right: 3px;
    bottom: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: rgba(16, 20, 38, 0.55);
    color: var(--ht-task, var(--ht-fg));
    --mdc-icon-size: 16px;
  }

  .art .badge {
    right: 8px;
    bottom: 8px;
    width: 40px;
    height: 40px;
    --mdc-icon-size: 26px;
  }

  .text {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  .title,
  .stage-name,
  .due {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .title {
    font-size: 1.0625rem;
    font-weight: 600;
    line-height: 1.3;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 14px;
    min-width: 0;
    overflow: hidden;
    font-size: 0.8125rem;
  }

  .when {
    position: relative;
    min-width: 0;
    max-width: 100%;
  }

  .when::before {
    content: '·';
    position: absolute;
    left: -9px;
    color: var(--ht-muted);
    line-height: 20px;
  }

  .stage {
    display: flex;
    flex: 0 1 auto;
    align-items: center;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    height: 20px;
    overflow: hidden;
    color: var(--ht-muted);
  }

  .auto {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 2px;
    color: #bfe3ff;
    font-size: 0;
    font-weight: 600;
  }

  .auto .ht-icon {
    width: 14px;
    height: 14px;
  }

  .dots {
    display: inline-flex;
    flex: none;
    gap: 3px;
  }

  .dots i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--ht-divider);
  }

  .dots .past {
    background: var(--ht-success);
  }

  .dots .now {
    background: var(--ht-task, var(--ht-accent));
  }

  .due {
    height: 20px;
    color: var(--ht-muted);
    line-height: 20px;
  }

  .is-due .due,
  .is-in_progress .due {
    color: #ffd98a;
  }

  .is-overdue .due,
  .due.failed {
    color: #ffb4a8;
  }

  .is-clean .due {
    color: #a7f0c9;
  }

  .go-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .row .go-wrap {
    flex: none;
    width: 92px;
  }

  .go {
    appearance: none;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 48px;
    padding: 0 10px;
    border: 2px solid transparent;
    border-radius: calc(var(--ht-radius) * 1.2);
    corner-shape: var(--ht-corner);
    font: inherit;
    font-size: 1rem;
    font-weight: 700;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 120ms ease,
      opacity 120ms ease;
  }

  .go span {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .go.loud {
    background: var(--ht-task, var(--ht-accent));
    color: var(--ht-on-task, var(--ht-on-accent));
  }

  .go.quiet {
    border-color: var(--ht-task, transparent);
    background: rgba(255, 255, 255, 0.16);
    color: var(--ht-fg);
  }

  .go.finished {
    border-color: transparent;
    background: var(--ht-success);
    color: #ffffff;
    opacity: 1;
  }

  .go:active:not(:disabled) {
    transform: scale(0.95);
  }

  .go:focus-visible,
  .undo:focus-visible,
  .skip:focus-visible {
    outline: 2px solid var(--ht-accent);
    outline-offset: 2px;
  }

  .go:disabled:not(.finished) {
    opacity: 0.45;
    cursor: default;
  }

  .go[data-pending] {
    opacity: 0.7;
  }

  .undo,
  .skip {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(16, 20, 38, 0.55);
    color: var(--ht-fg);
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
  }

  .undo:disabled,
  .skip:disabled {
    opacity: 0.45;
  }

  .undo {
    position: absolute;
    z-index: 1;
  }

  .row .undo {
    top: 12px;
    right: 110px;
  }

  .tile .undo {
    top: 8px;
    right: 8px;
  }

  .tile {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto 1fr auto;
    background: var(--ht-floor);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .tile .text {
    padding: 2px 12px 0;
  }

  .tile .actions {
    padding: 8px 12px 12px;
  }

  .tile .title {
    font-size: 1.0625rem;
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .row.skeleton,
  .tile.skeleton,
  .skeleton {
    background: var(--ht-surface-alt);
    opacity: 0.5;
  }

  .tile.skeleton {
    height: 280px;
  }

  .burst {
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
  }

  .burst i {
    position: absolute;
    width: 8px;
    height: 8px;
    margin: -4px;
    border-radius: 2px;
    corner-shape: var(--ht-corner);
    opacity: 0;
    background: #ffc857;
  }

  .burst i:nth-child(2) {
    --ht-a: 45deg;
    background: #5fd6a8;
  }

  .burst i:nth-child(3) {
    --ht-a: 90deg;
    background: #5ab4ff;
  }

  .burst i:nth-child(4) {
    --ht-a: 135deg;
    background: #ff8fc7;
  }

  .burst i:nth-child(5) {
    --ht-a: 180deg;
    background: #ffc857;
  }

  .burst i:nth-child(6) {
    --ht-a: 225deg;
    background: #5fd6a8;
  }

  .burst i:nth-child(7) {
    --ht-a: 270deg;
    background: #b79bff;
  }

  .burst i:nth-child(8) {
    --ht-a: 315deg;
    background: #ff7a6b;
  }

  @media (max-width: 480px) {
    .row .skip {
      display: none;
    }
  }

  @media (prefers-reduced-motion: no-preference) {
    .burst i {
      animation: ht-burst 0.8s steps(16) forwards;
    }

    .undo.enter {
      animation: ht-appear 0.2s steps(5) both;
    }

    .pop-done .thumb svg,
    .pop-done .art svg {
      animation: ht-pop 0.5s steps(10);
    }

    .pop-stage .dots .now {
      animation: ht-pop 0.5s steps(10);
    }
  }

  @keyframes ht-burst {
    0% {
      opacity: 1;
      transform: rotate(var(--ht-a, 0deg)) translateY(-8px) scale(0.5);
    }
    70% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: rotate(var(--ht-a, 0deg)) translateY(-62px) scale(1);
    }
  }

  @keyframes ht-appear {
    from {
      opacity: 0;
      transform: scale(0.6);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes ht-pop {
    0%,
    100% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.08);
    }
  }
`;var ie=F`
  :host {
    --ht-fg: var(--primary-text-color, #e6e6e6);
    --ht-muted: var(--secondary-text-color, #a8a8a8);
    --ht-accent: var(--primary-color, #03a9f4);
    --ht-on-accent: var(--text-primary-color, #ffffff);
    --ht-divider: var(--divider-color, rgba(255, 255, 255, 0.12));
    --ht-surface: var(--card-background-color, var(--ha-card-background, #1c1c1c));
    --ht-surface-alt: var(--secondary-background-color, #282828);
    --ht-danger: var(--error-color, #db4437);
    --ht-success: var(--success-color, #43a047);
    --ht-warning: var(--warning-color, #ffa600);
    --ht-radius: var(--ha-card-border-radius, 12px);
    --ht-corner: superellipse(1.6);
    --ht-touch: 56px;
    --ht-gap: 12px;
    color: var(--ht-fg);
  }
`,Ve=F`
  .ht-btn {
    appearance: none;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px;
    border: 1px solid var(--ht-divider);
    border-radius: var(--ht-radius);
    corner-shape: var(--ht-corner);
    background: transparent;
    color: var(--ht-fg);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 120ms ease,
      opacity 120ms ease;
  }

  .ht-btn:active {
    transform: scale(0.97);
  }

  .ht-btn:focus-visible,
  .ht-input:focus-visible {
    outline: 2px solid var(--ht-accent);
    outline-offset: 1px;
  }

  .ht-btn:disabled {
    opacity: 0.45;
    cursor: default;
  }

  .ht-btn-primary {
    border-color: transparent;
    background: var(--ht-accent);
    color: var(--ht-on-accent);
  }

  .ht-btn-danger {
    border-color: var(--ht-danger);
    color: var(--ht-danger);
  }

  .ht-input {
    box-sizing: border-box;
    width: 100%;
    min-height: 44px;
    padding: 8px 12px;
    border: 1px solid var(--ht-divider);
    border-radius: calc(var(--ht-radius) / 1.5);
    corner-shape: var(--ht-corner);
    background: var(--ht-surface-alt);
    color: var(--ht-fg);
    font: inherit;
    color-scheme: dark light;
  }

  .ht-label {
    display: grid;
    gap: 4px;
    color: var(--ht-muted);
    font-size: 0.875rem;
  }
`,Re=F`
  .ht-scene {
    display: block;
    width: 100%;
    height: 100%;
    contain: layout paint;
    user-select: none;
  }

  @media (prefers-reduced-motion: no-preference) {
    .ht-animated .ht-a-rumble {
      animation: ht-rumble 0.4s steps(1) infinite;
    }
    .ht-animated .ht-a-spin {
      animation: ht-spin 1.8s steps(18) infinite;
    }
    .ht-animated .ht-a-slosh {
      animation: ht-slosh 1.2s steps(10) infinite alternate;
    }
    .ht-animated .ht-a-rise {
      animation: ht-rise 2.8s steps(24) infinite;
    }
    .ht-animated .ht-a-flicker {
      animation: ht-flicker 0.5s steps(1) infinite;
    }
    .ht-animated .ht-a-waft {
      animation: ht-waft 2.6s steps(16) infinite;
    }
    .ht-animated .ht-a-buzz {
      animation: ht-buzz 1.8s steps(6) infinite;
    }
    .ht-animated .ht-a-drip {
      animation: ht-drip 1.8s ease-in infinite;
    }
    .ht-animated .ht-a-fall {
      animation: ht-fall 1.6s ease-in infinite;
    }
    .ht-animated .ht-a-drift {
      animation: ht-drift 5s steps(30) infinite alternate;
    }
    .ht-animated .ht-a-pulse {
      animation: ht-pulse 1.6s steps(12) infinite;
    }
    .ht-animated .ht-a-throb {
      animation: ht-throb 1.6s steps(12) infinite;
    }
    .ht-animated .ht-a-bob {
      animation: ht-bob 2.2s steps(14) infinite alternate;
    }
    .ht-animated .ht-a-wobble {
      animation: ht-wobble 1.3s steps(10) infinite alternate;
    }
    .ht-animated .ht-a-sway {
      animation: ht-sway 3.2s steps(20) infinite alternate;
    }
    .ht-animated .ht-a-twinkle {
      animation: ht-twinkle 2.2s steps(14) infinite;
    }
    .ht-animated .ht-a-tide {
      animation: ht-tide 4.4s steps(44) infinite;
    }
    .ht-animated .ht-a-tide-back {
      animation: ht-tide-back 6.6s steps(44) infinite;
    }
    .ht-animated .ht-d1 {
      animation-delay: -0.35s;
    }
    .ht-animated .ht-d2 {
      animation-delay: -1.05s;
    }
    .ht-animated .ht-d3 {
      animation-delay: -1.6s;
    }
    .ht-animated .ht-d4 {
      animation-delay: -2.1s;
    }
    .ht-animated .ht-d5 {
      animation-delay: -2.55s;
    }
  }

  @keyframes ht-rumble {
    0% {
      transform: translate(-1.4px, 0.5px) rotate(-0.5deg);
    }
    25% {
      transform: translate(1.2px, -0.6px) rotate(0.4deg);
    }
    50% {
      transform: translate(-0.9px, -0.4px) rotate(0.5deg);
    }
    75% {
      transform: translate(1.5px, 0.6px) rotate(-0.4deg);
    }
  }

  @keyframes ht-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes ht-slosh {
    from {
      transform: rotate(-7deg);
    }
    to {
      transform: rotate(7deg);
    }
  }

  @keyframes ht-rise {
    0% {
      opacity: 0;
      transform: translateY(14px) scale(0.6);
    }
    20% {
      opacity: 1;
    }
    80% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-26px) scale(1.15);
    }
  }

  @keyframes ht-flicker {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.2;
    }
  }

  @keyframes ht-waft {
    0% {
      opacity: 0.25;
      transform: translateY(8px);
    }
    50% {
      opacity: 1;
    }
    100% {
      opacity: 0.25;
      transform: translateY(-8px);
    }
  }

  @keyframes ht-buzz {
    0%,
    100% {
      transform: translate(0, 0);
    }
    25% {
      transform: translate(9px, -6px);
    }
    50% {
      transform: translate(14px, 3px);
    }
    75% {
      transform: translate(3px, 7px);
    }
  }

  @keyframes ht-drip {
    0% {
      opacity: 0;
      transform: translateY(-6px);
    }
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(12px);
    }
  }

  @keyframes ht-fall {
    0% {
      opacity: 0;
      transform: translateY(-16px);
    }
    25% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(26px);
    }
  }

  @keyframes ht-drift {
    from {
      transform: translateX(-6px);
    }
    to {
      transform: translateX(6px);
    }
  }

  @keyframes ht-pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.72;
      transform: scale(1.1);
    }
  }

  @keyframes ht-throb {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.08);
    }
  }

  @keyframes ht-bob {
    from {
      transform: translateY(-3px);
    }
    to {
      transform: translateY(3px);
    }
  }

  @keyframes ht-wobble {
    from {
      transform: rotate(-9deg);
    }
    to {
      transform: rotate(9deg);
    }
  }

  @keyframes ht-sway {
    from {
      transform: rotate(-3deg);
    }
    to {
      transform: rotate(3deg);
    }
  }

  @keyframes ht-twinkle {
    0%,
    100% {
      opacity: 0.3;
      transform: scale(0.6);
    }
    50% {
      opacity: 1;
      transform: scale(1.1);
    }
  }

  @keyframes ht-tide {
    from {
      transform: translateX(-66px);
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes ht-tide-back {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-66px);
    }
  }
`;var mi={tasks:[],i18n:fn(typeof navigator>"u"?"en":navigator.language)},Ka={title:"config_title",show:"config_show",layout:"config_layout",tasks:"config_tasks",animations:"config_animations"};function Nm(e){if(e.show!==void 0&&e.show!=="today"&&e.show!=="all")throw Error('show must be "today" or "all"');if(e.layout!==void 0&&e.layout!=="list"&&e.layout!=="scenes")throw Error('layout must be "list" or "scenes"');if(e.tasks!==void 0&&!Array.isArray(e.tasks))throw Error("tasks must be a list of task ids")}class gi extends z{static properties={hass:{attribute:!1,hasChanged:Se},config:{state:!0}};static styles=[ie,$e,Re,Qr,F`
      :host {
        display: block;
      }

      ha-card {
        corner-shape: var(--ht-corner);
        position: relative;
        display: block;
        box-sizing: border-box;
        height: 100%;
        padding: 12px 16px;
        container-type: inline-size;
      }

      header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        min-height: 32px;
        margin-bottom: 4px;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
      }

      .count {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 10px;
      }

      .empty {
        display: grid;
        grid-template-columns: 72px 1fr;
        align-items: center;
        gap: 12px;
        min-height: 88px;
        color: var(--ht-muted);
      }

      .empty .thumb {
        width: 72px;
        height: 72px;
      }

      .message {
        display: grid;
        gap: 4px;
        padding: 16px 0;
      }

      .message strong {
        color: var(--ht-fg);
      }

      .message span {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .offline {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: var(--ht-warning);
        font-size: 0.8125rem;
      }

      @container (max-width: 340px) {
        .row .go-wrap {
          width: 80px;
        }

        .row .undo {
          right: 98px;
        }
      }
    `];static getConfigForm(){let{i18n:e,tasks:t}=mi;return{schema:[{name:"title",selector:{text:{}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"today",label:e.t("config_show_today")},{value:"all",label:e.t("config_show_all")}]}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"list",label:e.t("config_layout_list")},{value:"scenes",label:e.t("config_layout_scenes")}]}}},{name:"tasks",selector:{select:{multiple:!0,custom_value:!0,options:t}}},{name:"animations",selector:{boolean:{}}}],computeLabel:(r)=>{let n=Object.hasOwn(Ka,r.name)?Ka[r.name]:void 0;return n?e.t(n):void 0}}}static getStubConfig(){return{show:"today",layout:"list",animations:!0}}live;tracker;constructor(){super();this.config={},this.live=new Lt(this,()=>this.hass,(e)=>{this.updateCatalog(e)}),this.tracker=new Dt(this,()=>this.hass)}setConfig(e){Nm(e),this.config={...e}}getCardSize(){let e=this.views(),t=this.config.layout==="scenes"?5:2;return Math.max(2,1+Math.max(1,e.length)*t)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}willUpdate(e){if(e.has("hass")){if(this.live.sync(),this.hass)mi.i18n=J(this.hass)}}updateCatalog(e){mi.tasks=e.tasks.map((t)=>({value:t.id,label:t.title}))}views(){let{state:e}=this.live;if(!e)return[];return Or(e.views,{show:this.config.show??"today",ids:this.config.tasks,tracker:this.tracker})}context(e,t){let{now:r}=this.live;return{i18n:t,tracker:this.tracker,now:r,animations:this.config.animations!==!1&&!mr(),day:Ct(r,ye(e)),offline:ze(e)}}body(e,t,r){let{state:n,failed:s}=this.live;if(s&&!n)return g`<div class="message" role="alert">
        <strong>${t.t("card_error")}</strong>
        <span>${t.t("card_error_hint")}</span>
      </div>`;if(!n)return g`<div
        class=${r?"tiles":"list"}
        aria-busy="true"
        aria-label=${t.t("card_loading")}
      >
        ${nr(2,r?"tile":"row")}
      </div>`;let a=this.views();if(a.length===0)return this.empty(t);let l=this.context(e,t);return g`<div class=${r?"tiles":"list"}>
      ${te(a,(u)=>u.task_id,(u)=>r?Nr(u,l):Ir(u,l))}
    </div>`}empty(e){return g`<div class="empty" data-part="empty">
      <div class="thumb">
        ${ne({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:!1})}
      </div>
      <div>${e.t("card_empty")}</div>
    </div>`}render(){let{hass:e}=this;if(!e)return k;let t=J(e),r=this.config.layout==="scenes",n=this.live.state?this.views().filter((s)=>gt(s)).length:0;return g`<ha-card>
      <header>
        <h2>${this.config.title??t.t("card_title")}</h2>
        ${ze(e)?g`<span class="offline" role="status"
                >${U("alert")}${t.t("disconnected")}</span
              >`:n>0?g`<span class="count">${t.plural("tasks_due",n)}</span>`:k}
      </header>
      ${this.body(e,t,r)}
    </ha-card>`}}var yi=(e)=>e??k;var Qm=["generic","pills","laundry","plant","teeth","bed","dishes","trash","vacuum","pet","bathroom","fridge","window","water"],Fm=["once","daily","weekly","interval"],Zm=[0,1,2,3,4,5,6];function yt(e){let{target:t}=e;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement)return t.value;return""}function Ga(e){let{target:t}=e;return t instanceof HTMLInputElement&&t.checked}class bi extends z{static properties={hass:{attribute:!1},source:{attribute:!1},now:{attribute:!1},readonly:{type:Boolean},form:{state:!0},showErrors:{state:!0},saving:{state:!0},failure:{state:!0},picker:{state:!0},confirming:{state:!0}};static styles=[ie,Ve,$e,Re,F`
      :host {
        display: block;
      }

      .form {
        display: grid;
        gap: 14px;
        container-type: inline-size;
      }

      h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      section {
        display: grid;
        align-content: start;
        gap: 12px;
        padding: 14px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      h3 {
        margin: 0;
        font-size: 1rem;
      }

      .columns {
        display: grid;
        align-items: start;
        gap: 14px;
      }

      .stack {
        display: grid;
        gap: 14px;
      }

      .pair {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }

      @container (min-width: 720px) {
        .columns {
          grid-template-columns: 1fr 1fr;
        }
      }

      textarea.ht-input {
        min-height: 72px;
        resize: vertical;
      }

      select.ht-input {
        appearance: auto;
      }

      .ht-input[aria-invalid='true'] {
        border-color: var(--ht-danger);
      }

      .err {
        color: var(--ht-danger);
        font-size: 0.8125rem;
      }

      .hint {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .segments {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }

      .segment {
        flex: 1 1 auto;
        min-width: 44px;
      }

      .segment[aria-pressed='true'] {
        border-color: transparent;
        background: var(--ht-accent);
        color: var(--ht-on-accent);
      }

      .scenes {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }

      .scene {
        appearance: none;
        display: grid;
        gap: 4px;
        padding: 4px 4px 6px;
        border: 2px solid transparent;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-fg);
        font: inherit;
        font-size: 0.8125rem;
        cursor: pointer;
        touch-action: manipulation;
      }

      .scene[aria-pressed='true'] {
        border-color: var(--ht-accent);
      }

      .scene:disabled {
        cursor: default;
      }

      .scene-art {
        overflow: hidden;
        aspect-ratio: 1;
        border-radius: calc(var(--ht-radius) * 0.7);
        corner-shape: var(--ht-corner);
      }

      .check {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 44px;
        color: var(--ht-fg);
      }

      .check input {
        width: 24px;
        height: 24px;
        accent-color: var(--ht-accent);
      }

      .inline {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .inline .ht-input {
        flex: 1;
        min-width: 0;
      }

      .swatch {
        flex: 1;
        padding: 4px;
      }

      .stage {
        padding: 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        display: grid;
        gap: 10px;
      }

      .stage .ht-input {
        background: var(--ht-surface);
      }

      .stage-head {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .stage-head strong {
        flex: 1;
      }

      .icon-btn {
        width: 44px;
        padding: 0;
      }

      .rule {
        display: grid;
        gap: 10px;
        padding: 10px;
        border: 1px dashed var(--ht-divider);
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
      }

      .picker {
        display: grid;
        gap: 4px;
      }

      .suggestions {
        display: grid;
        overflow: hidden;
        border: 1px solid var(--ht-divider);
        border-radius: calc(var(--ht-radius) / 1.5);
        corner-shape: var(--ht-corner);
      }

      .suggestion {
        appearance: none;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 2px 8px;
        min-height: 52px;
        padding: 6px 10px;
        border: 0;
        border-top: 1px solid var(--ht-divider);
        background: var(--ht-surface);
        color: var(--ht-fg);
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .suggestion:first-child {
        border-top: 0;
      }

      .suggestion b,
      .suggestion small {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-weight: 500;
      }

      .suggestion small {
        grid-column: 1;
        color: var(--ht-muted);
      }

      .suggestion em {
        grid-row: 1 / span 2;
        grid-column: 2;
        align-self: center;
        color: var(--ht-muted);
        font-style: normal;
      }

      .no-match {
        padding: 12px;
        color: var(--ht-muted);
      }

      .live {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px 10px;
        min-height: 20px;
        font-size: 0.875rem;
      }

      .live-value {
        color: var(--ht-muted);
      }

      .met {
        color: var(--ht-success);
      }

      .unmet {
        color: var(--ht-muted);
      }

      .warn {
        color: var(--ht-warning);
      }

      .sentence {
        margin: 0;
        font-size: 0.9375rem;
      }

      footer {
        position: sticky;
        z-index: 2;
        bottom: -12px;
        margin-inline: -12px;
        display: flex;
        align-items: center;
        gap: 8px;
        min-height: 60px;
        padding: 8px 12px;
        box-sizing: border-box;
        border-top: 1px solid var(--ht-divider);
        background: var(--ht-surface);
      }

      footer .message {
        flex: 1;
        min-width: 0;
        overflow: hidden;
        color: var(--ht-danger);
        font-size: 0.875rem;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      footer .spacer {
        flex: 1;
      }
    `];constructor(){super();this.now=new Date,this.readonly=!1,this.form=null,this.showErrors=!1,this.saving=!1,this.failure=null,this.picker=null,this.confirming=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||!this.form)return!0;let t=e.get("hass");if(!fr(t)||this.picker!==null)return!0;return this.form.stages.some((r)=>t.states[r.entity]!==this.hass.states[r.entity])}willUpdate(e){if(e.has("source"))this.form=$o(this.source,ye(this.hass),this.now),this.showErrors=!1,this.failure=null,this.confirming=!1}patch(e){if(this.form)this.form={...this.form,...e}}patchStage(e,t){if(!this.form)return;this.patch({stages:this.form.stages.map((r,n)=>n===e?{...r,...t}:r)})}errors(e){return this.showErrors?_n(e,ye(this.hass)):{}}async save(){let e=this.form;if(!e||this.readonly||this.saving)return;let t=ye(this.hass);if(Object.keys(_n(e,t)).length>0){this.showErrors=!0,await this.updateComplete,this.renderRoot.querySelector('[aria-invalid="true"]')?.scrollIntoView?.({block:"center"});return}this.saving=!0,this.failure=null;try{let r=xo(e,t);if(r.id===void 0)await ao(this.hass,r);else await lo(this.hass,{...r,id:r.id});this.close()}catch(r){this.failure=ve(r)}finally{this.saving=!1}}async removeTask(){let e=this.form?.id;if(!e||this.readonly)return;this.saving=!0,this.failure=null;try{await co(this.hass,e),this.close()}catch(t){this.failure=ve(t)}finally{this.saving=!1}}close=()=>{this.dispatchEvent(new CustomEvent("ht-close",{bubbles:!0,composed:!0}))};message(e,t){if(!e)return k;return g`<span class="err" role="alert">${t.t(e.key,e.vars)}</span>`}input(e){let{path:t,label:r,value:n,errors:s,i18n:a,onInput:l}=e;return g`<label class="ht-label">
      ${r}
      <input
        class="ht-input"
        data-field=${t}
        type=${e.type??"text"}
        inputmode=${yi(e.inputmode)}
        placeholder=${yi(e.placeholder)}
        aria-invalid=${s[t]?"true":"false"}
        .value=${n}
        ?disabled=${this.readonly}
        @input=${(u)=>{l(yt(u))}}
      />
      ${e.hint?g`<span class="hint">${e.hint}</span>`:k}
      ${this.message(s[t],a)}
    </label>`}select(e){let{path:t,label:r,value:n,choices:s,onChange:a}=e;return g`<label class="ht-label">
      ${r}
      <select
        class="ht-input"
        data-field=${t}
        ?disabled=${this.readonly}
        @change=${(l)=>{let u=s.find((p)=>p.value===yt(l));if(u)a(u.value)}}
      >
        ${s.map((l)=>g`<option value=${l.value} ?selected=${l.value===n}>
              ${l.label}
            </option>`)}
      </select>
    </label>`}renderDetails(e,t,r){return g`<section>
      <h3>${r.t("section_details")}</h3>
      ${this.input({path:"title",label:r.t("field_title"),value:e.title,errors:t,i18n:r,onInput:(n)=>{this.patch({title:n})}})}
      <div class="ht-label">
        ${r.t("field_scene")}
        <div class="scenes">
          ${Qm.map((n)=>g`<button
                type="button"
                class="scene"
                data-scene=${n}
                aria-pressed=${e.scene===n?"true":"false"}
                ?disabled=${this.readonly}
                @click=${()=>{this.patch({scene:n})}}
              >
                <span class="scene-art">
                  ${ne({name:n,state:"accumulating",fill:0.6,stink:0,progress:0},{animations:!1})}
                </span>
                ${r.t(`scene_${n}`)}
              </button>`)}
        </div>
      </div>
      <div class="pair">
        ${this.input({path:"icon",label:r.t("field_icon"),value:e.icon,errors:t,i18n:r,placeholder:"mdi:…",hint:r.t("hint_icon"),onInput:(n)=>{this.patch({icon:n})}})}
        <div class="ht-label">
          ${r.t("field_color")}
          <div class="inline">
            <input
              class="ht-input swatch"
              type="color"
              data-field="color"
              .value=${e.color||"#5ab4ff"}
              ?disabled=${this.readonly}
              @input=${(n)=>{this.patch({color:yt(n)})}}
            />
            <button
              type="button"
              class="ht-btn"
              data-action="clear-color"
              ?disabled=${this.readonly||!e.color}
              @click=${()=>{this.patch({color:""})}}
            >
              ${r.t("action_clear")}
            </button>
          </div>
        </div>
      </div>
      <label class="ht-label">
        ${r.t("field_notes")}
        <textarea
          class="ht-input"
          data-field="notes"
          .value=${e.notes}
          ?disabled=${this.readonly}
          @input=${(n)=>{this.patch({notes:yt(n)})}}
        ></textarea>
      </label>
      ${this.renderAssignee(e,t,r)}
      <label class="check">
        <input
          type="checkbox"
          data-field="enabled"
          .checked=${e.enabled}
          ?disabled=${this.readonly}
          @change=${(n)=>{this.patch({enabled:Ga(n)})}}
        />
        ${r.t("field_enabled")}
      </label>
    </section>`}renderAssignee(e,t,r){let n=Object.values(this.hass.states).filter((s)=>s.entity_id.startsWith("person."));return g`<label class="ht-label">
      ${r.t("field_assignee")}
      <input
        class="ht-input"
        data-field="assignee"
        list="ht-people"
        placeholder=${r.t("hint_assignee")}
        .value=${e.assignee}
        ?disabled=${this.readonly}
        aria-invalid=${t.assignee?"true":"false"}
        @input=${(s)=>{this.patch({assignee:yt(s)})}}
      />
      <datalist id="ht-people">
        ${n.map((s)=>g`<option value=${s.entity_id}></option>`)}
      </datalist>
    </label>`}renderSchedule(e,t,r){let n=this.input({path:"time",label:r.t("field_time"),value:e.time,type:"time",errors:t,i18n:r,onInput:(a)=>{this.patch({time:a})}}),s;switch(e.schedule){case"once":s=this.input({path:"due",label:r.t("field_due"),value:e.due,type:"datetime-local",errors:t,i18n:r,onInput:(a)=>{this.patch({due:a})}});break;case"daily":s=n;break;case"weekly":s=g`<div class="ht-label">
            ${r.t("field_weekdays")}
            <div class="segments">${Zm.map((a)=>this.weekdayButton(e,a,r))}</div>
            ${this.message(t.weekdays,r)}
          </div>
          ${n}`;break;default:s=g`<div class="pair">
            ${this.input({path:"every_days",label:r.t("field_every_days"),value:e.every_days,inputmode:"numeric",errors:t,i18n:r,onInput:(a)=>{this.patch({every_days:a})}})}
            ${n}
          </div>
          ${this.select({path:"anchor",label:r.t("field_anchor"),value:e.anchor,choices:[{value:"completion",label:r.t("anchor_completion")},{value:"schedule",label:r.t("anchor_schedule")}],onChange:(a)=>{this.patch({anchor:a})}})}`;break}return g`<section>
      <h3>${r.t("field_schedule")}</h3>
      <div class="segments" role="group" aria-label=${r.t("field_schedule_type")}>
        ${Fm.map((a)=>g`<button
              type="button"
              class="ht-btn segment"
              data-schedule=${a}
              aria-pressed=${e.schedule===a?"true":"false"}
              ?disabled=${this.readonly}
              @click=${()=>{this.patch({schedule:a})}}
            >
              ${r.t(`schedule_${a}`)}
            </button>`)}
      </div>
      ${s}
    </section>`}weekdayButton(e,t,r){let n=e.weekdays.includes(t);return g`<button
      type="button"
      class="ht-btn segment"
      data-weekday=${t}
      aria-label=${r.weekday(t,"long")}
      aria-pressed=${n?"true":"false"}
      ?disabled=${this.readonly}
      @click=${()=>{this.patch({weekdays:n?e.weekdays.filter((s)=>s!==t):[...e.weekdays,t]})}}
    >
      ${r.weekday(t,"short")}
    </button>`}renderBehaviour(e,t,r){return g`<section>
      <h3>${r.t("section_behaviour")}</h3>
      ${this.select({path:"on_missed",label:r.t("field_on_missed"),value:e.on_missed,choices:[{value:"carry",label:r.t("on_missed_carry")},{value:"skip",label:r.t("on_missed_skip")}],onChange:(n)=>{this.patch({on_missed:n})}})}
      <div class="pair">
        ${this.input({path:"clean_for",label:r.t("field_clean_for"),value:e.clean_for,inputmode:"numeric",hint:r.t("hint_clean_for"),errors:t,i18n:r,onInput:(n)=>{this.patch({clean_for:n})}})}
        ${this.input({path:"grace",label:r.t("field_grace"),value:e.grace,inputmode:"numeric",hint:r.t("hint_grace"),errors:t,i18n:r,onInput:(n)=>{this.patch({grace:n})}})}
      </div>
    </section>`}renderSuggestions(e,t,r){let n=Ao(this.hass.states,e.entity,e.condition);if(n.length===0)return g`<div class="suggestions">
        <div class="no-match">${r.t("entity_no_matches")}</div>
      </div>`;return g`<div
      class="suggestions"
      @mousedown=${(s)=>{s.preventDefault()}}
    >
      ${n.map((s)=>g`<button
            type="button"
            class="suggestion"
            data-entity=${s.entity_id}
            @click=${()=>{this.patchStage(t,{entity:s.entity_id}),this.picker=null}}
          >
            <b>${s.name}</b><small>${s.entity_id}</small><em>${s.state}</em>
          </button>`)}
    </div>`}renderLive(e,t,r){let n=To(e,t);if(!e.entity.trim())return k;let a={met:["trigger_met","met"],unmet:["trigger_unmet","unmet"],unavailable:["entity_unavailable","warn"],missing:["entity_not_found","warn"]}[n];return g`<div class="live" data-part="live" role="status">
      ${t?g`<span class="live-value"
              >${r.t("field_current_value",{value:Co(t)})}</span
            >`:k}
      ${a?g`<span class=${a[1]} data-match=${n}>${r.t(a[0])}</span>`:k}
    </div>`}renderTrigger(e,t,r,n){let s=`stages.${t}`,a=vo(this.hass.states,e.entity.trim()),l=[{value:"above",label:n.t("condition_above")},{value:"below",label:n.t("condition_below")},{value:"state",label:n.t("condition_state")}];return g`<div class="rule">
      <label class="check">
        <input
          type="checkbox"
          data-field="${s}.auto"
          .checked=${e.condition!=="none"}
          ?disabled=${this.readonly}
          @change=${(u)=>{this.patchStage(t,{condition:Ga(u)?"above":"none"})}}
        />
        ${n.t("field_trigger")}
      </label>
      ${e.condition==="none"?k:g`<div class="picker">
                <label class="ht-label">
                  ${n.t("field_entity")}
                  <input
                    class="ht-input"
                    data-field="${s}.entity"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder=${n.t("entity_placeholder")}
                    aria-invalid=${r[`${s}.entity`]?"true":"false"}
                    .value=${e.entity}
                    ?disabled=${this.readonly}
                    @focus=${()=>{this.picker=t}}
                    @blur=${()=>{if(this.picker===t)this.picker=null}}
                    @input=${(u)=>{this.patchStage(t,{entity:yt(u)})}}
                  />
                </label>
                ${this.picker===t?this.renderSuggestions(e,t,n):k}
                ${this.message(r[`${s}.entity`],n)}
              </div>
              <div class="pair">
                ${this.select({path:`${s}.condition`,label:n.t("field_condition"),value:e.condition,choices:l,onChange:(u)=>{this.patchStage(t,{condition:u})}})}
                ${this.input({path:`${s}.value`,label:n.t("field_value"),value:e.value,...e.condition==="state"?{}:{inputmode:"decimal"},errors:r,i18n:n,onInput:(u)=>{this.patchStage(t,{value:u})}})}
                ${this.input({path:`${s}.hold`,label:n.t("field_for_seconds"),value:e.hold,inputmode:"numeric",errors:r,i18n:n,onInput:(u)=>{this.patchStage(t,{hold:u})}})}
              </div>
              ${this.renderLive(e,a,n)}`}
      <p class="sentence" data-part="sentence">${Lo(e,a,n)}</p>
    </div>`}renderStage(e,t,r,n,s){let a=`stages.${r}`,l=[{value:"todo",label:s.t("role_todo")},{value:"running",label:s.t("role_running")},{value:"waiting",label:s.t("role_waiting")}];return g`<div class="stage" data-stage=${r}>
      <div class="stage-head">
        <strong>${s.t("field_stage_n",{n:r+1})}</strong>
        ${this.readonly?k:g`<button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_up")}
                  ?disabled=${r===0}
                  @click=${()=>{this.form=kn(e,r,-1)}}
                >
                  ${U("up")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_down")}
                  ?disabled=${r===e.stages.length-1}
                  @click=${()=>{this.form=kn(e,r,1)}}
                >
                  ${U("down")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  data-action="remove-stage"
                  aria-label=${s.t("action_remove")}
                  ?disabled=${e.stages.length===1}
                  @click=${()=>{this.form=wo(e,r)}}
                >
                  ${U("trash")}
                </button>`}
      </div>
      <div class="pair">
        ${this.input({path:`${a}.title`,label:s.t("field_stage_title"),value:t.title,errors:n,i18n:s,onInput:(u)=>{this.patchStage(r,{title:u})}})}
        ${this.input({path:`${a}.action`,label:s.t("field_action"),value:t.action,errors:n,i18n:s,onInput:(u)=>{this.patchStage(r,{action:u})}})}
      </div>
      <div class="pair">
        ${this.select({path:`${a}.role`,label:s.t("field_role"),value:t.role,choices:l,onChange:(u)=>{this.patchStage(r,{role:u})}})}
        ${this.input({path:`${a}.stale`,label:s.t("field_stale_after"),value:t.stale,inputmode:"numeric",hint:s.t("hint_stale_after"),errors:n,i18n:s,onInput:(u)=>{this.patchStage(r,{stale:u})}})}
      </div>
      ${this.renderTrigger(t,r,n,s)}
    </div>`}renderFooter(e,t,r){if(this.readonly)return g`<footer>
        <span class="spacer"></span>
        <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
          ${r.t("action_close")}
        </button>
      </footer>`;if(this.confirming)return g`<footer>
        <span class="message">${r.t("confirm_delete",{title:e.title})}</span>
        <button
          type="button"
          class="ht-btn"
          @click=${()=>{this.confirming=!1}}
        >
          ${r.t("action_cancel")}
        </button>
        <button
          type="button"
          class="ht-btn ht-btn-danger"
          data-action="confirm-delete"
          ?disabled=${this.saving}
          @click=${()=>{this.removeTask()}}
        >
          ${r.t("action_delete")}
        </button>
      </footer>`;let s=(this.failure===null?null:r.t("error_generic",{message:this.failure}))??(Object.keys(t).length>0?r.t("error_form"):null);return g`<footer>
      ${e.id===null?k:g`<button
              type="button"
              class="ht-btn ht-btn-danger"
              data-action="delete"
              @click=${()=>{this.confirming=!0}}
            >
              ${r.t("action_delete")}
            </button>`}
      ${s===null?g`<span class="spacer"></span>`:g`<span class="message" role="alert">${s}</span>`}
      <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
        ${r.t("action_cancel")}
      </button>
      <button
        type="button"
        class="ht-btn ht-btn-primary"
        data-action="save"
        ?disabled=${this.saving}
        @click=${()=>{this.save()}}
      >
        ${r.t("action_save")}
      </button>
    </footer>`}render(){let e=this.form;if(!e)return k;let t=J(this.hass),r=this.errors(e);return g`<div class="form">
      <div class="columns">
        <div class="stack">${this.renderDetails(e,r,t)}</div>
        <div class="stack">
          ${this.renderSchedule(e,r,t)} ${this.renderBehaviour(e,r,t)}
        </div>
      </div>
      <section>
        <h3>${t.t("field_stages")}</h3>
        ${te(e.stages,(n)=>n.id,(n,s)=>this.renderStage(e,n,s,r,t))}
        ${this.readonly?k:g`<button
                type="button"
                class="ht-btn"
                data-action="add-stage"
                @click=${()=>{this.form=_o(e)}}
              >
                ${U("plus")}${t.t("action_add_stage")}
              </button>`}
      </section>
      ${this.renderFooter(e,r,t)}
    </div>`}}var Fr=40,zm=90;function Um(e){if(!e)return"";return e.views.map((t)=>`${t.task_id}:${t.stage_index}:${t.due_at}:${t.last_completed_at}:${t.can_undo}`).join("|")}function Xa(e,t){let r=new Map(e.map((n)=>[n.id,n]));for(let n of t)r.set(n.id,n);return[...r.values()].toSorted((n,s)=>Date.parse(s.ts)-Date.parse(n.ts))}class ki extends z{static properties={hass:{attribute:!1,hasChanged:Se},state:{attribute:!1},filter:{state:!0},events:{state:!0},stats:{state:!0},loading:{state:!0},more:{state:!0},error:{state:!0},day:{state:!0}};static styles=[ie,Ve,F`
      :host {
        display: block;
      }

      .top {
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        gap: 8px;
        margin-bottom: 12px;
      }

      .filter {
        flex: 1 1 180px;
        align-self: center;
      }

      select.ht-input {
        appearance: auto;
      }

      .stat {
        display: grid;
        flex: 1 1 96px;
        align-content: center;
        padding: 8px 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .stat b {
        font-size: 1.5rem;
        font-weight: 700;
        line-height: 1.2;
      }

      .stat span {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .columns {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 14px;
      }

      .columns > * {
        flex: 1 1 280px;
        min-width: 0;
        box-sizing: border-box;
      }

      .columns > .grid-panel {
        flex: 1 1 640px;
      }

      .panel {
        padding: 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      h3 {
        margin: 0 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .scroller {
        overflow-x: auto;
        overscroll-behavior-x: contain;
      }

      .grid {
        display: grid;
        grid-auto-columns: 44px;
        grid-template-rows: repeat(7, 44px);
        width: max-content;
      }

      .day {
        appearance: none;
        display: block;
        width: 44px;
        height: 44px;
        padding: 5px;
        border: 0;
        background: transparent;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .day i {
        display: block;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        border-radius: 7px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
      }

      .day.l1 i {
        background: color-mix(in srgb, var(--ht-success) 45%, var(--ht-surface-alt));
      }

      .day.l2 i {
        background: color-mix(in srgb, var(--ht-success) 72%, var(--ht-surface-alt));
      }

      .day.l3 i {
        background: var(--ht-success);
      }

      .day.trouble i {
        border: 3px solid var(--ht-warning);
      }

      .day.bad i {
        background: color-mix(in srgb, var(--ht-danger) 60%, var(--ht-surface-alt));
        border: 0;
      }

      .day[aria-pressed='true'] i {
        outline: 2px solid var(--ht-fg);
        outline-offset: 1px;
      }

      .caption {
        min-height: 20px;
        margin-top: 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .group {
        position: sticky;
        top: 0;
        padding: 8px 0 4px;
        background: var(--ht-surface);
        color: var(--ht-muted);
        font-size: 0.8125rem;
        font-weight: 600;
      }

      .event {
        display: grid;
        grid-template-columns: 12px minmax(0, 1fr) auto;
        align-items: center;
        gap: 10px;
        height: 56px;
      }

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--ht-muted);
      }

      .t-completed .dot {
        background: var(--ht-success);
      }

      .t-skipped .dot {
        background: var(--ht-warning);
      }

      .t-missed .dot {
        background: var(--ht-danger);
      }

      .t-started .dot,
      .t-advanced .dot {
        background: var(--ht-accent);
      }

      .event-text {
        display: grid;
        min-width: 0;
      }

      .event-title,
      .event-sub {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .event-title {
        font-weight: 600;
      }

      .event-sub,
      .event-side {
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .event-side {
        display: grid;
        justify-items: end;
      }

      .on-time {
        color: var(--ht-success);
      }

      .late {
        color: var(--ht-warning);
      }

      .note {
        padding: 24px 8px;
        color: var(--ht-muted);
        text-align: center;
      }

      .err {
        color: var(--ht-danger);
      }

      .more {
        width: 100%;
        margin-top: 8px;
      }
    `];lastFingerprint="";request=0;epoch=0;refreshQueued=!1;paging=!1;scrolled=!1;constructor(){super();this.state=null,this.filter="",this.events=[],this.stats=null,this.loading=!0,this.more=!1,this.error=null,this.day=null}updated(e){let t=Um(this.state);if(e.has("hass")&&!e.get("hass"))this.lastFingerprint=t,this.load(!0);else if(e.has("filter"))this.lastFingerprint=t,this.load(!0);else if(e.has("state")&&t!==this.lastFingerprint)this.lastFingerprint=t,this.load(!1);if(this.stats&&!this.scrolled){let n=this.renderRoot.querySelector(".scroller");if(n)n.scrollLeft=n.scrollWidth,this.scrolled=!0}}get taskFilter(){return this.filter===""?void 0:this.filter}async load(e){if(e)this.epoch+=1,this.loading=!0,this.refreshQueued=!1;else if(this.loading){this.refreshQueued=!0;return}this.request+=1;let{request:t}=this;this.error=null;try{let[r,n]=await Promise.all([mn(this.hass,{task_id:this.taskFilter,limit:Fr}),so(this.hass,{task_id:this.taskFilter,days:zm})]);if(t!==this.request)return;if(this.events=e?r:Xa(this.events,r),this.stats=n,e)this.more=r.length>=Fr}catch(r){if(t===this.request)this.error=ve(r)}finally{if(t===this.request){if(this.loading=!1,this.refreshQueued)this.refreshQueued=!1,this.load(!1)}}}async loadMore(){let e=this.events.at(-1)?.ts;if(!e||this.loading||this.paging)return;let{epoch:t}=this;this.paging=!0;try{let r=await mn(this.hass,{task_id:this.taskFilter,limit:Fr,before:e});if(t!==this.epoch)return;this.events=Xa(this.events,r),this.more=r.length>=Fr}catch(r){if(t===this.epoch)this.error=ve(r)}finally{this.paging=!1}}renderStats(e,t){let r=t.t("stats_no_data"),n=e?.on_time_rate,s=[["current",e?t.number(e.current_streak):r,t.t("stats_current_streak")],["best",e?t.number(e.best_streak):r,t.t("stats_best_streak")],["on-time",n===null||n===void 0?r:t.percent(n),t.t("stats_on_time")],["completed",e?t.number(e.completed):r,t.t("stats_completed")],["skipped",e?t.number(e.skipped+e.missed):r,`${t.t("stats_skipped")} / ${t.t("stats_missed")}`]];return g`${s.map(([a,l,u])=>g`<div class="stat" data-stat=${a}><b>${l}</b><span>${u}</span></div>`)}`}dayText(e,t){let r=t.shortDate(ko(e.date,ye(this.hass)));if(e.completed+e.skipped+e.missed===0)return t.t("history_day_empty",{date:r});return t.t("history_day",{date:r,completed:e.completed,skipped:e.skipped,missed:e.missed})}dayClass(e){let t=e.completed===0&&e.trouble;return`day l${e.level} ${e.trouble?"trouble":""} ${t?"bad":""}`}renderGrid(e,t){let{days:r}=Eo(e?.per_day??[]),n=r.find((s)=>s.date===this.day);return g`<div class="panel grid-panel">
      <h3>${t.t("history_window")}</h3>
      <div class="scroller">
        <div class="grid" data-part="grid">
          ${r.map((s)=>{let a=this.dayText(s,t);return g`<button
              class=${this.dayClass(s)}
              style="grid-column:${s.column+1};grid-row:${s.row+1}"
              data-day=${s.date}
              aria-label=${a}
              aria-pressed=${s.date===this.day?"true":"false"}
              @click=${()=>{this.day=s.date}}
            >
              <i></i>
            </button>`})}
        </div>
      </div>
      <div class="caption" data-part="caption" role="status">
        ${n?this.dayText(n,t):t.t("history_day_hint")}
      </div>
    </div>`}renderEvent(e,t){let r=t.t(`event_${e.type}`);return g`<div class="event t-${e.type}" data-event=${e.id}>
      <span class="dot"></span>
      <div class="event-text">
        <span class="event-title">${e.task_title}</span>
        <span class="event-sub">
          ${e.stage_title?t.t("history_stage",{event:r,stage:e.stage_title}):r}
          · ${t.t(`source_${e.source}`)}
        </span>
      </div>
      <div class="event-side">
        <span>${t.time(e.ts)}</span>
        ${e.on_time===null?k:g`<span class=${e.on_time?"on-time":"late"}
                >${t.t(e.on_time?"on_time":"late")}</span
              >`}
      </div>
    </div>`}renderTimeline(e){if(this.loading&&this.events.length===0)return g`<div class="panel">
        <div class="note" aria-busy="true">${e.t("loading")}</div>
      </div>`;if(this.events.length===0)return g`<div class="panel">
        ${this.error===null?g`<div class="note" data-part="empty">${e.t("history_empty")}</div>`:k}
      </div>`;let t=new Map;for(let r of this.events){let n=e.date(r.ts);t.set(n,[...t.get(n)??[],r])}return g`<div class="panel" data-part="timeline">
      ${te([...t.entries()],([r])=>r,([r,n])=>g`<div class="group">${r}</div>
            ${te(n,(s)=>s.id,(s)=>this.renderEvent(s,e))}`)}
      ${this.more?g`<button
              class="ht-btn more"
              data-action="more"
              @click=${()=>{this.loadMore()}}
            >
              ${e.t("action_load_more")}
            </button>`:k}
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return k;let r=J(e);return g`<div class="top">
        <label class="ht-label filter">
          ${r.t("field_filter_task")}
          <select
            class="ht-input"
            data-field="filter"
            @change=${(n)=>{let{target:s}=n;if(s instanceof HTMLSelectElement)this.filter=s.value}}
          >
            <option value="" ?selected=${this.filter===""}>${r.t("history_all_tasks")}</option>
            ${(t?.tasks??[]).map((n)=>g`<option value=${n.id} ?selected=${this.filter===n.id}>
                  ${n.title}
                </option>`)}
          </select>
        </label>
        ${this.renderStats(this.stats,r)}
      </div>
      ${this.error===null?k:g`<p class="err" role="alert">
              ${r.t("error_generic",{message:this.error})}
            </p>`}
      <div class="columns">${this.renderGrid(this.stats,r)} ${this.renderTimeline(r)}</div>`}}var Ja=["today","tasks","history"];function qm(e){let t=(e??"").replace(/^\//,"").split("/")[0];return Ja.find((r)=>r===t)??"today"}class $i extends z{static properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0}};static styles=[ie,Ve,$e,F`
      :host {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100vh;
        height: 100dvh;
        box-sizing: border-box;
        background: var(--primary-background-color, #111);
      }

      header {
        display: flex;
        flex: none;
        align-items: center;
        gap: 8px;
        height: 56px;
        padding: 0 12px;
        background: var(--app-header-background-color, var(--ht-surface));
        color: var(--app-header-text-color, var(--ht-fg));
      }

      h1 {
        margin: 0 8px 0 0;
        font-size: 1.25rem;
        font-weight: 500;
      }

      .menu {
        width: 44px;
        padding: 0;
        border: 0;
        color: inherit;
      }

      .tabs {
        display: flex;
        flex: 1;
        justify-content: flex-end;
        gap: 4px;
      }

      .tab {
        appearance: none;
        min-width: 44px;
        height: 44px;
        padding: 0 16px;
        border: 0;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: transparent;
        color: inherit;
        font: inherit;
        font-weight: 500;
        opacity: 0.75;
        cursor: pointer;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
      }

      .tab[aria-selected='true'] {
        background: var(--ht-accent);
        color: var(--ht-on-accent);
        opacity: 1;
      }

      .tab:focus-visible {
        outline: 2px solid var(--ht-fg);
        outline-offset: -2px;
      }

      main {
        flex: 1;
        min-height: 0;
        padding: 12px;
        overflow-y: auto;
        overscroll-behavior-y: contain;
      }

      .message {
        display: grid;
        justify-items: center;
        gap: 12px;
        padding: 48px 16px;
        text-align: center;
      }

      .message p {
        margin: 0;
        color: var(--ht-muted);
      }

      .offline {
        position: absolute;
        z-index: 3;
        bottom: 72px;
        left: 50%;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-warning);
        font-size: 0.875rem;
        white-space: nowrap;
        transform: translateX(-50%);
      }

      @media (max-width: 480px) {
        h1 {
          display: none;
        }

        .tab {
          padding: 0 10px;
        }
      }
    `];live;tasksMounted=!1;todayMounted=!1;constructor(){super();this.narrow=!1,this.tab="today",this.live=new Lt(this,()=>this.hass)}willUpdate(e){if(e.has("hass"))this.live.sync();if(e.has("route"))this.tab=qm(this.route?.path)}select(e){this.tab=e;let t=this.route?.prefix??"/housetide";history.replaceState(history.state,"",`${t}/${e}`)}toggleMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};renderToday(e){if(this.tab==="today")this.todayMounted=!0;if(!this.todayMounted)return k;let{state:t,now:r}=this.live;return g`<housetide-today
      .hass=${e}
      .state=${t}
      .now=${r}
      .animations=${!mr()}
      .active=${this.tab==="today"}
      ?hidden=${this.tab!=="today"}
    ></housetide-today>`}renderHistory(e){if(this.tab!=="history")return k;return g`<housetide-history .hass=${e} .state=${this.live.state}></housetide-history>`}renderTasks(e){if(this.tab==="tasks")this.tasksMounted=!0;if(!this.tasksMounted)return k;let{state:t,now:r}=this.live;return g`<housetide-tasks
      .hass=${e}
      .state=${t}
      .now=${r}
      ?hidden=${this.tab!=="tasks"}
    ></housetide-tasks>`}render(){let{hass:e}=this;if(!e)return k;let t=J(e),r=this.narrow||e.dockedSidebar==="always_hidden",n=this.live.failed&&!this.live.state;return g`<header>
        ${r?g`<button
                class="ht-btn menu"
                aria-label=${t.t("action_menu")}
                data-action="menu"
                @click=${this.toggleMenu}
              >
                ${U("menu")}
              </button>`:k}
        <h1>${t.t("app_title")}</h1>
        <div class="tabs" role="tablist">
          ${Ja.map((s)=>g`<button
                class="tab"
                role="tab"
                data-tab=${s}
                aria-selected=${this.tab===s?"true":"false"}
                @click=${()=>{this.select(s)}}
              >
                ${t.t(`tab_${s}`)}
              </button>`)}
        </div>
      </header>
      <main>
        ${n?g`<div class="message" role="alert" data-part="error">
                <strong>${t.t("card_error")}</strong>
                <p>${t.t("card_error_hint")}</p>
                <button
                  class="ht-btn"
                  data-action="retry"
                  @click=${()=>{this.live.retry()}}
                >
                  ${t.t("action_retry")}
                </button>
              </div>`:g`${this.renderToday(e)} ${this.renderHistory(e)} ${this.renderTasks(e)}`}
      </main>
      ${ze(e)?g`<div class="offline" role="status" data-part="offline">
              ${U("alert")}${t.t("disconnected")}
            </div>`:k}`}}var Bm=["laundry","pills","plant","teeth","bed","dishes","trash","vacuum","pet","bathroom","fridge","window","water","one_off"],el=36500;class _i extends z{static properties={hass:{attribute:!1},state:{attribute:!1},now:{attribute:!1},editing:{state:!0},templates:{state:!0},templateError:{state:!0},retention:{state:!0},settingsError:{state:!0},settingsBusy:{state:!0}};static styles=[ie,Ve,$e,Re,F`
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none;
      }

      h2 {
        margin: 0 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      section {
        margin-bottom: 18px;
      }

      .templates {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 8px;
      }

      .template {
        appearance: none;
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        min-height: 64px;
        padding: 8px;
        border: 0;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
        color: var(--ht-fg);
        font: inherit;
        font-weight: 600;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .thumb {
        overflow: hidden;
        width: 48px;
        height: 48px;
        border-radius: calc(var(--ht-radius) * 0.7);
        corner-shape: var(--ht-corner);
      }

      .list {
        overflow: hidden;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .task {
        appearance: none;
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr) auto 20px;
        align-items: center;
        gap: 12px;
        width: 100%;
        height: 72px;
        padding: 0 12px;
        border: 0;
        border-top: 1px solid var(--ht-divider);
        background: transparent;
        color: var(--ht-fg);
        font: inherit;
        text-align: left;
        cursor: pointer;
        touch-action: manipulation;
      }

      .task:first-child {
        border-top: 0;
      }

      .task:focus-visible,
      .template:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: -2px;
      }

      .text {
        display: grid;
        min-width: 0;
      }

      .title,
      .sub {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .title {
        font-weight: 600;
      }

      .sub {
        color: var(--ht-muted);
        font-size: 0.875rem;
      }

      .chip {
        padding: 2px 10px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface-alt);
        color: var(--ht-muted);
        font-size: 0.8125rem;
      }

      .chip.is-due,
      .chip.is-in_progress {
        color: var(--ht-accent);
      }

      .chip.is-overdue {
        color: var(--ht-danger);
      }

      .chip.is-clean {
        color: var(--ht-success);
      }

      .note {
        margin: 0 0 12px;
        color: var(--ht-muted);
      }

      .empty {
        padding: 24px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
        color: var(--ht-muted);
        text-align: center;
      }

      .err {
        color: var(--ht-danger);
        font-size: 0.875rem;
      }

      .settings {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 12px;
        padding: 12px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .settings label {
        flex: 1 1 200px;
      }

      .editor-title {
        display: flex;
        align-items: center;
        min-height: 44px;
        margin: 0 0 8px;
        color: var(--ht-fg);
        font-size: 1.25rem;
      }
    `];opening=0;constructor(){super();this.state=null,this.now=new Date,this.editing=null,this.templates=null,this.templateError=!1,this.retention=null,this.settingsError=null,this.settingsBusy=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||this.editing)return!0;let t=e.get("hass");return!fr(t)||Se(this.hass,t)}updated(e){if(e.has("hass")&&!this.templates&&!this.templateError&&this.isAdmin)this.loadTemplates()}get isAdmin(){return this.hass.user?.is_admin===!0}async loadTemplates(){this.templateError=!1;try{this.templates=await gn(this.hass)}catch{this.templateError=!0}}async openTemplate(e,t,r){this.opening+=1;let{opening:n}=this,s=await gn(this.hass).catch(()=>null);if(s)this.templates=s;if(n!==this.opening||this.editing)return;this.start(e,s?.[e]??t,r)}start(e,t,r){let n=Do(e,t,r);this.editing={source:n,title:r.t("action_new_task")}}open(e){this.editing={source:e,title:e.title}}async saveSettings(e){this.settingsBusy=!0,this.settingsError=null;try{await uo(this.hass,{history_retention_days:e}),this.retention=null}catch(t){this.settingsError=ve(t)}finally{this.settingsBusy=!1}}renderTemplates(e){if(!this.isAdmin)return k;let t=this.templates,r=t?Bm.filter((n)=>Object.hasOwn(t,n)):[];return g`<section>
      <h2>${e.t("action_new_task")} · ${e.t("template_prompt")}</h2>
      ${this.templateError?g`<p class="err" role="alert">${e.t("error_templates")}</p>
              <button
                class="ht-btn"
                data-action="retry-templates"
                @click=${()=>{this.loadTemplates()}}
              >
                ${e.t("action_retry")}
              </button>`:k}
      <div class="templates">
        ${r.map((n)=>{let s=t?.[n];if(!s)return k;return g`<button
            class="template"
            data-template=${n}
            @click=${()=>{this.openTemplate(n,s,e)}}
          >
            <span class="thumb">
              ${ne({name:s.scene,state:"accumulating",fill:0.7,stink:0,progress:0},{animations:!1})}
            </span>
            <span>${wn(n,e)??s.title}</span>
          </button>`})}
      </div>
    </section>`}renderRow(e,t,r){let n=t?.status??"disabled";return g`<button
      class="task"
      data-task=${e.id}
      @click=${()=>{this.open(e)}}
    >
      <span class="thumb">
        ${ne(t?.scene??{name:e.scene,state:"resting",fill:0,stink:0,progress:0},{animations:!1})}
      </span>
      <span class="text">
        <span class="title">${e.title}</span>
        <span class="sub">${r.scheduleText(e.schedule)}</span>
      </span>
      <span class="chip is-${n}">${r.t(`status_${n}`)}</span>
      ${U("chevron")}
    </button>`}renderList(e,t){let r=new Map(e.views.map((n)=>[n.task_id,n]));return g`<section>
      <h2>${t.t("tab_tasks")}</h2>
      ${e.tasks.length===0?g`<div class="empty" data-part="empty">${t.t("tasks_empty")}</div>`:g`<div class="list">
              ${te(e.tasks,(n)=>n.id,(n)=>this.renderRow(n,r.get(n.id),t))}
            </div>`}
    </section>`}renderSettings(e,t){let r=this.retention??String(e.settings.history_retention_days),n=/^\d+$/.test(r.trim())?Number(r.trim()):Number.NaN,s=n>el,a=!Number.isInteger(n)||n<1||s,l=this.retention!==null&&n!==e.settings.history_retention_days;return g`<section>
      <h2>${t.t("settings_title")}</h2>
      <div class="settings">
        <label class="ht-label">
          ${t.t("field_retention")}
          <input
            class="ht-input"
            data-field="retention"
            inputmode="numeric"
            .value=${r}
            ?disabled=${!this.isAdmin}
            aria-invalid=${a?"true":"false"}
            @input=${(u)=>{let{target:p}=u;if(p instanceof HTMLInputElement)this.retention=p.value}}
          />
          ${a?g`<span class="err" role="alert"
                  >${s?t.t("error_max",{max:el}):t.t("error_min",{min:1})}</span
                >`:k}
        </label>
        ${this.isAdmin?g`<button
                class="ht-btn ht-btn-primary"
                data-action="save-settings"
                ?disabled=${a||!l||this.settingsBusy}
                @click=${()=>{this.saveSettings(n)}}
              >
                ${t.t("action_save")}
              </button>`:k}
        ${this.settingsError===null?k:g`<span class="err" role="alert"
                >${t.t("error_generic",{message:this.settingsError})}</span
              >`}
      </div>
    </section>`}render(){let{hass:e,state:t}=this,r=J(e);if(this.editing)return g`<h2 class="editor-title">${this.editing.title}</h2>
        <housetide-editor
          .hass=${e}
          .source=${this.editing.source}
          .now=${this.now}
          ?readonly=${!this.isAdmin}
          @ht-close=${()=>{this.editing=null}}
        ></housetide-editor>`;if(!t)return g`<p class="note" aria-busy="true">${r.t("loading")}</p>`;return g`${this.isAdmin?k:g`<p class="note" data-part="read-only">${r.t("tasks_read_only")}</p>`}
    ${this.renderTemplates(r)} ${this.renderList(t,r)}
    ${this.renderSettings(t,r)}`}}var Wm=8,tl="housetide.today.layout";function jm(){try{return localStorage.getItem(tl)==="list"?"list":"scenes"}catch{return"scenes"}}function Ym(e){try{localStorage.setItem(tl,e)}catch{return}}class wi extends z{static properties={hass:{attribute:!1,hasChanged:Se},state:{attribute:!1},now:{attribute:!1},animations:{attribute:!1},active:{attribute:!1},layout:{state:!0}};static styles=[ie,$e,Re,Qr,F`
      :host {
        display: block;
      }

      :host([hidden]) {
        display: none;
      }

      .summary {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 12px;
        min-height: 28px;
        margin-bottom: 10px;
      }

      .date {
        color: var(--ht-muted);
      }

      .count {
        font-size: 1.125rem;
        font-weight: 600;
      }

      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 10px;
      }

      .side {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .views {
        display: inline-flex;
        gap: 2px;
        padding: 2px;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .view {
        appearance: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        height: 36px;
        padding: 0;
        border: none;
        border-radius: 999px;
        corner-shape: var(--ht-corner);
        background: transparent;
        color: var(--ht-muted);
        cursor: pointer;
        touch-action: manipulation;
      }

      .view[aria-pressed='true'] {
        background: var(--ht-accent);
        color: var(--ht-on-accent);
      }

      .view:focus-visible {
        outline: 2px solid var(--ht-accent);
        outline-offset: 2px;
      }

      .clear {
        display: grid;
        justify-items: center;
        gap: 4px;
        padding: 12px 0 24px;
        text-align: center;
      }

      .clear .art {
        width: min(260px, 50vh);
      }

      .clear h2 {
        margin: 12px 0 0;
        font-size: 1.5rem;
      }

      .clear p {
        margin: 0;
        color: var(--ht-muted);
      }

      h3 {
        margin: 20px 0 8px;
        color: var(--ht-muted);
        font-size: 0.875rem;
        font-weight: 600;
      }

      .later {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
        gap: 8px;
      }

      .later-item {
        display: grid;
        grid-template-columns: 48px minmax(0, 1fr);
        align-items: center;
        gap: 10px;
        height: 64px;
        padding: 0 8px;
        border-radius: var(--ht-radius);
        corner-shape: var(--ht-corner);
        background: var(--ht-surface);
      }

      .later-item .thumb {
        width: 48px;
        height: 48px;
      }

      .later-item .due {
        font-size: 0.8125rem;
      }
    `];tracker;constructor(){super();this.state=null,this.now=new Date,this.animations=!0,this.active=!0,this.layout=jm(),this.tracker=new Dt(this,()=>this.hass)}shouldUpdate(){return this.active}choose(e){this.layout=e,Ym(e)}renderViews(e){let t=(r,n,s)=>g`<button
        class="view"
        data-layout=${r}
        aria-label=${s}
        aria-pressed=${this.layout===r?"true":"false"}
        @click=${()=>{this.choose(r)}}
      >
        ${U(n)}
      </button>`;return g`<div class="views" role="group" aria-label=${e.i18n.t("config_layout")}>
      ${t("scenes","tiles",e.i18n.t("config_layout_scenes"))}
      ${t("list","list",e.i18n.t("config_layout_list"))}
    </div>`}later(e,t){let r=new Set(t.map((n)=>n.task_id));return e.filter((n)=>!r.has(n.task_id)&&n.status==="upcoming").toSorted((n,s)=>gr(rt(n),rt(s))).slice(0,Wm)}renderLater(e,t){if(e.length===0)return k;return g`<h3>${t.i18n.t("today_later")}</h3>
      <div class="later">
        ${te(e,(r)=>r.task_id,(r)=>g`<div class="later-item" data-later=${r.task_id}>
              <div class="thumb">
                ${ne(r.scene,{animations:!1,day:t.day})}
              </div>
              <div class="text">
                <div class="title">${r.title}</div>
                <div class="due">${t.i18n.dueText(r,t.now)}</div>
              </div>
            </div>`)}
      </div>`}renderClear(e){return g`<div class="clear" data-part="clear">
      <div class="art">
        ${ne({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:e.animations})}
      </div>
      <h2>${e.i18n.t("today_clear_title")}</h2>
      <p>${e.i18n.t("card_empty")}</p>
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return k;if(!t)return this.layout==="list"?g`<div class="list" aria-busy="true">${nr(4,"row")}</div>`:g`<div class="tiles" aria-busy="true">${nr(4,"tile")}</div>`;let r=J(e),n={i18n:r,tracker:this.tracker,now:this.now,animations:this.animations,day:Ct(this.now,ye(e)),offline:ze(e)},s=Or(t.views,{show:"today",tracker:this.tracker}),a=s.filter((l)=>gt(l)).length;return g`<div class="summary">
        <span class="count">${a>0?r.plural("tasks_due",a):k}</span>
        <span class="side">
          <span class="date">${r.date(this.now)}</span>
          ${this.renderViews(n)}
        </span>
      </div>
      ${s.length===0?this.renderClear(n):g`<div class=${this.layout==="list"?"list":"tiles"}>
              ${te(s,(l)=>l.task_id,(l)=>this.layout==="list"?Ir(l,n,{skip:!0}):Nr(l,n,{skip:!0}))}
            </div>`}
      ${this.renderLater(this.later(t.views,s),n)}`}}var Km={"housetide-card":gi,"housetide-panel":$i,"housetide-today":wi,"housetide-tasks":_i,"housetide-editor":bi,"housetide-history":ki};for(let[e,t]of Object.entries(Km))if(!customElements.get(e))customElements.define(e,t);window.customCards??=[];if(!window.customCards.some((e)=>e.type==="housetide-card"))window.customCards.push({type:"housetide-card",name:"Housetide",description:"Recurring household tasks with delightful little scenes.",preview:!0});
