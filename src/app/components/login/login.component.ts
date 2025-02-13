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
  public regfirstname: string = '';
  public reglastname: string = '';

  public registeration: boolean = false;

  public isValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*\d).{6,}$/;
    if (this.registeration) {
      return (
        emailPattern.test(this.regemail) &&
        passwordPattern.test(this.regpassword) &&
        this.regpassword == this.regconfirmpassword
      );
    }
    return emailPattern.test(this.email) && passwordPattern.test(this.password);
  }
  public hide() {
    this._popupService.closePopups();
  }
  public toggleForms(): void {
    this.registeration = !this.registeration;
  }
  public async login() {
    if (!this.isValid()) {
      return;
    }
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
        this._loaderService.hideLoader();
        this._loaderService.LoaderMessage = getMessage(err.error);
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 4500);
      }
    );
  }

  public async signUp() {
    if (!this.isValid()) return;
    this._loaderService.LoaderMessage = 'Loading';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    let id = Math.floor(Math.random() * 100000000000000000 + 1);
    let user = {
      user: {
        userId: id.toString(),
        userEmail: this.regemail,
        userPassword: this.regconfirmpassword,
        userprofile: {
          firstName: this.regfirstname,
          lastName: this.reglastname,
        },
      },
    };
    this._authService.signUp(user).subscribe(
      (res) => {
        this._loaderService.hideLoader();
        console.log(res);
        this._loaderService.LoaderMessage = getMessage(res.body)
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 4500);
      },
      (err) => {
        this._loaderService.hideLoader();
        console.error(err);
        this._loaderService.LoaderMessage = getMessage(err.error)
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 4500);
      }
    );
  }
}
function getMessage(msg: any) {
  let message = '';
  const jmsg = JSON.parse(JSON.stringify(msg))
  if (jmsg.error) {
    message = jmsg.error.message;
  } else {
    message = jmsg.message;
  }

  return message;
}

