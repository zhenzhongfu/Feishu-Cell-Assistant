import{_ as t,d as e,e as i,l as o}from"./index-B1KNGRI5.js";var a=t(((t,i)=>{let o;"sandbox"===i&&(o=e("#i"+t));return e("sandbox"===i?o.nodes()[0].contentDocument.body:"body").select(`[id="${t}"]`)}),"getDiagramElement"),d=t(((t,e,a,d)=>{t.attr("class",a);const{width:r,height:h,x:g,y:x}=n(t,e);i(t,h,r,d);const c=s(g,x,r,h,e);t.attr("viewBox",c),o.debug(`viewBox configured: ${c} with padding: ${e}`)}),"setupViewPortForSVG"),n=t(((t,e)=>{var i;const o=(null==(i=t.node())?void 0:i.getBBox())||{width:0,height:0,x:0,y:0};return{width:o.width+2*e,height:o.height+2*e,x:o.x,y:o.y}}),"calculateDimensionsWithPadding"),s=t(((t,e,i,o,a)=>`${t-a} ${e-a} ${i} ${o}`),"createViewBox");export{a as g,d as s};
