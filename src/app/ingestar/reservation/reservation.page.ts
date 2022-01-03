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
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
})
export class ReservationPage implements OnInit {
  public userprofileId: any;
  public ingetarifs: any[];
  public ingeson: any;
  public userprofile: any;
  public unit: any;
  public reservationForm: FormGroup;
  public grandTotal: any;
  public currency: any;

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
    this.grandTotal = 0;
    this.currency = '€';
    this.reservationForm = formBuilder.group({
      service: ['', Validators.compose([Validators.required])],
      reservation_date: ['', Validators.compose([Validators.required])],
      nbhours: ['', Validators.compose([Validators.required])],
    });
  }

  ngOnInit() {
    this.getIngeson(this.userprofileId);
    this.getUserProfile();
    this.getTarifs(this.userprofileId);
  }

  getIngeson(userprofileId) {
    this.ingestarService.getUserProfile(userprofileId).subscribe((result) => {
      this.ingeson = result;
      console.log(this.ingeson);
    });
  }

  getUserProfile() {
    this.userService.getUserProfile().subscribe((result) => {
      this.userprofile = result;
      console.log(this.userprofile);
    });
  }

  getTarifs(userprofileId) {
    this.ingestarService.getTarifs(userprofileId).subscribe((actionArray) => {
      this.ingetarifs = actionArray;
    });
  }

  calculateTotal(event) {
    let service = this.reservationForm.value.service;
    let serviceDetails = service.split('_');
    let tarif = serviceDetails[1];
    let nbhours = this.reservationForm.value.nbhours;
    if (nbhours && nbhours > 0 && service != '') {
      this.grandTotal = nbhours * tarif;
    }
  }

  async soumettreReservation() {
    if (!this.reservationForm.valid) {
      console.log(this.reservationForm.value);
      console.log('invalid form');
    } else {
      this.ionicComponentService.presentLoading();
      console.log(this.reservationForm.value);
      let userprofile_id = this.userprofile.id;
      let user_profile_name =
        this.userprofile.firstname + ' ' + this.userprofile.lastname;
      let user_profile_image = this.userprofile.image;
      let ingeson_id = this.ingeson.id;
      let ingeson_name = this.ingeson.firstname + ' ' + this.ingeson.lastname;
      let ingeson_image = this.ingeson.image;
      let nbheure = parseInt(this.reservationForm.value.nbhours);
      let date_res = this.reservationForm.value.reservation_date;
      let service = this.reservationForm.value.service;
      let serviceDetails = service.split('_');
      let service_id = serviceDetails[0];
      let service_tarif = serviceDetails[1];
      let total_amount = this.grandTotal;
      await this.ingestarService
        .saveReservation(
          userprofile_id,
          user_profile_name,
          user_profile_image,
          ingeson_id,
          ingeson_name,
          ingeson_image,
          nbheure,
          date_res,
          service_id,
          service_tarif,
          total_amount
        )
        .then(
          () => {
            this.ionicComponentService.dismissLoading();
            this.router.navigateByUrl('/reservation-finie');
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
