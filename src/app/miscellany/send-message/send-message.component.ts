import { FormGroup, FormBuilder } from '@angular/forms';
import { AngularFireDatabase } from 'angularfire2/database';
import { Component, OnInit, ElementRef } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-send-message',
  templateUrl: './send-message.component.html',
  styleUrls: ['./send-message.component.css'],
  providers: [AngularFireDatabase]
})
export class SendMessageComponent implements OnInit {

  public localConnection;
  public remoteConneciton;
  public sendChannel;
  public pcConstraint;
  public dataConstraint;
  public receiveChannel;
  public caller_database: firebase.database.Reference;
  public callee_database: firebase.database.Reference;
  public database: firebase.database.Reference;
  public roomId_list = [];
  public callerId;

  public roomidForm: FormGroup;

  private el: ElementRef;
  private dataChannelSend: HTMLTextAreaElement;
  private dataChannelReceive: HTMLTextAreaElement;
  private startButton: HTMLButtonElement;
  private sendButton: HTMLButtonElement;
  private closeButton: HTMLButtonElement;
  private joinButton: HTMLButtonElement;
  private inputRoomID: HTMLInputElement;
  public myId: number;
  public servers = {
    'iceServers': [
      { 'urls' : 'stun:stun.services.mozilla.com'},
      { 'urls' : 'stun:stun.l.google.com:19302'}
    ]
  };

  public dataConstrain = null;

  public getRoomList: Promise<any>;
  constructor(
    private element: ElementRef,
    public db: AngularFireDatabase,
    private fb: FormBuilder,
  ) {
    this.el = this.element;

    /**
   * get Room list in firebase
   * TODO: auto update room list. 2018-10-02
   */
    this.getRoomList = new Promise((resolve, reject) => {
      const firedb = this.db.database.ref('tmp/');
      if (firedb) {
        firedb.on('value', datasnapshot => {
          this.roomId_list = [];
          datasnapshot.forEach(data => {
            if (data) {
              console.log(data.key);
              this.roomId_list.push(data.key);
            }
          });
        });
      }
      resolve();
    });
  }

  ngOnInit() {
    /* assign textarea, button dom element. */
    this.dataChannelSend = this.el.nativeElement.querySelector('#dataChannelSend');
    this.dataChannelReceive = this.el.nativeElement.querySelector('#dataChannelReceive');
    this.startButton = this.el.nativeElement.querySelector('#startButton');
    this.sendButton = this.el.nativeElement.querySelector('#sendButton');
    this.closeButton = this.el.nativeElement.querySelector('#closeButton');
    this.joinButton = this.el.nativeElement.querySelector('#joinButton');
    this.inputRoomID = this.el.nativeElement.querySelector('#roomid');
    setTimeout( () => {
      this.sendButton.disabled = true;
      this.closeButton.disabled = true;
    } , 1000);

    this.getRoomList.then(() => console.log(this.roomId_list));
    this.roomidForm = this.fb.group({
      roomid: ['']
    });
  }

  /**
   * Create connection.
   * send id and +sdp to firebast database and waiting remote client.
   */
  createConnection() {
    this.joinButton.disabled = true;
    this.inputRoomID.disabled = true;
    this.startButton.disabled = true;
    this.sendButton.disabled = false;
    this.closeButton.disabled = false;
    this.myId = Math.floor(Math.random() * 100000000);
    const localLableName = this.myId;
    this.dataChannelSend.placeholder = '';
    console.log('create connection object localConnection');
    this.localConnection = new RTCPeerConnection(this.servers);
    this.sendChannel = this.localConnection.createDataChannel('caller');

    // EventHandler when the icecandidate event occurs.
    this.localConnection.onicecandidate = this.callericeCallback.bind(this);
    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);
    this.localConnection.ondatachannel = this.receiveChannelCallback.bind(this);
    // Create offer.
    this.localConnection.createOffer()
    .then( desc => {
      console.log('set local description');
      console.log(desc);
      return this.localConnection.setLocalDescription(desc);
    })
    .then( () => this.sendMessage(
      this.myId,
      JSON.stringify(
        this.localConnection.localDescription
      ),
      'sdp'
    ))
    .then( () => {
      this.caller_database = this.db.database.ref('tmp/' + this.myId);
      this.caller_database.on('child_added', this.callerReadMsg.bind(this));
    })
    .catch( err => console.warn(`createOffer error: ${err}`));

  }

  callerReadMsg(data) {
    if (data.val().sender !== this.myId) {
      if (data.val().sdp) {
        const sdpMsg = JSON.parse(data.val().sdp);
        if (sdpMsg.type === 'answer' && sdpMsg.sdp) {
          console.log('get callee sdp.');
          this.localConnection.setRemoteDescription(
            new RTCSessionDescription(sdpMsg));
          console.log('Add callee sdp');
        }
      } else if (data.val().ice) {
        const iceMsg = JSON.parse(data.val().ice);
        console.log(` ${data.val().sender} ice candidate`);
        console.log(data.val().ice);
        this.localConnection.addIceCandidate(new RTCIceCandidate(iceMsg))
        .then( () => {
          console.log('add callee ice candidate success');
          this.caller_database.remove();
        })
        .catch( err => console.log(`add callee ice candidate faile: ${err}`));
      }
    }
  }

  callericeCallback(event) {
    // 當有任何 ice candidate 可以用時，透過firebase database將
    // candidate 送給對方。
    console.log(`${window.performance.now() / 1000}` + event.candidate);
    if (event.candidate) {
      this.sendMessage(
        this.myId,
        JSON.stringify({
        'ice': event.candidate }),
        'ice'
      );
    } else {
      console.log('Sent all ICE');
    }
  }

  calleeIceCallback(event) {
    // 當callee 有任何的ice candidate 可以用時，透過firebase database
    // 把ice candidate 丟到同一個room id內。
    console.warn('callee icecandidate callback');
    console.log(`${window.performance.now() / 1000}
    callee candidate:`);
    console.log(event.candidate);

    if (event.candidate) {
      const msg = this.callee_database.push({
        sender: this.myId,
        ice: JSON.stringify(event.candidate)}
        );
    } else {
      console.log('Sent all ICE');
    }
  }
  onSendChannelStateChange() {
    const readyState = this.sendChannel.readyState;
    console.log(`Send channel state is : ${readyState}`);
    if (readyState === 'open') {
      this.dataChannelSend.disabled = false;
      this.dataChannelSend.focus();
      this.sendButton.disabled = false;
      this.closeButton.disabled = false;
    } else {
      this.dataChannelSend.disabled = true;
      this.sendButton.disabled = true;
      this.closeButton.disabled = true;
    }
  }

  sendMessage(senderId, data, data_category: dataCategory ) {
    this.database = this.db.database.ref('tmp/' + senderId);

    if (data_category === 'sdp') {
      const msg = this.database.push(
        { sender: senderId, sdp: data }
      );
    } else if (data_category === 'ice') {
      const msg = this.database.push(
        { sender: senderId, ice: data }
      );
    }
  }

  /**
   * After get ice offer . add it to icecandidate
   * @param offerSDP : remote inviter's SDP send via firebase database.
   */
  getOfferIceCandidate(offerSDP) {
    this.localConnection.addIceCandidate(offerSDP)
      .then(() => console.log(`Add remote ice candidate success.`))
      .catch(err => console.warn(`Add remote ice candidate error: ${err}`));
  }

  receiveChannelCallback(event) {
    console.log(`Receive Channe Callback`);
    console.warn(`callee channel state: ${this.sendChannel.readyState}`);
    const readyState = this.sendChannel.readyState;
    if (readyState === 'open') {
      this.dataChannelSend.disabled = false;
      this.dataChannelSend.focus();
      this.sendButton.disabled = false;
      this.closeButton.disabled = false;
    } else {
      this.dataChannelSend.disabled = true;
      this.sendButton.disabled = true;
      this.closeButton.disabled = true;
    }
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.onReceiveMessageCallback.bind(this);
    this.receiveChannel.onopen = this.onReceiveChannelStateChange.bind(this);
    this.receiveChannel.onclose = this.onReceiveChannelStateChange.bind(this);
  }

  onReceiveMessageCallback(event) {
    console.log(`Receive Channel Callback`);
    this.dataChannelReceive.value = event.data;
  }

  onReceiveChannelStateChange() {
    const readyState = this.receiveChannel.readyState;
    console.log(`Receive channel state is: ${readyState}`);
  }

  /**
   * Join someone's chat room.
   * 1. read firebase database tmp/
   * 2. find out sender = remoteid
   * 3. get caller sdp first and add sdp to setRemoteDescription.
   * 4. upload callee sdp to firebase. let caller add callee's sdp.
   *
   * 4. open data channel.
   * 5. enable send button and text area.
   */
  joinChat() {
    this.startButton.disabled = true;

    this.myId = Math.floor(Math.random() * 100000000);
    this.startButton.disabled = true;
    this.callerId = this.roomidForm.value.roomid;

    // check join room id can not be null.
    if (this.callerId) {
      if (this.roomId_list.includes(this.callerId)) {
        this.callee_database = this.db.database.ref('tmp/' + this.callerId);
        if (this.callee_database) {
          // Get caller sdp first
          this.callee_database.once('value').then(snapshot => snapshot.forEach( data => {
            if (data.val().sender !== this.myId) {
              if (data.val().sdp) {
                const sdpMsg = JSON.parse(data.val().sdp);
                // add sdp to setRemoteDescription
                if (sdpMsg.type === 'offer' && sdpMsg.sdp) {
                  this.localConnection = new RTCPeerConnection(this.servers);
                  this.localConnection.setRemoteDescription(
                    new RTCSessionDescription(sdpMsg));

                  console.log('Add caller sdp');

                  // event binding.
                  this.localConnection.onicecandidate = this.calleeIceCallback.bind(this);
                  this.localConnection.ondatachannel = this.receiveChannelCallback.bind(this);

                  this.localConnection.onopen = () => {
                    if (this.sendChannel.readyState === 'open') {
                      console.warn('Data Channel open!');
                    } else {
                      console.warn('Data Channel not open.');
                    }
                  };
                  this.localConnection.onclose = () => {
                    if (this.sendChannel.readyState === 'close') {
                      console.warn('Data Channel close!');
                    } else {
                      console.warn('Data Channel not close.');
                    }
                  };

                  this.sendChannel = this.localConnection.createDataChannel('callee');

                  // create answer sdp and send to firebase.
                  this.localConnection.createAnswer().then(
                    desc => {
                      console.log('create Anser offer and setlocaldescription.');
                      this.localConnection.setLocalDescription(desc);
                    })
                    .then(() => {
                      this.callee_database.push({
                        sender: this.myId,
                        sdp: JSON.stringify(this.localConnection.localDescription)
                      });
                    });
                }
              } else if (data.val().ice) {
                const iceMsg = JSON.parse(data.val().ice);
                console.log(`sender id: ${data.val().sender}`);
                console.log(iceMsg);
                this.localConnection.addIceCandidate(
                  new RTCIceCandidate(iceMsg.ice))
                .then(() => console.log('add caller ice candidate success'))
                .catch(
                  err => console.log(`add caller ice candidate error: ${err}`));
              }
            }
          }));

        } else {
          alert('Error');
        }
      } else {
        alert('Can not find this room');
      }
    } else {
      alert('Please input room id.');
    }
  }

  /**
   * send data (text) button action.
   */
  sendData() {
    const data = this.dataChannelSend.value;
    this.sendChannel.send(data);
    console.log(`Sent Data: ${data}`);
  }

  /**
   * Stop button action.
   * 1. close data channel
   * 2. remove id from firebase database in tmp/
   */
  closeDataChannels() {
    console.log('Closing data channels');
    this.sendChannel.close();
    console.log(`Closed data channel with label: ${this.sendChannel.label}`);
    this.receiveChannel.close();
    console.log(`Closed data channel with label: ${this.receiveChannel.label}`);
    this.localConnection.close();
    console.log('Closed peer connections');
    this.startButton.disabled = false;
    this.sendButton.disabled = true;
    this.closeButton.disabled = true;
    this.dataChannelSend.value = '';
    this.dataChannelReceive.value = '';
    this.dataChannelSend.disabled = true;
  }

}

type dataCategory = 'sdp' | 'ice';
