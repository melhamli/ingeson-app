import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { UserGuard } from './services/user.guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: 'walkthrough',
    pathMatch: 'full',
  },

  {
    path: 'home',
    loadChildren: () =>
      import('./ingestar/home/home.module').then((m) => m.HomePageModule),
  },

  {
    path: 'list/:serviceId/:serviceName',
    loadChildren: () =>
      import('./ingestar/list/list.module').then((m) => m.ListPageModule),
  },

  {
    path: 'detail/:userprofileId',
    loadChildren: () =>
      import('./ingestar/detail/detail.module').then((m) => m.DetailPageModule),
  },

  {
    path: 'reservation/:userprofileId',
    loadChildren: () =>
      import('./ingestar/reservation/reservation.module').then(
        (m) => m.ReservationPageModule
      ),
  },
  {
    path: 'reservation-finie',
    loadChildren: () =>
      import('./ingestar/reservation-finie/reservation-finie.module').then(
        (m) => m.ReservationFiniePageModule
      ),
  },
  {
    path: 'reservation-list',
    loadChildren: () =>
      import('./ingestar/reservation-list/reservation-list.module').then(
        (m) => m.ReservationListPageModule
      ),
  },

  {
    path: 'search',
    loadChildren: () =>
      import('./ingestar/search/search.module').then((m) => m.SearchPageModule),
  },
  {
    path: 'map',
    loadChildren: () =>
      import('./ingestar/map/map.module').then((m) => m.MapPageModule),
  },

  //**********************************//
  //********** Walkthrought **********//
  //**********************************//

  {
    path: 'walkthrough',
    loadChildren: () =>
      import('./ingestar/walkthrough/walkthrough.module').then(
        (m) => m.WalkthroughPageModule
      ),
  },

  //**********************************************//
  //********* Firebase authentication ************//
  //**********************************************//

  {
    path: 'fire-signin',
    loadChildren: () =>
      import('./firebase-auth/fire-signin/fire-signin.module').then(
        (m) => m.FireSigninPageModule
      ),
  },
  {
    path: 'fire-signup',
    loadChildren: () =>
      import('./firebase-auth/fire-signup/fire-signup.module').then(
        (m) => m.FireSignupPageModule
      ),
  },
  {
    path: 'fire-profile',
    loadChildren: () =>
      import('./firebase-auth/fire-profile/fire-profile.module').then(
        (m) => m.FireProfilePageModule
      ),
    canActivate: [UserGuard],
  },

  {
    path: 'fire-forgot',
    loadChildren: () =>
      import('./firebase-auth/fire-forgot/fire-forgot.module').then(
        (m) => m.FireForgotPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
