import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';

import {CompanyService} from './../../services';

@Component({
    selector: 'app-admin-company-dashboard',
    templateUrl: './admin-company-dashboard.component.html',
    styleUrls: ['./admin-company-dashboard.component.css']
})
export class AdminCompanyDashboardComponent implements OnInit {
    showLoading: boolean = true;
    income_statement: any = [];
    balance_sheet: any = [];
    company_name;
    company_id;
    next_reporting_peroid;

    constructor(private company_service: CompanyService, private route: ActivatedRoute) {

        //get parametes from route
        this.route.params.subscribe(params => {
            this.company_name = params.name;
            this.company_id = params.company_id;
        });

        let params = {last_page: '/admin-company-dashboard/' + this.company_id + '/' + this.company_name};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
            this.next_reporting_peroid = data.monthly_reporting_next_period;
        })


        // get income and balance sheet of last 24 months by partcular company id for admin and then order by period_ending
        this.company_service.getIncomeStatementOfLastMonthsByCompanyId(this.company_id).subscribe(data => {
            if (data.message) {
                this.showLoading = false;
                this.income_statement = []
            } else {
                var feild = 'period_ending';
                data.sort((a: any, b: any) => {
                    let left = Number(new Date(a[feild]));
                    let right = Number(new Date(b[feild]));

                    return right - left;
                });
                this.income_statement = data;
                this.showLoading = false;
            }

            this.company_service.getBalanceStatementOfLastMonthsByCompanyId(this.company_id).subscribe(data => {
                if (data.message) {
                    this.showLoading = false;
                    this.balance_sheet = []
                } else {
                    var feild = 'period_ending';
                    data.sort((a: any, b: any) => {
                        let left = Number(new Date(a[feild]));
                        let right = Number(new Date(b[feild]));

                        return right - left;
                    });
                    this.balance_sheet = data;
                    this.showLoading = false;
                }
            })
        })

    }

    ngOnInit() {
    }

}
