import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import {
  AngularFirestore,
  AngularFirestoreCollection,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
// import * as firebase from 'firebase';
// import { Observable } from 'rxjs';
import { Observable, combineLatest, of, Subscription } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { uniq, flatten } from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  userId: string = '';
  userAuth: boolean = false;
  private userProfile: AngularFirestoreDocument<any>;
  subscription: Subscription;

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth
  ) {
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        console.log('USERSERVICE.....  auth = true');
        this.userId = user.uid;
        this.userAuth = true;
        console.log('userId=' + this.userId);
      } else {
        console.log('USERSERVICE.....  auth = false');
        // Empty the value when user signs out
        this.userId = '';
        this.userAuth = false;
        console.log('userId=' + this.userId);
      }
    });
  }
  //Récuperer tous les ingénieurs du son//

  getIngeSons() {
    console.log('start getIngeSons');
    return this.firestore
      .collection<any>('ingeson')
      .snapshotChanges()
      .pipe(
        switchMap((ingesons) => {
          const userIds = uniq(
            ingesons.map(
              (ingeson) => ingeson.payload.doc.data()['userprofile_id']
            )
          );

          return combineLatest(
            of(ingesons),
            combineLatest(
              userIds.map((userId) =>
                this.firestore
                  .collection<any>('userProfile', (ref) =>
                    ref.where('id', '==', userId)
                  )
                  .valueChanges()
                  .pipe(map((userProfiles) => userProfiles[0]))
              )
            )
          );
        }),
        map(([ingesons, userProfiles]) => {
          return ingesons.map((ingeson) => {
            const data = ingeson.payload.doc.data();
            // get id from firebase metadata
            const id = ingeson.payload.doc.id;
            return {
              id,
              ...data,
              userProfile: userProfiles.find(
                (a) => a.id === ingeson.payload.doc.data()['userprofile_id']
              ),
            };
          });
        })
      );
  }

  //recommandations ingé sons//

  getRecommendIngeSons() {
    console.log('start getRecommendIngeSons');
    return this.firestore
      .collection<any>('ingeson', (ref) => ref.where('recommended', '==', true))
      .snapshotChanges()
      .pipe(
        switchMap((ingesons) => {
          const userIds = uniq(
            ingesons.map(
              (ingeson) => ingeson.payload.doc.data()['userprofile_id']
            )
          );

          return combineLatest(
            of(ingesons),
            combineLatest(
              userIds.map((userId) =>
                this.firestore
                  .collection<any>('userProfile', (ref) =>
                    ref.where('id', '==', userId)
                  )
                  .valueChanges()
                  .pipe(map((userProfiles) => userProfiles[0]))
              )
            )
          );
        }),
        map(([ingesons, userProfiles]) => {
          return ingesons.map((ingeson) => {
            const data = ingeson.payload.doc.data();
            // get id from firebase metadata
            const id = ingeson.payload.doc.id;
            return {
              id,
              ...data,
              userProfile: userProfiles.find(
                (a) => a.id === ingeson.payload.doc.data()['userprofile_id']
              ),
            };
          });
        })
      );
  }

  //**************************************//
  //******   user authentication    ******//
  //**************************************//

  ///https://angularfirebase.com/snippets/check-if-current-user-exists-with-angularfire/
  isLoggedIn(): Promise<any> {
    return this.fireAuth.authState.pipe(first()).toPromise();
  }
  async getAuthState() {
    console.log('userService call getAuthState=' + this.userAuth);
    return await this.userAuth;
  }
  getUserId() {
    return this.userId;
  }
  getConnectedUserId() {
    this.fireAuth.authState.subscribe((user) => {
      if (user) {
        console.log('USERSERVICE RUNNNNN...  auth 1');
        this.userId = user.uid;
        this.userAuth = true;
        console.log('userService call getUserId=' + this.userId);
        return this.userId;
      } else {
        console.log('USERSERVICE RUNNNNN...  auth 0');
        // Empty the value when user signs out
        this.userId = null;
        this.userAuth = false;
        console.log('userService call getUserId=' + this.userId);
        return this.userId;
      }
    });
  }
  // async doSomething(): Promise<string>  {
  //   const user = await this.isLoggedIn()
  //   if (user) {
  //     // do something
  //     this.userId = await user.uid;
  //     return   this.firestore.doc<any>('userProfile/'+this.userId).valueChanges();
  //   } else {
  //     // do something else
  //   }
  // }

  // login
  signinUser(newEmail: string, newPassword: string): Promise<any> {
    return this.fireAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string): Promise<any> {
    return this.fireAuth.auth.sendPasswordResetEmail(email);
  }

  signoutUser(): Promise<any> {
    return this.fireAuth.auth.signOut();
  }

  // register
  signupUser(
    firstname: string,
    lastname: string,
    phone: string,
    username: string,
    password: string,
    is_ingeson: boolean
  ): Promise<any> {
    return this.fireAuth.auth
      .createUserWithEmailAndPassword(username, password)
      .then((newUser) => {
        console.log('userid=========' + newUser.user.uid); // firebase.database().ref('/userProfile').child(newUser.uid).set({
        //Creer un document userprofile et un document ingeson si c'est un ingenieur de son
        //Avec une location par defaut (Bruxelles) pour ne pas rendre le homepage sans info
        //Avec un image d'icone d'ingestar
        if (is_ingeson) {
          this.firestore
            .collection('userProfile')
            .doc(newUser.user.uid)
            .set({
              id: newUser.user.uid,
              firstname: firstname,
              lastname: lastname,
              email: username,
              image: '/assets/icon/icone-inge.png',
              phone: phone,
              is_ingeson: is_ingeson,
            })
            .then((rep) => {
              this.firestore.collection<any>('ingeson').add({
                userprofile_id: newUser.user.uid,
                latitude: '50.85012',
                longitude: '4.44848',
                adresse: 'Bruxelles, Belgium',
                about: '',
                avg_note: 0.0,
              });
            });
        } else {
          this.firestore.collection('userProfile').doc(newUser.user.uid).set({
            id: newUser.user.uid,
            firstname: firstname,
            lastname: lastname,
            email: username,
            image: '/assets/icon/icone-inge.png',
            phone: phone,
            is_ingeson: is_ingeson,
          });
        }
      });
  }

  //*******************************//
  //******   user profile    ******//
  //*******************************//

  getUserProfile() {
    //  this.fireAuth.authState.subscribe(user => {
    //   if (user) {
    //     //this.userId = user.uid;
    //     //console.log("CALL check user auth________________userService user auth id = "+ this.userId);
    //     // set angularfireDoc userfile
    //    // this.userProfile = this.firestore.doc<any>('userProfile/'+this.userId);
    //       //######
    //   }
    // });
    console.log('userId=' + this.userId);
    console.log('getUserProfile');
    return this.firestore.doc<any>('userProfile/' + this.userId).valueChanges();
  }

  async getUserProfileId() {
    const user = await this.isLoggedIn();
    if (user) {
      // do something
      this.userId = await user.uid;
      //return   this.firestore.doc<any>('userProfile/'+this.userId).valueChanges();
    } else {
      // do something else
      console.log('++++++++No userId' + this.userId);
    }
    console.log('++++++++++getUserProfileId = ' + this.userId);
    return this.userId;
  }

  updateUserProfile(
    firstname: string,
    lastname: string,
    phone: string,
    email: string,
    adresse: string,
    latitude: string,
    longitude: string,
    ingeson_id: string,
    about: string,
    tarifservices: any[],
    image: string
  ) {
    //1-Enregistrer les champs correspondant a userprofile
    //2-Enregister les champs correspondants a ingeson
    //3-Supprimer les anciens tarifs fixes par l uilissateur
    //4-Add les nouveaux  tarifs fixes par l uilissateur
    let profile = {
      firstname: firstname,
      lastname: lastname,
      phone: phone,
      email: email,
    };
    if (image != '') {
      profile['image'] = image;
    }

    return this.firestore
      .doc<any>('userProfile/' + this.userId)
      .update({
        ...profile,
      })
      .then((res) => {
        //Verifier que l'utilisateur est un ingenieur de son avant de continuer
        //Les autres mis a jour
        if (ingeson_id && ingeson_id != '') {
          //2-
          this.firestore
            .collection('ingeson')
            .doc(ingeson_id)
            .update({
              latitude: latitude,
              longitude: longitude,
              adresse: adresse,
              about: about,
            })
            .then(async (res) => {
              //3-
              let removeRep = false;
              //Attendre que la suppression soit finie avant de passer a l ajout
              await this.removeTarifs(this.userId).then((rep) => {
                this.subscription.unsubscribe();
                removeRep = true;
              });
              if (removeRep) {
                //4-
                tarifservices.forEach((tarifservice) => {
                  if (parseInt(tarifservice.tarif) != 0) {
                    this.firestore.collection<any>('ingetarif').add({
                      service_id: tarifservice.service_id,
                      service_name: tarifservice.service_name,
                      tarif: tarifservice.tarif,
                      userprofile_id: this.userId,
                    });
                  }
                });
              }
            });
        }
      });
  }

  //Recuperer tous les anciens tarifs de l'utilisateur
  getTarifs(userprofile_id: string): any {
    console.log('get tarifs to remove');
    return this.firestore
      .collection<any>('ingetarif', (ref) =>
        ref.where('userprofile_id', '==', userprofile_id)
      )
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            // get id from firebase metadata
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  //supprimer tous les tarifs pour un utilisateur
  removeTarifs(userprofile_id: string) {
    return new Promise((resolve, reject) => {
      this.subscription = this.getTarifs(userprofile_id).subscribe((tarifs) => {
        console.log('Inside remove tarifs');
        console.log(tarifs);
        if (tarifs && tarifs.length > 0) {
          //Supprimer les tarifs un a un
          tarifs.forEach(async (tarif) => {
            await this.firestore.doc('ingetarif/' + tarif.id).delete();
          });
          console.log('remove response');
        }
        resolve(true);
      });
    });
  }

  //*******************************//
  //******   user address    ******//
  //*******************************//

  getAddressByUserId() {
    console.log('_____getAddressByUserId=');
    return this.firestore
      .collection<any>('/userAddress', (ref) =>
        ref.where('userProfileId', '==', this.userId)
      )
      .snapshotChanges()
      .pipe(
        map((actions) => {
          return actions.map((a) => {
            const data = a.payload.doc.data();
            const id = a.payload.doc.id;
            console.log('####get a group of countries=' + data);
            return { id, ...data };
          });
        })
      );
  }

  getAddressById(addressId: string) {
    console.log('_______getAddressById');
    return this.firestore.doc<any>('userAddress/' + addressId).valueChanges();
  }

  addAddress(label: string, fullname: string, phone: number, address: string) {
    console.log('___addAddress=');
    return this.firestore.collection<any>('userAddress').add({
      userProfileId: this.userId,
      label: label,
      fullname: fullname,
      phone: phone,
      address: address,
      //createdTime: new Date()
    });
  }

  editAddress(
    addressId: string,
    title: string,
    fullname: string,
    phone: number,
    address: string
  ) {
    console.log('addressId=' + addressId);
    return this.firestore.doc<any>('userAddress/' + addressId).update({
      label: title,
      fullname: fullname,
      phone: phone,
      address: address,
    });
  }

  deleteAddress(addressId: string) {
    return this.firestore.doc('userAddress/' + addressId).delete();
  }
}
