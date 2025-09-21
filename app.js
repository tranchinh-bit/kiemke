const $=id=>document.getElementById(id);
let state={entries:[],master:[]};

function escCSV(v){return '"' + String(v||'').replace(/"/g,'""') + '"';}
function escapeHtml(t){return String(t||'').replace(/[&<>]/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[s]));}

$('masterFile').addEventListener('change',e=>{
 const f=e.target.files[0]; if(!f)return;
 const r=new FileReader();
 r.onload=ev=>{
  state.master=ev.target.result.split(/\r?\n/).slice(1).map(l=>l.split(','));
 };
 r.readAsText(f,'utf-8');
});

$('downloadMaster').onclick=()=>{
 const csv='Tên sản phẩm,Mã vạch\nSỮA NUTI DÂU,20102010283';
 const blob=new Blob([csv],{type:'text/csv'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mau_danh_muc.csv';a.click();
};

$('clearBtn').onclick=()=>{if(confirm('Xóa toàn bộ dữ liệu?')){state.entries=[];render();}};

$('addBtn').onclick=()=>{
 const code=$('barcodeInput').value.trim();if(!code)return;
 const name=$('productName').textContent||'';
 const qtyF=+$('qtyFridge').value||0,qtyS=+$('qtyShelf').value||0,qtyK=+$('qtyStock').value||0;
 const total=qtyF+qtyS+qtyK;
 state.entries.push({time:new Date().toLocaleString(),barcode:code,name,fridge:qtyF,shelf:qtyS,stock:qtyK,sum:total});
 render();
};

function render(){
 renderTable();renderSummary();
}

function renderTable(){
 const tb=$('resultTable').querySelector('tbody');tb.innerHTML='';
 state.entries.forEach((r,i)=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${r.time}</td><td>${r.barcode}</td><td>${escapeHtml(r.name)}</td>
    <td>${r.fridge}</td><td>${r.shelf}</td><td>${r.stock}</td><td>${r.sum}</td>
    <td><button onclick="delRow(${i})">X</button></td>`;
  tb.appendChild(tr);
 });
}

function renderSummary(){
 const sums={};
 for(const r of state.entries){
  const code=r.barcode;
  if(!sums[code])sums[code]={name:r.name||'',barcode:code,total:0};
  sums[code].total+=r.sum||0;
 }
 const tb=$('sumTable').querySelector('tbody');tb.innerHTML='';
 Object.values(sums).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name)).forEach(row=>{
  const tr=document.createElement('tr');
  tr.innerHTML=`<td>${escapeHtml(row.name)}</td><td>${row.barcode}</td><td><b>${row.total}</b></td>`;
  tb.appendChild(tr);
 });
}

function exportCSV(){
 const sums={};
 for(const r of state.entries){
  const code=r.barcode;
  if(!sums[code])sums[code]={name:r.name||'',barcode:code,total:0};
  sums[code].total+=r.sum||0;
 }
 const head='Tên sản phẩm,Mã vạch,TỔNG SỐ LƯỢNG\n';
 const lines=Object.values(sums).map(row=>[escCSV(row.name),row.barcode,row.total].join(','));
 downloadText('tonghop_kiemke.csv',head+lines.join('\n'));
}

$('exportBtn').onclick=exportCSV;
function delRow(i){state.entries.splice(i,1);render();}

function downloadText(fn,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download=fn;a.click();}
