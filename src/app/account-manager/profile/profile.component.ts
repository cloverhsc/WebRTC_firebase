import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnInit, ElementRef } from '@angular/core';

import { fromEvent, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';

import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [AngularFireDatabase]
})
export class ProfileComponent implements OnInit {

  private $avatar: HTMLImageElement;
  private $uploadAva: HTMLInputElement;
  private $profForm: HTMLFormElement;
  private uuid: string;

  public _imgClickEvent: Subscription;
  public formData: FormData;
  public avatarUrl: string;
  public email: string;
  public name: string;
  public database: firebase.database.Reference;
  public storage: firebase.storage.Storage;
  public isNewAvatar = false;
  public metadata = { contentType: 'image/jpeg' };

  public profileForm: FormGroup;

  public errorCode: string;
  public errorMessage: string;
  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private fb: FormBuilder,
    public element: ElementRef,
    public router: Router
  ) {  }

  ngOnInit() {
    this.databaseConfig();
    this.avatarClickEvent();
    // this.getUserInfo();
    this.profileForm = this.fb.group({
      name: [''],
      avatar: ['']
    });

  }

  databaseConfig() {
    /* this.afAuth.user.subscribe(
      user => {
        this.uuid = user.uid;
        this.database = this.db.database.ref('users/' + this.uuid);
      }
    ); */
    this.afAuth.user.pipe(
      tap( (user: any) => {
        this.uuid = user.uid;
        this.database = this.db.database.ref('users/' + this.uuid);
      }),
      tap( user => this.getUserInfo())
    ).subscribe();
  }

  getUserInfo() {
    this.database.once('value').then(snapshot => {
      this.email = (snapshot.val() && snapshot.val().email);
      this.name = (snapshot.val() && snapshot.val().name);
      this.avatarUrl = (snapshot.val() && snapshot.val().avatar);
      this.profileForm.patchValue({
        name: this.name,
        avatar: this.avatarUrl
      });
    }).catch(err => console.warn(err));
  }

  avatarClickEvent() {
    this.$avatar = <HTMLImageElement>this.element.nativeElement
      .querySelector('#avatar');
    this.$uploadAva = <HTMLInputElement>this.element.nativeElement
      .querySelector('#avatarfile');

    this._imgClickEvent = fromEvent(this.$avatar, 'click').subscribe(() => {
      this.$uploadAva.click();
    });
  }

  handleFileInput(files: FileList) {
    const profileIMG = <HTMLImageElement>this.element.nativeElement
      .querySelector('#avatar');
    this.$profForm = <HTMLFormElement>this.element.nativeElement
      .querySelector('#profileForm');

      // check empty file, check image file.
    if (files.length !== 0) {
      if (files[0].type === 'image/png' || files[0].type === 'image/jpeg') {
        if (files[0].size < 1000000) {
          // handler new avatar
          this.profileForm.patchValue({
            avatar: files[0]
          });
          profileIMG.src = URL.createObjectURL(files[0]);
          this.isNewAvatar = true;
          files[0].type === 'image/png' ?
            this.metadata.contentType = 'image/png' : this.metadata.contentType = 'image/jpeg';
        } else {
          alert('檔案超過1MB！');
        }
      } else {
        alert('檔案格式錯誤，請上傳圖片檔案！');
      }
    }
    console.log(files[0]);
    console.log(this.profileForm.value.avatar);
  }

  redirectHome() {
    this.router.navigate(['webrtc']);
  }

  onSubmit() {
    console.log(`Original name: ${this.name}`);
    console.log(`New name: ${this.profileForm.value.name}`);
    console.log(`Original Email: ${this.email}`);
    console.log(`Now Email: ${this.profileForm.value.email}`);
    console.log(this.profileForm.value.avatar);

    // update name if name is not the same.
    const newName = this.profileForm.value.name;
    if (this.name !== newName) {
      this.database.update({ name: newName });
    }

    if (this.isNewAvatar === true) {

      this.storage = firebase.app().storage('gs://webrtc-testconn.appspot.com');
      const storageRef = this.storage.ref();
      const uploadTask = storageRef.child(`avatars/${this.uuid}`)
        .put(this.profileForm.value.avatar, this.metadata);
      uploadTask.on('state_changed', (snapshot: firebase.storage.UploadTaskSnapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress} % done`);
        /* switch (snapshot.state) {
          case firebase.storage.TaskState.RUNNING:
            console.log('Upload isa running');
            break;
        } */
        if (snapshot.state === firebase.storage.TaskState.RUNNING) {
          console.log('Upload is running');
        }
      },
        err => console.log(err),
        () => {
          uploadTask.snapshot.ref.getDownloadURL()
            .then(downloadUrl => {
              console.log(downloadUrl);
              this.database.update({ avatar: downloadUrl });
              this.avatarUrl = downloadUrl;
              this.isNewAvatar = false;
            });
        }
      );
    }

  }
}
