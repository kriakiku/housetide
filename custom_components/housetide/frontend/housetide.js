var nt=globalThis,St=nt.ShadowRoot&&(nt.ShadyCSS===void 0||nt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,Et=Symbol(),Tn=new WeakMap;class Mt{constructor(e,t,n){if(this._$cssResult$=!0,n!==Et)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this._strings=t}get styleSheet(){let e=this._styleSheet,t=this._strings;if(St&&e===void 0){let n=t!==void 0&&t.length===1;if(n)e=Tn.get(t);if(e===void 0){if((this._styleSheet=e=new CSSStyleSheet).replaceSync(this.cssText),n)Tn.set(t,e)}}return e}toString(){return this.cssText}}var gs=(e)=>{if(e._$cssResult$===!0)return e.cssText;else if(typeof e==="number")return e;else throw Error(`Value passed to 'css' function must be a 'css' function result: ${e}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`)},ys=(e)=>new Mt(typeof e==="string"?e:String(e),void 0,Et),M=(e,...t)=>{let n=e.length===1?e[0]:t.reduce((r,s,i)=>r+gs(s)+e[i+1],e[0]);return new Mt(n,e,Et)},Sn=(e,t)=>{if(St)e.adoptedStyleSheets=t.map((n)=>n instanceof CSSStyleSheet?n:n.styleSheet);else for(let n of t){let r=document.createElement("style"),s=nt.litNonce;if(s!==void 0)r.setAttribute("nonce",s);r.textContent=n.cssText,e.appendChild(r)}},_s=(e)=>{let t="";for(let n of e.cssRules)t+=n.cssText;return ys(t)},At=St?(e)=>e:(e)=>e instanceof CSSStyleSheet?_s(e):e;var{is:bs,defineProperty:vs,getOwnPropertyDescriptor:En,getOwnPropertyNames:ks,getOwnPropertySymbols:$s,getPrototypeOf:Mn}=Object,xs=!1,N=globalThis;if(xs)N.customElements??=customElements;var I=!0,j,An=N.trustedTypes,ws=An?An.emptyScript:"",Pn=I?N.reactiveElementPolyfillSupportDevMode:N.reactiveElementPolyfillSupport;if(I)N.litIssuedWarnings??=new Set,j=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!N.litIssuedWarnings.has(t)&&!N.litIssuedWarnings.has(e))console.warn(t),N.litIssuedWarnings.add(t)},queueMicrotask(()=>{if(j("dev-mode","Lit is in dev mode. Not recommended for production!"),N.ShadyDOM?.inUse&&Pn===void 0)j("polyfill-support-missing","Shadow DOM is being polyfilled via `ShadyDOM` but the `polyfill-support` module has not been loaded.")});var Ts=I?(e)=>{if(!N.emitLitDebugLogEvents)return;N.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))}:void 0,Ee=(e,t)=>e,Ct={toAttribute(e,t){switch(t){case Boolean:e=e?ws:null;break;case Object:case Array:e=e==null?e:JSON.stringify(e);break}return e},fromAttribute(e,t){let n=e;switch(t){case Boolean:n=e!==null;break;case Number:n=e===null?null:Number(e);break;case Object:case Array:try{n=JSON.parse(e)}catch(r){n=null}break}return n}},Dn=(e,t)=>!bs(e,t),Cn={attribute:!0,type:String,converter:Ct,reflect:!1,useDefault:!1,hasChanged:Dn};Symbol.metadata??=Symbol("metadata");N.litPropertyMetadata??=new WeakMap;class F extends HTMLElement{static addInitializer(e){this.__prepare(),(this._initializers??=[]).push(e)}static get observedAttributes(){return this.finalize(),this.__attributeToPropertyMap&&[...this.__attributeToPropertyMap.keys()]}static createProperty(e,t=Cn){if(t.state)t.attribute=!1;if(this.__prepare(),this.prototype.hasOwnProperty(e))t=Object.create(t),t.wrapped=!0;if(this.elementProperties.set(e,t),!t.noAccessor){let n=I?Symbol.for(`${String(e)} (@property() cache)`):Symbol(),r=this.getPropertyDescriptor(e,n,t);if(r!==void 0)vs(this.prototype,e,r)}}static getPropertyDescriptor(e,t,n){let{get:r,set:s}=En(this.prototype,e)??{get(){return this[t]},set(i){this[t]=i}};if(I&&r==null){if("value"in(En(this.prototype,e)??{}))throw Error(`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it's actually declared as a value on the prototype. Usually this is due to using @property or @state on a method.`);j("reactive-property-without-getter",`Field ${JSON.stringify(String(e))} on ${this.name} was declared as a reactive property but it does not have a getter. This will be an error in a future version of Lit.`)}return{get:r,set(i){let a=r?.call(this);s?.call(this,i),this.requestUpdate(e,a,n)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Cn}static __prepare(){if(this.hasOwnProperty(Ee("elementProperties",this)))return;let e=Mn(this);if(e.finalize(),e._initializers!==void 0)this._initializers=[...e._initializers];this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Ee("finalized",this)))return;if(this.finalized=!0,this.__prepare(),this.hasOwnProperty(Ee("properties",this))){let t=this.properties,n=[...ks(t),...$s(t)];for(let r of n)this.createProperty(r,t[r])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[n,r]of t)this.elementProperties.set(n,r)}this.__attributeToPropertyMap=new Map;for(let[t,n]of this.elementProperties){let r=this.__attributeNameForProperty(t,n);if(r!==void 0)this.__attributeToPropertyMap.set(r,t)}if(this.elementStyles=this.finalizeStyles(this.styles),I){if(this.hasOwnProperty("createProperty"))j("no-override-create-property","Overriding ReactiveElement.createProperty() is deprecated. The override will not be called with standard decorators");if(this.hasOwnProperty("getPropertyDescriptor"))j("no-override-get-property-descriptor","Overriding ReactiveElement.getPropertyDescriptor() is deprecated. The override will not be called with standard decorators")}}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let n=new Set(e.flat(1/0).reverse());for(let r of n)t.unshift(At(r))}else if(e!==void 0)t.push(At(e));return t}static __attributeNameForProperty(e,t){let n=t.attribute;return n===!1?void 0:typeof n==="string"?n:typeof e==="string"?e.toLowerCase():void 0}constructor(){super();this.__instanceProperties=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this.__reflectingProperty=null,this.__initialize()}__initialize(){this.__updatePromise=new Promise((e)=>this.enableUpdating=e),this._$changedProperties=new Map,this.__saveInstanceProperties(),this.requestUpdate(),this.constructor._initializers?.forEach((e)=>e(this))}addController(e){if((this.__controllers??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected)e.hostConnected?.()}removeController(e){this.__controllers?.delete(e)}__saveInstanceProperties(){let e=new Map,t=this.constructor.elementProperties;for(let n of t.keys())if(this.hasOwnProperty(n))e.set(n,this[n]),delete this[n];if(e.size>0)this.__instanceProperties=e}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Sn(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this.__controllers?.forEach((e)=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this.__controllers?.forEach((e)=>e.hostDisconnected?.())}attributeChangedCallback(e,t,n){this._$attributeToProperty(e,n)}__propertyToAttribute(e,t){let r=this.constructor.elementProperties.get(e),s=this.constructor.__attributeNameForProperty(e,r);if(s!==void 0&&r.reflect===!0){let a=(r.converter?.toAttribute!==void 0?r.converter:Ct).toAttribute(t,r.type);if(I&&this.constructor.enabledWarnings.includes("migration")&&a===void 0)j("undefined-attribute-value",`The attribute value for the ${e} property is undefined on element ${this.localName}. The attribute will be removed, but in the previous version of \`ReactiveElement\`, the attribute would not have changed.`);if(this.__reflectingProperty=e,a==null)this.removeAttribute(s);else this.setAttribute(s,a);this.__reflectingProperty=null}}_$attributeToProperty(e,t){let n=this.constructor,r=n.__attributeToPropertyMap.get(e);if(r!==void 0&&this.__reflectingProperty!==r){let s=n.getPropertyOptions(r),i=typeof s.converter==="function"?{fromAttribute:s.converter}:s.converter?.fromAttribute!==void 0?s.converter:Ct;this.__reflectingProperty=r;let a=i.fromAttribute(t,s.type);this[r]=a??this.__defaultValues?.get(r)??a,this.__reflectingProperty=null}}requestUpdate(e,t,n,r=!1,s){if(e!==void 0){if(I&&e instanceof Event)j("","The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()");let i=this.constructor;if(r===!1)s=this[e];if(n??=i.getPropertyOptions(e),(n.hasChanged??Dn)(s,t)||n.useDefault&&n.reflect&&s===this.__defaultValues?.get(e)&&!this.hasAttribute(i.__attributeNameForProperty(e,n)))this._$changeProperty(e,t,n);else return}if(this.isUpdatePending===!1)this.__updatePromise=this.__enqueueUpdate()}_$changeProperty(e,t,{useDefault:n,reflect:r,wrapped:s},i){if(n&&!(this.__defaultValues??=new Map).has(e)){if(this.__defaultValues.set(e,i??t??this[e]),s!==!0||i!==void 0)return}if(!this._$changedProperties.has(e)){if(!this.hasUpdated&&!n)t=void 0;this._$changedProperties.set(e,t)}if(r===!0&&this.__reflectingProperty!==e)(this.__reflectingProperties??=new Set).add(e)}async __enqueueUpdate(){this.isUpdatePending=!0;try{await this.__updatePromise}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();if(e!=null)await e;return!this.isUpdatePending}scheduleUpdate(){let e=this.performUpdate();if(I&&this.constructor.enabledWarnings.includes("async-perform-update")&&typeof e?.then==="function")j("async-perform-update",`Element ${this.localName} returned a Promise from performUpdate(). This behavior is deprecated and will be removed in a future version of ReactiveElement.`);return e}performUpdate(){if(!this.isUpdatePending)return;if(Ts?.({kind:"update"}),!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),I){let s=[...this.constructor.elementProperties.keys()].filter((i)=>this.hasOwnProperty(i)&&(i in Mn(this)));if(s.length)throw Error(`The following properties on element ${this.localName} will not trigger updates as expected because they are set using class fields: ${s.join(", ")}. Native class fields and some compiled output will overwrite accessors used for detecting changes. See https://lit.dev/msg/class-field-shadowing for more information.`)}if(this.__instanceProperties){for(let[r,s]of this.__instanceProperties)this[r]=s;this.__instanceProperties=void 0}let n=this.constructor.elementProperties;if(n.size>0)for(let[r,s]of n){let{wrapped:i}=s,a=this[r];if(i===!0&&!this._$changedProperties.has(r)&&a!==void 0)this._$changeProperty(r,void 0,s,a)}}let e=!1,t=this._$changedProperties;try{if(e=this.shouldUpdate(t),e)this.willUpdate(t),this.__controllers?.forEach((n)=>n.hostUpdate?.()),this.update(t);else this.__markUpdated()}catch(n){throw e=!1,this.__markUpdated(),n}if(e)this._$didUpdate(t)}willUpdate(e){}_$didUpdate(e){if(this.__controllers?.forEach((t)=>t.hostUpdated?.()),!this.hasUpdated)this.hasUpdated=!0,this.firstUpdated(e);if(this.updated(e),I&&this.isUpdatePending&&this.constructor.enabledWarnings.includes("change-in-update"))j("change-in-update",`Element ${this.localName} scheduled an update (generally because a property was set) after an update completed, causing a new update to be scheduled. This is inefficient and should be avoided unless the next update can only be scheduled as a side effect of the previous update.`)}__markUpdated(){this._$changedProperties=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this.__updatePromise}shouldUpdate(e){return!0}update(e){this.__reflectingProperties&&=this.__reflectingProperties.forEach((t)=>this.__propertyToAttribute(t,this[t])),this.__markUpdated()}updated(e){}firstUpdated(e){}}F.elementStyles=[];F.shadowRootOptions={mode:"open"};F[Ee("elementProperties",F)]=new Map;F[Ee("finalized",F)]=new Map;Pn?.({ReactiveElement:F});if(I){F.enabledWarnings=["change-in-update","async-perform-update"];let e=function(t){if(!t.hasOwnProperty(Ee("enabledWarnings",t)))t.enabledWarnings=t.enabledWarnings.slice()};F.enableWarning=function(t){if(e(this),!this.enabledWarnings.includes(t))this.enabledWarnings.push(t)},F.disableWarning=function(t){e(this);let n=this.enabledWarnings.indexOf(t);if(n>=0)this.enabledWarnings.splice(n,1)}}(N.reactiveElementVersions??=[]).push("2.1.2");if(I&&N.reactiveElementVersions.length>1)queueMicrotask(()=>{j("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var U=globalThis,w=(e)=>{if(!U.emitLitDebugLogEvents)return;U.dispatchEvent(new CustomEvent("lit-debug",{detail:e}))},Ss=0,We;U.litIssuedWarnings??=new Set,We=(e,t)=>{if(t+=e?` See https://lit.dev/msg/${e} for more information.`:"",!U.litIssuedWarnings.has(t)&&!U.litIssuedWarnings.has(e))console.warn(t),U.litIssuedWarnings.add(t)},queueMicrotask(()=>{We("dev-mode","Lit is in dev mode. Not recommended for production!")});var Z=U.ShadyDOM?.inUse&&U.ShadyDOM?.noPatch===!0?U.ShadyDOM.wrap:(e)=>e,rt=U.trustedTypes,Rn=rt?rt.createPolicy("lit-html",{createHTML:(e)=>e}):void 0,Es=(e)=>e,ot=(e,t,n)=>Es,Ms=(e)=>{if(xe!==ot)throw Error("Attempted to overwrite existing lit-html security policy. setSanitizeDOMValueFactory should be called at most once.");xe=e},As=()=>{xe=ot},Ht=(e,t,n)=>xe(e,t,n),Vt="$lit$",re=`lit$${Math.random().toFixed(9).slice(2)}$`,Nt="?"+re,Cs=`<${Nt}>`,$e=document,Be=()=>$e.createComment(""),qe=(e)=>e===null||typeof e!="object"&&typeof e!="function",Lt=Array.isArray,Fn=(e)=>Lt(e)||typeof e?.[Symbol.iterator]==="function",Pt=`[ 	
\f\r]`,Ps=`[^ 	
\f\r"'\`<>=]`,Ds=`[^\\s"'>=/]`,Ue=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,On=1,Dt=2,Rs=3,Hn=/-->/g,Vn=/>/g,ue=new RegExp(`>|${Pt}(?:(${Ds}+)(${Pt}*=${Pt}*(?:${Ps}|("|')|))|$)`,"g"),Os=0,Nn=1,Hs=2,Ln=3,Rt=/'/g,Ot=/"/g,Un=/^(?:script|style|textarea|title)$/i,zn=1,st=2,it=3,It=1,at=2,Vs=3,Ns=4,Ls=5,Ft=6,Is=7,Ut=(e)=>(t,...n)=>{if(t.some((r)=>r===void 0))console.warn(`Some template strings are undefined.
This is probably caused by illegal octal escape sequences.`);if(n.some((r)=>r?._$litStatic$))We("",`Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.
Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);return{["_$litType$"]:e,strings:t,values:n}},d=Ut(zn),c=Ut(st),Wa=Ut(it),Y=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),In=new WeakMap,ke=$e.createTreeWalker($e,129),xe=ot;function Wn(e,t){if(!Lt(e)||!e.hasOwnProperty("raw")){let n="invalid template strings array";throw n=`
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
`),Error(n)}return Rn!==void 0?Rn.createHTML(t):t}var Bn=(e,t)=>{let n=e.length-1,r=[],s=t===st?"<svg>":t===it?"<math>":"",i,a=Ue;for(let u=0;u<n;u++){let f=e[u],y=-1,_,k=0,h;while(k<f.length){if(a.lastIndex=k,h=a.exec(f),h===null)break;if(k=a.lastIndex,a===Ue){if(h[On]==="!--")a=Hn;else if(h[On]!==void 0)a=Vn;else if(h[Dt]!==void 0){if(Un.test(h[Dt]))i=new RegExp(`</${h[Dt]}`,"g");a=ue}else if(h[Rs]!==void 0)throw Error("Bindings in tag names are not supported. Please use static templates instead. See https://lit.dev/docs/templates/expressions/#static-expressions")}else if(a===ue)if(h[Os]===">")a=i??Ue,y=-1;else if(h[Nn]===void 0)y=-2;else y=a.lastIndex-h[Hs].length,_=h[Nn],a=h[Ln]===void 0?ue:h[Ln]==='"'?Ot:Rt;else if(a===Ot||a===Rt)a=ue;else if(a===Hn||a===Vn)a=Ue;else a=ue,i=void 0}console.assert(y===-1||a===ue||a===Rt||a===Ot,"unexpected parse state B");let v=a===ue&&e[u+1].startsWith("/>")?" ":"";s+=a===Ue?f+Cs:y>=0?(r.push(_),f.slice(0,y)+Vt+f.slice(y))+re+v:f+re+(y===-2?u:v)}let l=s+(e[n]||"<?>")+(t===st?"</svg>":t===it?"</math>":"");return[Wn(e,l),r]};class Ke{constructor({strings:e,["_$litType$"]:t},n){this.parts=[];let r,s=0,i=0,a=e.length-1,l=this.parts,[u,f]=Bn(e,t);if(this.el=Ke.createElement(u,n),ke.currentNode=this.el.content,t===st||t===it){let y=this.el.content.firstChild;y.replaceWith(...y.childNodes)}while((r=ke.nextNode())!==null&&l.length<a){if(r.nodeType===1){{let y=r.localName;if(/^(?:textarea|template)$/i.test(y)&&r.innerHTML.includes(re)){let _=`Expressions are not supported inside \`${y}\` elements. See https://lit.dev/msg/expression-in-${y} for more information.`;if(y==="template")throw Error(_);else We("",_)}}if(r.hasAttributes()){for(let y of r.getAttributeNames())if(y.endsWith(Vt)){let _=f[i++],h=r.getAttribute(y).split(re),v=/([.?@])?(.*)/.exec(_);l.push({type:It,index:s,name:v[2],strings:h,ctor:v[1]==="."?Wt:v[1]==="?"?Bt:v[1]==="@"?qt:Ae}),r.removeAttribute(y)}else if(y.startsWith(re))l.push({type:Ft,index:s}),r.removeAttribute(y)}if(Un.test(r.tagName)){let y=r.textContent.split(re),_=y.length-1;if(_>0){r.textContent=rt?rt.emptyScript:"";for(let k=0;k<_;k++)r.append(y[k],Be()),ke.nextNode(),l.push({type:at,index:++s});r.append(y[_],Be())}}}else if(r.nodeType===8)if(r.data===Nt)l.push({type:at,index:s});else{let _=-1;while((_=r.data.indexOf(re,_+1))!==-1)l.push({type:Is,index:s}),_+=re.length-1}s++}if(f.length!==i)throw Error('Detected duplicate attribute bindings. This occurs if your template has duplicate attributes on an element tag. For example "<input ?disabled=${true} ?disabled=${false}>" contains a duplicate "disabled" attribute. The error was detected in the following template: \n`'+e.join("${...}")+"`");w&&w({kind:"template prep",template:this,clonableTemplate:this.el,parts:this.parts,strings:e})}static createElement(e,t){let n=$e.createElement("template");return n.innerHTML=e,n}}function we(e,t,n=e,r){if(t===Y)return t;let s=r!==void 0?n.__directives?.[r]:n.__directive,i=qe(t)?void 0:t._$litDirective$;if(s?.constructor!==i){if(s?._$notifyDirectiveConnectionChanged?.(!1),i===void 0)s=void 0;else s=new i(e),s._$initialize(e,n,r);if(r!==void 0)(n.__directives??=[])[r]=s;else n.__directive=s}if(s!==void 0)t=we(e,s._$resolve(e,t.values),s,r);return t}class zt{constructor(e,t){this._$parts=[],this._$disconnectableChildren=void 0,this._$template=e,this._$parent=t}get parentNode(){return this._$parent.parentNode}get _$isConnected(){return this._$parent._$isConnected}_clone(e){let{el:{content:t},parts:n}=this._$template,r=(e?.creationScope??$e).importNode(t,!0);ke.currentNode=r;let s=ke.nextNode(),i=0,a=0,l=n[0];while(l!==void 0){if(i===l.index){let u;if(l.type===at)u=new Me(s,s.nextSibling,this,e);else if(l.type===It)u=new l.ctor(s,l.name,l.strings,this,e);else if(l.type===Ft)u=new Kt(s,this,e);this._$parts.push(u),l=n[++a]}if(i!==l?.index)s=ke.nextNode(),i++}return ke.currentNode=$e,r}_update(e){let t=0;for(let n of this._$parts){if(n!==void 0)if(w&&w({kind:"set part",part:n,value:e[t],valueIndex:t,values:e,templateInstance:this}),n.strings!==void 0)n._$setValue(e,n,t),t+=n.strings.length-2;else n._$setValue(e[t]);t++}}}class Me{get _$isConnected(){return this._$parent?._$isConnected??this.__isConnected}constructor(e,t,n,r){this.type=at,this._$committedValue=p,this._$disconnectableChildren=void 0,this._$startNode=e,this._$endNode=t,this._$parent=n,this.options=r,this.__isConnected=r?.isConnected??!0,this._textSanitizer=void 0}get parentNode(){let e=Z(this._$startNode).parentNode,t=this._$parent;if(t!==void 0&&e?.nodeType===11)e=t.parentNode;return e}get startNode(){return this._$startNode}get endNode(){return this._$endNode}_$setValue(e,t=this){if(this.parentNode===null)throw Error("This `ChildPart` has no `parentNode` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's `innerHTML` or `textContent` can do this.");if(e=we(this,e,t),qe(e)){if(e===p||e==null||e===""){if(this._$committedValue!==p)w&&w({kind:"commit nothing to child",start:this._$startNode,end:this._$endNode,parent:this._$parent,options:this.options}),this._$clear();this._$committedValue=p}else if(e!==this._$committedValue&&e!==Y)this._commitText(e)}else if(e._$litType$!==void 0)this._commitTemplateResult(e);else if(e.nodeType!==void 0){if(this.options?.host===e){this._commitText("[probable mistake: rendered a template's host in itself (commonly caused by writing ${this} in a template]"),console.warn("Attempted to render the template host",e,"inside itself. This is almost always a mistake, and in dev mode ","we render some warning text. In production however, we'll ","render it, which will usually result in an error, and sometimes ","in the element disappearing from the DOM.");return}this._commitNode(e)}else if(Fn(e))this._commitIterable(e);else this._commitText(e)}_insert(e){return Z(Z(this._$startNode).parentNode).insertBefore(e,this._$endNode)}_commitNode(e){if(this._$committedValue!==e){if(this._$clear(),xe!==ot){let t=this._$startNode.parentNode?.nodeName;if(t==="STYLE"||t==="SCRIPT"){let n="Forbidden";if(t==="STYLE")n="Lit does not support binding inside style nodes. This is a security risk, as style injection attacks can exfiltrate data and spoof UIs. Consider instead using css`...` literals to compose styles, and do dynamic styling with css custom properties, ::parts, <slot>s, and by mutating the DOM rather than stylesheets.";else n="Lit does not support binding inside script nodes. This is a security risk, as it could allow arbitrary code execution.";throw Error(n)}}w&&w({kind:"commit node",start:this._$startNode,parent:this._$parent,value:e,options:this.options}),this._$committedValue=this._insert(e)}}_commitText(e){if(this._$committedValue!==p&&qe(this._$committedValue)){let t=Z(this._$startNode).nextSibling;if(this._textSanitizer===void 0)this._textSanitizer=Ht(t,"data","property");e=this._textSanitizer(e),w&&w({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}else{let t=$e.createTextNode("");if(this._commitNode(t),this._textSanitizer===void 0)this._textSanitizer=Ht(t,"data","property");e=this._textSanitizer(e),w&&w({kind:"commit text",node:t,value:e,options:this.options}),t.data=e}this._$committedValue=e}_commitTemplateResult(e){let{values:t,["_$litType$"]:n}=e,r=typeof n==="number"?this._$getTemplate(e):(n.el===void 0&&(n.el=Ke.createElement(Wn(n.h,n.h[0]),this.options)),n);if(this._$committedValue?._$template===r)w&&w({kind:"template updating",template:r,instance:this._$committedValue,parts:this._$committedValue._$parts,options:this.options,values:t}),this._$committedValue._update(t);else{let s=new zt(r,this),i=s._clone(this.options);w&&w({kind:"template instantiated",template:r,instance:s,parts:s._$parts,options:this.options,fragment:i,values:t}),s._update(t),w&&w({kind:"template instantiated and updated",template:r,instance:s,parts:s._$parts,options:this.options,fragment:i,values:t}),this._commitNode(i),this._$committedValue=s}}_$getTemplate(e){let t=In.get(e.strings);if(t===void 0)In.set(e.strings,t=new Ke(e));return t}_commitIterable(e){if(!Lt(this._$committedValue))this._$committedValue=[],this._$clear();let t=this._$committedValue,n=0,r;for(let s of e){if(n===t.length)t.push(r=new Me(this._insert(Be()),this._insert(Be()),this,this.options));else r=t[n];r._$setValue(s),n++}if(n<t.length)this._$clear(r&&Z(r._$endNode).nextSibling,n),t.length=n}_$clear(e=Z(this._$startNode).nextSibling,t){this._$notifyConnectionChanged?.(!1,!0,t);while(e!==this._$endNode){let n=Z(e).nextSibling;Z(e).remove(),e=n}}setConnected(e){if(this._$parent===void 0)this.__isConnected=e,this._$notifyConnectionChanged?.(e);else throw Error("part.setConnected() may only be called on a RootPart returned from render().")}}class Ae{get tagName(){return this.element.tagName}get _$isConnected(){return this._$parent._$isConnected}constructor(e,t,n,r,s){if(this.type=It,this._$committedValue=p,this._$disconnectableChildren=void 0,this.element=e,this.name=t,this._$parent=r,this.options=s,n.length>2||n[0]!==""||n[1]!=="")this._$committedValue=Array(n.length-1).fill(new String),this.strings=n;else this._$committedValue=p;this._sanitizer=void 0}_$setValue(e,t=this,n,r){let s=this.strings,i=!1;if(s===void 0){if(e=we(this,e,t,0),i=!qe(e)||e!==this._$committedValue&&e!==Y,i)this._$committedValue=e}else{let a=e;e=s[0];let l,u;for(l=0;l<s.length-1;l++){if(u=we(this,a[n+l],t,l),u===Y)u=this._$committedValue[l];if(i||=!qe(u)||u!==this._$committedValue[l],u===p)e=p;else if(e!==p)e+=(u??"")+s[l+1];this._$committedValue[l]=u}}if(i&&!r)this._commitValue(e)}_commitValue(e){if(e===p)Z(this.element).removeAttribute(this.name);else{if(this._sanitizer===void 0)this._sanitizer=xe(this.element,this.name,"attribute");e=this._sanitizer(e??""),w&&w({kind:"commit attribute",element:this.element,name:this.name,value:e,options:this.options}),Z(this.element).setAttribute(this.name,e??"")}}}class Wt extends Ae{constructor(){super(...arguments);this.type=Vs}_commitValue(e){if(this._sanitizer===void 0)this._sanitizer=xe(this.element,this.name,"property");e=this._sanitizer(e),w&&w({kind:"commit property",element:this.element,name:this.name,value:e,options:this.options}),this.element[this.name]=e===p?void 0:e}}class Bt extends Ae{constructor(){super(...arguments);this.type=Ns}_commitValue(e){w&&w({kind:"commit boolean attribute",element:this.element,name:this.name,value:!!(e&&e!==p),options:this.options}),Z(this.element).toggleAttribute(this.name,!!e&&e!==p)}}class qt extends Ae{constructor(e,t,n,r,s){super(e,t,n,r,s);if(this.type=Ls,this.strings!==void 0)throw Error(`A \`<${e.localName}>\` has a \`@${t}=...\` listener with invalid content. Event listeners in templates must have exactly one expression and no surrounding text.`)}_$setValue(e,t=this){if(e=we(this,e,t,0)??p,e===Y)return;let n=this._$committedValue,r=e===p&&n!==p||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,s=e!==p&&(n===p||r);if(w&&w({kind:"commit event listener",element:this.element,name:this.name,value:e,options:this.options,removeListener:r,addListener:s,oldListener:n}),r)this.element.removeEventListener(this.name,this,n);if(s)this.element.addEventListener(this.name,this,e);this._$committedValue=e}handleEvent(e){if(typeof this._$committedValue==="function")this._$committedValue.call(this.options?.host??this.element,e);else this._$committedValue.handleEvent(e)}}class Kt{constructor(e,t,n){this.element=e,this.type=Ft,this._$disconnectableChildren=void 0,this._$parent=t,this.options=n}get _$isConnected(){return this._$parent._$isConnected}_$setValue(e){w&&w({kind:"commit to element binding",element:this.element,value:e,options:this.options}),we(this,e)}}var qn={_boundAttributeSuffix:Vt,_marker:re,_markerMatch:Nt,_HTML_RESULT:zn,_getTemplateHtml:Bn,_TemplateInstance:zt,_isIterable:Fn,_resolveDirective:we,_ChildPart:Me,_AttributePart:Ae,_BooleanAttributePart:Bt,_EventPart:qt,_PropertyPart:Wt,_ElementPart:Kt},Fs=U.litHtmlPolyfillSupportDevMode;Fs?.(Ke,Me);(U.litHtmlVersions??=[]).push("3.3.3");if(U.litHtmlVersions.length>1)queueMicrotask(()=>{We("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var ze=(e,t,n)=>{if(t==null)throw TypeError(`The container to render into may not be ${t}`);let r=Ss++,s=n?.renderBefore??t,i=s._$litPart$;if(w&&w({kind:"begin render",id:r,value:e,container:t,options:n,part:i}),i===void 0){let a=n?.renderBefore??null;s._$litPart$=i=new Me(t.insertBefore(Be(),a),a,void 0,n??{})}return i._$setValue(e),w&&w({kind:"end render",id:r,value:e,container:t,options:n,part:i}),i};ze.setSanitizer=Ms,ze.createSanitizer=Ht,ze._testOnlyClearSanitizerFactoryDoNotCallOrElse=As;var Us=(e,t)=>e,jt=!0,oe=globalThis,Kn;if(jt)oe.litIssuedWarnings??=new Set,Kn=(e,t)=>{if(t+=` See https://lit.dev/msg/${e} for more information.`,!oe.litIssuedWarnings.has(t)&&!oe.litIssuedWarnings.has(e))console.warn(t),oe.litIssuedWarnings.add(t)};class P extends F{constructor(){super(...arguments);this.renderOptions={host:this},this.__childPart=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();if(!this.hasUpdated)this.renderOptions.isConnected=this.isConnected;super.update(e),this.__childPart=ze(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this.__childPart?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this.__childPart?.setConnected(!1)}render(){return Y}}P._$litElement$=!0;P[Us("finalized",P)]=!0;oe.litElementHydrateSupport?.({LitElement:P});var zs=jt?oe.litElementPolyfillSupportDevMode:oe.litElementPolyfillSupport;zs?.({LitElement:P});(oe.litElementVersions??=[]).push("4.2.2");if(jt&&oe.litElementVersions.length>1)queueMicrotask(()=>{Kn("multiple-versions","Multiple versions of Lit loaded. Loading multiple versions is not recommended.")});var lt={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},dt=(e)=>(...t)=>({["_$litDirective$"]:e,values:t});class je{constructor(e){}get _$isConnected(){return this._$parent._$isConnected}_$initialize(e,t,n){this.__part=e,this._$parent=t,this.__attributeIndex=n}_$resolve(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}var{_ChildPart:Ws}=qn,Bs=!0,Ce=Bs&&window.ShadyDOM?.inUse&&window.ShadyDOM?.noPatch===!0?window.ShadyDOM.wrap:(e)=>e;var jn=()=>document.createComment(""),Pe=(e,t,n)=>{let r=Ce(e._$startNode).parentNode,s=t===void 0?e._$endNode:t._$startNode;if(n===void 0){let i=Ce(r).insertBefore(jn(),s),a=Ce(r).insertBefore(jn(),s);n=new Ws(i,a,e,e.options)}else{let i=Ce(n._$endNode).nextSibling,a=n._$parent,l=a!==e;if(l){n._$reparentDisconnectables?.(e),n._$parent=e;let u;if(n._$notifyConnectionChanged!==void 0&&(u=e._$isConnected)!==a._$isConnected)n._$notifyConnectionChanged(u)}if(i!==s||l){let u=n._$startNode;while(u!==i){let f=Ce(u).nextSibling;Ce(r).insertBefore(u,s),u=f}}}return n},pe=(e,t,n=e)=>(e._$setValue(t,n),e),qs={},Zn=(e,t=qs)=>e._$committedValue=t,Yn=(e)=>e._$committedValue,ct=(e)=>{e._$clear(),e._$startNode.remove()};var Gn=(e,t,n)=>{let r=new Map;for(let s=t;s<=n;s++)r.set(e[s],s);return r};class Qn extends je{constructor(e){super(e);if(e.type!==lt.CHILD)throw Error("repeat() can only be used in text expressions")}_getValuesAndKeys(e,t,n){let r;if(n===void 0)n=t;else if(t!==void 0)r=t;let s=[],i=[],a=0;for(let l of e)s[a]=r?r(l,a):a,i[a]=n(l,a),a++;return{values:i,keys:s}}render(e,t,n){return this._getValuesAndKeys(e,t,n).values}update(e,[t,n,r]){let s=Yn(e),{values:i,keys:a}=this._getValuesAndKeys(t,n,r);if(!Array.isArray(s))return this._itemKeys=a,i;let l=this._itemKeys??=[],u=[],f,y,_=0,k=s.length-1,h=0,v=i.length-1;while(_<=k&&h<=v)if(s[_]===null)_++;else if(s[k]===null)k--;else if(l[_]===a[h])u[h]=pe(s[_],i[h]),_++,h++;else if(l[k]===a[v])u[v]=pe(s[k],i[v]),k--,v--;else if(l[_]===a[v])u[v]=pe(s[_],i[v]),Pe(e,u[v+1],s[_]),_++,v--;else if(l[k]===a[h])u[h]=pe(s[k],i[h]),Pe(e,s[_],s[k]),k--,h++;else{if(f===void 0)f=Gn(a,h,v),y=Gn(l,_,k);if(!f.has(l[_]))ct(s[_]),_++;else if(!f.has(l[k]))ct(s[k]),k--;else{let S=y.get(a[h]),L=S!==void 0?s[S]:null;if(L===null){let ae=Pe(e,s[_]);pe(ae,i[h]),u[h]=ae}else u[h]=pe(L,i[h]),Pe(e,s[_],L),s[S]=null;h++}}while(h<=v){let S=Pe(e,u[v+1]);pe(S,i[h]),u[h++]=S}while(_<=k){let S=s[_++];if(S!==null)ct(S)}return this._itemKeys=a,Zn(e,u),Y}}var B=dt(Qn);var Ks={app_title:"Housetide",tab_today:"Today",tab_tasks:"Tasks",tab_history:"History",card_title:"Today",card_empty:"All clear. Nothing due today.",card_loading:"Loading tasks…",card_error:"Housetide is not available",config_tasks:"Tasks",config_show:"Show",config_show_today:"Today only",config_show_all:"All tasks",config_layout:"Layout",config_layout_list:"List",config_layout_scenes:"Scenes",config_title:"Title",config_animations:"Animations",action_advance:"Done",action_start:"Start",action_early:"Do early",action_early_confirm:"Sure?",action_skip:"Skip",action_undo:"Undo",action_save:"Save",action_cancel:"Cancel",action_delete:"Delete",action_edit:"Edit",action_add:"Add",action_add_stage:"Add stage",action_remove:"Remove",action_load_more:"Load more",action_new_task:"New task",action_move_up:"Move up",action_move_down:"Move down",status_upcoming:"Upcoming",status_due:"Due",status_overdue:"Overdue",status_in_progress:"In progress",status_clean:"Clean",status_done:"Done",status_disabled:"Paused",automated:"Automatic",due_now:"Due now",due_when:"Due {when}",next_when:"Next {when}",overdue_for:"Overdue · {duration}",started_when:"Started {when}",done_when:"Done {when}",not_scheduled:"Not scheduled",stage_progress:"Step {current} of {total}",template_laundry:"Laundry",template_pills:"Pills",template_plant:"Water the plant",template_one_off:"One-off task",template_prompt:"Start from a template",field_title:"Title",field_icon:"Icon",field_color:"Colour",field_notes:"Notes",field_assignee:"Assignee",field_enabled:"Enabled",field_scene:"Scene",field_on_missed:"If missed",field_clean_for:"Stays clean for (minutes)",field_grace:"Grace period (hours)",field_schedule:"Schedule",field_schedule_type:"Repeats",field_due:"Due",field_time:"Time",field_weekdays:"Weekdays",field_every_days:"Every (days)",field_anchor:"Count from",field_stages:"Stages",field_stage_title:"Stage",field_action:"Button label",field_role:"Role",field_stale_after:"Gets stale after (minutes)",field_trigger:"Advances automatically",field_entity:"When this entity",field_condition:"Is",field_value:"Value",field_for_seconds:"For (seconds)",field_current_value:"Current value: {value}",field_retention:"Keep history (days)",condition_above:"Above",condition_below:"Below",condition_state:"Equal to",condition_none:"By hand only",schedule_once:"Once",schedule_daily:"Daily",schedule_weekly:"Weekly",schedule_interval:"Interval",schedule_daily_at:"Every day at {time}",schedule_weekly_at:"{days} at {time}",schedule_interval_at:"{every} at {time}",anchor_completion:"Last completion",anchor_schedule:"Previous due date",on_missed_carry:"Keep it overdue",on_missed_skip:"Skip to the next",role_todo:"To do",role_running:"Running",role_waiting:"Waiting",scene_generic:"Tide",scene_pills:"Pills",scene_laundry:"Laundry",scene_plant:"Plant",event_started:"Started",event_advanced:"Advanced",event_completed:"Completed",event_skipped:"Skipped",event_missed:"Missed",event_undone:"Undone",event_created:"Created",event_deleted:"Deleted",source_manual:"By hand",source_trigger:"By sensor",source_service:"By service",source_schedule:"By schedule",source_todo:"From the to-do list",on_time:"On time",late:"Late",history_all_tasks:"All tasks",field_filter_task:"Task",history_empty:"Nothing has happened yet.",stats_current_streak:"Current streak",stats_best_streak:"Best streak",stats_completed:"Completed",stats_skipped:"Skipped",stats_missed:"Missed",stats_on_time:"On time",stats_no_data:"—",tasks_empty:"No tasks yet. Start from a template.",tasks_read_only:"Only administrators can change tasks.",confirm_delete:"Delete “{title}”? History is kept.",error_generic:"Something went wrong: {message}",error_required:"This field is required",settings_title:"Settings",disconnected:"Connection lost. Reconnecting…",loading:"Loading…",card_error_hint:"Check that the Housetide integration is set up.",action_retry:"Try again",action_clear:"Clear",action_close:"Close",action_menu:"Menu",today_later:"Coming up",today_clear_title:"All clear",section_details:"Details",section_behaviour:"If life gets in the way",field_stage_n:"Stage {n}",hint_clean_for:"How long it shows as freshly done.",hint_grace:"After this it counts as overdue and starts to smell.",hint_icon:"For example mdi:washing-machine",hint_stale_after:"Leave empty if it can wait forever.",hint_assignee:"A name or a person entity",entity_placeholder:"Search by name or entity id",entity_not_found:"This entity does not exist right now",entity_unavailable:"The entity is unavailable right now",entity_no_matches:"No matching entities",trigger_met:"True right now",trigger_unmet:"Not true right now",trigger_none:"Moves on only when you tap the button.",trigger_above:"Moves on when {entity} goes above {value}",trigger_below:"Moves on when {entity} drops below {value}",trigger_state:"Moves on when {entity} becomes “{value}”",trigger_held:"{sentence} and stays there for {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Choose an entity and a value to finish this rule.",error_number:"Enter a number",error_whole:"Enter a whole number",error_min:"Must be at least {min}",error_max:"Must be at most {max}",error_weekdays:"Pick at least one day",error_entity:"Pick an entity, or turn off automatic advance",error_entity_format:"That is not a valid entity id",error_state:"This state can never match",error_datetime:"Choose a date and time",error_time:"Choose a time",error_form:"Some fields need attention.",error_templates:"Could not load the templates.",template_stage_load:"Collect and load",template_action_load:"Loaded",template_stage_wash:"Washing",template_action_wash:"Finished",template_stage_hang:"Hang it up",template_action_hang:"Hung up",template_stage_take:"Take pills",template_action_take:"Taken",template_stage_water:"Water",template_action_water:"Watered",template_stage_do:"Do it",template_action_do:"Done",history_window:"Last 90 days",history_day_hint:"Tap a day to see what happened.",history_day:"{date}: {completed} done, {skipped} skipped, {missed} missed",history_day_empty:"{date}: nothing recorded",history_stage:"{event} · {stage}",stats_scope:"{completed} done · {skipped} skipped · {missed} missed"},js={app_title:"Housetide",tab_today:"Сьогодні",tab_tasks:"Задачі",tab_history:"Історія",card_title:"Сьогодні",card_empty:"Усе чисто. На сьогодні нічого немає.",card_loading:"Завантаження задач…",card_error:"Housetide недоступний",config_tasks:"Задачі",config_show:"Показувати",config_show_today:"Лише сьогодні",config_show_all:"Усі задачі",config_layout:"Вигляд",config_layout_list:"Список",config_layout_scenes:"Сцени",config_title:"Заголовок",config_animations:"Анімації",action_advance:"Готово",action_start:"Почати",action_early:"Раніше",action_early_confirm:"Точно?",action_skip:"Пропустити",action_undo:"Скасувати",action_save:"Зберегти",action_cancel:"Скасувати",action_delete:"Видалити",action_edit:"Змінити",action_add:"Додати",action_add_stage:"Додати етап",action_remove:"Прибрати",action_load_more:"Показати ще",action_new_task:"Нова задача",action_move_up:"Вище",action_move_down:"Нижче",status_upcoming:"Заплановано",status_due:"Час виконати",status_overdue:"Прострочено",status_in_progress:"Виконується",status_clean:"Чисто",status_done:"Виконано",status_disabled:"На паузі",automated:"Автоматично",due_now:"Час виконати",due_when:"Термін: {when}",next_when:"Наступне: {when}",overdue_for:"Прострочено · {duration}",started_when:"Почато {when}",done_when:"Виконано {when}",not_scheduled:"Без розкладу",stage_progress:"Етап {current} з {total}",template_laundry:"Прання",template_pills:"Таблетки",template_plant:"Полити рослину",template_one_off:"Разова задача",template_prompt:"Почати із шаблону",field_title:"Назва",field_icon:"Іконка",field_color:"Колір",field_notes:"Нотатки",field_assignee:"Виконавець",field_enabled:"Увімкнено",field_scene:"Сцена",field_on_missed:"Якщо пропущено",field_clean_for:"Залишається чистим (хвилин)",field_grace:"Запас часу (годин)",field_schedule:"Розклад",field_schedule_type:"Повторення",field_due:"Термін",field_time:"Час",field_weekdays:"Дні тижня",field_every_days:"Кожні (днів)",field_anchor:"Рахувати від",field_stages:"Етапи",field_stage_title:"Етап",field_action:"Напис на кнопці",field_role:"Роль",field_stale_after:"Застоюється через (хвилин)",field_trigger:"Перемикається автоматично",field_entity:"Коли ця сутність",field_condition:"Має значення",field_value:"Значення",field_for_seconds:"Протягом (секунд)",field_current_value:"Поточне значення: {value}",field_retention:"Зберігати історію (днів)",condition_above:"Більше ніж",condition_below:"Менше ніж",condition_state:"Дорівнює",condition_none:"Лише вручну",schedule_once:"Один раз",schedule_daily:"Щодня",schedule_weekly:"Щотижня",schedule_interval:"Інтервал",schedule_daily_at:"Щодня о {time}",schedule_weekly_at:"{days} о {time}",schedule_interval_at:"{every} о {time}",anchor_completion:"Останнього виконання",anchor_schedule:"Попереднього терміну",on_missed_carry:"Залишати простроченою",on_missed_skip:"Переходити до наступної",role_todo:"Зробити",role_running:"Триває",role_waiting:"Очікує",scene_generic:"Приплив",scene_pills:"Таблетки",scene_laundry:"Прання",scene_plant:"Рослина",event_started:"Розпочато",event_advanced:"Наступний етап",event_completed:"Виконано",event_skipped:"Пропущено",event_missed:"Не виконано",event_undone:"Скасовано",event_created:"Створено",event_deleted:"Видалено",source_manual:"Вручну",source_trigger:"За датчиком",source_service:"Через сервіс",source_schedule:"За розкладом",source_todo:"Зі списку справ",on_time:"Вчасно",late:"Із запізненням",history_all_tasks:"Усі задачі",field_filter_task:"Задача",history_empty:"Поки що нічого не сталося.",stats_current_streak:"Поточна серія",stats_best_streak:"Найкраща серія",stats_completed:"Виконано",stats_skipped:"Пропущено",stats_missed:"Не виконано",stats_on_time:"Вчасно",stats_no_data:"—",tasks_empty:"Задач поки немає. Почніть із шаблону.",tasks_read_only:"Змінювати задачі можуть лише адміністратори.",confirm_delete:"Видалити «{title}»? Історія збережеться.",error_generic:"Щось пішло не так: {message}",error_required:"Це поле обовʼязкове",settings_title:"Налаштування",disconnected:"Звʼязок втрачено. Перепідключення…",loading:"Завантаження…",card_error_hint:"Перевірте, чи налаштовано інтеграцію Housetide.",action_retry:"Спробувати ще",action_clear:"Очистити",action_close:"Закрити",action_menu:"Меню",today_later:"Незабаром",today_clear_title:"Усе чисто",section_details:"Основне",section_behaviour:"Якщо щось пішло не так",field_stage_n:"Етап {n}",hint_clean_for:"Скільки часу показувати як щойно зроблене.",hint_grace:"Після цього задача прострочена і починає смердіти.",hint_icon:"Наприклад, mdi:washing-machine",hint_stale_after:"Залиште порожнім, якщо може чекати вічно.",hint_assignee:"Імʼя або сутність person",entity_placeholder:"Пошук за назвою або id сутності",entity_not_found:"Такої сутності зараз немає",entity_unavailable:"Сутність зараз недоступна",entity_no_matches:"Нічого не знайдено",trigger_met:"Зараз виконується",trigger_unmet:"Зараз не виконується",trigger_none:"Перемикається лише натисканням кнопки.",trigger_above:"Перемикається, коли {entity} перевищить {value}",trigger_below:"Перемикається, коли {entity} впаде нижче {value}",trigger_state:"Перемикається, коли {entity} стане «{value}»",trigger_held:"{sentence} і так триматиметься {hold}.",trigger_instant:"{sentence}.",trigger_incomplete:"Оберіть сутність і значення, щоб завершити правило.",error_number:"Введіть число",error_whole:"Введіть ціле число",error_min:"Має бути не менше {min}",error_max:"Має бути не більше {max}",error_weekdays:"Оберіть хоча б один день",error_entity:"Оберіть сутність або вимкніть автоматичне перемикання",error_entity_format:"Це не схоже на id сутності",error_state:"Такий стан ніколи не настане",error_datetime:"Оберіть дату й час",error_time:"Оберіть час",error_form:"Деякі поля потребують уваги.",error_templates:"Не вдалося завантажити шаблони.",template_stage_load:"Зібрати й завантажити",template_action_load:"Завантажено",template_stage_wash:"Прання",template_action_wash:"Завершено",template_stage_hang:"Розвісити",template_action_hang:"Розвішано",template_stage_take:"Випити таблетки",template_action_take:"Випито",template_stage_water:"Полити",template_action_water:"Полито",template_stage_do:"Зробити",template_action_do:"Готово",history_window:"Останні 90 днів",history_day_hint:"Торкніться дня, щоб побачити подробиці.",history_day:"{date}: виконано {completed}, пропущено {skipped}, не виконано {missed}",history_day_empty:"{date}: нічого не записано",history_stage:"{event} · {stage}",stats_scope:"виконано {completed} · пропущено {skipped} · не виконано {missed}"},Zs={days:{one:"{n} day",other:"{n} days"},every_days:{one:"Every day",other:"Every {n} days"},tasks_due:{one:"{n} task due",other:"{n} tasks due"},occurrences:{one:"{n} in a row",other:"{n} in a row"},seconds:{one:"{n} second",other:"{n} seconds"}},Ys={days:{one:"{n} день",few:"{n} дні",many:"{n} днів",other:"{n} дня"},every_days:{one:"Кожен {n} день",few:"Кожні {n} дні",many:"Кожні {n} днів",other:"Кожні {n} дня"},tasks_due:{one:"{n} задача на зараз",few:"{n} задачі на зараз",many:"{n} задач на зараз",other:"{n} задачі на зараз"},occurrences:{one:"{n} поспіль",few:"{n} поспіль",many:"{n} поспіль",other:"{n} поспіль"},seconds:{one:"{n} секунду",few:"{n} секунди",many:"{n} секунд",other:"{n} секунди"}};var Gs=Date.UTC(2024,0,1);function Xn(e,t){if(!t)return e;return e.replaceAll(/\{(\w+)\}/g,(n,r)=>String(t[r]??n))}function Qs(e,t){return e.charAt(0).toLocaleUpperCase(t)+e.slice(1)}function Xs(e){let t=(e??"en").replace("_","-");if(/^uk\b/i.test(t))return{language:"uk",locale:t};if(/^en\b/i.test(t))return{language:"en",locale:t};return{language:"en",locale:"en"}}function le(e){return e instanceof Date?e:new Date(e)}function Js(e){if(!e)return;try{return Intl.DateTimeFormat("en",{timeZone:e}),e}catch{return}}function Zt(e,t={}){let n=Xs(e),{locale:r}=n,s=Js(t.timeZone),{hour12:i}=t,a=i===void 0?{}:{hour12:i},u=i??new Intl.DateTimeFormat(r,{hour:"numeric"}).resolvedOptions().hour12?"numeric":"2-digit",f=n.language==="uk"?js:Ks,y=n.language==="uk"?Ys:Zs,_=new Intl.PluralRules(r),k=new Intl.NumberFormat(r),h=new Intl.NumberFormat(r,{style:"percent",maximumFractionDigits:0}),v=new Intl.RelativeTimeFormat(r,{numeric:"auto"}),S=new Intl.DateTimeFormat(r,{dateStyle:"medium",timeZone:s}),L=new Intl.DateTimeFormat(r,{day:"numeric",month:"short",timeZone:s}),ae=new Intl.DateTimeFormat(r,{hour:u,minute:"2-digit",timeZone:s,...a}),Le=new Intl.DateTimeFormat(r,{day:"numeric",month:"short",hour:u,minute:"2-digit",timeZone:s,...a}),xt=new Intl.DateTimeFormat(r,{hour:u,minute:"2-digit",timeZone:"UTC",...a}),be=new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit",timeZone:s}),J={short:new Intl.DateTimeFormat(r,{weekday:"short",timeZone:"UTC"}),long:new Intl.DateTimeFormat(r,{weekday:"long",timeZone:"UTC"}),narrow:new Intl.DateTimeFormat(r,{weekday:"narrow",timeZone:"UTC"})},ee=(m)=>new Intl.NumberFormat(r,{style:"unit",unit:m,unitDisplay:"long"}),te={minute:ee("minute"),hour:ee("hour"),day:ee("day"),week:ee("week")},Ie=(m)=>{let x=(C)=>Number(be.formatToParts(m).find((ne)=>ne.type===C)?.value);return Date.UTC(x("year"),x("month")-1,x("day"))/86400000},V=(m,x)=>Xn(f[m],x),kn=(m,x)=>{let C=y[m],ne=C[_.select(x)]??C.other;return Xn(ne,{n:k.format(x)})},Fe=(m,x)=>{let C=le(m),ne=le(x),wt=(C.getTime()-ne.getTime())/1000,Tt=Math.abs(wt);if(Tt<45)return v.format(0,"second");if(Tt<3570)return v.format(Math.round(wt/60),"minute");if(Tt<84600)return v.format(Math.round(wt/3600),"hour");let ve=Ie(C)-Ie(ne);if(Math.abs(ve)<7)return v.format(ve,"day");if(Math.abs(ve)<30)return v.format(Math.round(ve/7),"week");if(Math.abs(ve)<365)return v.format(Math.round(ve/30),"month");return v.format(Math.round(ve/365),"year")},$n=(m)=>{let x=Math.max(0,Math.round(m));if(x<3570)return te.minute.format(Math.max(1,Math.round(x/60)));if(x<84600)return te.hour.format(Math.round(x/3600));if(x<1209600)return te.day.format(Math.round(x/86400));return te.week.format(Math.round(x/604800))},xn=(m)=>{let[x=0,C=0]=m.split(":").map(Number);return xt.format(Date.UTC(2024,0,1,x,C))},wn=(m,x="short")=>J[x].format(Gs+(m%7+7)%7*86400*1000),ms=(m)=>{if(m.type==="once")return Le.format(le(m.due));let x=xn(m.time);if(m.type==="daily")return V("schedule_daily_at",{time:x});if(m.type==="weekly"){let C=m.weekdays.map((ne)=>wn(ne)).join(", ");return V("schedule_weekly_at",{days:C,time:x})}return V("schedule_interval_at",{every:kn("every_days",m.every_days),time:x})},fs=(m,x)=>{let{status:C}=m;if(C==="disabled")return V("status_disabled");if(C==="done"||C==="clean")return m.last_completed_at?V("done_when",{when:Fe(m.last_completed_at,x)}):V("status_done");if(C==="in_progress")return m.started_at?V("started_when",{when:Fe(m.started_at,x)}):V("status_in_progress");if(C==="overdue"){let ne=m.due_at?(le(x).getTime()-le(m.due_at).getTime())/1000:m.overdue_seconds;return V("overdue_for",{duration:$n(ne)})}if(C==="due")return V("due_now");if(m.due_at)return V("due_when",{when:Fe(m.due_at,x)});if(m.next_due_at)return V("next_when",{when:Fe(m.next_due_at,x)});return V("not_scheduled")};return{language:n.language,locale:r,t:V,plural:kn,number:(m)=>k.format(m),percent:(m)=>h.format(m),relative:Fe,duration:$n,date:(m)=>S.format(le(m)),shortDate:(m)=>L.format(le(m)),time:(m)=>ae.format(le(m)),dateTime:(m)=>Le.format(le(m)),clock:xn,weekday:wn,scheduleText:(m)=>Qs(ms(m),r),dueText:fs}}function Jn(e){let t=e.locale?.time_format,n={};if(t==="12")n.hour12=!0;if(t==="24")n.hour12=!1;if(e.config?.time_zone)n.timeZone=e.config.time_zone;return Zt(e.locale?.language??e.language,n)}function G(e,t={}){let n=Object.entries(t).filter(([,r])=>r!==void 0);return{type:`housetide/${e}`,...Object.fromEntries(n)}}function er(e,t){return e.connection.subscribeMessage(t,G("subscribe"))}function tr(e,t){return e.callWS(G("advance",{task_id:t}))}function nr(e,t){return e.callWS(G("skip",{task_id:t}))}function rr(e,t){return e.callWS(G("undo",{task_id:t}))}async function Yt(e,t={}){let n=await e.callWS(G("history",t));return Array.isArray(n)?n:n.events}function sr(e,t={}){return e.callWS(G("stats",t))}function ei(e){return"templates"in e}async function Gt(e){let t=await e.callWS(G("templates"));return ei(t)?t.templates:t}function ir(e,t){return e.callWS(G("task/create",{task:t}))}function ar(e,t){return e.callWS(G("task/update",{task:t}))}function or(e,t){return e.callWS(G("task/delete",{task_id:t}))}function lr(e,t){return e.callWS(G("settings/update",{settings:t}))}var ti=/^[a-z0-9_]+\.[a-z0-9_]+$/,ni=/^(?:[01]\d|2[0-3]):[0-5]\d$/,ri=/^\d+$/,si=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/,mr=new Set(["unknown","unavailable"]);function fr(){return Intl.DateTimeFormat().resolvedOptions().timeZone}var dr=new Map;function ii(e){let t=dr.get(e);if(t)return t;let n=new Intl.DateTimeFormat("en-CA",{timeZone:e,hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"});return dr.set(e,n),n}function ut(e,t){let n=ii(t).formatToParts(e),r=(s)=>Number(n.find((i)=>i.type===s)?.value??0);return{year:r("year"),month:r("month"),day:r("day"),hour:r("hour"),minute:r("minute"),second:r("second")}}function cr(e,t){let n=ut(new Date(e),t);return Date.UTC(n.year,n.month-1,n.day,n.hour,n.minute,n.second)-Math.floor(e/1000)*1000}function he(e){return String(e).padStart(2,"0")}function ai(e){let t=Math.round(Math.abs(e)/60000);return`${e<0?"-":"+"}${he(Math.floor(t/60))}:${he(t%60)}`}function Xt(e,t){let n=si.exec(e);if(!n)return null;let[,r,s,i,a,l]=n,u=Date.UTC(Number(r),Number(s)-1,Number(i),Number(a),Number(l));if(Number.isNaN(u))return null;let f=cr(u-cr(u,t),t);return`${r}-${s}-${i}T${a}:${l}:00${ai(f)}`}function oi(e,t){let n=new Date(e);if(Number.isNaN(n.getTime()))return"";let r=ut(n,t);return`${String(r.year).padStart(4,"0")}-${he(r.month)}-${he(r.day)}T${he(r.hour)}:${he(r.minute)}`}function Ye(e,t){let n=ut(e,t);return(new Date(Date.UTC(n.year,n.month-1,n.day)).getUTCDay()+6)%7}function gr(e,t){return Xt(`${e}T12:00`,t)??e}function li(e,t){let n=ut(e,t),r=new Date(Date.UTC(n.year,n.month-1,n.day+1));return`${r.getUTCFullYear()}-${he(r.getUTCMonth()+1)}-${he(r.getUTCDate())}T09:00`}function di(e){if(!e)return"none";if(e.above!==null)return"above";if(e.below!==null)return"below";return"state"}function ci(e){if(!e)return"";let t=e.above??e.below??e.state;return t===null?"":String(t)}function ui(e){return{id:e.id,title:e.title,action:e.action??"",role:e.role,stale:e.stale_after_minutes===null?"":String(e.stale_after_minutes),condition:di(e.complete_when),entity:e.complete_when?.entity_id??"",value:ci(e.complete_when),hold:e.complete_when?String(e.complete_when.for_seconds):"0"}}function yr(e,t,n){let{schedule:r}=e;return{id:e.id??null,title:e.title,icon:e.icon??"",color:e.color??"",notes:e.notes??"",assignee:e.assignee??"",enabled:e.enabled,scene:e.scene,on_missed:e.on_missed,clean_for:String(e.clean_for_minutes),grace:String(e.grace_hours),schedule:r.type,due:r.type==="once"?oi(r.due,t):li(n,t),time:r.type==="once"?"09:00":r.time,weekdays:r.type==="weekly"?[...r.weekdays]:[Ye(n,t)],every_days:r.type==="interval"?String(r.every_days):"7",anchor:r.type==="interval"?r.anchor:"completion",stages:e.stages.map((s)=>ui(s))}}function _r(e){let t=new Set(e.stages.map((s)=>s.id)),n=e.stages.length+1;while(t.has(`stage_${n}`))n+=1;let r={id:`stage_${n}`,title:"",action:"",role:"todo",stale:"",condition:"none",entity:"",value:"",hold:"0"};return{...e,stages:[...e.stages,r]}}function br(e,t){if(e.stages.length<=1)return e;return{...e,stages:e.stages.filter((n,r)=>r!==t)}}function Jt(e,t,n){let r=t+n,s=e.stages[t];if(!s||r<0||r>=e.stages.length)return e;let i=e.stages.filter((a,l)=>l!==t);return i.splice(r,0,s),{...e,stages:i}}function en(e){let t=e.trim().replace(",",".");if(t==="")return null;let n=Number(t);return Number.isFinite(n)?n:null}function Ze(e,t,n,r){let s=n.trim();if(!ri.test(s))e[t]={key:"error_whole"};else if(Number(s)<r)e[t]={key:"error_min",vars:{min:r}}}function pi(e,t,n){let r=`stages.${n}`;if(!t.title.trim())e[`${r}.title`]={key:"error_required"};if(t.stale.trim())Ze(e,`${r}.stale`,t.stale,1);if(t.condition==="none")return;let s=t.entity.trim();if(!s)e[`${r}.entity`]={key:"error_entity"};else if(!ti.test(s))e[`${r}.entity`]={key:"error_entity_format"};if(Ze(e,`${r}.hold`,t.hold,0),t.condition==="state"){let i=t.value.trim();if(!i)e[`${r}.value`]={key:"error_required"};else if(mr.has(i))e[`${r}.value`]={key:"error_state"}}else if(en(t.value)===null)e[`${r}.value`]={key:"error_number"}}function tn(e,t){let n={};if(!e.title.trim())n.title={key:"error_required"};if(Ze(n,"clean_for",e.clean_for,0),Ze(n,"grace",e.grace,0),e.schedule==="once"){if(!Xt(e.due,t))n.due={key:"error_datetime"}}else if(!ni.test(e.time))n.time={key:"error_time"};if(e.schedule==="weekly"&&e.weekdays.length===0)n.weekdays={key:"error_weekdays"};if(e.schedule==="interval")Ze(n,"every_days",e.every_days,1);return e.stages.forEach((r,s)=>{pi(n,r,s)}),n}function De(e){let t=e.trim();return t===""?null:t}function hi(e,t){switch(e.schedule){case"once":return{type:"once",due:Xt(e.due,t)??e.due};case"daily":return{type:"daily",time:e.time};case"weekly":return{type:"weekly",weekdays:[...e.weekdays].toSorted((n,r)=>n-r),time:e.time};default:return{type:"interval",every_days:Number(e.every_days.trim()),time:e.time,anchor:e.anchor}}}function mi(e){if(e.condition==="none")return null;let t=en(e.value);return{entity_id:e.entity.trim(),above:e.condition==="above"?t:null,below:e.condition==="below"?t:null,state:e.condition==="state"?e.value.trim():null,for_seconds:Number(e.hold.trim())}}function fi(e){let t=De(e.stale);return{id:e.id,title:e.title.trim(),action:De(e.action),role:e.role,complete_when:mi(e),stale_after_minutes:t===null?null:Number(t)}}function vr(e,t){let n={title:e.title.trim(),icon:De(e.icon),color:De(e.color),notes:De(e.notes),assignee:De(e.assignee),enabled:e.enabled,schedule:hi(e,t),on_missed:e.on_missed,scene:e.scene,stages:e.stages.map((r)=>fi(r)),clean_for_minutes:Number(e.clean_for.trim()),grace_hours:Number(e.grace.trim())};return e.id===null?n:{...n,id:e.id}}function kr(e,t){return Object.hasOwn(e,t)?e[t]:void 0}function Qt(e){let t=e.attributes.friendly_name;return typeof t==="string"?t:e.entity_id}function $r(e){return e.trim()!==""&&Number.isFinite(Number(e))}function ur(e,t){if(t==="state")return 0;let n=e.attributes.device_class;if(n==="power")return 0;if(n==="current"||n==="voltage")return 1;return $r(e.state)?2:3}function xr(e,t,n,r=6){let s=t.trim().toLowerCase().split(/\s+/).filter(Boolean);return Object.values(e).filter((l)=>{let u=`${l.entity_id} ${Qt(l)}`.toLowerCase();return s.every((f)=>u.includes(f))}).toSorted((l,u)=>ur(l,n)-ur(u,n)||l.entity_id.localeCompare(u.entity_id)).slice(0,r).map((l)=>({entity_id:l.entity_id,name:Qt(l),state:l.state}))}function wr(e,t){if(e.condition==="none"||!e.entity.trim())return"idle";if(!t)return"missing";if(mr.has(t.state))return"unavailable";if(e.condition==="state"){if(!e.value.trim())return"idle";return t.state===e.value.trim()?"met":"unmet"}let n=en(e.value);if(n===null)return"idle";if(!$r(t.state))return"unavailable";let r=Number(t.state);return(e.condition==="above"?r>n:r<n)?"met":"unmet"}function Tr(e){let t=e?.attributes.unit_of_measurement;return typeof t==="string"?t:""}function Sr(e){let t=Tr(e);return t?`${e.state} ${t}`:e.state}function gi(e,t){return e<90?t.plural("seconds",e):t.duration(e)}function Er(e,t,n){if(e.condition==="none")return n.t("trigger_none");let r=e.value.trim();if(!e.entity.trim()||!r)return n.t("trigger_incomplete");let s=t?Qt(t):e.entity.trim(),i=e.condition==="state"?"":Tr(t),a=n.t(`trigger_${e.condition}`,{entity:s,value:i?`${r} ${i}`:r}),l=Number(e.hold.trim());if(!Number.isInteger(l)||l<=0)return n.t("trigger_instant",{sentence:a});return n.t("trigger_held",{sentence:a,hold:gi(l,n)})}var pr={laundry:"template_laundry",pills:"template_pills",plant:"template_plant",one_off:"template_one_off"},hr={load:["template_stage_load","template_action_load"],wash:["template_stage_wash","template_action_wash"],hang:["template_stage_hang","template_action_hang"],take:["template_stage_take","template_action_take"],water:["template_stage_water","template_action_water"],do:["template_stage_do","template_action_do"]};function nn(e,t){let n=Object.hasOwn(pr,e)?pr[e]:void 0;return n?t.t(n):null}function Mr(e,t,n){return{...t,title:nn(e,n)??t.title,stages:t.stages.map((r)=>{let s=Object.hasOwn(hr,r.id)?hr[r.id]:void 0;return s?{...r,title:n.t(s[0]),action:n.t(s[1])}:r})}}function Ar(e){let t=e[0];if(!t)return{days:[],columns:0};let n=(new Date(`${t.date}T00:00:00Z`).getUTCDay()+6)%7,r=e.map((s,i)=>({...s,column:Math.floor((i+n)/7),row:(i+n)%7,level:Math.min(3,s.completed),trouble:s.missed+s.skipped>0}));return{days:r,columns:(r.at(-1)?.column??0)+1}}var yi=30000,Cr=12000,Pr=700,_i=900,bi=6000,vi=4000;function me(e,t){if(!e||!t)return e!==t;return e.connection!==t.connection||e.connected!==t.connected||e.language!==t.language||e.locale!==t.locale||e.config?.time_zone!==t.config?.time_zone||e.user?.is_admin!==t.user?.is_admin}function pt(e){return typeof e==="object"&&e!==null&&"connection"in e&&"states"in e}var rn;function z(e){let t=[e.locale?.language??e.language,e.locale?.time_format,e.config?.time_zone].join("|");if(rn?.key!==t)rn={key:t,i18n:Jn(e)};return rn.i18n}function se(e){return e.config?.time_zone??fr()}function Te(e){return e?.connected===!1}function ht(){return document.hidden}class Ge{state=null;failed=!1;now=new Date;host;hass;onState;connected=!1;connection;unsubscribe;generation=0;timer;clockOffset=0;constructor(e,t,n){this.host=e,this.hass=t,this.onState=n,e.addController(this)}hostConnected(){this.connected=!0,this.timer=setInterval(this.tick,yi),document.addEventListener("visibilitychange",this.onVisibility),this.sync()}hostDisconnected(){this.connected=!1,clearInterval(this.timer),document.removeEventListener("visibilitychange",this.onVisibility),this.stop()}sync(){let e=this.hass();if(!this.connected||!e||e.connection===this.connection)return;this.stop(),this.connection=e.connection,this.start(e)}retry(){this.stop(),this.failed=!1,this.host.requestUpdate(),this.sync()}async start(e){this.generation+=1;let{generation:t}=this;try{let n=await er(e,(r)=>{if(t===this.generation)this.receive(r)});if(t===this.generation)this.unsubscribe=n;else await n()}catch{if(t!==this.generation)return;this.connection=void 0,this.failed=!0,this.host.requestUpdate()}}stop(){this.generation+=1,this.connection=void 0;let{unsubscribe:e}=this;if(this.unsubscribe=void 0,!e)return;Promise.resolve().then(()=>e()).catch(()=>{return})}receive(e){this.state=e,this.failed=!1;let t=Date.parse(e.now);this.clockOffset=Number.isNaN(t)?0:t-Date.now(),this.refreshClock(),this.onState?.(e),this.host.requestUpdate()}refreshClock(){this.now=new Date(Date.now()+this.clockOffset)}tick=()=>{if(this.refreshClock(),this.failed)this.sync();this.host.requestUpdate()};onVisibility=()=>{if(!document.hidden)this.refreshClock();this.host.requestUpdate()}}var ki={overdue:0,due:0,in_progress:0,upcoming:1,clean:2,done:3,disabled:4};function Re(e){let t=Date.parse(e.due_at??e.next_due_at??"");return[ki[e.status],Number.isNaN(t)?Number.MAX_SAFE_INTEGER:t,e.title]}function mt(e,t){return e[0]-t[0]||e[1]-t[1]||e[2].localeCompare(t[2])}function sn(e){return e.status==="upcoming"||e.status==="clean"}class Qe{host;hass;pending=new Set;recent=new Map;errors=new Map;celebrating=new Map;armed=new Map;timers=new Set;constructor(e,t){this.host=e,this.hass=t,e.addController(this)}hostDisconnected(){for(let e of this.timers)clearTimeout(e);this.timers.clear(),this.recent.clear(),this.celebrating.clear(),this.errors.clear(),this.armed.clear()}isPending(e){return this.pending.has(e)}error(e){return this.errors.get(e)}celebration(e){return this.celebrating.get(e)}isRecent(e){return this.recent.has(e)}justCompleted(e){return this.recent.get(e)?.completed??!1}frozenKey(e){return this.recent.get(e)?.key}isArmed(e){return this.armed.has(e)}async press(e){if(!sn(e)){await this.advance(e);return}let t=e.task_id,n=this.armed.get(t);if(!n){let r={readyAt:Date.now()+Pr};this.armed.set(t,r),this.later(vi,()=>{if(this.armed.get(t)===r)this.armed.delete(t)}),this.host.requestUpdate();return}if(n.readyAt>Date.now())return;this.armed.delete(t),await this.advance(e)}async advance(e){let t=e.task_id,n=this.recent.get(t);if(this.pending.has(t)||n&&n.coolUntil>Date.now())return;let r=e.stage_index+1>=e.stage_count;if(this.celebrate(t,r?"done":"stage"),!await this.track(e,r,(i)=>tr(i,t)))this.celebrating.delete(t);this.host.requestUpdate()}async skip(e){let t=e.task_id;await this.track(e,!1,(n)=>nr(n,t)),this.host.requestUpdate()}async undo(e){let t=e.task_id;if(await this.run(t,(r)=>rr(r,t)))this.recent.delete(t);this.host.requestUpdate()}async track(e,t,n){let r=e.task_id;if(!this.hass()||this.pending.has(r))return!1;let s=this.recent.get(r),i=this.remember(e,t),a=await this.run(r,n);if(a)window.dispatchEvent(new CustomEvent("haptic",{detail:t?"success":"light"}));else if(this.recent.get(r)===i)if(s)this.recent.set(r,s);else this.recent.delete(r);return a}remember(e,t){let n=e.task_id,r=Date.now(),s={completed:t,until:r+Cr,coolUntil:r+Pr,key:this.recent.get(n)?.key??Re(e)};return this.recent.set(n,s),this.later(Cr,()=>{if(this.recent.get(n)===s)this.recent.delete(n)}),s}celebrate(e,t){this.celebrating.set(e,t),this.later(_i,()=>{this.celebrating.delete(e)})}later(e,t){let n=setTimeout(()=>{this.timers.delete(n),t(),this.host.requestUpdate()},e);this.timers.add(n)}async run(e,t){let n=this.hass();if(!n||this.pending.has(e))return!1;this.pending.add(e),this.errors.delete(e),this.host.requestUpdate();try{return await t(n),!0}catch(r){return this.errors.set(e,de(r)),this.later(bi,()=>{this.errors.delete(e)}),!1}finally{this.pending.delete(e)}}}function de(e){if(e instanceof Error)return e.message;if(typeof e==="object"&&e!==null&&"message"in e)return String(e.message);return String(e)}var Dr="important",Rr=" !"+Dr,$i=0-Rr.length;class Or extends je{constructor(e){super(e);if(e.type!==lt.ATTRIBUTE||e.name!=="style"||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,n)=>{let r=e[n];if(r==null)return t;return n=n.includes("-")?n:n.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase(),t+`${n}:${r};`},"")}update(e,[t]){let{style:n}=e.element;if(this._previousStyleProperties===void 0)return this._previousStyleProperties=new Set(Object.keys(t)),this.render(t);for(let r of this._previousStyleProperties)if(t[r]==null)if(this._previousStyleProperties.delete(r),r.includes("-"))n.removeProperty(r);else n[r]=null;for(let r in t){let s=t[r];if(s!=null){this._previousStyleProperties.add(r);let i=typeof s==="string"&&s.endsWith(Rr);if(r.includes("-")||i)n.setProperty(r,i?s.slice(0,$i):s,i?Dr:"");else n[r]=s}}return Y}}var an=dt(Or);var o={coral:"#ff7a6b",coralDark:"#d9574b",sun:"#ffc857",sunDark:"#e0a233",mint:"#5fd6a8",mintDark:"#3bb286",sky:"#5ab4ff",skyDark:"#3a8fdb",lilac:"#b79bff",lilacDark:"#9176e0",pink:"#ff8fc7",pinkDark:"#de6aa4",cream:"#f6f1e4",creamDark:"#d9d2bf",metal:"#e8ecf5",metalMid:"#c5cde0",metalDark:"#8c96b3",glass:"#223258",water:"#6cc8f5",waterDark:"#3f9ad6",wicker:"#dd9f5f",wickerDark:"#b97a3f",wickerLight:"#f0bd82",terracotta:"#e0784f",terracottaDark:"#b95a38",soil:"#4a3429",soilWet:"#2f2019",leaf:"#5ccf7a",leafDark:"#3aa65b",stench:"#b4e65a",musty:"#8a9a5e",mustyDark:"#6f7f49",fly:"#2a2d3e",wing:"#dfe7f5",spark:"#fff3c4",check:"#4fd18b"},on={resting:{wall:"#262c49",floor:"#1d2239"},accumulating:{wall:"#2b2f55",floor:"#212542"},due:{wall:"#43305f",floor:"#33254a"},running:{wall:"#1f3f6b",floor:"#183154"},waiting:{wall:"#2c4358",floor:"#213443"},clean:{wall:"#17555c",floor:"#114247"}},Hr={wall:"#3e4a2b",floor:"#2d3720"};function Q(e){return Number.isFinite(e)?Math.min(1,Math.max(0,e)):0}function X(e,t){return t.filter((n)=>e>=n).length}function Vr(e){let t=Number.parseInt(e.slice(1),16);return[t>>16&255,t>>8&255,t&255]}function E(e,t,n){let r=Q(n),s=Vr(e),i=Vr(t);return`#${s.map((l,u)=>Math.round(l+((i[u]??l)-l)*r)).map((l)=>l.toString(16).padStart(2,"0")).join("")}`}function A(e){return Math.round(e*100)/100}function b(e,t,n,r=0,s=1){let i=r?` rotate(${A(r)})`:"",a=s===1?"":` scale(${A(s)})`;return c`<g transform="translate(${A(e)} ${A(t)})${i}${a}">${n}</g>`}function T(e,t,n=0){let r=n?`ht-a-${e} ht-d${n}`:`ht-a-${e}`;return c`<g class=${r}>${t}</g>`}function g(e,t,n){return n===void 0?c`<g data-part=${e}>${t}</g>`:c`<g data-part=${e} data-index=${n}>${t}</g>`}function D(e,t){return e?t():p}function xi(e,t){let n=on[e],r=e==="clean"?0:Q(t)*0.85;return{wall:E(n.wall,Hr.wall,r),floor:E(n.floor,Hr.floor,r)}}var wi="M0 168H200V172a28 28 0 0 1-28 28H28a28 28 0 0 1-28-28Z";function fe(e,t,n,r,s=!0){let i=n?.animations!==!1,a=xi(t.state,t.stink),l=`ht-scene ht-scene-${e}${i?" ht-animated":""}`,u=n?.label??e;return d`<svg
    class=${l}
    viewBox="0 0 200 200"
    role="img"
    aria-label=${u}
    data-scene=${e}
    data-state=${t.state}
  >
    ${c`<rect data-part="tile" width="200" height="200" rx="28" fill=${a.wall} />`}
    ${s?c`<circle cx="100" cy="98" r="86" fill="#fff" opacity=".05" /><path data-part="floor" d=${wi} fill=${a.floor} />`:p}
    ${r}
  </svg>`}function ce(e,t,n,r=0.28){return c`<ellipse cx=${e} cy=${t} rx=${n} ry="6" fill="#0c0f1e" opacity=${r} />`}function Se(e,t,n,r,s=1){let i=(u)=>c`<path d=${u} fill="none" stroke=${r} stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />`,a=(u,f=3.2)=>c`<circle cx=${u} cy="0" r=${f} fill=${r} />`,l={happy:[i("M-15 1q4-6 8 0"),i("M7 1q4-6 8 0"),i("M-5 7q5 6 10 0")],calm:[a(-11),a(11),i("M-4 8q4 3 8 0")],sleepy:[i("M-15 0h8"),i("M7 0h8"),i("M-3 9h6")],worried:[a(-11),a(11),i("M-16-8l7-3"),i("M16-8l-7-3"),i("M-6 11q3-5 6-2t6-1")],pleading:[c`<circle cx="-11" cy="0" r="5" fill=${r} /><circle cx="-9.4" cy="-1.8" r="1.7" fill="#fff" />`,c`<circle cx="11" cy="0" r="5" fill=${r} /><circle cx="12.6" cy="-1.8" r="1.7" fill="#fff" />`,i("M-3 10q3-3 6 0")],sick:[i("M-15-4l7 7m0-7l-7 7"),i("M8-4l7 7m0-7l-7 7"),i("M-8 12q4-5 8-1t8-1")]};return g("face",b(e,t,l[n],0,s))}function O(e,t,n,r){return g("sparkle",b(e,t,T("twinkle",c`<path d=${"M0-10C1.2-3 3-1.2 10 0C3 1.2 1.2 3 0 10C-1.2 3-3 1.2-10 0C-3-1.2-1.2-3 0-10Z"} fill=${o.spark} />`,r),0,n))}var Ti="M0 0c-9-7 9-13 0-20c-9-7 9-13 0-20";function ln(e,t=0){return e.map(([n,r],s)=>g("stench",b(n,r,T("waft",c`<path d=${Ti} fill="none" stroke=${o.stench} stroke-width="5.5" stroke-linecap="round" />`,s+t+1)),s+t))}function dn(e,t,n){let r=c`<path d="M-24 10q10 12 17-1" fill="none" stroke=${o.wing} stroke-width="1.8" stroke-linecap="round" stroke-dasharray="1 5" opacity=".75" />`,s=c`
    <ellipse cx="-3.5" cy="-7" rx="6" ry="3.4" transform="rotate(30 -3.5 -7)" fill=${o.wing} />
    <ellipse cx="3.5" cy="-7" rx="6" ry="3.4" transform="rotate(-30 3.5 -7)" fill=${o.wing} />
    <ellipse rx="5.2" ry="6.2" fill=${o.fly} stroke=${o.wing} stroke-width="1.4" />
  `;return g("fly",b(e,t,T("buzz",[r,s],n%3+1)),n)}function Oe(e,t,n,r=1){return b(e,t,c`<path d=${"M0-8C4-3 6 0 6 3a6 6 0 0 1-12 0C-6 0-4-3 0-8Z"} fill=${n} />`,0,r)}function Si(e,t){let n=(r,s)=>`${A(r*e)} ${A(s*t)}`;return[`M${n(-1,0.25)}`,`C${n(-1.05,-0.55)} ${n(-0.45,-1)} ${n(0.05,-0.92)}`,`C${n(0.75,-1)} ${n(1.08,-0.4)} ${n(1,0.2)}`,`C${n(1,0.8)} ${n(0.55,0.96)} ${n(0,0.92)}`,`C${n(-0.6,1)} ${n(-1,0.75)} ${n(-1,0.25)}Z`].join("")}function H(e,t,n,r,s,i,a=0){let l=`M${A(-n*0.45)} ${A(r*0.05)}q${A(n*0.35)} ${A(-r*0.5)} ${A(n*0.8)} ${A(r*0.05)}`;return b(e,t,c`<path d=${Si(n,r)} fill=${s} /><path d=${l} fill="none" stroke=${i} stroke-width="3" stroke-linecap="round" />`,a)}var Ei="M-11-24L-30-13L-24 2L-15-2V24H15V-2L24 2L30-13L11-24C8-18-8-18-11-24Z";function ft(e,t,n,r,s=0,i=1){return b(e,t,c`<path d=${Ei} fill=${n} stroke-linejoin="round" /><path d="M-15-2V8M15-2V8" stroke=${r} stroke-width="2.6" stroke-linecap="round" /><path d="M-11-24C-8-18 8-18 11-24" fill="none" stroke=${r} stroke-width="3" stroke-linecap="round" />`,s,i)}function ge(e,t,n,r,s=0,i=1){return b(e,t,c`<path d="M-8-22H8V2L20 10C27 15 22 25 13 22L-4 15C-7 13-8 11-8 8Z" fill=${n} /><path d="M-8-15H8" stroke=${r} stroke-width="5" /><path d="M-8-22H8" stroke=${r} stroke-width="4" stroke-linecap="round" />`,s,i)}function Mi(e){let{state:t,fill:n,progress:r,stink:s}=e,i=t==="running"||t==="waiting",a=Q(n);if(t==="clean"||t==="due")a=1;if(i)a=Math.max(0.12,Q(r));if(t==="resting")a=Math.min(a,0.12);return{level:a,tilt:t==="clean"?0:Math.round(Q(s)*14),arc:i?Q(r):0,tint:t==="clean"?0:Q(s),pulse:t==="due",check:t==="clean",idle:t==="resting"}}var W=66,Ai=[o.water,"#a2dca0","#ffc65c","#ff7a4f"],Ci=[o.waterDark,"#6fb777","#dd9a35","#c9502f"];function Nr(e,t){let n=Q(t)*(e.length-1),r=Math.min(e.length-2,Math.floor(n));return E(e[r]??o.water,e[r+1]??o.water,n-r)}var gt=66;function Lr(e,t){let n=`M-66 ${e}`;for(let r=-66;r<266;r+=gt)n+=`q${gt/4} ${-t} ${gt/2} 0t${gt/2} 0`;return`${n}V172H-66Z`}function Pi(){return[c`<path d="M-1-30V-6H-19Z" fill=${o.cream} />`,c`<path d="M3-23V-6H16Z" fill=${o.coral} />`,c`<path d="M-27-3H27L19 13H-19Z" fill=${o.sun} />`,c`<path d="M-27-3H27L24 3H-24Z" fill=${o.sunDark} />`]}function cn(e,t){let n=Mi(e),r=Nr(Ai,n.tint),s=Nr(Ci,n.tint),i=on[e.state].wall,a=n.check?0.84:n.level*0.74,l=A(100+W-a*W*2),u=E(o.metalMid,"#ffd29a",n.tint),f=2*Math.PI*(W+3),y=`M0 28A28 28 0 0 1 28 0H172A28 28 0 0 1 200 28V172A28 28 0 0 1 172 200H28A28 28 0 0 1 0 172ZM${100-W} 100a${W} ${W} 0 1 0 ${W*2} 0a${W} ${W} 0 1 0 ${-W*2} 0Z`,_=c`<circle cx="100" cy="100" r=${W} fill="#0e1228" opacity=".55" /><g fill=${o.spark}><circle cx="70" cy="66" r="2.2" /><circle cx="128" cy="58" r="2.8" /><circle cx="146" cy="96" r="1.9" /><circle cx="58" cy="108" r="1.7" /></g>`,k=[T("tide-back",c`<path d=${Lr(l-7,7)} fill=${s} />`),D(!n.check,()=>g("boat",b(100,l-8,T("bob",b(0,0,Pi(),n.tilt,0.8))))),T("tide",c`<path d=${Lr(l,9)} fill=${r} />`)],h=[c`<circle cx="100" cy="100" r=${W+3} fill="none" stroke=${u} stroke-width="10" />`,D(n.arc>0,()=>g("arc",c`<circle cx="100" cy="100" r=${W+3} fill="none" stroke=${o.sun} stroke-width="10" stroke-linecap="round" stroke-dasharray=${`${A(f*n.arc)} ${A(f)}`} transform="rotate(-90 100 100)" />`))];return fe("generic",{...e,stink:0},t,[_,g("water",k),c`<path d=${y} fill=${i} fill-rule="evenodd" />`,g("ring",n.pulse?b(100,100,T("pulse",b(-100,-100,h))):h),D(n.check,()=>g("check",[c`<path d="M72 102l20 21 38-44" fill="none" stroke="#fff" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />`,O(30,34,1.3,1),O(172,42,1,2),O(170,166,1.15,3),O(30,162,0.85,4)])),D(n.idle,()=>g("moon",b(100,92,c`<path d="M9-24A26 26 0 1 0 24 14 21 21 0 0 1 9-24Z" fill=${o.spark} />`)))],!1)}var un=6,Ir=[0.05,0.3,0.55],Di=[0.45,0.7,0.92],Ri=[0.02,0.4,0.75],Oi=[0.65,0.9];function Hi(e){let{state:t,fill:n,stink:r}=e;if(t==="clean")return{view:"drying",pile:0,overflow:!1,stench:0,flies:0,cloud:0,mood:"happy"};if(t==="running")return{view:"washing",pile:0,overflow:!1,stench:X(r,Ir),flies:0,cloud:0,mood:"happy"};if(t==="waiting"){let f=X(r,Ri);return{view:"wet",pile:0,overflow:!1,stench:0,flies:X(r,Oi),cloud:f,mood:f>=2?"sick":"pleading"}}let s=t==="due",i=s?un:Math.min(un-1,Math.floor(n*un)),a=X(r,Ir),l=X(r,Di),u=t==="resting"?"sleepy":"calm";if(s||i>=4)u="worried";if(r>=0.45)u="sick";return{view:"basket",pile:i,overflow:s,stench:a,flies:l,cloud:0,mood:u}}var Vi=[[1,[[100,106,()=>H(100,106,54,15,o.sky,o.skyDark,-3)]]],[2,[[70,98,()=>H(70,98,26,19,o.coral,o.coralDark,-12)],[135,92,()=>ge(135,92,o.sun,o.coral,24)]]],[3,[[112,86,()=>H(112,86,36,21,o.mint,o.mintDark,8)],[74,80,()=>H(74,80,22,16,o.pink,o.pinkDark,-10)]]],[4,[[96,66,()=>ft(96,66,o.sun,o.sunDark,-14,0.98)],[138,70,()=>ge(138,70,o.lilac,o.cream,34)]]],[5,[[122,52,()=>H(122,52,26,18,o.lilac,o.lilacDark,14)],[74,48,()=>H(74,48,25,17,o.sky,o.skyDark,-18)]]],[6,[[100,32,()=>ft(100,32,o.coral,o.coralDark,10,0.9)],[142,42,()=>H(142,42,16,13,o.mint,o.mintDark,20)],[58,40,()=>ge(58,40,o.pink,o.cream,-38,0.9)]]]];function Ni(){let e=[132,148,164];return[c`<path d="M36 114H164L154 174Q153 180 146 180H54Q47 180 46 174Z" fill=${o.wicker} />`,e.map((t)=>c`<rect x=${42+(t-132)*0.14} y=${t} width=${116-(t-132)*0.28} height="5" rx="2.5" fill=${o.wickerDark} opacity=".55" />`),c`<rect x="29" y="108" width="142" height="17" rx="8.5" fill=${o.wickerLight} />`,c`<rect x="86" y="112.5" width="28" height="8" rx="4" fill=${o.wickerDark} />`]}var Li="#5b3413";function Ii(e){return[Ni(),Se(100,150,e,Li,1.05)]}function Fi(e){return Vi.filter(([t])=>e>=t).map(([t,n])=>g("pile-step",n.map(([,,r])=>r()),t))}function Ui(){return g("overflow",[ge(34,164,o.sky,o.cream,62,0.82),H(170,172,20,10,o.coral,o.coralDark,6),b(160,106,T("wobble",ge(0,22,o.mint,o.sun,-18,0.92)))])}function zi(e){let t=[[22,100],[178,96],[172,46]],n=[[34,44],[146,20],[58,18]];return[ce(100,182,70),c`<ellipse cx="100" cy="112" rx="62" ry="9" fill=${o.wickerDark} />`,Fi(e.pile),D(e.overflow,Ui),Ii(e.mood),ln(t.slice(0,e.stench)),n.slice(0,e.flies).map(([r,s],i)=>dn(r,s,i))]}function Wi(){return[c`<rect x="42" y="172" width="20" height="9" rx="3" fill=${o.metalDark} /><rect x="138" y="172" width="20" height="9" rx="3" fill=${o.metalDark} />`,c`<rect x="32" y="22" width="136" height="154" rx="16" fill=${o.metal} />`,c`<path d="M32 66V38a16 16 0 0 1 16-16H152a16 16 0 0 1 16 16V66Z" fill=${o.metalMid} />`,c`<circle cx="56" cy="44" r="11.5" fill=${o.metal} /><rect x="54" y="33" width="4" height="12" rx="2" fill=${o.metalDark} />`,c`<circle cx="100" cy="118" r="47" fill=${o.metalMid} />`]}function Bi(e,t){return c`<circle cx=${e} cy="44" r="4.5" fill=${t?o.mint:o.metalDark} />`}function Ur(e,t){return[Wi(),[0,1,2].map((n)=>Bi(132+n*14,n<t)),Se(100,42,e,o.fly,0.85)]}function zr(e){return b(100,181,b(-100,-181,e),0,0.84)}function Xe(e,t,n,r){return g("bubble",b(e,t,T("rise",c`<circle r=${n} fill=${o.water} opacity=".22" /><circle r=${n} fill="none" stroke="#d6f2ff" stroke-width="2.4" /><circle cx=${-n*0.35} cy=${-n*0.35} r=${n*0.22} fill="#fff" />`,r)))}function qi(){let e=[H(0,-18,15,12,o.coral,o.coralDark,20),H(16,11,14,11,o.sun,o.sunDark,140),H(-16,10,14,12,o.mint,o.mintDark,250)];return[g("drum",b(100,118,T("spin",e))),b(100,118,T("slosh",c`<path d="M-37 8Q-27 1-18 7T0 7T18 7T37 8A38 38 0 0 1-37 8Z" fill=${o.water} opacity=".78" /><g fill="#eaf8ff"><circle cx="-20" cy="6" r="5" /><circle cx="-10" cy="4" r="6.5" /><circle cx="4" cy="6" r="5" /><circle cx="17" cy="4" r="6" /><circle cx="27" cy="7" r="3.5" /></g>`))]}function Ki(){return g("shake",[[28,102,"M0 0q-6 12 0 24"],[18,124,"M0 0q-6 12 0 24"],[172,102,"M0 0q6 12 0 24"],[182,124,"M0 0q6 12 0 24"]].map(([t,n,r],s)=>b(t,n,T("flicker",c`<path d=${r} fill="none" stroke="#a9c8f0" stroke-width="4" stroke-linecap="round" />`,s%2+1))))}function ji(e){return[ce(100,183,76),g("machine",T("rumble",zr([Ur(e.mood,2),c`<circle cx="100" cy="118" r="39" fill=${o.glass} />`,qi(),c`<circle cx="100" cy="118" r="39" fill="none" stroke=${o.metalDark} stroke-width="6" />`,c`<path d="M74 100a32 32 0 0 1 22-13" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".55" />`]))),Xe(142,44,11,1),Xe(58,40,8,2),Xe(174,58,7,3),Xe(26,62,9,4),Xe(100,36,6,5),Ki(),ln([[68,44],[132,44],[100,40]].slice(0,e.stench))]}function Zi(e,t,n,r){return g("cloud",b(e,t,T("drift",c`<g fill=${o.musty} opacity=".9"><circle cx="-16" cy="4" r="13" /><circle cx="3" cy="-5" r="17" /><circle cx="20" cy="5" r="12" /><rect x="-27" y="3" width="56" height="14" rx="7" /></g><path d="M-14 6q3 3 6 0M4 6q3 3 6 0" fill="none" stroke=${o.mustyDark} stroke-width="3" stroke-linecap="round" />`,r),0,n))}function Yi(){return g("wet-clothes",[H(100,120,26,20,"#3b6f93","#2b5473",-6),H(84,136,18,13,"#a55a55","#7f413e",12),H(114,139,19,13,"#3f8f76","#2e6e5a",-10),c`<path d="M70 139Q71 164 80 172Q88 164 86 142Z" fill="#a55a55" />`,c`<path d="M112 142Q112 160 120 166Q128 160 128 139Z" fill="#3f8f76" />`])}function Gi(){return g("door",[c`<ellipse cx="38" cy="118" rx="17" ry="46" fill=${o.metalDark} />`,c`<ellipse cx="38" cy="118" rx="11" ry="35" fill=${o.glass} />`,c`<path d="M33 96q-3 12-2 24" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`])}function Qi(){return g("drip",[[84,173,1],[119,168,2],[101,166,3]].map(([e,t,n])=>b(e,t,T("drip",Oe(0,0,o.water,0.85),n))))}function Xi(){return g("ding",b(170,54,T("pulse",c`<path d="M-14 4a14 14 0 0 1 28 0v5l5 7H-19l5-7ZM-5 19a5 5 0 0 0 10 0Z" fill=${o.sun} />`),-16))}function Ji(){return c`<ellipse cx="94" cy="184" rx="30" ry="6" fill=${o.water} opacity=".65" data-part="puddle" />`}function ea(e){let t=[[148,30,1],[50,32,0.9],[100,18,0.72]],n=[[176,96],[20,92]];return[ce(100,183,76),Ji(),g("machine",zr([Ur(e.mood,3),c`<circle cx="100" cy="118" r="39" fill="#141a33" />`,Yi(),Gi()])),Qi(),Xi(),t.slice(0,e.cloud).map(([r,s,i],a)=>Zi(r,s,i,a+1)),n.slice(0,e.flies).map(([r,s],i)=>dn(r,s,i))]}function ta(e,t){return c`<rect x=${e-2.5} y=${t-7} width="5" height="13" rx="2" fill=${o.sun} />`}var Fr=[{x:50,y:77,pegs:[[38,50],[62,53]],art:()=>T("sway",ft(0,0,o.sky,o.skyDark,0,1.12),1)},{x:102,y:58,pegs:[[89,55],[115,55]],art:()=>T("sway",[ge(-13,25,o.coral,o.cream,0,0.92),ge(13,25,o.coral,o.cream,0,0.92)],2)},{x:164,y:52,pegs:[[150,53],[178,50]],art:()=>T("sway",c`<rect x="-20" y="0" width="40" height="66" rx="5" fill=${o.sun} /><rect x="-20" y="44" width="40" height="8" fill=${o.coral} /><rect x="-20" y="55" width="40" height="4" fill=${o.coral} />`,3)}];function na(){return c`<path d="M-4 44Q100 66 204 44" fill="none" stroke="#bfe8e0" stroke-width="4" />`}function ra(){return g("folded",[ce(100,181,54),c`<rect x="58" y="162" width="84" height="16" rx="7" fill=${o.lilac} />`,c`<rect x="63" y="147" width="74" height="16" rx="7" fill=${o.mint} />`,c`<rect x="68" y="132" width="64" height="16" rx="7" fill=${o.cream} />`,c`<path d="M66 170h68M71 155h58M76 140h48" stroke="#000" stroke-opacity=".12" stroke-width="3" stroke-linecap="round" />`])}var sa=[[30,134,1.3,1],[168,138,1.05,2],[100,112,0.9,3],[180,26,0.8,4]];function ia(){return[na(),g("line",[Fr.map((e)=>b(e.x,e.y,e.art())),Fr.flatMap((e)=>e.pegs.map(([t,n])=>ta(t,n)))]),ra(),sa.map(([e,t,n,r])=>O(e,t,n,r))]}function Wr(e,t){let n=Hi(e);return fe("laundry",e,t,{basket:()=>zi(n),washing:()=>ji(n),wet:()=>ea(n),drying:ia}[n.view]()??p)}var et=[[52,72],[84,72],[116,72],[148,72],[52,124],[84,124],[116,124]],qr="#8f8a84",Kr="#aaa497",aa=E(o.coral,qr,0.5),oa=E(o.cream,Kr,0.5),la=0.35,da=[0.15,0.45,0.75],ca=[0.25,0.5,0.75];function ua(e,t=3){let{state:n,stink:r,fill:s}=e,i=Number.isFinite(t)?(Math.trunc(t)%7+7)%7:3,a=e.slots?.length===et.length?e.slots:void 0,l=a??et.map((v,S)=>S<i?"taken":"full"),u=i;if(a)u=n==="clean"?a.lastIndexOf("taken"):a.indexOf("current");let f=a?.[u]==="current",y=n==="clean"?0:X(r,da),k={resting:"quiet",accumulating:"quiet",due:"ready",running:"lifted",waiting:"taken-pending",clean:"popped"}[n],h=n==="resting"?"sleepy":"calm";if(n==="due")h="pleading";if(n==="clean"||n==="running")h="happy";if(y>=1)h="worried";if(y>=2)h="sick";return{day:u,cells:l,phase:k,pulse:n==="due"||f,glow:n==="accumulating"?X(s,ca):0,neglect:y,fade:n==="clean"?0:Q(r)*0.7,tilt:[0,-3,-6,-10][y]??0,mood:h}}function Je(e,t,n=0.6){return c`
    <rect x="-10" y="-22" width="20" height="44" rx="10" fill=${e} />
    <path d="M-10 0H10V12A10 10 0 0 1-10 12Z" fill=${t} />
    <rect x="-5.5" y="-16" width="4" height="13" rx="2" fill="#fff" opacity=${n} />
  `}function He(e,t,n){return n?c`<rect x=${e-13} y=${t-25} width="26" height="50" rx="13" fill="#545c78" /><path d=${`M${e-8} ${t+8}a8 11 0 0 0 16 0`} fill="none" stroke="#7d86a3" stroke-width="3.4" stroke-linecap="round" />`:c`<rect x=${e-13.5} y=${t-25.5} width="27" height="51" rx="13.5" fill=${o.metal} />`}function pa(e,t,n){return b(e,t,Je(E(aa,qr,n),E(oa,Kr,n),la))}function Br(e,t){return g("glass",b(e,t,[c`<path d="M-17-30H17L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill="#cfe8ff" opacity=".35" />`,c`<path d="M-15.5-10H15.5L13 26Q12.6 31 8 31H-8Q-12.6 31-13 26Z" fill=${o.water} />`,c`<path d="M-9-2L-7 22" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".55" />`]))}function ha(e,t){return g("check",b(e,t,[c`<circle r="19" fill=${o.check} /><path d="M-9 0l6.5 7L9.5-7" fill="none" stroke="#fff" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round" />`]))}function ma(e){return g("dust",[[44,46,2.6],[132,104,2.2],[150,134,3],[66,100,2],[104,46,2.4],[36,148,2.2],[128,150,2.8],[92,98,2.2]].slice(0,e*3).map(([n,r,s])=>c`<circle cx=${n} cy=${r} r=${s} fill="#b9b3a3" opacity=".85" />`))}function fa(){return g("cobweb",c`<g fill="none" stroke=${"#d7dce8"} stroke-width="2" stroke-linecap="round" opacity=".8">
      <path d="M200 28L146 34M200 28L154 8M172 0L166 22" />
      <path d="M178 2Q180 14 200 16M162 6Q164 24 200 40M150 18Q156 34 170 28" />
    </g>`)}function ga(){return g("spider",[c`<path d="M160 24V66" stroke="#d7dce8" stroke-width="1.8" />`,b(160,70,T("bob",c`<g fill="none" stroke=${o.fly} stroke-width="2.6" stroke-linecap="round">
            <path d="M-6-3L-15-9M-6 0L-16 0M-6 3L-15 9M6-3L15-9M6 0L16 0M6 3L15 9" />
          </g><circle r="9" fill=${o.fly} stroke=${o.wing} stroke-width="1.4" /><circle cx="-3.2" cy="-1.5" r="2.1" fill="#fff" /><circle cx="3.2" cy="-1.5" r="2.1" fill="#fff" />`))])}function jr(e,t){let n=ua(e,t?.day),r=E(o.metalMid,"#8c8a80",n.fade),s=E(o.coral,"#a59a90",n.fade),i=E(o.cream,"#b3ad9e",n.fade),a=E(o.sun,"#a59a90",n.fade),l=et[n.day]??et[3]??[84,72],[u,f]=l,y=et.flatMap(([J,ee],te)=>{if(te===n.day)return[];let Ie=n.cells[te];if(Ie==="taken")return[g("empty-well",He(J,ee,!0),te)];if(Ie==="missed")return[g("missed-pill",[He(J,ee,!1),pa(J,ee,n.fade)],te)];return[g("pill",[He(J,ee,!1),b(J,ee,Je(s,i))],te)]}),_=n.day>=0,k=(J)=>b(u,f,n.pulse?T("pulse",J):J),h=n.phase==="ready"?1:Math.max(n.glow*0.3,n.pulse?0.45:0),v=D(n.pulse||n.glow>0,()=>g("halo",k(c`<rect x="-18.5" y="-30.5" width="37" height="61" rx="18.5" fill="none" stroke=${o.sun} stroke-width="5" opacity=${h} />`))),S;if(!_)S=p;else if(n.phase==="popped"||n.phase==="taken-pending")S=[v,g("empty-well",He(u,f,!0),n.day)];else if(n.phase==="lifted")S=[v,g("empty-well",He(u,f,!0),n.day),g("next-pill",b(u,f-16,T("bob",Je(a,i)),18),n.day)];else S=[v,He(u,f,!1),g("next-pill",b(u,f,n.pulse?T("throb",Je(a,i)):Je(a,i)),n.day)];let L=n.phase==="popped"||n.phase==="taken-pending",xt=b(L?86:100,L?90:100,b(-100,-100,[c`<rect x="30" y="36" width="140" height="124" rx="16" fill=${r} />`,c`<path d="M30 92H170" stroke=${E(o.metalDark,"#6d6b62",n.fade)} stroke-width="2.5" stroke-dasharray="3 7" stroke-linecap="round" />`,y,S,Se(148,124,n.mood,E(o.fly,"#4d4b45",n.fade),0.82),D(n.neglect>0,()=>ma(n.neglect)),D(_&&n.phase==="popped",()=>ha(u,f))]),n.tilt,L?0.84:1),be=[];if(n.phase==="popped")be.push(Br(168,146),O(26,30,1.2,1),O(178,34,0.95,2),O(24,130,0.85,3));if(n.phase==="taken-pending")be.push(Br(168,146));if(n.neglect>=2)be.push(fa());if(n.neglect>=3)be.push(ga());return fe("pills",e,t,[ce(100,176,72),xt,be])}var yt=4,ya=[0.1,0.4,0.75];function _a(e){let{state:t,fill:n,stink:r}=e;if(t==="clean")return{droop:0,wilt:0,petals:8,fallen:0,wet:!0,drops:!0,can:!1,thirst:!1,mood:"happy"};let s=X(r,ya);if(t==="running"||t==="waiting")return{droop:Math.min(1,Math.floor(n*(yt+1))),wilt:s,petals:8-s*2,fallen:s,wet:!0,drops:!1,can:t==="running",thirst:!1,mood:t==="running"?"happy":"calm"};let i=Math.min(yt,Math.floor(n*(yt+1))),a=t==="due"?yt:i,l=t==="resting"?"sleepy":a>=2?"worried":"calm";if(t==="due")l="pleading";if(s>=2)l="sick";return{droop:a,wilt:s,petals:8-s*2,fallen:s,wet:!1,drops:!1,can:!1,thirst:t==="due",mood:l}}var Zr=78,Yr="M0 0C-14-7-15-27 0-40C15-27 14-7 0 0Z",ba=[0.12,0.65,1.3,1.95,2.55];function tt(e,t){let n=Zr*t;if(Math.abs(e)<0.001)return{x:0,y:-n,angle:0};let r=e/Zr;return{x:(1-Math.cos(r*n))/r,y:-Math.sin(r*n)/r,angle:r*n}}function Gr(e){return e*180/Math.PI}function va(e){return Array.from({length:9},(n,r)=>tt(e,r/8)).map((n,r)=>`${r?"L":"M"}${A(n.x)} ${A(n.y)}`).join("")}function ka(e,t,n){return[Array.from({length:8},(s,i)=>i).filter((s)=>s<e).map((s)=>c`<ellipse cx="0" cy="-17" rx="8" ry="12" transform=${`rotate(${s*45})`} fill=${t} data-part="petal" />`),c`<circle r="11" fill=${n} />`]}function pn(e,t,n,r,s,i){return b(e.x,e.y,[c`<path d=${Yr} fill=${r} />`,c`<path d="M0-4V-32" stroke=${s} stroke-width="2.6" stroke-linecap="round" />`],Gr(e.angle)+t*n,i)}function $a(){return g("watering-can",[b(150,42,[c`<rect x="-20" y="-14" width="46" height="34" rx="7" fill=${o.sky} />`,c`<path d="M-20-2L-48-20" stroke=${o.sky} stroke-width="8" stroke-linecap="round" />`,c`<rect x="-56" y="-30" width="9" height="20" rx="3" transform="rotate(-32 -52 -20)" fill=${o.skyDark} />`,c`<path d="M26-6a14 14 0 0 1 0 22" fill="none" stroke=${o.skyDark} stroke-width="6" stroke-linecap="round" />`],-10),[[92,60,1],[104,74,2],[84,82,3],[96,96,4]].map(([e,t,n])=>b(e,t,T("fall",Oe(0,0,o.water,0.9),n)))])}function Qr(e,t){let n=_a(e),r=n.wilt/3,s=(ba[n.droop]??0)+n.wilt*0.12,i=E(o.leaf,"#9b7a3e",r),a=E(o.leafDark,"#7a5d2c",r),l=E(o.leafDark,"#7f6a35",r),u=E(o.pink,"#a98a6b",r),f=E(o.sun,"#8d6b37",r),y=52+n.droop*14,_=tt(s,1),k=n.droop===0&&n.wilt===0&&!n.can,h=[c`<path d=${va(s)} fill="none" stroke=${l} stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round" />`,pn(tt(s,0.26),-1,y,i,a,1.05),pn(tt(s,0.48),1,y,i,a,1),pn(tt(s,0.7),-1,y+8,i,a,0.82),g("flower",b(_.x,_.y,ka(n.petals,u,f),Gr(_.angle),0.98))],v=[[46,172,-30],[158,176,40],[62,180,70]].slice(0,n.fallen).map(([S,L,ae],Le)=>g("fallen-leaf",b(S,L,[c`<path d=${Yr} fill=${E("#9b7a3e","#6d4f28",n.wilt/3)} />`],ae,0.5),Le));return fe("plant",e,t,[ce(100,183,52),v,b(100,138,g("stem",k?T("sway",h):h)),c`<path d="M62 134H138L130 176Q129 182 122 182H78Q71 182 70 176Z" fill=${o.terracotta} />`,c`<rect x="55" y="122" width="90" height="19" rx="8" fill=${o.terracottaDark} />`,c`<ellipse cx="100" cy="124" rx="38" ry="4.5" fill=${n.wet?o.soilWet:o.soil} data-part="soil" />`,D(!n.wet&&n.wilt>0,()=>g("cracks",c`<path d="M78 124l6 2 3-2M108 123l5 2 4-2" fill="none" stroke="#7a5a44" stroke-width="2" stroke-linecap="round" />`)),Se(100,158,n.mood,"#5b2612",0.95),D(n.thirst,()=>g("thirst",[c`<circle cx="64" cy="82" r="4.5" fill=${o.cream} /><circle cx="54" cy="69" r="7.5" fill=${o.cream} />`,b(42,40,T("pulse",[c`<circle r="24" fill=${o.cream} />`,Oe(0,1,o.waterDark,1.7)]))])),D(n.can,$a),D(n.drops,()=>g("drops",[[52,34,1],[148,26,2],[32,80,3],[170,74,4]].map(([S,L,ae])=>b(S,L,T("fall",Oe(0,0,o.water,1.05),ae))))),D(n.drops,()=>[O(40,112,1,2),O(164,118,0.85,3),O(100,16,0.9,1)])])}var Xr={generic:cn,laundry:Wr,pills:jr,plant:Qr};function xa(e){return Object.hasOwn(Xr,e)}function wa(e){return xa(e)?Xr[e]:cn}function q(e,t){return wa(e.name)(e,t)}var Ta={check:"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z",undo:"M12.5,8C9.85,8 7.45,9 5.6,10.6L2,7V16H11L7.38,12.38C8.77,11.22 10.54,10.5 12.5,10.5C16.04,10.5 19.05,12.81 20.1,16L22.47,15.22C21.08,11.03 17.15,8 12.5,8Z",skip:"M16,18H18V6H16M6,18L14.5,12L6,6V18Z",bolt:"M7,2V13H10V22L17,10H13L17,2H7Z",menu:"M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z",plus:"M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",up:"M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",down:"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",trash:"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",alert:"M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z",chevron:"M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"};function R(e){return d`<svg class="ht-icon" viewBox="0 0 24 24" aria-hidden="true">
    ${c`<path d=${Ta[e]} fill="currentColor"></path>`}
  </svg>`}function _t(e,t){let{tracker:n}=t,r=t.ids?.length?t.ids:void 0,s=e.filter((a)=>{if(r&&!r.includes(a.task_id))return!1;if(t.show==="all")return!0;return a.is_today||a.status==="clean"||(n?.isRecent(a.task_id)??!1)});if(r)return s.toSorted((a,l)=>r.indexOf(a.task_id)-r.indexOf(l.task_id));return s.map((a)=>({view:a,key:n?.frozenKey(a.task_id)??Re(a)})).toSorted((a,l)=>mt(a.key,l.key)).map(({view:a})=>a)}function Ve(e){return e.status==="due"||e.status==="overdue"||e.status==="in_progress"}function Sa(e){let t=/^#([0-9a-f]{6})$/i.exec(e);if(!t?.[1])return;let n=Number.parseInt(t[1],16),r=(i)=>n>>i&255;return 0.299*r(16)+0.587*r(8)+0.114*r(0)>150?"#14182a":"#ffffff"}function Jr(e){if(!e.color)return{};let t=Sa(e.color);return{"--ht-task":e.color,...t?{"--ht-on-task":t}:{}}}function Ea(e,t){if(e.action)return e.action;if(e.stage_index===0&&e.stage_count>1)return t.t("action_start");return t.t("action_advance")}function es(e,t){return q(e.scene,{animations:t.animations,day:t.day,label:`${e.title}: ${t.i18n.t(`status_${e.status}`)}`})}function ts(e){if(!e.icon||e.scene.name!=="generic")return p;return d`<span class="badge" aria-hidden="true"><ha-icon .icon=${e.icon}></ha-icon></span>`}function ns(e,t){let{i18n:n,tracker:r}=t,s=e.task_id,i=r.justCompleted(s),a=!e.can_advance,l=!i&&!a&&sn(e),u=l&&r.isArmed(s),f=Ea(e,n);if(i)f=n.t("status_done");else if(a)f=n.t(`status_${e.status}`);else if(l)f=n.t(u?"action_early_confirm":"action_early");let y=!u&&(!Ve(e)||e.automated);return d`<button
    class="go ${y?"quiet":"loud"} ${i?"finished":""}"
    data-action="advance"
    aria-label="${f}: ${e.title}"
    ?disabled=${a||i||t.offline}
    ?data-pending=${r.isPending(s)}
    @click=${()=>{r.press(e)}}
  >
    ${i?R("check"):p}
    <span>${f}</span>
  </button>`}function rs(e,t){let{i18n:n,tracker:r}=t;if(!e.can_undo||!r.isRecent(e.task_id))return p;return d`<button
    class="undo ${t.animations?"enter":""}"
    data-action="undo"
    aria-label="${n.t("action_undo")}: ${e.title}"
    ?disabled=${t.offline||r.isPending(e.task_id)}
    @click=${()=>{r.undo(e)}}
  >
    ${R("undo")}
  </button>`}function ss(e,t){if(!t.animations||t.tracker.celebration(e.task_id)!=="done")return p;return d`<span class="burst" aria-hidden="true">
    <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
  </span>`}function Ma(e,t){if(e.stage_count<2||e.stage_count>8)return p;let n=t.i18n.t("stage_progress",{current:e.stage_index+1,total:e.stage_count});return d`<span class="dots" role="img" aria-label=${n}>
    ${Array.from({length:e.stage_count},(r,s)=>d`<i
          class=${s<e.stage_index?"past":s===e.stage_index?"now":""}
        ></i>`)}
  </span>`}function is(e,t){return d`<div class="stage">
    ${Ma(e,t)}<span class="stage-name">${e.stage_title}</span>
    ${e.automated?d`<span class="auto" data-part="automated"
            >${R("bolt")}${t.i18n.t("automated")}</span
          >`:p}
  </div>`}function as(e,t){let n=t.tracker.error(e.task_id);return n?d`<div class="due failed" role="alert">
        ${t.i18n.t("error_generic",{message:n})}
      </div>`:d`<div class="due">${t.i18n.dueText(e,t.now)}</div>`}function os(e,t,n){let r=t.animations?t.tracker.celebration(e.task_id):void 0;return`${n} is-${e.status}${r?` pop-${r}`:""}`}function ls(e,t){return d`<div
    class=${os(e,t,"row")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${an(Jr(e))}
  >
    <div class="thumb">${es(e,t)} ${ts(e)}</div>
    <div class="text">
      <div class="title">${e.title}</div>
      ${is(e,t)} ${as(e,t)}
    </div>
    ${rs(e,t)}
    <div class="go-wrap">${ns(e,t)}${ss(e,t)}</div>
  </div>`}function bt(e,t,n={}){let{i18n:r,tracker:s}=t,i=n.skip===!0&&e.can_skip&&Ve(e);return d`<article
    class=${os(e,t,"tile")}
    data-task=${e.task_id}
    data-status=${e.status}
    style=${an(Jr(e))}
  >
    <div class="art">${es(e,t)} ${ts(e)} ${rs(e,t)}</div>
    <div class="text">
      <div class="title">${e.title}</div>
      ${is(e,t)} ${as(e,t)}
    </div>
    <div class="actions">
      <div class="go-wrap">${ns(e,t)}${ss(e,t)}</div>
      ${i?d`<button
              class="skip"
              data-action="skip"
              aria-label="${r.t("action_skip")}: ${e.title}"
              ?disabled=${t.offline||s.isPending(e.task_id)}
              @click=${()=>{s.skip(e)}}
            >
              ${R("skip")}
            </button>`:p}
    </div>
  </article>`}function vt(e,t){return Array.from({length:e},()=>d`<div class="${t} skeleton" aria-hidden="true"></div>`)}var ie=M`
  .ht-icon {
    width: 20px;
    height: 20px;
    flex: none;
  }
`,kt=M`
  .row,
  .tile {
    position: relative;
    box-sizing: border-box;
    color: var(--ht-fg);
  }

  .row {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    height: 88px;
    padding: 8px 0;
  }

  .row + .row {
    border-top: 1px solid var(--ht-divider);
  }

  .thumb,
  .art {
    position: relative;
    overflow: hidden;
    border-radius: calc(var(--ht-radius) * 0.9);
    background: var(--ht-surface-alt);
  }

  .thumb {
    width: 72px;
    height: 72px;
  }

  .art {
    aspect-ratio: 1;
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
    background: var(--ht-surface);
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

  .stage {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    height: 20px;
    color: var(--ht-muted);
    font-size: 0.875rem;
  }

  .auto {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 2px;
    color: var(--ht-accent);
    font-size: 0.75rem;
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
    font-size: 0.875rem;
    line-height: 20px;
  }

  .is-due .due,
  .is-in_progress .due {
    color: var(--ht-accent);
  }

  .is-overdue .due,
  .due.failed {
    color: var(--ht-danger);
  }

  .is-clean .due {
    color: var(--ht-success);
  }

  .go-wrap {
    position: relative;
    flex: 1;
    min-width: 0;
  }

  .row .go-wrap {
    width: 104px;
  }

  .go {
    appearance: none;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    height: 64px;
    padding: 0 10px;
    border: 2px solid transparent;
    border-radius: calc(var(--ht-radius) * 1.2);
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
    border-color: var(--ht-task, var(--ht-divider));
    background: transparent;
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
    border: 1px solid var(--ht-divider);
    border-radius: 50%;
    background: var(--ht-surface);
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
    top: 22px;
    right: 112px;
  }

  .tile .undo {
    top: 8px;
    right: 8px;
  }

  .tile {
    display: grid;
    grid-template-rows: auto auto auto;
    gap: 10px;
    padding: 10px;
    border-radius: calc(var(--ht-radius) * 1.3);
    background: var(--ht-surface);
    box-shadow: var(--ha-card-box-shadow, none);
  }

  .tile .title {
    font-size: 1.1875rem;
  }

  .actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .skeleton {
    background: var(--ht-surface-alt);
    opacity: 0.5;
  }

  .row.skeleton {
    margin-block: 4px;
    height: 80px;
    border-radius: var(--ht-radius);
  }

  .tile.skeleton {
    height: 340px;
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

  @media (prefers-reduced-motion: no-preference) {
    .burst i {
      animation: ht-burst 0.8s steps(16) forwards;
    }

    .undo.enter {
      animation: ht-appear 0.2s steps(5) both;
    }

    .pop-done .thumb,
    .pop-done .art {
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
`;var K=M`
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
    --ht-touch: 56px;
    --ht-gap: 12px;
    color: var(--ht-fg);
  }
`,ye=M`
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
`,_e=M`
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
`;var hn={tasks:[],i18n:Zt(typeof navigator>"u"?"en":navigator.language)},ds={title:"config_title",show:"config_show",layout:"config_layout",tasks:"config_tasks",animations:"config_animations"};function Aa(e){if(e.show!==void 0&&e.show!=="today"&&e.show!=="all")throw Error('show must be "today" or "all"');if(e.layout!==void 0&&e.layout!=="list"&&e.layout!=="scenes")throw Error('layout must be "list" or "scenes"');if(e.tasks!==void 0&&!Array.isArray(e.tasks))throw Error("tasks must be a list of task ids")}class mn extends P{static properties={hass:{attribute:!1,hasChanged:me},config:{state:!0}};static styles=[K,ie,_e,kt,M`
      :host {
        display: block;
      }

      ha-card {
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
        gap: 12px;
      }

      .tiles .tile {
        background: var(--ht-surface-alt);
      }

      .tiles .undo {
        background: var(--ht-surface-alt);
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
        .row {
          grid-template-columns: 56px minmax(0, 1fr) auto;
          gap: 8px;
        }

        .row .thumb {
          width: 56px;
          height: 56px;
        }

        .row .go-wrap {
          width: 88px;
        }

        .row .undo {
          right: 96px;
        }

        .row .auto {
          font-size: 0;
          gap: 0;
        }
      }
    `];static getConfigForm(){let{i18n:e,tasks:t}=hn;return{schema:[{name:"title",selector:{text:{}}},{name:"show",selector:{select:{mode:"dropdown",options:[{value:"today",label:e.t("config_show_today")},{value:"all",label:e.t("config_show_all")}]}}},{name:"layout",selector:{select:{mode:"dropdown",options:[{value:"list",label:e.t("config_layout_list")},{value:"scenes",label:e.t("config_layout_scenes")}]}}},{name:"tasks",selector:{select:{multiple:!0,custom_value:!0,options:t}}},{name:"animations",selector:{boolean:{}}}],computeLabel:(n)=>{let r=Object.hasOwn(ds,n.name)?ds[n.name]:void 0;return r?e.t(r):void 0}}}static getStubConfig(){return{show:"today",layout:"list",animations:!0}}live;tracker;constructor(){super();this.config={},this.live=new Ge(this,()=>this.hass,(e)=>{this.updateCatalog(e)}),this.tracker=new Qe(this,()=>this.hass)}setConfig(e){Aa(e),this.config={...e}}getCardSize(){let e=this.views(),t=this.config.layout==="scenes"?5:2;return Math.max(2,1+Math.max(1,e.length)*t)}getGridOptions(){return{columns:12,rows:"auto",min_columns:6,min_rows:2}}willUpdate(e){if(e.has("hass")){if(this.live.sync(),this.hass)hn.i18n=z(this.hass)}}updateCatalog(e){hn.tasks=e.tasks.map((t)=>({value:t.id,label:t.title}))}views(){let{state:e}=this.live;if(!e)return[];return _t(e.views,{show:this.config.show??"today",ids:this.config.tasks,tracker:this.tracker})}context(e,t){let{now:n}=this.live;return{i18n:t,tracker:this.tracker,now:n,animations:this.config.animations!==!1&&!ht(),day:Ye(n,se(e)),offline:Te(e)}}body(e,t,n){let{state:r,failed:s}=this.live;if(s&&!r)return d`<div class="message" role="alert">
        <strong>${t.t("card_error")}</strong>
        <span>${t.t("card_error_hint")}</span>
      </div>`;if(!r)return d`<div
        class=${n?"tiles":"list"}
        aria-busy="true"
        aria-label=${t.t("card_loading")}
      >
        ${vt(2,n?"tile":"row")}
      </div>`;let i=this.views();if(i.length===0)return this.empty(t);let a=this.context(e,t);return d`<div class=${n?"tiles":"list"}>
      ${B(i,(l)=>l.task_id,(l)=>n?bt(l,a):ls(l,a))}
    </div>`}empty(e){return d`<div class="empty" data-part="empty">
      <div class="thumb">
        ${q({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:!1})}
      </div>
      <div>${e.t("card_empty")}</div>
    </div>`}render(){let{hass:e}=this;if(!e)return p;let t=z(e),n=this.config.layout==="scenes",r=this.live.state?this.views().filter((s)=>Ve(s)).length:0;return d`<ha-card>
      <header>
        <h2>${this.config.title??t.t("card_title")}</h2>
        ${Te(e)?d`<span class="offline" role="status"
                >${R("alert")}${t.t("disconnected")}</span
              >`:r>0?d`<span class="count">${t.plural("tasks_due",r)}</span>`:p}
      </header>
      ${this.body(e,t,n)}
    </ha-card>`}}var fn=(e)=>e??p;var Ca=["generic","pills","laundry","plant"],Pa=["once","daily","weekly","interval"],Da=[0,1,2,3,4,5,6];function Ne(e){let{target:t}=e;if(t instanceof HTMLInputElement||t instanceof HTMLSelectElement||t instanceof HTMLTextAreaElement)return t.value;return""}function cs(e){let{target:t}=e;return t instanceof HTMLInputElement&&t.checked}class gn extends P{static properties={hass:{attribute:!1},source:{attribute:!1},now:{attribute:!1},readonly:{type:Boolean},form:{state:!0},showErrors:{state:!0},saving:{state:!0},failure:{state:!0},picker:{state:!0},confirming:{state:!0}};static styles=[K,ye,ie,_e,M`
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
    `];constructor(){super();this.now=new Date,this.readonly=!1,this.form=null,this.showErrors=!1,this.saving=!1,this.failure=null,this.picker=null,this.confirming=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||!this.form)return!0;let t=e.get("hass");if(!pt(t)||this.picker!==null)return!0;return this.form.stages.some((n)=>t.states[n.entity]!==this.hass.states[n.entity])}willUpdate(e){if(e.has("source"))this.form=yr(this.source,se(this.hass),this.now),this.showErrors=!1,this.failure=null,this.confirming=!1}patch(e){if(this.form)this.form={...this.form,...e}}patchStage(e,t){if(!this.form)return;this.patch({stages:this.form.stages.map((n,r)=>r===e?{...n,...t}:n)})}errors(e){return this.showErrors?tn(e,se(this.hass)):{}}async save(){let e=this.form;if(!e||this.readonly||this.saving)return;let t=se(this.hass);if(Object.keys(tn(e,t)).length>0){this.showErrors=!0,await this.updateComplete,this.renderRoot.querySelector('[aria-invalid="true"]')?.scrollIntoView?.({block:"center"});return}this.saving=!0,this.failure=null;try{let n=vr(e,t);if(n.id===void 0)await ir(this.hass,n);else await ar(this.hass,{...n,id:n.id});this.close()}catch(n){this.failure=de(n)}finally{this.saving=!1}}async removeTask(){let e=this.form?.id;if(!e||this.readonly)return;this.saving=!0,this.failure=null;try{await or(this.hass,e),this.close()}catch(t){this.failure=de(t)}finally{this.saving=!1}}close=()=>{this.dispatchEvent(new CustomEvent("ht-close",{bubbles:!0,composed:!0}))};message(e,t){if(!e)return p;return d`<span class="err" role="alert">${t.t(e.key,e.vars)}</span>`}input(e){let{path:t,label:n,value:r,errors:s,i18n:i,onInput:a}=e;return d`<label class="ht-label">
      ${n}
      <input
        class="ht-input"
        data-field=${t}
        type=${e.type??"text"}
        inputmode=${fn(e.inputmode)}
        placeholder=${fn(e.placeholder)}
        aria-invalid=${s[t]?"true":"false"}
        .value=${r}
        ?disabled=${this.readonly}
        @input=${(l)=>{a(Ne(l))}}
      />
      ${e.hint?d`<span class="hint">${e.hint}</span>`:p}
      ${this.message(s[t],i)}
    </label>`}select(e){let{path:t,label:n,value:r,choices:s,onChange:i}=e;return d`<label class="ht-label">
      ${n}
      <select
        class="ht-input"
        data-field=${t}
        ?disabled=${this.readonly}
        @change=${(a)=>{let l=s.find((u)=>u.value===Ne(a));if(l)i(l.value)}}
      >
        ${s.map((a)=>d`<option value=${a.value} ?selected=${a.value===r}>
              ${a.label}
            </option>`)}
      </select>
    </label>`}renderDetails(e,t,n){return d`<section>
      <h3>${n.t("section_details")}</h3>
      ${this.input({path:"title",label:n.t("field_title"),value:e.title,errors:t,i18n:n,onInput:(r)=>{this.patch({title:r})}})}
      <div class="ht-label">
        ${n.t("field_scene")}
        <div class="scenes">
          ${Ca.map((r)=>d`<button
                type="button"
                class="scene"
                data-scene=${r}
                aria-pressed=${e.scene===r?"true":"false"}
                ?disabled=${this.readonly}
                @click=${()=>{this.patch({scene:r})}}
              >
                <span class="scene-art">
                  ${q({name:r,state:"accumulating",fill:0.6,stink:0,progress:0},{animations:!1})}
                </span>
                ${n.t(`scene_${r}`)}
              </button>`)}
        </div>
      </div>
      <div class="pair">
        ${this.input({path:"icon",label:n.t("field_icon"),value:e.icon,errors:t,i18n:n,placeholder:"mdi:…",hint:n.t("hint_icon"),onInput:(r)=>{this.patch({icon:r})}})}
        <div class="ht-label">
          ${n.t("field_color")}
          <div class="inline">
            <input
              class="ht-input swatch"
              type="color"
              data-field="color"
              .value=${e.color||"#5ab4ff"}
              ?disabled=${this.readonly}
              @input=${(r)=>{this.patch({color:Ne(r)})}}
            />
            <button
              type="button"
              class="ht-btn"
              data-action="clear-color"
              ?disabled=${this.readonly||!e.color}
              @click=${()=>{this.patch({color:""})}}
            >
              ${n.t("action_clear")}
            </button>
          </div>
        </div>
      </div>
      <label class="ht-label">
        ${n.t("field_notes")}
        <textarea
          class="ht-input"
          data-field="notes"
          .value=${e.notes}
          ?disabled=${this.readonly}
          @input=${(r)=>{this.patch({notes:Ne(r)})}}
        ></textarea>
      </label>
      ${this.renderAssignee(e,t,n)}
      <label class="check">
        <input
          type="checkbox"
          data-field="enabled"
          .checked=${e.enabled}
          ?disabled=${this.readonly}
          @change=${(r)=>{this.patch({enabled:cs(r)})}}
        />
        ${n.t("field_enabled")}
      </label>
    </section>`}renderAssignee(e,t,n){let r=Object.values(this.hass.states).filter((s)=>s.entity_id.startsWith("person."));return d`<label class="ht-label">
      ${n.t("field_assignee")}
      <input
        class="ht-input"
        data-field="assignee"
        list="ht-people"
        placeholder=${n.t("hint_assignee")}
        .value=${e.assignee}
        ?disabled=${this.readonly}
        aria-invalid=${t.assignee?"true":"false"}
        @input=${(s)=>{this.patch({assignee:Ne(s)})}}
      />
      <datalist id="ht-people">
        ${r.map((s)=>d`<option value=${s.entity_id}></option>`)}
      </datalist>
    </label>`}renderSchedule(e,t,n){let r=this.input({path:"time",label:n.t("field_time"),value:e.time,type:"time",errors:t,i18n:n,onInput:(i)=>{this.patch({time:i})}}),s;switch(e.schedule){case"once":s=this.input({path:"due",label:n.t("field_due"),value:e.due,type:"datetime-local",errors:t,i18n:n,onInput:(i)=>{this.patch({due:i})}});break;case"daily":s=r;break;case"weekly":s=d`<div class="ht-label">
            ${n.t("field_weekdays")}
            <div class="segments">${Da.map((i)=>this.weekdayButton(e,i,n))}</div>
            ${this.message(t.weekdays,n)}
          </div>
          ${r}`;break;default:s=d`<div class="pair">
            ${this.input({path:"every_days",label:n.t("field_every_days"),value:e.every_days,inputmode:"numeric",errors:t,i18n:n,onInput:(i)=>{this.patch({every_days:i})}})}
            ${r}
          </div>
          ${this.select({path:"anchor",label:n.t("field_anchor"),value:e.anchor,choices:[{value:"completion",label:n.t("anchor_completion")},{value:"schedule",label:n.t("anchor_schedule")}],onChange:(i)=>{this.patch({anchor:i})}})}`;break}return d`<section>
      <h3>${n.t("field_schedule")}</h3>
      <div class="segments" role="group" aria-label=${n.t("field_schedule_type")}>
        ${Pa.map((i)=>d`<button
              type="button"
              class="ht-btn segment"
              data-schedule=${i}
              aria-pressed=${e.schedule===i?"true":"false"}
              ?disabled=${this.readonly}
              @click=${()=>{this.patch({schedule:i})}}
            >
              ${n.t(`schedule_${i}`)}
            </button>`)}
      </div>
      ${s}
    </section>`}weekdayButton(e,t,n){let r=e.weekdays.includes(t);return d`<button
      type="button"
      class="ht-btn segment"
      data-weekday=${t}
      aria-label=${n.weekday(t,"long")}
      aria-pressed=${r?"true":"false"}
      ?disabled=${this.readonly}
      @click=${()=>{this.patch({weekdays:r?e.weekdays.filter((s)=>s!==t):[...e.weekdays,t]})}}
    >
      ${n.weekday(t,"short")}
    </button>`}renderBehaviour(e,t,n){return d`<section>
      <h3>${n.t("section_behaviour")}</h3>
      ${this.select({path:"on_missed",label:n.t("field_on_missed"),value:e.on_missed,choices:[{value:"carry",label:n.t("on_missed_carry")},{value:"skip",label:n.t("on_missed_skip")}],onChange:(r)=>{this.patch({on_missed:r})}})}
      <div class="pair">
        ${this.input({path:"clean_for",label:n.t("field_clean_for"),value:e.clean_for,inputmode:"numeric",hint:n.t("hint_clean_for"),errors:t,i18n:n,onInput:(r)=>{this.patch({clean_for:r})}})}
        ${this.input({path:"grace",label:n.t("field_grace"),value:e.grace,inputmode:"numeric",hint:n.t("hint_grace"),errors:t,i18n:n,onInput:(r)=>{this.patch({grace:r})}})}
      </div>
    </section>`}renderSuggestions(e,t,n){let r=xr(this.hass.states,e.entity,e.condition);if(r.length===0)return d`<div class="suggestions">
        <div class="no-match">${n.t("entity_no_matches")}</div>
      </div>`;return d`<div
      class="suggestions"
      @mousedown=${(s)=>{s.preventDefault()}}
    >
      ${r.map((s)=>d`<button
            type="button"
            class="suggestion"
            data-entity=${s.entity_id}
            @click=${()=>{this.patchStage(t,{entity:s.entity_id}),this.picker=null}}
          >
            <b>${s.name}</b><small>${s.entity_id}</small><em>${s.state}</em>
          </button>`)}
    </div>`}renderLive(e,t,n){let r=wr(e,t);if(!e.entity.trim())return p;let i={met:["trigger_met","met"],unmet:["trigger_unmet","unmet"],unavailable:["entity_unavailable","warn"],missing:["entity_not_found","warn"]}[r];return d`<div class="live" data-part="live" role="status">
      ${t?d`<span class="live-value"
              >${n.t("field_current_value",{value:Sr(t)})}</span
            >`:p}
      ${i?d`<span class=${i[1]} data-match=${r}>${n.t(i[0])}</span>`:p}
    </div>`}renderTrigger(e,t,n,r){let s=`stages.${t}`,i=kr(this.hass.states,e.entity.trim()),a=[{value:"above",label:r.t("condition_above")},{value:"below",label:r.t("condition_below")},{value:"state",label:r.t("condition_state")}];return d`<div class="rule">
      <label class="check">
        <input
          type="checkbox"
          data-field="${s}.auto"
          .checked=${e.condition!=="none"}
          ?disabled=${this.readonly}
          @change=${(l)=>{this.patchStage(t,{condition:cs(l)?"above":"none"})}}
        />
        ${r.t("field_trigger")}
      </label>
      ${e.condition==="none"?p:d`<div class="picker">
                <label class="ht-label">
                  ${r.t("field_entity")}
                  <input
                    class="ht-input"
                    data-field="${s}.entity"
                    autocomplete="off"
                    spellcheck="false"
                    placeholder=${r.t("entity_placeholder")}
                    aria-invalid=${n[`${s}.entity`]?"true":"false"}
                    .value=${e.entity}
                    ?disabled=${this.readonly}
                    @focus=${()=>{this.picker=t}}
                    @blur=${()=>{if(this.picker===t)this.picker=null}}
                    @input=${(l)=>{this.patchStage(t,{entity:Ne(l)})}}
                  />
                </label>
                ${this.picker===t?this.renderSuggestions(e,t,r):p}
                ${this.message(n[`${s}.entity`],r)}
              </div>
              <div class="pair">
                ${this.select({path:`${s}.condition`,label:r.t("field_condition"),value:e.condition,choices:a,onChange:(l)=>{this.patchStage(t,{condition:l})}})}
                ${this.input({path:`${s}.value`,label:r.t("field_value"),value:e.value,...e.condition==="state"?{}:{inputmode:"decimal"},errors:n,i18n:r,onInput:(l)=>{this.patchStage(t,{value:l})}})}
                ${this.input({path:`${s}.hold`,label:r.t("field_for_seconds"),value:e.hold,inputmode:"numeric",errors:n,i18n:r,onInput:(l)=>{this.patchStage(t,{hold:l})}})}
              </div>
              ${this.renderLive(e,i,r)}`}
      <p class="sentence" data-part="sentence">${Er(e,i,r)}</p>
    </div>`}renderStage(e,t,n,r,s){let i=`stages.${n}`,a=[{value:"todo",label:s.t("role_todo")},{value:"running",label:s.t("role_running")},{value:"waiting",label:s.t("role_waiting")}];return d`<div class="stage" data-stage=${n}>
      <div class="stage-head">
        <strong>${s.t("field_stage_n",{n:n+1})}</strong>
        ${this.readonly?p:d`<button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_up")}
                  ?disabled=${n===0}
                  @click=${()=>{this.form=Jt(e,n,-1)}}
                >
                  ${R("up")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  aria-label=${s.t("action_move_down")}
                  ?disabled=${n===e.stages.length-1}
                  @click=${()=>{this.form=Jt(e,n,1)}}
                >
                  ${R("down")}
                </button>
                <button
                  type="button"
                  class="ht-btn icon-btn"
                  data-action="remove-stage"
                  aria-label=${s.t("action_remove")}
                  ?disabled=${e.stages.length===1}
                  @click=${()=>{this.form=br(e,n)}}
                >
                  ${R("trash")}
                </button>`}
      </div>
      <div class="pair">
        ${this.input({path:`${i}.title`,label:s.t("field_stage_title"),value:t.title,errors:r,i18n:s,onInput:(l)=>{this.patchStage(n,{title:l})}})}
        ${this.input({path:`${i}.action`,label:s.t("field_action"),value:t.action,errors:r,i18n:s,onInput:(l)=>{this.patchStage(n,{action:l})}})}
      </div>
      <div class="pair">
        ${this.select({path:`${i}.role`,label:s.t("field_role"),value:t.role,choices:a,onChange:(l)=>{this.patchStage(n,{role:l})}})}
        ${this.input({path:`${i}.stale`,label:s.t("field_stale_after"),value:t.stale,inputmode:"numeric",hint:s.t("hint_stale_after"),errors:r,i18n:s,onInput:(l)=>{this.patchStage(n,{stale:l})}})}
      </div>
      ${this.renderTrigger(t,n,r,s)}
    </div>`}renderFooter(e,t,n){if(this.readonly)return d`<footer>
        <span class="spacer"></span>
        <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
          ${n.t("action_close")}
        </button>
      </footer>`;if(this.confirming)return d`<footer>
        <span class="message">${n.t("confirm_delete",{title:e.title})}</span>
        <button
          type="button"
          class="ht-btn"
          @click=${()=>{this.confirming=!1}}
        >
          ${n.t("action_cancel")}
        </button>
        <button
          type="button"
          class="ht-btn ht-btn-danger"
          data-action="confirm-delete"
          ?disabled=${this.saving}
          @click=${()=>{this.removeTask()}}
        >
          ${n.t("action_delete")}
        </button>
      </footer>`;let s=(this.failure===null?null:n.t("error_generic",{message:this.failure}))??(Object.keys(t).length>0?n.t("error_form"):null);return d`<footer>
      ${e.id===null?p:d`<button
              type="button"
              class="ht-btn ht-btn-danger"
              data-action="delete"
              @click=${()=>{this.confirming=!0}}
            >
              ${n.t("action_delete")}
            </button>`}
      ${s===null?d`<span class="spacer"></span>`:d`<span class="message" role="alert">${s}</span>`}
      <button type="button" class="ht-btn" data-action="cancel" @click=${this.close}>
        ${n.t("action_cancel")}
      </button>
      <button
        type="button"
        class="ht-btn ht-btn-primary"
        data-action="save"
        ?disabled=${this.saving}
        @click=${()=>{this.save()}}
      >
        ${n.t("action_save")}
      </button>
    </footer>`}render(){let e=this.form;if(!e)return p;let t=z(this.hass),n=this.errors(e);return d`<div class="form">
      <div class="columns">
        <div class="stack">${this.renderDetails(e,n,t)}</div>
        <div class="stack">
          ${this.renderSchedule(e,n,t)} ${this.renderBehaviour(e,n,t)}
        </div>
      </div>
      <section>
        <h3>${t.t("field_stages")}</h3>
        ${B(e.stages,(r)=>r.id,(r,s)=>this.renderStage(e,r,s,n,t))}
        ${this.readonly?p:d`<button
                type="button"
                class="ht-btn"
                data-action="add-stage"
                @click=${()=>{this.form=_r(e)}}
              >
                ${R("plus")}${t.t("action_add_stage")}
              </button>`}
      </section>
      ${this.renderFooter(e,n,t)}
    </div>`}}var $t=40,Ra=90;function Oa(e){if(!e)return"";return e.views.map((t)=>`${t.task_id}:${t.stage_index}:${t.due_at}:${t.last_completed_at}:${t.can_undo}`).join("|")}function us(e,t){let n=new Map(e.map((r)=>[r.id,r]));for(let r of t)n.set(r.id,r);return[...n.values()].toSorted((r,s)=>Date.parse(s.ts)-Date.parse(r.ts))}class yn extends P{static properties={hass:{attribute:!1,hasChanged:me},state:{attribute:!1},filter:{state:!0},events:{state:!0},stats:{state:!0},loading:{state:!0},more:{state:!0},error:{state:!0},day:{state:!0}};static styles=[K,ye,M`
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
    `];lastFingerprint="";request=0;epoch=0;refreshQueued=!1;paging=!1;scrolled=!1;constructor(){super();this.state=null,this.filter="",this.events=[],this.stats=null,this.loading=!0,this.more=!1,this.error=null,this.day=null}updated(e){let t=Oa(this.state);if(e.has("hass")&&!e.get("hass"))this.lastFingerprint=t,this.load(!0);else if(e.has("filter"))this.lastFingerprint=t,this.load(!0);else if(e.has("state")&&t!==this.lastFingerprint)this.lastFingerprint=t,this.load(!1);if(this.stats&&!this.scrolled){let r=this.renderRoot.querySelector(".scroller");if(r)r.scrollLeft=r.scrollWidth,this.scrolled=!0}}get taskFilter(){return this.filter===""?void 0:this.filter}async load(e){if(e)this.epoch+=1,this.loading=!0,this.refreshQueued=!1;else if(this.loading){this.refreshQueued=!0;return}this.request+=1;let{request:t}=this;this.error=null;try{let[n,r]=await Promise.all([Yt(this.hass,{task_id:this.taskFilter,limit:$t}),sr(this.hass,{task_id:this.taskFilter,days:Ra})]);if(t!==this.request)return;if(this.events=e?n:us(this.events,n),this.stats=r,e)this.more=n.length>=$t}catch(n){if(t===this.request)this.error=de(n)}finally{if(t===this.request){if(this.loading=!1,this.refreshQueued)this.refreshQueued=!1,this.load(!1)}}}async loadMore(){let e=this.events.at(-1)?.ts;if(!e||this.loading||this.paging)return;let{epoch:t}=this;this.paging=!0;try{let n=await Yt(this.hass,{task_id:this.taskFilter,limit:$t,before:e});if(t!==this.epoch)return;this.events=us(this.events,n),this.more=n.length>=$t}catch(n){if(t===this.epoch)this.error=de(n)}finally{this.paging=!1}}renderStats(e,t){let n=t.t("stats_no_data"),r=e?.on_time_rate,s=[["current",e?t.number(e.current_streak):n,t.t("stats_current_streak")],["best",e?t.number(e.best_streak):n,t.t("stats_best_streak")],["on-time",r===null||r===void 0?n:t.percent(r),t.t("stats_on_time")],["completed",e?t.number(e.completed):n,t.t("stats_completed")],["skipped",e?t.number(e.skipped+e.missed):n,`${t.t("stats_skipped")} / ${t.t("stats_missed")}`]];return d`${s.map(([i,a,l])=>d`<div class="stat" data-stat=${i}><b>${a}</b><span>${l}</span></div>`)}`}dayText(e,t){let n=t.shortDate(gr(e.date,se(this.hass)));if(e.completed+e.skipped+e.missed===0)return t.t("history_day_empty",{date:n});return t.t("history_day",{date:n,completed:e.completed,skipped:e.skipped,missed:e.missed})}dayClass(e){let t=e.completed===0&&e.trouble;return`day l${e.level} ${e.trouble?"trouble":""} ${t?"bad":""}`}renderGrid(e,t){let{days:n}=Ar(e?.per_day??[]),r=n.find((s)=>s.date===this.day);return d`<div class="panel grid-panel">
      <h3>${t.t("history_window")}</h3>
      <div class="scroller">
        <div class="grid" data-part="grid">
          ${n.map((s)=>{let i=this.dayText(s,t);return d`<button
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
        ${r?this.dayText(r,t):t.t("history_day_hint")}
      </div>
    </div>`}renderEvent(e,t){let n=t.t(`event_${e.type}`);return d`<div class="event t-${e.type}" data-event=${e.id}>
      <span class="dot"></span>
      <div class="event-text">
        <span class="event-title">${e.task_title}</span>
        <span class="event-sub">
          ${e.stage_title?t.t("history_stage",{event:n,stage:e.stage_title}):n}
          · ${t.t(`source_${e.source}`)}
        </span>
      </div>
      <div class="event-side">
        <span>${t.time(e.ts)}</span>
        ${e.on_time===null?p:d`<span class=${e.on_time?"on-time":"late"}
                >${t.t(e.on_time?"on_time":"late")}</span
              >`}
      </div>
    </div>`}renderTimeline(e){if(this.loading&&this.events.length===0)return d`<div class="panel">
        <div class="note" aria-busy="true">${e.t("loading")}</div>
      </div>`;if(this.events.length===0)return d`<div class="panel">
        ${this.error===null?d`<div class="note" data-part="empty">${e.t("history_empty")}</div>`:p}
      </div>`;let t=new Map;for(let n of this.events){let r=e.date(n.ts);t.set(r,[...t.get(r)??[],n])}return d`<div class="panel" data-part="timeline">
      ${B([...t.entries()],([n])=>n,([n,r])=>d`<div class="group">${n}</div>
            ${B(r,(s)=>s.id,(s)=>this.renderEvent(s,e))}`)}
      ${this.more?d`<button
              class="ht-btn more"
              data-action="more"
              @click=${()=>{this.loadMore()}}
            >
              ${e.t("action_load_more")}
            </button>`:p}
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return p;let n=z(e);return d`<div class="top">
        <label class="ht-label filter">
          ${n.t("field_filter_task")}
          <select
            class="ht-input"
            data-field="filter"
            @change=${(r)=>{let{target:s}=r;if(s instanceof HTMLSelectElement)this.filter=s.value}}
          >
            <option value="" ?selected=${this.filter===""}>${n.t("history_all_tasks")}</option>
            ${(t?.tasks??[]).map((r)=>d`<option value=${r.id} ?selected=${this.filter===r.id}>
                  ${r.title}
                </option>`)}
          </select>
        </label>
        ${this.renderStats(this.stats,n)}
      </div>
      ${this.error===null?p:d`<p class="err" role="alert">
              ${n.t("error_generic",{message:this.error})}
            </p>`}
      <div class="columns">${this.renderGrid(this.stats,n)} ${this.renderTimeline(n)}</div>`}}var ps=["today","tasks","history"];function Ha(e){let t=(e??"").replace(/^\//,"").split("/")[0];return ps.find((n)=>n===t)??"today"}class _n extends P{static properties={hass:{attribute:!1},narrow:{type:Boolean},route:{attribute:!1},panel:{attribute:!1},tab:{state:!0}};static styles=[K,ye,ie,M`
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
    `];live;tasksMounted=!1;todayMounted=!1;constructor(){super();this.narrow=!1,this.tab="today",this.live=new Ge(this,()=>this.hass)}willUpdate(e){if(e.has("hass"))this.live.sync();if(e.has("route"))this.tab=Ha(this.route?.path)}select(e){this.tab=e;let t=this.route?.prefix??"/housetide";history.replaceState(history.state,"",`${t}/${e}`)}toggleMenu=()=>{this.dispatchEvent(new CustomEvent("hass-toggle-menu",{bubbles:!0,composed:!0}))};renderToday(e){if(this.tab==="today")this.todayMounted=!0;if(!this.todayMounted)return p;let{state:t,now:n}=this.live;return d`<housetide-today
      .hass=${e}
      .state=${t}
      .now=${n}
      .animations=${!ht()}
      .active=${this.tab==="today"}
      ?hidden=${this.tab!=="today"}
    ></housetide-today>`}renderHistory(e){if(this.tab!=="history")return p;return d`<housetide-history .hass=${e} .state=${this.live.state}></housetide-history>`}renderTasks(e){if(this.tab==="tasks")this.tasksMounted=!0;if(!this.tasksMounted)return p;let{state:t,now:n}=this.live;return d`<housetide-tasks
      .hass=${e}
      .state=${t}
      .now=${n}
      ?hidden=${this.tab!=="tasks"}
    ></housetide-tasks>`}render(){let{hass:e}=this;if(!e)return p;let t=z(e),n=this.narrow||e.dockedSidebar==="always_hidden",r=this.live.failed&&!this.live.state;return d`<header>
        ${n?d`<button
                class="ht-btn menu"
                aria-label=${t.t("action_menu")}
                data-action="menu"
                @click=${this.toggleMenu}
              >
                ${R("menu")}
              </button>`:p}
        <h1>${t.t("app_title")}</h1>
        <div class="tabs" role="tablist">
          ${ps.map((s)=>d`<button
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
        ${r?d`<div class="message" role="alert" data-part="error">
                <strong>${t.t("card_error")}</strong>
                <p>${t.t("card_error_hint")}</p>
                <button
                  class="ht-btn"
                  data-action="retry"
                  @click=${()=>{this.live.retry()}}
                >
                  ${t.t("action_retry")}
                </button>
              </div>`:d`${this.renderToday(e)} ${this.renderHistory(e)} ${this.renderTasks(e)}`}
      </main>
      ${Te(e)?d`<div class="offline" role="status" data-part="offline">
              ${R("alert")}${t.t("disconnected")}
            </div>`:p}`}}var Va=["laundry","pills","plant","one_off"],hs=36500;class bn extends P{static properties={hass:{attribute:!1},state:{attribute:!1},now:{attribute:!1},editing:{state:!0},templates:{state:!0},templateError:{state:!0},retention:{state:!0},settingsError:{state:!0},settingsBusy:{state:!0}};static styles=[K,ye,ie,_e,M`
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
      }

      .list {
        overflow: hidden;
        border-radius: var(--ht-radius);
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
    `];opening=0;constructor(){super();this.state=null,this.now=new Date,this.editing=null,this.templates=null,this.templateError=!1,this.retention=null,this.settingsError=null,this.settingsBusy=!1}shouldUpdate(e){if(e.size!==1||!e.has("hass")||this.editing)return!0;let t=e.get("hass");return!pt(t)||me(this.hass,t)}updated(e){if(e.has("hass")&&!this.templates&&!this.templateError&&this.isAdmin)this.loadTemplates()}get isAdmin(){return this.hass.user?.is_admin===!0}async loadTemplates(){this.templateError=!1;try{this.templates=await Gt(this.hass)}catch{this.templateError=!0}}async openTemplate(e,t,n){this.opening+=1;let{opening:r}=this,s=await Gt(this.hass).catch(()=>null);if(s)this.templates=s;if(r!==this.opening||this.editing)return;this.start(e,s?.[e]??t,n)}start(e,t,n){let r=Mr(e,t,n);this.editing={source:r,title:n.t("action_new_task")}}open(e){this.editing={source:e,title:e.title}}async saveSettings(e){this.settingsBusy=!0,this.settingsError=null;try{await lr(this.hass,{history_retention_days:e}),this.retention=null}catch(t){this.settingsError=de(t)}finally{this.settingsBusy=!1}}renderTemplates(e){if(!this.isAdmin)return p;let t=this.templates,n=t?Va.filter((r)=>Object.hasOwn(t,r)):[];return d`<section>
      <h2>${e.t("action_new_task")} · ${e.t("template_prompt")}</h2>
      ${this.templateError?d`<p class="err" role="alert">${e.t("error_templates")}</p>
              <button
                class="ht-btn"
                data-action="retry-templates"
                @click=${()=>{this.loadTemplates()}}
              >
                ${e.t("action_retry")}
              </button>`:p}
      <div class="templates">
        ${n.map((r)=>{let s=t?.[r];if(!s)return p;return d`<button
            class="template"
            data-template=${r}
            @click=${()=>{this.openTemplate(r,s,e)}}
          >
            <span class="thumb">
              ${q({name:s.scene,state:"accumulating",fill:0.7,stink:0,progress:0},{animations:!1})}
            </span>
            <span>${nn(r,e)??s.title}</span>
          </button>`})}
      </div>
    </section>`}renderRow(e,t,n){let r=t?.status??"disabled";return d`<button
      class="task"
      data-task=${e.id}
      @click=${()=>{this.open(e)}}
    >
      <span class="thumb">
        ${q(t?.scene??{name:e.scene,state:"resting",fill:0,stink:0,progress:0},{animations:!1})}
      </span>
      <span class="text">
        <span class="title">${e.title}</span>
        <span class="sub">${n.scheduleText(e.schedule)}</span>
      </span>
      <span class="chip is-${r}">${n.t(`status_${r}`)}</span>
      ${R("chevron")}
    </button>`}renderList(e,t){let n=new Map(e.views.map((r)=>[r.task_id,r]));return d`<section>
      <h2>${t.t("tab_tasks")}</h2>
      ${e.tasks.length===0?d`<div class="empty" data-part="empty">${t.t("tasks_empty")}</div>`:d`<div class="list">
              ${B(e.tasks,(r)=>r.id,(r)=>this.renderRow(r,n.get(r.id),t))}
            </div>`}
    </section>`}renderSettings(e,t){let n=this.retention??String(e.settings.history_retention_days),r=/^\d+$/.test(n.trim())?Number(n.trim()):Number.NaN,s=r>hs,i=!Number.isInteger(r)||r<1||s,a=this.retention!==null&&r!==e.settings.history_retention_days;return d`<section>
      <h2>${t.t("settings_title")}</h2>
      <div class="settings">
        <label class="ht-label">
          ${t.t("field_retention")}
          <input
            class="ht-input"
            data-field="retention"
            inputmode="numeric"
            .value=${n}
            ?disabled=${!this.isAdmin}
            aria-invalid=${i?"true":"false"}
            @input=${(l)=>{let{target:u}=l;if(u instanceof HTMLInputElement)this.retention=u.value}}
          />
          ${i?d`<span class="err" role="alert"
                  >${s?t.t("error_max",{max:hs}):t.t("error_min",{min:1})}</span
                >`:p}
        </label>
        ${this.isAdmin?d`<button
                class="ht-btn ht-btn-primary"
                data-action="save-settings"
                ?disabled=${i||!a||this.settingsBusy}
                @click=${()=>{this.saveSettings(r)}}
              >
                ${t.t("action_save")}
              </button>`:p}
        ${this.settingsError===null?p:d`<span class="err" role="alert"
                >${t.t("error_generic",{message:this.settingsError})}</span
              >`}
      </div>
    </section>`}render(){let{hass:e,state:t}=this,n=z(e);if(this.editing)return d`<h2 class="editor-title">${this.editing.title}</h2>
        <housetide-editor
          .hass=${e}
          .source=${this.editing.source}
          .now=${this.now}
          ?readonly=${!this.isAdmin}
          @ht-close=${()=>{this.editing=null}}
        ></housetide-editor>`;if(!t)return d`<p class="note" aria-busy="true">${n.t("loading")}</p>`;return d`${this.isAdmin?p:d`<p class="note" data-part="read-only">${n.t("tasks_read_only")}</p>`}
    ${this.renderTemplates(n)} ${this.renderList(t,n)}
    ${this.renderSettings(t,n)}`}}var Na=8;class vn extends P{static properties={hass:{attribute:!1,hasChanged:me},state:{attribute:!1},now:{attribute:!1},animations:{attribute:!1},active:{attribute:!1}};static styles=[K,ie,_e,kt,M`
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
        grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
        gap: 12px;
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
        background: var(--ht-surface);
      }

      .later-item .thumb {
        width: 48px;
        height: 48px;
      }

      .later-item .due {
        font-size: 0.8125rem;
      }
    `];tracker;constructor(){super();this.state=null,this.now=new Date,this.animations=!0,this.active=!0,this.tracker=new Qe(this,()=>this.hass)}shouldUpdate(){return this.active}later(e,t){let n=new Set(t.map((r)=>r.task_id));return e.filter((r)=>!n.has(r.task_id)&&r.status==="upcoming").toSorted((r,s)=>mt(Re(r),Re(s))).slice(0,Na)}renderLater(e,t){if(e.length===0)return p;return d`<h3>${t.i18n.t("today_later")}</h3>
      <div class="later">
        ${B(e,(n)=>n.task_id,(n)=>d`<div class="later-item" data-later=${n.task_id}>
              <div class="thumb">
                ${q(n.scene,{animations:!1,day:t.day})}
              </div>
              <div class="text">
                <div class="title">${n.title}</div>
                <div class="due">${t.i18n.dueText(n,t.now)}</div>
              </div>
            </div>`)}
      </div>`}renderClear(e){return d`<div class="clear" data-part="clear">
      <div class="art">
        ${q({name:"generic",state:"clean",fill:0,stink:0,progress:1},{animations:e.animations})}
      </div>
      <h2>${e.i18n.t("today_clear_title")}</h2>
      <p>${e.i18n.t("card_empty")}</p>
    </div>`}render(){let{hass:e,state:t}=this;if(!e)return p;if(!t)return d`<div class="tiles" aria-busy="true">${vt(4,"tile")}</div>`;let n=z(e),r={i18n:n,tracker:this.tracker,now:this.now,animations:this.animations,day:Ye(this.now,se(e)),offline:Te(e)},s=_t(t.views,{show:"today",tracker:this.tracker}),i=s.filter((a)=>Ve(a)).length;return d`<div class="summary">
        <span class="count">${i>0?n.plural("tasks_due",i):p}</span>
        <span class="date">${n.date(this.now)}</span>
      </div>
      ${s.length===0?this.renderClear(r):d`<div class="tiles">
              ${B(s,(a)=>a.task_id,(a)=>bt(a,r,{skip:!0}))}
            </div>`}
      ${this.renderLater(this.later(t.views,s),r)}`}}var La={"housetide-card":mn,"housetide-panel":_n,"housetide-today":vn,"housetide-tasks":bn,"housetide-editor":gn,"housetide-history":yn};for(let[e,t]of Object.entries(La))if(!customElements.get(e))customElements.define(e,t);window.customCards??=[];if(!window.customCards.some((e)=>e.type==="housetide-card"))window.customCards.push({type:"housetide-card",name:"Housetide",description:"Recurring household tasks with delightful little scenes.",preview:!0});
