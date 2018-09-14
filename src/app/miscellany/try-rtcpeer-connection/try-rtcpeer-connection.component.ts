import { Observable, fromEvent } from 'rxjs';
import { Component, OnInit, ElementRef } from '@angular/core';


@Component({
  selector: 'app-try-rtcpeer-connection',
  templateUrl: './try-rtcpeer-connection.component.html',
  styleUrls: ['./try-rtcpeer-connection.component.css']
})
export class TryRTCPeerConnectionComponent implements OnInit {
  public constraints = { audio: true, video: true};
  public configuration = {
    iceServers: [
      { urls: 'stun:stun.services.mozilla.com'},
      { urls: 'stun:stun.l.google.com:19302'}
    ]
  };
  public pc: RTCPeerConnection;
  public remotePeerConnection: RTCPeerConnection;
  public localPeerConnection: RTCPeerConnection;
  public startTime = null;

  public mediaStreamConstraints = {
    video: true,
  };

  // Set up to exchange only video.
  public offerOptions = {
    offerToReceiveVideo: 1,
  };

  public localVideo: HTMLVideoElement;
  public localStream: any;
  public remoteVideo: HTMLVideoElement;
  public remoteStream: any;

  public $startBtn: HTMLButtonElement;
  public $callBtn: HTMLButtonElement;
  public $hangupBtn: HTMLButtonElement;

  private el: ElementRef;
  constructor(private element: ElementRef) {
    this.el = this.element;
  }

  ngOnInit() {
    this.localVideo = this.el.nativeElement.querySelector('#localVideo');
    this.remoteVideo = this.el.nativeElement.querySelector('#remoteVideo');
    this.$callBtn = this.el.nativeElement.querySelector('#callButton');
    this.$startBtn = this.el.nativeElement.querySelector('#startButton');
    this.$hangupBtn = this.el.nativeElement.querySelector('#hangupButton');

    this.pc = new RTCPeerConnection(this.configuration);
    this.pc.addEventListener('icecandidate', this.handleConnection);
    this.pc.addEventListener('iceconnectionstatechange',
    this.handleConnectionChange);

  }

  handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
      const newIceCandidate = new RTCIceCandidate(iceCandidate);
      const otherPeer = this.getOtherPeer(peerConnection);

      otherPeer.addIceCandidate(newIceCandidate)
        .then(() => {
          this.handleConnectionSuccess(peerConnection);
        }).catch( err => {
          this.handleConnectionFailure(peerConnection, err);
        });

      this.trace(`${this.getPeerName(peerConnection)} ICE candidate:\n` +
        `${event.candidate.candidate}.`);
    }
  }

  // Sets the MediaStream as the video element src.
  gotLocalMediaStream(mediaStream) {
    this.localVideo.srcObject = mediaStream;
    this.localStream = mediaStream;
    this.trace('Received local stream.');
    this.$callBtn.disabled = false;  // Enable call button.
  }
  // Gets the "other" peer connection.
  getOtherPeer(peerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      this.remotePeerConnection : this.localPeerConnection;
  }

  // Logs changes to the connection state.
  handleConnectionChange(event) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    this.trace(`${this.getPeerName(peerConnection)} ICE state: ` +
      `${peerConnection.iceConnectionState}.`);
  }

  // Logs that the connection succeeded.
  handleConnectionSuccess(peerConnection) {
    this.trace(`${this.getPeerName(peerConnection)} addIceCandidate success.`);
  }

  // Logs that the connection failed.
  handleConnectionFailure(peerConnection, error) {
    this.trace(`${this.getPeerName(peerConnection)} failed to add ICE Candidate:\n` +
      `${error.toString()}.`);
  }

  // Handles error by logging a message to the console.
  handleLocalMediaStreamError(error) {
    this.trace(`navigator.getUserMedia error: ${error.toString()}.`);
  }

  // Gets the name of a certain peer connection.
  getPeerName(peerConnection) {
    return (peerConnection === this.localPeerConnection) ?
      'localPeerConnection' : 'remotePeerConnection';
  }

  // Handles remote MediaStream success by adding it as the remoteVideo src.
  gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    this.remoteVideo.srcObject = mediaStream;
    this.remoteStream = mediaStream;
    this.trace('Remote peer connection received remote stream.');
  }

  // Logs an action (text) and the time when it happened on the console.
  trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);

    console.log(now, text);
  }

  // Handles start button action: creates local MediaStream.
  startAction() {
    this.$startBtn.disabled = true;
    navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
    .then( stream => this.gotLocalMediaStream(stream))
    .catch( error => this.handleLocalMediaStreamError(error));
  }

  // Handles call button action: creates peer connection.
  callAction() {
    this.$callBtn.disabled = true;
    this.$hangupBtn.disabled = false;

    this.trace('Starting call.');
    this.startTime = window.performance.now();

    // Get local media stream tracks.
    const videoTracks = this.localStream.getVideoTracks();
    const audioTracks = this.localStream.getAudioTracks();
    if (videoTracks.length > 0) {
      this.trace(`Using video device: ${videoTracks[0].label}.`);
    }
    if (audioTracks.length > 0) {
      this.trace(`Using audio device: ${audioTracks[0].label}.`);
    }

    const servers = null;  // Allows for RTC server configuration.

    // Create peer connections and add behavior.
    this.localPeerConnection = new RTCPeerConnection(servers);
    this.trace('Created local peer connection object localPeerConnection.');

    this.localPeerConnection.addEventListener(
      'icecandidate', this.handleConnection);
    this.localPeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange);

    this.remotePeerConnection = new RTCPeerConnection(servers);
    this.trace('Created remote peer connection object remotePeerConnection.');

    this.remotePeerConnection.addEventListener(
      'icecandidate', this.handleConnection);
    this.remotePeerConnection.addEventListener(
      'iceconnectionstatechange', this.handleConnectionChange);
    this.remotePeerConnection.addEventListener(
      'addstream', this.gotRemoteMediaStream);

    // Add local stream to connection and create offer to connect.
    this.localPeerConnection.addStream(this.localStream);
    this.trace('Added local stream to localPeerConnection.');

    this.trace('localPeerConnection createOffer start.');
    this.localPeerConnection.createOffer(offerOptions)
      .then(createdOffer).catch(setSessionDescriptionError);
  }
}
