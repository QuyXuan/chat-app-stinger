import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PeopleRoutingModule } from './people-routing.module';
import { PeoplePageComponent } from './people-page.component';
import { PendingFriendsPageComponent } from './pending-friends-page/pending-friends-page.component';
import { NewFriendsPageComponent } from './new-friends-page/new-friends-page.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
    PeoplePageComponent,
    PendingFriendsPageComponent,
    NewFriendsPageComponent,
  ],
  imports: [
    CommonModule,
    PeopleRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
  ],
})
export class PeopleModule {}
