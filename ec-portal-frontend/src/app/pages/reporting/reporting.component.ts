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

    constructor(private reporting_service: ReportingService, private router: Router, private route: ActivatedRoute, private company_service: CompanyService, private auth_service: AuthService) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });
        
        let params = {last_page: '/reporting/'+this.type};
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })

        // get answers from last month and prepopulate for user convenience, answers typically don't change too much from month to month
        this.reporting_service.getLastMonthlyReportAnswers().subscribe(data => {
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
            this.showLoading = false;
        });
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
