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
  public database: firebase.database.Reference;

  private el: ElementRef;
  private dataChannelSend: HTMLTextAreaElement;
  private dataChannelReceive: HTMLTextAreaElement;
  private startButton: HTMLButtonElement;
  private sendButton: HTMLButtonElement;
  private closeButton: HTMLButtonElement;
  public myId = Math.floor(Math.random() * 100000000);
  public servers = {
    'iceServers': [
      { 'urls' : 'stun:stun.services.mozilla.com'},
      { 'urls' : 'stun:stun.l.google.com:19302'}
    ]
  };

  public dataConstrain = null;

  constructor(
    private element: ElementRef,
    public db: AngularFireDatabase
  ) {
    this.el = this.element;
    this.database = this.db.database.ref();
  }

  ngOnInit() {
    /* assign textarea, button dom element. */
    this.dataChannelSend = this.el.nativeElement.querySelector('#dataChannelSend');
    this.dataChannelReceive = this.el.nativeElement.querySelector('#dataChannelReceive');
    this.startButton = this.el.nativeElement.querySelector('#startButton');
    this.sendButton = this.el.nativeElement.querySelector('#sendButton');
    this.closeButton = this.el.nativeElement.querySelector('#closeButton');

    this.database.on('child_added', this.readMessage, this);

    this.localConnection = new RTCPeerConnection(this.servers);
    this.localConnection.onicecandidate = (event) => console.log(event);
    this.localConnection.createOffer()
      .then(desc => {
        console.log(desc.sdp);
        this.localConnection.setLocalDescription(desc);
        console.log(this.localConnection.localDescription);
        this.remoteConneciton = new RTCPeerConnection(this.servers);
        this.remoteConneciton.onicecandidate = (event) => {
          console.log(event);
        };
        this.remoteConneciton.setRemoteDescription(desc);
        this.remoteConneciton.createAnswer()
        .then( desc2 => {
          console.log('remoteConn create Answer');
          console.log('desc2');
          console.log(desc2);
          this.remoteConneciton.setLocalDescription(desc2);
          this.localConnection.setRemoteDescription(desc2);
        })
        .catch( err => console.warn(err));
        // this.remoteConneciton.addIceCandidate(desc);
      });
  }

  /**
   * Create connection.
   * send id to firebast database and waiting remote client.
   */
  createConnection() {
    const localLableName = 'localSendDataCh';
    this.dataChannelSend.placeholder = '';
    console.log('create connection object localConnection');

    this.sendChannel = this.localConnection.createDataChannel(
      localLableName);
    console.log(`create RTCDataChannel with label : ${localLableName}`);

    // EventHandler when the icecandidate event occurs.
    this.localConnection.onicecandidate = this.iceCallback.bind(this);
    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);

    this.localConnection.createOffer()
    .then( desc => {
      this.localConnection.setLocalDescription(desc);
    })
    .then( () => this.sendMessage(this.myId, JSON.stringify(
      { 'sdp': this.localConnection.localDescription }
    )))
    .catch( err => console.warn(`createOffer error: ${err}`));

  }

  iceCallback(event) {
    // 當有任何 ice candidate 可以用時，透過firebase database將
    // candidate 送給對方。
    if (event.candidate) {
      this.sendMessage(this.myId, JSON.stringify({
        'ice': event.candidate }));
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

  sendMessage(senderId, data) {
    const msg = this.database.push(
      { sender: senderId, message: data }
    );
    msg.remove();
  }

  readMessage(data) {
    const msg = JSON.parse(data.val().message);
    const sender = data.val().sender;
    console.log(`sender: ${sender}`);
    console.log(`myId: ${this.myId}`);
    if (sender !== this.myId) {
      if (msg.ice !== undefined) {
        console.log(`msg.ice undefined`);
        this.localConnection.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type === 'offer') {
        /* console.log(`msg.sdp.type === offer`);
        this.localConnection.setRemoteDescription(
          new RTCSessionDescription(msg.sdp))
          .then(() => this.localConnection.createAnswer())
          .then(answer => {
            this.localConnection.setLocalDescription(answer);
          })
          .then(() => this.sendMessage(
            this.myId, JSON.stringify({ 'sdp': this.localConnection.localDescription })
          )); */
        this.localConnection.onicecandidate = this.getOfferIceCandidate(msg.sdp);
        this.localConnection.ondatachannel = this.receiveChannelCallback.bind(this);
      } else if (msg.sdp.type === 'answer') {
        console.log(`msg.sdp.type === answer`);
        this.localConnection.setRemoteDescription(
          new RTCSessionDescription(msg.sdp));
      }
    }
  }

  getAnswerIceCandidate(answerSDP) {

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
}
