import { Component, OnInit, ElementRef, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-trycode',
  templateUrl: './trycode.component.html',
  styleUrls: ['./trycode.component.css']
})
export class TrycodeComponent implements OnInit {

  private el: ElementRef;
  private $video: HTMLVideoElement;
  private videoElement: HTMLVideoElement;
  private audioSelect: HTMLSelectElement;
  private videoSelect: HTMLSelectElement;

  public constraints = {
    video: true
  };
  public vgaConstraints = {
    video: {
      width: {exact: 640},
      height: {exact: 480}
    }
  };

  constructor(
    private element: ElementRef,
    private render: Renderer2
  ) {
    this.el = this.element;
  }

  ngOnInit() {
    // this.$video = this.el.nativeElement.querySelector('#video');
    // navigator.mediaDevices.getUserMedia(this.vgaConstraints)
    // .then( stream => this.$video.srcObject = stream );
    this.videoElement = <HTMLVideoElement>this.el.nativeElement
                        .querySelector('#video');
    this.audioSelect = <HTMLSelectElement>this.el.nativeElement
                        .querySelector('#audioSource');
    this.videoSelect = <HTMLSelectElement>this.el.nativeElement
                        .querySelector('#videoSource');

    /* const div = this.render.createElement('div');
    const text = this.render.createText('Hi Clover');
    this.render.appendChild(div, text);
    this.render.appendChild(this.el.nativeElement, div); */

    navigator.mediaDevices.enumerateDevices()
    .then( dev => this.gotDevices(dev))
    .then( () => this.getStream())
    .catch(this.handleError);

    this.audioSelect.onchange = () => this.getStream();
    this.videoSelect.onchange = () => this.getStream();
  }

  gotDevices(deviceInfos) {
    console.log(deviceInfos);
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      const option = <HTMLOptionElement>this.render.createElement('option');
      console.log(deviceInfo);

      option.value = deviceInfo.deviceId;
      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
          'microphone' + (this.audioSelect.length + 1);
        console.log(option);
        this.render.appendChild(this.audioSelect, option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label ||
          'camera' + (this.videoSelect.length + 1);
        this.render.appendChild(this.videoSelect, option);
      } else {
        console.log('Found another kind of device: ', deviceInfo);
      }
    }
  }

  getStream() {

    console.log(this.videoElement.srcObject);
    // if (this.videoElement.srcObject) {
    //   this.videoElement.srcObject.getTracks().forEach( track => track.stop());
    // }
    const constraints = {
      audio: {
        deviceId: {exact: this.audioSelect.value}
      },
      video: {
        deviceId: {exact: this.videoSelect.value}
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
    .then( stream => this.gotStream(stream)).catch(this.handleError);
  }

  gotStream(stream) {
    this.videoElement.srcObject = stream;
    console.log(this.videoElement.srcObject);
  }

  handleError(error) {
    console.log('Error: ', error);
  }

}
