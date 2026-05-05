// solar-arc-card.js v4r168

const MDI = {
  generator:   'M6 3C4.89 3 4 3.9 4 5V16H6V17C6 17.55 6.45 18 7 18H8C8.55 18 9 17.55 9 17V16H15V17C15 17.55 15.45 18 16 18H17C17.55 18 18 17.55 18 17V16H20V5C20 3.9 19.11 3 18 3H6M12 7V5H18V7H12M12 9H18V11H12V9M8 5V9H10L7 15V11H5L8 5M22 20V22H2V20H22Z',
  tower:       'M8.28,5.45L6.5,4.55L7.76,2H16.23L17.5,4.55L15.72,5.44L15,4H9L8.28,5.45M18.62,8H14.09L13.3,5H10.7L9.91,8H5.38L4.1,10.55L5.89,11.44L6.62,10H17.38L18.1,11.45L19.89,10.56L18.62,8M17.77,22H15.7L15.46,21.1L12,15.9L8.53,21.1L8.3,22H6.23L9.12,11H11.19L10.83,12.35L12,14.1L13.16,12.35L12.81,11H14.88L17.77,22M11.4,15L10.5,13.65L9.32,18.13L11.4,15M14.68,18.12L13.5,13.64L12.6,15L14.68,18.12Z',
  home:        'M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z',
  sunriseUp:   'M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,16.3L15.82,19.41C16.21,19.8 16.21,20.43 15.82,20.82C15.43,21.21 14.8,21.21 14.41,20.82L12,18.41L9.59,20.82C9.2,21.21 8.57,21.21 8.18,20.82C7.79,20.43 7.79,19.8 8.18,19.41L11.29,16.3C11.5,16.1 11.74,16 12,16C12.26,16 12.5,16.1 12.71,16.3Z',
  sunsetDown:  'M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,12A3,3 0 0,0 12,9A3,3 0 0,0 9,12H15M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.05,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M12.71,20.71L15.82,17.6C16.21,17.21 16.21,16.57 15.82,16.18C15.43,15.79 14.8,15.79 14.41,16.18L12,18.59L9.59,16.18C9.2,15.79 8.57,15.79 8.18,16.18C7.79,16.57 7.79,17.21 8.18,17.6L11.29,20.71C11.5,20.9 11.74,21 12,21C12.26,21 12.5,20.9 12.71,20.71Z',
  batteryCharging: 'M15.67,4H14V2H10V4H8.33C7.6,4 7,4.6 7,5.33V20.67C7,21.4 7.6,22 8.33,22H15.67C16.4,22 17,21.4 17,20.67V5.33C17,4.6 16.4,4 15.67,4M11,17V13.5H9L13,7V10.5H15L11,17Z',
};

const R  = 35;
const RR = 38;   // INV ring radius (těsně u node r=35)
const GR = 57;

class SolarArcCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._timer = null;
    this._built = false;
  }

  connectedCallback()    { this._timer = setInterval(() => this._tickSun(), 60000); }
  disconnectedCallback() { clearInterval(this._timer); }

  setConfig(config) {
    const arc        = config.arc    || {};
    const sankey     = config.sankey || {};
    const arcStyle   = arc.style    || {};
    const skStyle    = sankey.style || {};

    this._config = {
      // ── Arc entity ────────────────────────────────────────────────────────
      pv_entity:    arc.solar_production  || config.solar_production  || config.pv_entity    || 'sensor.goodwe_pv_power',
      house_entity: arc.house_consumption || config.house_consumption || config.house_entity || 'sensor.goodwe_house_consumption',
      grid_entity:  arc.grid_power        || config.grid_power        || config.grid_entity  || 'sensor.goodwe_active_power',
      sun_entity:   arc.sun_entity        || config.sun_entity        || 'sun.sun',

      // ── Arc sekce ─────────────────────────────────────────────────────────
      arc_show:            arc.arc_show            !== false,
      arc_title_show:      arc.arc_title_show       !== false,
      arc_title_icon_show: arc.arc_title_icon_show  !== false,
      arc_title_text:      arc.arc_title_text       || 'Aktuální stav',

      // ── Arc style (z arc.style, fallback na arc přímé pro zpět. kompatibilitu)
      arc_title_icon:       arcStyle.arc_title_icon       || arc.arc_title_icon       || 'mdi:flash',
      arc_title_icon_color: arcStyle.arc_title_icon_color || arc.arc_title_icon_color || '',
      arc_title_text_color: arcStyle.arc_title_text_color || arc.arc_title_text_color || '',
      arc_text_color:       arcStyle.arc_text_color       || '',
      arc_icon_color:       arcStyle.arc_icon_color       || '',
      arc_grid_color:       arcStyle.arc_grid_color       || '',
      arc_inactive_color:   arcStyle.arc_inactive_color   || '',
      arc_inverter_color:   arcStyle.arc_inverter_color   || '',
      arc_home_color:       arcStyle.arc_home_color       || '',
      arc_sun_flow_color:   arcStyle.arc_sun_flow_color   || '',
      arc_moon_flow_color:  arcStyle.arc_moon_flow_color  || '',

      // ── Flow style + count ────────────────────────────────────────────────
      arc_flow_style:      arc.flow_style       || 'oval',   // 'oval' | 'laser'
      arc_flow_count_slow: arc.flow_count_slow  ?? arc.flow_ovals_slow ?? 4,
      arc_flow_count_fast: arc.flow_count_fast  ?? arc.flow_ovals_fast ?? 2,

      // ── Grid sign convention ─────────────────────────────────────────────
      grid_power_inverted: !!(arc.grid_power_inverted),

      // ── Battery ───────────────────────────────────────────────────────────
      battery_entity:               arc.battery_power || '',
      battery_show:                 !!(arc.battery_power || arc.battery),
      arc_battery_discharge_color:  arcStyle.arc_battery_discharge_color || '',
      arc_battery_charge_color:     arcStyle.arc_battery_charge_color    || '',

      // ── Sankey sekce ──────────────────────────────────────────────────────
      sankey_show:            sankey.sankey_show           !== false,
      sankey_title_show:      sankey.sankey_title_show      !== false,
      sankey_title_icon_show: sankey.sankey_title_icon_show !== false,
      sankey_title_text:      sankey.sankey_title_text      || 'Tok energie',
      sections:               sankey.sections || config.sections || null,
      sankey_layout:          sankey.layout   || 'horizontal',

      // ── Sankey style ──────────────────────────────────────────────────────
      sankey_title_icon:            skStyle.sankey_title_icon       || sankey.sankey_title_icon       || 'mdi:lightning-bolt',
      sankey_title_icon_color:      skStyle.sankey_title_icon_color || sankey.sankey_title_icon_color || '',
      sankey_title_text_color:      skStyle.sankey_title_text_color || sankey.sankey_title_text_color || '',
      sankey_text_color_primary:    skStyle.sankey_text_color_primary   || '',
      sankey_text_color_secondary:  skStyle.sankey_text_color_secondary || '',

      // ── Legacy sk_* (zpětná kompatibilita) ───────────────────────────────
      sk_grid:   config.sk_grid   || null,
      sk_export: config.sk_export || null,
      sk_l1:     config.sk_l1     || null,
      sk_l2:     config.sk_l2     || null,
      sk_l3:     config.sk_l3     || null,
      sk_inv:    config.sk_inv    || null,
      sk_pc:     config.sk_pc     || null,
      sk_tv:     config.sk_tv     || null,
    };
    this._built = false;
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._built) { this._buildDOM(); this._built = true; }

    // Spustit _updateDOM jen pokud se změnily naše entity —
    // hass setter se volá při každé změně stavu v celém HA (i nesouvisejících entit).
    const pv    = hass.states[this._config.pv_entity]?.state;
    const house = hass.states[this._config.house_entity]?.state;
    const grid  = hass.states[this._config.grid_entity]?.state;
    const bat   = this._config.battery_entity ? (hass.states[this._config.battery_entity]?.state ?? '') : '';
    const sun   = hass.states[this._config.sun_entity]?.last_updated;
    const skSig = this._config.sections
      ? this._config.sections.flatMap(s =>
          (s.entities || []).map(e => hass.states[e.entity_id]?.state ?? '')
        ).join(',')
      : ['sk_grid','sk_export','sk_l1','sk_l2','sk_l3','sk_inv','sk_pc','sk_tv']
          .map(k => this._config[k] ? (hass.states[this._config[k]]?.state ?? '') : '')
          .join(',');

    if (pv === this._lpv && house === this._lhse &&
        grid === this._lgrd && bat === this._lbat &&
        sun === this._lsun && skSig === this._lsk) return;

    this._lpv  = pv;
    this._lhse = house;
    this._lgrd = grid;
    this._lbat = bat;
    this._lsun = sun;
    this._lsk  = skSig;

    // Throttle: max 1 render za 500 ms (stejný princip jako ha-sankey-chart)
    const now = Date.now();
    if (now - (this._lastRender || 0) < 500) {
      clearTimeout(this._renderTimer);
      this._renderTimer = setTimeout(() => this._updateDOM(), 500);
      return;
    }
    this._lastRender = now;
    this._updateDOM();
  }

  getCardSize() { return 4; }

  static getConfigElement() { return document.createElement('solar-arc-card-editor'); }

  static getStubConfig() {
    return { arc: {}, sankey: {} };
  }

  _val(id)  { return parseFloat(this._hass?.states[id]?.state ?? 0) || 0; }

  _fmt(w) {
    const a = Math.abs(w);
    return a >= 1000 ? `${(a / 1000).toFixed(1)} kW` : `${Math.round(a)} W`;
  }

  _fmtTime(ms, tz) {
    try {
      return new Date(ms).toLocaleTimeString('cs-CZ', {
        hour: '2-digit', minute: '2-digit', timeZone: tz || 'Europe/Prague',
      });
    } catch { return ''; }
  }

  _isDay() {
    // Použít elevation místo state — elevation se aktualizuje okamžitě,
    // zatímco state 'above_horizon' může laggovat až ~2 minuty za skutečným západem/východem.
    const attrs = this._hass?.states[this._config.sun_entity]?.attributes;
    if (attrs?.elevation != null) return attrs.elevation > 0;
    return this._hass?.states[this._config.sun_entity]?.state === 'above_horizon';
  }

  _getSunT() {
    if (!this._isDay()) return -1;
    const { next_rising, next_setting } = this._hass.states[this._config.sun_entity].attributes;
    const now      = Date.now();
    const risingMs = new Date(next_rising).getTime() - 86400000; // dnešní východ
    let   settingMs = new Date(next_setting).getTime();
    // Guard: HA přepne next_setting na zítřejší západ dříve než změní state →
    // pokud je západ >20h v budoucnosti, přeskočil na zítřek → odečíst 24h.
    if (settingMs - now > 72000000) settingMs -= 86400000;
    return Math.max(0, Math.min(1, (now - risingMs) / (settingMs - risingMs)));
  }

  _getNightT() {
    if (this._isDay()) return -1;
    const { next_rising, next_setting } = this._hass.states[this._config.sun_entity].attributes;
    const now      = Date.now();
    let   risingMs = new Date(next_rising).getTime();
    const settingMs = new Date(next_setting).getTime() - 86400000; // včerejší západ
    // Guard: symetricky u východu — pokud next_rising přeskočilo na pozítří, odečíst 24h.
    if (risingMs - now > 72000000) risingMs -= 86400000;
    if (risingMs <= settingMs) return 0;
    return Math.max(0, Math.min(1, (now - settingMs) / (risingMs - settingMs)));
  }

  _qp(t, p0, p1, p2) {
    const u = 1 - t;
    return [u*u*p0[0]+2*u*t*p1[0]+t*t*p2[0], u*u*p0[1]+2*u*t*p1[1]+t*t*p2[1]];
  }

  _arcLen(t, p0, p1, p2) {
    if (t <= 0) return 0;
    let len = 0, prev = [...p0];
    for (let i = 1; i <= 80; i++) {
      const pt = this._qp(i/80*t, p0, p1, p2);
      len += Math.hypot(pt[0]-prev[0], pt[1]-prev[1]);
      prev = pt;
    }
    return len;
  }

  // Returns particle speed in px/s for a given wattage
  _speed(w) {
    const a = Math.abs(w) || 0;
    if (a <  200) return  15;
    if (a <  400) return  30;
    if (a <  600) return  55;
    if (a <  800) return  85;
    if (a < 1000) return 120;
    // above 1000 W: linear 120 → 550 px/s at 9000 W
    return 120 + 430 * (Math.min(a, 9000) - 1000) / 8000;
  }

  // Animation duration for a path of given length (px) at wattage w
  _dur(w, pathLen = 220) {
    return pathLen / this._speed(w);
  }

  _sunIntensity(pv) {
    if (pv >= 6000) return { opacity: 1.00, rOuter: 28, rMid: 17, rCore: 9 };
    if (pv >= 3000) return { opacity: 0.78, rOuter: 22, rMid: 13, rCore: 8 };
    return              { opacity: 0.55, rOuter: 16, rMid: 10, rCore: 7 };
  }
  _f(n)   { return n.toFixed(1); }

  // INV near arc center, GRD/HSE at bottom — wider spread matches battery layout
  static get L() {
    return {
      A0:  [30, 73], A1: [200, 5], A2: [370, 73],
      INV: [200, 245],
      GRD: [52,  175],   // wider: was 70
      HSE: [348, 175],   // wider: was 330
    };
  }

  // Orthogonal paths: přímka → 90° oblouček (r=13) → přímka
  // Non-battery layout:
  //   INV=[200,245] ring R=38 → bottom exits (195,282.7)/(205,282.7)
  //   GRD=[52,175]  R=35 → bottom (52,210) — gutter y=313
  //   HSE=[348,175] R=35 → bottom (348,210) — gutter y=313
  static get P() {
    return {
      toGrid:   'M195,282.7 L195,300 Q195,313 182,313 L65,313 Q52,313 52,300 L52,210',
      fromGrid: 'M52,210 L52,300 Q52,313 65,313 L182,313 Q195,313 195,300 L195,282.7',
      toHouse:  'M205,282.7 L205,300 Q205,313 218,313 L335,313 Q348,313 348,300 L348,210',
    };
  }

  // Battery layout — node positions (wider spread, battery on left)
  //   INV=[200,215] ring R=38 → left-center (162,215), bottom exits (195,253)/(205,253)
  //   GRD=[52,155]  R=35 → bottom-center (52,190)
  //   BAT=[52,295]  R=35 → bottom-center (52,330)
  //   HSE=[348,215] R=35 → bottom-center (348,250)
  static get LB() {
    return {
      A0:  [30, 73], A1: [200, 5], A2: [370, 73],
      INV: [200, 215],
      GRD: [52,  155],
      BAT: [52,  295],
      HSE: [348, 215],
    };
  }

  // Battery layout paths (orthogonal, corner r=13)
  //   grid:    GRD bottom → ↓ → corner right → INV left-center
  //   battery: BAT bottom → ↓ → gutter y=348 → INV bottom-left
  //   house:   INV bottom-right → ↓ → gutter y=348 → HSE bottom
  static get PB() {
    return {
      toGrid:   'M162,215 L65,215 Q52,215 52,202 L52,190',
      fromGrid: 'M52,190 L52,202 Q52,215 65,215 L162,215',
      toHouse:  'M205,253 L205,335 Q205,348 218,348 L335,348 Q348,348 348,335 L348,250',
      fromBat:  'M52,330 L52,335 Q52,348 65,348 L182,348 Q195,348 195,335 L195,253',
      toBat:    'M195,253 L195,335 Q195,348 182,348 L65,348 Q52,348 52,335 L52,330',
    };
  }

  _edgePt(fx, fy, center) {
    const dx = fx - center[0], dy = fy - center[1];
    const d  = Math.hypot(dx, dy) || 1;
    return [center[0] + (dx/d)*R, center[1] + (dy/d)*R];
  }

  _nodeSVG(id, cx, cy, iconPath, showVal) {
    const sc  = 1.167;
    const ix  = (cx - 14).toFixed(1);
    const iy  = showVal ? (cy - 18).toFixed(1) : (cy - 14).toFixed(1);
    const val = showVal ? `
  <text id="${id}-val" x="${cx}" y="${cy + 19}" text-anchor="middle" class="lbl"
    font-size="11" font-weight="600" fill="#ffffff" filter="url(#txt-sh)">—</text>` : '';
    return `
  <circle id="${id}-glow" cx="${cx}" cy="${cy}" r="${GR}" fill="url(#rg-gry)"/>
  <circle id="${id}-c" cx="${cx}" cy="${cy}" r="${R}"
    style="fill:rgba(160,160,165,0.78);stroke:rgba(255,255,255,0.20);stroke-width:1"/>
  <g id="${id}-icon" transform="translate(${ix},${iy}) scale(${sc})" filter="url(#icon-sh)">
    <path class="node-path" d="${iconPath}" fill="#ffffff"/>
  </g>${val}`;
  }

  // ── Separator HTML helper ─────────────────────────────────────────────────
  // Vrátí prázdný string pokud show=false (celý separator skrytý).
  // Ikona: <ha-icon> — funguje v HA kontextu pro libovolné mdi:* ikony.
  _sepHTML(show, iconShow, icon, iconColor, text, textColor) {
    if (!show) return '';
    const iconStyle = `--mdc-icon-size:26px;flex-shrink:0;margin:0 14px 0 4px;opacity:0.75;display:inline-flex;align-items:center;align-self:center;` +
                      (iconColor ? `color:${iconColor};` : 'color:var(--text-color,rgba(255,255,255,0.85));');
    const iconEl = iconShow
      ? `<ha-icon icon="${icon}" style="${iconStyle}"></ha-icon>`
      : '';
    const textStyle = `font-size:17px;font-weight:600;white-space:nowrap;margin:0 30px 0 0;flex-shrink:0;overflow:hidden;text-overflow:ellipsis;` +
                      (textColor ? `color:${textColor};` : 'color:var(--text-color,rgba(255,255,255,0.85));');
    return `
  <div style="display:flex;align-items:center;height:40px;padding:0 14px 0 10px;position:relative;z-index:1;">
    ${iconEl}
    <span style="${textStyle}">${text}</span>
    <div style="flex-grow:1;height:6px;border-radius:6px;opacity:0.6;margin-right:14px;background:var(--bubble-line-background-color,var(--text-color,rgba(255,255,255,0.5)));"></div>
  </div>`;
  }

  _buildDOM() {
    const hasBat  = this._config.battery_show;
    const L       = hasBat ? SolarArcCard.LB : SolarArcCard.L;
    const Paths   = hasBat ? SolarArcCard.PB : SolarArcCard.P;
    const { INV, GRD, HSE } = L;
    const BAT     = hasBat ? L.BAT : null;
    const { toGrid, fromGrid, toHouse } = Paths;
    const fromBat = hasBat ? Paths.fromBat : '';
    const toBat   = hasBat ? Paths.toBat   : '';
    const viewBox = hasBat ? '0 0 400 385' : '0 0 400 335';
    this._arcGrads = {};   // reset custom gradient cache

    this.shadowRoot.innerHTML = `
<style>
  :host { display:block; }

  .card {
    background: var(--mod-card-background, rgba(30,30,40,0.05));
    backdrop-filter: blur(35px) saturate(100%);
    -webkit-backdrop-filter: blur(35px) saturate(100%);
    border: 1px solid var(--mod-card-border, rgba(255,255,255,0.08));
    border-radius: 34px;
    padding: 6px;
    position: relative;
    overflow: hidden;
    box-shadow:
      0 15px 25px var(--mod-card-shadow, rgba(0,0,0,0.12)),
      inset 0 2px 3px var(--mod-card-inset-shadow, rgba(255,255,255,0.02));
  }
  .card::before {
    content:""; position:absolute; inset:0; border-radius:34px;
    background: linear-gradient(120deg,
      var(--mod-card-gradient-start, rgba(255,255,255,0.2)),
      var(--mod-card-gradient-mid,   rgba(255,255,255,0.05)) 25%,
      var(--mod-card-gradient-end,   rgba(255,255,255,0.01)) 50%,
      transparent 70%);
    opacity:0.35; pointer-events:none; z-index:0;
  }

  svg {
    width:100%; height:auto; display:block;
    position:relative; z-index:1; overflow:hidden;
  }

  #arc-prog {
    filter: drop-shadow(var(--button-card-icon-shadow, 0 2px 6px rgba(0,0,0,0.7)));
  }

  .node-path {
    /* SVG filter #icon-sh handles shadow — CSS filter here as fallback */
  }

  @keyframes gp { 0%,100%{opacity:0.75} 50%{opacity:1.0} }
  .gp { animation: gp 2.5s ease-in-out infinite; }

  .prt { --oval-max-op: 0.50; }

  @keyframes sun-outer { 0%,100%{opacity:0.38} 50%{opacity:0.58} }
  @keyframes sun-inner { 0%,100%{opacity:0.62} 50%{opacity:0.88} }
  #sun-halo   { animation: sun-outer 4s ease-in-out infinite; }
  #sun-corona { animation: sun-inner 2.5s ease-in-out infinite; }

  @keyframes twinkle { 0%,100%{opacity:0.15} 50%{opacity:0.95} }
  .star { animation: twinkle ease-in-out infinite; }
  @keyframes moon-halo-pulse { 0%,100%{opacity:0.08} 50%{opacity:0.18} }
  #moon-halo { animation: moon-halo-pulse 5s ease-in-out infinite; }

  @keyframes mo {
    0%   { offset-distance:0%;   opacity:0; }
    10%  { offset-distance:10%;  opacity:var(--oval-max-op, 1); }
    85%  { offset-distance:85%;  opacity:var(--oval-max-op, 1); }
    100% { offset-distance:100%; opacity:0; }
  }
  .oval {
    offset-distance:0%; offset-rotate:auto;
    transform-box:fill-box; transform-origin:center;
    animation:mo linear infinite; visibility:hidden;
  }
  .og1 { --oval-max-op: 0.50; }
  .og2 { --oval-max-op: 0.25; }
  .og3 { --oval-max-op: 0.10; }

  @keyframes laser-mo {
    0%   { offset-distance: 0%;   opacity: 0; }
    8%   { offset-distance: 8%;   opacity: 1; }
    92%  { offset-distance: 92%;  opacity: 1; }
    100% { offset-distance: 100%; opacity: 0; }
  }
  .lseg {
    offset-distance: 0%; offset-rotate: auto;
    transform-box: fill-box; transform-origin: center;
    animation: laser-mo linear infinite; visibility: hidden;
  }
  /* Trail circles — same motion, group <g> controls visibility+blur */
  .ltrl {
    offset-distance: 0%; offset-rotate: auto;
    transform-box: fill-box; transform-origin: center;
    animation: laser-mo linear infinite;
  }

  #inv-ring-solar, #inv-ring-grid, #inv-ring-bat {
    transition: stroke-dasharray 1s ease, stroke-dashoffset 1s ease,
                stroke 0.5s ease, opacity 0.4s ease;
  }

  .lbl {
    font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',sans-serif;
  }

  /* ── Sankey SVG — GPU izolace aby nespouštěl repaint backdrop-filter na .card ── */
  #sk-svg {
    display:block; width:100%;
    transform: translateZ(0);
    will-change: transform;
    contain: layout style;
  }
</style>

<div class="card">

  ${this._sepHTML(this._config.arc_title_show, this._config.arc_title_icon_show, this._config.arc_title_icon, this._config.arc_title_icon_color, this._config.arc_title_text, this._config.arc_title_text_color)}

<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="display:${this._config.arc_show ? 'block' : 'none'}">
  <defs>
    <linearGradient id="ag" x1="30" y1="0" x2="370" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0"    stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="0.12" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="0.5"  stop-color="#ffffff" stop-opacity="1.0"/>
      <stop offset="0.88" stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="1"    stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>

    <radialGradient id="rg-org" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#FF9500" stop-opacity="0"/>
      <stop offset="53%"  stop-color="#FF9500" stop-opacity="0"/>
      <stop offset="64%"  stop-color="#FF9500" stop-opacity="0.7"/>
      <stop offset="84%"  stop-color="#FF9500" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#FF9500" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rg-blu" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#0084FF" stop-opacity="0"/>
      <stop offset="53%"  stop-color="#0084FF" stop-opacity="0"/>
      <stop offset="64%"  stop-color="#0084FF" stop-opacity="0.7"/>
      <stop offset="84%"  stop-color="#0084FF" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#0084FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rg-grn" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#32D74B" stop-opacity="0"/>
      <stop offset="53%"  stop-color="#32D74B" stop-opacity="0"/>
      <stop offset="64%"  stop-color="#32D74B" stop-opacity="0.7"/>
      <stop offset="84%"  stop-color="#32D74B" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#32D74B" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rg-gry" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#8E8E93" stop-opacity="0"/>
      <stop offset="53%"  stop-color="#8E8E93" stop-opacity="0"/>
      <stop offset="64%"  stop-color="#8E8E93" stop-opacity="0.14"/>
      <stop offset="84%"  stop-color="#8E8E93" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#8E8E93" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="rg-wht" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="53%"  stop-color="#ffffff" stop-opacity="0"/>
      <stop offset="64%"  stop-color="#ffffff" stop-opacity="0.55"/>
      <stop offset="84%"  stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>

    <filter id="gd" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Laser head: wide outer glow + tight inner glow + sharp head = flash effect -->
    <filter id="lh" x="-300%" y="-300%" width="700%" height="700%">
      <feGaussianBlur stdDeviation="8" result="b1"/>
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b2"/>
      <feMerge><feMergeNode in="b1"/><feMergeNode in="b2"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Laser white hot core: tight bright glow around the white tip ellipse -->
    <filter id="lw" x="-300%" y="-300%" width="700%" height="700%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Gradient for laser core: transparent (trailing) → white (leading tip) -->
    <linearGradient id="lcore-grad" gradientUnits="objectBoundingBox" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%"   stop-color="white" stop-opacity="0"/>
      <stop offset="50%"  stop-color="white" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="white" stop-opacity="1"/>
    </linearGradient>
    <filter id="lt" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur stdDeviation="1.5"/>
    </filter>
    <filter id="gi" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="txt-sh" x="-20%" y="-60%" width="140%" height="220%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.85"/>
    </filter>
    <!-- Dark shadow always shown behind icons -->
    <filter id="icon-sh" x="-80%" y="-80%" width="260%" height="260%">
      <feDropShadow dx="0" dy="3" stdDeviation="6 6" flood-color="#222222" flood-opacity="0.80"/>
    </filter>
    <radialGradient id="sun-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%"   stop-color="#FFFDE7"/>
      <stop offset="45%"  stop-color="#FFD60A"/>
      <stop offset="100%" stop-color="#FF9500"/>
    </radialGradient>
    <filter id="sun-blur-lg" x="-200%" y="-200%" width="500%" height="500%">
      <feGaussianBlur stdDeviation="11"/>
    </filter>
    <filter id="sun-blur-md" x="-150%" y="-150%" width="400%" height="400%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="sun-blur-sm" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="cloud-f" x="-50%" y="-100%" width="200%" height="350%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <radialGradient id="moon-grad" cx="38%" cy="32%" r="65%">
      <stop offset="0%"   stop-color="#E8EEFF"/>
      <stop offset="100%" stop-color="#7A8BAA"/>
    </radialGradient>
    <mask id="moon-mask">
      <circle cx="0" cy="0" r="11" fill="white"/>
      <circle cx="6" cy="-4" r="8.5" fill="black"/>
    </mask>
    <filter id="moon-glow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ring-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <!-- Trail gradients: transparent at back → opaque at front (objectBoundingBox rotates with element) -->
    <linearGradient id="lg-sol" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#ffd60a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ffd60a" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="lg-grd" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#0084ff" stop-opacity="0"/>
      <stop offset="100%" stop-color="#0084ff" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="lg-imp" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#ff453a" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ff453a" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="lg-hse" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
      <stop offset="0%"   stop-color="#ff9500" stop-opacity="0"/>
      <stop offset="100%" stop-color="#ff9500" stop-opacity="0.65"/>
    </linearGradient>
  </defs>

  <!-- ARC -->
  <path d="M30,73 Q200,5 370,73"
    fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3.5" stroke-linecap="round"/>
  <path id="arc-prog" d="M30,73 Q200,5 370,73"
    fill="none" stroke="url(#ag)" stroke-width="3.5" stroke-linecap="round"
    stroke-dasharray="0 9999" opacity="0"/>

  <g transform="translate(${20.6},${63.6}) scale(0.78)" filter="url(#txt-sh)" opacity="0.85">
    <path d="${MDI.sunriseUp}" fill="rgba(255,255,255,0.92)"/>
  </g>
  <g transform="translate(${360.6},${63.6}) scale(0.78)" filter="url(#txt-sh)" opacity="0.55">
    <path d="${MDI.sunsetDown}" fill="rgba(255,255,255,0.92)"/>
  </g>
  <text id="rise-lbl" x="30"  y="91" text-anchor="middle" class="lbl"
    font-size="10" fill="rgba(255,255,255,0.8)" filter="url(#txt-sh)"/>
  <text id="set-lbl"  x="370" y="91" text-anchor="middle" class="lbl"
    font-size="10" fill="rgba(255,255,255,0.8)" filter="url(#txt-sh)"/>

  <!-- SUN / MOON -->
  <g id="sun-g">
    <!-- clouds in day sky — blurred circles for fluffy look -->
    <g opacity="0.58">
      <animateTransform attributeName="transform" type="translate" values="0,0;4,0;0,0" dur="9s" repeatCount="indefinite"/>
      <g filter="url(#cloud-f)">
        <circle cx="78"  cy="44" r="8"  fill="white"/>
        <circle cx="90"  cy="38" r="12" fill="white"/>
        <circle cx="104" cy="35" r="14" fill="white"/>
        <circle cx="118" cy="39" r="11" fill="white"/>
        <circle cx="130" cy="44" r="8"  fill="white"/>
      </g>
    </g>
    <g opacity="0.48">
      <animateTransform attributeName="transform" type="translate" values="0,0;-5,0;0,0" dur="13s" repeatCount="indefinite"/>
      <g filter="url(#cloud-f)">
        <circle cx="283" cy="50" r="8"  fill="white"/>
        <circle cx="296" cy="44" r="12" fill="white"/>
        <circle cx="311" cy="40" r="15" fill="white"/>
        <circle cx="327" cy="43" r="11" fill="white"/>
        <circle cx="339" cy="48" r="8"  fill="white"/>
      </g>
    </g>
    <g opacity="0.36">
      <animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="17s" repeatCount="indefinite"/>
      <g filter="url(#cloud-f)">
        <circle cx="162" cy="23" r="8"  fill="white"/>
        <circle cx="174" cy="17" r="10" fill="white"/>
        <circle cx="187" cy="22" r="7"  fill="white"/>
      </g>
    </g>
    <!-- sun body — translate updated by JS -->
    <g id="sun-body" transform="translate(200,50)">
      <circle id="sun-halo"   cx="0" cy="0" r="22" fill="#FF8C00" filter="url(#sun-blur-lg)"/>
      <circle id="sun-corona" cx="0" cy="0" r="13" fill="#FFD60A" filter="url(#sun-blur-md)"/>
      <circle id="sun-c"      cx="0" cy="0" r="8"  fill="url(#sun-grad)" filter="url(#sun-blur-sm)"/>
    </g>
  </g>
  <g id="moon-g" display="none">
    <!-- stars scattered across arc sky -->
    <circle class="star" cx="75"  cy="45" r="1.3" fill="white" style="animation-duration:3.1s;animation-delay:0.0s"/>
    <circle class="star" cx="145" cy="23" r="1.0" fill="white" style="animation-duration:2.7s;animation-delay:0.8s"/>
    <circle class="star" cx="48"  cy="60" r="0.9" fill="white" style="animation-duration:4.0s;animation-delay:0.3s"/>
    <circle class="star" cx="265" cy="18" r="1.1" fill="white" style="animation-duration:2.4s;animation-delay:1.4s"/>
    <circle class="star" cx="318" cy="30" r="1.4" fill="white" style="animation-duration:3.7s;animation-delay:0.5s"/>
    <circle class="star" cx="358" cy="52" r="1.0" fill="white" style="animation-duration:3.3s;animation-delay:1.1s"/>
    <circle class="star" cx="168" cy="10" r="0.8" fill="white" style="animation-duration:2.9s;animation-delay:2.0s"/>
    <circle class="star" cx="240" cy="55" r="1.2" fill="white" style="animation-duration:4.5s;animation-delay:0.7s"/>
    <!-- moon body — translate updated by JS -->
    <g id="moon-body" transform="translate(200,38)">
      <circle id="moon-halo" cx="0" cy="0" r="22" fill="rgba(160,185,230,1)"/>
      <circle cx="0" cy="0" r="11" fill="url(#moon-grad)" mask="url(#moon-mask)" filter="url(#moon-glow)"/>
    </g>
  </g>

  <!-- DIM FLOW PATHS -->
  <path id="p-solar"     d=""           fill="none" stroke="transparent"             stroke-width="5"/>
  <path id="p-to-grid"   d="${toGrid}"  fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="5"/>
  <path id="p-from-grid" d="${fromGrid}" fill="none" stroke="transparent"            stroke-width="5"/>
  <path id="p-to-house"  d="${toHouse}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="5"/>
  ${hasBat ? `
  <path id="p-from-bat"  d="${fromBat}" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="5"/>
  <path id="p-to-bat"    d="${toBat}"   fill="none" stroke="transparent"            stroke-width="5"/>
  ` : ''}

  <!-- NODES -->
  ${this._nodeSVG('inv', INV[0], INV[1], MDI.generator,        false)}
  ${this._nodeSVG('grd', GRD[0], GRD[1], MDI.tower,            true)}
  ${this._nodeSVG('hse', HSE[0], HSE[1], MDI.home,             true)}
  ${hasBat ? this._nodeSVG('bat', BAT[0], BAT[1], MDI.batteryCharging, true) : ''}

  <!-- INV RING: navrch nodů, aby glow/fill node nepřekrýval ringy -->
  <circle id="inv-ring-bg" cx="${INV[0]}" cy="${INV[1]}" r="38"
    fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="7"/>
  <circle id="inv-ring-solar" cx="${INV[0]}" cy="${INV[1]}" r="38"
    fill="none" stroke="#ffd60a" stroke-width="7" stroke-linecap="round"
    stroke-dasharray="0 238.8" stroke-dashoffset="0"
    transform="rotate(-90, ${INV[0]}, ${INV[1]})"
    filter="url(#ring-glow)" opacity="0"/>
  ${hasBat ? `
  <circle id="inv-ring-bat" cx="${INV[0]}" cy="${INV[1]}" r="38"
    fill="none" stroke="#30D158" stroke-width="7" stroke-linecap="round"
    stroke-dasharray="0 238.8" stroke-dashoffset="0"
    transform="rotate(-90, ${INV[0]}, ${INV[1]})"
    filter="url(#ring-glow)" opacity="0"/>
  ` : ''}
  <circle id="inv-ring-grid" cx="${INV[0]}" cy="${INV[1]}" r="38"
    fill="none" stroke="#0084FF" stroke-width="7" stroke-linecap="round"
    stroke-dasharray="0 238.8" stroke-dashoffset="0"
    transform="rotate(-90, ${INV[0]}, ${INV[1]})"
    filter="url(#ring-glow)" opacity="0"/>

  <!-- GHOSTY g3 (nejdál, nejprůhlednější) -->
  <ellipse id="d-sol-1g3" class="oval og3" rx="4" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-sol-2g3" class="oval og3" rx="4" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-sol-3g3" class="oval og3" rx="4" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-sol-4g3" class="oval og3" rx="4" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-1g3" class="oval og3" rx="4" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-grd-2g3" class="oval og3" rx="4" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-grd-3g3" class="oval og3" rx="4" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-4g3" class="oval og3" rx="4" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-1g3" class="oval og3" rx="4" ry="1.5" fill="#0a84ff" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-imp-2g3" class="oval og3" rx="4" ry="1.5" fill="#0a84ff" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-imp-3g3" class="oval og3" rx="4" ry="1.5" fill="#0a84ff" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-4g3" class="oval og3" rx="4" ry="1.5" fill="#0a84ff" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-1g3" class="oval og3" rx="4" ry="1.5" fill="#FF9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-hse-2g3" class="oval og3" rx="4" ry="1.5" fill="#FF9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-hse-3g3" class="oval og3" rx="4" ry="1.5" fill="#FF9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-4g3" class="oval og3" rx="4" ry="1.5" fill="#FF9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ${hasBat ? `
  <ellipse id="d-bat-1g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-bat-2g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-bat-3g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-bat-4g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-1g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.24s"/>
  <ellipse id="d-chg-2g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-1.51s"/>
  <ellipse id="d-chg-3g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-4g3" class="oval og3" rx="4" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ` : ''}

  <!-- GHOSTY g2 -->
  <ellipse id="d-sol-1g2" class="oval og2" rx="5.5" ry="2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-sol-2g2" class="oval og2" rx="5.5" ry="2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-sol-3g2" class="oval og2" rx="5.5" ry="2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-sol-4g2" class="oval og2" rx="5.5" ry="2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-1g2" class="oval og2" rx="5.5" ry="2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-grd-2g2" class="oval og2" rx="5.5" ry="2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-grd-3g2" class="oval og2" rx="5.5" ry="2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-4g2" class="oval og2" rx="5.5" ry="2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-1g2" class="oval og2" rx="5.5" ry="2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-imp-2g2" class="oval og2" rx="5.5" ry="2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-imp-3g2" class="oval og2" rx="5.5" ry="2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-4g2" class="oval og2" rx="5.5" ry="2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-1g2" class="oval og2" rx="5.5" ry="2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-hse-2g2" class="oval og2" rx="5.5" ry="2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-hse-3g2" class="oval og2" rx="5.5" ry="2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-4g2" class="oval og2" rx="5.5" ry="2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ${hasBat ? `
  <ellipse id="d-bat-1g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-bat-2g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-bat-3g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-bat-4g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-1g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.16s"/>
  <ellipse id="d-chg-2g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-1.59s"/>
  <ellipse id="d-chg-3g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-4g2" class="oval og2" rx="5.5" ry="2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ` : ''}

  <!-- GHOSTY g1 (nejblíž hlavě) -->
  <ellipse id="d-sol-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-sol-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-sol-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-sol-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-grd-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-grd-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-grd-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-imp-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-imp-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-imp-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-hse-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-hse-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-hse-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ${hasBat ? `
  <ellipse id="d-bat-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-bat-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-bat-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-bat-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-1g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.08s"/>
  <ellipse id="d-chg-2g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-1.67s"/>
  <ellipse id="d-chg-3g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  <ellipse id="d-chg-4g1" class="oval og1" rx="6.5" ry="2.2" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0s;visibility:hidden"/>
  ` : ''}

  <!-- HLAVY -->
  <ellipse id="d-sol-1" class="oval" rx="7" ry="2.5" fill="#ffd60a" filter="url(#gd)" style="offset-path:path('');animation-duration:3.5s"/>
  <ellipse id="d-sol-2" class="oval" rx="7" ry="2.5" fill="#ffd60a" filter="url(#gd)" style="offset-path:path('');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-sol-3" class="oval" rx="7" ry="2.5" fill="#ffd60a" filter="url(#gd)" style="offset-path:path('');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-sol-4" class="oval" rx="7" ry="2.5" fill="#ffd60a" filter="url(#gd)" style="offset-path:path('');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-grd-1" class="oval" rx="7" ry="2.5" fill="#32D74B" filter="url(#gd)" style="offset-path:path('${toGrid}');animation-duration:3.5s"/>
  <ellipse id="d-grd-2" class="oval" rx="7" ry="2.5" fill="#32D74B" filter="url(#gd)" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-grd-3" class="oval" rx="7" ry="2.5" fill="#32D74B" filter="url(#gd)" style="offset-path:path('${toGrid}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-grd-4" class="oval" rx="7" ry="2.5" fill="#32D74B" filter="url(#gd)" style="offset-path:path('${toGrid}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-imp-1" class="oval" rx="7" ry="2.5" fill="#0084FF" filter="url(#gd)" style="offset-path:path('${fromGrid}');animation-duration:3.5s"/>
  <ellipse id="d-imp-2" class="oval" rx="7" ry="2.5" fill="#0084FF" filter="url(#gd)" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-imp-3" class="oval" rx="7" ry="2.5" fill="#0084FF" filter="url(#gd)" style="offset-path:path('${fromGrid}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-imp-4" class="oval" rx="7" ry="2.5" fill="#0084FF" filter="url(#gd)" style="offset-path:path('${fromGrid}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-hse-1" class="oval" rx="7" ry="2.5" fill="#ff9500" filter="url(#gd)" style="offset-path:path('${toHouse}');animation-duration:3.5s"/>
  <ellipse id="d-hse-2" class="oval" rx="7" ry="2.5" fill="#ff9500" filter="url(#gd)" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-hse-3" class="oval" rx="7" ry="2.5" fill="#ff9500" filter="url(#gd)" style="offset-path:path('${toHouse}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-hse-4" class="oval" rx="7" ry="2.5" fill="#ff9500" filter="url(#gd)" style="offset-path:path('${toHouse}');animation-duration:3.5s;visibility:hidden"/>
  ${hasBat ? `
  <ellipse id="d-bat-1" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${fromBat}');animation-duration:3.5s"/>
  <ellipse id="d-bat-2" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-bat-3" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${fromBat}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-bat-4" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${fromBat}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-chg-1" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${toBat}');animation-duration:3.5s"/>
  <ellipse id="d-chg-2" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-1.75s"/>
  <ellipse id="d-chg-3" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${toBat}');animation-duration:3.5s;visibility:hidden"/>
  <ellipse id="d-chg-4" class="oval" rx="7" ry="2.5" fill="#30D158" filter="url(#gd)" style="offset-path:path('${toBat}');animation-duration:3.5s;visibility:hidden"/>
  ` : ''}

  <!-- LASER SEGMENTS — per beam: 1 oval head (.lseg) + group <g filter=#lt> with 40 circles (.ltrl) -->
  <!-- Group blur: 1 filter pass per beam instead of 56 — major GPU savings -->
  ${(() => {
    const N_TAIL = 56;
    const mkSegs = (p, path, col) => {
      let h = '';
      for (let b = 0; b < 2; b++) {
        // Oval head — colored base with wide glow, then white hot core on top
        h += `<ellipse id="dl-${p}-${b}-0" class="lseg" rx="7" ry="2.5" fill-opacity="1" fill="${col}" style="offset-path:${path};animation-duration:3.5s;" filter="url(#lh)"/>\n  `;
        h += `<ellipse id="dl-${p}-${b}-core" class="lseg" rx="3.5" ry="1.2" fill="url(#lcore-grad)" style="offset-path:${path};animation-duration:3.5s;transform:translateX(3.5px);" filter="url(#lw)"/>\n  `;
        // Trail group — ONE blur filter for all circles; group visibility controls beam
        h += `<g id="dl-trail-${p}-${b}" filter="url(#lt)" style="visibility:hidden">\n  `;
        for (let s = 0; s < N_TAIL; s++) {
          const r  = +(2.5 - s * 2.2 / (N_TAIL - 1)).toFixed(2);
          const op = +(0.85 * Math.pow(1 - s / N_TAIL, 0.55)).toFixed(4);  // gradual power curve
          h += `<ellipse id="dl-${p}-${b}-${s + 1}" class="ltrl" rx="${r}" ry="${r}" fill-opacity="${op}" fill="${col}" style="offset-path:${path};animation-duration:3.5s;"/>\n  `;
        }
        h += `</g>\n  `;
      }
      return h;
    };
    let html = '';
    html += mkSegs('sol', `path('')`,            '#ffd60a');
    html += mkSegs('grd', `path('${toGrid}')`,   '#32D74B');
    html += mkSegs('imp', `path('${fromGrid}')`, '#0084FF');
    html += mkSegs('hse', `path('${toHouse}')`,  '#ff9500');
    if (hasBat) {
      html += mkSegs('bat', `path('${fromBat}')`, '#30D158');
      html += mkSegs('chg', `path('${toBat}')`,   '#30D158');
    }
    return html;
  })()}

  <!-- PARTICLES — translateY shifts perpendicular to path (offset-rotate:auto local space) -->
  <!-- sol: 8 particles, ±5px / ±8px lateral offset -->
  <ellipse id="dp-sol-1" class="oval prt" rx="1.5" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-sol-2" class="oval prt" rx="1.5" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-sol-3" class="oval prt" rx="2.5" ry="0.8" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-sol-4" class="oval prt" rx="2.5" ry="0.8" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-sol-5" class="oval prt" rx="1.5" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-sol-6" class="oval prt" rx="1.5" ry="1.5" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-sol-7" class="oval prt" rx="2.5" ry="0.8" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-sol-8" class="oval prt" rx="2.5" ry="0.8" fill="#ffd60a" style="offset-path:path('');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  <!-- grd -->
  <ellipse id="dp-grd-1" class="oval prt" rx="1.5" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-grd-2" class="oval prt" rx="1.5" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-grd-3" class="oval prt" rx="2.5" ry="0.8" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-grd-4" class="oval prt" rx="2.5" ry="0.8" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-grd-5" class="oval prt" rx="1.5" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-grd-6" class="oval prt" rx="1.5" ry="1.5" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-grd-7" class="oval prt" rx="2.5" ry="0.8" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-grd-8" class="oval prt" rx="2.5" ry="0.8" fill="#32D74B" style="offset-path:path('${toGrid}');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  <!-- imp -->
  <ellipse id="dp-imp-1" class="oval prt" rx="1.5" ry="1.5" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-imp-2" class="oval prt" rx="1.5" ry="1.5" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-imp-3" class="oval prt" rx="2.5" ry="0.8" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-imp-4" class="oval prt" rx="2.5" ry="0.8" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-imp-5" class="oval prt" rx="1.5" ry="1.5" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-imp-6" class="oval prt" rx="1.5" ry="1.5" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-imp-7" class="oval prt" rx="2.5" ry="0.8" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-imp-8" class="oval prt" rx="2.5" ry="0.8" fill="#0084FF" style="offset-path:path('${fromGrid}');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  <!-- hse -->
  <ellipse id="dp-hse-1" class="oval prt" rx="1.5" ry="1.5" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-hse-2" class="oval prt" rx="1.5" ry="1.5" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-hse-3" class="oval prt" rx="2.5" ry="0.8" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-hse-4" class="oval prt" rx="2.5" ry="0.8" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-hse-5" class="oval prt" rx="1.5" ry="1.5" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-hse-6" class="oval prt" rx="1.5" ry="1.5" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-hse-7" class="oval prt" rx="2.5" ry="0.8" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-hse-8" class="oval prt" rx="2.5" ry="0.8" fill="#ff9500" style="offset-path:path('${toHouse}');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  ${hasBat ? `
  <!-- bat discharge -->
  <ellipse id="dp-bat-1" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-bat-2" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-bat-3" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-bat-4" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-bat-5" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-bat-6" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-bat-7" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-bat-8" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${fromBat}');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  <!-- bat charge -->
  <ellipse id="dp-chg-1" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.53s;transform:translateY(5px)"/>
  <ellipse id="dp-chg-2" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-1.23s;transform:translateY(-5px)"/>
  <ellipse id="dp-chg-3" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:1.23s;transform:translateY(8px)"/>
  <ellipse id="dp-chg-4" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:-0.53s;transform:translateY(-8px)"/>
  <ellipse id="dp-chg-5" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:1.93s;transform:translateY(5px)"/>
  <ellipse id="dp-chg-6" class="oval prt" rx="1.5" ry="1.5" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.18s;transform:translateY(-5px)"/>
  <ellipse id="dp-chg-7" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:2.63s;transform:translateY(8px)"/>
  <ellipse id="dp-chg-8" class="oval prt" rx="2.5" ry="0.8" fill="#30D158" style="offset-path:path('${toBat}');animation-duration:3.5s;animation-delay:0.88s;transform:translateY(-8px)"/>
  ` : ''}

  <!-- SUN PILL — navrch všeho (z-order) -->
  <g id="sun-pill" opacity="0">
    <foreignObject x="0" y="0" width="80" height="26">
      <div xmlns="http://www.w3.org/1999/xhtml" style="
        width:100%;height:100%;border-radius:13px;box-sizing:border-box;
        background:var(--button-card-background,rgba(255,255,255,0.5));
        backdrop-filter:blur(20px) saturate(180%);
        -webkit-backdrop-filter:blur(20px) saturate(180%);
        border:1px solid var(--button-card-border,rgba(200,200,255,0.3));
        display:flex;align-items:center;justify-content:center;
      ">
        <span id="sun-pill-txt" style="
          font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif;
          font-size:11px;font-weight:700;
          color:#ffffff;
          text-shadow:0 1px 3px rgba(0,0,0,0.85);
          white-space:nowrap;
        ">—</span>
      </div>
    </foreignObject>
  </g>

</svg>

  ${this._sepHTML(this._config.sankey_title_show, this._config.sankey_title_icon_show, this._config.sankey_title_icon, this._config.sankey_title_icon_color, this._config.sankey_title_text, this._config.sankey_title_text_color)}

  <!-- Sankey SVG — všechny elementy pre-alokované, update pouze přes setAttribute -->
  <svg id="sk-svg" viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" style="display:${this._config.sankey_show ? 'block' : 'none'}">
    <defs id="sk-defs">
      <!-- Static only — dynamic gradients added by _renderSankey -->
      <filter id="sk-sh" x="-20%" y="-60%" width="140%" height="220%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#000" flood-opacity="0.9"/>
      </filter>
    </defs>
    <g id="sk-flows"/>
    <g id="sk-glows"/>
    <g id="sk-nodes"/>
    <g id="sk-labels"/>
  </svg>

</div>`;
  }

  _updateDOM() {
    const sr = this.shadowRoot;
    if (!sr.querySelector('#arc-prog')) return;

    const pv    = this._val(this._config.pv_entity);
    const house = this._val(this._config.house_entity);
    const grid  = this._val(this._config.grid_entity) * (this._config.grid_power_inverted ? -1 : 1);
    const hasBat       = this._config.battery_show;
    const bat          = hasBat ? this._val(this._config.battery_entity) : 0;
    const isDischarging = hasBat && bat > 10;
    const isCharging    = hasBat && bat < -10;

    // Path lengths in px — used to normalise animation speed across different-length routes
    // Quarter-circle corner r=13 ≈ π*13/2 ≈ 20.4 px
    const PL = hasBat ? {
      sol: 190,   // bezier solar→INV (battery layout, INV higher)
      grd: 130,   // M162,215 → L65 (97) + arc (20) + L52,190 (12)
      imp: 130,
      hse: 325,   // M205,253 → down (82) + arc + across (117) + arc + up (85)
      bat: 245,   // M52,330 → down (5) + arc + across (117) + arc + up (82)
      chg: 245,
    } : {
      sol: 220,   // bezier solar→INV (standard layout)
      grd: 265,   // M195,282.7 → down (17) + arc + across (117) + arc + up (90)
      imp: 265,
      hse: 265,   // symmetric to grd
    };
    const tz    = this._hass.config?.time_zone;
    const sunAttrs = this._hass.states[this._config.sun_entity]?.attributes || {};
    const isDay  = this._isDay();
    const sunT   = isDay ? this._getSunT() : -1;
    const isProd = pv > 20;
    const isExport = grid > 10;
    const isImport = grid < -10;
    const solColor  = isDay
      ? (this._config.arc_sun_flow_color  || '#ffd60a')
      : (this._config.arc_moon_flow_color || '#8EACCD');
    const solStroke = 'rgba(255,255,255,0.12)';
    const solIds = ['#d-sol-1','#d-sol-2','#d-sol-1g1','#d-sol-2g1','#d-sol-1g2','#d-sol-2g2','#d-sol-1g3','#d-sol-2g3'];

    const L = hasBat ? SolarArcCard.LB : SolarArcCard.L;
    const f = n => this._f(n);

    sr.querySelector('#sun-g').style.display  = isDay ? 'block' : 'none';
    sr.querySelector('#moon-g').style.display = isDay ? 'none' : 'block';

    if (!isDay) {
      sr.querySelector('#arc-prog').setAttribute('opacity', '0');
      const nightT  = this._getNightT();
      const moonArcT = nightT >= 0 ? nightT : 0;
      const mp = this._qp(moonArcT, L.A0, L.A1, L.A2);
      const mx = f(mp[0]), my = f(mp[1]);
      sr.querySelector('#moon-body').setAttribute('transform', `translate(${mx},${my})`);

      const moonPill = sr.querySelector('#sun-pill');
      if (isProd) {
        const ex = f(L.INV[0]), ey = f(L.INV[1] - RR);
        const midY = f((mp[1] + L.INV[1] - RR) / 2);
        const moonPath = `M${mx},${my} C${mx},${midY} ${ex},${midY} ${ex},${ey}`;
        sr.querySelector('#p-solar').setAttribute('d', moonPath);
        sr.querySelector('#p-solar').style.stroke = solStroke;
        solIds.forEach(id => { const e = sr.querySelector(id); if (e) { e.style.offsetPath = `path('${moonPath}')`; e.setAttribute('fill', solColor); } });
        for (let b = 0; b < 2; b++) { const h = sr.querySelector(`#dl-sol-${b}-0`); if (h) h.style.offsetPath = `path('${moonPath}')`; const c = sr.querySelector(`#dl-sol-${b}-core`); if (c) c.style.offsetPath = `path('${moonPath}')`; for (let s = 1; s <= 56; s++) { const e = sr.querySelector(`#dl-sol-${b}-${s}`); if (e) e.style.offsetPath = `path('${moonPath}')`; } }
        this._setParticles(sr, 'sol', solColor, true, this._dur(pv, PL.sol), moonPath, PL.sol);
        // Pill u měsíce
        const pillX = mp[0] + 94 > 390 ? mp[0] - 94 : mp[0] + 14;
        moonPill.setAttribute('transform', `translate(${f(pillX)},${f(mp[1]-16)})`);
        moonPill.setAttribute('opacity', '1');
        sr.querySelector('#sun-pill-txt').textContent = this._fmt(pv);
      } else {
        sr.querySelector('#p-solar').setAttribute('d', '');
        sr.querySelector('#p-solar').style.stroke = 'transparent';
        this._setParticles(sr, 'sol', solColor, false, this._dur(pv, PL.sol), undefined, PL.sol);
        moonPill.setAttribute('opacity', '0');
      }
    }

    if (isDay) {
      const sp = this._qp(sunT, L.A0, L.A1, L.A2);
      const sx = f(sp[0]), sy = f(sp[1]);

      sr.querySelector('#sun-body').setAttribute('transform', `translate(${sx},${sy})`);

      const si = isProd ? this._sunIntensity(pv) : { opacity: 0.28, rOuter: 14, rMid: 9, rCore: 6 };
      sr.querySelector('#sun-body').style.opacity = `${si.opacity}`;
      sr.querySelector('#sun-halo').setAttribute('r',   si.rOuter);
      sr.querySelector('#sun-corona').setAttribute('r', si.rMid);
      const sc = sr.querySelector('#sun-c');
      sc.setAttribute('r',    si.rCore);
      sc.setAttribute('fill', isProd ? 'url(#sun-grad)' : 'rgba(255,214,10,0.5)');

      const pill = sr.querySelector('#sun-pill');
      const pillX = sp[0] + 94 > 390 ? sp[0] - 94 : sp[0] + 14;
      pill.setAttribute('transform', `translate(${f(pillX)},${f(sp[1]-16)})`);
      pill.setAttribute('opacity', '1');
      sr.querySelector('#sun-pill-txt').textContent =
        this._fmt(pv);

      const prog = this._arcLen(sunT, L.A0, L.A1, L.A2);
      const ap = sr.querySelector('#arc-prog');
      ap.setAttribute('stroke-dasharray', `${f(prog)} 9999`);
      ap.setAttribute('opacity', isDay ? '0.9' : '0');

      const ex        = f(L.INV[0]), ey = f(L.INV[1] - RR);
      const midY      = f((sp[1] + L.INV[1] - RR) / 2);
      const solarPath = `M${sx},${sy} C${sx},${midY} ${ex},${midY} ${ex},${ey}`;
      sr.querySelector('#p-solar').setAttribute('d', solarPath);
      sr.querySelector('#p-solar').style.stroke = isProd ? solStroke : 'transparent';
      solIds.forEach(id => { const e = sr.querySelector(id); if (e) { e.style.offsetPath = `path('${solarPath}')`; e.setAttribute('fill', solColor); } });
      for (let b = 0; b < 2; b++) { const h = sr.querySelector(`#dl-sol-${b}-0`); if (h) h.style.offsetPath = `path('${solarPath}')`; const c = sr.querySelector(`#dl-sol-${b}-core`); if (c) c.style.offsetPath = `path('${solarPath}')`; for (let s = 1; s <= 56; s++) { const e = sr.querySelector(`#dl-sol-${b}-${s}`); if (e) e.style.offsetPath = `path('${solarPath}')`; } }
      this._setParticles(sr, 'sol', solColor, isProd, this._dur(pv, PL.sol), solarPath, PL.sol);
    }

    if (sunAttrs.next_rising && sunAttrs.next_setting) {
      const rising  = new Date(sunAttrs.next_rising).getTime();
      const setting = new Date(sunAttrs.next_setting).getTime();
      if (isDay) {
        sr.querySelector('#rise-lbl').textContent = this._fmtTime(rising - 86400000, tz);
        sr.querySelector('#set-lbl').textContent  = this._fmtTime(setting, tz);
      } else {
        sr.querySelector('#rise-lbl').textContent = this._fmtTime(setting - 86400000, tz);
        sr.querySelector('#set-lbl').textContent  = this._fmtTime(rising, tz);
      }
    }

    // ── Custom barvy pro oválky, particles a flow ────────────────────────────
    const cfg      = this._config;
    const grdColor = cfg.arc_grid_color || '#32D74B';
    const impColor = cfg.arc_grid_color || '#0084FF';
    const hseColor = cfg.arc_home_color || '#FF9500';

    this._setFlow(sr, ['#d-sol-1','#d-sol-2','#d-sol-3','#d-sol-4'], isProd,     this._dur(pv,    PL.sol), PL.sol, solColor);
    this._setFlow(sr, ['#d-grd-1','#d-grd-2','#d-grd-3','#d-grd-4'], isExport,   this._dur(grid,  PL.grd), PL.grd, grdColor);
    this._setFlow(sr, ['#d-imp-1','#d-imp-2','#d-imp-3','#d-imp-4'], isImport,   this._dur(grid,  PL.imp), PL.imp, impColor);
    this._setFlow(sr, ['#d-hse-1','#d-hse-2','#d-hse-3','#d-hse-4'], house > 20, this._dur(house, PL.hse), PL.hse, hseColor);

    // Hlavy oválků — barva se jinak nemění po _buildDOM, musíme je aktualizovat
    if (cfg.arc_grid_color) {
      this._setOvalColor(sr, 'grd', grdColor);
      this._setOvalColor(sr, 'imp', impColor);
    }
    if (cfg.arc_home_color) this._setOvalColor(sr, 'hse', hseColor);

    this._setParticles(sr, 'grd', grdColor, isExport,   this._dur(grid,  PL.grd), undefined, PL.grd);
    this._setParticles(sr, 'imp', impColor, isImport,   this._dur(grid,  PL.imp), undefined, PL.imp);
    this._setParticles(sr, 'hse', hseColor, house > 20, this._dur(house, PL.hse), undefined, PL.hse);

    sr.querySelector('#p-from-grid').style.stroke = isImport ? 'rgba(255,255,255,0.12)' : 'transparent';
    sr.querySelector('#p-to-grid').style.stroke   = 'rgba(255,255,255,0.12)';
    sr.querySelector('#p-to-house').style.stroke  = 'rgba(255,255,255,0.12)';

    // ── Style: node barvy a glow gradienty ───────────────────────────────────
    const inactiveColor = cfg.arc_inactive_color || null;
    const invFill       = cfg.arc_inverter_color || (isDay ? 'rgba(255,155,50,0.90)' : 'rgba(80,170,255,0.90)');
    const invGradId     = cfg.arc_inverter_color ? this._ensureArcGrad(sr, cfg.arc_inverter_color) : (isDay ? 'rg-org' : 'rg-blu');
    this._nodeUpdate(sr, 'inv', isProd, invFill, invGradId, null, inactiveColor);
    // Glow přebírá ring — potlačit glow na inv uzlu (+ strhnout gp animaci, která by přebila opacity)
    const invGlow = sr.querySelector('#inv-glow');
    invGlow.classList.remove('gp');
    invGlow.style.opacity = '0';

    // ── INV RING: kruhový graf solár / baterie / grid-import ─────────
    const RC      = 238.76; // 2π × 38
    const pvPow   = Math.max(0, pv);
    const impPow  = Math.max(0, -grid);
    const batPow  = isDischarging ? bat : 0;               // pouze vybíjení přispívá do ringy
    const totSrc  = pvPow + impPow + batPow;
    const sFrac   = totSrc > 20 ? pvPow  / totSrc : (isProd ? 1 : 0);
    const bFrac   = totSrc > 20 ? batPow / totSrc : 0;
    const gFrac   = totSrc > 20 ? impPow / totSrc : (1 - sFrac - bFrac);   // backward compat
    const nAct    = (sFrac > 0.02 ? 1 : 0) + (bFrac > 0.02 ? 1 : 0) + (gFrac > 0.02 ? 1 : 0);
    const gap     = nAct > 1 ? 4 : 0;
    const sLen    = Math.max(0, RC * sFrac - (sFrac > 0.02 ? gap : 0)).toFixed(1);
    const bLen    = Math.max(0, RC * bFrac - (bFrac > 0.02 ? gap : 0)).toFixed(1);
    const gLen    = Math.max(0, RC * gFrac - (gFrac > 0.02 ? gap : 0)).toFixed(1);
    const bOff    = (-(RC * sFrac)).toFixed(1);
    const gOff    = (-(RC * (sFrac + bFrac))).toFixed(1);

    const ringSolar = sr.querySelector('#inv-ring-solar');
    const ringBat   = sr.querySelector('#inv-ring-bat');   // null v non-battery layoutu
    const ringGrid  = sr.querySelector('#inv-ring-grid');

    ringSolar.setAttribute('stroke', solColor);
    ringSolar.setAttribute('stroke-dasharray', `${sLen} ${RC.toFixed(1)}`);
    ringSolar.setAttribute('stroke-dashoffset', '0');
    ringSolar.style.opacity = sFrac > 0.02 ? '0.92' : '0';

    if (ringBat) {
      const bColor = cfg.arc_battery_discharge_color || '#30D158';
      ringBat.setAttribute('stroke', bColor);
      ringBat.setAttribute('stroke-dasharray', `${bLen} ${RC.toFixed(1)}`);
      ringBat.setAttribute('stroke-dashoffset', bOff);
      ringBat.style.opacity = bFrac > 0.02 ? '0.90' : '0';
    }

    ringGrid.setAttribute('stroke', cfg.arc_grid_color || (isImport ? '#0084FF' : '#32D74B'));
    ringGrid.setAttribute('stroke-dasharray', `${gLen} ${RC.toFixed(1)}`);
    ringGrid.setAttribute('stroke-dashoffset', gOff);
    ringGrid.style.opacity = gFrac > 0.02 ? '0.85' : '0';

    const gFillDefault = isImport ? 'rgba(80,170,255,0.90)' : isExport ? 'rgba(100,220,130,0.90)' : 'rgba(160,160,165,0.78)';
    const gFill    = cfg.arc_grid_color || gFillDefault;
    const gGradDef = isImport ? 'rg-blu' : isExport ? 'rg-grn' : 'rg-gry';
    const gGradId  = cfg.arc_grid_color ? this._ensureArcGrad(sr, cfg.arc_grid_color) : gGradDef;
    const gLabel   = isImport ? `→ ${this._fmt(Math.abs(grid))}` :
                     isExport ? `← ${this._fmt(Math.abs(grid))}` :
                     this._fmt(Math.abs(grid));
    const hseFill   = cfg.arc_home_color || 'rgba(255,155,50,0.90)';
    const hseGradId = cfg.arc_home_color ? this._ensureArcGrad(sr, cfg.arc_home_color) : 'rg-org';
    this._nodeUpdate(sr, 'grd', isImport || isExport, gFill, gGradId, gLabel, inactiveColor);
    this._nodeUpdate(sr, 'hse', house > 20, hseFill, hseGradId, this._fmt(house), inactiveColor);

    // ── Battery node + flow ──────────────────────────────────────────────────
    if (hasBat) {
      const batDisColor = cfg.arc_battery_discharge_color || '#30D158';
      const batChgColor = cfg.arc_battery_charge_color    || '#30D158';
      const batActive   = isDischarging || isCharging;
      const batFill     = isDischarging ? batDisColor
                        : isCharging    ? batChgColor
                        : null;
      const batGradId   = isDischarging
        ? (cfg.arc_battery_discharge_color ? this._ensureArcGrad(sr, batDisColor) : 'rg-grn')
        : isCharging
          ? (cfg.arc_battery_charge_color   ? this._ensureArcGrad(sr, batChgColor) : 'rg-grn')
          : 'rg-grn';
      const batLabel = isDischarging ? `↑ ${this._fmt(bat)}`
                     : isCharging    ? `↓ ${this._fmt(Math.abs(bat))}`
                     : this._fmt(Math.abs(bat));
      this._nodeUpdate(sr, 'bat', batActive,
        batFill || 'rgba(48,209,88,0.90)', batGradId, batLabel, inactiveColor);

      // Oval flow
      if (cfg.arc_battery_discharge_color) this._setOvalColor(sr, 'bat', batDisColor);
      if (cfg.arc_battery_charge_color)    this._setOvalColor(sr, 'chg', batChgColor);
      this._setFlow(sr, ['#d-bat-1','#d-bat-2','#d-bat-3','#d-bat-4'], isDischarging, this._dur(bat,           PL.bat), PL.bat, batDisColor);
      this._setFlow(sr, ['#d-chg-1','#d-chg-2','#d-chg-3','#d-chg-4'], isCharging,   this._dur(Math.abs(bat), PL.chg), PL.chg, batChgColor);
      this._setParticles(sr, 'bat', batDisColor, isDischarging, this._dur(bat,              PL.bat), undefined, PL.bat);
      this._setParticles(sr, 'chg', batChgColor, isCharging,    this._dur(Math.abs(bat),   PL.chg), undefined, PL.chg);

      // Dim paths
      const pFromBat = sr.querySelector('#p-from-bat');
      const pToBat   = sr.querySelector('#p-to-bat');
      if (pFromBat) pFromBat.style.stroke = isDischarging ? 'rgba(255,255,255,0.12)' : 'transparent';
      if (pToBat)   pToBat.style.stroke   = isCharging    ? 'rgba(255,255,255,0.12)' : 'transparent';
    }

    // ── Barvy textu a ikon ────────────────────────────────────────────────────
    if (cfg.arc_text_color) {
      ['#grd-val','#hse-val','#rise-lbl','#set-lbl'].forEach(sel => {
        const el = sr.querySelector(sel);
        if (el) el.setAttribute('fill', cfg.arc_text_color);
      });
      const pillTxt = sr.querySelector('#sun-pill-txt');
      if (pillTxt) pillTxt.style.color = cfg.arc_text_color;
    }
    if (cfg.arc_icon_color) {
      ['#inv-icon .node-path','#grd-icon .node-path','#hse-icon .node-path'].forEach(sel => {
        const el = sr.querySelector(sel);
        if (el) el.setAttribute('fill', cfg.arc_icon_color);
      });
    }

    this._updateSankey(sr, pv, grid, house);
  }

  // ── _ensureArcGrad: vytvoří (nebo vrátí cached) radialGradient pro custom barvu ──
  _ensureArcGrad(sr, color) {
    if (!this._arcGrads) this._arcGrads = {};
    if (this._arcGrads[color]) return this._arcGrads[color];
    const NS   = 'http://www.w3.org/2000/svg';
    const id   = `rg-c${Object.keys(this._arcGrads).length}`;
    const defs = sr.querySelector('svg:not(#sk-svg) defs');
    if (!defs) return 'rg-gry';
    const g = document.createElementNS(NS, 'radialGradient');
    g.setAttribute('id', id);
    g.setAttribute('cx', '50%'); g.setAttribute('cy', '50%'); g.setAttribute('r', '50%');
    [[0,'0%'],[0,'53%'],[0.7,'64%'],[0.18,'84%'],[0,'100%']].forEach(([op, off]) => {
      const s = document.createElementNS(NS, 'stop');
      s.setAttribute('offset', off);
      s.setAttribute('stop-color', color);
      s.setAttribute('stop-opacity', String(op));
      g.appendChild(s);
    });
    defs.appendChild(g);
    this._arcGrads[color] = id;
    return id;
  }

  // ── _setOvalColor: aktualizuje fill hlavy + ghostů pro daný prefix ────────
  _setOvalColor(sr, prefix, color) {
    ['1','2'].forEach(n => {
      ['','g1','g2','g3'].forEach(sfx => {
        const el = sr.querySelector(`#d-${prefix}-${n}${sfx}`);
        if (el) el.setAttribute('fill', color);
      });
    });
  }

  _hexA(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ── _updateSankey: dispatcher ────────────────────────────────────────────
  _updateSankey(sr, pvIn, gridIn, houseIn) {
    const sects = this._config.sections
      ? this._config.sections
      : this._buildLegacySections(pvIn, gridIn, houseIn);
    if (this._config.sankey_layout === 'vertical') {
      this._renderSankeyVertical(sr, sects);
    } else {
      sr.querySelector('#sk-svg')?.setAttribute('viewBox', '0 0 400 250');
      this._renderSankey(sr, sects);
    }
  }

  // ── _buildLegacySections: translate sk_* config → sections array ─────────
  _buildLegacySections(pvIn, gridIn, houseIn) {
    const cfg = this._config;
    const pvPow  = Math.max(0, pvIn);
    const skGrdV = cfg.sk_grid ? this._val(cfg.sk_grid) : null;
    const impPow = skGrdV !== null ? Math.max(0, skGrdV) : Math.max(0, -gridIn);
    const expPow = cfg.sk_export && this._val(cfg.sk_export) > 0
      ? this._val(cfg.sk_export)
      : skGrdV !== null ? Math.max(0, -skGrdV) : Math.max(0, gridIn);
    const l1Pow  = cfg.sk_l1  ? Math.max(0, this._val(cfg.sk_l1))  : 0;
    const l2Pow  = cfg.sk_l2  ? Math.max(0, this._val(cfg.sk_l2))  : 0;
    const l3Pow  = cfg.sk_l3  ? Math.max(0, this._val(cfg.sk_l3))  : 0;
    const invPow = cfg.sk_inv ? Math.max(0, this._val(cfg.sk_inv)) : 0;
    const pcPow  = cfg.sk_pc  ? Math.max(0, this._val(cfg.sk_pc))  : 0;
    const tvPow  = cfg.sk_tv  ? Math.max(0, this._val(cfg.sk_tv))  : 0;
    const useDetail = (l1Pow + l2Pow + l3Pow + invPow + pcPow + tvPow) > 0;
    const l1Tot    = Math.max(l1Pow, pcPow + tvPow);
    const houseTot = useDetail
      ? Math.max(houseIn, l1Tot + l2Pow + l3Pow + invPow)
      : houseIn;

    // ── Battery ─────────────────────────────────────────────────────────────
    // positive = discharging (source), negative = charging (consumer)
    const batRaw    = cfg.battery_show ? this._val(cfg.battery_entity) : 0;
    const batDis    = Math.max(0,  batRaw);   // discharge power
    const batChg    = Math.max(0, -batRaw);   // charge power
    const hasBatDis = batDis > 10;
    const hasBatChg = batChg > 10;
    const batDisCol = cfg.arc_battery_discharge_color || '#30D158';
    const batChgCol = cfg.arc_battery_charge_color    || '#30D158';
    // When charging, sources need to list battery as a child so flows are drawn
    const pvCh  = hasBatChg ? ['_hse_', '_exp_', '_bat_'] : ['_hse_', '_exp_'];
    const grdCh = hasBatChg ? ['_hse_', '_bat_']          : ['_hse_'];

    const e = (id, name, col, val, children) =>
      ({ entity_id: id, name, color: col, _v: val, ...(children ? { children } : {}) });

    if (useDetail) {
      const sects = [
        { entities: [
          e('_pv_',  'Solár',  '#FFD60A', pvPow,   hasBatChg ? ['_hse_', '_exp_', '_bat_'] : ['_hse_', '_exp_']),
          e('_grd_', 'Síť',    '#007AFF', impPow,  hasBatChg ? ['_hse_', '_bat_'] : ['_hse_']),
          ...(hasBatDis ? [e('_bat_', 'Battery', batDisCol, batDis, ['_hse_'])] : []),
        ]},
        { entities: [
          e('_hse_', 'Dům',    '#FF9500', houseTot, ['_l1_','_l2_','_l3_','_inv_']),
          e('_exp_', 'Přetok', '#30D158', expPow),
          ...(hasBatChg ? [e('_bat_', 'Battery', batChgCol, batChg)] : []),
        ]},
        { entities: [
          e('_l1_',  'L1',      '#5AC8FA', l1Tot,  pcPow+tvPow>0 ? ['_pc_','_tv_'] : undefined),
          e('_l2_',  'L2',      '#5AC8FA', l2Pow),
          e('_l3_',  'L3',      '#5AC8FA', l3Pow),
          e('_inv_', 'Střídač', '#5AC8FA', invPow),
        ]},
      ];
      if (pcPow + tvPow > 0) sects.push({ entities: [
        e('_pc_', 'PC', '#32ADE6', pcPow),
        e('_tv_', 'TV', '#32ADE6', tvPow),
      ]});
      return sects;
    }
    return [
      { entities: [
        e('_pv_',  'Solár',  '#FFD60A', pvPow,  pvCh),
        e('_grd_', 'Síť',    '#007AFF', impPow, grdCh),
        ...(hasBatDis ? [e('_bat_', 'Battery', batDisCol, batDis, ['_hse_'])] : []),
      ]},
      { entities: [
        e('_hse_', 'Dům',    '#FF9500', houseTot),
        e('_exp_', 'Přetok', '#30D158', expPow),
        ...(hasBatChg ? [e('_bat_', 'Battery', batChgCol, batChg)] : []),
      ]},
    ];
  }

  // ── _renderSankey: dynamic renderer for any sections array ───────────────
  _renderSankey(sr, sections) {
    const skSvg = sr.querySelector('#sk-svg');
    if (!skSvg || !sections?.length) return;

    const NS  = 'http://www.w3.org/2000/svg';
    const NW = 11, GAP = 7, PAD_T = 18, PAD_B = 14, SVG_H = 250;
    const avH = SVG_H - PAD_T - PAD_B;   // 218 px
    const N   = sections.length;
    const ff  = v => v.toFixed(1);

    // ── Clear dynamic content ──
    const fG   = skSvg.querySelector('#sk-flows');
    const glG  = skSvg.querySelector('#sk-glows');
    const nG   = skSvg.querySelector('#sk-nodes');
    const lG   = skSvg.querySelector('#sk-labels');
    const defs = skSvg.querySelector('#sk-defs');
    if (!fG) return;
    [fG, glG, nG, lG].forEach(g => { while (g.firstChild) g.removeChild(g.firstChild); });
    [...defs.querySelectorAll('linearGradient')].forEach(el => el.remove());

    // ── Column x centers (spread 18…382 — full card width) ──
    const COLS = N === 1 ? [200]
      : sections.map((_, i) => Math.round(18 + i * (382 - 18) / (N - 1)));

    // ── Entity registry ──
    const entMap = {}, colOf = {};
    sections.forEach((sec, ci) => {
      (sec.entities || []).forEach(ent => {
        entMap[ent.entity_id] = ent;
        colOf[ent.entity_id]  = ci;
      });
    });

    // ── Node values ──
    const nVal     = {};
    const deferred = [];
    sections.forEach(sec => {
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id;
        if (ent.type === 'remaining_parent_state') {
          deferred.push(eid); nVal[eid] = 0;
        } else {
          nVal[eid] = Math.max(0,
            ent._v !== undefined ? ent._v
              : parseFloat(this._hass?.states[eid]?.state || 0) || 0
          );
        }
      });
    });
    // Resolve remaining_parent_state: parent value − non-deferred siblings
    deferred.forEach(eid => {
      let pv = 0, sib = 0;
      for (const [pid, pe] of Object.entries(entMap)) {
        if (pe.children?.includes(eid)) {
          pv = nVal[pid];
          (pe.children || []).forEach(cid => {
            if (cid !== eid && !deferred.includes(cid)) sib += nVal[cid] || 0;
          });
          break;
        }
      }
      nVal[eid] = Math.max(0, pv - sib);
    });

    // ── Scale: tallest column fits in avH ──
    const scArr = sections.map(sec => {
      const active = (sec.entities || []).filter(e => nVal[e.entity_id] > 0);
      if (!active.length) return Infinity;
      const sumW  = active.reduce((a, e) => a + nVal[e.entity_id], 0);
      const gapsH = (active.length - 1) * GAP;
      return sumW > 0 ? (avH - gapsH) / sumW : Infinity;
    }).filter(s => isFinite(s) && s > 0);
    const S  = scArr.length ? Math.min(...scArr) : 1;
    const nh = v => v > 0 ? Math.max(2, v * S) : 0;

    // ── Node Y positions ──
    const nY = {}, nH = {};
    sections.forEach(sec => {
      let y = PAD_T;
      (sec.entities || []).forEach(ent => {
        const h = nh(nVal[ent.entity_id]);
        nY[ent.entity_id] = y; nH[ent.entity_id] = h;
        if (h >= 2) y += h + GAP;
      });
    });
    // Column alignment: if all entities in a column share exactly one parent → align with parent ──
    for (let ci = 1; ci < N; ci++) {
      const colEnts = sections[ci].entities || [];
      const parents = new Set();
      colEnts.forEach(ent => {
        Object.entries(entMap).forEach(([pid, pe]) => {
          if (colOf[pid] < ci && pe.children?.includes(ent.entity_id)) parents.add(pid);
        });
      });
      if (parents.size === 1) {
        const pid = [...parents][0];
        let y = nY[pid];
        colEnts.forEach(ent => {
          const h = nh(nVal[ent.entity_id]);
          nY[ent.entity_id] = y; nH[ent.entity_id] = h;
          if (h >= 2) y += h + GAP;
        });
      }
    }

    // ── Flow values (sequential fill: top parent fills first) ──
    const srcUsed = {};
    Object.keys(nVal).forEach(eid => { srcUsed[eid] = 0; });
    const flowList = [];
    sections.forEach((sec, ci) => {
      if (ci === 0) return;
      (sec.entities || []).forEach(tgtEnt => {
        const tgtId = tgtEnt.entity_id;
        let remaining = nVal[tgtId];
        if (remaining <= 0) return;
        for (let pci = 0; pci < ci; pci++) {
          (sections[pci].entities || []).forEach(srcEnt => {
            if (!srcEnt.children?.includes(tgtId)) return;
            if (remaining <= 0) return;
            const srcId = srcEnt.entity_id;
            const avail = nVal[srcId] - srcUsed[srcId];
            const fv    = Math.min(avail, remaining);
            if (fv > 0) {
              flowList.push({ from: srcId, to: tgtId, value: fv });
              srcUsed[srcId] += fv; remaining -= fv;
            }
          });
        }
      });
    });

    // ── Helpers ──
    const getCol  = eid => this._cssColor(entMap[eid]?.color) || '#5AC8FA';
    let   gIdx    = 0;
    const mkGrad  = (id, stops) => {
      const g = document.createElementNS(NS, 'linearGradient');
      g.setAttribute('id', id);
      g.setAttribute('x1','0%'); g.setAttribute('y1','0%');
      g.setAttribute('x2','100%'); g.setAttribute('y2','0%');
      stops.forEach(([off, col, op]) => {
        const s = document.createElementNS(NS, 'stop');
        s.setAttribute('offset', off);
        s.setAttribute('stop-color', col);
        s.setAttribute('stop-opacity', String(op));
        g.appendChild(s);
      });
      defs.appendChild(g); return id;
    };
    const bb = (xa, y1t, y1b, xb, y2t, y2b) => {
      const mx = xa+(xb-xa)*0.55, mx2 = xa+(xb-xa)*0.45;
      return `M${xa},${y1t} C${mx},${y1t} ${mx2},${y2t} ${xb},${y2t} `
           + `L${xb},${y2b} C${mx2},${y2b} ${mx},${y1b} ${xa},${y1b} Z`;
    };

    // ── Draw flows ──
    const srcOff = {}, tgtOff = {};
    Object.keys(nVal).forEach(eid => { srcOff[eid] = 0; tgtOff[eid] = 0; });
    flowList.forEach(fl => {
      const fh = nh(fl.value);
      if (fh < 1) return;
      const xa  = COLS[colOf[fl.from]] + NW/2;
      const xb  = COLS[colOf[fl.to]]   - NW/2;
      const y1t = nY[fl.from] + srcOff[fl.from];
      const y2t = nY[fl.to]   + tgtOff[fl.to];
      srcOff[fl.from] += fh; tgtOff[fl.to] += fh;
      const cSrc = getCol(fl.from), cTgt = getCol(fl.to);
      const gid  = mkGrad(`sk-fg-${gIdx++}`, [['0%',cSrc,0.50],['100%',cTgt,0.40]]);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', bb(xa, y1t, y1t+fh, xb, y2t, y2t+fh));
      p.setAttribute('fill', `url(#${gid})`);
      fG.appendChild(p);
    });

    // ── Draw nodes ──
    const GW = 25;
    sections.forEach((sec, ci) => {
      const cx = COLS[ci];
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id, h = nH[eid], y = nY[eid];
        if (h < 2) return;
        const col = getCol(eid);
        // glow
        const ggid = `sk-gg-${gIdx++}`;
        mkGrad(ggid, [['0%',col,0],['28%',col,0.32],['72%',col,0.32],['100%',col,0]]);
        const gr = document.createElementNS(NS, 'rect');
        gr.setAttribute('x', ff(cx-GW/2)); gr.setAttribute('y', ff(y));
        gr.setAttribute('width', ff(GW));  gr.setAttribute('height', ff(h));
        gr.setAttribute('rx', '7');
        gr.setAttribute('fill', `url(#${ggid})`);
        glG.appendChild(gr);
        // body
        const rb = document.createElementNS(NS, 'rect');
        rb.setAttribute('x', ff(cx-NW/2)); rb.setAttribute('y', ff(y));
        rb.setAttribute('width', ff(NW));  rb.setAttribute('height', ff(h));
        rb.setAttribute('rx', '5.5');
        rb.setAttribute('fill',         this._hexA(col, 0.82));
        rb.setAttribute('stroke',       this._hexA(col, 1.0));
        rb.setAttribute('stroke-width', '1.2');
        nG.appendChild(rb);
      });
    });

    // ── Draw labels ──
    const fsN  = N > 2 ? '10' : '12';   // název — zvětšeno
    const fsV  = N > 2 ? '8'  : '10';   // watty — původní velikost názvu
    const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif";
    const mkT  = (text, x, y, fs, fw, fill) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', ff(x)); t.setAttribute('y', ff(y));
      t.setAttribute('font-size', fs); t.setAttribute('font-weight', fw);
      t.setAttribute('font-family', FONT); t.setAttribute('fill', fill);
      t.setAttribute('filter', 'url(#sk-sh)');
      t.textContent = text; return t;
    };
    sections.forEach((sec, ci) => {
      const cx     = COLS[ci];
      // První sloupec: popisky napravo od sloupce
      // Poslední sloupec: popisky nalevo od sloupce
      // Ostatní: standardní logika (levá polovina → vlevo, pravá → vpravo)
      const isFirst = ci === 0;
      const isLast  = ci === N - 1;
      const right   = isFirst ? true : (isLast ? false : ci > (N - 1) / 2);
      const xOff    = right ? cx + NW/2 + 5 : cx - NW/2 - 5;
      const anchor  = right ? 'start' : 'end';
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id, h = nH[eid], y = nY[eid];
        if (h < 2) return;
        const cy = y + h / 2;
        const colP = this._config.sankey_text_color_primary   || 'rgba(255,255,255,0.90)';
        const colS = this._config.sankey_text_color_secondary || 'rgba(255,255,255,0.65)';
        const tN = mkT(ent.name || eid, xOff, cy-4, fsN, '600', colP);
        tN.setAttribute('text-anchor', anchor);
        const tV = mkT(this._fmt(nVal[eid]), xOff, cy+6, fsV, '400', colS);
        tV.setAttribute('text-anchor', anchor);
        lG.appendChild(tN); lG.appendChild(tV);
      });
    });
  }

  // ── _renderSankeyVertical: sekce = řádky shora dolů ─────────────────────
  _renderSankeyVertical(sr, sections) {
    const skSvg = sr.querySelector('#sk-svg');
    if (!skSvg || !sections?.length) return;

    const NS    = 'http://www.w3.org/2000/svg';
    const NH    = 11;          // výška nodu (fixní)
    const GH    = 24;          // výška glowu
    const GAP_H = 5;           // mezera mezi nody ve stejném řádku
    const PAD_L = 18, PAD_R = 18;
    const avW   = 400 - PAD_L - PAD_R;  // 364 px
    const PAD_T = 28, PAD_B = 22;
    const ROW_STEP = 110;      // vzdálenost mezi středy řádků
    const N     = sections.length;
    const SVG_H = PAD_T + (N - 1) * ROW_STEP + PAD_B;
    const ff    = v => v.toFixed(1);

    // Dynamická výška viewBox
    skSvg.setAttribute('viewBox', `0 0 400 ${SVG_H}`);

    // Vyčistit
    const fG   = skSvg.querySelector('#sk-flows');
    const glG  = skSvg.querySelector('#sk-glows');
    const nG   = skSvg.querySelector('#sk-nodes');
    const lG   = skSvg.querySelector('#sk-labels');
    const defs = skSvg.querySelector('#sk-defs');
    if (!fG) return;
    [fG, glG, nG, lG].forEach(g => { while (g.firstChild) g.removeChild(g.firstChild); });
    [...defs.querySelectorAll('linearGradient')].forEach(el => el.remove());

    // Středy řádků (y)
    const ROWS = sections.map((_, i) => PAD_T + i * ROW_STEP);

    // Registry entit
    const entMap = {}, rowOf = {};
    sections.forEach((sec, ri) => {
      (sec.entities || []).forEach(ent => {
        entMap[ent.entity_id] = ent;
        rowOf[ent.entity_id]  = ri;
      });
    });

    // Hodnoty nodů (stejná logika jako horizontal)
    const nVal     = {};
    const deferred = [];
    sections.forEach(sec => {
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id;
        if (ent.type === 'remaining_parent_state') {
          deferred.push(eid); nVal[eid] = 0;
        } else {
          nVal[eid] = Math.max(0,
            ent._v !== undefined ? ent._v
              : parseFloat(this._hass?.states[eid]?.state || 0) || 0
          );
        }
      });
    });
    deferred.forEach(eid => {
      let pv = 0, sib = 0;
      for (const [pid, pe] of Object.entries(entMap)) {
        if (pe.children?.includes(eid)) {
          pv = nVal[pid];
          (pe.children || []).forEach(cid => {
            if (cid !== eid && !deferred.includes(cid)) sib += nVal[cid] || 0;
          });
          break;
        }
      }
      nVal[eid] = Math.max(0, pv - sib);
    });

    // Scale: nejširší řádek se vejde do avW
    const scArr = sections.map(sec => {
      const active = (sec.entities || []).filter(e => nVal[e.entity_id] > 0);
      if (!active.length) return Infinity;
      const sumW  = active.reduce((a, e) => a + nVal[e.entity_id], 0);
      const gapsW = Math.max(0, active.length - 1) * GAP_H;
      return sumW > 0 ? (avW - gapsW) / sumW : Infinity;
    }).filter(s => isFinite(s) && s > 0);
    const S  = scArr.length ? Math.min(...scArr) : 1;
    const nw = v => v > 0 ? Math.max(2, v * S) : 0;

    // X pozice nodů — centrovaně v řádku
    const nX = {}, nW = {};
    sections.forEach(sec => {
      const active = (sec.entities || []).filter(e => nw(nVal[e.entity_id]) >= 2);
      const totalW = active.reduce((a, e) => a + nw(nVal[e.entity_id]), 0)
                   + Math.max(0, active.length - 1) * GAP_H;
      let x = PAD_L + (avW - totalW) / 2;
      (sec.entities || []).forEach(ent => {
        const w = nw(nVal[ent.entity_id]);
        nX[ent.entity_id] = x;
        nW[ent.entity_id] = w;
        if (w >= 2) x += w + GAP_H;
      });
    });

    // Flow hodnoty
    const srcUsed = {};
    Object.keys(nVal).forEach(eid => { srcUsed[eid] = 0; });
    const flowList = [];
    sections.forEach((sec, ri) => {
      if (ri === 0) return;
      (sec.entities || []).forEach(tgtEnt => {
        const tgtId = tgtEnt.entity_id;
        let remaining = nVal[tgtId];
        if (remaining <= 0) return;
        for (let pri = 0; pri < ri; pri++) {
          (sections[pri].entities || []).forEach(srcEnt => {
            if (!srcEnt.children?.includes(tgtId)) return;
            if (remaining <= 0) return;
            const srcId = srcEnt.entity_id;
            const avail = nVal[srcId] - srcUsed[srcId];
            const fv    = Math.min(avail, remaining);
            if (fv > 0) {
              flowList.push({ from: srcId, to: tgtId, value: fv });
              srcUsed[srcId] += fv; remaining -= fv;
            }
          });
        }
      });
    });

    // Helpers
    const getCol = eid => this._cssColor(entMap[eid]?.color) || '#5AC8FA';
    let gIdx = 0;
    const mkGrad = (id, stops, vert) => {
      const g = document.createElementNS(NS, 'linearGradient');
      g.setAttribute('id', id);
      g.setAttribute('x1', '0%'); g.setAttribute('y1', '0%');
      g.setAttribute('x2', vert ? '0%' : '100%');
      g.setAttribute('y2', vert ? '100%' : '0%');
      stops.forEach(([off, col, op]) => {
        const s = document.createElementNS(NS, 'stop');
        s.setAttribute('offset', off);
        s.setAttribute('stop-color', col);
        s.setAttribute('stop-opacity', String(op));
        g.appendChild(s);
      });
      defs.appendChild(g); return id;
    };

    // Vertikální bezier flow: horní hrana → spodní hrana
    const bbV = (xl, xr, y1, x2l, x2r, y2) => {
      const my = y1 + (y2 - y1) * 0.5;
      return `M${xl},${y1} C${xl},${my} ${x2l},${my} ${x2l},${y2} `
           + `L${x2r},${y2} C${x2r},${my} ${xr},${my} ${xr},${y1} Z`;
    };

    // Kreslení flows
    const srcOffH = {}, tgtOffH = {};
    Object.keys(nVal).forEach(eid => { srcOffH[eid] = 0; tgtOffH[eid] = 0; });
    flowList.forEach(fl => {
      const fw = nw(fl.value);
      if (fw < 1) return;
      const y1   = ROWS[rowOf[fl.from]] + NH / 2;
      const y2   = ROWS[rowOf[fl.to]]   - NH / 2;
      const x1l  = nX[fl.from] + srcOffH[fl.from];
      const x2l  = nX[fl.to]   + tgtOffH[fl.to];
      srcOffH[fl.from] += fw; tgtOffH[fl.to] += fw;
      const cSrc = getCol(fl.from), cTgt = getCol(fl.to);
      const gid  = mkGrad(`sk-fg-${gIdx++}`, [['0%',cSrc,0.50],['100%',cTgt,0.40]], true);
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', bbV(x1l, x1l + fw, y1, x2l, x2l + fw, y2));
      p.setAttribute('fill', `url(#${gid})`);
      fG.appendChild(p);
    });

    // Kreslení nodů
    sections.forEach((sec, ri) => {
      const ry = ROWS[ri];
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id, w = nW[eid], x = nX[eid];
        if (w < 2) return;
        const col = getCol(eid);
        // glow
        const ggid = `sk-gg-${gIdx++}`;
        mkGrad(ggid, [['0%',col,0],['28%',col,0.32],['72%',col,0.32],['100%',col,0]], false);
        const gr = document.createElementNS(NS, 'rect');
        gr.setAttribute('x', ff(x));           gr.setAttribute('y',      ff(ry - GH / 2));
        gr.setAttribute('width', ff(w));        gr.setAttribute('height', ff(GH));
        gr.setAttribute('rx', '7');
        gr.setAttribute('fill', `url(#${ggid})`);
        glG.appendChild(gr);
        // body
        const rb = document.createElementNS(NS, 'rect');
        rb.setAttribute('x', ff(x));           rb.setAttribute('y',      ff(ry - NH / 2));
        rb.setAttribute('width', ff(w));        rb.setAttribute('height', ff(NH));
        rb.setAttribute('rx', '5.5');
        rb.setAttribute('fill',         this._hexA(col, 0.82));
        rb.setAttribute('stroke',       this._hexA(col, 1.0));
        rb.setAttribute('stroke-width', '1.2');
        nG.appendChild(rb);
      });
    });

    // Popisky
    const fsN  = N > 2 ? '10' : '12';
    const fsV  = N > 2 ? '8'  : '10';
    const FONT = "-apple-system,BlinkMacSystemFont,'SF Pro Text',sans-serif";
    const mkT  = (text, x, y, fs, fw, fill) => {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', ff(x)); t.setAttribute('y', ff(y));
      t.setAttribute('font-size', fs); t.setAttribute('font-weight', fw);
      t.setAttribute('font-family', FONT); t.setAttribute('fill', fill);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('filter', 'url(#sk-sh)');
      t.textContent = text; return t;
    };
    sections.forEach((sec, ri) => {
      const ry = ROWS[ri];
      (sec.entities || []).forEach(ent => {
        const eid = ent.entity_id, w = nW[eid], x = nX[eid];
        if (w < 2) return;
        const cx = x + w / 2;
        const colP = this._config.sankey_text_color_primary   || 'rgba(255,255,255,0.90)';
        const colS = this._config.sankey_text_color_secondary || 'rgba(255,255,255,0.65)';
        lG.appendChild(mkT(ent.name || eid,      cx, ry - NH/2 - 5,  fsN, '600', colP));
        lG.appendChild(mkT(this._fmt(nVal[eid]), cx, ry + NH/2 + 10, fsV, '400', colS));
      });
    });
  }

  // ── _cssColor: CSS color name / hex → 6-char lowercase hex ─────────────
  _cssColor(colorStr) {
    if (!colorStr) return null;
    const s = String(colorStr).trim();
    if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(s)) {
      const [, a, b, c] = s;
      return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
    }
    try {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 1;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = s;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
    } catch { return null; }
  }


  _nodeUpdate(sr, id, active, color, gradId, valText, inactiveColor = null) {
    const grayColor = inactiveColor || 'rgba(160,160,165,0.78)';

    const glow = sr.querySelector(`#${id}-glow`);
    glow.setAttribute('fill', `url(#${active ? gradId : 'rg-gry'})`);
    glow.style.opacity = '';
    if (active) glow.classList.add('gp');
    else        glow.classList.remove('gp');

    const circle = sr.querySelector(`#${id}-c`);
    if (active) {
      circle.style.fill        = color;
      circle.style.stroke      = 'rgba(255,255,255,0.35)';
      circle.style.fillOpacity = '1';
    } else {
      circle.style.fill        = grayColor;
      circle.style.stroke      = 'rgba(255,255,255,0.20)';
      circle.style.fillOpacity = '1';
    }

    if (valText !== null) {
      const val = sr.querySelector(`#${id}-val`);
      if (val) val.textContent = valText;
    }
  }

  _setFlow(sr, ids, visible, dur, pathLen = 220, color = null) {
    const style = this._config?.arc_flow_style || 'oval';
    const cfg   = this._config;

    if (style === 'laser') {
      // ── Hide all oval elements ──────────────────────────────────────────
      ids.forEach(sel => {
        [sel, `${sel}g1`, `${sel}g2`, `${sel}g3`].forEach(s => {
          const e = sr.querySelector(s); if (e) e.style.visibility = 'hidden';
        });
      });
      // ── Extract prefix: '#d-sol-1' → 'sol' ─────────────────────────────
      const prefix = ids[0].replace(/^#d-/, '').replace(/-\d+$/, '');
      // ── Beam count from config ──────────────────────────────────────────
      const maxBeams = (pathLen >= 200 && dur >= 1.0)
        ? (cfg?.arc_flow_count_slow ?? 1)
        : (cfg?.arc_flow_count_fast ?? 1);
      const numBeams = Math.min(maxBeams, 2);
      // ── 350px tail: convert to time fraction ───────────────────────────
      const N_TAIL  = 56;                          // circles per beam
      const tailDur = Math.min(350 * dur / pathLen, dur * 0.84); // cap: tail ≤ 84% of cycle so circles never wrap
      const segStep = tailDur / N_TAIL;           // per-segment offset (56 gaps head→tail tip)
      const d = dur.toFixed(2);
      for (let b = 0; b < 2; b++) {
        const beamVis  = visible && b < numBeams;
        const beamBase = -(tailDur + dur * b / numBeams);
        // Head (seg 0) — individual element
        const head = sr.querySelector(`#dl-${prefix}-${b}-0`);
        if (head) {
          head.style.visibility        = beamVis ? 'visible' : 'hidden';
          head.style.animationDuration = `${d}s`;
          head.style.animationDelay    = `${beamBase.toFixed(3)}s`;   // most negative = furthest ahead
          if (color) head.setAttribute('fill', color);
        }
        // White hot core — same timing as head, always white
        const core = sr.querySelector(`#dl-${prefix}-${b}-core`);
        if (core) {
          core.style.visibility        = beamVis ? 'visible' : 'hidden';
          core.style.animationDuration = `${d}s`;
          core.style.animationDelay    = `${beamBase.toFixed(3)}s`;
        }
        // Trail group — one visibility toggle for all circles
        const grp = sr.querySelector(`#dl-trail-${prefix}-${b}`);
        if (grp) grp.style.visibility = beamVis ? 'visible' : 'hidden';
        // Update circle delays + color inside group
        for (let s = 1; s <= N_TAIL; s++) {
          const el = sr.querySelector(`#dl-${prefix}-${b}-${s}`);
          if (!el) continue;
          el.style.animationDuration = `${d}s`;
          el.style.animationDelay    = `${(beamBase + segStep * s).toFixed(3)}s`;
          if (color) el.setAttribute('fill', color);
        }
      }

    } else {
      // ── OVAL (default) ──────────────────────────────────────────────────
      // Hide laser segments for this prefix (group + head)
      const prefix = ids[0].replace(/^#d-/, '').replace(/-\d+$/, '');
      for (let b = 0; b < 2; b++) {
        const h = sr.querySelector(`#dl-${prefix}-${b}-0`);
        if (h) h.style.visibility = 'hidden';
        const g = sr.querySelector(`#dl-trail-${prefix}-${b}`);
        if (g) g.style.visibility = 'hidden';
      }
      const maxN = (pathLen >= 200 && dur >= 1.0)
        ? (cfg?.arc_flow_count_slow ?? 4)
        : (cfg?.arc_flow_count_fast ?? 2);
      const n    = Math.min(ids.length, maxN);
      const d    = dur.toFixed(2);
      const gOff = [dur * 0.025, dur * 0.05, dur * 0.075];
      ids.forEach((sel, i) => {
        const show = visible && i < n;
        const base = -(dur * i / n);
        const el = sr.querySelector(sel);
        if (el) {
          el.style.visibility        = show ? 'visible' : 'hidden';
          el.style.animationDuration = `${d}s`;
          el.style.animationDelay    = `${base.toFixed(2)}s`;
        }
        gOff.forEach((off, gi) => {
          const g = sr.querySelector(`${sel}g${gi + 1}`);
          if (g) {
            g.style.visibility        = show ? 'visible' : 'hidden';
            g.style.animationDuration = `${d}s`;
            g.style.animationDelay    = `${(base + off).toFixed(2)}s`;
          }
        });
      });
    }
  }

  _setParticles(sr, prefix, color, visible, dur, path, pathLen = 220) {
    // Laser style uses its own glow — particles hidden
    if ((this._config?.arc_flow_style || 'oval') === 'laser') {
      for (let n = 1; n <= 8; n++) {
        const el = sr.querySelector(`#dp-${prefix}-${n}`);
        if (el) el.style.visibility = 'hidden';
      }
      return;
    }
    const np = pathLen >= 320 ? 8 : pathLen >= 250 ? 6 : pathLen >= 180 ? 4 : 2;
    // phases evenly distributed: 0.15, 0.65, 0.35, 0.85, 0.55, 0.05, 0.75, 0.25
    const configs = [
      { n: 1, vis: visible && np >= 1,   del: dur *  0.15 },
      { n: 2, vis: visible && np >= 2,   del: dur * -0.35 },
      { n: 3, vis: visible && np >= 4,   del: dur *  0.35 },
      { n: 4, vis: visible && np >= 4,   del: dur * -0.15 },
      { n: 5, vis: visible && np >= 6,   del: dur *  0.55 },
      { n: 6, vis: visible && np >= 6,   del: dur *  0.05 },
      { n: 7, vis: visible && np >= 8,   del: dur *  0.75 },
      { n: 8, vis: visible && np >= 8,   del: dur *  0.25 },
    ];
    configs.forEach(({ n, vis, del }) => {
      const el = sr.querySelector(`#dp-${prefix}-${n}`);
      if (!el) return;
      el.style.visibility        = vis ? 'visible' : 'hidden';
      el.style.animationDuration = `${dur.toFixed(2)}s`;
      el.style.animationDelay    = `${del.toFixed(2)}s`;
      el.setAttribute('fill', color);
      if (path !== undefined) el.style.offsetPath = `path('${path}')`;
    });
  }

  _tickSun() {
    if (!this._hass) return;
    const sr = this.shadowRoot;
    if (!sr.querySelector('#arc-prog')) return;

    const isDay  = this._isDay();
    const sunT   = isDay ? this._getSunT() : -1;
    const pv     = this._val(this._config.pv_entity);
    const isProd = pv > 20;
    const L      = this._config?.battery_show ? SolarArcCard.LB : SolarArcCard.L;
    const f      = n => this._f(n);

    sr.querySelector('#sun-g').style.display  = isDay ? 'block' : 'none';
    sr.querySelector('#moon-g').style.display = isDay ? 'none' : 'block';

    if (!isDay) {
      const nightT   = this._getNightT();
      const moonArcT = nightT >= 0 ? nightT : 0;
      const mp = this._qp(moonArcT, L.A0, L.A1, L.A2);
      sr.querySelector('#moon-body').setAttribute('transform', `translate(${f(mp[0])},${f(mp[1])})`);
      return;
    }

    const sp = this._qp(sunT, L.A0, L.A1, L.A2);
    const sx = f(sp[0]), sy = f(sp[1]);

    sr.querySelector('#sun-body').setAttribute('transform', `translate(${sx},${sy})`);
    const pillX = sp[0] + 94 > 390 ? sp[0] - 94 : sp[0] + 14;
    sr.querySelector('#sun-pill').setAttribute('transform', `translate(${f(pillX)},${f(sp[1]-16)})`);

    const prog = this._arcLen(sunT, L.A0, L.A1, L.A2);
    sr.querySelector('#arc-prog').setAttribute('stroke-dasharray', `${f(prog)} 9999`);
    sr.querySelector('#arc-prog').setAttribute('opacity', isDay ? '0.9' : '0');

    const ex        = f(L.INV[0]), ey = f(L.INV[1] - RR);
    const midY      = f((sp[1] + L.INV[1] - RR) / 2);
    const solarPath = `M${sx},${sy} C${sx},${midY} ${ex},${midY} ${ex},${ey}`;
    sr.querySelector('#p-solar').setAttribute('d', solarPath);
    ['#d-sol-1','#d-sol-2','#d-sol-1g1','#d-sol-2g1','#d-sol-1g2','#d-sol-2g2','#d-sol-1g3','#d-sol-2g3']
      .forEach(id => { const e = sr.querySelector(id); if (e) e.style.offsetPath = `path('${solarPath}')`; });
    for (let n = 1; n <= 8; n++) {
      const e = sr.querySelector(`#dp-sol-${n}`);
      if (e) e.style.offsetPath = `path('${solarPath}')`;
    }
    // Update laser segment paths for solar (path changes each minute with sun position)
    for (let b = 0; b < 2; b++) {
      for (let s = 0; s <= 56; s++) {
        const e = sr.querySelector(`#dl-sol-${b}-${s}`);
        if (e) e.style.offsetPath = `path('${solarPath}')`;
      }
      const c = sr.querySelector(`#dl-sol-${b}-core`);
      if (c) c.style.offsetPath = `path('${solarPath}')`;
    }
  }
}

customElements.define('solar-arc-card', SolarArcCard);

// ══════════════════════════════════════════════════════════════════════════════
// EDITOR
// ══════════════════════════════════════════════════════════════════════════════

const _EDITOR_COLORS = [
  { label: 'Default', value: '' },
  { label: 'Blue',   value: '#007AFF' },
  { label: 'Green',  value: '#32D74B' },
  { label: 'Yellow', value: '#FFD60A' },
  { label: 'Orange', value: '#FF9500' },
  { label: 'Red',    value: '#FF3B30' },
  { label: 'Teal',   value: '#5AC8FA' },
  { label: 'Purple', value: '#BF5AF2' },
  { label: 'Pink',   value: '#FF2D55' },
  { label: 'White',  value: '#FFFFFF' },
];

class SolarArcCardEditor extends HTMLElement {
  constructor() {
    super();
    // Light DOM — no shadow DOM
    this._config   = {};
    this._built    = false;
    this._tab      = 'arc';
    this._sections = null;
  }

  // ── HA hooks ──────────────────────────────────────────────────────────────
  set hass(_h) { /* not needed — using ha-textfield for entities */ }

  setConfig(config) {
    this._config   = config ?? {};
    this._sections = config?.sankey?.sections ?? config?.sections ?? null;
    if (!this._built) { this._render(); this._built = true; }
    this._syncValues();
  }

  // ── Config helpers ────────────────────────────────────────────────────────
  _update(value, ...path) {
    const deep = o => JSON.parse(JSON.stringify(o ?? {}));
    const c = deep(this._config);
    let v = c;
    for (let i = 0; i < path.length - 1; i++) {
      if (v[path[i]] == null) v[path[i]] = {};
      v = v[path[i]];
    }
    v[path[path.length - 1]] = value;
    this._config = c;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: c }, bubbles: true, composed: true,
    }));
  }

  // ── Select helpers ────────────────────────────────────────────────────────
  _colorOpts(current = '') {
    const rows = _EDITOR_COLORS.map(({ label, value }) => {
      const sel = value === current ? ' selected' : '';
      const hex = value ? ` (${value})` : '';
      return `<option value="${value}"${sel}>${label}${hex}</option>`;
    }).join('');
    // If current is a custom hex not in the palette, add a visible placeholder option
    const inPalette = !current || _EDITOR_COLORS.some(c => c.value === current);
    const custom    = inPalette ? '' : `<option value="${current}" selected>Custom (${current})</option>`;
    return rows + custom;
  }

  _sel(id, label, opts) {
    return `<div class="sac-field">
      <label class="sac-lbl">${label}</label>
      <select id="${id}" class="sac-sel">${opts}</select>
    </div>`;
  }

  // Color row: predefined select + native color picker side by side
  _colorRow(id, label, current = '') {
    const cpVal = current || '#aaaaaa';
    const cpOpa = current ? '1' : '0.3';
    return `<div class="sac-field">
      <label class="sac-lbl">${label}</label>
      <div class="sac-crow">
        <select id="${id}" class="sac-sel">${this._colorOpts(current)}</select>
        <input type="color" id="${id}-cp" class="sac-cp" value="${cpVal}" style="opacity:${cpOpa}" title="Pick custom color">
      </div>
    </div>`;
  }

  // ── One-time DOM build ────────────────────────────────────────────────────
  _render() {
    const co = this._colorOpts();

    const arc = this._config?.arc    || {};
    const as  = arc.style            || {};
    const sk  = this._config?.sankey || {};
    const ss  = sk.style             || {};
    const cs  = (id, lbl, cur) => this._colorRow(id, lbl, cur || '');

    this.innerHTML = `
    <style>
      .sac-ed .tabs { display: flex; border-bottom: 1px solid var(--divider-color); margin-bottom: 12px; }
      .sac-ed .tab  { flex: 1; padding: 10px 4px; background: none; border: none;
                      border-bottom: 2px solid transparent; cursor: pointer;
                      font: 500 13px/1 var(--paper-font-body1_-_font-family, sans-serif);
                      color: var(--secondary-text-color); transition: color .15s, border-color .15s; }
      .sac-ed .tab.active { color: var(--primary-color); border-bottom-color: var(--primary-color); }
      .sac-ed .pane { display: none; }
      .sac-ed .pane.active { display: block; }
      .sac-ed .sec  { font: 600 11px/1 var(--paper-font-body1_-_font-family, sans-serif);
                      text-transform: uppercase; letter-spacing: .6px;
                      color: var(--secondary-text-color); margin: 16px 0 8px; }
      .sac-ed ha-textfield,
      .sac-ed ha-icon-picker { display: block; margin-bottom: 8px; }
      .sac-ed ha-formfield   { display: flex; align-items: center; justify-content: space-between;
                               padding: 4px 0; margin-bottom: 2px; }
      .sac-ed .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .sac-ed .sac-field { margin-bottom: 10px; }
      .sac-ed .sac-lbl  { display: block; font-size: 12px; color: var(--secondary-text-color);
                          margin-bottom: 3px; }
      .sac-ed .sac-sel  { width: 100%; padding: 8px 10px; box-sizing: border-box;
                          background: var(--input-fill-color, var(--secondary-background-color));
                          color: var(--primary-text-color);
                          border: 1px solid var(--input-ink-color, var(--divider-color));
                          border-radius: 4px; font-size: 14px; cursor: pointer; }
      .sac-ed .sac-sel:focus { outline: none; border-color: var(--primary-color); }
      .sac-ed .sac-crow { display: flex; gap: 6px; align-items: center; }
      .sac-ed .sac-crow .sac-sel { flex: 1; }
      .sac-ed .sac-cp   { width: 36px; height: 34px; padding: 2px; flex-shrink: 0;
                          box-sizing: border-box; border: 1px solid var(--divider-color);
                          border-radius: 4px; cursor: pointer; background: none; }
      .sac-ed .yaml-note { font-size: 12px; color: var(--secondary-text-color);
                           margin: 4px 0 8px; line-height: 1.5; }
      .sac-ed .yaml-note a { color: var(--primary-color); }
      .sac-ed ha-yaml-editor { display: block; margin-top: 4px; }
      .sac-ed .sac-gh { display: flex; justify-content: flex-start; margin-bottom: 8px; }
      .sac-ed .sac-gh a { display: inline-flex; align-items: center; gap: 5px; font-size: 12px;
                          color: var(--secondary-text-color); text-decoration: none;
                          padding: 4px 8px; border: 1px solid var(--divider-color);
                          border-radius: 6px; transition: color .15s, border-color .15s; }
      .sac-ed .sac-gh a:hover { color: var(--primary-text-color); border-color: var(--primary-color); }
    </style>

    <div class="sac-ed">
      <div class="sac-gh">
        <a href="https://github.com/martinargalas/ha-solar-arc-card" target="_blank" rel="noopener">
          ⭐ Star on GitHub
        </a>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="arc">Arc</button>
        <button class="tab"        data-tab="sankey">Sankey</button>
      </div>

      <!-- ═══ ARC TAB ═══ -->
      <div class="pane active" id="pane-arc">

        <p class="sec">Entities</p>
        <ha-textfield id="tf-sol" label="Solar / PV production *"  helper="e.g. sensor.pv_power"            helper-persistent value="${arc.solar_production  || ''}"></ha-textfield>
        <ha-textfield id="tf-hse" label="House consumption *"      helper="e.g. sensor.house_consumption"   helper-persistent value="${arc.house_consumption || ''}"></ha-textfield>
        <ha-textfield id="tf-grd" label="Grid power *"             helper="positive = export, negative = import" helper-persistent value="${arc.grid_power || ''}"></ha-textfield>
        <ha-formfield label="Invert grid sign (e.g. Shelly: positive = import)"><ha-switch id="sw-grd-inv"></ha-switch></ha-formfield>
        <ha-textfield id="tf-bat" label="Battery power (optional)" helper="positive = discharging, negative = charging" helper-persistent value="${arc.battery_power || ''}"></ha-textfield>

        <p class="sec">Display</p>
        <ha-formfield label="Show arc section"><ha-switch id="sw-arc"></ha-switch></ha-formfield>
        <ha-formfield label="Show title bar">  <ha-switch id="sw-ttl"></ha-switch></ha-formfield>
        <ha-formfield label="Show title icon"> <ha-switch id="sw-ico"></ha-switch></ha-formfield>
        <ha-textfield   id="tf-ttl"  label="Title text"></ha-textfield>
        <ha-icon-picker id="ip-ttl"  label="Title icon"></ha-icon-picker>

        <p class="sec">Flow</p>
        ${this._sel('sel-flow', 'Flow style',
            `<option value="oval"  ${(arc.flow_style||'oval')==='oval'  ? 'selected':''}>Oval</option>
             <option value="laser" ${(arc.flow_style||'')==='laser' ? 'selected':''}>Laser beam</option>`)}
        <div class="row2">
          <ha-textfield id="tf-slow" label="Count (slow)" type="number" min="1" max="4"></ha-textfield>
          <ha-textfield id="tf-fast" label="Count (fast)" type="number" min="1" max="4"></ha-textfield>
        </div>

        <p class="sec">Colors</p>
        ${cs('col-grd', 'Grid',               as.arc_grid_color)}
        ${cs('col-hse', 'Home',               as.arc_home_color)}
        ${cs('col-sol', 'Solar flow (day)',   as.arc_sun_flow_color)}
        ${cs('col-moo', 'Solar flow (night)', as.arc_moon_flow_color)}
        ${cs('col-inv', 'Inverter node',      as.arc_inverter_color)}
        ${cs('col-ina', 'Inactive nodes',     as.arc_inactive_color)}
        ${cs('col-ico', 'Node icons',         as.arc_icon_color)}
        ${cs('col-txt', 'Text',               as.arc_text_color)}
        ${cs('col-ttc', 'Title text color',   as.arc_title_text_color)}
        ${cs('col-tic', 'Title icon color',   as.arc_title_icon_color)}
        ${cs('col-bdc', 'Battery discharge',  as.arc_battery_discharge_color)}
        ${cs('col-bcc', 'Battery charge',     as.arc_battery_charge_color)}
      </div>

      <!-- ═══ SANKEY TAB ═══ -->
      <div class="pane" id="pane-sankey">

        <p class="sec">Display</p>
        <ha-formfield label="Show Sankey section"><ha-switch id="sw-sk"></ha-switch></ha-formfield>
        <ha-formfield label="Show title bar">     <ha-switch id="sw-sk-ttl"></ha-switch></ha-formfield>
        <ha-formfield label="Show title icon">    <ha-switch id="sw-sk-ico"></ha-switch></ha-formfield>
        <ha-textfield   id="tf-sk-ttl"  label="Title text"></ha-textfield>
        <ha-icon-picker id="ip-sk-ttl"  label="Title icon"></ha-icon-picker>
        ${this._sel('sel-layout', 'Layout',
            `<option value="horizontal" ${(sk.layout||'horizontal')==='horizontal' ? 'selected':''}>Horizontal</option>
             <option value="vertical"   ${(sk.layout||'')==='vertical' ? 'selected':''}>Vertical</option>`)}

        <p class="sec">Colors</p>
        ${cs('col-sk-tic', 'Title icon color', ss.sankey_title_icon_color)}
        ${cs('col-sk-ttc', 'Title text color', ss.sankey_title_text_color)}
        ${cs('col-sk-tp',  'Node name color',  ss.sankey_text_color_primary)}
        ${cs('col-sk-ts',  'Node value color', ss.sankey_text_color_secondary)}

        <p class="sec">Sections</p>
        <p class="yaml-note">
          Configure energy flow columns in YAML.
          <a href="https://github.com/martinargalas/ha-solar-arc-card#sankeysections--entity-options"
             target="_blank">Documentation ↗</a>
        </p>
        <ha-yaml-editor id="sect-yaml"></ha-yaml-editor>
      </div>
    </div>`;

    // ── Wire events ─────────────────────────────────────────────────────────
    // Tabs
    this.querySelectorAll('.tab').forEach(btn =>
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this.querySelectorAll('.tab') .forEach(b => b.classList.toggle('active', b.dataset.tab === this._tab));
        this.querySelectorAll('.pane').forEach(p => p.classList.toggle('active', p.id === `pane-${this._tab}`));
      })
    );

    // Entity text fields — change fires on blur after edit
    const ef = (id, ...path) =>
      this.querySelector(`#${id}`)?.addEventListener('change', e => this._update(e.target.value.trim(), ...path));
    ef('tf-sol', 'arc', 'solar_production');
    ef('tf-hse', 'arc', 'house_consumption');
    ef('tf-grd', 'arc', 'grid_power');
    ef('tf-bat', 'arc', 'battery_power');

    // Switches
    const sw = (id, ...path) =>
      this.querySelector(`#${id}`)?.addEventListener('change', e => this._update(e.target.checked, ...path));
    sw('sw-arc',     'arc', 'arc_show');
    sw('sw-ttl',     'arc', 'arc_title_show');
    sw('sw-ico',     'arc', 'arc_title_icon_show');
    sw('sw-grd-inv', 'arc', 'grid_power_inverted');
    sw('sw-sk',     'sankey', 'sankey_show');
    sw('sw-sk-ttl', 'sankey', 'sankey_title_show');
    sw('sw-sk-ico', 'sankey', 'sankey_title_icon_show');

    // Text fields
    const tf = (id, coerce, ...path) =>
      this.querySelector(`#${id}`)?.addEventListener('change', e => this._update(coerce(e.target.value), ...path));
    tf('tf-ttl',    String, 'arc',    'arc_title_text');
    tf('tf-slow',   Number, 'arc',    'flow_count_slow');
    tf('tf-fast',   Number, 'arc',    'flow_count_fast');
    tf('tf-sk-ttl', String, 'sankey', 'sankey_title_text');

    // Icon pickers
    const ip = (id, ...path) =>
      this.querySelector(`#${id}`)?.addEventListener('value-changed', e => this._update(e.detail.value, ...path));
    ip('ip-ttl',    'arc',    'style', 'arc_title_icon');
    ip('ip-sk-ttl', 'sankey', 'style', 'sankey_title_icon');

    // Non-color selects (flow style, layout)
    const sel = (id, ...path) =>
      this.querySelector(`#${id}`)?.addEventListener('change', e => this._update(e.target.value, ...path));
    sel('sel-flow',   'arc',    'flow_style');
    sel('sel-layout', 'sankey', 'layout');

    // Color rows: select + color picker, keep each other in sync
    const cr = (id, ...path) => {
      const elSel = this.querySelector(`#${id}`);
      const elCp  = this.querySelector(`#${id}-cp`);
      // Select → update config + sync picker
      elSel?.addEventListener('change', e => {
        const val = e.target.value;
        if (elCp) { elCp.value = val || '#aaaaaa'; elCp.style.opacity = val ? '1' : '0.3'; }
        this._update(val, ...path);
      });
      // Color picker → update config + sync select (or show Custom)
      elCp?.addEventListener('input', e => {
        const val = e.target.value;  // always a valid #rrggbb hex
        elCp.style.opacity = '1';
        if (elSel) {
          const found = _EDITOR_COLORS.find(c => c.value.toLowerCase() === val.toLowerCase());
          if (found) {
            elSel.value = found.value;
          } else {
            // Ensure a "Custom" option exists and select it
            let custom = elSel.querySelector('option[data-custom]');
            if (!custom) {
              custom = document.createElement('option');
              custom.setAttribute('data-custom', '1');
              elSel.appendChild(custom);
            }
            custom.value = val;
            custom.textContent = `Custom (${val})`;
            elSel.value = val;
          }
        }
        this._update(val, ...path);
      });
    };
    cr('col-grd', 'arc', 'style', 'arc_grid_color');
    cr('col-hse', 'arc', 'style', 'arc_home_color');
    cr('col-sol', 'arc', 'style', 'arc_sun_flow_color');
    cr('col-moo', 'arc', 'style', 'arc_moon_flow_color');
    cr('col-inv', 'arc', 'style', 'arc_inverter_color');
    cr('col-ina', 'arc', 'style', 'arc_inactive_color');
    cr('col-ico', 'arc', 'style', 'arc_icon_color');
    cr('col-txt', 'arc', 'style', 'arc_text_color');
    cr('col-ttc', 'arc', 'style', 'arc_title_text_color');
    cr('col-tic', 'arc', 'style', 'arc_title_icon_color');
    cr('col-bdc', 'arc', 'style', 'arc_battery_discharge_color');
    cr('col-bcc', 'arc', 'style', 'arc_battery_charge_color');
    cr('col-sk-tic', 'sankey', 'style', 'sankey_title_icon_color');
    cr('col-sk-ttc', 'sankey', 'style', 'sankey_title_text_color');
    cr('col-sk-tp',  'sankey', 'style', 'sankey_text_color_primary');
    cr('col-sk-ts',  'sankey', 'style', 'sankey_text_color_secondary');

    // YAML sections
    this.querySelector('#sect-yaml')?.addEventListener('value-changed', e => {
      if (e.detail?.value !== undefined) {
        this._sections = e.detail.value;
        this._update(e.detail.value, 'sankey', 'sections');
      }
    });
  }

  // ── Sync values into controls after each setConfig ────────────────────────
  _syncValues() {
    const arc = this._config?.arc    || {};
    const as  = arc.style            || {};
    const sk  = this._config?.sankey || {};
    const ss  = sk.style             || {};

    const set = (id, v) => {
      const el = this.querySelector(`#${id}`);
      if (!el) return;
      if (el.tagName === 'HA-SWITCH') el.checked = !!v;
      else el.value = (v === undefined || v === null) ? '' : v;
    };

    requestAnimationFrame(() => {
      // Entities
      set('tf-sol', arc.solar_production  || '');
      set('tf-hse', arc.house_consumption || '');
      set('tf-grd',     arc.grid_power          || '');
      set('sw-grd-inv', arc.grid_power_inverted || false);
      set('tf-bat',     arc.battery_power       || '');

      // Arc display
      set('sw-arc', arc.arc_show !== false);
      set('sw-ttl', arc.arc_title_show !== false);
      set('sw-ico', arc.arc_title_icon_show !== false);
      set('tf-ttl', arc.arc_title_text || 'Aktuální stav');
      set('ip-ttl', as.arc_title_icon || arc.arc_title_icon || 'mdi:flash');

      // Flow counts (selects baked into HTML, only textfields need sync)
      set('tf-slow',  arc.flow_count_slow ?? 4);
      set('tf-fast',  arc.flow_count_fast ?? 2);

      // Sankey display
      set('sw-sk',      sk.sankey_show !== false);
      set('sw-sk-ttl',  sk.sankey_title_show !== false);
      set('sw-sk-ico',  sk.sankey_title_icon_show !== false);
      set('tf-sk-ttl',  sk.sankey_title_text || 'Tok energie');
      set('ip-sk-ttl', ss.sankey_title_icon || sk.sankey_title_icon || 'mdi:lightning-bolt');
      // sel-layout and color selects are baked into HTML with selected attr

      // YAML sections
      const ye = this.querySelector('#sect-yaml');
      if (ye) ye.value = this._sections ?? null;

    });
  }
}

customElements.define('solar-arc-card-editor', SolarArcCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'solar-arc-card',
  name: 'Solar Arc Card',
  description: 'Solar arc with energy flow — FVE, Grid, House',
});
