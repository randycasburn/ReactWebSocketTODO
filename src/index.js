import React from "react";
import ReactDOM from "react-dom";
import Socket from "./socket";

import "./styles.css";

class TodoApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [], text: "", socketMessages: [] };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSocket = this.handleSocket.bind(this);
  }
  componentDidMount() {
    // Socket Related Events
    document.addEventListener("socket-open", this.handleSocket);
    document.addEventListener("socket-closed", this.handleSocket);
    document.addEventListener("socket-receive", this.handleSocket);
    document.addEventListener("socket-send", this.handleSocket);
    document.addEventListener("socket-error", this.handleSocket);
    Socket.setUrl(/* to something */);
    Socket.init();
  }

  componentWillUnmount() {
    Socket.close();
  }

  render() {
    return (
      <div>
        <h3>React Demo TODO App with WebSockets</h3>
        <TodoList items={this.state.items} />
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="new-todo">What needs to be done?</label>
          <input
            id="new-todo"
            onChange={this.handleChange}
            value={this.state.text}
          />
          <button>Add #{this.state.items.length + 1}</button>
        </form>
        <SocketMessageSummary />
        <SocketMessageList messages={this.state.socketMessages} />
      </div>
    );
  }

  handleSocket(e) {
    const event = {
      event: e.type,
      message: e.detail
    };
    this.setState(state => ({
      socketMessages: state.socketMessages.concat(event)
    }));
  }

  handleChange(e) {
    this.setState({ text: e.target.value });
  }
  handleSubmit(e) {
    e.preventDefault();
    if (!this.state.text.length) {
      return;
    }
    const newItem = {
      text: this.state.text,
      id: Date.now()
    };
    this.setState(state => ({
      items: state.items.concat(newItem),
      text: ""
    }));
    Socket.send(JSON.stringify(newItem));
  }
}

class TodoList extends React.Component {
  render() {
    return (
      <ul>
        {this.props.items.map(item => (
          <li key={item.id}>{item.text}</li>
        ))}
      </ul>
    );
  }
}
class SocketMessageSummary extends React.Component {
  render() {
    return (
      <div>
        <h3>WebSocket Summary</h3>
        <div>
          <p>Connected: {Socket.state.connected.toString()}</p>
          <p>
            Messages:
            <ul>
              <li>Received: {Socket.state.messages.received}</li>
              <li>Sent: {Socket.state.messages.sent}</li>
              <li>Last In: {Socket.state.messages.lastIn}</li>
              <li>Last Out: {Socket.state.messages.lastOut}</li>
              <li>Error: {Socket.state.error}</li>
            </ul>
          </p>
        </div>
      </div>
    );
  }
}
class SocketMessageList extends React.Component {
  render() {
    return (
      <div>
        <h3>Demo WebSocket using websocket.org "echo" server:</h3>
        <ul>
          {this.props.messages.map(item => (
            <li>
              {" "}
              {item.event} : {item.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

ReactDOM.render(<TodoApp />, document.getElementById("root"));
