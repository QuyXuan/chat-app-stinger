import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SignupPageComponent } from './components/signup-page/signup-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { ChatPageComponent } from './components/dashboard/body/chat-page/chat-page.component';
import { NotificationPageComponent } from './components/dashboard/body/notification-page/notification-page.component';
import { ChatSideComponent } from './components/dashboard/body/chat-page/chat-side/chat-side.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'signup', component: SignupPageComponent },
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
      {
        path: '',
        component: ChatSideComponent,
        outlet: 'side-body',
      },
      {
        path: 'chat-side',
        component: ChatSideComponent,
        outlet: 'side-body',
      },
      {
        path: 'notification',
        component: NotificationPageComponent,
        outlet: 'side-body',
      },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
