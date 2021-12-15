<template>
  <NoiFlightControl
    :options="{
      lang: lang,
      colors: JSON.parse(colors),
      showRealtimeTable: realtime,
      showDepartures: departures,
      showArrivals: arrivals,
      regionSwitcher: regionswitch,
      metricUnits: metricunits,
      maxAge: maxage,
      timezone: timezone,
      // TODO: object cause of wcs limitations
      regions: Object.values(JSON.parse(regions)),
      maxforecast: maxforecast,
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
    metricunits: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "UTC",
      // https://www.npmjs.com/package/tzdata list
    },
    maxage: {
      type: Number,
      default: 60,
    },
    maxforecast: {
      type: Number,
      default: 5,
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
        return JSON.stringify({
          "0" : {
            label: "Airport",
            center: [11.326656463229954, 46.44298771993968],
            zoom: 14,
          },
          "1" : {
            label: "Region",
            center: [11.463606010174134, 46.42665096950925],
            zoom: 10,
          },
        });
      },
    },
  },
  components: {
    NoiFlightControl,
  },
  methods: {
    getRegions: function() {
      // TODO
    },
    getColors: function() {
      // TODO
    }
  }
};
</script>
