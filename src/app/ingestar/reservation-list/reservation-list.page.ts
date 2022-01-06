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
  selector: 'app-reservation-list',
  templateUrl: './reservation-list.page.html',
  styleUrls: ['./reservation-list.page.scss'],
})
export class ReservationListPage implements OnInit {
  public demandes: any[];
  public prestations: any[];
  currency: any = '€';
  unit_h = 'h';

  constructor(
    public ingestarService: IngestarService,
    public userService: UserService,
    private activatedRoute: ActivatedRoute,
    private navController: NavController,
    public modalController: ModalController,
    public router: Router,
    private ionicComponentService: IonicComponentService
  ) {}

  ngOnInit() {
    this.getDemandeReservations();
    this.getPrestationReservations();
  }
  //Recupere les demandes de reservation faites par l utilisateur
  getDemandeReservations() {
    let userprofileId = this.userService.getUserId();
    this.ingestarService
      .getDemandeReservations(userprofileId)
      .subscribe((result) => {
        console.log('reservations========');
        this.demandes = result;
      });
  }
  //Recupere les demandes de prestations que
  //l'utilisateur ingeson doit honorer
  getPrestationReservations() {
    let userprofileId = this.userService.getUserId();
    this.ingestarService
      .getPrestationReservations(userprofileId)
      .subscribe((actionArray) => {
        this.prestations = actionArray;
      });
  }
}
