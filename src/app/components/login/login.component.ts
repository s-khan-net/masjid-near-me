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
  public email: string = '';
  public password: string = '';

  public regemail: string = '';
  public regpassword: string = '';
  public regconfirmpassword: string = '';
  public regfirstname: string = '';
  public reglastname: string = '';

  public registeration: boolean = false;
  public pwdError: boolean = true;
  public emailError: boolean = true;
  public pwdRegError: boolean = true;
  public emailRegError: boolean = true;
  public compareError: boolean = false;
  public isValid(): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^(?=.*\d).{6,}$/;
    if (this.registeration) {
      this.emailRegError = emailPattern.test(this.regemail);
      this.pwdRegError = passwordPattern.test(this.regpassword);
      this.compareError = this.regpassword != this.regconfirmpassword;
      return (
        emailPattern.test(this.regemail) &&
        passwordPattern.test(this.regpassword) &&
        this.regpassword == this.regconfirmpassword
      );
    }
    this.emailError = emailPattern.test(this.email);
    this.pwdError = passwordPattern.test(this.password);
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
        userPassword: btoa(this.password),
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
        }, 5000);

        // this._loaderService.showMessage({message:res.body.message, hide:true})
      },
      (err) => {
        console.error(err);
        this._loaderService.hideLoader();
        this._loaderService.LoaderMessage = getMessage(err);
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 5000);
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
        userPassword: btoa(this.regconfirmpassword),
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
        if (res.body?.status.toLowerCase() == 'ok') {
          this.hide();
        }
        this._loaderService.LoaderMessage = res.body.message;
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 5000);
      },
      (err) => {
        this._loaderService.hideLoader();
        console.error(err);
        this.hide();
        this._loaderService.LoaderMessage = getMessage(err.body);
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
  try {
    const jmsg = JSON.parse(JSON.stringify(msg));
    if (jmsg.error.message) {
      message = jmsg.error.message;
    } else {
      message = jmsg.error;
    }
    return message;
  } catch (e) {
    return msg;
  }
}
