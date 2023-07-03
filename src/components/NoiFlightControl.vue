<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: AGPL-3.0-or-later
-->

<template>
  <div :class="'noi-mobility-atc global ' + device + ' ' + options.theme"
       ref="viewport"
       style="width: 100%; height: 100%; min-height: 200px; position: relative"
       v-if="options">
    <vl-map :load-tiles-while-animating="true"
            :load-tiles-while-interacting="true"
            v-if="options.showMap"
            data-projection="EPSG:4326"
            style="width: 100%; height: 100%; min-height: 200px"
            @moveend="setExtend($event)">
      <div v-for="plane in map.features"
           :key="plane[plane.length - 1].name">
        <vl-feature v-if="options.colors">
          <vl-geom-point :coordinates="plane[plane.length - 1].pos"></vl-geom-point>
          <vl-style-box>
            <vl-style-icon :src="emitter_types[plane[plane.length - 1].type][1]"
                           :scale="emitter_types[plane[plane.length - 1].type][3]"
                           :rotation="emitter_types[plane[plane.length - 1].type][4]
                               ? 0
                               : ((plane[plane.length - 1].rotation -
                                 emitter_types[plane[plane.length - 1].type][2]) *
                                 3.14 *
                                 2) /
                               360
                             "
                           :anchor="[0.5, 0.5]"></vl-style-icon>
            <vl-style-text :text="plane[plane.length - 1].text"
                           font="12px monospace"
                           :offsetX="80"
                           text-align="end">
              <vl-style-stroke :color="options.colors['primary']"
                               :width="3"
                               v-if="plane[plane.length - 1].source == 'default'"></vl-style-stroke>
              <vl-style-stroke :color="options.colors['secondary']"
                               :width="3"
                               v-else></vl-style-stroke>
              <vl-style-fill :color="options.colors['primary_contrast']"
                             :width="3"></vl-style-fill>
            </vl-style-text>
          </vl-style-box>
        </vl-feature>
        <vl-feature>
          <vl-geom-line-string v-if="plane.length > 0 && false"
                               :coordinates="map.trails[plane[0].name]"></vl-geom-line-string>
          <vl-style-box>
            <vl-style-stroke :color="options.colors['primary']"
                             :width="3"
                             v-if="plane[plane.length - 1].source == 'default'"></vl-style-stroke>
            <vl-style-stroke :color="options.colors['secondary']"
                             :width="2"
                             v-else></vl-style-stroke>
          </vl-style-box>
        </vl-feature>
      </div>

      <vl-view :zoom.sync="map.zoom"
               :center.sync="map.center"
               :rotation.sync="map.rotation"
               :min-zoom="9"></vl-view>

      <vl-layer-tile id="osm">
        <vl-source-osm v-if="map.current_tiles != ''"
                       :url="map.current_tiles"></vl-source-osm>
        <vl-source-osm v-else></vl-source-osm>
      </vl-layer-tile>
    </vl-map>
    <button type="button"
            v-if="hideTables"
            class="btn btn-dark shadow btn-sm dark"
            @click="hideTables = false"
            style="position: absolute; top: 0.5rem; right: 0.5rem; z-index: 100001">
      <img :src="require('@/assets/icons/list-view.png')"
           height="14px"
           style="display: inline-block; color: white" />
    </button>
    <div class="sidebar"
         :class="{ full: !options.showMap, shadow: options.showMap }"
         v-if="!hideTables && options.showSidebar"
         style="overflow-y: auto; overflow-x: hidden; padding-bottom: 25px">
      <button type="button"
              v-if="options.showMap"
              class="btn btn-sm"
              @click="hideTables = true"
              style="position: absolute; top: 0.5rem; right: 0.5rem; z-index: 100001">
        collapse
        <img :src="require('@/assets/icons/collapse.png')"
             height="14px"
             style="display: inline-block" />
      </button>
      <div class="clock p-2 mt-4 mb-4"
           @click="nextTimezone()"
           v-if="options.showHeader">
        <span v-if="time.isValid">{{ time.toFormat("TTT") }}</span> <br />
        <span>{{ current_region }}</span>
      </div>
      <div class="accordeon"
           :class="{ 'p-2': options.showMap }">
        <div class="aitem"
             v-if="options.showArrivals">
          <h2 class="ma-0 p-0 dark">
            <span class="iconbg m-1">
              <img :src="require('@/assets/icons/arrival.png')"
                   height="40px"
                   style="display: inline-block" />
            </span>
            {{ $t("Arrivals") }}
          </h2>
          <div class="table-responsive mb-4"
               :style="'overflow-y: auto; overflow-x: hidden; height:' + options.tableheight">
            <table class="table table-dark shadow-none mb-0">
              <thead>
                <tr>
                  <th scope="col"
                      v-if="options.columns.date">{{ $t("Date") }}</th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.time">
                    {{ $t("Time") }}
                  </th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.airline">
                    {{ $t("Airline") }}
                  </th>
                  <th scope="col"
                      v-if="options.columns.fromto">{{ $t("Origin") }}</th>
                  <th scope="col"
                      v-if="options.columns.flightnumber">{{ $t("Flight") }}</th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.remark">
                    {{ $t("Remarks") }}
                  </th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.gate">
                    {{ $t("Gate") }}
                  </th>
                  <th scope="col"
                      class="text-end"
                      v-if="options.columns.ticketlink">
                    {{ $t("Buy ticket") }}
                  </th>
                  <th scope="col"
                      class="text-end"
                      v-if="options.columns.rate">
                    {{ $t("Price from") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="arrival in lastArrivals"
                    :key="arrival.key">
                  <th v-if="options.columns.date">{{ asZoneDate(arrival.date, "UTC", arrival.time) }}
                  </th>
                  <th class="text-center"
                      v-if="options.columns.time">{{ asZoneTime(arrival.time) }}
                  </th>
                  <th class="text-center"
                      v-if="options.columns.airline">
                    <a :href="airlineLink(arrival)"
                       target="_blank"
                       title="skyalps">
                      <img :src="require('@/assets/icons/skyalpsl.png')"
                           width="62px"
                           style="display: inline-block; margin-top: 2px" />
                    </a>
                  </th>
                  <td v-if="airport_types[arrival.departure] && options.columns.fromto">{{ airport_types[arrival.departure].name }}
                  </td>
                  <td v-if="!airport_types[arrival.departure] && options.columns.fromto"></td>
                  <td v-if="options.columns.flightnumber">{{ arrival.flight_number }}
                  </td>
                  <td class="text-center"
                      v-if="options.columns.remark">
                    <span :style="'color:' + remark(arrival)['color']">{{ $t(remark(arrival)["text"]) }}</span>
                  </td>
                  <td class="text-center"
                      v-if="options.columns.gate">
                    {{ arrival.gate }}
                  </td>
                  <td style="text-align: right"
                      v-if="options.columns.ticketlink">
                    <a :href="airlineLink(arrival)"
                       target="_blank"
                       class="ticketlink"
                       title="Skyalps Home"
                       v-if="remark(arrival)['text'] == 'SCHEDULED'">
                      <img :src="require('@/assets/icons/cart.png')"
                           height="20px"
                           style="filter: invert(1)" />
                    </a>
                  </td>
                  <td class="text-end"
                      v-if="options.columns.rate">
                    <span v-if="remark(arrival)['text'] == 'SCHEDULED' && arrival.rates">
                      {{ arrival.rates.basic_adult_oneway_withtaxes }} €</span>
                  </td>
                </tr>
                <tr v-for="index in Math.max(5, Object.values(lastArrivals).length) -
                  Object.values(lastArrivals).length"
                    :key="index">
                  <td colspan="10"></td>
                </tr>
                <tr v-if="max_entries < this.arrivals.length && options.columns.morebutton"
                    class="load-more">
                  <td colspan="10"
                      class="text-center">
                    <div @click="loadMore()">
                      {{ $t("load more") }} ({{ max_entries }}/{{ this.arrivals.length }})
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="options.columns.rate"
                 class="text-end rateinfo">
              {{ $t("rateinfo") }}
            </div>
          </div>
        </div>
        <div class="aitem"
             v-if="options.showDepartures">
          <h2 class="ma-0 p-0 dark">
            <span class="iconbg m-1">
              <img :src="require('@/assets/icons/departure.png')"
                   height="40px"
                   style="display: inline-block" />
            </span>
            {{ $t("Departures") }}
          </h2>
          <div class="table-responsive mb-4 "
               :style="'overflow-y: auto; overflow-x: hidden; height:' + options.tableheight">
            <table class="table table-dark shadow-none mb-0">
              <thead>
                <tr>
                  <th scope="col"
                      v-if="options.columns.date">{{ $t("Date") }}</th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.time">
                    {{ $t("Time") }}
                  </th>
                  <th scope="col"
                      class="text-center"
                      v-if="options.columns.airline">
                    {{ $t("Airline") }}
                  </th>
                  <th scope="col"
                      v-if="options.columns.fromto">
                    {{ $t("Destination") }}
                  </th>
                  <th scope="col"
                      v-if="options.columns.flightnumber">{{ $t("Flight") }}</th>

                  <th scope="col"
                      v-if="options.columns.remark"
                      class="text-center">
                    {{ $t("Remarks") }}
                  </th>
                  <th scope="col"
                      v-if="options.columns.gate"
                      class="text-center">
                    {{ $t("Gate") }}
                  </th>
                  <th scope="col"
                      v-if="options.columns.ticketlink"
                      class="text-end">
                    {{ $t("Buy ticket") }}
                  </th>
                  <th scope="col"
                      class="text-end"
                      v-if="options.columns.rate">
                    {{ $t("Price from") }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="departure in lastDepartures"
                    :key="departure.key">
                  <th v-if="options.columns.date">
                    {{ asZoneDate(departure.date, "UTC", departure.time) }}
                  </th>
                  <th class="text-center"
                      v-if="options.columns.time">
                    {{ asZoneTime(departure.time) }}
                  </th>
                  <th class="text-center"
                      v-if="options.columns.airline">
                    <a :href="airlineLink(departure)"
                       target="_blank"
                       title="Skyalps Home">
                      <img :src="require('@/assets/icons/skyalpsl.png')"
                           width="62px"
                           style="display: inline-block; margin-top: 2px" />
                    </a>
                  </th>
                  <td v-if="airport_types[departure.arrival] && options.columns.fromto">{{ airport_types[departure.arrival].name }}
                  </td>
                  <td v-if="!airport_types[departure.arrival] && options.columns.fromto"></td>
                  <td v-if="options.columns.flightnumber">{{ departure.flight_number }}</td>

                  <td class="text-center"
                      v-if="options.columns.remark">
                    <span :style="'color:' + remark(departure)['color']">{{ $t(remark(departure)["text"]) }}</span>
                  </td>
                  <td class="text-center"
                      v-if="options.columns.gate">{{ departure.gate }}</td>
                  <td style="text-align: right"
                      v-if="options.columns.ticketlink">
                    <a :href="airlineLink(departure)"
                       target="_blank"
                       class="ticketlink"
                       title="Skyalps Home"
                       v-if="remark(departure)['text'] == 'SCHEDULED'">
                      <img :src="require('@/assets/icons/cart.png')"
                           height="20px"
                           style="filter: invert(1)" />
                    </a>
                  </td>
                  <td class="text-end"
                      v-if="options.columns.rate">
                    <span v-if="remark(departure)['text'] == 'SCHEDULED' && departure.rates">{{ departure.rates.basic_adult_oneway_withtaxes }} €</span>
                  </td>
                </tr>
                <tr v-for="index in Math.max(5, Object.values(lastDepartures).length) -
                  Object.values(lastDepartures).length"
                    :key="index">
                  <td colspan="10"></td>
                </tr>
                <tr v-if="max_entries < this.departures.length && options.columns.morebutton"
                    class="load-more">
                  <td colspan="10"
                      class="text-center">
                    <div @click="loadMore()">
                      {{ $t("load more") }} ({{ max_entries }}/{{ this.departures.length }})
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-if="options.columns.rate"
                 class="text-end rateinfo">
              {{ $t("rateinfo") }}
            </div>
          </div>
        </div>

        <div class="aitem"
             v-if="options.showRealtimeTable">
          <h3 class="mb-0 text-center">
            {{ $t("Realtime data") }}
          </h3>
          <div class="table-responsive realtime mb-2"
               :style="'overflow-y: auto; overflow-x: hidden; height:' + options.tableheight">
            <table class="table table-dark table-secondary mb-0 realtime">
              <thead>
                <tr>
                  <th scope="col">
                    {{ $t("Flight") }}
                  </th>
                  <th scope="col">
                    {{ $t("Type") }}
                  </th>
                  <th scope="col"
                      class="text-center">
                    {{ $t("Altitude") }}
                    ({{ units.alt }})
                  </th>
                  <th scope="col"
                      class="text-center">
                    {{ $t("Speed") }}
                    ({{ units.speed }})
                  </th>
                  <th scope="col"
                      class="text-end">
                    {{ $t("Track") }}
                    (°)
                  </th>
                </tr>
              </thead>
              <tbody v-if="map.features">
                <tr v-for="flight in map.features"
                    :key="flight[flight.length - 1].name">
                  <th>{{ flight[flight.length - 1].tail }}</th>
                  <td>
                    {{ $t(emitter_types[flight[flight.length - 1].type][0]) }}
                  </td>
                  <td scope="col"
                      class="text-center">
                    {{ ftOrM(flight[flight.length - 1].alt) }}
                  </td>
                  <td scope="col"
                      class="text-center">
                    {{ ktsOrKmh(flight[flight.length - 1].speed) }}
                  </td>
                  <td scope="col"
                      class="text-end">
                    {{ ktsOrKmh(flight[flight.length - 1].rotation) }}
                  </td>
                </tr>
                <tr v-for="index in Math.max(6, Object.values(map.features).length) -
                  Object.values(map.features).length"
                    :key="index">
                  <td colspan="5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="btn-group"
         role="group"
         v-if="options.regionSwitcher"
         style="position: absolute; bottom: 45px; left: 12px; z-index: 10000">
      <button type="button"
              v-for="regions in options.regions"
              class="btn btn-dark shadow"
              :class="{
                active: regions.center[0] == map.center[0] && regions.center[1] == map.center[1]
              }"
              :key="regions.label"
              @click="changeRegion(regions)">
        {{ regions.label }}
      </button>
    </div>

    <div class="btn-group"
         role="group"
         v-if="options.timezoneSwitcher"
         style="position: absolute; bottom: 75px; left: 12px; z-index: 10000">
      <button type="button"
              v-for="zone in options.timezones"
              :key="zone.code"
              class="btn btn-dark shadow"
              :class="{
                active: zone.code == options.timezone
              }"
              @click="changeTimezone(zone)">
        {{ zone.label }}
      </button>
    </div>

    <div class="footer"
         style="font-size: 80%; padding: 0.5rem 1.5rem">
      <a href="https://opendatahub.com"
         target="_blank">powered by Open Data Hub
        <img :src="require('@/assets/icons/odh.png')"
             height="25px"
             style="display: inline-block; margin-left: 10px" /></a>
    </div>
  </div>
</template>

<script>
import axios from "axios"
import { DateTime, Settings } from "luxon"
import { getBottomLeft, getTopRight } from "ol/extent"
import { toLonLat } from "ol/proj"

export default {
  name: "NoiFlightControl",
  props: {
    options: Object,
    default: () => {
      return {
        from_ts: false,
        to_ts: false,
        airport: "BZO"
      }
    }
  },
  methods: {
    loadMore() {
      this.max_entries += 10
    },
    loadMore() {
      this.max_entries += 10
    },
    airlineLink(departure) {
      let dep = DateTime.fromFormat(departure.date, "yyyy-LL-dd", "UTC")
      let loc = departure.departure + "-" + departure.arrival
      let link =
        "https://booking.skyalps.com/flight-results/" +
        loc +
        "/" +
        dep.toFormat("yyyy-LL-dd") +
        "/NA/1/0/0"
      return link
    },
    asZoneTime(time = "00:00", source_zone = "UTC") {
      if (time == "") return ""
      let datetime = DateTime.fromFormat(time, "T", {
        zone: source_zone
      })
      datetime = datetime.setZone(this.current_timezone)
      return datetime.toFormat("HH:mm")
    },
    asZoneDate(date = "2022-01-01", source_zone = "UTC", time = "00:00") {
      if (date == "") return ""
      let datetime = DateTime.fromFormat(date + " " + time, "yyyy-LL-dd T", {
        zone: source_zone
      })
      datetime = datetime.setZone(this.current_timezone)
      return datetime.toFormat("dd LLL yy").toUpperCase()
    },
    updateTime() {
      let time = DateTime.utc()
      time = time.setZone(this.current_timezone)
      this.time = time
    },
    setExtend(evt) {
      const map = evt.map
      const extent = map.getView().calculateExtent(map.getSize())

      const bottomLeft = toLonLat(getBottomLeft(extent))
      const topRight = toLonLat(getTopRight(extent))

      this.map.viewport = {
        maxLat: topRight[1],
        minLat: bottomLeft[1],
        maxLng: topRight[0],
        minLng: bottomLeft[0]
      }
    },
    getIcon: function (index) {
      let icon = this.icons[index]
      return atob(icon)
    },
    // kiss
    $t: function (mess) {
      let messages = require("../mappings/messages.json")
      const lang = this.options.lang || "en"
      if (this.options.messages) messages = { ...messages, ...this.options.messages }
      return messages && messages[lang] && messages[lang][mess] ? messages[lang][mess] : mess
    },
    changeRegion(region = false) {
      if (!region && this.options.regions.length > 0) region = this.options.regions[0]
      if (region) {
        this.map.center = region.center
        this.map.zoom = region.zoom
      }
    },
    changeTimezone(zone = false) {
      if (!zone) return
      this.current_timezone = zone.code
      this.time = this.time.setZone(this.current_timezone)
    },
    nextTimezone() {
      if (this.zoneindex < this.options.timezones.length) this.zoneindex++
      if (this.zoneindex >= this.options.timezones.length || this.zoneindex < 0) this.zoneindex = 0
      this.current_timezone = this.options.timezones[this.zoneindex].code
      this.time = this.time.setZone(this.current_timezone)
    },
    ktsOrKmh: function (kts) {
      if (isNaN(kts)) return kts
      kts = parseInt(kts, 10)
      if (this.options.metricUnits) return parseInt(kts * 2 - kts * 2 * 0.1, 10)
      else return kts
    },
    kmhAsKts: function (kmh) {
      kmh = parseInt(kmh, 10)
      return parseInt(kmh / 1.852, 10)
    },
    ftOrM: function (ft) {
      if (isNaN(ft)) return ft
      ft = parseInt(ft, 10)
      if (this.options.metricUnits) return parseInt(ft / 3.2808, 10)
      return ft
    },
    mAsFt: function (m) {
      m = parseInt(m, 10)
      return parseInt(m * 3.2808, 10)
    },
    getTrail: function (id) {
      var trail = []
      for (var feature in this.map.features[id]) {
        trail.push(this.map.features[id][feature].pos)
      }

      if (trail.length > 1) {
        trail.shift()
      }

      return trail
    },
    age: function (past) {
      return Math.floor(Date.now() / 1000) - past
    },
    async fetchSchedules() {
      try {
        const now = this.options.filters.from_ts
          ? DateTime.fromMillis(this.options.filters.from_ts * 1000)
          : DateTime.utc()
        const until = this.options.filters.to_ts
          ? DateTime.fromMillis(this.options.filters.to_ts * 1000)
          : now.plus({ years: 1 })

        const where =
          "and(or(smetadata.fromdestination.eq." + this.options.filters.airport + ",smetadata.todestination.eq." + this.options.filters.airport + "),smetadata.departure_timestamp.gt." + now.toMillis() / 1000 + ",smetadata.departure_timestamp.lt." + until.toMillis() / 1000 + ")"

        const airport = this.options.filters.airport ? this.options.filters.airport : "BZO"

        let params = {
          limit: "-1",
          offset: "0",
          shownull: "false",
          distinct: "true",
          where: where,
          origin: "webcomp-flightdata"
        }

        params = new URLSearchParams(params).toString()

        let data = await axios.get(this.options.rest_endpoint + params)

        // we can assume with reasonable certainty that the following data type is "data" :)
        data = data.data.data.map((o) => {
          const arrival = o.smetadata.fromdestination != airport

          let datetime = DateTime.fromFormat(
            o.smetadata.fltsfromperiod + " " + arrival ? o.smetadata.sta : o.smetadata.std,
            "yyyy-LL-dd T",
            {
              zone: "UTC"
            }
          )

          let rate = o.smetadata.fares ? o.smetadata.fares["SKY_LIGHT"] : null

          if (rate) {
            rate =
              rate.fare.adultFareOW +
              rate.fare.tax1OW +
              rate.fare.tax2OW +
              rate.fare.tax3OW +
              rate.fare.tax4OW
          }

          if (isNaN(rate) || rate == 0) rate = false

          return {
            gate: "1",
            // we assume that fltsfromperiod = fltstoperiod
            date: o.smetadata.fltsfromperiod.replace(/\//g, "-"),
            time: arrival ? o.smetadata.sta : o.smetadata.std,
            sta: o.smetadata.arrival_timestamp,
            std: o.smetadata.departure_timestamp,
            type: arrival ? "ARRIVAL" : "DEPARTURE",
            remark: o.smetadata.remark ? o.smetadata.remark : "SCHEDULED",
            arrival: o.smetadata.todestination,
            company: o.sorigin,
            departure: o.smetadata.fromdestination,
            flight_number: o.smetadata.fltnumber,
            timestamp: datetime.toMillis(),
            rates: rate
              ? {
                basic_adult_oneway_withtaxes: rate
              }
              : null
          }
        })

        // clientside filtering
        data = data.filter((json) => {
          const flightdate = DateTime.fromFormat(json.date, "yyyy-LL-dd", {
            zone: "UTC"
          })

          let validAirport = true
          let validNation = true

          const isAirport = json.departure == airport || json.arrival == airport

          if (this.options.nations.length > 0) {
            const excludes = this.options.nations.filter((o) => o.indexOf("!") != -1)

            const dnation = this.airport_types[json.departure]
              ? this.airport_types[json.departure].nation
              : ""

            const anation = this.airport_types[json.arrival]
              ? this.airport_types[json.arrival].nation
              : ""

            // excludes > includes
            if (excludes.length > 0) {
              excludes.forEach((exc) => {
                exc = exc.substring(1)
                if (dnation == exc || anation == exc) {
                  validNation = false
                }
              })
            } else {
              if (
                !(
                  this.options.nations.indexOf(dnation) != -1 ||
                  this.options.nations.indexOf(anation) != -1
                )
              ) {
                validNation = false
              }
            }
          }

          if (this.options.airports.length > 0) {
            const excludes = this.options.airports.filter((o) => o.indexOf("!") != -1)
            // excludes > includes
            if (excludes.length > 0) {
              excludes.forEach((exc) => {
                exc = exc.substring(1)
                if (json.departure == exc || json.arrival == exc) validAirport = false
              })
            } else {
              if (
                !(
                  this.options.airports.indexOf(json.departure) != -1 ||
                  this.options.airports.indexOf(json.arrival) != -1
                )
              ) {
                validAirport = false
              }
            }
          }

          return (
            flightdate > DateTime.now().minus({ day: 1 }) &&
            isAirport &&
            validNation &&
            validAirport
          )
        })

        // split data
        this.departures = data.filter((json) => {
          return json.type == "DEPARTURE"
        })

        this.arrivals = data.filter((json) => {
          return json.type == "ARRIVAL"
        })

        // sort by timestamps
        this.arrivals.sort(this.sortTimestamp)
        this.departures.sort(this.sortTimestamp)

        // group by key, keep newest entry/key
        let sarrivals = {}
        let sdepartures = {}

        for (var i = 0; i < this.arrivals.length; i++) {
          let arr = this.arrivals[i]
          const key = arr.date + "-" + arr.flight_number + "-" + arr.arrival + "-" + arr.departure
          if (typeof sarrivals[key] == "undefined") sarrivals[key] = []
          sarrivals[key] = arr
        }

        for (i = 0; i < this.departures.length; i++) {
          let arr = this.departures[i]
          const key = arr.date + "-" + arr.flight_number + "-" + arr.arrival + "-" + arr.departure
          if (typeof sdepartures[key] == "undefined") sdepartures[key] = []
          sdepartures[key] = arr
        }

        this.arrivals = Object.values(sarrivals).sort(this.sortDateTime)
        this.departures = Object.values(sdepartures).sort(this.sortDateTime)
      } catch (error) {
        console.error(error)
      }
    },
    sortTimestamp: function (a, b) {
      if (a.timestamp < b.timestamp) {
        return -1
      }
      if (a.timestamp > b.timestamp) {
        return 1
      }
      return 0
    },
    sortDateTime: function (a, b) {
      const adate = a.date + "/" + a.time
      const bdate = b.date + "/" + b.time

      let adatetime = DateTime.fromFormat(adate, "yyyy-LL-dd/H:mm", {
        zone: "UTC"
      })
      let bdatetime = DateTime.fromFormat(bdate, "yyyy-LL-dd/H:mm", {
        zone: "UTC"
      })
      if (adatetime < bdatetime) {
        return -1
      }
      if (adatetime > bdatetime) {
        return 1
      }
      return 0
    },
    resizer: function () {
      const wi = this.$refs.viewport.clientWidth
      this.device = "desktop"
      if (wi < 768) this.device = "tablet"
      if (wi < 480) this.device = "smartphone"
    },
    garbageCollector: function () {
      for (var plane in this.map.features) {
        var waypoints = this.map.features[plane].slice()
        for (var a = 0; a < waypoints.length; a++) {
          const age = this.age(waypoints[a].received_at)
          if (age > this.options.maxAge) {
            this.map.features[plane].splice(a, 1)
          }
        }
        if (this.map.features[plane].length == 0) delete this.map.features[plane]
      }
    },
    updateTraffic: async function (data, type = "features") {
      var id = data.Icao_addr.toString()
      if (!data.source) data.source = "default"

      // first default datapoints of single aircrafts are not reliable atm
      if (typeof this.idmap[id] == "undefined") this.idmap[id] = 0
      this.idmap[id]++
      if (this.idmap[id] < 5 && data.source == "default") {
        return
      }

      const os_id = id.substring(0, id.length - 2)

      // sensor data exists
      if (typeof this.map[type][os_id] != "undefined") {
        // delete os data
        if (id.indexOf("os") != -1 && typeof this.map[type][id] != "undefined")
          delete this.map[type][id]
        return
      }

      if (typeof this.map[type][id] == "undefined") {
        this.$set(this.map[type], id, [])
      }

      if (typeof this.map.trails[id] == "undefined") {
        this.$set(this.map.trails, id, [])
      }

      if (this.map[type][id].length >= 2000) this.map[type][id].shift()

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
        source: data.source
      }

      newone.text = newone.callsign

      if (newone.source == "default")
        newone.text +=
          "\r\n" +
          this.ftOrM(newone.alt) +
          this.units.alt +
          "\r\n" +
          this.ktsOrKmh(newone.speed) +
          this.units.speed

      this.$set(this.map[type][id], this.map[type][id].length, newone)

      this.map.trails[id] = this.getTrail(id)

      return this.map[type]
    },
    initWebsockets: function () {
      this.connection = new WebSocket(this.options.wss_endpoint)

      this.connection.onmessage = (event) => {
        this.updateTraffic(JSON.parse(event.data))
      }

      this.connection.onerror = function (event) {
        console.error(event)
      }

      this.connection.onopen = () => {
        // if open, keep open
        setInterval(() => {
          if (this.connection.readyState === this.connection.OPEN) this.connection.send("ping")
          else this.initWebsockets()
        }, 5000)
      }
    },
    remark(data) {
      let arrivalDate = DateTime.fromMillis(data.sta * 1000, {
        zone: this.current_timezone
      })

      let departureDate = DateTime.fromMillis(data.std * 1000, {
        zone: this.current_timezone
      })

      const arrival_diff = arrivalDate.diff(this.time, ["minutes"]).toObject()["minutes"]
      const departure_diff = departureDate.diff(this.time, ["minutes"]).toObject()["minutes"]

      // landed
      if (arrival_diff < 0) {
        return {
          text: "LANDED",
          color: "#FFFFFF"
        }
      }

      // in flight
      if (arrival_diff > 0 && departure_diff < 0) {
        return {
          text: "STARTED",
          color: "#FFFFFF"
        }
      }

      // boarding => departure - 30m
      if (departure_diff < 30) {
        return {
          text: "BOARDING",
          color: "#FFFFFF"
        }
      }

      // scheduled
      if (departure_diff > 0) {
        return {
          text: "SCHEDULED",
          color: "#FFFFFF"
        }
      }

      // TODO: realtime data endpoints not ready yet
      // ontime
      // delayed
      // cancelled

      return {
        text: "",
        color: "#FFFFFF"
      }
    }
  },
  computed: {
    lastArrivals() {
      return this.arrivals.slice(0, this.max_entries)
    },
    lastDepartures() {
      return this.departures.slice(0, this.max_entries)
    }
  },
  mounted: function () {
    this.current_timezone = this.options.timezone

    this.changeRegion()

    if (this.options.metricUnits) {
      this.units = {
        speed: "km/h",
        alt: "m"
      }
    }
    this.resizer()
  },
  watch: {
    "options.filters": function () {
      this.fetchSchedules()
    }
  },
  created: async function () {
    Settings.defaultLocale = this.$t(this.options.lang)

    // arrivals/departures
    if (this.options.showSidebar) {
      setInterval(this.fetchSchedules, 60000 * 5)
      setInterval(this.updateTime, 1000)
    }

    this.updateTime()
    this.time = this.time.setZone(this.current_timezone)

    // realtime data from integrator websockets
    if (this.options.showRealtimeTable || this.options.showMap) {
      setInterval(this.garbageCollector, 500)
      this.initWebsockets()
    }

    // "container"-queries
    window.addEventListener("resize", this.resizer)

    this.max_entries = this.options.maxforecast

    if (this.options.regions.length > 0) this.current_region = this.options.regions[0].label
  },
  destroyed() {
    window.removeEventListener("resize", this.resizer)
  },
  data: function () {
    return {
      zoneindex: 1,
      max_entries: 0,
      device: "desktop",
      hideTables: false,
      idmap: {},
      current_region: "",
      current_timezone: "",
      map: {
        zoom: 10,
        current_tiles: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        center: [11.708702923355805, 46.62007074044277],
        rotation: 0,
        viewport: {
          minLat: 45.3702,
          minLng: 9.4166,
          maxLat: 47.3768,
          maxLng: 13.9527
        },
        features: {},
        trails: {}
      },
      arrivals: [],
      departures: [],
      time: "00:00:00 UTC",
      units: {
        speed: "kts",
        alt: "ft"
      },
      max_entries: 5,
      emitter_types: require("../mappings/sender_types.js"),
      airport_types: require("../mappings/airport_types.js")
    }
  }
}
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap.scss";
@import "~vuelayers/dist/vuelayers.min.css";

.noi-mobility-atc {
  font-family: var(--noi-font-family, Verdana);
  font-size: var(--basic-font-size, 10px);
  color: var(--noi-primary, #0068b4);

  a {
    text-decoration: none;
    color: var(--noi-primary, #0068b4);
  }

  .rateinfo {
    color: var(--noi-primary, #0068b4);
    font-size: 80%;
  }

  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    background: white;
    width: 100%;
    text-align: right;
    font-size: 1rem;
    z-index: 100001;
  }

  table {
    font-size: var(--basic-font-size, 12px);

    td,
    th {
      font-family: var(--noi-font-family-2, monospace);
      line-height: 20px;
      vertical-align: middle;
    }

    td {
      color: var(--noi-jam-strong, #ffffff);
      vertical-align: middle;
    }

    &.realtime {
      td {
        color: white;
      }
    }
  }

  .load-more {
    td {
      color: black !important;
      background-color: var(--noi-jam-strong, #e4c200) !important;
    }
  }

  &.skyalps {
    .table> :not(caption)>*>* {
      background-color: var(--table-bg, #6e6e6d);
      border-color: var(--table-color, #ffffff);
    }

    .load-more {
      cursor: pointer;

      td {
        background-color: var(--noi-jam-strong, #a1bad4) !important;
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

  &.skyalps {
    h2 {
      &.dark {
        background: var(--noi-jam-strong, #a1bad4);
      }
    }
  }

  h3 {
    background: var(--noi-jam-light, #6e6e6d);
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
    width: 650px;
    height: 100%;
    background-color: var(--noi-primary-contrast, #ffffff);
    color: white;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 100000;
    max-width: 100%;

    &.full {
      width: 100%;
    }
  }

  .load-more {
    cursor: pointer;
  }

  .clock {
    color: var(--noi-primary, #000000);
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    cursor: pointer;
    font-family: var(--noi-font-family-2, Verdana);
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

  .table> :not(caption)>*>* {
    padding: 0.2rem 0.2rem;
  }

  .table-responsive {
    max-height: var(--max-table-height, none);

    &.realtime {
      max-height: var(--max-table-height, none);
    }
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