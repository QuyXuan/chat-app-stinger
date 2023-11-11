import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PeoplePageComponent } from './people-page.component';
import { PendingFriendsPageComponent } from './pending-friends-page/pending-friends-page.component';
import { NewFriendsPageComponent } from './new-friends-page/new-friends-page.component';

const routes: Routes = [
  {
    path: 'list-my-friends',
    component: PeoplePageComponent,
  },
  {
    path: 'list-pending-friends',
    component: PendingFriendsPageComponent,
  },
  {
    path: 'list-new-friends',
    component: NewFriendsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PeopleRoutingModule {}
