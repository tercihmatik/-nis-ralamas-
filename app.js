const $ = id => document.getElementById(id);
let programs = [];
const fields = ["year","university","program","city","kind","scoreType","score","rank","quota"];
function parseCSV(text){
  const rows=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i], n=text[i+1];
    if(c === '"' && quoted && n === '"'){cell+='"';i++}
    else if(c === '"'){quoted=!quoted}
    else if(c === ',' && !quoted){row.push(cell);cell=""}
    else if((c === '\n' || c === '\r') && !quoted){if(c==='\r'&&n==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell=""}
    else cell+=c;
  }
  row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
  if(!rows.length)return [];
  const headers=rows.shift().map(x=>x.trim().replace(/^\uFEFF/,"").toLowerCase());
  return rows.map(r=>Object.fromEntries(fields.map(f=>{const idx=headers.indexOf(f);return [f,idx>=0?(r[idx]||"").trim():""]}))).filter(x=>x.university||x.program);
}
function num(v){if(!v)return NaN;return Number(String(v).replace(/\./g,"").replace(",", "."))}
function render(){
  const q=$("search").value.trim().toLocaleLowerCase("tr");
  const year=$("year").value,kind=$("kind").value,type=$("scoreType").value,city=$("city").value.trim().toLocaleLowerCase("tr");
  let list=programs.filter(p=>(!p.year||p.year===year)&&(!kind||p.kind===kind)&&(!type||p.scoreType===type)&&(!city||(p.city||"").toLocaleLowerCase("tr").includes(city))&&(!q||`${p.university} ${p.program} ${p.city}`.toLocaleLowerCase("tr").includes(q)));
  const sort=$("sort").value;
  list.sort((a,b)=>sort==="name"?a.university.localeCompare(b.university,"tr"):sort==="score"?num(b.score)-num(a.score):sort==="rank-desc"?num(b.rank)-num(a.rank):num(a.rank)-num(b.rank));
  $("resultCount").textContent=`${list.length} program listeleniyor`;
  $("results").innerHTML=list.length?list.map(p=>`<tr><td>${esc(p.university)}<br><span style="font-weight:500;color:#718096">${esc(p.program)}</span></td><td>${esc(p.city)}</td><td>${esc(p.scoreType)}</td><td>${esc(p.score||"—")}</td><td>${esc(p.rank||"—")}</td><td>${esc(p.quota||"—")}</td></tr>`).join(""):`<tr><td colspan="6" class="empty"><strong>Sonuç bulunamadı</strong><p>Arama veya filtrelerini değiştirebilirsin.</p></td></tr>`;
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
["search","year","kind","scoreType","city","sort"].forEach(id=>$(id).addEventListener(id==="search"||id==="city"?"input":"change",render));
$("clearSearch").onclick=()=>{$("search").value="";render()};
document.querySelectorAll("[data-query]").forEach(b=>b.onclick=()=>{$("search").value=b.dataset.query;render();$("kesfet").scrollIntoView({behavior:"smooth"})});
$("csvFile").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{programs=parseCSV(await file.text());render();}catch(err){alert("CSV dosyası okunamadı. Şablondaki sütun adlarını kontrol et.")}});
async function loadData() {
  try {
    const response = await fetch("./programs.csv");
    if (!response.ok) throw new Error("CSV yüklenemedi");

    const csv = await response.text();
    programs = parseCSV(csv);
    render();
  } catch (error) {
    console.error("Veri yükleme hatası:", error);
    alert("Veriler yüklenemedi. CSV dosyasını kontrol et.");
  }
}

loadData();
