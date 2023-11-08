import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { authGuard } from './guards/auth.guard';
import { loginAuth } from './guards/login-auth.guard';

// Components
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SignupPageComponent } from './components/signup-page/signup-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { ChatPageComponent } from './components/dashboard/body/chat-page/chat-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent, canActivate: [loginAuth] },
  { path: 'signup', component: SignupPageComponent, canActivate: [loginAuth] },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: ChatPageComponent,
        outlet: 'body',
      },
      {
        path: 'chat',
        component: ChatPageComponent,
        outlet: 'body',
      },
      {
        path: 'people',
        loadChildren: () =>
          import('./components/dashboard/body/people-page/people.module').then(
            (m) => m.PeopleModule
          ),
        outlet: 'body',
      },
    ],
  },
  { path: 'not-found', component: PageNotFoundComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Nếu không khớp với tất cả route trên thì điều hướng đến trang NotFound
  { path: '**', redirectTo: '/not-found', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
