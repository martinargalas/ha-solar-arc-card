# Solar Arc Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/martinargalas/ha-solar-arc-card)
[![Version](https://img.shields.io/github/v/release/martinargalas/ha-solar-arc-card?label=version&color=blue)](https://github.com/martinargalas/ha-solar-arc-card/releases/latest)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2023.x%2B-brightgreen.svg)](https://www.home-assistant.io/)
[![License: MIT](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

<p align="center">
  <img src="docs/day3.png" width="48%" alt="Day mode"/>
  &nbsp;&nbsp;
  <img src="docs/night.png" width="48%" alt="Night mode"/>
</p>

Custom Lovelace card for Home Assistant that combines two visualizations in one:

- **Arc** — animated solar arc showing sun position across the sky, real-time PV production, grid flow, and house consumption with animated energy particles
- **Sankey** — fully configurable energy flow diagram showing how power moves between sources and consumers

---

## Features

- Sun/moon arc with real-time position based on the built-in `sun.sun` entity
- Animated energy flow with two styles — `oval` (classic) or `laser` (glowing beam with gradient trail)
- Inverter ring chart showing solar vs. grid-import vs. battery-discharge ratio
- Optional battery node with charge/discharge flow
- Day/night mode with clouds, stars and moon
- macOS-style glassmorphism design
- Fully configurable Sankey diagram — unlimited sections, horizontal or vertical layout
- Full color theming for nodes, flows, glows and ring
- **Visual UI editor** — configure everything without writing YAML

---

## Installation

### HACS (recommended)

1. Open HACS in Home Assistant
2. Click the three-dot menu → **Custom repositories**
3. Add `https://github.com/martinargalas/ha-solar-arc-card` with category **Lovelace**
4. Find **Solar Arc Card** in the list and click **Download**
5. Go to **Settings → Dashboards → Manage resources** and add:
   - URL: `/hacsfiles/ha-solar-arc-card/solar-arc-card.js`
   - Type: **JavaScript Module**
6. Reload the browser

### Manual

1. Copy `solar-arc-card.js` to `/config/www/solar-arc-card.js`
2. Go to **Settings → Dashboards → Manage resources** and add:
   - URL: `/local/solar-arc-card.js`
   - Type: **JavaScript Module**
3. Reload the browser

---

## Configuration

### Minimal

```yaml
type: custom:solar-arc-card

arc:
  solar_production: sensor.pv_production_power
  house_consumption: sensor.home_consumption_power
  grid_power: sensor.grid_active_power
```

### With battery

```yaml
type: custom:solar-arc-card

arc:
  solar_production: sensor.pv_production_power
  house_consumption: sensor.home_consumption_power
  grid_power: sensor.grid_active_power
  battery_power: sensor.battery_power
```

### Full example

```yaml
type: custom:solar-arc-card

arc:
  solar_production: sensor.pv_production_power
  house_consumption: sensor.home_consumption_power
  grid_power: sensor.grid_active_power
  grid_power_inverted: false
  battery_power: sensor.battery_power

  arc_show: true
  arc_title_show: true
  arc_title_icon_show: true
  arc_title_text: "Current State"

  flow_style: oval
  flow_count_slow: 4
  flow_count_fast: 2

  style:
    arc_title_icon: mdi:flash
    arc_title_icon_color: "#FFD60A"
    arc_title_text_color: ""
    arc_text_color: ""
    arc_icon_color: ""
    arc_inverter_color: ""
    arc_grid_color: ""
    arc_home_color: ""
    arc_inactive_color: ""
    arc_sun_flow_color: ""
    arc_moon_flow_color: ""
    arc_battery_discharge_color: "#30D158"
    arc_battery_charge_color: "#30D158"

sankey:
  sankey_show: true
  layout: horizontal
  sankey_title_show: true
  sankey_title_icon_show: true
  sankey_title_text: "Energy Flow"

  style:
    sankey_title_icon: mdi:lightning-bolt
    sankey_title_icon_color: ""
    sankey_title_text_color: ""
    sankey_text_color_primary: ""
    sankey_text_color_secondary: ""

  sections:
    - entities:
        - entity_id: sensor.grid_import_power
          name: Grid
          color: "#007AFF"
          children:
            - sensor.home_consumption_power
        - entity_id: sensor.pv_production_power
          name: Solar
          color: "#FFD60A"
          children:
            - sensor.home_consumption_power
            - sensor.grid_export_power
        - entity_id: sensor.battery_power
          name: Battery
          color: "#30D158"
          children:
            - sensor.home_consumption_power
    - entities:
        - entity_id: sensor.home_consumption_power
          name: Home
          color: "#FF9500"
        - entity_id: sensor.grid_export_power
          name: Grid export
          color: "#30D158"
```

---

## Options reference

### `arc` block

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `solar_production` | string | — | PV production sensor |
| `house_consumption` | string | — | House consumption sensor |
| `grid_power` | string | — | Grid power sensor (positive = export, negative = import) |
| `grid_power_inverted` | boolean | `false` | Set to `true` if your sensor uses the opposite convention (positive = import, negative = export). Useful for Shelly and similar devices. |
| `battery_power` | string | — | Battery power sensor (positive = discharging, negative = charging). Adding this enables battery mode. |
| `arc_show` | boolean | `true` | Show/hide the entire arc section |
| `arc_title_show` | boolean | `true` | Show/hide the separator bar above arc |
| `arc_title_icon_show` | boolean | `true` | Show/hide the separator icon |
| `arc_title_text` | string | `Current State` | Separator label text |
| `flow_style` | string | `oval` | Flow animation style — `oval` or `laser` |
| `flow_count_slow` | integer | `4` | Number of ovals/beams per flow path at low power. Max `4`. |
| `flow_count_fast` | integer | `2` | Number of ovals/beams per flow path at high power. Max `4`. |

### `arc.style` block

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `arc_title_icon` | string | `mdi:flash` | MDI icon for the separator |
| `arc_title_icon_color` | string | `""` | Separator icon color (empty = card default) |
| `arc_title_text_color` | string | `""` | Separator text color (empty = card default) |
| `arc_text_color` | string | `""` | Color for all text labels in the arc (values, times) |
| `arc_icon_color` | string | `""` | Color for all node icons (inverter, grid, home, battery) |
| `arc_inverter_color` | string | `""` | Background color of the inverter node |
| `arc_grid_color` | string | `""` | Color of the grid node, glow, flow and ring |
| `arc_home_color` | string | `""` | Color of the home node, glow and flow |
| `arc_inactive_color` | string | `""` | Background color of inactive nodes |
| `arc_sun_flow_color` | string | `""` | Color of solar flow (day) |
| `arc_moon_flow_color` | string | `""` | Color of solar flow (night) |
| `arc_battery_discharge_color` | string | `""` | Color of battery node, glow, flow and ring segment when discharging |
| `arc_battery_charge_color` | string | `""` | Color of battery node, glow and flow when charging |

### `sankey` block

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `layout` | string | `horizontal` | Sankey layout — `horizontal` or `vertical` |
| `sankey_show` | boolean | `true` | Show/hide the entire sankey section |
| `sankey_title_show` | boolean | `true` | Show/hide the separator bar above sankey |
| `sankey_title_icon_show` | boolean | `true` | Show/hide the separator icon |
| `sankey_title_text` | string | `Energy Flow` | Separator label text |
| `sections` | list | — | Sankey columns (horizontal) or rows (vertical) |

### `sankey.style` block

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `sankey_title_icon` | string | `mdi:lightning-bolt` | MDI icon for the separator |
| `sankey_title_icon_color` | string | `""` | Separator icon color (empty = card default) |
| `sankey_title_text_color` | string | `""` | Separator text color (empty = card default) |
| `sankey_text_color_primary` | string | `""` | Color for node name labels |
| `sankey_text_color_secondary` | string | `""` | Color for node value labels (W) |

### `sankey.sections` — entity options

| Option | Type | Description |
|--------|------|-------------|
| `entity_id` | string | HA entity ID |
| `name` | string | Display label |
| `color` | string | Node and flow color (hex) |
| `children` | list of entity_id | Which entities in the next column/row receive power from this node |
| `type` | string | Set to `remaining_parent_state` to auto-calculate value as parent minus other children |

---

## Visual UI editor

The card includes a built-in visual editor — click the pencil icon on the card in the dashboard.

### Arc tab
- **Entities** — sensors for solar production, house consumption, grid and battery
- **Display** — section visibility, separator bar, icon and label
- **Flow** — flow style (`oval` / `laser`) and beam/oval counts
- **Colors** — all color options with a preset palette and custom color picker

### Sankey tab
- **Display** — section visibility, separator bar, icon, label and layout
- **Sections (YAML)** — YAML editor for the `sections` list

---

## Grid power convention

The `grid_power` sensor is expected to follow this sign convention:

| Value | Meaning |
|-------|---------|
| `> 0` | Exporting to grid |
| `< 0` | Importing from grid |

If your device uses the **opposite convention** (e.g. Shelly Pro where positive = import), add `grid_power_inverted: true` to your `arc` block — no template sensor needed.

## Battery power convention

The `battery_power` sensor is expected to follow this sign convention:

| Value | Meaning |
|-------|---------|
| `> 0` | Discharging (providing power) |
| `< 0` | Charging (consuming power) |

If your inverter uses the opposite convention, create a template sensor that negates the value.

---

## Requirements

- Home Assistant 2023.x or newer
- Sensors for PV production, house consumption and grid power
- Battery sensor is optional — add `battery_power` to enable battery mode
