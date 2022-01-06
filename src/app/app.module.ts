import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';
import { HttpClientModule } from '@angular/common/http';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';

//******** Angularfire ********/
import { AngularFireModule } from '@angular/fire';

//******* firebase api key ********//
import { environment } from '../environments/environment';

//******* firebase api key ********//
import { AngularFireAuthModule } from '@angular/fire/auth';

//******* firebase firestore ********//
import { AngularFirestoreModule } from '@angular/fire/firestore';

//******* firebase storage ********//
import { AngularFireStorageModule } from '@angular/fire/storage';

// //******** UI_components / modal detail *********/
// import { ModalDetailPageModule } from './ui-components/modal-detail/modal-detail.module';

// //******** ionic4 rating *********/
import { IonicRatingModule } from 'ionic4-rating/dist';

import { AppRoutingModule } from './app-routing.module';
//******* Ingestar page module ********//
import { SearchPageModule } from './ingestar/search/search.module';
import { MapPageModule } from './ingestar/map/map.module';

// geolocation and native-geocoder
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeGeocoder } from '@ionic-native/native-geocoder/ngx';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicRatingModule,
    HttpClientModule,
    IonicModule.forRoot({
      rippleEffect: false,
      mode: 'ios',
    }),
    IonicStorageModule.forRoot(),

    AppRoutingModule,
    SearchPageModule,
    MapPageModule,

    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    NativeGeocoder,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  bootstrap: [AppComponent],
})
export class AppModule {}
