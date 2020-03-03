import PropTypes from 'prop-types';

const coordinates = PropTypes.arrayOf(PropTypes.number.isRequired).isRequired;

const geometry = PropTypes.shape({
  coordinates,
  type: PropTypes.string.isRequired,
});

const feature = PropTypes.shape({
  geometry,
  properties: PropTypes.shape({
    id: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.string.isRequired,
    ]),
    type: PropTypes.string.isRequired,
  }),
  type: PropTypes.string.isRequired,
});

const currentStop = PropTypes.shape({
  features: PropTypes.shape({
    '0': PropTypes.oneOfType([feature, coordinates]),
    '1': PropTypes.oneOfType([feature, coordinates]),
  }),
  type: PropTypes.string.isRequired,
});

const propTypeCurrentStopsGeoJSON = PropTypes.shape({
  '0': currentStop,
  '1': currentStop,
});

const propTypeCurrentStops = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string.isRequired, coordinates]),
);

export { propTypeCurrentStops, propTypeCurrentStopsGeoJSON };
