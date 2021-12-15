<template>
  <div
    :class="'noi-mobility-atc global ' + device"
    ref="viewport"
    style="width: 100%; height: 100%; position: relative"
    v-if="options"
  >
    <vl-map
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      data-projection="EPSG:4326"
      style="width: 100%; height: 100%"
      @moveend="setExtend($event)"
    >
      <div v-for="plane in map.features" :key="plane[plane.length - 1].name">
        <vl-feature v-if="options.colors">
          <vl-geom-point
            :coordinates="plane[plane.length - 1].pos"
          ></vl-geom-point>
          <vl-style-box>
            <vl-style-icon
              :src="emitter_types[plane[plane.length - 1].type][1]"
              :scale="emitter_types[plane[plane.length - 1].type][3]"
              :rotation="
                emitter_types[plane[plane.length - 1].type][4]
                  ? 0
                  : ((plane[plane.length - 1].rotation -
                      emitter_types[plane[plane.length - 1].type][2]) *
                      3.14 *
                      2) /
                    360
              "
              :anchor="[0.5, 0.5]"
            ></vl-style-icon>
            <vl-style-text
              :text="plane[plane.length - 1].text"
              font="12px monospace"
              :offsetX="22"
              text-align="end"
            >
              <vl-style-stroke
                :color="options.colors['primary']"
                :width="3"
                v-if="plane[plane.length - 1].source == 'default'"
              ></vl-style-stroke>
              <vl-style-stroke
                :color="options.colors['secondary']"
                :width="3"
                v-else
              ></vl-style-stroke>
              <vl-style-fill
                :color="options.colors['primary_contrast']"
                :width="3"
              ></vl-style-fill>
            </vl-style-text>
          </vl-style-box>
        </vl-feature>
        <vl-feature>
          <vl-geom-line-string
            v-if="plane.length > 0"
            :coordinates="map.trails[plane[0].name]"
          ></vl-geom-line-string>
          <vl-style-box>
            <vl-style-stroke
              :color="options.colors['primary']"
              :width="3"
              v-if="plane[plane.length - 1].source == 'default'"
            ></vl-style-stroke>
            <vl-style-stroke
              :color="options.colors['secondary']"
              :width="2"
              v-else
            ></vl-style-stroke>
          </vl-style-box>
        </vl-feature>
      </div>

      <vl-view
        :zoom.sync="map.zoom"
        :center.sync="map.center"
        :rotation.sync="map.rotation"
        :min-zoom="9"
      ></vl-view>

      <vl-layer-tile id="osm">
        <vl-source-osm
          v-if="map.current_tiles != ''"
          :url="map.current_tiles"
        ></vl-source-osm>
        <vl-source-osm v-else></vl-source-osm>
      </vl-layer-tile>
    </vl-map>
    <button
      type="button"
      v-if="hideTables"
      class="btn btn-dark shadow btn-sm dark"
      @click="hideTables = false"
      style="position: absolute; top: 0.5rem; left: 0.5rem; z-index: 100001"
    >
      <img
        :src="require('@/assets/icons/list-view.png')"
        height="14px"
        style="display: inline-block; color: white"
      />
    </button>
    <div
      class="sidebar shadow"
      v-if="!hideTables"
      style="overflow-y: auto; overflow-x: hidden"
    >
      <button
        type="button"
        class="btn btn-sm"
        @click="hideTables = true"
        style="position: absolute; top: 0.5rem; right: 0.5rem; z-index: 100001"
      >
        collapse
        <img
          :src="require('@/assets/icons/collapse.png')"
          height="14px"
          style="display: inline-block"
        />
      </button>
      <div class="clock p-2 mt-4">
        {{ time }} <br />
        <span style="font-size: 80%">{{ current_region }}</span>
      </div>
      <div class="accordeon p-2">
        <div class="aitem" v-if="options.showArrivals">
          <h2 class="ma-0 p-0 dark">
            <span class="iconbg m-1">
              <img
                :src="require('@/assets/icons/arrival.png')"
                height="40px"
                style="display: inline-block"
              />
            </span>
            {{ $t("Arrivals") }}
          </h2>
          <div class="table-responsive mb-4">
            <table class="table table-dark shadow mb-0">
              <thead>
                <tr>

                  <th scope="col">{{ $t("Date") }}</th>
                  <th scope="col">{{ $t("Time") }}</th>
                               <th scope="col"></th>
                  <th scope="col">{{ $t("Origin") }}</th>
                  <th scope="col">{{ $t("Flight") }}</th>
                  <th scope="col" class="text-center">{{ $t("Remarks") }}</th>
                  <th scope="col" class="text-center">{{ $t("Gate") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="arrival in lastArrivals" :key="arrival.key">

                  <th>{{ asZoneDate(arrival.date) }}</th>
                  <th>
                    {{ asZoneTime(arrival.time) }}
                  </th>
                                    <th>
                    <a
                      href="https://www.skyalps.com/"
                      target="_blank"
                      title="Skyalps Home"
                    >
                      <img
                        :src="require('@/assets/icons/skyalpsl.png')"
                        width="62px"
                        style="display: inline-block"
                      />
                    </a>
                  </th>
                  <td v-if="airport_types[arrival.departure]">
                    {{ airport_types[arrival.departure].name }}
                  </td>
                  <td v-else></td>
                  <td>
                    {{ arrival.flight_number }}
                  </td>
                  <td class="text-center">
                    {{ arrival.remark }}
                  </td>
                  <td class="text-center">
                    {{ arrival.gate }}
                  </td>
                </tr>
                <tr
                  v-for="index in Math.max(
                    5,
                    Object.values(lastArrivals).length
                  ) - Object.values(lastArrivals).length"
                  :key="index"
                >
                  <td colspan="7"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="aitem" v-if="options.showDepartures">
          <h2 class="ma-0 p-0 dark">
            <span class="iconbg m-1">
              <img
                :src="require('@/assets/icons/departure.png')"
                height="40px"
                style="display: inline-block"
              />
            </span>
            {{ $t("Departures") }}
          </h2>
          <div class="table-responsive mb-4">
            <table class="table table-dark shadow mb-0">
              <thead>
                <tr>

                  <th scope="col">{{ $t("Date") }}</th>
                  <th scope="col">{{ $t("Time") }}</th>
                          <th scope="col"></th>
                  <th scope="col">
                    {{ $t("Destination") }}
                  </th>
                  <th scope="col">{{ $t("Flight") }}</th>

                  <th scope="col" class="text-center">{{ $t("Remarks") }}</th>
                  <th scope="col" class="text-center">{{ $t("Gate") }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="departure in lastDepartures" :key="departure.key">

                  <th>
                    {{ asZoneDate(departure.date) }}
                  </th>
                  <th>
                    {{ asZoneTime(departure.time) }}
                  </th>
                                    <th>
                    <a
                      href="https://www.skyalps.com/"
                      target="_blank"
                      title="Skyalps Home"
                    >
                      <img
                        :src="require('@/assets/icons/skyalpsl.png')"
                       width="62px"
                        style="display: inline-block"
                      />
                    </a>
                  </th>
                  <td v-if="airport_types[departure.arrival]">
                    {{ airport_types[departure.arrival].name }}
                  </td>
                  <td v-else></td>
                  <td>{{ departure.flight_number }}</td>

                  <td class="text-center">
                    {{ departure.remark }}
                  </td>
                  <td class="text-center">{{ departure.gate }}</td>
                </tr>
                <tr
                  v-for="index in Math.max(
                    5,
                    Object.values(lastDepartures).length
                  ) - Object.values(lastDepartures).length"
                  :key="index"
                >
                  <td colspan="7"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="aitem" v-if="options.showRealtimeTable">
          <h3 class="mb-0 text-center">
            {{ $t("Realtime data") }}
          </h3>
          <div class="table-responsive mb-2">
            <table class="table table-dark table-secondary mb-0 realtime">
              <thead>
                <tr>
                  <th scope="col">
                    {{ $t("Flight") }} <br />
                    &nbsp;
                  </th>
                  <th scope="col">
                    {{ $t("Type") }} <br />
                    &nbsp;
                  </th>
                  <th scope="col" class="text-center">
                    {{ $t("Altitude") }} <br />
                    ({{ units.alt }})
                  </th>
                  <th scope="col" class="text-center">
                    {{ $t("Speed") }} <br />
                    ({{ units.speed }})
                  </th>
                  <th scope="col" class="text-end">
                    {{ $t("Track") }} <br />
                    (°)
                  </th>
                </tr>
              </thead>
              <tbody v-if="map.features">
                <tr
                  v-for="flight in map.features"
                  :key="flight[flight.length - 1].name"
                >
                  <th>{{ flight[flight.length - 1].tail }}</th>
                  <td>
                    {{ $t(emitter_types[flight[flight.length - 1].type][0]) }}
                  </td>
                  <td scope="col" class="text-center">
                    {{ ftOrM(flight[flight.length - 1].alt) }}
                  </td>
                  <td scope="col" class="text-center">
                    {{ ktsOrKmh(flight[flight.length - 1].speed) }}
                  </td>
                  <td scope="col" class="text-end">
                    {{ ktsOrKmh(flight[flight.length - 1].rotation) }}
                  </td>
                </tr>
                <tr
                  v-for="index in Math.max(
                    10,
                    Object.values(map.features).length
                  ) - Object.values(map.features).length"
                  :key="index"
                >
                  <td colspan="5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div
      class="btn-group"
      role="group"
      v-if="options.regionSwitcher"
      style="position: absolute; bottom: 25px; left: 12px; z-index: 10000"
    >
      <button
        type="button"
        v-for="regions in options.regions"
        class="btn btn-dark shadow"
        :class="{
          active:
            regions.center[0] == map.center[0] &&
            regions.center[1] == map.center[1],
        }"
        :key="regions.label"
        @click="changeRegion(regions)"
      >
        {{ regions.label }}
      </button>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { DateTime } from "luxon";
import { getBottomLeft, getTopRight } from "ol/extent";
import { toLonLat } from "ol/proj";

export default {
  name: "NoiFlightControl",
  props: {
    options: Object,
    default: () => {
      return {};
    },
  },
  methods: {
    asZoneTime(utctime = "00:00") {
      if (utctime == "") return "";
      let datetime = DateTime.fromFormat(utctime, "T", { zone: "UTC" });
      datetime = datetime.setZone(this.options.timezone);
      return datetime.toFormat("HH:mm");
    },
    asZoneDate(utcdate = "2022-01-01") {
      if (utcdate == "") return "";
      let datetime = DateTime.fromFormat(utcdate, "yyyy-LL-dd", {
        zone: "UTC",
      });
      datetime = datetime.setZone(this.options.timezone);
      return datetime.toFormat("dd/LL/yyyy");
    },
    updateTime() {
      let time = DateTime.utc();
      time = time.setZone(this.options.timezone);
      this.time = time.toFormat("TTT");
    },
    setExtend(evt) {
      const map = evt.map;
      const extent = map.getView().calculateExtent(map.getSize());

      const bottomLeft = toLonLat(getBottomLeft(extent));
      const topRight = toLonLat(getTopRight(extent));

      this.map.viewport = {
        maxLat: topRight[1],
        minLat: bottomLeft[1],
        maxLng: topRight[0],
        minLng: bottomLeft[0],
      };
    },
    getIcon: function (index) {
      let icon = this.icons[index];
      return atob(icon);
    },
    // wc kiss
    $t: function (mess) {
      const messages = require("../mappings/messages.json");
      const lang = this.options.lang || "en";
      return messages && messages[lang] && messages[lang][mess]
        ? messages[lang][mess]
        : mess;
    },
    changeRegion(region = false) {
      if (!region && this.options.regions.length > 0)
        region = this.options.regions[0];
      if (region) {
        this.map.center = region.center;
        this.map.zoom = region.zoom;
      }
    },
    ktsOrKmh: function (kts) {
      if (isNaN(kts)) return kts;
      kts = parseInt(kts, 10);
      if (this.options.metricUnits)
        return parseInt(kts * 2 - kts * 2 * 0.1, 10);
      else return kts;
    },
    kmhAsKts: function (kmh) {
      kmh = parseInt(kmh, 10);
      return parseInt(kmh / 1.852, 10);
    },
    ftOrM: function (ft) {
      if (isNaN(ft)) return ft;
      ft = parseInt(ft, 10);
      if (this.options.metricUnits) return parseInt(ft / 3.2808, 10);
      return ft;
    },
    mAsFt: function (m) {
      m = parseInt(m, 10);
      return parseInt(m * 3.2808, 10);
    },
    getTrail: function (id) {
      var trail = [];
      for (var feature in this.map.features[id]) {
        trail.push(this.map.features[id][feature].pos);
      }

      if (trail.length > 1) {
        trail.shift();
      }

      return trail;
    },
    age: function (past) {
      return Math.floor(Date.now() / 1000) - past;
    },
    async fetchSkyalps() {
      try {

        // TODO: if env-bug=fixed remove hardcoded fallback
        let { data } = await axios.get(process.env.VUE_APP_REST_API ? process.env.VUE_APP_REST_API : "https://mqtt.rmbdev.cloud/mqtt/rest/flightdata-scheduled");

        // remove obsolete entries
        data = data.filter((val) => {
          const json = JSON.parse(val.rawdata);
          const flightdate = DateTime.fromFormat(json.date, "yyyy-LL-dd", {
            zone: "UTC",
          });
          return flightdate > DateTime.now().minus({ day: 1 });
        });

        // split data
        this.departures = data.filter((val) => {
          const json = JSON.parse(val.rawdata);
          return json.type == "DEPARTURE";
        });

        this.arrivals = data.filter((val) => {
          const json = JSON.parse(val.rawdata);
          return json.type == "ARRIVAL";
        });

        // sort by timestamps
        this.arrivals.sort(this.sortTimestamp);
        this.departures.sort(this.sortTimestamp);

        // group by key, keep newest entry/key
        let sarrivals = {};
        let sdepartures = {};

        for (var i = 0; i < this.arrivals.length; i++) {
          let arr = this.arrivals[i];
          arr = JSON.parse(arr.rawdata);
          const key =
            arr.date +
            "-" +
            arr.flight_number +
            "-" +
            arr.arrival +
            "-" +
            arr.departure;
          if (typeof sarrivals[key] == "undefined") sarrivals[key] = [];
          sarrivals[key] = arr;
        }

        for (i = 0; i < this.departures.length; i++) {
          let arr = this.departures[i];
          arr = JSON.parse(arr.rawdata);
          const key =
            arr.date +
            "-" +
            arr.flight_number +
            "-" +
            arr.arrival +
            "-" +
            arr.departure;
          if (typeof sdepartures[key] == "undefined") sdepartures[key] = [];
          sdepartures[key] = arr;
        }

        this.arrivals = Object.values(sarrivals).sort(this.sortDateTime);
        this.departures = Object.values(sdepartures).sort(this.sortDateTime);
      } catch (error) {
        console.error(error);
      }
    },
    sortTimestamp: function (a, b) {
      if (a.timestamp < b.timestamp) {
        return -1;
      }
      if (a.timestamp > b.timestamp) {
        return 1;
      }
      return 0;
    },
    sortDateTime: function (a, b) {
      const adate = a.date + "/" + a.time;
      const bdate = b.date + "/" + b.time;

      let adatetime = DateTime.fromFormat(adate, "yyyy-LL-dd/H:mm", {
        zone: "UTC",
      });
      let bdatetime = DateTime.fromFormat(bdate, "yyyy-LL-dd/H:mm", {
        zone: "UTC",
      });
      if (adatetime < bdatetime) {
        return -1;
      }
      if (adatetime > bdatetime) {
        return 1;
      }
      return 0;
    },
    resizer: function () {
      const wi = this.$refs.viewport.clientWidth;
      this.device = "desktop";
      if (wi < 768) this.device = "tablet";
      if (wi < 480) this.device = "smartphone";
    },
    garbageCollector: function () {
      for (var plane in this.map.features) {
        var waypoints = this.map.features[plane].slice();
        for (var a = 0; a < waypoints.length; a++) {
          const age = this.age(waypoints[a].received_at);
          if (age > this.options.maxAge) {
            this.map.features[plane].splice(a, 1);
          }
        }
        if (this.map.features[plane].length == 0)
          delete this.map.features[plane];
      }
    },
    updateTraffic: async function (data, type = "features") {
      var id = data.Icao_addr.toString();
      if (!data.source) data.source = "default";

      // first default datapoints of single aircrafts are not reliable atm
      if (typeof this.idmap[id] == "undefined") this.idmap[id] = 0;
      this.idmap[id]++;
      if (this.idmap[id] < 5 && data.source == "default") {
        return;
      }

      const os_id = id.substring(0, id.length - 2);

      // sensor data exists
      if (typeof this.map[type][os_id] != "undefined") {
        // delete os data
        if (id.indexOf("os") != -1 && typeof this.map[type][id] != "undefined")
          delete this.map[type][id];
        return;
      }

      if (typeof this.map[type][id] == "undefined") {
        this.$set(this.map[type], id, []);
      }

      if (typeof this.map.trails[id] == "undefined") {
        this.$set(this.map.trails, id, []);
      }

      if (this.map[type][id].length >= 2000) this.map[type][id].shift();

      let newone = {
        name: id,
        tail: data.Tail,
        alt: isNaN(data.Alt) || data.Alt == null ? "n.a." : data.Alt,
        speed: isNaN(data.Speed) || data.Speed == null ? "n.a." : data.Speed,
        type: data.Emitter_category,
        callsign: data.Tail,
        rotation: data.Track,
        description: data.Tail,
        pos: [parseFloat(data.Lng), parseFloat(data.Lat)],
        received_at: Math.floor(Date.now() / 1000),
        source: data.source,
      };

      newone.text = newone.callsign;

      if (newone.source == "default")
        newone.text +=
          "\r\n" +
          this.ftOrM(newone.alt) +
          this.units.alt +
          "\r\n" +
          this.ktsOrKmh(newone.speed) +
          this.units.speed;

      this.$set(this.map[type][id], this.map[type][id].length, newone);

      this.map.trails[id] = this.getTrail(id);

      return this.map[type];
    },
    initWebsockets: function () {
      // TODO: if env-bug=fixed remove hardcoded fallback
      this.connection = new WebSocket(process.env.VUE_APP_MQTT_WS ? process.env.VUE_APP_MQTT_WS : "wss://mqtt.rmbdev.cloud/mqtt/ws/flightdata/sbs-aggregated");

      this.connection.onmessage = (event) => {
        this.updateTraffic(JSON.parse(event.data));
      };

      this.connection.onerror = function (event) {
        console.error(event);
      };

      this.connection.onopen = () => {
        // if open, keep open
        setInterval(() => {
          if (this.connection.readyState === this.connection.OPEN)
            this.connection.send("ping");
          else this.initWebsockets();
        }, 5000);
      };
    },
  },
  computed: {
    lastArrivals() {
      return this.arrivals.slice(0, this.options.maxforecast);
    },
    lastDepartures() {
      return this.departures.slice(0, this.options.maxforecast);
    },
  },
  mounted: function () {
    this.changeRegion();
    if (this.options.metricUnits) {
      this.units = {
        speed: "km/h",
        alt: "m",
      };
    }
    this.resizer();
  },
  created: async function () {
    // arrivals/departures
    setInterval(this.fetchSkyalps, 60000 * 5);

    // clock
    setInterval(this.updateTime, 1000);

    // everything older than Xsec will be removed
    setInterval(this.garbageCollector, 500);

    // realtime data from integrator websockets
    this.initWebsockets();

    // fetch skyalps flight data (tbd/poc)
    this.fetchSkyalps();

    window.addEventListener("resize", this.resizer);

    if (this.options.regions.length > 0)
      this.current_region = this.options.regions[0].label;
  },
  destroyed() {
    window.removeEventListener("resize", this.resizer);
  },
  data: function () {
    return {
      device: "desktop",
      hideTables: false,
      idmap: {},
      current_region: "",
      map: {
        zoom: 10,
        current_tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        center: [11.708702923355805, 46.62007074044277],
        rotation: 0,
        viewport: {
          minLat: 45.3702,
          minLng: 9.4166,
          maxLat: 47.3768,
          maxLng: 13.9527,
        },
        features: {},
        trails: {},
      },
      arrivals: [],
      departures: [],
      time: "00:00:00 UTC",
      units: {
        speed: "kts",
        alt: "ft",
      },
      emitter_types: require("../mappings/sender_types.js"),
      airport_types: require("../mappings/airport_types.js"),
    };
  },
};
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";
@import "~vuelayers/lib/style.css";

.noi-mobility-atc {
  font-family: var(--noi-font-family, Verdana);
  font-size: var(--basic-font-size, 10px);
  color: var(--noi-primary, #0068b4);

  table {
    font-size: var(--basic-font-size, 12px);
    td,
    th {
      font-family: monospace;
      line-height: 20px;
    }
    td {
      color: var(--noi-jam-strong, #ffffff);
    }

    &.realtime {
      td {
        color: white;
      }
    }
  }

  .ol-zoom {
    display: none;
  }

  h2 {
    line-height: 40px;
    margin-bottom: 2px;
    padding-top: 4px;

    &.dark {
      background: var(--noi-jam-strong, #e4c200);
    }

    .iconbg {
      display: inline-block;
      background: black;
      border-radius: 5px;
      padding: 4px;
    }
  }

  h3 {
    background: var(--noi-jam-light, #aaa);
  }

  .dark {
    img {
      -webkit-filter: invert(1);
      filter: invert(1);
    }
  }

  tr {
    height: 31px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--noi-primary, #000000);
  }

  h1 {
    font-size: var(--h1-font-size, 3rem);
  }

  h2 {
    font-size: var(--h2-font-size, 2rem);
  }

  h3 {
    font-size: var(--h3-font-size, 2rem);
  }

  .sidebar {
    color: var(--noi-primary, #000000);
    width: 500px;
    height: 100%;
    background-color: var(--noi-primary-contrast, #ffffff);
    color: white;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100000;
    max-width: 100%;
  }

  .clock {
    color: var(--noi-primary, #000000);
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    font-family: monospace;
  }

  .ol-attribution.ol-uncollapsible {
    right: auto;
    left: 5px;
    bottom: 10px;
    background: transparent;
    color: white;
    border-radius: 0;
  }

  .sm-only {
    display: none;
  }

  .table > :not(caption) > * > * {
    padding:0.2rem 0.2rem;
  }

  /* 'container'-queries */
  &.tablet {
    .sm-only {
      display: block;
    }
  }

  &.smartphone {
    .sm-only {
      display: block;
    }
  }
}
</style>
