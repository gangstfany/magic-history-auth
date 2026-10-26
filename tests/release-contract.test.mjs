import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,mkdtempSync,cpSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const manifest=JSON.parse(readFileSync(path.join(root,'auth-manifest.json'),'utf8'));
test('release manifest resolves exact integration paths and includes pinned SDK license',()=>{
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.entry,'assets/auth/account-bootstrap.mjs');
 assert.equal(manifest.callback,'auth-callback.html');
 assert.ok(manifest.consumerFiles.includes('assets/vendor/SUPABASE-LICENSE'));
 for(const file of manifest.consumerFiles){assert.ok(!path.isAbsolute(file)&&!file.includes('..'));assert.ok(existsSync(path.join(root,file)));}
 const callback=readFileSync(path.join(root,manifest.callback),'utf8');
 assert.doesNotMatch(callback,/assets\/map-ui\.css/);
 assert.match(callback,/assets\/auth\/account-bootstrap\.mjs/);
});
test('build publishes explicit public release only and removes stale output',()=>{
 const temp=mkdtempSync(path.join(tmpdir(),'magic-auth-release-'));
 try{
  for(const file of ['assets','scripts','index.html','auth-callback.html','auth-manifest.json']) cpSync(path.join(root,file),path.join(temp,file),{recursive:true});
  writeFileSync(path.join(temp,'.env'),'DO_NOT_PUBLISH=private-test-placeholder');
  execFileSync('python3',['scripts/build.py'],{cwd:temp});
  const output=path.join(temp,'_site');
  assert.ok(existsSync(path.join(output,'.nojekyll')));
  assert.ok(!existsSync(path.join(output,'.env')));
  assert.ok(!existsSync(path.join(output,'scripts')));
  for(const file of manifest.consumerFiles) assert.equal(readFileSync(path.join(output,file),'utf8'),readFileSync(path.join(temp,file),'utf8'));
  writeFileSync(path.join(output,'stale.txt'),'stale');
  execFileSync('python3',['scripts/build.py'],{cwd:temp});
  assert.ok(!existsSync(path.join(output,'stale.txt')));
 }finally{rmSync(temp,{recursive:true,force:true});}
});
