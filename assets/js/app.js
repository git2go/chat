var React = require('react');
var ReactDOM = require('react-dom');

class Message extends React.Component {
  constructor() {
    super();
  }

  render() {
    return  (
      <tbody>
        <tr>
          <td><strong>{"User " + this.props.message.from}</strong></td>
          <td>{this.props.message.msg}</td>
          <td>{this.props.message.createdAt}</td>
        </tr>
      </tbody>
    )
  }
}

class User extends React.Component {
  constructor() {
    super();
    this.messageUser = this.messageUser.bind(this);
  }

  messageUser() {
    this.props.messageUser(this.props.user.id);
  }

  render() {
    return  <option value={this.props.user.id}>
      {'User ' + this.props.user.id}
    </option>
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], messages: [], contact: '',  message: '' }
    this.setUser = this.setUser.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
  }

  componentDidMount() {
    var self = this;
     let i = setInterval(function() {
       //get list of users currently online
      io.socket.get('/user', function(data) {
       let currentUsers = data.filter(user => {
          return user.id !== self.props.currentUser.id
        });
        self.setState({ users: currentUsers });
      });

      //get messages sent to me
       io.socket.get('/message?to=' + self.props.currentUser.id, function(toMsg) {
         io.socket.get('/message?from=' + self.props.currentUser.id, function(fromMsg) {
           var messages = toMsg.concat(fromMsg).sort(function(a, b) {
             return a.createdAt < b.createdAt;
           });
           if (messages.length && messages.length > self.state.messages.length) {
             self.setState({messages: messages });
           }
        });
      });
    }, 1000);
  }

  setUser(e) {
    var self = this;
    // //get messages sent from a selected user
    // io.socket.get('/message?from=' + e.target.value + '&to='+ self.props.currentUser.id, function(data) {
    //     let messages = data.sort(function(a, b) {
    //       return a.createdAt < b.createdAt;
    //     });
    //     self.setState({messages: messages });
    // });
    self.setState({ contact: e.target.value });
  }

  showUsers() {
    var users = this.state.users.map((user, idx) => {
      return ( <User key={idx} user={user} messageUser={this.setUser} /> )
    });
    return (
      <div>
        <select onChange={this.setUser}>
          {users}
        </select>
      </div>
    )
  }

  showUserAndMessager() {
    var messages = this.state.messages.map((msg, idx) => {
      return ( <Message key={idx} message={msg} /> )
    });

    return (
      <div>
        {this.showUsers()}
        <form onSubmit={this.sendMessage}>
          <input type="text" name="message" onChange={this.updateMessage} />
          <input type="submit" value="Send" />
        </form>
        <div className="messages">
          <table>
            {messages}
          </table>
        </div>
      </div>
    )
  }

  updateMessage(e) {
    this.setState({ message: e.target.value });
  }

  sendMessage(e) {
    var self = this;
    e.preventDefault();
    io.socket.post('/message', {
      to: self.state.contact,
      from: self.props.currentUser.id,
      msg: self.state.message
    }, function(msg) {
      let messages = msg.concat(self.state.messages);
      self.setState({ messages: messages });
    });
  }

  render() {
    const view = this.state.contact || this.state.messages.length
            ? this.showUserAndMessager() : this.showUsers();
    return (
      <div>
        <h3>{"Hello User " + this.props.currentUser.id}</h3>
        {view}
      </div>
    )
  }
}

io.socket.on('connect', function socketConnected() {
   io.socket.get('/user/announce', function(user) {
     ReactDOM.render(<App currentUser={user} />, document.getElementById('app'));
   });
});
