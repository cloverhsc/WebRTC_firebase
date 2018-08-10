// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: 'AIzaSyBly4huhhQ5nmO36ZPrnNrRO_QpG4lFySM',
    authDomain: 'webrtc-testconn.firebaseapp.com',
    databaseURL: 'https://webrtc-testconn.firebaseio.com',
    projectId: 'webrtc-testconn',
    storageBucket: 'webrtc-testconn.appspot.com',
    messagingSenderId: '808723277909'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
