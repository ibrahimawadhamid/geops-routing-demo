import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@geops/react-ui/components/Button';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { getBottomLeft, getTopRight } from 'ol/extent';
import { to4326 } from '../../utils';

import { propTypeCoordinates } from '../../store/prop-types';
import { setActiveFloor, showNotification } from '../../store/actions/Map';
import FloorButton from './FloorButton';

import './FloorSwitcher.scss';

const propTypes = {
  // mapStateToProps
  center: propTypeCoordinates.isRequired,
  activeFloor: PropTypes.string.isRequired,
  map: PropTypes.object.isRequired,
  layerService: PropTypes.object.isRequired,
  // isAppWidthSmallerThanS: PropTypes.bool,

  // mapDispatchToProps
  dispatchSetActiveFloor: PropTypes.func.isRequired,
  dispatchShowNotification: PropTypes.func.isRequired,
};

// const defaultProps = {
//   // isAppWidthSmallerThanS: false,
// };

let abortController = new AbortController();

class FloorSwitcher extends PureComponent {
  /**
   * Sort floors based on their latitude.
   */
  static sortFloors(floors) {
    const sorted = [...floors];
    sorted.sort(
      (a, b) => parseInt(b.iabp_name, 10) - parseInt(a.iabp_name, 10),
    );

    return sorted;
  }

  constructor(props) {
    super(props);

    this.state = {
      floors: ['-4', '-3', '-2', '-1', '0', '2D', '1', '2', '3', '4'],
    };
  }

  componentDidUpdate(prevProps) {
    const { center, map, dispatchShowNotification } = this.props;

    if (prevProps.center !== center) {
      abortController.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      const extent = map.getView().calculateExtent();
      const reqUrl = `https://walking.geops.io/availableLevels?bbox=${to4326(
        getBottomLeft(extent),
      )
        .reverse()
        .join(',')}|${to4326(getTopRight(extent))
        .reverse()
        .join(',')}`;
      fetch(reqUrl, { signal })
        .then(response => response.json())
        .then(response => {
          if (response.error) {
            dispatchShowNotification(
              "Couldn't find available levels",
              'warning',
            );
            return;
          }
          if (!response.properties.availableLevels) {
            dispatchShowNotification(
              "Couldn't find available levels",
              'warning',
            );
          }
          this.setState({
            floors: response.properties.availableLevels.join().split(','),
          });
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            // eslint-disable-next-line no-console
            console.warn(`Abort ${reqUrl}`);
            return;
          }
          // It's important to rethrow all other errors so you don't silence them!
          // For example, any error thrown by setState(), will pass through here.
          throw err;
        });
    }
  }

  selectFloor(floor) {
    const { dispatchSetActiveFloor, layerService } = this.props;

    layerService.getLayer(`ch.sbb.geschosse`).children.forEach(layer => {
      layer.setVisible(false);
    });
    layerService.getLayer(`ch.sbb.geschosse${floor}`).setVisible(true);

    dispatchSetActiveFloor(floor, 'Switcher');
  }

  renderMobilePicker(floors) {
    const { activeFloor } = this.props;
    let selectedFloor = activeFloor;

    if (!selectedFloor) {
      // choose floor "0" or first floow
      selectedFloor = floors.find(f => f.iabp_name === '0') || floors[0];
    }

    // find previous and next floor
    let prevFloor = null;
    let nextFloor = null;

    for (let i = 0; i < floors.length; i += 1) {
      if (floors[i] === selectedFloor) {
        prevFloor = i > 0 ? floors[i - 1] : null;
        nextFloor = i < floors.length - 1 ? floors[i + 1] : null;
        break;
      }
    }

    const prevButtonClass = `tm-prev-floor ${prevFloor ? '' : 'disabled'}`;
    const nextButtonClass = `tm-next-floor ${nextFloor ? '' : 'disabled'}`;

    return (
      <div className="tm-floor-switcher-mobile">
        <Button
          className={`tm-floor-button-mobile ${prevButtonClass}`}
          onClick={() => prevFloor && this.selectFloor(prevFloor)}
        >
          <FiArrowUp />
        </Button>
        <FloorButton
          active={!!activeFloor}
          floor={selectedFloor}
          isMobile
          onClick={f => this.selectFloor(f)}
        />
        <Button
          className={`tm-floor-button-mobile ${nextButtonClass}`}
          onClick={() => nextFloor && this.selectFloor(nextFloor)}
        >
          <FiArrowDown />
        </Button>
      </div>
    );
  }

  render() {
    const {
      activeFloor,
      // isAppWidthSmallerThanS
    } = this.props;
    const { floors } = this.state;

    // if (isAppWidthSmallerThanS) {
    //   return this.renderMobilePicker(floors);
    // }

    return (
      <ol className="tm-floor-switcher">
        {floors.map(floor => (
          <li key={floor}>
            <FloorButton
              active={!!(activeFloor && floor === activeFloor)}
              floor={floor}
              onClick={f => this.selectFloor(f)}
            />
          </li>
        ))}
      </ol>
    );
  }
}

const mapStateToProps = state => ({
  activeFloor: state.MapReducer.activeFloor,
  center: state.MapReducer.center,
  map: state.MapReducer.olMap,
  layerService: state.MapReducer.layerService,
  // isAppWidthSmallerThanS: state.isAppWidthSmallerThanS,
});

const mapDispatchToProps = {
  dispatchSetActiveFloor: setActiveFloor,
  dispatchShowNotification: showNotification,
};

FloorSwitcher.propTypes = propTypes;
// FloorSwitcher.defaultProps = defaultProps;

export default connect(mapStateToProps, mapDispatchToProps)(FloorSwitcher);
