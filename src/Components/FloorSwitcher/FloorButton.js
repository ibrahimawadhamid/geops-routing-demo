import React from 'react';
import PropTypes from 'prop-types';
import Button from '@geops/react-ui/components/Button';

import { floorsColor } from '../../config/styleConfig';
import './FloorButton.scss';

const propTypes = {
  active: PropTypes.bool,
  floor: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  children: PropTypes.any,
};

const defaultProps = {
  children: null,
  active: false,
  isMobile: false,
};

function getFloorStyle(active, floor) {
  return active
    ? { backgroundColor: floorsColor[floor === '2D' ? '0' : floor] }
    : null;
}

const FloorButton = ({ floor, onClick, active, children, isMobile }) => {
  const mobileInfo = isMobile && (
    <div className="tm-mobile-floor-info">Floor</div>
  );
  return (
    <>
      <div className="tm-floor-button-wrapper">
        <Button
          className={`tm-button tm-square-white${active ? ' tm-active' : ''}`}
          onClick={() => onClick(floor)}
          style={getFloorStyle(active, floor)}
        >
          {mobileInfo}
          <div>
            {floor}
            {children}
          </div>
        </Button>
      </div>
    </>
  );
};

FloorButton.propTypes = propTypes;
FloorButton.defaultProps = defaultProps;

export default React.memo(FloorButton);
