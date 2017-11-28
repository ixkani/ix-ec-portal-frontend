import {Component, OnInit} from '@angular/core';
import {CompanyService} from './../../services';
import {SignoffService} from './../../services';

@Component({
    selector: 'app-thanks',
    templateUrl: './thanks.component.html',
    styleUrls: ['./thanks.component.css'],
    providers: [ CompanyService, SignoffService ]
})
export class ThanksComponent implements OnInit {

    constructor(private company_service: CompanyService, private signoff_service: SignoffService) {
        var company_meta;
        company_meta = JSON.parse(localStorage.getItem('company_meta'));
        /*this.company_service.getCompanyMetadata().subscribe(
            data => {
                company_meta = data;
                console.log('##### thanks component got company meta ');
                console.log(data);
            }
        );
        
        company_meta = JSON.parse(localStorage.getItem('company_meta'));*/
        // force the sign off off the monthly report that gets created during setup
        if(company_meta.is_initial_setup) {
            this.signoff_service.postForSigningOff().subscribe(
                data => {
                    console.log('############# signed off on initial setup monthly report');
                    //this.showLoading = false;                
                }
            );
        }
        // #brad - we want them to go back to te dashboard next time they login, not back to the thank you page
        let params = {is_initial_setup: false, last_page: '/dashboard'};
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
           console.log(data)
        })
    }

    ngOnInit() {
    }

}
