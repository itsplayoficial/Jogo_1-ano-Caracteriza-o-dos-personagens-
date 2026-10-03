import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
const bundle=await build({entryPoints:['source/scene3d.js'],bundle:true,minify:true,format:'iife',write:false});
const file=await readFile('index.html','utf8');
const next=file.replace(/<!--ROBOT3D_START-->[\s\S]*?<!--ROBOT3D_END-->/,()=> '<!--ROBOT3D_START--><script>'+bundle.outputFiles[0].text+'</script><!--ROBOT3D_END-->');
await writeFile('index.html',next);
console.log('Jogo 3D compilado em index.html');
