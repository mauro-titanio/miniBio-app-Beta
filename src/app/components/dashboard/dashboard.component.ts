import { Component, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { Link } from 'src/app/shared/models/link';
import { Minibio } from 'src/app/shared/models/minibio';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { LinksCrudService } from 'src/app/shared/services/crud/links-crud.service';
import { MinibioCrudService } from 'src/app/shared/services/crud/minibio-crud.service';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  profileForm: FormGroup
  formLink: FormGroup
  user: any
  userLinks: Array<Link> = []
  userLink: Link = {
    id: '',
    author: '',
    label: '',
    link_url: '',
    active: true,
    date: 0,
  }
  pageLoaded = false
  createLinkModalClosed = true
  linksActives: Array<Link> | undefined
  myMinibios: Array<Minibio> = []
  miniBio: Minibio = {
    id: '',
    author: '',
    description: '',
    date: 0,
    title: '',
    theme: '',
    image: '',
    facebook: '',
    instagram: '',
    twitter: '',
    github: '',
  }
  hide = true
  editSocial = false
  uploadPercent: Observable<any> | undefined;
  downloadURL: Observable<any> | undefined;
  percent: any




  constructor(private authService: AuthService,
    private crudLinks: LinksCrudService,
    private crudMinibio: MinibioCrudService,
    private fb: FormBuilder,
    private notifier: NotifierService,
    private storage: AngularFireStorage) {
    //READ BIOS & LINKS
    setTimeout(() => {
      this.readMinibios()
      if (this.myMinibios.length === 0) {
        this.readMinibios()
      }
    }, 20);

    setTimeout(() => {
      this.pageLoaded = true
    }, 2800);

    //FORMS
    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    this.formLink = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      linkUrl: ['', [Validators.required, Validators.pattern(reg)]],
      active: [true, Validators.required]
    })
    this.profileForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      theme: ['claro', Validators.required],
      image: [''],
      facebook: ['', Validators.pattern(reg)],
      instagram: ['', Validators.pattern(reg)],
      twitter: ['', Validators.pattern(reg)],
      github: ['', Validators.pattern(reg)],
    })
  }

  //FILE UPLOAD
  uploadFile(event: any) {
    const file = event.target.files[0];
    const filePath = Date.now() + file.name;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file)
    // observe percentage changes
    task.percentageChanges().subscribe(number => {
      this.percent = number!
    })
    // get notified when the download URL is available
    task.snapshotChanges().pipe(
      finalize(() => {
        this.downloadURL = fileRef.getDownloadURL()
        this.downloadURL.subscribe(data => {
          this.profileForm.patchValue({
            image: data
          })
        })
      })
    )
      .subscribe()
  }



  get f() {
    return this.formLink.controls
  }

  get g() {
    return this.profileForm.controls
  }

  createMinibio() {
    const minibio: Minibio = {
      id: '',
      author: this.user.uid,
      description: '',
      date: new Date().getTime(),
      title: this.user.displayName,
      theme: 'claro',
      image: '',
      facebook: '',
      instagram: '',
      twitter: '',
      github: ''
    }
    this.crudMinibio.newMinibio(minibio, this.user.uid).then(success => {
      console.log("Post creado", success)
    }).catch(error => {
      console.log("Error", error)
    })
    this.readMinibios()
  }

  readMinibios() {
    setTimeout(() => {
      this.crudMinibio.readAllMinibio(this.user.uid).subscribe(data => {
        this.myMinibios = []
        data.forEach((doc: any) => {
          let miniBio: Minibio = doc.data()
          miniBio.id = doc.id
          this.myMinibios.push(miniBio)
        })
      })
      setTimeout(() => {
        this.getMinibio()
      }, 1000);
      setTimeout(() => {
        this.readAllLinks()
      }, 1000);
    }, 200);

  }

  getMinibio() {
    this.crudMinibio.getMinibio(this.user.uid, this.myMinibios[0].id).subscribe((data: any) => {
      this.miniBio = data.data()
      this.miniBio.id = data.id
      this.profileForm.patchValue({
        id: this.miniBio.id,
        author: this.miniBio.author,
        description: this.miniBio.description,
        date: this.miniBio.date,
        title: this.miniBio.title,
        theme: this.miniBio.theme,
        image: this.miniBio.image,
        facebook: this.miniBio.facebook,
        instagram: this.miniBio.instagram,
        twitter: this.miniBio.twitter,
        github: this.miniBio.github,
      })
    })
  }

  updateMinibio() {
    let minibio: Minibio = {
      id: this.miniBio.id,
      author: this.miniBio.author,
      description: this.g.description.value,
      date: new Date().getTime(),
      title: this.g.title.value,
      theme: this.g.theme.value,
      image: this.g.image.value,
      facebook: this.g.facebook.value,
      instagram: this.g.instagram.value,
      twitter: this.g.twitter.value,
      github: this.g.github.value,
    }
   
    if (this.profileForm.invalid) {
      this.notifier.notify('error', 'No se ha podido actualizar');
      console.log("error!")
      return
    }
    this.crudMinibio.updateMinibio(this.user.uid, minibio, this.miniBio.id).then(success => {
      this.notifier.notify('success', 'Enlace actualizado');
      console.log("Post creado", success)
      this.readMinibios()
    }).catch(error => {
      this.notifier.notify('error', 'Ha habido un error en el servidor');
      console.log("Error", error)
    })
  }







  ngOnInit(): void {
    this.user = this.authService.userData()
  }






  createLink(): void {
    const link: Link = {
      id: '',
      author: this.user.uid,
      label: this.f.label.value,
      link_url: this.f.linkUrl.value,
      active: true,
      date: new Date().getTime()
    }
    this.createLinkModalClosed = false
    if (this.formLink.invalid) {
      console.log("error!")
      this.notifier.notify('error', 'El enlace no es v??lido');
      return
    }
    if (this.userLinks.some(link => link.label === this.f.label.value)) {
      this.notifier.notify('error', 'El nombre ya existe');
      return
    }
    if (this.userLinks.some(link => link.link_url === this.f.linkUrl.value)) {
      this.notifier.notify('error', 'El enlace ya existe');
      return
    }
    this.crudLinks.newLink(link, this.myMinibios[0].id, this.user.uid).then(success => {
      console.log("Post creado", success)
      this.notifier.notify('success', 'Enlace creado');
      this.readAllLinks()
      this.createLinkModalClosed = true
    }).catch(error => {
      console.log("Error", error)
      this.notifier.notify('error', 'Ha habido un error en el servidor');
    })
  }



  readAllLinks() {
    setTimeout(() => {
      this.crudLinks.readAllLinks(this.user.uid, this.myMinibios[0].id).subscribe(data => {
        this.userLinks = []
        data.forEach((doc: any) => {
          let userLink: Link = doc.data()
          userLink.id = doc.id
          this.userLinks.push(userLink)
          this.linksActives = this.userLinks.filter(link => link.active === true)
          this.userLinks.sort(function (a, b) {
            return b.date - a.date;
          });
        })
      })
    }, 50);
  }



  getLink(id: string) {
    this.crudLinks.getLink(this.user.uid, this.myMinibios[0].id, id).subscribe((data: any) => {
      this.userLink = data.data()
      this.userLink.id = data.id
      this.formLink.patchValue({
        label: this.userLink.label,
        linkUrl: this.userLink.link_url,
        active: this.userLink.active,
      })
    })
  }



  deleteLink(id: any) {
    this.crudLinks.deleteLink(this.user.uid, this.myMinibios[0].id, id).then(success => {
      this.notifier.notify('success', 'Enlace eliminado');
      this.readAllLinks()
    }).catch(error => {
      console.log("Error", error)
      this.notifier.notify('error', 'Ha habido un error en el servidor');
    })
  }






  updateLink(id: string) {
    let link: Link = {
      id: id,
      author: this.user.uid,
      label: this.f.label.value,
      link_url: this.f.linkUrl.value,
      active: this.f.active.value,
      date: new Date().getTime(),
    }
    if (this.formLink.invalid) {
      this.notifier.notify('error', 'No se ha podido actualizar');
      console.log("error!")
      return
    }
    this.crudLinks.updateLink(this.user.uid, this.myMinibios[0].id, link, id).then(success => {
      this.notifier.notify('success', 'Enlace actualizado');
      console.log("Post creado", success)
      this.readAllLinks()
      this.userLink = {
        id: '',
        author: '',
        label: '',
        link_url: '',
        active: true,
        date: 0,
      }

    }).catch(error => {
      this.notifier.notify('error', 'Ha habido un error en el servidor');
      console.log("Error", error)
    })
  }



  logout() {
    this.authService.signOut()
  }


  showSocial() {
    if (this.editSocial === false) {
      this.editSocial = true
    } else {
      this.editSocial = false
    }
  }


}



