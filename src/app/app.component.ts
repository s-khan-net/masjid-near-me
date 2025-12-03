import { Component, NgZone, OnInit } from '@angular/core';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { AuthService } from './core/services/auth.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(private zone: NgZone, private _authService: AuthService) {
    this.initializeApp();

  }
  initializeApp() {
    App.addListener('appUrlOpen', (event:URLOpenListenerEvent) => {
      this.zone.run(() => {
        console.log('appUrlOpen', event);
        // Handle the URL event here
        // For example, navigate to a specific page based on the URL
        const pathArray = event.url.split('localhost:8100')
        const param = pathArray.pop();
        if(param && param?.indexOf('verify') > -1 && param.indexOf('?') > -1) {
          const code = param.split('?')[1].split('=')[1];
          //verify code
          let obj = { "verificationCode": code };
          this._authService.verfiyUser(obj).subscribe((res) => {
            if (res.body && res.body.status.toLowerCase() == 'ok') {
              alert('You have been verified successfully. Please login with your credentials');
            } else {
              alert('User verification failed');
            }
          });
        }
      });
    });
  } 
}
