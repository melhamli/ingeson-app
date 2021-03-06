import { Component, OnInit } from '@angular/core';

import { AngularFirestore,AngularFirestoreCollection,AngularFirestoreDocument} from '@angular/fire/firestore';
import { MenuController,ModalController,NavController,LoadingController} from '@ionic/angular';
import { firestore } from 'firebase/app' // new version : ex arrayContanin, arrayUnion


import { Observable } from 'rxjs';

@Component({
  selector: 'app-masonry',
  templateUrl: './masonry.page.html',
  styleUrls: ['./masonry.page.scss'],
})
export class MasonryPage implements OnInit {


  posts = [];
  imageUrlArray = [];

  public lists: Observable<any[]>;
  constructor(
    public menuCtrl: MenuController,
    private firestore: AngularFirestore
  ) {

  }



  ngOnInit() {

    this.imageUrlArray = [
      { image: 'https://image.freepik.com/free-photo/portrait-collection-adorable-puppies_53876-64793.jpg'},
      { image: 'https://www.prachachat.net/wp-content/uploads/2020/01/7-Hotline-Bling-01-GettyImages-166291140-731x1024.jpg'},
      { image: 'https://image.freepik.com/free-photo/tiger_42044-2072.jpg'},
      { image: 'https://image.freepik.com/free-photo/friendly-dog-with-tongue-out-copy-space_23-2148326231.jpg'},
      { image: 'https://www.prachachat.net/wp-content/uploads/2020/01/7-Hotline-Bling-01-GettyImages-166291140-731x1024.jpg'},
      { image: 'https://image.freepik.com/free-photo/portrait-collection-adorable-puppies_53876-64793.jpg'},
      { image: 'https://www.prachachat.net/wp-content/uploads/2020/01/7-Hotline-Bling-01-GettyImages-166291140-731x1024.jpg'},
      { image: 'https://image.freepik.com/free-photo/portrait-collection-adorable-puppies_53876-64793.jpg'},
      { image: 'https://image.freepik.com/free-photo/tiger_42044-2072.jpg'},
      { image: 'https://image.freepik.com/free-photo/friendly-dog-with-tongue-out-copy-space_23-2148326231.jpg'},
      { image: 'https://image.freepik.com/free-photo/portrait-collection-adorable-puppies_53876-64793.jpg'},
      { image: 'https://image.freepik.com/free-photo/adult-jaguar_133548-137.jpg'},
      { image: 'https://image.freepik.com/free-photo/tiger_42044-2072.jpg'},
    ]
    this.posts = [
      {
        description: 'Trying out digital painting',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/d5/63/b0/d563b08194f0a92cc7d381f7f8582a08.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/236x/43/f3/3d/43f33de6f96ca8e6f8dc6ff1ad86b586.jpg'
      },
      {
        description: 'Look at this amazing clay humming bird I crafted!',
        image: 'https://s-media-cache-ak0.pinimg.com/236x/68/68/a2/6868a2f821e5d15cc8fcd8cfa1694606.jpg'
      },
      {
        description: 'Origami tullip tutorial',
        image: 'https://s-media-cache-ak0.pinimg.com/236x/38/6f/8e/386f8ec1725f09883d827094228d0f82.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/f6/61/5c/f6615ca7068da18157588890f9e9e03a.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/0d/29/35/0d2935d14c17aff1baab75360c9e2bd6.jpg'
      },
      {
        description: 'Delicious chocolate bread recipe!',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/06/a9/8e/06a98e67111aae83a481a2c1dbb594a4.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/d5/8c/37/d58c3783d6ebf79db0f9c057726800a0.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/f5/35/97/f53597bf16aff91315a0beca27ffdbda.jpg'
      },
      {
        description: '',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/cf/fe/6d/cffe6dd7dece1cb0562f65cd3bfba1ac.jpg'
      },
      {
        description: 'Fastest car of all times',
        image: 'https://s-media-cache-ak0.pinimg.com/564x/5f/bf/34/5fbf3414f9de301c8f4b868b1c2e2339.jpg'
      },
    ];



    console.log("start")
    this.lists = this.firestore.collection<any>('layout_masonry').valueChanges();
  }
  getFeed(){
    console.log("start getCategory");
     
  
  }
  toggleSideMenu() {
    console.log("call toggleSideMenu")
    this.menuCtrl.toggle(); //Add this method to your button click function
  }
}



