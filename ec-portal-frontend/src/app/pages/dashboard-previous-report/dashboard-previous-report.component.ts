import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import {ReportingService} from './../../services';
import {environment} from './../../../environments/environment';
import * as moment from 'moment';

@Component({
    selector: 'app-dashboard-previous-report',
    templateUrl: './dashboard-previous-report.component.html',
    styleUrls: ['./dashboard-previous-report.component.css'],
    providers: [ CompanyService, AuthService, ReportingService ]
})
export class DashboardPreviousReportComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: string;
    date;
    reports;
    next_reporting_peroid;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;
    current_reporting_period;

    constructor(private company_service: CompanyService, private reporting_service: ReportingService, private auth_servcie: AuthService, private router: Router) {
        //let params = {last_page: '/dashboard-prev-report'};
        //api call to set the metdata  last page
        this.company_service.getCompanyMetadata().subscribe(
            data => {
                this.next_reporting_peroid = data.monthly_reporting_next_period;
                this.monthly_reporting_sync_method = data.monthly_reporting_sync_method;
                this.current_reporting_period = data.monthly_reporting_current_period;
                
                /*
                // #brad: we may not need a reporting in progress screen because the app always
                //        takes you back to where you left off, so if it was in the middle of a reporting
                //        you'll continue automatically the next time you login. In this version of the portal, this behaviour is good.
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
            }
        );

        // get reporting_next_period from company meta
        //        this.company_service.getCompanyMetadata().subscribe(data => {
        //            console.log(data)
        //            this.next_reporting_peroid = data.monthly_reporting_next_period;
        //        })

        // get monthly reports
        this.company_service.getMonthlyReport().subscribe(response => {
            this.reports = response;
            this.showLoading = false;
        });
    }

    // Triggers the beginning of a monthly reporting
    startMonthlyReporting() {
        this.showLoading = true;
        this.loadingMessage = 'Starting Monthly Reporting for '+moment(this.next_reporting_peroid).format('MMM DD, YYYY');
        // #brad: last_page isn't sync, monthly_reporting_sync_method will already be set, so need to remove this after testing.
        /*let params = {
            monthly_reporting_sync_method: type,
            last_page: '/sync'
        };

        var type = this.monthly_reporting_sync_method;*/
        
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
