import React, { Component } from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import List, {
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
} from "material-ui-next/List"
import CenteredSpinner from "./CenteredSpinner"
import FloatingActionButton from "material-ui/FloatingActionButton"
import Tooltip from "material-ui-next/Tooltip"
import Badge from "material-ui-next/Badge"
import { MuiThemeProvider, createMuiTheme } from "material-ui-next/styles"
import { hotkeys } from "react-keyboard-shortcuts"
import Icon from "material-ui-next/Icon"

const theme = createMuiTheme({
  palette: {
    primary: { main: "#ff4081" },
  },
})

class Sidebar extends Component {
  componentDidMount() {
    const subscriptionQuery = gql`
      subscription {
        deviceCreated {
          id
          customName
          icon
          notifications {
            id
            content
            date
            visualized
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: subscriptionQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newDevices = [
          ...prev.user.devices,
          subscriptionData.data.deviceCreated,
        ]
        return {
          user: {
            ...prev.user,
            devices: newDevices,
          },
        }
      },
    })

    const updateQuery = gql`
      subscription {
        deviceUpdated {
          id
          customName
          icon
          notifications {
            id
            content
            date
            visualized
          }
        }
      }
    `

    this.props.userData.subscribeToMore({
      document: updateQuery,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) {
          return prev
        }
        const newDevice = subscriptionData.deviceUpdated
        const newDevices = prev.user.devices.map(
          device => (device.id === newDevice.id ? newDevice : device)
        )
        return {
          user: {
            ...prev.user,
            devices: newDevices,
          },
        }
      },
    })
  }

  listItemClick = device => {
    if (this.props.selectedDevice !== device.id) {
      this.props.selectDevice(device.id)
    } else {
      this.props.selectDevice(null)
    }
  }

  render() {
    const {
      userData: { loading, error, user },
    } = this.props

    let notificationCount = ""

    if (loading) {
      return <CenteredSpinner />
    }
    if (error) {
      return <p>{error.message}</p>
    }

    return (
      <React.Fragment>
        <div style={{ height: "100%" }}>
          <List>
            {user.devices.map(device => (
              <ListItem
                button
                className="notSelectable"
                style={
                  this.props.selectedDevice === device.id
                    ? { backgroundColor: "#d4d4d4" }
                    : { backgroundColor: "transparent" }
                }
                key={device.id}
                onClick={() => this.listItemClick(device)}
              >
                <ListItemIcon>
                  {device.icon ? (
                    <img
                      className="deviceIcon"
                      src={device.icon}
                      alt="device logo"
                    />
                  ) : (
                    <Icon>lightbulb_outline</Icon>
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={device.customName}
                  secondary={
                    device.notifications
                      .filter(notification => notification.visualized === false)
                      .map(notification => notification.content)
                      .reverse()[0]
                      ? device.notifications
                          .filter(
                            notification => notification.visualized === false
                          )
                          .map(notification => notification.content)
                          .reverse()[0]
                      : device.notifications
                          .filter(
                            notification => notification.visualized === true
                          )
                          .map(notification => notification.content)
                          .reverse()[0]
                        ? "No unread notifications"
                        : "No notifications"
                  }
                />
                {device.notifications
                  .filter(notification => notification.visualized === false)
                  .map(notification => notification.content)
                  .reverse()[0] ? (
                  <ListItemSecondaryAction>
                    <MuiThemeProvider theme={theme}>
                      <Badge
                        badgeContent={
                          device.notifications.filter(
                            notification => notification.visualized === false
                          ).length
                        }
                        color="primary"
                        className="notSelectable sidebarBadge"
                        style={{ marginRight: "24px" }}
                        onClick={() => {
                          this.props.changeDrawerState()
                          this.listItemClick(device)
                        }}
                      />
                    </MuiThemeProvider>
                  </ListItemSecondaryAction>
                ) : null}
              </ListItem>
            ))}
          </List>
        </div>
        <Tooltip id="tooltip-bottom" title="Edit list" placement="bottom">
          <FloatingActionButton
            className="notSelectable deviceEditFab"
            backgroundColor="#ff4081"
            style={{
              transition:
                "all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms, left 0s linear, right 0s linear, top 0s linear, bottom 0s linear",
            }}
          >
            <Icon>mode_edit</Icon>
          </FloatingActionButton>
        </Tooltip>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    query {
      user {
        devices {
          id
          customName
          icon
          notifications {
            id
            content
            date
            visualized
          }
        }
      }
    }
  `,
  { name: "userData" }
)(hotkeys(Sidebar))
