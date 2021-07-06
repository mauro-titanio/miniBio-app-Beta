import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Link } from 'src/app/shared/models/link';
import { Minibio } from 'src/app/shared/models/minibio';
import { LinksCrudService } from 'src/app/shared/services/crud/links-crud.service';
import { MinibioCrudService } from 'src/app/shared/services/crud/minibio-crud.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  minibio: Minibio = {
    id: '',
    author: '',
    description: '',
    date: 0,
    title: '',
  }
  userLinks: Array<Link> = []
  userId: string = ''
  bioId: string = ''
  activeLinks: Link[] = [];




  constructor(private route: ActivatedRoute, private router: Router, private crudMinibio: MinibioCrudService, private crudLinks: LinksCrudService) {

    this.userId = this.route.snapshot.paramMap.get('uid') ?? ""
    this.bioId = this.route.snapshot.paramMap.get('bioId') ?? ""
    this.crudMinibio.getMinibio(this.userId, this.bioId).subscribe(data => {
      this.minibio = data.data() as Minibio
      this.minibio.id = data.id
      console.log(this.minibio)
    })
    this.readAllLinks()
setTimeout(() => {
  console.log(this.activeLinks)
}, 2000);
  }

  readAllLinks() {
    setTimeout(() => {
      this.crudLinks.readAllLinks(this.userId, this.bioId).subscribe(data => {
        this.userLinks = []
        data.forEach((doc: any) => {
          let userLink: Link = doc.data()
          userLink.id = doc.id
          this.userLinks.push(userLink)
          this.activeLinks = this.userLinks.filter(link => link.active === true)
        })
      })
    }, 50);
  }
  ngOnInit(): void {
  }

}
