import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { CompanyService } from './../../services';

/* 
   #bradj - it was necessary to declare the CompanyService provider here to ensure the constructor gets called, 
            even though it's already added in app.component.ts @NgModule section. Why??
*/
@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.css'],
  providers: [ CompanyService ]
})
export class IntroComponent implements OnInit {

  constructor(private router: Router, private company_service: CompanyService) {
    // let lets_start = localStorage.getItem('lets_start');
    // if (lets_start == 'true') {
    //   this.router.navigate(['/sync']);
    // }
       let params = {last_page: '/intro'};
        //api call to set the metdata for last page
        console.log('###### in /intro '+localStorage.getItem('company'));
        
        this.company_service.updateCompanyMetadata(params).subscribe(data => {
            console.log('######## meta data response in /intro is ');
            console.log(data);
        });
  }

  ngOnInit() {
  }

  /**
   * Let's get started :)
   */
  letStart() {
     // localStorage.clear();
      
    let params = { accounting_setup_status: 'IN_PROGRESS'};
    //api call to set the metdata 
    this.company_service.updateCompanyMetadata(params).subscribe(data => {
      this.router.navigate(['/sync']);
    });
    
  }

}
