import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, SignoffService, AuthService} from './../../services';
import * as moment from 'moment';
import { CurrencyPipe } from '@angular/common';
import { DecimalPipe } from '@angular/common';

@Component({
    selector: 'app-coa-matchmaking-confirm',
    templateUrl: './coa-matchmaking-confirm.component.html',
    styleUrls: ['./coa-matchmaking-confirm.component.css'],
    providers: [ CompanyService, SignoffService, AuthService ]
})
export class CoaMatchmakingConfirmComponent implements OnInit {
    showLoading: boolean = true;
    
    income_statement: any = [];
    balance_sheet: any = [];
    balance_sheet_liab: any[]; // ...ilities temporary until phase 2 refactor. #brad #todo
    balance_sheet_ass: any[];  // ...ets :) temporary until phase 2 refactor. #brad
    loadingMessage: string;
    isActiveClass: boolean = false;
    date;
    type: string;
    espressoContacts:any = [];
    
    constructor(private router: Router, private signoff_service: SignoffService, private company_service: CompanyService, private route: ActivatedRoute, private auth_service: AuthService) {
        // get type param from route
        this.route.params.subscribe(params => {
            this.type = params.type;
        });

	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	    );

        let params = {last_page: '/coa-match-confirm/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })

        var company_meta = JSON.parse(localStorage.getItem('company_meta'));
        this.date = moment(company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');
        
        // get income and balance sheet
        this.loadingMessage = 'Loading your Balance Sheet and Income Statement for '+moment(company_meta.monthly_reporting_current_period).format('MMMM DD, YYYY');        
        
        this.signoff_service.getBalanceSheet().subscribe(
            data => {  
                console.log('########## COA MATCH service balance sheet');
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
                
                this.signoff_service.getIncomeCetificate().subscribe(
                    data => {
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
                    }
                )
            }
        )
    }

    ngOnInit() {
    }

    changeTab() {
        // active class for tabs  
        this.isActiveClass = true;
    }

    hideSheet() {
        this.isActiveClass = false;
    }
    
    /**
     * go back to coa-match
     */
    
    goBack(){
        // #todo: can we send another parameter here called remap a adding some more code
        this.router.navigate(['coa-match', this.type], { queryParams: { remap: true } });
    }

    /**
     * update company meta data
     */
    updateCompanyMetaData() {
        let params = {accounting_setup_status: 'COMPLETE'};
        //api call to set the metdata 
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            if (data.is_initial_setup == true) {                
                this.router.navigate(['thanks']);
            }
            else {
                this.router.navigate(['reporting', this.type]);
            }
        })
    }

     /**
     * Save Exit
     */
    saveExit(){
        let params = {last_page: '/coa-match-confirm/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
                this.auth_service.logout();
                this.router.navigate(['/']);
            }
        )
    }    
}
