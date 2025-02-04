import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { LoaderService } from 'src/app/core/services/loader.service';
import { PopupService } from 'src/app/services/popup.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(
    private _popupService: PopupService,
    private _authService: AuthService,
    private _loaderService: LoaderService
  ) {}

  ngOnInit() {}
  public email: string = 'saudkhan03@outlook.com';
  public password: string = 'aaaaaa1';

  public regemail: string = '';
  public regpassword: string = '';
  public regconfirmpassword: string = '';

  public registeration: boolean = false;

  public hide() {
    this._popupService.closePopups();
  }
  public toggleForms(): void {
    this.registeration = !this.registeration;
  }
  public async login() {
    this._loaderService.LoaderMessage = 'Loading';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    let user = {
      user: {
        userEmail: this.email,
        userPassword: this.password,
      },
    };
    this._authService.signIn(user).subscribe(
      (res: any) => {
        if (res.body?.status.toLowerCase() == 'ok') {
          this.hide();
        }
        this._loaderService.LoaderMessage = res.body.message;
        this._loaderService.ShowSpinner = false;
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 2500);

        // this._loaderService.showMessage({message:res.body.message, hide:true})
      },
      (err) => {
        console.error(err);
      }
    );
  }

  public async signUp() {}
}
