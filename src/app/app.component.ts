import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent implements OnInit{
  constructor() {}
  async ngOnInit(): Promise<void> {
    await SplashScreen.hide({fadeOutDuration:0});
  }
  
}
