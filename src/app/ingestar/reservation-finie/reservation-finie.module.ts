import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReservationFiniePageRoutingModule } from './reservation-finie-routing.module';

import { ReservationFiniePage } from './reservation-finie.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReservationFiniePageRoutingModule
  ],
  declarations: [ReservationFiniePage]
})
export class ReservationFiniePageModule {}
