import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import MapComponent from '../MapComponent';
import Permalink from '../Permalink';
import NotificationHandler from '../NotificationHandler';
import { VALID_MOTS } from '../../constants';
import { setIsMobile } from '../../store/actions/Map';

const propTypes = {
  routingUrl: PropTypes.string,
  stationSearchUrl: PropTypes.string,
  mots: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  mots: VALID_MOTS,
  routingUrl: 'https://api.geops.io/routing/v1/',
  stationSearchUrl: 'https://api.geops.io/stops/v1/',
};

const fontSize = '1rem';
const color = '#515151';
const theme = createMuiTheme({
  typography: {
    body: { fontSize },
    button: { fontSize },
    h1: { fontSize: '1.2rem', color },
    h2: { fontSize, color },
    h3: { fontSize, color },
    h4: { fontSize, color },
    h5: { fontSize, color },
    h6: { fontSize, color },
  },
});

/**
 * Root component of the application that holds all other sub-components.
 * @param {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @param {string} routingUrl The API routing url to be used for navigation.
 * @param {string} stationSearchUrl The API station search URL to be used for searching for stations.
 */
function App(props) {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down('xs'));
  const { mots, routingUrl, stationSearchUrl } = props;
  const apiKey = process.env.REACT_APP_API_KEY;

  useEffect(() => {
    dispatch(setIsMobile(isMobile));
  }, [dispatch, isMobile]);

  return (
    <ThemeProvider theme={theme}>
      <Permalink
        mots={mots}
        APIKey={apiKey}
        stationSearchUrl={stationSearchUrl}
      />
      <MapComponent
        mots={mots}
        routingUrl={routingUrl}
        APIKey={apiKey}
        stationSearchUrl={stationSearchUrl}
      />
      <NotificationHandler />
    </ThemeProvider>
  );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
