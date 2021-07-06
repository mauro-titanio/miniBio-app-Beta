import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }
  login() {
    console.log("login")
    this.authService.googleAuth().then(success => {
      this.router.navigate(['/dashboard'])
    }).catch(error => {
      console.error("Error en el login")
    })
  }




}
