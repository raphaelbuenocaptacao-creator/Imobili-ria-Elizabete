const properties=[
{id:1,title:'Casa Bosque Alto',type:'Casa',purpose:'Venda',city:'Campos do Jordão',neighborhood:'Alto do Capivari',price:1850000,beds:4,baths:4,area:310,garage:3,image:'https://images.unsplash.com/photo-1600585152915-d208bec867a1?auto=format&fit=crop&w=1200&q=88',description:'Arquitetura contemporânea, lareira, integração com o verde e ambientes amplos para receber com conforto.'},
{id:2,title:'Apartamento Horizonte',type:'Apartamento',purpose:'Venda',city:'São José dos Campos',neighborhood:'Jardim Aquarius',price:890000,beds:3,baths:3,area:142,garage:2,image:'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1200&q=88',description:'Vista aberta, planta generosa e acabamentos sofisticados em uma das regiões mais desejadas da cidade.'},
{id:3,title:'Refúgio da Serra',type:'Casa',purpose:'Locação',city:'Campos do Jordão',neighborhood:'Descansópolis',price:14500,beds:5,baths:5,area:420,garage:4,image:'https://images.unsplash.com/photo-1600047509358-9dc75507daeb?auto=format&fit=crop&w=1200&q=88',description:'Residência de alto padrão cercada pela natureza, perfeita para temporadas, família e experiências memoráveis.'},
{id:4,title:'Apartamento Jardim',type:'Apartamento',purpose:'Venda',city:'São Paulo',neighborhood:'Vila Mariana',price:1250000,beds:3,baths:2,area:118,garage:2,image:'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=88',description:'Design atual, luz natural e mobilidade urbana em uma combinação rara de conforto e localização.'},
{id:5,title:'Casa Araucária',type:'Casa',purpose:'Venda',city:'Campos do Jordão',neighborhood:'Vila Inglesa',price:2400000,beds:5,baths:6,area:520,garage:4,image:'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=88',description:'Uma casa com presença: pé-direito alto, grandes aberturas, jardim e atmosfera de refúgio sofisticado.'},
{id:6,title:'Terreno Vista Livre',type:'Terreno',purpose:'Venda',city:'Campos do Jordão',neighborhood:'Alto da Boa Vista',price:620000,beds:0,baths:0,area:980,garage:0,image:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=88',description:'Terreno com topografia favorável e vista privilegiada para quem deseja construir um projeto autoral na serra.'}
];

let favorites=new Set(JSON.parse(localStorage.getItem('elizabeth-favorites')||'[]'));
let showAll=false;
const grid=document.getElementById('propertyGrid');
const purpose=document.getElementById('purposeFilter');
const type=document.getElementById('typeFilter');
const city=document.getElementById('cityFilter');
const price=document.getElementById('priceFilter');

const currency=(value,purpose)=> purpose==='Locação' ? `${value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0})}/mês` : value.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0});

function propertyCard(p){
 const features=[];
 if(p.beds)features.push(`◫ ${p.beds} quartos`);
 if(p.baths)features.push(`◌ ${p.baths} banhos`);
 features.push(`⌗ ${p.area} m²`);
 return `<article class="property-card">
 <div class="property-image" style="background-image:url('${p.image}')"><span class="tag">${p.purpose.toUpperCase()}</span><button class="favorite ${favorites.has(p.id)?'active':''}" data-favorite="${p.id}" aria-label="Favoritar">${favorites.has(p.id)?'♥':'♡'}</button></div>
 <div class="property-body"><small>${p.city} • ${p.neighborhood}</small><h3>${p.title}</h3><p>${p.description}</p><div class="features">${features.map(x=>`<span>${x}</span>`).join('')}</div><div class="property-footer"><strong class="property-price">${currency(p.price,p.purpose)}</strong><button class="view-btn" data-view="${p.id}">Ver detalhes →</button></div></div></article>`;
}

function filteredProperties(){
 return properties.filter(p=>(purpose.value==='all'||p.purpose===purpose.value)&&(type.value==='all'||p.type===type.value)&&(city.value==='all'||p.city===city.value)&&(price.value==='all'||p.price<=Number(price.value)));
}
function render(){
 let list=filteredProperties();
 const visible=showAll?list:list.slice(0,3);
 grid.innerHTML=visible.length?visible.map(propertyCard).join(''):`<div style="grid-column:1/-1;text-align:center;padding:60px 20px"><h3 style="font-family:Playfair Display,serif;font-size:32px">Nenhum imóvel com esses filtros.</h3><p style="color:#6d7773">Tente ampliar sua busca ou fale conosco para uma curadoria personalizada.</p></div>`;
 document.getElementById('showAllBtn').textContent=showAll?'Mostrar menos':'Ver todos os imóveis';
 updateFavoriteCount();
}
function updateFavoriteCount(){document.getElementById('favoriteCount').textContent=favorites.size;}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2200)}
function saveFavorites(){localStorage.setItem('elizabeth-favorites',JSON.stringify([...favorites]));updateFavoriteCount();}
function openModal(p){
 const features=[p.beds?`${p.beds} quartos`:null,p.baths?`${p.baths} banheiros`:null,`${p.area} m²`,p.garage?`${p.garage} vagas`:null].filter(Boolean);
 document.getElementById('modalContent').innerHTML=`<div class="modal-hero" style="background-image:url('${p.image}')"></div><span class="eyebrow">${p.purpose.toUpperCase()} • ${p.city.toUpperCase()}</span><h2>${p.title}</h2><p style="color:#6d7773">${p.neighborhood}, ${p.city}</p><div class="modal-features">${features.map(f=>`<span>${f}</span>`).join('')}</div><h3 style="font-family:Playfair Display,serif;font-size:28px">${currency(p.price,p.purpose)}</h3><p style="color:#6d7773;line-height:1.8">${p.description} Entre em contato para disponibilidade, condições e agendamento de visita.</p><a href="#contato" class="primary-btn full" data-close-modal>Quero conhecer este imóvel →</a>`;
 const modal=document.getElementById('propertyModal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
}
function closeModal(){const modal=document.getElementById('propertyModal');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';}

document.addEventListener('click',e=>{
 const fav=e.target.closest('[data-favorite]');if(fav){const id=Number(fav.dataset.favorite);favorites.has(id)?favorites.delete(id):favorites.add(id);saveFavorites();render();toast(favorites.has(id)?'Imóvel salvo nos favoritos':'Imóvel removido dos favoritos');return;}
 const view=e.target.closest('[data-view]');if(view){openModal(properties.find(p=>p.id===Number(view.dataset.view)));return;}
 if(e.target.closest('[data-close-modal]'))closeModal();
});

document.getElementById('searchBtn').addEventListener('click',()=>{showAll=true;render();document.getElementById('imoveis').scrollIntoView({behavior:'smooth'});});
document.getElementById('showAllBtn').addEventListener('click',()=>{showAll=!showAll;render();});
[purpose,type,city,price].forEach(el=>el.addEventListener('change',render));
document.querySelectorAll('.category-card').forEach(btn=>btn.addEventListener('click',()=>{type.value=btn.dataset.type;showAll=true;render();document.getElementById('imoveis').scrollIntoView({behavior:'smooth'});}));
document.getElementById('openFavorites').addEventListener('click',()=>{if(!favorites.size)return toast('Você ainda não salvou nenhum imóvel');showAll=true;grid.innerHTML=properties.filter(p=>favorites.has(p.id)).map(propertyCard).join('');document.getElementById('imoveis').scrollIntoView({behavior:'smooth'});});

document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('mobileNav').classList.toggle('open'));
document.querySelectorAll('#mobileNav a').forEach(a=>a.addEventListener('click',()=>document.getElementById('mobileNav').classList.remove('open')));
document.getElementById('leadForm').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.currentTarget);const name=data.get('name').trim();localStorage.setItem('elizabeth-last-lead',JSON.stringify(Object.fromEntries(data.entries())));document.getElementById('formStatus').textContent=`Obrigada, ${name}. Seus dados foram registrados nesta demonstração.`;e.currentTarget.reset();toast('Solicitação registrada com sucesso');});

const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add('visible')),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));

let deferredPrompt;const installBtn=document.getElementById('installPwa');window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.hidden=false;});installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.hidden=true;});window.addEventListener('appinstalled',()=>toast('Elizabeth Imóveis foi instalado no seu dispositivo'));
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();