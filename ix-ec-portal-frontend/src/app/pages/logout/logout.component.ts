import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

import {AuthService} from './../../services/auth.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
  providers: [AuthService]
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router, private auth_servcie: AuthService) {
    // #brad #todo: this function is basically usless since it only clears the localStorage. Look at factoring it out before production
    this.auth_servcie.logout();
    this.router.navigate(['/']);
  }

  ngOnInit() {
  }

}
