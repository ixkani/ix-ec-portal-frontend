import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';
import {CommonService} from "../services/common.service";
import {Router} from '@angular/router';
import {NavigateToScreen} from "../app.constants";
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'login-info',
    templateUrl: '../common/login-info.component.html',
    styles: [
        `
        `
    ]
})
export class LoginInfoComponent implements OnInit{
    username:string;
    companyName:string;
    user:boolean = false;
    constructor(private common: CommonService, private router:Router,
                private appComponent:AppComponent, private auth_servcie: AuthService ){

    }
    ngOnInit() {
        this.username = this.common.getUserName();
        this.companyName = this.common.getCompanyName();
        this.common.disableBrowseBackButton();
    }

    to_change_password(){
        this.router.navigate([NavigateToScreen.change_password])
    }
}