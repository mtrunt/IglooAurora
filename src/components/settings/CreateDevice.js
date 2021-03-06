import React from "react"
import { graphql } from "react-apollo"
import gql from "graphql-tag"
import CenteredSpinner from "../CenteredSpinner"
import FormControl from "@material-ui/core/FormControl"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Button from "@material-ui/core/Button"
import MuiThemeProvider from "@material-ui/core/styles/MuiThemeProvider"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import Dialog from "@material-ui/core/Dialog"
import DialogTitle from "@material-ui/core/DialogTitle"
import DialogActions from "@material-ui/core/DialogActions"
import Grow from "@material-ui/core/Grow"
import Slide from "@material-ui/core/Slide"
import Icon from "@material-ui/core/Icon"
import Input from "@material-ui/core/Input"
import InputAdornment from "@material-ui/core/InputAdornment"
import IconButton from "@material-ui/core/IconButton"

const theme = createMuiTheme({
  palette: {
    primary: { main: "#0083ff" },
    secondary: { main: "#ff4081" },
  },
})

const MOBILE_WIDTH = 500

function Transition(props) {
  return window.innerWidth > MOBILE_WIDTH ? (
    <Grow {...props} />
  ) : (
    <Slide direction="up" {...props} />
  )
}

class CreateDevice extends React.Component {
  state = { deviceType: "", customName: "", board: 0 }

  render() {
    const {
      userData: { error, user, loading },
    } = this.props

    let boards = ""

    if (error) boards = "Unexpected error"

    if (loading) boards = <CenteredSpinner />

    let createDeviceMutation = () => {
      this.props["CreateDevice"]({
        variables: {
          deviceType: this.state.deviceType,
          customName: this.state.customName,
          boardId: user.boards[this.state.board].id,
          firmware: this.state.firmware,
        },
      })
    }

    if (user)
      boards = (
        <MuiThemeProvider theme={theme}>
          <FormControl style={{ width: "100%" }}>
            <Select
              value={this.state.board}
              onChange={event => {
                this.setState({ board: event.target.value })
              }}
              name="board"
            >
              {user.boards
                .filter(
                  board => board.myRole === "ADMIN" || board.myRole === "OWNER"
                )
                .map(board => (
                  <MenuItem value={board.index}>{board.customName}</MenuItem>
                ))}
            </Select>
          </FormControl>
        </MuiThemeProvider>
      )

    return (
      <React.Fragment>
        <Dialog
          open={this.props.open}
          onClose={this.props.close}
          TransitionComponent={Transition}
          fullScreen={window.innerWidth < MOBILE_WIDTH}
          className="notSelectable defaultCursor"
        >
          <DialogTitle
            style={
              window.innerWidth < MOBILE_WIDTH
                ? typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                  ? { width: "calc(100% - 48px)", background: "#2f333d" }
                  : { width: "calc(100% - 48px)", background: "#fff" }
                : typeof Storage !== "undefined" &&
                  localStorage.getItem("nightMode") === "true"
                  ? { width: "350px", background: "#2f333d" }
                  : { width: "350px", background: "#fff" }
            }
          >
            <font
              style={
                typeof Storage !== "undefined" &&
                localStorage.getItem("nightMode") === "true"
                  ? { color: "#fff" }
                  : {}
              }
            >
              Create device
            </font>
          </DialogTitle>
          <div
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                    background: "#2f333d",
                  }
                : {
                    height: "100%",
                    paddingRight: "24px",
                    paddingLeft: "24px",
                  }
            }
          >
            <MuiThemeProvider theme={theme}>
              {user &&
              user.boards.filter(
                board => board.myRole === "ADMIN" || board.myRole === "OWNER"
              )[0] ? (
                <React.Fragment>
                  <FormControl style={{ width: "100%" }}>
                    <Input
                      id="adornment-name-login"
                      placeholder="Custom name"
                      value={this.state.customName}
                      onChange={event =>
                        this.setState({ customName: event.target.value })
                      }
                      onKeyPress={event => {
                        if (event.key === "Enter") createDeviceMutation()
                      }}
                      endAdornment={
                        this.state.customName && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => this.setState({ customName: "" })}
                              tabIndex="-1"
                            >
                              <Icon>clear</Icon>
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    />
                  </FormControl>
                  <br /> <br />
                  <FormControl style={{ width: "100%" }}>
                    <Input
                      id="adornment-name-login"
                      placeholder="Device type"
                      value={this.state.deviceType}
                      onChange={event =>
                        this.setState({ deviceType: event.target.value })
                      }
                      onKeyPress={event => {
                        if (event.key === "Enter") createDeviceMutation()
                      }}
                      endAdornment={
                        this.state.deviceType && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => this.setState({ deviceType: "" })}
                              tabIndex="-1"
                            >
                              <Icon>clear</Icon>
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    />
                  </FormControl>
                  <br /> <br />
                  {boards}
                  <br /> <br />
                  <FormControl style={{ width: "100%" }}>
                    <Input
                      id="adornment-name-login"
                      placeholder="Firmware"
                      value={this.state.firmware}
                      onChange={event =>
                        this.setState({ firmware: event.target.value })
                      }
                      onKeyPress={event => {
                        if (event.key === "Enter") createDeviceMutation()
                      }}
                      endAdornment={
                        this.state.firmware && (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => this.setState({ firmware: "" })}
                              tabIndex="-1"
                            >
                              <Icon>clear</Icon>
                            </IconButton>
                          </InputAdornment>
                        )
                      }
                    />
                  </FormControl>
                </React.Fragment>
              ) : (
                "None of your boards allows you to create new devices"
              )}
            </MuiThemeProvider>
            <br />
          </div>
          <DialogActions
            style={
              typeof Storage !== "undefined" &&
              localStorage.getItem("nightMode") === "true"
                ? {
                    padding: "8px",
                    margin: "0",
                    background: "#2f333d",
                  }
                : {
                    padding: "8px",
                    margin: "0",
                  }
            }
          >
            <MuiThemeProvider theme={theme}>
              <Button
                onClick={this.props.close}
                style={{ marginRight: "4px", color: "white" }}
              >
                <font
                  style={
                    typeof Storage !== "undefined" &&
                    localStorage.getItem("nightMode") === "true"
                      ? { color: "white" }
                      : {}
                  }
                >
                  Never mind
                </font>
              </Button>
              <Button
                variant="raised"
                color="primary"
                label="Change"
                primary={true}
                buttonStyle={{ backgroundColor: "#0083ff" }}
                onClick={createDeviceMutation}
                disabled={!this.state.deviceType || !this.state.customName}
              >
                Create
              </Button>
            </MuiThemeProvider>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default graphql(
  gql`
    mutation CreateDevice(
      $deviceType: String
      $customName: String!
      $boardId: ID!
      $firmware: String
    ) {
      CreateDevice(
        deviceType: $deviceType
        customName: $customName
        boardId: $boardId
        firmware: $firmware
      ) {
        id
      }
    }
  `,
  {
    name: "CreateDevice",
  }
)(CreateDevice)
