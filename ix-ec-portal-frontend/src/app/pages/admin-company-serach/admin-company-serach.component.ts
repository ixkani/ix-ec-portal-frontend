import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {Router} from '@angular/router';

import {CompanyService} from './../../services';

/**
 * pipe for search by company name
 */

@Pipe({name: 'Searchfilter'})
export class Searchfilter implements PipeTransform {
    transform(value: Array<any>, field: string) {
        if (field == "") {
            return value;
        }
        else {
            var res = [];
            for (var i = 0; i < value.length; i++) {
                var name = value[i].name;
                if (name.search(field) !== -1) {
                    res.push(value[i])
                }
            }
            return res;
        }

    }
}

@Component({
    selector: 'app-admin-company-serach',
    templateUrl: './admin-company-serach.component.html',
    styleUrls: ['./admin-company-serach.component.css']
})
export class AdminCompanySerachComponent implements OnInit {
    companyList: any = [];
    seachText = "";
    showLoading: boolean = true;

    constructor(public router: Router, private company_service: CompanyService) {
        // get all companies
        this.company_service.getCompanyLists().subscribe(data => {
            this.companyList = data;
            this.showLoading = false;
        })

        let params = {last_page: '/admin-company-search'};
        //api call to set the metdata  last page
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log(data)
        })
    }
    /**
     * go to admin previous reports
     */
    goToAdminPreviousReport(company) {

        this.router.navigate(['admin-previous-report', company.id, company.name]);
    }

    ngOnInit() {
    }

    getCompanyBySearchText(text) {
        console.log(text)
        this.company_service.getCompanyBySearchText(text).subscribe(data => {
            this.companyList = data;
        })
    }

}
