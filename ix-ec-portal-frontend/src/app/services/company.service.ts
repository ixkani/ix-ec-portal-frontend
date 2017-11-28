import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {environment} from '../../environments/environment';
import * as moment from 'moment';


@Injectable()
export class CompanyService {

    company_id;
    headers: Headers = new Headers();
    company_meta;
    espressoContacts
    constructor(private http: Http, private router: Router) {
        this.company_id = localStorage.getItem('company');
        this.headers.append('Content-Type', 'application/json');
        this.headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        this.company_meta = JSON.parse(localStorage.getItem('company_meta'));
    }


    /**
     * Update company data
     * @param data 
     */
    putCompany(data) {
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/', JSON.stringify(data), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * get Company By searcch keyword
     * @param keyword 
     */
    getCompanyBySearchText(text) {
        return this.http.get(environment.api.url + '/company/?name='+text, {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }
    /**
     * Update Company metadata
     * 
     * @param data 
     */
    updateCompanyMetadata(data) {
        console.log('############### update Company Metadata company id is '+this.company_id);
        return this.http.put(environment.api.url + '/company/' + this.company_id + '/companymeta/', JSON.stringify(data), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
    * Get Company metadata
    * 
    * @param data 
    */
    getCompanyMetadata() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/companymeta/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
    * Get Company metadata by company id for admin
    * 
    * @param data 
    */
    getCompanyMetadataByCompanyId(id) {
        return this.http.get(environment.api.url + '/company/' + id + '/companymeta/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * Get the charts of company account
     */
    getChartOfAccounts() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/chartofaccounts/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * Get the espresso company contact
     */
    getEspressoContacts() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/espresso_contact/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * Post the charts of company account file upload
     * @param files 
     */
    postChartOfAccounts(files) {
        let formData: FormData = new FormData();
        let filename;
        console.log('######### CoA File CSV ');
        console.log(files);
        for (let file of files) {
            console.log('######### in postCoA file name is '+file.name);
            formData.append('file', file, file.name);
            filename = file.name;
        }
        let headers = new Headers();
        /** No need to include Content-Type in Angular 4 */
        headers.append('Content-Type', 'multipart/form-data');
        //headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        headers.append('Content-Disposition', 'attachment; filename=' + filename);
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/chartofaccounts/', formData, {headers: headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }


    /**
     * Get the trial balance of the company
     */
    getTrialBalance() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/trialbalance/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * Get CoA map
     */
    getCoAMap() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/coamap/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * Create new CoA Map
     * @param data 
     */
    postCoAMap(data) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/coamap/', JSON.stringify(data), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }


    /**
     * Get generate statement 
     */
    getGenerateStatements() {
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/generatestatements/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }
    
    // #brad #todo: these next 4 functions are very repetative and should be refactored.
    /**
     * get IncomeStatement Of LastMonths By CompanyId for admin
     * @param companyid 
     */
    getIncomeStatementOfLastMonthsByCompanyId(id) {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');
        
        return this.http.get(environment.api.url + '/company/' + id + '/accounting/incomestatement/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})      
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
    * get IncomeStatement Of LastMonths By CompanyId for admin
    * @param companyid 
    */
    getBalanceStatementOfLastMonthsByCompanyId(id) {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        console.log(curr_period);
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');        
        
        return this.http.get(environment.api.url + '/company/' + id + '/accounting/balancesheet/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})        
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }


    /**
     * get income statement of last 24 months for dashboard
     */
    getIncomeStatementOfLastMonths() {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);

        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');
        
        console.log('############### getLastStatementOfLastMonths '+start_date+' '+end_date);
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})      
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * get iBalanceStatement of last 24 months for dashboard
     */
     // #todo this should be called Balance SHEET not STATEMENT. rename
    getBalanceStatementOfLastMonths() {
        // get from current period from meta, this will be the end_date since no data will have been reported beyond this date
        let curr_period = moment(this.company_meta.monthly_reporting_current_period);
        
        // set end_date first before changing curr_period to set start_date
        let end_date = curr_period.format('YYYY-MM-DD');
        let start_date = curr_period.subtract(24, 'months').endOf('month').format('YYYY-MM-DD');        
        
        console.log('######## GETTING B/S for '+start_date+' '+end_date);
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/?start_date=' + start_date + '&end_date=' + end_date, {headers: this.headers})        
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * get monthly report list
     * #brad #todo: this function needs to be renamed to getMonthlyReportList(). There is also a getMonthlyReport function in reporting services that needs to
     *              be renamed because it's getting the monthly reporting questionairre, and not dealing with the monthlyreport model like this one is.
     */
    getMonthlyReport() {
        // #brad this will get all monthly reports, is that desired?
        return this.http.get(environment.api.url + '/company/' + this.company_id + '/monthlyreport/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /**
     * get company list for admin search
     */
    getCompanyLists() {
        return this.http.get(environment.api.url + '/company/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /***
     * get company previous reports for admin
     * @param companyid 
     */
    getMonthlyReportByCompany(companyid) {
        return this.http.get(environment.api.url + '/company/' + companyid + '/monthlyreport/', {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /** 
     * save balance sheet
     * 
     */
    sendBalanceSheet(balancesheet) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/balancesheet/', JSON.stringify(balancesheet), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }

    /** 
     * save incomestatement
     * 
     */
    sendIncomeStatement(incomestatement) {
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/incomestatement/', JSON.stringify(incomestatement), {headers: this.headers})
            .map((res: Response) => res.json())
            .catch(this.errorHandler);
    }
    /**
     *  post for trail balance file upload
     * @param files
     */
    postTrialBalance(files) {
        let formData: FormData = new FormData();
        let filename;
        console.log('######### TB File CSV ');
        console.log(files);
        for (let file of files) {
            console.log('######### in postTB file name is '+file.name);
            formData.append('file', file, file.name);
            filename = file.name;
        }
        let headers = new Headers();
        /** No need to include Content-Type in Angular 4 */
        headers.append('Content-Type', 'multipart/form-data');
        //headers.append('Accept', 'application/json');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        headers.append('Content-Disposition', 'attachment;filename=' + filename);
        
        return this.http.post(environment.api.url + '/company/' + this.company_id + '/accounting/trialbalance/', formData, {headers: headers})
            .map(res => res.json())
            .catch(error => Observable.throw(error));
    }

    errorHandler(error: Response) {
        // if (error.status === 503) {
        // localStorage.removeItem('user');
        // localStorage.removeItem('company');
        // localStorage.removeItem('token');
        // localStorage.removeItem('refresh');
        // return [{ message: 'redirecting to login' }];
        // }
        if (error.status === 400) {
            return [{message: error.json().message}];
        }
        if (error) {
            if (error.json().error) {
                Observable.throw(error.json().error || 'Server error');
            }
        }
        return Observable.throw('Server error');
    }
}
