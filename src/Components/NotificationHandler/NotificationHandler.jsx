import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import {connect} from 'react-redux';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

class NotificationHandler extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    handleClose = () => {
        this.setState({
            open: false
        })
    };

    componentDidUpdate(prevProps) {
        if (this.props.notificationMessage && this.props.notificationMessage !== prevProps.notificationMessage) {
            this.setState({
                open: true
            });
        }
    }

    render() {
        return(
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={6000}
                onClose={this.handleClose}
            >
                <Alert onClose={this.handleClose} severity={this.props.notificationType}>
                    {this.props.notificationMessage}
                </Alert>
            </Snackbar>
        );
    }
};


const mapStateToProps = state => {
    return {
        notificationMessage: state.MapReducer.notificationMessage,
        notificationType: state.MapReducer.notificationType,
    };
};


export default connect(mapStateToProps)(NotificationHandler);