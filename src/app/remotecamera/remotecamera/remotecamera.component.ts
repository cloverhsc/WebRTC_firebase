import { Component, OnInit, ElementRef } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

@Component({
  selector: 'app-remotecamera',
  templateUrl: './remotecamera.component.html',
  styleUrls: ['./remotecamera.component.css'],
  providers: [ AngularFireDatabase ]
})
export class RemotecameraComponent implements OnInit {

  public database: firebase.database.Reference;
  private $myvideo: HTMLVideoElement;
  private el: ElementRef;
  public myID = Math.floor(Math.random() * 100000000);
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

  public mediaDevConf = { audio: true, video: true };
  public msgCont: string;
  public pc: RTCPeerConnection;

  constructor(
    public db: AngularFireDatabase,
    private element: ElementRef
  ) {
    this.el = this.element;
    this.database = db.database.ref();
  }

  ngOnInit() {
    this.$myvideo = <HTMLVideoElement> this.el.nativeElement.querySelector(
      '#mystream');
    this.pc = new RTCPeerConnection(this.servers);

    this.pc.onicecandidate = (event) => {
      // 當有任何 ICE candidate 可用時，透過firebase database將
      // candidate 送給對方。(websocket)
      if (event.candidate) {
        this.sendMsg(this.myID, JSON.stringify(
          { 'ice': event.candidate}
        ));
      }
    };

    this.database.on('child_added', this.readMessage, this);
  }

  sendMsg(myid, data) {
    const msg = this.database.push(
      { sender: myid, message: data});
    msg.remove();
  }

  /**
   * ReadMessage when firebase database be changed.
   * @param data : firebase database callback data.
   * To-Do list: this.pc.addStream will been deprecated.
   * So next version will change to use addTrack()
   */
  readMessage(data: any) {
    const msg = JSON.parse(data.val().message);
    const sender = data.val().sender;
    console.log(`sender: ${sender}`);
    if (sender !== this.myID) {
      if (msg.ice !== undefined) {
        console.log('msg ice !== undefined');
        console.log(msg.ice);
        this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
      } else if (msg.sdp.type === 'offer') {
        console.log('msg sdp type === offer');
        this.msgCont = JSON.stringify(msg);
        const $txt = <HTMLTextAreaElement> this.el.nativeElement
          .querySelector('textarea');

        $txt.value = this.msgCont;
        // this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
        //   .then(() => navigator.mediaDevices.getUserMedia(
        //     this.mediaDevConf))
        //   .then(stream => this.pc.addStream(stream))
        //   /* .then( stream => {
        //     stream.getTracks().forEach( track => {
        //       this.pc.addTrack(track, stream);
        //     })
        //   }) */
        //   .then(() => this.pc.createAnswer())
        //   .then( answer => {
        //     console.log(`answer: ${answer}`);
        //     this.pc.setLocalDescription(answer); })
        //   .then( () => this.sendMsg(
        //     this.myID, JSON.stringify({
        //       'sdp': this.pc.localDescription
        //     })
        //   ));

        navigator.mediaDevices.getUserMedia(this.mediaDevConf)
        .then(stream => {
          this.pc.addStream(stream);
        })
        .then(() => this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp)))
        .then(() => this.pc.createAnswer())
        .then( answer => this.pc.setLocalDescription(answer))
        .then( () => this.sendMsg(
          this.myID, JSON.stringify({ 'sdp': this.pc.localDescription})
        ))
        .catch( err => {
          const $err = <HTMLTextAreaElement> document.getElementById('err');
          $err.value = err;
        });

      } else if (msg.sdp.type === 'answer') {
        console.log('Get answer');
      }
    }
  }
}
