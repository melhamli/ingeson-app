import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

import { MenuController, Platform, ToastController } from '@ionic/angular';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Storage } from '@ionic/storage';
import { UserService } from './services/user.service';
import { IonicComponentService } from './services/ionic-component.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public selectedIndex = 0;
  public appPages = [];
  public labels = [];

  //**************************************//
  //********** UI layout pages **********//
  //*************************************//
  //Menu pour un utilisateur qui n'est pas connecte
  layoutPagesDafault = [
    {
      title: 'Se connecter',
      url: 'fire-signin',
      icon: 'person',
    },

    {
      title: "S'enregister",
      url: 'fire-signup',
      icon: 'person',
    },
  ];
  //Menu pour un utilisateur qui est connecte
  layoutPagesLogged = [
    {
      title: 'Accueil',
      url: '/home',
      icon: 'home',
    },

    {
      title: 'Reservations',
      url: '/reservation-list',
      icon: 'mail',
    },

    {
      title: 'Mettre a jour le profil',
      url: 'fire-profile',
      icon: 'person',
    },
  ];
  layoutPages = [];

  dark = false;
  //**** User authentication  ****/
  //Une variable permettant si l'utilisateur est connnecte ou pas
  loggedIn = false; // Is user logged in ?
  userId: any;

  constructor(
    private menu: MenuController,
    private platform: Platform,
    private router: Router,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: Storage,
    public userService: UserService,
    private toastCtrl: ToastController,
    private ionicComponentService: IonicComponentService,
    private fireAuth: AngularFireAuth
  ) {
    this.initializeApp();
    this.layoutPages = this.layoutPagesDafault;
    //Verifier si l'utilisateur est connecte ou pas
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        this.loggedIn = true;
        this.layoutPages = this.layoutPagesLogged;
      } else {
        this.loggedIn = false;
        this.layoutPages = this.layoutPagesDafault;
      }
    });
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }
  async ionViewWillEnter() {}

  ngOnInit() {
    const path = window.location.pathname.split('folder/')[1];
    if (path !== undefined) {
      this.selectedIndex = this.appPages.findIndex(
        (page) => page.title.toLowerCase() === path.toLowerCase()
      );
    }
    this.userService.getAuthState().then((res) => {
      this.loggedIn = res;
      if (this.loggedIn) {
        this.layoutPages = this.layoutPagesLogged;
      } else {
        this.layoutPages = this.layoutPagesDafault;
      }
    });
  }
  async logout() {
    await this.userService.signoutUser().then(
      () => {
        console.log('LOGOUT');
        this.ionicComponentService.presentTimeoutLoading(1000, true);
        this.ionicComponentService.presentToastWithOptions(
          'Notification',
          'notifications-outline',
          '',
          'Vous êtes déconnecté',
          'top',
          9000
        );
        this.layoutPages = this.layoutPagesDafault;
        this.loggedIn = false;
        this.menu.close();
        //this.ionicComponentService.presentToast("Logout",1000);
        this.router.navigateByUrl('fire-signin');
        //loadingPopup.dismiss();
        //this.nav.setRoot('AfterLoginPage');
      },
      (error) => {
        var errorMessage: string = error.message;
        this.ionicComponentService.presentToast(errorMessage, 3000);
        console.log('ERROR:' + errorMessage);
      }
    );
  }
}
