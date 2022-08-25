import PropTypes from 'prop-types';

const propTypeCoordinates = PropTypes.arrayOf(PropTypes.number.isRequired);

const geometry = PropTypes.shape({
  propTypeCoordinates,
  type: PropTypes.string.isRequired,
});

const feature = PropTypes.shape({
  geometry,
  properties: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    type: PropTypes.string.isRequired,
  }),
  type: PropTypes.string.isRequired,
});

const currentStop = PropTypes.shape({
  features: PropTypes.arrayOf(
    PropTypes.oneOfType([feature, propTypeCoordinates]),
  ),
  type: PropTypes.string.isRequired,
});

const propTypeCurrentStopsGeoJSON = PropTypes.arrayOf(currentStop);

const propTypeCurrentStops = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string, propTypeCoordinates]).isRequired,
);

export {
  propTypeCoordinates,
  propTypeCurrentStops,
  propTypeCurrentStopsGeoJSON,
};
