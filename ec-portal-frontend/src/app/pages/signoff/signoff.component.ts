import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SignoffService, CompanyService, AuthService} from './../../services';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-signoff',
    templateUrl: './signoff.component.html',
    styleUrls: ['./signoff.component.css'],
    providers: [ SignoffService, CompanyService, AuthService ]
})
export class SignoffComponent implements OnInit {
    income_statement: any = [];
    balance_sheet: any = [];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    showLoading: boolean = true;
    date;
    today;
    type: string;
    signoff_by: any = [];

    constructor(private signoff_service: SignoffService, private router: Router, private route: ActivatedRoute, private company_service: CompanyService, private auth_service: AuthService) {
        // get date param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });
        
        let params = {last_page: '/signoff/'+this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {});
       
        // model to support signoff form
        this.signoff_by = {
            "signoff_by_name": '',
            "signoff_by_title": ''                                                 
        };
        
        var company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.date = moment(company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');
        this.today = moment().format("MMMM Do, YYYY");
        
        // get income and balance sheet
        this.signoff_service.getIncomeCetificate().subscribe(data => {
            if (data.message == "Bad date parameters") {
                this.income_statement = [];
            }
            else {
                this.income_statement = data.sort(function(a,b) {                                                    
                                                    if(a.fse_tag.sort_order == b.fse_tag.sort_order)
                                                        return 0;
                                                    if(a.fse_tag.sort_order < b.fse_tag.sort_order)
                                                        return -1;
                                                    if(a.fse_tag.sort_order > b.fse_tag.sort_order)
                                                        return 1;
                                                });
            }
            this.showLoading = false;
        });
        
        this.signoff_service.getBalanceSheet().subscribe(data => {  
            console.log('########## SIGNOFF service balance sheet');
            if (data.message == "Bad date parameters") {
                this.balance_sheet = [];
            }
            else {                
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
            this.showLoading = false;
        });       
    }
    
    /**
     * signoff post call
     */

    signOff() {
        this.showLoading = true;               
        
        console.log('########### signinf off with BY data: '+JSON.stringify(this.signoff_by));
        this.signoff_service.postForSigningOff(this.signoff_by).subscribe(data => {
            this.showLoading = false;
            this.router.navigate(['thanks']);
        })
    }

    /**
     * Save Exit
     */
    saveExit(){
        let params = {last_page: '/signoff/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
                this.auth_service.logout();
                this.router.navigate(['/']);
            }
        )
    }

    ngOnInit() {
    }

}
