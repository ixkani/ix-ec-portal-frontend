import {Component, OnInit} from '@angular/core';
import {CompanyService} from './../../services';
import {SignoffService} from './../../services';
import {CommonService} from "../../services";
import {AppConstants, ErrorCodes, LoadingMessage} from '../../app.constants';
import {Router} from '@angular/router';
import {AppComponent} from '../../app.component';

@Component({
    selector: 'app-thanks',
    templateUrl: './thanks.component.html',
    styleUrls: ['./thanks.component.css'],
    providers: [ CompanyService, SignoffService ]
})
export class ThanksComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: any;

    constructor(private company_service: CompanyService,
                private signoff_service: SignoffService,
                private common: CommonService,
                private router: Router,
                private appComponent: AppComponent) {
        var company_meta;
        company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.loadingMessage = {
            'message': '',
            'error': ''
        }

        /*this.company_service.getCompanyMetadata().subscribe(
            data => {
                company_meta = data;
                this.common.debuglog('##### thanks component got company meta ');
                this.common.debuglog(data);
            }
        );


        company_meta = JSON.parse(localStorage.getItem('company_meta'));*/
        // force the sign off off the monthly report that gets created during setup
        if (company_meta.is_initial_setup) {
            this.signoff_service.postForSigningOff()
                .then(
                    data => {
                        this.appComponent.session_warning();
                        this.common.debuglog('signed off on initial setup monthly report');
                        this.showLoading = false;
                    }
                )
                .catch((error) => {
                    let errBody = JSON.parse(error._body);
                    if (this.common.sessionCheck(errBody.code)) {
                        this.appComponent.session_warning();
                        this.loadingMessage['message'] = LoadingMessage.SIGNING_OFF;
                        this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                    }
                });
        }
        // #brad - we want them to go back to te dashboard next time they login, not back to the thank you page
        let params = {is_initial_setup: false, last_page: '/dashboard', accounting_setup_status: AppConstants.SETUP_STATUS_COMPLETE};
        // api call to set the metdata
        this.company_service.updateCompanyMetadata(params)
            .then(data => {
                this.appComponent.session_warning();
                this.showLoading = false;
                this.common.debuglog(data.result)
            })
            .catch((error) => {
                let errBody = JSON.parse(error._body);
                if (this.common.sessionCheck(errBody.code)) {
                    this.appComponent.session_warning();
                    this.loadingMessage['message'] = LoadingMessage.UPDATE_COMPANY_META;
                    this.loadingMessage['error'] = this.common.getErrorMessage(errBody.code);
                }
            });
    }

    ngOnInit() {
        this.common.disableBrowseBackButton();
    }

}
