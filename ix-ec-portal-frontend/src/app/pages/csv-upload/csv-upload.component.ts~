import {Component, OnInit} from '@angular/core';
import {FileUploader} from 'ng2-file-upload';
import {Router} from '@angular/router';
import {FileDropModule} from 'ngx-file-drop/lib/ngx-drop';


import {environment} from '../../../environments/environment';

import { CompanyService, AuthService } from './../../services/index';
const URL = environment.api.url;

@Component({
    selector: 'app-csv-upload',
    templateUrl: './csv-upload.component.html',
    styleUrls: ['./csv-upload.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class CsvUploadComponent implements OnInit {
    company_id = localStorage.getItem('company');

    public trailuploader: FileUploader = new FileUploader({url: URL + '/company/' + this.company_id + '/accounting/trialbalance', authToken: 'Bearer ' + localStorage.getItem('token')});
    public chartOfAccountsuploader: FileUploader = new FileUploader({url: URL + '/company/' + this.company_id + '/accounting/chartofaccounts', authToken: 'Bearer ' + localStorage.getItem('token')});
    public hasBaseDropZoneOver: boolean = false;
    public hasAnotherDropZoneOver: boolean = false;

    public trialFiles = [];
    public coaFiles = [];
    public showLoading = false;
    public loadingMessage: string;
    public espressoContacts: any = [];
    public fileOverBase(e: any): void {
        this.hasBaseDropZoneOver = e;
    }

    public fileOverAnother(e: any): void {
        this.hasAnotherDropZoneOver = e;
    }
    
    constructor(private company_service: CompanyService, public router: Router, private auth_service: AuthService) {       
        let params = {last_page: '/csv-upload'};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
        });

	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	    );

    }

    ngOnInit() {
    }

    /**
     * upload files
     */
    uploadFiles() {
        this.showLoading = true;
        // The Chart of Accounts must be called before the Trial Balance.
        this.loadingMessage = "Uploading your Chart of Accounts";
        this.company_service.postChartOfAccounts(this.coaFiles).subscribe(resposne => {
            this.loadingMessage = "Uploading your Trial Balance";
            this.company_service.postTrialBalance(this.trialFiles).subscribe(resposne => {
                this.showLoading = false;
                this.router.navigate(['coa-match', 'upload']);
            });
        });
    }

    remove(type) {
        if (type == 'trial') {
            this.trialFiles = [];
        } else {
            this.coaFiles = [];
        }
    }
    /**
     * push files based on types
     */
    fileChange(event, type) {
        let files = event.target.files;
        if (files.length > 0) {
            if (type == 'trial') {
                this.trialFiles = files;
            } else {
                this.coaFiles = files
            }
        }
    }

    /**
     * delete selected file for drag file
     */

    dropped(event, type) {
        let files = event.files;
        if (type == 'trial') {
            this.trialFiles = files;
        } else {
            this.coaFiles = files
        }
    }

     /**
     * Save Exit
     */
    saveExit(){
        this.auth_service.logout();
        this.router.navigate(['/']);
    }
}
