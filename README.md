<!--
SPDX-FileCopyrightText: 2021 NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# Flightmap

[![REUSE status](https://api.reuse.software/badge/github.com/noi-techpark/webcomp-flightdata)](https://api.reuse.software/info/github.com/noi-techpark/webcomp-flightdata)

A customizable map for displaying air traffic in and around BZO/Bolzano. Real-time data can be retrieved and displayed via websockets.

## Table of contents

- [Usage](#usage)
- [Gettings started](#getting-started)
- [Tests and linting](#tests-and-linting)
- [Deployment](#deployment)
- [Docker environment](#docker-environment)
- [Information](#information)

## Usage

Include vue.js (https://unpkg.com/vue) and the webcompscript file `dist/noi-mobility-atc.min.js` in your HTML and define the web component like this:

```html
 <noi-mobility-atc
 lang="en"
 departures="true"
 arrivals="true"
 realtime="true"
 regionswitch="true"
 timezone="UTC"
 maxentries="5"
 maxage="60"
 ></noi-mobility-atc>
```
For a full example, configuration and filter options and available custom properties please have a look at [the demo 1](demo.html) [the demo 2](demo_filters_and_single_use.html)

### Attributes

#### styleurl

you can specify a url from an external stylesheet (css). this stylesheet will then be appended to the shadowroot and thus allows overriding most css rules.
if this option is used, an id must be assigned to the element.

#### airports and nations (filter)

The attributes airports and nations can each be passed an array which defines the airports or nations to be displayed.
Airports and nations can be shown or hidden by their abbreviations. Corresponding abbreviations are currently stored statically and can be viewed under src/mappings/airport_types.js. Listed abbreviations are displayed, abbreviations preceded by ! are explicitly excluded. If exclusions are defined, other values are ignored.

Examples:

```
  airports='["!HAM", "BER"]'
  nations='["DE"]'
```

Only flights that start or end in Germany are displayed. Flights which start or end in Hamburg are not displayed. Since an exclusion exists, the "BER" specification is ignored.

```
  airports='["HAM", "BER"]'
  nations='["DE"]'
```

Only flights departing from or arriving in Hamburg or Berlin are displayed.

```
  airports='["HAM", "BER"]'
  nations='["IT", "DNK"]'
```

Mutually exclusive configuration, nothing is displayed at all.

For a full example, configuration and filter options and available custom properties please have a look at [the demo 1](demo.html) [the demo 2](demo_filters_and_single_use.html)

#### lang

The language in which the component is rendered

Type: string<br>
Options: "en", "it", "de"

Translations can be changed or added via the messages attribute: [demo](demo_filters_and_single_use.html)

#### departures, arrivals, regionswitch, realtime

Visibility of the individual subcomponents

Type: Boolean <br>
Options: "true", "false"

departures: table of departures, default = true<br>
arrivals: table with arrivals, default = true<br>
regionswitch: buttons for switching the view, default = true<br>
realtime: Table with realtime data, default = true<br>
buyticket: button with the link to buy the respective flight, default = true<br>
sidebar: shows the sidebar with the info on the flights, default = true

#### metricunits

Show units as metric values

Type: Boolean<br>
Options: "true", "false"

#### maxage

Received data will be interpreted as valid for && deleted after X seconds

Type: Number (seconds)<br>
Default: 60

#### timezone

timezone for arrivals/departures

Type: Timezone name (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)<br>
Default: UTC

#### colors

in-map coloring (aircraft)

Type: Object<br>
Default:
```
{
  primary: "#0068B4",
  secondary: "#555555",
  primary_contrast: "#ffffff",
  secondary_contrast: "#ffffff"
}
```

#### regions

preset regions, first region is used as start screen and sidebar header label

Type: Array<br>
Default:
```
[
  {
    label: "Airport",
    center: [11.326656463229954, 46.44298771993968],
    zoom: 14,
  },
  {
    label: "Region",
    center: [11.463606010174134, 46.42665096950925],
    zoom: 10,
  },
]
```

#### maxforecast

maximum entries for departure and arrival

Type: Number<br>
Default: 5


#### filters, columns, airports, nations

See [demo](demo_filters_and_single_use.html) for an example of the more complex data attributes

## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

- Node 17 / NPM 8

For a ready to use Docker environment with all prerequisites already installed and prepared, you can check out the [Docker environment](#docker-environment) section.

### Source code

Get a copy of the repository:

```bash
git clone https://github.com/noi-techpark/webcomp-flightdata
```

Change directory:

```bash
cd webcomp-flightdata/
```

### Dependencies

Download all dependencies:

```bash
npm install
```

### Develope/Build

Build the project:

```bash
npm start
```

The necessary files to run the web component are provided under dist/.
dist/demo.html can be viewed locally in your browser.

## Deployment

To create the distributable files, execute the following command:

```bash
npm run build
```

## Docker environment

For the project a Docker environment is already prepared and ready to use with all necessary prerequisites.

These Docker containers are the same as used by the continuous integration servers.

### Installation

Install [Docker](https://docs.docker.com/install/) (with Docker Compose) locally on your machine.

### Dependenices

First, install all dependencies:

```bash
docker-compose run --rm app /bin/bash -c "npm install"
```

### Start and stop the containers

Before start working you have to start the Docker containers:

```
docker-compose up --build --detach
```

After finished working you can stop the Docker containers:

```
docker-compose stop
```

### Running commands inside the container

When the containers are running, you can execute any command inside the environment. Just replace the dots `...` in the following example with the command you wish to execute:

```bash
docker-compose run --rm app /bin/bash -c "..."
```

Some examples are:

```bash
docker-compose run --rm app /bin/bash -c "npm run test"
```

## Information

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.
