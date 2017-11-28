import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';

import {ReportingService} from './../../services';
import {CompanyService, AuthService} from './../../services';

@Component({
    selector: 'app-reporting',
    templateUrl: './reporting.component.html',
    styleUrls: ['./reporting.component.css'],
    providers: [ CompanyService, AuthService, ReportingService ]
})
export class ReportingComponent implements OnInit {
    questions: any = [];
    showLoading: boolean = true;
    type: string;
    bsConfig: Partial<BsDatepickerConfig>;
    report: any = [];
    company_meta;
    espressoContacts: any = [];

    constructor(private reporting_service: ReportingService, private router: Router, private route: ActivatedRoute, private company_service: CompanyService, private auth_service: AuthService) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });

	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	    );
        
        let params = {last_page: '/reporting/'+this.type};
        console.log('### this type is '+this.type);
        
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
               //
            }
        )

        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
        
        // check to see if report for current period exists. If it does, the user is returning to a Saved session, so we need to load their previous answers
        this.reporting_service.getMonthlyReportAnswersByPeriod(this.company_meta.monthly_reporting_current_period).subscribe(
            data => {
                // preload the data fo
                console.log('######### got answers by period '+this.company_meta.monthly_reporting_current_period);
                console.log(data);                
                this.prepareForDisplay(data);
            },
            error => {
                // if there are no answers for the current period, then load the answers from the last period for convenience.
                // #todo: per a suggestion from one of our clients, prepopulating this makes it too easy to skip. Should provider
                //        some sort of read only or copy/paste version showing last months answers but still require that they be filled in.
                console.log('############# no saved answers. Loading last months.');
                // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
                this.reporting_service.getLastMonthlyReportAnswers().subscribe(
                    data => {
                        if (data.status == "ERROR") {
                            this.questions = [];
                            this.showLoading = false;
                        }
                        else {
                            this.prepareForDisplay(data);
                        }
                    },
                    error => {
                        console.log('### no question data found, need to ask for blank question list');
                        this.reporting_service.getQuestionListOnly().subscribe(
                            data => {
                                this.prepareForDisplay(data);
                            }
                        );
                        this.showLoading = false;
                    }
                );
            }
        );        
    }
    
    prepareForDisplay(data) {
        this.questions = data;
        this.formatQuestionsForDisplay();
        this.showLoading = false;
    }
    
    formatQuestionsForDisplay() {
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
    
    /**
     * submit reporting
     */
    submitReporting() {
        this.showLoading = true;
        this.prepareReportData();
        //Post request to submit reporting answers
        this.reporting_service.postReportingAnswers(this.report).subscribe(data => {
            if (data.answer !== undefined) {
                this.showLoading = false;
            }
            else {
                this.showLoading = false;
                this.router.navigate(['signoff', this.type]);
            }
        })
    }
    
    prepareReportData() {
        // creating an array param for post api
        for (var i = 0; i < this.questions.length; i++) {
            if (this.questions[i].answer_data_type == 'date') {
                var res = {
                    "question": this.questions[i].id,
                    "answer": this.questions[i].answer.answer._d
                }
            }
            else {
                var res = {
                    "question": this.questions[i].id,
                    "answer": (this.questions[i].answer.answer) ? this.questions[i].answer.answer : null
                }
            }
            this.report.push(res)
        }
    }
    
    /**
     * Save Exit
     */
    saveExit(){
        // need to save the answers before logging them out.
        this.prepareReportData();
        this.reporting_service.postReportingAnswers(this.report).subscribe(
            data => {            
                this.showLoading = false;
                this.auth_service.logout();
                this.router.navigate(['/']);        
            }
        )        
    }

    ngOnInit() {
    }

}
