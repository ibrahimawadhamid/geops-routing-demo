import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useSelector, useDispatch } from 'react-redux';
import { platformModifierKeyOnly } from 'ol/events/condition';
import Footer from '../Footer';
import MapComponent from '../MapComponent';
import Permalink from '../Permalink';
import NotificationHandler from '../NotificationHandler';
import {
  setMode,
  setGeneralizationEnabled,
  setGeneralizationActive,
} from '../../store/actions/Map';
import {
  VALID_MOTS,
  ROUTING_BASE_URL,
  STATION_SEARCH_BASE_URL,
} from '../../constants';

const propTypes = {
  routingUrl: PropTypes.string,
  stationSearchUrl: PropTypes.string,
  mots: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  mots: VALID_MOTS,
  routingUrl: ROUTING_BASE_URL,
  stationSearchUrl: STATION_SEARCH_BASE_URL,
};

const fontSize = '1rem';
const color = '#515151';
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
  },
  typography: {
    body: { fontSize },
    button: { fontSize, color: 'red' },
    h1: { fontSize: '1.2rem', color },
    h2: { fontSize, color },
    h3: { fontSize, color },
    h4: { fontSize, color },
    h5: { fontSize, color },
    h6: { fontSize, color },
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: 'text',
      },
      styleOverrides: {
        root: {
          fontWeight: 'normal',
          textTransform: 'none',
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        anchorOriginBottomRight: {
          bottom: '36px !important',
        },
      },
    },
  },
});

/**
 * Root component of the application that holds all other sub-components.
 * @param {string[]} mots List of mots to be available (ex: ['bus', 'train'])
 * @param {string} routingUrl The API routing url to be used for navigation.
 * @param {string} stationSearchUrl The API station search URL to be used for searching for stations.
 */
function App(props) {
  const { mots, routingUrl, stationSearchUrl } = props;
  const apiKey = process.env.REACT_APP_API_KEY;
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.MapReducer.mode);
  const generalizationEnabled = useSelector(
    (state) => state.MapReducer.generalizationEnabled,
  );

  const handleKeyboarEvent = useCallback(
    (evt) => {
      const preventBroweserDefaults = () => {
        evt.stopPropagation();
        evt.preventDefault();
      };
      const ctrlDPressed =
        platformModifierKeyOnly({ originalEvent: evt }) && evt.which === 68;
      const ctrlGPressed =
        platformModifierKeyOnly({ originalEvent: evt }) && evt.which === 71;

      if (ctrlDPressed) {
        preventBroweserDefaults();
        dispatch(setMode(mode ? null : 'dev'));
      }

      if (ctrlGPressed) {
        preventBroweserDefaults();
        dispatch(setGeneralizationActive(!generalizationEnabled));
        dispatch(setGeneralizationEnabled(!generalizationEnabled));
      }
    },
    [dispatch, mode, generalizationEnabled],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboarEvent);
    return () => document.removeEventListener('keydown', handleKeyboarEvent);
  }, [handleKeyboarEvent]);

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
      <Footer />
    </ThemeProvider>
  );
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
