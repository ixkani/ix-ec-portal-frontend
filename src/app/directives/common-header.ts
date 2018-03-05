import {Component, OnInit} from '@angular/core';
import {AppComponent} from '../app.component';
import {CommonService} from "../services/common.service";
import {Router} from '@angular/router';
import {NavigateToScreen} from "../app.constants";
import {AuthService} from "../services/auth.service";

@Component({
    selector: 'static-header',
    templateUrl: '../common/common-header.component.html',
    styles: [
        `
        `
    ]
})
export class CommonHeaderComponent implements OnInit{
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
    show() {
        this.user = !this.user;
    }

    to_change_password(){
        this.router.navigate([NavigateToScreen.change_password])
    }

    logOut() {
        this.appComponent.reset();
        this.auth_servcie.logout();
        this.router.navigate(['/']);
    }
}