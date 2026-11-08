var st=globalThis,Mt=st.ShadowRoot&&(st.ShadyCSS===void 0||st.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,At=Symbol(),Er=new WeakMap;class Ct{constructor(e,t,r){if(this._$cssResult$=!0,r!==At)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(Mt&&e===void 0){let r=t!==void 0&&t.length===1;if(r)e=Er.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),r)Er.set(t,e)}}return e}toString(){return this.cssText}}var vs=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},ks=(e)=>new Ct(typeof e==="string"?e:String(e),void 0,At),A=(e,...t)=>{let r=e.length===1?e[0]:t.reduce((n,s,i)=>n+vs(s)+e[i+1],e[0]);return new Ct(r,e,At)},Mr=(e,t)=>{if(Mt)e.adoptedStyleSheets=t.map((r)=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(let r of t){let n=document.createElement("style"),s=st.litNonce;if(s!==void 0)n.setAttribute("nonce",s);n.textContent=r.cssText,e.appendChild(n)}},$s=(e)=>{let t="";for(let r of e.cssRules)t+=r.cssText;return ks(t)},Pt=Mt?(e)=>e:(e)=>e instanceof CSSStyleSheet?$s(e):e;var{is:xs,defineProperty:ws,getOwnPropertyDescriptor:Ar,getOwnPropertyNames:Ts,getOwnPropertySymbols:Ss,getPrototypeOf:Cr}=Object,Es=!1,L=globalThis;if(Es)L.customElements??=customElements;var I=!0,j,Pr=L.trustedTypes,Ms=Pr?Pr.emptyScript:"",Rr=I?L.reactiveElementPolyfillSupportDevMode:L.reactiveElementPolyfillSupport;if(I)L.litIssuedWarnings??=new Set,j=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!L.litIssuedWarnings.has(t)&&!L.litIssuedWarnings.has(e))console.warn(t),L.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(j("dev-mode","Lit is in dev mode. Not recommended for production!"),L.ShadyDOM?.inUse&&Rr===void 0)j("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var As=I?(e)=>{if(!L.emitLitDebugLogEvents)return;L.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,Ee=(e,t)=>e,Dt={toAttribute(e,t){switch(t){case Boolean:e=e?Ms:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let r=e;switch(t){case Boolean:r=e!==null;break;case Number:r=e===null?null:Number(e);break;case Object:case Array:try{r=JSON.parse(e)}catch(n){r=null}break}return r}},Hr=(e,t)=>!xs(e,t),Dr={attribute:!0,type:String,converter:Dt,reflect:!1,useDefault:!1,hasChanged:Hr};Symbol.metadata??=Symbol("metadata");L.litPropertyMetadata??=new WeakMap;class F extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=Dr){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let r=I?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),n=this.getPropertyDescriptor(e,r,t);if(n!==void 0)ws(this.prototype,e,n)}}static getPropertyDescriptor(e,t,r){let{get:n,set:s}=Ar(this.prototype,e)??{get(){return this[t]},set(i){this[t]=i}};if(I&&n==null){if("value"in(Ar(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);j("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:n,set(i){let a=n?.call(this);s?.call(this,i),this.requestUpdate(e,a,r)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Dr}static __prepare(){if(this.hasOwnProperty(Ee("elementProperties",this)))return;let e=Cr(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ee("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(Ee("properties",this))){let t=this.properties,r=[...Ts(t),...Ss(t)];for(let n of r)this.createProperty(n,t[n])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[r,n]of t)this.elementProperties.set(r,n)}this.__attributeToPropertyMap=new Map;for(let[t,r]of this.elementProperties){let n=this.__attributeNameForProperty(t,r);if(n!==void 0)this.__attributeToPropertyMap.set(n,t)}if(this.elementStyles=this.finalizeStyles(this.styles),I){if(this.hasOwnProperty("createProperty"))j("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))j("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let r=new Set(e.flat(1/0).reverse());for(let n of r)t.unshift(Pt(n))}else if(e!==void 0)t.push(Pt(e));return t}static __attributeNameForProperty(e,t){let r=t.attribute;return r===!1?void 0:typeof r==="string"?r:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let r of t.keys())if(this.hasOwnProperty(r))e.set(r,this[r]),delete this[r];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Mr(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,r){this._$attributeToProperty(e,r)}__propertyToAttribute(e,t){let n=this.constructor.elementProperties.get(e),s=this.constructor.__attributeNameForProperty(e,n);if(s!==void 0&&n.reflect===!0){let a=(n.converter?.toAttribute!==void 0?n.converter:Dt).toAttribute(t,n.type);if(I&&this.constructor.enabledWarnings.includes("migration")&&a===void 0)j("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,a==null)this.removeAttribute(s);else this.setAttribute(s,a);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let r=this.constructor,n=r.__attributeToPropertyMap.get(e);if(n!==void 0&&this.__reflectingProperty!==n){let s=r.getPropertyOptions(n),i=typeof s.converter==="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Dt;this.__reflectingProperty=n;let a=i.fromAttribute(t,s.type);this[n]=a??this.__defaultValues?.get(n)??a,this.__reflectingProperty=null}}requestUpdate(e,t,r,n=!1,s){if(e!==void 0){if(I&&e instanceof Event)j("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let i=this.constructor;if(n===!1)s=this[e];if(r??=i.getPropertyOptions(e),(r.hasChanged??Hr)(s,t)||r.useDefault&&r.reflect&&s===this.__defaultValues?.get(e)&&!this.hasAttribute(i.__attributeNameForProperty(e,r)))this._$changeProperty(e,t,r);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:r,reflect:n,wrapped:s},i){if(r&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,i??t??this[e]),s!==!0||i!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!r)t=void 0;this._$changedProperties.set(e,t)}if(n===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(I&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")j("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(As?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),I){let s=[...this.constructor.elementProperties.keys()].filter((i)=>this.hasOwnProperty(i)&&(i in Cr(this)));if(s.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${s.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[n,s]of this.__instanceProperties)this[n]=s;this.__instanceProperties=void 0}let r=this.constructor.elementProperties;if(r.size>0)for(let[n,s]of r){let{wrapped:i}=s,a=this[n];if(i===!0&&!this._$changedProperties.has(n)&&a!==void 0)this._$changeProperty(n,void 0,s,a)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((r)=>r.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(r){throw e=!1,this.__markUpdated(),r}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),I&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))j("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}F.elementStyles=[];F.shadowRootOptions={mode:"open"};F[Ee("elementProperties",F)]=new Map;F[Ee("finalized",F)]=new Map;Rr?.({ReactiveElement:F});if(I){F.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(Ee("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};F.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},F.disableWarning=function(t){e(this);let r=this.enabledWarnings.indexOf(t);if(r>=0)this.enabledWarnings.splice(r,1)}}(L.reactiveElementVersions??=[]).push("2.1.2");if(I&&L.reactiveElementVersions.length>1)queueMicrotask(()=>{j("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var U=globalThis,w=(e)=>{if(!U.emitLitDebugLogEvents)return;U.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},Cs=0,Be;U.litIssuedWarnings??=new Set,Be=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!U.litIssuedWarnings.has(t)&&!U.litIssuedWarnings.has(e))console.warn(t),U.litIssuedWarnings.add(t)},queueMicrotask(()=>{Be("dev-mode","Lit is in dev mode. Not recommended for production!")});var Z=U.ShadyDOM?.inUse&&U.ShadyDOM?.noPatch===!0?U.ShadyDOM.wrap:(e)=>e,it=U.trustedTypes,Or=it?it.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,Ps=(e)=>e,ct=(e,t,r)=>Ps,Ds=(e)=>{if(xe!==ct)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");xe=e},Rs=()=>{xe=ct},Lt=(e,t,r)=>xe(e,t,r),Nt="$lit$",ne=`lit$${Math.random().toFixed(9).slice(2)}$`,It="?"+ne,Hs=`<${It}>`,$e=document,qe=()=>$e.createComment(""),Ke=(e)=>e===null||typeof e!="object"&&typeof e!="function",Ft=Array.isArray,zr=(e)=>Ft(e)||typeof e?.[Symbol.iterator]==="function",Rt=`[ 	
\f\r]`,Os=`[^ 	
\f\r"'\`<>=]`,Vs=`[^\\s"'>=/]`,ze=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Vr=1,Ht=2,Ls=3,Lr=/-->/g,Nr=/>/g,ue=new RegExp(`>|${Rt}(?:(${Vs}+)(${Rt}*=${Rt}*(?:${Os}|("|')|))|$)`,"g"),Ns=0,Ir=1,Is=2,Fr=3,Ot=/'/g,Vt=/"/g,Wr=/^(?:script|style|textarea|title)$/i,Br=1,at=2,ot=3,Ut=1,lt=2,Fs=3,Us=4,zs=5,zt=6,Ws=7,Wt=(e)=>(t,...r)=>{if(t.some((n)=>n===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(r.some((n)=>n?._$litStatic$))Be("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:r}},c=Wt(Br),d=Wt(at),so=Wt(ot),Y=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),Ur=new WeakMap,ke=$e.createTreeWalker($e,129),xe=ct;function qr(e,t){if(!Ft(e)||!e.hasOwnProperty("raw")){let r="invalid template strings array";throw r=`
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
`),Error(r)}return Or!==void 0?Or.createHTML(t):t}var Kr=(e,t)=>{let r=e.length-1,n=[],s=t===at?"<svg>":t===ot?"<math>":"",i,a=ze;for(let u=0;u<r;u++){let m=e[u],y=-1,_,k=0,h;while(k<m.length){if(a.lastIndex=k,h=a.exec(m),h===null)break;if(k=a.lastIndex,a===ze){if(h[Vr]==="!--")a=Lr;else if(h[Vr]!==void 0)a=Nr;else if(h[Ht]!==void 0){if(Wr.test(h[Ht]))i=new RegExp(`</${h[Ht]}`,"g");a=ue}else if(h[Ls]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(a===ue)if(h[Ns]===">")a=i??ze,y=-1;else if(h[Ir]===void 0)y=-2;else y=a.lastIndex-h[Is].length,_=h[Ir],a=h[Fr]===void 0?ue:h[Fr]==='"'?Vt:Ot;else if(a===Vt||a===Ot)a=ue;else if(a===Lr||a===Nr)a=ze;else a=ue,i=void 0}console.assert(y===-1||a===ue||a===Ot||a===Vt,"unexpected parse state B");let v=a===ue&&e[u+1].startsWith("/>")?" ":"";s+=a===ze?m+Hs:y>=0?(n.push(_),m.slice(0,y)+Nt+m.slice(y))+ne+v:m+ne+(y===-2?u:v)}let o=s+(e[r]||"<?>")+(t===at?"</svg>":t===ot?"</math>":"");return[qr(e,o),n]};class je{constructor({strings:e,["_$litType$"]:t},r){this.parts=[];let n,s=0,i=0,a=e.length-1,o=this.parts,[u,m]=Kr(e,t);if(this.el=je.createElement(u,r),ke.currentNode=this.el.content,t===at||t===ot){let y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}while((n=ke.nextNode())!==null&&o.length<a){if(n.nodeType===1){{let y=n.localName;if(/^(?:textarea|template)$/i.test(y)&&n.innerHTML.includes(ne)){let _=`Expressions are not supported inside \`${y}\` elements. See https://lit.dev/msg/expression-in-${y} for more information.`;if(y==="template")throw Error(_);else Be("",_)}}if(n.hasAttributes()){for(let y of n.getAttributeNames())if(y.endsWith(Nt)){let _=m[i++],h=n.getAttribute(y).split(ne),v=/([.?@])?(.*)/.exec(_);o.push({type:Ut,index:s,name:v[2],strings:h,ctor:v[1]==="."?qt:v[1]==="?"?Kt:v[1]==="@"?jt:Ae}),n.removeAttribute(y)}else if(y.startsWith(ne))o.push({type:zt,index:s}),n.removeAttribute(y)}if(Wr.test(n.tagName)){let y=n.textContent.split(ne),_=y.length-1;if(_>0){n.textContent=it?it.emptyScript:"";for(let k=0;k<_;k++)n.append(y[k],qe()),ke.nextNode(),o.push({type:lt,index:++s});n.append(y[_],qe())}}}else if(n.nodeType===8)if(n.data===It)o.push({type:lt,index:s});else{let _=-1;while((_=n.data.indexOf(ne,_+1))!==-1)o.push({type:Ws,index:s}),_+=ne.length-1}s++}if(m.length!==i)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");w&&w({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let r=$e.createElement("template");return r.innerHTML=e,r}}function we(e,t,r=e,n){if(t===Y)return t;let s=n!==void 0?r.__directives?.[n]:r.__directive,i=Ke(t)?void 0:t._$litDirective$;if(s?.constructor!==i){if(s?._$notifyDirectiveConnectionChanged?.(!1),i===void 0)s=void 0;else s=new i(e),s._$initialize(e,r,n);if(n!==void 0)(r.__directives??=[])[n]=s;else r.__directive=s}if(s!==void 0)t=we(e,s._$resolve(e,t.values),s,n);return t}class Bt{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:r}=this._$template,n=(e?.creationScope??$e).importNode(t,!0);ke.currentNode=n;let s=ke.nextNode(),i=0,a=0,o=r[0];while(o!==void 0){if(i===o.index){let u;if(o.type===lt)u=new Me(s,s.nextSibling,this,e);else if(o.type===Ut)u=new o.ctor(s,o.name,o.strings,this,e);else if(o.type===zt)u=new Zt(s,this,e);this._$parts.push(u),o=r[++a]}if(i!==o?.index)s=ke.nextNode(),i++}return ke.currentNode=$e,n}_update(e){let t=0;for(let r of this._$parts){if(r!==void 0)if(w&&w({kind:"set part",part:r,value:e[t],valueIndex:t,values:e,templateInstance:this}),r.strings!==void 0)r._$setValue(e,r,t),t+=r.strings.length-2;else r._$setValue(e[t]);t++}}}class Me{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,r,n){this.type=lt,this._$committedValue=p,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=r,this.options=n,this.__isConnected=n?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=Z(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=we(this,e,t),Ke(e)){if(e===p||e==null||e===""){if(this._$committedValue!==p)w&&w({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=p}else if(e!==this._$committedValue&&e!==Y)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(zr(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return Z(Z(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),xe!==ct){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let r="Forbidden";if(t==="STYLE")r="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else r="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(r)}}w&&w({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==p&&Ke(this._$committedValue)){let t=Z(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=Lt(t,"data","property");e=this._textSanitizer(e),w&&w({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=$e.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=Lt(t,"data","property");e=this._textSanitizer(e),w&&w({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:r}=e,n=typeof r==="number"?this._$getTemplate(e):(r.el===void 0&&(r.el=je.createElement(qr(r.h,r.h[0]),this.options)),r);if(this._$committedValue?._$template===n)w&&w({kind:"template updating",template:n,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let s=new Bt(n,this),i=s._clone(this.options);w&&w({kind:"template instantiated",template:n,instance:s,parts:s._$parts,options:this.options,fragment:i,values:t}),s._update(t),w&&w({kind:"template instantiated and updated",template:n,instance:s,parts:s._$parts,options:this.options,fragment:i,values:t}),this._commitNode(i),this._$committedValue=s}}_$getTemplate(e){let t=Ur.get(e.strings);if(t===void 0)Ur.set(e.strings,t=new je(e));return t}_commitIterable(e){if(!Ft(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,r=0,n;for(let s of e){if(r===t.length)t.push(n=new Me(this._insert(qe()),this._insert(qe()),this,this.options));else n=t[r];n._$setValue(s),r++}if(r<t.length)this._$clear(n&&Z(n._$endNode).nextSibling,r),t.length=r}_$clear(e=Z(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let r=Z(e).nextSibling;Z(e).remove(),e=r}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class Ae{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,r,n,s){if(this.type=Ut,this._$committedValue=p,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=n,this.options=s,r.length>2||r[0]!==""||r[1]!=="")this._$committedValue=Array(r.length-1).fill(new String),this.strings=r;else this._$committedValue=p;this._sanitizer=void 0}_$setValue(e,t=this,r,n){let s=this.strings,i=!1;if(s===void 0){if(e=we(this,e,t,0),i=!Ke(e)||e!==this._$committedValue&&e!==Y,i)this._$committedValue=e}else{let a=e;e=s[0];let o,u;for(o=0;o<s.length-1;o++){if(u=we(this,a[r+o],t,o),u===Y)u=this._$committedValue[o];if(i||=!Ke(u)||u!==this._$committedValue[o],u===p)e=p;else if(e!==p)e+=(u??"")+s[o+1];this._$committedValue[o]=u}}if(i&&!n)this._commitValue(e)}_commitValue(e){if(e===p)Z(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=xe(this.element,this.name,"attribute");e=this._sanitizer(e??""),w&&w({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),Z(this.element).setAttribute(this.name,e??"")}}}class qt extends Ae{constructor(){super(...arguments);this.type=Fs}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=xe(this.element,this.name,"property");e=this._sanitizer(e),w&&w({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===p?void 0:e}}class Kt extends Ae{constructor(){super(...arguments);this.type=Us}_commitValue(e){w&&w({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==p),options:this.options}),Z(this.element).toggleAttribute(this.name,!!e&&e!==p)}}class jt extends Ae{constructor(e,t,r,n,s){super(e,t,r,n,s);if(this.type=zs,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=we(this,e,t,0)??p,e===Y)return;let r=this._$committedValue,n=e===p&&r!==p||e.capture!==r.capture||e.once!==r.once||e.passive!==r.passive,s=e!==p&&(r===p||n);if(w&&w({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:n,addListener:s,oldListener:r}),n)this.element.removeEventListener(this.name,this,r);if(s)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class Zt{constructor(e,t,r){this.element=e,this.type=zt,this._$disconnectableChildren=void 0,this._$parent=t,this.options=r}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){w&&w({kind:"commit to element binding",element:this.element,value:e,options:this.options}),we(this,e)}}var jr={_boundAttributeSuffix:Nt,_marker:ne,_markerMatch:It,_HTML_RESULT:Br,_getTemplateHtml:Kr,_TemplateInstance:Bt,_isIterable:zr,_resolveDirective:we,_ChildPart:Me,_AttributePart:Ae,_BooleanAttributePart:Kt,_EventPart:jt,_PropertyPart:qt,_ElementPart:Zt},Bs=U.litHtmlPolyfillSupportDevMode;Bs?.(je,Me);(U.litHtmlVersions??=[]).push("3.3.3");if(U.litHtmlVersions.length>1)queueMicrotask(()=>{Be("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var We=(e,t,r)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let n=Cs++,s=r?.renderBefore??t,i=s._$litPart$;if(w&&w({kind:"begin render",id:n,value:e,container:t,options:r,part:i}),i===void 0){let a=r?.renderBefore??null;s._$litPart$=i=new Me(t.insertBefore(qe(),a),a,void 0,r??{})}return i._$setValue(e),w&&w({kind:"end render",id:n,value:e,container:t,options:r,part:i}),i};We.setSanitizer=Ds,We.createSanitizer=Lt,We._testOnlyClearSanitizerFactoryDoNotCallOrElse=Rs;var qs=(e,t)=>e,Yt=!0,oe=globalThis,Zr;if(Yt)oe.litIssuedWarnings??=new Set,Zr=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!oe.litIssuedWarnings.has(t)&&!oe.litIssuedWarnings.has(e))console.warn(t),oe.litIssuedWarnings.add(t)};class P extends F{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=We(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return Y}}P._$litElement$=!0;P[qs("finalized",P)]=!0;oe.litElementHydrateSupport?.({LitElement:P});var Ks=Yt?oe.litElementPolyfillSupportDevMode:oe.litElementPolyfillSupport;Ks?.({LitElement:P});(oe.litElementVersions??=[]).push("4.2.2");if(Yt&&oe.litElementVersions.length>1)queueMicrotask(()=>{Zr("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var dt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},ut=(e)=>(...t)=>({["_$litDirective$"]:e,values:t});class Ze{constructor(e){}get _$isConnected(){return this._$parent._$isConnected}_$initialize(e,t,r){this.__part=e,this._$parent=t,this.__attributeIndex=r}_$resolve(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}var{_ChildPart:js}=jr,Zs=!0,Ce=Zs&&window.ShadyDOM?.inUse&&window.ShadyDOM?.noPatch===!0?window.ShadyDOM.wrap:(e)=>e;var Yr=()=>document.createComment(""),Pe=(e,t,r)=>{let n=Ce(e._$startNode).parentNode,s=t===void 0?e._$endNode:t._$startNode;if(r===void 0){let i=Ce(n).insertBefore(Yr(),s),a=Ce(n).insertBefore(Yr(),s);r=new js(i,a,e,e.options)}else{let i=Ce(r._$endNode).nextSibling,a=r._$parent,o=a!==e;if(o){r._$reparentDisconnectables?.(e),r._$parent=e;let u;if(r._$notifyConnectionChanged!==void 0&&(u=e._$isConnected)!==a._$isConnected)r._$notifyConnectionChanged(u)}if(i!==s||o){let u=r._$startNode;while(u!==i){let m=Ce(u).nextSibling;Ce(n).insertBefore(u,s),u=m}}}return r},pe=(e,t,r=e)=>(e._$setValue(t,r),e),Ys={},Gr=(e,t=Ys)=>e._$committedValue=t,Qr=(e)=>e._$committedValue,pt=(e)=>{e._$clear(),e._$startNode.remove()};var Xr=(e,t,r)=>{let n=new Map;for(let s=t;s<=r;s++)n.set(e[s],s);return n};class Jr extends Ze{constructor(e){super(e);if(e.type!==dt.CHILD)throw Error("repeat() can only be used in text expressions")}_getValuesAndKeys(e,t,r){let n;if(r===void 0)r=t;else if(t!==void 0)n=t;let s=[],i=[],a=0;for(let o of e)s[a]=n?n(o,a):a,i[a]=r(o,a),a++;return{values:i,keys:s}}render(e,t,r){return this._getValuesAndKeys(e,t,r).values}update(e,[t,r,n]){let s=Qr(e),{values:i,keys:a}=this._getValuesAndKeys(t,r,n);if(!Array.isArray(s))return this._itemKeys=a,i;let o=this._itemKeys??=[],u=[],m,y,_=0,k=s.length-1,h=0,v=i.length-1;while(_<=k&&h<=v)if(s[_]===null)_++;else if(s[k]===null)k--;else if(o[_]===a[h])u[h]=pe(s[_],i[h]),_++,h++;else if(o[k]===a[v])u[v]=pe(s[k],i[v]),k--,v--;else if(o[_]===a[v])u[v]=pe(s[_],i[v]),Pe(e,u[v+1],s[_]),_++,v--;else if(o[k]===a[h])u[h]=pe(s[k],i[h]),Pe(e,s[_],s[k]),k--,h++;else{if(m===void 0)m=Xr(a,h,v),y=Xr(o,_,k);if(!m.has(o[_]))pt(s[_]),_++;else if(!m.has(o[k]))pt(s[k]),k--;else{let S=y.get(a[h]),N=S!==void 0?s[S]:null;if(N===null){let ae=Pe(e,s[_]);pe(ae,i[h]),u[h]=ae}else u[h]=pe(N,i[h]),Pe(e,s[_],N),s[S]=null;h++}}while(h<=v){let S=Pe(e,u[v+1]);pe(S,i[h]),u[h++]=S}while(_<=k){let S=s[_++];if(S!==null)pt(S)}return this._itemKeys=a,Gr(e,u),Y}}var B=ut(Jr);var Gs={app_title:"Housetide",tab_today:"Today",tab_tasks:"Tasks",tab_history:"History",card_title:"Today",card_empty:"All clear. Nothing due today.",card_loading:"Loading tasks…",card_error:"Housetide is not available",config_tasks:"Tasks",config_show:"Show",config_show_today:"Today only",config_show_all:"All tasks",config_layout:"Layout",config_layout_list:"List",config_layout_scenes:"Scenes",config_title:"Title",config_animations:"Animations",action_advance:"Done",action_start:"Start",action_early:"Do early",action_early_confirm:"Sure?",action_skip:"Skip",action_undo:"Undo",action_save:"Save",action_cancel:"Cancel",action_delete:"Delete",action_edit:"Edit",action_add:"Add",action_add_stage:"Add stage",action_remove:"Remove",action_load_more:"Load more",action_new_task:"New task",action_move_up:"Move up",action_move_down:"Move down",status_upcoming:"Upcoming",status_due:"Due",status_overdue:"Overdue",status_in_progress:"In progress",status_clean:"Clean",status_done:"Done",status_disabled:"Paused",automated:"Automatic",due_now:"Due now",due_when:"Due {when}",next_when:"Next {when}",overdue_for:"Overdue · {duration}",started_when:"Started {when}",done_when:"Done {when}",not_scheduled:"Not scheduled",stage_progress:"Step {current} of {total}",template_laundry:"Laundry",template_pills:"Pills",template_plant:"Water the plant",template_one_off:"One-off task",template_prompt:"Start from a template",field_title:"Title",field_icon:"Icon",field_color:"Colour",field_notes:"Notes",field_assignee:"Assignee",field_enabled:"Enabled",field_scene:"Scene",field_on_missed:"If missed",field_clean_for:"Stays clean for (minutes)",field_grace:"Grace period (hours)",field_schedule:"Schedule",field_schedule_type:"Repeats",field_due:"Due",field_time:"Time",field_weekdays:"Weekdays",field_every_days:"Every (days)",field_anchor:"Count from",field_stages:"Stages",field_stage_title:"Stage",field_action:"Button label",field_role:"Role",field_stale_after:"Gets stale after (minutes)",field_trigger:"Advances automatically",field_entity:"When this entity",field_condition:"Is",field_value:"Value",field_for_seconds:"For (seconds)",field_current_value:"Current value: {value}",field_retention:"Keep history (days)",condition_above:"Above",condition_below:"Below",condition_state:"Equal to",condition_none:"By hand only",schedule_once:"Once",schedule_daily:"Daily",schedule_weekly:"Weekly",schedule_interval:"Interval",schedule_daily_at:"Every day at {time}",schedule_weekly_at:"{days} at {time}",schedule_interval_at:"{every} at {time}",anchor_completion:"Last completion",anchor_schedule:"Previous due date",on_missed_carry:"Keep it overdue",on_missed_skip:"Skip to the next",role_todo:"To do",role_running:"Running",role_waiting:"Waiting",scene_generic:"Tide",scene_pills:"Pills",scene_laundry:"Laundry",scene_plant:"Plant",event_started:"Started",event_advanced:"Advanced",event_completed:"Completed",event_skipped:"Skipped",event_missed:"Missed",event_undone:"Undone",event_created:"Created",event_deleted:"Deleted",source_manual:"By hand",source_trigger:"By sensor",source_service:"By service",source_schedule:"By schedule",source_todo:"From the to-do list",on_time:"On time",late:"Late",history_all_tasks:"All tasks",field_filter_task:"Task",history_empty:"Nothing has happened yet.",stats_current_streak:"Current streak",stats_best_streak:"Best streak",stats_completed:"Completed",stats_skipped:"Skipped",stats_missed:"Missed",stats_on_time:"On time",stats_no_data:"—",tasks_empty:"No tasks yet. Start from a template.",tasks_read_only:"Only administrators can change tasks.",confirm_delete:"Delete “{title}”? History is kept.",error_generic:"Something went wrong: {message}",error_required:"This field is required",settings_title:"Settings",disconnected:"Connection lost. Reconnecting…",loading:"Loading…",card_error_hint:"Check that the Housetide integration is set up.",action_retry:"Try again",action_clear:"Clear",action_close:"Close",action_menu:"Menu",today_later:"Coming up",today_clear_title:"All clear",section_details:"Details",section_behaviour:"If life gets in the way",field_stage_n:"Stage {n}",hint_clean_for:"How long it shows as freshly done.",hint_grace:"After this it counts as overdue and starts to smell.",hint_icon:"For example mdi:washing-machine",hint_stale_after:"Leave empty if it can wait forever.",hint_assignee:"A name or a person entity",entity_placeholder:"Search by name or entity id",entity_not_found:"This entity does not exist right now",entity_unavailable:"The entity is unavailable right now",entity_no_matches:"No matching entities",trigger_met:"True right now",trigger_unmet:"Not true right now",trigger_none:"Moves on only when you tap the button.",trigger_above:"Moves on when {entity} goes above {value}",trigger_below:"Moves on when {entity} drops below {value}",trigger_state:"Moves on when {entity} becomes “{value}”",trigger_held:"{sentence} and stays there for {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Choose an entity and a value to finish this rule.",error_number:"Enter a number",error_whole:"Enter a whole number",error_min:"Must be at least {min}",error_max:"Must be at most {max}",error_weekdays:"Pick at least one day",error_entity:"Pick an entity, or turn off automatic advance",error_entity_format:"That is not a valid entity id",error_state:"This state can never match",error_datetime:"Choose a date and time",error_time:"Choose a time",error_form:"Some fields need attention.",error_templates:"Could not load the templates.",template_stage_load:"Collect and load",template_action_load:"Loaded",template_stage_wash:"Washing",template_action_wash:"Finished",template_stage_hang:"Hang it up",template_action_hang:"Hung up",template_stage_take:"Take pills",template_action_take:"Taken",template_stage_water:"Water",template_action_water:"Watered",template_stage_do:"Do it",template_action_do:"Done",history_window:"Last 90 days",history_day_hint:"Tap a day to see what happened.",history_day:"{date}: {completed} done, {skipped} skipped, {missed} missed",history_day_empty:"{date}: nothing recorded",history_stage:"{event} · {stage}",stats_scope:"{completed} done · {skipped} skipped · {missed} missed"},Qs={app_title:"Housetide",tab_today:"Сьогодні",tab_tasks:"Задачі",tab_history:"Історія",card_title:"Сьогодні",card_empty:"Усе чисто. На сьогодні нічого немає.",card_loading:"Завантаження задач…",card_error:"Housetide недоступний",config_tasks:"Задачі",config_show:"Показувати",config_show_today:"Лише сьогодні",config_show_all:"Усі задачі",config_layout:"Вигляд",config_layout_list:"Список",config_layout_scenes:"Сцени",config_title:"Заголовок",config_animations:"Анімації",action_advance:"Готово",action_start:"Почати",action_early:"Раніше",action_early_confirm:"Точно?",action_skip:"Пропустити",action_undo:"Скасувати",action_save:"Зберегти",action_cancel:"Скасувати",action_delete:"Видалити",action_edit:"Змінити",action_add:"Додати",action_add_stage:"Додати етап",action_remove:"Прибрати",action_load_more:"Показати ще",action_new_task:"Нова задача",action_move_up:"Вище",action_move_down:"Нижче",status_upcoming:"Заплановано",status_due:"Час виконати",status_overdue:"Прострочено",status_in_progress:"Виконується",status_clean:"Чисто",status_done:"Виконано",status_disabled:"На паузі",automated:"Автоматично",due_now:"Час виконати",due_when:"Термін: {when}",next_when:"Наступне: {when}",overdue_for:"Прострочено · {duration}",started_when:"Почато {when}",done_when:"Виконано {when}",not_scheduled:"Без розкладу",stage_progress:"Етап {current} з {total}",template_laundry:"Прання",template_pills:"Таблетки",template_plant:"Полити рослину",template_one_off:"Разова задача",template_prompt:"Почати із шаблону",field_title:"Назва",field_icon:"Іконка",field_color:"Колір",field_notes:"Нотатки",field_assignee:"Виконавець",field_enabled:"Увімкнено",field_scene:"Сцена",field_on_missed:"Якщо пропущено",field_clean_for:"Залишається чистим (хвилин)",field_grace:"Запас часу (годин)",field_schedule:"Розклад",field_schedule_type:"Повторення",field_due:"Термін",field_time:"Час",field_weekdays:"Дні тижня",field_every_days:"Кожні (днів)",field_anchor:"Рахувати від",field_stages:"Етапи",field_stage_title:"Етап",field_action:"Напис на кнопці",field_role:"Роль",field_stale_after:"Застоюється через (хвилин)",field_trigger:"Перемикається автоматично",field_entity:"Коли ця сутність",field_condition:"Має значення",field_value:"Значення",field_for_seconds:"Протягом (секунд)",field_current_value:"Поточне значення: {value}",field_retention:"Зберігати історію (днів)",condition_above:"Більше ніж",condition_below:"Менше ніж",condition_state:"Дорівнює",condition_none:"Лише вручну",schedule_once:"Один раз",schedule_daily:"Щодня",schedule_weekly:"Щотижня",schedule_interval:"Інтервал",schedule_daily_at:"Щодня о {time}",schedule_weekly_at:"{days} о {time}",schedule_interval_at:"{every} о {time}",anchor_completion:"Останнього виконання",anchor_schedule:"Попереднього терміну",on_missed_carry:"Залишати простроченою",on_missed_skip:"Переходити до наступної",role_todo:"Зробити",role_running:"Триває",role_waiting:"Очікує",scene_generic:"Приплив",scene_pills:"Таблетки",scene_laundry:"Прання",scene_plant:"Рослина",event_started:"Розпочато",event_advanced:"Наступний етап",event_completed:"Виконано",event_skipped:"Пропущено",event_missed:"Не виконано",event_undone:"Скасовано",event_created:"Створено",event_deleted:"Видалено",source_manual:"Вручну",source_trigger:"За датчиком",source_service:"Через сервіс",source_schedule:"За розкладом",source_todo:"Зі списку справ",on_time:"Вчасно",late:"Із запізненням",history_all_tasks:"Усі задачі",field_filter_task:"Задача",history_empty:"Поки що нічого не сталося.",stats_current_streak:"Поточна серія",stats_best_streak:"Найкраща серія",stats_completed:"Виконано",stats_skipped:"Пропущено",stats_missed:"Не виконано",stats_on_time:"Вчасно",stats_no_data:"—",tasks_empty:"Задач поки немає. Почніть із шаблону.",tasks_read_only:"Змінювати задачі можуть лише адміністратори.",confirm_delete:"Видалити «{title}»? Історія збережеться.",error_generic:"Щось пішло не так: {message}",error_required:"Це поле обовʼязкове",settings_title:"Налаштування",disconnected:"Звʼязок втрачено. Перепідключення…",loading:"Завантаження…",card_error_hint:"Перевірте, чи налаштовано інтеграцію Housetide.",action_retry:"Спробувати ще",action_clear:"Очистити",action_close:"Закрити",action_menu:"Меню",today_later:"Незабаром",today_clear_title:"Усе чисто",section_details:"Основне",section_behaviour:"Якщо щось пішло не так",field_stage_n:"Етап {n}",hint_clean_for:"Скільки часу показувати як щойно зроблене.",hint_grace:"Після цього задача прострочена і починає смердіти.",hint_icon:"Наприклад, mdi:washing-machine",hint_stale_after:"Залиште порожнім, якщо може чекати вічно.",hint_assignee:"Імʼя або сутність person",entity_placeholder:"Пошук за назвою або id сутності",entity_not_found:"Такої сутності зараз немає",entity_unavailable:"Сутність зараз недоступна",entity_no_matches:"Нічого не знайдено",trigger_met:"Зараз виконується",trigger_unmet:"Зараз не виконується",trigger_none:"Перемикається лише натисканням кнопки.",trigger_above:"Перемикається, коли {entity} перевищить {value}",trigger_below:"Перемикається, коли {entity} впаде нижче {value}",trigger_state:"Перемикається, коли {entity} стане «{value}»",trigger_held:"{sentence} і так триматиметься {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Оберіть сутність і значення, щоб завершити правило.",error_number:"Введіть число",error_whole:"Введіть ціле число",error_min:"Має бути не менше {min}",error_max:"Має бути не більше {max}",error_weekdays:"Оберіть хоча б один день",error_entity:"Оберіть сутність або вимкніть автоматичне перемикання",error_entity_format:"Це не схоже на id сутності",error_state:"Такий стан ніколи не настане",error_datetime:"Оберіть дату й час",error_time:"Оберіть час",error_form:"Деякі поля потребують уваги.",error_templates:"Не вдалося завантажити шаблони.",template_stage_load:"Зібрати й завантажити",template_action_load:"Завантажено",template_stage_wash:"Прання",template_action_wash:"Завершено",template_stage_hang:"Розвісити",template_action_hang:"Розвішано",template_stage_take:"Випити таблетки",template_action_take:"Випито",template_stage_water:"Полити",template_action_water:"Полито",template_stage_do:"Зробити",template_action_do:"Готово",history_window:"Останні 90 днів",history_day_hint:"Торкніться дня, щоб побачити подробиці.",history_day:"{date}: виконано {completed}, пропущено {skipped}, не виконано {missed}",history_day_empty:"{date}: нічого не записано",history_stage:"{event} · {stage}",stats_scope:"виконано {completed} · пропущено {skipped} · не виконано {missed}"},Xs={days:{one:"{n} day",other:"{n} days"},every_days:{one:"Every day",other:"Every {n} days"},tasks_due:{one:"{n} task due",other:"{n} tasks due"},occurrences:{one:"{n} in a row",other:"{n} in a row"},seconds:{one:"{n} second",other:"{n} seconds"}},Js={days:{one:"{n} день",few:"{n} дні",many:"{n} днів",other:"{n} дня"},every_days:{one:"Кожен {n} день",few:"Кожні {n} дні",many:"Кожні {n} днів",other:"Кожні {n} дня"},tasks_due:{one:"{n} задача на зараз",few:"{n} задачі на зараз",many:"{n} задач на зараз",other:"{n} задачі на зараз"},occurrences:{one:"{n} поспіль",few:"{n} поспіль",many:"{n} поспіль",other:"{n} поспіль"},seconds:{one:"{n} секунду",few:"{n} секунди",many:"{n} секунд",other:"{n} секунди"}};var ei=Date.UTC(2024,0,1);function en(e,t){if(!t)return e;return e.replaceAll(/\{(\w+)\}/g,(r,n)=>String(t[n]??r))}function ti(e,t){return e.charAt(0).toLocaleUpperCase(t)+e.slice(1)}function ri(e){let t=(e??"en").replace("_","-");if(/^uk\b/i.test(t))return{language:"uk",locale:t};if(/^en\b/i.test(t))return{language:"en",locale:t};return{language:"en",locale:"en"}}function le(e){return e instanceof Date?e:new Date(e)}function ni(e){if(!e)return;try{return Intl.DateTimeFormat("en",{timeZone:e}),e}catch{return}}function Gt(e,t={}){let r=ri(e),{locale:n}=r,s=ni(t.timeZone),{hour12:i}=t,a=i===void 0?{}:{hour12:i},u=i??new Intl.DateTimeFormat(n,{hour:"numeric"}).resolvedOptions().hour12?"numeric":"2-digit",m=r.language==="uk"?Qs:Gs,y=r.language==="uk"?Js:Xs,_=new Intl.PluralRules(n),k=new Intl.NumberFormat(n),h=new Intl.NumberFormat(n,{style:"percent",maximumFractionDigits:0}),v=new Intl.RelativeTimeFormat(n,{numeric:"auto"}),S=new Intl.DateTimeFormat(n,{dateStyle:"medium",timeZone:s}),N=new Intl.DateTimeFormat(n,{day:"numeric",month:"short",timeZone:s}),ae=new Intl.DateTimeFormat(n,{hour:u,minute:"2-digit",timeZone:s,...a}),Ie=new Intl.DateTimeFormat(n,{day:"numeric",month:"short",hour:u,minute:"2-digit",timeZone:s,...a}),Tt=new Intl.DateTimeFormat(n,{hour:u,minute:"2-digit",timeZone:"UTC",...a}),be=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:s}),J={short:new Intl.DateTimeFormat(n,{weekday:"short",timeZone:"UTC"}),long:new Intl.DateTimeFormat(n,{weekday:"long",timeZone:"UTC"}),narrow:new Intl.DateTimeFormat(n,{weekday:"narrow",timeZone:"UTC"})},ee=(f)=>new Intl.NumberFormat(n,{style:"unit",unit:f,unitDisplay:"long"}),te={minute:ee("minute"),hour:ee("hour"),day:ee("day"),week:ee("week")},Fe=(f)=>{let x=(C)=>Number(be.formatToParts(f).find((re)=>re.type===C)?.value);return Date.UTC(x("year"),x("month")-1,x("day"))/86400000},V=(f,x)=>en(m[f],x),xr=(f,x)=>{let C=y[f],re=C[_.select(x)]??C.other;return en(re,{n:k.format(x)})},Ue=(f,x)=>{let C=le(f),re=le(x),St=(C.getTime()-re.getTime())/1000,Et=Math.abs(St);if(Et<45)return v.format(0,"second");if(Et<3570)return v.format(Math.round(St/60),"minute");if(Et<84600)return v.format(Math.round(St/3600),"hour");let ve=Fe(C)-Fe(re);if(Math.abs(ve)<7)return v.format(ve,"day");if(Math.abs(ve)<30)return v.format(Math.round(ve/7),"week");if(Math.abs(ve)<365)return v.format(Math.round(ve/30),"month");return v.format(Math.round(ve/365),"year")},wr=(f)=>{let x=Math.max(0,Math.round(f));if(x<3570)return te.minute.format(Math.max(1,Math.round(x/60)));if(x<84600)return te.hour.format(Math.round(x/3600));if(x<1209600)return te.day.format(Math.round(x/86400));return te.week.format(Math.round(x/604800))},Tr=(f)=>{let[x=0,C=0]=f.split(":").map(Number);return Tt.format(Date.UTC(2024,0,1,x,C))},Sr=(f,x="short")=>J[x].format(ei+(f%7+7)%7*86400*1000),_s=(f)=>{if(f.type==="once")return Ie.format(le(f.due));let x=Tr(f.time);if(f.type==="daily")return V("schedule_daily_at",{time:x});if(f.type==="weekly"){let C=f.weekdays.map((re)=>Sr(re)).join(", ");return V("schedule_weekly_at",{days:C,time:x})}return V("schedule_interval_at",{every:xr("every_days",f.every_days),time:x})},bs=(f,x)=>{let{status:C}=f;if(C==="disabled")return V("status_disabled");if(C==="done"||C==="clean")return f.last_completed_at?V("done_when",{when:Ue(f.last_completed_at,x)}):V("status_done");if(C==="in_progress")return f.started_at?V("started_when",{when:Ue(f.started_at,x)}):V("status_in_progress");if(C==="overdue"){let re=f.due_at?(le(x).getTime()-le(f.due_at).getTime())/1000:f.overdue_seconds;return V("overdue_for",{duration:wr(re)})}if(C==="due")return V("due_now");if(f.due_at)return V("due_when",{when:Ue(f.due_at,x)});if(f.next_due_at)return V("next_when",{when:Ue(f.next_due_at,x)});return V("not_scheduled")};return{language:r.language,locale:n,t:V,plural:xr,number:(f)=>k.format(f),percent:(f)=>h.format(f),relative:Ue,duration:wr,date:(f)=>S.format(le(f)),shortDate:(f)=>N.format(le(f)),time:(f)=>ae.format(le(f)),dateTime:(f)=>Ie.format(le(f)),clock:Tr,weekday:Sr,scheduleText:(f)=>ti(_s(f),n),dueText:bs}}function tn(e){let t=e.locale?.time_format,r={};if(t==="12")r.hour12=!0;if(t==="24")r.hour12=!1;if(e.config?.time_zone)r.timeZone=e.config.time_zone;return Gt(e.locale?.language??e.language,r)}function G(e,t={}){let r=Object.entries(t).filter(([,n])=>n!==void 0);return{type:`housetide/${e}`,...Object.fromEntries(r)}}function rn(e,t){return e.connection.subscribeMessage(t,G("subscribe"))}function nn(e,t){return e.callWS(G("advance",{task_id:t}))}function sn(e,t){return e.callWS(G("skip",{task_id:t}))}function an(e,t){return e.callWS(G("undo",{task_id:t}))}async function Qt(e,t={}){let r=await e.callWS(G("history",t));return Array.isArray(r)?r:r.events}function on(e,t={}){return e.callWS(G("stats",t))}function si(e){return"templates"in e}async function Xt(e){let t=await e.callWS(G("templates"));return si(t)?t.templates:t}function ln(e,t){return e.callWS(G("task/create",{task:t}))}function cn(e,t){return e.callWS(G("task/update",{task:t}))}function dn(e,t){return e.callWS(G("task/delete",{task_id:t}))}function un(e,t){return e.callWS(G("settings/update",{settings:t}))}var ii=/^[a-z0-9_]+\.[a-z0-9_]+$/,ai=/^(?:[01]\d|2[0-3]):[0-5]\d$/,oi=/^\d+$/,li=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,yn=new Set(["unknown","unavailable"]);function _n(){return Intl.DateTimeFormat().resolvedOptions().timeZone}var pn=new Map;function ci(e){let t=pn.get(e);if(t)return t;let r=new Intl.DateTimeFormat("en-CA",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});return pn.set(e,r),r}function ht(e,t){let r=ci(t).formatToParts(e),n=(s)=>Number(r.find((i)=>i.type===s)?.value??0);return{year:n("year"),month:n("month"),day:n("day"),hour:n("hour"),minute:n("minute"),second:n("second")}}function hn(e,t){let r=ht(new Date(e),t);return Date.UTC(r.year,r.month-1,r.day,r.hour,r.minute,r.second)-Math.floor(e/1000)*1000}function he(e){return String(e).padStart(2,"0")}function di(e){let t=Math.round(Math.abs(e)/60000);return`${e<0?"-":"+"}${he(Math.floor(t/60))}:${he(t%60)}`}function er(e,t){let r=li.exec(e);if(!r)return null;let[,n,s,i,a,o]=r,u=Date.UTC(Number(n),Number(s)-1,Number(i),Number(a),Number(o));if(Number.isNaN(u))return null;let m=hn(u-hn(u,t),t);return`${n}-${s}-${i}T${a}:${o}:00${di(m)}`}function ui(e,t){let r=new Date(e);if(Number.isNaN(r.getTime()))return"";let n=ht(r,t);return`${String(n.year).padStart(4,"0")}-${he(n.month)}-${he(n.day)}T${he(n.hour)}:${he(n.minute)}`}function Ge(e,t){let r=ht(e,t);return(new Date(Date.UTC(r.year,r.month-1,r.day)).getUTCDay()+6)%7}function bn(e,t){return er(`${e}T12:00`,t)??e}function pi(e,t){let r=ht(e,t),n=new Date(Date.UTC(r.year,r.month-1,r.day+1));return`${n.getUTCFullYear()}-${he(n.getUTCMonth()+1)}-${he(n.getUTCDate())}T09:00`}function hi(e){if(!e)return"none";if(e.above!==null)return"above";if(e.below!==null)return"below";return"state"}function mi(e){if(!e)return"";let t=e.above??e.below??e.state;return t===null?"":String(t)}function fi(e){return{id:e.id,title:e.title,action:e.action??"",role:e.role,stale:e.stale_after_minutes===null?"":String(e.stale_after_minutes),condition:hi(e.complete_when),entity:e.complete_when?.entity_id??"",value:mi(e.complete_when),hold:e.complete_when?String(e.complete_when.for_seconds):"0"}}function vn(e,t,r){let{schedule:n}=e;return{id:e.id??null,title:e.title,icon:e.icon??"",color:e.color??"",notes:e.notes??"",assignee:e.assignee??"",enabled:e.enabled,scene:e.scene,on_missed:e.on_missed,clean_for:String(e.clean_for_minutes),grace:String(e.grace_hours),schedule:n.type,due:n.type==="once"?ui(n.due,t):pi(r,t),time:n.type==="once"?"09:00":n.time,weekdays:n.type==="weekly"?[...n.weekdays]:[Ge(r,t)],every_days:n.type==="interval"?String(n.every_days):"7",anchor:n.type==="interval"?n.anchor:"completion",stages:e.stages.map((s)=>fi(s))}}function kn(e){let t=new Set(e.stages.map((s)=>s.id)),r=e.stages.length+1;while(t.has(`stage_${r}`))r+=1;let n={id:`stage_${r}`,title:"",action:"",role:"todo",stale:"",condition:"none",entity:"",value:"",hold:"0"};return{...e,stages:[...e.stages,n]}}function $n(e,t){if(e.stages.length<=1)return e;return{...e,stages:e.stages.filter((r,n)=>n!==t)}}function tr(e,t,r){let n=t+r,s=e.stages[t];if(!s||n<0||n>=e.stages.length)return e;let i=e.stages.filter((a,o)=>o!==t);return i.splice(n,0,s),{...e,stages:i}}function rr(e){let t=e.trim().replace(",",".");if(t==="")return null;let r=Number(t);return Number.isFinite(r)?r:null}function Ye(e,t,r,n){let s=r.trim();if(!oi.test(s))e[t]={key:"error_whole"};else if(Number(s)<n)e[t]={key:"error_min",vars:{min:n}}}function gi(e,t,r){let n=`stages.${r}`;if(!t.title.trim())e[`${n}.title`]={key:"error_required"};if(t.stale.trim())Ye(e,`${n}.stale`,t.stale,1);if(t.condition==="none")return;let s=t.entity.trim();if(!s)e[`${n}.entity`]={key:"error_entity"};else if(!ii.test(s))e[`${n}.entity`]={key:"error_entity_format"};if(Ye(e,`${n}.hold`,t.hold,0),t.condition==="state"){let i=t.value.trim();if(!i)e[`${n}.value`]={key:"error_required"};else if(yn.has(i))e[`${n}.value`]={key:"error_state"}}else if(rr(t.value)===null)e[`${n}.value`]={key:"error_number"}}function nr(e,t){let r={};if(!e.title.trim())r.title={key:"error_required"};if(Ye(r,"clean_for",e.clean_for,0),Ye(r,"grace",e.grace,0),e.schedule==="once"){if(!er(e.due,t))r.due={key:"error_datetime"}}else if(!ai.test(e.time))r.time={key:"error_time"};if(e.schedule==="weekly"&&e.weekdays.length===0)r.weekdays={key:"error_weekdays"};if(e.schedule==="interval")Ye(r,"every_days",e.every_days,1);return e.stages.forEach((n,s)=>{gi(r,n,s)}),r}function De(e){let t=e.trim();return t===""?null:t}function yi(e,t){switch(e.schedule){case"once":return{type:"once",due:er(e.due,t)??e.due};case"daily":return{type:"daily",time:e.time};case"weekly":return{type:"weekly",weekdays:[...e.weekdays].toSorted((r,n)=>r-n),time:e.time};default:return{type:"interval",every_days:Number(e.every_days.trim()),time:e.time,anchor:e.anchor}}}function _i(e){if(e.condition==="none")return null;let t=rr(e.value);return{entity_id:e.entity.trim(),above:e.condition==="above"?t:null,below:e.condition==="below"?t:null,state:e.condition==="state"?e.value.trim():null,for_seconds:Number(e.hold.trim())}}function bi(e){let t=De(e.stale);return{id:e.id,title:e.title.trim(),action:De(e.action),role:e.role,complete_when:_i(e),stale_after_minutes:t===null?null:Number(t)}}function xn(e,t){let r={title:e.title.trim(),icon:De(e.icon),color:De(e.color),notes:De(e.notes),assignee:De(e.assignee),enabled:e.enabled,schedule:yi(e,t),on_missed:e.on_missed,scene:e.scene,stages:e.stages.map((n)=>bi(n)),clean_for_minutes:Number(e.clean_for.trim()),grace_hours:Number(e.grace.trim())};return e.id===null?r:{...r,id:e.id}}function wn(e,t){return Object.hasOwn(e,t)?e[t]:void 0}function Jt(e){let t=e.attributes.friendly_name;return typeof t==="string"?t:e.entity_id}function Tn(e){return e.trim()!==""&&Number.isFinite(Number(e))}function mn(e,t){if(t==="state")return 0;let r=e.attributes.device_class;if(r==="power")return 0;if(r==="current"||r==="voltage")return 1;return Tn(e.state)?2:3}function Sn(e,t,r,n=6){let s=t.trim().toLowerCase().split(/\s+/).filter(Boolean);return Object.values(e).filter((o)=>{let u=`${o.entity_id} ${Jt(o)}`.toLowerCase();return s.every((m)=>u.includes(m))}).toSorted((o,u)=>mn(o,r)-mn(u,r)||o.entity_id.localeCompare(u.entity_id)).slice(0,n).map((o)=>({entity_id:o.entity_id,name:Jt(o),state:o.state}))}function En(e,t){if(e.condition==="none"||!e.entity.trim())return"idle";if(!t)return"missing";if(yn.has(t.state))return"unavailable";if(e.condition==="state"){if(!e.value.trim())return"idle";return t.state===e.value.trim()?"met":"unmet"}let r=rr(e.value);if(r===null)return"idle";if(!Tn(t.state))return"unavailable";let n=Number(t.state);return(e.condition==="above"?n>r:n<r)?"met":"unmet"}function Mn(e){let t=e?.attributes.unit_of_measurement;return typeof t==="string"?t:""}function An(e){let t=Mn(e);return t?`${e.state} ${t}`:e.state}function vi(e,t){return e<90?t.plural("seconds",e):t.duration(e)}function Cn(e,t,r){if(e.condition==="none")return r.t("trigger_none");let n=e.value.trim();if(!e.entity.trim()||!n)return r.t("trigger_incomplete");let s=t?Jt(t):e.entity.trim(),i=e.condition==="state"?"":Mn(t),a=r.t(`trigger_${e.condition}`,{entity:s,value:i?`${n} ${i}`:n}),o=Number(e.hold.trim());if(!Number.isInteger(o)||o<=0)return r.t("trigger_instant",{sentence:a});return r.t("trigger_held",{sentence:a,hold:vi(o,r)})}var fn={laundry:"template_laundry",pills:"template_pills",plant:"template_plant",one_off:"template_one_off"},gn={load:["template_stage_load","template_action_load"],wash:["template_stage_wash","template_action_wash"],hang:["template_stage_hang","template_action_hang"],take:["template_stage_take","template_action_take"],water:["template_stage_water","template_action_water"],do:["template_stage_do","template_action_do"]};function sr(e,t){let r=Object.hasOwn(fn,e)?fn[e]:void 0;return r?t.t(r):null}function Pn(e,t,r){return{...t,title:sr(e,r)??t.title,stages:t.stages.map((n)=>{let s=Object.hasOwn(gn,n.id)?gn[n.id]:void 0;return s?{...n,title:r.t(s[0]),action:r.t(s[1])}:n})}}function Dn(e){let t=e[0];if(!t)return{days:[],columns:0};let r=(new Date(`${t.date}T00:00:00Z`).getUTCDay()+6)%7,n=e.map((s,i)=>({...s,column:Math.floor((i+r)/7),row:(i+r)%7,level:Math.min(3,s.completed),trouble:s.missed+s.skipped>0}));return{days:n,columns:(n.at(-1)?.column??0)+1}}var ki=30000,Rn=12000,Hn=700,$i=900,xi=6000,wi=4000;function me(e,t){if(!e||!t)return e!==t;return e.connection!==t.connection||e.connected!==t.connected||e.language!==t.language||e.locale!==t.locale||e.config?.time_zone!==t.config?.time_zone||e.user?.is_admin!==t.user?.is_admin}function mt(e){return typeof e==="object"&&e!==null&&"connection"in e&&"states"in e}var ir;function z(e){let t=[e.locale?.language??e.language,e.locale?.time_format,e.config?.time_zone].join("|");if(ir?.key!==t)ir={key:t,i18n:tn(e)};return ir.i18n}function se(e){return e.config?.time_zone??_n()}function Te(e){return e?.connected===!1}function ft(){return document.hidden}class Qe{state=null;failed=!1;now=new Date;host;hass;onState;connected=!1;connection;unsubscribe;generation=0;timer;clockOffset=0;constructor(e,t,r){this.host=e,this.hass=t,this.onState=r,e.addController(this)}hostConnected(){this.connected=!0,this.timer=setInterval(this.tick,ki),document.addEventListener("visibilitychange",this.onVisibility),this.sync()}hostDisconnected(){this.connected=!1,clearInterval(this.timer),document.removeEventListener("visibilitychange",this.onVisibility),this.stop()}sync(){let e=this.hass();if(!this.connected||!e||e.connection===this.connection)return;this.stop(),this.connection=e.connection,this.start(e)}retry(){this.stop(),this.failed=!1,this.host.requestUpdate(),this.sync()}async start(e){this.generation+=1;let{generation:t}=this;try{let r=await rn(e,(n)=>{if(t===this.generation)this.receive(n)});if(t===this.generation)this.unsubscribe=r;else await r()}catch{if(t!==this.generation)return;this.connection=void 0,this.failed=!0,this.host.requestUpdate()}}stop(){this.generation+=1,this.connection=void 0;let{unsubscribe:e}=this;if(this.unsubscribe=void 0,!e)return;Promise.resolve().then(()=>e()).catch(()=>{return})}receive(e){this.state=e,this.failed=!1;let t=Date.parse(e.now);this.clockOffset=Number.isNaN(t)?0:t-Date.now(),this.refreshClock(),this.onState?.(e),this.host.requestUpdate()}refreshClock(){this.now=new Date(Date.now()+this.clockOffset)}tick=()=>{if(this.refreshClock(),this.failed)this.sync();this.host.requestUpdate()};onVisibility=()=>{if(!document.hidden)this.refreshClock();this.host.requestUpdate()}}var Ti={overdue:0,due:0,in_progress:0,upcoming:1,clean:2,done:3,disabled:4};function Re(e){let t=Date.parse(e.due_at??e.next_due_at??"");return[Ti[e.status],Number.isNaN(t)?Number.MAX_SAFE_INTEGER:t,e.title]}function gt(e,t){return e[0]-t[0]||e[1]-t[1]||e[2].localeCompare(t[2])}function ar(e){return e.status==="upcoming"||e.status==="clean"}class Xe{host;hass;pending=new Set;recent=new Map;errors=new Map;celebrating=new Map;armed=new Map;timers=new Set;constructor(e,t){this.host=e,this.hass=t,e.addController(this)}hostDisconnected(){for(let e of this.timers)clearTimeout(e);this.timers.clear(),this.recent.clear(),this.celebrating.clear(),this.errors.clear(),this.armed.clear()}isPending(e){return this.pending.has(e)}error(e){return this.errors.get(e)}celebration(e){return this.celebrating.get(e)}isRecent(e){return this.recent.has(e)}justCompleted(e){return this.recent.get(e)?.completed??!1}frozenKey(e){return this.recent.get(e)?.key}isArmed(e){return this.armed.has(e)}async press(e){if(!ar(e)){await this.advance(e);return}let t=e.task_id,r=this.armed.get(t);if(!r){let n={readyAt:Date.now()+Hn};this.armed.set(t,n),this.later(wi,()=>{if(this.armed.get(t)===n)this.armed.delete(t)}),this.host.requestUpdate();return}if(r.readyAt>Date.now())return;this.armed.delete(t),await this.advance(e)}async advance(e){let t=e.task_id,r=this.recent.get(t);if(this.pending.has(t)||r&&r.coolUntil>Date.now())return;let n=e.stage_index+1>=e.stage_count;if(this.celebrate(t,n?"done":"stage"),!await this.track(e,n,(i)=>nn(i,t)))this.celebrating.delete(t);this.host.requestUpdate()}async skip(e){let t=e.task_id;await this.track(e,!1,(r)=>sn(r,t)),this.host.requestUpdate()}async undo(e){let t=e.task_id;if(await this.run(t,(n)=>an(n,t)))this.recent.delete(t);this.host.requestUpdate()}async track(e,t,r){let n=e.task_id;if(!this.hass()||this.pending.has(n))return!1;let s=this.recent.get(n),i=this.remember(e,t),a=await this.run(n,r);if(a)window.dispatchEvent(new CustomEvent("haptic",{detail:t?"success":"light"}));else if(this.recent.get(n)===i)if(s)this.recent.set(n,s);else this.recent.delete(n);return a}remember(e,t){let r=e.task_id,n=Date.now(),s={completed:t,until:n+Rn,coolUntil:n+Hn,key:this.recent.get(r)?.key??Re(e)};return this.recent.set(r,s),this.later(Rn,()=>{if(this.recent.get(r)===s)this.recent.delete(r)}),s}celebrate(e,t){this.celebrating.set(e,t),this.later($i,()=>{this.celebrating.delete(e)})}later(e,t){let r=setTimeout(()=>{this.timers.delete(r),t(),this.host.requestUpdate()},e);this.timers.add(r)}async run(e,t){let r=this.hass();if(!r||this.pending.has(e))return!1;this.pending.add(e),this.errors.delete(e),this.host.requestUpdate();try{return await t(r),!0}catch(n){return this.errors.set(e,ce(n)),this.later(xi,()=>{this.errors.delete(e)}),!1}finally{this.pending.delete(e)}}}function ce(e){if(e instanceof Error)return e.message;if(typeof e==="object"&&e!==null&&"message"in e)return String(e.message);return String(e)}var On="important",Vn=" !"+On,Si=0-Vn.length;class Ln extends Ze{constructor(e){super(e);if(e.type!==dt.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,r)=>{let n=e[r];if(n==null)return t;return r=r.includes("-")?r:r.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase(),t+`${r}:${n};`},"")}update(e,[t]){let{style:r}=e.element;if(this._previousStyleProperties===void 0)return this._previousStyleProperties=new Set(Object.keys(t)),this.render(t);for(let n of this._previousStyleProperties)if(t[n]==null)if(this._previousStyleProperties.delete(n),n.includes("-"))r.removeProperty(n);else r[n]=null;for(let n in t){let s=t[n];if(s!=null){this._previousStyleProperties.add(n);let i=typeof s==="string"&&s.endsWith(Vn);if(n.includes("-")||i)r.setProperty(n,i?s.slice(0,Si):s,i?On:"");else r[n]=s}}return Y}}var or=ut(Ln);var l={coral:"#ff7a6b",coralDark:"#d9574b",sun:"#ffc857",sunDark:"#e0a233",mint:"#5fd6a8",mintDark:"#3bb286",sky:"#5ab4ff",skyDark:"#3a8fdb",lilac:"#b79bff",lilacDark:"#9176e0",pink:"#ff8fc7",pinkDark:"#de6aa4",cream:"#f6f1e4",creamDark:"#d9d2bf",metal:"#e8ecf5",metalMid:"#c5cde0",metalDark:"#8c96b3",glass:"#223258",water:"#6cc8f5",waterDark:"#3f9ad6",wicker:"#dd9f5f",wickerDark:"#b97a3f",wickerLight:"#f0bd82",terracotta:"#e0784f",terracottaDark:"#b95a38",soil:"#4a3429",soilWet:"#2f2019",leaf:"#5ccf7a",leafDark:"#3aa65b",stench:"#b4e65a",musty:"#8a9a5e",mustyDark:"#6f7f49",fly:"#2a2d3e",wing:"#dfe7f5",spark:"#fff3c4",check:"#4fd18b"},cr={resting:{wall:"#262c49",floor:"#1d2239"},accumulating:{wall:"#2b2f55",floor:"#212542"},due:{wall:"#43305f",floor:"#33254a"},running:{wall:"#1f3f6b",floor:"#183154"},waiting:{wall:"#2c4358",floor:"#213443"},clean:{wall:"#17555c",floor:"#114247"}},Nn={wall:"#3e4a2b",floor:"#2d3720"};function Q(e){return Number.isFinite(e)?Math.min(1,Math.max(0,e)):0}function X(e,t){return t.filter((r)=>e>=r).length}function In(e){let t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function E(e,t,r){let n=Q(r),s=In(e),i=In(t);return`#${s.map((o,u)=>Math.round(o+((i[u]??o)-o)*n)).map((o)=>o.toString(16).padStart(2,"0")).join("")}`}function M(e){return Math.round(e*100)/100}function b(e,t,r,n=0,s=1){let i=n?` rotate(${M(n)})`:"",a=s===1?"":` scale(${M(s)})`;return d`<g transform="translate(${M(e)} ${M(t)})${i}${a}">${r}</g>`}function T(e,t,r=0){let n=r?`ht-a-${e} ht-d${r}`:`ht-a-${e}`;return d`<g class=${n}>${t}</g>`}function g(e,t,r){return r===void 0?d`<g data-part=${e}>${t}</g>`:d`<g data-part=${e} data-index=${r}>${t}</g>`}function R(e,t){return e?t():p}function lr(e,t){let r=cr[e],n=e==="clean"?0:Q(t)*0.85;return{wall:E(r.wall,Nn.wall,n),floor:E(r.floor,Nn.floor,n)}}var Ei=1.6,Fn=12;function He(e,t,r,n){let s=2/2**Ei,i=(a)=>Math.sign(a)*Math.abs(a)**s;return Array.from({length:Fn+1},(a,o)=>{let u=(n+o*90/Fn)*Math.PI/180;return`L${M(e+r*i(Math.cos(u)))} ${M(t+r*i(Math.sin(u)))}`}).join("")}function Mi(e,t,r,n,s){let i=e+r-s,a=t+n-s;return`M${[He(i,t+s,s,-90),He(i,a,s,0),He(e+s,a,s,90),He(e+s,t+s,s,180)].join("").slice(1)}Z`}var Ai=192,Ci=Mi(0,0,200,200,28),Pi="M0 168H200V200H0Z",Di=`M0 168H200V172${He(172,172,28,0)}${He(28,172,28,90)}Z`;function fe(e,t,r,n,s=!0){let i=r?.animations!==!1,a=r?.bleed===!0,o=lr(t.state,t.stink),u=`ht-scene ht-scene-${e}${i?" ht-animated":""}`,m=r?.label??e;return c`<svg
    class=${u}
    viewBox=${a?`0 0 200 ${Ai}`:"0 0 200 200"}
    role="img"
    aria-label=${m}
    data-scene=${e}
    data-state=${t.state}
  >
    ${a?d`<rect data-part="tile" width="200" height="200" fill=${o.wall} />`:d`<path data-part="tile" d=${Ci} fill=${o.wall} />`}
    ${s?d`<circle cx="100" cy="98" r="86" fill="#fff" opacity=".05" /><path data-part="floor" d=${a?Pi:Di} fill=${o.floor} />`:p}
    ${n}
  </svg>`}function Un(e){if(e.name==="laundry"||e.name==="pills"||e.name==="plant")return lr(e.state,e.stink);let{wall:r}=lr(e.state,0);return{wall:r,floor:r}}function de(e,t,r,n=0.28){return d`<ellipse cx=${e} cy=${t} rx=${r} ry="6" fill="#0c0f1e" opacity=${n} />`}function Se(e,t,r,n,s=1){let i=(u)=>d`<path d=${u} fill="none" stroke=${n} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,a=(u,m=3.2)=>d`<circle cx=${u} cy="0" r=${m} fill=${n} />`,o={happy:[i("M-15 1q4-6 8 0"),i("M7 1q4-6 8 0"),i("M-5 7q5 6 10 0")],calm:[a(-11),a(11),i("M-4 8q4 3 8 0")],sleepy:[i("M-15 0h8"),i("M7 0h8"),i("M-3 9h6")],worried:[a(-11),a(11),i("M-16-8l7-3"),i("M16-8l-7-3"),i("M-6 11q3-5 6-2t6-1")],pleading:[d`<circle cx="-11" cy="0" r="5" fill=${n} /><circle cx="-9.4" cy="-1.8" r="1.7" fill="#fff" />`,d`<circle cx="11" cy="0" r="5" fill=${n} /><circle cx="12.6" cy="-1.8" r="1.7" fill="#fff" />`,i("M-3 10q3-3 6 0")],sick:[i("M-15-4l7 7m0-7l-7 7"),i("M8-4l7 7m0-7l-7 7"),i("M-8 12q4-5 8-1t8-1")]};return g("face",b(e,t,o[r],0,s))}function H(e,t,r,n){return g("sparkle",b(e,t,T("twinkle",d`<path d=${"M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z"} fill=${l.spark} />`,n),0,r))}var Ri="M0 0c-9-7 9-13 0-20c-9-7 9-13 0-20";function dr(e,t=0){return e.map(([r,n],s)=>g("stench",b(r,n,T("waft",d`<path d=${Ri} fill="none" stroke=${l.stench} stroke-width="5.5" stroke-linecap="round" />`,s+t+1)),s+t))}function ur(e,t,r){let n=d`<path d="M-24 10q10 12 17-1" fill="none" stroke=${l.wing} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 5" opacity=".75" />`,s=d`
    <ellipse cx="-3.5" cy="-7" rx="6" ry="3.4" transform="rotate(30 -3.5 -7)" fill=${l.wing} />
    <ellipse cx="3.5" cy="-7" rx="6" ry="3.4" transform="rotate(-30 3.5 -7)" fill=${l.wing} />
    <ellipse rx="5.2" ry="6.2" fill=${l.fly} stroke=${l.wing} stroke-width="1.4" />
  `;return g("fly",b(e,t,T("buzz",[n,s],r%3+1)),r)}function Oe(e,t,r,n=1){return b(e,t,d`<path d=${"M0-8C4-3 6 0 6 3a6 6 0 0 1-12 0C-6 0-4-3 0-8Z"} fill=${r} />`,0,n)}function Hi(e,t){let r=(n,s)=>`${M(n*e)} ${M(s*t)}`;return[`M${r(-1,0.25)}`,`C${r(-1.05,-0.55)} ${r(-0.45,-1)} ${r(0.05,-0.92)}`,`C${r(0.75,-1)} ${r(1.08,-0.4)} ${r(1,0.2)}`,`C${r(1,0.8)} ${r(0.55,0.96)} ${r(0,0.92)}`,`C${r(-0.6,1)} ${r(-1,0.75)} ${r(-1,0.25)}Z`].join("")}function O(e,t,r,n,s,i,a=0){let o=`M${M(-r*0.45)} ${M(n*0.05)}q${M(r*0.35)} ${M(-n*0.5)} ${M(r*0.8)} ${M(n*0.05)}`;return b(e,t,d`<path d=${Hi(r,n)} fill=${s} /><path d=${o} fill="none" stroke=${i} stroke-width="3" stroke-linecap="round" />`,a)}var Oi="M-11-24L-30-13L-24 2L-15-2V24H15V-2L24 2L30-13L11-24C8-18-8-18-11-24Z";function yt(e,t,r,n,s=0,i=1){return b(e,t,d`<path d=${Oi} fill=${r} stroke-linejoin="round" /><path d="M-15-2V8M15-2V8" stroke=${n} stroke-width="2.6" stroke-linecap="round" /><path d="M-11-24C-8-18 8-18 11-24" fill="none" stroke=${n} stroke-width="3" stroke-linecap="round" />`,s,i)}function ge(e,t,r,n,s=0,i=1){return b(e,t,d`<path d="M-8-22H8V2L20 10C27 15 22 25 13 22L-4 15C-7 13-8 11-8 8Z" fill=${r} /><path d="M-8-15H8" stroke=${n} stroke-width="5" /><path d="M-8-22H8" stroke=${n} stroke-width="4" stroke-linecap="round" />`,s,i)}function Vi(e){let{state:t,fill:r,progress:n,stink:s}=e,i=t==="running"||t==="waiting",a=Q(r);if(t==="clean"||t==="due")a=1;if(i)a=Math.max(0.12,Q(n));if(t==="resting")a=Math.min(a,0.12);return{level:a,tilt:t==="clean"?0:Math.round(Q(s)*14),arc:i?Q(n):0,tint:t==="clean"?0:Q(s),pulse:t==="due",check:t==="clean",idle:t==="resting"}}var W=66,Li=[l.water,"#a2dca0","#ffc65c","#ff7a4f"],Ni=[l.waterDark,"#6fb777","#dd9a35","#c9502f"];function zn(e,t){let r=Q(t)*(e.length-1),n=Math.min(e.length-2,Math.floor(r));return E(e[n]??l.water,e[n+1]??l.water,r-n)}var _t=66;function Wn(e,t){let r=`M-66 ${e}`;for(let n=-66;n<266;n+=_t)r+=`q${_t/4} ${-t} ${_t/2} 0t${_t/2} 0`;return`${r}V172H-66Z`}function Ii(){return[d`<path d="M-1-30V-6H-19Z" fill=${l.cream} />`,d`<path d="M3-23V-6H16Z" fill=${l.coral} />`,d`<path d="M-27-3H27L19 13H-19Z" fill=${l.sun} />`,d`<path d="M-27-3H27L24 3H-24Z" fill=${l.sunDark} />`]}function pr(e,t){let r=Vi(e),n=zn(Li,r.tint),s=zn(Ni,r.tint),i=cr[e.state].wall,a=r.check?0.84:r.level*0.74,o=M(100+W-a*W*2),u=E(l.metalMid,"#ffd29a",r.tint),m=2*Math.PI*(W+3),y=`M0 28A28 28 0 0 1 28 0H172A28 28 0 0 1 200 28V172A28 28 0 0 1 172 200H28A28 28 0 0 1 0 172ZM${100-W} 100a${W} ${W} 0 1 0 ${W*2} 0a${W} ${W} 0 1 0 ${-W*2} 0Z`,_=d`<circle cx="100" cy="100" r=${W} fill="#0e1228" opacity=".55" /><g fill=${l.spark}><circle cx="70" cy="66" r="2.2" /><circle cx="128" cy="58" r="2.8" /><circle cx="146" cy="96" r="1.9" /><circle cx="58" cy="108" r="1.7" /></g>`,k=[T("tide-back",d`<path d=${Wn(o-7,7)} fill=${s} />`),R(!r.check,()=>g("boat",b(100,o-8,T("bob",b(0,0,Ii(),r.tilt,0.8))))),T("tide",d`<path d=${Wn(o,9)} fill=${n} />`)],h=[d`<circle cx="100" cy="100" r=${W+3} fill="none" stroke=${u} stroke-width="10" />`,R(r.arc>0,()=>g("arc",d`<circle cx="100" cy="100" r=${W+3} fill="none" stroke=${l.sun} stroke-width="10" stroke-linecap="round" stroke-dasharray=${`${M(m*r.arc)} ${M(m)}`} transform="rotate(-90 100 100)" />`))];return fe("generic",{...e,stink:0},t,[_,g("water",k),d`<path d=${y} fill=${i} fill-rule="evenodd" />`,g("ring",r.pulse?b(100,100,T("pulse",b(-100,-100,h))):h),R(r.check,()=>g("check",[d`<path d="M72 102l20 21 38-44" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />`,H(30,34,1.3,1),H(172,42,1,2),H(170,166,1.15,3),H(30,162,0.85,4)])),R(r.idle,()=>g("moon",b(100,92,d`<path d="M9-24A26 26 0 1 0 24 14 21 21 0 0 1 9-24Z" fill=${l.spark} />`)))],!1)}var hr=6,Bn=[0.05,0.3,0.55],Fi=[0.45,0.7,0.92],Ui=[0.02,0.4,0.75],zi=[0.65,0.9];function Wi(e){let{state:t,fill:r,stink:n}=e;if(t==="clean")return{view:"drying",pile:0,overflow:!1,stench:0,flies:0,cloud:0,mood:"happy"};if(t==="running")return{view:"washing",pile:0,overflow:!1,stench:X(n,Bn),flies:0,cloud:0,mood:"happy"};if(t==="waiting"){let m=X(n,Ui);return{view:"wet",pile:0,overflow:!1,stench:0,flies:X(n,zi),cloud:m,mood:m>=2?"sick":"pleading"}}let s=t==="due",i=s?hr:Math.min(hr-1,Math.floor(r*hr)),a=X(n,Bn),o=X(n,Fi),u=t==="resting"?"sleepy":"calm";if(s||i>=4)u="worried";if(n>=0.45)u="sick";return{view:"basket",pile:i,overflow:s,stench:a,flies:o,cloud:0,mood:u}}var Bi=[[1,[[100,106,()=>O(100,106,54,15,l.sky,l.skyDark,-3)]]],[2,[[70,98,()=>O(70,98,26,19,l.coral,l.coralDark,-12)],[135,92,()=>ge(135,92,l.sun,l.coral,24)]]],[3,[[112,86,()=>O(112,86,36,21,l.mint,l.mintDark,8)],[74,80,()=>O(74,80,22,16,l.pink,l.pinkDark,-10)]]],[4,[[96,66,()=>yt(96,66,l.sun,l.sunDark,-14,0.98)],[138,70,()=>ge(138,70,l.lilac,l.cream,34)]]],[5,[[122,52,()=>O(122,52,26,18,l.lilac,l.lilacDark,14)],[74,48,()=>O(74,48,25,17,l.sky,l.skyDark,-18)]]],[6,[[100,32,()=>yt(100,32,l.coral,l.coralDark,10,0.9)],[142,42,()=>O(142,42,16,13,l.mint,l.mintDark,20)],[58,40,()=>ge(58,40,l.pink,l.cream,-38,0.9)]]]];function qi(){let e=[132,148,164];return[d`<path d="M36 114H164L154 174Q153 180 146 180H54Q47 180 46 174Z" fill=${l.wicker} />`,e.map((t)=>d`<rect x=${42+(t-132)*0.14} y=${t} width=${116-(t-132)*0.28} height="5" rx="2.5" fill=${l.wickerDark} opacity=".55" />`),d`<rect x="29" y="108" width="142" height="17" rx="8.5" fill=${l.wickerLight} />`,d`<rect x="86" y="112.5" width="28" height="8" rx="4" fill=${l.wickerDark} />`]}var Ki="#5b3413";function ji(e){return[qi(),Se(100,150,e,Ki,1.05)]}function Zi(e){return Bi.filter(([t])=>e>=t).map(([t,r])=>g("pile-step",r.map(([,,n])=>n()),t))}function Yi(){return g("overflow",[ge(34,164,l.sky,l.cream,62,0.82),O(170,172,20,10,l.coral,l.coralDark,6),b(160,106,T("wobble",ge(0,22,l.mint,l.sun,-18,0.92)))])}function Gi(e){let t=[[22,100],[178,96],[172,46]],r=[[34,44],[146,20],[58,18]];return[de(100,182,70),d`<ellipse cx="100" cy="112" rx="62" ry="9" fill=${l.wickerDark} />`,Zi(e.pile),R(e.overflow,Yi),ji(e.mood),dr(t.slice(0,e.stench)),r.slice(0,e.flies).map(([n,s],i)=>ur(n,s,i))]}function Qi(){return[d`<rect x="42" y="172" width="20" height="9" rx="3" fill=${l.metalDark} /><rect x="138" y="172" width="20" height="9" rx="3" fill=${l.metalDark} />`,d`<rect x="32" y="22" width="136" height="154" rx="16" fill=${l.metal} />`,d`<path d="M32 66V38a16 16 0 0 1 16-16H152a16 16 0 0 1 16 16V66Z" fill=${l.metalMid} />`,d`<circle cx="56" cy="44" r="11.5" fill=${l.metal} /><rect x="54" y="33" width="4" height="12" rx="2" fill=${l.metalDark} />`,d`<circle cx="100" cy="118" r="47" fill=${l.metalMid} />`]}function Xi(e,t){return d`<circle cx=${e} cy="44" r="4.5" fill=${t?l.mint:l.metalDark} />`}function Kn(e,t){return[Qi(),[0,1,2].map((r)=>Xi(132+r*14,r<t)),Se(100,42,e,l.fly,0.85)]}function jn(e){return b(100,181,b(-100,-181,e),0,0.84)}function Je(e,t,r,n){return g("bubble",b(e,t,T("rise",d`<circle r=${r} fill=${l.water} opacity=".22" /><circle r=${r} fill="none" stroke="#d6f2ff" stroke-width="2.4" /><circle cx=${-r*0.35} cy=${-r*0.35} r=${r*0.22} fill="#fff" />`,n)))}function Ji(){let e=[O(0,-18,15,12,l.coral,l.coralDark,20),O(16,11,14,11,l.sun,l.sunDark,140),O(-16,10,14,12,l.mint,l.mintDark,250)];return[g("drum",b(100,118,T("spin",e))),b(100,118,T("slosh",d`<path d="M-37 8Q-27 1-18 7T0 7T18 7T37 8A38 38 0 0 1-37 8Z" fill=${l.water} opacity=".78" /><g fill="#eaf8ff"><circle cx="-20" cy="6" r="5" /><circle cx="-10" cy="4" r="6.5" /><circle cx="4" cy="6" r="5" /><circle cx="17" cy="4" r="6" /><circle cx="27" cy="7" r="3.5" /></g>`))]}function ea(){return g("shake",[[28,102,"M0 0q-6 12 0 24"],[18,124,"M0 0q-6 12 0 24"],[172,102,"M0 0q6 12 0 24"],[182,124,"M0 0q6 12 0 24"]].map(([t,r,n],s)=>b(t,r,T("flicker",d`<path d=${n} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,s%2+1))))}function ta(e){return[de(100,183,76),g("machine",T("rumble",jn([Kn(e.mood,2),d`<circle cx="100" cy="118" r="39" fill=${l.glass} />`,Ji(),d`<circle cx="100" cy="118" r="39" fill="none" stroke=${l.metalDark} stroke-width="6" />`,d`<path d="M74 100a32 32 0 0 1 22-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`]))),Je(142,44,11,1),Je(58,40,8,2),Je(174,58,7,3),Je(26,62,9,4),Je(100,36,6,5),ea(),dr([[68,44],[132,44],[100,40]].slice(0,e.stench))]}function ra(e,t,r,n){return g("cloud",b(e,t,T("drift",d`<g fill=${l.musty} opacity=".9"><circle cx="-16" cy="4" r="13" /><circle cx="3" cy="-5" r="17" /><circle cx="20" cy="5" r="12" /><rect x="-27" y="3" width="56" height="14" rx="7" /></g><path d="M-14 6q3 3 6 0M4 6q3 3 6 0" fill="none" stroke=${l.mustyDark} stroke-width="3" stroke-linecap="round" />`,n),0,r))}function na(){return g("wet-clothes",[O(100,120,26,20,"#3b6f93","#2b5473",-6),O(84,136,18,13,"#a55a55","#7f413e",12),O(114,139,19,13,"#3f8f76","#2e6e5a",-10),d`<path d="M70 139Q71 164 80 172Q88 164 86 142Z" fill="#a55a55" />`,d`<path d="M112 142Q112 160 120 166Q128 160 128 139Z" fill="#3f8f76" />`])}function sa(){return g("door",[d`<ellipse cx="38" cy="118" rx="17" ry="46" fill=${l.metalDark} />`,d`<ellipse cx="38" cy="118" rx="11" ry="35" fill=${l.glass} />`,d`<path d="M33 96q-3 12-2 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`])}function ia(){return g("drip",[[84,173,1],[119,168,2],[101,166,3]].map(([e,t,r])=>b(e,t,T("drip",Oe(0,0,l.water,0.85),r))))}function aa(){return g("ding",b(170,54,T("pulse",d`<path d="M-14 4a14 14 0 0 1 28 0v5l5 7H-19l5-7ZM-5 19a5 5 0 0 0 10 0Z" fill=${l.sun} />`),-16))}function oa(){return d`<ellipse cx="94" cy="184" rx="30" ry="6" fill=${l.water} opacity=".65" data-part="puddle" />`}function la(e){let t=[[148,30,1],[50,32,0.9],[100,18,0.72]],r=[[176,96],[20,92]];return[de(100,183,76),oa(),g("machine",jn([Kn(e.mood,3),d`<circle cx="100" cy="118" r="39" fill="#141a33" />`,na(),sa()])),ia(),aa(),t.slice(0,e.cloud).map(([n,s,i],a)=>ra(n,s,i,a+1)),r.slice(0,e.flies).map(([n,s],i)=>ur(n,s,i))]}function ca(e,t){return d`<rect x=${e-2.5} y=${t-7} width="5" height="13" rx="2" fill=${l.sun} />`}var qn=[{x:50,y:77,pegs:[[38,50],[62,53]],art:()=>T("sway",yt(0,0,l.sky,l.skyDark,0,1.12),1)},{x:102,y:58,pegs:[[89,55],[115,55]],art:()=>T("sway",[ge(-13,25,l.coral,l.cream,0,0.92),ge(13,25,l.coral,l.cream,0,0.92)],2)},{x:164,y:52,pegs:[[150,53],[178,50]],art:()=>T("sway",d`<rect x="-20" y="0" width="40" height="66" rx="5" fill=${l.sun} /><rect x="-20" y="44" width="40" height="8" fill=${l.coral} /><rect x="-20" y="55" width="40" height="4" fill=${l.coral} />`,3)}];function da(){return d`<path d="M-4 44Q100 66 204 44" fill="none" stroke="#bfe8e0" stroke-width="4" />`}function ua(){return g("folded",[de(100,181,54),d`<rect x="58" y="162" width="84" height="16" rx="7" fill=${l.lilac} />`,d`<rect x="63" y="147" width="74" height="16" rx="7" fill=${l.mint} />`,d`<rect x="68" y="132" width="64" height="16" rx="7" fill=${l.cream} />`,d`<path d="M66 170h68M71 155h58M76 140h48" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round" />`])}var pa=[[30,134,1.3,1],[168,138,1.05,2],[100,112,0.9,3],[180,26,0.8,4]];function ha(){return[da(),g("line",[qn.map((e)=>b(e.x,e.y,e.art())),qn.flatMap((e)=>e.pegs.map(([t,r])=>ca(t,r)))]),ua(),pa.map(([e,t,r,n])=>H(e,t,r,n))]}function Zn(e,t){let r=Wi(e);return fe("laundry",e,t,{basket:()=>Gi(r),washing:()=>ta(r),wet:()=>la(r),drying:ha}[r.view]()??p)}var tt=[[52,72],[84,72],[116,72],[148,72],[52,124],[84,124],[116,124]],Gn="#8f8a84",Qn="#aaa497",ma=E(l.coral,Gn,0.5),fa=E(l.cream,Qn,0.5),ga=0.35,ya=[0.15,0.45,0.75],_a=[0.25,0.5,0.75];function ba(e,t=3){let{state:r,stink:n,fill:s}=e,i=Number.isFinite(t)?(Math.trunc(t)%7+7)%7:3,a=e.slots?.length===tt.length?e.slots:void 0,o=a??tt.map((v,S)=>S<i?"taken":"full"),u=i;if(a)u=r==="clean"?a.lastIndexOf("taken"):a.indexOf("current");let m=a?.[u]==="current",y=r==="clean"?0:X(n,ya),k={resting:"quiet",accumulating:"quiet",due:"ready",running:"lifted",waiting:"taken-pending",clean:"popped"}[r],h=r==="resting"?"sleepy":"calm";if(r==="due")h="pleading";if(r==="clean"||r==="running")h="happy";if(y>=1)h="worried";if(y>=2)h="sick";return{day:u,cells:o,phase:k,pulse:r==="due"||m,glow:r==="accumulating"?X(s,_a):0,neglect:y,fade:r==="clean"?0:Q(n)*0.7,tilt:[0,-3,-6,-10][y]??0,mood:h}}function et(e,t,r=0.6){return d`
    <rect x="-10" y="-22" width="20" height="44" rx="10" fill=${e} />
    <path d="M-10 0H10V12A10 10 0 0 1-10 12Z" fill=${t} />
    <rect x="-5.5" y="-16" width="4" height="13" rx="2" fill="#fff" opacity=${r} />
  `}function Ve(e,t,r){return r?d`<rect x=${e-13} y=${t-25} width="26" height="50" rx="13" fill="#545c78" /><path d=${`M${e-8} ${t+8}a8 11 0 0 0 16 0`} fill="none" stroke="#7d86a3" stroke-width="3.4" stroke-linecap="round" />`:d`<rect x=${e-13.5} y=${t-25.5} width="27" height="51" rx="13.5" fill=${l.metal} />`}function va(e,t,r){return b(e,t,et(E(ma,Gn,r),E(fa,Qn,r),ga))}function Yn(e,t){return g("glass",b(e,t,[d`<path d="M-17-30H17L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="#cfe8ff" opacity=".35" />`,d`<path d="M-15.5-10H15.5L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill=${l.water} />`,d`<path d="M-9-2L-7 22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`]))}function ka(e,t){return g("check",b(e,t,[d`<circle r="19" fill=${l.check} /><path d="M-9 0l6.5 7L9.5-7" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`]))}function $a(e){return g("dust",[[44,46,2.6],[132,104,2.2],[150,134,3],[66,100,2],[104,46,2.4],[36,148,2.2],[128,150,2.8],[92,98,2.2]].slice(0,e*3).map(([r,n,s])=>d`<circle cx=${r} cy=${n} r=${s} fill="#b9b3a3" opacity=".85" />`))}function xa(){return g("cobweb",d`<g fill="none" stroke=${"#d7dce8"} stroke-width="2" stroke-linecap="round" opacity=".8">
      <path d="M200 28L146 34M200 28L154 8M172 0L166 22" />
      <path d="M178 2Q180 14 200 16M162 6Q164 24 200 40M150 18Q156 34 170 28" />
    </g>`)}function wa(){return g("spider",[d`<path d="M160 24V66" stroke="#d7dce8" stroke-width="1.8" />`,b(160,70,T("bob",d`<g fill="none" stroke=${l.fly} stroke-width="2.6" stroke-linecap="round">
            <path d="M-6-3L-15-9M-6 0L-16 0M-6 3L-15 9M6-3L15-9M6 0L16 0M6 3L15 9" />
          </g><circle r="9" fill=${l.fly} stroke=${l.wing} stroke-width="1.4" /><circle cx="-3.2" cy="-1.5" r="2.1" fill="#fff" /><circle cx="3.2" cy="-1.5" r="2.1" fill="#fff" />`))])}function Xn(e,t){let r=ba(e,t?.day),n=E(l.metalMid,"#8c8a80",r.fade),s=E(l.coral,"#a59a90",r.fade),i=E(l.cream,"#b3ad9e",r.fade),a=E(l.sun,"#a59a90",r.fade),o=tt[r.day]??tt[3]??[84,72],[u,m]=o,y=tt.flatMap(([J,ee],te)=>{if(te===r.day)return[];let Fe=r.cells[te];if(Fe==="taken")return[g("empty-well",Ve(J,ee,!0),te)];if(Fe==="missed")return[g("missed-pill",[Ve(J,ee,!1),va(J,ee,r.fade)],te)];return[g("pill",[Ve(J,ee,!1),b(J,ee,et(s,i))],te)]}),_=r.day>=0,k=(J)=>b(u,m,r.pulse?T("pulse",J):J),h=r.phase==="ready"?1:Math.max(r.glow*0.3,r.pulse?0.45:0),v=R(r.pulse||r.glow>0,()=>g("halo",k(d`<rect x="-18.5" y="-30.5" width="37" height="61" rx="18.5" fill="none" stroke=${l.sun} stroke-width="5" opacity=${h} />`))),S;if(!_)S=p;else if(r.phase==="popped"||r.phase==="taken-pending")S=[v,g("empty-well",Ve(u,m,!0),r.day)];else if(r.phase==="lifted")S=[v,g("empty-well",Ve(u,m,!0),r.day),g("next-pill",b(u,m-16,T("bob",et(a,i)),18),r.day)];else S=[v,Ve(u,m,!1),g("next-pill",b(u,m,r.pulse?T("throb",et(a,i)):et(a,i)),r.day)];let N=r.phase==="popped"||r.phase==="taken-pending",Tt=b(N?86:100,N?90:100,b(-100,-100,[d`<rect x="30" y="36" width="140" height="124" rx="16" fill=${n} />`,d`<path d="M30 92H170" stroke=${E(l.metalDark,"#6d6b62",r.fade)} stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" />`,y,S,Se(148,124,r.mood,E(l.fly,"#4d4b45",r.fade),0.82),R(r.neglect>0,()=>$a(r.neglect)),R(_&&r.phase==="popped",()=>ka(u,m))]),r.tilt,N?0.84:1),be=[];if(r.phase==="popped")be.push(Yn(168,146),H(26,30,1.2,1),H(178,34,0.95,2),H(24,130,0.85,3));if(r.phase==="taken-pending")be.push(Yn(168,146));if(r.neglect>=2)be.push(xa());if(r.neglect>=3)be.push(wa());return fe("pills",e,t,[de(100,176,72),Tt,be])}var bt=4,Ta=[0.1,0.4,0.75];function Sa(e){let{state:t,fill:r,stink:n}=e;if(t==="clean")return{droop:0,wilt:0,petals:8,fallen:0,wet:!0,drops:!0,can:!1,thirst:!1,mood:"happy"};let s=X(n,Ta);if(t==="running"||t==="waiting")return{droop:Math.min(1,Math.floor(r*(bt+1))),wilt:s,petals:8-s*2,fallen:s,wet:!0,drops:!1,can:t==="running",thirst:!1,mood:t==="running"?"happy":"calm"};let i=Math.min(bt,Math.floor(r*(bt+1))),a=t==="due"?bt:i,o=t==="resting"?"sleepy":a>=2?"worried":"calm";if(t==="due")o="pleading";if(s>=2)o="sick";return{droop:a,wilt:s,petals:8-s*2,fallen:s,wet:!1,drops:!1,can:!1,thirst:t==="due",mood:o}}var Jn=78,es="M0 0C-14-7-15-27 0-40C15-27 14-7 0 0Z",Ea=[0.12,0.65,1.3,1.95,2.55];function rt(e,t){let r=Jn*t;if(Math.abs(e)<0.001)return{x:0,y:-r,angle:0};let n=e/Jn;return{x:(1-Math.cos(n*r))/n,y:-Math.sin(n*r)/n,angle:n*r}}function ts(e){return e*180/Math.PI}function Ma(e){return Array.from({length:9},(r,n)=>rt(e,n/8)).map((r,n)=>`${n?"L":"M"}${M(r.x)} ${M(r.y)}`).join("")}function Aa(e,t,r){return[Array.from({length:8},(s,i)=>i).filter((s)=>s<e).map((s)=>d`<ellipse cx="0" cy="-17" rx="8" ry="12" transform=${`rotate(${s*45})`} fill=${t} data-part="petal" />`),d`<circle r="11" fill=${r} />`]}function mr(e,t,r,n,s,i){return b(e.x,e.y,[d`<path d=${es} fill=${n} />`,d`<path d="M0-4V-32" stroke=${s} stroke-width="2.6" stroke-linecap="round" />`],ts(e.angle)+t*r,i)}function Ca(){return g("watering-can",[b(150,42,[d`<rect x="-20" y="-14" width="46" height="34" rx="7" fill=${l.sky} />`,d`<path d="M-20-2L-48-20" stroke=${l.sky} stroke-width="8" stroke-linecap="round" />`,d`<rect x="-56" y="-30" width="9" height="20" rx="3" transform="rotate(-32 -52 -20)" fill=${l.skyDark} />`,d`<path d="M26-6a14 14 0 0 1 0 22" fill="none" stroke=${l.skyDark} stroke-width="6" stroke-linecap="round" />`],-10),[[92,60,1],[104,74,2],[84,82,3],[96,96,4]].map(([e,t,r])=>b(e,t,T("fall",Oe(0,0,l.water,0.9),r)))])}function rs(e,t){let r=Sa(e),n=r.wilt/3,s=(Ea[r.droop]??0)+r.wilt*0.12,i=E(l.leaf,"#9b7a3e",n),a=E(l.leafDark,"#7a5d2c",n),o=E(l.leafDark,"#7f6a35",n),u=E(l.pink,"#a98a6b",n),m=E(l.sun,"#8d6b37",n),y=52+r.droop*14,_=rt(s,1),k=r.droop===0&&r.wilt===0&&!r.can,h=[d`<path d=${Ma(s)} fill="none" stroke=${o} stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />`,mr(rt(s,0.26),-1,y,i,a,1.05),mr(rt(s,0.48),1,y,i,a,1),mr(rt(s,0.7),-1,y+8,i,a,0.82),g("flower",b(_.x,_.y,Aa(r.petals,u,m),ts(_.angle),0.98))],v=[[46,172,-30],[158,176,40],[62,180,70]].slice(0,r.fallen).map(([S,N,ae],Ie)=>g("fallen-leaf",b(S,N,[d`<path d=${es} fill=${E("#9b7a3e","#6d4f28",r.wilt/3)} />`],ae,0.5),Ie));return fe("plant",e,t,[de(100,183,52),v,b(100,138,g("stem",k?T("sway",h):h)),d`<path d="M62 134H138L130 176Q129 182 122 182H78Q71 182 70 176Z" fill=${l.terracotta} />`,d`<rect x="55" y="122" width="90" height="19" rx="8" fill=${l.terracottaDark} />`,d`<ellipse cx="100" cy="124" rx="38" ry="4.5" fill=${r.wet?l.soilWet:l.soil} data-part="soil" />`,R(!r.wet&&r.wilt>0,()=>g("cracks",d`<path d="M78 124l6 2 3-2M108 123l5 2 4-2" fill="none" stroke="#7a5a44" stroke-width="2" stroke-linecap="round" />`)),Se(100,158,r.mood,"#5b2612",0.95),R(r.thirst,()=>g("thirst",[d`<circle cx="64" cy="82" r="4.5" fill=${l.cream} /><circle cx="54" cy="69" r="7.5" fill=${l.cream} />`,b(42,40,T("pulse",[d`<circle r="24" fill=${l.cream} />`,Oe(0,1,l.waterDark,1.7)]))])),R(r.can,Ca),R(r.drops,()=>g("drops",[[52,34,1],[148,26,2],[32,80,3],[170,74,4]].map(([S,N,ae])=>b(S,N,T("fall",Oe(0,0,l.water,1.05),ae))))),R(r.drops,()=>[H(40,112,1,2),H(164,118,0.85,3),H(100,16,0.9,1)])])}var ns={generic:pr,laundry:Zn,pills:Xn,plant:rs};function Pa(e){return Object.hasOwn(ns,e)}function Da(e){return Pa(e)?ns[e]:pr}function q(e,t){return Da(e.name)(e,t)}var Ra={check:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",undo:"M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z",skip:"M16,18H18V6H16M6,18L14.5,12L6,6V18Z",bolt:"M7,2V13H10V22L17,10H13L17,2H7Z",menu:"M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",plus:"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",up:"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",down:"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",trash:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",alert:"M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",chevron:"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z",list:"M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z",tiles:"M3,3H11V11H3V3M13,3H21V11H13V3M3,13H11V21H3V13M13,13H21V21H13V13Z"};function D(e){return c`<svg class="ht-icon" viewBox="0 0 24 24" aria-hidden="true">
    ${d`<path d=${Ra[e]} fill="currentColor"></path>`}
  </svg>`}function vt(e,t){let{tracker:r}=t,n=t.ids?.length?t.ids:void 0,s=e.filter((a)=>{if(n&&!n.includes(a.task_id))return!1;if(t.show==="all")return!0;return a.is_today||a.status==="clean"||(r?.isRecent(a.task_id)??!1)});if(n)return s.toSorted((a,o)=>n.indexOf(a.task_id)-n.indexOf(o.task_id));return s.map((a)=>({view:a,key:r?.frozenKey(a.task_id)??Re(a)})).toSorted((a,o)=>gt(a.key,o.key)).map(({view:a})=>a)}function Le(e){return e.status==="due"||e.status==="overdue"||e.status==="in_progress"}function Ha(e){let t=/^#([0-9a-f]{6})$/i.exec(e);if(!t?.[1])return;let r=Number.parseInt(t[1],16),n=(i)=>r>>i&255;return 0.299*n(16)+0.587*n(8)+0.114*n(0)>150?"#14182a":"#ffffff"}function ss(e){let{wall:t,floor:r}=Un(e.scene),n={"--ht-wall":t,"--ht-floor":r};if(!e.color)return n;let s=Ha(e.color);return{...n,"--ht-task":e.color,...s?{"--ht-on-task":s}:{}}}function Oa(e,t){if(e.action)return e.action;if(e.stage_index===0&&e.stage_count>1)return t.t("action_start");return t.t("action_advance")}function is(e,t){return q(e.scene,{animations:t.animations,bleed:!0,day:t.day,label:`${e.title}: ${t.i18n.t(`status_${e.status}`)}`})}function as(e){if(!e.icon||e.scene.name!=="generic")return p;return c`<span class="badge" aria-hidden="true"><ha-icon .icon=${e.icon}></ha-icon></span>`}function Va(e,t){let{i18n:r,tracker:n}=t,s=e.task_id,i=n.justCompleted(s),a=!e.can_advance,o=!i&&!a&&ar(e),u=o&&n.isArmed(s),m=Oa(e,r);if(i)m=r.t("status_done");else if(a)m=r.t(`status_${e.status}`);else if(o)m=r.t(u?"action_early_confirm":"action_early");let y=!u&&(!Le(e)||e.automated);return c`<button
    class="go ${y?"quiet":"loud"} ${i?"finished":""}"
    data-action="advance"
    aria-label="${m}: ${e.title}"
    ?disabled=${a||i||t.offline}
    ?data-pending=${n.isPending(s)}
    @click=${()=>{n.press(e)}}
  >
    ${i?D("check"):p}
    <span>${m}</span>
  </button>`}function os(e,t){return e.can_undo&&t.tracker.isRecent(e.task_id)}function ls(e,t){let{i18n:r,tracker:n}=t;if(!os(e,t))return p;return c`<button
    class="undo ${t.animations?"enter":""}"
    data-action="undo"
    aria-label="${r.t("action_undo")}: ${e.title}"
    ?disabled=${t.offline||n.isPending(e.task_id)}
    @click=${()=>{n.undo(e)}}
  >
    ${D("undo")}
  </button>`}function La(e,t){if(!t.animations||t.tracker.celebration(e.task_id)!=="done")return p;return c`<span class="burst" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </span>`}function Na(e,t){if(e.stage_count<2||e.stage_count>8)return p;let r=t.i18n.t("stage_progress",{current:e.stage_index+1,total:e.stage_count});return c`<span class="dots" role="img" aria-label=${r}>
    ${Array.from({length:e.stage_count},(n,s)=>c`<i
          class=${s<e.stage_index?"past":s===e.stage_index?"now":""}
        ></i>`)}
  </span>`}function Ia(e,t){return c`<div class="stage">
    ${Na(e,t)}<span class="stage-name">${e.stage_title}</span>
    ${e.automated?c`<span class="auto" data-part="automated"
            >${D("bolt")}${t.i18n.t("automated")}</span
          >`:p}
  </div>`}function Fa(e,t){let r=t.tracker.error(e.task_id);return r?c`<div class="due failed" role="alert">
        ${t.i18n.t("error_generic",{message:r})}
      </div>`:c`<div class="due">${t.i18n.dueText(e,t.now)}</div>`}function cs(e,t,r){let n=t.animations?t.tracker.celebration(e.task_id):void 0;return`${r} is-${e.status}${n?` pop-${n}`:""}`}function Ua(e,t,r){let{i18n:n,tracker:s}=t;if(!r||!e.can_skip||!Le(e))return p;return c`<button
    class="skip"
    data-action="skip"
    aria-label="${n.t("action_skip")}: ${e.title}"
    ?disabled=${t.offline||s.isPending(e.task_id)}
    @click=${()=>{s.skip(e)}}
  >
    ${D("skip")}
  </button>`}function ds(e,t){let r=t.tracker.error(e.task_id)!==void 0;return c`<div class="text">
    <div class="title">${e.title}</div>
    <div class="meta">
      ${r?p:Ia(e,t)}
      <div class="when">${Fa(e,t)}</div>
    </div>
  </div>`}function us(e,t,r){return c`<div class="actions">
    <div class="go-wrap">${Va(e,t)}${La(e,t)}</div>
    ${Ua(e,t,r)}
  </div>`}function kt(e,t,r={}){return c`<div
    class=${cs(e,t,"row")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${or(ss(e))}
  >
    <div class="thumb">${is(e,t)} ${as(e)}</div>
    ${ds(e,t)} ${ls(e,t)}
    ${us(e,t,r.skip===!0&&!os(e,t))}
  </div>`}function $t(e,t,r={}){return c`<article
    class=${cs(e,t,"tile")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${or(ss(e))}
  >
    <div class="art">${is(e,t)} ${as(e)} ${ls(e,t)}</div>
    ${ds(e,t)} ${us(e,t,r.skip===!0)}
  </article>`}function nt(e,t){return Array.from({length:e},()=>c`<div class="${t} skeleton" aria-hidden="true"></div>`)}var ie=A`
  .ht-icon {
    width: 20px;
    height: 20px;
    flex: none;
  }
`,xt=A`
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
`;var K=A`
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
`,ye=A`
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
`,_e=A`
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
`;var fr={tasks:[],i18n:Gt(typeof navigator>"u"?"en":navigator.language)},ps={title:"config_title",show:"config_show",layout:"config_layout",tasks:"config_tasks",animations:"config_animations"};function za(e){if(e.show!==void 0&&e.show!=="today"&&e.show!=="all")throw Error('show must be "today" or "all"');if(e.layout!==void 0&&e.layout!=="list"&&e.layout!=="scenes")throw Error('layout must be "list" or "scenes"');if(e.tasks!==void 0&&!Array.isArray(e.tasks))throw Error("tasks must be a list of task ids")}class gr extends P{static properties={hass:{attribute:!1,hasChanged:me},config:{state:!0}};static styles=[K,ie,_e,xt,A`
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
    `];static getConfigForm(){let{i18n:e,tasks:t}=fr;return{schema:[{name:"title",selector:{text:{}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"today",label:e.t("config_show_today")},{value:"all",label:e.t("config_show_all")}]}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"list",label:e.t("config_layout_list")},{value:"scenes",label:e.t("config_layout_scenes")}]}}},{name:"tasks",selector:{select:{multiple:!0,custom_value:!0,options:t}}},{name:"animations",selector:{boolean:{}}}],computeLabel:(r)=>{let n=Object.hasOwn(ps,r.name)?ps[r.name]:void 0;return n?e.t(n):void 0}}}static getStubConfig(){return{show:"today",layout:"list",animations:!0}}live;tracker;constructor(){super();this.config={},this.live=new Qe(this,()=>this.hass,(e)=>{this.updateCatalog(e)}),this.tracker=new Xe(this,()=>this.hass)}setConfig(e){za(e),this.config={...e}}getCardSize(){let e=this.views(),t=this.config.layout==="scenes"?5:2;return Math.max(2,1+Math.max(1,e.length)*t)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}willUpdate(e){if(e.has("hass")){if(this.live.sync(),this.hass)fr.i18n=z(this.hass)}}updateCatalog(e){fr.tasks=e.tasks.map((t)=>({value:t.id,label:t.title}))}views(){let{state:e}=this.live;if(!e)return[];return vt(e.views,{show:this.config.show??"today",ids:this.config.tasks,tracker:this.tracker})}context(e,t){let{now:r}=this.live;return{i18n:t,tracker:this.tracker,now:r,animations:this.config.animations!==!1&&!ft(),day:Ge(r,se(e)),offline:Te(e)}}body(e,t,r){let{state:n,failed:s}=this.live;if(s&&!n)return c`<div class="message" role="alert">
        <strong>${t.t("card_error")}</strong>
        <span>${t.t("card_error_hint")}</span>
      </div>`;if(!n)return c`<div
        class=${r?"tiles":"list"}
        aria-busy="true"
        aria-label=${t.t("card_loading")}
      >
        ${nt(2,r?"tile":"row")}
      </div>`;let i=this.views();if(i.length===0)return this.empty(t);let a=this.context(e,t);return c`<div class=${r?"tiles":"list"}>
      ${B(i,(o)=>o.task_id,(o)=>r?$t(o,a):kt(o,a))}
    </div>`}empty(e){return c`<div class="empty" data-part="empty">
      <div class="thumb">
        ${q({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:!1})}
      </div>
      <div>${e.t("card_empty")}</div>
    </div>`}render(){let{hass:e}=this;if(!e)return p;let t=z(e),r=this.config.layout==="scenes",n=this.live.state?this.views().filter((s)=>Le(s)).length:0;return c`<ha-card>
      <header>
        <h2>${this.config.title??t.t("card_title")}</h2>
        ${Te(e)?c`<span class="offline" role="status"
                >${D("alert")}${t.t("disconnected")}</span
              >`:n>0?c`<span class="count">${t.plural("tasks_due",n)}</span>`:p}
      </header>
      ${this.body(e,t,r)}
    </ha-card>`}}var yr=(e)=>e??p;var Wa=["generic","pills","laundry","plant"],Ba=["once","daily","weekly","interval"],qa=[0,1,2,3,4,5,6];function Ne(e){let{target:t}=e;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement)return t.value;return""}function hs(e){let{target:t}=e;return t instanceof HTMLInputElement&&t.checked}class _r extends P{static properties={hass:{attribute:!1},source:{attribute:!1},now:{attribute:!1},readonly:{type:Boolean},form:{state:!0},showErrors:{state:!0},saving:{state:!0},failure:{state:!0},picker:{state:!0},confirming:{state:!0}};static styles=[K,ye,ie,_e,A`
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
    `];constructor(){super();this.now=new Date,this.readonly=!1,this.form=null,this.showErrors=!1,this.saving=!1,this.failure=null,this.picker=null,this.confirming=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||!this.form)return!0;let t=e.get("hass");if(!mt(t)||this.picker!==null)return!0;return this.form.stages.some((r)=>t.states[r.entity]!==this.hass.states[r.entity])}willUpdate(e){if(e.has("source"))this.form=vn(this.source,se(this.hass),this.now),this.showErrors=!1,this.failure=null,this.confirming=!1}patch(e){if(this.form)this.form={...this.form,...e}}patchStage(e,t){if(!this.form)return;this.patch({stages:this.form.stages.map((r,n)=>n===e?{...r,...t}:r)})}errors(e){return this.showErrors?nr(e,se(this.hass)):{}}async save(){let e=this.form;if(!e||this.readonly||this.saving)return;let t=se(this.hass);if(Object.keys(nr(e,t)).length>0){this.showErrors=!0,await this.updateComplete,this.renderRoot.querySelector('[aria-invalid="true"]')?.scrollIntoView?.({block:"center"});return}this.saving=!0,this.failure=null;try{let r=xn(e,t);if(r.id===void 0)await ln(this.hass,r);else await cn(this.hass,{...r,id:r.id});this.close()}catch(r){this.failure=ce(r)}finally{this.saving=!1}}async removeTask(){let e=this.form?.id;if(!e||this.readonly)return;this.saving=!0,this.failure=null;try{await dn(this.hass,e),this.close()}catch(t){this.failure=ce(t)}finally{this.saving=!1}}close=()=>{this.dispatchEvent(new CustomEvent("ht-close",{bubbles:!0,composed:!0}))};message(e,t){if(!e)return p;return c`<span class="err" role="alert">${t.t(e.key,e.vars)}</span>`}input(e){let{path:t,label:r,value:n,errors:s,i18n:i,onInput:a}=e;return c`<label class="ht-label">
      ${r}
      <input
        class="ht-input"
        data-field=${t}
        type=${e.type??"text"}
        inputmode=${yr(e.inputmode)}
        placeholder=${yr(e.placeholder)}
        aria-invalid=${s[t]?"true":"false"}
        .value=${n}
        ?disabled=${this.readonly}
        @input=${(o)=>{a(Ne(o))}}
      />
      ${e.hint?c`<span class="hint">${e.hint}</span>`:p}
      ${this.message(s[t],i)}
    </label>`}select(e){let{path:t,label:r,value:n,choices:s,onChange:i}=e;return c`<label class="ht-label">
      ${r}
      <select
        class="ht-input"
        data-field=${t}
        ?disabled=${this.readonly}
        @change=${(a)=>{let o=s.find((u)=>u.value===Ne(a));if(o)i(o.value)}}
      >
        ${s.map((a)=>c`<option value=${a.value} ?selected=${a.value===n}>
              ${a.label}
            </option>`)}
      </select>
    </label>`}renderDetails(e,t,r){return c`<section>
      <h3>${r.t("section_details")}</h3>
      ${this.input({path:"title",label:r.t("field_title"),value:e.title,errors:t,i18n:r,onInput:(n)=>{this.patch({title:n})}})}
      <div class="ht-label">
        ${r.t("field_scene")}
        <div class="scenes">
          ${Wa.map((n)=>c`<button
                type="button"
                class="scene"
                data-scene=${n}
                aria-pressed=${e.scene===n?"true":"false"}
                ?disabled=${this.readonly}
                @click=${()=>{this.patch({scene:n})}}
              >
                <span class="scene-art">
                  ${q({name:n,state:"accumulating",fill:0.6,stink:0,progress:0},{animations:!1})}
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
              @input=${(n)=>{this.patch({color:Ne(n)})}}
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
          @input=${(n)=>{this.patch({notes:Ne(n)})}}
        ></textarea>
      </label>
      ${this.renderAssignee(e,t,r)}
      <label class="check">
        <input
          type="checkbox"
          data-field="enabled"
          .checked=${e.enabled}
          ?disabled=${this.readonly}
          @change=${(n)=>{this.patch({enabled:hs(n)})}}
        />
        ${r.t("field_enabled")}
      </label>
    </section>`}renderAssignee(e,t,r){let n=Object.values(this.hass.states).filter((s)=>s.entity_id.startsWith("person."));return c`<label class="ht-label">
      ${r.t("field_assignee")}
      <input
        class="ht-input"
        data-field="assignee"
        list="ht-people"
        placeholder=${r.t("hint_assignee")}
        .value=${e.assignee}
        ?disabled=${this.readonly}
        aria-invalid=${t.assignee?"true":"false"}
        @input=${(s)=>{this.patch({assignee:Ne(s)})}}
      />
      <datalist id="ht-people">
        ${n.map((s)=>c`<option value=${s.entity_id}></option>`)}
      </datalist>
    </label>`}renderSchedule(e,t,r){let n=this.input({path:"time",label:r.t("field_time"),value:e.time,type:"time",errors:t,i18n:r,onInput:(i)=>{this.patch({time:i})}}),s;switch(e.schedule){case"once":s=this.input({path:"due",label:r.t("field_due"),value:e.due,type:"datetime-local",errors:t,i18n:r,onInput:(i)=>{this.patch({due:i})}});break;case"daily":s=n;break;case"weekly":s=c`<div class="ht-label">
            ${r.t("field_weekdays")}
            <div class="segments">${qa.map((i)=>this.weekdayButton(e,i,r))}</div>
            ${this.message(t.weekdays,r)}
          </div>
          ${n}`;break;default:s=c`<div class="pair">
            ${this.input({path:"every_days",label:r.t("field_every_days"),value:e.every_days,inputmode:"numeric",errors:t,i18n:r,onInput:(i)=>{this.patch({every_days:i})}})}
            ${n}
          </div>
          ${this.select({path:"anchor",label:r.t("field_anchor"),value:e.anchor,choices:[{value:"completion",label:r.t("anchor_completion")},{value:"schedule",label:r.t("anchor_schedule")}],onChange:(i)=>{this.patch({anchor:i})}})}`;break}return c`<section>
      <h3>${r.t("field_schedule")}</h3>
      <div class="segments" role="group" aria-label=${r.t("field_schedule_type")}>
        ${Ba.map((i)=>c`<button
              type="button"
              class="ht-btn segment"
              data-schedule=${i}
              aria-pressed=${e.schedule===i?"true":"false"}
              ?disabled=${this.readonly}
              @click=${()=>{this.patch({schedule:i})}}
            >
              ${r.t(`schedule_${i}`)}
            </button>`)}
      </div>
      ${s}
    </section>`}weekdayButton(e,t,r){let n=e.weekdays.includes(t);return c`<button
      type="button"
      class="ht-btn segment"
      data-weekday=${t}
      aria-label=${r.weekday(t,"long")}
      aria-pressed=${n?"true":"false"}
      ?disabled=${this.readonly}
      @click=${()=>{this.patch({weekdays:n?e.weekdays.filter((s)=>s!==t):[...e.weekdays,t]})}}
    >
      ${r.weekday(t,"short")}
    </button>`}renderBehaviour(e,t,r){return c`<section>
      <h3>${r.t("section_behaviour")}</h3>
      ${this.select({path:"on_missed",label:r.t("field_on_missed"),value:e.on_missed,choices:[{value:"carry",label:r.t("on_missed_carry")},{value:"skip",label:r.t("on_missed_skip")}],onChange:(n)=>{this.patch({on_missed:n})}})}
      <div class="pair">
        ${this.input({path:"clean_for",label:r.t("field_clean_for"),value:e.clean_for,inputmode:"numeric",hint:r.t("hint_clean_for"),errors:t,i18n:r,onInput:(n)=>{this.patch({clean_for:n})}})}
        ${this.input({path:"grace",label:r.t("field_grace"),value:e.grace,inputmode:"numeric",hint:r.t("hint_grace"),errors:t,i18n:r,onInput:(n)=>{this.patch({grace:n})}})}
      </div>
    </section>`}renderSuggestions(e,t,r){let n=Sn(this.hass.states,e.entity,e.condition);if(n.length===0)return c`<div class="suggestions">
        <div class="no-match">${r.t("entity_no_matches")}</div>
      </div>`;return c`<div
      class="suggestions"
      @mousedown=${(s)=>{s.preventDefault()}}
    >
      ${n.map((s)=>c`<button
            type="button"
            class="suggestion"
            data-entity=${s.entity_id}
            @click=${()=>{this.patchStage(t,{entity:s.entity_id}),this.picker=null}}
          >
            <b>${s.name}</b><small>${s.entity_id}</small><em>${s.state}</em>
          </button>`)}
    </div>`}renderLive(e,t,r){let n=En(e,t);if(!e.entity.trim())return p;let i={met:["trigger_met","met"],unmet:["trigger_unmet","unmet"],unavailable:["entity_unavailable","warn"],missing:["entity_not_found","warn"]}[n];return c`<div class="live" data-part="live" role="status">
      ${t?c`<span class="live-value"
              >${r.t("field_current_value",{value:An(t)})}</span
            >`:p}
      ${i?c`<span class=${i[1]} data-match=${n}>${r.t(i[0])}</span>`:p}
    </div>`}renderTrigger(e,t,r,n){let s=`stages.${t}`,i=wn(this.hass.states,e.entity.trim()),a=[{value:"above",label:n.t("condition_above")},{value:"below",label:n.t("condition_below")},{value:"state",label:n.t("condition_state")}];return c`<div class="rule">
      <label class="check">
        <input
          type="checkbox"
          data-field="${s}.auto"
          .checked=${e.condition!=="none"}
          ?disabled=${this.readonly}
          @change=${(o)=>{this.patchStage(t,{condition:hs(o)?"above":"none"})}}
        />
        ${n.t("field_trigger")}
      </label>
      ${e.condition==="none"?p:c`<div class="picker">
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
                    @input=${(o)=>{this.patchStage(t,{entity:Ne(o)})}}
                  />
                </label>
                ${this.picker===t?this.renderSuggestions(e,t,n):p}
                ${this.message(r[`${s}.entity`],n)}
              </div>
              <div class="pair">
                ${this.select({path:`${s}.condition`,label:n.t("field_condition"),value:e.condition,choices:a,onChange:(o)=>{this.patchStage(t,{condition:o})}})}
                ${this.input({path:`${s}.value`,label:n.t("field_value"),value:e.value,...e.condition==="state"?{}:{inputmode:"decimal"},errors:r,i18n:n,onInput:(o)=>{this.patchStage(t,{value:o})}})}
                ${this.input({path:`${s}.hold`,label:n.t("field_for_seconds"),value:e.hold,inputmode:"numeric",errors:r,i18n:n,onInput:(o)=>{this.patchStage(t,{hold:o})}})}
              </div>
              ${this.renderLive(e,i,n)}`}
      <p class="sentence" data-part="sentence">${Cn(e,i,n)}</p>
    </div>`}renderStage(e,t,r,n,s){let i=`stages.${r}`,a=[{value:"todo",label:s.t("role_todo")},{value:"running",label:s.t("role_running")},{value:"waiting",label:s.t("role_waiting")}];return c`<div class="stage" data-stage=${r}>
      <div class="stage-head">
        <strong>${s.t("field_stage_n",{n:r+1})}</strong>
        ${this.readonly?p:c`<button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_up")}
                  ?disabled=${r===0}
                  @click=${()=>{this.form=tr(e,r,-1)}}
                >
                  ${D("up")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_down")}
                  ?disabled=${r===e.stages.length-1}
                  @click=${()=>{this.form=tr(e,r,1)}}
                >
                  ${D("down")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  data-action="remove-stage"
                  aria-label=${s.t("action_remove")}
                  ?disabled=${e.stages.length===1}
                  @click=${()=>{this.form=$n(e,r)}}
                >
                  ${D("trash")}
                </button>`}
      </div>
      <div class="pair">
        ${this.input({path:`${i}.title`,label:s.t("field_stage_title"),value:t.title,errors:n,i18n:s,onInput:(o)=>{this.patchStage(r,{title:o})}})}
        ${this.input({path:`${i}.action`,label:s.t("field_action"),value:t.action,errors:n,i18n:s,onInput:(o)=>{this.patchStage(r,{action:o})}})}
      </div>
      <div class="pair">
        ${this.select({path:`${i}.role`,label:s.t("field_role"),value:t.role,choices:a,onChange:(o)=>{this.patchStage(r,{role:o})}})}
        ${this.input({path:`${i}.stale`,label:s.t("field_stale_after"),value:t.stale,inputmode:"numeric",hint:s.t("hint_stale_after"),errors:n,i18n:s,onInput:(o)=>{this.patchStage(r,{stale:o})}})}
      </div>
      ${this.renderTrigger(t,r,n,s)}
    </div>`}renderFooter(e,t,r){if(this.readonly)return c`<footer>
        <span class="spacer"></span>
        <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
          ${r.t("action_close")}
        </button>
      </footer>`;if(this.confirming)return c`<footer>
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
      </footer>`;let s=(this.failure===null?null:r.t("error_generic",{message:this.failure}))??(Object.keys(t).length>0?r.t("error_form"):null);return c`<footer>
      ${e.id===null?p:c`<button
              type="button"
              class="ht-btn ht-btn-danger"
              data-action="delete"
              @click=${()=>{this.confirming=!0}}
            >
              ${r.t("action_delete")}
            </button>`}
      ${s===null?c`<span class="spacer"></span>`:c`<span class="message" role="alert">${s}</span>`}
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
    </footer>`}render(){let e=this.form;if(!e)return p;let t=z(this.hass),r=this.errors(e);return c`<div class="form">
      <div class="columns">
        <div class="stack">${this.renderDetails(e,r,t)}</div>
        <div class="stack">
          ${this.renderSchedule(e,r,t)} ${this.renderBehaviour(e,r,t)}
        </div>
      </div>
      <section>
        <h3>${t.t("field_stages")}</h3>
        ${B(e.stages,(n)=>n.id,(n,s)=>this.renderStage(e,n,s,r,t))}
        ${this.readonly?p:c`<button
                type="button"
                class="ht-btn"
                data-action="add-stage"
                @click=${()=>{this.form=kn(e)}}
              >
                ${D("plus")}${t.t("action_add_stage")}
              </button>`}
      </section>
      ${this.renderFooter(e,r,t)}
    </div>`}}var wt=40,Ka=90;function ja(e){if(!e)return"";return e.views.map((t)=>`${t.task_id}:${t.stage_index}:${t.due_at}:${t.last_completed_at}:${t.can_undo}`).join("|")}function ms(e,t){let r=new Map(e.map((n)=>[n.id,n]));for(let n of t)r.set(n.id,n);return[...r.values()].toSorted((n,s)=>Date.parse(s.ts)-Date.parse(n.ts))}class br extends P{static properties={hass:{attribute:!1,hasChanged:me},state:{attribute:!1},filter:{state:!0},events:{state:!0},stats:{state:!0},loading:{state:!0},more:{state:!0},error:{state:!0},day:{state:!0}};static styles=[K,ye,A`
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
    `];lastFingerprint="";request=0;epoch=0;refreshQueued=!1;paging=!1;scrolled=!1;constructor(){super();this.state=null,this.filter="",this.events=[],this.stats=null,this.loading=!0,this.more=!1,this.error=null,this.day=null}updated(e){let t=ja(this.state);if(e.has("hass")&&!e.get("hass"))this.lastFingerprint=t,this.load(!0);else if(e.has("filter"))this.lastFingerprint=t,this.load(!0);else if(e.has("state")&&t!==this.lastFingerprint)this.lastFingerprint=t,this.load(!1);if(this.stats&&!this.scrolled){let n=this.renderRoot.querySelector(".scroller");if(n)n.scrollLeft=n.scrollWidth,this.scrolled=!0}}get taskFilter(){return this.filter===""?void 0:this.filter}async load(e){if(e)this.epoch+=1,this.loading=!0,this.refreshQueued=!1;else if(this.loading){this.refreshQueued=!0;return}this.request+=1;let{request:t}=this;this.error=null;try{let[r,n]=await Promise.all([Qt(this.hass,{task_id:this.taskFilter,limit:wt}),on(this.hass,{task_id:this.taskFilter,days:Ka})]);if(t!==this.request)return;if(this.events=e?r:ms(this.events,r),this.stats=n,e)this.more=r.length>=wt}catch(r){if(t===this.request)this.error=ce(r)}finally{if(t===this.request){if(this.loading=!1,this.refreshQueued)this.refreshQueued=!1,this.load(!1)}}}async loadMore(){let e=this.events.at(-1)?.ts;if(!e||this.loading||this.paging)return;let{epoch:t}=this;this.paging=!0;try{let r=await Qt(this.hass,{task_id:this.taskFilter,limit:wt,before:e});if(t!==this.epoch)return;this.events=ms(this.events,r),this.more=r.length>=wt}catch(r){if(t===this.epoch)this.error=ce(r)}finally{this.paging=!1}}renderStats(e,t){let r=t.t("stats_no_data"),n=e?.on_time_rate,s=[["current",e?t.number(e.current_streak):r,t.t("stats_current_streak")],["best",e?t.number(e.best_streak):r,t.t("stats_best_streak")],["on-time",n===null||n===void 0?r:t.percent(n),t.t("stats_on_time")],["completed",e?t.number(e.completed):r,t.t("stats_completed")],["skipped",e?t.number(e.skipped+e.missed):r,`${t.t("stats_skipped")} / ${t.t("stats_missed")}`]];return c`${s.map(([i,a,o])=>c`<div class="stat" data-stat=${i}><b>${a}</b><span>${o}</span></div>`)}`}dayText(e,t){let r=t.shortDate(bn(e.date,se(this.hass)));if(e.completed+e.skipped+e.missed===0)return t.t("history_day_empty",{date:r});return t.t("history_day",{date:r,completed:e.completed,skipped:e.skipped,missed:e.missed})}dayClass(e){let t=e.completed===0&&e.trouble;return`day l${e.level} ${e.trouble?"trouble":""} ${t?"bad":""}`}renderGrid(e,t){let{days:r}=Dn(e?.per_day??[]),n=r.find((s)=>s.date===this.day);return c`<div class="panel grid-panel">
      <h3>${t.t("history_window")}</h3>
      <div class="scroller">
        <div class="grid" data-part="grid">
          ${r.map((s)=>{let i=this.dayText(s,t);return c`<button
              class=${this.dayClass(s)}
              style="grid-column:${s.column+1};grid-row:${s.row+1}"
              data-day=${s.date}
              aria-label=${i}
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
    </div>`}renderEvent(e,t){let r=t.t(`event_${e.type}`);return c`<div class="event t-${e.type}" data-event=${e.id}>
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
        ${e.on_time===null?p:c`<span class=${e.on_time?"on-time":"late"}
                >${t.t(e.on_time?"on_time":"late")}</span
              >`}
      </div>
    </div>`}renderTimeline(e){if(this.loading&&this.events.length===0)return c`<div class="panel">
        <div class="note" aria-busy="true">${e.t("loading")}</div>
      </div>`;if(this.events.length===0)return c`<div class="panel">
        ${this.error===null?c`<div class="note" data-part="empty">${e.t("history_empty")}</div>`:p}
      </div>`;let t=new Map;for(let r of this.events){let n=e.date(r.ts);t.set(n,[...t.get(n)??[],r])}return c`<div class="panel" data-part="timeline">
      ${B([...t.entries()],([r])=>r,([r,n])=>c`<div class="group">${r}</div>
            ${B(n,(s)=>s.id,(s)=>this.renderEvent(s,e))}`)}
      ${this.more?c`<button
              class="ht-btn more"
              data-action="more"
              @click=${()=>{this.loadMore()}}
            >
              ${e.t("action_load_more")}
            </button>`:p}
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return p;let r=z(e);return c`<div class="top">
        <label class="ht-label filter">
          ${r.t("field_filter_task")}
          <select
            class="ht-input"
            data-field="filter"
            @change=${(n)=>{let{target:s}=n;if(s instanceof HTMLSelectElement)this.filter=s.value}}
          >
            <option value="" ?selected=${this.filter===""}>${r.t("history_all_tasks")}</option>
            ${(t?.tasks??[]).map((n)=>c`<option value=${n.id} ?selected=${this.filter===n.id}>
                  ${n.title}
                </option>`)}
          </select>
        </label>
        ${this.renderStats(this.stats,r)}
      </div>
      ${this.error===null?p:c`<p class="err" role="alert">
              ${r.t("error_generic",{message:this.error})}
            </p>`}
      <div class="columns">${this.renderGrid(this.stats,r)} ${this.renderTimeline(r)}</div>`}}var fs=["today","tasks","history"];function Za(e){let t=(e??"").replace(/^\//,"").split("/")[0];return fs.find((r)=>r===t)??"today"}class vr extends P{static properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0}};static styles=[K,ye,ie,A`
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
    `];live;tasksMounted=!1;todayMounted=!1;constructor(){super();this.narrow=!1,this.tab="today",this.live=new Qe(this,()=>this.hass)}willUpdate(e){if(e.has("hass"))this.live.sync();if(e.has("route"))this.tab=Za(this.route?.path)}select(e){this.tab=e;let t=this.route?.prefix??"/housetide";history.replaceState(history.state,"",`${t}/${e}`)}toggleMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};renderToday(e){if(this.tab==="today")this.todayMounted=!0;if(!this.todayMounted)return p;let{state:t,now:r}=this.live;return c`<housetide-today
      .hass=${e}
      .state=${t}
      .now=${r}
      .animations=${!ft()}
      .active=${this.tab==="today"}
      ?hidden=${this.tab!=="today"}
    ></housetide-today>`}renderHistory(e){if(this.tab!=="history")return p;return c`<housetide-history .hass=${e} .state=${this.live.state}></housetide-history>`}renderTasks(e){if(this.tab==="tasks")this.tasksMounted=!0;if(!this.tasksMounted)return p;let{state:t,now:r}=this.live;return c`<housetide-tasks
      .hass=${e}
      .state=${t}
      .now=${r}
      ?hidden=${this.tab!=="tasks"}
    ></housetide-tasks>`}render(){let{hass:e}=this;if(!e)return p;let t=z(e),r=this.narrow||e.dockedSidebar==="always_hidden",n=this.live.failed&&!this.live.state;return c`<header>
        ${r?c`<button
                class="ht-btn menu"
                aria-label=${t.t("action_menu")}
                data-action="menu"
                @click=${this.toggleMenu}
              >
                ${D("menu")}
              </button>`:p}
        <h1>${t.t("app_title")}</h1>
        <div class="tabs" role="tablist">
          ${fs.map((s)=>c`<button
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
        ${n?c`<div class="message" role="alert" data-part="error">
                <strong>${t.t("card_error")}</strong>
                <p>${t.t("card_error_hint")}</p>
                <button
                  class="ht-btn"
                  data-action="retry"
                  @click=${()=>{this.live.retry()}}
                >
                  ${t.t("action_retry")}
                </button>
              </div>`:c`${this.renderToday(e)} ${this.renderHistory(e)} ${this.renderTasks(e)}`}
      </main>
      ${Te(e)?c`<div class="offline" role="status" data-part="offline">
              ${D("alert")}${t.t("disconnected")}
            </div>`:p}`}}var Ya=["laundry","pills","plant","one_off"],gs=36500;class kr extends P{static properties={hass:{attribute:!1},state:{attribute:!1},now:{attribute:!1},editing:{state:!0},templates:{state:!0},templateError:{state:!0},retention:{state:!0},settingsError:{state:!0},settingsBusy:{state:!0}};static styles=[K,ye,ie,_e,A`
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
    `];opening=0;constructor(){super();this.state=null,this.now=new Date,this.editing=null,this.templates=null,this.templateError=!1,this.retention=null,this.settingsError=null,this.settingsBusy=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||this.editing)return!0;let t=e.get("hass");return!mt(t)||me(this.hass,t)}updated(e){if(e.has("hass")&&!this.templates&&!this.templateError&&this.isAdmin)this.loadTemplates()}get isAdmin(){return this.hass.user?.is_admin===!0}async loadTemplates(){this.templateError=!1;try{this.templates=await Xt(this.hass)}catch{this.templateError=!0}}async openTemplate(e,t,r){this.opening+=1;let{opening:n}=this,s=await Xt(this.hass).catch(()=>null);if(s)this.templates=s;if(n!==this.opening||this.editing)return;this.start(e,s?.[e]??t,r)}start(e,t,r){let n=Pn(e,t,r);this.editing={source:n,title:r.t("action_new_task")}}open(e){this.editing={source:e,title:e.title}}async saveSettings(e){this.settingsBusy=!0,this.settingsError=null;try{await un(this.hass,{history_retention_days:e}),this.retention=null}catch(t){this.settingsError=ce(t)}finally{this.settingsBusy=!1}}renderTemplates(e){if(!this.isAdmin)return p;let t=this.templates,r=t?Ya.filter((n)=>Object.hasOwn(t,n)):[];return c`<section>
      <h2>${e.t("action_new_task")} · ${e.t("template_prompt")}</h2>
      ${this.templateError?c`<p class="err" role="alert">${e.t("error_templates")}</p>
              <button
                class="ht-btn"
                data-action="retry-templates"
                @click=${()=>{this.loadTemplates()}}
              >
                ${e.t("action_retry")}
              </button>`:p}
      <div class="templates">
        ${r.map((n)=>{let s=t?.[n];if(!s)return p;return c`<button
            class="template"
            data-template=${n}
            @click=${()=>{this.openTemplate(n,s,e)}}
          >
            <span class="thumb">
              ${q({name:s.scene,state:"accumulating",fill:0.7,stink:0,progress:0},{animations:!1})}
            </span>
            <span>${sr(n,e)??s.title}</span>
          </button>`})}
      </div>
    </section>`}renderRow(e,t,r){let n=t?.status??"disabled";return c`<button
      class="task"
      data-task=${e.id}
      @click=${()=>{this.open(e)}}
    >
      <span class="thumb">
        ${q(t?.scene??{name:e.scene,state:"resting",fill:0,stink:0,progress:0},{animations:!1})}
      </span>
      <span class="text">
        <span class="title">${e.title}</span>
        <span class="sub">${r.scheduleText(e.schedule)}</span>
      </span>
      <span class="chip is-${n}">${r.t(`status_${n}`)}</span>
      ${D("chevron")}
    </button>`}renderList(e,t){let r=new Map(e.views.map((n)=>[n.task_id,n]));return c`<section>
      <h2>${t.t("tab_tasks")}</h2>
      ${e.tasks.length===0?c`<div class="empty" data-part="empty">${t.t("tasks_empty")}</div>`:c`<div class="list">
              ${B(e.tasks,(n)=>n.id,(n)=>this.renderRow(n,r.get(n.id),t))}
            </div>`}
    </section>`}renderSettings(e,t){let r=this.retention??String(e.settings.history_retention_days),n=/^\d+$/.test(r.trim())?Number(r.trim()):Number.NaN,s=n>gs,i=!Number.isInteger(n)||n<1||s,a=this.retention!==null&&n!==e.settings.history_retention_days;return c`<section>
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
            aria-invalid=${i?"true":"false"}
            @input=${(o)=>{let{target:u}=o;if(u instanceof HTMLInputElement)this.retention=u.value}}
          />
          ${i?c`<span class="err" role="alert"
                  >${s?t.t("error_max",{max:gs}):t.t("error_min",{min:1})}</span
                >`:p}
        </label>
        ${this.isAdmin?c`<button
                class="ht-btn ht-btn-primary"
                data-action="save-settings"
                ?disabled=${i||!a||this.settingsBusy}
                @click=${()=>{this.saveSettings(n)}}
              >
                ${t.t("action_save")}
              </button>`:p}
        ${this.settingsError===null?p:c`<span class="err" role="alert"
                >${t.t("error_generic",{message:this.settingsError})}</span
              >`}
      </div>
    </section>`}render(){let{hass:e,state:t}=this,r=z(e);if(this.editing)return c`<h2 class="editor-title">${this.editing.title}</h2>
        <housetide-editor
          .hass=${e}
          .source=${this.editing.source}
          .now=${this.now}
          ?readonly=${!this.isAdmin}
          @ht-close=${()=>{this.editing=null}}
        ></housetide-editor>`;if(!t)return c`<p class="note" aria-busy="true">${r.t("loading")}</p>`;return c`${this.isAdmin?p:c`<p class="note" data-part="read-only">${r.t("tasks_read_only")}</p>`}
    ${this.renderTemplates(r)} ${this.renderList(t,r)}
    ${this.renderSettings(t,r)}`}}var Ga=8,ys="housetide.today.layout";function Qa(){try{return localStorage.getItem(ys)==="list"?"list":"scenes"}catch{return"scenes"}}function Xa(e){try{localStorage.setItem(ys,e)}catch{return}}class $r extends P{static properties={hass:{attribute:!1,hasChanged:me},state:{attribute:!1},now:{attribute:!1},animations:{attribute:!1},active:{attribute:!1},layout:{state:!0}};static styles=[K,ie,_e,xt,A`
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
    `];tracker;constructor(){super();this.state=null,this.now=new Date,this.animations=!0,this.active=!0,this.layout=Qa(),this.tracker=new Xe(this,()=>this.hass)}shouldUpdate(){return this.active}choose(e){this.layout=e,Xa(e)}renderViews(e){let t=(r,n,s)=>c`<button
        class="view"
        data-layout=${r}
        aria-label=${s}
        aria-pressed=${this.layout===r?"true":"false"}
        @click=${()=>{this.choose(r)}}
      >
        ${D(n)}
      </button>`;return c`<div class="views" role="group" aria-label=${e.i18n.t("config_layout")}>
      ${t("scenes","tiles",e.i18n.t("config_layout_scenes"))}
      ${t("list","list",e.i18n.t("config_layout_list"))}
    </div>`}later(e,t){let r=new Set(t.map((n)=>n.task_id));return e.filter((n)=>!r.has(n.task_id)&&n.status==="upcoming").toSorted((n,s)=>gt(Re(n),Re(s))).slice(0,Ga)}renderLater(e,t){if(e.length===0)return p;return c`<h3>${t.i18n.t("today_later")}</h3>
      <div class="later">
        ${B(e,(r)=>r.task_id,(r)=>c`<div class="later-item" data-later=${r.task_id}>
              <div class="thumb">
                ${q(r.scene,{animations:!1,day:t.day})}
              </div>
              <div class="text">
                <div class="title">${r.title}</div>
                <div class="due">${t.i18n.dueText(r,t.now)}</div>
              </div>
            </div>`)}
      </div>`}renderClear(e){return c`<div class="clear" data-part="clear">
      <div class="art">
        ${q({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:e.animations})}
      </div>
      <h2>${e.i18n.t("today_clear_title")}</h2>
      <p>${e.i18n.t("card_empty")}</p>
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return p;if(!t)return this.layout==="list"?c`<div class="list" aria-busy="true">${nt(4,"row")}</div>`:c`<div class="tiles" aria-busy="true">${nt(4,"tile")}</div>`;let r=z(e),n={i18n:r,tracker:this.tracker,now:this.now,animations:this.animations,day:Ge(this.now,se(e)),offline:Te(e)},s=vt(t.views,{show:"today",tracker:this.tracker}),i=s.filter((a)=>Le(a)).length;return c`<div class="summary">
        <span class="count">${i>0?r.plural("tasks_due",i):p}</span>
        <span class="side">
          <span class="date">${r.date(this.now)}</span>
          ${this.renderViews(n)}
        </span>
      </div>
      ${s.length===0?this.renderClear(n):c`<div class=${this.layout==="list"?"list":"tiles"}>
              ${B(s,(a)=>a.task_id,(a)=>this.layout==="list"?kt(a,n,{skip:!0}):$t(a,n,{skip:!0}))}
            </div>`}
      ${this.renderLater(this.later(t.views,s),n)}`}}var Ja={"housetide-card":gr,"housetide-panel":vr,"housetide-today":$r,"housetide-tasks":kr,"housetide-editor":_r,"housetide-history":br};for(let[e,t]of Object.entries(Ja))if(!customElements.get(e))customElements.define(e,t);window.customCards??=[];if(!window.customCards.some((e)=>e.type==="housetide-card"))window.customCards.push({type:"housetide-card",name:"Housetide",description:"Recurring household tasks with delightful little scenes.",preview:!0});
