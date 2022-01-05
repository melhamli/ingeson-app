import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  ModalController,
  NavParams,
  NavController,
  LoadingController,
} from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { IonicComponentService } from '../../services/ionic-component.service';
import { Observable, Subscription } from 'rxjs';
declare var google;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {
  @ViewChild('map', { static: false }) mapElement: ElementRef;

  viewType: string = 'map';

  public ingesons: any[];
  //public places: Observable<Place[]>;

  viewDetail: boolean = false;

  userprofileId: string;
  ingesonName: string;
  ingesonAdresse: string;
  ingesonRating: string;
  ingesonImage: string;

  map: any;
  mapMarker: any;
  markerSelected: boolean = false;

  //******************** Map style  **************************//
  //***** go to snazzymaps.com for more map style  ***********//
  //**********************************************************//
  mapStyle: any = [
    {
      featureType: 'landscape.man_made',
      elementType: 'all',
      stylers: [{ color: '#faf5ed' }, { lightness: '0' }, { gamma: '1' }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry.fill',
      stylers: [{ color: '#bae5a6' }],
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [{ weight: '1.00' }, { gamma: '1.8' }, { saturation: '0' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ hue: '#ffb200' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ lightness: '0' }, { gamma: '1' }],
    },
    {
      featureType: 'transit.station.airport',
      elementType: 'all',
      stylers: [
        { hue: '#b000ff' },
        { saturation: '23' },
        { lightness: '-4' },
        { gamma: '0.80' },
      ],
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [{ color: '#a0daf2' }],
    },
  ];

  infoWindows: any = [];

  constructor(
    public userService: UserService,
    private ionicComponentService: IonicComponentService,
    private modalController: ModalController,
    public router: Router
  ) {}

  ngOnInit() {
    this.getIngeSons();

    // setTimeout(() => {
    //    this.displayGoogleMap(); // call async / await
    // }, 6000);
  }

  async openDetail(url: string, userprofileId: string) {
    this.ionicComponentService.presentTimeoutLoading(500, true);
    console.log('userprofileId=' + userprofileId);
    await this.modalController.dismiss();
    //this.router.navigateByUrl('/travel-detail/'+placeId);
    this.router.navigateByUrl('/' + url + '/' + userprofileId);
    //this.navCtrl.navigateForward('/real-detail/'+placeId, { animated: false, });
  }

  //*********************************************//
  //************** 1.Get place ******************//
  //*********************************************//

  async getIngeSons(): Promise<void> {
    console.log('1');
    this.ionicComponentService.presentLoading();
    await this.userService.getIngeSons().subscribe((actionArray) => {
      //onsole.log("######################### firebase/ getPlace loaded ="+actionArray);
      this.ingesons = actionArray;
      console.log(
        '+++++++++++++= ........ingesons array=' + JSON.stringify(this.ingesons)
      );
      this.ionicComponentService.dismissLoading();
      this.displayGoogleMap(); // call async / await
    });
    // await setTimeout(() => {
    //    this.displayGoogleMap(); // call async / await
    //    loading.dismiss();
    // }, 2000);
  }

  //*********************************************//
  //************** 2. Display map ***************//
  //*********************************************//

  displayGoogleMap() {
    let latLng = new google.maps.LatLng(50.85012, 4.44848);
    let mapOptions = {
      center: latLng,
      zoom: 12,
      styles: this.mapStyle,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
    };
    console.log('call map>>>>>>>');
    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    // delay or await
    this.addMarkersToMap();
  }

  //*********************************************//
  //************** 3. Add marker ****************//
  //*********************************************//

  addMarkersToMap() {
    console.log('<>>>>>>> call addMarkeToMap');

    for (let ingeson of this.ingesons) {
      //console.log("lat="+place.lat);
      var position = new google.maps.LatLng(
        ingeson.latitude,
        ingeson.longitude
      );

      var markerIcon = {
        url: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png', // icon url
        scaledSize: new google.maps.Size(50, 50), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0), // anchor
      };

      //var markerIcon = 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png'
      this.mapMarker = new google.maps.Marker({
        position: position,
        animation: google.maps.Animation.DROP,

        markerSelected: true,

        // name: place.name,
        // description: place.description,
        // image: place.image,
        // rating: place.rating,

        //**** Custom Marker Symbols ****/
        icon: markerIcon,

        //anchorPoint: new google.maps.Point(0, -40),
      });

      this.mapMarker.setMap(this.map);
      //this.map.setCenter(position);

      google.maps.event.addListener(this.mapMarker, 'click', () => {
        this.getPlaceDetail(
          ingeson.userProfile.id,
          ingeson.userProfile.firstname + ' ' + ingeson.userProfile.lastname,
          ingeson.avg_note,
          ingeson.adresse,
          ingeson.userProfile.image
        );
      });
    }
  }
  getPlaceDetail(userprofileId, name, rating, adresse, image_header) {
    this.viewDetail = true;
    this.userprofileId = userprofileId;
    this.ingesonName = name;
    this.ingesonRating = rating;
    this.ingesonAdresse = adresse;
    this.ingesonImage = image_header;

    console.log('&&&&&&&&&&&&&& ingesonName=' + this.ingesonName);
    console.log('&&&&&&&&&&&&&& ingesonAdresse=' + this.ingesonAdresse);

    //console.log("placeName="+this.placeName);
  }

  closeAllInfoWindows() {
    for (let window of this.infoWindows) {
      window.close();
    }
  }
  async close() {
    console.log('CALL CLOSE');
    await this.modalController.dismiss();
  }
}
