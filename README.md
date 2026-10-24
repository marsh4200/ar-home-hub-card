# AR Home Hub Card

One Lovelace card for the whole house. At the top: a greeting with a live clock, a **who's home** strip with each person's photo, status chips, and scene buttons. Below that are collapsible **sections** you pick yourself, in any order and as many as you like: lights, security, climate, TV and audio, solar and load-shedding, gate and blinds, motion, people, doorbell, weather, water, irrigation, appliances, EV charger, network, geyser, amp, a single camera, or **your own custom section** with any name, icon, colour and entities.

Only one section is open at a time, and each device remembers which one was last open.

By AR Smart Home — [arsmarthome.co.za](https://arsmarthome.co.za)

## Install

**HACS:** add this repo as a custom repository (category *Dashboard*), install, then reload the browser.

**Manual:** copy `ar-home-hub-card.js` to `/config/www/ar-home-hub-card/` and add a dashboard resource:

```yaml
url: /local/ar-home-hub-card/ar-home-hub-card.js
type: module
```

No other cards are required. Camera live views use Home Assistant's own picture card unless you give a camera its own `card:` (for example `webrtc-camera`), and the TV section can show any remote card you like under it.

## Setting it up

1. Edit the dashboard, **Add card**, pick **AR Home Hub Card**. The card scans the house and starts with lights, people, alarm, cameras, doors, ACs, TVs, solar, covers, motion, weather and so on already in the right sections.
2. Open the card editor to:
   - rename the section, change its icon and colour, or hide its chips;
   - add or remove entities. Each picker only lists entities that fit that section;
   - rename any entity (**Show as**), give it an icon or a room label. Handy for HDL channels like `switch.hdl_1_200_ch1` → *Lounge lights*;
   - move sections up and down, delete them, or **Add section** of any type;
   - **Scan my home** again at any time to rebuild the sections.
3. Or use YAML: see [`examples/full-house.yaml`](examples/full-house.yaml) for every section type.

### Upgrading from v1

Your existing config keeps working unchanged: the old `lights:`, `climate:`, `motion:`, `camera:`, `apple_tv:`, `geyser:` and `amp:` keys are read as sections automatically. Open the editor and tap **Convert to sections** when you want to add the new section types from the editor. [`examples/customer-dashboard.yaml`](examples/customer-dashboard.yaml) is a v1 config that still works.

## Who's home

Who's home uses Home Assistant **People** (`person.*` entities):

1. **Settings → People**: add each person, set **Track device** to their phone (the Home Assistant Companion app), and add a photo. The card shows that photo.
2. **Settings → Areas & zones → Zones**: add places like *Work* or *School* so the card says “At Work” instead of “Away”.
3. Put the people under `presence:` for the strip at the top, and/or add a `presence` section for the bigger cards with “since”, distance from home and phone battery.

## Card options

| Option | Description |
| --- | --- |
| `name` | Name in the greeting. Defaults to the logged-in user's first name. `''` for no name. |
| `greeting` | Replace the whole greeting line with your own text. |
| `subtitle` | Line under the greeting. `false` hides it. |
| `presence` | List of `person.*` entities for the who's-home strip. Each can be `{ entity, name, picture }`. |
| `scenes` | Scene buttons: `entity` (script, scene, automation, button), `name`, `label`, `icon`, `style` (`night`, `morning`, `away`, `dusk`), `color`, `text_color`. |
| `sections` | The list of sections, in order (see below). |
| `hide_chips` | Chips to keep off the top row, e.g. `[alarm, lights, doors]`. Keys: `people`, `lights`, `alarm`, `doors`, `locks`, `temperature`, `humidity`, `ac`, `motion`, `media`, `solar`, `battery`, `loadshedding`, `covers`, `geyser`, `weather`, `irrigation`, `appliances`, `ev`, `network`, `doorbell`, `custom`. |
| `chips` | `false` hides all chips. |
| `max_chips` | Most chips shown at once (default 12). |
| `max_width` | Caps the card width, e.g. `560px` in a panel view. |
| `default_open` | Section open on first load: a section `id` or type, or `none`. |
| `multi_open` | `true` lets several sections be open at once. |
| `clock` | `false` hides the clock. |
| `fonts` | `false` skips loading the card's Google fonts. |
| `id` | Unique id when you have more than one hub card on the same dashboard path. |

## Sections

Every section takes `type` plus these common options: `name`, `icon`, `color` (`amber`, `ember`, `cyan`, `teal`, `violet`, `red`, `rose`, `sky`, `lime` or any CSS colour), `subtitle` (fixed text under the title), `chips: false` (keep its chips off the top), `id` (for `default_open`) and `hidden: true`.

**Any entity in any list** can be written as just the entity id, or as an object to rename it:

```yaml
entities:
  - light.kitchen
  - entity: switch.hdl_1_200_ch1
    name: Lounge lights
    icon: mdi:ceiling-light
```

Tap a tile to use it; press and hold any entity for its more-info dialog.

| Type | What it shows | Options |
| --- | --- | --- |
| `lights` | Light tiles that glow when on, and **All off** | `entities` (each: `name`, `room`, `icon`), `columns` |
| `security` | Alarm ring with Disarm / Home / Away / Night, camera tiles (tap for live), doors and windows, locks | `alarm` (or `{ entity, code }`), `modes` (e.g. `[arm_home, arm_away]`), `cameras` (each: `name`, `motion` sensor that makes the tile glow, `card` for your own live card, `refresh` seconds), `contacts`, `locks`. If the alarm needs a code, a code box appears. |
| `climate` | AC dial with − / +, modes, fan speed; tabs for several ACs; temperature and humidity rings | `entities` (climate), `sensors` (each: `name`, `temperature`, `humidity`), `motion`, `step` |
| `media` | Now playing with art, controls, volume, app or source buttons; tabs for several players | `entities` (media players, each can have `room`), `apps` (each: `name`, `source`, `image`, `icon`, `color`, or `action` + `data`), `apps_style: chips`, `apps_position: top`, `show_app_names`, `remote_card` (any card, e.g. Firemote), `player` (`compact` = small now-playing strip with your remote front and centre, the default when `remote_card` is set; `full` = big built-in player with controls and volume) |
| `energy` | Solar → home / battery / grid flow, load-shedding banner, today's kWh | `solar`, `load`, `grid`, `grid_invert`, `battery_power`, `battery_invert` (Sunsynk/Deye: positive = discharging), `battery_soc`, `battery_capacity` (kWh, for hours left), `loadshedding_stage`, `loadshedding_area` (works with the Load Shedding integration), `solar_today`, `load_today`, `grid_today`, `battery_low` |
| `covers` | Gate and garage with one Open / Close / Stop button, blinds with up / stop / down and position | `entities` (each: `kind`: `gate`, `blind` or `pulse` for a relay/button that opens a gate) |
| `motion` | Each sensor with a 24-hour activity strip from history | `entities`, `history: false` |
| `presence` | A card per person: home / away / zone, since when, distance, phone battery | `entities` (each: `battery` sensor if it isn't found automatically) |
| `doorbell` | Snapshot (tap for live), ringing banner, buttons such as Open gate; opens itself when it rings | `camera`, `card`, `ding` (binary sensor or event), `buttons`, `open_on_ring`, `refresh` |
| `weather` | Now plus a daily forecast | `entity`, `days`, `forecast_type` |
| `water` | Tank level, pumps and valves, usage | `tank`, `tank_name`, `usage`, `usage_name`, `switches` |
| `irrigation` | Zones (time left while running), next run, rain delay | `zones` (each: `remaining`), `next_run`, `rain_delay`, `master`, `extra` |
| `appliances` | Washer, dryer, dishwasher: running, time left, done | `entities` (status sensor or switch; each: `remaining`, `power`, `progress`, `switch`, `total`, `threshold`, `color`) |
| `ev` | Car battery bar with target, charging power, session energy, range, charger switch | `charger`, `power`, `battery`, `range`, `plug`, `target`, `energy`, `status`, `car_name` |
| `network` | Internet online/offline, speeds, devices, plus any tiles | `internet`, `download`, `upload`, `ping`, `clients`, `entities` |
| `geyser` | Animated tank, switch, power, kWh today and this month | `switch`, `switch_name`, `power`, `current`, `voltage`, `energy_day`, `energy_month`, `temperature`, `load_threshold` |
| `amp` | Volume knob, sources, mute, power | `entity`, `sources`, `step` |
| `camera` | One camera, live, using any card | `entity` or `card`, `keep_alive` |
| `custom` | **Your own section.** Any entities, each shown by its type: switches toggle, sensors show their value, scripts and buttons run, covers and locks work from the tile, people show home/away | `entities`, `columns`, `card` (any extra card underneath) |

### Your own section

```yaml
- type: custom
  name: Utilities
  icon: mdi:meter-electric
  color: amber
  entities:
    - entity: sensor.prepaid_units
      name: Prepaid units
    - sensor.water_today
    - switch.pool_pump
```
