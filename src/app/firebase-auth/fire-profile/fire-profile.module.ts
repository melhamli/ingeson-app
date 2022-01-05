import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FireProfilePageRoutingModule } from './fire-profile-routing.module';

import { FireProfilePage } from './fire-profile.page';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FireProfilePageRoutingModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDDb1UWHdH8F057M2ap5bpgsQKrHve_INg',
      libraries: ['places'],
    }),
  ],
  declarations: [FireProfilePage],
})
export class FireProfilePageModule {}
