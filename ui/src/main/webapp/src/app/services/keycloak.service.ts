import {Injectable} from "@angular/core";
import {Constants} from "../constants";
import {Observable} from "rxjs/Observable";
import {Router} from "@angular/router";
import IKeycloak = KeycloakModule.IKeycloak;

@Injectable()
export class KeycloakService {

    protected auth: any = {};
    protected keyCloak: IKeycloak;

    protected initObservable: Observable<boolean>;

    protected static KEYCLOAK_FILE = 'keycloak.json';
    protected static TOKEN_MIN_VALIDITY_MINUTES = 5;

    public constructor(private _router: Router) {
        console.log('KeycloakService constructor called');
        this.keyCloak = new Keycloak(KeycloakService.KEYCLOAK_FILE);
        this.init({ onLoad: Constants.SSO_MODE })
            .subscribe((isLoggedIn) => {
                this.onLoginSuccess(isLoggedIn);
                console.log('subscribe success', isLoggedIn);
            },
                error => console.error('error', error)
            );
    }

    get username(): String {
        if (this.auth.authz) {
            return this.auth.authz.tokenParsed.name;
        }
    }

    /**
     * Be aware, keycloak doesn't return real promise, but its own implementation.
     * Real promise can be resolved multiple times, but keycloak one just once.
     * This method creates real promise from keycloak one. It should be called on the keycloak promise right away.
     * .success neither or .error should be called on keycloak promise! Use transformed one instead.
     *
     * @param keyCloakPromise
     * @returns {Promise<boolean>}
     */
    protected transformKeycloakPromise(keyCloakPromise: any): Promise<any> {
        return new Promise<boolean>((resolve, error) => {
            keyCloakPromise
                .success((auth) => {
                    console.log('transform promise resolved, ', auth);
                    resolve(auth);
                })
                .error((failure) => {
                    console.log('transform promise error', failure);
                    error(failure)
                });
        });
    }

    protected init(options?): Observable<boolean> {
        let keyCloakPromise = this.keyCloak.init(options);
        let realPromise = this.transformKeycloakPromise(keyCloakPromise);

        realPromise.then(success => console.log('Keycloak promise success', success))
            .catch(error => console.error('Keycloak promise error'));

        this.initObservable = Observable.fromPromise(realPromise);

        return this.initObservable;
    }

    isLoggedIn(): Observable<boolean> {
        return this.initObservable;
    }

    protected onLoginSuccess(isLoggedIn) {
        if (!isLoggedIn) {
            console.log('Login success, not logged in');
            this._router.navigate(['/login']);
        } else {
            console.log('login success, logged in');
            this.auth.loggedIn = true;
            this.auth.authz = this.keyCloak;
            this.auth.logoutUrl =  this.keyCloak.authServerUrl + "/realms/windup/tokens/logout?redirect_uri=" + Constants.AUTH_REDIRECT_URL;

            this.keyCloak.onAuthLogout = function () {
                console.log("Logout event received!");
                this.logout();
            };
            this.keyCloak.onAuthRefreshError = function () {
                console.log("Auth refresh error!");
                this.logout();
            };
        }

        return isLoggedIn;
    }


    login(): Observable<any> {
        this.auth.loggedIn = false;

        let promise = this.keyCloak.login(<KeycloakModule.LoginOptions>{
            redirectUri: Constants.AUTH_REDIRECT_URL
        });

        let realPromise = this.transformKeycloakPromise(promise);
        realPromise
            .then((auth) => this.onLoginSuccess(auth))
            .catch((error) => {
                console.log(error);
            });

        return Observable.fromPromise(realPromise);
    }

    logout() {
        console.log('*** LOGOUT');
        this.auth.authz.logout();
        this.auth.loggedIn = false;
        this.auth.authz = null;
    }

    getToken(): Observable<string> {
        let promise: Promise<string> = new Promise<string>((resolve, reject) => {
            this.isLoggedIn().subscribe(isLoggedIn => {
                    if (isLoggedIn) {
                        this.keyCloak.updateToken(KeycloakService.TOKEN_MIN_VALIDITY_MINUTES)
                            .success(() => resolve(this.auth.authz.token))
                            .error(error => reject(error));
                    } else {
                        reject('User is not authenticated, token is not set');
                    }
                },
                error => reject(error)
            );
        });

        return Observable.fromPromise(promise);
    }
}
