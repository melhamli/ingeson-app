import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  ModalController,
  NavParams,
  NavController,
  IonSearchbar,
} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { IonicComponentService } from '../../services/ionic-component.service';
@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  // angular 8 :https://stackoverflow.com/questions/56704164/angular-viewchild-error-expected-2-arguments-but-got-1
  @ViewChild('searchbar', { static: false }) searchbar: IonSearchbar;
  public resultList: any[];
  public loadedResultList: any[];

  constructor(
    private firestore: AngularFirestore,
    public userService: UserService,
    private modalController: ModalController,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public router: Router,
    private ionicComponentService: IonicComponentService
  ) {}
  async close() {
    await this.modalController.dismiss();
  }

  async openPlaceDetail(userprofileId) {
    console.log('userprofileId' + userprofileId);
    this.ionicComponentService.presentLoading();
    await this.modalController.dismiss();
    //this.router.navigateByUrl('/side-menu/travel/tabs/tab1/travel-place-detail/'+placeId);
    this.router.navigateByUrl('/detail/' + userprofileId);
    this.ionicComponentService.dismissLoading();
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  ngOnInit() {
    console.log('--------------first time loaded-------------');
    this.userService.getIngeSons().subscribe((results) => {
      console.log(results);
      this.loadedResultList = results;
    });

    let timeoutID = setTimeout(() => {
      this.searchbar.setFocus();
      console.log('setFocus()=======');
      clearTimeout(timeoutID);
    }, 200);
  }

  initializeItems(): void {
    console.log('call initialize');
    this.resultList = this.loadedResultList;
  }

  filterList(evt) {
    console.log('call filter');
    this.initializeItems();
    const searchTerm = evt.srcElement.value;
    console.log('search value=' + searchTerm);
    if (!searchTerm) {
      console.log('return>>>>');
      this.resultList = [];
      return;
    }
    this.resultList = this.resultList.filter((res) => {
      console.log(res.adresse);
      if (
        res.userProfile.firstname &&
        res.userProfile.lastname &&
        res.adresse &&
        searchTerm
      ) {
        if (
          res.userProfile.firstname
            .toLowerCase()
            .indexOf(searchTerm.toLowerCase()) > -1 ||
          res.userProfile.lastname
            .toLowerCase()
            .indexOf(searchTerm.toLowerCase()) > -1 ||
          res.adresse.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
        ) {
          return true;
        }
        return false;
      } else {
        return false;
      }
    });
  }
}
