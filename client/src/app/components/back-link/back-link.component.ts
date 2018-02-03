import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-back-link',
  templateUrl: './back-link.component.html',
  styleUrls: ['./back-link.component.scss']
})
export class BackLinkComponent implements OnInit {
  @Input() link: string;
  @Input() text = 'Wróć';

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
  }

  goBack(): void {
    if (this.link) {
      this.router.navigate([this.link]);
    } else {
      window.history.back();
    }
  }

}
