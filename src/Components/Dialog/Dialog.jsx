import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import UIDialog from '@geops/react-ui/components/Dialog';
import { setDialogPosition } from '../../store/actions/Map';
import './Dialog.scss';

const propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.element.isRequired,
  onClose: PropTypes.func.isRequired,
  isResizable: PropTypes.bool,
  size: PropTypes.shape({
    height: PropTypes.number,
    width: PropTypes.number,
  }),
};

const defaultProps = {
  isResizable: false,
  size: null,
};

function Dialog({ onClose, title, children, size, isResizable }) {
  const dispatch = useDispatch();
  const dialogPosition = useSelector(state => state.MapReducer.dialogPosition);

  const onDragStop = (evt, position) => {
    dispatch(
      setDialogPosition({
        x: position.lastX,
        y: position.lastY,
      }),
    );
  };

  return (
    <UIDialog
      isOpen
      title={title}
      isDraggable
      size={size}
      isResizable={isResizable}
      onDragStop={onDragStop}
      className="rd-dialog-container"
      classNameHeader="rd-dialog-header"
      classNameCloseBt="rd-dialog-close-bt"
      cancelDraggable=".tm-dialog-body"
      position={dialogPosition}
      onClose={onClose}
    >
      {children}
    </UIDialog>
  );
}

Dialog.propTypes = propTypes;
Dialog.defaultProps = defaultProps;

export default Dialog;
