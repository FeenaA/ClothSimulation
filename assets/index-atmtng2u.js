(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`struct VertexOutput {\r
    @builtin(position) position: vec4<f32>,\r
    @location(0) normal: vec3<f32>,\r
};\r
\r
@vertex\r
fn vs_main(\r
    @location(0) position: vec2<f32>,\r
    @location(1) normal: vec3<f32>\r
) -> VertexOutput {\r
    var out: VertexOutput;\r
\r
    out.position = vec4<f32>(position, 0.0, 1.0);\r
    out.normal = normalize(normal);\r
\r
    return out;\r
}\r
\r
@fragment\r
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {\r
    //let lightDirection = normalize(vec3<f32>(0.0, 0.0, -1.0));\r
    let lightDirection = normalize(vec3<f32>(-0.5, 0.8, 0.5));\r
    let normal = normalize(in.normal);\r
\r
    let diffuse = max(dot(normal, lightDirection), 0.0);\r
    let ambient = 0.25;\r
    let brightness = ambient + diffuse * 0.75;\r
\r
    let clothColor = vec3<f32>(0.55, 0.55, 0.55);\r
\r
    return vec4<f32>(clothColor * brightness, 1.0);\r
}`,t=`struct VertexOutput {\r
    @builtin(position) position: vec4<f32>,\r
    @location(0) color: vec4<f32>,\r
};\r
\r
@vertex\r
fn vs_main(@location(0) position: vec2<f32>,\r
           @location(1) color: vec3<f32>) -> VertexOutput {\r
    var out: VertexOutput;\r
    out.position = vec4<f32>(position, 0.0, 1.0);\r
    out.color = vec4<f32>(color, 1.0);\r
    return out;\r
}\r
\r
@fragment\r
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {\r
    return in.color;\r
}`,n=class{constructor(e,t){this.canvas=e,this.simulation=t,this.device=null,this.context=null,this.format=null,this.clothPipeline=null,this.vertexBuffer=null,this.vertexCount=0,this.linePipeline=null,this.lineVertexBuffer=null,this.lineVertexCount=0,this.markerPipeline=null,this.markerVertexBuffer=null,this.markerVertexCount=0}async init(){if(!navigator.gpu)throw Error(`WebGPU не поддерживается`);let e=await navigator.gpu.requestAdapter();if(!e)throw Error(`Не удалось получить GPU Adapter`);this.device=await e.requestDevice(),this.context=this.canvas.getContext(`webgpu`),this.format=navigator.gpu.getPreferredCanvasFormat(),this.context.configure({device:this.device,format:this.format,alphaMode:`opaque`}),this.createPipeline(),this.createVertexBuffer(),this.createLineVertexBuffer(),this.createMarkerVertexBuffer()}createPipeline(){let n=this.device.createShaderModule({code:e}),r=this.device.createShaderModule({code:t});this.clothPipeline=this.device.createRenderPipeline({layout:`auto`,vertex:{module:n,entryPoint:`vs_main`,buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:`float32x2`},{shaderLocation:1,offset:8,format:`float32x3`}]}]},fragment:{module:n,entryPoint:`fs_main`,targets:[{format:this.format}]},primitive:{topology:`triangle-list`}}),this.linePipeline=this.device.createRenderPipeline({layout:`auto`,vertex:{module:r,entryPoint:`vs_main`,buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:`float32x2`},{shaderLocation:1,offset:8,format:`float32x3`}]}]},fragment:{module:r,entryPoint:`fs_main`,targets:[{format:this.format}]},primitive:{topology:`line-list`}}),this.markerPipeline=this.device.createRenderPipeline({layout:`auto`,vertex:{module:r,entryPoint:`vs_main`,buffers:[{arrayStride:20,attributes:[{shaderLocation:0,offset:0,format:`float32x2`},{shaderLocation:1,offset:8,format:`float32x3`}]}]},fragment:{module:r,entryPoint:`fs_main`,targets:[{format:this.format}]},primitive:{topology:`line-list`}})}createVertexBuffer(){let e=this.createVerticesFromSimulation();this.vertexCount=e.length/5,this.vertexBuffer=this.device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.vertexBuffer,0,e)}createVerticesFromSimulation(){this.calculateNormals();let e=[],t=this.simulation.width,n=this.simulation.height,r=this.simulation.points;function i(e,n){return n*(t+1)+e}function a(e){let r=e.position[0]-t/2,i=e.position[1]-n/2,a=e.position[2],o=.08;return[(r-i)*o,(r+i)*o*.5-a*o]}function o(t){let[n,r]=a(t);e.push(n,r,t.normal[0],t.normal[1],t.normal[2])}function s(e,t,n){o(e),o(t),o(n)}for(let e=0;e<n;e++)for(let n=0;n<t;n++){let t=r[i(n,e)],a=r[i(n+1,e)],o=r[i(n,e+1)],c=r[i(n+1,e+1)];s(t,a,c),s(t,c,o)}return new Float32Array(e)}calculateNormals(){let e=this.simulation.points;for(let t of e)t.normal=[0,0,0];let t=this.simulation.width,n=this.simulation.height,r=(e,n)=>n*(t+1)+e;for(let i=0;i<n;i++)for(let n=0;n<t;n++){let t=e[r(n,i)],a=e[r(n+1,i)],o=e[r(n,i+1)],s=e[r(n+1,i+1)];this.addTriangleNormal(t,a,s),this.addTriangleNormal(t,s,o)}for(let t of e){let e=t.normal,n=Math.hypot(e[0],e[1],e[2]);n>0&&(e[0]/=n,e[1]/=n,e[2]/=n)}}createWireframeVertices(){let e=[],t=this.simulation.width,n=this.simulation.height,r=this.simulation.points;function i(e,n){return n*(t+1)+e}function a(e){let r=e.position[0]-t/2,i=e.position[1]-n/2,a=e.position[2],o=.08;return[(r-i)*o,(r+i)*o*.5-a*o]}function o(t,n){let[r,i]=a(t),[o,s]=a(n);e.push(r,i,.18,.18,.18,o,s,.18,.18,.18)}for(let e=0;e<=n;e++)for(let a=0;a<=t;a++){let s=r[i(a,e)];a<t&&o(s,r[i(a+1,e)]),e<n&&o(s,r[i(a,e+1)]),a<t&&e<n&&o(s,r[i(a+1,e+1)])}return new Float32Array(e)}createMarkerVertices(){let e=[],t=this.simulation.width,n=this.simulation.height,r=this.simulation.points;function i(e){let r=e.position[0]-t/2,i=e.position[1]-n/2,a=e.position[2],o=.08;return[(r-i)*o,(r+i)*o*.5-a*o]}function a(t,n,r,i,a){e.push(t,n,a[0],a[1],a[2],r,i,a[0],a[1],a[2])}function o(e,t,n){let[r,o]=i(e);a(r-t,o,r+t,o,n),a(r,o-t,r,o+t,n)}for(let e of r)e.pinned&&o(e,.025,[1,0,0]);for(let e of r)e.driven&&o(e,.03,[0,.3,1]);return new Float32Array(e)}createLineVertexBuffer(){let e=this.createWireframeVertices();this.lineVertexCount=e.length/5,this.lineVertexBuffer=this.device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.lineVertexBuffer,0,e)}createMarkerVertexBuffer(){let e=this.createMarkerVertices();this.markerVertexCount=e.length/5,this.markerVertexBuffer=this.device.createBuffer({size:e.byteLength,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.COPY_DST}),this.device.queue.writeBuffer(this.markerVertexBuffer,0,e)}updateVertexBuffers(){let e=this.createVerticesFromSimulation();this.vertexCount=e.length/5,this.device.queue.writeBuffer(this.vertexBuffer,0,e);let t=this.createWireframeVertices();this.lineVertexCount=t.length/5,this.device.queue.writeBuffer(this.lineVertexBuffer,0,t);let n=this.createMarkerVertices();this.markerVertexCount=n.length/5,this.device.queue.writeBuffer(this.markerVertexBuffer,0,n)}addTriangleNormal(e,t,n){let r=t.position[0]-e.position[0],i=t.position[1]-e.position[1],a=t.position[2]-e.position[2],o=n.position[0]-e.position[0],s=n.position[1]-e.position[1],c=n.position[2]-e.position[2],l=i*c-a*s,u=a*o-r*c,d=r*s-i*o;for(let r of[e,t,n])r.normal[0]+=l,r.normal[1]+=u,r.normal[2]+=d}render(){this.updateVertexBuffers();let e=this.device.createCommandEncoder(),t=this.context.getCurrentTexture().createView(),n=e.beginRenderPass({colorAttachments:[{view:t,clearValue:{r:.02,g:.02,b:.02,a:1},loadOp:`clear`,storeOp:`store`}]});n.setPipeline(this.clothPipeline),n.setVertexBuffer(0,this.vertexBuffer),n.draw(this.vertexCount),n.setPipeline(this.linePipeline),n.setVertexBuffer(0,this.lineVertexBuffer),n.draw(this.lineVertexCount),n.setPipeline(this.markerPipeline),n.setVertexBuffer(0,this.markerVertexBuffer),n.draw(this.markerVertexCount),n.end(),this.device.queue.submit([e.finish()])}},r=class{constructor(e,t){this.width=e,this.height=t,this.points=[],this.time=0,this.driverX=Math.floor(e/2),this.driverY=Math.floor(t/2),this.gravityEnabled=!1;for(let n=0;n<=t;n++)for(let r=0;r<=e;r++)this.points.push({position:[r,n,0],previousPosition:[r,n,0],pinned:r===0&&n===0||r===e&&n===0||r===0&&n===t||r===e&&n===t,driven:r===this.driverX&&n===this.driverY})}index(e,t){return t*(this.width+1)+e}update(e){this.time+=e;for(let t of this.points){if(t.pinned||t.driven)continue;let n=t.position[0],r=t.position[1],i=t.position[2],a=t.previousPosition[0],o=t.previousPosition[1],s=t.previousPosition[2],c=(n-a)*.995,l=(r-o)*.995,u=(i-s)*.995;t.previousPosition=[n,r,i],t.position[0]=n+c,t.position[1]=r+l,t.position[2]=i+u,this.gravityEnabled&&(t.position[2]-=8*e*e)}this.updateDrivenPoint();for(let e=0;e<12;e++)this.satisfyConstraints(),this.updateDrivenPoint()}updateDrivenPoint(){let e=this.points[this.index(this.driverX,this.driverY)],t=1.2*Math.sin(this.time*2);e.position[0]=this.driverX,e.position[1]=this.driverY,e.position[2]=t,e.previousPosition[0]=e.position[0],e.previousPosition[1]=e.position[1],e.previousPosition[2]=e.position[2]}satisfyConstraints(){let e=(e,t,n)=>{let r=t.position[0]-e.position[0],i=t.position[1]-e.position[1],a=t.position[2]-e.position[2],o=Math.sqrt(r*r+i*i+a*a);if(o===0)return;let s=(o-n)/o,c=r*.5*s,l=i*.5*s,u=a*.5*s;!e.pinned&&!e.driven&&(e.position[0]+=c,e.position[1]+=l,e.position[2]+=u),!t.pinned&&!t.driven&&(t.position[0]-=c,t.position[1]-=l,t.position[2]-=u)},t=Math.sqrt(2);for(let n=0;n<=this.height;n++)for(let r=0;r<=this.width;r++){let i=this.points[this.index(r,n)];r<this.width&&e(i,this.points[this.index(r+1,n)],1),n<this.height&&e(i,this.points[this.index(r,n+1)],1),r<this.width&&n<this.height&&e(i,this.points[this.index(r+1,n+1)],t),r>0&&n<this.height&&e(i,this.points[this.index(r-1,n+1)],t)}}};document.querySelector(`#app`).innerHTML=`
    <label class="controls">
        <input id="gravity-checkbox" type="checkbox">
        Включить гравитацию
    </label>
    <canvas id="webgpu-canvas"></canvas>
`;async function i(){let e=document.querySelector(`#webgpu-canvas`),t=new r(12,8),i=document.querySelector(`#gravity-checkbox`);i.addEventListener(`change`,()=>{t.gravityEnabled=i.checked});let a=new n(e,t);await a.init();let o=performance.now();function s(e){let n=(e-o)/1e3;o=e,t.update(n),a.render(),requestAnimationFrame(s)}requestAnimationFrame(s)}i();