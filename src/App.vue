<template>
  <NoiFlightControl :options="{
    lang: lang,
    messages: JSON.parse(messages),
    colors: JSON.parse(colors),
    showRealtimeTable: realtime,
    showDepartures: departures,
    showArrivals: arrivals,
    showMap: map,
    theme: theme,
    showHeader: header,
    showSidebar: schedules,
    regionSwitcher: regionswitch,
    timezoneSwitcher: timezoneswitch,
    metricUnits: metricunits,
    buyTicket: buyticket,
    maxAge: maxage,
    timezone: timezone,
    regions: JSON.parse(regions),
    timezones: JSON.parse(timezones),
    maxforecast: maxforecast,
    wss_endpoint: wssendpoint,
    rest_endpoint: restendpoint,
    filters: JSON.parse(filters),
    columns: JSON.parse(columns),
    airports: JSON.parse(airports),
    nations: JSON.parse(nations)
  }" />
</template>

<script>
import Vue from "vue"

import NoiFlightControl from "./components/NoiFlightControl.vue"

// TODO: 4MB (!) unused payload => https://github.com/ghettovoice/vuelayers/issues/319
import { Map, TileLayer, OsmSource, Feature, Style } from 'vuelayers'

Vue.use(Map)
Vue.use(TileLayer)
Vue.use(OsmSource)
Vue.use(Feature)
Vue.use(Style)


export default {
  name: "App",
  props: {
    id: {
      type: String,
      default: ""
    },
    styleurl: {
      type: String,
      default: ""
    },
    lang: {
      type: String,
      default: "en"
    },
    messages: {
      type: String,
      default: "{}"
    },
    realtime: {
      type: Boolean,
      default: true
    },
    departures: {
      type: Boolean,
      default: true
    },
    arrivals: {
      type: Boolean,
      default: true
    },
    regionswitch: {
      type: Boolean,
      default: true
    },
    schedules: {
      type: Boolean,
      default: true
    },
    buyticket: {
      type: Boolean,
      default: false
    },
    timezoneswitch: {
      type: Boolean,
      default: false
    },
    metricunits: {
      type: Boolean,
      default: false
    },
    map: {
      type: Boolean,
      default: true
    },
    theme: {
      type: String,
      // "terminal" || "skyalps"
      default: "terminal"
    },
    header: {
      type: Boolean,
      default: true
    },
    nations: {
      type: String,
      default: () => {
        return JSON.stringify([])
      }
    },
    airports: {
      type: String,
      default: () => {
        return JSON.stringify([])
      }
    },
    timezone: {
      type: String,
      default: "local"
      // https://www.npmjs.com/package/tzdata list
    },
    wssendpoint: {
      type: String,
      default: "wss://ws.datapool.opendatahub.testingmachine.eu/flightdata/sbs-aggregated"
    },
    restendpoint: {
      type: String,
      default: "https://mobility.api.opendatahub.bz.it/v2/flat%2Cnode/Flight?"
    },
    maxage: {
      type: Number,
      default: 60
    },
    maxforecast: {
      type: Number,
      default: 100
    },
    colors: {
      type: String,
      default: () => {
        return JSON.stringify({
          primary: "#0068B4",
          secondary: "#555555",
          primary_contrast: "#ffffff",
          secondary_contrast: "#ffffff"
        })
      }
    },
    filters: {
      type: String,
      default: () => {
        return JSON.stringify({
          from_ts: false,
          to_ts: false,
          airport: "BZO"
        })
      }
    },
    columns: {
      type: String,
      default: () => {
        return JSON.stringify({
          date: true,
          time: true,
          airline: true,
          fromto: true,
          flightnumber: true,
          remark: true,
          gate: true,
          ticketlink: true,
          morebutton: true,
        })
      }
    },
    regions: {
      type: String,
      default: () => {
        return JSON.stringify([
          {
            label: "Airport Bolzano/Bozen",
            center: [11.3361503, 46.4607403],
            zoom: 14.25
          },
          {
            label: "Region",
            center: [11.463606010174134, 46.42665096950925],
            zoom: 10
          }
        ])
      }
    },
    timezones: {
      type: String,
      default: () => {
        return JSON.stringify([
          {
            label: "UTC",
            code: "UTC"
          },
          {
            label: "Local time",
            code: "local"
          }
        ])
      }
    }
  },
  components: {
    NoiFlightControl
  },
  mounted: async function () {
    if (this.styleurl != "") {
      const elem = document.getElementById(this.id)
      if (!elem) {
        console.log("you must give the element an id so that external css-files can be applied")
      }

      var externalStyles = document.createElement("style")

      fetch(this.styleurl)
        .then((response) => response.text())
        .then((data) => {
          externalStyles.innerHTML = data
          elem.shadowRoot.appendChild(externalStyles)
        })
        .catch((error) => {
          console.error("wrong stylesheet url. styles can not be applied. cors disabled (?)")
        })
    }
  }
}
</script>