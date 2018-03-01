import {Injectable} from '@angular/core';
import {Http, Response, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import {environment} from '../../environments/environment';

@Injectable()
export class AuthService {
    constructor(private http: Http) {}

    /**
     * Check whether user is logged in or not
     */
    isLoggedIn(): boolean {
        let currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser && currentUser != '') {
            return true;
        }
        return false;
    }

    /**
     * Login Api 
     * @param data 
     */
    login(data) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/json');
        return this.http.post(environment.api.url + '/login/', data, {headers: headers})
            .map((res: Response) => res.json())
            .catch((error: any) => {
                if (error.status === 401) {
                    return error.json();
                } else {
                    Observable.throw(error.json().error || 'Server error');
                }
            });
    }

    logout() {
        // #brad: clear() will clear all for our domain only due to CORS, and will also ensure that any new items added do not have to be maintained here
        localStorage.clear();
        /*localStorage.removeItem('user');
        localStorage.removeItem('company');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');*/
    }


    /**
     * Get access token from the api
     * @param data 
     */
    getToken(data) {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        return this.http.post(environment.api.token_url, data, {headers: headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

    /**
     * Get user role
     * @param data 
     */
    getRole() {
        let headers = new Headers();
        headers.append('Content-Type', 'application/x-www-form-urlencoded');
        headers.append('Authorization', 'Bearer ' + localStorage.getItem('token'));
        return this.http.get(environment.api.url + '/user/me/', {headers: headers})
            .map((res: Response) => res.json())
            .catch((error: any) => Observable.throw(error.json().error || 'Server error'));
    }

}
