import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent  implements OnInit {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {}

  async register() {
    try {
      await this.authService.registerUser(this.email, this.password);
      this.router.navigate(['/login']);  // Navighează la pagina de login după înregistrare
    } catch (error) {
      this.errorMessage = (error as Error).message;
    }
  }

}
