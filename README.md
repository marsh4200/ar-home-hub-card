# AR Home Hub Card

One Lovelace card for the whole house. A greeting with a live clock, status chips and scene buttons sits on top, and below it are collapsible drawers for lights, climate and motion, camera, Apple TV, geyser and amp. Only one drawer is open at a time, and the card remembers which one was last open on each device.

By AR Smart Home — [arsmarthome.co.za](https://arsmarthome.co.za)

## Install

**HACS:** add this repo as a custom repository (category *Dashboard*), install, then reload the browser.

**Manual:** copy `ar-home-hub-card.js` to `/config/www/ar-home-hub-card/` and add a dashboard resource:

```yaml
url: /local/ar-home-hub-card/ar-home-hub-card.js
type: module
```

No other cards are required. The camera and Apple TV drawers load whatever card you give them (for example `webrtc-camera` or `firemote-card`), so those need to be installed if you use them.

## Example

A full working example is in [`examples/customer-dashboard.yaml`](examples/customer-dashboard.yaml).

```yaml
type: custom:ar-home-hub-card
lights:
  - entity: switch.kitchen
    room: Kitchen
    icon: mdi:stove
climate:
  temperature: sensor.lounge_temperature
  humidity: sensor.lounge_humidity
motion:
  - binary_sensor.lounge_motion
geyser:
  switch: switch.geyser
  power: sensor.geyser_power
amp: media_player.arylic_amp
```

## Options

| Option | Description |
| --- | --- |
| `name` | Name in the greeting. Defaults to the logged-in user's first name. Set `''` for no name. |
| `subtitle` | Line under the greeting. `false` hides it. |
| `max_width` | Caps the card width, for example `560px` in a panel view. |
| `default_open` | Drawer open on first load: `lights`, `climate`, `camera`, `apple_tv`, `geyser`, `amp`, or `none`. |
| `multi_open` | `true` lets several drawers be open at once. |
| `order` | Drawer order, for example `[lights, geyser, amp]`. Drawers not listed are hidden. |
| `titles` | Override drawer titles, for example `titles: {lights: House lights}`. |
| `chips` | `false` hides the status chips. |
| `fonts` | `false` skips loading the card's Google fonts. |
| `id` | Unique id when you have more than one hub card on the same dashboard path. |

**scenes:** list of `entity` (script, scene, automation, button), `name`, `label`, `icon`, `style` (`night`, `morning`, `away`, `dusk`), `color`, `text_color`. A running script pulses.

**lights:** list of `entity`, `room`, `name`, `icon`. Works with `light.*`, `switch.*` and anything `homeassistant.toggle` accepts.

**climate:** `temperature`, `temperature_name`, `temperature_min` (default 0), `temperature_max` (default 40), `humidity`, `humidity_name`.

**motion:** list of `entity`, `name`, `icon`.

**camera:** `name`, `card` (any card config) or `entity` (a `camera.*` entity, shown live). The stream is only created while the drawer is open; set `keep_alive: true` to keep it running.

**apple_tv:** `name`, `room`, `entity` (media player for the now-playing strip and summary), `card` (for example your `firemote-card` config). Without `card` a standard media-control card is used.

**geyser:** `switch` (required), `switch_name`, `power`, `current`, `voltage`, `energy_day`, `energy_month`, `load_threshold` (watts above which it counts as heating, default 10).

**amp:** `entity`, `name`, `sources` (optional list, otherwise read from the amp), `step` (volume step for the buttons, default 5).

Tapping a gauge or motion row opens its more-info dialog. Tapping a status chip jumps to its drawer.
