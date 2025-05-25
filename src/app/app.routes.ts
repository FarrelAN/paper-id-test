import { Routes } from '@angular/router';
import { UserListComponent } from './pages/user-list/user-list.component';
import { UserDetailsComponent } from './pages/user-details/user-details.component';

export const routes: Routes = [
  { path: 'dashboard', component: UserListComponent, title: 'Dashboard' },

  { path: 'user/:id', component: UserDetailsComponent, title: 'User Details' },

  { path: '**', redirectTo: 'dashboard', pathMatch: 'full' },
];
