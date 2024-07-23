import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public ngFireAuth: AngularFireAuth) { }

  async registerUser(email: string, password: string) {
    return await this.ngFireAuth.createUserWithEmailAndPassword(email, password);
  }

  async loginWithEmailAndPassword(email: string, password: string) {
    return await this.ngFireAuth.signInWithEmailAndPassword(email, password);
  }

  async signOut() {
    return await this.ngFireAuth.signOut();
  }

  async getCurrentUser() {
    return await this.ngFireAuth.currentUser;
  }

  isAuthenticated(): Observable<any> {
    return this.ngFireAuth.authState;
  }
}
