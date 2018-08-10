import { AngularFireDatabase } from 'angularfire2/database';
import { Component, OnInit, ElementRef } from '@angular/core';
import * as firebase from 'firebase';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css'],
  providers: [ AngularFireDatabase ]
})
export class ViewerComponent implements OnInit {

  public database: firebase.database.Reference;
  private el: ElementRef;
  private $removeStream: HTMLVideoElement;
  private remoteStream: MediaStream;
  public myId = Math.floor(Math.random() * 100000000);
  public servers = {
    'iceServers': [
      { 'urls': 'stun:stun.services.mozilla.com' },
      { 'urls': 'stun:stun.l.google.com:19302' },
      {
        'urls': 'turn:numb.viagenie.ca',
        'credential': 'webrtc',
        'username': 'websitebeaver@mail.com'
      }
    ]
  };

  public rtcPc: RTCPeerConnection;
  constructor(
    private element: ElementRef,
    public db: AngularFireDatabase
  ) {
    this.el = this.element;
    this.database = db.database.ref();
  }

  ngOnInit() {
    this.$removeStream = <HTMLVideoElement>this.el.nativeElement
      .querySelector('#remoteStream');
    // this.$removeStream = <HTMLVideoElement> document.getElementById('remoteStream');

    this.rtcPc = new RTCPeerConnection(this.servers);

    // EventHandler when the icecandidate event occurs.
    this.rtcPc.onicecandidate = (event) => {
      // 當有任何 ICE candidate 可用時，透過firebase database將
      // candidate 送給對方
      if (event.candidate) {
        this.sendMessage(this.myId, JSON.stringify({
          'ice': event.candidate }));
      } else {
        console.log('Sent all ICE');
      }
    };

    this.rtcPc.onaddstream = (event) => {
      console.warn('onaddstream event detected');
      const $onaddstream = <HTMLTextAreaElement>this.el.nativeElement.querySelector('#onaddstream');
      $onaddstream.value = 'onaddstream event detected';
      this.$removeStream.srcObject = event.stream;
    };

    this.database.on('child_added', this.readMessage, this);
  }

  showRemoteStream() {
    console.log(`myId: ${this.myId}`);
    const options: RTCOfferOptions = {
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1,
      voiceActivityDetection: true,
      iceRestart: true
    };

    this.rtcPc.createOffer(options)
      .then(offer => {
        const offertxt = <HTMLTextAreaElement>this.el.nativeElement.querySelector('#offer');
        offertxt.value = JSON.stringify(offer);
        this.rtcPc.setLocalDescription(offer).catch(err => {
          const $err = <HTMLTextAreaElement>document.getElementById('err');
          $err.value = err;
        });
        const txt = <HTMLTextAreaElement>this.el.nativeElement.querySelector('#localDescription');
        txt.value = JSON.stringify(this.rtcPc.localDescription);
      })
      .then(() => this.sendMessage(this.myId, JSON.stringify(
        { 'sdp': this.rtcPc.localDescription }
      )))
      .catch(err => alert(err));
  }

  readMessage(data) {
    const msg = JSON.parse(data.val().message);
    const sender = data.val().sender;
    console.log(`sender: ${sender}`);
    console.log(`myId: ${this.myId}`);
    if (sender !== this.myId) {
      if (msg.ice !== undefined) {
        console.log(`msg.ice undefined`);
        this.rtcPc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type === 'offer') {
        /*  console.log(`msg.sdp.type === offer`);
        this.rtcPc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
          .then(() => this.rtcPc.createAnswer())
          .then(answer => {
            this.rtcPc.setLocalDescription(answer);
          })
          .then(() => this.sendMessage(
            this.myId, JSON.stringify({ 'sdp': this.rtcPc.localDescription })
           )); */
      } else if (msg.sdp.type === 'answer') {
        console.log(`msg.sdp.type === answer`);
        this.rtcPc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
      }
    }
  }

  sendMessage(senderId, data) {
    const msg = this.database.push(
      { sender: senderId, message: data }
    );
    msg.remove();
  }

}
