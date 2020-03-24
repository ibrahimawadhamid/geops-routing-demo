import React from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MapMarkerIcon from '@material-ui/icons/LocationOn';

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
  return display.join(',');
};

/**
 * The component that displays the station search results
 * @category RoutingMenu
 */
function SearchResults(props) {
  const { currentSearchResults, processClickedResultHandler } = props;
  if (currentSearchResults.length === 0) {
    return null;
  }
  return (
    <Paper square elevation={3}>
      <List component="nav" aria-label="search results">
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
                  searchResult.properties.code,
                  searchResult.properties.country_code,
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
