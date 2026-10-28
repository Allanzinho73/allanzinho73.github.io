/* Playable versions of my projects: the Brazilian air network (graph
   algorithms), an AVL tree, and the directory report script. Each one is a
   small re-creation that runs in the browser, not the original code. */
(() => {
  'use strict';

  const AKH = (window.AKH = window.AKH || {});
  AKH.actions = AKH.actions || [];

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const node = document.createElementNS(NS, tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (parent) parent.append(node);
    return node;
  };
  const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
  const onVisible = AKH.onVisible || ((target, fn) => fn());
  const scrollTo = AKH.scrollTo || ((target) => target.scrollIntoView());
  const km = (v) => `${Math.round(v).toLocaleString('en-US')} km`;

  /* =====================================================================
     Brazilian air network
     ===================================================================== */
  const airNetwork = () => {
    const card = $('#air');
    if (!card) return null;

    // [IATA, city, longitude, latitude, label side]
    const AIRPORTS = [
      ['GRU', 'São Paulo', -46.47, -23.43], ['GIG', 'Rio de Janeiro', -43.25, -22.81],
      ['BSB', 'Brasília', -47.92, -15.87], ['CNF', 'Belo Horizonte', -43.97, -19.62],
      ['SSA', 'Salvador', -38.32, -12.91], ['REC', 'Recife', -34.92, -8.13],
      ['FOR', 'Fortaleza', -38.53, -3.78], ['POA', 'Porto Alegre', -51.17, -29.99],
      ['CWB', 'Curitiba', -49.18, -25.53], ['FLN', 'Florianópolis', -48.55, -27.67],
      ['MAO', 'Manaus', -60.05, -3.04], ['BEL', 'Belém', -48.48, -1.38],
      ['GYN', 'Goiânia', -49.22, -16.63, 'l'], ['CGB', 'Cuiabá', -56.12, -15.65],
      ['CGR', 'Campo Grande', -54.67, -20.47], ['VIX', 'Vitória', -40.29, -20.26],
      ['NAT', 'Natal', -35.37, -5.77], ['SLZ', 'São Luís', -44.23, -2.59],
      ['PVH', 'Porto Velho', -63.9, -8.71], ['RBR', 'Rio Branco', -67.9, -9.87],
      ['BVB', 'Boa Vista', -60.69, 2.84], ['PMW', 'Palmas', -48.36, -10.29],
      ['IGU', 'Foz do Iguaçu', -54.49, -25.6, 'l'], ['MCP', 'Macapá', -51.07, 0.05],
      ['THE', 'Teresina', -42.82, -5.06], ['MCZ', 'Maceió', -35.79, -9.51],
      ['STM', 'Santarém', -54.79, -2.42],
    ];
    // Illustrative direct routes ("FROM:TO,TO,...").
    const ROUTES = `
      GRU:GIG,BSB,CNF,SSA,REC,FOR,POA,CWB,FLN,MAO,BEL,GYN,CGB,CGR,VIX,NAT,IGU,MCZ
      BSB:GIG,CNF,SSA,REC,FOR,MAO,BEL,CGB,PMW,SLZ,THE,PVH,RBR,MCP,CGR,VIX,NAT,POA,CWB,GYN
      GIG:CNF,SSA,REC,FOR,POA,CWB,VIX
      CNF:SSA,REC,VIX,CWB
      REC:SSA,FOR,NAT,MCZ,THE
      SSA:FOR,MCZ,VIX
      FOR:NAT,SLZ,THE,BEL
      MAO:BEL,BVB,PVH,STM
      BEL:SLZ,STM,MCP,PMW
      PVH:RBR,CGB
      CGB:CGR
      CWB:POA,FLN,IGU,CGR
      POA:FLN,IGU
      THE:SLZ`;
    // Rough outline of Brazil (lon, lat), only used to draw the dotted map.
    const OUTLINE = [
      [-51.4, 4.4], [-51, 3.3], [-50.6, 2.1], [-50, 1.4], [-49.9, 0.6], [-50.4, -0.1], [-49.2, -0.2], [-48.4, -0.3],
      [-47.7, -0.6], [-46.6, -0.9], [-45.6, -1.3], [-44.8, -1.7], [-44.3, -2.5], [-43.4, -2.4], [-42.2, -2.7], [-41.3, -2.9],
      [-40.2, -2.8], [-39, -3.4], [-38.4, -3.7], [-37.4, -4.6], [-36.3, -5.1], [-35.3, -5.3], [-35, -6.3], [-34.8, -7.2],
      [-34.9, -8.1], [-35.3, -9], [-35.8, -9.7], [-36.4, -10.5], [-37.1, -11.1], [-37.8, -12.1], [-38.5, -13], [-39, -13.6],
      [-39, -14.8], [-39, -16.2], [-39.2, -17.6], [-39.7, -19.4], [-40.2, -20.3], [-40.9, -21.3], [-41, -22], [-42, -23],
      [-43.2, -23], [-44.6, -23.3], [-45.4, -23.8], [-46.4, -24.1], [-47.5, -24.8], [-48.3, -25.6], [-48.6, -26.6], [-48.5, -27.6],
      [-48.8, -28.5], [-49.7, -29.3], [-50.3, -30.3], [-51.1, -31.3], [-52.1, -32.2], [-52.6, -33], [-53.4, -33.8],
      [-53.5, -33.2], [-53.4, -32.6], [-54, -32.1], [-54.6, -31.5], [-55.5, -30.9], [-56.4, -30.4], [-57.6, -30.2],
      [-57.1, -29.7], [-56.3, -28.9], [-55.5, -28.2], [-54.8, -27.6], [-53.8, -27.1], [-53.7, -26.3], [-53.8, -25.7], [-54.6, -25.6],
      [-54.3, -24.1], [-54.9, -23.9], [-55.4, -23.6], [-55.7, -22.6], [-56.5, -22.2], [-57.9, -22.1], [-57.9, -20.9], [-57.8, -20],
      [-57.6, -19], [-58.1, -17.8], [-58.4, -16.3], [-60.2, -16.3], [-60.3, -15.1], [-60.5, -13.8], [-61.8, -13.5], [-63, -12.8],
      [-64.4, -12.4], [-65.3, -11.6], [-65.3, -10.8], [-65.4, -9.7], [-66.6, -9.9], [-67.6, -10.4], [-68.6, -11], [-69.6, -11],
      [-70.6, -11], [-70.6, -9.6], [-71.4, -9.9], [-72.2, -10], [-72.6, -9.4], [-73.2, -9.4], [-73.8, -7.6], [-73.6, -6.8],
      [-73, -6], [-72.9, -5.1], [-71.8, -4.5], [-70.8, -4.2], [-69.9, -4.2], [-69.4, -1.2], [-69.9, -0.4], [-70, 0.6],
      [-69.2, 1], [-68.2, 1.7], [-67.3, 2], [-66.9, 1.2], [-66.3, 0.8], [-65.5, 0.9], [-64.4, 1.4], [-64, 2.5],
      [-64.2, 3.6], [-63.2, 4.1], [-62.2, 4.1], [-61.2, 4.5], [-60.7, 5.2], [-60.1, 5], [-59.9, 4.4], [-59.6, 3.4],
      [-59.9, 2.7], [-59.7, 1.9], [-58.9, 1.3], [-58, 1.6], [-57.2, 1.9], [-56.5, 1.9], [-55.9, 2], [-55.2, 2.5],
      [-54.6, 2.3], [-54.1, 2.1], [-53.3, 2.3], [-52.6, 2.5], [-52, 3.3], [-51.6, 4],
    ];

    // Equirectangular projection, corrected for latitude around 15°S.
    const LON0 = -74.3;
    const LAT0 = 5.6;
    const K = 14.6;
    const KX = K * Math.cos((15 * Math.PI) / 180);
    const PAD = 14;
    const X = (lon) => PAD + (lon - LON0) * KX;
    const Y = (lat) => PAD + (LAT0 - lat) * K;
    const W = Math.ceil(X(-34.6) + PAD);
    const H = Math.ceil(Y(-33.9) + PAD);

    const rad = (d) => (d * Math.PI) / 180;
    const haversine = (a, b) => {
      const h = Math.sin(rad(b.lat - a.lat) / 2) ** 2
        + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lon - a.lon) / 2) ** 2;
      return 2 * 6371 * Math.asin(Math.sqrt(h));
    };

    const nodes = AIRPORTS.map(([code, city, lon, lat, side]) => ({ code, city, lon, lat, side, x: X(lon), y: Y(lat) }));
    const index = Object.fromEntries(nodes.map((n, i) => [n.code, i]));
    const edges = [];
    const adj = nodes.map(() => []);
    ROUTES.trim().split(/\s+/).forEach((line) => {
      const [from, tos] = line.split(':');
      tos.split(',').forEach((to) => {
        const a = index[from];
        const b = index[to];
        const w = haversine(nodes[a], nodes[b]);
        const e = edges.push({ a, b, w }) - 1;
        adj[a].push({ to: b, w, e });
        adj[b].push({ to: a, w, e });
      });
    });
    const N = nodes.length;
    const fine = $('.fine', card);
    if (fine) fine.textContent = `Simplified for the browser: ${N} airports, ${edges.length} illustrative routes, great-circle distances.`;

    /* --- Algorithms --- */
    const rebuild = (prev, src, dst) => {
      if (src !== dst && prev[dst] === -1) return [];
      const path = [];
      for (let v = dst; v !== -1; v = prev[v]) path.unshift(v);
      return path;
    };
    const dijkstra = (src, dst) => {
      const dist = Array(N).fill(Infinity);
      const prev = Array(N).fill(-1);
      const done = Array(N).fill(false);
      const order = [];
      dist[src] = 0;
      for (let it = 0; it < N; it++) {
        let u = -1;
        for (let i = 0; i < N; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
        if (u < 0 || dist[u] === Infinity) break;
        done[u] = true;
        order.push(u);
        if (u === dst) break;
        adj[u].forEach(({ to, w }) => {
          if (dist[u] + w < dist[to]) { dist[to] = dist[u] + w; prev[to] = u; }
        });
      }
      return { path: rebuild(prev, src, dst), order };
    };
    const bfs = (src, dst) => {
      const prev = Array(N).fill(-1);
      const seen = Array(N).fill(false);
      const order = [];
      const queue = [src];
      seen[src] = true;
      while (queue.length) {
        const u = queue.shift();
        order.push(u);
        if (u === dst) break;
        adj[u].forEach(({ to }) => {
          if (!seen[to]) { seen[to] = true; prev[to] = u; queue.push(to); }
        });
      }
      return { path: rebuild(prev, src, dst), order };
    };
    const pathKm = (path) => path.slice(1).reduce((s, v, i) => s + adj[path[i]].find((n) => n.to === v).w, 0);
    const kruskal = () => {
      const parent = nodes.map((_, i) => i);
      const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
      const steps = [];
      let total = 0;
      let accepted = 0;
      const sorted = edges.map((_, i) => i).sort((p, q) => edges[p].w - edges[q].w);
      for (const i of sorted) {
        const ra = find(edges[i].a);
        const rb = find(edges[i].b);
        const ok = ra !== rb;
        if (ok) { parent[ra] = rb; total += edges[i].w; accepted++; }
        steps.push({ i, ok });
        if (accepted === N - 1) break;
      }
      return { steps, total, accepted };
    };
    let allPairs = null;
    const floydWarshall = () => {
      if (allPairs) return allPairs;
      const d = nodes.map((_, i) => nodes.map((__, j) => (i === j ? 0 : Infinity)));
      edges.forEach(({ a, b, w }) => { d[a][b] = Math.min(d[a][b], w); d[b][a] = d[a][b]; });
      for (let k = 0; k < N; k++) {
        for (let i = 0; i < N; i++) {
          for (let j = 0; j < N; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
        }
      }
      allPairs = d;
      return d;
    };

    /* --- Drawing --- */
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': 'Map of Brazil with airports and routes' }, $('#air-map'));
    const poly = OUTLINE.map(([lon, lat]) => [X(lon), Y(lat)]);
    const inside = (x, y) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const STEP = 11;
    let dots = '';
    for (let row = 0, y = PAD; y < H; y += STEP * 0.866, row++) {
      for (let x = PAD + (row % 2 ? STEP / 2 : 0); x < W; x += STEP) {
        if (inside(x, y)) dots += `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      }
    }
    el('path', { class: 'air-dots', d: dots }, svg);

    const edgeG = el('g', { class: 'air-edges' }, svg);
    const edgeEls = edges.map(({ a, b }) => el('line', {
      class: 'air-edge', x1: nodes[a].x.toFixed(1), y1: nodes[a].y.toFixed(1), x2: nodes[b].x.toFixed(1), y2: nodes[b].y.toFixed(1),
    }, edgeG));
    const pathEl = el('path', { class: 'air-path', d: '' }, svg);
    const plane = el('circle', { class: 'air-plane', r: 5, cx: -50, cy: -50 }, svg);
    const nodeG = el('g', {}, svg);
    // Airports are clickable on the map; keyboard users get the same choices in the From/To selects.
    const nodeEls = nodes.map((n, i) => {
      const g = el('g', { class: 'air-node', transform: `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})` }, nodeG);
      el('circle', { class: 'hit', r: 13 }, g);
      el('circle', { class: 'ring', r: 6 }, g);
      el('circle', { class: 'dot', r: 4.6 }, g);
      const label = el('text', { class: 'air-label', x: n.side === 'l' ? -8 : 8, y: 3.5, 'text-anchor': n.side === 'l' ? 'end' : 'start' }, g);
      label.textContent = n.code;
      const title = el('title', {}, g);
      title.textContent = `${n.city} (${n.code})`;
      g.addEventListener('click', () => pick(i));
      return g;
    });

    /* --- UI state --- */
    const fromSel = $('#air-from');
    const toSel = $('#air-to');
    const routeOut = $('#air-route-out');
    const mstOut = $('#air-mst-out');
    const hubsOut = $('#air-hubs-out');
    const diameterOut = $('#air-diameter');
    const tabs = $$('.tab', card);
    const panels = { route: $('#air-route'), mst: $('#air-mst'), hubs: $('#air-hubs') };
    const tabIds = { 'tab-route': 'route', 'tab-mst': 'mst', 'tab-hubs': 'hubs' };
    const byCity = nodes.map((n, i) => i).sort((p, q) => nodes[p].city.localeCompare(nodes[q].city));
    const options = byCity.map((i) => `<option value="${i}">${nodes[i].city} (${nodes[i].code})</option>`).join('');
    fromSel.innerHTML = options;
    toSel.innerHTML = options;
    fromSel.value = String(index.BVB);
    toSel.value = String(index.POA);

    let mode = 'route';
    let token = 0;
    let pickingTo = false;
    let planeAnim = null;

    const clearMap = () => {
      token++;
      if (planeAnim) { planeAnim.cancel(); planeAnim = null; }
      edgeG.classList.remove('faded');
      edgeEls.forEach((e) => e.setAttribute('class', 'air-edge'));
      nodeEls.forEach((g) => g.setAttribute('class', 'air-node'));
      pathEl.setAttribute('d', '');
      plane.setAttribute('cx', -50);
      plane.setAttribute('cy', -50);
      return token;
    };

    const drawPath = (path) => new Promise((resolve) => {
      const d = path.map((i, k) => `${k ? 'L' : 'M'}${nodes[i].x.toFixed(1)} ${nodes[i].y.toFixed(1)}`).join('');
      pathEl.setAttribute('d', d);
      const len = pathEl.getTotalLength();
      if (reduceMotion || !len) {
        const end = nodes[path[path.length - 1]];
        plane.setAttribute('cx', end.x);
        plane.setAttribute('cy', end.y);
        resolve();
        return;
      }
      const dur = Math.min(1600, 500 + len * 1.4);
      pathEl.style.strokeDasharray = `${len}`;
      planeAnim = pathEl.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], { duration: dur, easing: 'cubic-bezier(.45,.05,.35,1)', fill: 'forwards' });
      const t0 = performance.now();
      const myToken = token;
      const fly = (now) => {
        if (myToken !== token) return;
        const p = Math.min(1, (now - t0) / dur);
        const eased = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
        const pt = pathEl.getPointAtLength(len * eased);
        plane.setAttribute('cx', pt.x.toFixed(1));
        plane.setAttribute('cy', pt.y.toFixed(1));
        if (p < 1) requestAnimationFrame(fly);
        else resolve();
      };
      requestAnimationFrame(fly);
    });

    const showRoute = async () => {
      const src = +fromSel.value;
      const dst = +toSel.value;
      const opt = $('input[name="air-opt"]:checked', card).value;
      const my = clearMap();
      pickingTo = false;
      if (src === dst) {
        routeOut.innerHTML = '<p class="metrics">Pick two different airports.</p>';
        return;
      }
      nodeEls[src].classList.add('end');
      nodeEls[dst].classList.add('end');
      const res = opt === 'hops' ? bfs(src, dst) : dijkstra(src, dst);
      routeOut.innerHTML = `<p class="metrics">${opt === 'hops' ? 'Breadth-first search' : 'Dijkstra'} is exploring…</p>`;
      for (const u of res.order) {
        if (my !== token) return;
        nodeEls[u].classList.add('visited');
        await wait(40);
      }
      if (my !== token) return;
      res.path.forEach((i) => nodeEls[i].classList.add('on'));
      await drawPath(res.path);
      if (my !== token) return;
      const flights = res.path.length - 1;
      const dist = pathKm(res.path);
      let note = '';
      if (opt === 'hops') {
        const best = pathKm(dijkstra(src, dst).path);
        note = best < dist - 1
          ? `<p class="metrics">Fewest flights isn’t the shortest trip here: Dijkstra finds one <b>${km(dist - best)}</b> shorter.</p>`
          : '<p class="metrics">Here the fewest flights is also the shortest distance.</p>';
      }
      routeOut.innerHTML = `
        <div class="path-chips">${res.path.map((i) => `<span class="chip" title="${nodes[i].city}">${nodes[i].code}</span>`).join('<span class="arr">→</span>')}</div>
        <p class="metrics"><span><b>${km(dist)}</b> total</span><span><b>${flights}</b> flight${flights === 1 ? '' : 's'}</span><span><b>${res.order.length}</b> airports explored</span></p>
        ${note}`;
    };

    const runKruskal = async () => {
      const my = clearMap();
      edgeG.classList.add('faded');
      const { steps, total, accepted } = kruskal();
      const fullKm = edges.reduce((s, e) => s + e.w, 0);
      let kept = 0;
      let skipped = 0;
      for (const s of steps) {
        if (my !== token) return;
        const line = edgeEls[s.i];
        line.classList.add('try');
        await wait(s.ok ? 70 : 40);
        line.classList.remove('try');
        if (s.ok) {
          kept++;
          line.classList.add('mst');
          nodeEls[edges[s.i].a].classList.add('on');
          nodeEls[edges[s.i].b].classList.add('on');
        } else {
          skipped++;
          line.classList.add('reject');
          await wait(70);
          line.classList.remove('reject');
        }
        mstOut.innerHTML = `<p class="metrics"><span>Kept <b>${kept}</b> routes</span><span>Skipped <b>${skipped}</b> that would close a loop</span></p>`;
      }
      if (my !== token) return;
      mstOut.innerHTML = `
        <p class="metrics"><span><b>${accepted}</b> routes connect all <b>${N}</b> airports</span><span><b>${km(total)}</b> in total</span></p>
        <p class="metrics">That’s ${Math.round((total / fullKm) * 100)}% of the ${km(fullKm)} flown by every route on the map. Checked ${steps.length} routes, skipped ${skipped} that would close a loop.</p>`;
    };

    const showHubs = () => {
      clearMap();
      const d = floydWarshall();
      const avg = nodes.map((_, i) => d[i].reduce((s, v, j) => (j === i ? s : s + v), 0) / (N - 1));
      const rank = nodes.map((_, i) => i).sort((p, q) => avg[p] - avg[q]);
      const best = avg[rank[0]];
      const worst = avg[rank[rank.length - 1]];
      const top = rank.slice(0, 5);
      hubsOut.innerHTML = top.map((i) => `
        <li data-i="${i}"><span class="code">${nodes[i].code}</span><span><span class="hub-bar"><span style="transform:scaleX(0)"></span></span></span><span class="hub-km">avg ${km(avg[i])}</span></li>`).join('');
      top.forEach((i) => nodeEls[i].classList.add('hub'));
      requestAnimationFrame(() => {
        $$('.hub-bar span', hubsOut).forEach((bar, k) => {
          const i = top[k];
          bar.style.transform = `scaleX(${Math.max(0.08, (worst - avg[i]) / (worst - best)).toFixed(3)})`;
        });
      });
      $$('li', hubsOut).forEach((li) => {
        const i = +li.dataset.i;
        li.title = nodes[i].city;
        li.addEventListener('pointerenter', () => nodeEls[i].classList.add('end'));
        li.addEventListener('pointerleave', () => nodeEls[i].classList.remove('end'));
      });
      let far = [0, 1];
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) if (d[i][j] > d[far[0]][far[1]]) far = [i, j];
      diameterOut.innerHTML = `<span>Most central: <b>${nodes[rank[0]].city}</b></span><span>Farthest pair: <b>${nodes[far[0]].code} ↔ ${nodes[far[1]].code}</b>, ${km(d[far[0]][far[1]])} by the shortest route</span>`;
    };

    const selectTab = (name, run = true) => {
      mode = name;
      tabs.forEach((t) => {
        const on = tabIds[t.id] === name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== name; });
      if (!run) { clearMap(); return; }
      if (name === 'route') showRoute();
      else if (name === 'mst') runKruskal();
      else showHubs();
    };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => selectTab(tabIds[t.id]));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        selectTab(tabIds[next.id]);
      });
    });

    function pick(i) {
      if (mode !== 'route') selectTab('route', false);
      if (!pickingTo) {
        clearMap();
        fromSel.value = String(i);
        nodeEls[i].classList.add('end');
        pickingTo = true;
        routeOut.innerHTML = `<p class="metrics">From <b>${nodes[i].city}</b>. Now pick a destination on the map.</p>`;
      } else {
        if (String(i) === fromSel.value) return;
        toSel.value = String(i);
        showRoute();
      }
    }

    $('#air-go').addEventListener('click', showRoute);
    $('#air-mst-go').addEventListener('click', runKruskal);
    $('#air-swap').addEventListener('click', () => {
      const f = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = f;
      showRoute();
    });
    [fromSel, toSel].forEach((s) => s.addEventListener('change', showRoute));
    $$('input[name="air-opt"]', card).forEach((r) => r.addEventListener('change', showRoute));

    onVisible($('#air-map'), () => { if (mode === 'route') showRoute(); }, 0.35);

    return {
      randomRoute() {
        scrollTo(card);
        const a = (Math.random() * N) | 0;
        let b = (Math.random() * N) | 0;
        if (b === a) b = (a + 1 + ((Math.random() * (N - 1)) | 0)) % N;
        fromSel.value = String(a);
        toSel.value = String(b);
        selectTab('route', false);
        setTimeout(showRoute, 450);
      },
      kruskal() {
        scrollTo(card);
        setTimeout(() => selectTab('mst'), 450);
      },
    };
  };

  /* =====================================================================
     AVL tree
     ===================================================================== */
  const avlTree = () => {
    const card = $('#avl');
    if (!card) return null;
    const svg = $('#avl-svg');
    const input = $('#avl-input');
    const logEl = $('#avl-log');
    const stats = Object.fromEntries($$('[data-s]', card).map((d) => [d.dataset.s, d]));
    let W = 520; // narrower on phones so the nodes stay readable
    const H = 280;
    const R = 15;
    const MAX = 15;

    const h = (n) => (n ? n.h : 0);
    const fix = (n) => { n.h = 1 + Math.max(h(n.l), h(n.r)); return n; };
    const balance = (n) => h(n.l) - h(n.r);
    const rotateRight = (y) => { const x = y.l; y.l = x.r; x.r = y; fix(y); return fix(x); };
    const rotateLeft = (x) => { const y = x.r; x.r = y.l; y.l = x; fix(x); return fix(y); };
    const leaf = (v) => ({ v, l: null, r: null, h: 1 });
    const clone = (n) => n && { v: n.v, h: n.h, l: clone(n.l), r: clone(n.r) };
    const has = (n, v) => !!n && (n.v === v || has(v < n.v ? n.l : n.r, v));
    const size = (n) => (n ? 1 + size(n.l) + size(n.r) : 0);
    const bstInsert = (n, v) => {
      if (!n) return leaf(v);
      if (v < n.v) n.l = bstInsert(n.l, v);
      else n.r = bstInsert(n.r, v);
      return fix(n);
    };
    const avlInsert = (n, v, events) => {
      if (!n) return leaf(v);
      if (v < n.v) n.l = avlInsert(n.l, v, events);
      else n.r = avlInsert(n.r, v, events);
      fix(n);
      const b = balance(n);
      if (b > 1) {
        if (v < n.l.v) { events.push({ kind: 'right rotation', at: n.v, pivot: n.l.v }); return rotateRight(n); }
        events.push({ kind: 'left-right double rotation', at: n.v, pivot: n.l.r.v });
        n.l = rotateLeft(n.l);
        return rotateRight(n);
      }
      if (b < -1) {
        if (v > n.r.v) { events.push({ kind: 'left rotation', at: n.v, pivot: n.r.v }); return rotateLeft(n); }
        events.push({ kind: 'right-left double rotation', at: n.v, pivot: n.r.l.v });
        n.r = rotateRight(n.r);
        return rotateLeft(n);
      }
      return n;
    };

    const layout = (t) => {
      const list = [];
      const walk = (n, depth, parent) => {
        if (!n) return;
        walk(n.l, depth + 1, n);
        list.push({ n, depth, parent });
        walk(n.r, depth + 1, n);
      };
      walk(t, 0, null);
      const pos = new Map();
      const count = list.length;
      const levels = h(t);
      const step = count > 1 ? Math.min(46, (W - 56) / (count - 1)) : 0;
      const x0 = (W - step * (count - 1)) / 2;
      const dy = levels > 1 ? Math.min(58, (H - 58) / (levels - 1)) : 0;
      list.forEach((it, k) => pos.set(it.n.v, {
        x: x0 + k * step, y: 30 + it.depth * dy, parent: it.parent ? it.parent.v : null, bf: balance(it.n),
      }));
      return pos;
    };

    const edgeG = el('g', {}, svg);
    const nodeG = el('g', {}, svg);
    const empty = el('text', { class: 'avl-empty', x: W / 2, y: H / 2 }, svg);
    empty.textContent = 'Empty tree';
    const view = new Map();
    let raf = 0;
    let settle = null;
    const fitWidth = () => {
      const w = svg.getBoundingClientRect().width;
      const next = w && w < 440 ? 360 : 520;
      if (next === W && svg.getAttribute('viewBox') === `0 0 ${W} ${H}`) return false;
      W = next;
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      empty.setAttribute('x', W / 2);
      return true;
    };
    fitWidth();

    const render = (t, mark = {}) => new Promise((resolve) => {
      if (settle) settle();
      settle = resolve;
      cancelAnimationFrame(raf);
      const pos = layout(t);
      empty.style.display = pos.size ? 'none' : '';
      view.forEach((V, v) => {
        if (!pos.has(v)) { V.g.remove(); V.edge.remove(); view.delete(v); }
      });
      pos.forEach((p, v) => {
        if (view.has(v)) return;
        const g = el('g', { class: 'avl-node' }, nodeG);
        el('circle', { r: R }, g);
        el('text', {}, g).textContent = v;
        const bf = el('text', { class: 'bf', x: R + 1, y: -R + 1 }, g);
        const edge = el('line', { class: 'avl-edge' }, edgeG);
        const from = p.parent != null && view.get(p.parent);
        view.set(v, { g, bf, edge, x: from ? from.x : p.x, y: from ? from.y : p.y - 24 });
      });
      pos.forEach((p, v) => {
        const V = view.get(v);
        V.g.classList.toggle('fresh', v === mark.fresh);
        V.g.classList.toggle('bad', Math.abs(p.bf) > 1);
        V.g.classList.toggle('rot', !!(mark.rot && mark.rot.includes(v)));
        V.bf.textContent = p.bf > 0 ? `+${p.bf}` : String(p.bf);
        Object.assign(V, { fx: V.x, fy: V.y, tx: p.x, ty: p.y, parent: p.parent });
      });
      const dur = reduceMotion ? 0 : 560;
      const t0 = performance.now();
      const step = (now) => {
        const k = dur ? Math.min(1, (now - t0) / dur) : 1;
        const e = 1 - (1 - k) ** 3;
        view.forEach((V) => {
          V.x = V.fx + (V.tx - V.fx) * e;
          V.y = V.fy + (V.ty - V.fy) * e;
          V.g.setAttribute('transform', `translate(${V.x.toFixed(1)} ${V.y.toFixed(1)})`);
        });
        view.forEach((V) => {
          const P = V.parent != null ? view.get(V.parent) : null;
          V.edge.style.display = P ? '' : 'none';
          if (P) {
            V.edge.setAttribute('x1', P.x.toFixed(1));
            V.edge.setAttribute('y1', P.y.toFixed(1));
            V.edge.setAttribute('x2', V.x.toFixed(1));
            V.edge.setAttribute('y2', V.y.toFixed(1));
          }
        });
        if (k < 1) raf = requestAnimationFrame(step);
        else { settle = null; resolve(); }
      };
      raf = requestAnimationFrame(step);
    });

    let tree = null;
    let plain = null;
    let rotations = 0;
    let epoch = 0; // bumps on Reset, so stale animations stop
    let seq = 0; // bumps when the user takes over from an autoplay sequence
    let chain = Promise.resolve();

    const log = (html) => { logEl.innerHTML = html; };
    const updateStats = () => {
      stats.n.textContent = size(tree);
      stats.h.textContent = h(tree);
      stats.r.textContent = rotations;
      stats.b.textContent = h(plain);
    };

    // Inserts run one after another; each finishes its animation first.
    const insert = async (v) => {
      if (size(tree) >= MAX) { log(`The tree is full at ${MAX} nodes. Hit Reset to start over.`); return false; }
      if (!Number.isInteger(v) || v < 1 || v > 99) { log('Pick a whole number from 1 to 99.'); return false; }
      if (has(tree, v)) { log(`<b>${v}</b> is already in the tree. Values here are unique.`); return false; }
      const my = epoch;
      const events = [];
      const unbalanced = bstInsert(clone(tree), v);
      tree = avlInsert(tree, v, events);
      plain = bstInsert(plain, v);
      await render(unbalanced, { fresh: v });
      if (my !== epoch) return false;
      if (events.length) {
        const e = events[0];
        log(`Inserted <b>${v}</b>. Node <b>${e.at}</b> is out of balance (red), so the tree does a <b>${e.kind}</b>.`);
        await wait(750);
        if (my !== epoch) return false;
        rotations++;
        await render(tree, { rot: [e.at, e.pivot] });
        if (my !== epoch) return false;
      } else {
        log(`Inserted <b>${v}</b>. Every node is still balanced, so no rotation.`);
      }
      updateStats();
      return true;
    };
    const enqueue = (getValue) => {
      const my = epoch;
      const job = chain.then(() => (my === epoch ? insert(getValue()) : false));
      chain = job.catch(() => false);
      return job;
    };

    const reset = () => {
      epoch++;
      seq++;
      chain = Promise.resolve();
      tree = null;
      plain = null;
      rotations = 0;
      render(null);
      updateStats();
      log('Empty tree. Insert a number to start.');
    };

    const randomValue = () => {
      if (size(tree) >= MAX) return 0;
      let v;
      do { v = 1 + ((Math.random() * 99) | 0); } while (has(tree, v));
      return v;
    };

    const sortedRun = async () => {
      reset();
      const mySeq = seq;
      await wait(300);
      for (let v = 1; v <= 7; v++) {
        if (mySeq !== seq) return;
        await enqueue(() => v);
        await wait(450);
      }
      if (mySeq !== seq) return;
      log(`Inserted 1 to 7 in order. A plain binary search tree would be a chain <b>${h(plain)}</b> levels tall. The AVL tree stays at <b>${h(tree)}</b>.`);
    };

    $('#avl-form').addEventListener('submit', (e) => {
      e.preventDefault();
      seq++;
      const v = parseInt(input.value, 10);
      enqueue(() => v).then((ok) => { if (ok) input.value = ''; });
      input.focus();
    });
    $('#avl-random').addEventListener('click', () => { seq++; enqueue(randomValue); });
    $('#avl-sorted').addEventListener('click', sortedRun);
    $('#avl-reset').addEventListener('click', reset);
    let resizeTimer = 0;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { if (fitWidth()) render(tree); }, 150);
    });

    reset();
    onVisible(svg, () => { if (!size(tree)) sortedRun(); }, 0.5);

    return {
      random() {
        scrollTo(card, 'center');
        setTimeout(() => { seq++; enqueue(randomValue); }, 450);
      },
    };
  };

  /* =====================================================================
     Directory report script
     ===================================================================== */
  const dirReport = () => {
    const card = $('#dir');
    if (!card) return null;
    const term = $('#dir-term');
    const runBtn = $('#dir-run');
    const runLabel = $('span', runBtn);
    const status = $('#dir-status');
    const sheet = $('#dir-sheet');
    const rowsEl = $('#dir-rows');
    const totalEl = $('#dir-total');

    const ROOT = 'C:\\Shared\\Office';
    const FOLDERS = [
      { name: 'Contracts', files: [
        ['02/14/2026  04:02 PM', 248112, 'supplier_agreement_2026.pdf'],
        ['01/09/2026  10:41 AM', 51230, 'nda_template.docx'],
        ['03/02/2026  09:15 AM', 132870, 'renewal_terms.pdf'],
      ] },
      { name: 'Invoices', files: [
        ['01/31/2026  05:20 PM', 88450, 'inv_2026_001.pdf'],
        ['02/28/2026  05:12 PM', 91022, 'inv_2026_002.pdf'],
        ['03/31/2026  04:58 PM', 87310, 'inv_2026_003.pdf'],
        ['04/30/2026  05:03 PM', 90118, 'inv_2026_004.pdf'],
        ['05/04/2026  11:27 AM', 64390, 'summary_q1.xlsx'],
      ] },
      { name: 'Licenses', files: [
        ['03/12/2026  02:11 PM', 412300, 'operating_license.pdf'],
        ['03/12/2026  02:13 PM', 198440, 'fire_permit.pdf'],
        ['04/02/2026  09:47 AM', 356120, 'environmental_permit.pdf'],
        ['04/02/2026  10:05 AM', 22870, 'renewals_checklist.xlsx'],
      ] },
      { name: 'Scans', files: [
        ['05/18/2026  08:30 AM', 3145728, 'scan_0001.tif'],
        ['05/18/2026  08:31 AM', 2981234, 'scan_0002.tif'],
        ['05/18/2026  08:33 AM', 3302110, 'scan_0003.tif'],
      ] },
    ];
    const comma = (n) => n.toLocaleString('en-US');
    const human = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
    const sum = (files) => files.reduce((s, f) => s + f[1], 0);

    // Build the raw listing the way `dir /s` prints it.
    const lines = [
      { t: ' Volume in drive C has no label.' },
      { t: ' Volume Serial Number is 6A1F-03C2' },
      { t: '' },
    ];
    FOLDERS.forEach((f, fi) => {
      lines.push({ t: ` Directory of ${ROOT}\\${f.name}`, cls: 'dir' }, { t: '' });
      f.files.forEach(([date, size, name]) => lines.push({ t: `${date} ${comma(size).padStart(17)} ${name}` }));
      lines.push({ t: `${String(f.files.length).padStart(16)} File(s) ${comma(sum(f.files)).padStart(14)} bytes`, cls: 'sum', folder: fi }, { t: '' });
    });
    const allFiles = FOLDERS.flatMap((f) => f.files);
    lines.push(
      { t: '     Total Files Listed:', cls: 'sum' },
      { t: `${String(allFiles.length).padStart(16)} File(s) ${comma(sum(allFiles)).padStart(14)} bytes`, cls: 'sum' },
    );
    term.innerHTML = '';
    const lineEls = lines.map((ln) => {
      const s = document.createElement('span');
      s.className = `ln${ln.cls ? ` ${ln.cls}` : ''}`;
      s.textContent = ln.t || ' ';
      term.append(s);
      return s;
    });

    const total = sum(allFiles);
    let running = false;
    let my = 0;

    const addRow = (f) => {
      const size = sum(f.files);
      const largest = f.files.reduce((a, b) => (b[1] > a[1] ? b : a));
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${f.name}</td><td class="num">${f.files.length}</td><td class="num">${human(size)}</td>
        <td><span class="share"><i style="width:${Math.max(3, (size / total) * 100).toFixed(1)}%"></i></span></td><td>${largest[2]}</td>`;
      rowsEl.append(tr);
    };

    const run = async () => {
      if (running) return;
      running = true;
      const me = ++my;
      runBtn.disabled = true;
      rowsEl.innerHTML = '';
      totalEl.innerHTML = '';
      sheet.hidden = true;
      lineEls.forEach((s) => s.classList.remove('scan', 'done'));
      term.scrollTop = 0;
      status.textContent = 'python report.py dir_listing.txt';
      for (let i = 0; i < lines.length; i++) {
        if (me !== my) return;
        const s = lineEls[i];
        s.classList.add('scan');
        const target = s.offsetTop - term.clientHeight / 2;
        term.scrollTop = Math.max(0, target);
        await wait(lines[i].t ? 55 : 15);
        s.classList.remove('scan');
        if (lines[i].folder !== undefined) {
          s.classList.add('done');
          sheet.hidden = false;
          addRow(FOLDERS[lines[i].folder]);
          status.textContent = `Parsed ${lines[i].folder + 1} of ${FOLDERS.length} folders…`;
        }
      }
      totalEl.innerHTML = `<tr><td>Total</td><td class="num">${allFiles.length}</td><td class="num">${human(total)}</td><td></td><td></td></tr>`;
      status.textContent = `✓ report.xlsx written: ${FOLDERS.length} folders, ${allFiles.length} files.`;
      runLabel.textContent = 'Run again';
      runBtn.disabled = false;
      running = false;
    };
    runBtn.addEventListener('click', run);

    return {
      run() {
        scrollTo(card, 'center');
        setTimeout(run, 450);
      },
    };
  };

  const air = airNetwork();
  const avl = avlTree();
  const dir = dirReport();

  if (air) {
    AKH.actions.push(
      { group: 'Demos', label: 'Find a random route on the air network', icon: '✈', keywords: 'graph dijkstra bfs airports flights', run: air.randomRoute },
      { group: 'Demos', label: 'Watch Kruskal build a spanning tree', icon: '⋔', keywords: 'mst graph minimum', run: air.kruskal },
    );
  }
  if (avl) AKH.actions.push({ group: 'Demos', label: 'Insert a random number into the AVL tree', icon: '⟲', keywords: 'tree rotation data structures', run: avl.random });
  if (dir) AKH.actions.push({ group: 'Demos', label: 'Run the directory report script', icon: '▤', keywords: 'python excel automation report', run: dir.run });
})();
