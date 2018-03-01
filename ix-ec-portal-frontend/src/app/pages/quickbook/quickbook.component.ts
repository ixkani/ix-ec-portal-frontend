import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import { CompanyService, AuthService } from './../../services';

@Component({
    selector: 'app-quickbook',
    templateUrl: './quickbook.component.html',
    styleUrls: ['./quickbook.component.css'],
    providers: [ CompanyService, AuthService ]
})
export class QuickbookComponent implements OnInit {

    constructor(private company_service: CompanyService, private auth_service: AuthService, private router: Router) {
        let params = {last_page: '/qbook'};
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })

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
