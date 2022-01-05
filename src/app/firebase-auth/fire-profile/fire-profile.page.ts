import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  NgZone,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { MenuController, NavController } from '@ionic/angular';
import { IonicComponentService } from '../../services/ionic-component.service';

import { UserService } from '../../services/user.service';
import { IngestarService } from '../../services/ingestar.service';
import { Observable } from 'rxjs';
import { MapsAPILoader, AgmMap } from '@agm/core';

@Component({
  selector: 'app-fire-profile',
  templateUrl: './fire-profile.page.html',
  styleUrls: ['./fire-profile.page.scss'],
})
export class FireProfilePage implements OnInit {
  userAuth: boolean = false; // Is user logged in ?
  userDetail: Observable<any>;
  ingeson: any;
  public updateForm: FormGroup;
  public userprofileId: any;

  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  ingeson_id: string;
  public services: any[];
  public ingetarifs: any[];
  public tarifservices: any[] = [];

  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;

  constructor(
    public userService: UserService,
    public ingestarService: IngestarService,
    public menuCtrl: MenuController,
    private navController: NavController,
    public router: Router,
    private ionicComponentService: IonicComponentService,
    //private modalController: ModalController
    public formBuilder: FormBuilder,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
  ) {
    let EMAIL_REGEXP =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

    // Tips: If you can't bind to 'formGroup' since it isn't a known property of 'form'.
    //  ******Don't forgot to import FormsModule and ReactiveFormsModule into your <page-name>.module.ts and then add them to the imports array.
    // https://stackoverflow.com/questions/39152071/cant-bind-to-formgroup-since-it-isnt-a-known-property-of-form
    // https://stackoverflow.com/questions/53130244/cant-bind-to-formgroup-in-angular-7

    this.updateForm = formBuilder.group({
      firstname: [
        '',
        Validators.compose([Validators.minLength(3), Validators.required]),
      ],
      lastname: [
        '',
        Validators.compose([Validators.minLength(3), Validators.required]),
      ],
      email: [
        '',
        Validators.compose([Validators.minLength(0), Validators.required]),
      ],
      phone: [
        '',
        Validators.compose([Validators.minLength(0), Validators.required]),
      ],
      about: [
        '',
        Validators.compose([Validators.minLength(3), Validators.required]),
      ],
    });
  }

  ngOnInit() {
    //this.ionicComponentService.presentLoading(); // call loading
    //load Places Autocomplete
    //
    this.mapsAPILoader.load().then(() => {
      //this.setCurrentLocation();
      this.geoCoder = new google.maps.Geocoder();

      let autocomplete = new window['google']['maps']['places']['Autocomplete'](
        this.searchElementRef.nativeElement,
        {
          types: ['address'],
        }
      );
      //Lorsque l'utilisateur tape alors on lance la recherche
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });
    });
    //this.getServices();
    this.userService.getUserProfile().subscribe((res) => {
      let userProfileId = res.id;
      this.userprofileId = userProfileId;
      console.log('test---------------');
      console.log(userProfileId);
      this.ingestarService.getIngeson(userProfileId).subscribe((res) => {
        this.ingeson = res[0];
        this.ingeson_id = this.ingeson.id;
        let about = this.ingeson.about;
        this.updateForm.patchValue({
          about: about,
        });
        this.latitude = parseFloat(this.ingeson.latitude);
        this.longitude = parseFloat(this.ingeson.longitude);
        this.address = this.ingeson.adresse;
        this.getAddress(this.latitude, this.longitude);
        this.getTarifs(this.userprofileId);
      });
    });
    this.ionicComponentService.presentTimeoutLoading(1000, true);
  }

  getServices() {
    this.ingestarService.getServices().subscribe((actionArray) => {
      //console.log("...getCategory="+actionArray);
      this.services = actionArray;
    });
  }

  getTarifs(userprofileId) {
    //Recuperer tous les tarifs fixes par l'utilisateur
    this.ingestarService.getTarifs(userprofileId).subscribe((actionArray) => {
      this.ingetarifs = actionArray;
      console.log('ingetarifs');
      console.log(this.ingetarifs);
      //Recuperer tous les services du systeme et faire un loop pour initialiser
      //pour chaque service le tarif fixe par l utilisateur
      this.ingestarService.getServices().subscribe((actionArray) => {
        this.services = actionArray;
        this.tarifservices = [];
        this.services.forEach((service) => {
          let tarif = 0;
          //verifier si l'utilisateur a donne un tarif au service actuel "service"
          this.ingetarifs.forEach((ingetarif) => {
            if (ingetarif.service_id == service.id) {
              tarif = ingetarif.tarif;
            }
          });
          //Create un json de service avec l'information sur le tarif fixe par l utilissateur pour
          // ce service
          this.tarifservices.push({
            service_id: service.id,
            service_name: service.title,
            tarif: tarif,
          });
        });
      });
    });
  }

  getValue(evt, service_id) {
    //Recupere la valeur tapee par l utilisateur
    const tarif = evt.srcElement.value;
    //Mettre a jour le tarif dans pour le service auquel l'utilisateur aimerait
    //Changer de valeur
    this.tarifservices.forEach((tarifservice) => {
      if (tarifservice.service_id == service_id) {
        tarifservice.tarif = tarif;
      }
    });
    console.log(this.tarifservices);
  }

  //Deplacer le marker sur le map
  markerDragEnd($event: any) {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
    this.getAddress(this.latitude, this.longitude);
  }

  //Recuperer l'adresse enfonction de latitude et longitude
  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        console.log(results);
        console.log(status);
        if (status === 'OK') {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert('No results found');
          }
        } else {
          window.alert('Geocoder failed due to: ' + status);
        }
      }
    );
  }
  async ionViewWillEnter() {
    this.userDetail = this.userService.getUserProfile();
  }

  //mettre a jour les donnees sur le profile
  async updateProfile() {
    if (!this.updateForm.valid) {
      console.log('no valid');
      console.log(this.updateForm.value);
      //this.presentAlert("invalid form");
    } else {
      // console.log("itemId="+this.itemId);
      // add to firebase
      this.ionicComponentService.presentLoading();
      let adresse = this.updateForm.value.adresse;

      console.log('YES');
      await this.userService
        .updateUserProfile(
          this.updateForm.value.firstname,
          this.updateForm.value.lastname,
          this.updateForm.value.phone,
          this.updateForm.value.email,
          this.address,
          this.latitude.toString(),
          this.longitude.toString(),
          this.ingeson_id,
          this.updateForm.value.about,
          this.tarifservices
        )
        .then(
          () => {
            this.ionicComponentService.presentToast('Profil mis à jour', 2000);
            this.ionicComponentService.dismissLoading();
            //this.router.navigateByUrl('fire-profile');
            //this.nav.setRoot('AfterLoginPage');
          },
          (error) => {
            var errorMessage: string = error.message;
            this.ionicComponentService.dismissLoading();
            this.ionicComponentService.presentAlert(errorMessage);
          }
        );
      //this.firestore.doc('item/'+this.itemId).update(postData);
      //this.router.navigateByUrl('crud-item');
    }
  }
}
