import {Component, OnInit} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CompanyService, AuthService, SignoffService} from './../../services';
import * as moment from 'moment';

@Component({
    selector: 'app-form-entry',
    templateUrl: './form-entry.component.html',
    styleUrls: ['./form-entry.component.css'],
    providers: [ CompanyService, AuthService, SignoffService ]
})
export class FormEntryComponent implements OnInit {
    balancesheet: any = {};
    incomestatement: any = {};
    date;
    company_meta;
    espressoContacts:any = [];
    // need to set input length limits on the form and make all fields required #todo #brad
    constructor(private company_service: CompanyService, private signoff_service: SignoffService, private router: Router, private auth_service: AuthService) {
        let params = {last_page: '/form-entry'};
        //api call to set the metdata last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            //console.log(data);
            
        });

	// get espresso contact 
	this.company_service.getEspressoContacts().subscribe(
		data => {
		    this.espressoContacts = data;
		}
	 );
        
        console.log('######## form entry constructor meta is');
        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));       
        console.log(this.company_meta);
        this.date = moment(this.company_meta.monthly_reporting_current_period).format('YYYY-MM-DD');
        var period = moment(this.company_meta.monthly_reporting_current_period).format('YYYY-MM');
        console.log('####### MANUAL REPORTING for '+this.date+' '+period);
        
        /*
        var dateObj = this.date;
        VvX4W7NP7oUgRAXBa4USLABDu
        var month = dateObj.getUTCMonth() + 1; //months from 1-12
        var day = dateObj.getUTCDate();
        var year = dateObj.getUTCFullYear();
        if (month.toString().length == 1) {
            var end_date = year + "-0" + month;
        } else {
            var end_date = year + "-" + month;
        }
        */
        
        this.balancesheet = {
            "Period": period,
            "TotalCurrentAssets": 0,
            "TotalAssets": 0,
            "TotalCurrentLiabilities": 0,
            "TotalLiabilities": 0,
            "TotalEquity": 0,
            "TotalLiabilityAndEquity": 0,
            "Cash": 0,
            "AccountReceivables": 0,
            "SREDReceivable": 0,
            "OtherCurrentAssets": 0,
            "FixedAssets": 0,
            "PatentsAndIntangibleAssets": 0,
            "OtherAssets": 0,
            "AccountsPayableAndAccruedLiabilities": 0,
            "BankDebt": 0,
            "OtherCurrentLiabilities": 0,
            "EspressoDebtOutstanding": 0,
            "SeniorSecuredDebt": 0,
            "SubordinatedDebt": 0,
            "ShareholderLoans": 0,
            "DeferredRevenue": 0,
            "OtherLiabilities": 0,
            "ShareAndContributedCapital": 0,
            "MinorityEquityPosition": 0,
            "EquityPositionOfLTDebt": 0,
            "RetainedEarningsLoss": 0,
            "NetIncomeYTD": 0,
            "CreatedTimestamp": new Date(),
            "LastUpdatedTimestamp": new Date(),
            "SourceName": "CustomerProfile",
            "SourceKey": "Prabhu5"
        }
        /* //#brad: removed these because they aren't needed. delete after testing is done.
        "*/

        this.incomestatement = {
            "Ebitda": 0,
            "NetIncome": 0,
            "Period": period,
            "TotalRevenue": 0,
            "GrossProfit": 0,
            "NonRecurringRevenues": 0,
            "RecurringRevenues": 0,
            "CostOfGoodsSold": 0,
            "SalesAndMarketingExpenses": 0,
            "RDGrossMinusExcludingSRED": 0,
            "GA": 0,
            "InterestIncomeExpense": 0,
            "SREDAccrual": 0,
            "IRAPGrantsReceived": 0,
            "DepreciationAndAmortization": 0,
            "OtherIncomeExpenses": 0,
            "CreatedTimestamp": new Date(),
            "LastUpdatedTimestamp": new Date(),
            "SourceName": "CustomerProfile",
            "SourceKey": "Prabhu5"
        }
        
        // reload the saved values
        // todo: back-end should just send expected format so we can do: this.incomestatement = data;
        if(this.company_meta.monthly_reporting_current_period_status == 'IN_PROGRESS') {
            console.log('########## IN PROGRESS MR');
            this.signoff_service.getIncomeCetificateForParticularMonth(this.date).subscribe(
                data => {
                    for(var i = 0; i < data.length; i++) {                                            
                        this.incomestatement[data[i].fse_tag.all_sight_name] = data[i].value;
                    }
                }
            );

            this.signoff_service.getBalanceSheetForParticularMonth(this.date).subscribe(
                data => {
                    for(var i = 0; i < data.length; i++) {
                        this.balancesheet[data[i].fse_tag.all_sight_name] = data[i].value;
                    }
                }
            );             
        }
    }

    /**
     * submit form entry IncomeStatement and BalanceSheet details
     */
    submitForm() {
        var balancesheet = {
            "BalanceSheet": [this.balancesheet]
        }

        var incomestatement = {
            "IncomeStatement": [this.incomestatement]
        }
    
        console.log('########### A BALANCE SHEET sheet is ');
        console.log(JSON.stringify(balancesheet));
        
        this.company_service.sendBalanceSheet(balancesheet).subscribe(data => {           
            this.company_service.sendIncomeStatement(incomestatement).subscribe(res => {
                console.log('########### redirecting to /reporting/formentry');
                this.router.navigate(['reporting', 'form-entry']);
            });
        });

    }
    /**
     * overall calculations performed
     */
    getTotalCurrentassets() {
        this.balancesheet.TotalCurrentAssets = this.balancesheet.Cash + this.balancesheet.AccountReceivables + this.balancesheet.SREDReceivable + this.balancesheet.OtherCurrentAssets;
        this.balancesheet.TotalAssets = this.balancesheet.TotalCurrentAssets + this.balancesheet.PatentsAndIntangibleAssets + this.balancesheet.FixedAssets + this.balancesheet.OtherAssets;
    }

    getTotalAssets() {
        this.balancesheet.TotalAssets = this.balancesheet.TotalCurrentAssets + this.balancesheet.PatentsAndIntangibleAssets + this.balancesheet.FixedAssets + this.balancesheet.OtherAssets;
    }

    getTotalCurrentLiabilities() {
        this.balancesheet.TotalCurrentLiabilities = this.balancesheet.AccountsPayableAndAccruedLiabilities + this.balancesheet.BankDebt + this.balancesheet.OtherCurrentLiabilities + this.balancesheet.DeferredRevenue;
    }

    getTotalLiabilities() {
        this.balancesheet.TotalLiabilities = this.balancesheet.EspressoDebtOutstanding + this.balancesheet.SeniorSecuredDebt + this.balancesheet.SubordinatedDebt + this.balancesheet.ShareholderLoans + this.balancesheet.OtherLiabilities;
        this.balancesheet.TotalLiabilityAndEquity = this.balancesheet.TotalEquity + this.balancesheet.TotalLiabilities;
    }

    getTotalEquity() {
        this.balancesheet.TotalEquity = this.balancesheet.ShareAndContributedCapital + this.balancesheet.MinorityEquityPosition + this.balancesheet.EquityPositionOfLTDebt + this.balancesheet.RetainedEarningsLoss + this.balancesheet.NetIncomeYTD;
        this.balancesheet.TotalLiabilityAndEquity = this.balancesheet.TotalEquity + this.balancesheet.TotalLiabilities;
    }

    getTotalRevenue() {
        this.incomestatement.TotalRevenue = this.incomestatement.NonRecurringRevenues + this.incomestatement.RecurringRevenues;
        this.incomestatement.GrossProfit = this.incomestatement.TotalRevenue - this.incomestatement.CostOfGoodsSold;
        this.incomestatement.Ebitda = this.incomestatement.GrossProfit - (this.incomestatement.SalesAndMarketingExpenses + this.incomestatement.RDGrossMinusExcludingSRED + this.incomestatement.GA);
        this.incomestatement.NetIncome = this.incomestatement.Ebitda + this.incomestatement.InterestIncomeExpense + this.incomestatement.SREDAccrual + this.incomestatement.IRAPGrantsReceived + this.incomestatement.DepreciationAndAmortization + this.incomestatement.OtherIncomeExpenses;
    }

    getGrossProfit() {
        this.incomestatement.GrossProfit = this.incomestatement.TotalRevenue - this.incomestatement.CostOfGoodsSold;
        this.incomestatement.Ebitda = this.incomestatement.GrossProfit - (this.incomestatement.SalesAndMarketingExpenses + this.incomestatement.RDGrossMinusExcludingSRED + this.incomestatement.GA);
        this.incomestatement.NetIncome = this.incomestatement.Ebitda + this.incomestatement.InterestIncomeExpense + this.incomestatement.SREDAccrual + this.incomestatement.IRAPGrantsReceived + this.incomestatement.DepreciationAndAmortization + this.incomestatement.OtherIncomeExpenses;
    }

    getEbitda() {
        this.incomestatement.Ebitda = this.incomestatement.GrossProfit - (this.incomestatement.SalesAndMarketingExpenses + this.incomestatement.RDGrossMinusExcludingSRED + this.incomestatement.GA);
        this.incomestatement.NetIncome = this.incomestatement.Ebitda + this.incomestatement.InterestIncomeExpense + this.incomestatement.SREDAccrual + this.incomestatement.IRAPGrantsReceived + this.incomestatement.DepreciationAndAmortization + this.incomestatement.OtherIncomeExpenses;
    }

    getNetIncome() {
        this.incomestatement.NetIncome = this.incomestatement.Ebitda + this.incomestatement.InterestIncomeExpense + this.incomestatement.SREDAccrual + this.incomestatement.IRAPGrantsReceived + this.incomestatement.DepreciationAndAmortization + this.incomestatement.OtherIncomeExpenses;
    }

    /**
     * Save Exit
     */
    saveExit(){
        var balancesheet = {
            "BalanceSheet": [this.balancesheet]
        }

        var incomestatement = {
            "IncomeStatement": [this.incomestatement]
        }

        let params = {monthly_reporting_current_period_status: 'IN_PROGRESS'};
        //api call to set the metdata last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {         
        });
        
        console.log('########### A BALANCE SHEET sheet is ');
        console.log(JSON.stringify(balancesheet));
        
        this.company_service.sendBalanceSheet(balancesheet).subscribe(data => {           
            this.company_service.sendIncomeStatement(incomestatement).subscribe(res => {
                this.auth_service.logout();
                this.router.navigate(['/']);
                this.router.navigate(['reporting', 'form-entry']);
            });
        });
    }

    ngOnInit() {

    }

}
