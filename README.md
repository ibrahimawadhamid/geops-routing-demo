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
        APIKey="5cc87b12d7c5370001c1d655d0a18192eba64838a5fa1ad7d482ab82"
    />
```