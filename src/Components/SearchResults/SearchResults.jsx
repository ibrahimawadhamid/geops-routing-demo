import React from 'react';
import PropTypes from 'prop-types';
import nextId from 'react-id-generator';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MapMarkerIcon from '@material-ui/icons/LocationOn';

const renderSecondary = (code, countryCode) => {
  if (code && countryCode) {
    return `${code} - ${countryCode}`;
  }
  if (code || countryCode) {
    return code || countryCode;
  }
  return null;
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
                    searchResult.properties.code,
                    searchResult.properties.country_code,
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
