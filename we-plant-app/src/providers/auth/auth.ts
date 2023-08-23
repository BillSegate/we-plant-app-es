import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {ConfigProvider} from "../config/config";
import {User} from "../../model/user.model";
// import {JhUserModel} from "../../model/jhUser-model";
import {PouchdbProvider} from "../pouchdb/pouchdb";
import {Observable} from "rxjs/Observable";
import * as jwt_decode from "jwt-decode";

/*
  Generated class for the AuthProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AuthProvider {
  public isLoggedIn: boolean = false;

  constructor(public http: HttpClient,
              public configProvider: ConfigProvider,
              private pouchdbProvider: PouchdbProvider) {
    console.log('Hello AuthProvider Provider');
  }

  registerAnonymousUser(privacy: boolean) {
    return this.http.post<User>(`${this.configProvider.serverUrl}/api/register/autogenerated`, {privacy: privacy})

  }

  login(username: string, password: string) {
    return this.http.post(`${this.configProvider.serverUrl}/api/authenticate`, {
      "password": password,
      "rememberMe": true,
      "username": username
    })
  }

  authenticate(email: string, password: string) {
    return this.http.post(`${this.configProvider.serverUrl}/api/authenticate`,
      {
        "password": password,
        "rememberMe": true,
        "username": email
      });
  }

  signUp(email, firstName,lastName, langKey, password, privacy) {
    const params = new HttpParams().set('Content-Type', 'application/json; charset=utf-8');
    return this.http.post(`${this.configProvider.serverUrl}/api/register/mobile-user`, {
      'email': email,
      'firstName': firstName,
      'lastName': lastName,
      'langKey': langKey,
      'login': email,
      'password': password,
      'privacy': privacy
    }, {params})
  }

  initResetPassword(email) {
    return this.http.post(`${this.configProvider.serverUrl}/api/account/reset-password/init`, email)
  }

  finishResetPassword(key, newPassword) {
    return this.http.post(`${this.configProvider.serverUrl}/api/account/reset-password/finish`, {
      'key': key,
      'newPassword': newPassword
    })
  }

  logout(){
    localStorage.removeItem("user-token");
    localStorage.removeItem('user');
  }

  activeUser(activationCode: string) {
      return this.http.get(`${this.configProvider.serverUrl}/api/activate?key=${activationCode}`)
  }

  deactivateAccount() {
    return this.http.get(`${this.configProvider.serverUrl}/api/deactivate`)
  }

  isAnonimusUser() {
    let user = localStorage.getItem('user');
    return !!user;
  }

  currentUser(): Observable<any> {
    return this.pouchdbProvider.getResource('user')
  }

  isCurrentUserAdmin(){
    let code = jwt_decode(localStorage.getItem('user-token'));
    return code.auth == 'ROLE_ICP_ADMIN'
  }

  account() {
    return this.http.get(`${this.configProvider.serverUrl}/api/account`)
  }
}
