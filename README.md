# geOps Routing [Demo](https://ibrahimawadhamid.github.io/geops-routing-demo/)
![npm_version](https://img.shields.io/npm/v/geops-routing-demo)
![keywords](https://img.shields.io/github/package-json/keywords/ibrahimawadhamid/geops-routing-demo)

Sample component that uses geOps Routing API

## Installation
```javascript
npm i geops-routing-demo
```

## Sample Usage
### Import
```javascript
import GeopsRoutingDemo from 'geops-routing-demo';
```
### Render  
```javascript
<GeopsRoutingDemo
        mots={['rail','bus','tram']}
        routingUrl="https://api.geops.io/routing/v1/"
        stationSearchUrl="https://api.geops.io/stops/v1/"
        APIKey="SAMPLE_KEY"
    />
```

# Development

## Quick start
```
git clone https://github.com/ibrahimawadhamid/geops-routing-demo.git
cd geops-routing-demo
npm install
npm start
```
Development server should be started at [localhost:3000](http://localhost:3000)

# Branching model
-   master
```
Holds only the major/minor releases, that come 
from merging development into master.
example: 0.1.5 - 0.2.0 - 0.3.0
```
-   development
```
Holds the latest code, each commit maps to 
a single/unit feature/change made to the code.
This branch is merged into master when there is a release.
```

-   gh-pages
```
github pages branch, for demo purposes only.
```

# Depenedencies
-   [ol](https://www.npmjs.com/package/ol) (openlayers)
-   [redux](https://www.npmjs.com/package/redux)
-   [axios](https://www.npmjs.com/package/axios)
-   [material UI Core](https://www.npmjs.com/package/@material-ui/core)
-   [material UI Icons](https://www.npmjs.com/package/@material-ui/icons)