import {BrowserModule} from '@angular/platform-browser';
import {NgModule, Injectable} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule, Routes, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FileUploadModule } from 'ng2-file-upload';
import { FileDropModule } from 'ngx-file-drop/lib/ngx-drop';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

import {AuthService} from './services/auth.service';
import {CompanyService} from './services/company.service';
import {ReportingService} from './services/reporting.service';
import {SignoffService} from './services/signoff.service';

import {AppComponent} from './app.component';
import {LoginComponent} from './pages/login/login.component';
import {IntroComponent} from './pages/intro/intro.component'
import {HeaderComponent} from './header/header.component';
import {FooterComponent} from './footer/footer.component';
import {SyncComponent} from './pages/sync/sync.component';
import {QuickbookComponent} from './pages/quickbook/quickbook.component';
import {CsvUploadComponent} from './pages/csv-upload/csv-upload.component';
import {FormEntryComponent} from './pages/form-entry/form-entry.component';
import {CoaMatchComponent} from './pages/coa-match/coa-match.component';
import {ReportingComponent} from './pages/reporting/reporting.component';
import {SignoffComponent} from './pages/signoff/signoff.component';
import {ThanksComponent} from './pages/thanks/thanks.component';
import {DashboardComponent} from './pages/dashboard/dashboard.component';
import {DashboardPreviousReportComponent} from './pages/dashboard-previous-report/dashboard-previous-report.component';
import {DashbordSignoffPreviousReportComponent} from './pages/dashbord-signoff-previous-report/dashbord-signoff-previous-report.component';
import { LogoutComponent } from './pages/logout/logout.component';
import { OrderbydatePipe } from './pipes/orderbydate.pipe';
import { KeysPipe} from './pipes/keys.pipe';
import {Search} from './pages/dashboard/dashboard.component';
import { GroupByPipe} from './pipes/group-by.pipe';
import { ValueByPipe } from './pipes/value-by.pipe';
import { QuickbookDesktopComponent } from './pages/quickbook-desktop/quickbook-desktop.component';
import { AdminCompanySerachComponent } from './pages/admin-company-serach/admin-company-serach.component';
import { Searchfilter } from './pages/admin-company-serach/admin-company-serach.component';
import { AdminPreviousReportComponent } from './pages/admin-previous-report/admin-previous-report.component';
import { AdminPreviousReportDetailComponent } from './pages/admin-previous-report-detail/admin-previous-report-detail.component';
import { AdminCompanyDashboardComponent } from './pages/admin-company-dashboard/admin-company-dashboard.component';
import { CoaMatchmakingConfirmComponent } from './pages/coa-matchmaking-confirm/coa-matchmaking-confirm.component';

import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';

/**
 * Add authentication middleware for route 
 * 
 */
@Injectable()
export class CanActivateViaAuthGuard implements CanActivate {

    constructor(private authService: AuthService, private router: Router) {}
    canActivate() {
        console.log('i am checking to see if you are logged in');
        if (this.authService.isLoggedIn()) {
            return true;
        } else {
            this.router.navigate(['/']);
            return false;
        }
    }
}



/**
 * Define route with the associated components
 */
const appRoutes: Routes = [
    {path: 'login', component: LoginComponent},
    {
        path: 'intro',
        component: IntroComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'sync',
        component: SyncComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'qbook',
        component: QuickbookComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'csv-upload',
        component: CsvUploadComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'form-entry',
        component: FormEntryComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'coa-match/:type',
        component: CoaMatchComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'reporting/:type',
        component: ReportingComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'signoff/:type',
        component: SignoffComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'thanks',
        component: ThanksComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard-prev-report',
        component: DashboardPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'dashboard-signoff-prev-report/:date',
        component: DashbordSignoffPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'quickbook-desktop',
        component: QuickbookDesktopComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'admin-company-search',
        component: AdminCompanySerachComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
     {
        path: 'admin-previous-report/:company_id/:name',
        component: AdminPreviousReportComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
     {
        path: 'admin-previous-report-detail/:company_id/:name/:date',
        component: AdminPreviousReportDetailComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
      {
        path: 'admin-company-dashboard/:company_id/:name',
        component: AdminCompanyDashboardComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
      {
        path: 'coa-match-confirm/:type',
        component: CoaMatchmakingConfirmComponent,
        canActivate: [
            CanActivateViaAuthGuard
        ]
    },
    {
        path: 'logout',
        component: LogoutComponent,
    },
    {path: '**', component: LoginComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        HeaderComponent,
        FooterComponent,
        IntroComponent,
        SyncComponent,
        QuickbookComponent,
        CsvUploadComponent,
        FormEntryComponent,
        CoaMatchComponent,
        ReportingComponent,
        SignoffComponent,
        ThanksComponent,
        DashboardComponent,
        DashboardPreviousReportComponent,
        DashbordSignoffPreviousReportComponent,
        LogoutComponent,
        OrderbydatePipe,
        KeysPipe,
        GroupByPipe,
        ValueByPipe,
        Search,
        Searchfilter,
        QuickbookDesktopComponent,
        AdminCompanySerachComponent,
        AdminPreviousReportComponent,
        AdminPreviousReportDetailComponent,
        AdminCompanyDashboardComponent,
        CoaMatchmakingConfirmComponent,
        
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        BrowserAnimationsModule,
        FileUploadModule,
        FileDropModule,
        RouterModule.forRoot(
            appRoutes,
            {enableTracing: true}
        ),
        BsDatepickerModule.forRoot(),
        LoadingModule.forRoot({
            //animationType: ANIMATION_TYPES.wanderingCubes,
            backdropBackgroundColour: 'rgba(255,255,255,0.9)', 
            backdropBorderRadius: '4px',
            primaryColour: '#0085CA', 
            secondaryColour: '#0085CA', 
            tertiaryColour: '#0085CA'
        })
    ],
    providers: [
        AuthService,
        CompanyService,
        ReportingService,
        SignoffService,
        CanActivateViaAuthGuard,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
