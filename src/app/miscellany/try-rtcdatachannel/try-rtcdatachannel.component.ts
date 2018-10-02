import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-try-rtcdatachannel',
  templateUrl: './try-rtcdatachannel.component.html',
  styleUrls: ['./try-rtcdatachannel.component.css']
})
export class TryRtcdatachannelComponent implements OnInit {

  public localConnection;
  public remoteConnection;
  public sendChannel;
  public receiveChannel;
  public pcConstraint;
  public dataConstraint;

  private el: ElementRef;
  private dataChannelSend: HTMLTextAreaElement;
  private dataChannelReceive: HTMLTextAreaElement;
  private startButton: HTMLButtonElement;
  private sendButton: HTMLButtonElement;
  private closeButton: HTMLButtonElement;

  constructor(private element: ElementRef) {
    this.el = this.element;
  }

  ngOnInit() {
    /**
     * assign textarea, button dom element
     */
    this.dataChannelSend = this.el.nativeElement.querySelector(
      'textarea#dataChannelSend');
    this.dataChannelReceive = this.el.nativeElement.querySelector(
      'textarea#dataChannelReceive');
    this.startButton = this.el.nativeElement.querySelector(
      'button#startButton');
    this.sendButton = this.el.nativeElement.querySelector(
      'button#sendButton');
    this.closeButton = this.el.nativeElement.querySelector(
      'button#closeButton');
  }

  enableStartButton() {
    this.startButton.disabled = false;
  }

  disableSendButton() {
    this.sendButton.disabled = true;
  }

  createConnection() {
    this.dataChannelSend.placeholder = '';
    const servers = null;
    this.pcConstraint = null;
    this.dataConstraint = null;
    this.trace('Using SCTP based data channels');
    // For SCTP, reliable. and ordered delivery is true by default.
    // add localConnection to global scope to make it visible
    // from the browser console.
    this.localConnection = new RTCPeerConnection(servers);
    this.trace('Created remote peer connection object localConnection');

    this.sendChannel = this.localConnection.createDataChannel(
      'sendDataChannel', this.dataConstraint);
    this.trace('Create send data channel');

    this.localConnection.onicecandidate = this.iceCallback1.bind(this);
    this.sendChannel.onopen = this.onSendChannelStateChange.bind(this);
    this.sendChannel.onclose = this.onSendChannelStateChange.bind(this);

    // Add remoteConnection to global scope to make it visible
    // from the browser console.
    this.remoteConnection = new RTCPeerConnection(servers);
    this.trace('Created remote peer connection object remoteConnection');

    this.remoteConnection.onicecandidate = this.iceCallback2.bind(this);
    this.remoteConnection.ondatachannel = this.receiveChannelCallback.bind(this);

    this.localConnection.createOffer()
    .then( desc => this.gotDescription1(desc))
    .catch( err => this.onCreateSessionDescriptionError(err));

    this.startButton.disabled = true;
    this.closeButton.disabled = false;
  }

  onCreateSessionDescriptionError(error) {
    this.trace('Failed to create session description: ' + error.toString());
  }

  sendData() {
    const data = this.dataChannelSend.value;
    this.sendChannel.send(data);
    this.trace('Sent: Data: ' + data);
  }

  iceCallback1(event) {
    this.trace('local ice callback');
    console.log('localConnection onicecandidate event.candidate:');
    console.log(event.candidate);
    if (event.candidate) {
      this.remoteConnection.addIceCandidate(
        event.candidate
      ).then( () => this.onAddIceCandidateSuccess()).catch(
        err => this.onAddIceCandidateError(err));
    }
  }

  iceCallback2(event) {
    this.trace('remote ice callback');
    console.log('remoteConnection onicecandidate event.candidate:');
    if (event.candidate) {
      this.localConnection.addIceCandidate( event.candidate )
      .then( () => this.onAddIceCandidateSuccess() )
      .catch( err => this.onAddIceCandidateError(err));
      this.trace('Remote ICE candidate: \n' + event.candidate.candidate);
    }
  }

  closeDataChannels() {
    this.trace('Closing data channels');
    this.sendChannel.close();
    this.trace('Closed data channel with label: ' + this.sendChannel.label);
    this.receiveChannel.close();
    this.trace('Closed data channel with label: ' + this.receiveChannel.label);
    this.localConnection.close();
    this.remoteConnection.close();
    this.localConnection = null;
    this.remoteConnection = null;
    this.trace('Closed peer connections');
    this.startButton.disabled = false;
    this.sendButton.disabled = true;
    this.closeButton.disabled = true;
    this.dataChannelSend.value = '';
    this.dataChannelReceive.value = '';
    this.dataChannelSend.disabled = true;
    this.disableSendButton();
    this.enableStartButton();
  }

  gotDescription1(desc) {
    console.log('localConnetion createOffer() return desc :');
    console.log(desc);
    this.localConnection.setLocalDescription(desc);
    this.trace('Offer from localConnection \n' + desc.sdp);
    this.remoteConnection.setRemoteDescription(desc);
    this.remoteConnection.createAnswer()
    .then( desc2 => this.gotDescription2(desc2))
    .catch( err => this.onCreateSessionDescriptionError(err));
  }

  gotDescription2(desc) {
    console.log('remoteConnetion createOffer() return desc :');
    console.log(desc);
    this.remoteConnection.setLocalDescription(desc);
    this.trace('Answer from remoteConnection \n' + desc.sdp);
    this.localConnection.setRemoteDescription(desc);
  }

  receiveChannelCallback(event) {
    this.trace('Receive Channel Callback');
    this.receiveChannel = event.channel;
    this.receiveChannel.onmessage = this.onReceiveMessageCallback.bind(this);
    this.receiveChannel.onopen = this.onReceiveChannelStateChange.bind(this);
    this.receiveChannel.onclose = this.onReceiveChannelStateChange.bind(this);
  }

  onReceiveMessageCallback(event) {
    this.trace('Received Message');
    this.dataChannelReceive.value = event.data;
  }

  onReceiveChannelStateChange() {
    const readyState = this.receiveChannel.readyState;
    this.trace('Receive channel state is: ' + readyState);
  }


  /**
   * Add ice  candidate success.
   */
  onAddIceCandidateSuccess() {
    this.trace('AddIceCandidate success.');
  }

  onAddIceCandidateError(error) {
    this.trace('Failed to add Ice Candidate: ' + error.toString());
  }

  onSendChannelStateChange() {
    const readyState = this.sendChannel.readyState;
    this.trace('Send channel state is: ' + readyState);
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
  /**
   * show text on console
   * @param text : string. use to show on console
   */
  trace(text) {
    if (text[text.length - 1] === '\n') {
      text = text.substring(0, text.length - 1 );
    }

    if (window.performance) {
      const now = (window.performance.now() / 1000).toFixed(3);
      console.log(`${now} : ${text}`);
    } else {
      console.log(text);
    }
  }
}
