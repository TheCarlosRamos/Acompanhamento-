
(function(){
  const $ = (s,root=document)=>root.querySelector(s);
  const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
  
  // Dicionário de traduções
  const translations = {
    // Subsetores
    'Highway': 'Rodovia',
    'Seaport': 'Porto Marítimo',
    'Intercity Rail': 'Ferrovia Intercidades',
    'School': 'Escola',
    'Solid Waste Facility': 'Instalação de Resíduos Sólidos',
    'Street Lighting': 'Iluminação Pública',
    'Other Water & Waste': 'Outros Água e Resíduos',
    'Other Energy': 'Outra Energia',
    'Other': 'Outros',
    
    // Subsetores adicionais
    'Airport': 'Aeroporto',
    'Hospital': 'Hospital',
    'Housing': 'Habitação',
    'Irrigation': 'Irrigação',
    'Metro': 'Metrô',
    'Other Transport': 'Outro Transporte',
    'Prison': 'Penitenciária',
    'Tourist Facility': 'Instalação Turística',
    'Transmission Line': 'Linha de Transmissão',
    'Waste Water Treatment': 'Tratamento de Águas Residuais',
    'Water Supply Infrastructure': 'Infraestrutura de Abastecimento de Água',
    
    // Setores
    'Transport': 'Transporte',
    'Social Infrastructure': 'Infraestrutura Social',
    'Water & Waste': 'Água e Resíduos',
    'Urban Services': 'Serviços Urbanos',
    'Energy': 'Energia',
  };

  // Função de tradução
  function translate(text) {
    if (!text) return text;
    return translations[text] || text;
  }
  
  const phaseCols = [
    ['Estudos','status_dos_estudos'],['Consulta Pública','status_consulta_publica'],['TCU','status_do_tcu'],['Edital','status_do_edital'],['Leilão','status_do_leilao'],['Contrato','status_do_contrato']
  ];
  function lastCompletedIdx(rec){ let last=-1; for(let i=0;i<phaseCols.length;i++){ const v=(rec[phaseCols[i][1]]||'').toString().toLowerCase(); if(v.includes('conclu')||v.includes('completed')||v.includes('assinado')||v.includes('assinatura')) last=i;} return last; }
  function timelineHTML(rec){ 
    const states = phaseCols.map(_=>false); 
    const last = lastCompletedIdx(rec); 
    if(last >= 0){ 
        for(let i = 0; i <= last; i++) states[i] = true; 
    } 
    const completed = states.filter(Boolean).length; 
    const width = (completed/phaseCols.length*100).toFixed(2) + '%'; 
    
    const items = phaseCols.map((p, i) => {
        const isCompleted = states[i];
        const isCurrent = i === last + 1 && last >= 0;
        
        let statusClass = '';
        let statusIcon = '';
        let statusText = '';
        
        if (isCompleted) {
            statusClass = 'completed';
            statusIcon = '✓';
            statusText = 'Concluído';
        } else if (isCurrent) {
            statusClass = 'current';
            statusIcon = '';
            statusText = rec[phaseCols[i][1]] || 'Em andamento';
        } else {
            statusText = 'Pendente';
        }
        
        return `<div class="phase-item group" data-phase="${p[0].toLowerCase().replace(/\s+/g, '-')}">
            <div class="phase-dot ${statusClass}" title="${p[0]}: ${statusText}">
                ${statusIcon}
            </div>
            <div class="phase-label ${statusClass}">
                <span class="font-medium">${p[0]}</span>
                <div class="text-xs opacity-80 mt-0.5">${statusText}</div>
            </div>
        </div>`;
    }).join('');
    
    return `<div class="phase-timeline">
        <div class="phase-line"></div>
        <div class="phase-line-completed" style="width: ${width}"></div>
        <div class="phase-items">${items}</div>
    </div>`;
}

  function makeBars(container, obj, valueFormatter){ const entries=Object.entries(obj||{}); const total=entries.reduce((a,[_k,v])=>a+(typeof v==='number'?v:0),0); container.innerHTML = entries.sort((a,b)=>b[1]-a[1]).map(([k,v])=>{ const pct = total? (v/total*100).toFixed(1):0; const label=valueFormatter? valueFormatter(k): k; return `<div class="bar"><div class="lbl">${label}</div><div class="track"><div class="fill" style="width:${pct}%"></div></div><div style="width:80px;text-align:right; font-size:11px; flex-shrink:0;">${(typeof v==='number')? v.toLocaleString('pt-BR'): v}</div></div>`; }).join(''); }

  function createPieChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const entries = Object.entries(data);
    if (entries.length === 0) return;
    
    const colors = [
      '#1E40AF', '#0891B2', '#059669', '#10B981', '#3B82F6', 
      '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'
    ];
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: entries.map(([k]) => translate(k)),
        datasets: [{
          data: entries.map(([,v]) => v),
          backgroundColor: colors.slice(0, entries.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 12,
              font: { size: 11 },
              boxWidth: 12
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((context.parsed / total) * 100).toFixed(1);
                return `${context.label}: ${context.parsed} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  // ----- INDEX (landing) -----
  async function initIndex(){
    if(!$('#bars-setor')) return; // not on index
    const METRICS = await (await fetch('data/metrics.json')).json();// KPIs

    // barras por setor (contagem)
    makeBars($('#bars-setor'), METRICS.por_setor||{}, k=>translate(k));
    
    // gráfico de pizza por setor
    createPieChart('pie-setor', METRICS.por_setor||{}, 'Projetos por Setor');

    // barras por última etapa concluída (contagem)
    makeBars($('#bars-etapa'), METRICS.por_ultima_etapa_concluida||{});
    
    // gráfico de pizza por etapa
    createPieChart('pie-etapa', METRICS.por_ultima_etapa_concluida||{}, 'Projetos por Etapa');

    // barras de custo por setor (BRL se existir)
    const byCur = METRICS.custos_por_setor_por_moeda||{}; const brlObj = byCur['BRL']||{}; const formatted = {}; Object.keys(brlObj).forEach(k=> formatted[k]=brlObj[k]); makeBars($('#bars-custo-setor-brl'), formatted, k=>translate(k));

    // por UF (top 10)
    const porUF = METRICS.por_uf||{}; const topUF = Object.fromEntries(Object.entries(porUF).slice(0,10)); makeBars($('#bars-uf'), topUF);

    // Top 10 BRL
    $('#top10').innerHTML = (METRICS.top10_custo_brl||[]).map((x,i)=>`<div class="bar"><div class="lbl">${i+1}. ${esc(x.nome)}</div><div class="track"><div class="fill" style="width:100%"></div></div><div style="width:120px;text-align:right; font-size:12px;">${fmt('BRL',x.valor)}</div></div>`).join('');

    // mapa com clustering
    const DATA = await (await fetch('data/projects_full.json')).json();
    initMapCluster(DATA);

    // quick form -> projects
    $('#go').addEventListener('click', ()=>{ const q=enc($('#q').value), s=enc($('#sector').value), e=enc($('#etapa').value); location.href=`projects.html?q=${q}&sector=${s}&etapa=${e}`; });
  }

  function esc(s){ return (s||'').toString().replace(/[&<>]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m])); }
  function enc(s){ return encodeURIComponent(s||''); }
  function fmt(cur, val){ try{ return new Intl.NumberFormat('pt-BR',{style:'currency',currency:cur}).format(val);}catch(e){ return `${cur} ${Number(val).toLocaleString('pt-BR')}`; } }
  function tableFromCosts(obj){ const rows = Object.entries(obj).map(([cur,v])=>`<tr><td>${cur}</td><td style="text-align:right">${fmt(cur,v.soma)}</td><td style="text-align:right">${fmt(cur,v.min)}</td><td style="text-align:right">${fmt(cur,v.max)}</td><td style="text-align:right">${fmt(cur,v.media)}</td><td style="text-align:right">${fmt(cur,v.mediana)}</td><td style="text-align:right">${v.projetos_com_custo}</td></tr>`).join(''); return `<div class="table"><table><thead><tr><th>Moeda</th><th>Soma</th><th>Mín</th><th>Máx</th><th>Média</th><th>Mediana</th><th>Projetos</th></tr></thead><tbody>${rows||'<tr><td colspan="7">—</td></tr>'}</tbody></table></div>`; }

  function initMapCluster(DATA){
    if(typeof L==='undefined'){ $('#map').textContent='(Mapa requer conexão para carregar a biblioteca Leaflet)'; return; }
    const map = L.map('map').setView([-14.2,-51.9], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);
    let group;
    if(window.L && L.markerClusterGroup){ group = L.markerClusterGroup(); map.addLayer(group);} else { group = L.layerGroup().addTo(map); }
    DATA.forEach(p=>{ const lat=parseFloat(p.latitude), lon=parseFloat(p.longitude); if(!isNaN(lat)&&!isNaN(lon)){ const t=(p.nome_completo||p.nome_projeto||'Projeto'); const s=(p.setor||''); const pop = `<strong>${esc(t)}</strong><br/><small>${esc(s)}</small>`; const m = L.marker([lat,lon]).bindPopup(pop); group.addLayer(m);} });
    try{ if(group.getLayers && group.getLayers().length){ map.fitBounds(group.getBounds(), {padding:[20,20]}); } }catch(e){}
  }

  // ----- PROJECTS (filters & cards) -----
  async function initProjects(){
    if(!$('#grid')) return; // not on projects
    const DATA = await (await fetch('data/projects_full.json')).json();
    
    // Adicionar filtro de subsetor
    const subsetorSel = $('#subsetor');
    const subsetores = [...new Set(DATA.map(p=>p.subsetor).filter(Boolean))].sort(); 
    subsetores.forEach(v=>{ 
      const o=document.createElement('option'); 
      o.value=v; 
      o.textContent=translate(v); 
      subsetorSel.appendChild(o); 
    });
    
    // Adicionar filtro de subsecretaria
    const subsecretariaSel = $('#subsecretaria');
    const subsecretarias = [...new Set(DATA.map(p=>p.subsecretaria).filter(Boolean))].sort(); 
    subsecretarias.forEach(v=>{ 
      const o=document.createElement('option'); 
      o.value=v; 
      o.textContent=v; 
      subsecretariaSel.appendChild(o); 
    });

    const params = new URLSearchParams(location.search); 
    $('#q').value=params.get('q')||''; 
    $('#subsetor').value=params.get('subsetor')||''; 
    $('#subsecretaria').value=params.get('subsecretaria')||''; 
    $('#etapa').value=params.get('etapa')||'';

    function cardTemplate(p){ 
    const nome = p.nome_completo || p.nome_projeto || 'Projeto';
    const setor = p.setor || '';
    // Resumir descrição: mostrar o texto original do JSON (truncar levemente se muito longo)
    function resumirDescricao(texto) {
      if (!texto) return '—';
      const s = texto.toString().trim();
      if (s.length <= 1000) return s;
      // truncar sem cortar palavra
      const cut = s.slice(0, 1000).replace(/\s+\S*$/, '');
      return cut + '…';
    }
    let desc = resumirDescricao(p.descricao_do_projeto || p.descricao_curta || '');
    const situ = p.status_atual_do_projeto || '—';
    const proximasEtapas = p.proximas_etapas || p.deliberacao || '—';
    const riscos = p.questoes_chaves || '';
    const lat = parseFloat(p.latitude), lon = parseFloat(p.longitude);
    
    // bloco do mini-mapa
    const hasCoords = !isNaN(lat) && !isNaN(lon);
    const miniMapBlock = hasCoords
      ? `
      <div class="info-small">
        <h5>Mapa (nível: <span class="loc-level">${(window.LOC_LEVEL||'state')}</span>)</h5>
        <div class="mini-map"
             data-lat="${lat}"
             data-lon="${lon}">
        </div>
      </div>`
      : `
      <div class="info-small">
        <h5>Mapa</h5>
        <p>Localização não disponível</p>
      </div>`;
    
    const riscosList = riscos ? 
        riscos.split(/\n|;|•/).filter(x => x.trim()).map(x => `<li>${esc(x.trim())}</li>`).join('') : 
        '<li>Nenhum ponto de atenção identificado</li>';
    
    return `<article class="card">
      <div class="card-header">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div>
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">${esc(setor)}</p>
            <h3 style="color: #1f2937; font-size: 20px; margin: 0; font-weight: 700;">${esc(nome)}</h3>
          </div>
        </div>
      </div>

      <div class="project-info-grid">
        <div class="left-col">
          <div class="info-large description">
            <h4>Descrição</h4>
            <p>${esc(desc)}</p>
          </div>

          <div class="row-2cols">
            <div class="info-small">
              <h5>Situação Atual</h5>
              <p>${esc(situ)}</p>
            </div>

            <div class="info-small">
              <h5>Próximos Passos</h5>
              <p>${esc(proximasEtapas)}</p>
            </div>
          </div>

          <div class="info-large">
            <h4>Pontos de Atenção</h4>
            <ul class="list-disc list-inside space-y-1 text-gray-700">
              ${riscosList}
            </ul>
          </div>
        </div>

        <div class="right-col">
          ${miniMapBlock}
        </div>

        <div class="timeline-col">
          <h4>ETAPA</h4>
          ${timelineHTML(p)}
        </div>
      </div>
    </article>`;
}

    const etapaSel = $('#etapa'); const etapaLabels=['Nenhuma', ...phaseCols.map(p=>p[0])]; etapaLabels.forEach(l=>{ const o=document.createElement('option'); o.value=o.textContent=l; etapaSel.appendChild(o); });

    function apply(){ 
      const q=($('#q').value||'').toLowerCase().trim(); 
      const subsetor=$('#subsetor').value||''; 
      const subsecretaria=$('#subsecretaria').value||''; 
      const etapa=$('#etapa').value||''; 
      const filtered = DATA.filter(p=>{ 
        const okQ=!q || ((p.nome_completo||'').toLowerCase().includes(q) || (p.descricao_do_projeto||'').toLowerCase().includes(q) || (p.localizacoes||'').toLowerCase().includes(q)); 
        const okSub=!subsetor||(p.subsetor===subsetor); 
        const okSubsec=!subsecretaria||(p.subsecretaria===subsecretaria); 
        let okE=true; 
        if(etapa){ 
          const idx=lastCompletedIdx(p); 
          const lab=idx<0?'Nenhuma':phaseCols[idx][0]; 
          okE=(lab===etapa);
        } 
        return okQ&&okSub&&okSubsec&&okE; 
      }); 
      $('#grid').innerHTML = filtered.map(cardTemplate).join(''); 
      $('#count').textContent = String(filtered.length); 
      renderMiniMaps(); 
    }

    ['q','subsetor','subsecretaria','etapa'].forEach(id=> $('#'+id).addEventListener('input', apply)); 
    $('#clear').addEventListener('click', ()=>{ 
      ['q','subsetor','subsecretaria','etapa'].forEach(id=> $('#'+id).value=''); 
      apply(); 
    });
    
    // Conectar o seletor de precisão
    const precisionSel = document.getElementById('precision');
    if(precisionSel){
      precisionSel.addEventListener('change', () => {
        window.LOC_LEVEL = precisionSel.value;
        renderMiniMaps();
      });
      window.LOC_LEVEL = precisionSel.value;
    }
    
    apply();
  }

  // Nível de localização padrão (atualizado pelo select #precision)
  window.LOC_LEVEL = 'state'; // 'coords' | 'city' | 'state'

  function getZoomByLevel(level){
    if(level === 'city') return 10;   // cidade
    if(level === 'state') return 6;   // estado
    return 12;                        // coordenadas (mais perto)
  }

  function renderMiniMaps(){
  if(typeof L === 'undefined') return;

  const level = window.LOC_LEVEL || 'state';
  const zoom = getZoomByLevel(level);

  document.querySelectorAll('.mini-map').forEach(async (el) => {
    const lat = parseFloat(el.getAttribute('data-lat'));
    const lon = parseFloat(el.getAttribute('data-lon'));
    if(isNaN(lat) || isNaN(lon)) return;

    // Limpa render anterior
    if(el._leaflet_map) { try { el._leaflet_map.remove(); } catch(e){} el._leaflet_map = null; }
    el.innerHTML = '';

    const map = L.map(el, {
      zoomControl: false,
      attributionControl: false
    }).setView([lat, lon], zoom);

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      crossOrigin: true
    }).addTo(map);

    // --- IMPORTANTE: forçar renderer canvas no marcador
    const canvasRenderer = L.canvas({ padding: 0.5 });

    const marker = L.circleMarker([lat, lon], {
      renderer: canvasRenderer,
      radius: 6,
      color: '#1E40AF',
      weight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.9
    }).addTo(map);

    // Aguarda o mapa terminar de desenhar
    await new Promise((resolve) => {
      // 'idle' nem sempre dispara em todas as combinações;
      // garantimos também um pequeno delay após 'load'
      let done = false;
      function finish(){ if(done) return; done = true; setTimeout(resolve, 60); }
      map.once('load', finish);
      tiles.once('load', finish);
      // fallback timeout
      setTimeout(finish, 500);
    });

    // Ajusta tamanhos e guarda instância
    map.invalidateSize(false);
    el._leaflet_map = map;

    const labelSpan = el.closest('.info-small')?.querySelector('.loc-level');
    if(labelSpan) labelSpan.textContent = level;
  });
}

  // Congela todos os mapas dentro de um container de card (clone) em IMG estática
  async function freezeMapsForPDF(cardRoot){
    const maps = Array.from(cardRoot.querySelectorAll('.mini-map'));

    const tasks = maps.map((el) => new Promise((resolve) => {
      const map = el._leaflet_map;
      if(!map || typeof window.leafletImage !== 'function'){
        resolve();
        return;
      }

      // Coordenadas do ponto central (as mesmas do dataset do elemento)
      const lat = parseFloat(el.getAttribute('data-lat'));
      const lon = parseFloat(el.getAttribute('data-lon'));
      const hasPoint = !isNaN(lat) && !isNaN(lon);

      // Aguarda um tiquinho caso ainda haja draw pendente
      setTimeout(() => {
        try {
            window.leafletImage(map, function(err, canvas){
              if(err || !canvas){
                resolve();
                return;
              }

              // ---- Fallback: desenha a bolinha manualmente no canvas
              if(hasPoint){
                const pt = map.latLngToContainerPoint([lat, lon]);
                const ctx = canvas.getContext('2d');

                // halo externo (borda)
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#1E40AF'; // azul escuro (borda)
                ctx.stroke();

                // preenchimento interno
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
                ctx.fillStyle = '#3B82F6'; // azul mais claro (preenchimento)
                ctx.globalAlpha = 0.95;
                ctx.fill();
                ctx.globalAlpha = 1.0;
              }

              // Converte o canvas final para <img>
              const img = document.createElement('img');
              img.src = canvas.toDataURL('image/png');
              img.alt = 'Mapa estático';
              img.style.width = '100%';
              img.style.height = '100%';
              img.style.display = 'block';

              // Substitui o conteúdo
              el.innerHTML = '';
              el.appendChild(img);

              // Remove a instância do mapa
              try { map.remove(); } catch(e){}
              el._leaflet_map = null;

              resolve();
            });
        } catch (e) {
          resolve();
        }
      }, 40);
    }));

    await Promise.all(tasks);
  }

  document.addEventListener('DOMContentLoaded', ()=>{ initIndex(); initProjects();
    const exportBtn = document.getElementById('export-pdf');
    if(exportBtn){
      exportBtn.addEventListener('click', async ()=>{
        const grid = document.getElementById('grid');
        if(!grid) return alert('Nenhum card disponível para exportar.');

        // Opções do PDF
        const pdf = new window.jspdf.jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: 'a4'
        });

        // Adiciona a capa como imagem (se desejar, pode ser canvas também)
        const capaImg = new window.Image();
        capaImg.src = 'assets/CAPA.pptx.png';
        await new Promise(resolve => { capaImg.onload = resolve; });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const capaRatio = capaImg.width / capaImg.height;
        let capaW = pageWidth * 0.9;
        let capaH = capaW / capaRatio;
        if (capaH > pageHeight * 0.9) {
          capaH = pageHeight * 0.9;
          capaW = capaH * capaRatio;
        }
        pdf.addImage(capaImg, 'PNG', (pageWidth-capaW)/2, 40, capaW, capaH);
        pdf.addPage();

        // Cards
        const cards = Array.from(grid.querySelectorAll('.card'));
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          
          // MUITO IMPORTANTE: Congela os mapas no DOM original antes de clonar
          await freezeMapsForPDF(card);
          
          // Clona o card para não afetar o DOM
          const cardClone = card.cloneNode(true);
          cardClone.style.margin = '0';
          cardClone.style.boxShadow = 'none';
          cardClone.style.background = '#fff';
          cardClone.style.border = 'none';
          cardClone.style.width = card.offsetWidth + 'px';
          cardClone.style.maxWidth = 'none';
          cardClone.style.minHeight = '0';

          // Cria um container temporário
          const tempDiv = document.createElement('div');
          tempDiv.style.padding = '40px';
          tempDiv.style.background = '#fff';
          tempDiv.appendChild(cardClone);
          document.body.appendChild(tempDiv);

          // Usa html2canvas para capturar o card como imagem
          const canvas = await window.html2canvas(tempDiv, { scale: 2, useCORS: true });
          const imgData = canvas.toDataURL('image/png');
          // Calcula o tamanho máximo possível para caber na folha A4 paisagem (agora 99%)
          let maxW = pageWidth * 0.99;
          let maxH = pageHeight * 0.99;
          let ratio = Math.min(maxW / canvas.width, maxH / canvas.height);
          let imgWidth = canvas.width * ratio;
          let imgHeight = canvas.height * ratio;
          let posX = (pageWidth - imgWidth) / 2;
          let posY = (pageHeight - imgHeight) / 2;

          pdf.addImage(imgData, 'PNG', posX, posY, imgWidth, imgHeight);
          if (i < cards.length - 1) pdf.addPage();

          document.body.removeChild(tempDiv);
        }

        // Remove página extra se criada
        if (pdf.getNumberOfPages() > cards.length + 1) pdf.deletePage(pdf.getNumberOfPages());

        // Nome do arquivo com filtros aplicados
        const q = $('#q').value.trim();
        const subsetor = $('#subsetor').value;
        const subsecretaria = $('#subsecretaria').value;
        const etapa = $('#etapa').value;
        
        let filename = 'projetos';
        const filters = [];
        if (subsetor) filters.push(translate(subsetor));
        if (subsecretaria) filters.push(subsecretaria);
        if (etapa) filters.push(etapa);
        if (q) filters.push(`busca_${q.replace(/\s+/g, '_')}`);
        
        if (filters.length > 0) {
          filename += '_' + filters.join('_');
        }
        filename += '.pdf';

        pdf.save(filename);
      });
    }
  });
})();
