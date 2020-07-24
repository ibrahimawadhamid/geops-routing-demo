import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MapMarkerIcon from '@material-ui/icons/LocationOn';
import { unByKey } from 'ol/Observable';

import './SearchResults.scss';

const renderSecondary = (id, code, countryCode, ifopt) => {
  const display = [];

  if (countryCode) {
    display.push(
      `${countryCode}${id || code ? ':' : ''}${id ? ` ${id}` : ''}${
        code ? ` ${code}` : ''
      }`,
    );
  } else {
    display.push(
      `${id ? `${id}` : ''}${id && code ? ' ' : ''}${code ? `${code}` : ''}`,
    );
  }
  if (ifopt) {
    display.push(`ifopt: ${ifopt}`);
  }
  return display.filter(l => l !== '').join(', ');
};

/**
 * The component that displays the station search results
 * @category RoutingMenu
 */
function SearchResults(props) {
  const { currentSearchResults, processClickedResultHandler } = props;
  const map = useSelector(state => state.MapReducer.olMap);
  const [maxHeight, setMaxHeight] = useState(null);
  const ListRef = useRef();

  const updateMenuHeight = useCallback(() => {
    let newMaxheight;

    if (ListRef.current) {
      const mapBottom = map.getTarget().getBoundingClientRect().bottom;
      const elemRect = ListRef.current.getBoundingClientRect();
      newMaxheight = mapBottom - elemRect.top - 35;
    }

    if (newMaxheight >= 0) {
      setMaxHeight(newMaxheight);
    }
  }, [map]);

  useEffect(() => {
    const olEventKey = map.on('change:size', () => updateMenuHeight());

    return () => {
      unByKey(olEventKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateMenuHeight();
  }, [updateMenuHeight, currentSearchResults]);

  if (currentSearchResults.length === 0) {
    return null;
  }
  return (
    <Paper square elevation={3} ref={ListRef}>
      <List
        component="nav"
        className="rd-result-list"
        aria-label="search results"
        style={{
          maxHeight,
          overflowY: 'scroll',
          paddingBottom: 0,
          paddingTop: 0,
        }}
      >
        {currentSearchResults.map((searchResult, index) => {
          if (index !== 0) {
            return (
              <ListItem
                onClick={() => {
                  processClickedResultHandler(searchResult);
                }}
                button
                key={nextId()}
              >
                <ListItemIcon>
                  <MapMarkerIcon />
                </ListItemIcon>
                <ListItemText
                  primary={searchResult.properties.name}
                  secondary={renderSecondary(
                    searchResult.properties.id,
                    searchResult.properties.code,
                    searchResult.properties.country_code,
                    searchResult.properties.ifopt,
                  )}
                />
              </ListItem>
            );
          }
          // First item
          return (
            <ListItem
              onClick={() => processClickedResultHandler(searchResult)}
              button
              selected
              key={`searchResult-${searchResult.properties.name}`}
            >
              <ListItemIcon>
                <MapMarkerIcon />
              </ListItemIcon>
              <ListItemText
                primary={searchResult.properties.name}
                secondary={renderSecondary(
                  searchResult.properties.id,
                  searchResult.properties.code,
                  searchResult.properties.country_code,
                  searchResult.properties.ifopt,
                )}
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

SearchResults.propTypes = {
  currentSearchResults: PropTypes.arrayOf(PropTypes.object),
  processClickedResultHandler: PropTypes.func.isRequired,
};

SearchResults.defaultProps = {
  currentSearchResults: [],
};

export default SearchResults;
