import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { IonicComponentService } from '../../services/ionic-component.service';
import { Observable, Subscription } from 'rxjs';
import { UserService } from '../../services/user.service';
import { IngestarService } from '../../services/ingestar.service';
//import { HideHeaderConfig } from '../../shared/hide-header.directive';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  public currentRoute: any;
  public parentPath: any;
  public ingesons: any[];
  public services: any[];
  public ingesonRecommended: any[];

  slideOption = {
    slidesPerView: 'auto',
    grabCursor: true,
    mousewheel: {
      invert: true,
    },
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
    public ingestarService: IngestarService,
    private navController: NavController,
    public router: Router,
    private modalController: ModalController,
    private ionicComponentService: IonicComponentService
  ) {}

  ngOnInit() {
    this.ionicComponentService.presentLoading(); // call loading
    this.getServices();
    this.getIngesons();
    this.getRecommendIngeSons();
    this.ionicComponentService.dismissLoading();
    //this.getFavorite();
    //console.log("....Current route path"+this.router.url); //  /routename
    this.parentPath = this.router.url;
    console.log('....Current route path' + this.parentPath);
  }

  getRecommendIngeSons() {
    this.userService.getRecommendIngeSons().subscribe((actionArray) => {
      //console.log("...getCategory="+actionArray);
      this.ingesonRecommended = actionArray;
      console.log(this.ingesonRecommended);
    });
  }

  getIngesons() {
    this.userService.getIngeSons().subscribe((actionArray) => {
      //console.log("...getCategory="+actionArray);
      this.ingesons = actionArray;
    });
  }

  getServices() {
    this.ingestarService.getServices().subscribe((actionArray) => {
      //console.log("...getCategory="+actionArray);
      this.services = actionArray;
    });
  }

  toggleSideMenu() {
    this.ionicComponentService.sideMenu(); //Add this method to your button click function
  }
  openSearchPage() {
    console.log('Search bar');
    this.router.navigateByUrl('/travel-search');
  }
  ngOnDestroy() {
    // no need to destroy subscription
  }
  //permet de rediriger la page vers la liste des ingénieurs du son offrant un service donné//
  openDetail(url, itemId, itemName) {
    this.router.navigateByUrl('/' + url + '/' + itemId + '/' + itemName);
  }
  openIngeSonDetail(url, userprofileId) {
    this.router.navigateByUrl('/' + url + '/' + userprofileId);
  }
}
