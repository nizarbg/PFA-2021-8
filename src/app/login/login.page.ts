import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { auth } from 'firebase/app'
import { UserService } from '../user.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { FirebaseApp } from '@angular/fire';
import * as firebase from 'firebase/app'
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

	name: string = ""
	password: string = ""
	verified: boolean

	constructor(
		public afAuth: AngularFireAuth,
		public afstore: AngularFirestore, 
		public user: UserService, 
		public router: Router, 
		private alertController: AlertController,
		private firebase: FirebaseApp) { 
			
		}

	ngOnInit() {
	}
	
	async presentAlert(title: string, content: string) {
		const alert = await this.alertController.create({
			header: title,
			message: content,
			buttons: ['OK']
		})

		await alert.present()
	}
	
	async login() {
		const { name, password } = this
		try {
			console.log(name)
			const res = await this.afAuth.auth.signInWithEmailAndPassword(name, password)
			this.checkVerification().then((output:boolean) => {
				this.verified = output;
			  }).then(() => {
				let itemDoc = this.afstore.doc<any>('users/' + res.user.uid);
				let item = itemDoc.valueChanges();
				item.subscribe(res=>{
				  console.log("verified? : " + this.verified);
				  console.log("blocked? : " + res.blocked);
				  if(this.verified == true && res.blocked == false){
					this.router.navigate(['/tabs']);
				  }else{
					if(this.verified == false){
						this.router.navigate(['/tabs']);
					}
					if(res.blocked == true){
						this.router.navigate(['/tabs']);
					}
				  }
				});
			})
		
		} catch(err) {
			console.log(err)
				return this.presentAlert('Erreur!', err)
			
		}
	}

	goToRegister(){
		this.router.navigate(['/register'])
	}

	forgotPassword(){
		this.router.navigate(['/resetpw'])
	}

	checkVerification(){
		return new Promise((resolve, reject) => {
		  firebase.auth().onAuthStateChanged(function(user) {
			resolve(user.emailVerified);
		  });
		})
	  }

	

}