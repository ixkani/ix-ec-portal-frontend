import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

import {CompanyService, AuthService} from './../../services';
import {environment} from './../../../environments/environment';

@Component({
    selector: 'app-quickbook-desktop',
    templateUrl: './quickbook-desktop.component.html',
    styleUrls: ['./quickbook-desktop.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class QuickbookDesktopComponent implements OnInit {
    showLoading: boolean = false;
    appInstalled: boolean = false;

    constructor(public router: Router, private company_service: CompanyService, private auth_service: AuthService) {
        let params = {last_page: '/quickbook-desktop'};
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
        })
        this.company_service.getCompanyMetadata().subscribe(data => {
            if (data.qb_desktop_installed == true) {
                this.appInstalled = true;
            }
            else {
                this.appInstalled = false;
            }
            this.showLoading = false;
        })

    }

    /**
     * download app
     */

    download() {
        // #brad - removing hardcoded URL
        window.location.href = environment.api.url+'/lend/downloadqbd/';
    }

    /**
    * open app and then route to coa-match
    */
    openApp() {
        this.router.navigate(['coa-match', 'quickbook-desktop']);
    }

    /**
     * Save Exit
     */
    saveExit(){
        this.auth_service.logout();
        this.router.navigate(['/']);
    }

    ngOnInit() {
    }

}
