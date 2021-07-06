import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotifierService } from 'angular-notifier';

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
  }
  hide = true

  constructor(private authService: AuthService,
    private crudLinks: LinksCrudService,
    private crudMinibio: MinibioCrudService,
    private fb: FormBuilder,
    private notifier: NotifierService) {

    setTimeout(() => {
      this.readMinibios()
      if (this.myMinibios.length === 0) {
        this.readMinibios()
      }
    }, 20);

    setTimeout(() => {
      this.pageLoaded = true
    }, 2800);




    const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
    this.formLink = this.fb.group({
      label: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      linkUrl: ['', [Validators.required, Validators.pattern(reg)]],
      active: [true, Validators.required]
    })
  }


  
  createMinibio() {
    const minibio: Minibio = {
      id: '',
      author: this.user.uid,
      description: '',
      date: new Date().getTime(),
      title: this.user.displayName,
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
    })
  }







  ngOnInit(): void {
    this.user = this.authService.userData()
  }


  get f() {
    return this.formLink.controls
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
      this.notifier.notify('error', 'El enlace no es válido');
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





  //Hay un error en el update
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
    this.crudLinks.updateLink(this.user.uid,this.myMinibios[0].id, link, id).then(success => {
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





}



