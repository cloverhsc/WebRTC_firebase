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
  private capturebtn: HTMLButtonElement;
  private screenshotbtn: HTMLButtonElement;
  private cssfilterbtn: HTMLButtonElement;
  private canvasArea: HTMLCanvasElement;

  public constraints: any;
  public imgUrl: string;
  public vgaConstraints = {
    video: {
      width: {exact: 640},
      height: {exact: 480}
    }
  };
  public videoOption = [];
  public audioOption = [];
  public videoValue: any;
  public audioValue: any;
  public filterIndex = 0;

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
    this.capturebtn = <HTMLButtonElement>this.el.nativeElement
                        .querySelector('#capture-button');
    this.screenshotbtn = <HTMLButtonElement>this.el.nativeElement
                        .querySelector('#screenshot-button');
    this.cssfilterbtn = <HTMLButtonElement>this.el.nativeElement
                        .querySelector('#cssfilters-apply');
    this.canvasArea = <HTMLCanvasElement>this.el.nativeElement
                        .querySelector('#canvasArea');
    /* const div = this.render.createElement('div');
    const text = this.render.createText('Hi Clover');
    this.render.appendChild(div, text);
    this.render.appendChild(this.el.nativeElement, div); */

    navigator.mediaDevices.enumerateDevices()
    .then( dev => this.gotDevices(dev))
    .then( () => this.getStream())
    .catch(this.handleError);

    // this.audioSelect.onchange = () => this.getStream();
    // this.videoSelect.onchange = () => this.getStream();
  }

  gotDevices(deviceInfos) {
    console.log(deviceInfos);
    for (let i = 0; i !== deviceInfos.length; ++i) {
      const deviceInfo = deviceInfos[i];
      /* const option = <HTMLOptionElement>this.render.createElement('option');
      option.value = deviceInfo.deviceId;

      if (deviceInfo.kind === 'audioinput') {
        option.text = deviceInfo.label ||
          'microphone' + (this.audioSelect.length + 1);
        this.render.appendChild(this.audioSelect, option);
      } else if (deviceInfo.kind === 'videoinput') {
        option.text = deviceInfo.label ||
          'camera' + (this.videoSelect.length + 1);
        this.render.appendChild(this.videoSelect, option);
      } else {
        console.log('Found another kind of device: ', deviceInfo);
      } */

      if (deviceInfo.kind === 'audioinput') {
        let audioObj = {value: '', text: ''};
        audioObj.value = deviceInfo.deviceId;
        audioObj.text = deviceInfo.label || 'microphone' + (this.audioOption.length + 1);
        this.audioOption.push(audioObj);
      } else if (deviceInfo.kind === 'videoinput') {
        let videoObj = { value: '', text: ''};
        videoObj.value = deviceInfo.deviceId;
        videoObj.text = deviceInfo.label || 'camera' + (this.videoOption.length + 1);
        this.videoOption.push(videoObj);
      } else {
        console.log(`Found another kind of device: ${deviceInfo}`);
      }
    }
    this.audioValue = this.audioOption[0].value;
    this.videoValue = this.videoOption[0].value;
    // console.log(this.audioOption);
    // console.log(this.videoOption);
  }

  getStream() {
    // if (this.videoElement.srcObject) {
    //   this.videoElement.srcObject.getTracks().forEach( track => track.stop());
    // }
    // this.constraints = {
    //   audio: {
    //     deviceId: {exact: this.audioSelect.value}
    //   },
    //   video: {
    //     deviceId: {exact: this.videoSelect.value},
    //     width: {min: 320, exact: 640, max: 1024},
    //     height: {min: 240, exact: 480, max: 768}
    //   }
    // };

    console.log(this.audioValue);
    console.log(this.videoValue);
    this.constraints = {
      audio: {
        deviceId: { exact: this.audioValue }
      },
      video: {
        deviceId: { exact: this.videoValue },
        width: 640,
        height: 480
      }
    };

    navigator.mediaDevices.getUserMedia(this.constraints)
    .then( stream => this.gotStream(stream)).catch(this.handleError);

  }

  gotStream(stream) {
    this.videoElement.srcObject = stream;
    // console.log(this.videoElement.srcObject);
  }

  handleSuccess(stream) {
    this.screenshotbtn.disabled = false;
    this.videoElement.srcObject = stream;
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  captureVideoBtn() {
    navigator.mediaDevices.getUserMedia(this.constraints)
    .then(stream => this.handleSuccess(stream)).catch(this.handleError);
  }

  screenshotBtn() {
    // console.log(this.videoElement.videoWidth);
    // console.log(this.videoElement.videoHeight);
    if (this.videoElement.srcObject) {
      this.canvasArea.width = this.videoElement.videoWidth;
      this.canvasArea.height = this.videoElement.videoHeight;
      this.canvasArea.getContext('2d').drawImage(this.videoElement, 0, 0);
      this.imgUrl = this.canvasArea.toDataURL('image/jpeg', 1);
      const img = <HTMLImageElement>this.el.nativeElement.querySelector('img');
      img.classList.remove('none');

      // download screen shot automatically.
      const link = this.render.createElement('a');
      this.render.appendChild(document.body, link);
      link.href = this.imgUrl;
      link.download = 'file.jpeg';
      link.click();
    }
  }

  cssFiltersBtn() {
    const filters = [
      'blur', 'brightness', 'contrast',
      'grayscale', 'invert', 'opacity', 'saturate',
      'sepia', 'hue-rotate', 'normal'
    ];
    this.videoElement.className = filters[this.filterIndex++ % filters.length];
  }

  /**
   * 按鈕Stop的code.
   */
  stopBtn() {
    if (this.videoElement.srcObject) {
      (<MediaStream>this.videoElement.srcObject).getTracks()
      .forEach( stream => stream.stop());
    }
  }

  Test() {
    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        const videoDOM = <HTMLVideoElement>document.getElementById('video');
        videoDOM.srcObject = stream;
      })
      .catch(err => console.log(err));
  }

  Test1(val) {
    console.log(val);
  }

  Test2(val) {
    console.log(val);
  }
}


