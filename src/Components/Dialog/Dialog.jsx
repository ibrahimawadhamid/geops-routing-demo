import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import UIDialog from '@geops/react-ui/components/Dialog';
import { setDialogPosition, setDialogSize } from '../../store/actions/Map';
import './Dialog.scss';

const propTypes = {
  children: PropTypes.element.isRequired,
  title: PropTypes.element.isRequired,
  onClose: PropTypes.func.isRequired,
  isResizable: PropTypes.bool,
};

const defaultProps = {
  isResizable: false,
};

function Dialog({ onClose, title, children, isResizable }) {
  const dispatch = useDispatch();
  const dialogSize = useSelector(state => state.MapReducer.dialogSize);
  const dialogPosition = useSelector(state => state.MapReducer.dialogPosition);

  const onDragStop = (evt, position) => {
    dispatch(
      setDialogPosition({
        x: position.lastX,
        y: position.lastY,
      }),
    );
  };

  const onResizeStop = (e, direction, ref, delta, position) => {
    dispatch(
      setDialogSize({
        width: ref.offsetWidth,
        height: ref.offsetHeight,
        ...position,
      }),
    );
  };

  return (
    <UIDialog
      isOpen
      title={title}
      isDraggable
      size={dialogSize}
      onResizeStop={onResizeStop}
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
