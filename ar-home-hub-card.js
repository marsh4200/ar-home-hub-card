/*
 * AR Home Hub Card
 * One card for the whole house: greeting, live chips, scenes, and collapsible
 * drawers for lights, climate/motion, camera, Apple TV, geyser and amp.
 * AR Smart Home — https://arsmarthome.co.za
 */
const AR_HUB_VERSION = '1.4.0';
const AR_HUB_FONTS =
  'https://fonts.googleapis.com/css2?family=Sora:wght@300;500;600&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const fx = (v, dp = 2) => (v == null ? '–' : v.toFixed(dp));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ago = (iso) => {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};
const SRC_ICONS = [
  [/opt|toslink|spdif/i, 'mdi:toslink'],
  [/blue/i, 'mdi:bluetooth'],
  [/line|aux|rca|analog/i, 'mdi:audio-input-rca'],
  [/hdmi|arc/i, 'mdi:hdmi-port'],
  [/usb/i, 'mdi:usb-port'],
  [/wifi|wi-fi|net|airplay|spotify|dlna/i, 'mdi:wifi'],
];
const srcIcon = (s) => (SRC_ICONS.find(([r]) => r.test(s)) || [0, 'mdi:import'])[1];
const SCENE_STYLES = {
  night: { bg: 'linear-gradient(150deg,#3c3489,#26215c)', fg: '#eeedfe' },
  morning: { bg: 'linear-gradient(150deg,#f3a63a,#c86f12)', fg: '#2b1700' },
  away: { bg: 'linear-gradient(150deg,#13806a,#08493d)', fg: '#e1f5ee' },
  dusk: { bg: 'linear-gradient(150deg,#993556,#4b1528)', fg: '#fbeaf0' },
};
const SCENE_ORDER = ['night', 'morning', 'away', 'dusk'];
const DEFAULT_ORDER = ['lights', 'climate', 'camera', 'apple_tv', 'geyser', 'amp'];
const META = {
  lights: { t: 'Lights', i: 'mdi:lightbulb-group', c: 'amber' },
  climate: { t: 'Climate and motion', i: 'mdi:motion-sensor', c: 'cyan' },
  camera: { t: 'Camera', i: 'mdi:cctv', c: 'red' },
  apple_tv: { t: 'Apple TV', i: 'mdi:television-play', c: 'violet' },
  geyser: { t: 'Geyser', i: 'mdi:water-boiler', c: 'ember' },
  amp: { t: 'Amp', i: 'mdi:amplifier', c: 'teal' },
};
const RING = 163.4; // 2πr, r = 26
const KNOB = 235.6; // 270° of 2πr, r = 50

const STYLE = `
:host{display:block;container-type:inline-size;
  --glass:rgba(255,255,255,.055);--glass-2:rgba(255,255,255,.09);--line:rgba(255,255,255,.09);
  --ink:#eef1f7;--ink-2:#a3abbd;--ink-3:#6b7387;
  --amber:#ffc35a;--ember:#ff6a3d;--cyan:#5fd4ff;--teal:#3ee0b4;--violet:#9b8cff;--red:#ff5d6c;
  --fd:"Sora",var(--ha-font-family-body,Roboto),system-ui,sans-serif;
  --fb:"Manrope",var(--ha-font-family-body,Roboto),system-ui,sans-serif;
  --fm:"JetBrains Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}
button{font:inherit;color:inherit}
ha-icon{--mdc-icon-size:20px;display:inline-flex}
ha-card{position:relative;overflow:hidden;color:var(--ink);font-family:var(--fb);font-size:14px;
  max-width:var(--hub-max,none);margin:0 auto;
  background-color:#0d121c;
  background-image:radial-gradient(520px 320px at 0% -10%,rgba(95,212,255,.16),transparent 65%),
    radial-gradient(460px 380px at 110% 35%,rgba(255,106,61,.11),transparent 65%),
    radial-gradient(420px 320px at 25% 110%,rgba(155,140,255,.14),transparent 65%);
  border:1px solid var(--line);border-radius:28px;
  box-shadow:0 24px 60px rgba(0,0,0,.35),inset 0 1px 0 rgba(255,255,255,.07)}
.hero{padding:22px 22px 18px}
.hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.greet{font-family:var(--fd);font-weight:300;font-size:26px;letter-spacing:-.01em;line-height:1.15;margin:0;text-wrap:balance}
.greet b{font-weight:600}
.sub{color:var(--ink-2);font-size:12.5px;margin-top:4px;letter-spacing:.02em}
.clock{font-family:var(--fm);font-size:13px;color:var(--ink-2);text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.clock strong{display:block;font-family:var(--fd);font-weight:500;color:var(--ink);font-size:22px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chips:empty{display:none}
.chip{appearance:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:var(--glass);
  border:1px solid var(--line);font-size:12.5px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.chip ha-icon{--mdc-icon-size:17px}
.chip b{color:var(--ink);font-weight:600}
.chip.hot{border-color:rgba(255,106,61,.35);background:rgba(255,106,61,.10)}
.chip.mo{border-color:rgba(95,212,255,.35);background:rgba(95,212,255,.10)}
.chip.tv{border-color:rgba(155,140,255,.35);background:rgba(155,140,255,.10)}
.dot{width:7px;height:7px;border-radius:50%;background:currentColor;animation:ping 1.8s infinite;flex:none}
@keyframes ping{0%{box-shadow:0 0 0 0 color-mix(in srgb,currentColor 60%,transparent)}100%{box-shadow:0 0 0 8px transparent}}
.scenes{display:grid;gap:10px;margin-top:16px}
.scene{appearance:none;border:0;cursor:pointer;border-radius:18px;padding:12px;text-align:left;display:flex;flex-direction:column;gap:10px;transition:transform .2s;min-width:0}
.scene:active{transform:scale(.97)}
.scene .si{width:36px;height:36px;border-radius:11px;display:grid;place-items:center;background:rgba(255,255,255,.16)}
.scene .n{font-weight:600;font-size:13px}
.scene .l{font-size:11px;opacity:.78;margin-top:-6px}
.scene.run,.scene.running{animation:pulse 1.1s ease-in-out infinite}
.scene.run{animation-iteration-count:3}
@keyframes pulse{50%{filter:brightness(1.35)}}
.drawer{border-top:1px solid var(--line)}
.dh{appearance:none;width:100%;background:none;border:0;display:flex;align-items:center;gap:14px;padding:15px 22px;cursor:pointer;text-align:left}
.dh:hover{background:rgba(255,255,255,.025)}
.dh:focus-visible,.chip:focus-visible,.btn:focus-visible,.lt:focus-visible,.scene:focus-visible,.knob:focus-visible,.src:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.ico{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;flex:none;color:var(--c);
  background:color-mix(in srgb,var(--c) 15%,transparent);box-shadow:0 0 22px color-mix(in srgb,var(--c) 30%,transparent)}
.ico ha-icon{--mdc-icon-size:22px}
.c-amber{--c:var(--amber)}.c-cyan{--c:var(--cyan)}.c-red{--c:var(--red)}.c-violet{--c:var(--violet)}.c-ember{--c:var(--ember)}.c-teal{--c:var(--teal)}
.t{flex:1;min-width:0;display:flex;flex-direction:column}
.tt{font-family:var(--fd);font-weight:500;font-size:15.5px}
.ts{color:var(--ink-2);font-size:12.5px;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.chev{color:var(--ink-3);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.drawer.open .chev{transform:rotate(180deg)}
.db{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.2,.8,.2,1)}
.drawer.open .db{grid-template-rows:1fr}
.db>div{overflow:hidden;min-height:0}
.inner{padding:2px 22px 20px}
.btn{appearance:none;border:1px solid var(--line);background:var(--glass);font-size:12.5px;font-weight:600;padding:8px 13px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.btn ha-icon{--mdc-icon-size:17px}
.btn:hover{background:var(--glass-2)}
.btn.active{color:var(--teal);border-color:rgba(62,224,180,.5)}
/* lights */
.ltools{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.meter{flex:1;height:6px;border-radius:9px;background:var(--glass-2);margin-right:14px;overflow:hidden}
.meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#ffdf8a,var(--amber));border-radius:inherit;transition:width .4s}
.lgrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
.lt{appearance:none;border:1px solid var(--line);background:var(--glass);color:var(--ink-2);border-radius:18px;padding:12px 11px;text-align:left;cursor:pointer;
  display:flex;flex-direction:column;gap:9px;min-height:92px;min-width:0;transition:background .3s,border-color .3s}
.lt ha-icon{--mdc-icon-size:24px;color:var(--ink-3);transition:color .3s,filter .3s}
.lt .rn{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lt .nm{font-size:13px;font-weight:600;color:var(--ink);margin-top:-6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lt.on{background:radial-gradient(120% 90% at 20% 0%,rgba(255,195,90,.32),rgba(255,195,90,.06) 70%);border-color:rgba(255,195,90,.45)}
.lt.on ha-icon{color:var(--amber);filter:drop-shadow(0 0 8px rgba(255,195,90,.85))}
.lt.on .rn{color:#e6b866}
.lt.na{opacity:.45}
/* climate */
.clim{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.gauge{appearance:none;cursor:pointer;text-align:left;background:var(--glass);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;align-items:center;gap:12px;min-width:0}
.ring{position:relative;width:62px;height:62px;flex:none}
.ring svg{width:100%;height:100%;display:block}
.ring ha-icon{position:absolute;inset:0;margin:auto;width:20px;height:20px}
.ring .arc{transition:stroke-dashoffset .6s}
.gv{font-family:var(--fd);font-size:24px;font-weight:500;font-variant-numeric:tabular-nums}
.gv small{font-size:13px;color:var(--ink-2);font-weight:400}
.gl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.mot{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.mrow{appearance:none;cursor:pointer;text-align:left;background:var(--glass);border:1px solid var(--line);border-radius:16px;padding:11px 13px;display:flex;align-items:center;gap:10px;min-width:0}
.mrow ha-icon{color:var(--ink-3)}
.mrow.on{border-color:rgba(95,212,255,.4);background:rgba(95,212,255,.08)}
.mrow.on ha-icon{color:var(--cyan)}
.mrow b{display:block;font-size:13px}
.mrow span{font-size:11.5px;color:var(--ink-2)}
/* embedded cards */
.slot{--ha-card-background:transparent;--card-background-color:transparent;--ha-card-box-shadow:none;--ha-card-border-width:0;--ha-card-border-color:transparent}
.slot.cam{border-radius:20px;overflow:hidden;background:#05070b;border:1px solid var(--line);min-height:120px}
.ph{display:grid;place-items:center;aspect-ratio:16/9;color:var(--ink-3)}
.ph ha-icon{--mdc-icon-size:36px}
/* apple tv */
.np{display:flex;align-items:center;gap:12px;background:var(--glass);border:1px solid var(--line);border-radius:18px;padding:11px 13px;margin-bottom:12px}
.np .art{width:46px;height:46px;border-radius:12px;flex:none;overflow:hidden;background:linear-gradient(135deg,#9b8cff,#5fd4ff 60%,#3ee0b4);display:grid;place-items:center;color:#0b0f17}
.np .art img{width:100%;height:100%;object-fit:cover;display:block}
.np .meta{flex:1;min-width:0}
.np .meta b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np .meta span{font-size:11.5px;color:var(--ink-2)}
.tvapps{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin-top:12px}
.tvapps.top{justify-content:flex-start;margin:0 0 12px}
.tvapps .src{padding:9px 14px;font-size:12.5px}
.tvapps .src.sel{background:rgba(155,140,255,.16);border-color:rgba(155,140,255,.55);color:var(--violet)}
.tvapps.icons{display:grid;grid-template-columns:repeat(auto-fit,64px);justify-content:center;gap:12px 10px}
.tvapps.icons.top{justify-content:start}
.app{appearance:none;background:none;border:0;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--ink-2);min-width:0}
.app .tile{width:56px;height:56px;border-radius:17px;display:grid;place-items:center;overflow:hidden;
  background:color-mix(in srgb,var(--app,#9b8cff) 16%,rgba(255,255,255,.05));border:1px solid color-mix(in srgb,var(--app,#9b8cff) 30%,transparent);
  color:var(--app,var(--ink));transition:transform .15s,box-shadow .3s,border-color .3s}
.app .tile ha-icon{--mdc-icon-size:28px}
.app .tile img{width:100%;height:100%;object-fit:cover;display:block}
.app .lab{font-size:10.5px;font-weight:600;letter-spacing:.02em;max-width:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.app:active .tile{transform:scale(.92)}
.app:focus-visible .tile{outline:2px solid var(--cyan);outline-offset:2px}
.app.sel .tile{border-color:var(--violet);box-shadow:0 0 0 2px rgba(155,140,255,.45),0 0 18px rgba(155,140,255,.45)}
.app.sel .lab{color:var(--ink)}
.prog{height:4px;border-radius:9px;background:var(--glass-2);margin-top:7px;overflow:hidden}
.prog i{display:block;height:100%;width:0;background:var(--violet);border-radius:inherit;transition:width 1s linear}
/* geyser */
.gey{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:stretch}
.tank{position:relative;border-radius:30px 30px 22px 22px;border:1px solid var(--line);background:var(--glass);overflow:hidden;min-height:200px}
.water{position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(95,212,255,.22),rgba(95,212,255,.06));transition:background .8s}
.tank.on .water{background:linear-gradient(180deg,rgba(95,212,255,.38),rgba(95,212,255,.12))}
.tank.hot .water{background:linear-gradient(180deg,rgba(255,106,61,.55),rgba(255,195,90,.15))}
.water::before{content:"";position:absolute;left:-50%;top:-10px;width:200%;height:20px;
  background:radial-gradient(circle at 10px -4px,transparent 12px,rgba(255,255,255,.08) 13px) 0 0/40px 20px repeat-x;animation:wave 4s linear infinite}
@keyframes wave{to{transform:translateX(40px)}}
.bub{position:absolute;bottom:8px;width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.45);opacity:0}
.tank.hot .bub{animation:rise 2.6s ease-in infinite}
@keyframes rise{0%{transform:translateY(0);opacity:0}15%{opacity:.8}100%{transform:translateY(-150px);opacity:0}}
.coil{position:absolute;left:18px;right:18px;bottom:14px;height:16px;border-radius:8px;border:2px solid #6b7387;transition:border-color .5s,box-shadow .5s}
.tank.hot .coil{border-color:var(--ember);box-shadow:0 0 18px var(--ember)}
.tlab{position:absolute;top:12px;left:0;right:0;text-align:center;font-family:var(--fd);font-weight:600;font-size:13px;letter-spacing:.1em}
.gside{display:flex;flex-direction:column;gap:10px;min-width:0}
.tog{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--glass);border:1px solid var(--line);border-radius:18px;padding:12px 14px}
.tog b{display:block;font-size:14px}
.tog span{font-size:12px;color:var(--ink-2)}
.sw{appearance:none;width:54px;height:30px;border-radius:99px;background:var(--glass-2);border:1px solid var(--line);position:relative;cursor:pointer;transition:background .3s;flex:none;padding:0}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#cfd6e4;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.sw[aria-checked="true"]{background:linear-gradient(90deg,var(--ember),#ff9a4d)}
.sw[aria-checked="true"]::after{transform:translateX(24px);background:#fff}
.sw:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.stat{background:var(--glass);border:1px solid var(--line);border-radius:14px;padding:9px 11px;min-width:0}
.stat.wide{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}
.stat .k{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.stat .v{font-family:var(--fm);font-size:15px;font-weight:500;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap}
.stat .v small{color:var(--ink-2);font-size:11px}
.load{font-weight:700}
/* amp */
.ampface{background:linear-gradient(180deg,#151a24,#0e121a);border:1px solid var(--line);border-radius:22px;padding:16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:center;transition:opacity .3s}
.ampface.off{opacity:.55}
.knob{width:118px;height:118px;position:relative;touch-action:none;cursor:grab;border-radius:50%}
.knob svg{width:100%;height:100%;display:block}
.kval{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--fd);font-size:24px;font-weight:500;font-variant-numeric:tabular-nums;pointer-events:none}
.aside{min-width:0;width:100%}
.ampl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px}
.srcs{display:flex;flex-wrap:wrap;gap:7px}
.src{appearance:none;border:1px solid var(--line);background:var(--glass);color:var(--ink-2);font-size:12px;font-weight:600;padding:7px 11px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.src ha-icon{--mdc-icon-size:16px}
.src.sel{background:rgba(62,224,180,.14);border-color:rgba(62,224,180,.5);color:var(--teal)}
.vu{display:flex;gap:3px;align-items:flex-end;height:26px;margin-top:12px}
.vu i{flex:1;background:var(--teal);border-radius:2px;opacity:.85;height:8%;transition:height .12s}
.vrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.pwr.on{color:var(--teal)}
@container (max-width:420px){
  .lgrid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .gey{grid-template-columns:96px minmax(0,1fr)}
  .ampface{grid-template-columns:1fr;justify-items:center}
  .greet{font-size:22px}.hero,.dh{padding-left:16px;padding-right:16px}.inner{padding-left:16px;padding-right:16px}
}
@container (max-width:340px){.scenes{grid-template-columns:1fr!important}.clim{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

class ArHomeHubCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._children = {};
    this._built = false;
    this._ticks = 0;
  }

  /* ---------- config ---------- */
  setConfig(config) {
    if (!config || typeof config !== 'object') throw new Error('Invalid configuration');
    const c = { ...config };
    c.lights = (config.lights || []).map((l) => (typeof l === 'string' ? { entity: l } : l));
    c.motion = (config.motion || []).map((m) => (typeof m === 'string' ? { entity: m } : m));
    c.scenes = (config.scenes || []).map((s) => (typeof s === 'string' ? { entity: s } : s));
    c.climates = (Array.isArray(config.climate) ? config.climate : config.climate ? [config.climate] : []).filter((x) => x && (x.temperature || x.humidity));
    c.amp = typeof config.amp === 'string' ? { entity: config.amp } : config.amp;
    c.camera = typeof config.camera === 'string' ? { entity: config.camera } : config.camera;
    c.apple_tv = typeof config.apple_tv === 'string' ? { entity: config.apple_tv } : config.apple_tv;
    if (c.geyser && !c.geyser.switch) throw new Error('geyser needs a "switch" entity');
    const has = {
      lights: c.lights.length > 0,
      climate: !!(c.climates.length || c.motion.length),
      camera: !!(c.camera?.card || c.camera?.entity),
      apple_tv: !!(c.apple_tv?.card || c.apple_tv?.entity),
      geyser: !!c.geyser?.switch,
      amp: !!c.amp?.entity,
    };
    c.order = (config.order || DEFAULT_ORDER).filter((k) => has[k]);
    if (!c.order.length && !c.scenes.length) throw new Error('Add at least one section: lights, climate, motion, camera, apple_tv, geyser or amp');
    this._config = c;
    this._teardown();
    this._built = false;
    if (this._hass) this._build();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config) return;
    if (!this._built) this._build();
    else if (this._changed(old)) this._update();
    for (const el of Object.values(this._children)) if (el && el !== 'pending') el.hass = hass;
  }

  connectedCallback() {
    if (this._config?.fonts !== false && !document.getElementById('ar-hub-fonts')) {
      const l = document.createElement('link');
      l.id = 'ar-hub-fonts';
      l.rel = 'stylesheet';
      l.href = AR_HUB_FONTS;
      document.head.appendChild(l);
    }
    clearInterval(this._iv);
    this._iv = setInterval(() => this._tick(), 1000);
    if (this._built && this._isOpen('amp')) this._startVu();
  }

  disconnectedCallback() {
    clearInterval(this._iv);
    this._stopVu();
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  static getStubConfig(hass) {
    const lights = Object.keys(hass?.states || {}).filter((e) => e.startsWith('light.')).slice(0, 6);
    return { lights: lights.length ? lights : ['light.example'] };
  }

  /* ---------- helpers ---------- */
  _st(id) {
    return id ? this._hass?.states[id] : undefined;
  }

  _$(id) {
    return this.shadowRoot.getElementById(id);
  }

  _watch() {
    const c = this._config;
    const e = new Set();
    c.lights.forEach((l) => e.add(l.entity));
    c.motion.forEach((m) => e.add(m.entity));
    c.scenes.forEach((s) => e.add(s.entity));
    c.climates.forEach((cl) => ['temperature', 'humidity'].forEach((k) => cl[k] && e.add(cl[k])));
    if (c.geyser) ['switch', 'power', 'current', 'voltage', 'energy_day', 'energy_month'].forEach((k) => c.geyser[k] && e.add(c.geyser[k]));
    if (c.amp?.entity) e.add(c.amp.entity);
    if (c.apple_tv?.entity) e.add(c.apple_tv.entity);
    if (c.camera?.entity) e.add(c.camera.entity);
    return [...e].filter(Boolean);
  }

  _changed(old) {
    if (!old) return true;
    if (!this._watched) this._watched = this._watch();
    return this._watched.some((id) => old.states[id] !== this._hass.states[id]);
  }

  _call(domain, service, data) {
    this._hass.callService(domain, service, data);
  }

  _more(entityId) {
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  _storeKey() {
    return `ar-home-hub:${this._config.id || location.pathname}`;
  }

  _loadOpen() {
    const c = this._config;
    try {
      const v = localStorage.getItem(this._storeKey());
      if (v === 'none') return null;
      if (v && c.order.includes(v)) return v;
    } catch (e) {}
    if (c.default_open === false || c.default_open === 'none') return null;
    if (c.default_open && c.order.includes(c.default_open)) return c.default_open;
    return c.order[0] || null;
  }

  _saveOpen(k) {
    try {
      localStorage.setItem(this._storeKey(), k || 'none');
    } catch (e) {}
  }

  _isOpen(k) {
    return !!this.shadowRoot.querySelector(`.drawer.open[data-d="${k}"]`);
  }

  _title(k) {
    const c = this._config;
    const sec = c[k] && !Array.isArray(c[k]) ? c[k] : null;
    return c.titles?.[k] || sec?.name || META[k].t;
  }

  /* ---------- build ---------- */
  _build() {
    const c = this._config;
    this._built = true;
    this._watched = this._watch();
    const open = this._loadOpen();
    const scenes = c.scenes
      .map((s, i) => {
        const p = SCENE_STYLES[s.style] || SCENE_STYLES[SCENE_ORDER[i % SCENE_ORDER.length]];
        const bg = s.color || p.bg;
        const fg = s.text_color || p.fg;
        const name = s.name || this._st(s.entity)?.attributes.friendly_name || s.entity;
        return `<button class="scene" data-act="scene" data-i="${i}" style="background:${esc(bg)};color:${esc(fg)}">
          <span class="si"><ha-icon icon="${esc(s.icon || 'mdi:palette')}"></ha-icon></span>
          <span class="n">${esc(name)}</span>${s.label ? `<span class="l">${esc(s.label)}</span>` : ''}</button>`;
      })
      .join('');
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <ha-card style="${c.max_width ? `--hub-max:${esc(c.max_width)}` : ''}">
        <div class="hero">
          <div class="hero-top">
            <div><h1 class="greet" id="greet"></h1>${c.subtitle === false ? '' : `<div class="sub">${esc(c.subtitle ?? 'A R Smart Home Automation')}</div>`}</div>
            <div class="clock"><strong id="time"></strong><span id="date"></span></div>
          </div>
          <div class="chips" id="chips"></div>
          ${c.scenes.length ? `<div class="scenes" style="grid-template-columns:repeat(${Math.min(c.scenes.length, 4)},minmax(0,1fr))">${scenes}</div>` : ''}
        </div>
        ${c.order.map((k) => this._drawer(k, k === open)).join('')}
      </ha-card>`;
    this._wire();
    this._tick();
    this._update();
    if (open) this._onOpen(open);
  }

  _drawer(k, open) {
    const m = META[k];
    return `<section class="drawer${open ? ' open' : ''}" data-d="${k}">
      <button class="dh" data-act="drawer" data-k="${k}" aria-expanded="${open}">
        <span class="ico c-${m.c}"><ha-icon icon="${esc(this._config[k]?.icon || m.i)}"></ha-icon></span>
        <span class="t"><span class="tt">${esc(this._title(k))}</span><span class="ts" id="sum-${k}"></span></span>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </button>
      <div class="db"><div><div class="inner">${this['_body_' + k]()}</div></div></div>
    </section>`;
  }

  _body_lights() {
    return `<div class="ltools"><div class="meter"><i id="meter"></i></div>
        <button class="btn" data-act="alloff"><ha-icon icon="mdi:power"></ha-icon>All off</button></div>
      <div class="lgrid">${this._config.lights
        .map(
          (l, i) => `<button class="lt" data-act="light" data-i="${i}" aria-pressed="false">
          <ha-icon icon="${esc(l.icon || 'mdi:lightbulb')}"></ha-icon>
          <span class="rn">${esc(l.room || '')}</span><span class="nm" id="ln-${i}"></span></button>`
        )
        .join('')}</div>`;
  }

  _body_climate() {
    const c = this._config;
    const multi = c.climates.length > 1;
    const gauge = (key, ent, label, icon, color, stroke) => `<button class="gauge" data-act="more" data-e="${esc(ent)}">
        <span class="ring"><svg viewBox="0 0 64 64" aria-hidden="true">
          <defs><linearGradient id="g-${key}"><stop offset="0" stop-color="${stroke[0]}"/><stop offset="1" stop-color="${stroke[1]}"/></linearGradient></defs>
          <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>
          <circle class="arc" id="arc-${key}" cx="32" cy="32" r="26" fill="none" stroke="url(#g-${key})" stroke-width="6" stroke-linecap="round"
            stroke-dasharray="${RING}" stroke-dashoffset="${RING}" transform="rotate(-90 32 32)"/></svg>
          <ha-icon icon="${icon}" style="color:${color}"></ha-icon></span>
        <div><div class="gl">${esc(label)}</div><div class="gv" id="gv-${key}">–</div></div></button>`;
    return `<div class="clim">
      ${c.climates
        .map((cl, i) => {
          const room = cl.name || '';
          const tl = cl.temperature_name || (multi && room ? room : 'Temperature');
          const hl = cl.humidity_name || (multi && room ? room : 'Humidity');
          return `${cl.temperature ? gauge('temp-' + i, cl.temperature, tl, 'mdi:thermometer', 'var(--ember)', ['#ffc35a', '#ff6a3d']) : ''}
            ${cl.humidity ? gauge('hum-' + i, cl.humidity, hl, 'mdi:water-percent', 'var(--cyan)', ['#5fd4ff', '#5fd4ff']) : ''}`;
        })
        .join('')}
      ${c.motion.length ? `<div class="mot">${c.motion
        .map(
          (m, i) => `<button class="mrow" data-act="more" data-e="${esc(m.entity)}" id="mo-${i}">
          <ha-icon icon="${esc(m.icon || 'mdi:motion-sensor')}"></ha-icon>
          <div><b>${esc(m.name || this._st(m.entity)?.attributes.friendly_name || m.entity)}</b><span id="mos-${i}"></span></div></button>`
        )
        .join('')}</div>` : ''}
    </div>`;
  }

  _body_camera() {
    return `<div class="slot cam" id="slot-camera"><div class="ph"><ha-icon icon="mdi:cctv"></ha-icon></div></div>`;
  }

  _body_apple_tv() {
    const top = this._config.apple_tv.apps_position === 'top';
    const t = this._config.apple_tv;
    const list = t.apps || [];
    const icons = t.apps_style !== 'chips';
    const btn = (a, i) => {
      const label = esc(a.name || a.source);
      const ic = a.image
        ? `<img alt="" src="${esc(a.image)}">`
        : `<ha-icon icon="${esc(a.icon || this._appIcon(a.name || a.source))}"></ha-icon>`;
      if (!icons) return `<button class="src" data-act="app" data-i="${i}">${ic}${label}</button>`;
      return `<button class="app" data-act="app" data-i="${i}" aria-label="${label}"${a.color ? ` style="--app:${esc(a.color)}"` : ''}>
          <span class="tile">${ic}</span>${t.show_app_names === false ? '' : `<span class="lab">${label}</span>`}</button>`;
    };
    const apps = list.length ? `<div class="tvapps${icons ? ' icons' : ''}${top ? ' top' : ''}" id="tvapps">${list.map(btn).join('')}</div>` : '';
    return `<div class="np" id="np" hidden>
        <div class="art" id="np-art"><ha-icon icon="mdi:movie-open"></ha-icon></div>
        <div class="meta"><b id="np-title"></b><span id="np-sub"></span><div class="prog"><i id="np-prog"></i></div></div>
      </div>
${top ? apps : ''}
      <div class="slot" id="slot-apple_tv"></div>
      ${top ? '' : apps}`;
  }

  _appIcon(n = '') {
    const m = [[/youtube/i, 'mdi:youtube'], [/netflix/i, 'mdi:netflix'], [/dstv|showmax/i, 'mdi:satellite-uplink'], [/prime|amazon/i, 'mdi:play-box-multiple'],
      [/disney/i, 'mdi:castle'], [/spotify/i, 'mdi:spotify'], [/music/i, 'mdi:music'], [/plex/i, 'mdi:plex'], [/twitch/i, 'mdi:twitch']].find(([r]) => r.test(n));
    return m ? m[1] : 'mdi:application';
  }

  _body_geyser() {
    const g = this._config.geyser;
    const stat = (key, label) => (g[key] ? `<div class="stat"><div class="k">${label}</div><div class="v" id="gs-${key}">–</div></div>` : '');
    return `<div class="gey">
      <div class="tank" id="tank"><div class="water"></div>
        <i class="bub" style="left:22%;animation-delay:0s"></i><i class="bub" style="left:45%;animation-delay:.8s"></i>
        <i class="bub" style="left:66%;animation-delay:1.5s"></i><i class="bub" style="left:80%;animation-delay:.4s"></i>
        <div class="coil"></div><div class="tlab" id="tlab"></div></div>
      <div class="gside">
        <div class="tog"><div><b>${esc(g.switch_name || this._st(g.switch)?.attributes.friendly_name || 'Geyser')}</b><span id="gstate"></span></div>
          <button class="sw" role="switch" id="gsw" data-act="geyser" aria-checked="false" aria-label="Geyser power"></button></div>
        <div class="stats">
          ${stat('power', 'Power')}${stat('current', 'Current')}${stat('energy_day', 'Today')}${stat('energy_month', 'This month')}
          <div class="stat wide">${g.voltage ? `<div><div class="k">Voltage</div><div class="v" id="gs-voltage">–</div></div>` : '<div></div>'}
            <div class="k load" id="gload"></div></div>
        </div>
      </div></div>`;
  }

  _body_amp() {
    return `<div class="ampface" id="ampface">
      <div class="knob" id="knob" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="8" stroke-dasharray="${KNOB} 314.2" stroke-linecap="round" transform="rotate(135 60 60)"/>
          <circle id="karc" cx="60" cy="60" r="50" fill="none" stroke="#3ee0b4" stroke-width="8" stroke-dasharray="0 314.2" stroke-linecap="round" transform="rotate(135 60 60)" style="filter:drop-shadow(0 0 6px rgba(62,224,180,.7))"/>
          <circle cx="60" cy="60" r="36" fill="#1b2130" stroke="rgba(255,255,255,.08)"/></svg>
        <div class="kval" id="kval">–</div>
      </div>
      <div class="aside">
        <div class="ampl">Source</div>
        <div class="srcs" id="srcs"></div>
        <div class="vu" id="vu">${'<i></i>'.repeat(24)}</div>
        <div class="vrow">
          <button class="btn" data-act="vdn" aria-label="Volume down"><ha-icon icon="mdi:minus"></ha-icon></button>
          <button class="btn" data-act="vup" aria-label="Volume up"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button class="btn" data-act="mute" id="mutebtn"><ha-icon icon="mdi:volume-off"></ha-icon><span>Mute</span></button>
          <button class="btn pwr" data-act="ampPower" id="amppwr" aria-label="Amp power"><ha-icon icon="mdi:power"></ha-icon></button>
        </div>
      </div></div>`;
  }

  /* ---------- events ---------- */
  _wire() {
    const r = this.shadowRoot;
    r.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]');
      if (b) this._act(b.dataset.act, b);
    });
    const knob = this._$('knob');
    if (knob) {
      knob.addEventListener('pointerdown', (e) => {
        knob.setPointerCapture(e.pointerId);
        this._dragging = true;
        this._knobAt(e);
      });
      knob.addEventListener('pointermove', (e) => this._dragging && this._knobAt(e));
      const end = () => {
        if (!this._dragging) return;
        this._dragging = false;
        if (this._dragVol != null) this._sendVol(this._dragVol);
      };
      knob.addEventListener('pointerup', end);
      knob.addEventListener('pointercancel', end);
      knob.addEventListener('keydown', (e) => {
        const d = { ArrowUp: 2, ArrowRight: 2, ArrowDown: -2, ArrowLeft: -2 }[e.key];
        if (!d) return;
        e.preventDefault();
        this._queueVol((this._shownVol ?? 0) + d);
      });
    }
  }

  _act(a, b) {
    const c = this._config;
    switch (a) {
      case 'drawer':
        this._toggle(b.dataset.k);
        break;
      case 'go':
        if (!this._isOpen(b.dataset.k)) this._toggle(b.dataset.k);
        break;
      case 'light': {
        const l = c.lights[+b.dataset.i];
        b.classList.toggle('on');
        this._call('homeassistant', 'toggle', { entity_id: l.entity });
        break;
      }
      case 'alloff': {
        const on = c.lights.map((l) => l.entity).filter((e) => this._st(e)?.state === 'on');
        if (on.length) this._call('homeassistant', 'turn_off', { entity_id: on });
        break;
      }
      case 'scene': {
        const s = c.scenes[+b.dataset.i];
        const d = s.entity.split('.')[0];
        if (d === 'script') this._call('script', 'turn_on', { entity_id: s.entity });
        else if (d === 'scene') this._call('scene', 'turn_on', { entity_id: s.entity });
        else if (d === 'automation') this._call('automation', 'trigger', { entity_id: s.entity });
        else if (d === 'button' || d === 'input_button') this._call(d, 'press', { entity_id: s.entity });
        else this._call('homeassistant', 'turn_on', { entity_id: s.entity });
        b.classList.remove('run');
        void b.offsetWidth;
        b.classList.add('run');
        break;
      }
      case 'more':
        this._more(b.dataset.e);
        break;
      case 'geyser':
        this._call('homeassistant', 'toggle', { entity_id: c.geyser.switch });
        break;
      case 'vup':
        this._sendVol((this._shownVol ?? 0) + (c.amp.step ?? 5));
        break;
      case 'vdn':
        this._sendVol((this._shownVol ?? 0) - (c.amp.step ?? 5));
        break;
      case 'mute': {
        const muted = !!this._st(c.amp.entity)?.attributes.is_volume_muted;
        this._call('media_player', 'volume_mute', { entity_id: c.amp.entity, is_volume_muted: !muted });
        break;
      }
      case 'src':
        this._call('media_player', 'select_source', { entity_id: c.amp.entity, source: b.dataset.s });
        break;
      case 'app': {
        const t = c.apple_tv;
        const app = t.apps[+b.dataset.i];
        if (app.action) {
          const [d, sv] = app.action.split('.');
          this._call(d, sv, app.data || {});
        } else {
          this._call('media_player', 'select_source', { entity_id: app.entity || t.entity, source: app.source || app.name });
        }
        b.classList.add('sel');
        break;
      }
      case 'ampPower':
        this._call('media_player', 'toggle', { entity_id: c.amp.entity });
        break;
    }
  }

  _toggle(k) {
    const r = this.shadowRoot;
    const d = r.querySelector(`.drawer[data-d="${k}"]`);
    if (!d) return;
    const opening = !d.classList.contains('open');
    if (this._config.multi_open !== true) {
      r.querySelectorAll('.drawer.open').forEach((x) => {
        if (x === d) return;
        x.classList.remove('open');
        x.querySelector('.dh').setAttribute('aria-expanded', 'false');
        this._onClose(x.dataset.d);
      });
    }
    d.classList.toggle('open', opening);
    d.querySelector('.dh').setAttribute('aria-expanded', String(opening));
    if (opening) this._onOpen(k);
    else this._onClose(k);
    this._saveOpen(opening ? k : null);
  }

  _onOpen(k) {
    if (k === 'camera' || k === 'apple_tv') this._mount(k);
    if (k === 'amp') this._startVu();
  }

  _onClose(k) {
    if (k === 'camera' && this._config.camera?.keep_alive !== true) {
      setTimeout(() => !this._isOpen('camera') && this._unmount('camera'), 500);
    }
    if (k === 'amp') this._stopVu();
  }

  /* ---------- embedded cards ---------- */
  _childConfig(k) {
    const s = this._config[k];
    if (s.card) return s.card;
    if (k === 'camera') return { type: 'picture-entity', entity: s.entity, camera_view: 'live', show_name: false, show_state: false };
    return { type: 'media-control', entity: s.entity };
  }

  async _mount(k) {
    if (this._children[k]) return;
    const slot = this._$('slot-' + k);
    if (!slot) return;
    this._children[k] = 'pending';
    const cfg = this._childConfig(k);
    let helpers;
    try {
      helpers = await window.loadCardHelpers();
    } catch (e) {
      delete this._children[k];
      return;
    }
    if (this._children[k] !== 'pending') return;
    const make = () => {
      const el = helpers.createCardElement(cfg);
      el.hass = this._hass;
      el.addEventListener('ll-rebuild', (ev) => {
        ev.stopPropagation();
        if (this._children[k] !== el) return;
        const n = make();
        el.replaceWith(n);
        this._children[k] = n;
      });
      return el;
    };
    const el = make();
    slot.innerHTML = '';
    slot.appendChild(el);
    this._children[k] = el;
  }

  _unmount(k) {
    const el = this._children[k];
    delete this._children[k];
    if (el && el !== 'pending') el.remove();
    const slot = this._$('slot-' + k);
    if (slot && k === 'camera') slot.innerHTML = `<div class="ph"><ha-icon icon="mdi:cctv"></ha-icon></div>`;
  }

  _teardown() {
    for (const k of Object.keys(this._children)) this._unmount(k);
    this._children = {};
    this._stopVu();
  }

  /* ---------- volume ---------- */
  _drawVol(v) {
    const karc = this._$('karc');
    if (!karc) return;
    this._shownVol = v;
    karc.setAttribute('stroke-dasharray', `${v == null ? 0 : (KNOB * v) / 100} 314.2`);
    this._$('kval').textContent = this._muted ? 'Mute' : v == null ? '–' : v;
    this._$('knob').setAttribute('aria-valuenow', v ?? 0);
  }

  _knobAt(e) {
    const r = this._$('knob').getBoundingClientRect();
    let a = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
    a = (a - 135 + 720) % 360;
    if (a > 270) a = a > 315 ? 0 : 270;
    this._dragVol = Math.round((a / 270) * 100);
    this._drawVol(this._dragVol);
  }

  _queueVol(v) {
    v = clamp(Math.round(v), 0, 100);
    this._drawVol(v);
    clearTimeout(this._volT);
    this._volT = setTimeout(() => this._sendVol(v), 250);
  }

  _sendVol(v) {
    v = clamp(Math.round(v), 0, 100);
    this._volPending = Date.now();
    this._drawVol(v);
    this._call('media_player', 'volume_set', { entity_id: this._config.amp.entity, volume_level: v / 100 });
  }

  _startVu() {
    if (this._vuIv) return;
    this._vuIv = setInterval(() => {
      const bars = this.shadowRoot.querySelectorAll('#vu i');
      const lvl = this._ampLive ? (this._shownVol ?? 0) / 100 : 0;
      bars.forEach((b, i) => {
        const h = lvl ? (0.15 + Math.random() * 0.85) * lvl * (1 - Math.abs(i - 12) / 18) : 0;
        b.style.height = Math.max(8, h * 100) + '%';
      });
    }, 140);
  }

  _stopVu() {
    clearInterval(this._vuIv);
    this._vuIv = null;
  }

  /* ---------- live update ---------- */
  _tick() {
    if (!this._built || !this._$('time')) return;
    const d = new Date();
    const lang = this._hass?.locale?.language || navigator.language || 'en';
    const h = d.getHours();
    const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const name = this._config.name ?? (this._hass?.user?.name || '').split(' ')[0];
    const greet = name ? `${part}, <b>${esc(name)}</b>` : part;
    if (this._greet !== greet) this._$('greet').innerHTML = this._greet = greet;
    this._$('time').textContent = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
    this._$('date').textContent = d.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' });
    this._tvProgress();
    if (++this._ticks % 30 === 0) this._update();
  }

  _tvProgress() {
    const t = this._config.apple_tv;
    const bar = this._$('np-prog');
    if (!t?.entity || !bar) return;
    const s = this._st(t.entity);
    const a = s?.attributes || {};
    const dur = num(a.media_duration);
    let pos = num(a.media_position);
    if (!dur || pos == null) {
      bar.style.width = '0';
      return;
    }
    if (s.state === 'playing' && a.media_position_updated_at) pos += (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    bar.style.width = clamp((pos / dur) * 100, 0, 100) + '%';
  }

  _update() {
    if (!this._built || !this._hass) return;
    const c = this._config;
    const r = this.shadowRoot;
    const $ = (id) => this._$(id);
    const chips = [];

    /* lights */
    let on = 0;
    c.lights.forEach((l, i) => {
      const s = this._st(l.entity);
      const b = r.querySelector(`.lt[data-i="${i}"]`);
      const isOn = s?.state === 'on';
      if (isOn) on++;
      if (!b) return;
      b.classList.toggle('on', isOn);
      b.classList.toggle('na', !s || s.state === 'unavailable');
      b.setAttribute('aria-pressed', String(isOn));
      $('ln-' + i).textContent = l.name || s?.attributes.friendly_name || l.entity;
    });
    if (c.lights.length) {
      if ($('sum-lights')) $('sum-lights').textContent = on ? `${on} of ${c.lights.length} on` : 'All off';
      if ($('meter')) $('meter').style.width = (on / c.lights.length) * 100 + '%';
      chips.push(`<button class="chip" data-act="go" data-k="lights"><ha-icon icon="mdi:lightbulb-on" style="color:var(--amber)"></ha-icon><b>${on}</b> on</button>`);
    }

    /* scenes */
    r.querySelectorAll('.scene').forEach((b, i) => b.classList.toggle('running', this._st(c.scenes[i].entity)?.state === 'on'));

    /* climate */
    const sumC = [];
    const multiC = c.climates.length > 1;
    c.climates.forEach((cl, i) => {
      const parts = [];
      if (cl.temperature) {
        const st = this._st(cl.temperature);
        const t = num(st?.state);
        const u = st?.attributes.unit_of_measurement || '°C';
        if ($('gv-temp-' + i)) $('gv-temp-' + i).innerHTML = t == null ? '–' : `${t.toFixed(1)}<small>${esc(u)}</small>`;
        const lo = cl.temperature_min ?? 0;
        const hi = cl.temperature_max ?? 40;
        if ($('arc-temp-' + i)) $('arc-temp-' + i).setAttribute('stroke-dashoffset', RING * (1 - (t == null ? 0 : clamp((t - lo) / (hi - lo), 0, 1))));
        if (t != null) {
          parts.push(multiC ? `${t.toFixed(1)}°` : `${t.toFixed(1)}${u}`);
          if (i === 0) chips.push(`<button class="chip" data-act="go" data-k="climate"><ha-icon icon="mdi:thermometer" style="color:var(--ember)"></ha-icon><b>${t.toFixed(1)}°</b></button>`);
        }
      }
      if (cl.humidity) {
        const hm = num(this._st(cl.humidity)?.state);
        if ($('gv-hum-' + i)) $('gv-hum-' + i).innerHTML = hm == null ? '–' : `${Math.round(hm)}<small>%</small>`;
        if ($('arc-hum-' + i)) $('arc-hum-' + i).setAttribute('stroke-dashoffset', RING * (1 - (hm == null ? 0 : clamp(hm / 100, 0, 1))));
        if (hm != null) {
          parts.push(`${Math.round(hm)}%`);
          if (i === 0) chips.push(`<button class="chip" data-act="go" data-k="climate"><ha-icon icon="mdi:water-percent" style="color:var(--cyan)"></ha-icon><b>${Math.round(hm)}%</b></button>`);
        }
      }
      if (parts.length) sumC.push(multiC && cl.name ? `${cl.name} ${parts.join(' ')}` : parts.join(' · '));
    });
    const active = [];
    c.motion.forEach((m, i) => {
      const s = this._st(m.entity);
      const isOn = s?.state === 'on';
      const nm = m.name || s?.attributes.friendly_name || m.entity;
      if (isOn) {
        active.push(nm);
        chips.push(`<button class="chip mo" data-act="go" data-k="climate" style="color:var(--cyan)"><span class="dot"></span><span style="color:var(--ink-2)">${esc(nm)} motion</span></button>`);
      }
      const row = $('mo-' + i);
      if (row) row.classList.toggle('on', isOn);
      const txt = $('mos-' + i);
      if (txt) txt.textContent = !s || s.state === 'unavailable' ? 'Unavailable' : isOn ? 'Motion now' : `Clear · ${ago(s.last_changed)}`;
    });
    if (c.motion.length) sumC.push(active.length ? `${active.join(', ')} active` : 'No motion');
    if ($('sum-climate')) $('sum-climate').textContent = sumC.join(' · ') || '–';

    /* camera */
    if ($('sum-camera')) $('sum-camera').textContent = c.camera.subtitle || (this._isOpen('camera') ? 'Live' : 'Tap to view live');

    /* apple tv */
    if (c.apple_tv && $('sum-apple_tv')) {
      const t = c.apple_tv;
      const s = this._st(t.entity);
      const a = s?.attributes || {};
      const word = { playing: 'Playing', paused: 'Paused', idle: 'Idle', standby: 'Standby', off: 'Off', on: 'On', unavailable: 'Unavailable' }[s?.state] || s?.state || 'Remote';
      $('sum-apple_tv').textContent = [t.room, word, a.app_name, a.media_title].filter(Boolean).join(' · ');
      const showNp = s && ['playing', 'paused'].includes(s.state) && (a.media_title || a.app_name);
      $('np').hidden = !showNp;
      if (showNp) {
        $('np-title').textContent = a.media_title || a.app_name;
        $('np-sub').textContent = [a.media_artist || a.media_series_title, a.app_name].filter(Boolean).join(' · ') || word;
        const pic = a.entity_picture;
        const art = $('np-art');
        if (pic && art.dataset.pic !== pic) {
          art.dataset.pic = pic;
          art.innerHTML = `<img alt="" src="${esc(this._hass.hassUrl ? this._hass.hassUrl(pic) : pic)}">`;
        } else if (!pic && art.dataset.pic) {
          delete art.dataset.pic;
          art.innerHTML = '<ha-icon icon="mdi:movie-open"></ha-icon>';
        }
        if (s.state === 'playing') chips.push(`<button class="chip tv" data-act="go" data-k="apple_tv" style="color:var(--violet)"><span class="dot"></span><span style="color:var(--ink-2)">${esc(a.app_name || 'Apple TV')} playing</span></button>`);
      }
      const cur = (a.app_name || a.source || '').toLowerCase();
      r.querySelectorAll('#tvapps [data-act="app"]').forEach((b, i) => {
        const app = t.apps[i];
        const n = (app.source || app.name || '').toLowerCase();
        b.classList.toggle('sel', !!cur && !!n && s?.state !== 'off' && (cur === n || cur.includes(n) || n.includes(cur)));
      });
      this._tvProgress();
    }

    /* geyser */
    if (c.geyser) {
      const g = c.geyser;
      const sw = this._st(g.switch);
      const isOn = sw?.state === 'on';
      const val = (k) => num(this._st(g[k])?.state);
      const p = val('power');
      const load = g.power ? isOn && (p ?? 0) > (g.load_threshold ?? 10) : isOn;
      const tank = $('tank');
      tank.classList.toggle('on', isOn);
      tank.classList.toggle('hot', load);
      $('tlab').textContent = load ? 'HEATING' : isOn ? 'READY' : sw ? 'OFF' : 'N/A';
      $('gsw').setAttribute('aria-checked', String(isOn));
      $('gstate').textContent = !sw || sw.state === 'unavailable' ? 'Unavailable' : isOn ? (load ? 'On · element heating' : 'On · up to temperature') : 'Off';
      const pw = p == null ? null : p >= 1000 ? `${fx(p / 1000, 2)} <small>kW</small>` : `${Math.round(p)} <small>W</small>`;
      if ($('gs-power')) $('gs-power').innerHTML = pw ?? '–';
      if ($('gs-current')) $('gs-current').innerHTML = `${fx(val('current'), 2)} <small>A</small>`;
      if ($('gs-energy_day')) $('gs-energy_day').innerHTML = `${fx(val('energy_day'), 2)} <small>kWh</small>`;
      if ($('gs-energy_month')) $('gs-energy_month').innerHTML = `${fx(val('energy_month'), 1)} <small>kWh</small>`;
      if ($('gs-voltage')) $('gs-voltage').innerHTML = `${fx(val('voltage'), 1)} <small>V</small>`;
      const gl = $('gload');
      gl.textContent = load ? 'Load on' : 'Load off';
      gl.style.color = load ? 'var(--ember)' : 'var(--ink-3)';
      const today = val('energy_day');
      $('sum-geyser').textContent = [load ? 'Heating' : isOn ? 'On' : sw ? 'Off' : 'Unavailable', load && p != null ? (p >= 1000 ? `${fx(p / 1000, 2)} kW` : `${Math.round(p)} W`) : null, today != null ? `${fx(today, 1)} kWh today` : null]
        .filter(Boolean)
        .join(' · ');
      if (load) chips.push(`<button class="chip hot" data-act="go" data-k="geyser" style="color:var(--ember)"><span class="dot"></span><span style="color:var(--ink-2)">Geyser heating</span></button>`);
    }

    /* amp */
    if (c.amp) {
      const s = this._st(c.amp.entity);
      const a = s?.attributes || {};
      const off = !s || ['off', 'unavailable', 'standby'].includes(s.state);
      this._muted = !!a.is_volume_muted;
      this._ampLive = !off && !this._muted;
      const vol = a.volume_level != null ? Math.round(a.volume_level * 100) : null;
      const pending = this._volPending && Date.now() - this._volPending < 1500 && vol !== this._shownVol;
      if (!this._dragging && !pending) this._drawVol(vol);
      else this._drawVol(this._shownVol);
      const list = c.amp.sources || a.source_list || [];
      const key = JSON.stringify(list);
      const srcs = $('srcs');
      if (srcs.dataset.k !== key) {
        srcs.dataset.k = key;
        srcs.innerHTML = list.length
          ? list.map((x) => `<button class="src" data-act="src" data-s="${esc(x)}"><ha-icon icon="${srcIcon(x)}"></ha-icon>${esc(x)}</button>`).join('')
          : `<span class="ts">${esc(a.source || 'No sources reported')}</span>`;
      }
      srcs.querySelectorAll('.src').forEach((b) => b.classList.toggle('sel', b.dataset.s === a.source));
      $('mutebtn').classList.toggle('active', this._muted);
      $('mutebtn').querySelector('span').textContent = this._muted ? 'Unmute' : 'Mute';
      $('amppwr').classList.toggle('on', !off);
      $('ampface').classList.toggle('off', off);
      $('sum-amp').textContent = !s ? 'Unavailable' : off ? 'Off' : [a.source, this._muted ? 'Muted' : vol != null ? `${vol}%` : null].filter(Boolean).join(' · ') || 'On';
    }

    const chipEl = $('chips');
    const chipHtml = c.chips === false ? '' : chips.join('');
    if (chipEl._last !== chipHtml) chipEl.innerHTML = chipEl._last = chipHtml;
  }
}

customElements.define('ar-home-hub-card', ArHomeHubCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ar-home-hub-card',
  name: 'AR Home Hub Card',
  description: 'Whole-house card: lights, climate, motion, camera, Apple TV, geyser and amp in collapsible drawers.',
  preview: true,
  documentationURL: 'https://github.com/marsh4200',
});
console.info(`%c AR-HOME-HUB-CARD %c v${AR_HUB_VERSION} `, 'background:#0d121c;color:#ffc35a;font-weight:700', 'background:#ffc35a;color:#0d121c');
