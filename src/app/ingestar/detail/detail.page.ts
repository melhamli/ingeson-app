import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabs, ModalController, NavController } from '@ionic/angular';
import { IngestarService } from '../../services/ingestar.service';
import { Observable, Subscription } from 'rxjs';
import { cpuUsage } from 'process';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  public userprofileId: any;
  public ingetarifs: any[];
  public ingereviews: any[];
  public userprofile: Observable<any>;
  public ingeson: Observable<any>;
  public unit: any;
  transition: boolean = false;
  showToolbar = false;
  showTitle = false;

  constructor(
    public ingestarService: IngestarService,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public modalController: ModalController,
    public router: Router
  ) {
    //Recupere l'id envoye par une autre page
    this.userprofileId =
      this.activatedRoute.snapshot.paramMap.get('userprofileId');
    this.unit = '€/h';
  }

  ngOnInit() {
    this.getUserProfile(this.userprofileId);
    this.getIngeson(this.userprofileId);
    this.getReviews(this.userprofileId);
    this.getTarifs(this.userprofileId);
  }

  getUserProfile(userprofileId) {
    this.ingestarService.getUserProfile(userprofileId).subscribe((result) => {
      this.userprofile = result;
      console.log(this.userprofile);
    });
  }

  getIngeson(userprofileId) {
    this.ingestarService.getIngeson(userprofileId).subscribe((result) => {
      this.ingeson = result[0];
      console.log(this.ingeson);
    });
  }

  getReviews(userprofileId) {
    this.ingestarService.getReviews(userprofileId).subscribe((actionArray) => {
      this.ingereviews = actionArray;
      console.log(this.ingereviews);
    });
  }

  getTarifs(userprofileId) {
    this.ingestarService.getTarifs(userprofileId).subscribe((actionArray) => {
      this.ingetarifs = actionArray;
    });
  }

  onScroll($event: CustomEvent) {
    if ($event && $event.detail && $event.detail.scrollTop) {
      const scrollTop = $event.detail.scrollTop;
      this.transition = true;
      this.showToolbar = scrollTop >= 20;
      //console.log("showToolbar="+this.showToolbar);
      this.showTitle = scrollTop >= 20;
      //console.log("showTitle="+this.showTitle);
    } else {
      this.transition = false;
    }
  }
  reserver() {
    this.router.navigateByUrl('/reservation/' + this.userprofileId);
  }
}
