# geops-routing-demo
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
        mots="rail,bus,tram"
        routingUrl="https://api.geops.io/routing/v1/"
        stationSearchUrl="https://api.geops.io/stops/v1/"
        key="EXAMPLE_KEY"
    />
```