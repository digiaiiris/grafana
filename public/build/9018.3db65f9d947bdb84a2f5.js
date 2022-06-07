(self.webpackChunkgrafana=self.webpackChunkgrafana||[]).push([[9018],{"./packages/jaeger-ui-components/src/index.ts":(e,t,n)=>{"use strict";n.d(t,{kt:()=>js,T2:()=>_s,Ox:()=>sr,y3:()=>Je,Mp:()=>Ze,DE:()=>rt,J5:()=>Xe,YB:()=>Ye,h2:()=>ee,rZ:()=>ea,R1:()=>Qs});var r=n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js"),s=n("./.yarn/cache/@emotion-cache-npm-11.7.1-82b45442ee-cf7aa8fe3b.zip/node_modules/@emotion/cache/dist/emotion-cache.browser.esm.js"),a=n("./.yarn/cache/@emotion-serialize-npm-1.0.2-a692afdb82-ff84fbe09e.zip/node_modules/@emotion/serialize/dist/emotion-serialize.browser.esm.js"),i=n("./.yarn/cache/@emotion-utils-npm-1.0.0-7f9809289c-3ce8048441.zip/node_modules/@emotion/utils/dist/emotion-utils.browser.esm.js");function o(e,t){if(void 0===e.inserted[t.name])return e.insert("",t,e.sheet,!0)}function l(e,t,n){var r=[],s=(0,i.f)(e,r,n);return r.length<2?n:s+t(r)}var c=function e(t){for(var n="",r=0;r<t.length;r++){var s=t[r];if(null!=s){var a=void 0;switch(typeof s){case"boolean":break;case"object":if(Array.isArray(s))a=e(s);else for(var i in a="",s)s[i]&&i&&(a&&(a+=" "),a+=i);break;default:a=s}a&&(n&&(n+=" "),n+=a)}}return n};const d=function(e){var t=(0,s.Z)(e);t.sheet.speedy=function(e){this.isSpeedy=e},t.compat=!0;var n=function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var s=(0,a.O)(n,t.registered,void 0);return(0,i.M)(t,s,!1),t.key+"-"+s.name};return{css:n,cx:function(){for(var e=arguments.length,r=new Array(e),s=0;s<e;s++)r[s]=arguments[s];return l(t.registered,n,c(r))},injectGlobal:function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var s=(0,a.O)(n,t.registered);o(t,s)},keyframes:function(){for(var e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];var s=(0,a.O)(n,t.registered),i="animation-"+s.name;return o(t,{name:s.name,styles:"@keyframes "+i+"{"+s.styles+"}"}),i},hydrate:function(e){e.forEach((function(e){t.inserted[e]=!0}))},flush:function(){t.registered={},t.inserted={},t.sheet.flush()},sheet:t.sheet,cache:t,getRegisteredStyles:i.f.bind(null,t.registered),merge:l.bind(null,t.registered,n)}};var p=d({key:"css"}),u=(p.flush,p.hydrate,p.cx),h=(p.merge,p.getRegisteredStyles,p.injectGlobal,p.keyframes),m=p.css,g=(p.sheet,p.cache,n("./packages/grafana-ui/src/index.ts")),f=n("./.yarn/cache/classnames-npm-2.3.1-f2ae0a8d3c-14db8889d5.zip/node_modules/classnames/index.js"),b=n.n(f),y=n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/jsx-runtime.js");const v=()=>({TimelineCollapser:m`
      align-items: center;
      display: flex;
      flex: none;
      justify-content: center;
      margin-right: 0.5rem;
    `});function x(e){const{onExpandAll:t,onExpandOne:n,onCollapseAll:r,onCollapseOne:s}=e,a=(0,g.useStyles2)(v);return(0,y.jsxs)("div",{className:a.TimelineCollapser,"data-test-id":"TimelineCollapser",children:[(0,y.jsx)(g.IconButton,{tooltip:"Expand +1",size:"xl",tooltipPlacement:"top",name:"angle-down",onClick:n}),(0,y.jsx)(g.IconButton,{tooltip:"Collapse +1",size:"xl",tooltipPlacement:"top",name:"angle-right",onClick:s}),(0,y.jsx)(g.IconButton,{tooltip:"Expand All",size:"xl",tooltipPlacement:"top",name:"angle-double-down",onClick:t}),(0,y.jsx)(g.IconButton,{tooltip:"Collapse All",size:"xl",tooltipPlacement:"top",name:"angle-double-right",onClick:r})]})}var w;!function(e){e.DragEnd="DragEnd",e.DragMove="DragMove",e.DragStart="DragStart",e.MouseEnter="MouseEnter",e.MouseLeave="MouseLeave",e.MouseMove="MouseMove"}(w||(w={}));const _=w;var k=n("./.yarn/cache/lodash-npm-4.17.21-6382451519-eb835a2e51.zip/node_modules/lodash/lodash.js");const j=["getBounds","tag","resetBoundsOnResize"];function T(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class I{constructor(e){let{getBounds:t,tag:n,resetBoundsOnResize:r=!0}=e,s=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,j);T(this,"_bounds",void 0),T(this,"_isDragging",void 0),T(this,"_onMouseEnter",void 0),T(this,"_onMouseLeave",void 0),T(this,"_onMouseMove",void 0),T(this,"_onDragStart",void 0),T(this,"_onDragMove",void 0),T(this,"_onDragEnd",void 0),T(this,"_resetBoundsOnResize",void 0),T(this,"getBounds",void 0),T(this,"tag",void 0),T(this,"handleMouseEnter",void 0),T(this,"handleMouseMove",void 0),T(this,"handleMouseLeave",void 0),T(this,"handleMouseDown",void 0),T(this,"resetBounds",(()=>{this._bounds=void 0})),T(this,"_handleMinorMouseEvent",(e=>{const{button:t,clientX:n,type:r}=e;if(this._isDragging||0!==t)return;let s,a=null;if("mouseenter"===r)a=_.MouseEnter,s=this._onMouseEnter;else if("mouseleave"===r)a=_.MouseLeave,s=this._onMouseLeave;else{if("mousemove"!==r)throw new Error(`invalid event type: ${r}`);a=_.MouseMove,s=this._onMouseMove}if(!s)return;const{value:i,x:o}=this._getPosition(n);s({event:e,type:a,value:i,x:o,manager:this,tag:this.tag})})),T(this,"_handleDragEvent",(e=>{const{button:t,clientX:n,type:r}=e;let s,a=null;if("mousedown"===r){if(this._isDragging||0!==t)return;window.addEventListener("mousemove",this._handleDragEvent),window.addEventListener("mouseup",this._handleDragEvent);const e=(0,k.get)(document,"body.style");e&&(e.userSelect="none"),this._isDragging=!0,a=_.DragStart,s=this._onDragStart}else if("mousemove"===r){if(!this._isDragging)return;a=_.DragMove,s=this._onDragMove}else{if("mouseup"!==r)throw new Error(`invalid event type: ${r}`);if(!this._isDragging)return;this._stopDragging(),a=_.DragEnd,s=this._onDragEnd}if(!s)return;const{value:i,x:o}=this._getPosition(n);s({event:e,type:a,value:i,x:o,manager:this,tag:this.tag})})),this.handleMouseDown=this._handleDragEvent,this.handleMouseEnter=this._handleMinorMouseEvent,this.handleMouseMove=this._handleMinorMouseEvent,this.handleMouseLeave=this._handleMinorMouseEvent,this.getBounds=t,this.tag=n,this._isDragging=!1,this._bounds=void 0,this._resetBoundsOnResize=Boolean(r),this._resetBoundsOnResize&&window.addEventListener("resize",this.resetBounds),this._onMouseEnter=s.onMouseEnter,this._onMouseLeave=s.onMouseLeave,this._onMouseMove=s.onMouseMove,this._onDragStart=s.onDragStart,this._onDragMove=s.onDragMove,this._onDragEnd=s.onDragEnd}_getBounds(){return this._bounds||(this._bounds=this.getBounds(this.tag)),this._bounds}_getPosition(e){const{clientXLeft:t,maxValue:n,minValue:r,width:s}=this._getBounds();let a=e-t,i=a/s;return null!=r&&i<r?(i=r,a=r*s):null!=n&&i>n&&(i=n,a=n*s),{value:i,x:a}}_stopDragging(){window.removeEventListener("mousemove",this._handleDragEvent),window.removeEventListener("mouseup",this._handleDragEvent);const e=(0,k.get)(document,"body.style");e&&(e.userSelect=null),this._isDragging=!1}isDragging(){return this._isDragging}dispose(){this._isDragging&&this._stopDragging(),this._resetBoundsOnResize&&window.removeEventListener("resize",this.resetBounds),this._bounds=void 0,this._onMouseEnter=void 0,this._onMouseLeave=void 0,this._onMouseMove=void 0,this._onDragStart=void 0,this._onDragMove=void 0,this._onDragEnd=void 0}}function S(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const D=(0,g.stylesFactory)((()=>({TimelineColumnResizer:m`
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    `,wrapper:m`
      bottom: 0;
      position: absolute;
      top: 0;
    `,dragger:m`
      border-left: 2px solid transparent;
      cursor: col-resize;
      height: 5000px;
      margin-left: -1px;
      position: absolute;
      top: 0;
      width: 1px;
      z-index: 10;
      &:hover {
        border-left: 2px solid rgba(0, 0, 0, 0.3);
      }
      &::before {
        position: absolute;
        top: 0;
        bottom: 0;
        left: -8px;
        right: 0;
        content: ' ';
      }
    `,draggerDragging:m`
      background: rgba(136, 0, 136, 0.05);
      width: unset;
      &::before {
        left: -2000px;
        right: -2000px;
      }
    `,draggerDraggingLeft:m`
      border-left: 2px solid #808;
      border-right: 1px solid #999;
    `,draggerDraggingRight:m`
      border-left: 1px solid #999;
      border-right: 2px solid #808;
    `,gripIcon:m`
      position: absolute;
      top: 0;
      bottom: 0;
      &::before,
      &::after {
        border-right: 1px solid #ccc;
        content: ' ';
        height: 9px;
        position: absolute;
        right: 9px;
        top: 25px;
      }
      &::after {
        right: 5px;
      }
    `,gripIconDragging:m`
      &::before,
      &::after {
        border-right: 1px solid rgba(136, 0, 136, 0.5);
      }
    `})));class C extends r.PureComponent{constructor(e){super(e),S(this,"state",void 0),S(this,"_dragManager",void 0),S(this,"_rootElm",void 0),S(this,"_setRootElm",(e=>{this._rootElm=e})),S(this,"_getDraggingBounds",(()=>{if(!this._rootElm)throw new Error("invalid state");const{left:e,width:t}=this._rootElm.getBoundingClientRect(),{min:n,max:r}=this.props;return{clientXLeft:e,width:t,maxValue:r,minValue:n}})),S(this,"_handleDragUpdate",(e=>{let{value:t}=e;this.setState({dragPosition:t})})),S(this,"_handleDragEnd",(e=>{let{manager:t,value:n}=e;t.resetBounds(),this.setState({dragPosition:null}),this.props.onChange(n)})),this._dragManager=new I({getBounds:this._getDraggingBounds,onDragEnd:this._handleDragEnd,onDragMove:this._handleDragUpdate,onDragStart:this._handleDragUpdate}),this._rootElm=void 0,this.state={dragPosition:null}}componentWillUnmount(){this._dragManager.dispose()}render(){let e,t;const{position:n,columnResizeHandleHeight:r}=this.props,{dragPosition:s}=this.state;e=100*n+"%";const a={left:e};let i=!1,o=!1;const l=D();if(this._dragManager.isDragging()&&this._rootElm&&null!=s){i=s<n,o=s>n,e=100*s+"%";t={left:100*Math.min(n,s)+"%",right:`calc(${100*(1-Math.max(n,s))}% - 1px)`}}else t=a;t.height=r;const c=i||o;return(0,y.jsxs)("div",{className:l.TimelineColumnResizer,ref:this._setRootElm,"data-test-id":"TimelineColumnResizer",children:[(0,y.jsx)("div",{className:b()(l.gripIcon,c&&l.gripIconDragging),style:a,"data-test-id":"TimelineColumnResizer--gripIcon"}),(0,y.jsx)("div",{"aria-hidden":!0,className:b()(l.dragger,c&&l.draggerDragging,o&&l.draggerDraggingRight,i&&l.draggerDraggingLeft),onMouseDown:this._dragManager.handleMouseDown,style:t,"data-test-id":"TimelineColumnResizer--dragger"})]})}}function N(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const L=(0,g.stylesFactory)((()=>({TimelineViewingLayer:m`
      label: TimelineViewingLayer;
      bottom: 0;
      cursor: vertical-text;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
    `,TimelineViewingLayerCursorGuide:m`
      label: TimelineViewingLayerCursorGuide;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 1px;
      background-color: red;
    `,TimelineViewingLayerDragged:m`
      label: TimelineViewingLayerDragged;
      position: absolute;
      top: 0;
      bottom: 0;
    `,TimelineViewingLayerDraggedDraggingLeft:m`
      label: TimelineViewingLayerDraggedDraggingLeft;
      border-left: 1px solid;
    `,TimelineViewingLayerDraggedDraggingRight:m`
      label: TimelineViewingLayerDraggedDraggingRight;
      border-right: 1px solid;
    `,TimelineViewingLayerDraggedShiftDrag:m`
      label: TimelineViewingLayerDraggedShiftDrag;
      background-color: rgba(68, 68, 255, 0.2);
      border-color: #44f;
    `,TimelineViewingLayerDraggedReframeDrag:m`
      label: TimelineViewingLayerDraggedReframeDrag;
      background-color: rgba(255, 68, 68, 0.2);
      border-color: #f44;
    `,TimelineViewingLayerFullOverlay:m`
      label: TimelineViewingLayerFullOverlay;
      bottom: 0;
      cursor: col-resize;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      user-select: none;
    `})));function E(e,t,n){return e+n*(t-e)}function O(e,t,n){return(n-e)/(t-e)}function M(e,t,n,r,s){const a=function(e,t){let[n,r]=e<t?[e,t]:[t,e];return n>=1||r<=0?{isOutOfView:!0}:(n<0&&(n=0),r>1&&(r=1),{isDraggingLeft:e>t,left:100*n+"%",width:100*(r-n)+"%"})}(O(e,t,n),O(e,t,r));if(function(e){return Reflect.has(e,"isOutOfView")}(a))return null;const{isDraggingLeft:i,left:o,width:l}=a,c=L(),d=u({[c.TimelineViewingLayerDraggedDraggingRight]:!i,[c.TimelineViewingLayerDraggedReframeDrag]:!s,[c.TimelineViewingLayerDraggedShiftDrag]:s});return(0,y.jsx)("div",{className:u(c.TimelineViewingLayerDragged,c.TimelineViewingLayerDraggedDraggingLeft,d),style:{left:o,width:l},"data-test-id":"Dragged"})}class R extends r.PureComponent{constructor(e){super(e),N(this,"_draggerReframe",void 0),N(this,"_root",void 0),N(this,"_setRoot",(e=>{this._root=e})),N(this,"_getDraggingBounds",(()=>{if(!this._root)throw new Error("invalid state");const{left:e,width:t}=this._root.getBoundingClientRect();return{clientXLeft:e,width:t}})),N(this,"_handleReframeMouseMove",(e=>{let{value:t}=e;const[n,r]=this.props.viewRangeTime.current,s=E(n,r,t);this.props.updateNextViewRangeTime({cursor:s})})),N(this,"_handleReframeMouseLeave",(()=>{this.props.updateNextViewRangeTime({cursor:void 0})})),N(this,"_handleReframeDragUpdate",(e=>{let{value:t}=e;const{current:n,reframe:r}=this.props.viewRangeTime,[s,a]=n,i=E(s,a,t),o={reframe:{anchor:r?r.anchor:i,shift:i}};this.props.updateNextViewRangeTime(o)})),N(this,"_handleReframeDragEnd",(e=>{let{manager:t,value:n}=e;const{current:r,reframe:s}=this.props.viewRangeTime,[a,i]=r,o=E(a,i,n),l=s?s.anchor:o,[c,d]=o<l?[o,l]:[l,o];t.resetBounds(),this.props.updateViewRangeTime(c,d,"timeline-header")})),this._draggerReframe=new I({getBounds:this._getDraggingBounds,onDragEnd:this._handleReframeDragEnd,onDragMove:this._handleReframeDragUpdate,onDragStart:this._handleReframeDragUpdate,onMouseLeave:this._handleReframeMouseLeave,onMouseMove:this._handleReframeMouseMove}),this._root=void 0}UNSAFE_componentWillReceiveProps(e){const{boundsInvalidator:t}=this.props;t!==e.boundsInvalidator&&this._draggerReframe.resetBounds()}componentWillUnmount(){this._draggerReframe.dispose()}render(){const{viewRangeTime:e}=this.props,{current:t,cursor:n,reframe:r,shiftEnd:s,shiftStart:a}=e,[i,o]=t;let l;!(null!=r||null!=s||null!=a)&&null!=n&&n>=i&&n<=o&&(l=100*O(i,o,n)+"%");const c=L();return(0,y.jsxs)("div",{"aria-hidden":!0,className:c.TimelineViewingLayer,ref:this._setRoot,onMouseDown:this._draggerReframe.handleMouseDown,onMouseLeave:this._draggerReframe.handleMouseLeave,onMouseMove:this._draggerReframe.handleMouseMove,"data-test-id":"TimelineViewingLayer",children:[null!=l&&(0,y.jsx)("div",{className:c.TimelineViewingLayerCursorGuide,style:{left:l},"data-test-id":"TimelineViewingLayer--cursorGuide"}),null!=r&&M(i,o,r.anchor,r.shift,!1),null!=s&&M(i,o,o,s,!0),null!=a&&M(i,o,i,a,!0)]})}}var P=n("./.yarn/cache/moment-timezone-npm-0.5.34-e4fe2d01f6-12a1d3d52e.zip/node_modules/moment-timezone/index.js"),z=n.n(P);const $=1e3,H=1e6,V=6e7,F=36e8,B=Math.log10($),A=[{unit:"d",microseconds:864e8,ofPrevious:24},{unit:"h",microseconds:F,ofPrevious:60},{unit:"m",microseconds:V,ofPrevious:60},{unit:"s",microseconds:H,ofPrevious:1e3},{unit:"ms",microseconds:$,ofPrevious:1e3},{unit:"μs",microseconds:1,ofPrevious:1e3}];const G=(e,t,n)=>function(e,t){const n=t+(Math.floor(Math.log10(Math.abs(e)))+1);return n<=0?Math.trunc(e):Number(e.toPrecision(n))}(e/n,t)*n;function W(e){const[t,n]=(0,k.dropWhile)(A,((t,n)=>{let{microseconds:r}=t;return n<A.length-1&&r>e}));if(1e3===t.ofPrevious)return`${(0,k.round)(e/t.microseconds,2)}${t.unit}`;const r=`${Math.floor(e/t.microseconds)}${t.unit}`,s=Math.round(e/n.microseconds%t.ofPrevious),a=`${s}${n.unit}`;return 0===s?r:`${r} ${a}`}function K(e,t,n){return!(!Array.isArray(n.tags)||!n.tags.length)&&n.tags.some((n=>n.key===e&&n.value===t))}const U=K.bind(null,"span.kind","client"),q=K.bind(null,"span.kind","server"),Z=K.bind(null,"error",!0),X=K.bind(null,"error","true"),Y=e=>Z(e)||X(e);var J=n("./.yarn/cache/tinycolor2-npm-1.4.2-462ba30c26-57ed262e08.zip/node_modules/tinycolor2/tinycolor.js"),Q=n.n(J);function ee(e,t,n){if(e.isLight)return t;{if(n){const e=Q()(t);return Q().mostReadable(n,[e.clone().lighten(25),e.clone().lighten(10),e,e.clone().darken(10),e.clone().darken(25)],{includeFallbackColors:!1}).toHex8String()}const e=Q()(t).toHsl();e.l=1-e.l;const r=Q()(e);return r.isLight()?r.darken(5).toHex8String():r.lighten(5).toHex8String()}}const te=e=>({Ticks:m`
      label: Ticks;
      pointer-events: none;
    `,TicksTick:m`
      label: TicksTick;
      position: absolute;
      height: 100%;
      width: 1px;
      background: ${ee(e,"#d8d8d8")};
      &:last-child {
        width: 0;
      }
    `,TicksTickLabel:m`
      label: TicksTickLabel;
      left: 0.25rem;
      position: absolute;
    `,TicksTickLabelEndAnchor:m`
      label: TicksTickLabelEndAnchor;
      left: initial;
      right: 0.25rem;
    `});function ne(e){const{endTime:t,numTicks:n,showLabels:r,startTime:s}=e;let a;if(r){a=[];const e=(t||0)-(s||0);for(let t=0;t<n;t++){const r=(s||0)+t/(n-1)*e;a.push(W(r))}}const i=(0,g.useStyles2)(te),o=[];for(let e=0;e<n;e++){const t=e/(n-1);o.push((0,y.jsx)("div",{className:i.TicksTick,style:{left:100*t+"%"},children:a&&(0,y.jsx)("span",{className:b()(i.TicksTickLabel,{[i.TicksTickLabelEndAnchor]:t>=1}),children:a[e]})},t))}return(0,y.jsx)("div",{className:i.Ticks,children:o})}ne.defaultProps={endTime:null,showLabels:null,startTime:null};const re=m`
  position: relative;
`,se=m`
  margin-bottom: 0.25rem;
`,ae=m`
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
`,ie=m`
  margin: 0;
`,oe=m`
  padding-left: 0.5rem;
  padding-right: 0.5rem;
`,le=m`
  padding-bottom: 0.5rem;
`,ce=m`
  display: flex;
`,de=m`
  align-items: center;
`,pe=m`
  flex: 1 1 auto;
  min-width: 0; /* 1 */
  min-height: 0; /* 1 */
`,ue=m`
  text-align: right;
`,he=m`
  display: inline-block;
`,me=m`
  margin: -0.2rem 0.25rem 0 0;
`,ge=m`
  text-overflow: ellipsis;
`,fe=m`
  width: 100%;
`,be=m`
  color: #aaa;
`,ye=m`
  justify-content: flex-end;
`,ve=["children","className"],xe=["children","className","width","style"];function we(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}const _e=()=>({flexRow:m`
      display: flex;
      flex: 0 1 auto;
      flex-direction: row;
    `});function ke(e){const{children:t,className:n=""}=e,r=we(e,ve),s=(0,g.useStyles2)(_e);return(0,y.jsx)("div",Object.assign({className:b()(s.flexRow,n)},r,{children:t}))}function je(e){const{children:t,className:n="",width:r,style:s}=e,a=we(e,xe),i=100*r+"%",o=Object.assign({},s,{flexBasis:i,maxWidth:i});return(0,y.jsx)("div",Object.assign({className:b()(re,n),style:o},a,{children:t}))}ke.defaultProps={className:""},je.defaultProps={className:"",style:{}},ke.Cell=je;const Te=e=>({TimelineHeaderRow:m`
      label: TimelineHeaderRow;
      background: ${ee(e,"#ececec")};
      border-bottom: 1px solid ${ee(e,"#ccc")};
      height: 38px;
      line-height: 38px;
      width: 100%;
      z-index: 4;
      position: relative;
    `,TimelineHeaderRowTitle:m`
      label: TimelineHeaderRowTitle;
      flex: 1;
      overflow: hidden;
      margin: 0;
      text-overflow: ellipsis;
      white-space: nowrap;
    `,TimelineHeaderWrapper:m`
      label: TimelineHeaderWrapper;
      align-items: center;
    `});function Ie(e){const{duration:t,nameColumnWidth:n,numTicks:r,onCollapseAll:s,onCollapseOne:a,onColummWidthChange:i,onExpandAll:o,onExpandOne:l,updateViewRangeTime:c,updateNextViewRangeTime:d,viewRangeTime:p,columnResizeHandleHeight:u}=e,[h,m]=p.current,f=(0,g.useStyles2)(Te);return(0,y.jsxs)(ke,{className:f.TimelineHeaderRow,"data-test-id":"TimelineHeaderRow",children:[(0,y.jsxs)(ke.Cell,{className:b()(ce,oe,f.TimelineHeaderWrapper),width:n,children:[(0,y.jsx)("h4",{className:f.TimelineHeaderRowTitle,children:"Service & Operation"}),(0,y.jsx)(x,{onCollapseAll:s,onExpandAll:o,onCollapseOne:a,onExpandOne:l})]}),(0,y.jsxs)(ke.Cell,{width:1-n,children:[(0,y.jsx)(R,{boundsInvalidator:n,updateNextViewRangeTime:d,updateViewRangeTime:c,viewRangeTime:p}),(0,y.jsx)(ne,{numTicks:r,startTime:h*t,endTime:m*t,showLabels:!0})]}),(0,y.jsx)(C,{columnResizeHandleHeight:u,position:n,onChange:i,min:.2,max:.85})]})}var Se=n("./.yarn/cache/memoize-one-npm-6.0.0-8b2a2cd020-f185ea69f7.zip/node_modules/memoize-one/dist/memoize-one.esm.js");function De(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class Ce{constructor(e){De(this,"bufferLen",void 0),De(this,"dataLen",void 0),De(this,"heights",void 0),De(this,"lastI",void 0),De(this,"ys",void 0),this.ys=[],this.heights=[],this.bufferLen=e,this.dataLen=-1,this.lastI=-1}profileData(e){e!==this.dataLen&&(this.dataLen=e,this.ys.length=e,this.heights.length=e,this.lastI>=e&&(this.lastI=e-1))}calcHeights(e,t,n){null!=n&&(this.lastI=n);let r=e+this.bufferLen;if(r<=this.lastI)return;r>=this.heights.length&&(r=this.heights.length-1);let s=this.lastI;for(-1===this.lastI&&(s=0,this.ys[0]=0);s<=r;){const e=this.heights[s]=t(s);this.ys[s+1]=this.ys[s]+e,s++}this.lastI=r}calcYs(e,t){for(;(null==this.ys[this.lastI]||e>this.ys[this.lastI])&&this.lastI<this.dataLen-1;)this.calcHeights(this.lastI,t)}confirmHeight(e,t){let n=e;if(n>this.lastI)return void this.calcHeights(n,t);const r=t(n);if(r===this.heights[n])return;const s=r-this.heights[n];for(this.heights[n]=r;++n<=this.lastI;)this.ys[n]+=s;null!=this.ys[this.lastI+1]&&(this.ys[this.lastI+1]+=s)}findFloorIndex(e,t){this.calcYs(e,t);let n,r=0,s=this.lastI;if(this.ys.length<2||e<this.ys[1])return 0;if(e>this.ys[s])return s;for(;r<s;)if(n=r+.5*(s-r)|0,e>this.ys[n]){if(e<=this.ys[n+1])return n;r=n}else{if(!(e<this.ys[n]))return n;if(e>=this.ys[n-1])return n-1;s=n}throw new Error(`unable to find floor index for y=${e}`)}getRowPosition(e,t){return this.confirmHeight(e,t),{height:this.heights[e],y:this.ys[e]}}getEstimatedHeight(){const e=this.ys[this.lastI]+this.heights[this.lastI];return this.lastI>=this.dataLen-1?0|e:e/(this.lastI+1)*this.heights.length|0}}function Ne(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const Le=100;class Ee extends r.Component{constructor(e){super(e),Ne(this,"_yPositions",void 0),Ne(this,"_knownHeights",void 0),Ne(this,"_startIndexDrawn",void 0),Ne(this,"_endIndexDrawn",void 0),Ne(this,"_startIndex",void 0),Ne(this,"_endIndex",void 0),Ne(this,"_viewHeight",void 0),Ne(this,"_scrollTop",void 0),Ne(this,"_isScrolledOrResized",void 0),Ne(this,"_htmlTopOffset",void 0),Ne(this,"_windowScrollListenerAdded",void 0),Ne(this,"_htmlElm",void 0),Ne(this,"_wrapperElm",void 0),Ne(this,"_itemHolderElm",void 0),Ne(this,"getViewHeight",(()=>this._viewHeight)),Ne(this,"getBottomVisibleIndex",(()=>{const e=this._scrollTop+this._viewHeight;return this._yPositions.findFloorIndex(e,this._getHeight)})),Ne(this,"getTopVisibleIndex",(()=>this._yPositions.findFloorIndex(this._scrollTop,this._getHeight))),Ne(this,"getRowPosition",(e=>this._yPositions.getRowPosition(e,this._getHeight))),Ne(this,"scrollToIndex",(e=>{var t,n;const{scrollElement:r}=this.props,s=(null==r?void 0:r.getBoundingClientRect().top)||0,a=((null==r?void 0:r.scrollTop)||0)+((null===(t=this._itemHolderElm)||void 0===t?void 0:t.getBoundingClientRect().top)||0)-s,i=this.getRowPosition(e).y;null===(n=this.props.scrollElement)||void 0===n||n.scrollTo({top:i+a-80})})),Ne(this,"_onScroll",(()=>{this._isScrolledOrResized||(this._isScrolledOrResized=!0,window.requestAnimationFrame(this._positionList))})),Ne(this,"_positionList",(()=>{if(this._isScrolledOrResized=!1,!this._wrapperElm)return;this._calcViewIndexes();const e=this.props.viewBufferMin>this._startIndex?0:this._startIndex-this.props.viewBufferMin,t=this.props.viewBufferMin<this.props.dataLength-this._endIndex?this._endIndex+this.props.viewBufferMin:this.props.dataLength-1;(e<this._startIndexDrawn||t>this._endIndexDrawn)&&this.forceUpdate()})),Ne(this,"_initWrapper",(e=>{this.props.windowScroller&&(this._wrapperElm=e,e&&(this._viewHeight=e.clientHeight))})),Ne(this,"_initItemHolder",(e=>{this._itemHolderElm=e,this._scanItemHeights()})),Ne(this,"_scanItemHeights",(()=>{const e=this.props.getIndexFromKey;if(!this._itemHolderElm)return;let t=null,n=null,r=!1;const s=this._itemHolderElm.childNodes,a=s.length;for(let e=0;e<a;e++){const a=s[e],i=a.getAttribute("data-item-key");if(!i){console.warn("itemKey not found");continue}const o=(a.firstElementChild||a).clientHeight;o!==this._knownHeights.get(i)&&(this._knownHeights.set(i,o),r?n=i:(r=!0,t=n=i))}if(null!=t&&null!=n){const r=e(t),s=n===t?r:e(n);this._yPositions.calcHeights(s,this._getHeight,r),this.forceUpdate()}})),Ne(this,"_getHeight",(e=>{const t=this.props.getKeyFromIndex(e),n=this._knownHeights.get(t);return null!=n&&n==n?n:this.props.itemHeightGetter(e,t)})),this._yPositions=new Ce(200),this._knownHeights=new Map,this._startIndexDrawn=2**20,this._endIndexDrawn=-1048576,this._startIndex=0,this._endIndex=0,this._viewHeight=-1,this._scrollTop=-1,this._isScrolledOrResized=!1,this._htmlTopOffset=-1,this._windowScrollListenerAdded=!1,this._htmlElm=document.documentElement,this._wrapperElm=void 0,this._itemHolderElm=void 0}componentDidMount(){if(this.props.windowScroller){if(this._wrapperElm){const{top:e}=this._wrapperElm.getBoundingClientRect();this._htmlTopOffset=e+this._htmlElm.scrollTop}window.addEventListener("scroll",this._onScroll),this._windowScrollListenerAdded=!0}else{var e;this._wrapperElm=this.props.scrollElement,null===(e=this._wrapperElm)||void 0===e||e.addEventListener("scroll",this._onScroll)}}componentDidUpdate(){this._itemHolderElm&&this._scanItemHeights()}componentWillUnmount(){var e;this._windowScrollListenerAdded?window.removeEventListener("scroll",this._onScroll):null===(e=this._wrapperElm)||void 0===e||e.removeEventListener("scroll",this._onScroll)}_isViewChanged(){if(!this._wrapperElm)return!1;const e=this.props.windowScroller,t=e?this._htmlElm.clientHeight:this._wrapperElm.clientHeight,n=e?this._htmlElm.scrollTop:this._wrapperElm.scrollTop;return t!==this._viewHeight||n!==this._scrollTop}_calcViewIndexes(){if(this.props.windowScroller)this._viewHeight=window.innerHeight-this._htmlTopOffset,this._scrollTop=window.scrollY;else{if(!this._wrapperElm)return this._viewHeight=-1,this._startIndex=0,void(this._endIndex=0);this._viewHeight=this._wrapperElm.clientHeight,this._scrollTop=this._wrapperElm.scrollTop}const e=this._scrollTop,t=this._scrollTop+this._viewHeight;this._startIndex=this._yPositions.findFloorIndex(e,this._getHeight),this._endIndex=this._yPositions.findFloorIndex(t,this._getHeight)}render(){const{dataLength:e,getKeyFromIndex:t,initialDraw:n=Le,itemRenderer:r,viewBuffer:s,viewBufferMin:a}=this.props,i=this._getHeight,o=[];let l,c;if(this._yPositions.profileData(e),this._wrapperElm){this._isViewChanged()&&this._calcViewIndexes();const t=a>this._startIndex?0:this._startIndex-a,n=a<e-this._endIndex?this._endIndex+a:e-1;t<this._startIndexDrawn||n>this._endIndexDrawn?(l=s>this._startIndex?0:this._startIndex-s,c=this._endIndex+s,c>=e&&(c=e-1)):(l=this._startIndexDrawn,c=this._endIndexDrawn>e-1?e-1:this._endIndexDrawn)}else l=0,c=(n<e?n:e)-1;this._yPositions.calcHeights(c,i,l||-1),this._startIndexDrawn=l,this._endIndexDrawn=c,o.length=c-l+1;for(let e=l;e<=c;e++){const{y:n,height:s}=this._yPositions.getRowPosition(e,i),a={height:s,top:n,position:"absolute"},l=t(e),c={"data-item-key":l};o.push(r(l,a,e,c))}const d={style:{position:"relative"},ref:this._initWrapper};this.props.windowScroller||(d.onScroll=this._onScroll,d.style.height="100%",d.style.overflowY="auto");const p={position:"relative",height:this._yPositions.getEstimatedHeight()};return(0,y.jsx)("div",Object.assign({},d,{children:(0,y.jsx)("div",{style:p,children:(0,y.jsx)("div",{style:{position:"absolute",top:0,margin:0,padding:0},className:this.props.itemsWrapperClassName,ref:this._initItemHolder,children:o})})}))}}Ne(Ee,"defaultProps",{initialDraw:Le,itemsWrapperClassName:"",windowScroller:!1});var Oe=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/alert.js"),Me=n.n(Oe),Re=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/arrow-right-a.js"),Pe=n.n(Re),ze=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/network.js"),$e=n.n(ze),He=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/md/file-upload.js"),Ve=n.n(He),Fe=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/android-open.js"),Be=n.n(Fe);const Ae=["isLarge","className"];const Ge=()=>({NewWindowIconLarge:m`
      label: NewWindowIconLarge;
      font-size: 1.5em;
    `});function We(e){const{isLarge:t,className:n}=e,r=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,Ae),s=(0,g.useStyles2)(Ge),a=b()({[s.NewWindowIconLarge]:t},n);return(0,y.jsx)(Be(),Object.assign({className:a},r))}We.defaultProps={isLarge:!1};const Ke=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Popover,Object.assign({},e))})},Ue=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Tooltip,Object.assign({},e))})},qe=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Icon,Object.assign({},e))})},Ze=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Dropdown,Object.assign({},e))})},Xe=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Menu,Object.assign({},e))})},Ye=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.MenuItem,Object.assign({},e))})},Je=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Button,Object.assign({},e))})},Qe=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Divider,Object.assign({},e))})},et=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.Input,Object.assign({},e))})},tt=function(e){return(0,y.jsx)(st,{children:t=>(0,y.jsx)(t.InputGroup,Object.assign({},e))})},nt=r.createContext(void 0);nt.displayName="UIElementsContext";const rt=nt;function st(e){return(0,y.jsx)(nt.Consumer,{children:t=>{if(!t)throw new Error("Elements context is required. You probably forget to use UIElementsContext.Provider");return e.children(t)}})}const at=r.createContext(void 0);at.displayName="ExternalLinkContext";const it=at,ot=["reference","children","className","focusSpan"];function lt(e){const{reference:t,children:n,className:r,focusSpan:s}=e,a=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,ot);return delete a.onClick,t.span?(0,y.jsx)("a",Object.assign({role:"button",onClick:()=>s(t.spanID),className:r},a,{children:n})):(0,y.jsx)(it.Consumer,{children:e=>{if(!e)throw new Error("ExternalLinkContext does not have a value, you probably forgot to setup it's provider");return(0,y.jsx)("a",Object.assign({href:e(t.traceID,t.spanID),target:"_blank",rel:"noopener noreferrer",className:r},a,{children:n}))}})}const ct=(0,g.stylesFactory)((()=>({MultiParent:m`
      padding: 0 5px;
      color: #000;
      & ~ & {
        margin-left: 5px;
      }
    `,TraceRefLink:m`
      display: flex;
      justify-content: space-between;
    `,NewWindowIcon:m`
      margin: 0.2em 0 0;
    `,tooltip:m`
      max-width: none;
    `})));class dt extends r.PureComponent{constructor(){var e,t,n;super(...arguments),n=e=>{const t=ct();return(0,y.jsx)(Xe,{children:e.map((e=>{const{span:n,spanID:r}=e;return(0,y.jsx)(Ye,{children:(0,y.jsxs)(lt,{reference:e,focusSpan:this.props.focusSpan,className:t.TraceRefLink,children:[n?`${n.process.serviceName}:${n.operationName} - ${e.spanID}`:`(another trace) - ${e.spanID}`,!n&&(0,y.jsx)(We,{className:t.NewWindowIcon})]})},`${r}`)}))})},(t="referencesList")in(e=this)?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}render(){const{references:e,children:t,tooltipText:n,focusSpan:r}=this.props,s=ct(),a={arrowPointAtCenter:!0,mouseLeaveDelay:.5,placement:"bottom",title:n,overlayClassName:s.tooltip};if(e.length>1)return(0,y.jsx)(Ue,Object.assign({},a,{children:(0,y.jsx)(Ze,{overlay:this.referencesList(e),placement:"bottomRight",trigger:["click"],children:(0,y.jsx)("a",{className:s.MultiParent,children:t})})}));const i=e[0];return(0,y.jsx)(Ue,Object.assign({},a,{children:(0,y.jsx)(lt,{reference:i,focusSpan:r,className:s.MultiParent,children:t})}))}}var pt,ut,ht=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/chevron-right.js"),mt=n.n(ht),gt=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/ios-arrow-down.js"),ft=n.n(gt);function bt(e){return(0,k.get)((0,k.find)(e.references,(e=>{let{span:t,refType:n}=e;return t&&t.spanID&&("CHILD_OF"===n||"FOLLOWS_FROM"===n)})),"span")}function yt(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const vt=(0,g.stylesFactory)((e=>({SpanTreeOffset:m`
      label: SpanTreeOffset;
      color: ${ee(e,"#000")};
      position: relative;
    `,SpanTreeOffsetParent:m`
      label: SpanTreeOffsetParent;
      &:hover {
        cursor: pointer;
      }
    `,indentGuide:m`
      label: indentGuide;
      /* The size of the indentGuide is based off of the iconWrapper */
      padding-right: calc(0.5rem + 12px);
      height: 100%;
      border-left: 3px solid transparent;
      display: inline-flex;
      &::before {
        content: '';
        padding-left: 1px;
        background-color: ${ee(e,"lightgrey")};
      }
    `,indentGuideActive:m`
      label: indentGuideActive;
      border-color: ${ee(e,"darkgrey")};
      &::before {
        background-color: transparent;
      }
    `,iconWrapper:m`
      label: iconWrapper;
      position: absolute;
      right: 0.25rem;
    `})));class xt extends r.PureComponent{constructor(e){super(e),yt(this,"ancestorIds",void 0),yt(this,"handleMouseLeave",((e,t)=>{e.relatedTarget instanceof HTMLSpanElement&&(0,k.get)(e,"relatedTarget.dataset.ancestorId")===t||this.props.removeHoverIndentGuideId(t)})),yt(this,"handleMouseEnter",((e,t)=>{e.relatedTarget instanceof HTMLSpanElement&&(0,k.get)(e,"relatedTarget.dataset.ancestorId")===t||this.props.addHoverIndentGuideId(t)})),this.ancestorIds=function(e){const t=[];if(!e)return t;let n=bt(e);for(;n;)t.push(n.spanID),n=bt(n);return t}(e.span),this.ancestorIds.push("root"),this.ancestorIds.reverse()}render(){const{childrenVisible:e,onClick:t,showChildrenIcon:n,span:r,theme:s}=this.props,{hasChildren:a,spanID:i}=r,o=a?{onClick:t,role:"switch","aria-checked":e}:null,l=n&&a&&(e?pt||(pt=(0,y.jsx)(ft(),{})):ut||(ut=(0,y.jsx)(mt(),{}))),c=vt(s);return(0,y.jsxs)("span",Object.assign({className:b()(c.SpanTreeOffset,{[c.SpanTreeOffsetParent]:a})},o,{children:[this.ancestorIds.map((e=>(0,y.jsx)("span",{className:b()(c.indentGuide,{[c.indentGuideActive]:this.props.hoverIndentGuideIds.has(e)}),"data-ancestor-id":e,"data-test-id":"SpanTreeOffset--indentGuide",onMouseEnter:t=>this.handleMouseEnter(t,e),onMouseLeave:t=>this.handleMouseLeave(t,e)},e))),l&&(0,y.jsx)("span",{className:c.iconWrapper,onMouseEnter:e=>this.handleMouseEnter(e,i),onMouseLeave:e=>this.handleMouseLeave(e,i),"data-test-id":"icon-wrapper",children:l})]}))}}yt(xt,"displayName","UnthemedSpanTreeOffset"),yt(xt,"defaultProps",{childrenVisible:!1,showChildrenIcon:!0});const wt=(0,g.withTheme2)(xt);var _t=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/ios-arrow-right.js"),kt=n.n(_t);var jt=n("./.yarn/cache/json-markup-npm-1.1.3-2762e9da70-aa4e1935fc.zip/node_modules/json-markup/index.js"),Tt=n.n(jt),It=n("./.yarn/cache/copy-to-clipboard-npm-3.3.1-18029bce99-3c7b1c333d.zip/node_modules/copy-to-clipboard/index.js"),St=n.n(It);function Dt(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const Ct=(0,g.stylesFactory)((()=>({CopyIcon:m`
      background-color: transparent;
      border: none;
      color: inherit;
      height: 100%;
      overflow: hidden;
      padding: 0px;
      &:focus {
        background-color: rgba(255, 255, 255, 0.25);
        color: inherit;
      }
    `})));class Nt extends r.PureComponent{constructor(){super(...arguments),Dt(this,"state",{hasCopied:!1}),Dt(this,"handleClick",(()=>{this.setState({hasCopied:!0}),St()(this.props.copyText)})),Dt(this,"handleTooltipVisibilityChange",(e=>{!e&&this.state.hasCopied&&this.setState({hasCopied:!1})}))}render(){const e=Ct();return(0,y.jsx)(Ue,{arrowPointAtCenter:!0,mouseLeaveDelay:.5,onVisibleChange:this.handleTooltipVisibilityChange,placement:this.props.placement,title:this.state.hasCopied?"Copied":this.props.tooltipTitle,children:(0,y.jsx)(Je,{className:b()(e.CopyIcon,this.props.className),htmlType:"button",icon:this.props.icon,onClick:this.handleClick})})}}Dt(Nt,"defaultProps",{className:void 0,icon:"copy",placement:"left"});const Lt="copyIcon",Et=e=>({KeyValueTable:m`
      label: KeyValueTable;
      background: ${ee(e,"#fff")};
      border: 1px solid ${ee(e,"#ddd")};
      margin-bottom: 0.5rem;
      max-height: 450px;
      overflow: auto;
    `,body:m`
      label: body;
      vertical-align: baseline;
    `,row:m`
      label: row;
      & > td {
        padding: 0rem 0.5rem;
      }
      &:nth-child(2n) > td {
        background: ${ee(e,"#f5f5f5")};
      }
      &:not(:hover) .${Lt} {
        visibility: hidden;
      }
    `,keyColumn:m`
      label: keyColumn;
      color: ${ee(e,"#888")};
      white-space: pre;
      width: 125px;
    `,copyColumn:m`
      label: copyColumn;
      text-align: right;
    `,linkIcon:m`
      label: linkIcon;
      vertical-align: middle;
      font-weight: bold;
    `}),Ot=/^(\[|\{)/;function Mt(e){if("string"==typeof e&&Ot.test(e))try{return JSON.parse(e)}catch(e){}return e}const Rt=e=>{const t=(0,g.useStyles2)(Et);return(0,y.jsxs)("a",{href:e.href,title:e.title,target:"_blank",rel:"noopener noreferrer",children:[e.children," ",(0,y.jsx)(qe,{className:t.linkIcon,type:"export"})]})};Rt.defaultProps={title:""};const Pt=e=>(0,y.jsx)(Xe,{children:e.map(((e,t)=>{let{text:n,url:r}=e;return(0,y.jsx)(Ye,{children:(0,y.jsx)(Rt,{href:r,children:n})},`${r}-${t}`)}))});function zt(e){const{data:t,linksGetter:n}=e,r=(0,g.useStyles2)(Et);return(0,y.jsx)("div",{className:b()(r.KeyValueTable),"data-test-id":"KeyValueTable",children:(0,y.jsx)("table",{className:fe,children:(0,y.jsx)("tbody",{className:r.body,children:t.map(((e,s)=>{const a={__html:Tt()(Mt(e.value))},i=(0,y.jsx)("div",{className:he,dangerouslySetInnerHTML:a}),o=n?n(t,s):null;let l;return l=o&&1===o.length?(0,y.jsx)("div",{children:(0,y.jsx)(Rt,{href:o[0].url,title:o[0].text,children:i})}):o&&o.length>1?(0,y.jsx)("div",{children:(0,y.jsx)(Ze,{overlay:Pt(o),placement:"bottomRight",trigger:["click"],children:(0,y.jsxs)("a",{children:[i," ",(0,y.jsx)(qe,{className:r.linkIcon,type:"profile"})]})})}):i,(0,y.jsxs)("tr",{className:r.row,children:[(0,y.jsx)("td",{className:r.keyColumn,"data-test-id":"KeyValueTable--keyColumn",children:e.key}),(0,y.jsx)("td",{children:l}),(0,y.jsx)("td",{className:r.copyColumn,children:(0,y.jsx)(Nt,{className:Lt,copyText:JSON.stringify(e,null,2),tooltipTitle:"Copy JSON"})})]},`${e.key}-${s}`)}))})})})}const $t=e=>({header:m`
      label: header;
      cursor: pointer;
      overflow: hidden;
      padding: 0.25em 0.1em;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        background: ${ee(e,"#e8e8e8")};
      }
    `,headerEmpty:m`
      label: headerEmpty;
      background: none;
      cursor: initial;
    `,headerHighContrast:m`
      label: headerHighContrast;
      &:hover {
        background: ${ee(e,"#ddd")};
      }
    `,emptyIcon:m`
      label: emptyIcon;
      color: ${ee(e,"#aaa")};
    `,summary:m`
      label: summary;
      display: inline;
      list-style: none;
      padding: 0;
    `,summaryItem:m`
      label: summaryItem;
      display: inline;
      margin-left: 0.7em;
      padding-right: 0.5rem;
      border-right: 1px solid ${ee(e,"#ddd")};
      &:last-child {
        padding-right: 0;
        border-right: none;
      }
    `,summaryLabel:m`
      label: summaryLabel;
      color: ${ee(e,"#777")};
    `,summaryDelim:m`
      label: summaryDelim;
      color: ${ee(e,"#bbb")};
      padding: 0 0.2em;
    `});function Ht(e){const{data:t}=e,n=(0,g.useStyles2)($t);return Array.isArray(t)&&t.length?(0,y.jsx)("ul",{className:n.summary,children:t.map(((e,t)=>(0,y.jsxs)("li",{className:n.summaryItem,children:[(0,y.jsx)("span",{className:n.summaryLabel,children:e.key}),(0,y.jsx)("span",{className:n.summaryDelim,children:"="}),String(e.value)]},`${e.key}-${t}`)))}):null}function Vt(e){const{className:t,data:n,highContrast:r,interactive:s,isOpen:a,label:i,linksGetter:o,onToggle:l}=e,c=!Array.isArray(n)||!n.length,d=(0,g.useStyles2)($t),p=b()(me,{[d.emptyIcon]:c});let u=null,h=null;return s&&(u=a?(0,y.jsx)(ft(),{className:p}):(0,y.jsx)(kt(),{className:p}),h={"aria-checked":a,onClick:c?null:l,role:"switch"}),(0,y.jsxs)("div",{className:b()(t,ge),children:[(0,y.jsxs)("div",Object.assign({className:b()(d.header,{[d.headerEmpty]:c,[d.headerHighContrast]:r&&!c})},h,{"data-test-id":"AccordianKeyValues--header",children:[u,(0,y.jsxs)("strong",{"data-test":"label",children:[i,a||":"]}),!a&&(0,y.jsx)(Ht,{data:n})]})),a&&(0,y.jsx)(zt,{data:n,linksGetter:o})]})}var Ft,Bt,At;Ht.defaultProps={data:null},Vt.defaultProps={className:null,highContrast:!1,interactive:!0,onToggle:null};const Gt=e=>({AccordianLogs:m`
      label: AccordianLogs;
      border: 1px solid ${ee(e,"#d8d8d8")};
      position: relative;
      margin-bottom: 0.25rem;
    `,AccordianLogsHeader:m`
      label: AccordianLogsHeader;
      background: ${ee(e,"#e4e4e4")};
      color: inherit;
      display: block;
      padding: 0.25rem 0.5rem;
      &:hover {
        background: ${ee(e,"#dadada")};
      }
    `,AccordianLogsContent:m`
      label: AccordianLogsContent;
      background: ${ee(e,"#f0f0f0")};
      border-top: 1px solid ${ee(e,"#d8d8d8")};
      padding: 0.5rem 0.5rem 0.25rem 0.5rem;
    `,AccordianLogsFooter:m`
      label: AccordianLogsFooter;
      color: ${ee(e,"#999")};
    `});function Wt(e){const{interactive:t,isOpen:n,linksGetter:r,logs:s,openedItems:a,onItemToggle:i,onToggle:o,timestamp:l}=e;let c=null,d="span",p=null;t&&(c=n?Ft||(Ft=(0,y.jsx)(ft(),{className:me})):Bt||(Bt=(0,y.jsx)(kt(),{className:"u-align-icon"})),d="a",p={"aria-checked":n,onClick:o,role:"switch"});const u=(0,g.useStyles2)(Gt);return(0,y.jsxs)("div",{className:u.AccordianLogs,children:[(0,y.jsxs)(d,Object.assign({className:u.AccordianLogsHeader},p,{children:[c," ",At||(At=(0,y.jsx)("strong",{children:"Logs"}))," (",s.length,")"]})),n&&(0,y.jsxs)("div",{className:u.AccordianLogsContent,children:[(0,k.sortBy)(s,"timestamp").map(((e,n)=>(0,y.jsx)(Vt,{className:n<s.length-1?se:null,data:e.fields||[],highContrast:!0,interactive:t,isOpen:!!a&&a.has(e),label:`${W(e.timestamp-l)}`,linksGetter:r,onToggle:t&&i?()=>i(e):null},`${e.timestamp}-${n}`))),(0,y.jsx)("small",{className:u.AccordianLogsFooter,children:"Log timestamps are relative to the start time of the full trace."})]})]})}Wt.defaultProps={interactive:!0,linksGetter:void 0,onItemToggle:void 0,onToggle:void 0,openedItems:void 0};const Kt=e=>({wrapper:m`
      label: wrapper;
      bottom: 0;
      left: 0;
      position: absolute;
      right: 0;
      top: 0;
      overflow: hidden;
      z-index: 0;
    `,bar:m`
      label: bar;
      border-radius: 3px;
      min-width: 2px;
      position: absolute;
      height: 36%;
      top: 32%;
    `,rpc:m`
      label: rpc;
      position: absolute;
      top: 35%;
      bottom: 35%;
      z-index: 1;
    `,label:m`
      label: label;
      color: #aaa;
      font-size: 12px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      line-height: 1em;
      white-space: nowrap;
      padding: 0 0.5em;
      position: absolute;
    `,logMarker:m`
      label: logMarker;
      background-color: ${ee(e,"#2c3235")};
      cursor: pointer;
      height: 60%;
      min-width: 1px;
      position: absolute;
      top: 20%;
      &:hover {
        background-color: ${ee(e,"#464c54")};
      }
      &::before,
      &::after {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        border: 1px solid transparent;
      }
      &::after {
        left: 0;
      }
    `});function Ut(e){return`${(100*e).toFixed(1)}%`}function qt(e){let{viewEnd:t,viewStart:n,getViewedBounds:s,color:a,shortLabel:i,longLabel:o,onClick:l,rpc:c,traceStartTime:d,span:p,className:u,labelClassName:h}=e;const[m,f]=(0,r.useState)(i),v=(0,k.groupBy)(p.logs,(e=>{const t=s(e.timestamp,e.timestamp).start;return Ut(Math.round(500*t)/500)})),x=(0,g.useStyles2)(Kt);return(0,y.jsxs)("div",{className:b()(x.wrapper,u),onClick:l,onMouseLeave:()=>f(i),onMouseOver:()=>f(o),"aria-hidden":!0,"data-test-id":"SpanBar--wrapper",children:[(0,y.jsx)("div",{"aria-label":m,className:x.bar,style:{background:a,left:Ut(n),width:Ut(t-n)},children:(0,y.jsx)("div",{className:b()(x.label,h),"data-test-id":"SpanBar--label",children:m})}),(0,y.jsx)("div",{children:Object.keys(v).map((e=>(0,y.jsx)(Ke,{placement:"topLeft",content:(0,y.jsx)(Wt,{interactive:!1,isOpen:!0,logs:v[e],timestamp:d}),children:(0,y.jsx)("div",{className:x.logMarker,style:{left:e}})},e)))}),c&&(0,y.jsx)("div",{className:x.rpc,style:{background:c.color,left:Ut(c.viewStart),width:Ut(c.viewEnd-c.viewStart)}})]})}const Zt=r.memo(qt);var Xt,Yt,Jt,Qt;function en(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const tn="spanBar",nn="spanBarLabel",rn="nameWrapper",sn="nameWrapperMatchingFilter",an="jaegerView",on="nameColumn",ln=(0,g.stylesFactory)((e=>{const t=h`
    label: flash;
    from {
      background-color: ${ee(e,"#68b9ff")};
    }
    to {
      background-color: default;
    }
  `;return{nameWrapper:m`
      label: nameWrapper;
      line-height: 27px;
      overflow: hidden;
      display: flex;
    `,nameWrapperMatchingFilter:m`
      label: nameWrapperMatchingFilter;
      background-color: ${ee(e,"#fffce4")};
    `,nameColumn:m`
      label: nameColumn;
      position: relative;
      white-space: nowrap;
      z-index: 1;
      &:hover {
        z-index: 1;
      }
    `,endpointName:m`
      label: endpointName;
      color: ${ee(e,"#808080")};
    `,view:m`
      label: view;
      position: relative;
    `,viewExpanded:m`
      label: viewExpanded;
      background: ${ee(e,"#f8f8f8")};
      outline: 1px solid ${ee(e,"#ddd")};
    `,viewExpandedAndMatchingFilter:m`
      label: viewExpandedAndMatchingFilter;
      background: ${ee(e,"#fff3d7")};
      outline: 1px solid ${ee(e,"#ddd")};
    `,row:m`
      label: row;
      &:hover .${tn} {
        opacity: 1;
      }
      &:hover .${nn} {
        color: ${ee(e,"#000")};
      }
      &:hover .${rn} {
        background: #f8f8f8;
        background: linear-gradient(
          90deg,
          ${ee(e,"#fafafa")},
          ${ee(e,"#f8f8f8")} 75%,
          ${ee(e,"#eee")}
        );
      }
      &:hover .${an} {
        background-color: ${ee(e,"#f5f5f5")};
        outline: 1px solid ${ee(e,"#ddd")};
      }
    `,rowClippingLeft:m`
      label: rowClippingLeft;
      & .${on}::before {
        content: ' ';
        height: 100%;
        position: absolute;
        width: 6px;
        background-image: linear-gradient(
          to right,
          ${ee(e,"rgba(25, 25, 25, 0.25)")},
          ${ee(e,"rgba(32, 32, 32, 0)")}
        );
        left: 100%;
        z-index: -1;
      }
    `,rowClippingRight:m`
      label: rowClippingRight;
      & .${an}::before {
        content: ' ';
        height: 100%;
        position: absolute;
        width: 6px;
        background-image: linear-gradient(
          to left,
          ${ee(e,"rgba(25, 25, 25, 0.25)")},
          ${ee(e,"rgba(25, 25, 25, 0.25)")}
        );
        right: 0%;
        z-index: 1;
      }
    `,rowExpanded:m`
      label: rowExpanded;
      & .${tn} {
        opacity: 1;
      }
      & .${nn} {
        color: ${ee(e,"#000")};
      }
      & .${rn}, &:hover .${rn} {
        background: ${ee(e,"#f0f0f0")};
        box-shadow: 0 1px 0 ${ee(e,"#ddd")};
      }
      & .${sn} {
        background: ${ee(e,"#fff3d7")};
      }
      &:hover .${an} {
        background: ${ee(e,"#eee")};
      }
    `,rowMatchingFilter:m`
      label: rowMatchingFilter;
      background-color: ${ee(e,"#fffce4")};
      &:hover .${rn} {
        background: linear-gradient(
          90deg,
          ${ee(e,"#fff5e1")},
          ${ee(e,"#fff5e1")} 75%,
          ${ee(e,"#ffe6c9")}
        );
      }
      &:hover .${an} {
        background-color: ${ee(e,"#fff3d7")};
        outline: 1px solid ${ee(e,"#ddd")};
      }
    `,rowFocused:m`
      label: rowFocused;
      background-color: ${ee(e,"#cbe7ff")};
      animation: ${t} 1s cubic-bezier(0.12, 0, 0.39, 0);
      & .${rn}, .${an}, .${sn} {
        background-color: ${ee(e,"#cbe7ff")};
        animation: ${t} 1s cubic-bezier(0.12, 0, 0.39, 0);
      }
      & .${tn} {
        opacity: 1;
      }
      & .${nn} {
        color: ${ee(e,"#000")};
      }
      &:hover .${rn}, :hover .${an} {
        background: ${ee(e,"#d5ebff")};
        box-shadow: 0 1px 0 ${ee(e,"#ddd")};
      }
    `,rowExpandedAndMatchingFilter:m`
      label: rowExpandedAndMatchingFilter;
      &:hover .${an} {
        background: ${ee(e,"#ffeccf")};
      }
    `,name:m`
      label: name;
      color: ${ee(e,"#000")};
      cursor: pointer;
      flex: 1 1 auto;
      outline: none;
      overflow: hidden;
      padding-left: 4px;
      padding-right: 0.25em;
      position: relative;
      text-overflow: ellipsis;
      &::before {
        content: ' ';
        position: absolute;
        top: 4px;
        bottom: 4px;
        left: 0;
        border-left: 4px solid;
        border-left-color: inherit;
      }

      /* This is so the hit area of the span-name extends the rest of the width of the span-name column */
      &::after {
        background: transparent;
        bottom: 0;
        content: ' ';
        left: 0;
        position: absolute;
        top: 0;
        width: 1000px;
      }
      &:focus {
        text-decoration: none;
      }
      &:hover > small {
        color: ${ee(e,"#000")};
      }
    `,nameDetailExpanded:m`
      label: nameDetailExpanded;
      &::before {
        bottom: 0;
      }
    `,svcName:m`
      label: svcName;
      padding: 0 0.25rem 0 0.5rem;
      font-size: 1.05em;
    `,svcNameChildrenCollapsed:m`
      label: svcNameChildrenCollapsed;
      font-weight: bold;
      font-style: italic;
    `,errorIcon:m`
      label: errorIcon;
      border-radius: 6.5px;
      color: ${ee(e,"#fff")};
      font-size: 0.85em;
      margin-right: 0.25rem;
      padding: 1px;
    `,rpcColorMarker:m`
      label: rpcColorMarker;
      border-radius: 6.5px;
      display: inline-block;
      font-size: 0.85em;
      height: 1em;
      margin-right: 0.25rem;
      padding: 1px;
      width: 1em;
      vertical-align: middle;
    `,labelRight:m`
      label: labelRight;
      left: 100%;
    `,labelLeft:m`
      label: labelLeft;
      right: 100%;
    `}}));class cn extends r.PureComponent{constructor(){super(...arguments),en(this,"_detailToggle",(()=>{this.props.onDetailToggled(this.props.span.spanID)})),en(this,"_childrenToggle",(()=>{this.props.onChildrenToggled(this.props.span.spanID)}))}render(){const{className:e,color:t,columnDivision:n,isChildrenExpanded:r,isDetailExpanded:s,isMatchingFilter:a,isFocused:i,numTicks:o,rpc:l,noInstrumentedServer:c,showErrorIcon:d,getViewedBounds:p,traceStartTime:u,span:h,focusSpan:m,hoverIndentGuideIds:g,addHoverIndentGuideId:f,removeHoverIndentGuideId:v,clippingLeft:x,clippingRight:w,theme:_,createSpanLink:k}=this.props,{duration:j,hasChildren:T,operationName:I,process:{serviceName:S}}=h,D=W(j),C=p(h.startTime,h.startTime+h.duration),N=C.start,L=C.end,E=ln(_),O=`${S}::${I}`;let M,R;return N>1-L?(M=`${O} | ${D}`,R=E.labelLeft):(M=`${D} | ${O}`,R=E.labelRight),(0,y.jsxs)(ke,{className:b()(E.row,{[E.rowExpanded]:s,[E.rowMatchingFilter]:a,[E.rowExpandedAndMatchingFilter]:a&&s,[E.rowFocused]:i,[E.rowClippingLeft]:x,[E.rowClippingRight]:w},e),children:[(0,y.jsx)(ke.Cell,{className:b()(E.nameColumn,on),width:n,children:(0,y.jsxs)("div",{className:b()(E.nameWrapper,rn,{[E.nameWrapperMatchingFilter]:a,nameWrapperMatchingFilter:a}),children:[(0,y.jsx)(wt,{childrenVisible:r,span:h,onClick:T?this._childrenToggle:void 0,hoverIndentGuideIds:g,addHoverIndentGuideId:f,removeHoverIndentGuideId:v}),(0,y.jsxs)("a",{className:b()(E.name,{[E.nameDetailExpanded]:s}),"aria-checked":s,title:O,onClick:this._detailToggle,role:"switch",style:{borderColor:t},tabIndex:0,children:[(0,y.jsxs)("span",{className:b()(E.svcName,{[E.svcNameChildrenCollapsed]:T&&!r}),children:[d&&(0,y.jsx)(Me(),{style:{backgroundColor:h.errorIconColor?ee(_,h.errorIconColor):ee(_,"#db2828")},className:E.errorIcon}),S," ",l&&(0,y.jsxs)("span",{children:[Xt||(Xt=(0,y.jsx)(Pe(),{}))," ",(0,y.jsx)("i",{className:E.rpcColorMarker,style:{background:l.color}}),l.serviceName]}),c&&(0,y.jsxs)("span",{children:[Yt||(Yt=(0,y.jsx)(Pe(),{}))," ",(0,y.jsx)("i",{className:E.rpcColorMarker,style:{background:c.color}}),c.serviceName]})]}),(0,y.jsx)("small",{className:E.endpointName,children:l?l.operationName:I}),(0,y.jsxs)("small",{className:E.endpointName,children:[" | ",D]})]}),k&&(()=>{const e=k(h);return e?(0,y.jsx)("a",{href:e.href,target:"_blank",style:{marginRight:"5px"},rel:"noopener noreferrer",onClick:e.onClick?t=>{t.ctrlKey||t.metaKey||t.shiftKey||!e.onClick||(t.preventDefault(),e.onClick(t))}:void 0,children:e.content}):null})(),h.references&&h.references.length>1&&(0,y.jsx)(dt,{references:h.references,tooltipText:"Contains multiple references",focusSpan:m,children:Jt||(Jt=(0,y.jsx)($e(),{}))}),h.subsidiarilyReferencedBy&&h.subsidiarilyReferencedBy.length>0&&(0,y.jsx)(dt,{references:h.subsidiarilyReferencedBy,tooltipText:"This span is referenced by "+(1===h.subsidiarilyReferencedBy.length?"another span":"multiple other spans"),focusSpan:m,children:Qt||(Qt=(0,y.jsx)(Ve(),{}))})]})}),(0,y.jsxs)(ke.Cell,{className:b()(E.view,an,{[E.viewExpanded]:s,[E.viewExpandedAndMatchingFilter]:a&&s}),"data-test-id":"span-view",style:{cursor:"pointer"},width:1-n,onClick:this._detailToggle,children:[(0,y.jsx)(ne,{numTicks:o}),(0,y.jsx)(Zt,{rpc:l,viewStart:N,viewEnd:L,getViewedBounds:p,color:t,shortLabel:D,longLabel:M,traceStartTime:u,span:h,labelClassName:`spanBarLabel ${R}`,className:tn})]})]})}}en(cn,"displayName","UnthemedSpanBarRow"),en(cn,"defaultProps",{className:"",rpc:null});const dn=(0,g.withTheme2)(cn);var pn=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/link.js"),un=n.n(pn);const hn=()=>({TextList:m`
      max-height: 450px;
      overflow: auto;
    `,List:m`
      width: 100%;
      list-style: none;
      padding: 0;
      margin: 0;
    `,item:m`
      padding: 0.25rem 0.5rem;
      vertical-align: top;
      &:nth-child(2n) {
        background: #f5f5f5;
      }
    `});function mn(e){const{data:t}=e,n=(0,g.useStyles2)(hn);return(0,y.jsx)("div",{className:b()(n.TextList),"data-test-id":"TextList",children:(0,y.jsx)("ul",{className:n.List,children:t.map(((e,t)=>(0,y.jsx)("li",{className:n.item,children:e},`${t}`)))})})}const gn=e=>({header:m`
      cursor: pointer;
      overflow: hidden;
      padding: 0.25em 0.1em;
      text-overflow: ellipsis;
      white-space: nowrap;
      &:hover {
        background: ${ee(e,"#e8e8e8")};
      }
    `});function fn(e){let{data:t}=e;return(0,y.jsx)(mn,{data:t})}function bn(e){const{className:t,data:n,headerClassName:r,interactive:s,isOpen:a,label:i,onToggle:o,TextComponent:l=fn}=e,c=!Array.isArray(n)||!n.length,d=(0,g.useStyles2)($t),p=b()(me,{[d.emptyIcon]:c});let u=null,h=null;s&&(u=a?(0,y.jsx)(ft(),{className:p}):(0,y.jsx)(kt(),{className:p}),h={"aria-checked":a,onClick:c?null:o,role:"switch"});const m=(0,g.useStyles2)(gn);return(0,y.jsxs)("div",{className:t||"",children:[(0,y.jsxs)("div",Object.assign({className:b()(m.header,r)},h,{"data-test-id":"AccordianText--header",children:[u,(0,y.jsx)("strong",{children:i})," (",n.length,")"]})),a&&(0,y.jsx)(l,{data:n})]})}bn.defaultProps={className:null,highContrast:!1,interactive:!0,onToggle:null};const yn=e=>({LabeledList:m`
      label: LabeledList;
      list-style: none;
      margin: 0;
      padding: 0;
    `,LabeledListItem:m`
      label: LabeledListItem;
      display: inline-block;
    `,LabeledListLabel:m`
      label: LabeledListLabel;
      color: ${e.isLight?"#999":"#666"};
      margin-right: 0.25rem;
    `});function vn(e){var t;const{className:n,dividerClassName:r,items:s}=e,a=(0,g.useStyles2)(yn);return(0,y.jsx)("ul",{className:b()(a.LabeledList,n),children:s.map(((e,n)=>{let{key:i,label:o,value:l}=e;const c=n<s.length-1&&(0,y.jsx)("li",{className:a.LabeledListItem,children:t||(t=(0,y.jsx)(Qe,{className:r,type:"vertical"}))},`${i}--divider`);return[(0,y.jsxs)("li",{className:a.LabeledListItem,children:[(0,y.jsx)("span",{className:a.LabeledListLabel,children:o}),(0,y.jsx)("strong",{children:l})]},i),c]}))})}var xn,wn;const _n=()=>({ReferencesList:m`
      background: #fff;
      border: 1px solid #ddd;
      margin-bottom: 0.7em;
      max-height: 450px;
      overflow: auto;
    `,list:m`
      width: 100%;
      list-style: none;
      padding: 0;
      margin: 0;
      background: #fff;
    `,itemContent:m`
      padding: 0.25rem 0.5rem;
      display: flex;
      width: 100%;
      justify-content: space-between;
    `,item:m`
      &:nth-child(2n) {
        background: #f5f5f5;
      }
    `,debugInfo:m`
      letter-spacing: 0.25px;
      margin: 0.5em 0 0;
    `,debugLabel:m`
      margin: 0 5px 0 5px;
      &::before {
        color: #bbb;
        content: attr(data-label);
      }
    `});function kn(e){const{data:t,focusSpan:n}=e,r=(0,g.useStyles2)(_n);return(0,y.jsx)("div",{className:b()(r.ReferencesList),children:(0,y.jsx)("ul",{className:r.list,children:t.map((e=>(0,y.jsx)("li",{className:r.item,children:(0,y.jsx)(lt,{reference:e,focusSpan:n,children:(0,y.jsxs)("span",{className:r.itemContent,children:[e.span?(0,y.jsxs)("span",{children:[(0,y.jsx)("span",{className:"span-svc-name",children:e.span.process.serviceName}),(0,y.jsx)("small",{className:"endpoint-name",children:e.span.operationName})]}):xn||(xn=(0,y.jsx)("span",{className:"span-svc-name",children:"< span in another trace >"})),(0,y.jsxs)("small",{className:r.debugInfo,children:[(0,y.jsx)("span",{className:r.debugLabel,"data-label":"Reference Type:",children:e.refType}),(0,y.jsx)("span",{className:r.debugLabel,"data-label":"SpanID:",children:e.spanID})]})]})})},`${e.spanID}`)))})})}class jn extends r.PureComponent{render(){const{data:e,interactive:t,isOpen:n,onToggle:r,focusSpan:s}=this.props,a=!Array.isArray(e)||!e.length,i=me;let o=null,l=null;return t&&(o=n?(0,y.jsx)(ft(),{className:i}):(0,y.jsx)(kt(),{className:i}),l={"aria-checked":n,onClick:a?null:r,role:"switch"}),(0,y.jsxs)("div",{children:[(0,y.jsxs)("div",Object.assign({},l,{children:[o,wn||(wn=(0,y.jsx)("strong",{children:(0,y.jsx)("span",{children:"References"})}))," ","(",e.length,")"]})),n&&(0,y.jsx)(kn,{data:e,focusSpan:s})]})}}var Tn,In,Sn;Sn={highContrast:!1,interactive:!0,onToggle:null},(In="defaultProps")in(Tn=jn)?Object.defineProperty(Tn,In,{value:Sn,enumerable:!0,configurable:!0,writable:!0}):Tn[In]=Sn;const Dn=e=>({divider:m`
      label: divider;
      background: ${ee(e,"#ddd")};
    `,dividerVertical:m`
      label: dividerVertical;
      display: block;
      height: 1px;
      width: 100%;
      margin: 24px 0;
      clear: both;
      vertical-align: middle;
      position: relative;
      top: -0.06em;
    `,debugInfo:m`
      label: debugInfo;
      display: block;
      letter-spacing: 0.25px;
      margin: 0.5em 0 -0.75em;
      text-align: right;
    `,debugLabel:m`
      label: debugLabel;
      &::before {
        color: ${ee(e,"#bbb")};
        content: attr(data-label);
      }
    `,debugValue:m`
      label: debugValue;
      background-color: inherit;
      border: none;
      color: ${ee(e,"#888")};
      cursor: pointer;
      &:hover {
        color: ${ee(e,"#333")};
      }
    `,AccordianWarnings:m`
      label: AccordianWarnings;
      background: ${ee(e,"#fafafa")};
      border: 1px solid ${ee(e,"#e4e4e4")};
      margin-bottom: 0.25rem;
    `,AccordianWarningsHeader:m`
      label: AccordianWarningsHeader;
      background: ${ee(e,"#fff7e6")};
      padding: 0.25rem 0.5rem;
      &:hover {
        background: ${ee(e,"#ffe7ba")};
      }
    `,AccordianWarningsHeaderOpen:m`
      label: AccordianWarningsHeaderOpen;
      border-bottom: 1px solid ${ee(e,"#e8e8e8")};
    `,AccordianWarningsLabel:m`
      label: AccordianWarningsLabel;
      color: ${ee(e,"#d36c08")};
    `,Textarea:m`
      word-break: break-all;
      white-space: pre;
    `,LinkIcon:m`
      font-size: 1.5em;
    `});function Cn(e){const{detailState:t,linksGetter:n,logItemToggle:r,logsToggle:s,processToggle:a,span:i,tagsToggle:o,traceStartTime:l,warningsToggle:c,stackTracesToggle:d,referencesToggle:p,focusSpan:u,createSpanLink:h,createFocusSpanLink:m}=e,{isTagsOpen:f,isProcessOpen:v,logs:x,isWarningsOpen:w,isReferencesOpen:_,isStackTracesOpen:k}=t,{operationName:j,process:T,duration:I,relativeStartTime:S,traceID:D,spanID:C,logs:N,tags:L,warnings:E,references:O,stackTraces:M}=i,R=[{key:"svc",label:"Service:",value:T.serviceName},{key:"duration",label:"Duration:",value:W(I)},{key:"start",label:"Start Time:",value:W(S)}],P=(0,g.useStyles2)(Dn),z=null==h?void 0:h(i),$=m(D,C);return(0,y.jsxs)("div",{children:[(0,y.jsxs)("div",{className:b()(ce,de,se),children:[(0,y.jsx)("h2",{className:b()(pe,ie),children:j}),(0,y.jsx)(vn,{className:ue,dividerClassName:P.divider,items:R})]}),z?(0,y.jsx)(g.DataLinkButton,{link:Object.assign({},z,{title:"Logs for this span"}),buttonProps:{icon:"gf-logs"}}):null,(0,y.jsx)(Qe,{className:b()(P.divider,P.dividerVertical,ae)}),(0,y.jsxs)("div",{children:[(0,y.jsxs)("div",{children:[(0,y.jsx)(Vt,{data:L,label:"Tags",linksGetter:n,isOpen:f,onToggle:()=>o(C)}),T.tags&&(0,y.jsx)(Vt,{className:se,data:T.tags,label:"Process",linksGetter:n,isOpen:v,onToggle:()=>a(C)})]}),N&&N.length>0&&(0,y.jsx)(Wt,{linksGetter:n,logs:N,isOpen:x.isOpen,openedItems:x.openedItems,onToggle:()=>s(C),onItemToggle:e=>r(C,e),timestamp:l}),E&&E.length>0&&(0,y.jsx)(bn,{className:P.AccordianWarnings,headerClassName:P.AccordianWarningsHeader,label:(0,y.jsx)("span",{className:P.AccordianWarningsLabel,children:"Warnings"}),data:E,isOpen:w,onToggle:()=>c(C)}),M&&M.length&&(0,y.jsx)(bn,{label:"Stack trace",data:M,isOpen:k,TextComponent:e=>{var t;let n;var r;(null===(t=e.data)||void 0===t?void 0:t.length)>1?n=e.data.map(((e,t)=>`StackTrace ${t+1}:\n${e}`)).join("\n"):n=null===(r=e.data)||void 0===r?void 0:r[0];return(0,y.jsx)(g.TextArea,{className:P.Textarea,style:{cursor:"unset"},readOnly:!0,cols:10,rows:10,value:n})},onToggle:()=>d(C)}),O&&O.length>0&&(O.length>1||"CHILD_OF"!==O[0].refType)&&(0,y.jsx)(jn,{data:O,isOpen:_,onToggle:()=>p(C),focusSpan:u}),(0,y.jsxs)("small",{className:P.debugInfo,children:[(0,y.jsx)("a",Object.assign({},$,{onClick:e=>{!$.onClick||0!==e.button||e.currentTarget.target&&"_self"!==e.currentTarget.target||e.metaKey||e.altKey||e.ctrlKey||e.shiftKey||(e.preventDefault(),$.onClick(e))},children:(0,y.jsx)(un(),{className:b()(me,P.LinkIcon)})})),(0,y.jsx)("span",{className:P.debugLabel,"data-label":"SpanID:"})," ",C]})]})]})}function Nn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const Ln=(0,g.stylesFactory)((e=>({expandedAccent:m`
      cursor: pointer;
      height: 100%;
      overflow: hidden;
      position: absolute;
      width: 100%;
      &::before {
        border-left: 4px solid;
        pointer-events: none;
        width: 1000px;
      }
      &::after {
        border-right: 1000px solid;
        border-color: inherit;
        cursor: pointer;
        opacity: 0.2;
      }

      /* border-color inherit must come AFTER other border declarations for accent */
      &::before,
      &::after {
        border-color: inherit;
        content: ' ';
        position: absolute;
        height: 100%;
      }

      &:hover::after {
        opacity: 0.35;
      }
    `,infoWrapper:m`
      label: infoWrapper;
      border: 1px solid ${ee(e,"#d3d3d3")};
      border-top: 3px solid;
      padding: 0.75rem;
    `})));class En extends r.PureComponent{constructor(){super(...arguments),Nn(this,"_detailToggle",(()=>{this.props.onDetailToggled(this.props.span.spanID)})),Nn(this,"_linksGetter",((e,t)=>{const{linksGetter:n,span:r}=this.props;return n(r,e,t)}))}render(){const{color:e,columnDivision:t,detailState:n,logItemToggle:r,logsToggle:s,processToggle:a,referencesToggle:i,warningsToggle:o,stackTracesToggle:l,span:c,tagsToggle:d,traceStartTime:p,focusSpan:u,hoverIndentGuideIds:h,addHoverIndentGuideId:m,removeHoverIndentGuideId:g,theme:f,createSpanLink:b,focusedSpanId:v,createFocusSpanLink:x}=this.props,w=Ln(f);return(0,y.jsxs)(ke,{children:[(0,y.jsxs)(ke.Cell,{width:t,style:{overflow:"hidden"},children:[(0,y.jsx)(wt,{span:c,showChildrenIcon:!1,hoverIndentGuideIds:h,addHoverIndentGuideId:m,removeHoverIndentGuideId:g}),(0,y.jsx)("span",{children:(0,y.jsx)("span",{className:w.expandedAccent,"aria-checked":"true",onClick:this._detailToggle,role:"switch",style:{borderColor:e},"data-test-id":"detail-row-expanded-accent"})})]}),(0,y.jsx)(ke.Cell,{width:1-t,children:(0,y.jsx)("div",{className:w.infoWrapper,style:{borderTopColor:e},children:(0,y.jsx)(Cn,{detailState:n,linksGetter:this._linksGetter,logItemToggle:r,logsToggle:s,processToggle:a,referencesToggle:i,warningsToggle:o,stackTracesToggle:l,span:c,tagsToggle:d,traceStartTime:p,focusSpan:u,createSpanLink:b,focusedSpanId:v,createFocusSpanLink:x})})})]})}}const On=(0,g.withTheme2)(En);function Mn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function Rn(e){if(7!==e.length)return[0,0,0];const t=e.slice(1,3),n=e.slice(3,5),r=e.slice(5);return[parseInt(t,16),parseInt(n,16),parseInt(r,16)]}class Pn{constructor(e){Mn(this,"colorsHex",void 0),Mn(this,"colorsRgb",void 0),Mn(this,"cache",void 0),Mn(this,"currentIdx",void 0),this.colorsHex=e,this.colorsRgb=e.map(Rn),this.cache=new Map,this.currentIdx=0}_getColorIndex(e){let t=this.cache.get(e);return null==t&&(t=this.currentIdx,this.cache.set(e,this.currentIdx),this.currentIdx=++this.currentIdx%this.colorsHex.length),t}getColorByKey(e){const t=this._getColorIndex(e);return this.colorsHex[t]}getRgbColorByKey(e){const t=this._getColorIndex(e);return this.colorsRgb[t]}clear(){this.cache.clear(),this.currentIdx=0}}const zn=(0,Se.Z)((e=>new Pn(e)));function $n(e,t){return zn(g.colors).getColorByKey(e)}function Hn(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const Vn=(0,g.stylesFactory)((()=>({rowsWrapper:m`
      width: 100%;
    `,row:m`
      width: 100%;
    `}))),Fn=28,Bn=161,An=197;const Gn=(0,Se.Z)((function(e,t,n){return e?function(e,t,n){if(!e)return[];let r=null;const s=[];for(let a=0;a<e.length;a++){const i=e[a],{spanID:o,depth:l}=i;let c=!1;null!=r&&(l>=r?c=!0:r=null),c||(t.has(o)&&(r=l+1),s.push({span:i,isDetail:!1,spanIndex:a}),n.has(o)&&s.push({span:i,isDetail:!0,spanIndex:a}))}return s}(e.spans,t,n):[]})),Wn=(0,Se.Z)((function(e){const{min:t,max:n,viewStart:r,viewEnd:s}=e,a=n-t,i=t+r*a,o=n-(1-s)*a-i;return(e,t)=>({start:(e-i)/o,end:(t-i)/o})}),k.isEqual),Kn=(0,Se.Z)((function(e){const[t,n]=e;return{left:t>0,right:n<1}}),k.isEqual);class Un extends r.Component{constructor(e){super(e),Hn(this,"listView",void 0),Hn(this,"getViewRange",(()=>this.props.currentViewRangeTime)),Hn(this,"getSearchedSpanIDs",(()=>this.props.findMatchesIDs)),Hn(this,"getCollapsedChildren",(()=>this.props.childrenHiddenIDs)),Hn(this,"mapRowIndexToSpanIndex",(e=>this.getRowStates()[e].spanIndex)),Hn(this,"mapSpanIndexToRowIndex",(e=>{const t=this.getRowStates().length;for(let n=0;n<t;n++){const{spanIndex:t}=this.getRowStates()[n];if(t===e)return n}throw new Error(`unable to find row for span index: ${e}`)})),Hn(this,"setListView",(e=>{const t=this.listView!==e;this.listView=e,e&&t&&this.props.registerAccessors(this.getAccessors())})),Hn(this,"getKeyFromIndex",(e=>{const{isDetail:t,span:n}=this.getRowStates()[e];return`${n.traceID}--${n.spanID}--${t?"detail":"bar"}`})),Hn(this,"getIndexFromKey",(e=>{const t=e.split("--"),n=t[0],r=t[1],s="detail"===t[2],a=this.getRowStates().length;for(let e=0;e<a;e++){const{span:t,isDetail:a}=this.getRowStates()[e];if(t.spanID===r&&t.traceID===n&&a===s)return e}return-1})),Hn(this,"getRowHeight",(e=>{const{span:t,isDetail:n}=this.getRowStates()[e];return n?Array.isArray(t.logs)&&t.logs.length?An:Bn:Fn})),Hn(this,"renderRow",((e,t,n,r)=>{const{isDetail:s,span:a,spanIndex:i}=this.getRowStates()[n];return s?this.renderSpanDetailRow(a,e,t,r):this.renderSpanBarRow(a,i,e,t,r)})),Hn(this,"scrollToSpan",(e=>{if(null==e)return;const t=this.getRowStates().findIndex((t=>t.span.spanID===e));var n;t>=0&&(null===(n=this.listView)||void 0===n||n.scrollToIndex(t))}));const{setTrace:t,trace:n,uiFind:r}=e;t(n,r)}componentDidMount(){this.scrollToSpan(this.props.focusedSpanId)}shouldComponentUpdate(e){const t=Object.keys(e);for(let n=0;n<t.length;n+=1)if(e[t[n]]!==this.props[t[n]]){if("shouldScrollToFirstUiFindMatch"!==t[n])return!0;if(e[t[n]])return!0}return!1}componentDidUpdate(e){const{registerAccessors:t,trace:n}=e,{shouldScrollToFirstUiFindMatch:r,clearShouldScrollToFirstUiFindMatch:s,scrollToFirstVisibleSpan:a,registerAccessors:i,setTrace:o,trace:l,uiFind:c,focusedSpanId:d}=this.props;n!==l&&o(l,c),this.listView&&t!==i&&i(this.getAccessors()),r&&(a(),s()),d!==e.focusedSpanId&&this.scrollToSpan(d)}getRowStates(){const{childrenHiddenIDs:e,detailStates:t,trace:n}=this.props;return Gn(n,e,t)}getClipping(){const{currentViewRangeTime:e}=this.props;return Kn(e)}getViewedBounds(){const{currentViewRangeTime:e,trace:t}=this.props,[n,r]=e;return Wn({min:t.startTime,max:t.endTime,viewStart:n,viewEnd:r})}getAccessors(){const e=this.listView;if(!e)throw new Error("ListView unavailable");return{getViewRange:this.getViewRange,getSearchedSpanIDs:this.getSearchedSpanIDs,getCollapsedChildren:this.getCollapsedChildren,getViewHeight:e.getViewHeight,getBottomRowIndexVisible:e.getBottomVisibleIndex,getTopRowIndexVisible:e.getTopVisibleIndex,getRowPosition:e.getRowPosition,mapRowIndexToSpanIndex:this.mapRowIndexToSpanIndex,mapSpanIndexToRowIndex:this.mapSpanIndexToRowIndex}}renderSpanBarRow(e,t,n,r,s){const{spanID:a}=e,{serviceName:i}=e.process,{childrenHiddenIDs:o,childrenToggle:l,detailStates:c,detailToggle:d,findMatchesIDs:p,spanNameColumnWidth:u,trace:h,focusSpan:m,hoverIndentGuideIds:g,addHoverIndentGuideId:f,removeHoverIndentGuideId:b,theme:v,createSpanLink:x,focusedSpanId:w}=this.props;if(!h)return null;const _=$n(i),k=o.has(a),j=c.has(a),T=!!p&&p.has(a),I=a===w,S=Y(e)||k&&function(e,t){const{depth:n}=e[t];let r=t+1;for(;r<e.length&&e[r].depth>n;r++)if(Y(e[r]))return!0;return!1}(h.spans,t);let D=null;if(k){const e=function(e){if(e.length<=1||!U(e[0]))return!1;const t=e[0].depth+1;let n=1;for(;n<e.length&&e[n].depth===t;){if(q(e[n]))return e[n];n++}return null}(h.spans.slice(t));if(e){const t=this.getViewedBounds()(e.startTime,e.startTime+e.duration);D={color:$n(e.process.serviceName),operationName:e.operationName,serviceName:e.process.serviceName,viewEnd:t.end,viewStart:t.start}}}const C=e.tags.find((e=>"peer.service"===e.key));let N=null;!e.hasChildren&&C&&(e=>e.tags.some((e=>{let{key:t,value:n}=e;return"span.kind"===t&&"client"===n})))(e)&&(N={serviceName:C.value,color:$n(C.value)});const L=Vn();return(0,y.jsx)("div",Object.assign({className:L.row,style:r},s,{children:(0,y.jsx)(dn,{clippingLeft:this.getClipping().left,clippingRight:this.getClipping().right,color:_,columnDivision:u,isChildrenExpanded:!k,isDetailExpanded:j,isMatchingFilter:T,isFocused:I,numTicks:5,onDetailToggled:d,onChildrenToggled:l,rpc:D,noInstrumentedServer:N,showErrorIcon:S,getViewedBounds:this.getViewedBounds(),traceStartTime:h.startTime,span:e,focusSpan:m,hoverIndentGuideIds:g,addHoverIndentGuideId:f,removeHoverIndentGuideId:b,createSpanLink:x})}),n)}renderSpanDetailRow(e,t,n,r){const{spanID:s}=e,{serviceName:a}=e.process,{detailLogItemToggle:i,detailLogsToggle:o,detailProcessToggle:l,detailReferencesToggle:c,detailWarningsToggle:d,detailStackTracesToggle:p,detailStates:u,detailTagsToggle:h,detailToggle:m,spanNameColumnWidth:g,trace:f,focusSpan:b,hoverIndentGuideIds:v,addHoverIndentGuideId:x,removeHoverIndentGuideId:w,linksGetter:_,theme:k,createSpanLink:j,focusedSpanId:T,createFocusSpanLink:I}=this.props,S=u.get(s);if(!f||!S)return null;const D=$n(a),C=Vn();return(0,y.jsx)("div",Object.assign({className:C.row,style:Object.assign({},n,{zIndex:1})},r,{children:(0,y.jsx)(On,{color:D,columnDivision:g,onDetailToggled:m,detailState:S,linksGetter:_,logItemToggle:i,logsToggle:o,processToggle:l,referencesToggle:c,warningsToggle:d,stackTracesToggle:p,span:e,tagsToggle:h,traceStartTime:f.startTime,focusSpan:b,hoverIndentGuideIds:v,addHoverIndentGuideId:x,removeHoverIndentGuideId:w,createSpanLink:j,focusedSpanId:T,createFocusSpanLink:I})}),t)}render(){const e=Vn(),{scrollElement:t}=this.props;return(0,y.jsx)("div",{children:(0,y.jsx)(Ee,{ref:this.setListView,dataLength:this.getRowStates().length,itemHeightGetter:this.getRowHeight,itemRenderer:this.renderRow,viewBuffer:50,viewBufferMin:50,itemsWrapperClassName:e.rowsWrapper,getKeyFromIndex:this.getKeyFromIndex,getIndexFromKey:this.getIndexFromKey,windowScroller:!1,scrollElement:t})})}}const qn=(0,g.withTheme2)(Un);var Zn=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/index.js"),Xn=n.n(Zn);const Yn={scrollPageDown:{binding:"s",label:"Scroll down"},scrollPageUp:{binding:"w",label:"Scroll up"},scrollToNextVisibleSpan:{binding:"f",label:"Scroll to the next visible span"},scrollToPrevVisibleSpan:{binding:"b",label:"Scroll to the previous visible span"},panLeft:{binding:["a","left"],label:"Pan left"},panLeftFast:{binding:["shift+a","shift+left"],label:"Pan left — Large"},panRight:{binding:["d","right"],label:"Pan right"},panRightFast:{binding:["shift+d","shift+right"],label:"Pan right — Large"},zoomIn:{binding:"up",label:"Zoom in"},zoomInFast:{binding:"shift+up",label:"Zoom in — Large"},zoomOut:{binding:"down",label:"Zoom out"},zoomOutFast:{binding:"shift+down",label:"Zoom out — Large"},collapseAll:{binding:"]",label:"Collapse All"},expandAll:{binding:"[",label:"Expand All"},collapseOne:{binding:"p",label:"Collapse One Level"},expandOne:{binding:"o",label:"Expand One Level"},searchSpans:{binding:"ctrl+b",label:"Search Spans"},clearSearch:{binding:"escape",label:"Clear Search"}};let Jn;function Qn(){if(Jn)return Jn;const e=new(Xn())(document.body);return Jn=e,e}const er=["setSpanNameColumnWidth","updateNextViewRangeTime","updateViewRangeTime","viewRange","createLinkToExternalSpan","traceTimeline","theme"];function tr(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const nr=(0,g.stylesFactory)((e=>({TraceTimelineViewer:m`
      label: TraceTimelineViewer;
      border-bottom: 1px solid ${ee(e,"#bbb")};

      & .json-markup {
        line-height: 17px;
        font-size: 13px;
        font-family: monospace;
        white-space: pre-wrap;
      }

      & .json-markup-key {
        font-weight: bold;
      }

      & .json-markup-bool {
        color: ${ee(e,"firebrick")};
      }

      & .json-markup-string {
        color: ${ee(e,"teal")};
      }

      & .json-markup-null {
        color: ${ee(e,"teal")};
      }

      & .json-markup-number {
        color: ${ee(e,"blue","black")};
      }
    `})));class rr extends r.PureComponent{constructor(e){super(e),tr(this,"collapseAll",(()=>{this.props.collapseAll(this.props.trace.spans)})),tr(this,"collapseOne",(()=>{this.props.collapseOne(this.props.trace.spans)})),tr(this,"expandAll",(()=>{this.props.expandAll()})),tr(this,"expandOne",(()=>{this.props.expandOne(this.props.trace.spans)})),this.state={height:0}}componentDidMount(){!function(e){const t=Qn();Object.keys(e).forEach((n=>{const r=e[n];r&&t.bind(Yn[n].binding,r)}))}({collapseAll:this.collapseAll,expandAll:this.expandAll,collapseOne:this.collapseOne,expandOne:this.expandOne})}render(){const e=this.props,{setSpanNameColumnWidth:t,updateNextViewRangeTime:n,updateViewRangeTime:r,viewRange:s,createLinkToExternalSpan:a,traceTimeline:i,theme:o}=e,l=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,er),{trace:c}=l,d=nr(o);return(0,y.jsx)(it.Provider,{value:a,children:(0,y.jsxs)("div",{className:d.TraceTimelineViewer,ref:e=>e&&this.setState({height:e.getBoundingClientRect().height}),children:[(0,y.jsx)(Ie,{duration:c.duration,nameColumnWidth:i.spanNameColumnWidth,numTicks:5,onCollapseAll:this.collapseAll,onCollapseOne:this.collapseOne,onColummWidthChange:t,onExpandAll:this.expandAll,onExpandOne:this.expandOne,viewRangeTime:s.time,updateNextViewRangeTime:n,updateViewRangeTime:r,columnResizeHandleHeight:this.state.height}),(0,y.jsx)(qn,Object.assign({},l,i,{setSpanNameColumnWidth:t,currentViewRangeTime:s.time.current}))]})})}}const sr=(0,g.withTheme2)(rr);var ar=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/md/keyboard-arrow-right.js"),ir=n.n(ar),or=n("./packages/grafana-data/src/index.ts");function lr(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const cr=(0,g.stylesFactory)((e=>({CanvasSpanGraph:m`
      label: CanvasSpanGraph;
      background: ${ee(e,"#fafafa")};
      height: 60px;
      position: absolute;
      width: 100%;
    `})));class dr extends r.PureComponent{constructor(e){super(e),lr(this,"_canvasElm",void 0),lr(this,"getColor",(e=>function(e,t){return zn(g.colors).getRgbColorByKey(e)}(e,this.props.theme))),lr(this,"_setCanvasRef",(e=>{this._canvasElm=e})),this._canvasElm=void 0}componentDidMount(){this._draw()}componentDidUpdate(){this._draw()}_draw(){if(this._canvasElm){const{valueWidth:e,items:t}=this.props;!function(e,t,n,r,s){const a=new Map,i=t.length<60?60:Math.min(t.length,200),o=2*window.innerWidth;e.width=o,e.height=i;const l=Math.min(6,Math.max(2,i/t.length)),c=i/t.length,d=e.getContext("2d",{alpha:!1});d.fillStyle=s,d.fillRect(0,0,o,i);for(let e=0;e<t.length;e++){const{valueWidth:s,valueOffset:i,serviceName:p}=t[e],u=i/n*o;let h=s/n*o;h<10&&(h=10);let m=a.get(p);m||(m=`rgba(${r(p).concat(.8).join()})`,a.set(p,m)),d.fillStyle=m,d.fillRect(u,e*c,h,l)}}(this._canvasElm,t,e,this.getColor,ee(this.props.theme,"#fff"))}}render(){return(0,y.jsx)("canvas",{className:cr(this.props.theme).CanvasSpanGraph,ref:this._setCanvasRef})}}const pr=(0,g.withTheme2)(dr),ur=()=>({TickLabels:m`
      label: TickLabels;
      height: 1rem;
      position: relative;
    `,TickLabelsLabel:m`
      label: TickLabelsLabel;
      color: #717171;
      font-size: 0.7rem;
      position: absolute;
      user-select: none;
    `});function hr(e){const{numTicks:t,duration:n}=e,r=(0,g.useStyles2)(ur),s=[];for(let e=0;e<t+1;e++){const a=e/t,i=1===a?{right:"0%"}:{left:100*a+"%"};s.push((0,y.jsx)("div",{className:r.TickLabelsLabel,style:i,"data-test":"tick",children:W(n*a)},a))}return(0,y.jsx)("div",{className:r.TickLabels,children:s})}const mr=()=>({GraphTick:m`
      label: GraphTick;
      stroke: #aaa;
      stroke-width: 1px;
    `});function gr(e){const{numTicks:t}=e,n=(0,g.useStyles2)(mr),r=[];for(let e=1;e<t;e++){const s=e/t*100+"%";r.push((0,y.jsx)("line",{className:n.GraphTick,x1:s,y1:"0%",x2:s,y2:"100%"},e/t))}return(0,y.jsx)("g",{"data-test":"ticks","aria-hidden":"true",children:r})}const fr=()=>({ScrubberHandleExpansion:b()(m`
        label: ScrubberHandleExpansion;
        cursor: col-resize;
        fill-opacity: 0;
        fill: #44f;
      `,"scrubber-handle-expansion"),ScrubberHandle:b()(m`
        label: ScrubberHandle;
        cursor: col-resize;
        fill: #555;
      `,"scrubber-handle"),ScrubberLine:b()(m`
        label: ScrubberLine;
        pointer-events: none;
        stroke: #555;
      `,"scrubber-line"),ScrubberDragging:m`
      label: ScrubberDragging;
      & .scrubber-handle-expansion {
        fill-opacity: 1;
      }
      & .scrubber-handle {
        fill: #44f;
      }
      & > .scrubber-line {
        stroke: #44f;
      }
    `,ScrubberHandles:m`
      label: ScrubberHandles;
      &:hover > .scrubber-handle-expansion {
        fill-opacity: 1;
      }
      &:hover > .scrubber-handle {
        fill: #44f;
      }
      &:hover + .scrubber.line {
        stroke: #44f;
      }
    `});function br(e){let{isDragging:t,onMouseDown:n,onMouseEnter:r,onMouseLeave:s,position:a}=e;const i=100*a+"%",o=(0,g.useStyles2)(fr),l=b()({[o.ScrubberDragging]:t});return(0,y.jsxs)("g",{className:l,children:[(0,y.jsxs)("g",{className:o.ScrubberHandles,onMouseDown:n,onMouseEnter:r,onMouseLeave:s,children:[(0,y.jsx)("rect",{x:i,className:o.ScrubberHandleExpansion,style:{transform:"translate(-4.5px)"},width:"9",height:"20"}),(0,y.jsx)("rect",{x:i,className:o.ScrubberHandle,style:{transform:"translate(-1.5px)"},width:"3",height:"20"})]}),(0,y.jsx)("line",{className:o.ScrubberLine,y2:"100%",x1:i,x2:i})]})}function yr(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}const vr=(0,g.stylesFactory)((e=>{const t="JaegerUiComponents__ViewingLayerResetZoomHoverClassName",n=m`
    label: ViewingLayerResetZoom;
    display: none;
    position: absolute;
    right: 1%;
    top: 10%;
    z-index: 1;
  `;return{ViewingLayer:m`
      label: ViewingLayer;
      cursor: vertical-text;
      position: relative;
      z-index: 1;
      &:hover > .${t} {
        display: unset;
      }
    `,ViewingLayerGraph:m`
      label: ViewingLayerGraph;
      border: 1px solid ${ee(e,"#999")};
      /* need !important here to overcome something from semantic UI */
      overflow: visible !important;
      position: relative;
      transform-origin: 0 0;
      width: 100%;
    `,ViewingLayerInactive:m`
      label: ViewingLayerInactive;
      fill: ${ee(e,"rgba(214, 214, 214, 0.5)")};
    `,ViewingLayerCursorGuide:m`
      label: ViewingLayerCursorGuide;
      stroke: ${ee(e,"#f44")};
      stroke-width: 1;
    `,ViewingLayerDraggedShift:m`
      label: ViewingLayerDraggedShift;
      fill-opacity: 0.2;
    `,ViewingLayerDrag:m`
      label: ViewingLayerDrag;
      fill: ${ee(e,"#44f")};
    `,ViewingLayerFullOverlay:m`
      label: ViewingLayerFullOverlay;
      bottom: 0;
      cursor: col-resize;
      left: 0;
      position: fixed;
      right: 0;
      top: 0;
      user-select: none;
    `,ViewingLayerResetZoom:n,ViewingLayerResetZoomHoverClassName:t}})),xr="SHIFT_END",wr="SHIFT_START",_r="REFRAME";class kr extends r.PureComponent{constructor(e){super(e),yr(this,"state",void 0),yr(this,"_root",void 0),yr(this,"_draggerReframe",void 0),yr(this,"_draggerStart",void 0),yr(this,"_draggerEnd",void 0),yr(this,"_setRoot",(e=>{this._root=e})),yr(this,"_getDraggingBounds",(e=>{if(!this._root)throw new Error("invalid state");const{left:t,width:n}=this._root.getBoundingClientRect(),[r,s]=this.props.viewRange.time.current;let a=1,i=0;return e===wr?a=s:e===xr&&(i=r),{clientXLeft:t,maxValue:a,minValue:i,width:n}})),yr(this,"_handleReframeMouseMove",(e=>{let{value:t}=e;this.props.updateNextViewRangeTime({cursor:t})})),yr(this,"_handleReframeMouseLeave",(()=>{this.props.updateNextViewRangeTime({cursor:null})})),yr(this,"_handleReframeDragUpdate",(e=>{let{value:t}=e;const n=t,{time:r}=this.props.viewRange,s={reframe:{anchor:r.reframe?r.reframe.anchor:n,shift:n}};this.props.updateNextViewRangeTime(s)})),yr(this,"_handleReframeDragEnd",(e=>{let{manager:t,value:n}=e;const{time:r}=this.props.viewRange,s=r.reframe?r.reframe.anchor:n,[a,i]=n<s?[n,s]:[s,n];t.resetBounds(),this.props.updateViewRangeTime(a,i,"minimap")})),yr(this,"_handleScrubberEnterLeave",(e=>{let{type:t}=e;const n=t===_.MouseEnter;this.setState({preventCursorLine:n})})),yr(this,"_handleScrubberDragUpdate",(e=>{let{event:t,tag:n,type:r,value:s}=e;r===_.DragStart&&t.stopPropagation(),n===wr?this.props.updateNextViewRangeTime({shiftStart:s}):n===xr&&this.props.updateNextViewRangeTime({shiftEnd:s})})),yr(this,"_handleScrubberDragEnd",(e=>{let{manager:t,tag:n,value:r}=e;const[s,a]=this.props.viewRange.time.current;let i;if(n===wr)i=[r,a];else{if(n!==xr)throw new Error("bad state");i=[s,r]}t.resetBounds(),this.setState({preventCursorLine:!1}),this.props.updateViewRangeTime(i[0],i[1],"minimap")})),yr(this,"_resetTimeZoomClickHandler",(()=>{this.props.updateViewRangeTime(0,1)})),this._draggerReframe=new I({getBounds:this._getDraggingBounds,onDragEnd:this._handleReframeDragEnd,onDragMove:this._handleReframeDragUpdate,onDragStart:this._handleReframeDragUpdate,onMouseMove:this._handleReframeMouseMove,onMouseLeave:this._handleReframeMouseLeave,tag:_r}),this._draggerStart=new I({getBounds:this._getDraggingBounds,onDragEnd:this._handleScrubberDragEnd,onDragMove:this._handleScrubberDragUpdate,onDragStart:this._handleScrubberDragUpdate,onMouseEnter:this._handleScrubberEnterLeave,onMouseLeave:this._handleScrubberEnterLeave,tag:wr}),this._draggerEnd=new I({getBounds:this._getDraggingBounds,onDragEnd:this._handleScrubberDragEnd,onDragMove:this._handleScrubberDragUpdate,onDragStart:this._handleScrubberDragUpdate,onMouseEnter:this._handleScrubberEnterLeave,onMouseLeave:this._handleScrubberEnterLeave,tag:xr}),this._root=void 0,this.state={preventCursorLine:!1}}componentWillUnmount(){this._draggerReframe.dispose(),this._draggerEnd.dispose(),this._draggerStart.dispose()}_getMarkers(e,t){const n=vr(this.props.theme),r=function(e,t){const[n,r]=e<t?[e,t]:[t,e];return{x:100*n+"%",width:100*(r-n)+"%",leadingX:100*t+"%"}}(e,t);return[(0,y.jsx)("rect",{className:b()(n.ViewingLayerDraggedShift,n.ViewingLayerDrag),x:r.x,y:"0",width:r.width,height:this.props.height-2},"fill"),(0,y.jsx)("rect",{className:b()(n.ViewingLayerDrag),x:r.leadingX,y:"0",width:"1",height:this.props.height-2},"edge")]}render(){const{height:e,viewRange:t,numTicks:n,theme:r}=this.props,{preventCursorLine:s}=this.state,{current:a,cursor:i,shiftStart:o,shiftEnd:l,reframe:c}=t.time,d=null!=o||null!=l||null!=c,[p,u]=a;let h=0;p&&(h=100*p);let m,g=100;u&&(g=100-100*u),d||null==i||s||(m=100*i+"%");const f=vr(r);return(0,y.jsxs)("div",{"aria-hidden":!0,className:f.ViewingLayer,style:{height:e},children:[(0!==p||1!==u)&&(0,y.jsx)(Je,{onClick:this._resetTimeZoomClickHandler,className:b()(f.ViewingLayerResetZoom,f.ViewingLayerResetZoomHoverClassName),htmlType:"button",children:"Reset Selection"}),(0,y.jsxs)("svg",{height:e,className:f.ViewingLayerGraph,ref:this._setRoot,onMouseDown:this._draggerReframe.handleMouseDown,onMouseLeave:this._draggerReframe.handleMouseLeave,onMouseMove:this._draggerReframe.handleMouseMove,children:[h>0&&(0,y.jsx)("rect",{x:0,y:0,height:"100%",width:`${h}%`,className:f.ViewingLayerInactive}),g>0&&(0,y.jsx)("rect",{x:100-g+"%",y:0,height:"100%",width:`${g}%`,className:f.ViewingLayerInactive}),(0,y.jsx)(gr,{numTicks:n}),m&&(0,y.jsx)("line",{className:f.ViewingLayerCursorGuide,x1:m,y1:"0",x2:m,y2:e-2,strokeWidth:"1"}),null!=o&&this._getMarkers(p,o),null!=l&&this._getMarkers(u,l),(0,y.jsx)(br,{isDragging:null!=o,onMouseDown:this._draggerStart.handleMouseDown,onMouseEnter:this._draggerStart.handleMouseEnter,onMouseLeave:this._draggerStart.handleMouseLeave,position:p||0}),(0,y.jsx)(br,{isDragging:null!=l,position:u||1,onMouseDown:this._draggerEnd.handleMouseDown,onMouseEnter:this._draggerEnd.handleMouseEnter,onMouseLeave:this._draggerEnd.handleMouseLeave}),null!=c&&this._getMarkers(c.anchor,c.shift)]}),d&&(0,y.jsx)("div",{className:f.ViewingLayerFullOverlay})]})}}const jr=(0,g.withTheme2)(kr);var Tr;function Ir(e){return{valueOffset:e.relativeStartTime,valueWidth:e.duration,serviceName:e.process.serviceName}}const Sr=(0,Se.Z)((function(e){return e.spans.map(Ir)}));class Dr extends r.PureComponent{render(){const{height:e,trace:t,viewRange:n,updateNextViewRangeTime:r,updateViewRangeTime:s}=this.props;if(!t)return Tr||(Tr=(0,y.jsx)("div",{}));const a=Sr(t);return(0,y.jsxs)("div",{className:b()(le,oe),children:[(0,y.jsx)(hr,{numTicks:4,duration:t.duration}),(0,y.jsxs)("div",{className:re,children:[(0,y.jsx)(pr,{valueWidth:t.duration,items:a}),(0,y.jsx)(jr,{viewRange:n,numTicks:4,height:e||60,updateViewRangeTime:s,updateNextViewRangeTime:r})]})]})}}!function(e,t,n){t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n}(Dr,"defaultProps",{height:60});var Cr=n("./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/android-locate.js"),Nr=n.n(Cr);function Lr(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class Er extends r.PureComponent{constructor(){super(...arguments),Lr(this,"clearUiFind",(()=>{this.props.onChange("")}))}render(){const{allowClear:e,inputProps:t,value:n}=this.props,r=(0,y.jsxs)(y.Fragment,{children:[e&&n&&n.length&&(0,y.jsx)(qe,{type:"close",onClick:this.clearUiFind}),t.suffix]});return(0,y.jsx)(et,Object.assign({autosize:null,placeholder:"Find..."},t,{onChange:e=>this.props.onChange(e.target.value),suffix:r,value:n}))}}var Or;Lr(Er,"defaultProps",{inputProps:{},trackFindFunction:void 0,value:void 0});const Mr=()=>({TracePageSearchBar:m`
      label: TracePageSearchBar;
    `,TracePageSearchBarBar:m`
      label: TracePageSearchBarBar;
      max-width: 20rem;
      transition: max-width 0.5s;
      &:focus-within {
        max-width: 100%;
      }
    `,TracePageSearchBarCount:m`
      label: TracePageSearchBarCount;
      opacity: 0.6;
    `,TracePageSearchBarBtn:m`
      label: TracePageSearchBarBtn;
      border-left: none;
      transition: 0.2s;
    `,TracePageSearchBarBtnDisabled:m`
      label: TracePageSearchBarBtnDisabled;
      opacity: 0.5;
    `,TracePageSearchBarLocateBtn:m`
      label: TracePageSearchBarLocateBtn;
      padding: 1px 8px 4px;
    `}),Rr=(0,r.memo)((function(e){const{clearSearch:t,focusUiFindMatches:n,navigable:r,nextResult:s,prevResult:a,resultCount:i,textFilter:o,onSearchValueChange:l,searchValue:c,hideSearchButtons:d}=e,p=(0,g.useStyles2)(Mr),u=o?(0,y.jsx)("span",{className:p.TracePageSearchBarCount,children:i}):null,h=b()(p.TracePageSearchBarBtn,{[p.TracePageSearchBarBtnDisabled]:!o}),m={"data-test":"in-trace-search",className:b()(p.TracePageSearchBarBar,pe),name:"search",suffix:u};return(0,y.jsx)("div",{className:p.TracePageSearchBar,children:(0,y.jsxs)(tt,{className:ye,compact:!0,style:{display:"flex"},children:[(0,y.jsx)(Er,{onChange:l,value:c,inputProps:m}),!d&&(0,y.jsxs)(y.Fragment,{children:[r&&(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(Je,{className:b()(h,p.TracePageSearchBarLocateBtn),disabled:!o,htmlType:"button",onClick:n,children:Or||(Or=(0,y.jsx)(Nr(),{}))}),(0,y.jsx)(Je,{className:h,disabled:!o,htmlType:"button",icon:"up",onClick:a}),(0,y.jsx)(Je,{className:h,disabled:!o,htmlType:"button",icon:"down",onClick:s})]}),(0,y.jsx)(Je,{className:h,disabled:!o,htmlType:"button",icon:"close",onClick:t})]})]})})})),Pr=()=>({BreakableText:m`
      label: BreakableText;
      display: inline-block;
      white-space: pre;
    `}),zr=/\W*\w+\W*/g;function $r(e){const{className:t,text:n,wordRegexp:r=zr}=e,s=(0,g.useStyles2)(Pr);if(!n)return"string"==typeof n?n:null;const a=[];r.exec("");let i=r.exec(n)||[n];for(;i;)a.push((0,y.jsx)("span",{className:t||s.BreakableText,children:i[0]},`${n}-${a.length}`)),i=r.exec(n);return a}$r.defaultProps={wordRegexp:zr};const Hr=["centered","className","small"];const Vr=()=>{const e=h`
    /*
    rgb(0, 128, 128) == teal
    rgba(0, 128, 128, 0.3) == #bedfdf
    */
    from {
      color: #bedfdf;
    }
    to {
      color: teal;
    }
  `;return{LoadingIndicator:m`
      label: LoadingIndicator;
      animation: ${e} 1s infinite alternate;
      font-size: 36px;
      /* outline / stroke the loading indicator */
      text-shadow: -0.5px 0 rgba(0, 128, 128, 0.6), 0 0.5px rgba(0, 128, 128, 0.6), 0.5px 0 rgba(0, 128, 128, 0.6),
        0 -0.5px rgba(0, 128, 128, 0.6);
    `,LoadingIndicatorCentered:m`
      label: LoadingIndicatorCentered;
      display: block;
      margin-left: auto;
      margin-right: auto;
    `,LoadingIndicatorSmall:m`
      label: LoadingIndicatorSmall;
      font-size: 0.7em;
    `}};function Fr(e){const{centered:t,className:n,small:r}=e,s=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,Hr),a=(0,g.useStyles2)(Vr),i=b()(a.LoadingIndicator,{[a.LoadingIndicatorCentered]:t,[a.LoadingIndicatorSmall]:r,className:n});return(0,y.jsx)(qe,Object.assign({type:"loading",className:i},s))}Fr.defaultProps={centered:!1,className:void 0,small:!1};const Br="<trace-without-root-span>",Ar="FETCH_ERROR",Gr="FETCH_LOADING";var Wr;const Kr=e=>({TraceName:m`
      label: TraceName;
      font-size: ${e.typography.size.lg};
    `,TraceNameError:m`
      label: TraceNameError;
      color: #c00;
    `});function Ur(e){const{className:t,error:n,state:r,traceName:s}=e,a=r===Ar;let i=s||Br;const o=(0,g.useStyles2)(Kr);let l="";if(a){l=o.TraceNameError;let e="";n&&(e="string"==typeof n?n:n.message||String(n)),e||(e="Error: Unknown error"),i=e,i=(0,y.jsx)($r,{text:e})}else if(r===Gr)i=Wr||(Wr=(0,y.jsx)(Fr,{small:!0}));else{const e=String(s||Br);i=(0,y.jsx)($r,{text:e})}return(0,y.jsx)("span",{className:b()(o.TraceName,l,t),children:i})}const qr=(0,k.memoize)((function(e){let t;const n=new Set(e.map((e=>{let{spanID:t}=e;return t})));for(let r=0;r<e.length;r++){if(e[r].references&&e[r].references.some((t=>{let{traceID:s,spanID:a}=t;return s===e[r].traceID&&n.has(a)})))continue;if(!t){t=e[r];continue}const s=e[r].references&&e[r].references.length||0,a=t.references&&t.references.length||0;(s<a||s===a&&e[r].startTime<t.startTime)&&(t=e[r])}return t?`${t.process.serviceName}: ${t.operationName}`:""}),(e=>e.length?e[0].traceID:0));var Zr=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)};function Xr(e,t){return 1===e?function(e){var t;return{get:function(n){if(t&&e(n,t.key))return t.value},put:function(e,n){t={key:e,value:n}}}}(t):function(e,t){var n=[];function r(e){var r=function(e,t){for(var n=0;n<e.length;n++)if(t(e[n]))return n;return-1}(n,(function(n){return t(e,n.key)}));if(r>-1){var s=n[r];return r>0&&(n.splice(r,1),n.unshift(s)),s.value}}return{get:r,put:function(t,s){r(t)||(n.unshift({key:t,value:s}),n.length>e&&n.pop())}}}(e,t)}function Yr(e,t){var n=t?function(e,t){return function n(r,s){if(e(r,s))return!0;if(Array.isArray(r))return!(!Array.isArray(s)||r.length!==s.length||!r.every((function(e,t){return n(e,s[t])})));if(Array.isArray(s))return!1;if("object"==typeof r){if("object"!=typeof s)return!1;var a=null===r,i=null===s;if(a||i)return a===i;var o=Object.keys(r),l=Object.keys(s);if(o.length!==l.length)return!1;var c=t?n:e;return!!o.every((function(e){return Zr(r,e)&&Zr(s,e)&&c(r[e],s[e])}))}return!1}}(e,t):e;return function(e,t){if(e.length!==t.length)return!1;for(var r=0;r<e.length;r+=1)if(!n(e[r],t[r]))return!1;return!0}}const Jr=function(){for(var e=1,t=function(e,t){return e===t},n=!1,r=arguments.length,s=new Array(r),a=0;a<r;a++)s[a]=arguments[a];"number"==typeof s[0]&&(e=s.shift()),"function"==typeof s[0]?t=s.shift():void 0===s[0]&&s.shift(),"boolean"==typeof s[0]&&(n=s[0]);var i=Xr(e,Yr(t,n));return function(e){return function(){for(var t=arguments.length,n=new Array(t),r=0;r<t;r++)n[r]=arguments[r];var s=i.get(n);return void 0===s&&(s=e.apply(e,n),i.put(n,s)),s}}};var Qr=n("./.yarn/cache/deep-freeze-npm-0.0.1-12d684fc1a-1e43c98e44.zip/node_modules/deep-freeze/index.js");const es=n.n(Qr)()(Object.defineProperty({archiveEnabled:!1,dependencies:{dagMaxNumServices:100,menuEnabled:!0},linkPatterns:[],menu:[{label:"About Jaeger",items:[{label:"GitHub",url:"https://github.com/uber/jaeger"},{label:"Docs",url:"http://jaeger.readthedocs.io/en/latest/"},{label:"Twitter",url:"https://twitter.com/JaegerTracing"},{label:"Discussion Group",url:"https://groups.google.com/forum/#!forum/jaeger-tracing"},{label:"Gitter.im",url:"https://gitter.im/jaegertracing/Lobby"},{label:"Blog",url:"https://medium.com/jaegertracing/"}]}],search:{maxLookback:{label:"2 Days",value:"2d"},maxLimit:1500},tracking:{gaID:null,trackErrors:!0}},"__mergeFields",{value:["dependencies","search","tracking"]}));function ts(e){return(0,k.get)(es,e)}function ns(e){const t=e.references?e.references.find((e=>"CHILD_OF"===e.refType)):null;return t?t.span:null}const rs=/#\{([^{}]*)\}/g;function ss(e){const t=new Set;return e.replace(rs,((e,n)=>(t.add(n),e))),Array.from(t)}function as(e,t,n){return e.replace(rs,((e,r)=>{const s=n[r];return null==s?"":t(s)}))}function is(e,t){if("string"!=typeof e)throw new Error("Invalid template");return{parameters:ss(e),template:as.bind(null,e,t)}}function os(e){if("string"==typeof e)return t=>t===e;if(Array.isArray(e))return t=>e.indexOf(t)>-1;if(null==e)return()=>!0;throw new Error(`Invalid value: ${e}`)}const ls=e=>e;function cs(e,t){if(t)return t.find((t=>t.key===e))}function ds(e,t){return e.template(t)}function ps(e,t,n,r){const s=n[r];let a="logs";const i=t.process.tags===n;i&&(a="process");t.tags===n&&(a="tags");const o=[];return e.forEach((e=>{if(e.type(a)&&e.key(s.key)&&e.value(s.value)){const r={},l=e.parameters.every((o=>{let l=cs(o,n);return l||i||(l=function(e,t){let n=t;for(;n;){const t=cs(e,n.tags)||cs(e,n.process.tags);if(t)return t;n=ns(n)}}(o,t)),l?(r[o]=l.value,!0):(console.warn(`Skipping link pattern, missing parameter ${o} for key ${s.key} in ${a}.`,e.object),!1)}));l&&o.push({url:ds(e.url,r),text:ds(e.text,r)})}})),o}const us=(ts("linkPatterns")||[]).map((function(e){try{const t=is(e.url,encodeURIComponent),n=is(e.text,ls);return{object:e,type:os(e.type),key:os(e.key),value:os(e.value),url:t,text:n,parameters:(0,k.uniq)(t.parameters.concat(n.parameters))}}catch(t){return console.error(`Ignoring invalid link pattern: ${t}`,e),null}})).filter(Boolean),hs=Jr(10)((e=>{const t=[];return e?function(e,t){const n=[],r=Object.keys(t).filter((e=>"string"==typeof t[e]||"number"===t[e]));return e.filter((e=>e.type("traces"))).forEach((e=>{const s={},a=e.parameters.every((e=>{const n=e;return!!r.includes(n)&&(s[e]=t[n],!0)}));a&&n.push({url:ds(e.url,s),text:ds(e.text,s)})})),n}(us,e):t}));new WeakMap;var ms,gs;const fs=e=>(0,y.jsxs)("a",{href:e.href,title:e.title,target:"_blank",rel:"noopener noreferrer",className:e.className,children:[e.children," ",ms||(ms=(0,y.jsx)(We,{}))]}),bs=e=>(0,y.jsx)(Xe,{children:e.map(((e,t)=>{let{text:n,url:r}=e;return(0,y.jsx)(Ye,{children:(0,y.jsx)(fs,{href:r,children:n})},`${r}-${t}`)}))});function ys(e){const{links:t}=e;return 1===t.length?(0,y.jsx)(fs,{href:t[0].url,title:t[0].text,className:e.className}):(0,y.jsx)(Ze,{overlay:bs(t),placement:"bottomRight",trigger:["click"],children:(0,y.jsx)("a",{className:e.className,children:gs||(gs=(0,y.jsx)(We,{isLarge:!0}))})})}const vs=["renderer"];const xs=e=>({TracePageHeader:m`
      label: TracePageHeader;
      & > :first-child {
        border-bottom: 1px solid ${ee(e,"#e8e8e8")};
      }
      & > :nth-child(2) {
        background-color: ${ee(e,"#eee")};
        border-bottom: 1px solid ${ee(e,"#e4e4e4")};
      }
      & > :last-child {
        border-bottom: 1px solid ${ee(e,"#ccc")};
      }
    `,TracePageHeaderTitleRow:m`
      label: TracePageHeaderTitleRow;
      align-items: center;
      display: flex;
    `,TracePageHeaderBack:m`
      label: TracePageHeaderBack;
      align-items: center;
      align-self: stretch;
      background-color: #fafafa;
      border-bottom: 1px solid #ddd;
      border-right: 1px solid #ddd;
      color: inherit;
      display: flex;
      font-size: 1.4rem;
      padding: 0 1rem;
      margin-bottom: -1px;
      &:hover {
        background-color: #f0f0f0;
        border-color: #ccc;
      }
    `,TracePageHeaderTitleLink:m`
      label: TracePageHeaderTitleLink;
      align-items: center;
      display: flex;
      flex: 1;

      &:hover * {
        text-decoration: underline;
      }
      &:hover > *,
      &:hover small {
        text-decoration: none;
      }
    `,TracePageHeaderDetailToggle:m`
      label: TracePageHeaderDetailToggle;
      font-size: 2.5rem;
      transition: transform 0.07s ease-out;
    `,TracePageHeaderDetailToggleExpanded:m`
      label: TracePageHeaderDetailToggleExpanded;
      transform: rotate(90deg);
    `,TracePageHeaderTitle:m`
      label: TracePageHeaderTitle;
      color: inherit;
      flex: 1;
      font-size: 1.7em;
      line-height: 1em;
      margin: 0 0 0 0.5em;
      padding-bottom: 0.5em;
    `,TracePageHeaderTitleCollapsible:m`
      label: TracePageHeaderTitleCollapsible;
      margin-left: 0;
    `,TracePageHeaderOverviewItems:m`
      label: TracePageHeaderOverviewItems;
      border-bottom: 1px solid #e4e4e4;
      padding: 0.25rem 0.5rem !important;
    `,TracePageHeaderOverviewItemValueDetail:b()(m`
        label: TracePageHeaderOverviewItemValueDetail;
        color: #aaa;
      `,"trace-item-value-detail"),TracePageHeaderOverviewItemValue:m`
      label: TracePageHeaderOverviewItemValue;
      &:hover > .trace-item-value-detail {
        color: unset;
      }
    `,TracePageHeaderArchiveIcon:m`
      label: TracePageHeaderArchiveIcon;
      font-size: 1.78em;
      margin-right: 0.15em;
    `,TracePageHeaderTraceId:m`
      label: TracePageHeaderTraceId;
      white-space: nowrap;
    `}),ws=[{key:"timestamp",label:"Trace Start",renderer(e,t,n){const r=(0,or.dateTimeFormat)(e.startTime/1e3,{timeZone:t,defaultWithMS:!0}),s=r.match(/^(.+)(:\d\d\.\d+)$/);return s?(0,y.jsxs)("span",{className:n.TracePageHeaderOverviewItemValue,children:[s[1],(0,y.jsx)("span",{className:n.TracePageHeaderOverviewItemValueDetail,children:s[2]})]}):r}},{key:"duration",label:"Duration",renderer:e=>W(e.duration)},{key:"service-count",label:"Services",renderer:e=>new Set((0,k.values)(e.processes).map((e=>e.serviceName))).size},{key:"depth",label:"Depth",renderer:e=>(0,k.get)((0,k.maxBy)(e.spans,"depth"),"depth",0)+1},{key:"span-count",label:"Total Spans",renderer:e=>e.spans.length}];function _s(e){const{canCollapse:t,clearSearch:n,focusUiFindMatches:s,hideMap:a,hideSummary:i,nextResult:o,onSlimViewClicked:l,prevResult:c,resultCount:d,slimView:p,textFilter:u,trace:h,traceGraphView:m,updateNextViewRangeTime:f,updateViewRangeTime:v,viewRange:x,searchValue:w,onSearchValueChange:_,hideSearchButtons:k,timeZone:j}=e,T=(0,g.useStyles2)(xs),I=r.useMemo((()=>h?hs(h):[]),[h]);if(!h)return null;const S=!i&&!p&&ws.map((e=>{const{renderer:t}=e,n=function(e,t){if(null==e)return{};var n,r,s={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(s[n]=e[n]);return s}(e,vs);return Object.assign({},n,{value:t(h,j,T)})})),D=(0,y.jsxs)("h1",{className:b()(T.TracePageHeaderTitle,t&&T.TracePageHeaderTitleCollapsible),children:[(0,y.jsx)(Ur,{traceName:qr(h.spans)})," ",(0,y.jsx)("small",{className:b()(T.TracePageHeaderTraceId,be),children:h.traceID})]});return(0,y.jsxs)("header",{className:T.TracePageHeader,children:[(0,y.jsxs)("div",{className:T.TracePageHeaderTitleRow,children:[I&&I.length>0&&(0,y.jsx)(ys,{links:I,className:T.TracePageHeaderBack}),t?(0,y.jsxs)("a",{className:T.TracePageHeaderTitleLink,onClick:l,role:"switch","aria-checked":!p,children:[(0,y.jsx)(ir(),{className:b()(T.TracePageHeaderDetailToggle,!p&&T.TracePageHeaderDetailToggleExpanded)}),D]}):D,(0,y.jsx)(Rr,{clearSearch:n,focusUiFindMatches:s,nextResult:o,prevResult:c,resultCount:d,textFilter:u,navigable:!m,searchValue:w,onSearchValueChange:_,hideSearchButtons:k})]}),S&&(0,y.jsx)(vn,{className:T.TracePageHeaderOverviewItems,items:S}),!a&&!p&&(0,y.jsx)(Dr,{trace:h,viewRange:x,updateNextViewRangeTime:f,updateViewRangeTime:v})]})}function ks(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}class js{constructor(e){ks(this,"isTagsOpen",void 0),ks(this,"isProcessOpen",void 0),ks(this,"logs",void 0),ks(this,"isWarningsOpen",void 0),ks(this,"isStackTracesOpen",void 0),ks(this,"isReferencesOpen",void 0);const{isTagsOpen:t,isProcessOpen:n,isReferencesOpen:r,isWarningsOpen:s,isStackTracesOpen:a,logs:i}=e||{};this.isTagsOpen=Boolean(t),this.isProcessOpen=Boolean(n),this.isReferencesOpen=Boolean(r),this.isWarningsOpen=Boolean(s),this.isStackTracesOpen=Boolean(a),this.logs={isOpen:Boolean(i&&i.isOpen),openedItems:i&&i.openedItems?new Set(i.openedItems):new Set}}toggleTags(){const e=new js(this);return e.isTagsOpen=!this.isTagsOpen,e}toggleProcess(){const e=new js(this);return e.isProcessOpen=!this.isProcessOpen,e}toggleReferences(){const e=new js(this);return e.isReferencesOpen=!this.isReferencesOpen,e}toggleWarnings(){const e=new js(this);return e.isWarningsOpen=!this.isWarningsOpen,e}toggleStackTraces(){const e=new js(this);return e.isStackTracesOpen=!this.isStackTracesOpen,e}toggleLogs(){const e=new js(this);return e.logs.isOpen=!this.logs.isOpen,e}toggleLogItem(e){const t=new js(this);return t.logs.openedItems.has(e)?t.logs.openedItems.delete(e):t.logs.openedItems.add(e),t}}var Ts=n("./.yarn/cache/reselect-npm-4.1.5-bc046e41ae-54c13c1e79.zip/node_modules/reselect/es/index.js"),Is=n("./.yarn/cache/fuzzy-npm-0.1.3-a0dfe08bd0-acc09c6173.zip/node_modules/fuzzy/lib/fuzzy.js"),Ss=n.n(Is);const Ds=e=>e.serviceName,Cs=e=>e.spanID,Ns=e=>e.operationName,Ls=e=>e.duration,Es=e=>e.startTime,Os=e=>e.processID,Ms=(0,Ts.P1)((0,Ts.P1)((({span:e})=>e),(e=>e.references||[])),(({type:e})=>e),((e,t)=>e.find((e=>e.refType===t)))),Rs=((0,Ts.P1)((e=>Ms({span:e,type:"CHILD_OF"})),(e=>e?e.spanID:null)),(0,Ts.P1)((e=>{if(!e.process)throw new Error("\n      you must hydrate the spans with the processes, perhaps\n      using hydrateSpansWithProcesses(), before accessing a span's process\n    ");return e.process}),Ds)),Ps=((0,Ts.P1)((({spans:e})=>e),(({leftBound:e})=>e),(({rightBound:e})=>e),((e,t,n)=>e.filter((e=>Es(e)>=t&&Es(e)<=n)))),(0,Ts.P1)((({spans:e})=>e),(({text:e})=>e),((e,t)=>Ss().filter(t,e,{extract:e=>`${Rs(e)} ${Ns(e)}`}).map((({original:e})=>e))))),zs=(0,Ts.P1)(Ps,(e=>e.reduce(((e,t)=>({...e,[Cs(t)]:t})),{})));(0,Ts.P1)((({spans:e})=>e),zs,((e,t)=>e.map((e=>({...e,muted:!t[Cs(e)]})))));class $s{static iterFunction(e,t=0){return n=>e(n.value,n,t)}static searchFunction(e){return"function"==typeof e?e:(t,n)=>e instanceof $s?n===e:t===e}constructor(e,t=[]){this.value=e,this.children=t}get depth(){return this.children.reduce(((e,t)=>Math.max(t.depth+1,e)),1)}get size(){let e=0;return this.walk((()=>e++)),e}addChild(e){return this.children.push(e instanceof $s?e:new $s(e)),this}find(e){if($s.iterFunction($s.searchFunction(e))(this))return this;for(let t=0;t<this.children.length;t++){const n=this.children[t].find(e);if(n)return n}return null}getPath(e){const t=$s.iterFunction($s.searchFunction(e)),n=(e,r)=>{const s=r.concat([e]);if(t(e))return s;for(let t=0;t<e.children.length;t++){const r=e.children[t],a=n(r,s);if(a)return a}return null};return n(this,[])}walk(e,t=0){const n=[];let r=t;for(n.push({node:this,depth:r});n.length;){const{node:t,depth:s}=n.pop();e(t.value,t,s),r=s+1;let a=t.children.length-1;for(;a>=0;)n.push({node:t.children[a],depth:r}),a--}}}const Hs=e=>e.spans,Vs=e=>e.processes,Fs=(0,Ts.P1)((e=>e.span),(e=>e.processes),((e,t)=>({...e,process:t[Os(e)]}))),Bs=(0,Ts.P1)(Hs,(e=>e.reduce(((e,t)=>e.set(Cs(t),t)),new Map)));function As(e){const t=new Map(e.spans.map((e=>[e.spanID,new $s(e.spanID)]))),n=new Map(e.spans.map((e=>[e.spanID,e]))),r=new $s("__root__");e.spans.forEach((e=>{const n=t.get(e.spanID);if(Array.isArray(e.references)&&e.references.length){const{refType:s,spanID:a}=e.references[0];if("CHILD_OF"!==s&&"FOLLOWS_FROM"!==s)throw new Error(`Unrecognized ref type: ${s}`);(t.get(a)||r).children.push(n)}else r.children.push(n)}));const s=(e,t)=>{const r=n.get(e.value),s=n.get(t.value);return+(r.startTime>s.startTime)||+(r.startTime===s.startTime)-1};return e.spans.forEach((e=>{const n=t.get(e.spanID);n.children.length>1&&n.children.sort(s)})),r.children.sort(s),r}(0,Ts.P1)(Hs,(e=>e.length));const Gs=(0,Ts.P1)(Hs,(e=>e.reduce(((e,t)=>e?Math.min(e,Es(t)):Es(t)),null))),Ws=(0,Ts.P1)(Hs,Gs,((e,t)=>e.reduce(((e,n)=>e?Math.max(Es(n)-t+Ls(n),e):Ls(n)),null))),Ks=((0,Ts.P1)(Gs,Ws,((e,t)=>e+t)),(0,Ts.P1)(As,Bs,((e,t)=>e.children.map((e=>t.get(e.value))).sort(((e,t)=>{return n=Es(e),r=Es(t),n-r;var n,r}))[0]))),Us=((0,Ts.P1)(As,(e=>e.depth-1)),(0,Ts.P1)((0,Ts.P1)((e=>e.trace),As),(0,Ts.P1)((e=>e.span),Cs),((e,t)=>e.getPath(t).length-1)),(0,Ts.P1)(Vs,(e=>Object.keys(e).reduce(((t,n)=>t.add(Ds(e[n]))),new Set)))),qs=((0,Ts.P1)(Us,(e=>e.size)),{ms:function(e){const t=G(e,B,$);return`${z().duration(t/$).asMilliseconds()}ms`},s:function(e){const t=G(e,B,H);return`${z().duration(t/$).asSeconds()}s`}}),Zs=(0,Ts.P1)(Ws,(e=>e>=H?qs.s:qs.ms)),Xs=((0,Ts.P1)((({duration:e})=>e),(({unit:e})=>qs[e]),((e,t)=>t(e))),(0,Ts.P1)((({duration:e})=>e),(0,Ts.P1)((({trace:e})=>e),Zs),((e,t)=>t(e))),(0,Ts.P1)((({trace:e})=>e),(({spans:e})=>e),(({sort:e})=>e),((e,t,{dir:n,comparator:r,selector:s})=>[...t].sort(((t,a)=>n*r(s(t,e),s(a,e)))))),(0,Ts.P1)(As,(e=>{const t=new Map;let n=0;return e.walk((e=>t.set(e,n++))),t})));(0,Ts.P1)((0,Ts.P1)((e=>e.trace),As),(0,Ts.P1)((e=>e.span),Cs),((e,t)=>{const n=e.find(t);return n?n.size-1:-1})),(0,Ts.P1)((0,Ts.P1)((({trace:e})=>e),Xs),(({span:e})=>e),((e,t)=>e.get(Cs(t)))),(0,Ts.P1)((0,Ts.P1)((0,Ts.P1)((e=>{const t=Hs(e),n=Vs(e);return{...e,spans:t.map((e=>Fs({span:e,processes:n})))}}),Ks),(0,Ts.zB)({name:Ns,serviceName:Rs})),(({name:e,serviceName:t})=>`${t}: ${e}`)),(0,Ts.P1)((({spans:e})=>e),(0,Ts.P1)((({trace:e})=>e),As),(({collapsed:e})=>e),((e,t,n)=>{const r=n.reduce(((e,n)=>(t.find(n).walk((t=>t!==n&&e.add(t))),e)),new Set);return r.size>0?e.filter((e=>!r.has(Cs(e)))):e})),(0,Ts.P1)((({trace:e})=>e),(({interval:e=4})=>e),(({width:e=3})=>e),((e,t,n)=>[...Array(t+1).keys()].map((r=>({timestamp:Gs(e)+Ws(e)*(r/t),width:n}))))),(0,Ts.P1)((e=>e),Hs,((e,t)=>{const n=new Map;return{...e,spans:t.reduce(((e,t)=>{const r=n.has(Cs(t))?`${Cs(t)}_${n.get(Cs(t))}`:Cs(t),s={...t,spanID:r};return r!==Cs(t)&&console.warn("duplicate spanID in trace replaced",Cs(t),"new:",r),n.set(Cs(t),(n.get(Cs(t))||0)+1),e.concat([s])}),[])}})),(0,Ts.P1)((e=>e),Hs,((e,t)=>({...e,spans:t.filter((e=>!!Es(e)))})));function Ys(e){const t=new Map;return{tags:e.reduce(((e,n)=>(e.some((e=>e.key===n.key&&e.value===n.value))?t.set(`${n.key}:${n.value}`,`Duplicate tag "${n.key}:${n.value}"`):e.push(n),e)),[]),warnings:Array.from(t.values())}}function Js(e,t){const n=e.slice(),r=(t||[]).map((e=>e.toLowerCase()));return n.sort(((e,t)=>{const n=e.key.toLowerCase(),s=t.key.toLowerCase();for(let e=0;e<r.length;e++){const t=r[e];if(n.startsWith(t)&&!s.startsWith(t))return-1;if(!n.startsWith(t)&&s.startsWith(t))return 1}return n>s?1:n<s?-1:0})),n}function Qs(e){if(null==e||!e.traceID)return null;const t=e.traceID.toLowerCase();let n=0,r=Number.MAX_SAFE_INTEGER;const s=new Map,a=new Map;e.spans=e.spans.filter((e=>Boolean(e.startTime)));const i=e.spans.length;for(let t=0;t<i;t++){const i=e.spans[t],{startTime:o,duration:l,processID:c}=i;let d=i.spanID;o<r&&(r=o),o+l>n&&(n=o+l);const p=s.get(d);null!=p?(console.warn(`Dupe spanID, ${p+1} x ${d}`,i,a.get(d)),(0,k.isEqual)(i,a.get(d))&&console.warn("\t two spans with same ID have `isEqual(...) === true`"),s.set(d,p+1),d=`${d}_${p}`,i.spanID=d):s.set(d,1),i.process=e.processes[c],a.set(d,i)}const o=As(e),l=[],c={};o.walk((function(e,n){let s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:0;if("__root__"===e)return;const i=a.get(e);if(!i)return;const{serviceName:o}=i.process;c[o]=(c[o]||0)+1,i.relativeStartTime=i.startTime-r,i.depth=s-1,i.hasChildren=n.children.length>0,i.warnings=i.warnings||[],i.tags=i.tags||[],i.references=i.references||[];const d=Ys(i.tags);i.tags=Js(d.tags,ts("topTagPrefixes")),i.warnings=i.warnings.concat(d.warnings),i.references.forEach(((n,r)=>{const s=a.get(n.spanID);s&&(n.span=s,r>0&&(s.subsidiarilyReferencedBy=s.subsidiarilyReferencedBy||[],s.subsidiarilyReferencedBy.push({spanID:e,traceID:t,span:i,refType:n.refType})))})),l.push(i)}));const d=qr(l);return{services:Object.keys(c).map((e=>({name:e,numberOfSpans:c[e]}))),spans:l,traceID:t,traceName:d,processes:e.processes,duration:n-r,startTime:r,endTime:n}}function ea(e,t){if(!t)return null;const n=[],r=[];e.split(/\s+/).filter(Boolean).forEach((e=>{"-"===e[0]?r.push(e.substr(1).toLowerCase()):n.push(e.toLowerCase())}));const s=(e,t)=>e.some((e=>t.toLowerCase().includes(e))),a=e=>!!e&&e.some((e=>!s(r,e.key)&&(s(n,e.key)||s(n,e.value.toString()))));return new Set(t.filter((e=>s(n,e.operationName)||s(n,e.process.serviceName)||a(e.tags)||null!==e.logs&&e.logs.some((e=>a(e.fields)))||a(e.process.tags)||n.some((t=>t===e.spanID)))).map((e=>e.spanID)))}},"./public/app/core/utils/tracing.ts":(e,t,n)=>{"use strict";n.d(t,{et:()=>s,nO:()=>a,fy:()=>i,np:()=>l});var r=n("./packages/grafana-data/src/index.ts");function s(e){e.sort(((e,t)=>e[0]-t[0]));return e.reduce(((e,t)=>{if(!e.length)return[t];const n=e.slice(-1)[0],[r,s]=n,[a,i]=t;return i<s?e:a>s?[...e,t]:[...e.slice(0,-1),[r,i]]}),[]).reduce(((e,t)=>e+(t[1]-t[0])),0)}function a(e){const t={};let n;for(let r=0;n=e(r),n;r++){t[n.id]?t[n.id].span=n.span:t[n.id]={span:n.span,children:[]};for(const e of n.parentIds)e&&(t[e]?t[e].children.push(n.id):t[e]={span:void 0,children:[n.id]})}return t}function i(e,t,n){return{main:`${o(e)}ms (${o(e/t*100)}%)`,secondary:`${o(n)}ms (${o(n/e*100)}%)`}}function o(e){return parseFloat(e.toFixed(2))}function l(){return[new r.MutableDataFrame({fields:[{name:r.NodeGraphDataFrameFieldNames.id,type:r.FieldType.string},{name:r.NodeGraphDataFrameFieldNames.title,type:r.FieldType.string},{name:r.NodeGraphDataFrameFieldNames.subTitle,type:r.FieldType.string},{name:r.NodeGraphDataFrameFieldNames.mainStat,type:r.FieldType.string,config:{displayName:"Total time (% of trace)"}},{name:r.NodeGraphDataFrameFieldNames.secondaryStat,type:r.FieldType.string,config:{displayName:"Self time (% of total)"}},{name:r.NodeGraphDataFrameFieldNames.color,type:r.FieldType.number,config:{color:{mode:"continuous-GrYlRd"},displayName:"Self time / Trace duration"}}],meta:{preferredVisualisationType:"nodeGraph"}}),new r.MutableDataFrame({fields:[{name:r.NodeGraphDataFrameFieldNames.id,type:r.FieldType.string},{name:r.NodeGraphDataFrameFieldNames.target,type:r.FieldType.string},{name:r.NodeGraphDataFrameFieldNames.source,type:r.FieldType.string}],meta:{preferredVisualisationType:"nodeGraph"}})]}},"./public/app/plugins/datasource/jaeger/responseTransform.ts":(e,t,n)=>{"use strict";n.d(t,{xM:()=>a,Wp:()=>i,c6:()=>l});var r=n("./packages/grafana-data/src/index.ts"),s=n("./packages/jaeger-ui-components/src/index.ts");function a(e){const t=e.spans.map((t=>{return n=t,r=e.processes,{spanID:n.spanID,traceID:n.traceID,parentSpanID:null===(s=n.references)||void 0===s||null===(a=s.find((e=>"CHILD_OF"===e.refType)))||void 0===a?void 0:a.spanID,operationName:n.operationName,startTime:n.startTime/1e3,duration:n.duration/1e3,logs:n.logs.map((e=>Object.assign({},e,{timestamp:e.timestamp/1e3}))),tags:n.tags,warnings:null!==(i=n.warnings)&&void 0!==i?i:void 0,stackTraces:n.stackTraces,serviceName:r[n.processID].serviceName,serviceTags:r[n.processID].tags};var n,r,s,a,i})),n=new r.MutableDataFrame({fields:[{name:"traceID",type:r.FieldType.string},{name:"spanID",type:r.FieldType.string},{name:"parentSpanID",type:r.FieldType.string},{name:"operationName",type:r.FieldType.string},{name:"serviceName",type:r.FieldType.string},{name:"serviceTags",type:r.FieldType.other},{name:"startTime",type:r.FieldType.number},{name:"duration",type:r.FieldType.number},{name:"logs",type:r.FieldType.other},{name:"tags",type:r.FieldType.other},{name:"warnings",type:r.FieldType.other},{name:"stackTraces",type:r.FieldType.other}],meta:{preferredVisualisationType:"trace",custom:{traceFormat:"jaeger"}}});for(const e of t)n.add(e);return n}function i(e,t){const n=new r.MutableDataFrame({fields:[{name:"traceID",type:r.FieldType.string,config:{displayNameFromDS:"Trace ID",links:[{title:"Trace: ${__value.raw}",url:"",internal:{datasourceUid:t.uid,datasourceName:t.name,query:{query:"${__value.raw}"}}}]}},{name:"traceName",type:r.FieldType.string,config:{displayNameFromDS:"Trace name"}},{name:"startTime",type:r.FieldType.time,config:{displayNameFromDS:"Start time"}},{name:"duration",type:r.FieldType.number,config:{displayNameFromDS:"Duration",unit:"µs"}}],meta:{preferredVisualisationType:"table"}}),s=e.map(o).sort(((e,t)=>(null==t?void 0:t.startTime)-(null==e?void 0:e.startTime)));for(const e of s)n.add(e);return n}function o(e){const t=(0,s.R1)(e);if(t)return{traceID:t.traceID,startTime:t.startTime/1e3,duration:t.duration,traceName:t.traceName}}function l(e){let t={traceID:"",spans:[],processes:{},warnings:null},n=[];for(let r=0;r<e.length;r++){const s=e.get(r);t.traceID||(t.traceID=s.traceID),n.find((e=>e===s.serviceName))||(n.push(s.serviceName),t.processes[`p${n.length}`]={serviceName:s.serviceName,tags:s.serviceTags}),t.spans.push({traceID:s.traceID,spanID:s.spanID,duration:1e3*s.duration,references:s.parentSpanID?[{refType:"CHILD_OF",spanID:s.parentSpanID,traceID:s.traceID}]:[],flags:0,logs:s.logs.map((e=>Object.assign({},e,{timestamp:1e3*e.timestamp}))),operationName:s.operationName,processID:Object.keys(t.processes).find((e=>t.processes[e].serviceName===s.serviceName))||"",startTime:1e3*s.startTime,tags:s.tags,warnings:s.warnings?s.warnings:null})}return{data:[t],total:0,limit:0,offset:0,errors:null}}},"./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}var o=function(e,t){var n=e.children,a=e.color,i=e.size,o=e.style,l=e.width,c=e.height,d=function(e,t){var n={};for(var r in e)t.indexOf(r)>=0||Object.prototype.hasOwnProperty.call(e,r)&&(n[r]=e[r]);return n}(e,["children","color","size","style","width","height"]),p=t.reactIconBase,u=void 0===p?{}:p,h=i||u.size||"1em";return s.default.createElement("svg",r({children:n,fill:"currentColor",preserveAspectRatio:"xMidYMid meet",height:c||h,width:l||h},u,d,{style:r({verticalAlign:"middle",color:a||u.color},u.style||{},o)}))};o.propTypes={color:a.default.string,size:a.default.oneOfType([a.default.string,a.default.number]),width:a.default.oneOfType([a.default.string,a.default.number]),height:a.default.oneOfType([a.default.string,a.default.number]),style:a.default.object},o.contextTypes={reactIconBase:a.default.shape(o.propTypes)},t.default=o,e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/alert.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m25 37.5h-10v-7.5h10v7.5z m-1.2-12.5h-7.5l-1.3-22.5h10z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/android-locate.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m17.5 13.8c3.4 0 6.3 2.8 6.3 6.2s-2.9 6.3-6.3 6.3-6.2-2.9-6.2-6.3 2.8-6.2 6.2-6.2z m14.9 4.6h2.6v3.2h-2.6c-0.8 7-6.3 12.5-13.3 13.3v2.6h-3.2v-2.6c-7-0.8-12.5-6.3-13.3-13.3h-2.6v-3.2h2.6c0.8-7 6.3-12.5 13.3-13.3v-2.6h3.2v2.6c7 0.8 12.5 6.3 13.3 13.3z m-14.9 13.2c6.4 0 11.6-5.2 11.6-11.6s-5.2-11.6-11.6-11.6-11.6 5.2-11.6 11.6 5.2 11.6 11.6 11.6z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/android-open.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m31.6 31.6v-10.3h3.4v10.3c0 1.8-1.6 3.4-3.4 3.4h-23.2c-1.8 0-3.4-1.6-3.4-3.4v-23.2c0-1.8 1.6-3.4 3.4-3.4h10.4v3.4h-10.4v23.2h23.2z m-9.1-26.6h12.5v12.5h-3.4v-6.8l-16.8 16.8-2.3-2.3 16.8-16.8h-6.8v-3.4z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/arrow-right-a.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m35 20l-15 15v-8.7h-15v-12.5h15v-8.8z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/chevron-right.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m23.3 20l-13.1-13.6c-0.3-0.3-0.3-0.9 0-1.2l2.4-2.4c0.3-0.3 0.9-0.4 1.2-0.1l16 16.7c0.1 0.1 0.2 0.4 0.2 0.6s-0.1 0.5-0.2 0.6l-16 16.7c-0.3 0.3-0.9 0.3-1.2 0l-2.4-2.5c-0.3-0.3-0.3-0.9 0-1.2z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/ios-arrow-down.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m31 12.5l1.5 1.6-12.5 13.4-12.5-13.4 1.5-1.6 11 11.7z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/ios-arrow-right.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m12.5 9l1.6-1.5 13.4 12.5-13.4 12.5-1.6-1.5 11.7-11z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/link.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m20 16.3z m8.8-3.8c3.4 0 6.2 2.8 6.2 6.3v2.5c0 3.4-2.8 6.2-6.2 6.2h-8.8c-2.6 0-4.7-1.6-5.7-3.7-0.3-0.8-0.5-1.6-0.5-2.5v-2.5h3.7v2.5c0 1.4 1.1 2.5 2.5 2.5h8.8c1.4 0 2.5-1.1 2.5-2.5v-2.5c0-1.5-1.1-2.5-2.5-2.5h-1.3c-0.5-2.5-2.5-3.8-2.5-3.8h3.8z m-3 3.8c0.3 0.7 0.5 1.6 0.5 2.5v2.5h-3.8v-2.5c0-1.5-1.1-2.5-2.5-2.5h-8.7c-1.5 0-2.5 1-2.5 2.5v2.5c0 1.4 1 2.5 2.5 2.5h1.2c0.5 2.4 2.5 3.7 2.5 3.7h-3.7c-3.5 0-6.3-2.8-6.3-6.2v-2.5c0-3.5 2.8-6.3 6.3-6.3h8.7c2.6 0 4.8 1.6 5.8 3.8z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/io/network.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m35 7.5c0 1.9-1 3.4-2.5 4.3v7.3l-10 5v4.1c1.5 0.9 2.5 2.4 2.5 4.3 0 2.7-2.3 5-5 5s-5-2.3-5-5c0-1.9 1-3.4 2.5-4.3v-4.1l-10-5v-7.3c-1.5-0.9-2.5-2.4-2.5-4.3 0-2.7 2.3-5 5-5s5 2.3 5 5c0 1.9-1 3.4-2.5 4.3v4.1l7.5 3.8 7.5-3.8v-4.1c-1.5-0.9-2.5-2.4-2.5-4.3 0-2.7 2.3-5 5-5s5 2.3 5 5z m-25-2.5c-1.4 0-2.5 1.1-2.5 2.5s1.1 2.5 2.5 2.5 2.5-1.1 2.5-2.5-1.1-2.5-2.5-2.5z m10 30c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5z m10-25c1.4 0 2.5-1.1 2.5-2.5s-1.1-2.5-2.5-2.5-2.5 1.1-2.5 2.5 1.1 2.5 2.5 2.5z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/md/file-upload.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m8.4 30h23.2v3.4h-23.2v-3.4z m6.6-3.4v-10h-6.6l11.6-11.6 11.6 11.6h-6.6v10h-10z"})))},e.exports=t.default},"./.yarn/__virtual__/react-icons-virtual-f314220a93/0/cache/react-icons-npm-2.2.7-c2e0e4d90b-74e692fdd3.zip/node_modules/react-icons/lib/md/keyboard-arrow-right.js":(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var n=arguments[t];for(var r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[r]=n[r])}return e},s=i(n("./.yarn/cache/react-npm-17.0.2-99ba37d931-b254cc17ce.zip/node_modules/react/index.js")),a=i(n("./.yarn/__virtual__/react-icon-base-virtual-e209b164a7/0/cache/react-icon-base-npm-2.1.0-caadf8254e-62b6bfe486.zip/node_modules/react-icon-base/lib/index.js"));function i(e){return e&&e.__esModule?e:{default:e}}t.default=function(e){return s.default.createElement(a.default,r({viewBox:"0 0 40 40"},e),s.default.createElement("g",null,s.default.createElement("path",{d:"m14.3 27.3l7.7-7.7-7.7-7.7 2.3-2.3 10 10-10 10z"})))},e.exports=t.default},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/index.js":(e,t,n)=>{"use strict";e.exports=function(e,t){var n=this,r=n.constructor;return n.options=Object.assign({storeInstancesGlobally:!0},t||{}),n.callbacks={},n.directMap={},n.sequenceLevels={},n.resetTimer=null,n.ignoreNextKeyup=!1,n.ignoreNextKeypress=!1,n.nextExpectedAction=!1,n.element=e,n.addEvents(),n.options.storeInstancesGlobally&&r.instances.push(n),n},e.exports.prototype.bind=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bind.js"),e.exports.prototype.bindMultiple=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindMultiple.js"),e.exports.prototype.unbind=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/unbind.js"),e.exports.prototype.trigger=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/trigger.js"),e.exports.prototype.reset=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/reset.js"),e.exports.prototype.stopCallback=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/stopCallback.js"),e.exports.prototype.handleKey=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/handleKey.js"),e.exports.prototype.addEvents=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/addEvents.js"),e.exports.prototype.bindSingle=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindSingle.js"),e.exports.prototype.getKeyInfo=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getKeyInfo.js"),e.exports.prototype.pickBestAction=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/pickBestAction.js"),e.exports.prototype.getReverseMap=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getReverseMap.js"),e.exports.prototype.getMatches=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getMatches.js"),e.exports.prototype.resetSequences=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/resetSequences.js"),e.exports.prototype.fireCallback=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/fireCallback.js"),e.exports.prototype.bindSequence=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindSequence.js"),e.exports.prototype.resetSequenceTimer=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/resetSequenceTimer.js"),e.exports.prototype.detach=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/detach.js"),e.exports.instances=[],e.exports.reset=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/reset.js"),e.exports.REVERSE_MAP=null},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/addEvents.js":(e,t,n)=>{"use strict";e.exports=function(){var e=this,t=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/dom-event.js"),r=e.element;e.eventHandler=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/handleKeyEvent.js").bind(e),t(r,"keypress",e.eventHandler),t(r,"keydown",e.eventHandler),t(r,"keyup",e.eventHandler)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bind.js":e=>{"use strict";e.exports=function(e,t,n){return e=e instanceof Array?e:[e],this.bindMultiple(e,t,n),this}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindMultiple.js":e=>{"use strict";e.exports=function(e,t,n){for(var r=0;r<e.length;++r)this.bindSingle(e[r],t,n)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindSequence.js":(e,t,n)=>{"use strict";e.exports=function(e,t,r,s){var a=this;function i(t){return function(){a.nextExpectedAction=t,++a.sequenceLevels[e],a.resetSequenceTimer()}}function o(t){var i;a.fireCallback(r,t,e),"keyup"!==s&&(i=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/characterFromEvent.js"),a.ignoreNextKeyup=i(t)),setTimeout((function(){a.resetSequences()}),10)}a.sequenceLevels[e]=0;for(var l=0;l<t.length;++l){var c=l+1===t.length?o:i(s||a.getKeyInfo(t[l+1]).action);a.bindSingle(t[l],c,s,e,l)}}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/bindSingle.js":e=>{"use strict";e.exports=function(e,t,n,r,s){var a=this;a.directMap[e+":"+n]=t;var i,o=(e=e.replace(/\s+/g," ")).split(" ");o.length>1?a.bindSequence(e,o,t,n):(i=a.getKeyInfo(e,n),a.callbacks[i.key]=a.callbacks[i.key]||[],a.getMatches(i.key,i.modifiers,{type:i.action},r,e,s),a.callbacks[i.key][r?"unshift":"push"]({callback:t,modifiers:i.modifiers,action:i.action,seq:r,level:s,combo:e}))}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/detach.js":(e,t,n)=>{var r=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/dom-event.js").off;e.exports=function(){var e=this,t=e.element;r(t,"keypress",e.eventHandler),r(t,"keydown",e.eventHandler),r(t,"keyup",e.eventHandler)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/dom-event.js":e=>{function t(e,t,n,r){return!e.addEventListener&&(t="on"+t),(e.addEventListener||e.attachEvent).call(e,t,n,r),n}e.exports=t,e.exports.on=t,e.exports.off=function(e,t,n,r){return!e.removeEventListener&&(t="on"+t),(e.removeEventListener||e.detachEvent).call(e,t,n,r),n}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/fireCallback.js":(e,t,n)=>{"use strict";e.exports=function(e,t,r,s){this.stopCallback(t,t.target||t.srcElement,r,s)||!1===e(t,r)&&(n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/preventDefault.js")(t),n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/stopPropagation.js")(t))}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getKeyInfo.js":(e,t,n)=>{"use strict";e.exports=function(e,t){var r,s,a,i,o,l,c=[];for(r=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/keysFromString.js")(e),i=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-aliases.js"),o=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/shift-map.js"),l=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/isModifier.js"),a=0;a<r.length;++a)i[s=r[a]]&&(s=i[s]),t&&"keypress"!==t&&o[s]&&(s=o[s],c.push("shift")),l(s)&&c.push(s);return{key:s,modifiers:c,action:t=this.pickBestAction(s,c,t)}}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getMatches.js":(e,t,n)=>{"use strict";e.exports=function(e,t,r,s,a,i){var o,l,c,d,p=this,u=[],h=r.type;"keypress"!==h||r.code&&"Arrow"===r.code.slice(0,5)||(p.callbacks["any-character"]||[]).forEach((function(e){u.push(e)}));if(!p.callbacks[e])return u;for(c=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/isModifier.js"),"keyup"===h&&c(e)&&(t=[e]),o=0;o<p.callbacks[e].length;++o)if(l=p.callbacks[e][o],(s||!l.seq||p.sequenceLevels[l.seq]===l.level)&&h===l.action&&(d=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/modifiersMatch.js"),"keypress"===h&&!r.metaKey&&!r.ctrlKey||d(t,l.modifiers))){var m=!s&&l.combo===a,g=s&&l.seq===s&&l.level===i;(m||g)&&p.callbacks[e].splice(o,1),u.push(l)}return u}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/getReverseMap.js":(e,t,n)=>{"use strict";e.exports=function(){var e,t=this.constructor;if(!t.REVERSE_MAP)for(var r in t.REVERSE_MAP={},e=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-keys-map.js"))r>95&&r<112||e.hasOwnProperty(r)&&(t.REVERSE_MAP[e[r]]=r);return t.REVERSE_MAP}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/handleKey.js":(e,t,n)=>{"use strict";e.exports=function(e,t,r){var s,a,i,o,l=this,c={},d=0,p=!1;for(s=l.getMatches(e,t,r),a=0;a<s.length;++a)s[a].seq&&(d=Math.max(d,s[a].level));for(a=0;a<s.length;++a)if(s[a].seq){if(s[a].level!==d)continue;p=!0,c[s[a].seq]=1,l.fireCallback(s[a].callback,r,s[a].combo,s[a].seq)}else p||l.fireCallback(s[a].callback,r,s[a].combo);o="keypress"===r.type&&l.ignoreNextKeypress,i=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/isModifier.js"),r.type!==l.nextExpectedAction||i(e)||o||l.resetSequences(c),l.ignoreNextKeypress=p&&"keydown"===r.type}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/handleKeyEvent.js":(e,t,n)=>{"use strict";e.exports=function(e){var t,r=this;"number"!=typeof e.which&&(e.which=e.keyCode);var s=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/characterFromEvent.js")(e);void 0!==s&&("keyup"!==e.type||r.ignoreNextKeyup!==s?(t=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/eventModifiers.js"),r.handleKey(s,t(e),e)):r.ignoreNextKeyup=!1)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/modifiersMatch.js":e=>{"use strict";e.exports=function(e,t){return e.sort().join(",")===t.sort().join(",")}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/pickBestAction.js":e=>{"use strict";e.exports=function(e,t,n){return n||(n=this.getReverseMap()[e]?"keydown":"keypress"),"keypress"===n&&t.length&&(n="keydown"),n}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/reset.js":e=>{"use strict";e.exports=function(){return this.callbacks={},this.directMap={},this}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/resetSequenceTimer.js":e=>{"use strict";e.exports=function(){var e=this;clearTimeout(e.resetTimer),e.resetTimer=setTimeout((function(){e.resetSequences()}),1e3)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/resetSequences.js":e=>{"use strict";e.exports=function(e){var t=this;e=e||{};var n,r=!1;for(n in t.sequenceLevels)e[n]?r=!0:t.sequenceLevels[n]=0;r||(t.nextExpectedAction=!1)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/stopCallback.js":e=>{"use strict";e.exports=function(e,t){if((" "+t.className+" ").indexOf(" combokeys ")>-1)return!1;var n=t.tagName.toLowerCase();return"input"===n||"select"===n||"textarea"===n||t.isContentEditable}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/trigger.js":e=>{"use strict";e.exports=function(e,t){return this.directMap[e+":"+t]&&this.directMap[e+":"+t]({},e),this}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/prototype/unbind.js":e=>{"use strict";e.exports=function(e,t){return this.bind(e,(function(){}),t)}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/Combokeys/reset.js":e=>{"use strict";e.exports=function(){this.instances.forEach((function(e){e.reset()}))}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/characterFromEvent.js":(e,t,n)=>{"use strict";e.exports=function(e){var t,r;if(t=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-keys-map.js"),r=n("./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-characters-map.js"),"keypress"===e.type){var s=String.fromCharCode(e.which);return e.shiftKey||(s=s.toLowerCase()),s}return void 0!==t[e.which]?t[e.which]:void 0!==r[e.which]?r[e.which]:String.fromCharCode(e.which).toLowerCase()}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/eventModifiers.js":e=>{"use strict";e.exports=function(e){var t=[];return e.shiftKey&&t.push("shift"),e.altKey&&t.push("alt"),e.ctrlKey&&t.push("ctrl"),e.metaKey&&t.push("meta"),t}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/isModifier.js":e=>{"use strict";e.exports=function(e){return"shift"===e||"ctrl"===e||"alt"===e||"meta"===e}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/keysFromString.js":e=>{"use strict";e.exports=function(e){return"+"===e?["+"]:e.split("+")}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/preventDefault.js":e=>{"use strict";e.exports=function(e){e.preventDefault?e.preventDefault():e.returnValue=!1}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/shift-map.js":e=>{"use strict";e.exports={"~":"`","!":"1","@":"2","#":"3",$:"4","%":"5","^":"6","&":"7","*":"8","(":"9",")":"0",_:"-","+":"=",":":";",'"':"'","<":",",">":".","?":"/","|":"\\"}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-aliases.js":e=>{"use strict";e.exports={option:"alt",command:"meta",return:"enter",escape:"esc",mod:/Mac|iPod|iPhone|iPad/.test(navigator.platform)?"meta":"ctrl"}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-characters-map.js":e=>{"use strict";e.exports={106:"*",107:"plus",109:"minus",110:".",111:"/",186:";",187:"=",188:",",189:"-",190:".",191:"/",192:"`",219:"[",220:"\\",221:"]",222:"'"}},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/special-keys-map.js":e=>{"use strict";e.exports={8:"backspace",9:"tab",13:"enter",16:"shift",17:"ctrl",18:"alt",20:"capslock",27:"esc",32:"space",33:"pageup",34:"pagedown",35:"end",36:"home",37:"left",38:"up",39:"right",40:"down",45:"ins",46:"del",91:"meta",93:"meta",173:"minus",187:"plus",189:"minus",224:"meta"};for(var t=1;t<20;++t)e.exports[111+t]="f"+t;for(t=0;t<=9;++t)e.exports[t+96]=t},"./.yarn/cache/combokeys-npm-3.0.1-45601d2e33-37ad8d0257.zip/node_modules/combokeys/helpers/stopPropagation.js":e=>{"use strict";e.exports=function(e){e.stopPropagation?e.stopPropagation():e.cancelBubble=!0}},"./.yarn/cache/copy-to-clipboard-npm-3.3.1-18029bce99-3c7b1c333d.zip/node_modules/copy-to-clipboard/index.js":(e,t,n)=>{"use strict";var r=n("./.yarn/cache/toggle-selection-npm-1.0.6-c506b73005-a90dc80ed1.zip/node_modules/toggle-selection/index.js"),s={"text/plain":"Text","text/html":"Url",default:"Text"};e.exports=function(e,t){var n,a,i,o,l,c,d=!1;t||(t={}),n=t.debug||!1;try{if(i=r(),o=document.createRange(),l=document.getSelection(),(c=document.createElement("span")).textContent=e,c.style.all="unset",c.style.position="fixed",c.style.top=0,c.style.clip="rect(0, 0, 0, 0)",c.style.whiteSpace="pre",c.style.webkitUserSelect="text",c.style.MozUserSelect="text",c.style.msUserSelect="text",c.style.userSelect="text",c.addEventListener("copy",(function(r){if(r.stopPropagation(),t.format)if(r.preventDefault(),void 0===r.clipboardData){n&&console.warn("unable to use e.clipboardData"),n&&console.warn("trying IE specific stuff"),window.clipboardData.clearData();var a=s[t.format]||s.default;window.clipboardData.setData(a,e)}else r.clipboardData.clearData(),r.clipboardData.setData(t.format,e);t.onCopy&&(r.preventDefault(),t.onCopy(r.clipboardData))})),document.body.appendChild(c),o.selectNodeContents(c),l.addRange(o),!document.execCommand("copy"))throw new Error("copy command was unsuccessful");d=!0}catch(r){n&&console.error("unable to copy using execCommand: ",r),n&&console.warn("trying IE specific stuff");try{window.clipboardData.setData(t.format||"text",e),t.onCopy&&t.onCopy(window.clipboardData),d=!0}catch(r){n&&console.error("unable to copy using clipboardData: ",r),n&&console.error("falling back to prompt"),a=function(e){var t=(/mac os x/i.test(navigator.userAgent)?"⌘":"Ctrl")+"+C";return e.replace(/#{\s*key\s*}/g,t)}("message"in t?t.message:"Copy to clipboard: #{key}, Enter"),window.prompt(a,e)}}finally{l&&("function"==typeof l.removeRange?l.removeRange(o):l.removeAllRanges()),c&&document.body.removeChild(c),i()}return d}},"./.yarn/cache/deep-freeze-npm-0.0.1-12d684fc1a-1e43c98e44.zip/node_modules/deep-freeze/index.js":e=>{e.exports=function e(t){return Object.freeze(t),Object.getOwnPropertyNames(t).forEach((function(n){!t.hasOwnProperty(n)||null===t[n]||"object"!=typeof t[n]&&"function"!=typeof t[n]||Object.isFrozen(t[n])||e(t[n])})),t}},"./.yarn/cache/fuzzy-npm-0.1.3-a0dfe08bd0-acc09c6173.zip/node_modules/fuzzy/lib/fuzzy.js":e=>{var t;t={},e.exports=t,t.simpleFilter=function(e,n){return n.filter((function(n){return t.test(e,n)}))},t.test=function(e,n){return null!==t.match(e,n)},t.match=function(e,t,n){n=n||{};var r,s=0,a=[],i=t.length,o=0,l=0,c=n.pre||"",d=n.post||"",p=n.caseSensitive&&t||t.toLowerCase();e=n.caseSensitive&&e||e.toLowerCase();for(var u=0;u<i;u++)r=t[u],p[u]===e[s]?(r=c+r+d,s+=1,l+=1+l):l=0,o+=l,a[a.length]=r;return s===e.length?(o=p===e?1/0:o,{rendered:a.join(""),score:o}):null},t.filter=function(e,n,r){return n&&0!==n.length?"string"!=typeof e?n:(r=r||{},n.reduce((function(n,s,a,i){var o=s;r.extract&&(o=r.extract(s));var l=t.match(e,o,r);return null!=l&&(n[n.length]={string:l.rendered,score:l.score,index:a,original:s}),n}),[]).sort((function(e,t){var n=t.score-e.score;return n||e.index-t.index}))):[]}},"./.yarn/cache/json-markup-npm-1.1.3-2762e9da70-aa4e1935fc.zip/node_modules/json-markup/index.js":e=>{"use strict";var t="    ";function n(e){return e?function(t){return'style="'+(n=e["."+t],r="",n&&Object.keys(n).forEach((function(e){r+=e+":"+n[e]+";"})),r+'"');var n,r}:function(e){return'class="'+e+'"'}}function r(e){return e.replace(/</g,"&lt;").replace(/>/g,"&gt;")}e.exports=function(e,s){var a="",i=n(s),o=function(e,n,r,s){if(!e.length)return n+" "+r;var i=n+"\n";return a+=t,e.forEach((function(t,n){i+=a+s(t)+(n<e.length-1?",":"")+"\n"})),a=a.slice(0,-t.length),i+a+r};return"<div "+i("json-markup")+">"+function e(t){if(void 0===t)return"";switch(function(e){return null===e?"null":Array.isArray(e)?"array":"string"==typeof e&&/^https?:/.test(e)?"link":"object"==typeof e&&"function"==typeof e.toISOString?"date":typeof e}(t)){case"boolean":return"<span "+i("json-markup-bool")+">"+t+"</span>";case"number":return"<span "+i("json-markup-number")+">"+t+"</span>";case"date":return'<span class="json-markup-string">"'+r(t.toISOString())+'"</span>';case"null":return"<span "+i("json-markup-null")+">null</span>";case"string":return"<span "+i("json-markup-string")+'>"'+r(t.replace(/\n/g,"\n"+a))+'"</span>';case"link":return"<span "+i("json-markup-string")+'>"<a href="'+r(t)+'">'+r(t)+'</a>"</span>';case"array":return o(t,"[","]",e);case"object":var n=Object.keys(t).filter((function(e){return void 0!==t[e]}));return o(n,"{","}",(function(n){return"<span "+i("json-markup-key")+'>"'+n+'":</span> '+e(t[n])}))}return""}(e)+"</div>"}},"./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/factoryWithThrowingShims.js":(e,t,n)=>{"use strict";var r=n("./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js");function s(){}function a(){}a.resetWarningCache=s,e.exports=function(){function e(e,t,n,s,a,i){if(i!==r){var o=new Error("Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types");throw o.name="Invariant Violation",o}}function t(){return e}e.isRequired=e;var n={array:e,bigint:e,bool:e,func:e,number:e,object:e,string:e,symbol:e,any:e,arrayOf:t,element:e,elementType:e,instanceOf:t,node:e,objectOf:t,oneOf:t,oneOfType:t,shape:t,exact:t,checkPropTypes:a,resetWarningCache:s};return n.PropTypes=n,n}},"./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/index.js":(e,t,n)=>{e.exports=n("./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/factoryWithThrowingShims.js")()},"./.yarn/cache/prop-types-npm-15.8.1-17c71ee7ee-c056d3f1c0.zip/node_modules/prop-types/lib/ReactPropTypesSecret.js":e=>{"use strict";e.exports="SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED"},"./.yarn/cache/toggle-selection-npm-1.0.6-c506b73005-a90dc80ed1.zip/node_modules/toggle-selection/index.js":e=>{e.exports=function(){var e=document.getSelection();if(!e.rangeCount)return function(){};for(var t=document.activeElement,n=[],r=0;r<e.rangeCount;r++)n.push(e.getRangeAt(r));switch(t.tagName.toUpperCase()){case"INPUT":case"TEXTAREA":t.blur();break;default:t=null}return e.removeAllRanges(),function(){"Caret"===e.type&&e.removeAllRanges(),e.rangeCount||n.forEach((function(t){e.addRange(t)})),t&&t.focus()}}}}]);
//# sourceMappingURL=9018.3db65f9d947bdb84a2f5.js.map