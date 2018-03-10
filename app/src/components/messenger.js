import React, {Component} from 'react'
import avatar from '../images/avatar.png'
import classNames from 'classnames'
import {OrderedMap} from 'immutable'
import _ from 'lodash'
import moment from 'moment' //이거 3일전.. 표시용

import {ObjectID} from '../helpers/objectid'
import SearchUser from './search-user'

export default class Messenger extends Component{

  constructor(props) {
    super(props);
    this.state = {
      height: window.innerHeight,
      newMessage: 'Staring MEssage!',
      searchUser: "",
      showSearchUser: false,
    }
    this._onResize = this._onResize.bind(this);
  //  this.addTestMessages = this.addTestMessages.bind(this);
    this.handleSend = this.handleSend.bind(this);
    this.renederMessage = this.renderMessage.bind(this);
    this.scrollMessagesToBottom = this.scrollMessagesToBottom.bind(this);
    this._onCreateChannel = this._onCreateChannel.bind(this);
    this.renderChannelTitle = this.renderChannelTitle.bind(this);
  }

  renderChannelTitle(channel = {}){
    const {store} = this.props;
    const members = store.getMembersFromChannel(channel);
    const names = [];

    members.forEach((user) => {
      const name = _.get(user, 'name');
      names.push(name);
    })

    return <p>{_.join(names, ',')}</p>
  }

  _onCreateChannel(){

    const store = this.props.store;
    const channelId = new ObjectID().toString();
    const channel = {
      _id: channelId,
      title: "New message",
      lastMessage: "",
      members: new OrderedMap(),
      messages: new OrderedMap(),
      isNew: true,
      created: new Date(),
    };
    store.onCreateNewChannel(channel);

  //  console.log("On creating new channel");
  }

  scrollMessagesToBottom(){

        if(this.messagesRef){
          this.messagesRef.scrollTop = this.messagesRef.scrollHeight;
        }
  }

  renderMessage(message){ //**채팅보안-   참고링크 : https://velopert.com/1896//

    const text = _.get(message, 'body', '');
    const html = _.split(text, '\n').map((m, key) =>{
      return <p key={key} dangerouslySetInnerHTML={{__html:  m}} />
    })

    return html;
  }

  handleSend(){
    const newMessage = this.state.newMessage;
    const store = this.props.store;
    //create new message
    if(_.trim(newMessage).length){ //내용물이 있으면 전송
      const messageId = new ObjectID().toString();
      const channel = store.getActiveChannel();
      const channelId = _.get(channel, '_id', null);
      const currentUser = store.getCurrntUser();

      const message = {
        _id: messageId,
        channelId: channelId,
        body: newMessage,
        author: _.get(currentUser, 'name', null),
        avatar: avatar,
        me: true
      };
      store.addMessage(messageId, message);
      //console.log("New message Object:", message);
      this.setState({
        newMessage: '',
      });
      }

  }


  _onResize(){
    this.setState({
      height: window.innerHeight
    });
  }

  componentDidUpdate(){

    //console.log("Component did update");

    this.scrollMessagesToBottom();
  }

  componentDidMount(){
    //console.log("Component did mount");
    window.addEventListener('resize', this._onResize);
    //this.addTestMessages();
  }

  addTestMessages(){

    //const {store} = this.props;
    const {store} = this.props;

    //create test messages
    for(let i = 0; i < 50; i ++){

      let isMe = false;

      if(i % 2 === 0){
        isMe = true
      }
      const newMsg = {
        _id: `${i}`,
        author: `Author ${i}`,
        body: `The body of message ${i}`,
        avatar: avatar,
        me: isMe,
      }
        //console.log(typeof i);
        store.addMessage(i, newMsg);
        // this.setState({
        //   lastUpdated: new Date(),
        // })
      //  this.forceUpdate();
    }

    //채널생성 이제안씀/
    for(let c= 0; c<10; c++){

      const newChannel = {
        _id: `${c}`,
        title: `Channel title ${c}`,
        lastMessage: `this is last ..${c}`,
        members: new OrderedMap({
          '1': true,
          '2': true,
          '3': true,
        }),
        messages: new OrderedMap(),
        created: new Date(),
      }
      const msgId = `${c}`;
      const moreMsgId = `${c+1}`
      newChannel.messages = newChannel.messages.set(msgId, true);
      newChannel.messages = newChannel.messages.set(moreMsgId, true);

      store.addChannel(c, newChannel);
    }

  }

  componenetWillUnmount(){
  //  console.log("Component unmount");
    window.removeEventListener('resize', this._onResize);
  }

  render() {

   const {store} = this.props;
   const {height} = this.state;
    const style = {
      height: height,
    }

    const activeChannel = store.getActiveChannel();
    const messages = store.getMessagesFromChannel(activeChannel);  //store.getMessage();
    const channels = store.getChannels();
    const members = store.getMembersFromChannel(activeChannel);

    return (
           <div style={style} className="app-messenger">

              <div className="header">
                  <div className="left">
                  <button className="left-action">설정IMG</button>
                  <button onClick={this._onCreateChannel} className="right-action">생성IMG</button>
                  <h2>Messenger</h2>

                  </div>
                  <div className="content">

                    {_.get(activeChannel, 'isNew') ? <div className="toolbar">
                    <label>To: </label>
                    <input placeholder="Type name of person" onChange={(e) => {

                      const searchUserText = _.get(e, 'target.value');

                      //console.log("searching for user with name: ", searchUserText);

                      this.setState({
                        searchUser: searchUserText,
                        showSearchUser: true,
                      });


                    }} type="text" value={this.state.searchUser} />

                      {this.state.showSearchUser ? <SearchUser
                      onSelect={(user)=>{

                        this.setState({
                          showSearchUser: false,
                          searchUser: '',
                        }, () => {
                          const userId = _.get(user, '_id');
                          const channelId = _.get(activeChannel, '_id');

                          store.addUserToChannel(channelId, userId);
                        });

                      }}
                      search={this.state.searchUser} store={store} /> : null}
                    </div> : <h2>{_.get(activeChannel, 'title')}</h2>}
                    </div>

                    <div className="right">
                      <div className="user-bar">
                          <div className="profile-name">Durang-go</div>
                          <div className="profile-image"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQs3Yk35EfNQR6vXZ4_-gjCr7ptRIu-6Zts1qXcgncb4GWPJvPV" alt="" /></div>
                      </div>
                  </div>
              </div>
              <div className="main">
                  <div className="sidebar-left">
                  <div className="chanels">

                  {channels.map((channel, key) => {
                    return (
                      <div onClick={(key) => {

                        //console.log("Channel Id is selected:", channel._id);
                        store.setActiveChannelId(channel._id);

                      }} key={channel._id} className="chanel">
                          <div className="user-image"><img src={avatar} alt="" /> </div>
                          <div className="chanel-info">
                              <h2>{this.renderChannelTitle(channel)}</h2>
                              <p>{channel.lastMessage}</p>
                          </div>
                      </div>
                    )
                  })}

                    </div>
                  </div>


                  <div className="content">
                      <div ref={(ref) => this.messagesRef = ref} className="messages">
                          {messages.map((message,index) => {
                            const user =_.get(message, 'user');
                            return (
                              <div key={index} className={classNames('message', {'me': message.me})}>
                                    <div className="message-user-image">
                                        <img src={_.get(user, 'avatar')} alt=""/>
                                    </div>
                                  <div className="message-body">
                                      <div className="message-author">{message.me ? 'You' : message.author} : </div>
                                      <div className="message-text">
                                      {this.renderMessage(message)}
                                      </div>
                                  </div>
                              </div>
                            )
                          })}
                      </div>

                      {activeChannel && members.size > 0 ? <div className="messenger-input"> //^^members.size>0초기채팅창
                          <div className="text-input">
                              <textarea onKeyUp={(e) => {
                                console.log("key", e.key);
                                if(e.key ==='Enter' && !e.shiftKey){
                                this.handleSend()
                              }

                              }} onChange={(e) => {
                              //  console.log("Text is changing:", e.target.value);
                                this.setState({newMessage: _.get(e, 'target.value')})
                              }} value={this.state.newMessage} placeholder="Write your messages!"/>
                          </div>
                          <div className="actions">
                              <button onClick={this.handleSend} className="send">Send</button>
                          </div>
                      </div> : null }

                  </div>

                  <div className="sidebar-right">

                  { members.size > 0 ? <div> <h2 className="title">Members</h2>
                    <div className="members">

                        {members.map((member, key) => {

                          return (

                            <div key={key} className="member">
                                  <div className="users-image">
                                    <img src={avatar} alt="" />
                                    <img src={_.get(member, 'avatar')} alt="" />
                                  </div>
                                <div className="member-info">
                                  <h2>{member.name}</h2>
                                  <p>Joined: {moment(member.created).fromNow()}</p>
                                </div>
                              </div>
                          )

                        })}

                      </div></div> : null}

                  </div>
                </div>
           </div>
         )
  }
}
