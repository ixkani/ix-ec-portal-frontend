import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, SignoffService, AuthService} from './../../services';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'app-coa-match',
    templateUrl: './coa-match.component.html',
    styleUrls: ['./coa-match.component.css'],
    providers: [CompanyService, SignoffService, AuthService]
})
export class CoaMatchComponent implements OnInit {
    showLoading: boolean = true;
    loadingMessage: string;
    
    fields: any = [];

    income_statement_assets: any = [];
    income_statement_liability: any = [];
    balance_sheet: any = [];
    isInitialSetup: boolean = false;
    type: string;
    ifError: boolean = false;
    ifSuccess: boolean = false;
    remap: boolean = false;
    field_index: number = 0;
    // for grouping the coa map data
    assets: any = [];
    liabilities: any = [];
    equity: any = [];
    income: any = [];
    expenses: any = [];
    espressoContacts: any = [];

    incrementFieldIndex() {
       this.field_index++;
       console.log('### field index track is '+this.field_index);
       //return this.field_index;
    }
    
    constructor(private company_service: CompanyService, private router: Router, private signoff_service: SignoffService, private route: ActivatedRoute, private auth_service: AuthService) {
        this.loadingMessage = 'Matching your Chart of Accounts';
        
        this.field_index = 0;
        // get date param from route
        this.route.params.subscribe( params => {
	    	//this.isInitialSetup = params.is_initial_setup;
            this.type = params.type;               
        });

        // this will be coming from the coa-matching-confirm page if the user needs to remap the
        // chart of accounts
        this.route.queryParams.subscribe(
            params => {
                this.remap = params['remap'];
                console.log('############ params remap '+this.remap);
            }
        );
        
		this.company_service.getCompanyMetadata().subscribe(
			data => {
				console.log('############ META');
				console.log(data);
			}
		);

	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	    );

        let params = {last_page: '/coa-match/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
                console.log('############ updateCompanyMetadata '+data)
                // we need the updated meta data to get the sync type to check to see if it's CSV or not.                
                if(!this.remap) {                       
                    // if type is quickbooks, call get api of ChartOfAccounts and TrialBalance
                    // this is specific to quickbooks online
                    if (this.type == 'quickbooks' && data.monthly_reporting_sync_method != 'CSV') {                            
                        // IF  companymeta.chartofaccounts_last_refresh_date < today's date then do this: 
                        this.company_service.getChartOfAccounts().subscribe(data => {                                                      
                            this.company_service.getCoAMap().subscribe(data => {                        
                                if (data.message == 'Nochange') {
                                    this.loadingMessage = '<p>No change in Chart of Accounts</p><p>Loading your Trial Balance</p>';

                                    this.company_service.getTrialBalance().subscribe(
                                        response => {
                                            this.loadingMessage = '<p>Processing your Financials.</p><p>Hang tight, this can take up to 20 seconds.</p>';
                                            // console.log(response)
                                            this.company_service.getGenerateStatements().subscribe(response => {
                                                console.log('########### AS RESPONSE');
                                                console.log(response);
                                               // redirect to report page
                                               this.router.navigate(['reporting', this.type]);
                                               this.showLoading = false;
                                            });
                                        }
                                    );                            
                                } else {
                                    this.prepareMapData(data);                                                        
                                    this.showLoading = false;
                                }
                            });        
                        });
                    }
                    else { // using something other than quickbooks online, and we expect the trial balance and coa to already be in the system. (CSV, QBD)
                        this.company_service.getCoAMap().subscribe(data => {                        
                            if (data.message == 'Nochange') {
                                this.loadingMessage = '<p>Processing your Financials</p><p>Hang tight, this can take up to 20 seconds</p>';                                
                                this.company_service.getGenerateStatements().subscribe(response => {
                                    console.log('########### AS RESPONSE');
                                    console.log(response);                                    
                                   // redirect to report page
                                   this.router.navigate(['reporting', this.type]);
                                   this.showLoading = false;
                                });                            
                            } else {                        
                                this.prepareMapData(data);                                
                                this.showLoading = false;
                            }
                        }); 
                    }
                }
                else {
                    // we're re-mapping so no need to make the other API calls
                    this.company_service.getCoAMap().subscribe(
                        data => {                        
                                // assign all data into the array
                                this.prepareMapData(data);
                                this.showLoading = false;
                        }              
                    );        
                }
            }
        );        
    }

    ngOnInit() {

    }

    /**
     * Map the selected values 
     * 
     * @param index 
     * @param event 
     * @param options 
     */
    changeMap(index, event, options) {
        let tag_id = event;

        for (let i = 0; i < options.length; i++) {
            if (options[i].tag_id == tag_id) {
                this.fields[index].espresso_account_id = tag_id;
                this.fields[index].espresso_account_name = options[i].description;
            }
        }
    }

    // prepares the data the comes back from the server for display. This is a quick and dirty fix to workaround an issue we ran into on the backend.
    // we will resolve in phase 2. #todo
    prepareMapData(data) {
        // sort
        this.fields = data.sort(function(a,b) {                                                
                        if(a.cust_account_name == b.cust_account_name)
                            return 0;
                        if(a.cust_account_name < b.cust_account_name)
                            return -1;
                        if(a.cust_account_name > b.cust_account_name)
                            return 1;
                    });

        // add original index so when we group them we still know where to update in the orginal fields array.
        for(var i = 0; i < this.fields.length; i++) {            
            this.fields[i]["model_index"] = i;        
        }

        // group by tag_group
        for(var i = 0; i < this.fields.length; i++) {
            if(this.fields[i].tag_group == 'asset') {
                this.assets.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'liability') {
                this.liabilities.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'equity') {
                this.equity.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'income') {
                this.income.push(this.fields[i]);
            }
            else if(this.fields[i].tag_group == 'expense') {
                this.expenses.push(this.fields[i]);
            }
        }                
    }
    
    /**
     * Submit entery and folow next step
     */
    submitEntry() {
        this.showLoading = true;
                
        //remove unwanted fields 
        let params = [];
        for (let i of this.fields) {
            //push into the parameters
            params.push({
                "company": i.company,
                "cust_account_id": i.cust_account_id,
                "cust_account_name": i.cust_account_name,
                "espresso_account_id": i.espresso_account_id,
                "espresso_account_name": i.espresso_account_name
            });
        }

        //Post request to the CoAMaP api
        this.loadingMessage = "<p>Saving your Chart of Accounts Matching</p>";
        this.company_service.postCoAMap(params).subscribe(data => {
            if (data) {
                this.ifSuccess = true;
                if(!this.remap) {
                    this.loadingMessage = '<p>Loading your Trial Balance</p>';
                    this.company_service.getTrialBalance().subscribe(
                        response => {
                            // console.log(response)
                            this.loadingMessage = "<p>Processing your Financials</p><p>Hang tight, this can take up to 20 seconds</p>";
                            this.company_service.getGenerateStatements().subscribe(response => {
                                console.log('########### AS RESPONSE');
                                console.log(response);
                               // redirect to report page
                               this.router.navigate(['coa-match-confirm', this.type]);
                               this.showLoading = false;
                            });
                        }
                    ); 
                }
                else {
                    // generate statement and go to confirmation form 
                    this.company_service.getGenerateStatements().subscribe(response => {
                        console.log('########### AS RESPONSE');
                        console.log(response);
                        // show the confirmation form
                        this.showLoading = false;
                        console.log('############ generating from submit entry statements');
                        this.router.navigate(['coa-match-confirm', this.type]);
                    });
                }
            }
            else {
                this.ifError = true;
                this.showLoading = false;
            }            
        });

    }

    /**
     * Save Exit
     */
    saveExit(){
        let params = {last_page: '/coa-match/' + this.type};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(
            data => {
                this.auth_service.logout();
                this.router.navigate(['/']);
            }
        )        
    }

}
