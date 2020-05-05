import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '../Dialog';
import planInfosSource from '../../img/plan-infos.png';
import './PlanInfosDialog.scss';

const propTypes = {
  onClose: PropTypes.func.isRequired,
};

function PlanInfosDialog({ onClose }) {
  return (
    <Dialog
      title={<span>Plan Information</span>}
      onClose={onClose}
      isResizable
      size={{
        height: 550,
        width: 500,
      }}
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <div className="rd-plans-infos-wrapper">
        <img src={planInfosSource} alt="Mapset" />
      </div>
    </Dialog>
  );
}

PlanInfosDialog.propTypes = propTypes;
export default PlanInfosDialog;
