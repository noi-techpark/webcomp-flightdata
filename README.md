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
For an example, configuration options and available custom properties please have a look at [the demo](demo.html)

### Attributes

#### lang

The language in which the component is rendered

Type: string
Options: "en", "it", "de"

#### departures, arrivals, regionswitch, realtime

Visibility of the individual subcomponents

Type: Boolean
Options: "true", "false"

departures: table of departures, default = true
arrivals: table with arrivals, default = true
regionswitch: buttons for switching the view, default = true
realtime: Table with realtime data, default = true

#### metricunits

Show units as metric values

Type: Boolean
Options: "true", "false"

#### maxage

Received data will be interpreted as valid for && deleted after X seconds

Type: Number (seconds)
Default: 60

#### timezone

timezone for arrivals/departures

Type: Timezone name (https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)
Default: UTC

#### colors

in-map coloring (aircraft)

Type: Object
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

preset regions, first region is used as start screen

Type: Array
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

Type: Number
Default: 5


## Getting started

These instructions will get you a copy of the project up and running
on your local machine for development and testing purposes.

### Prerequisites

To build the project, the following prerequisites must be met:

- Node 14 / NPM 6

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

Due to some limitations in Vue2/Web components, hot reload atm is not available for development.


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

### Support

For support, please contact [help@opendatahub.bz.it](mailto:help@opendatahub.bz.it).

### Contributing

If you'd like to contribute, please follow the following instructions:

- Fork the repository.

- Checkout a topic branch from the `development` branch.

- Make sure the tests are passing.

- Create a pull request against the `development` branch.

A more detailed description can be found here: [https://github.com/noi-techpark/documentation/blob/master/contributors.md](https://github.com/noi-techpark/documentation/blob/master/contributors.md).

### Documentation

More documentation can be found at [https://opendatahub.readthedocs.io/en/latest/index.html](https://opendatahub.readthedocs.io/en/latest/index.html).

### Boilerplate

The project uses this boilerplate: [https://github.com/noi-techpark/webcomp-boilerplate](https://github.com/noi-techpark/webcomp-boilerplate).

### License

The code in this project is licensed under the GNU AFFERO GENERAL PUBLIC LICENSE Version 3 license. See the [LICENSE.md](LICENSE.md) file for more information.
