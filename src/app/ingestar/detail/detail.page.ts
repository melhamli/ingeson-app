import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonTabs, ModalController, NavController } from '@ionic/angular';
import { IngestarService } from '../../services/ingestar.service';
import { UserService } from '../../services/user.service';
import { Observable, Subscription } from 'rxjs';
import { cpuUsage } from 'process';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicComponentService } from '../../services/ionic-component.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
})
export class DetailPage implements OnInit {
  public userprofileId: any;
  public ingetarifs: any[];
  public ingereviews: any[];
  public userprofile: any;
  public ingeson: any;
  public unit: any;
  transition: boolean = false;
  showToolbar = false;
  showTitle = false;
  public reviewForm: FormGroup;
  public userDetail: any;

  constructor(
    public ingestarService: IngestarService,
    public userService: UserService,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public modalController: ModalController,
    public router: Router,
    private ionicComponentService: IonicComponentService,
    public formBuilder: FormBuilder
  ) {
    //Recupere l'id envoye par une autre page
    this.userprofileId =
      this.activatedRoute.snapshot.paramMap.get('userprofileId');
    this.unit = '€/h';
    this.reviewForm = formBuilder.group({
      note: ['', Validators.compose([Validators.required])],
      message: ['', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.getUserDetail();
    this.getUserProfile(this.userprofileId);
    this.getIngeson(this.userprofileId);
    this.getReviews(this.userprofileId);
    this.getTarifs(this.userprofileId);
  }

  getUserDetail() {
    this.userService.getUserProfile().subscribe((result) => {
      this.userDetail = result;
      console.log(this.userDetail);
    });
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
  async soumettreReview() {
    if (!this.reviewForm.valid) {
      console.log(this.reviewForm.value);
      console.log('invalid form');
    } else {
      this.ionicComponentService.presentLoading();
      console.log(this.reviewForm.value);
      let user_from = this.userDetail.id;
      let user_from_name =
        this.userDetail.firstname + ' ' + this.userDetail.lastname;
      let user_from_image = this.userDetail.image;

      let user_to = this.userprofile.id;
      let ingeson_id = this.ingeson.id;
      //let user_to_name = this.userprofile.firstname + ' ' + this.userprofile.lastname;
      //let user_to_image = this.userprofile.image;

      let message = this.reviewForm.value.message;
      let note = parseInt(this.reviewForm.value.note);
      let total_note = 0;
      let nbreviews = 0;
      this.ingereviews.forEach(function (item, index) {
        if (item.user_from != user_from) {
          total_note += parseInt(item.note);
          nbreviews += 1;
        }
      });
      console.log('Value');
      console.log(total_note);
      console.log(nbreviews);

      total_note = total_note + note;
      let avg_note = parseInt(
        Math.floor(
          parseFloat(total_note.toString()) /
            parseFloat((nbreviews + 1).toString())
        ).toFixed()
      );
      await this.ingestarService
        .addReview(
          user_from,
          user_from_name,
          user_from_image,
          user_to,
          note,
          message,
          avg_note,
          ingeson_id
        )
        .then(
          () => {
            this.ionicComponentService.dismissLoading();
            this.ionicComponentService.presentToastWithOptions(
              'Notification',
              'notifications-outline',
              '',
              'Review enregistre avec succes',
              'top',
              9000
            );
            this.router.navigateByUrl('/home');
          },
          (error) => {
            var errorMessage: string = error.message;
            this.ionicComponentService.dismissLoading();
            this.ionicComponentService.presentAlert(errorMessage);
          }
        );
    }
  }
}
