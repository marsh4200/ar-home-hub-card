/*
 * AR Home Hub Card v2
 * One card for the whole house: greeting, who's home, live chips, scenes, and
 * collapsible sections you add in any order — lights, security, climate, media,
 * solar, covers, motion, presence, water, geyser, amp, weather, irrigation,
 * appliances, doorbell, EV charger, network, camera, or your own custom section.
 * AR Smart Home — https://arsmarthome.co.za
 */
const AR_HUB_VERSION = '2.0.4';
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
const dom = (id) => String(id || '').split('.')[0];
const ago = (iso) => {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 45) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return `${Math.round(s / 86400)} d ago`;
};
const fmtW = (w) => (w == null ? '–' : Math.abs(w) >= 1000 ? `${fx(Math.abs(w) / 1000, 2)} kW` : `${Math.round(Math.abs(w))} W`);
const asList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
/* every list item may be "entity.id" or { entity, name, icon, ... } */
const asItems = (v) => asList(v).map((x) => (typeof x === 'string' ? { entity: x } : { ...x })).filter((x) => x.entity);
const asObj = (v) => (typeof v === 'string' ? { entity: v } : v ? { ...v } : null);
const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const OFFISH = ['off', 'unavailable', 'unknown', 'standby', 'idle', 'closed', 'locked', 'not_home'];
const TOGGLE_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'siren', 'humidifier', 'valve'];
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
const APP_COLORS = [
  [/netflix/i, '#e50914', 'mdi:netflix'], [/youtube/i, '#ff0033', 'mdi:youtube'], [/dstv|showmax/i, '#0a5bd3', 'mdi:satellite-uplink'],
  [/prime|amazon/i, '#00a8e1', 'mdi:play-box-multiple'], [/disney/i, '#113ccf', 'mdi:castle'], [/spotify/i, '#1db954', 'mdi:spotify'],
  [/plex/i, '#e5a00d', 'mdi:plex'], [/twitch/i, '#9146ff', 'mdi:twitch'], [/apple music|music/i, '#fa2d48', 'mdi:music'],
  [/radio|tunein/i, '#f08a00', 'mdi:radio'], [/hdmi|tv/i, '#5fd4ff', 'mdi:hdmi-port'], [/blue/i, '#3b6cff', 'mdi:bluetooth'],
];
const appStyle = (n = '') => APP_COLORS.find(([r]) => r.test(n)) || [0, '#9b8cff', 'mdi:application'];
const PALETTE = { amber: '#ffc35a', ember: '#ff6a3d', cyan: '#5fd4ff', teal: '#3ee0b4', violet: '#9b8cff', red: '#ff5d6c', rose: '#ff8fbf', sky: '#7fa6ff', lime: '#b8e86b' };
const colorVar = (c) => (!c ? null : PALETTE[c] ? `var(--${c})` : c);
const RING = 163.4; // 2πr, r = 26
const KNOB = 235.6; // 270° of 2πr, r = 50
const DIAL_R = 66;
const DIAL_C = 2 * Math.PI * DIAL_R;
const DIAL_L = DIAL_C * 0.75;
const WEATHER_ICONS = {
  'clear-night': 'mdi:weather-night', cloudy: 'mdi:weather-cloudy', exceptional: 'mdi:alert-circle-outline', fog: 'mdi:weather-fog',
  hail: 'mdi:weather-hail', lightning: 'mdi:weather-lightning', 'lightning-rainy': 'mdi:weather-lightning-rainy', partlycloudy: 'mdi:weather-partly-cloudy',
  pouring: 'mdi:weather-pouring', rainy: 'mdi:weather-rainy', snowy: 'mdi:weather-snowy', 'snowy-rainy': 'mdi:weather-snowy-rainy',
  sunny: 'mdi:weather-sunny', windy: 'mdi:weather-windy', 'windy-variant': 'mdi:weather-windy-variant',
};
const WEATHER_WORDS = {
  'clear-night': 'Clear', cloudy: 'Cloudy', exceptional: 'Warning', fog: 'Fog', hail: 'Hail', lightning: 'Lightning', 'lightning-rainy': 'Thunderstorms',
  partlycloudy: 'Partly cloudy', pouring: 'Heavy rain', rainy: 'Rain', snowy: 'Snow', 'snowy-rainy': 'Sleet', sunny: 'Sunny', windy: 'Windy', 'windy-variant': 'Windy',
};

const STYLE = `
:host{display:block;container-type:inline-size;
  --glass:rgba(255,255,255,.055);--glass-2:rgba(255,255,255,.09);--line:rgba(255,255,255,.09);
  --ink:#eef1f7;--ink-2:#a3abbd;--ink-3:#6b7387;
  --amber:#ffc35a;--ember:#ff6a3d;--cyan:#5fd4ff;--teal:#3ee0b4;--violet:#9b8cff;--red:#ff5d6c;--rose:#ff8fbf;--sky:#7fa6ff;--lime:#b8e86b;
  --fd:"Sora",var(--ha-font-family-body,Roboto),system-ui,sans-serif;
  --fb:"Manrope",var(--ha-font-family-body,Roboto),system-ui,sans-serif;
  --fm:"JetBrains Mono",ui-monospace,Menlo,monospace}
*{box-sizing:border-box}
[hidden]{display:none!important}
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
/* presence strip */
.people{display:flex;gap:8px;margin-top:16px;overflow-x:auto;scrollbar-width:none;padding-bottom:2px}
.people::-webkit-scrollbar{display:none}
.pp{appearance:none;cursor:pointer;display:flex;align-items:center;gap:9px;padding:5px 12px 5px 5px;border-radius:999px;background:var(--glass);border:1px solid var(--line);flex:none;transition:opacity .4s,border-color .4s}
.pp .pt{display:flex;flex-direction:column;text-align:left;line-height:1.15}
.pp .pt b{font-size:12.5px;font-weight:600}
.pp .pt span{font-size:11px;color:var(--ink-2)}
.pp.home{border-color:rgba(62,224,180,.35)}
.pp.home .pt span{color:var(--teal)}
.pp.zone .pt span{color:var(--violet)}
.pp.away{opacity:.62}
.av{position:relative;width:32px;height:32px;border-radius:50%;flex:none;display:grid;place-items:center;font-family:var(--fd);font-weight:600;font-size:12px;color:#0b0f17;background:var(--g,linear-gradient(135deg,#9b8cff,#5fd4ff))}
.av img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}
.av::after{content:"";position:absolute;right:-1px;bottom:-1px;width:10px;height:10px;border-radius:50%;background:var(--ink-3);border:2px solid #0d121c;transition:background .4s}
.home .av::after{background:var(--teal);box-shadow:0 0 8px var(--teal)}
.zone .av::after{background:var(--violet)}
.away .av{filter:grayscale(.85)}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.chips:empty{display:none}
.chip{appearance:none;cursor:pointer;display:flex;align-items:center;gap:6px;padding:7px 11px;border-radius:999px;background:var(--glass);
  border:1px solid var(--line);font-size:12.5px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.chip ha-icon{--mdc-icon-size:17px}
.chip b{color:var(--ink);font-weight:600}
.chip.tint{border-color:color-mix(in srgb,var(--cc) 38%,transparent);background:color-mix(in srgb,var(--cc) 10%,transparent);color:var(--cc)}
.chip.tint>span:not(.dot){color:var(--ink-2)}
.chip.alarm{border-color:var(--red);background:rgba(255,93,108,.25);color:#fff;animation:flash 1s infinite}
@keyframes flash{50%{background:rgba(255,93,108,.05)}}
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
.drawer.flash{animation:dflash .9s ease-out}
@keyframes dflash{0%{background:rgba(255,255,255,.07)}100%{background:transparent}}
.dh{appearance:none;width:100%;background:none;border:0;display:flex;align-items:center;gap:14px;padding:15px 22px;cursor:pointer;text-align:left}
.dh:hover{background:rgba(255,255,255,.025)}
button:focus-visible,[role="slider"]:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.ico{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;flex:none;color:var(--c);
  background:color-mix(in srgb,var(--c) 15%,transparent);box-shadow:0 0 22px color-mix(in srgb,var(--c) 30%,transparent)}
.ico ha-icon{--mdc-icon-size:22px}
.t{flex:1;min-width:0;display:flex;flex-direction:column}
.tt{font-family:var(--fd);font-weight:500;font-size:15.5px}
.ts{color:var(--ink-2);font-size:12.5px;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.badge{font-family:var(--fm);font-size:10.5px;padding:3px 8px;border-radius:99px;border:1px solid color-mix(in srgb,var(--bc,var(--red)) 45%,transparent);color:var(--bc,var(--red));background:color-mix(in srgb,var(--bc,var(--red)) 8%,transparent);white-space:nowrap}
.badge:empty{display:none}
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
.sl{display:flex;justify-content:space-between;align-items:center;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);margin:18px 0 9px}
.sl:first-child{margin-top:4px}
.sl span{font-family:var(--fm);letter-spacing:0;text-transform:none}
.gl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.na{opacity:.45}
/* lights + custom tiles */
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
.ct{appearance:none;border:1px solid var(--line);background:var(--glass);color:var(--ink-2);border-radius:18px;padding:12px 11px;text-align:left;cursor:pointer;
  display:flex;flex-direction:column;gap:7px;min-height:96px;min-width:0;transition:background .3s,border-color .3s}
.ct ha-icon{--mdc-icon-size:23px;color:var(--ink-3);transition:color .3s}
.ct .cv{font-family:var(--fd);font-size:19px;font-weight:500;color:var(--ink);font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct .cv small{font-size:12px;color:var(--ink-2);font-weight:400}
.ct .ctn{font-size:11.5px;font-weight:600;color:var(--ink-2);margin-top:-4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ct.on{background:radial-gradient(120% 90% at 20% 0%,color-mix(in srgb,var(--c) 30%,transparent),color-mix(in srgb,var(--c) 6%,transparent) 70%);border-color:color-mix(in srgb,var(--c) 45%,transparent)}
.ct.on ha-icon{color:var(--c);filter:drop-shadow(0 0 8px color-mix(in srgb,var(--c) 70%,transparent))}
.ct.sensor ha-icon{color:var(--c)}
.ct.ran{animation:pulse .9s}
.ct.na{opacity:.45}
/* gauges */
.clim{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.gauge{appearance:none;cursor:pointer;text-align:left;background:var(--glass);border:1px solid var(--line);border-radius:20px;padding:14px;display:flex;align-items:center;gap:12px;min-width:0}
.ring{position:relative;width:62px;height:62px;flex:none}
.ring>svg{width:100%;height:100%;display:block}
.ring ha-icon{position:absolute;inset:0;margin:auto;width:20px;height:20px}
.ring .arc{transition:stroke-dashoffset .6s}
.gv{font-family:var(--fd);font-size:24px;font-weight:500;font-variant-numeric:tabular-nums}
.gv small{font-size:13px;color:var(--ink-2);font-weight:400}
/* rows */
.rows{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:9px}
.mot{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.mrow{appearance:none;cursor:pointer;text-align:left;background:var(--glass);border:1px solid var(--line);border-radius:16px;padding:11px 13px;display:flex;align-items:center;gap:10px;min-width:0;transition:border-color .3s,background .3s}
.mrow>ha-icon{color:var(--ink-3);transition:color .3s;flex:none}
.mrow .mt{flex:1;min-width:0}
.mrow b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mrow span{font-size:11.5px;color:var(--ink-2)}
.mrow.on{border-color:rgba(127,166,255,.45);background:rgba(127,166,255,.09)}
.mrow.on>ha-icon{color:var(--sky)}
.mrow.mo.on{border-color:rgba(95,212,255,.4);background:rgba(95,212,255,.08)}
.mrow.mo.on>ha-icon{color:var(--cyan)}
.mrow.open{border-color:rgba(255,106,61,.45);background:rgba(255,106,61,.09)}
.mrow.open>ha-icon{color:var(--ember)}
.mrow.unl{border-color:rgba(255,195,90,.45);background:rgba(255,195,90,.08)}
.mrow.unl>ha-icon{color:var(--amber)}
.pill{appearance:none;border:1px solid var(--line);background:var(--glass-2);border-radius:99px;font-size:11.5px;font-weight:700;padding:6px 11px;cursor:pointer;white-space:nowrap;flex:none}
.pill.big{padding:9px 16px;font-size:12.5px}
/* motion timeline */
.mline{display:grid;grid-template-columns:minmax(0,150px) minmax(0,1fr);gap:12px;align-items:center;background:var(--glass);border:1px solid var(--line);border-radius:16px;padding:10px 13px;cursor:pointer;appearance:none;text-align:left;width:100%;transition:border-color .3s,background .3s}
.mline+.mline{margin-top:8px}
.mline .who{display:flex;gap:10px;align-items:center;min-width:0}
.mline .who ha-icon{color:var(--ink-3);flex:none}
.mline .who b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mline .who span{font-size:11.5px;color:var(--ink-2);white-space:nowrap}
.mline.on{border-color:rgba(127,166,255,.45);background:rgba(127,166,255,.08)}
.mline.on .who ha-icon{color:var(--sky)}
.strip{display:flex;gap:2px;align-items:flex-end;height:26px}
.strip i{flex:1;border-radius:2px;background:var(--glass-2);height:12%}
.strip i.h{background:color-mix(in srgb,var(--sky) 70%,transparent)}
.strip i.now{background:var(--sky);box-shadow:0 0 8px var(--sky)}
.axis{display:flex;justify-content:space-between;font-family:var(--fm);font-size:10px;color:var(--ink-3);margin:6px 0 0 162px}
/* security: alarm */
.alarm{display:flex;align-items:center;gap:16px;background:var(--glass);border:1px solid var(--line);border-radius:22px;padding:14px 16px;transition:border-color .4s,background .4s;width:100%;appearance:none;text-align:left;cursor:pointer}
.alarm .aring{position:relative;width:74px;height:74px;flex:none}
.alarm .aring>svg{width:100%;height:100%;display:block}
.alarm .aring ha-icon{position:absolute;inset:0;margin:auto;width:28px;height:28px;--mdc-icon-size:28px;color:var(--teal);transition:color .4s}
.alarm .aarc{transition:stroke-dashoffset 1s linear,stroke .4s}
.astate{font-family:var(--fd);font-size:21px;font-weight:500;margin-top:2px}
.alarm.armed{border-color:rgba(255,93,108,.4);background:radial-gradient(120% 120% at 0% 0%,rgba(255,93,108,.16),transparent 60%),var(--glass)}
.alarm.armed .aring ha-icon{color:var(--red)}
.alarm.pending .aring ha-icon{color:var(--amber)}
.alarm.triggered{border-color:var(--red);animation:trig 1s infinite}
.alarm.triggered .aring ha-icon{color:#fff}
@keyframes trig{50%{background:rgba(255,93,108,.28)}}
.arms{display:grid;grid-template-columns:repeat(var(--n,4),minmax(0,1fr));gap:8px;margin-top:10px}
.arm{appearance:none;cursor:pointer;border:1px solid var(--line);background:var(--glass);border-radius:16px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11.5px;font-weight:600;color:var(--ink-2);transition:all .3s;min-width:0}
.arm ha-icon{--mdc-icon-size:21px}
.arm.sel{color:var(--ink);border-color:rgba(255,93,108,.55);background:rgba(255,93,108,.13)}
.arm.sel ha-icon{color:var(--red)}
.arm.dis.sel{border-color:rgba(62,224,180,.5);background:rgba(62,224,180,.1)}
.arm.dis.sel ha-icon{color:var(--teal)}
.keypad{display:flex;gap:8px;align-items:center;margin-top:10px}
.keypad input{flex:1;min-width:0;background:rgba(0,0,0,.25);border:1px solid var(--line);border-radius:12px;padding:10px 12px;color:var(--ink);font:500 16px var(--fm);letter-spacing:.3em}
/* cameras */
.cams{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
.cams.one{grid-template-columns:1fr}
.cam{appearance:none;cursor:pointer;padding:0;border:1px solid var(--line);border-radius:18px;overflow:hidden;position:relative;aspect-ratio:16/10;background:#05070b;min-width:0;max-width:100%;transition:border-color .3s;display:block;width:100%}
.cam.big{grid-column:1/-1;aspect-ratio:auto;min-height:120px;cursor:default}
.cam.mot{border-color:rgba(127,166,255,.7);box-shadow:0 0 0 1px rgba(127,166,255,.5),0 0 22px rgba(127,166,255,.25)}
.cam img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.cam .ph{position:absolute;inset:0;display:grid;place-items:center;color:var(--ink-3)}
.cam .ph ha-icon{--mdc-icon-size:32px}
.cam .live-slot{position:relative;width:100%}
.ov{position:absolute;left:0;right:0;top:0;display:flex;justify-content:space-between;align-items:center;padding:8px 10px;font-family:var(--fm);font-size:10px;color:rgba(255,255,255,.85);background:linear-gradient(180deg,rgba(0,0,0,.55),transparent);text-shadow:0 1px 2px #000;pointer-events:none;z-index:1}
.ov .lv{display:flex;align-items:center;gap:5px;color:#fff;font-weight:500}
.ov .lv::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--red);animation:blink 1.4s infinite}
@keyframes blink{50%{opacity:.25}}
.cn{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:22px 11px 9px;background:linear-gradient(0deg,rgba(0,0,0,.7),transparent);text-align:left;pointer-events:none;z-index:1}
.cn b{font-size:12.5px;font-weight:600}
.cn .mb{font-family:var(--fm);font-size:10px;color:var(--sky);display:none;align-items:center;gap:4px}
.cam.mot .cn .mb{display:flex}
.cam.big .cn{display:none}
.camx{position:absolute;right:8px;top:30px;z-index:2;appearance:none;border:0;border-radius:99px;background:rgba(0,0,0,.55);color:#fff;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;display:none}
.cam.big .camx{display:block}
.slot{--ha-card-background:transparent;--card-background-color:transparent;--ha-card-box-shadow:none;--ha-card-border-width:0;--ha-card-border-color:transparent}
.slot.camslot{border-radius:20px;overflow:hidden;background:#05070b;border:1px solid var(--line);min-height:120px}
.ph169{display:grid;place-items:center;aspect-ratio:16/9;color:var(--ink-3)}
.ph169 ha-icon{--mdc-icon-size:36px}
/* doorbell */
.ring-banner{display:flex;align-items:center;gap:10px;border:1px solid rgba(255,195,90,.5);background:rgba(255,195,90,.12);border-radius:16px;padding:10px 13px;margin-bottom:10px;color:var(--amber);animation:flash2 1.2s infinite}
.ring-banner b{color:var(--ink);font-size:13px}
@keyframes flash2{50%{background:rgba(255,195,90,.03)}}
.dbacts{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
/* climate: AC */
.tabs{display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap}
.tab{appearance:none;cursor:pointer;border:1px solid var(--line);background:var(--glass);border-radius:99px;padding:7px 12px;font-size:12px;font-weight:600;color:var(--ink-2);display:inline-flex;align-items:center;gap:6px}
.tab i{width:7px;height:7px;border-radius:50%;background:var(--ink-3)}
.tab.sel{color:var(--ink);background:var(--glass-2);border-color:rgba(255,255,255,.2)}
.ac{--m:var(--cyan);display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px;background:radial-gradient(90% 80% at 50% 0%,color-mix(in srgb,var(--m) 14%,transparent),transparent 70%),var(--glass);border:1px solid var(--line);border-radius:24px;padding:14px 12px 10px;transition:background .5s}
.ac[data-mode="heat"]{--m:var(--ember)}.ac[data-mode="heat_cool"],.ac[data-mode="auto"]{--m:var(--teal)}.ac[data-mode="fan_only"]{--m:var(--violet)}.ac[data-mode="dry"]{--m:var(--amber)}.ac[data-mode="off"],.ac[data-mode="unavailable"]{--m:var(--ink-3)}
.acb{appearance:none;cursor:pointer;width:46px;height:46px;border-radius:50%;border:1px solid var(--line);background:var(--glass-2);display:grid;place-items:center}
.acb ha-icon{--mdc-icon-size:24px}
.acb:active{transform:scale(.92)}
.dial{position:relative;width:min(190px,100%);aspect-ratio:1;margin:0 auto}
.dial>svg{width:100%;height:100%;display:block;overflow:visible}
.dial .darc{transition:stroke-dasharray .4s,stroke .5s}
.dial .thumb{transition:transform .4s cubic-bezier(.2,.8,.2,1);transform-origin:80px 80px}
.dval{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.dval .gl{color:var(--m);transition:color .5s;display:flex;align-items:center;gap:4px}
.dval .gl ha-icon{--mdc-icon-size:15px}
.ac[data-action="cooling"] .dval .gl ha-icon,.ac[data-action="fan"] .dval .gl ha-icon{animation:spin 3s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.dval strong{font-family:var(--fd);font-size:44px;font-weight:300;line-height:1.05;font-variant-numeric:tabular-nums}
.dval strong sup{font-size:16px;color:var(--ink-2);vertical-align:top;margin-left:2px;font-weight:400;position:relative;top:8px}
.dval span{font-size:12px;color:var(--ink-2);font-variant-numeric:tabular-nums}
.ac[data-mode="off"] .dval strong{color:var(--ink-3)}
.air{position:absolute;left:22%;right:22%;bottom:4%;height:18px;display:flex;justify-content:space-between;opacity:0;transition:opacity .5s}
.ac[data-action="cooling"] .air,.ac[data-action="heating"] .air{opacity:1}
.air i{width:2px;height:100%;border-radius:2px;background:linear-gradient(180deg,var(--m),transparent);animation:flow 1.6s ease-in infinite}
.air i:nth-child(2){animation-delay:.3s}.air i:nth-child(3){animation-delay:.6s}.air i:nth-child(4){animation-delay:.15s}.air i:nth-child(5){animation-delay:.45s}
@keyframes flow{0%{transform:translateY(-6px);opacity:0}40%{opacity:1}100%{transform:translateY(10px);opacity:0}}
.modes{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.mode{appearance:none;cursor:pointer;flex:1;min-width:58px;border:1px solid var(--line);background:var(--glass);border-radius:14px;padding:8px 4px;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:11px;font-weight:600;color:var(--ink-2)}
.mode ha-icon{--mdc-icon-size:19px}
.mode.sel{color:var(--ink);border-color:color-mix(in srgb,var(--mc) 60%,transparent);background:color-mix(in srgb,var(--mc) 14%,transparent)}
.mode.sel ha-icon{color:var(--mc)}
.segrow{display:flex;align-items:center;gap:8px;margin-top:10px;font-size:12px;color:var(--ink-2)}
.seg{display:flex;flex:1;background:var(--glass);border:1px solid var(--line);border-radius:99px;padding:3px;min-width:0;overflow-x:auto;scrollbar-width:none}
.seg button{appearance:none;flex:1;border:0;background:none;border-radius:99px;padding:6px 8px;font-size:11.5px;font-weight:600;color:var(--ink-2);cursor:pointer;white-space:nowrap}
.seg button.sel{background:var(--glass-2);color:var(--ink)}
/* presence drawer */
.pgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.pc{appearance:none;cursor:pointer;text-align:left;background:var(--glass);border:1px solid var(--line);border-radius:20px;padding:13px;display:flex;flex-direction:column;gap:12px;min-width:0;transition:border-color .4s,background .4s}
.pc .top{display:flex;align-items:center;gap:11px;min-width:0}
.pc .av{width:48px;height:48px;font-size:16px}
.pc .av::after{width:13px;height:13px;border-width:3px}
.pc .nm{font-family:var(--fd);font-weight:500;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pc .stt{font-size:12.5px;font-weight:700;color:var(--ink-2)}
.pc.home{border-color:rgba(62,224,180,.35);background:radial-gradient(120% 100% at 0% 0%,rgba(62,224,180,.12),transparent 60%),var(--glass)}
.pc.home .stt{color:var(--teal)}
.pc.zone .stt{color:var(--violet)}
.pc .meta{display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11.5px;color:var(--ink-2)}
.pc .meta div{display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.pc .meta ha-icon{--mdc-icon-size:15px;color:var(--ink-3);flex:none}
.batt{height:4px;border-radius:9px;background:var(--glass-2);overflow:hidden}
.batt i{display:block;height:100%;width:0;background:var(--teal);border-radius:inherit;transition:width .5s}
/* media */
.np{display:flex;align-items:center;gap:12px;background:var(--glass);border:1px solid var(--line);border-radius:18px;padding:11px 13px;margin-bottom:12px}
.mp{display:flex;gap:14px;align-items:center;background:var(--glass);border:1px solid var(--line);border-radius:22px;padding:14px}
.mp .art{width:88px;height:88px;border-radius:18px;flex:none;display:grid;place-items:center;overflow:hidden;color:#fff;background:linear-gradient(135deg,var(--violet),#0b0f17 85%);box-shadow:0 12px 30px rgba(0,0,0,.45);transition:background .5s}
.mp .art img{width:100%;height:100%;object-fit:cover;display:block}
.mp .art ha-icon{--mdc-icon-size:34px}
.mp .mi{flex:1;min-width:0}
.mapp{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--violet);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp .mi b{display:block;font-family:var(--fd);font-weight:500;font-size:16px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mp .mi>span{font-size:12px;color:var(--ink-2);display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.prog{height:4px;border-radius:9px;background:var(--glass-2);margin-top:9px;overflow:hidden}
.prog i{display:block;height:100%;width:0;background:var(--violet);border-radius:inherit;transition:width 1s linear}
.ctrls{display:flex;align-items:center;gap:8px;margin-top:10px}
.cb{appearance:none;width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--glass-2);display:grid;place-items:center;cursor:pointer;flex:none}
.cb:active{transform:scale(.92)}
.cb.pl{width:44px;height:44px;background:var(--ink);color:#0d121c;border:0}
.cb.sm{width:34px;height:34px}
.cb.sm ha-icon{--mdc-icon-size:18px}
.cb.on{color:var(--teal)}
.vol{display:flex;align-items:center;gap:10px;margin-top:12px;color:var(--ink-2);font-family:var(--fm);font-size:12px}
.vol input{flex:1;accent-color:var(--violet);min-width:0}
.apps{display:grid;grid-template-columns:repeat(auto-fit,64px);justify-content:center;gap:12px 10px;margin-top:12px}
.apps.top{justify-content:start;margin:0 0 12px}
.chiprow.top{margin:0 0 12px}
.np .art{width:46px;height:46px;border-radius:12px;flex:none;overflow:hidden;background:linear-gradient(135deg,#9b8cff,#5fd4ff 60%,#3ee0b4);display:grid;place-items:center;color:#0b0f17}
.np .art img{width:100%;height:100%;object-fit:cover;display:block}
.np .meta{flex:1;min-width:0}
.np .meta b{display:block;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np .meta span{font-size:11.5px;color:var(--ink-2)}
.app{appearance:none;background:none;border:0;padding:0;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:6px;color:var(--ink-2);min-width:0}
.app .tile{width:56px;height:56px;border-radius:17px;display:grid;place-items:center;overflow:hidden;
  background:color-mix(in srgb,var(--app,#9b8cff) 16%,rgba(255,255,255,.05));border:1px solid color-mix(in srgb,var(--app,#9b8cff) 30%,transparent);
  color:var(--app,var(--ink));transition:transform .15s,box-shadow .3s,border-color .3s}
.app .tile ha-icon{--mdc-icon-size:28px}
.app .tile img{width:100%;height:100%;object-fit:cover;display:block}
.app .lab{font-size:10.5px;font-weight:600;letter-spacing:.02em;max-width:64px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.app:active .tile{transform:scale(.92)}
.app.sel .tile{border-color:var(--violet);box-shadow:0 0 0 2px rgba(155,140,255,.45),0 0 18px rgba(155,140,255,.45)}
.app.sel .lab{color:var(--ink)}
.chiprow{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.src{appearance:none;border:1px solid var(--line);background:var(--glass);color:var(--ink-2);font-size:12px;font-weight:600;padding:7px 11px;border-radius:999px;cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.src ha-icon{--mdc-icon-size:16px}
.src.sel{background:rgba(62,224,180,.14);border-color:rgba(62,224,180,.5);color:var(--teal)}
.src.vsel{background:rgba(155,140,255,.16);border-color:rgba(155,140,255,.55);color:var(--violet)}
.mp~.remote,.vol~.remote,.apps.top+.remote,.chiprow.top+.remote{margin-top:12px}
/* covers */
.cov{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:center;background:var(--glass);border:1px solid var(--line);border-radius:18px;padding:11px 12px;transition:border-color .3s,background .3s}
.cov+.cov{margin-top:8px}
.cov .cico{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:var(--glass-2);color:var(--ink-3);transition:color .3s;appearance:none;border:0;cursor:pointer}
.cov b{display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cov .mt>span{font-size:11.5px;color:var(--ink-2)}
.cov .bar{height:5px;border-radius:9px;background:var(--glass-2);margin-top:6px;overflow:hidden}
.cov .bar i{display:block;height:100%;width:0;background:var(--sky);border-radius:inherit;transition:width .4s}
.cov.op{border-color:rgba(127,166,255,.4);background:rgba(127,166,255,.07)}
.cov.op .cico{color:var(--sky)}
.cov.mv .cico{animation:pulse 1s infinite}
.cbtns{display:flex;gap:5px}
/* energy */
.ls{display:flex;gap:11px;align-items:center;border:1px solid rgba(255,195,90,.35);background:rgba(255,195,90,.08);border-radius:16px;padding:10px 13px;margin-bottom:6px}
.ls ha-icon{color:var(--amber);flex:none}
.ls b{display:block;font-size:13px}
.ls span{font-size:11.5px;color:var(--ink-2)}
.ls.now{border-color:rgba(255,93,108,.5);background:rgba(255,93,108,.1)}
.ls.now ha-icon{color:var(--red)}
.flow{position:relative;width:100%;max-width:440px;margin:0 auto;aspect-ratio:320/200}
.flow>svg{position:absolute;inset:0;width:100%;height:100%}
.flow>svg path{fill:none;stroke:rgba(255,255,255,.08);stroke-width:2.5;stroke-linecap:round}
.flow>svg path.live{stroke:var(--fc);stroke-dasharray:3 9;animation:dash .8s linear infinite}
.flow>svg path.rev{animation-direction:reverse}
@keyframes dash{to{stroke-dashoffset:-12}}
.node{position:absolute;transform:translate(-50%,-50%);width:70px;height:70px;border-radius:50%;background:#121825;border:2px solid var(--nc);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;box-shadow:0 0 22px color-mix(in srgb,var(--nc) 30%,transparent);appearance:none;cursor:pointer;padding:0;color:var(--ink)}
.node ha-icon{--mdc-icon-size:18px;color:var(--nc)}
.node b{font-family:var(--fm);font-size:11.5px;font-weight:500;white-space:nowrap}
.node span{font-size:9px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.07em}
.node.idle{border-color:rgba(255,255,255,.12);box-shadow:none}
.node.idle ha-icon{color:var(--ink-3)}
.node[hidden]{display:none}
/* stats */
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.stats.s4{grid-template-columns:repeat(4,minmax(0,1fr));margin-top:6px}
.stats.s3{grid-template-columns:repeat(3,minmax(0,1fr))}
.stat{background:var(--glass);border:1px solid var(--line);border-radius:14px;padding:9px 11px;min-width:0;appearance:none;text-align:left;color:inherit;cursor:pointer}
.stat.wide{grid-column:1/-1;display:flex;justify-content:space-between;align-items:center}
.stat .k{font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat .v{font-family:var(--fm);font-size:15px;font-weight:500;margin-top:2px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.stat .v small{color:var(--ink-2);font-size:11px}
.load{font-weight:700}
/* geyser + water tank */
.gey{display:grid;grid-template-columns:120px minmax(0,1fr);gap:14px;align-items:stretch}
.tank{position:relative;border-radius:30px 30px 22px 22px;border:1px solid var(--line);background:var(--glass);overflow:hidden;min-height:200px}
.water{position:absolute;left:0;right:0;bottom:0;height:78%;background:linear-gradient(180deg,rgba(95,212,255,.22),rgba(95,212,255,.06));transition:background .8s,height .8s}
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
.tog>div{min-width:0}
.tog b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tog span{font-size:12px;color:var(--ink-2)}
.sw{appearance:none;width:54px;height:30px;border-radius:99px;background:var(--glass-2);border:1px solid var(--line);position:relative;cursor:pointer;transition:background .3s;flex:none;padding:0}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#cfd6e4;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.sw[aria-checked="true"]{background:linear-gradient(90deg,var(--ember),#ff9a4d)}
.sw[aria-checked="true"]::after{transform:translateX(24px);background:#fff}
.sw.w[aria-checked="true"]{background:linear-gradient(90deg,#2aa7d8,var(--cyan))}
.sw.g[aria-checked="true"]{background:linear-gradient(90deg,#1fae86,var(--teal))}
/* amp */
.ampface{background:linear-gradient(180deg,#151a24,#0e121a);border:1px solid var(--line);border-radius:22px;padding:16px;display:grid;grid-template-columns:auto minmax(0,1fr);gap:18px;align-items:center;transition:opacity .3s}
.ampface.off{opacity:.55}
.knob{width:118px;height:118px;position:relative;touch-action:none;cursor:grab;border-radius:50%}
.knob>svg{width:100%;height:100%;display:block}
.kval{position:absolute;inset:0;display:grid;place-items:center;font-family:var(--fd);font-size:24px;font-weight:500;font-variant-numeric:tabular-nums;pointer-events:none}
.aside{min-width:0;width:100%}
.ampl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px}
.srcs{display:flex;flex-wrap:wrap;gap:7px}
.vu{display:flex;gap:3px;align-items:flex-end;height:26px;margin-top:12px}
.vu i{flex:1;background:var(--teal);border-radius:2px;opacity:.85;height:8%;transition:height .12s}
.vrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.pwr.on{color:var(--teal)}
/* weather */
.wx{display:flex;align-items:center;gap:16px;background:radial-gradient(120% 120% at 0% 0%,rgba(95,212,255,.14),transparent 60%),var(--glass);border:1px solid var(--line);border-radius:22px;padding:14px 16px;appearance:none;width:100%;text-align:left;cursor:pointer}
.wx>ha-icon{--mdc-icon-size:52px;color:var(--amber);filter:drop-shadow(0 0 14px rgba(255,195,90,.45));flex:none}
.wx .wt{font-family:var(--fd);font-size:38px;font-weight:300;line-height:1}
.wx .wt small{font-size:16px;color:var(--ink-2)}
.wx .wd{font-size:13px;color:var(--ink-2);margin-top:4px}
.fc{display:grid;grid-template-columns:repeat(var(--n,5),minmax(0,1fr));gap:7px;margin-top:10px}
.fd{background:var(--glass);border:1px solid var(--line);border-radius:16px;padding:9px 4px;display:flex;flex-direction:column;align-items:center;gap:4px;min-width:0}
.fd .dn{font-size:11px;font-weight:700;color:var(--ink-2);text-transform:uppercase;letter-spacing:.06em}
.fd ha-icon{--mdc-icon-size:24px;color:var(--ink-2)}
.fd .hi{font-family:var(--fm);font-size:13px}
.fd .lo{font-family:var(--fm);font-size:11px;color:var(--ink-3)}
.fd .pr{font-size:10px;color:var(--cyan);font-family:var(--fm)}
/* appliance / ev */
.apl{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:14px;align-items:center;background:var(--glass);border:1px solid var(--line);border-radius:20px;padding:12px 14px}
.apl+.apl{margin-top:9px}
.apl .ring{width:56px;height:56px}
.apl .ring ha-icon{width:22px;height:22px}
.apl b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.apl .as{font-size:12px;color:var(--ink-2)}
.apl .ar{font-family:var(--fm);font-size:13px;text-align:right;white-space:nowrap}
.apl .ar small{display:block;font-size:10.5px;color:var(--ink-3)}
.apl.run{border-color:color-mix(in srgb,var(--c) 40%,transparent);background:radial-gradient(120% 100% at 0% 0%,color-mix(in srgb,var(--c) 12%,transparent),transparent 60%),var(--glass)}
.apl.run .ring ha-icon{animation:wob 1.2s ease-in-out infinite}
@keyframes wob{50%{transform:rotate(12deg)}}
.ev{background:var(--glass);border:1px solid var(--line);border-radius:22px;padding:14px 16px}
.ev .evtop{display:flex;justify-content:space-between;align-items:flex-end;gap:10px}
.ev .evp{font-family:var(--fd);font-size:34px;font-weight:300;line-height:1}
.ev .evp small{font-size:15px;color:var(--ink-2)}
.ev .evs{font-size:12.5px;color:var(--ink-2);text-align:right}
.ev .evs b{display:block;color:var(--ink);font-size:13.5px}
.evbar{position:relative;height:14px;border-radius:9px;background:var(--glass-2);margin-top:12px;overflow:hidden}
.evbar i{position:absolute;inset:0 auto 0 0;width:0;border-radius:inherit;background:linear-gradient(90deg,#1fae86,var(--lime));transition:width .6s}
.evbar.chg i::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.5),transparent);animation:sweep 1.8s linear infinite}
@keyframes sweep{from{transform:translateX(-100%)}to{transform:translateX(100%)}}
.evtick{position:absolute;top:0;bottom:0;width:2px;background:rgba(255,255,255,.6)}
/* network */
.net{display:flex;align-items:center;gap:14px;background:var(--glass);border:1px solid var(--line);border-radius:20px;padding:13px 15px;margin-bottom:9px;appearance:none;width:100%;text-align:left;cursor:pointer}
.net .nd{width:14px;height:14px;border-radius:50%;background:var(--ink-3);flex:none}
.net.up .nd{background:var(--teal);box-shadow:0 0 0 0 rgba(62,224,180,.6);animation:ping 1.8s infinite;color:var(--teal)}
.net.down{border-color:rgba(255,93,108,.5);background:rgba(255,93,108,.08)}
.net.down .nd{background:var(--red)}
.net b{display:block;font-family:var(--fd);font-weight:500;font-size:16px}
.net span{font-size:12px;color:var(--ink-2)}
.empty{padding:26px 22px;text-align:center;color:var(--ink-2);font-size:13px}
.err{color:var(--red);font-size:12.5px}
@container (max-width:460px){
  .lgrid,.cgrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .gey{grid-template-columns:96px minmax(0,1fr)}
  .ampface{grid-template-columns:1fr;justify-items:center}
  .greet{font-size:22px}.hero,.dh{padding-left:16px;padding-right:16px}.inner{padding-left:16px;padding-right:16px}
  .arms{grid-template-columns:repeat(2,minmax(0,1fr))}
  .pgrid{grid-template-columns:1fr}
  .mline{grid-template-columns:1fr}.axis{margin-left:0}
  .acb{width:40px;height:40px}
  .stats.s4{grid-template-columns:repeat(2,minmax(0,1fr))}
  .mp .art{width:68px;height:68px}
  .fc{grid-template-columns:repeat(min(var(--n,5),4),minmax(0,1fr))}
  .fc .fd:nth-child(n+5){display:none}
}
@container (max-width:340px){.scenes{grid-template-columns:1fr!important}.clim,.cams{grid-template-columns:1fr}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

/* ---------- shared building blocks used by several section types ---------- */
const chipHtml = (sk, o) =>
  `<button class="chip${o.tint ? ' tint' : ''}${o.cls ? ' ' + o.cls : ''}" data-act="go" data-s="${sk}"${o.tint ? ` style="--cc:${o.tint}"` : ''}>` +
  `${o.dot ? '<span class="dot"></span>' : ''}${o.icon ? `<ha-icon icon="${o.icon}"${o.color ? ` style="color:${o.color}"` : ''}></ha-icon>` : ''}` +
  `${o.b != null ? `<b>${esc(o.b)}</b>` : ''}${o.text ? `<span>${o.b != null ? ' ' : ''}${esc(o.text)}</span>` : ''}</button>`;

const gaugeHtml = (id, ent, label, icon, color, stroke) => `<button class="gauge" data-act="more" data-e="${esc(ent)}">
  <span class="ring"><svg viewBox="0 0 64 64" aria-hidden="true">
    <defs><linearGradient id="g-${id}"><stop offset="0" stop-color="${stroke[0]}"/><stop offset="1" stop-color="${stroke[1]}"/></linearGradient></defs>
    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="6"/>
    <circle class="arc" id="arc-${id}" cx="32" cy="32" r="26" fill="none" stroke="url(#g-${id})" stroke-width="6" stroke-linecap="round"
      stroke-dasharray="${RING}" stroke-dashoffset="${RING}" transform="rotate(-90 32 32)"/></svg>
    <ha-icon icon="${icon}" style="color:${color}"></ha-icon></span>
  <div><div class="gl">${esc(label)}</div><div class="gv" id="gv-${id}">–</div></div></button>`;

const ringSvg = (id, color) => `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
  <circle class="arc" id="${id}" cx="32" cy="32" r="26" fill="none" stroke="${color}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${RING}" stroke-dashoffset="${RING}" transform="rotate(-90 32 32)"/></svg>`;

/* power in watts whatever unit the sensor reports */
const watts = (c, id) => {
  const s = c.st(id);
  const v = num(s?.state);
  if (v == null) return null;
  const u = (s.attributes.unit_of_measurement || '').toLowerCase();
  return u === 'kw' ? v * 1000 : u === 'mw' ? v * 1e6 : v;
};

/* value + unit for a sensor, using HA's own formatting when available */
const valHtml = (c, id, dp) => {
  const s = c.st(id);
  if (!s) return '–';
  if (['unavailable', 'unknown'].includes(s.state)) return '–';
  const n = num(s.state);
  const u = s.attributes.unit_of_measurement || '';
  if (n == null) return esc(c.fmt(id));
  const d = dp ?? (Math.abs(n) >= 100 || Number.isInteger(n) ? 0 : 1);
  return `${n.toFixed(d)}${u ? `<small> ${esc(u)}</small>` : ''}`;
};

/* ---------- generic tile: shows any entity by its domain ---------- */
const TILE_ICONS = {
  light: 'mdi:lightbulb', switch: 'mdi:toggle-switch-variant', fan: 'mdi:fan', input_boolean: 'mdi:toggle-switch', sensor: 'mdi:gauge',
  binary_sensor: 'mdi:checkbox-blank-circle-outline', cover: 'mdi:window-shutter', lock: 'mdi:lock', script: 'mdi:script-text-play',
  scene: 'mdi:palette', button: 'mdi:gesture-tap-button', input_button: 'mdi:gesture-tap-button', media_player: 'mdi:speaker',
  climate: 'mdi:thermostat', person: 'mdi:account', device_tracker: 'mdi:cellphone', weather: 'mdi:weather-partly-cloudy', valve: 'mdi:valve',
  vacuum: 'mdi:robot-vacuum', number: 'mdi:numeric', input_number: 'mdi:numeric', select: 'mdi:form-dropdown', input_select: 'mdi:form-dropdown',
  camera: 'mdi:cctv', timer: 'mdi:timer-outline', counter: 'mdi:counter', siren: 'mdi:alarm-light', automation: 'mdi:robot',
};
const tileAct = (d) =>
  TOGGLE_DOMAINS.includes(d) || d === 'automation' ? 'toggle' : ['script', 'scene', 'button', 'input_button'].includes(d) ? 'run' : d === 'cover' ? 'cover' : d === 'lock' ? 'lock' : d === 'media_player' ? 'play' : 'more';
const tileHtml = (c, sk, it, id) => {
  const d = dom(it.entity);
  const icon = it.icon || c.st(it.entity)?.attributes.icon || TILE_ICONS[d] || 'mdi:shape';
  return `<button class="ct" data-act="tile" data-s="${sk}" data-t="${tileAct(d)}" data-e="${esc(it.entity)}" id="${id}"><ha-icon icon="${esc(icon)}"></ha-icon><span class="cv" id="${id}v"></span><span class="ctn">${esc(c.nm(it))}</span></button>`;
};
/* returns true when the tile is "on" */
const tileUpdate = (c, it, id) => {
  const el = c.$(id);
  if (!el) return false;
  const s = c.st(it.entity);
  const d = dom(it.entity);
  let v = '';
  let on = false;
  if (!s) v = 'Missing';
  else if (s.state === 'unavailable') v = 'Unavailable';
  else if (TOGGLE_DOMAINS.includes(d) || d === 'automation') {
    on = s.state === 'on' || s.state === 'open';
    v = d === 'light' && on && s.attributes.brightness ? `${Math.round((s.attributes.brightness / 255) * 100)}<small> %</small>` : on ? 'On' : 'Off';
  } else if (d === 'sensor' || d === 'number' || d === 'input_number' || d === 'counter') v = valHtml(c, it.entity);
  else if (d === 'binary_sensor') {
    on = s.state === 'on';
    v = esc(c.fmt(it.entity));
  } else if (d === 'cover') {
    on = s.state !== 'closed';
    v = s.attributes.current_position != null && s.state === 'open' ? `${s.attributes.current_position}<small> %</small>` : esc(c.fmt(it.entity));
  } else if (d === 'lock') {
    on = s.state !== 'locked';
    v = esc(c.fmt(it.entity));
  } else if (d === 'media_player') {
    on = s.state === 'playing';
    v = esc(s.attributes.media_title || c.fmt(it.entity));
  } else if (d === 'person' || d === 'device_tracker') {
    on = s.state === 'home';
    v = esc(s.state === 'home' ? 'Home' : s.state === 'not_home' ? 'Away' : s.state);
  } else if (d === 'climate') {
    on = s.state !== 'off';
    v = s.attributes.current_temperature != null ? `${s.attributes.current_temperature}<small> °</small>` : esc(c.fmt(it.entity));
  } else if (d === 'weather') v = `${s.attributes.temperature ?? '–'}<small> ${esc(s.attributes.temperature_unit || '°')}</small>`;
  else if (['script', 'scene', 'button', 'input_button'].includes(d)) {
    on = s.state === 'on';
    v = on ? 'Running' : d === 'button' || d === 'input_button' ? 'Press' : 'Run';
  } else v = esc(c.fmt(it.entity));
  if (it.unit && num(s?.state) != null) v = `${esc(s.state)}<small> ${esc(it.unit)}</small>`;
  el.classList.toggle('on', on);
  el.classList.toggle('sensor', ['sensor', 'number', 'input_number', 'weather', 'counter'].includes(d));
  el.classList.toggle('na', !s || s.state === 'unavailable');
  const vEl = c.$(id + 'v');
  if (vEl.innerHTML !== v) vEl.innerHTML = v;
  return on;
};
const tileAction = (c, el) => {
  const id = el.dataset.e;
  const s = c.st(id);
  const d = dom(id);
  switch (el.dataset.t) {
    case 'toggle':
      el.classList.toggle('on');
      return c.call('homeassistant', 'toggle', { entity_id: id });
    case 'run':
      el.classList.remove('ran');
      void el.offsetWidth;
      el.classList.add('ran');
      if (d === 'button' || d === 'input_button') return c.call(d, 'press', { entity_id: id });
      return c.call(d, 'turn_on', { entity_id: id });
    case 'cover':
      return c.call('cover', 'toggle', { entity_id: id });
    case 'lock':
      return c.call('lock', s?.state === 'locked' ? 'unlock' : 'lock', { entity_id: id });
    case 'play':
      return c.call('media_player', 'media_play_pause', { entity_id: id });
    default:
      return c.more(id);
  }
};

/* ---------- camera tiles (security + doorbell) ---------- */
const camTileHtml = (sk, cam, id) => `<div class="cam" id="${id}" role="button" tabindex="0" data-act="cam" data-s="${sk}" data-c="${id}" aria-label="${esc(cam._name)} camera">
    <div class="ph"><ha-icon icon="mdi:cctv"></ha-icon></div><img id="${id}i" alt="" hidden>
    <div class="slot live-slot" id="${id}l"></div>
    <div class="ov"><span class="lv">LIVE</span><span class="clk" id="${id}t"></span></div>
    <div class="cn"><b>${esc(cam._name)}</b><span class="mb"><span class="dot"></span>MOTION</span></div>
    <button class="camx" data-act="camclose" data-s="${sk}" data-c="${id}">Close</button></div>`;
const camSnapshot = (c, cam, id, force) => {
  const img = c.$(id + 'i');
  const s = c.st(cam.entity);
  if (!img || !s || c._camLive === id) return;
  const pic = s.attributes.entity_picture;
  if (!pic) return;
  const now = Date.now();
  const every = (cam.refresh ?? 10) * 1000;
  if (!force && img.dataset.t && now - +img.dataset.t < every) return;
  img.dataset.t = now;
  const url = c.url(pic) + (pic.includes('?') ? '&' : '?') + 't=' + now;
  const pre = new Image();
  pre.onload = () => {
    img.src = url;
    img.hidden = false;
  };
  pre.src = url;
};
const camLiveConfig = (cam) =>
  cam.card || { type: 'picture-entity', entity: cam.entity, camera_view: 'live', show_name: false, show_state: false };
const camOpen = (c, cam, id) => {
  if (c._camLive && c._camLive !== id) camClose(c, c._camLive);
  c._camLive = id;
  const tile = c.$(id);
  tile.classList.add('big');
  c.$(id + 'i').hidden = true;
  c.mount('cam:' + id, c.$(id + 'l'), camLiveConfig(cam));
};
const camClose = (c, id) => {
  const tile = c.$(id);
  if (tile) tile.classList.remove('big');
  c.unmount('cam:' + id);
  const l = c.$(id + 'l');
  if (l) l.innerHTML = '';
  if (c._camLive === id) c._camLive = null;
  const img = c.$(id + 'i');
  if (img && img.src) img.hidden = false;
};
const clockStr = () => new Date().toLocaleTimeString('en-GB', { hour12: false });

/* ---------- small helpers ---------- */
const contactIcon = (c, it, open) => {
  if (it.icon) return it.icon;
  const dc = c.st(it.entity)?.attributes.device_class;
  if (dc === 'window') return open ? 'mdi:window-open-variant' : 'mdi:window-closed-variant';
  if (dc === 'garage_door') return open ? 'mdi:garage-open-variant' : 'mdi:garage-variant';
  if (dc === 'door' || dc === 'opening') return open ? 'mdi:door-open' : 'mdi:door-closed';
  if (dc === 'motion' || dc === 'occupancy') return 'mdi:motion-sensor';
  return open ? 'mdi:checkbox-blank-circle' : 'mdi:checkbox-blank-circle-outline';
};
const haversine = (a, b) => {
  const R = 6371;
  const r = (x) => (x * Math.PI) / 180;
  const dLat = r(b[0] - a[0]);
  const dLon = r(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};
const initials = (n = '') => n.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const AV_GRADS = ['linear-gradient(135deg,#ffc35a,#ff6a3d)', 'linear-gradient(135deg,#9b8cff,#ff8fbf)', 'linear-gradient(135deg,#5fd4ff,#3ee0b4)', 'linear-gradient(135deg,#b8e86b,#3ee0b4)', 'linear-gradient(135deg,#ff8fbf,#ff5d6c)', 'linear-gradient(135deg,#7fa6ff,#9b8cff)'];
const avGrad = (id) => AV_GRADS[[...String(id)].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AV_GRADS.length];
const avatarHtml = (c, it, extra = '') => {
  const s = c.st(it.entity);
  const pic = it.picture || s?.attributes.entity_picture;
  const nm = c.nm(it);
  return `<span class="av${extra}" style="--g:${avGrad(it.entity)}">${pic ? `<img alt="" src="${esc(c.url(pic))}">` : esc(initials(nm))}</span>`;
};
const presenceState = (s) => {
  if (!s || ['unavailable', 'unknown'].includes(s.state)) return ['away', 'Unknown'];
  if (s.state === 'home') return ['home', 'Home'];
  if (s.state === 'not_home') return ['away', 'Away'];
  return ['zone', `At ${s.state}`];
};
const minutesLeft = (s) => {
  if (!s) return null;
  const st = s.state;
  if (['unknown', 'unavailable', ''].includes(st)) return null;
  if (s.attributes.device_class === 'timestamp' || /^\d{4}-\d\d-\d\dT/.test(st)) {
    const m = (new Date(st).getTime() - Date.now()) / 60000;
    return m > 0 ? Math.round(m) : 0;
  }
  if (/^\d+:\d\d(:\d\d)?$/.test(st)) {
    const p = st.split(':').map(Number);
    return p.length === 3 ? p[0] * 60 + p[1] : p[0] * 60 + p[1];
  }
  const n = num(st);
  if (n == null) return null;
  const u = (s.attributes.unit_of_measurement || 'min').toLowerCase();
  return Math.round(u.startsWith('h') ? n * 60 : u.startsWith('s') ? n / 60 : n);
};
const fmtMin = (m) => (m == null ? '' : m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
const timeStr = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return String(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ======================================================================
 * Section types. Each one knows how to normalise its config, which
 * entities it watches, how to draw itself, update, and handle taps.
 * ====================================================================== */
const TYPES = {};
const def = (key, o) => (TYPES[key] = { key, watch: () => [], ...o });
const ids = (...lists) => lists.flat().map((x) => (typeof x === 'string' ? x : x?.entity)).filter(Boolean);

/* ---------------- lights ---------------- */
def('lights', {
  title: 'Lights', icon: 'mdi:lightbulb-group', color: 'amber', desc: 'Light tiles with an all-off button',
  norm: (s) => ({ ...s, entities: asItems(s.entities || s.lights) }),
  has: (s) => s.entities.length > 0,
  watch: (s) => ids(s.entities),
  body: (c, s, p) => `<div class="ltools"><div class="meter"><i id="${p}meter"></i></div>
      <button class="btn" data-act="alloff" data-s="${s._k}"><ha-icon icon="mdi:power"></ha-icon>All off</button></div>
    <div class="lgrid"${s.columns ? ` style="grid-template-columns:repeat(${+s.columns},minmax(0,1fr))"` : ''}>${s.entities
      .map((l, i) => `<button class="lt" data-act="toggle" data-e="${esc(l.entity)}" id="${p}l${i}" aria-pressed="false">
        <ha-icon icon="${esc(l.icon || 'mdi:lightbulb')}"></ha-icon><span class="rn">${esc(l.room || '')}</span><span class="nm" id="${p}ln${i}"></span></button>`)
      .join('')}</div>`,
  update(c, s, p, ctx) {
    let on = 0;
    s.entities.forEach((l, i) => {
      const st = c.st(l.entity);
      const isOn = st?.state === 'on';
      if (isOn) on++;
      const b = c.$(p + 'l' + i);
      b.classList.toggle('on', isOn);
      b.classList.toggle('na', !st || st.state === 'unavailable');
      b.setAttribute('aria-pressed', String(isOn));
      c.$(p + 'ln' + i).textContent = c.nm(l);
    });
    c.$(p + 'meter').style.width = (on / s.entities.length) * 100 + '%';
    ctx.chip('lights', chipHtml(s._k, { icon: 'mdi:lightbulb-on', color: 'var(--amber)', b: on, text: 'on' }));
    return { sum: on ? `${on} of ${s.entities.length} on` : 'All off' };
  },
  act(c, a, el, s) {
    if (a !== 'alloff') return;
    const on = s.entities.map((l) => l.entity).filter((e) => c.st(e)?.state === 'on');
    if (on.length) c.call('homeassistant', 'turn_off', { entity_id: on });
  },
});

/* ---------------- security ---------------- */
const ALARM_WORD = { disarmed: 'Disarmed', armed_home: 'Armed · home', armed_away: 'Armed · away', armed_night: 'Armed · night', armed_vacation: 'Armed · vacation',
  armed_custom_bypass: 'Armed · custom', arming: 'Arming', pending: 'Entry delay', disarming: 'Disarming', triggered: 'Alarm triggered', unavailable: 'Unavailable' };
const ALARM_ICON = { disarmed: 'mdi:shield-off-outline', armed_home: 'mdi:shield-home', armed_away: 'mdi:shield-lock', armed_night: 'mdi:shield-moon',
  armed_vacation: 'mdi:shield-airplane', armed_custom_bypass: 'mdi:security', arming: 'mdi:shield-sync', pending: 'mdi:shield-alert', disarming: 'mdi:shield-sync', triggered: 'mdi:bell-ring' };
const ARM_MODES = [
  ['disarm', 'Disarm', 'mdi:shield-off-outline', 0],
  ['arm_home', 'Home', 'mdi:shield-home', 1],
  ['arm_away', 'Away', 'mdi:shield-lock', 2],
  ['arm_night', 'Night', 'mdi:shield-moon', 4],
  ['arm_vacation', 'Vacation', 'mdi:shield-airplane', 32],
];
def('security', {
  title: 'Security', icon: 'mdi:shield-home', color: 'red', desc: 'Alarm, cameras, doors and windows, locks',
  norm: (s) => ({
    ...s,
    alarm: asObj(s.alarm),
    cameras: asItems(s.cameras),
    contacts: asItems(s.contacts || s.doors),
    locks: asItems(s.locks),
  }),
  has: (s) => !!(s.alarm || s.cameras.length || s.contacts.length || s.locks.length),
  watch: (s) => ids(s.alarm || [], s.cameras, s.cameras.map((x) => x.motion), s.contacts, s.locks),
  modes(c, s) {
    if (s.modes) return ARM_MODES.filter((m) => m[0] === 'disarm' || s.modes.includes(m[0]));
    const f = c.st(s.alarm.entity)?.attributes.supported_features;
    if (f == null) return ARM_MODES.slice(0, 4);
    return ARM_MODES.filter((m) => !m[3] || f & m[3]);
  },
  body(c, s, p) {
    s.cameras.forEach((x) => (x._name = c.nm(x)));
    let h = '';
    if (s.alarm) {
      const modes = this.modes(c, s);
      h += `<button class="alarm" id="${p}alarm" data-act="more" data-e="${esc(s.alarm.entity)}"><div class="aring"><svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="5"/>
          <circle class="aarc" id="${p}aarc" cx="40" cy="40" r="34" fill="none" stroke="var(--teal)" stroke-width="5" stroke-linecap="round" stroke-dasharray="213.6" stroke-dashoffset="0" transform="rotate(-90 40 40)"/></svg>
          <ha-icon id="${p}aico" icon="mdi:shield-off-outline"></ha-icon></div>
        <div style="min-width:0"><div class="gl">${esc(s.alarm.name || 'Alarm system')}</div><div class="astate" id="${p}ast"></div><div class="ts" id="${p}asub"></div></div></button>
        <div class="arms" style="--n:${modes.length}">${modes.map(([m, n, i]) => `<button class="arm${m === 'disarm' ? ' dis' : ''}" data-act="arm" data-s="${s._k}" data-m="${m}"><ha-icon icon="${i}"></ha-icon>${n}</button>`).join('')}</div>
        <div class="keypad" id="${p}kp" hidden><ha-icon icon="mdi:dialpad"></ha-icon><input id="${p}code" type="password" inputmode="numeric" autocomplete="off" placeholder="Alarm code" aria-label="Alarm code"></div>`;
    }
    if (s.cameras.length)
      h += `<div class="sl">${esc(s.cameras_title || 'Cameras')} <span>tap to watch live</span></div><div class="cams${s.cameras.length === 1 ? ' one' : ''}">${s.cameras.map((cam, i) => camTileHtml(s._k, cam, p + 'c' + i)).join('')}</div>`;
    if (s.contacts.length)
      h += `<div class="sl">${esc(s.contacts_title || 'Doors & windows')} <span id="${p}copen"></span></div><div class="rows">${s.contacts
        .map((x, i) => `<button class="mrow" data-act="more" data-e="${esc(x.entity)}" id="${p}k${i}"><ha-icon id="${p}ki${i}" icon="mdi:door-closed"></ha-icon><div class="mt"><b>${esc(c.nm(x))}</b><span id="${p}ks${i}"></span></div></button>`)
        .join('')}</div>`;
    if (s.locks.length)
      h += `<div class="sl">${esc(s.locks_title || 'Locks')}</div><div class="rows">${s.locks
        .map((x, i) => `<div class="mrow" id="${p}lk${i}"><ha-icon id="${p}lki${i}" icon="mdi:lock"></ha-icon><div class="mt"><b>${esc(c.nm(x))}</b><span id="${p}lks${i}"></span></div>
          <button class="pill" data-act="lock" data-s="${s._k}" data-e="${esc(x.entity)}" id="${p}lkb${i}"></button></div>`)
        .join('')}</div>`;
    return h;
  },
  update(c, s, p, ctx) {
    const sum = [];
    let badge = null;
    if (s.alarm) {
      const a = c.st(s.alarm.entity);
      const state = a?.state || 'unavailable';
      const armed = state.startsWith('armed');
      const pend = ['arming', 'pending', 'disarming'].includes(state);
      const el = c.$(p + 'alarm');
      el.classList.toggle('armed', armed);
      el.classList.toggle('pending', pend);
      el.classList.toggle('triggered', state === 'triggered');
      c.$(p + 'ast').textContent = ALARM_WORD[state] || cap(state);
      c.$(p + 'aico').setAttribute('icon', ALARM_ICON[state] || 'mdi:shield');
      const arc = c.$(p + 'aarc');
      arc.style.stroke = state === 'disarmed' ? 'var(--teal)' : pend ? 'var(--amber)' : state === 'unavailable' ? 'var(--ink-3)' : 'var(--red)';
      arc.setAttribute('stroke-dasharray', pend ? '60 153.6' : '213.6');
      arc.style.animation = pend ? 'spin 1.4s linear infinite' : '';
      arc.style.transformOrigin = '40px 40px';
      const open = s.contacts.filter((x) => c.st(x.entity)?.state === 'on');
      c.$(p + 'asub').textContent =
        state === 'triggered' ? 'Siren on · enter code and tap Disarm' : state === 'arming' ? 'Exit delay running · leave now' : state === 'pending' ? 'Disarm now' :
        state === 'disarmed' ? (open.length ? `${open.length} open · ${open.map((x) => c.nm(x)).join(', ')}` : 'Everything closed') : a ? `Since ${timeStr(a.last_changed)}` : '';
      const cur = state === 'disarmed' ? 'disarm' : state.replace('armed_', 'arm_');
      c.shadowRoot.querySelectorAll(`[data-s="${s._k}"].arm`).forEach((b) => b.classList.toggle('sel', b.dataset.m === cur));
      const needCode = !s.alarm.code && a?.attributes.code_format && a.attributes.code_arm_required !== false;
      const needDisarmCode = !s.alarm.code && a?.attributes.code_format;
      c.$(p + 'kp').hidden = !(needCode || needDisarmCode);
      sum.push(ALARM_WORD[state] || cap(state));
      ctx.chip(
        'alarm',
        state === 'triggered'
          ? chipHtml(s._k, { cls: 'alarm', icon: 'mdi:bell-ring', text: 'ALARM' })
          : chipHtml(s._k, { tint: state === 'disarmed' ? 'var(--teal)' : pend ? 'var(--amber)' : 'var(--red)', icon: ALARM_ICON[state] || 'mdi:shield', text: ALARM_WORD[state] || state }),
        state === 'triggered' ? 100 : 0
      );
      badge = state === 'triggered' ? ['ALARM', 'var(--red)'] : armed ? ['ARMED', 'var(--red)'] : null;
    }
    s.cameras.forEach((cam, i) => {
      const id = p + 'c' + i;
      const t = c.$(id);
      if (!t) return;
      t.classList.toggle('mot', !!cam.motion && c.st(cam.motion)?.state === 'on');
      if (c.isOpen(s)) camSnapshot(c, cam, id);
    });
    let open = 0;
    s.contacts.forEach((x, i) => {
      const st = c.st(x.entity);
      const o = st?.state === 'on';
      if (o) open++;
      c.$(p + 'k' + i).classList.toggle('open', o);
      c.$(p + 'ki' + i).setAttribute('icon', contactIcon(c, x, o));
      c.$(p + 'ks' + i).textContent = !st || st.state === 'unavailable' ? 'Unavailable' : `${o ? 'Open' : 'Closed'} · ${ago(st.last_changed)}`;
      if (o) ctx.chip('doors', chipHtml(s._k, { tint: 'var(--ember)', dot: 1, text: `${c.nm(x)} open` }));
    });
    if (c.$(p + 'copen')) c.$(p + 'copen').textContent = s.contacts.length ? (open ? `${open} open` : 'all closed') : '';
    if (open) sum.push(`${open} open`);
    let unl = 0;
    s.locks.forEach((x, i) => {
      const st = c.st(x.entity);
      const locked = st?.state === 'locked';
      if (st && !locked && st.state !== 'unavailable') unl++;
      c.$(p + 'lk' + i).classList.toggle('unl', !!st && !locked);
      c.$(p + 'lki' + i).setAttribute('icon', locked ? 'mdi:lock' : st?.state === 'jammed' ? 'mdi:lock-alert' : 'mdi:lock-open-variant');
      c.$(p + 'lks' + i).textContent = st ? `${cap(c.fmt(x.entity))} · ${ago(st.last_changed)}` : 'Missing';
      c.$(p + 'lkb' + i).textContent = locked ? 'Unlock' : 'Lock';
      if (st && !locked && st.state !== 'unavailable') ctx.chip('locks', chipHtml(s._k, { tint: 'var(--amber)', icon: 'mdi:lock-open-variant', text: `${c.nm(x)} unlocked` }));
    });
    if (unl) sum.push(`${unl} unlocked`);
    if (s.cameras.length) sum.push(`${s.cameras.length} camera${s.cameras.length > 1 ? 's' : ''}`);
    return { sum: sum.join(' · '), badge };
  },
  act(c, a, el, s) {
    if (a === 'arm') {
      const code = s.alarm.code || c.$(s._k + '-code')?.value || undefined;
      const svc = el.dataset.m === 'disarm' ? 'alarm_disarm' : 'alarm_' + el.dataset.m;
      c.call('alarm_control_panel', svc, { entity_id: s.alarm.entity, ...(code ? { code: String(code) } : {}) });
      const inp = c.$(s._k + '-code');
      if (inp) inp.value = '';
    }
    if (a === 'lock') c.call('lock', c.st(el.dataset.e)?.state === 'locked' ? 'unlock' : 'lock', { entity_id: el.dataset.e });
    if (a === 'cam') {
      const i = +el.dataset.c.split('c').pop();
      if (!el.classList.contains('big')) camOpen(c, s.cameras[i], el.dataset.c);
    }
    if (a === 'camclose') camClose(c, el.dataset.c);
  },
  open(c, s, p) {
    s.cameras.forEach((cam, i) => camSnapshot(c, cam, p + 'c' + i, true));
  },
  close(c, s, p) {
    s.cameras.forEach((cam, i) => camClose(c, p + 'c' + i));
  },
  tick(c, s, p) {
    if (!s.cameras.length) return;
    const t = clockStr();
    s.cameras.forEach((cam, i) => {
      const el = c.$(p + 'c' + i + 't');
      if (el) el.textContent = t;
      camSnapshot(c, cam, p + 'c' + i);
    });
  },
});

/* ---------------- climate ---------------- */
const HVAC = {
  off: ['Off', 'mdi:power', 'var(--ink-2)'], cool: ['Cool', 'mdi:snowflake', 'var(--cyan)'], heat: ['Heat', 'mdi:fire', 'var(--ember)'],
  heat_cool: ['Auto', 'mdi:sun-snowflake-variant', 'var(--teal)'], auto: ['Auto', 'mdi:thermostat-auto', 'var(--teal)'], dry: ['Dry', 'mdi:water-percent', 'var(--amber)'],
  fan_only: ['Fan', 'mdi:fan', 'var(--violet)'],
};
const ACTION = { cooling: ['Cooling', 'mdi:snowflake'], heating: ['Heating', 'mdi:fire'], idle: ['Idle', 'mdi:check'], off: ['Off', 'mdi:power'], fan: ['Fan only', 'mdi:fan'], drying: ['Drying', 'mdi:water-percent'], preheating: ['Preheating', 'mdi:fire'], defrosting: ['Defrosting', 'mdi:snowflake-melt'] };
const dialTicks = Array.from({ length: 15 }, (_, i) => {
  const a = ((135 + (i * 270) / 14) * Math.PI) / 180;
  const r2 = i % 7 === 0 ? 84 : 81;
  return `<line x1="${(80 + 78 * Math.cos(a)).toFixed(1)}" y1="${(80 + 78 * Math.sin(a)).toFixed(1)}" x2="${(80 + r2 * Math.cos(a)).toFixed(1)}" y2="${(80 + r2 * Math.sin(a)).toFixed(1)}" stroke="rgba(255,255,255,${i % 7 === 0 ? 0.35 : 0.15})" stroke-width="1.5" stroke-linecap="round"/>`;
}).join('');
def('climate', {
  title: 'Climate', icon: 'mdi:air-conditioner', color: 'cyan', desc: 'AC dial with modes, plus room temperature and humidity',
  norm(s) {
    const sensors = asList(s.sensors).map((x) => ({ ...x }));
    if (s.temperature || s.humidity) sensors.unshift({ temperature: s.temperature, humidity: s.humidity, temperature_name: s.temperature_name, humidity_name: s.humidity_name, temperature_min: s.temperature_min, temperature_max: s.temperature_max, name: s.room });
    return { ...s, entities: asItems(s.entities), sensors: sensors.filter((x) => x.temperature || x.humidity), motion: asItems(s.motion) };
  },
  has: (s) => !!(s.entities.length || s.sensors.length || s.motion.length),
  watch: (s) => ids(s.entities, s.motion, s.sensors.flatMap((x) => [x.temperature, x.humidity])),
  body(c, s, p) {
    const ac = s.entities;
    let h = '';
    if (ac.length > 1) h += `<div class="tabs">${ac.map((e, i) => `<button class="tab" data-act="actab" data-s="${s._k}" data-i="${i}" id="${p}tab${i}"><i id="${p}tabi${i}"></i>${esc(c.nm(e))}</button>`).join('')}</div>`;
    if (ac.length)
      h += `<div class="ac" id="${p}ac"><button class="acb" data-act="acstep" data-s="${s._k}" data-d="-1" aria-label="Lower temperature"><ha-icon icon="mdi:minus"></ha-icon></button>
        <div class="dial"><svg viewBox="0 0 160 160" aria-hidden="true"><defs><linearGradient id="${p}dg" x1="0" x2="1"><stop offset="0" stop-color="var(--m)" stop-opacity=".45"/><stop offset="1" stop-color="var(--m)"/></linearGradient></defs>${dialTicks}
          <circle cx="80" cy="80" r="${DIAL_R}" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${DIAL_L} ${DIAL_C}" transform="rotate(135 80 80)"/>
          <circle class="darc" id="${p}darc" cx="80" cy="80" r="${DIAL_R}" fill="none" stroke="url(#${p}dg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="0 ${DIAL_C}" transform="rotate(135 80 80)"/>
          <g class="thumb" id="${p}thumb"><circle cx="${80 + DIAL_R}" cy="80" r="7" fill="#fff" stroke="var(--m)" stroke-width="3"/></g>
          <circle id="${p}cur" r="3.5" cx="80" cy="80" fill="var(--ink-2)"/></svg>
          <div class="dval"><span class="gl" id="${p}act"></span><strong id="${p}set"></strong><span id="${p}curt"></span></div>
          <div class="air"><i></i><i></i><i></i><i></i><i></i></div></div>
        <button class="acb" data-act="acstep" data-s="${s._k}" data-d="1" aria-label="Raise temperature"><ha-icon icon="mdi:plus"></ha-icon></button></div>
        <div class="modes" id="${p}modes"></div>
        <div class="segrow" id="${p}fanrow" hidden><ha-icon icon="mdi:fan" style="--mdc-icon-size:17px;color:var(--ink-3)"></ha-icon><div class="seg" id="${p}fan"></div></div>`;
    if (s.sensors.length) {
      const multi = s.sensors.length > 1;
      h += `${ac.length ? '<div class="sl">Room sensors</div>' : ''}<div class="clim">${s.sensors
        .map((x, i) => {
          const room = x.name || '';
          const tl = x.temperature_name || (multi && room ? room : room ? `${room} temp` : 'Temperature');
          const hl = x.humidity_name || (multi && room ? room : 'Humidity');
          return `${x.temperature ? gaugeHtml(p + 't' + i, x.temperature, tl, 'mdi:thermometer', 'var(--ember)', ['#ffc35a', '#ff6a3d']) : ''}${x.humidity ? gaugeHtml(p + 'h' + i, x.humidity, hl, 'mdi:water-percent', 'var(--cyan)', ['#5fd4ff', '#5fd4ff']) : ''}`;
        })
        .join('')}
        ${s.motion.length ? `<div class="mot">${s.motion.map((m, i) => `<button class="mrow mo" data-act="more" data-e="${esc(m.entity)}" id="${p}mo${i}"><ha-icon icon="${esc(m.icon || 'mdi:motion-sensor')}"></ha-icon><div class="mt"><b>${esc(c.nm(m))}</b><span id="${p}mos${i}"></span></div></button>`).join('')}</div>` : ''}</div>`;
    } else if (s.motion.length)
      h += `<div class="mot">${s.motion.map((m, i) => `<button class="mrow mo" data-act="more" data-e="${esc(m.entity)}" id="${p}mo${i}"><ha-icon icon="${esc(m.icon || 'mdi:motion-sensor')}"></ha-icon><div class="mt"><b>${esc(c.nm(m))}</b><span id="${p}mos${i}"></span></div></button>`).join('')}</div>`;
    return h;
  },
  target(c, s, e) {
    const pend = s._pend?.[e.entity];
    if (pend && Date.now() - pend.at < 4000) return pend.v;
    const a = c.st(e.entity)?.attributes || {};
    return a.temperature ?? (a.target_temp_low != null ? [a.target_temp_low, a.target_temp_high] : null);
  },
  update(c, s, p, ctx) {
    const sum = [];
    const ac = s.entities;
    if (ac.length) {
      s._tab = clamp(s._tab || 0, 0, ac.length - 1);
      const it = ac[s._tab];
      const st = c.st(it.entity);
      const a = st?.attributes || {};
      const mode = st?.state || 'unavailable';
      ac.forEach((x, i) => {
        const t = c.$(p + 'tab' + i);
        if (!t) return;
        t.classList.toggle('sel', i === s._tab);
        c.$(p + 'tabi' + i).style.background = (HVAC[c.st(x.entity)?.state] || HVAC.off)[2];
      });
      const box = c.$(p + 'ac');
      const action = a.hvac_action || (mode === 'off' ? 'off' : mode === 'fan_only' ? 'fan' : mode === 'cool' ? 'cooling' : mode === 'heat' ? 'heating' : 'idle');
      box.dataset.mode = mode;
      box.dataset.action = action;
      const lo = a.min_temp ?? 16;
      const hi = a.max_temp ?? 30;
      const tgt = this.target(c, s, it);
      const one = Array.isArray(tgt) ? tgt[1] : tgt;
      const f = one == null ? 0 : clamp((one - lo) / (hi - lo), 0, 1);
      const off = mode === 'off' || mode === 'unavailable';
      c.$(p + 'darc').setAttribute('stroke-dasharray', `${off ? 0 : DIAL_L * f} ${DIAL_C}`);
      c.$(p + 'thumb').style.transform = `rotate(${135 + 270 * f}deg)`;
      c.$(p + 'thumb').style.opacity = off ? 0.3 : 1;
      const cur = a.current_temperature;
      const cEl = c.$(p + 'cur');
      if (cur != null) {
        const ang = ((135 + 270 * clamp((cur - lo) / (hi - lo), 0, 1)) * Math.PI) / 180;
        cEl.setAttribute('cx', 80 + DIAL_R * Math.cos(ang));
        cEl.setAttribute('cy', 80 + DIAL_R * Math.sin(ang));
      }
      cEl.style.display = cur == null ? 'none' : '';
      const [aw, ai] = ACTION[action] || [cap(action), 'mdi:thermostat'];
      c.$(p + 'act').innerHTML = `<ha-icon icon="${ai}"></ha-icon>${esc(aw)}`;
      const u = c.hass.config?.unit_system?.temperature || '°C';
      const fmtT = (v) => (v == null ? '–' : (+v).toFixed(+v % 1 ? 1 : 0));
      c.$(p + 'set').innerHTML = mode === 'unavailable' ? 'N/A' : off ? 'Off' : Array.isArray(tgt) ? `${fmtT(tgt[0])}–${fmtT(tgt[1])}` : `${fmtT(tgt)}<sup>${esc(u)}</sup>`;
      c.$(p + 'curt').textContent = cur != null ? `Room ${(+cur).toFixed(1)}°` : '';
      const modes = s.modes || a.hvac_modes || ['off', 'cool', 'heat'];
      const mk = JSON.stringify(modes);
      const mEl = c.$(p + 'modes');
      if (mEl.dataset.k !== mk) {
        mEl.dataset.k = mk;
        mEl.innerHTML = modes.map((m) => {
          const [n, i, col] = HVAC[m] || [cap(m), 'mdi:thermostat', 'var(--ink-2)'];
          return `<button class="mode" data-act="acmode" data-s="${s._k}" data-m="${esc(m)}" style="--mc:${col}"><ha-icon icon="${i}"></ha-icon>${esc(n)}</button>`;
        }).join('');
      }
      mEl.querySelectorAll('.mode').forEach((b) => b.classList.toggle('sel', b.dataset.m === mode));
      const fans = a.fan_modes || [];
      c.$(p + 'fanrow').hidden = !fans.length || s.show_fan === false;
      const fEl = c.$(p + 'fan');
      const fk = JSON.stringify(fans);
      if (fEl.dataset.k !== fk) {
        fEl.dataset.k = fk;
        fEl.innerHTML = fans.map((x) => `<button data-act="acfan" data-s="${s._k}" data-f="${esc(x)}">${esc(cap(x))}</button>`).join('');
      }
      fEl.querySelectorAll('button').forEach((b) => b.classList.toggle('sel', b.dataset.f === a.fan_mode));
      const running = ac.filter((x) => !['off', 'unavailable', undefined].includes(c.st(x.entity)?.state));
      sum.push(running.length ? running.map((x) => `${c.nm(x)} ${c.st(x.entity).attributes.temperature ?? ''}°`).join(', ') : ac.length > 1 ? 'ACs off' : 'AC off');
      if (running.length) ctx.chip('ac', chipHtml(s._k, { icon: 'mdi:snowflake', color: 'var(--cyan)', b: running.length, text: running.length > 1 ? 'ACs on' : 'AC on' }));
    }
    const multi = s.sensors.length > 1;
    s.sensors.forEach((x, i) => {
      const parts = [];
      if (x.temperature) {
        const st = c.st(x.temperature);
        const t = num(st?.state);
        const u = st?.attributes.unit_of_measurement || '°C';
        c.$('gv-' + p + 't' + i).innerHTML = t == null ? '–' : `${t.toFixed(1)}<small>${esc(u)}</small>`;
        const lo = x.temperature_min ?? 0;
        const hi = x.temperature_max ?? 40;
        c.$('arc-' + p + 't' + i).setAttribute('stroke-dashoffset', RING * (1 - (t == null ? 0 : clamp((t - lo) / (hi - lo), 0, 1))));
        if (t != null) {
          parts.push(multi ? `${t.toFixed(1)}°` : `${t.toFixed(1)}${u}`);
          if (i === 0) ctx.chip('temperature', chipHtml(s._k, { icon: 'mdi:thermometer', color: 'var(--ember)', b: `${t.toFixed(1)}°` }));
        }
      }
      if (x.humidity) {
        const hm = num(c.st(x.humidity)?.state);
        c.$('gv-' + p + 'h' + i).innerHTML = hm == null ? '–' : `${Math.round(hm)}<small>%</small>`;
        c.$('arc-' + p + 'h' + i).setAttribute('stroke-dashoffset', RING * (1 - (hm == null ? 0 : clamp(hm / 100, 0, 1))));
        if (hm != null) {
          parts.push(`${Math.round(hm)}%`);
          if (i === 0) ctx.chip('humidity', chipHtml(s._k, { icon: 'mdi:water-percent', color: 'var(--cyan)', b: `${Math.round(hm)}%` }));
        }
      }
      if (parts.length) sum.push(multi && x.name ? `${x.name} ${parts.join(' ')}` : parts.join(' · '));
    });
    const active = [];
    s.motion.forEach((m, i) => {
      const st = c.st(m.entity);
      const on = st?.state === 'on';
      if (on) {
        active.push(c.nm(m));
        ctx.chip('motion', chipHtml(s._k, { tint: 'var(--cyan)', dot: 1, text: `${c.nm(m)} motion` }));
      }
      c.$(p + 'mo' + i).classList.toggle('on', on);
      c.$(p + 'mos' + i).textContent = !st || st.state === 'unavailable' ? 'Unavailable' : on ? 'Motion now' : `Clear · ${ago(st.last_changed)}`;
    });
    if (s.motion.length) sum.push(active.length ? `${active.join(', ')} active` : 'No motion');
    return { sum: sum.join(' · ') || '–' };
  },
  act(c, a, el, s) {
    const it = s.entities[s._tab || 0];
    if (a === 'actab') {
      s._tab = +el.dataset.i;
      return c.update();
    }
    if (!it) return;
    const st = c.st(it.entity);
    const at = st?.attributes || {};
    if (a === 'acmode') c.call('climate', 'set_hvac_mode', { entity_id: it.entity, hvac_mode: el.dataset.m });
    if (a === 'acfan') c.call('climate', 'set_fan_mode', { entity_id: it.entity, fan_mode: el.dataset.f });
    if (a === 'acstep') {
      const step = s.step || at.target_temp_step || (c.hass.config?.unit_system?.temperature === '°F' ? 1 : 0.5);
      const d = +el.dataset.d * step;
      const lo = at.min_temp ?? 7;
      const hi = at.max_temp ?? 35;
      let cur = this.target(c, s, it);
      if (cur == null) return;
      const nv = Array.isArray(cur) ? cur.map((v) => clamp(+v + d, lo, hi)) : clamp(+cur + d, lo, hi);
      s._pend = { ...(s._pend || {}), [it.entity]: { v: nv, at: Date.now() } };
      if (st.state === 'off' && s.wake_on_change !== false) {
        const m = (at.hvac_modes || []).includes('cool') ? 'cool' : (at.hvac_modes || []).find((x) => x !== 'off');
        if (m) c.call('climate', 'set_hvac_mode', { entity_id: it.entity, hvac_mode: m });
      }
      c.update();
      clearTimeout(s._acT);
      s._acT = setTimeout(() => {
        const data = Array.isArray(nv) ? { target_temp_low: nv[0], target_temp_high: nv[1] } : { temperature: nv };
        c.call('climate', 'set_temperature', { entity_id: it.entity, ...data });
      }, 700);
    }
  },
});

/* ---------------- motion ---------------- */
def('motion', {
  title: 'Motion', icon: 'mdi:motion-sensor', color: 'sky', desc: 'Motion sensors with a 24-hour activity strip',
  norm: (s) => ({ ...s, entities: asItems(s.entities) }),
  has: (s) => s.entities.length > 0,
  watch: (s) => ids(s.entities),
  body: (c, s, p) => `${s.entities
    .map((m, i) => `<button class="mline" data-act="more" data-e="${esc(m.entity)}" id="${p}m${i}"><div class="who"><ha-icon icon="${esc(m.icon || 'mdi:motion-sensor')}"></ha-icon><div style="min-width:0"><b>${esc(c.nm(m))}</b><span id="${p}ms${i}"></span></div></div>
      ${s.history === false ? '' : `<div class="strip" id="${p}st${i}">${'<i></i>'.repeat(48)}</div>`}</button>`)
    .join('')}${s.history === false ? '' : `<div class="axis"><span>24 h ago</span><span>12 h</span><span>now</span></div>`}`,
  update(c, s, p, ctx) {
    const act = [];
    let last = null;
    s.entities.forEach((m, i) => {
      const st = c.st(m.entity);
      const on = st?.state === 'on';
      if (on) {
        act.push(c.nm(m));
        ctx.chip('motion', chipHtml(s._k, { tint: 'var(--sky)', dot: 1, text: `${c.nm(m)} motion` }));
      }
      if (st && (!last || st.last_changed > last.t)) last = { n: c.nm(m), t: st.last_changed };
      c.$(p + 'm' + i).classList.toggle('on', on);
      c.$(p + 'ms' + i).textContent = !st || st.state === 'unavailable' ? 'Unavailable' : on ? 'Motion now' : `Clear · ${ago(st.last_changed)}`;
      const strip = c.$(p + 'st' + i);
      if (strip) {
        const h = s._hist?.[m.entity];
        strip.querySelectorAll('i').forEach((b, j) => {
          const v = h ? h[j] : 0;
          const now = j === 47 && on;
          b.className = now ? 'now' : v ? 'h' : '';
          b.style.height = now ? '100%' : v ? `${25 + Math.min(1, v) * 75}%` : '12%';
        });
      }
    });
    return { sum: act.length ? `${act.join(', ')} active` : last ? `No motion · last ${last.n} ${ago(last.t)}` : 'No motion' };
  },
  async open(c, s) {
    if (s.history === false || !c.hass.callWS) return;
    if (s._histAt && Date.now() - s._histAt < 5 * 60000) return;
    s._histAt = Date.now();
    const end = new Date();
    const start = new Date(end.getTime() - 24 * 3600 * 1000);
    try {
      const r = await c.hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids(s.entities), minimal_response: true, no_attributes: true });
      s._hist = {};
      const t0 = start.getTime();
      const slot = 30 * 60000;
      for (const [id, rows] of Object.entries(r || {})) {
        const b = new Array(48).fill(0);
        let onAt = null;
        const mark = (from, to) => {
          for (let j = Math.max(0, Math.floor((from - t0) / slot)); j <= Math.min(47, Math.floor((to - t0) / slot)); j++) {
            const a = Math.max(from, t0 + j * slot);
            const z = Math.min(to, t0 + (j + 1) * slot);
            b[j] += Math.max(z - a, 60000) / (5 * 60000);
          }
        };
        rows.forEach((x) => {
          const t = (x.lu ?? x.lc ?? 0) * 1000 || new Date(x.last_changed || x.last_updated).getTime();
          const st = x.s ?? x.state;
          if (st === 'on' && onAt == null) onAt = Math.max(t, t0);
          if (st !== 'on' && onAt != null) {
            mark(onAt, t);
            onAt = null;
          }
        });
        if (onAt != null) mark(onAt, end.getTime());
        s._hist[id] = b;
      }
      c.update();
    } catch (e) {
      /* history not available — strips stay empty */
    }
  },
});

/* ---------------- presence ---------------- */
def('presence', {
  title: "Who's home", icon: 'mdi:account-group', color: 'rose', desc: 'Each person: home, away or which zone, since when',
  norm: (s) => ({ ...s, entities: asItems(s.entities) }),
  has: (s) => s.entities.length > 0,
  watch: (s) => ids(s.entities, s.entities.map((x) => x.battery)),
  battery(c, it) {
    if (it.battery) return it.battery;
    const src = c.st(it.entity)?.attributes.source;
    if (!src) return null;
    const guess = `sensor.${src.split('.')[1]}_battery_level`;
    return c.st(guess) ? guess : null;
  },
  body: (c, s, p) => `<div class="pgrid">${s.entities
    .map((x, i) => `<button class="pc" data-act="more" data-e="${esc(x.entity)}" id="${p}p${i}"><div class="top">${avatarHtml(c, x)}<div style="min-width:0"><div class="nm">${esc(c.nm(x))}</div><div class="stt" id="${p}ps${i}"></div></div></div>
      <div class="meta"><div><ha-icon icon="mdi:clock-outline"></ha-icon><span id="${p}pt${i}"></span></div><div id="${p}pdw${i}"><ha-icon icon="mdi:map-marker-distance"></ha-icon><span id="${p}pd${i}"></span></div></div>
      <div id="${p}pbw${i}"><div class="meta" style="margin-bottom:5px"><div><ha-icon icon="mdi:cellphone"></ha-icon><span id="${p}pb${i}"></span></div></div><div class="batt"><i id="${p}pbb${i}"></i></div></div></button>`)
    .join('')}</div>`,
  update(c, s, p) {
    let home = 0;
    const hz = c.st('zone.home')?.attributes;
    s.entities.forEach((x, i) => {
      const st = c.st(x.entity);
      const [cls, word] = presenceState(st);
      if (cls === 'home') home++;
      c.$(p + 'p' + i).className = 'pc ' + cls;
      c.$(p + 'ps' + i).textContent = word;
      c.$(p + 'pt' + i).textContent = st ? `Since ${timeStr(st.last_changed)}` : '';
      const a = st?.attributes || {};
      let dist = null;
      if (cls !== 'home' && a.latitude != null && hz?.latitude != null) dist = haversine([hz.latitude, hz.longitude], [a.latitude, a.longitude]);
      c.$(p + 'pd' + i).textContent = cls === 'home' ? 'At home' : dist != null ? `${dist < 10 ? dist.toFixed(1) : Math.round(dist)} km away` : 'Away';
      const bid = this.battery(c, x);
      const bv = num(c.st(bid)?.state ?? a.battery_level ?? a.battery);
      c.$(p + 'pbw' + i).hidden = bv == null;
      if (bv != null) {
        c.$(p + 'pb' + i).textContent = `Phone ${Math.round(bv)}%`;
        const bb = c.$(p + 'pbb' + i);
        bb.style.width = clamp(bv, 0, 100) + '%';
        bb.style.background = bv < 20 ? 'var(--red)' : bv < 50 ? 'var(--amber)' : 'var(--teal)';
      }
    });
    return { sum: `${home} of ${s.entities.length} home` };
  },
});

/* ---------------- media (TV, Apple TV, speakers) ---------------- */
def('media', {
  title: 'TV & audio', icon: 'mdi:television-play', color: 'violet', desc: 'TVs and speakers: now playing, controls, apps, your remote card',
  norm: (s) => ({ ...s, entities: asItems(s.entities || s.entity), apps: asList(s.apps).map((a) => (typeof a === 'string' ? { name: a } : { ...a })), remote_card: s.remote_card || s.card }),
  has: (s) => s.entities.length > 0 || !!s.remote_card,
  watch: (s) => ids(s.entities, s.apps.map((a) => a.entity)),
  cur: (s) => s.entities[clamp(s._tab || 0, 0, Math.max(0, s.entities.length - 1))],
  body(c, s, p) {
    const ents = s.entities;
    const top = s.apps_position === 'top';
    const apps = `<div class="${s.apps_style === 'chips' ? 'chiprow' : 'apps'}${top ? ' top' : ''}" id="${p}apps"></div>`;
    s._compact = s.player ? s.player === 'compact' : !!s.remote_card;
    const strip = `<div class="np" id="${p}np" hidden><div class="art" id="${p}art"><ha-icon icon="mdi:movie-open"></ha-icon></div>
      <div class="meta"><b id="${p}tt"></b><span id="${p}sb"></span><div class="prog"><i id="${p}pg"></i></div></div></div>`;
    return `${ents.length > 1 ? `<div class="tabs">${ents.map((e, i) => `<button class="tab" data-act="mtab" data-s="${s._k}" data-i="${i}" id="${p}mt${i}"><i id="${p}mti${i}"></i>${esc(c.nm(e))}</button>`).join('')}</div>` : ''}
      ${ents.length && s._compact ? strip : ''}${ents.length && !s._compact ? `<div class="mp"><div class="art" id="${p}art"><ha-icon icon="mdi:television-play"></ha-icon></div><div class="mi"><div class="mapp" id="${p}app"></div><b id="${p}tt"></b><span id="${p}sb"></span>
        <div class="prog"><i id="${p}pg"></i></div>
        <div class="ctrls"><button class="cb" data-act="mcmd" data-c="media_previous_track" data-s="${s._k}" aria-label="Previous"><ha-icon icon="mdi:skip-previous"></ha-icon></button>
          <button class="cb pl" data-act="mcmd" data-c="media_play_pause" data-s="${s._k}" aria-label="Play or pause"><ha-icon id="${p}pl" icon="mdi:play"></ha-icon></button>
          <button class="cb" data-act="mcmd" data-c="media_next_track" data-s="${s._k}" aria-label="Next"><ha-icon icon="mdi:skip-next"></ha-icon></button>
          <span style="flex:1"></span><button class="cb sm" data-act="mcmd" data-c="toggle" data-s="${s._k}" id="${p}pw" aria-label="Power"><ha-icon icon="mdi:power"></ha-icon></button></div></div></div>
        <div class="vol" id="${p}volrow"><ha-icon icon="mdi:volume-high"></ha-icon><input type="range" min="0" max="100" id="${p}vol" data-act="mvol" data-s="${s._k}" aria-label="Volume"><span id="${p}vv"></span></div>` : ''}
      ${top ? apps : ''}${s.remote_card ? `<div class="slot remote" id="${p}remote"></div>` : ''}${top ? '' : apps}`;
  },
  appList(c, s) {
    if (s.apps.length) return s.apps;
    if (s.show_sources === false) return [];
    const it = this.cur(s);
    const list = (c.st(it?.entity)?.attributes.source_list || []).slice(0, s.max_sources || 12);
    return list.map((x) => ({ name: x, source: x }));
  },
  update(c, s, p, ctx) {
    const it = this.cur(s);
    const apps = this.appList(c, s);
    let sum = '';
    if (it) {
      const st = c.st(it.entity);
      const a = st?.attributes || {};
      s.entities.forEach((x, i) => {
        const t = c.$(p + 'mt' + i);
        if (!t) return;
        t.classList.toggle('sel', x === it);
        c.$(p + 'mti' + i).style.background = c.st(x.entity)?.state === 'playing' ? 'var(--violet)' : '';
      });
      const app = a.app_name || a.source || '';
      const [, col] = appStyle(app);
      const art = c.$(p + 'art');
      const word0 = { playing: 'Playing', paused: 'Paused', idle: 'Idle', standby: 'Standby', off: 'Off', on: 'On', buffering: 'Loading', unavailable: 'Unavailable' }[st?.state] || cap(st?.state || 'missing');
      if (s._compact) {
        const show = st && ['playing', 'paused'].includes(st.state) && (a.media_title || app);
        c.$(p + 'np').hidden = !show;
        if (show) {
          c.$(p + 'tt').textContent = a.media_title || app;
          c.$(p + 'sb').textContent = [a.media_artist || a.media_series_title, app].filter(Boolean).join(' · ') || word0;
          const pic = a.entity_picture;
          if (pic && art.dataset.pic !== pic) {
            art.dataset.pic = pic;
            art.innerHTML = `<img alt="" src="${esc(c.url(pic))}">`;
          } else if (!pic && art.dataset.pic) {
            delete art.dataset.pic;
            art.innerHTML = '<ha-icon icon="mdi:movie-open"></ha-icon>';
          }
          this.tick(c, s, p);
        }
        sum = [it.room || s.room, word0, app, a.media_title].filter(Boolean).join(' · ');
      } else {
      const pic = a.entity_picture;
      if (pic && art.dataset.pic !== pic) {
        art.dataset.pic = pic;
        art.innerHTML = `<img alt="" src="${esc(c.url(pic))}">`;
      } else if (!pic && art.dataset.pic !== '') {
        art.dataset.pic = '';
        art.innerHTML = `<ha-icon icon="${appStyle(app)[2] === 'mdi:application' ? 'mdi:television-play' : appStyle(app)[2]}"></ha-icon>`;
      }
      art.style.background = pic ? '#0b0f17' : `linear-gradient(135deg,${col},#0b0f17 85%)`;
      const word = { playing: 'Playing', paused: 'Paused', idle: 'Idle', standby: 'Standby', off: 'Off', on: 'On', buffering: 'Loading', unavailable: 'Unavailable' }[st?.state] || cap(st?.state || 'missing');
      c.$(p + 'app').textContent = [it.room || s.room, app, word].filter(Boolean).join(' · ');
      c.$(p + 'tt').textContent = a.media_title || app || c.nm(it);
      c.$(p + 'sb').textContent = [a.media_artist || a.media_series_title, a.media_album_name].filter(Boolean).join(' · ') || (a.media_title ? '' : word);
      c.$(p + 'pl').setAttribute('icon', st?.state === 'playing' ? 'mdi:pause' : 'mdi:play');
      c.$(p + 'pw').classList.toggle('on', !!st && !['off', 'standby', 'unavailable'].includes(st.state));
      const hasVol = a.volume_level != null;
      c.$(p + 'volrow').hidden = !hasVol || s.show_volume === false;
      if (hasVol) {
        const v = c.$(p + 'vol');
        const vv = Math.round(a.volume_level * 100);
        if (c.shadowRoot.activeElement !== v && !(s._volAt && Date.now() - s._volAt < 1500)) v.value = vv;
        c.$(p + 'vv').textContent = a.is_volume_muted ? 'Mute' : v.value;
      }
      this.tick(c, s, p);
      sum = [it.room || s.room, word, app, a.media_title].filter(Boolean).join(' · ');
      }
    }
    const key = JSON.stringify(apps.map((x) => x.name || x.source));
    const box = c.$(p + 'apps');
    if (box.dataset.k !== key) {
      box.dataset.k = key;
      const icons = s.apps_style !== 'chips';
      box.innerHTML = apps
        .map((x, i) => {
          const label = esc(x.name || x.source);
          const [, col, ic] = appStyle(x.name || x.source);
          const inner = x.image ? `<img alt="" src="${esc(x.image)}">` : `<ha-icon icon="${esc(x.icon || ic)}"></ha-icon>`;
          if (!icons) return `<button class="src" data-act="mapp" data-s="${s._k}" data-i="${i}">${inner}${label}</button>`;
          return `<button class="app" data-act="mapp" data-s="${s._k}" data-i="${i}" aria-label="${label}" style="--app:${esc(x.color || col)}"><span class="tile">${inner}</span>${s.show_app_names === false ? '' : `<span class="lab">${label}</span>`}</button>`;
        })
        .join('');
    }
    const st = it && c.st(it.entity);
    const cur = (st?.attributes.app_name || st?.attributes.source || '').toLowerCase();
    box.querySelectorAll('[data-act="mapp"]').forEach((b, i) => {
      const n = (apps[i]?.source || apps[i]?.name || '').toLowerCase();
      b.classList.toggle(s.apps_style === 'chips' ? 'vsel' : 'sel', !!cur && !!n && st?.state !== 'off' && (cur === n || cur.includes(n) || n.includes(cur)));
    });
    s.entities.forEach((x) => {
      const xs = c.st(x.entity);
      if (xs?.state === 'playing')
        ctx.chip('media', chipHtml(s._k, { tint: 'var(--violet)', dot: 1, text: `${xs.attributes.app_name || xs.attributes.media_title || 'Playing'} · ${c.nm(x)}` }));
    });
    return { sum: sum || 'Remote' };
  },
  tick(c, s, p) {
    const it = this.cur(s);
    const bar = c.$(p + 'pg');
    if (!it || !bar) return;
    const st = c.st(it.entity);
    const a = st?.attributes || {};
    const dur = num(a.media_duration);
    let pos = num(a.media_position);
    if (!dur || pos == null) return void (bar.style.width = '0');
    if (st.state === 'playing' && a.media_position_updated_at) pos += (Date.now() - new Date(a.media_position_updated_at).getTime()) / 1000;
    bar.style.width = clamp((pos / dur) * 100, 0, 100) + '%';
  },
  act(c, a, el, s) {
    const it = this.cur(s);
    if (a === 'mtab') {
      s._tab = +el.dataset.i;
      c.$(s._k + '-apps').dataset.k = '';
      return c.update();
    }
    if (a === 'mcmd' && it) c.call('media_player', el.dataset.c, { entity_id: it.entity });
    if (a === 'mvol' && it) {
      s._volAt = Date.now();
      c.call('media_player', 'volume_set', { entity_id: it.entity, volume_level: el.value / 100 });
    }
    if (a === 'mvolin') c.$(s._k + '-vv').textContent = el.value;
    if (a === 'mapp') {
      const app = this.appList(c, s)[+el.dataset.i];
      if (!app) return;
      if (app.action) {
        const [d, sv] = app.action.split('.');
        c.call(d, sv, app.data || {});
      } else if (it || app.entity) c.call('media_player', 'select_source', { entity_id: app.entity || it.entity, source: app.source || app.name });
      el.classList.add(s.apps_style === 'chips' ? 'vsel' : 'sel');
    }
  },
  open(c, s, p) {
    if (s.remote_card) c.mount('remote:' + s._k, c.$(p + 'remote'), s.remote_card);
  },
});

/* ---------------- covers: gates, garage, blinds, curtains ---------------- */
const GATE_DC = ['gate', 'garage', 'door'];
def('covers', {
  title: 'Gate & blinds', icon: 'mdi:boom-gate', color: 'sky', desc: 'Gate, garage, blinds, curtains, shutters',
  norm: (s) => ({ ...s, entities: asItems(s.entities) }),
  has: (s) => s.entities.length > 0,
  watch: (s) => ids(s.entities, s.entities.map((x) => x.state_entity)),
  kind(c, it) {
    if (it.kind) return it.kind;
    const d = dom(it.entity);
    if (d !== 'cover') return 'pulse';
    return GATE_DC.includes(c.st(it.entity)?.attributes.device_class) ? 'gate' : 'blind';
  },
  coverIcon(c, it, open) {
    if (it.icon) return it.icon;
    const dc = c.st(it.entity)?.attributes.device_class;
    if (dc === 'garage') return open ? 'mdi:garage-open-variant' : 'mdi:garage-variant';
    if (dc === 'gate') return open ? 'mdi:gate-open' : 'mdi:gate';
    if (dc === 'curtain') return open ? 'mdi:curtains' : 'mdi:curtains-closed';
    if (dc === 'shutter') return open ? 'mdi:window-shutter-open' : 'mdi:window-shutter';
    if (dom(it.entity) !== 'cover') return 'mdi:gate';
    return open ? 'mdi:blinds-open' : 'mdi:blinds';
  },
  body(c, s, p) {
    return s.entities
      .map((it, i) => {
        const k = this.kind(c, it);
        const btns = k === 'blind'
          ? `<div class="cbtns"><button class="cb sm" data-act="cov" data-v="open_cover" data-s="${s._k}" data-i="${i}" aria-label="Open"><ha-icon icon="mdi:arrow-up"></ha-icon></button><button class="cb sm" data-act="cov" data-v="stop_cover" data-s="${s._k}" data-i="${i}" aria-label="Stop"><ha-icon icon="mdi:stop"></ha-icon></button><button class="cb sm" data-act="cov" data-v="close_cover" data-s="${s._k}" data-i="${i}" aria-label="Close"><ha-icon icon="mdi:arrow-down"></ha-icon></button></div>`
          : `<button class="pill big" data-act="cov" data-v="${k === 'pulse' ? 'pulse' : 'gate'}" data-s="${s._k}" data-i="${i}" id="${p}cg${i}">${k === 'pulse' ? esc(it.label || 'Open') : ''}</button>`;
        return `<div class="cov" id="${p}cv${i}"><button class="cico" data-act="more" data-e="${esc(it.state_entity || it.entity)}" aria-label="Details"><ha-icon id="${p}ci${i}" icon="mdi:blinds"></ha-icon></button>
          <div class="mt" style="min-width:0"><b>${esc(c.nm(it))}</b><span id="${p}cs${i}"></span>${k === 'blind' ? `<div class="bar"><i id="${p}cb${i}"></i></div>` : ''}</div>${btns}</div>`;
      })
      .join('');
  },
  update(c, s, p, ctx) {
    const open = [];
    s.entities.forEach((it, i) => {
      const k = this.kind(c, it);
      const sid = it.state_entity || it.entity;
      const st = c.st(sid);
      const sd = dom(sid);
      let isOpen;
      let moving = false;
      let word;
      if (sd === 'cover') {
        isOpen = !!st && st.state !== 'closed';
        moving = ['opening', 'closing'].includes(st?.state);
        word = { open: 'Open', closed: 'Closed', opening: 'Opening…', closing: 'Closing…' }[st?.state] || cap(st?.state || 'missing');
      } else if (sd === 'binary_sensor') {
        isOpen = st?.state === 'on';
        word = isOpen ? 'Open' : 'Closed';
      } else {
        isOpen = false;
        word = st ? `Last used ${ago(st.last_changed)}` : 'Missing';
      }
      const pos = st?.attributes.current_position;
      const row = c.$(p + 'cv' + i);
      row.classList.toggle('op', isOpen);
      row.classList.toggle('mv', moving);
      c.$(p + 'ci' + i).setAttribute('icon', this.coverIcon(c, it, isOpen));
      c.$(p + 'cs' + i).textContent = k === 'blind' && pos != null && st.state !== 'closed' ? `${word} · ${pos}%` : word;
      if (c.$(p + 'cb' + i)) c.$(p + 'cb' + i).style.width = (pos ?? (isOpen ? 100 : 0)) + '%';
      if (k === 'gate') c.$(p + 'cg' + i).textContent = moving ? 'Stop' : isOpen ? 'Close' : 'Open';
      if (isOpen) open.push(c.nm(it));
      if (isOpen && k !== 'blind') ctx.chip('covers', chipHtml(s._k, { tint: 'var(--sky)', dot: 1, text: `${c.nm(it)} ${moving ? word.toLowerCase() : 'open'}` }));
    });
    return { sum: open.length ? `${open.join(', ')} open` : 'All closed' };
  },
  act(c, a, el, s) {
    if (a !== 'cov') return;
    const it = s.entities[+el.dataset.i];
    const id = it.entity;
    const d = dom(id);
    const v = el.dataset.v;
    if (v === 'gate') {
      const st = c.st(id)?.state;
      const svc = ['opening', 'closing'].includes(st) ? 'stop_cover' : st === 'closed' ? 'open_cover' : 'close_cover';
      return c.call('cover', svc, { entity_id: id });
    }
    if (v === 'pulse') {
      if (d === 'button' || d === 'input_button') return c.call(d, 'press', { entity_id: id });
      if (d === 'lock') return c.call('lock', 'unlock', { entity_id: id });
      if (d === 'cover') return c.call('cover', 'toggle', { entity_id: id });
      return c.call(d === 'script' ? 'script' : 'homeassistant', 'turn_on', { entity_id: id });
    }
    c.call('cover', v, { entity_id: id });
  },
});

/* ---------------- energy: solar, battery, grid, load-shedding ---------------- */
def('energy', {
  title: 'Solar & power', icon: 'mdi:solar-power-variant', color: 'lime', desc: 'Solar, battery, grid, house load and load-shedding',
  norm: (s) => ({ ...s }),
  has: (s) => !!(s.solar || s.load || s.grid || s.battery_soc),
  watch: (s) => ids([s.solar, s.load, s.grid, s.battery_power, s.battery_soc, s.loadshedding, s.loadshedding_stage, s.loadshedding_area, s.solar_today, s.load_today, s.grid_today].filter(Boolean)),
  body: (c, s, p) => `${s.loadshedding || s.loadshedding_stage || s.loadshedding_area ? `<div class="ls" id="${p}ls"><ha-icon icon="mdi:transmission-tower-off"></ha-icon><div><b id="${p}lst"></b><span id="${p}lss"></span></div></div>` : ''}
    <div class="flow"><svg viewBox="0 0 320 200" aria-hidden="true"><path id="${p}f3" d="M46 110 L274 110"/><path id="${p}f1" d="M160 40 Q250 44 274 110"/><path id="${p}f2" d="M160 40 L160 160"/><path id="${p}f4" d="M160 160 Q250 166 274 110"/></svg>
      <button class="node" id="${p}nS" data-act="more" data-e="${esc(s.solar || '')}" style="left:50%;top:20%;--nc:var(--amber)"${s.solar ? '' : ' hidden'}><ha-icon icon="mdi:solar-power-variant"></ha-icon><b id="${p}vS"></b><span>Solar</span></button>
      <button class="node" id="${p}nG" data-act="more" data-e="${esc(s.grid || '')}" style="left:14.4%;top:55%;--nc:var(--red)"${s.grid ? '' : ' hidden'}><ha-icon icon="mdi:transmission-tower"></ha-icon><b id="${p}vG"></b><span id="${p}lG">Grid</span></button>
      <button class="node" id="${p}nH" data-act="more" data-e="${esc(s.load || '')}" style="left:85.6%;top:55%;--nc:var(--cyan)"><ha-icon icon="mdi:home-lightning-bolt"></ha-icon><b id="${p}vH"></b><span>Home</span></button>
      <button class="node" id="${p}nB" data-act="more" data-e="${esc(s.battery_soc || s.battery_power || '')}" style="left:50%;top:80%;--nc:var(--teal)"${s.battery_soc || s.battery_power ? '' : ' hidden'}><ha-icon id="${p}iB" icon="mdi:battery"></ha-icon><b id="${p}vB"></b><span id="${p}lB">Battery</span></button></div>
    ${s.solar_today || s.load_today || s.grid_today ? `<div class="stats s4">
      <button class="stat" data-act="more" data-e="${esc(s.solar_today || '')}"><div class="k">Solar today</div><div class="v" id="${p}t1">–</div></button>
      <button class="stat" data-act="more" data-e="${esc(s.load_today || '')}"><div class="k">Used today</div><div class="v" id="${p}t2">–</div></button>
      <button class="stat" data-act="more" data-e="${esc(s.grid_today || '')}"><div class="k">From grid</div><div class="v" id="${p}t3">–</div></button>
      <div class="stat"><div class="k">Self-powered</div><div class="v" id="${p}t4">–</div></div></div>` : ''}`,
  update(c, s, p, ctx) {
    const pv = s.solar ? watts(c, s.solar) : null;
    let grid = s.grid ? watts(c, s.grid) : null;
    if (grid != null && s.grid_invert) grid = -grid;
    let bat = s.battery_power ? watts(c, s.battery_power) : null;
    if (bat != null && s.battery_invert) bat = -bat; // positive = charging
    const soc = s.battery_soc ? num(c.st(s.battery_soc)?.state) : null;
    let load = s.load ? watts(c, s.load) : null;
    if (load == null && pv != null) load = pv + (grid || 0) - (bat || 0);
    const t = (k, v) => c.$(p + k) && (c.$(p + k).textContent = v);
    t('vS', fmtW(pv));
    t('vG', fmtW(grid));
    t('lG', grid != null && grid < 0 ? 'Export' : 'Grid');
    t('vH', fmtW(load));
    t('vB', soc != null ? `${Math.round(soc)}%` : fmtW(bat));
    t('lB', bat == null ? 'Battery' : bat > 20 ? 'Charging' : bat < -20 ? 'Supplying' : 'Battery');
    const l10 = soc == null ? 100 : clamp(Math.round(soc / 10) * 10, 10, 100);
    c.$(p + 'iB').setAttribute('icon', soc == null ? 'mdi:battery' : bat > 20 ? `mdi:battery-charging-${l10}` : l10 >= 100 ? 'mdi:battery' : `mdi:battery-${l10}`);
    c.$(p + 'nS').classList.toggle('idle', !(pv > 30));
    c.$(p + 'nG').classList.toggle('idle', !(Math.abs(grid || 0) > 30));
    const live = (k, on, col, rev) => {
      const el = c.$(p + k);
      el.classList.toggle('live', !!on);
      el.classList.toggle('rev', !!rev);
      el.style.setProperty('--fc', col);
    };
    live('f1', pv > 30 && s.solar, 'var(--amber)');
    live('f2', pv > 30 && bat > 20 && s.solar, 'var(--teal)');
    live('f3', Math.abs(grid || 0) > 30, grid < 0 ? 'var(--lime)' : 'var(--red)', grid < 0);
    live('f4', bat != null && bat < -20, 'var(--teal)');
    /* load-shedding */
    const lsEl = c.$(p + 'ls');
    let lsSum = '';
    if (lsEl) {
      const stage = c.st(s.loadshedding_stage || s.loadshedding);
      const area = c.st(s.loadshedding_area || s.loadshedding);
      const sv = stage?.state;
      const stageNum = num(String(sv).replace(/\D+/g, ''));
      const noLs = sv == null || /^(0|off|no load|none|false)$/i.test(String(sv)) || stageNum === 0;
      const aa = area?.attributes || {};
      const ns = aa.next_start_time || aa.next_start || stage?.attributes.next_start_time;
      const ne = aa.next_end_time || aa.next_end || stage?.attributes.next_end_time;
      const nowOn = area && s.loadshedding_area && area.state === 'on';
      const label = stageNum ? `Stage ${stageNum}` : cap(String(sv || ''));
      lsEl.classList.toggle('now', !!nowOn);
      c.$(p + 'lst').textContent = noLs && !nowOn ? 'No load-shedding' : nowOn ? `Load-shedding now · ${label}${ne ? ` until ${timeStr(ne)}` : ''}` : `Load-shedding ${label}${ns ? ` · next ${timeStr(ns)}${ne ? `–${timeStr(ne)}` : ''}` : ''}`;
      const cap_kwh = num(s.battery_capacity);
      const hrs = cap_kwh && soc != null && load > 50 ? (cap_kwh * (soc / 100) * 1000) / load : null;
      c.$(p + 'lss').textContent = hrs != null ? `Battery covers about ${hrs < 10 ? hrs.toFixed(1) : Math.round(hrs)} h at the current load` : ns && !nowOn ? `Next slot ${new Date(ns).toLocaleDateString([], { weekday: 'long' })} ${timeStr(ns)}` : '';
      if (!noLs || nowOn) {
        lsSum = nowOn ? 'Load-shedding now' : label;
        ctx.chip('loadshedding', chipHtml(s._k, { tint: nowOn ? 'var(--red)' : 'var(--amber)', icon: 'mdi:transmission-tower-off', text: nowOn ? 'Load-shedding now' : `${label}${ns ? ' · ' + timeStr(ns) : ''}` }));
      }
    }
    const v = (k) => num(c.st(s[k])?.state);
    const st1 = v('solar_today');
    const st2 = v('load_today');
    const st3 = v('grid_today');
    if (c.$(p + 't1')) {
      c.$(p + 't1').innerHTML = st1 == null ? '–' : `${fx(st1, 1)} <small>kWh</small>`;
      c.$(p + 't2').innerHTML = st2 == null ? '–' : `${fx(st2, 1)} <small>kWh</small>`;
      c.$(p + 't3').innerHTML = st3 == null ? '–' : `${fx(st3, 1)} <small>kWh</small>`;
      c.$(p + 't4').innerHTML = st2 && st3 != null ? `${Math.round(clamp(1 - st3 / st2, 0, 1) * 100)}<small>%</small>` : '–';
    }
    if (pv != null) ctx.chip('solar', chipHtml(s._k, { icon: 'mdi:solar-power-variant', color: 'var(--amber)', b: fmtW(pv) }));
    if (soc != null && soc < (s.battery_low ?? 20)) ctx.chip('battery', chipHtml(s._k, { tint: 'var(--red)', icon: 'mdi:battery-alert', text: `Battery ${Math.round(soc)}%` }));
    return { sum: [pv != null ? `Solar ${fmtW(pv)}` : null, soc != null ? `Battery ${Math.round(soc)}%` : null, grid != null && Math.abs(grid) > 30 ? `Grid ${grid < 0 ? 'export' : ''} ${fmtW(grid)}`.replace('  ', ' ') : null, lsSum || null].filter(Boolean).join(' · ') };
  },
});

/* ---------------- water: tank, pumps, usage ---------------- */
def('water', {
  title: 'Water', icon: 'mdi:water', color: 'cyan', desc: 'Tank level, pool pump, borehole, usage',
  norm: (s) => ({ ...s, switches: asItems(s.switches || s.entities) }),
  has: (s) => !!(s.tank || s.switches.length || s.usage),
  watch: (s) => ids([s.tank, s.usage].filter(Boolean), s.switches),
  body: (c, s, p) => `<div class="gey"${s.tank ? '' : ' style="grid-template-columns:1fr"'}>${s.tank ? `<button class="tank on" id="${p}tk" data-act="more" data-e="${esc(s.tank)}" style="appearance:none;padding:0;cursor:pointer;color:inherit"><div class="water" id="${p}wl"></div><div class="tlab" id="${p}tl"></div></button>` : ''}
    <div class="gside">${s.switches.map((w, i) => `<div class="tog"><div><b>${esc(c.nm(w))}</b><span id="${p}ws${i}"></span></div><button class="sw w" role="switch" data-act="toggle" data-e="${esc(w.entity)}" id="${p}wsw${i}" aria-label="${esc(c.nm(w))}"></button></div>`).join('')}
    <div class="stats">${s.usage ? `<button class="stat" data-act="more" data-e="${esc(s.usage)}"><div class="k">${esc(s.usage_name || 'Used today')}</div><div class="v" id="${p}wu">–</div></button>` : ''}${s.tank ? `<button class="stat" data-act="more" data-e="${esc(s.tank)}"><div class="k">${esc(s.tank_name || 'Tank')}</div><div class="v" id="${p}wt">–</div></button>` : ''}</div></div></div>`,
  update(c, s, p) {
    const lvl = s.tank ? num(c.st(s.tank)?.state) : null;
    if (s.tank) {
      c.$(p + 'wl').style.height = clamp(lvl ?? 0, 0, 100) + '%';
      c.$(p + 'tl').textContent = lvl == null ? 'N/A' : `${Math.round(lvl)}%`;
      c.$(p + 'wt').innerHTML = valHtml(c, s.tank);
    }
    const run = [];
    s.switches.forEach((w, i) => {
      const on = c.st(w.entity)?.state === 'on';
      if (on) run.push(c.nm(w));
      c.$(p + 'wsw' + i).setAttribute('aria-checked', String(on));
      c.$(p + 'ws' + i).textContent = !c.st(w.entity) ? 'Missing' : on ? 'Running' : 'Off';
    });
    if (s.usage) c.$(p + 'wu').innerHTML = valHtml(c, s.usage);
    return { sum: [lvl != null ? `${s.tank_name || 'Tank'} ${Math.round(lvl)}%` : null, run.length ? `${run.join(', ')} on` : null].filter(Boolean).join(' · ') || 'All off' };
  },
});

/* ---------------- geyser ---------------- */
def('geyser', {
  title: 'Geyser', icon: 'mdi:water-boiler', color: 'ember', desc: 'Geyser switch, element power, kWh today and this month',
  norm: (s) => ({ ...s }),
  has: (s) => !!s.switch,
  watch: (s) => ['switch', 'power', 'current', 'voltage', 'energy_day', 'energy_month', 'temperature'].map((k) => s[k]).filter(Boolean),
  body(c, s, p) {
    const stat = (key, label) => (s[key] ? `<button class="stat" data-act="more" data-e="${esc(s[key])}"><div class="k">${label}</div><div class="v" id="${p}gs-${key}">–</div></button>` : '');
    return `<div class="gey">
      <div class="tank" id="${p}tank"><div class="water"></div>
        <i class="bub" style="left:22%;animation-delay:0s"></i><i class="bub" style="left:45%;animation-delay:.8s"></i>
        <i class="bub" style="left:66%;animation-delay:1.5s"></i><i class="bub" style="left:80%;animation-delay:.4s"></i>
        <div class="coil"></div><div class="tlab" id="${p}tlab"></div></div>
      <div class="gside">
        <div class="tog"><div><b>${esc(s.switch_name || c.st(s.switch)?.attributes.friendly_name || 'Geyser')}</b><span id="${p}gstate"></span></div>
          <button class="sw" role="switch" id="${p}gsw" data-act="toggle" data-e="${esc(s.switch)}" aria-checked="false" aria-label="Geyser power"></button></div>
        <div class="stats">
          ${stat('temperature', 'Water temp')}${stat('power', 'Power')}${stat('current', 'Current')}${stat('energy_day', 'Today')}${stat('energy_month', 'This month')}
          <div class="stat wide">${s.voltage ? `<div><div class="k">Voltage</div><div class="v" id="${p}gs-voltage">–</div></div>` : '<div></div>'}
            <div class="k load" id="${p}gload"></div></div>
        </div></div></div>`;
  },
  update(c, s, p, ctx) {
    const sw = c.st(s.switch);
    const isOn = sw?.state === 'on';
    const val = (k) => num(c.st(s[k])?.state);
    const pw = s.power ? watts(c, s.power) : null;
    const load = s.power ? isOn && (pw ?? 0) > (s.load_threshold ?? 10) : isOn;
    const tank = c.$(p + 'tank');
    tank.classList.toggle('on', isOn);
    tank.classList.toggle('hot', load);
    const wt = val('temperature');
    c.$(p + 'tlab').textContent = wt != null ? `${Math.round(wt)}°` : load ? 'HEATING' : isOn ? 'READY' : sw ? 'OFF' : 'N/A';
    c.$(p + 'gsw').setAttribute('aria-checked', String(isOn));
    c.$(p + 'gstate').textContent = !sw || sw.state === 'unavailable' ? 'Unavailable' : isOn ? (load ? 'On · element heating' : 'On · up to temperature') : 'Off';
    const set = (k, h) => c.$(p + 'gs-' + k) && (c.$(p + 'gs-' + k).innerHTML = h);
    set('power', pw == null ? '–' : pw >= 1000 ? `${fx(pw / 1000, 2)} <small>kW</small>` : `${Math.round(pw)} <small>W</small>`);
    set('current', `${fx(val('current'), 2)} <small>A</small>`);
    set('energy_day', `${fx(val('energy_day'), 2)} <small>kWh</small>`);
    set('energy_month', `${fx(val('energy_month'), 1)} <small>kWh</small>`);
    set('voltage', `${fx(val('voltage'), 1)} <small>V</small>`);
    set('temperature', wt == null ? '–' : `${fx(wt, 0)} <small>°C</small>`);
    const gl = c.$(p + 'gload');
    gl.textContent = load ? 'Load on' : 'Load off';
    gl.style.color = load ? 'var(--ember)' : 'var(--ink-3)';
    const today = val('energy_day');
    if (load) ctx.chip('geyser', chipHtml(s._k, { tint: 'var(--ember)', dot: 1, text: `${s.name || 'Geyser'} heating` }));
    return { sum: [load ? 'Heating' : isOn ? 'On' : sw ? 'Off' : 'Unavailable', load && pw != null ? fmtW(pw) : null, today != null ? `${fx(today, 1)} kWh today` : null].filter(Boolean).join(' · ') };
  },
});

/* ---------------- amp ---------------- */
def('amp', {
  title: 'Amp', icon: 'mdi:amplifier', color: 'teal', desc: 'Amplifier volume knob, sources, mute and power',
  norm: (s) => ({ ...s }),
  has: (s) => !!s.entity,
  watch: (s) => [s.entity],
  body: (c, s, p) => `<div class="ampface" id="${p}face">
      <div class="knob" id="${p}knob" data-s="${s._k}" role="slider" tabindex="0" aria-label="Volume" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <svg viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.07)" stroke-width="8" stroke-dasharray="${KNOB} 314.2" stroke-linecap="round" transform="rotate(135 60 60)"/>
          <circle id="${p}karc" cx="60" cy="60" r="50" fill="none" stroke="#3ee0b4" stroke-width="8" stroke-dasharray="0 314.2" stroke-linecap="round" transform="rotate(135 60 60)" style="filter:drop-shadow(0 0 6px rgba(62,224,180,.7))"/>
          <circle cx="60" cy="60" r="36" fill="#1b2130" stroke="rgba(255,255,255,.08)"/></svg>
        <div class="kval" id="${p}kval">–</div></div>
      <div class="aside"><div class="ampl">Source</div><div class="srcs" id="${p}srcs"></div><div class="vu" id="${p}vu">${'<i></i>'.repeat(24)}</div>
        <div class="vrow">
          <button class="btn" data-act="vstep" data-d="-1" data-s="${s._k}" aria-label="Volume down"><ha-icon icon="mdi:minus"></ha-icon></button>
          <button class="btn" data-act="vstep" data-d="1" data-s="${s._k}" aria-label="Volume up"><ha-icon icon="mdi:plus"></ha-icon></button>
          <button class="btn" data-act="mute" data-s="${s._k}" id="${p}mute"><ha-icon icon="mdi:volume-off"></ha-icon><span>Mute</span></button>
          <button class="btn pwr" data-act="apower" data-s="${s._k}" id="${p}pwr" aria-label="Amp power"><ha-icon icon="mdi:power"></ha-icon></button></div></div></div>`,
  draw(c, s, v) {
    const p = s._k + '-';
    s._shown = v;
    c.$(p + 'karc').setAttribute('stroke-dasharray', `${v == null ? 0 : (KNOB * v) / 100} 314.2`);
    c.$(p + 'kval').textContent = s._muted ? 'Mute' : v == null ? '–' : v;
    c.$(p + 'knob').setAttribute('aria-valuenow', v ?? 0);
  },
  send(c, s, v) {
    v = clamp(Math.round(v), 0, 100);
    s._pending = Date.now();
    this.draw(c, s, v);
    c.call('media_player', 'volume_set', { entity_id: s.entity, volume_level: v / 100 });
  },
  update(c, s, p) {
    const st = c.st(s.entity);
    const a = st?.attributes || {};
    const off = !st || ['off', 'unavailable', 'standby'].includes(st.state);
    s._muted = !!a.is_volume_muted;
    s._live = !off && !s._muted;
    const vol = a.volume_level != null ? Math.round(a.volume_level * 100) : null;
    const pending = s._pending && Date.now() - s._pending < 1500 && vol !== s._shown;
    this.draw(c, s, s._dragging || pending ? s._shown : vol);
    const list = s.sources || a.source_list || [];
    const key = JSON.stringify(list);
    const srcs = c.$(p + 'srcs');
    if (srcs.dataset.k !== key) {
      srcs.dataset.k = key;
      srcs.innerHTML = list.length
        ? list.map((x) => `<button class="src" data-act="asrc" data-s="${s._k}" data-v="${esc(x)}"><ha-icon icon="${srcIcon(x)}"></ha-icon>${esc(x)}</button>`).join('')
        : `<span class="ts">${esc(a.source || 'No sources reported')}</span>`;
    }
    srcs.querySelectorAll('.src').forEach((b) => b.classList.toggle('sel', b.dataset.v === a.source));
    c.$(p + 'mute').classList.toggle('active', s._muted);
    c.$(p + 'mute').querySelector('span').textContent = s._muted ? 'Unmute' : 'Mute';
    c.$(p + 'pwr').classList.toggle('on', !off);
    c.$(p + 'face').classList.toggle('off', off);
    return { sum: !st ? 'Unavailable' : off ? 'Off' : [a.source, s._muted ? 'Muted' : vol != null ? `${vol}%` : null].filter(Boolean).join(' · ') || 'On' };
  },
  act(c, a, el, s) {
    if (a === 'vstep') this.send(c, s, (s._shown ?? 0) + +el.dataset.d * (s.step ?? 5));
    if (a === 'mute') c.call('media_player', 'volume_mute', { entity_id: s.entity, is_volume_muted: !s._muted });
    if (a === 'asrc') c.call('media_player', 'select_source', { entity_id: s.entity, source: el.dataset.v });
    if (a === 'apower') c.call('media_player', 'toggle', { entity_id: s.entity });
  },
  wire(c, s, p) {
    const knob = c.$(p + 'knob');
    const at = (e) => {
      const r = knob.getBoundingClientRect();
      let ang = (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
      ang = (ang - 135 + 720) % 360;
      if (ang > 270) ang = ang > 315 ? 0 : 270;
      s._drag = Math.round((ang / 270) * 100);
      this.draw(c, s, s._drag);
    };
    knob.addEventListener('pointerdown', (e) => {
      knob.setPointerCapture(e.pointerId);
      s._dragging = true;
      at(e);
    });
    knob.addEventListener('pointermove', (e) => s._dragging && at(e));
    const end = () => {
      if (!s._dragging) return;
      s._dragging = false;
      if (s._drag != null) this.send(c, s, s._drag);
    };
    knob.addEventListener('pointerup', end);
    knob.addEventListener('pointercancel', end);
    knob.addEventListener('keydown', (e) => {
      const d = { ArrowUp: 2, ArrowRight: 2, ArrowDown: -2, ArrowLeft: -2 }[e.key];
      if (!d) return;
      e.preventDefault();
      const v = clamp((s._shown ?? 0) + d, 0, 100);
      this.draw(c, s, v);
      clearTimeout(s._kt);
      s._kt = setTimeout(() => this.send(c, s, v), 250);
    });
  },
  open(c, s) {
    if (s._vu) return;
    s._vu = setInterval(() => {
      const bars = c.shadowRoot.querySelectorAll(`#${s._k}-vu i`);
      const lvl = s._live ? (s._shown ?? 0) / 100 : 0;
      bars.forEach((b, i) => {
        const h = lvl ? (0.15 + Math.random() * 0.85) * lvl * (1 - Math.abs(i - 12) / 18) : 0;
        b.style.height = Math.max(8, h * 100) + '%';
      });
    }, 140);
  },
  close(c, s) {
    clearInterval(s._vu);
    s._vu = null;
  },
});

/* ---------------- weather ---------------- */
def('weather', {
  title: 'Weather', icon: 'mdi:weather-partly-cloudy', color: 'amber', desc: 'Now plus the next few days',
  norm: (s) => ({ ...s, entity: s.entity || (Array.isArray(s.entities) ? s.entities[0] : null) }),
  has: (s) => !!s.entity,
  watch: (s) => [s.entity],
  body: (c, s, p) => `<button class="wx" data-act="more" data-e="${esc(s.entity)}"><ha-icon id="${p}wi" icon="mdi:weather-partly-cloudy"></ha-icon>
      <div style="min-width:0"><div class="wt" id="${p}wt">–</div><div class="wd" id="${p}wd"></div></div></button>
    <div class="fc" id="${p}fc" style="--n:${s.days || 5}"></div>`,
  update(c, s, p, ctx) {
    const st = c.st(s.entity);
    const a = st?.attributes || {};
    const u = a.temperature_unit || '°C';
    c.$(p + 'wi').setAttribute('icon', WEATHER_ICONS[st?.state] || 'mdi:weather-partly-cloudy');
    c.$(p + 'wt').innerHTML = a.temperature != null ? `${Math.round(a.temperature)}<small>${esc(u)}</small>` : '–';
    const word = WEATHER_WORDS[st?.state] || cap(st?.state || '');
    c.$(p + 'wd').textContent = [word, a.humidity != null ? `${a.humidity}% humidity` : null, a.wind_speed != null ? `Wind ${Math.round(a.wind_speed)} ${a.wind_speed_unit || ''}`.trim() : null].filter(Boolean).join(' · ');
    const fc = (s._fc || a.forecast || []).slice(0, s.days || 5);
    const key = JSON.stringify(fc.map((f) => [f.datetime, f.temperature, f.templow, f.condition, f.precipitation_probability]));
    const box = c.$(p + 'fc');
    if (box.dataset.k !== key) {
      box.dataset.k = key;
      box.innerHTML = fc
        .map((f) => `<div class="fd"><span class="dn">${esc(new Date(f.datetime).toLocaleDateString([], { weekday: 'short' }))}</span><ha-icon icon="${WEATHER_ICONS[f.condition] || 'mdi:weather-partly-cloudy'}"></ha-icon>
          <span class="hi">${f.temperature != null ? Math.round(f.temperature) + '°' : '–'}</span><span class="lo">${f.templow != null ? Math.round(f.templow) + '°' : ''}</span>${f.precipitation_probability ? `<span class="pr">${Math.round(f.precipitation_probability)}%</span>` : ''}</div>`)
        .join('');
    }
    if (a.temperature != null) ctx.chip('weather', chipHtml(s._k, { icon: WEATHER_ICONS[st.state] || 'mdi:weather-partly-cloudy', color: 'var(--amber)', b: `${Math.round(a.temperature)}°` }));
    const today = fc[0];
    return { sum: [word, a.temperature != null ? `${Math.round(a.temperature)}${u}` : null, today?.templow != null ? `${Math.round(today.templow)}–${Math.round(today.temperature)}° today` : null].filter(Boolean).join(' · ') };
  },
  async start(c, s) {
    if (s._unsub || !c.hass?.connection?.subscribeMessage) return;
    s._unsub = 'pending';
    try {
      s._unsub = await c.hass.connection.subscribeMessage(
        (m) => {
          s._fc = m.forecast || [];
          c.update();
        },
        { type: 'weather/subscribe_forecast', forecast_type: s.forecast_type || 'daily', entity_id: s.entity }
      );
    } catch (e) {
      s._unsub = null;
    }
  },
  stop(c, s) {
    if (typeof s._unsub === 'function') s._unsub();
    s._unsub = null;
  },
});

/* ---------------- irrigation ---------------- */
def('irrigation', {
  title: 'Irrigation', icon: 'mdi:sprinkler-variant', color: 'teal', desc: 'Sprinkler zones, next run, rain delay',
  norm: (s) => ({ ...s, zones: asItems(s.zones || s.entities), extra: asItems(s.extra) }),
  has: (s) => s.zones.length > 0,
  watch: (s) => ids(s.zones, s.extra, [s.next_run, s.rain_delay, s.master].filter(Boolean)),
  body: (c, s, p) => `${s.next_run || s.rain_delay || s.master ? `<div class="stats s3" style="margin-bottom:10px;grid-template-columns:repeat(${[s.next_run, s.rain_delay, s.master].filter(Boolean).length},minmax(0,1fr))">
      ${s.next_run ? `<button class="stat" data-act="more" data-e="${esc(s.next_run)}"><div class="k">Next run</div><div class="v" id="${p}nr">–</div></button>` : ''}
      ${s.rain_delay ? `<button class="stat" data-act="toggle" data-e="${esc(s.rain_delay)}"><div class="k">Rain delay</div><div class="v" id="${p}rd">–</div></button>` : ''}
      ${s.master ? `<button class="stat" data-act="toggle" data-e="${esc(s.master)}"><div class="k">Controller</div><div class="v" id="${p}ms">–</div></button>` : ''}</div>` : ''}
    <div class="lgrid cgrid" style="--c:var(--teal)">${s.zones.map((z, i) => tileHtml(c, s._k, { icon: 'mdi:sprinkler-variant', ...z }, p + 'z' + i)).join('')}${s.extra.map((z, i) => tileHtml(c, s._k, z, p + 'x' + i)).join('')}</div>`,
  update(c, s, p, ctx) {
    const run = [];
    s.zones.forEach((z, i) => {
      if (tileUpdate(c, z, p + 'z' + i)) run.push(c.nm(z));
      const rem = z.remaining && minutesLeft(c.st(z.remaining));
      if (rem != null && c.st(z.entity)?.state === 'on') c.$(p + 'z' + i + 'v').innerHTML = `${rem}<small> min</small>`;
    });
    s.extra.forEach((z, i) => tileUpdate(c, z, p + 'x' + i));
    const nr = c.st(s.next_run);
    if (c.$(p + 'nr')) c.$(p + 'nr').textContent = !nr || ['unknown', 'unavailable'].includes(nr.state) ? '–' : /^\d{4}-/.test(nr.state) ? `${new Date(nr.state).toLocaleDateString([], { weekday: 'short' })} ${timeStr(nr.state)}` : c.fmt(s.next_run);
    if (c.$(p + 'rd')) c.$(p + 'rd').textContent = c.st(s.rain_delay)?.state === 'on' ? 'On' : 'Off';
    if (c.$(p + 'ms')) c.$(p + 'ms').textContent = c.st(s.master)?.state === 'on' ? 'Enabled' : 'Paused';
    if (run.length) ctx.chip('irrigation', chipHtml(s._k, { tint: 'var(--teal)', dot: 1, text: `Watering ${run.join(', ')}` }));
    return { sum: run.length ? `Watering ${run.join(', ')}` : nr && /^\d{4}-/.test(nr.state) ? `Next run ${timeStr(nr.state)}` : `${s.zones.length} zones idle` };
  },
  act(c, a, el) {
    if (a === 'tile') tileAction(c, el);
  },
});

/* ---------------- appliances: washer, dryer, dishwasher ---------------- */
const IDLE_WORDS = /^(off|idle|standby|unknown|unavailable|power[ _]?off|end|finished|complete|completed|done|ready|stop|none|0)$/i;
def('appliances', {
  title: 'Appliances', icon: 'mdi:washing-machine', color: 'violet', desc: 'Washer, dryer, dishwasher: running, time left, done',
  norm: (s) => ({ ...s, entities: asItems(s.entities || s.appliances) }),
  has: (s) => s.entities.length > 0,
  watch: (s) => ids(s.entities, s.entities.flatMap((x) => [x.remaining, x.power, x.progress, x.switch])),
  body: (c, s, p) => s.entities
    .map((x, i) => `<div class="apl" id="${p}a${i}" style="--c:${colorVar(x.color) || 'var(--violet)'}"><button class="ring" data-act="more" data-e="${esc(x.entity)}" style="appearance:none;border:0;background:none;padding:0;cursor:pointer;color:inherit" aria-label="Details">${ringSvg(p + 'ar' + i, 'var(--c)')}<ha-icon icon="${esc(x.icon || 'mdi:washing-machine')}" style="color:var(--c)"></ha-icon></button>
      <div style="min-width:0"><b>${esc(c.nm(x))}</b><span class="as" id="${p}as${i}"></span></div>
      <div style="display:flex;align-items:center;gap:10px"><div class="ar" id="${p}rt${i}"></div>${x.switch ? `<button class="sw g" role="switch" data-act="toggle" data-e="${esc(x.switch)}" id="${p}sw${i}" aria-label="${esc(c.nm(x))} power"></button>` : ''}</div></div>`)
    .join(''),
  running(c, x) {
    const st = c.st(x.entity);
    const pw = x.power ? watts(c, x.power) : null;
    if (pw != null) return pw > (x.threshold ?? 5);
    if (!st) return false;
    if (dom(x.entity) === 'binary_sensor' || TOGGLE_DOMAINS.includes(dom(x.entity))) return st.state === 'on';
    return !IDLE_WORDS.test(st.state);
  },
  update(c, s, p, ctx) {
    const run = [];
    s.entities.forEach((x, i) => {
      const st = c.st(x.entity);
      const on = this.running(c, x);
      const rem = x.remaining ? minutesLeft(c.st(x.remaining)) : null;
      const prog = x.progress ? num(c.st(x.progress)?.state) : null;
      c.$(p + 'a' + i).classList.toggle('run', on);
      const word = st ? (dom(x.entity) === 'sensor' ? cap(String(c.fmt(x.entity)).replace(/_/g, ' ')) : on ? 'Running' : 'Idle') : 'Missing';
      c.$(p + 'as' + i).textContent = on ? word : st && /end|finish|complete|done/i.test(st.state) ? `Done · ${ago(st.last_changed)}` : word;
      c.$(p + 'rt' + i).innerHTML = on && rem != null ? `${fmtMin(rem)}<small>left</small>` : x.power && on ? `${fmtW(watts(c, x.power))}<small>now</small>` : '';
      const arc = c.$(p + 'ar' + i);
      const frac = prog != null ? prog / 100 : on && rem != null && x.total ? 1 - rem / x.total : on ? 0.25 : 0;
      arc.setAttribute('stroke-dashoffset', RING * (1 - clamp(frac, 0, 1)));
      if (x.switch) c.$(p + 'sw' + i).setAttribute('aria-checked', String(c.st(x.switch)?.state === 'on'));
      if (on) {
        run.push(c.nm(x));
        ctx.chip('appliances', chipHtml(s._k, { tint: colorVar(x.color) || 'var(--violet)', dot: 1, text: `${c.nm(x)}${rem != null ? ' · ' + fmtMin(rem) : ' running'}` }));
      }
    });
    return { sum: run.length ? `${run.join(', ')} running` : 'Nothing running' };
  },
});

/* ---------------- EV charger ---------------- */
def('ev', {
  title: 'EV charger', icon: 'mdi:ev-station', color: 'lime', desc: 'Charging power, car battery, range, plug',
  norm: (s) => ({ ...s }),
  has: (s) => !!(s.charger || s.power || s.battery),
  watch: (s) => ['charger', 'power', 'battery', 'range', 'plug', 'target', 'energy', 'status'].map((k) => s[k]).filter(Boolean),
  body: (c, s, p) => `<div class="ev"><div class="evtop"><div><div class="gl">${esc(s.car_name || 'Car battery')}</div><div class="evp" id="${p}soc">–</div></div>
      <div class="evs"><b id="${p}st"></b><span id="${p}sub"></span></div></div>
      <div class="evbar" id="${p}bar"><i id="${p}fill"></i><span class="evtick" id="${p}tgt" hidden></span></div></div>
    <div class="stats s3" style="margin-top:10px">${[['power', 'Charging'], ['energy', 'This session'], ['range', 'Range']].filter(([k]) => s[k]).map(([k, l]) => `<button class="stat" data-act="more" data-e="${esc(s[k])}"><div class="k">${l}</div><div class="v" id="${p}${k}">–</div></button>`).join('')}</div>
    ${s.charger ? `<div class="tog" style="margin-top:10px"><div><b>${esc(c.nm({ entity: s.charger, name: s.charger_name }))}</b><span id="${p}cs"></span></div><button class="sw g" role="switch" data-act="toggle" data-e="${esc(s.charger)}" id="${p}sw" aria-label="Charger"></button></div>` : ''}`,
  update(c, s, p, ctx) {
    const soc = s.battery ? num(c.st(s.battery)?.state) : null;
    const pw = s.power ? watts(c, s.power) : null;
    const plugged = s.plug ? c.st(s.plug)?.state === 'on' : null;
    const chOn = s.charger ? c.st(s.charger)?.state === 'on' : null;
    const charging = pw != null ? pw > 50 : !!chOn;
    const status = s.status ? c.fmt(s.status) : charging ? 'Charging' : plugged === false ? 'Not plugged in' : plugged ? 'Plugged in' : chOn === false ? 'Charger off' : 'Idle';
    c.$(p + 'soc').innerHTML = soc == null ? '–' : `${Math.round(soc)}<small>%</small>`;
    c.$(p + 'st').textContent = cap(String(status));
    const tgt = s.target ? num(c.st(s.target)?.state) : null;
    c.$(p + 'sub').textContent = tgt != null ? `Target ${Math.round(tgt)}%` : '';
    c.$(p + 'fill').style.width = clamp(soc ?? 0, 0, 100) + '%';
    c.$(p + 'bar').classList.toggle('chg', charging);
    const tk = c.$(p + 'tgt');
    tk.hidden = tgt == null;
    if (tgt != null) tk.style.left = clamp(tgt, 0, 100) + '%';
    if (c.$(p + 'power')) c.$(p + 'power').innerHTML = pw == null ? '–' : fmtW(pw).replace(/ (k?W)$/, ' <small>$1</small>');
    if (c.$(p + 'energy')) c.$(p + 'energy').innerHTML = valHtml(c, s.energy, 1);
    if (c.$(p + 'range')) c.$(p + 'range').innerHTML = valHtml(c, s.range, 0);
    if (c.$(p + 'sw')) {
      c.$(p + 'sw').setAttribute('aria-checked', String(!!chOn));
      c.$(p + 'cs').textContent = chOn ? 'On' : 'Off';
    }
    if (charging) ctx.chip('ev', chipHtml(s._k, { tint: 'var(--lime)', icon: 'mdi:ev-station', text: `Car charging${soc != null ? ' · ' + Math.round(soc) + '%' : ''}` }));
    return { sum: [cap(String(status)), soc != null ? `${Math.round(soc)}%` : null, charging && pw != null ? fmtW(pw) : null].filter(Boolean).join(' · ') };
  },
});

/* ---------------- network ---------------- */
def('network', {
  title: 'Network', icon: 'mdi:router-network', color: 'teal', desc: 'Internet up or down, speeds, devices online',
  norm: (s) => ({ ...s, entities: asItems(s.entities) }),
  has: (s) => !!(s.internet || s.download || s.entities.length),
  watch: (s) => ids(['internet', 'download', 'upload', 'ping', 'clients'].map((k) => s[k]).filter(Boolean), s.entities),
  body(c, s, p) {
    const stats = [['download', 'Download'], ['upload', 'Upload'], ['ping', 'Ping'], ['clients', 'Devices']].filter(([k]) => s[k]);
    return `${s.internet ? `<button class="net" id="${p}net" data-act="more" data-e="${esc(s.internet)}"><span class="nd"></span><div><b id="${p}ns"></b><span id="${p}nsub"></span></div></button>` : ''}
      ${stats.length ? `<div class="stats" style="grid-template-columns:repeat(${Math.min(stats.length, 4)},minmax(0,1fr))">${stats.map(([k, l]) => `<button class="stat" data-act="more" data-e="${esc(s[k])}"><div class="k">${l}</div><div class="v" id="${p}${k}">–</div></button>`).join('')}</div>` : ''}
      ${s.entities.length ? `<div class="lgrid cgrid" style="margin-top:10px">${s.entities.map((x, i) => tileHtml(c, s._k, x, p + 'x' + i)).join('')}</div>` : ''}`;
  },
  update(c, s, p, ctx) {
    let up = null;
    if (s.internet) {
      const st = c.st(s.internet);
      up = ['on', 'home', 'connected', 'online', 'true'].includes(st?.state);
      const el = c.$(p + 'net');
      el.classList.toggle('up', up);
      el.classList.toggle('down', !up);
      c.$(p + 'ns').textContent = up ? 'Online' : st?.state === 'unavailable' ? 'Unknown' : 'Offline';
      c.$(p + 'nsub').textContent = st ? `${up ? 'Up' : 'Down'} since ${timeStr(st.last_changed)} · ${ago(st.last_changed)}` : '';
      if (!up) ctx.chip('network', chipHtml(s._k, { cls: 'alarm', icon: 'mdi:wifi-off', text: 'Internet down' }), 50);
    }
    ['download', 'upload', 'ping', 'clients'].forEach((k) => s[k] && (c.$(p + k).innerHTML = valHtml(c, s[k], 0)));
    s.entities.forEach((x, i) => tileUpdate(c, x, p + 'x' + i));
    const dl = s.download ? num(c.st(s.download)?.state) : null;
    return { sum: [up == null ? null : up ? 'Online' : 'Offline', dl != null ? `${Math.round(dl)} ${c.st(s.download).attributes.unit_of_measurement || ''} down`.trim() : null].filter(Boolean).join(' · ') || `${s.entities.length} items`, badge: up === false ? ['DOWN', 'var(--red)'] : null };
  },
  act(c, a, el) {
    if (a === 'tile') tileAction(c, el);
  },
});

/* ---------------- doorbell ---------------- */
def('doorbell', {
  title: 'Doorbell', icon: 'mdi:doorbell-video', color: 'amber', desc: 'Who rang: snapshot, live view, open the gate',
  norm: (s) => ({ ...s, buttons: asItems(s.buttons) }),
  has: (s) => !!(s.camera || s.card),
  watch: (s) => ids([s.camera, s.ding].filter(Boolean), s.buttons),
  ringing(c, s) {
    const st = c.st(s.ding);
    if (!st) return false;
    if (dom(s.ding) === 'event') return Date.now() - new Date(st.state).getTime() < (s.ring_seconds ?? 60) * 1000;
    return st.state === 'on' || Date.now() - new Date(st.last_changed).getTime() < 5000 && st.state === 'on';
  },
  body(c, s, p) {
    const cam = { entity: s.camera, card: s.card, refresh: s.refresh ?? 5, _name: s.name || 'Front door' };
    s._cam = cam;
    return `<div class="ring-banner" id="${p}rb" hidden><ha-icon icon="mdi:bell-ring"></ha-icon><b>Someone is at the door</b><span id="${p}rt"></span></div>
      <div class="cams one">${camTileHtml(s._k, cam, p + 'c0')}</div>
      <div class="dbacts">${s.buttons.map((b, i) => `<button class="btn" data-act="dbtn" data-s="${s._k}" data-i="${i}"><ha-icon icon="${esc(b.icon || (dom(b.entity) === 'lock' ? 'mdi:lock-open-variant' : 'mdi:gate-open'))}"></ha-icon>${esc(c.nm(b))}</button>`).join('')}
        ${s.ding ? `<span class="ts" id="${p}last" style="align-self:center;margin-left:auto"></span>` : ''}</div>`;
  },
  update(c, s, p, ctx) {
    const ring = s.ding ? this.ringing(c, s) : false;
    c.$(p + 'rb').hidden = !ring;
    c.$(p + 'c0').classList.toggle('mot', ring);
    const st = c.st(s.ding);
    const last = st ? (dom(s.ding) === 'event' ? st.state : st.last_changed) : null;
    if (c.$(p + 'last')) c.$(p + 'last').textContent = last && !/unknown|unavailable/.test(last) ? `Last ring ${ago(last)}` : '';
    if (ring) {
      ctx.chip('doorbell', chipHtml(s._k, { cls: 'alarm', icon: 'mdi:bell-ring', text: 'Someone at the door' }), 90);
      if (s.open_on_ring !== false && !s._rang) {
        s._rang = true;
        c.go(s._k);
        camSnapshot(c, s._cam, p + 'c0', true);
      }
    } else s._rang = false;
    if (c.isOpen(s)) camSnapshot(c, s._cam, p + 'c0');
    return { sum: ring ? 'Ringing now' : last && !/unknown|unavailable/.test(last) ? `Last ring ${ago(last)}` : 'Quiet', badge: ring ? ['RING', 'var(--amber)'] : null };
  },
  act(c, a, el, s) {
    if (a === 'cam' && !el.classList.contains('big')) camOpen(c, s._cam, el.dataset.c);
    if (a === 'camclose') camClose(c, el.dataset.c);
    if (a === 'dbtn') {
      const b = s.buttons[+el.dataset.i];
      const d = dom(b.entity);
      if (d === 'button' || d === 'input_button') c.call(d, 'press', { entity_id: b.entity });
      else if (d === 'lock') c.call('lock', 'unlock', { entity_id: b.entity });
      else if (d === 'cover') c.call('cover', 'open_cover', { entity_id: b.entity });
      else if (d === 'script') c.call('script', 'turn_on', { entity_id: b.entity });
      else c.call('homeassistant', 'turn_on', { entity_id: b.entity });
    }
  },
  open(c, s, p) {
    camSnapshot(c, s._cam, p + 'c0', true);
  },
  close(c, s, p) {
    camClose(c, p + 'c0');
  },
  tick(c, s, p) {
    const el = c.$(p + 'c0t');
    if (el) el.textContent = clockStr();
    camSnapshot(c, s._cam, p + 'c0');
  },
});

/* ---------------- camera (any card, e.g. webrtc) ---------------- */
def('camera', {
  title: 'Camera', icon: 'mdi:cctv', color: 'red', desc: 'One camera, live, using any camera card you like',
  norm: (s) => ({ ...s }),
  has: (s) => !!(s.card || s.entity),
  watch: (s) => [s.entity].filter(Boolean),
  body: (c, s, p) => `<div class="slot camslot" id="${p}slot"><div class="ph169"><ha-icon icon="mdi:cctv"></ha-icon></div></div>`,
  update: (c, s) => ({ sum: s.subtitle || (c.isOpen(s) ? 'Live' : 'Tap to view live') }),
  open(c, s, p) {
    c.mount('camera:' + s._k, c.$(p + 'slot'), s.card || { type: 'picture-entity', entity: s.entity, camera_view: 'live', show_name: false, show_state: false });
    c.update();
  },
  close(c, s, p) {
    if (s.keep_alive === true) return;
    setTimeout(() => {
      if (c.isOpen(s)) return;
      c.unmount('camera:' + s._k);
      const slot = c.$(p + 'slot');
      if (slot) slot.innerHTML = `<div class="ph169"><ha-icon icon="mdi:cctv"></ha-icon></div>`;
      c.update();
    }, 500);
  },
});

/* ---------------- custom: your own name, icon, colour, any entities ---------------- */
def('custom', {
  title: 'My section', icon: 'mdi:view-grid-plus', color: 'amber', desc: 'Your own name, icon and colour with any entities',
  norm: (s) => ({ ...s, entities: asItems(s.entities) }),
  has: (s) => s.entities.length > 0 || !!s.card,
  watch: (s) => ids(s.entities),
  body: (c, s, p) => `${s.entities.length ? `<div class="lgrid cgrid"${s.columns ? ` style="grid-template-columns:repeat(${+s.columns},minmax(0,1fr))"` : ''}>${s.entities.map((x, i) => tileHtml(c, s._k, x, p + 'x' + i)).join('')}</div>` : ''}
    ${s.card ? `<div class="slot" id="${p}card" style="margin-top:${s.entities.length ? 12 : 0}px"></div>` : ''}`,
  update(c, s, p, ctx) {
    let on = 0;
    const vals = [];
    s.entities.forEach((x, i) => {
      if (tileUpdate(c, x, p + 'x' + i)) on++;
      if (['sensor', 'number', 'input_number'].includes(dom(x.entity)) && vals.length < 2) {
        const st = c.st(x.entity);
        if (st && num(st.state) != null) vals.push(`${st.state}${x.unit || st.attributes.unit_of_measurement ? ' ' + (x.unit || st.attributes.unit_of_measurement) : ''}`);
      }
    });
    if (on && s.chip !== false) ctx.chip('custom', chipHtml(s._k, { icon: s.icon || 'mdi:view-grid-plus', color: colorVar(s.color) || 'var(--amber)', b: on, text: `on · ${s.name || 'My section'}` }));
    return { sum: s.subtitle || [...vals, on ? `${on} on` : null].filter(Boolean).join(' · ') || `${s.entities.length} item${s.entities.length === 1 ? '' : 's'}` };
  },
  act(c, a, el) {
    if (a === 'tile') tileAction(c, el);
  },
  open(c, s, p) {
    if (s.card) c.mount('card:' + s._k, c.$(p + 'card'), s.card);
  },
});

/* Drawer order used when converting a v1 config. */
const LEGACY_ORDER = ['lights', 'climate', 'camera', 'apple_tv', 'geyser', 'amp'];
/* Turn a v1 config (top-level lights:, climate:, camera: …) into v2 sections. */
function legacySections(config) {
  const t = config.titles || {};
  const climates = asList(config.climate).filter((x) => x && (x.temperature || x.humidity));
  const motion = asItems(config.motion);
  const tv = typeof config.apple_tv === 'string' ? { entity: config.apple_tv } : config.apple_tv;
  const cam = typeof config.camera === 'string' ? { entity: config.camera } : config.camera;
  const amp = typeof config.amp === 'string' ? { entity: config.amp } : config.amp;
  const out = {
    lights: config.lights?.length ? { type: 'lights', id: 'lights', name: t.lights || 'Lights', entities: config.lights } : null,
    climate: climates.length || motion.length ? { type: 'climate', id: 'climate', name: t.climate || 'Climate and motion', icon: 'mdi:motion-sensor', color: 'cyan', sensors: climates, motion: config.motion } : null,
    camera: cam && (cam.card || cam.entity) ? { type: 'camera', id: 'camera', ...cam, name: t.camera || cam.name || 'Camera' } : null,
    apple_tv: tv && (tv.card || tv.entity) ? { type: 'media', id: 'apple_tv', name: t.apple_tv || tv.name || 'Apple TV', icon: tv.icon || 'mdi:television-play', entities: tv.entity ? [tv.entity] : [], remote_card: tv.card, apps: tv.apps, apps_position: tv.apps_position, apps_style: tv.apps_style, show_app_names: tv.show_app_names, room: tv.room, show_sources: !!tv.apps } : null,
    geyser: config.geyser?.switch ? { type: 'geyser', id: 'geyser', ...config.geyser, name: t.geyser || config.geyser.name || 'Geyser' } : null,
    amp: amp?.entity ? { type: 'amp', id: 'amp', ...amp, name: t.amp || amp.name || 'Amp' } : null,
  };
  return (config.order || LEGACY_ORDER).map((k) => out[k]).filter(Boolean);
}

/* ======================================================================
 * The card
 * ====================================================================== */
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
    const raw = Array.isArray(config.sections) ? config.sections : legacySections(config);
    const counts = {};
    c.sections = raw
      .filter((r) => r && typeof r === 'object' && r.hidden !== true)
      .map((r) => {
        const T = TYPES[r.type];
        if (!T) throw new Error(`Unknown section type "${r.type}". Use one of: ${Object.keys(TYPES).join(', ')}`);
        const s = T.norm({ ...r });
        s.type = r.type;
        counts[r.type] = (counts[r.type] || 0) + 1;
        s._id = String(r.id || (counts[r.type] > 1 ? `${r.type}_${counts[r.type]}` : r.type));
        s._empty = !T.has(s);
        return s;
      });
    c.sections.forEach((s, i) => (s._k = 's' + i));
    c.scenes = asItems(config.scenes);
    c.presence = asItems(config.presence);
    c.hide = new Set(asList(config.hide_chips));
    this._teardown();
    this._config = c;
    this._built = false;
    if (this._hass) this._build();
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    if (!this._config) return;
    if (!this._built) this._build();
    else if (this._changed(old)) this.update();
    for (const el of Object.values(this._children)) if (el && el !== 'pending') el.hass = hass;
  }

  get hass() {
    return this._hass;
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
    if (this._built) {
      this._startLive();
      this._config.sections.forEach((s) => this.isOpen(s) && TYPES[s.type].open?.(this, s, s._k + '-'));
    }
  }

  disconnectedCallback() {
    clearInterval(this._iv);
    this._config?.sections.forEach((s) => {
      TYPES[s.type].close?.(this, s, s._k + '-');
      TYPES[s.type].stop?.(this, s);
    });
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  static getConfigElement() {
    return document.createElement('ar-home-hub-card-editor');
  }

  static getStubConfig(hass) {
    return autoSetup(hass);
  }

  /* ---------- helpers used by the section types ---------- */
  st(id) {
    return id ? this._hass?.states[id] : undefined;
  }

  $(id) {
    return this.shadowRoot.getElementById(id);
  }

  call(domain, service, data) {
    return this._hass.callService(domain, service, data);
  }

  more(entityId) {
    if (!entityId) return;
    const ev = new Event('hass-more-info', { bubbles: true, composed: true });
    ev.detail = { entityId };
    this.dispatchEvent(ev);
  }

  nm(it) {
    if (!it) return '';
    return it.name || this.st(it.entity)?.attributes.friendly_name || it.entity;
  }

  fmt(id) {
    const s = this.st(id);
    if (!s) return '';
    try {
      if (this._hass.formatEntityState) return this._hass.formatEntityState(s);
    } catch (e) {}
    return s.state;
  }

  url(path) {
    return this._hass?.hassUrl ? this._hass.hassUrl(path) : path;
  }

  get hassObj() {
    return this._hass;
  }

  isOpen(s) {
    return !!this.shadowRoot.querySelector(`.drawer.open[data-k="${s._k}"]`);
  }

  _sec(k) {
    return this._config.sections.find((s) => s._k === k);
  }

  _watch() {
    const c = this._config;
    const e = new Set(['zone.home']);
    c.sections.forEach((s) => TYPES[s.type].watch(s).forEach((x) => x && e.add(x)));
    c.scenes.forEach((x) => e.add(x.entity));
    c.presence.forEach((x) => e.add(x.entity));
    return [...e];
  }

  _changed(old) {
    if (!old) return true;
    if (!this._watched) this._watched = this._watch();
    return this._watched.some((id) => old.states[id] !== this._hass.states[id]);
  }

  _storeKey() {
    return `ar-home-hub:${this._config.id || location.pathname}`;
  }

  _loadOpen() {
    const c = this._config;
    const byId = (v) => c.sections.find((s) => s._id === v || s.type === v || (v === 'apple_tv' && s.type === 'media'));
    try {
      const v = localStorage.getItem(this._storeKey());
      if (v === 'none') return null;
      const hit = v && byId(v);
      if (hit) return hit._k;
    } catch (e) {}
    if (c.default_open === false || c.default_open === 'none') return null;
    if (c.default_open) {
      const hit = byId(c.default_open);
      if (hit) return hit._k;
    }
    return c.sections[0]?._k || null;
  }

  _saveOpen(s) {
    try {
      localStorage.setItem(this._storeKey(), s ? s._id : 'none');
    } catch (e) {}
  }

  /* ---------- build ---------- */
  _build() {
    const c = this._config;
    this._built = true;
    this._greet = null;
    this._watched = this._watch();
    const open = this._loadOpen();
    const scenes = c.scenes
      .map((s, i) => {
        const p = SCENE_STYLES[s.style] || SCENE_STYLES[SCENE_ORDER[i % SCENE_ORDER.length]];
        const name = s.name || this.st(s.entity)?.attributes.friendly_name || s.entity;
        return `<button class="scene" data-act="scene" data-i="${i}" style="background:${esc(s.color || p.bg)};color:${esc(s.text_color || p.fg)}">
          <span class="si"><ha-icon icon="${esc(s.icon || 'mdi:palette')}"></ha-icon></span>
          <span class="n">${esc(name)}</span>${s.label ? `<span class="l">${esc(s.label)}</span>` : ''}</button>`;
      })
      .join('');
    const people = c.presence
      .map((x, i) => `<button class="pp" data-act="person" data-e="${esc(x.entity)}" id="pp${i}">${avatarHtml(this, x)}<span class="pt"><b>${esc(this.nm(x))}</b><span id="pps${i}"></span></span></button>`)
      .join('');
    this.shadowRoot.innerHTML = `<style>${STYLE}</style>
      <ha-card style="${c.max_width ? `--hub-max:${esc(c.max_width)}` : ''}">
        <div class="hero">
          <div class="hero-top">
            <div><h1 class="greet" id="greet"></h1>${c.subtitle === false ? '' : `<div class="sub">${esc(c.subtitle ?? 'A R Smart Home Automation')}</div>`}</div>
            ${c.clock === false ? '' : '<div class="clock"><strong id="time"></strong><span id="date"></span></div>'}
          </div>
          ${people ? `<div class="people">${people}</div>` : ''}
          <div class="chips" id="chips"></div>
          ${c.scenes.length ? `<div class="scenes" style="grid-template-columns:repeat(${Math.min(c.scenes.length, 4)},minmax(0,1fr))">${scenes}</div>` : ''}
        </div>
        ${c.sections.map((s) => this._drawer(s, s._k === open)).join('')}
        ${c.sections.length ? '' : '<div class="empty" style="border-top:1px solid var(--line)">No sections yet. Edit the card to add lights, security, climate, media and more.</div>'}
      </ha-card>`;
    this._wire();
    this._tick();
    this.update();
    this._startLive();
    if (open) this._onOpen(this._sec(open));
  }

  _drawer(s, open) {
    const T = TYPES[s.type];
    const col = colorVar(s.color) || `var(--${T.color})`;
    const p = s._k + '-';
    let body;
    try {
      body = s._empty ? `<div class="empty">Pick entities for this section in the card editor.</div>` : T.body(this, s, p);
    } catch (e) {
      body = `<div class="err">This section could not be drawn: ${esc(e.message)}</div>`;
      s._broken = true;
    }
    return `<section class="drawer${open ? ' open' : ''}" data-k="${s._k}" style="--c:${col}">
      <button class="dh" data-act="drawer" data-s="${s._k}" aria-expanded="${open}">
        <span class="ico"><ha-icon icon="${esc(s.icon || T.icon)}"></ha-icon></span>
        <span class="t"><span class="tt">${esc(s.name || T.title)}</span><span class="ts" id="${p}sum"></span></span>
        <span class="badge" id="${p}badge"></span>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </button>
      <div class="db"><div><div class="inner">${body}</div></div></div>
    </section>`;
  }

  /* ---------- events ---------- */
  _wire() {
    const r = this.shadowRoot;
    r.addEventListener('click', (e) => {
      if (this._held) {
        this._held = false;
        e.preventDefault();
        return;
      }
      const b = e.target.closest('[data-act]');
      if (b && b.tagName !== 'INPUT') this._act(b.dataset.act, b);
    });
    r.addEventListener('keydown', (e) => {
      const t = e.target;
      if ((e.key === 'Enter' || e.key === ' ') && t.getAttribute?.('role') === 'button') {
        e.preventDefault();
        t.click();
      }
    });
    r.addEventListener('change', (e) => {
      const t = e.target;
      if (t.dataset?.act === 'mvol') this._act('mvol', t);
    });
    r.addEventListener('input', (e) => {
      const t = e.target;
      if (t.dataset?.act === 'mvol') this._act('mvolin', t);
    });
    /* press and hold any entity for its more-info dialog */
    const cancel = () => clearTimeout(this._holdT);
    r.addEventListener('pointerdown', (e) => {
      const el = e.target.closest('[data-e]');
      if (!el || e.target.closest('input,.knob') || el.dataset.act === 'more') return;
      this._held = false;
      cancel();
      this._holdT = setTimeout(() => {
        this._held = true;
        this.more(el.dataset.e);
      }, 550);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => r.addEventListener(ev, cancel, true));
    r.addEventListener('contextmenu', (e) => e.target.closest('[data-e]') && e.preventDefault());
    this._config.sections.forEach((s) => !s._empty && TYPES[s.type].wire?.(this, s, s._k + '-'));
  }

  _act(a, el) {
    const c = this._config;
    switch (a) {
      case 'drawer':
        return this._toggle(el.dataset.s);
      case 'go':
        return this.go(el.dataset.s, true);
      case 'more':
        return this.more(el.dataset.e);
      case 'toggle':
        if (el.classList.contains('lt')) el.classList.toggle('on');
        return this.call('homeassistant', 'toggle', { entity_id: el.dataset.e });
      case 'person': {
        const sec = c.sections.find((s) => s.type === 'presence' && !s._empty);
        return sec ? this.go(sec._k, true) : this.more(el.dataset.e);
      }
      case 'scene': {
        const s = c.scenes[+el.dataset.i];
        const d = dom(s.entity);
        if (d === 'script') this.call('script', 'turn_on', { entity_id: s.entity });
        else if (d === 'scene') this.call('scene', 'turn_on', { entity_id: s.entity });
        else if (d === 'automation') this.call('automation', 'trigger', { entity_id: s.entity });
        else if (d === 'button' || d === 'input_button') this.call(d, 'press', { entity_id: s.entity });
        else this.call('homeassistant', 'turn_on', { entity_id: s.entity });
        el.classList.remove('run');
        void el.offsetWidth;
        el.classList.add('run');
        return;
      }
    }
    const s = this._sec(el.dataset.s);
    if (!s) return;
    const T = TYPES[s.type];
    if (a === 'tile') return tileAction(this, el);
    T.act?.(this, a, el, s);
  }

  go(k, flash) {
    const d = this.shadowRoot.querySelector(`.drawer[data-k="${k}"]`);
    if (!d) return;
    if (!d.classList.contains('open')) this._toggle(k);
    if (flash) {
      d.classList.remove('flash');
      void d.offsetWidth;
      d.classList.add('flash');
      d.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  _toggle(k) {
    const r = this.shadowRoot;
    const d = r.querySelector(`.drawer[data-k="${k}"]`);
    if (!d) return;
    const opening = !d.classList.contains('open');
    if (this._config.multi_open !== true) {
      r.querySelectorAll('.drawer.open').forEach((x) => {
        if (x === d) return;
        x.classList.remove('open');
        x.querySelector('.dh').setAttribute('aria-expanded', 'false');
        this._onClose(this._sec(x.dataset.k));
      });
    }
    d.classList.toggle('open', opening);
    d.querySelector('.dh').setAttribute('aria-expanded', String(opening));
    const s = this._sec(k);
    if (opening) this._onOpen(s);
    else this._onClose(s);
    this._saveOpen(opening ? s : null);
  }

  _onOpen(s) {
    if (!s || s._empty) return;
    TYPES[s.type].open?.(this, s, s._k + '-');
  }

  _onClose(s) {
    if (!s || s._empty) return;
    TYPES[s.type].close?.(this, s, s._k + '-');
  }

  _startLive() {
    this._config.sections.forEach((s) => !s._empty && TYPES[s.type].start?.(this, s));
  }

  /* ---------- embedded cards (camera, remote, custom card) ---------- */
  async mount(key, slot, cfg) {
    if (!slot || !cfg || this._children[key]) return;
    this._children[key] = 'pending';
    let helpers;
    try {
      helpers = await window.loadCardHelpers();
    } catch (e) {
      delete this._children[key];
      return;
    }
    if (this._children[key] !== 'pending') return;
    const make = () => {
      const el = helpers.createCardElement(cfg);
      el.hass = this._hass;
      el.addEventListener('ll-rebuild', (ev) => {
        ev.stopPropagation();
        if (this._children[key] !== el) return;
        const n = make();
        el.replaceWith(n);
        this._children[key] = n;
      });
      return el;
    };
    const el = make();
    slot.innerHTML = '';
    slot.appendChild(el);
    this._children[key] = el;
  }

  unmount(key) {
    const el = this._children[key];
    delete this._children[key];
    if (el && el !== 'pending') el.remove();
  }

  _teardown() {
    for (const k of Object.keys(this._children)) this.unmount(k);
    this._children = {};
    this._camLive = null;
    (this._config?.sections || []).forEach((s) => {
      try {
        TYPES[s.type]?.close?.(this, s, s._k + '-');
        TYPES[s.type]?.stop?.(this, s);
      } catch (e) {}
    });
  }

  /* ---------- live update ---------- */
  _tick() {
    if (!this._built) return;
    const c = this._config;
    const d = new Date();
    const lang = this._hass?.locale?.language || navigator.language || 'en';
    const h = d.getHours();
    const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const name = c.name ?? (this._hass?.user?.name || '').split(' ')[0];
    const greet = c.greeting ? esc(c.greeting) : name ? `${part}, <b>${esc(name)}</b>` : part;
    if (this._greet !== greet && this.$('greet')) this.$('greet').innerHTML = this._greet = greet;
    if (this.$('time')) {
      this.$('time').textContent = d.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
      this.$('date').textContent = d.toLocaleDateString(lang, { weekday: 'short', day: 'numeric', month: 'short' });
    }
    c.sections.forEach((s) => {
      if (s._empty || s._broken) return;
      const T = TYPES[s.type];
      if (T.tick && (this.isOpen(s) || s.type === 'media')) {
        try {
          T.tick(this, s, s._k + '-');
        } catch (e) {}
      }
    });
    if (++this._ticks % 30 === 0) this.update();
  }

  update() {
    if (!this._built || !this._hass) return;
    const c = this._config;
    const chips = [];
    let order = 0;
    const ctxFor = (s) => ({
      chip: (key, html, pri = 0) => {
        if (s?.chips === false || c.hide.has(key)) return;
        chips.push({ html, pri, o: order++ });
      },
    });
    c.sections.forEach((s) => {
      if (s._empty || s._broken) return;
      const p = s._k + '-';
      try {
        const r = TYPES[s.type].update(this, s, p, ctxFor(s)) || {};
        const sum = this.$(p + 'sum');
        if (sum) sum.textContent = s.subtitle && s.type !== 'custom' ? s.subtitle : r.sum || '';
        const b = this.$(p + 'badge');
        if (b) {
          b.textContent = r.badge?.[0] || '';
          b.style.setProperty('--bc', r.badge?.[1] || 'var(--red)');
        }
      } catch (e) {
        const sum = this.$(p + 'sum');
        if (sum) sum.textContent = `Error: ${e.message}`;
        console.warn('ar-home-hub-card', s.type, e);
      }
    });
    /* who's home strip */
    if (c.presence.length) {
      let home = 0;
      c.presence.forEach((x, i) => {
        const [cls, word] = presenceState(this.st(x.entity));
        if (cls === 'home') home++;
        const el = this.$('pp' + i);
        if (el) {
          el.className = 'pp ' + cls;
          this.$('pps' + i).textContent = word;
        }
      });
      const sec = c.sections.find((s) => s.type === 'presence');
      ctxFor(null).chip('people', chipHtml(sec?._k || '', { tint: 'var(--teal)', icon: 'mdi:home-account', b: home, text: 'home' }), 1);
    }
    this.shadowRoot.querySelectorAll('.scene').forEach((b, i) => b.classList.toggle('running', this.st(c.scenes[i]?.entity)?.state === 'on'));
    chips.sort((a, b) => b.pri - a.pri || a.o - b.o);
    const max = c.max_chips ?? 12;
    const chipEl = this.$('chips');
    const html = c.chips === false ? '' : chips.slice(0, max).map((x) => x.html).join('');
    if (chipEl && chipEl._last !== html) chipEl.innerHTML = chipEl._last = html;
  }
}

/* ======================================================================
 * Auto-setup: scan the house and build a starter layout
 * ====================================================================== */
function autoSetup(hass) {
  const S = hass?.states || {};
  const all = Object.keys(S);
  if (!all.length) return { sections: [{ type: 'lights', entities: [] }] };
  const by = (...d) => all.filter((e) => d.includes(dom(e)));
  const dc = (e) => S[e].attributes.device_class;
  const like = (r, list) => list.filter((e) => r.test(e) || r.test(S[e].attributes.friendly_name || ''));
  const skip = /phone|pixel|iphone|ipad|watch|_sm_|galaxy|tablet|laptop|macbook/i;
  const sections = [];
  const persons = by('person');
  const lights = by('light').filter((e) => !S[e].attributes.entity_id).slice(0, 12);
  const lightSw = like(/light|lamp|downlight/i, by('switch')).slice(0, 12 - lights.length);
  if (lights.length || lightSw.length) sections.push({ type: 'lights', name: 'Lights', entities: [...lights, ...lightSw] });
  const alarm = by('alarm_control_panel')[0];
  const cams = by('camera').slice(0, 6);
  const contacts = by('binary_sensor').filter((e) => ['door', 'window', 'garage_door', 'opening'].includes(dc(e))).slice(0, 10);
  const locks = by('lock');
  if (alarm || cams.length || contacts.length || locks.length)
    sections.push({ type: 'security', name: 'Security', ...(alarm ? { alarm } : {}), ...(cams.length ? { cameras: cams } : {}), ...(contacts.length ? { contacts } : {}), ...(locks.length ? { locks } : {}) });
  const climates = by('climate');
  const indoor = (e) => !/outdoor|outside|cpu|battery|inverter|geyser|weather|ambient_out|garden|pool|fridge|freezer/i.test(e) && !skip.test(e);
  const temp = by('sensor').find((e) => dc(e) === 'temperature' && indoor(e));
  const hum = by('sensor').find((e) => dc(e) === 'humidity' && indoor(e));
  if (climates.length || temp)
    sections.push({ type: 'climate', name: 'Climate', ...(climates.length ? { entities: climates } : {}), ...(temp || hum ? { sensors: [{ ...(temp ? { temperature: temp } : {}), ...(hum ? { humidity: hum } : {}) }] } : {}) });
  const media = by('media_player').filter((e) => !skip.test(e)).slice(0, 4);
  if (media.length) {
    const m = { type: 'media', name: 'TV & audio', entities: media };
    /* Apple TV with Firemote installed: put the remote back under it, like v1 */
    if (customElements.get('firemote-card')) {
      const remotes = by('remote');
      const tv = media.find((e) => S[e].attributes.app_id || /apple|atv/i.test(e) || remotes.some((r) => e.split('.')[1].startsWith(r.split('.')[1])));
      const rem = tv && remotes.find((r) => tv.split('.')[1].startsWith(r.split('.')[1]));
      if (tv) m.remote_card = { type: 'custom:firemote-card', entity: tv, device_family: 'apple-tv', ...(rem ? { apple_tv_remote_entity: rem } : {}) };
    }
    sections.push(m);
  }
  const power = by('sensor').filter((e) => dc(e) === 'power');
  const solar = like(/\bpv|solar/i, power)[0];
  if (solar) {
    const soc = by('sensor').find((e) => dc(e) === 'battery' && /battery_soc|soc|bms|inverter|battery_level|battery_capacity/i.test(e) && !skip.test(e));
    const e = { type: 'energy', name: 'Solar & power', solar };
    const grid = like(/grid/i, power)[0];
    const load = like(/load|consumption|house/i, power).find((x) => x !== solar);
    const bp = like(/battery/i, power)[0];
    if (grid) e.grid = grid;
    if (load) e.load = load;
    if (bp) e.battery_power = bp;
    if (soc) e.battery_soc = soc;
    const lss = like(/load_?shedding.*stage/i, by('sensor'))[0];
    const lsa = like(/load_?shedding.*(area|schedule)/i, by('sensor'))[0];
    if (lss) e.loadshedding_stage = lss;
    if (lsa) e.loadshedding_area = lsa;
    sections.push(e);
  }
  const covers = by('cover');
  if (covers.length) sections.push({ type: 'covers', name: 'Gate & blinds', entities: covers.slice(0, 8) });
  const motion = by('binary_sensor').filter((e) => ['motion', 'occupancy'].includes(dc(e))).slice(0, 8);
  if (motion.length) sections.push({ type: 'motion', name: 'Motion', entities: motion });
  const cam = cams.find((e) => /door|bell/i.test(e));
  const ding = like(/ding|doorbell|ring/i, by('binary_sensor', 'event'))[0];
  if (cam && ding) sections.push({ type: 'doorbell', name: 'Doorbell', camera: cam, ding });
  if (persons.length) sections.push({ type: 'presence', name: "Who's home", entities: persons });
  const weather = by('weather')[0];
  if (weather) sections.push({ type: 'weather', name: 'Weather', entity: weather });
  const zones = like(/irrigation|sprinkler|zone_\d|lawn/i, by('switch', 'valve'));
  if (zones.length) sections.push({ type: 'irrigation', name: 'Irrigation', zones: zones.slice(0, 8) });
  const geyser = like(/geyser|water_heater|boiler/i, by('switch'))[0];
  if (geyser) {
    const g = { type: 'geyser', name: 'Geyser', switch: geyser };
    const gp = like(/geyser|boiler/i, power)[0];
    if (gp) g.power = gp;
    sections.push(g);
  }
  const charger = like(/ev_?charg|wallbox|charger/i, by('switch'))[0];
  if (charger) sections.push({ type: 'ev', name: 'EV charger', charger });
  const internet = by('binary_sensor').find((e) => dc(e) === 'connectivity' && /internet|wan|online/i.test(e));
  const dl = like(/speedtest.*download|download_speed/i, by('sensor'))[0];
  if (internet || dl) sections.push({ type: 'network', name: 'Network', ...(internet ? { internet } : {}), ...(dl ? { download: dl } : {}) });
  return { presence: persons, sections };
}

/* ======================================================================
 * Visual editor
 * ====================================================================== */
const RF = { name: { k: 'name', t: 'text', l: 'Show as' }, room: { k: 'room', t: 'text', l: 'Room label' }, icon: { k: 'icon', t: 'icon', l: 'Icon' } };
const rf = (f) => (typeof f === 'string' ? RF[f] : f);
const EF = (k, l, d, extra = {}) => ({ k, t: 'entity', l, d, ...extra });
const LF = (k, l, d, fields = [], extra = {}) => ({ k, t: 'list', l, d, f: fields.map(rf), ...extra });
const SCHEMA = {
  lights: [LF('entities', 'Lights', ['light', 'switch', 'input_boolean'], ['name', 'room', 'icon']), { k: 'columns', t: 'number', l: 'Columns (default 3)' }],
  security: [
    EF('alarm', 'Alarm panel', ['alarm_control_panel']),
    LF('cameras', 'Cameras', ['camera'], ['name', EF('motion', 'Motion sensor (glows on motion)', ['binary_sensor'])]),
    LF('contacts', 'Doors & windows', ['binary_sensor'], ['name', 'icon']),
    LF('locks', 'Locks', ['lock'], ['name']),
  ],
  climate: [
    LF('entities', 'Air conditioners and thermostats', ['climate'], ['name']),
    LF('sensors', 'Room temperature and humidity', null, [{ k: 'name', t: 'text', l: 'Room' }, EF('temperature', 'Temperature', ['sensor']), EF('humidity', 'Humidity', ['sensor'])], { noEntity: true }),
    LF('motion', 'Motion (small rows)', ['binary_sensor'], ['name']),
  ],
  motion: [LF('entities', 'Motion sensors', ['binary_sensor'], ['name', 'icon']), { k: 'history', t: 'bool', l: 'Show the 24-hour activity strip', def: true }],
  presence: [LF('entities', 'People', ['person', 'device_tracker'], ['name', EF('battery', 'Phone battery (optional)', ['sensor'])])],
  media: [
    LF('entities', 'TVs and speakers', ['media_player'], ['name', 'room']),
    { k: 'remote_card', t: 'yaml', l: 'Remote card (e.g. type: custom:firemote-card)' },
    { k: 'player', t: 'select', l: 'Layout', o: [['', 'Automatic (remote first when a remote card is set)'], ['compact', 'Remote first: small now-playing strip'], ['full', 'Big player with controls and volume']] },
    LF('apps', 'App / source buttons (blank = the TV\'s own source list)', null, [{ k: 'name', t: 'text', l: 'Label' }, { k: 'source', t: 'source', l: 'Source / app to open' }, { k: 'image', t: 'image', l: 'Logo' }, RF.icon, { k: 'color', t: 'text', l: 'Colour (e.g. #e50914)' }], { noEntity: true }),
    { k: 'apps_style', t: 'select', l: 'App button style', o: [['', 'Logo tiles'], ['chips', 'Text chips']] },
    { k: 'apps_position', t: 'select', l: 'App buttons', o: [['', 'Under the remote'], ['top', 'Above the remote']] },
    { k: 'show_app_names', t: 'bool', l: 'Show names under the logos', def: true },
  ],
  covers: [LF('entities', 'Gates, garage doors, blinds, curtains', ['cover', 'button', 'switch', 'script', 'lock', 'input_button'], ['name', 'icon', { k: 'kind', t: 'select', l: 'Style', o: [['', 'Automatic'], ['gate', 'Gate / garage (one button)'], ['blind', 'Blind (up, stop, down)'], ['pulse', 'Push button']] }])],
  energy: [
    EF('solar', 'Solar power now', ['sensor']), EF('load', 'House load now', ['sensor']), EF('grid', 'Grid power now', ['sensor']),
    { k: 'grid_invert', t: 'bool', l: 'My grid sensor is negative when importing' },
    EF('battery_power', 'Battery power now', ['sensor']), { k: 'battery_invert', t: 'bool', l: 'My battery sensor is positive when discharging (Sunsynk, Deye)' },
    EF('battery_soc', 'Battery %', ['sensor']), { k: 'battery_capacity', t: 'number', l: 'Battery size in kWh (for hours left)' },
    EF('loadshedding_stage', 'Load-shedding stage', ['sensor']), EF('loadshedding_area', 'Load-shedding area / schedule', ['sensor', 'calendar', 'binary_sensor']),
    EF('solar_today', 'Solar today (kWh)', ['sensor']), EF('load_today', 'Used today (kWh)', ['sensor']), EF('grid_today', 'Bought from grid today (kWh)', ['sensor']),
  ],
  water: [EF('tank', 'Tank level %', ['sensor']), { k: 'tank_name', t: 'text', l: 'Tank name (e.g. JoJo tank)' }, EF('usage', 'Water used today', ['sensor']), LF('switches', 'Pumps and valves', ['switch', 'valve', 'input_boolean'], ['name'])],
  geyser: [
    EF('switch', 'Geyser switch', ['switch', 'input_boolean']), { k: 'switch_name', t: 'text', l: 'Switch name' }, EF('power', 'Power', ['sensor']), EF('current', 'Current', ['sensor']),
    EF('voltage', 'Voltage', ['sensor']), EF('energy_day', 'Energy today', ['sensor']), EF('energy_month', 'Energy this month', ['sensor']), EF('temperature', 'Water temperature', ['sensor']),
    { k: 'load_threshold', t: 'number', l: 'Counts as heating above (W)' },
  ],
  amp: [EF('entity', 'Amplifier', ['media_player']), { k: 'step', t: 'number', l: 'Volume step for − / +' }],
  weather: [EF('entity', 'Weather', ['weather']), { k: 'days', t: 'number', l: 'Days of forecast (default 5)' }],
  irrigation: [
    LF('zones', 'Zones', ['switch', 'valve', 'input_boolean'], ['name', EF('remaining', 'Time left (optional)', ['sensor'])]),
    EF('next_run', 'Next run', ['sensor', 'input_datetime']), EF('rain_delay', 'Rain delay', ['switch', 'input_boolean']), EF('master', 'Controller on / off', ['switch', 'input_boolean']),
  ],
  appliances: [LF('entities', 'Appliances (status sensor or switch)', null, ['name', 'icon', EF('remaining', 'Time left', ['sensor']), EF('power', 'Power', ['sensor']), EF('switch', 'Power switch', ['switch'])])],
  ev: [
    EF('charger', 'Charger switch', ['switch', 'input_boolean']), EF('power', 'Charging power', ['sensor']), EF('battery', 'Car battery %', ['sensor']), EF('range', 'Range', ['sensor']),
    EF('plug', 'Plugged in', ['binary_sensor']), EF('target', 'Charge target %', ['number', 'sensor', 'input_number']), EF('energy', 'Energy this session', ['sensor']), { k: 'car_name', t: 'text', l: 'Car name' },
  ],
  network: [
    EF('internet', 'Internet online', ['binary_sensor']), EF('download', 'Download speed', ['sensor']), EF('upload', 'Upload speed', ['sensor']), EF('ping', 'Ping', ['sensor']),
    EF('clients', 'Devices online', ['sensor']), LF('entities', 'Other tiles (router switch, restart button…)', null, ['name', 'icon']),
  ],
  doorbell: [EF('camera', 'Doorbell camera', ['camera']), EF('ding', 'Ring sensor or event', ['binary_sensor', 'event']), LF('buttons', 'Buttons (open gate, unlock…)', ['button', 'lock', 'cover', 'switch', 'script', 'input_button'], ['name', 'icon']), { k: 'open_on_ring', t: 'bool', l: 'Open this drawer when it rings', def: true }],
  camera: [EF('entity', 'Camera', ['camera']), { k: 'card', t: 'yaml', l: 'Or any camera card (e.g. type: custom:webrtc-camera)' }],
  custom: [LF('entities', 'Entities: anything, shown by its type', null, ['name', 'icon']), { k: 'columns', t: 'number', l: 'Columns (default 3)' }],
};
const COMMON = [
  { k: 'name', t: 'text', l: 'Section name' },
  { k: 'icon', t: 'icon', l: 'Icon' },
  { k: 'color', t: 'select', l: 'Colour', o: [['', 'Default'], ...Object.keys(PALETTE).map((x) => [x, cap(x)])], custom: true },
  { k: 'chips', t: 'bool', l: 'Show its chips at the top', def: true },
];
const COMMON_APPS = ['Netflix', 'YouTube', 'DStv', 'Showmax', 'Prime Video', 'Disney+', 'Apple TV', 'Apple Music', 'Spotify', 'Plex', 'Twitch', 'SABC Plus', 'Kodi', 'Settings'];
const CHIP_KEYS = [['people', 'People home'], ['lights', 'Lights on'], ['alarm', 'Alarm state'], ['doors', 'Open doors & windows'], ['locks', 'Unlocked locks'], ['temperature', 'Temperature'], ['humidity', 'Humidity'], ['ac', 'AC running'], ['motion', 'Motion'], ['media', 'Now playing'], ['solar', 'Solar power'], ['battery', 'Battery low'], ['loadshedding', 'Load-shedding'], ['covers', 'Gate / garage open'], ['geyser', 'Geyser heating'], ['weather', 'Weather'], ['irrigation', 'Watering'], ['appliances', 'Appliances running'], ['ev', 'Car charging'], ['network', 'Internet down'], ['doorbell', 'Doorbell'], ['custom', 'Custom sections']];
const HEADER = [
  { k: 'name', t: 'text', l: 'Name in the greeting (blank = logged-in user)' },
  { k: 'subtitle', t: 'text', l: 'Line under the greeting' },
  { k: 'presence', t: 'people', l: "Who's home strip (people)" },
  { k: 'hide_chips', t: 'multi', l: 'Hide these chips at the top', o: CHIP_KEYS },
  { k: 'max_width', t: 'text', l: 'Max width (e.g. 560px)' },
];
const SCENE_FIELDS = [RF.name, { k: 'label', t: 'text', l: 'Small label' }, RF.icon, { k: 'style', t: 'select', l: 'Colour', o: [['', 'Auto'], ['night', 'Night'], ['morning', 'Morning'], ['away', 'Away'], ['dusk', 'Dusk']] }];

const ED_STYLE = `
:host{display:block}
.box{border:1px solid var(--divider-color,#3334);border-radius:12px;margin-bottom:12px;background:var(--card-background-color)}
.bh{display:flex;align-items:center;gap:10px;padding:10px 12px;cursor:pointer;user-select:none}
.bh .ic{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:var(--c);background:color-mix(in srgb,var(--c) 18%,transparent);flex:none}
.bh .tx{flex:1;min-width:0}
.bh b{display:block;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bh small{color:var(--secondary-text-color);font-size:12px}
.bb{padding:4px 12px 12px;display:flex;flex-direction:column;gap:10px}
.ib{appearance:none;border:0;background:none;color:var(--secondary-text-color);cursor:pointer;width:32px;height:32px;border-radius:50%;display:grid;place-items:center;flex:none}
.ib:hover{background:var(--secondary-background-color)}
.ib:disabled{opacity:.3;cursor:default}
.ib.del:hover{color:var(--error-color,#db4437)}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.list{border:1px dashed var(--divider-color,#3335);border-radius:10px;padding:8px;display:flex;flex-direction:column;gap:8px}
.list>label{font-size:12px;font-weight:600;color:var(--secondary-text-color);text-transform:uppercase;letter-spacing:.06em}
.row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px;align-items:start;background:var(--secondary-background-color);border-radius:10px;padding:8px}
.row .fs{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:6px}
.row .fs>:first-child{grid-column:1/-1}
.row .tools{display:flex;flex-direction:column}
.add{appearance:none;border:1px dashed var(--primary-color);color:var(--primary-color);background:none;border-radius:10px;padding:8px 12px;font:inherit;font-weight:600;cursor:pointer}
.bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.bar select{flex:1;min-width:160px;padding:10px;border-radius:8px;border:1px solid var(--divider-color,#3336);background:var(--card-background-color);color:var(--primary-text-color);font:inherit}
.pbtn{appearance:none;border:0;border-radius:8px;padding:10px 14px;font:inherit;font-weight:600;cursor:pointer;background:var(--primary-color);color:var(--text-primary-color,#fff)}
.pbtn.ghost{background:none;color:var(--primary-color);border:1px solid var(--primary-color)}
.pbtn.warn{background:var(--warning-color,#ff9800)}
.imgf{grid-column:1/-1;display:flex;gap:12px;align-items:center;border:1px dashed var(--divider-color,#3336);border-radius:10px;padding:8px}
.imgf.drop{border-color:var(--primary-color);background:color-mix(in srgb,var(--primary-color) 10%,transparent)}
.imgf .thumb{width:56px;height:56px;border-radius:14px;flex:none;display:grid;place-items:center;overflow:hidden;background:var(--card-background-color);border:1px solid var(--divider-color,#3336);color:var(--secondary-text-color)}
.imgf .thumb img{width:100%;height:100%;object-fit:cover}
.imgt{min-width:0;display:flex;flex-direction:column;gap:2px}
.imgt b{font-size:13px}
.imgt span{font-size:12px;color:var(--secondary-text-color)}
.imgb{display:flex;gap:6px;margin-top:4px}
.pbtn.sm{padding:6px 10px;font-size:12.5px}
.note{font-size:12.5px;color:var(--secondary-text-color);line-height:1.5;margin:0}
.banner{border-radius:12px;padding:12px;background:color-mix(in srgb,var(--primary-color) 12%,transparent);display:flex;flex-direction:column;gap:8px;margin-bottom:12px}
h3{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--secondary-text-color);margin:18px 2px 8px}
.fb label{display:block;font-size:12px;color:var(--secondary-text-color);margin:0 0 3px 2px}
.fb input,.fb select,.fb textarea{width:100%;box-sizing:border-box;padding:9px 10px;border-radius:8px;border:1px solid var(--divider-color,#3336);background:var(--card-background-color);color:var(--primary-text-color);font:inherit}
.fb textarea{min-height:70px;font-family:monospace;font-size:12px}
.chk{display:flex;gap:8px;align-items:center;font-size:14px}
.multi{display:flex;flex-wrap:wrap;gap:6px}
.multi label{display:flex;gap:5px;align-items:center;font-size:12.5px;border:1px solid var(--divider-color,#3336);border-radius:99px;padding:4px 10px;cursor:pointer}
`;

const clone = (x) => JSON.parse(JSON.stringify(x ?? null));
const blank = (v) => v === '' || v == null || (Array.isArray(v) && !v.length) || (typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length);
const compactItem = (x) => {
  if (typeof x !== 'object' || !x) return x;
  const o = {};
  Object.entries(x).forEach(([k, v]) => !blank(v) && (o[k] = v));
  const keys = Object.keys(o);
  return keys.length === 1 && keys[0] === 'entity' ? o.entity : o;
};

const h3el = (t) => {
  const e = document.createElement('h3');
  e.textContent = t;
  return e;
};

/* Shrink a picked image to a square logo (transparent padding, keeps PNG transparency). */
async function squareLogo(file, size) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((ok, bad) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => bad(new Error('That file is not an image the browser can read.'));
      i.src = url;
    });
    const cv = document.createElement('canvas');
    cv.width = cv.height = size;
    const g = cv.getContext('2d');
    const w = img.naturalWidth || size;
    const h = img.naturalHeight || size;
    const k = Math.min(size / w, size / h);
    g.imageSmoothingQuality = 'high';
    g.drawImage(img, (size - w * k) / 2, (size - h * k) / 2, w * k, h * k);
    return cv;
  } finally {
    URL.revokeObjectURL(url);
  }
}
/* Store the logo in Home Assistant's image store; fall back to embedding it in the card config. */
async function storeLogo(hass, file) {
  const cv = await squareLogo(file, 256);
  try {
    const blob = await new Promise((r) => cv.toBlob(r, 'image/png'));
    const fd = new FormData();
    fd.append('file', blob, (file.name || 'logo').replace(/\.[^.]+$/, '') + '.png');
    const res = await hass.fetchWithAuth('/api/image/upload', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('upload ' + res.status);
    const j = await res.json();
    if (!j.id) throw new Error('no id');
    return { url: `/api/image/serve/${j.id}/original`, how: 'Saved in Home Assistant' };
  } catch (e) {
    const small = await squareLogo(file, 160);
    let data = small.toDataURL('image/webp', 0.88);
    if (!data.startsWith('data:image/webp')) data = small.toDataURL('image/png');
    return { url: data, how: 'Saved inside the card' };
  }
}

async function loadHaPickers() {
  if (customElements.get('ha-selector')) return true;
  try {
    const h = await window.loadCardHelpers?.();
    if (h) {
      for (const cfg of [{ type: 'tile', entity: 'sun.sun' }, { type: 'entities', entities: [] }]) {
        try {
          const c = await h.createCardElement(cfg);
          await c.constructor.getConfigElement?.();
        } catch (e) {}
        if (customElements.get('ha-selector')) break;
      }
    }
  } catch (e) {}
  if (!customElements.get('ha-selector')) await Promise.race([customElements.whenDefined('ha-selector'), new Promise((r) => setTimeout(r, 2500))]);
  return !!customElements.get('ha-selector');
}

class ArHomeHubCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._exp = new Set();
    this._sels = [];
    this._ready = false;
  }

  set hass(h) {
    this._hass = h;
    this._sels.forEach((el) => (el.hass = h));
    if (!this._hadHass && h) {
      this._hadHass = true;
      this._render();
    }
  }

  setConfig(config) {
    const json = JSON.stringify(config);
    if (json === this._lastSent) return;
    this._cfg = clone(config) || {};
    this._legacy = !Array.isArray(this._cfg.sections) && LEGACY_ORDER.some((k) => this._cfg[k]) ;
    this._render();
  }

  async connectedCallback() {
    if (this._ready) return;
    this._ha = await loadHaPickers();
    this._ready = true;
    this._render();
  }

  _emit(rerender) {
    const out = clone(this._cfg);
    if (Array.isArray(out.sections))
      out.sections = out.sections.map((s) => {
        const o = {};
        Object.entries(s).forEach(([k, v]) => {
          if (Array.isArray(v)) v = v.map(compactItem).filter((x) => !blank(x));
          if (!blank(v)) o[k] = v;
        });
        return o;
      });
    ['presence', 'hide_chips'].forEach((k) => blank(out[k]) && delete out[k]);
    if (Array.isArray(out.scenes)) {
      out.scenes = out.scenes.map(compactItem).filter((x) => !blank(x));
      if (!out.scenes.length) delete out.scenes;
    }
    ['name', 'subtitle', 'max_width'].forEach((k) => out[k] === '' && delete out[k]);
    this._lastSent = JSON.stringify(out);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: out }, bubbles: true, composed: true }));
    if (rerender) this._render();
  }

  /* ---------- field widgets ---------- */
  _selector(f) {
    switch (f.t) {
      case 'entity':
        return { entity: f.d ? { filter: { domain: f.d } } : {} };
      case 'people':
        return { entity: { multiple: true, filter: { domain: ['person', 'device_tracker'] } } };
      case 'text':
        return { text: {} };
      case 'number':
        return { number: { mode: 'box', min: 0, step: 'any' } };
      case 'bool':
        return { boolean: {} };
      case 'icon':
        return { icon: {} };
      case 'select':
        return { select: { mode: 'dropdown', custom_value: !!f.custom, options: f.o.map(([value, label]) => ({ value, label })) } };
      case 'multi':
        return { select: { multiple: true, mode: 'list', options: f.o.map(([value, label]) => ({ value, label })) } };
      case 'yaml':
        return { object: {} };
    }
  }

  _imageField(obj, f, onChange) {
    const w = document.createElement('div');
    w.className = 'imgf';
    const draw = (msg) => {
      const v = obj[f.k];
      w.innerHTML = `<div class="thumb">${v ? `<img alt="" src="${esc(this._hass?.hassUrl ? this._hass.hassUrl(v) : v)}">` : '<ha-icon icon="mdi:image-plus"></ha-icon>'}</div>
        <div class="imgt"><b>${esc(f.l)}</b><span>${esc(msg || (v ? 'Tap Change to pick another, or drop a picture here' : 'Upload a picture or drop one here. PNG with a clear background looks best'))}</span>
        <div class="imgb"><button type="button" class="pbtn ghost sm" data-up>${v ? 'Change' : 'Upload logo'}</button>${v ? '<button type="button" class="pbtn ghost sm" data-rm>Remove</button>' : ''}</div></div>
        <input type="file" accept="image/*" hidden>`;
    };
    const take = async (file) => {
      if (!file) return;
      draw('Uploading…');
      try {
        const r = await storeLogo(this._hass, file);
        obj[f.k] = r.url;
        draw(r.how);
        onChange ? onChange() : this._emit();
      } catch (e) {
        draw(e.message);
      }
    };
    w.addEventListener('click', (e) => {
      if (e.target.closest('[data-up]')) w.querySelector('input').click();
      if (e.target.closest('[data-rm]')) {
        delete obj[f.k];
        draw();
        onChange ? onChange() : this._emit();
      }
    });
    w.addEventListener('change', (e) => e.target.type === 'file' && take(e.target.files[0]));
    w.addEventListener('dragover', (e) => {
      e.preventDefault();
      w.classList.add('drop');
    });
    w.addEventListener('dragleave', () => w.classList.remove('drop'));
    w.addEventListener('drop', (e) => {
      e.preventDefault();
      w.classList.remove('drop');
      take(e.dataTransfer.files[0]);
    });
    draw();
    return w;
  }

  _field(obj, f, onChange) {
    if (f.t === 'image') return this._imageField(obj, f, onChange);
    const val = obj[f.k] ?? (f.t === 'bool' ? f.def ?? false : f.t === 'multi' || f.t === 'people' ? [] : '');
    const set = (v) => {
      if (f.t === 'people' || f.t === 'multi') v = asList(v);
      if (f.t === 'bool' && f.def === true && v === true) delete obj[f.k];
      else if (blank(v)) delete obj[f.k];
      else obj[f.k] = v;
      onChange ? onChange() : this._emit();
    };
    const shown = f.t === 'people' ? asList(val).map((x) => (typeof x === 'string' ? x : x.entity)) : val;
    if (this._ha) {
      const el = document.createElement('ha-selector');
      el.hass = this._hass;
      el.selector = this._selector(f);
      el.value = shown;
      el.label = f.l;
      el.required = false;
      el.addEventListener('value-changed', (e) => {
        e.stopPropagation();
        set(e.detail.value);
      });
      this._sels.push(el);
      return el;
    }
    /* plain fallback when HA's pickers are not available */
    const w = document.createElement('div');
    w.className = 'fb';
    if (f.t === 'bool') {
      w.innerHTML = `<label class="chk"><input type="checkbox"${val ? ' checked' : ''}> ${esc(f.l)}</label>`;
      w.querySelector('input').addEventListener('change', (e) => set(e.target.checked));
      return w;
    }
    if (f.t === 'multi') {
      w.innerHTML = `<label>${esc(f.l)}</label><div class="multi">${f.o.map(([v, l]) => `<label><input type="checkbox" value="${esc(v)}"${val.includes(v) ? ' checked' : ''}>${esc(l)}</label>`).join('')}</div>`;
      w.addEventListener('change', () => set([...w.querySelectorAll('input:checked')].map((i) => i.value)));
      return w;
    }
    if (f.t === 'select' && f.custom) {
      const id = 'dl-' + Math.random().toString(36).slice(2);
      w.innerHTML = `<label>${esc(f.l)}</label><input list="${id}" type="text"><datalist id="${id}">${f.o.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('')}</datalist>`;
      const inp = w.querySelector('input');
      inp.value = val;
      inp.addEventListener('change', () => set(inp.value.trim()));
      return w;
    }
    if (f.t === 'select') {
      w.innerHTML = `<label>${esc(f.l)}</label><select>${f.o.map(([v, l]) => `<option value="${esc(v)}"${v === val ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
      w.querySelector('select').addEventListener('change', (e) => set(e.target.value));
      return w;
    }
    if (f.t === 'yaml') {
      w.innerHTML = `<label>${esc(f.l)} (JSON here, or use the code editor)</label><textarea></textarea>`;
      const ta = w.querySelector('textarea');
      ta.value = blank(val) ? '' : JSON.stringify(val, null, 1);
      ta.addEventListener('change', () => {
        try {
          set(ta.value.trim() ? JSON.parse(ta.value) : '');
          ta.style.borderColor = '';
        } catch (e) {
          ta.style.borderColor = 'var(--error-color,red)';
        }
      });
      return w;
    }
    const listId = f.t === 'entity' || f.t === 'people' ? this._datalist(f.t === 'people' ? ['person', 'device_tracker'] : f.d) : '';
    w.innerHTML = `<label>${esc(f.l)}</label><input${listId ? ` list="${listId}"` : ''} type="${f.t === 'number' ? 'number' : 'text'}">`;
    const inp = w.querySelector('input');
    inp.value = Array.isArray(shown) ? shown.join(', ') : shown;
    inp.addEventListener('change', () => {
      let v = inp.value.trim();
      if (f.t === 'number') v = v === '' ? '' : +v;
      if (f.t === 'people') v = v.split(/[,\s]+/).filter(Boolean);
      set(v);
    });
    return w;
  }

  _datalist(domains) {
    const id = 'dl-' + (domains || ['all']).join('-');
    if (!this.shadowRoot.getElementById(id)) {
      const dl = document.createElement('datalist');
      dl.id = id;
      dl.innerHTML = Object.keys(this._hass?.states || {})
        .filter((e) => !domains || domains.includes(dom(e)))
        .sort()
        .map((e) => `<option value="${e}">${esc(this._hass.states[e].attributes.friendly_name || '')}</option>`)
        .join('');
      this.shadowRoot.appendChild(dl);
      this._dl = true;
    }
    return id;
  }

  _btn(icon, title, fn, cls = '', disabled = false) {
    const b = document.createElement('button');
    b.className = 'ib ' + cls;
    b.title = title;
    b.setAttribute('aria-label', title);
    b.disabled = disabled;
    b.innerHTML = `<ha-icon icon="${icon}"></ha-icon>`;
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      fn();
    });
    return b;
  }

  _list(owner, f) {
    const wrap = document.createElement('div');
    wrap.className = 'list';
    wrap.innerHTML = `<label>${esc(f.l)}</label>`;
    let items = asList(owner[f.k]).map((x) => (typeof x === 'string' ? { entity: x } : x));
    owner[f.k] = items;
    items.forEach((it, i) => {
      const row = document.createElement('div');
      row.className = 'row';
      const fs = document.createElement('div');
      fs.className = 'fs';
      if (!f.noEntity) fs.appendChild(this._field(it, { k: 'entity', t: 'entity', l: 'Entity', d: f.d }));
      f.f.forEach((sub) => {
        if (sub.t !== 'source') return fs.appendChild(this._field(it, sub));
        /* drop-down of the sources Home Assistant reports for this section's TVs; typing still allowed */
        const found = this._sources(owner);
        const common = COMMON_APPS.filter((x) => !found.some((y) => y.toLowerCase() === x.toLowerCase()));
        const opts = [...(it.source && !found.includes(it.source) && !common.includes(it.source) ? [[it.source, it.source]] : []), ...found.map((x) => [x, x]), ...common.map((x) => [x, found.length ? `${x} (common app)` : x])];
        fs.appendChild(
          this._field(it, { ...sub, t: 'select', custom: true, l: found.length ? sub.l : `${sub.l} (TV hasn't reported its apps: showing common ones, or type one)`, o: opts }, () => {
            if (it.source && !it.name) it.name = it.source;
            this._emit(true);
          })
        );
      });
      const tools = document.createElement('div');
      tools.className = 'tools';
      const move = (d) => {
        const j = i + d;
        [items[i], items[j]] = [items[j], items[i]];
        this._emit(true);
      };
      tools.append(
        this._btn('mdi:arrow-up', 'Move up', () => move(-1), '', i === 0),
        this._btn('mdi:arrow-down', 'Move down', () => move(1), '', i === items.length - 1),
        this._btn('mdi:close', 'Remove', () => {
          items.splice(i, 1);
          this._emit(true);
        }, 'del')
      );
      row.append(fs, tools);
      wrap.appendChild(row);
    });
    const found = f.f.some((x) => x.t === 'source') ? this._sources(owner).filter((x) => !items.some((it) => it.source === x)) : [];
    if (found.length) {
      const all = document.createElement('button');
      all.className = 'add';
      all.textContent = `+ Add buttons for all ${found.length} apps and sources the TV reports`;
      all.addEventListener('click', () => {
        found.forEach((x) => items.push({ name: x, source: x }));
        this._emit(true);
      });
      wrap.appendChild(all);
    }
    const add = document.createElement('button');
    add.className = 'add';
    add.textContent = '+ Add';
    add.addEventListener('click', () => {
      items.push(f.noEntity ? {} : { entity: '' });
      this._render();
    });
    wrap.appendChild(add);
    return wrap;
  }

  /* Sources the TVs in this section report now, or reported last time they were on (from history). */
  _sources(owner) {
    const out = [];
    const ids = asList(owner?.entities || owner?.entity).map((e) => (typeof e === 'string' ? e : e?.entity)).filter(Boolean);
    ids.forEach((id) => {
      const live = this._hass?.states[id]?.attributes.source_list;
      (live?.length ? live : this._srcCache?.[id] || []).forEach((x) => !out.includes(x) && out.push(x));
      if (!live?.length) this._srcHistory(id);
    });
    return out;
  }

  async _srcHistory(id) {
    this._srcCache = this._srcCache || {};
    this._srcBusy = this._srcBusy || {};
    if (id in this._srcCache || this._srcBusy[id] || !this._hass?.callWS) return;
    this._srcBusy[id] = true;
    let list = [];
    try {
      const end = new Date();
      const r = await this._hass.callWS({ type: 'history/history_during_period', start_time: new Date(end - 7 * 864e5).toISOString(), end_time: end.toISOString(), entity_ids: [id], minimal_response: false, no_attributes: false, significant_changes_only: false });
      const rows = r?.[id] || [];
      for (let i = rows.length - 1; i >= 0 && !list.length; i--) list = (rows[i].a || rows[i].attributes || {}).source_list || [];
    } catch (e) {}
    this._srcCache[id] = list;
    this._srcBusy[id] = false;
    if (list.length) this._render();
  }

  _fieldsInto(box, owner, fields) {
    let pair = null;
    fields.forEach((f) => {
      if (f.t === 'list') {
        pair = null;
        return box.appendChild(this._list(owner, f));
      }
      const el = this._field(owner, f);
      if (['entity', 'text', 'number', 'icon', 'select'].includes(f.t)) {
        if (!pair) {
          pair = document.createElement('div');
          pair.className = 'grid2';
          box.appendChild(pair);
        }
        pair.appendChild(el);
        if (pair.children.length === 2) pair = null;
      } else {
        pair = null;
        box.appendChild(el);
      }
    });
  }

  /* ---------- page ---------- */
  _render() {
    if (!this._cfg || !this._ready) return;
    this._sels = [];
    const r = this.shadowRoot;
    r.innerHTML = `<style>${ED_STYLE}</style>`;
    const cfg = this._cfg;
    if (this._legacy) {
      const b = document.createElement('div');
      b.className = 'banner';
      b.innerHTML = `<p class="note"><b>This card uses the older layout.</b> It keeps working as it is. Convert it to sections to add security, climate, media, solar, people and your own custom sections from here.</p>`;
      const go = document.createElement('button');
      go.className = 'pbtn';
      go.textContent = 'Convert to sections';
      go.addEventListener('click', () => {
        const secs = legacySections(cfg);
        LEGACY_ORDER.concat(['motion', 'order', 'titles']).forEach((k) => delete cfg[k]);
        cfg.sections = secs.map((s) => {
          const o = { ...s };
          delete o.id;
          if (o.type === 'media' && !o.apps) delete o.show_sources;
          Object.keys(o).forEach((k) => o[k] === undefined && delete o[k]);
          return o;
        });
        this._legacy = false;
        this._emit(true);
      });
      b.appendChild(go);
      r.appendChild(b);
      return;
    }
    cfg.sections = cfg.sections || [];

    /* header */
    r.appendChild(h3el('Top of the card'));
    const hb = document.createElement('div');
    hb.className = 'box';
    hb.innerHTML = `<div class="bb"></div>`;
    this._fieldsInto(hb.firstChild, cfg, HEADER);
    hb.firstChild.appendChild(this._list(cfg, { k: 'scenes', t: 'list', l: 'Scene buttons', d: ['script', 'scene', 'automation', 'button', 'input_button'], f: SCENE_FIELDS }));
    r.appendChild(hb);

    /* sections */
    r.appendChild(h3el('Sections'));
    cfg.sections.forEach((s, i) => {
      const T = TYPES[s.type] || TYPES.custom;
      const box = document.createElement('div');
      box.className = 'box';
      const open = this._exp.has(i);
      const head = document.createElement('div');
      head.className = 'bh';
      const col = colorVar(s.color) || PALETTE[T.color];
      head.innerHTML = `<span class="ic" style="--c:${esc(col)}"><ha-icon icon="${esc(s.icon || T.icon)}"></ha-icon></span><span class="tx"><b>${esc(s.name || T.title)}</b><small>${esc(T.title)} · ${esc(s.type)}</small></span>`;
      const move = (d) => {
        const j = i + d;
        [cfg.sections[i], cfg.sections[j]] = [cfg.sections[j], cfg.sections[i]];
        const a = this._exp.has(i);
        const b = this._exp.has(j);
        this._exp.delete(i);
        this._exp.delete(j);
        if (a) this._exp.add(j);
        if (b) this._exp.add(i);
        this._emit(true);
      };
      head.append(
        this._btn('mdi:arrow-up', 'Move up', () => move(-1), '', i === 0),
        this._btn('mdi:arrow-down', 'Move down', () => move(1), '', i === cfg.sections.length - 1),
        this._btn('mdi:delete-outline', 'Remove section', () => {
          if (this._confirmDel !== i) {
            this._confirmDel = i;
            return this._render();
          }
          cfg.sections.splice(i, 1);
          this._exp = new Set([...this._exp].filter((x) => x !== i).map((x) => (x > i ? x - 1 : x)));
          this._confirmDel = null;
          this._emit(true);
        }, 'del'),
        this._btn(open ? 'mdi:chevron-up' : 'mdi:chevron-down', open ? 'Collapse' : 'Edit', () => toggle())
      );
      const toggle = () => {
        open ? this._exp.delete(i) : this._exp.add(i);
        this._render();
      };
      head.addEventListener('click', toggle);
      box.appendChild(head);
      if (this._confirmDel === i) {
        const cb = document.createElement('div');
        cb.className = 'bb';
        cb.innerHTML = `<p class="note">Remove “${esc(s.name || T.title)}”? Tap the bin again to confirm.</p>`;
        box.appendChild(cb);
      }
      if (open) {
        const body = document.createElement('div');
        body.className = 'bb';
        this._fieldsInto(body, s, [...COMMON.slice(0, 3), ...(SCHEMA[s.type] || [])]);
        body.appendChild(this._field(s, COMMON[3]));
        box.appendChild(body);
      }
      r.appendChild(box);
    });

    /* add + scan */
    const add = document.createElement('div');
    add.className = 'bar';
    add.innerHTML = `<select aria-label="Section type">${Object.values(TYPES)
      .map((T) => `<option value="${T.key}">${esc(T.title)} — ${esc(T.desc)}</option>`)
      .join('')}</select>`;
    const ab = document.createElement('button');
    ab.className = 'pbtn';
    ab.textContent = 'Add section';
    ab.addEventListener('click', () => {
      const type = add.querySelector('select').value;
      cfg.sections.push({ type, name: type === 'custom' ? 'My section' : TYPES[type].title });
      this._exp.add(cfg.sections.length - 1);
      this._emit(true);
    });
    add.appendChild(ab);
    r.appendChild(add);

    r.appendChild(h3el('Quick start'));
    const scan = document.createElement('div');
    scan.className = 'banner';
    if (this._scanAsk) {
      scan.innerHTML = `<p class="note">This replaces your sections and the who's-home strip with what it finds in this home. Your header text and scenes stay.</p>`;
      const bar = document.createElement('div');
      bar.className = 'bar';
      const yes = document.createElement('button');
      yes.className = 'pbtn warn';
      yes.textContent = 'Yes, replace my sections';
      yes.addEventListener('click', () => {
        const found = autoSetup(this._hass);
        cfg.sections = found.sections;
        if (found.presence?.length) cfg.presence = found.presence;
        this._exp = new Set();
        this._scanAsk = false;
        this._emit(true);
      });
      const no = document.createElement('button');
      no.className = 'pbtn ghost';
      no.textContent = 'Cancel';
      no.addEventListener('click', () => {
        this._scanAsk = false;
        this._render();
      });
      bar.append(yes, no);
      scan.appendChild(bar);
    } else {
      scan.innerHTML = `<p class="note">Scan this Home Assistant for lights, people, alarm, cameras, doors, ACs, TVs, solar, covers, motion, weather and more, and build the sections for you. You can then rename, reorder or delete anything.</p>`;
      const b = document.createElement('button');
      b.className = 'pbtn ghost';
      b.textContent = 'Scan my home';
      b.addEventListener('click', () => {
        if (!cfg.sections.length) {
          const found = autoSetup(this._hass);
          cfg.sections = found.sections;
          if (found.presence?.length && !cfg.presence?.length) cfg.presence = found.presence;
          return this._emit(true);
        }
        this._scanAsk = true;
        this._render();
      });
      scan.appendChild(b);
    }
    r.appendChild(scan);
  }
}

customElements.define('ar-home-hub-card', ArHomeHubCard);
customElements.define('ar-home-hub-card-editor', ArHomeHubCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'ar-home-hub-card',
  name: 'AR Home Hub Card',
  description: 'Whole-house card: who is home, lights, security, climate, media, solar and load-shedding, covers, motion, weather and your own custom sections in collapsible drawers.',
  preview: true,
  documentationURL: 'https://github.com/marsh4200',
});
console.info(`%c AR-HOME-HUB-CARD %c v${AR_HUB_VERSION} `, 'background:#0d121c;color:#ffc35a;font-weight:700', 'background:#ffc35a;color:#0d121c');
