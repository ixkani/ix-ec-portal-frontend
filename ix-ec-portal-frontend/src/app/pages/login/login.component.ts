import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {environment} from './../../../environments/environment';
import {ReportingService} from '../../services';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    providers: [ ReportingService, AuthService ]
})
export class LoginComponent implements OnInit {
    showLoading: boolean = false;
    loadingMessage: string;
    
    user = {
        username: '',
        password: ''
    };

    message = '';

    constructor(private authService: AuthService, private reporting_service: ReportingService, private router: Router) {
        console.log('######## login constructor. clearing localstorage');
        localStorage.clear(); // flushing local storage on login because some data appears to be carrying forward. need to figure out why. #todo #brad
        
        if (this.authService.isLoggedIn()) {
            this.router.navigate(['/intro']);
        }
    }

    ngOnInit() {
    }

    /**
     * Login handler 
     */
    login() {        
        localStorage.clear();
        this.showLoading = true;
        this.authService.login(this.user).subscribe(data => {
            console.log('### LOGIN data and user are '+this.user+' --- '+JSON.stringify(data));
            //console.log(data);
            if (data.username) {

                let urlParams = new URLSearchParams();
                urlParams.append('username', this.user.username);
                urlParams.append('password', this.user.password);
                urlParams.append('client_id', environment.api.client_id);
                urlParams.append('client_secret', environment.api.client_secret);
                urlParams.append('grant_type', 'password');
                //console.log(urlParams)
                //Get access token from the API 
                this.authService.getToken(urlParams.toString()).subscribe(response => {
                    //console.log(response)
                    let current_date = new Date();
                    //Set the company into the localstorage
                    localStorage.setItem('user', JSON.stringify(data));
                    localStorage.setItem('company', data.company.id);
                    localStorage.setItem('token', response.access_token);
                    localStorage.setItem('refresh', response.refresh_token);
                    
                    console.log('########## LOGIN found company id '+localStorage.getItem('company'));
                    
                    // get user role - client or admin
                    this.authService.getRole().subscribe(response => {
                        console.log(response)
                        if (response.role == 'admin') {                            
                            this.router.navigate(['/AdminCompanySerachComponent']);
                            this.showLoading = false;
                        }
                        else {
                            // #brad keeping all meta data to be used on various pages in the app.
                            // #todo: the meta data changes through the apps usage so watch out that this doesn't get out of sync for the current session.
                            localStorage.setItem('company_meta', JSON.stringify(data.company.metadata));

                            if (data.company.metadata.accounting_setup_status != 'COMPLETE') {
                                if (data.company.metadata.accounting_setup_status == 'NOT_STARTED') {                                                                           
                                    // #brad creating a monthly report for the setup process
                                    console.log('######## found COMPANY during accounting setup @login page '+localStorage.getItem('company'));
                                    this.reporting_service.postMonthlyReportForCurrentPeriod(data.company.id, localStorage.getItem('token')).subscribe(
                                        response => {
                                            console.log('############ created a new monthly report '+JSON.stringify(response));
                                            this.router.navigate(['/intro']);
                                            this.showLoading = false;                                            
                                        }
                                    );                                                                      
                                }
                                else {
                                    var path = [data.company.metadata.last_page];
                                    this.router.navigate(path);
                                    this.showLoading = false;
                                }
                            }
                            else {
                                this.router.navigate(['/dashboard']);
                                /*console.log('########### reporting status for '+data.company.metadata.monthly_reporting_current_period+
                                            ' is '+data.company.metadata.monthly_reporting_current_period_status);
                                if (data.company.metadata.monthly_reporting_current_period != null && data.company.metadata.monthly_reporting_current_period_status != 'COMPLETE') {
                                    this.router.navigate(['/dashboard']);
                                } else if (data.company.metadata.monthly_reporting_next_period >= current_date) {
                                    this.router.navigate(['/dashboard']);
                                } else {
                                    this.router.navigate(['/dashboard']);
                                }*/
                            }
                        }
                    })
                    //check the status of the company and then redirect user
                    //                    if (data.company.metadata.accounting_setup_status != 'COMPLETE' || data.company.metadata.accounting_setup_status == 'NOT STARTED') {
                    //                        this.router.navigate(['/intro']);
                    //                    } else if (data.company.metadata.monthly_reporting_current_period != null && data.company.metadata.monthly_reporting_current_period_status != 'COMPLETE') {
                    //                        this.router.navigate(['/dashboard']);
                    //                    } else if (data.company.metadata.monthly_reporting_next_period >= current_date) {
                    //                        this.router.navigate(['/dashboard']);
                    //                    } else {
                    //                        this.router.navigate(['/intro']);
                    //                    }
                })

                this.showLoading = false;
            } else {
                this.message = data;
                this.showLoading = false;
            }
        });

    }

}
