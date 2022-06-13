<template>
  <NoiFlightControl
    :options="{
      lang: lang,
      colors: JSON.parse(colors),
      showRealtimeTable: realtime,
      showDepartures: departures,
      showArrivals: arrivals,
      regionSwitcher: regionswitch,
      timezoneSwitcher: timezoneswitch,
      metricUnits: metricunits,
      maxAge: maxage,
      timezone: timezone,
      regions: JSON.parse(regions),
      timezones: JSON.parse(timezones),
      maxforecast: maxforecast,
      wss_endpoint: wssendpoint,
      rest_endpoint: restendpoint,
    }"
  />
</template>

<script>
import Vue from "vue";

import NoiFlightControl from "./components/NoiFlightControl.vue";
import VueLayers from "vuelayers";

Vue.use(VueLayers);

export default {
  name: "App",
  props: {
    lang: {
      type: String,
      default: "en",
    },
    realtime: {
      type: Boolean,
      default: true,
    },
    departures: {
      type: Boolean,
      default: true,
    },
    arrivals: {
      type: Boolean,
      default: true,
    },
    regionswitch: {
      type: Boolean,
      default: true,
    },
    timezoneswitch: {
      type: Boolean,
      default: true,
    },
    metricunits: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "local",
      // https://www.npmjs.com/package/tzdata list
    },
    wssendpoint: {
      type: String,
      default: "wss://ws.datapool.opendatahub.testingmachine.eu/flightdata/sbs-aggregated",
    },
    restendpoint: {
      type: String,
      default: "https://api.datapool.opendatahub.testingmachine.eu/flightdata-scheduled",
    },
    maxage: {
      type: Number,
      default: 60,
    },
    maxforecast: {
      type: Number,
      default: 100,
    },
    colors: {
      type: String,
      default: () => {
        return JSON.stringify({
          primary: "#0068B4",
          secondary: "#555555",
          primary_contrast: "#ffffff",
          secondary_contrast: "#ffffff",
        });
      },
    },
    regions: {
      type: String,
      default: () => {
        return JSON.stringify([
          {
            label: "Airport Bolzano/Bozen",
            center: [11.3361503, 46.4607403],
            zoom: 14.25,
          },
          {
            label: "Region",
            center: [11.463606010174134, 46.42665096950925],
            zoom: 10,
          },
        ]);
      },
    },
    timezones: {
      type: String,
      default: () => {
        return JSON.stringify([
          {
            label: 'UTC',
            code: 'UTC'
          },
          {
            label: 'Local time',
            code: 'local'
          },
        ]);
      },
    },
  },
  components: {
    NoiFlightControl,
  },
};
</script>
