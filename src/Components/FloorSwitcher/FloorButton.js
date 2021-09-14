import React from 'react';
import PropTypes from 'prop-types';
import Button from '@geops/react-ui/components/Button';

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
