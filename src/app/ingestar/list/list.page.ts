import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabs, ModalController, NavController } from '@ionic/angular';
import { IngestarService } from '../../services/ingestar.service';
import { Observable, Subscription } from 'rxjs';
import { cpuUsage } from 'process';

@Component({
  selector: 'app-list',
  templateUrl: './list.page.html',
  styleUrls: ['./list.page.scss'],
})
export class ListPage implements OnInit {
  public serviceId: any;
  public serviceName: any;
  public ingetarifs: any[];

  constructor(
    public ingestarService: IngestarService,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public modalController: ModalController,
    public router: Router
  ) {
    this.serviceId = this.activatedRoute.snapshot.paramMap.get('serviceId');
    this.serviceName = this.activatedRoute.snapshot.paramMap.get('serviceName');
    //console.log("Get activatedRoute categoryId="+ this.activatedRoute.snapshot.paramMap.get('categoryId'));
    //console.log(this.router.url,"Current URL");
  }

  ngOnInit() {
    this.getingesonByService(this.serviceId);
    //this.getPlace();
  }

  getingesonByService(serviceId) {
    this.ingestarService
      .getingesonByService(serviceId)
      .subscribe((actionArray) => {
        //console.log("...getCategory="+actionArray);
        this.ingetarifs = actionArray;
        console.log(this.ingetarifs);
        console.log('abc');
      });
  }
  openIngeSonDetail(url, userprofileId) {
    this.router.navigateByUrl('/' + url + '/' + userprofileId);
  }
}
