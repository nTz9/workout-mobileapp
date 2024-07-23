import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {

  constructor(private authService: AuthService, private router: Router, private alertController: AlertController) { }

  ngOnInit() {}

  email: string = '';
  password: string = '';


  async login() {
    try {
      await this.authService.loginWithEmailAndPassword(this.email, this.password);
      this.router.navigate(['/calendar']);
    } catch (error) {
      if (error instanceof Error) {
        this.showError(error.message);
      } else {
        this.showError('An unknown error occurred.');
      }
    }
  }

  async showError(message: string) {
    const alert = await this.alertController.create({
      header: 'Login Failed',
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

}
