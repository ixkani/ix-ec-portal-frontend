import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import {CompanyService} from './../../services';

@Component({
    selector: 'app-admin-previous-report',
    templateUrl: './admin-previous-report.component.html',
    styleUrls: ['./admin-previous-report.component.css']
})
export class AdminPreviousReportComponent implements OnInit {

    company_id;
    company_name;
    showLoading: boolean = true;
    reports: any = [];
    next_reporting_peroid;

    constructor(public router: Router, private company_service: CompanyService, private route: ActivatedRoute) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.company_id = params.company_id;
            this.company_name = params.name;
        });
        
        let params = {last_page: '/admin-previous-report/'+ this.company_id + '/' + this.company_name};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })
        
        // get company next reporting peroid from company metadat
        this.company_service.getCompanyMetadataByCompanyId(this.company_id).subscribe(data => {
            console.log(data)
            this.next_reporting_peroid = data.monthly_reporting_next_period;
        })

        // get monthly reports
        this.company_service.getMonthlyReportByCompany(this.company_id).subscribe(response => {
            //redirect to report page
            console.log(response)
            this.reports = response;
            this.showLoading = false;
        });
    }

    ngOnInit() {
    }
    //adminPreviousReportDetail
}
