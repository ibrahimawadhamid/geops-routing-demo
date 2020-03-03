import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import { connect } from 'react-redux';
import Alert from '@material-ui/lab/Alert';
import PropTypes from 'prop-types';

/**
 * The notification handler props
 * @typedef NotificationHandlerProps
 * @type {props}
 * @property {string} notificationMessage Obtained from the store, the message to be displayed. Can be any valid string.
 * @property {string} notificationType Obtained from the store, the message type (error, success, info, etc...)
 * @category Props
 */

/**
 * Handles all application notification shown to the user
 * @category NotificationHandler
 */
class NotificationHandler extends React.Component {
  /**
   * Default constructor. visibility is set to false by default. Controlled through state property "open"
   * @param {...NotificationHandlerProps} props Props received so that the component can function properly.
   * @category NotificationHandler
   */
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }

  /**
   * If a new notification message is received, show it accordingly.
   * @category NotificationHandler
   */
  componentDidUpdate(prevProps) {
    const { notificationMessage } = this.props;
    if (
      notificationMessage &&
      notificationMessage !== prevProps.notificationMessage
    ) {
      this.handleOpen();
    }
  }

  /**
   * Show the notification to the view.
   * @category NotificationHandler
   */
  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  /**
   * Hide the notification from the view.
   * @category NotificationHandler
   */
  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  /**
   * Render the notification to the dom.
   * @category NotificationHandler
   */
  render() {
    const { notificationMessage, notificationType } = this.props;
    const { open } = this.state;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        autoHideDuration={6000}
        onClose={this.handleClose}
      >
        <Alert
          onClose={this.handleClose}
          severity={notificationType}
          elevation={6}
          variant="filled"
        >
          {notificationMessage}
        </Alert>
      </Snackbar>
    );
  }
}

const mapStateToProps = state => {
  return {
    notificationMessage: state.MapReducer.notificationMessage,
    notificationType: state.MapReducer.notificationType,
  };
};

NotificationHandler.propTypes = {
  notificationMessage: PropTypes.string.isRequired,
  notificationType: PropTypes.string.isRequired,
};

export default connect(mapStateToProps)(NotificationHandler);
