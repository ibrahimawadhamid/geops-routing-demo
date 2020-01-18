import React from "react";
import Snackbar from "@material-ui/core/Snackbar";
import { connect } from "react-redux";
import Alert from "@material-ui/lab/Alert";
import PropTypes from "prop-types";

class NotificationHandler extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
  }

  componentDidUpdate(prevProps) {
    const { notificationMessage } = this.props;
    if (
      notificationMessage &&
      notificationMessage !== prevProps.notificationMessage
    ) {
      this.handleOpen();
    }
  }

  handleOpen = () => {
    this.setState({
      open: true
    });
  };

  handleClose = () => {
    this.setState({
      open: false
    });
  };

  render() {
    const { notificationMessage, notificationType } = this.props;
    const { open } = this.state;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left"
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
    notificationType: state.MapReducer.notificationType
  };
};

NotificationHandler.propTypes = {
  notificationMessage: PropTypes.string.isRequired,
  notificationType: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(NotificationHandler);
