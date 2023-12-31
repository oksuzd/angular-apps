import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { UserDataResponse, UserResponse } from "../models/response.model";
import { BehaviorSubject, map, mergeMap, Observable, of, take } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { REQUEST_URL } from "../shared/constants";
import { UserLogin, userToken } from "../models/login.model";
import { User } from "../models/user.model";
import { CookieService } from "ngx-cookie-service";

@Injectable({providedIn: 'root'})
export class UserDataService {

  private _isLoggedInUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.cookie.check('user'));
  readonly isLoggedInUser$: Observable<boolean> = this._isLoggedInUser.asObservable();

  constructor(
    private http: HttpClient,
    private cookie: CookieService,
    public dialog: MatDialog
  ) {}

  getUsers(): Observable<User[]> {
    return this.http.get<UserResponse>(REQUEST_URL + 'users')
      .pipe(map((res) => this.getMappedUsers(res.data)))
  }

  createUser(user: User): Observable<User> {
    return of({
      ...user,
      id: Math.floor(Math.random() * 100),
      avatar: 'https://i.pravatar.cc/64'
    })
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(REQUEST_URL + `users/${user.id}`, user);
  }

  deleteUser(id: number): Observable<boolean> {
    return this.http.delete<boolean>(REQUEST_URL + `users/${id}`);
  }

  logInUser(user: UserLogin): Observable<userToken> {
    return this.http.post<userToken>(REQUEST_URL + 'login', user);
  }

  setUserLoginStatus(status: boolean) {
    this._isLoggedInUser.next(status);
  }

  isEmailTaken(email: string): Observable<boolean> {

    let isEmailExist = false;

    return this.getUsers()
      .pipe(
        take(1),
        mergeMap((res) => {
          res.forEach((user) => {
            if (email === user.email) {
              isEmailExist = true;
            }
          })
          return of(isEmailExist)
        })
      )
  }

  private getMappedUsers(users: UserDataResponse[]): User[] {
    return users.map((user) => {
      return {
        id: user.id,
        avatar: user.avatar,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      }
    })
  }
}
