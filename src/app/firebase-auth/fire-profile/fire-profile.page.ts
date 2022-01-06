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
//Imort for file upload
import { finalize, tap } from 'rxjs/operators';
import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/storage';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/firestore';

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

  //mettre a jour l'image: https://www.positronx.io/ionic-firebase-file-image-upload-with-progress-bar-tutorial-with-example/
  // File upload task
  fileUploadTask: AngularFireUploadTask;

  // Upload progress
  percentageVal: Observable<number>;

  // Track file uploading with snapshot
  trackSnapshot: Observable<any>;

  // Uploaded File URL
  UploadedImageURL: Observable<string>;

  // Image specifications
  imgName: string;
  imgPath: string;
  fileStoragePath: string;

  ////Fin image

  latitude: number = 0.0;
  longitude: number = 0.0;
  zoom: number;
  address: string;
  private geoCoder;
  ingeson_id: string = '';
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
    private ngZone: NgZone,
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage
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
      about: [''],
    });
  }

  ngOnInit() {
    //this.ionicComponentService.presentLoading(); // call loading
    this.userDetail = this.userService.getUserProfile();
    //this.getServices();
    this.userService.getUserProfile().subscribe((res) => {
      let userProfileId = res.id;
      this.userprofileId = userProfileId;
      console.log('test---------------');
      console.log(userProfileId);
      if (res.is_ingeson) {
        this.ingestarService.getIngeson(userProfileId).subscribe((res) => {
          this.ingeson = res[0];
          console.log(this.ingeson.about);
          this.ingeson_id = this.ingeson.id;
          let about = this.ingeson.about;
          this.updateForm.patchValue({
            about: about,
          });
          this.latitude = parseFloat(this.ingeson.latitude);
          this.longitude = parseFloat(this.ingeson.longitude);
          this.address = this.ingeson.adresse;
          //load Places Autocomplete
          this.loadAutocompletePlaces(); // call async / await
          //Attendre pendant 3s pour que la page soit bien chargee
          // avant d'afficher le map avec le marker (pour permettre de resoudre le probleme de search
          //element pas trouve)
          setTimeout(() => {
            this.getAddress(this.latitude, this.longitude);
          }, 3000);
          this.getTarifs(this.userprofileId);
        });
      }
    });
    this.ionicComponentService.presentTimeoutLoading(1000, true);
  }
  //Activer l'autocomplete des places lorsque l'utilisateur est entrain d'
  //entrer son addresse
  loadAutocompletePlaces() {
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
  /*async ionViewWillEnter() {
    this.userDetail = this.userService.getUserProfile();
    this.userService.getUserProfile().subscribe((res) => {
      console.log('Get user profile response=' + res);
    });
  }*/

  //Telecharger l'image et sauvegarder l'image dans firebase storage
  uploadImage(event: FileList) {
    const file = event.item(0);

    // Image validation
    if (file.type.split('/')[0] !== 'image') {
      console.log('File type is not supported!');
      return;
    }

    this.imgName = file.name;

    // Storage path
    this.fileStoragePath = `filesStorage/${new Date().getTime()}_${file.name}`;

    // Image reference
    const imageRef = this.afStorage.ref(this.fileStoragePath);
    console.log(imageRef);

    // File upload task
    this.fileUploadTask = this.afStorage.upload(this.fileStoragePath, file);

    // Show uploading progress
    this.percentageVal = this.fileUploadTask.percentageChanges();
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

      if (this.fileStoragePath && this.fileStoragePath != '') {
        // recuperer le lien de l'image
        this.afStorage
          .ref(this.fileStoragePath)
          .getDownloadURL()
          .subscribe((url) => {
            this.imgPath = url;
            this.updateUserProfile();
          });
      } else {
        this.imgPath = '';
        this.updateUserProfile();
      }
    }
  }

  async updateUserProfile() {
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
        this.tarifservices,
        this.imgPath
      )
      .then(
        () => {
          this.ionicComponentService.presentToast('Profil mis à jour', 2000);
          this.ionicComponentService.dismissLoading();
        },
        (error) => {
          var errorMessage: string = error.message;
          this.ionicComponentService.dismissLoading();
          this.ionicComponentService.presentAlert(errorMessage);
        }
      );
  }
}
