import React from "react"
import Dialog from "material-ui/Dialog"
import Button from "material-ui-next/Button"
import { List, ListItem, makeSelectable } from "material-ui/List"

const languageDialogContentStyle = {
  width: "350px",
}

let SelectableList = makeSelectable(List)

function wrapState(ComposedComponent) {
  return class SelectableList extends React.Component {
    componentWillMount() {
      this.setState({
        selectedIndex: this.props.defaultValue,
      })
    }

    handleRequestChange = (event, index) => {
      this.setState({
        selectedIndex: index,
      })
    }

    render() {
      return (
        <ComposedComponent
          value={this.state.selectedIndex}
          onChange={this.handleRequestChange}
        >
          {this.props.children}
        </ComposedComponent>
      )
    }
  }
}

SelectableList = wrapState(SelectableList)

export default class ChangeLanguageDialog extends React.Component {
  state = {
    languageSnackOpen: false,
  }

  handleLanguageSnackOpen = () => {
    this.setState({
      languageSnackOpen: true,
    })
    this.props.handleLanguageDialogClose()
  }

  handleLanguageSnackClose = () => {
    this.setState({
      languageSnackOpen: false,
    })
  }

  render() {
    const languageDialogActions = [
      <Button onClick={this.props.handleLanguageDialogClose}>Close</Button>,
    ]

    return (
      <React.Fragment>
        <Dialog
          title="Change language"
          actions={languageDialogActions}
          open={this.props.languageDialogOpen}
          contentStyle={languageDialogContentStyle}
          bodyStyle={{
            paddingLeft: "8px",
            paddingRight: "8px",
            paddingBottom: "0px",
          }}
          onRequestClose={this.props.handleLanguageDialogClose}
          className="notSelectable"
        >
          <SelectableList defaultValue={2} style={{ paddingBottom: "0px" }}>
            <ListItem primaryText="Deutsch" value={1} />
            <ListItem primaryText="English" value={2} />
            <ListItem primaryText="Español" value={3} />
            <ListItem primaryText="Italiano" value={4} />
            <ListItem primaryText="中文 (简体)" value={5} />
          </SelectableList>
        </Dialog>
      </React.Fragment>
    )
  }
}