import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {SignoffService} from './../../services';
import {CompanyService} from './../../services';

@Component({
    selector: 'app-admin-previous-report-detail',
    templateUrl: './admin-previous-report-detail.component.html',
    styleUrls: ['./admin-previous-report-detail.component.css']
})
export class AdminPreviousReportDetailComponent implements OnInit {
    date;
    income_statement: any = [];
    showLoading: boolean = true;
    balance_sheet: any[];
    currentMonth;
    dateParam;
    company_name;
    company_id;
    next_reporting_peroid;
    constructor(private signoff_service: SignoffService, private company_service: CompanyService, private route: ActivatedRoute) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.dateParam = params.date;
            this.company_name = params.name;
            this.company_id = params.company_id;
        });

        let params = {last_page: '/admin-previous-report-detail/' + this.company_id + '/' + this.company_name  + '/' +this.dateParam};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })

        // get company reporting peroid 
        this.company_service.getCompanyMetadataByCompanyId(this.company_id).subscribe(data => {
            console.log(data)
            this.next_reporting_peroid = data.monthly_reporting_next_period;
        })

        // creating date format (eg 30/Apr/17)
        var dateObj = new Date(this.dateParam);
        var monthNames = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun", "Jul",
            "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ];
        var monthFullNames = [
            "January", "February", "March",
            "April", "May", "June", "July",
            "August", "September", "October",
            "November", "December"
        ];

        var day = dateObj.getDate();
        var monthIndex = dateObj.getMonth();
        var year = dateObj.getFullYear().toString().substring(2);

        this.date = day + '/' + monthNames[monthIndex] + '/' + year;
        this.currentMonth = monthFullNames[monthIndex] + ' ' + dateObj.getFullYear();

        // get income and balance sheet by particular company id
        this.signoff_service.getIncomeCetificateForParticularMonthByCompany(this.company_id, this.dateParam).subscribe(data => {
            console.log(data)
            if (data.message) {
                this.showLoading = false;
                this.income_statement = [];
            } else {
                this.showLoading = false;
                this.income_statement = data;
            }

        })
        this.signoff_service.getBalanceSheetForParticularMonthByCompany(this.company_id, this.dateParam).subscribe(data => {
            console.log(data)
            if (data.message) {
                this.showLoading = false;
                this.balance_sheet = []
            } else {
                this.showLoading = false;
                this.balance_sheet = data;
            }

        })
    }

    ngOnInit() {
    }

}
