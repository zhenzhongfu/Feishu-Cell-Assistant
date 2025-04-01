import{s as t,a as e,S as a}from"./chunk-4IRHCMPZ-BTrdPQlN.js";import{_ as i,c as n,d as r,l as d,e as s,k as o,Y as g,$ as p,u as c}from"./index-B1KNGRI5.js";import{G as h}from"./graph-BVeRCD7o.js";import{l}from"./layout-uR6tmYZC.js";import"./chunk-2O5F6CEG-CdIOD3O8.js";import"./react-vendor-DpBGeY6O.js";import"./markdown-vendor-BJNjEg5J.js";import"./_baseUniq-BRJzkBLB.js";import"./_basePickBy-CNPOauDA.js";var x,f={},u=i(((t,e)=>{f[t]=e}),"set"),y=i((t=>f[t]),"get"),w=i((()=>Object.keys(f)),"keys"),m=i((()=>w().length),"size"),b={get:y,set:u,keys:w,size:m},B=i((t=>t.append("circle").attr("class","start-state").attr("r",n().state.sizeUnit).attr("cx",n().state.padding+n().state.sizeUnit).attr("cy",n().state.padding+n().state.sizeUnit)),"drawStartState"),k=i((t=>t.append("line").style("stroke","grey").style("stroke-dasharray","3").attr("x1",n().state.textHeight).attr("class","divider").attr("x2",2*n().state.textHeight).attr("y1",0).attr("y2",0)),"drawDivider"),S=i(((t,e)=>{const a=t.append("text").attr("x",2*n().state.padding).attr("y",n().state.textHeight+2*n().state.padding).attr("font-size",n().state.fontSize).attr("class","state-title").text(e.id),i=a.node().getBBox();return t.insert("rect",":first-child").attr("x",n().state.padding).attr("y",n().state.padding).attr("width",i.width+2*n().state.padding).attr("height",i.height+2*n().state.padding).attr("rx",n().state.radius),a}),"drawSimpleState"),E=i(((t,e)=>{const a=i((function(t,e,a){const i=t.append("tspan").attr("x",2*n().state.padding).text(e);a||i.attr("dy",n().state.textHeight)}),"addTspan"),r=t.append("text").attr("x",2*n().state.padding).attr("y",n().state.textHeight+1.3*n().state.padding).attr("font-size",n().state.fontSize).attr("class","state-title").text(e.descriptions[0]).node().getBBox(),d=r.height,s=t.append("text").attr("x",n().state.padding).attr("y",d+.4*n().state.padding+n().state.dividerMargin+n().state.textHeight).attr("class","state-description");let o=!0,g=!0;e.descriptions.forEach((function(t){o||(a(s,t,g),g=!1),o=!1}));const p=t.append("line").attr("x1",n().state.padding).attr("y1",n().state.padding+d+n().state.dividerMargin/2).attr("y2",n().state.padding+d+n().state.dividerMargin/2).attr("class","descr-divider"),c=s.node().getBBox(),h=Math.max(c.width,r.width);return p.attr("x2",h+3*n().state.padding),t.insert("rect",":first-child").attr("x",n().state.padding).attr("y",n().state.padding).attr("width",h+2*n().state.padding).attr("height",c.height+d+2*n().state.padding).attr("rx",n().state.radius),t}),"drawDescrState"),N=i(((t,e,a)=>{const i=n().state.padding,r=2*n().state.padding,d=t.node().getBBox(),s=d.width,o=d.x,g=t.append("text").attr("x",0).attr("y",n().state.titleShift).attr("font-size",n().state.fontSize).attr("class","state-title").text(e.id),p=g.node().getBBox().width+r;let c,h=Math.max(p,s);h===s&&(h+=r);const l=t.node().getBBox();e.doc,c=o-i,p>s&&(c=(s-h)/2+i),Math.abs(o-l.x)<i&&p>s&&(c=o-(p-s)/2);const x=1-n().state.textHeight;return t.insert("rect",":first-child").attr("x",c).attr("y",x).attr("class",a?"alt-composit":"composit").attr("width",h).attr("height",l.height+n().state.textHeight+n().state.titleShift+1).attr("rx","0"),g.attr("x",c+i),p<=s&&g.attr("x",o+(h-r)/2-p/2+i),t.insert("rect",":first-child").attr("x",c).attr("y",n().state.titleShift-n().state.textHeight-n().state.padding).attr("width",h).attr("height",3*n().state.textHeight).attr("rx",n().state.radius),t.insert("rect",":first-child").attr("x",c).attr("y",n().state.titleShift-n().state.textHeight-n().state.padding).attr("width",h).attr("height",l.height+3+2*n().state.textHeight).attr("rx",n().state.radius),t}),"addTitleAndBox"),M=i((t=>(t.append("circle").attr("class","end-state-outer").attr("r",n().state.sizeUnit+n().state.miniPadding).attr("cx",n().state.padding+n().state.sizeUnit+n().state.miniPadding).attr("cy",n().state.padding+n().state.sizeUnit+n().state.miniPadding),t.append("circle").attr("class","end-state-inner").attr("r",n().state.sizeUnit).attr("cx",n().state.padding+n().state.sizeUnit+2).attr("cy",n().state.padding+n().state.sizeUnit+2))),"drawEndState"),v=i(((t,e)=>{let a=n().state.forkWidth,i=n().state.forkHeight;if(e.parentId){let t=a;a=i,i=t}return t.append("rect").style("stroke","black").style("fill","black").attr("width",a).attr("height",i).attr("x",n().state.padding).attr("y",n().state.padding)}),"drawForkJoinState"),z=i(((t,e,a,i)=>{let r=0;const d=i.append("text");d.style("text-anchor","start"),d.attr("class","noteText");let s=t.replace(/\r\n/g,"<br/>");s=s.replace(/\n/g,"<br/>");const g=s.split(o.lineBreakRegex);let p=1.25*n().state.noteMargin;for(const o of g){const t=o.trim();if(t.length>0){const i=d.append("tspan");if(i.text(t),0===p){p+=i.node().getBBox().height}r+=p,i.attr("x",e+n().state.noteMargin),i.attr("y",a+r+1.25*n().state.noteMargin)}}return{textWidth:d.node().getBBox().width,textHeight:r}}),"_drawLongText"),H=i(((t,e)=>{e.attr("class","state-note");const a=e.append("rect").attr("x",0).attr("y",n().state.padding),i=e.append("g"),{textWidth:r,textHeight:d}=z(t,0,0,i);return a.attr("height",d+2*n().state.noteMargin),a.attr("width",r+2*n().state.noteMargin),a}),"drawNote"),T=i((function(t,e){const a=e.id,i={id:a,label:e.id,width:0,height:0},r=t.append("g").attr("id",a).attr("class","stateGroup");"start"===e.type&&B(r),"end"===e.type&&M(r),"fork"!==e.type&&"join"!==e.type||v(r,e),"note"===e.type&&H(e.note.text,r),"divider"===e.type&&k(r),"default"===e.type&&0===e.descriptions.length&&S(r,e),"default"===e.type&&e.descriptions.length>0&&E(r,e);const d=r.node().getBBox();return i.width=d.width+2*n().state.padding,i.height=d.height+2*n().state.padding,b.set(a,i),i}),"drawState"),j=0,D=i((function(t,e,r){const s=i((function(t){switch(t){case a.relationType.AGGREGATION:return"aggregation";case a.relationType.EXTENSION:return"extension";case a.relationType.COMPOSITION:return"composition";case a.relationType.DEPENDENCY:return"dependency"}}),"getRelationType");e.points=e.points.filter((t=>!Number.isNaN(t.y)));const h=e.points,l=g().x((function(t){return t.x})).y((function(t){return t.y})).curve(p),x=t.append("path").attr("d",l(h)).attr("id","edge"+j).attr("class","transition");let f="";if(n().state.arrowMarkerAbsolute&&(f=window.location.protocol+"//"+window.location.host+window.location.pathname+window.location.search,f=f.replace(/\(/g,"\\("),f=f.replace(/\)/g,"\\)")),x.attr("marker-end","url("+f+"#"+s(a.relationType.DEPENDENCY)+"End)"),void 0!==r.title){const a=t.append("g").attr("class","stateLabel"),{x:i,y:s}=c.calcLabelPosition(e.points),g=o.getRows(r.title);let p=0;const h=[];let l=0,x=0;for(let t=0;t<=g.length;t++){const e=a.append("text").attr("text-anchor","middle").text(g[t]).attr("x",i).attr("y",s+p),n=e.node().getBBox();if(l=Math.max(l,n.width),x=Math.min(x,n.x),d.info(n.x,i,s+p),0===p){const t=e.node().getBBox();p=t.height,d.info("Title height",p,s)}h.push(e)}let f=p*g.length;if(g.length>1){const t=(g.length-1)*p*.5;h.forEach(((e,a)=>e.attr("y",s+a*p-t))),f=p*g.length}const u=a.node().getBBox();a.insert("rect",":first-child").attr("class","box").attr("x",i-l/2-n().state.padding/2).attr("y",s-f/2-n().state.padding/2-3.5).attr("width",l+n().state.padding).attr("height",f+n().state.padding),d.info(u)}j++}),"drawEdge"),G={},L=i((function(){}),"setConf"),O=i((function(t){t.append("defs").append("marker").attr("id","dependencyEnd").attr("refX",19).attr("refY",7).attr("markerWidth",20).attr("markerHeight",28).attr("orient","auto").append("path").attr("d","M 19,7 L9,13 L14,7 L9,1 Z")}),"insertMarkers"),P=i((function(t,e,a,i){x=n().state;const o=n().securityLevel;let g;"sandbox"===o&&(g=r("#i"+e));const p=r("sandbox"===o?g.nodes()[0].contentDocument.body:"body"),c="sandbox"===o?g.nodes()[0].contentDocument:document;d.debug("Rendering diagram "+t);const h=p.select(`[id='${e}']`);O(h);const l=i.db.getRootDoc();R(l,h,void 0,!1,p,c,i);const f=x.padding,u=h.node().getBBox(),y=u.width+2*f,w=u.height+2*f;s(h,w,1.75*y,x.useMaxWidth),h.attr("viewBox",`${u.x-x.padding}  ${u.y-x.padding} `+y+" "+w)}),"draw"),A=i((t=>t?t.length*x.fontSizeFactor:1),"getLabelWidth"),R=i(((t,e,a,i,n,r,s)=>{const g=new h({compound:!0,multigraph:!0});let p,c=!0;for(p=0;p<t.length;p++)if("relation"===t[p].stmt){c=!1;break}a?g.setGraph({rankdir:"LR",multigraph:!0,compound:!0,ranker:"tight-tree",ranksep:c?1:x.edgeLengthFactor,nodeSep:c?1:50,isMultiGraph:!0}):g.setGraph({rankdir:"TB",multigraph:!0,compound:!0,ranksep:c?1:x.edgeLengthFactor,nodeSep:c?1:50,ranker:"tight-tree",isMultiGraph:!0}),g.setDefaultEdgeLabel((function(){return{}}));const f=s.db.getStates(),u=s.db.getRelations(),y=Object.keys(f);for(const d of y){const t=f[d];let o;if(a&&(t.parentId=a),t.doc){let a=e.append("g").attr("id",t.id).attr("class","stateGroup");o=R(t.doc,a,t.id,!i,n,r,s);{a=N(a,t,i);let e=a.node().getBBox();o.width=e.width,o.height=e.height+x.padding/2,G[t.id]={y:x.compositTitleSize}}}else o=T(e,t,g);if(t.note){const a={descriptions:[],id:t.id+"-note",note:t.note,type:"note"},i=T(e,a,g);"left of"===t.note.position?(g.setNode(o.id+"-note",i),g.setNode(o.id,o)):(g.setNode(o.id,o),g.setNode(o.id+"-note",i)),g.setParent(o.id,o.id+"-group"),g.setParent(o.id+"-note",o.id+"-group")}else g.setNode(o.id,o)}d.debug("Count=",g.nodeCount(),g);let w=0;u.forEach((function(t){w++,d.debug("Setting edge",t),g.setEdge(t.id1,t.id2,{relation:t,width:A(t.title),height:x.labelHeight*o.getRows(t.title).length,labelpos:"c"},"id"+w)})),l(g),d.debug("Graph after layout",g.nodes());const m=e.node();g.nodes().forEach((function(t){if(void 0!==t&&void 0!==g.node(t)){d.warn("Node "+t+": "+JSON.stringify(g.node(t))),n.select("#"+m.id+" #"+t).attr("transform","translate("+(g.node(t).x-g.node(t).width/2)+","+(g.node(t).y+(G[t]?G[t].y:0)-g.node(t).height/2)+" )"),n.select("#"+m.id+" #"+t).attr("data-x-shift",g.node(t).x-g.node(t).width/2);r.querySelectorAll("#"+m.id+" #"+t+" .divider").forEach((t=>{const e=t.parentElement;let a=0,i=0;e&&(e.parentElement&&(a=e.parentElement.getBBox().width),i=parseInt(e.getAttribute("data-x-shift"),10),Number.isNaN(i)&&(i=0)),t.setAttribute("x1",0-i+8),t.setAttribute("x2",a-i-8)}))}else d.debug("No Node "+t+": "+JSON.stringify(g.node(t)))}));let b=m.getBBox();g.edges().forEach((function(t){void 0!==t&&void 0!==g.edge(t)&&(d.debug("Edge "+t.v+" -> "+t.w+": "+JSON.stringify(g.edge(t))),D(e,g.edge(t),g.edge(t).relation))})),b=m.getBBox();const B={id:a||"root",label:a||"root",width:0,height:0};return B.width=b.width+2*x.padding,B.height=b.height+2*x.padding,d.debug("Doc rendered",B,g),B}),"renderDoc"),U={setConf:L,draw:P},C={parser:e,get db(){return new a(1)},renderer:U,styles:t,init:i((t=>{t.state||(t.state={}),t.state.arrowMarkerAbsolute=t.arrowMarkerAbsolute}),"init")};export{C as diagram};
