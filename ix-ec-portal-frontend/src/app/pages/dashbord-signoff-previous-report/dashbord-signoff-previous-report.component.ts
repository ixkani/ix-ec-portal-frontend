import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SignoffService} from './../../services';
import {AuthService} from './../../services/auth.service';
import {CompanyService} from './../../services';
import { ReportingService } from './../../services';
import {environment} from './../../../environments/environment';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';
import { ReportingComponent } from '../reporting/reporting.component';

@Component({
    selector: 'app-dashbord-signoff-previous-report',
    templateUrl: './dashbord-signoff-previous-report.component.html',
    styleUrls: ['./dashbord-signoff-previous-report.component.css'],
    providers: [ CompanyService, AuthService, ReportingService, SignoffService ]
})

export class DashbordSignoffPreviousReportComponent implements OnInit {
    date;
    income_statement: any = [];
    showLoading: boolean = true;
    balance_sheet: any[];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    currentMonth;
    dateParam;
    next_reporting_peroid;
    next_reporting_due: boolean = false;
    monthly_reporting_sync_method;
    reporting_in_progress: boolean = false;
    current_reporting_period;
    show_in_progress_msg = false;
    
    questions: any = [];
    espressoContacts:any = [];
    constructor(private signoff_service: SignoffService, private route: ActivatedRoute, private reporting_service: ReportingService, private company_service: CompanyService, private auth_servcie: AuthService, private router: Router) {

	// get espresso contact 
	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	 );
        // get date param from route
        this.route.params.subscribe(params => {
            this.dateParam = params.date;
        });

        //let params = {last_page: '/dashboard-signoff-prev-report/' + this.dateParam};
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
                
                // if the user tries to access the report summary of a month that is in progress, show an in progress message instead of the data.
                if(moment(this.dateParam).endOf('month').isSame(moment(this.current_reporting_period).endOf('month')) && this.reporting_in_progress) {
                    console.log('####### show in progress');
                    this.show_in_progress_msg = true;
                }
            }
        );
        console.log('########### date param '+this.dateParam);
        // #todo: this.date, this.dateParams should be consolidated into this.period
        this.date = moment(this.dateParam).endOf('month').format('YYYY-MM-DD');
        console.log('########### date '+this.date);
        this.currentMonth = moment(this.dateParam).format('MMM. YYYY');

        // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
        this.reporting_service.getMonthlyReportAnswersByPeriod(this.date).subscribe(data => {
            if (data.status == "ERROR") {
                this.questions = [];
            }
            else {
                this.questions = data;
                // for question type enum, we split the string by '|' and convert it into array 
                for (var i = 0; i < this.questions.length; i++) {
                    if (this.questions[i].answer_data_type == 'enum') {
                        var result = this.questions[i].answer_validation_regex.split('|');
                        this.questions[i].enumvalues = result;
                    }
                    // if answer is null set this as default value
                    if (this.questions[i].answer == null) {
                        this.questions[i].answer = {
                            "id": '',
                            "answer": null
                        }
                    }
                    // setting date format for date picker
                    if (this.questions[i].answer_data_type == 'date') {
                        var monthNames = [
                            "January", "February", "March",
                            "April", "May", "June", "July",
                            "August", "September", "October",
                            "November", "December"
                        ];
                        var d = new Date(this.questions[i].answer.answer);
                        var day = d.getDate();
                        var monthIndex = d.getMonth();
                        var year = d.getFullYear();

                        var gotdate = monthNames[monthIndex] + ' ' + day + ',' + ' ' + year;
                        this.questions[i].answer.answer = gotdate
                    }
                }
            }
        });
            
        // get income and balance sheet by particular date
        this.signoff_service.getIncomeCetificateForParticularMonth(this.date).subscribe(data => {
            if (data.message) {
                this.showLoading = false;
                this.income_statement = []
            } else {
                this.showLoading = false;            
                
                this.income_statement = data.sort(function(a,b) {                                                    
                                                    if(a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                        return 0;
                                                    if(a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                        return -1;
                                                    if(a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                        return 1;
                                                });
                                               
                
            }
        });
        
        this.signoff_service.getBalanceSheetForParticularMonth(this.date).subscribe(data => {
            if (data.message) {
                this.showLoading = false;
                this.balance_sheet = []
            } else {
                this.showLoading = false;
                               
                this.balance_sheet = data.sort(function(a,b) {                                                
                                                if(a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                    return 0;
                                                if(a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                    return -1;
                                                if(a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                    return 1;
                                            });
                
                // split up the balance sheet into assets and liabilities to match the fin overview
                var active_array = [];
                var active_index = 0;
                for(var i = 0; i < this.balance_sheet.length; i++) {       
                    active_array[active_index] = this.balance_sheet[i];
                    
                    if(this.balance_sheet[i].fse_tag.name == 'asset_total') {
                        this.balance_sheet_ass = active_array;
                        active_array = [];   
                        active_index = 0;
                        continue;
                    }
                    
                    active_index++;
                }
                
                this.balance_sheet_liab = active_array;                              
            }
        });
    }        
    
    // Triggers the beginning of a monthly reporting
    startMonthlyReporting() {
        this.showLoading = true;
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
