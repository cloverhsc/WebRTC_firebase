import { Observable } from 'rxjs';
import { AngularFireDatabase } from 'angularfire2/database';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ElementRef, ViewEncapsulation } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-media-w-data',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './media-w-data.component.html',
  styleUrls: ['./media-w-data.component.css'],
  providers: [AngularFireDatabase]
})

export class MediaWDataComponent implements OnInit {
  public localConnection;
  public remoteConnection;
  public sendMsgChannel;
  public receiveMsgChannel;
  public caller_database: firebase.database.Reference;
  public callee_database: firebase.database.Reference;
  public global_database: firebase.database.Reference;
  public roomId_list = [];
  public roomId: string;
  public MsgChannelConstrain = null;
  public roomidForm: FormGroup;

  private el: ElementRef;
  private myId: string;
  private $localStream: HTMLVideoElement;
  private $remoteStream: HTMLVideoElement;
  private $openButton: HTMLButtonElement;
  private $sendButton: HTMLButtonElement;
  private $closeButton: HTMLButtonElement;
  private $joinButton: HTMLButtonElement;
  private $inputRoomID: HTMLInputElement;
  private $textList: HTMLElement;
  private $inputMsg: HTMLInputElement;
  private DB_REF_NAME = 'tmp/';
  private mediaConstraints = {
    audio: true,
    video: { width: 320, height: 240}
  };
  private servers = {
    'iceServers': [
      { 'urls': 'stun:stun.services.mozilla.com'},
      { 'urls': 'stun:stun.l.google.com:19302'}
    ]
  };

  constructor(
    private element: ElementRef,
    public db: AngularFireDatabase,
    private fb: FormBuilder
  ) {
    this.el = this.element;
  }

  ngOnInit() {
    this.$localStream = this.el.nativeElement.querySelector('#localstream');
    this.$remoteStream = this.el.nativeElement.querySelector('#remotestream');
    this.$openButton = this.el.nativeElement.querySelector('#openButton');
    this.$sendButton = this.el.nativeElement.querySelector('#sendButton');
    this.$closeButton = this.el.nativeElement.querySelector('#closeButton');
    this.$inputRoomID = this.el.nativeElement.querySelector('#roomid');
    this.$joinButton = this.el.nativeElement.querySelector('#joinButton');
    this.$inputMsg = this.el.nativeElement.querySelector('#dataChannelSend');
    this.$textList = this.el.nativeElement.querySelector('#textlist');


    setTimeout( () => this.initialBtn(), 1000);

    this.roomidForm = this.fb.group({
      roomid: ['']
    });
    this.global_database = this.db.database.ref(this.DB_REF_NAME);
    if (this.global_database) {
      const chk = this.global_database.on('value', dataSnap => {
        this.roomId_list = [];
        dataSnap.forEach( dt => {
          if (dt) {
            this.roomId_list.push(dt.key);
            console.log(dt.key);
          }
        });
        console.log(this.roomId_list);
      });
    }
  }

  /**
   * When click open room button.
   * 1. check local stream device can be find and add stream to localstream
   *    DOM tag.
   * 2. upload SDP, ice candidate to firebase database id room.
   * 3. listen firebase database content change event.
   */
  createRoom() {
    this.roomId = this.myId = Math.floor(Math.random() * 1000000).toString();
    this.$openButton.disabled = true;
    this.$joinButton.disabled = true;
    this.$inputRoomID.disabled = true;

    this.GetUserMedia()
    .then( () => {
      this.localConnection = new RTCPeerConnection(this.servers);
      this.localConnection.onicecandidate = this.SendCallerIceCandidateEvent.bind(this);
      this.localConnection.ontrack = this.addRemoteStreamEvent.bind(this);

      this.doCreateDataChannel();

      this.doCreateOffer();

    });
  }

  GetUserMedia() {
    return  navigator.mediaDevices.getUserMedia(this.mediaConstraints)
    .then( stream => {
      this.$localStream.srcObject = stream;
    })
    .catch( error => {
      this.initialBtn();
      console.warn(error);
      return false;
    });
  }

  /**
   * When get any ice candidate can be send to other peer.
   * upload to firebase database.
   */
  SendCallerIceCandidateEvent(event) {
    if (event.candidate) {
      this.sendInfo(this.myId, event.candidate, 'ice');
    } else {
      console.log('Sent all ICE already');
    }
  }

  SendCalleeIceCandidateEvent(event) {
    if (event.candidate) {
      this.callee_database.push({
        sender: this.myId,
        ice: JSON.stringify(event.candidate)
      });
    } else {
      console.log('Sent all Ice already');
    }
  }
  addRemoteStreamEvent(event) {
    console.log(`Add remote stream.....`);
    console.log(event.stream);
    this.$remoteStream.srcObject = event.stream[0];
    this.$closeButton.disabled = false;
  }

  /**
   * create offer then send sdp to firebase database.
   */
  doCreateOffer() {
    this.localConnection.createOffer()
    .then( desc => {
      // set sdp to local description.
      console.log(`Set local sdp`);
      return this.localConnection.setLocalDescription(desc);
    })
    .then( () => {
      this.sendInfo(
      this.myId,
      this.localConnection.localDescription,
      'sdp'
      );
      this.$closeButton.disabled = false;
      this.$inputMsg.disabled = false;
      this.$sendButton.disabled = false;
    })
    .then( () => {
      this.caller_database = this.db.database.ref(this.DB_REF_NAME + this.myId);
      this.caller_database.on('child_added', this.callerReadMsg.bind(this));
    })
      .catch(err => console.warn(err));
  }

  callerReadMsg(data) {
    if (data.val().sender !== this.myId) {
      if (data.val().sdp) {
        // find callee sdp info
        const sdpMsg = JSON.parse(data.val().sdp);
        if (sdpMsg.type === 'answer' && sdpMsg.sdp) {
          this.localConnection.setRemoteDescription( new RTCSessionDescription(sdpMsg))
          .then( () => console.log('Add callee sdp'))
          .catch( err => console.log(`Add callee sdp failed: ${err}`));
        }
      } else if (data.val().ice) {
        const iceMsg = JSON.parse(data.val().ice);
        this.localConnection.addIceCandidate(new RTCIceCandidate(iceMsg))
        .then( () => {
          console.log('Add callee ice candidate success');
        })
        .catch( err => console.warn(`add callee ice candidate failed: ${err}`));
      }
    }
  }

  /**
   * callee create answer offer.
   */
  doCreateAnswerOffer() {
    this.localConnection.createAnswer()
    .then( desc => this.localConnection.setLocalDescription(desc))
    .then( () => {
      this.callee_database.push({
        sender: this.myId,
        sdp: JSON.stringify(this.localConnection.localDescription)
      }).then( () => {
        this.$openButton.disabled = true;
        this.$sendButton.disabled = false;
        this.$closeButton.disabled = false;
      });
    })
      .catch(err => console.warn(err));
  }

  /**
   * Create data channel and some event handler.
   */
  doCreateDataChannel() {
    this.sendMsgChannel = this.localConnection.createDataChannel(this.myId);
    this.sendMsgChannel.onopen = this.onSendMsgChannelStateChange.bind(this);
    this.sendMsgChannel.onclose = this.onSendMsgChannelStateChange.bind(this);
    this.localConnection.ondatachannel = this.onReceiveMsgChannelEvent.bind(this);
  }

  /**
   * event handler for RTCDataChannel is added to the connection
   * by the remote peer calling createDataChannel().
   */
  onReceiveMsgChannelEvent(event) {
    console.log(`data channel created.`);
    const readyState = this.sendMsgChannel.readyState;
    console.log(`receive msg channel status: ${readyState}`);
    this.receiveMsgChannel = event.channel;
    this.receiveMsgChannel.onmessage = this.onReceiveMsgCallback.bind(this);
    this.receiveMsgChannel.onopen = this.onReceiveMsgChannelStateChange.bind(this);
    this.receiveMsgChannel.onclose = this.onReceiveMsgChannelStateChange.bind(this);
  }

  onReceiveMsgChannelStateChange() {
    const readyState = this.receiveMsgChannel.readyState;
    if ( readyState === 'open') {
      console.log(`Receive channel state is: ${readyState}`);
    } else {
      console.log(`Receive channel state is: ${readyState}`);
    }
  }

  /**
   * When receive message. show on text list zone.
   */
  onReceiveMsgCallback(event) {
    console.log(`Received Message`);
    console.log(event.data);
    const node = document.createElement('li');
    if (event.data) {
      const textnode = document.createTextNode(event.data);
      node.appendChild(textnode);
      this.$textList.appendChild(node);
      this.$inputMsg.value = '';
      this.$inputMsg.focus();
    }
  }
  /**
   * RTCDataChannel onopen event.
   */
  onSendMsgChannelStateChange(event) {
    const readyState = this.sendMsgChannel.readyState;
    console.log(`Send channel state is: ${readyState}`);
    if (readyState === 'open') {
      this.$inputMsg.disabled = false;
      this.$inputMsg.focus();
      this.$sendButton.disabled = false;
      this.$closeButton.disabled = false;
    } else {
      this.$inputMsg.disabled = true;
      this.$sendButton.disabled = true;
      this.$closeButton.disabled = true;
    }
  }

  /**
   * Send sdp/candidate to firebase database.
   */
  sendInfo(id: string, info: Object, info_type: InfoType) {
    const database = this.db.database.ref(this.DB_REF_NAME + id);
    if (info_type === 'sdp') {
      return database.push({
        sender: id,
        sdp: JSON.stringify(info)
      });
    } else if (info_type === 'ice') {
      return database.push({
        sender: id,
        ice: JSON.stringify(info)
      });
    }
  }

  /**
   * join room.
   */
  joinChat() {
    this.$openButton.disabled = true;

    this.myId =  Math.floor(Math.random() * 1000000).toString();
    this.roomId = this.roomidForm.value.roomid;

    console.log(`room id: ${this.roomId}`);
    console.log(`my id: ${this.myId}`);

    this.callee_database = this.db.database.ref(this.DB_REF_NAME + this.roomId);

    this.localConnection = new RTCPeerConnection(this.servers);
    this.localConnection.onicecandidate = this.SendCalleeIceCandidateEvent.bind(this);
    this.localConnection.ontrack = this.addRemoteStreamEvent.bind(this);

    this.GetUserMedia()
    .then( () => {

      this.doCreateDataChannel();

      this.doCreateAnswerOffer();
    })
    .catch( err => console.warn(err));

    // check room id exist or not.
    if (this.roomId) {
      if (this.roomId_list.includes(this.roomId)) {
        // get and add caller sdp.
        if (this.callee_database) {
          this.callee_database.once('value').then(snapshot => snapshot.forEach(data => {
            if (data.val().sender !== this.myId) {
              if (data.val().sdp) {
                const sdpMsg = JSON.parse(data.val().sdp);

                if (sdpMsg.type === 'offer' && sdpMsg.sdp) {
                  // add sdp to setRemoteDescription
                  this.localConnection.setRemoteDescription(new RTCSessionDescription(sdpMsg));
                  console.log(`Add caller sdp`);

                }
              } else if (data.val().ice) {
                // Add ice candidate.
                const iceMsg = JSON.parse(data.val().ice);
                console.log(`sender id: ${data.val().sender}`);
                console.log(iceMsg);
                this.localConnection.addIceCandidate( new RTCIceCandidate(iceMsg))
                .then( () => console.log(`add caller ice candidate success`))
                .catch( err => console.warn(`add caller ice candidate error: ${err}`));
              }
            }
          }));
        } else {
          console.warn('Can not find this room information.');
        }
      } else {
        console.warn('Can not find this room.');
      }
    } else {
      console.warn('Please input room id.');
    }
  }

  /**
   * 1. Find this room and get caller's sdp then add it.
   * 2. Send sdp to firebase database.
   * 3. Open data channel and send ice candidate to firebase database.
   * 4. Set event handler.
  */
  getCallerSdp(roomid: string) {

  }

  /**
   * initial all button.
   */
  initialBtn(): void {
    this.$localStream.srcObject = null;
    this.$remoteStream.srcObject = null;
    this.$openButton.disabled = false;
    this.$sendButton.disabled = true;
    this.$closeButton.disabled = true;
    this.$inputRoomID.value = '';
    this.$inputRoomID.disabled = false;
    this.$joinButton.disabled = false;
    this.$inputMsg.value = '';
    this.$inputMsg.disabled = true;
  }

  /**
   * terminate connection channel.
   */
  closeDataChannels() {
  }

  /**
   * Send message button
   */
  sendData() {
    if (this.sendMsgChannel) {
      const msg = this.$inputMsg.value;
      if (this.sendMsgChannel.readyState === 'open') {
        this.onReceiveMsgCallback({data: msg});
        this.sendMsgChannel.send(msg);
        console.log(`Send data: ${msg}`);
      } else {
        this.onReceiveMsgCallback({ data: msg });
      }
    }
  }
}

type InfoType = 'sdp' | 'ice';
