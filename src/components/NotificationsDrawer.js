import React from "react"
import IconButton from "material-ui/IconButton"
import IconMenu from "material-ui/IconMenu"
import CenteredSpinner from "./CenteredSpinner"
import List, {
  ListItem,
  ListItemIcon,
  ListItemText,
} from "material-ui-next/List"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import Snackbar from "material-ui/Snackbar"
import Badge from "material-ui-next/Badge"
import ReactCSSTransitionGroup from "react-addons-css-transition-group"
import Tooltip from "material-ui-next/Tooltip"
import SwipeableDrawer from "material-ui-next/SwipeableDrawer"
import FlatButton from "material-ui/FlatButton"
import { MuiThemeProvider, createMuiTheme } from "material-ui-next/styles"
import { hotkeys } from "react-keyboard-shortcuts"

var moment = require("moment")

const theme = createMuiTheme({
  palette: {
    primary: { main: "#ff4081" },
  },
})

const sleep = time =>
  new Promise((resolve, reject) => {
    setTimeout(() => resolve(), time)
  })

class NotificationsDrawer extends React.Component {
  state = {
    drawer: false,
  }

  hot_keys = {
    "alt+n": {
      priority: 1,
      handler: event => {
        this.setState(oldState => ({
          drawer: !oldState.drawer,
        }))
      },
    },
  }

  componentDidMount() {
    const subscriptionQuery = gql`
      subscription {
        notificationCreated {
          id
          content
          date
          visualized
          device {
            id
            icon
            customName
          }
        }
      }
    `

    this.props.notifications.subscribeToMore({
      document: subscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newNotifications = [
          ...prev.user.notifications,
          subscriptionData.data.notificationCreated,
        ]
        return {
          user: {
            ...prev.user,
            notifications: newNotifications,
          },
        }
      },
    })

    const updateQuery = gql`
      subscription {
        notificationUpdated {
          id
          content
          date
          visualized
          device {
            id
            icon
            customName
          }
        }
      }
    `

    this.props.notifications.subscribeToMore({
      document: updateQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newNotification = subscriptionData.data.notificationUpdated

        const newNotifications = prev.user.notifications.map(
          notification =>
            notification.id === newNotification.id
              ? newNotification
              : notification
        )
        return {
          user: {
            ...prev.user,
            notifications: newNotifications,
          },
        }
      },
    })
  }

  render() {
    const {
      notifications: { loading, error, user },
    } = this.props

    let clearNotification = id => {
      this.props["ClearNotification"]({
        variables: {
          id: id,
        },
        optimisticResponse: {
          __typename: "Mutation",
          notification: {
            id: id,
            visualized: true,
            __typename: "Notification",
          },
        },
      })
    }

    let clearAllNotifications = () => {
      const notificationsToFlush = user.notifications.filter(
        notification =>
          notification.device.id === this.props.device.id &&
          notification.visualized === false
      )

      for (let i = 0; i < notificationsToFlush.length; i++) {
        clearNotification(notificationsToFlush[i].id)
      }
    }

    let notifications = ""
    let readNotifications = ""

    let notificationCount = ""

    let noNotificationsUI = ""
    let readNotificationsUI = ""

    if (error) notifications = "Unexpected error"

    if (loading) notifications = <CenteredSpinner />

    if (user) {
      notifications = (
        <List>
          <ReactCSSTransitionGroup
            transitionName="notification"
            transitionEnterTimeout={5000}
            transitionLeaveTimeout={3000}
          >
            {user.notifications
              .filter(
                notification => notification.device.id === this.props.device.id
              )
              .filter(notification => notification.visualized === false)
              .map(notification => (
                <ListItem
                  className="notSelectable"
                  id={notification.id}
                  onClick={() => clearNotification(notification.id)}
                >
                  <ListItemText
                    primary={notification.content}
                    secondary={moment(
                      notification.date.split(".")[0],
                      "YYYY-MM-DDTh:mm:ss"
                    ).fromNow()}
                    style={{
                      backgroundColor: "transparent",
                    }}
                  />
                </ListItem>
              ))
              .reverse()}
          </ReactCSSTransitionGroup>
        </List>
      )

      readNotifications = (
        <List>
          <ReactCSSTransitionGroup
            transitionName="notification"
            transitionEnterTimeout={5000}
            transitionLeaveTimeout={3000}
          >
            {user.notifications
              .filter(
                notification => notification.device.id === this.props.device.id
              )
              .filter(notification => notification.visualized === true)
              .map(notification => (
                <ListItem
                  button
                  className="notSelectable"
                  style={{
                    backgroundColor: "transparent",
                  }}
                  id={notification.id}
                >
                  <ListItemText
                    primary={notification.content}
                    secondary={moment(
                      notification.date.split(".")[0],
                      "YYYY-MM-DDTh:mm:ss"
                    ).fromNow()}
                    style={{
                      backgroundColor: "transparent",
                    }}
                  />
                </ListItem>
              ))
              .reverse()}
          </ReactCSSTransitionGroup>
        </List>
      )

      notificationCount = user.notifications
        .filter(notification => notification.device.id === this.props.device.id)
        .filter(notification => notification.visualized === false).length

      const readNotificationCount = user.notifications
        .filter(notification => notification.device.id === this.props.device.id)
        .filter(notification => notification.visualized === true).length

      if (!notificationCount) {
        noNotificationsUI = "No new notifications"
      }

      if (readNotificationCount) {
        readNotificationsUI = (
          <FlatButton
            onClick={() =>
              this.setState(oldState => ({
                showVisualized: !oldState.showVisualized,
              }))
            }
            label={
              this.state.showVisualized
                ? "Hide read notifications"
                : "Show read notifications"
            }
            icon={
              this.state.showVisualized ? (
                <i className="material-icons">keyboard_arrow_up</i>
              ) : (
                <i className="material-icons">keyboard_arrow_down</i>
              )
            }
            fullWidth={true}
            className="divider"
            key="showMoreLessButton"
            style={
              this.state.showVisualized
                ? { backgroundColor: "#d4d4d4" }
                : { backgroundColor: "transparent" }
            }
          />
        )
      }
    }

    return (
      <React.Fragment>
        <Tooltip title="Notifications" placement="bottom">
          <IconButton
            className="mainBodyHeaderIcon"
            style={{
              padding: "0",
              width: "32px",
              height: "32px",
              marginTop: "14px",
              left: "34px",
            }}
            onClick={() =>
              this.setState(oldState => ({
                drawer: !oldState.drawer,
              }))
            }
          >
            <MuiThemeProvider theme={theme}>
              {notificationCount ? (
                <Badge badgeContent={notificationCount} color="primary">
                  <i class="material-icons">notifications</i>
                </Badge>
              ) : (
                <i class="material-icons">notifications_none</i>
              )}
            </MuiThemeProvider>
          </IconButton>
        </Tooltip>
        <SwipeableDrawer
          variant="temporary"
          anchor="right"
          open={this.state.drawer}
          onClose={async time => {
            this.setState(
              this.state.drawer ? { drawer: false } : { drawer: true }
            )
            await sleep(200)
            clearAllNotifications()
          }}
          swipeAreaWidth={0}
          disableBackdropTransition={false}
          disableDiscovery={true}
        >
          <div className="notificationsTopBar notSelectable invisibleHeader">
            <Tooltip
              id="tooltip-bottom"
              title="Close drawer"
              placement="bottom"
            >
              <IconButton
                className="notificationsLeftSide"
                onClick={() => {
                  this.setState({ drawer: false })
                  clearAllNotifications()
                }}
                style={{
                  padding: "0",
                  width: "32px",
                  height: "32px",
                }}
              >
                <i class="material-icons">chevron_right</i>
              </IconButton>
            </Tooltip>
            {/*  <Tooltip id="tooltip-bottom" title="Clear all" placement="bottom">
              <IconButton
                className="notificationsRightSide2"
                style={{
                  padding: "0",
                  width: "32px",
                  height: "32px",
                }}
                onClick={() => {
                  clearAllNotifications()
                }}
              >
                <i className="material-icons">clear_all</i>
              </IconButton>
            </Tooltip> */}
            <Tooltip id="tooltip-bottom" title="Mute device" placement="bottom">
              <IconButton
                className="notificationsRightSide"
                style={{
                  padding: "0",
                  width: "32px",
                  height: "32px",
                }}
              >
                <i className="material-icons">notifications_off</i>
              </IconButton>
            </Tooltip>
          </div>
          <div
            className="notSelectable"
            style={{ overflowY: "auto", height: "100%", width: "320px" }}
          >
            {noNotificationsUI}
            {notifications}
            {readNotificationsUI}
            {readNotificationsUI
              ? this.state.showVisualized
                ? readNotifications
                : ""
              : ""}
          </div>
        </SwipeableDrawer>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    query {
      user {
        notifications {
          id
          content
          date
          visualized
          device {
            id
            icon
            customName
          }
        }
      }
    }
  `,
  { name: "notifications" }
)(
  graphql(
    gql`
      mutation ClearNotification($id: ID!) {
        notification(id: $id, visualized: true) {
          id
          visualized
        }
      }
    `,
    {
      name: "ClearNotification",
    }
  )(hotkeys(NotificationsDrawer))
)