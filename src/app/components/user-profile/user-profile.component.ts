import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoaderService } from 'src/app/core/services/loader.service';
import { StorageService } from 'src/app/core/services/storage.service';
import { PopupService } from 'src/app/services/popup.service';
import { SettingsService } from 'src/app/services/settings.service';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  constructor(
    private _popupService: PopupService,
    private _userService: UsersService,
    private _loaderService: LoaderService,
    private _storage: StorageService,
    private _settingsService: SettingsService
  ) {}

  public email: string = '';
  public userProfile: any;
  public role: any;
  public feedbackMessage: string = '';
  public deletionReason: string = '';
  public additionalFeedback: string = '';
  public presentingElement!: HTMLElement | null;
  public showPermissionRequestButton: boolean = false;

  public isPermissionModalOpen: boolean = false;
  public isFeedbackModalOpen: boolean = false;
  public isDeleteModalOpen: boolean = false;

  public osVersion: number = this._settingsService.osVersion;

  @ViewChild('deletemodal') deletemodal: ElementRef | undefined;
  @ViewChild('feedbackmodal') feedbackmodal: ElementRef | undefined;
  @ViewChild('permissionmodal') permissionmodal: ElementRef | undefined;

  async ngOnInit() {
    const sessionProfile = await this._storage.get('userProfile'); // sessionStorage.getItem('userProfile');
    const sessionRole = await this._storage.get('userRole'); //sessionStorage.getItem('userRole');
    this.email = await this._storage.get('userEmail'); //sessionStorage.getItem('userEmail') || '';
    if (sessionProfile && sessionRole) {
      this.userProfile = JSON.parse(atob(sessionProfile));
      this.role = JSON.parse(atob(sessionRole));
    }
  }
  public hide() {
    this._popupService.closePopups();
  }
  public logOut() {
    this._storage.clear();
    sessionStorage.clear();
    this.hide();
  }

  public sendPermissionEmail() {
    this.isPermissionModalOpen = false;
    this._loaderService.LoaderMessage = 'Sending permission request';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    this._userService.sendPermissionReq(this.email).subscribe(
      (res) => {
        this._loaderService.hideLoader();
        console.log(res);
        this._popupService.closePopups();
        this.isPermissionModalOpen = false;
        // this._hideModals(this.permissionmodal);
        this._loaderService.LoaderMessage =
          'Thank you for your request. We will get back to you soon.';
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 3500);
      },
      (err) => {
        if (this._accessdeniedError(err)) return;
        this._loaderService.hideLoader();
        this._popupService.closePopups();
        console.error(err);
        this.hide();
        this.isPermissionModalOpen = false;
        this._loaderService.LoaderMessage = getMessage(err.body);
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 3500);
      }
    );
  }

  public sendFeedback() {
    if (this.feedbackMessage) {
      this.isFeedbackModalOpen = false;
      this._loaderService.LoaderMessage = 'Sending feedback';
      this._loaderService.ShowSpinner = true;
      this._loaderService.showLoader();
      this._userService
        .sendFeedback(this.email, this.feedbackMessage)
        .subscribe(
          (res) => {
            if (this._accessdeniedError(res)) return;
            this._loaderService.hideLoader();
            console.log(res);
            this._popupService.closePopups();
            this.isFeedbackModalOpen = false;
            this._loaderService.LoaderMessage = getMessage(res.body);
            this._loaderService.ShowSpinner = false;
            this._loaderService.showLoader();
            setTimeout(() => {
              this._loaderService.hideLoader();
            }, 3500);
          },
          (err) => {
            if (this._accessdeniedError(err)) return;
            this._loaderService.hideLoader();
            this._popupService.closePopups();
            console.error(err);
            this.hide();
            this._hideModals(this.feedbackmodal);
            this._loaderService.LoaderMessage = getMessage(err.body);
            this._loaderService.ShowSpinner = false;
            this._loaderService.showLoader();
            setTimeout(() => {
              this._loaderService.hideLoader();
            }, 3500);
          }
        );
    }
  }

  public confirmAccountDeletion() {
    if (this.deletionReason) {
      this.isDeleteModalOpen = false;
      this._loaderService.LoaderMessage = 'Deleting account';
      this._loaderService.ShowSpinner = true;
      this._loaderService.showLoader();
      if (this.additionalFeedback) {
        this.deletionReason = `${this.deletionReason} - ${this.additionalFeedback}`;
      }
      this._userService
        .deleteUserAccount(this.email, this.deletionReason)
        .subscribe(
          (res) => {
            this._loaderService.hideLoader();
            console.log(res);
            this.logOut();
            this._popupService.closePopups();
            this.isDeleteModalOpen = false;
            this._loaderService.LoaderMessage = getMessage(res.body);
            this._loaderService.ShowSpinner = false;
            this._loaderService.showLoader();
            setTimeout(() => {
              this._loaderService.hideLoader();
            }, 3500);
          },
          (err) => {
            if (this._accessdeniedError(err)) return;
            this._loaderService.hideLoader();
            console.error(err);
            this._popupService.closePopups();
            this.hide();
            this.isDeleteModalOpen = false;
            this._loaderService.LoaderMessage = getMessage(err.body);
            this._loaderService.ShowSpinner = false;
            this._loaderService.showLoader();
            setTimeout(() => {
              this._loaderService.hideLoader();
            }, 3500);
          }
        );
    }
  }

  public checkUserPermission() {
    this._loaderService.hideLoader();
    this._loaderService.LoaderMessage = 'Checking user permissions';
    this._loaderService.ShowSpinner = true;
    this._loaderService.showLoader();
    this._userService.checkFeedbackPermission(this.email).subscribe({
      next: (res) => {
        let feedbacks;
        try {
          feedbacks = JSON.parse(res);
        } catch (e) {
          // Handle JSON parsing error
          this.openPermissionModal(false);
          console.error('Error parsing JSON:', e);
          this._loaderService.hideLoader();
          this.hide();
          this._loaderService.LoaderMessage =
            'Could not check the feedback permission, pleace try again.Or send an email to <b>info@masjidnear.me</b> with the subject "Feedback permission issue"';
          this._loaderService.ShowSpinner = false;
          this._loaderService.showLoader();
          setTimeout(() => {
            this._loaderService.hideLoader();
          }, 3500);

          return;
        }
        if (feedbacks.length > 0) {
          //check if the feeback array contains a feedbackType of permission
          const permissionFeedback = feedbacks.find(
            (feedback: any) => feedback.feedbackType === 'permission'
          );
          //show the button to post request for pemission
          if (!permissionFeedback) {
            this.showPermissionRequestButton = true;
          }
        }
        if (feedbacks.length == 0) {
          this.showPermissionRequestButton = true;
        }
        this._loaderService.hideLoader();
        this.openPermissionModal(true);
      },
      error: (err) => {
        this.openPermissionModal(false);
        if (this._accessdeniedError(err)) return;
        this._loaderService.hideLoader();
        console.error(err);
        this.hide();
        this._loaderService.LoaderMessage = getMessage(err.error);
        this._loaderService.ShowSpinner = false;
        this._loaderService.showLoader();
        setTimeout(() => {
          this._loaderService.hideLoader();
        }, 3500);
      },
    });
  }
  openPermissionModal(arg0: boolean) {
    this.isPermissionModalOpen = arg0;
  }

  private _hideModals(modal: ElementRef | undefined) {
    if (modal) {
      modal.nativeElement?.classList.remove('show');
      modal.nativeElement?.setAttribute('aria-hidden', 'true');
    }
  }

  private _accessdeniedError(err: any): boolean {
    if (
      err.status === 401 ||
      (typeof err.error == 'string' &&
        err.error?.toLowerCase().indexOf('access denied') > -1)
    ) {
      this._loaderService.hideLoader();
      this.isPermissionModalOpen = false;
      this.isFeedbackModalOpen = false;
      this.isDeleteModalOpen = false;
      this._popupService.closePopups();
      this.logOut();
      this._loaderService.LoaderMessage =
        'it has been a while since you have logged in. Please log in again.';
      this._loaderService.ShowSpinner = false;
      this._loaderService.showLoader();
      setTimeout(() => {
        this._loaderService.hideLoader();
      }, 3500);
      return true;
    }
    return false;
  }
}
function getMessage(msg: any) {
  let message = '';
  try {
    const jmsg = JSON.parse(JSON.stringify(msg));
    if (jmsg.error) {
      message = jmsg.error.message;
    } else {
      message = jmsg.message;
    }
    return message;
  } catch (e) {
    return msg;
  }
}
