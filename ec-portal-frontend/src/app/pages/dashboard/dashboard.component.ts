import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {ReportingService} from '../../services';
import {environment} from './../../../environments/environment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import * as moment from 'moment';

/**
 * pipe for searching value by name and date for balancesheet and incomestatement
*/

@Pipe({name: 'Search'})
export class Search implements PipeTransform {
    transform(value: Array<any>, field: string, date: string) {
        let searchText = field;
        if (value) {
            return value.filter(project => {
                if (project) {
                    if (project.fse_tag.name == searchText && project.period_ending == date) {
                        return project.value;
                    }
                    else {
                        return false;
                    }
                }
            });
        }
    }
}


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css'],
    providers: [ CompanyService, AuthService, ReportingService ]
})

// need to add automatic logout when session expires. #brad #todo
export class DashboardComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: string = "Loading your Financial Overview";
    loadingMessageClass: string = 'msg_gen_fin_overview'; // once we fix the auto centering issue for these messages, this will no longer be needed. #todo #brad
    
    income_statement: any = [];
    balance_sheet: any = [];
    myjson: any = JSON;
    next_reporting_peroid;
    current_reporting_period;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;    

    constructor(private company_service: CompanyService, private reporting_service: ReportingService, private auth_servcie :AuthService, private router: Router) {
        let params = {}; // don't set last_page on dashboard because it overwrites the page that Save & Exit sets. The Thank You page will set the page for dashboard.
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
                this.next_reporting_peroid = data.monthly_reporting_next_period;
                this.current_reporting_period = data.monthly_reporting_current_period;
                this.monthly_reporting_sync_method = data.monthly_reporting_sync_method;
                console.log('######### DashboardComponent constructor with META '+data.monthly_reporting_current_period);
                /*
                    brad: we may not need a reporting in progress screen because the app always
                          takes you back to where you left off, so if it was in the middle of a reporting
                          you'll continue automatically the next time you login. In this version of the portal, this behaviour is good.
                */                
                if(data.monthly_reporting_current_period_status == 'IN_PROGRESS') {
                    this.reporting_in_progress = true;
                }
                else {
                    // Compare next_reportin_period with today's date
                    // #brad #todo: this should think that reporting is in progress as well.
                    var report_due_date = new Date(this.next_reporting_peroid);
                    var todays_date = new Date();
                    if(report_due_date < todays_date) {
                        this.next_reporting_due = true;
                    }
                }
                console.log('############## dashboard comp MEAT'+JSON.stringify(data));
                
                // get income and balance sheet of last 24 months and sort it by date.
                // Only retrieve this info after the meta data has been update
                this.company_service.getIncomeStatementOfLastMonths().subscribe(data => {
                    if (data.message) {
                        this.income_statement = []
                    } else {
                        var feild = 'period_ending';
                        data.sort((a: any, b: any) => {
                            let left = Number(new Date(a[feild]));
                            let right = Number(new Date(b[feild]));
                            return right - left;
                        });
                        this.income_statement = data;
                    }
                    
                    this.company_service.getBalanceStatementOfLastMonths().subscribe(data => {
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
        );       
    }

  
    // Triggers the beginning of a monthly reporting
    // we need to create a common dashboard service to deal with the functionality
    // around the side bar for all 3 dashboard related views. a separate sidebar
    // template / component would also be good. #brad #todo
    startMonthlyReporting() {
        this.showLoading = true;
        var monthly_reporting_date = moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        this.loadingMessage = "Starting Monthly Report for "+monthly_reporting_date;
       
        // Create the monthly report for the current period. This functio will not allow dupliacte montly report entries to be created.
        this.reporting_service.postMonthlyReportForCurrentPeriod(localStorage.getItem('company'), localStorage.getItem('token')).subscribe(
            response => {
                console.log('############ created a new monthly report if one didnt already exist '+response);
                // #brad postMonthlyReportForCurrentPeriod causes the next and current period in the meta to change, so we need to 
                // refresh the localStorage before we move on.
                this.company_service.getCompanyMetadata().subscribe(
                    meta => {
                        // refresh localStorage version of meta
                        localStorage.setItem('company_meta', JSON.stringify(meta));
                        var type = meta.monthly_reporting_sync_method;
                        
                        // #brad: don't move forward until the monthly report has been created
                        if (type == 'QBO') {
                            //Redirect to the quick books link
                            this.loadingMessage = "Redirecting to Quickbooks Online for Authentication";
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
                    }
                );
            }
        );               
    }

    continueMonthlyReporting() {
        this.showLoading = true;                
        this.company_service.getCompanyMetadata().subscribe(
            meta => {
                // refresh localStorage version of meta
                localStorage.setItem('company_meta', JSON.stringify(meta));
                var type = meta.monthly_reporting_sync_method;
                var path = [meta.last_page];                
                console.log('#### redirecting to path '+path);
                // #brad: don't move forward until the monthly report has been created
                if (type == 'QBO') {
                    this.showLoading = false;
                    this.router.navigate(path);
                } else if (type == 'QBD') {
                    //make a call to quick book desktop app
                    this.showLoading = false;
                    this.router.navigate(path);
                } else if (type == 'CSV') {
                    // this.company_service.putCompany({ accounting_type: 'Sage' }).subscribe(response => {
                    //Redirect to the CSV 
                    this.showLoading = false;
                    this.router.navigate(path);
                    // })
                } else if (type == 'MANUAL') {
                    //Redirect to the manual 
                    this.showLoading = false;
                    this.router.navigate(path);
                }
            }
        );              
    }
    
    
    ngOnInit() {
    }

    
    /**
     * logout and clear local storage
     */
    logOut() {
        this.auth_servcie.logout();
        this.router.navigate(['/']);
    }
}


