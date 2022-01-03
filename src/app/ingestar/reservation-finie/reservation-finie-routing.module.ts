import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReservationFiniePage } from './reservation-finie.page';

const routes: Routes = [
  {
    path: '',
    component: ReservationFiniePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReservationFiniePageRoutingModule {}
