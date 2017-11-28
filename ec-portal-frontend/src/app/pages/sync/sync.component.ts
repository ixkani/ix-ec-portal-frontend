import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from './../../../environments/environment';
import {CompanyService} from './../../services/company.service';
import * as moment from 'moment';

@Component({
    selector: 'app-sync',
    templateUrl: './sync.component.html',
    styleUrls: ['./sync.component.css'],
    providers: [CompanyService]
})
export class SyncComponent implements OnInit {
    showLoading: boolean = false;
    loadingMessage: string;
    loadingMessageClass: string; // once we fix the auto centering issue for these messages, this will no longer be needed. #todo #brad
    
    constructor(public router: Router, private company_service: CompanyService) {
        // set last page value in metadata
        let params = {last_page: '/sync'};
        this.company_service.updateCompanyMetadata(params).subscribe(data => {});
    }

    ngOnInit() {
    }

    sync(type) {
        this.showLoading = true;
        let params = {
            monthly_reporting_sync_method: type,
            last_page: '/sync'
        };

        //redirect based on type
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            if (type == 'QBO') {
                this.loadingMessage = "Redirecting to QuickBooks Online for Authentication.";
                this.loadingMessageClass = 'msg_redir_to_qbo';
                //Redirect to the quick books link  
                window.location.href = environment.api.url + '/qbo/connectToQuickbooks/?company=' + localStorage.getItem('company');
            } else if (type == 'QBD') {
                //make a call to quick book desktop app
                this.showLoading = false;
                this.router.navigate(['quickbook-desktop']);

            } else if (type == 'CSV') {
                // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                //Redirect to the CSV 
                this.showLoading = false;
                this.router.navigate(['csv-upload']);

                // })

            } else if (type == 'MANUAL') {
                //Redirect to the manual 
                this.showLoading = false;
                this.router.navigate(['form-entry']);
            }

        })
    }
}
