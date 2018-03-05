import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {environment} from './../../../environments/environment';
import {ReportingService, CommonService} from '../../services';
import {AppConstants, NavigateToScreen, ErrorCodes, ErrorMessage, LoadingMessage} from './../../app.constants';
import {AppComponent} from '../../app.component';
import {CompanyService} from "../../services/company.service";
import {isNullOrUndefined} from "util";

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    showLoading = false;
    public loadingMessage: any;
    id: Array<String>;
    identifier: any;
    passcode = {
        password: '',
        reenter_password: ''
    };
    initial: boolean;
    show: boolean;
    message = '';
    success: boolean;
    title_message: string;
    change_password: boolean;
    error: string;
    last_page:string;
    is_password_reset_enabled:boolean = false;
    constructor(private authService: AuthService,
                private router: Router,
                private common: CommonService,
                private appComponent: AppComponent,
                private company: CompanyService) {
        this.loadingMessage = {
            'message' : '',
            'error' : ''
        };
    }

  ngOnInit() {

      this.id = (this.router.url).split('/');
      this.identifier = {
          hashed_id: this.id[2]
      };
      this.is_password_reset_enabled = this.common.checkIsPasswordRestEnabled();

      if(!isNullOrUndefined(this.identifier.hashed_id)) {
          this.showLoading = true;
          this.validatelink();
      }else{
          this.initial = true;
          this.show = false;
      }
  }
    validatelink()  {

        this.authService.validatelink(this.identifier.hashed_id)
            .then(
                (response) => {
                    if (response.status === AppConstants.SUCCESS_RESPONSE) {
                        this.initial = true;
                        this.show = false;
                        this.showLoading = false;
                    }
                })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (errBody.code === ErrorCodes.TOKEN_EXPIRED){
                    this.initial = false;
                    this.show = true;
                    this.showLoading = false;
                } else {
                    this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                    this.showLoading = false;
                }
            });
    }
    changepassword_back(){
        this.company.getCompanyMetadata()
            .then(
                meta => {
                    this.last_page = meta.result.last_page;
                    this.router.navigate([this.last_page]);
                })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                this.showLoading = false;
            });
    }
    changepassword() {


        //localStorage.clear();
        //this.appComponent.remove();
        this.showLoading = true;
        this.passcode.password = this.passcode.password.trim();
        this.passcode.reenter_password = this.passcode.reenter_password.trim();
        if (this.passcode.password.length >= 8) {
            if (this.passcode.password === this.passcode.reenter_password) {
                if (this.passcode.password) {
                    if (isNaN(Number(this.passcode.password))) {
                        this.change_password = true;
                    }else {
                        this.showLoading = false;
                        this.appComponent.addToast('error', 'Error',  ErrorMessage.NUMERIC_PASSWORD);
                    }
                } else {
                    this.showLoading = false;
                    this.appComponent.addToast('error', 'Error',  ErrorMessage.EMPTY_PASSWORD);
                }
            } else {
                this.showLoading = false;
                this.appComponent.addToast('error', 'Error', ErrorMessage.SAME_PASSWORD);
            }
        }else {
            this.showLoading = false;
            this.appComponent.addToast('error', 'Error',  ErrorMessage.PASSWORD_LENGTH);

        }
        if (this.change_password){
            if(isNullOrUndefined(this.identifier.hashed_id)){
                let user_id = this.common.getUserId();
                let credentials = {'id':user_id, 'passcode':this.passcode};
                this.authService.changepassword(credentials)
                    .then(
                        (data) => {
                            if (data.status === AppConstants.SUCCESS_RESPONSE) {
                                this.success = true;
                                this.initial = false;
                                localStorage.clear();
                                this.appComponent.remove();
                            }
                            this.showLoading = false;
                        }
                    )
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                        this.showLoading = false;
                    });

            }else {
                localStorage.clear();
                this.appComponent.remove();
                this.authService.resetpassword(this.passcode, this.identifier.hashed_id)
                    .then(
                        (data) => {
                            if (data.status === AppConstants.SUCCESS_RESPONSE) {
                                this.success = true;
                                this.initial = false;
                            }
                            this.showLoading = false;
                        }
                    )
                    .catch((error) => {
                        let errBody = JSON.parse(error._body);
                        this.appComponent.addToast('error', 'Error', ErrorMessage.INTERNAL_SERVER_ERROR);
                        this.showLoading = false;
                    });
            }
        }
    }
}
