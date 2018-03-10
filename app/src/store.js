import {OrderedMap} from 'immutable'
import _ from 'lodash'


const users= OrderedMap({
  '1': {_id: '1', name: "Durang-go", created: new Date()},
  '2': {_id: '2', name: "Rnag", created: new Date()},
  '3': {_id: '3', name: "go", created: new Date()},
})

export default class Store {
  constructor(appComponent){

    this.app = appComponent;

    this.messages = new OrderedMap();
    this.channels = new OrderedMap();
    this.activeChannlId = null;
    this.user = {
      _id: '1',
      name: 'Durang-go',
      created: new Date(),
    }
  }

  addUserToChannel(channelId, userId){

    const channel = this.channels.get(channelId);
    if(channel){
      //채널에 유저 추가
      channel.members = channel.members.set(userId, true);
      this.channels = this.channels.set(channelId, channel);
      this.update();
    }
  }
  searchUsers(search = ""){

    const keyword = _.toLower(search);

    let searchItems = new OrderedMap();
    const currentUser = this.getCurrntUser();
    const currentUserId = _.get(currentUser, '_id');
    if(_.trim(search).length){
      searchItems = users.filter((user) => _.get(user, '_id') !== currentUserId && _.includes(_.toLower(_.get(user, 'name')), keyword)); //내이름 빼고 찾기
      //유저 서치 @@
      // users.filter((user) => {
      //   const name =_.get(user, 'name');
      //   const userId =_.get(user, '_id');
      //   if(_.includes(name, search)){
      //
      //   searchItems = searchItems.set(userId, user);
      //   }
      // })
    }

    return searchItems.valueSeq();
  }
  onCreateNewChannel(channel = {} ){

      const channelId = _.get(channel, '_id');
      this.addChannel(channelId, channel);
      this.setActiveChannelId(channelId);
  }

  getCurrntUser(){
    return this.user;
  }

  setActiveChannelId(id){
    this.activeChannelId = id;
    this.update();
  }
  getActiveChannel(){

    const channel =  this.activeChannelId ? this.channels.get(this.activeChannelId) : this.channels.first();
    return channel;
  }

  addMessage(id, message = {}){
    this.messages = this.messages.set(`${id}`, message);
    //let`s add new message id to current channel -> messages.
    const channelId = _.get(message, 'channelId')
    if(channelId){
      let channel = this.channels.get(channelId);
      channel.isNew = false;
      channel.lastMessage = _.get(message, 'body', '');
      channel.messages = channel.messages.set(id, true)
      this.channels = this.channels.set(channelId, channel)
    }
    this.update();
  }
  getMessage(){
    return this.messages.valueSeq();
  }
  getMessagesFromChannel(channel){

      let messages =[];

      if(channel){
          channel.messages.map((value, key) => {

            const message = this.messages.get(key);

            return messages.push(message);
          });
        }
        return messages;
  }

  getMembersFromChannel(channel){
    let members= new OrderedMap();

    if(channel){
        channel.members.map((value, key) => {
          const user = users.get(key);
          const loggedUser = this.getCurrntUser();
          if(_.get(loggedUser, '_id') !== _.get(user, '_id')){
            members = members.set(key, user);
          }

        });
    }
    return members.valueSeq();
  }

  addChannel(index, channel = {}){
    this.channels = this.channels.set(`${index}`, channel);

    this.update();
  }
  getChannels(){
    //return this.channels.valueSeq();
    //시간별로 채널나열.
    this.channels = this.channels.sort((a,b) => a.created < b.created);
    return this.channels.valueSeq();
  }

  update(){
    this.app.forceUpdate()
  }
}
