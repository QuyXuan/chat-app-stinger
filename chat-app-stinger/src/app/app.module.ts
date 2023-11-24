import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { LoginPageComponent } from './components/login-page/login-page.component';
import { SignupPageComponent } from './components/signup-page/signup-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { SideBarComponent } from './components/dashboard/side-bar/side-bar.component';
import { ChatPageComponent } from './components/dashboard/body/chat-page/chat-page.component';
import { BodyComponent } from './components/dashboard/body/body.component';
import { SubLevelMenuComponent } from './components/dashboard/side-bar/sub-level-menu.component';
import { SettingsPageComponent } from './components/dashboard/body/settings-page/settings-page.component';
import { SettingsItemComponent } from './components/dashboard/body/settings-page/settings-item/settings-item.component';
import { NotificationPageComponent } from './components/dashboard/body/notification-page/notification-page.component';

// Firebase config
import { environment } from '../environments/environment';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { getAuth, provideAuth } from '@angular/fire/auth';

// Module dependencies
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateDisplayPipe } from './pipes/date-display/date-display.pipe';
import { DatePipe } from '@angular/common';
import { ThumbnailUploadComponent } from './components/thumbnail-upload/thumbnail-upload.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [
    AppComponent,
    LoginPageComponent,
    SignupPageComponent,
    DashboardComponent,
    SideBarComponent,
    ChatPageComponent,
    BodyComponent,
    SubLevelMenuComponent,
    SettingsPageComponent,
    SettingsItemComponent,
    NotificationPageComponent,
    DateDisplayPipe,
    PageNotFoundComponent,
    ThumbnailUploadComponent,
    FileUploadComponent,
  ],
  imports: [
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    BrowserModule,
    ImageCropperModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    FontAwesomeModule,
    BrowserAnimationsModule,
    NgSelectModule,
    InfiniteScrollModule,
  ],
  providers: [DatePipe],
  bootstrap: [AppComponent],
})
export class AppModule {}
