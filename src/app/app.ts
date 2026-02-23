import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  constructor(private router: Router) {}

  isLoggedIn(): boolean {
    if (this.router.url === '/login' || this.router.url === '/') {
      return false;
    }
    return !!localStorage.getItem('token');
  }
}
