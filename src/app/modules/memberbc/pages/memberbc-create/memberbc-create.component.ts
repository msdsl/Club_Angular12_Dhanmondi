import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-memberbc-create',
  standalone: false,
  templateUrl: './memberbc-create.component.html',
  styleUrl: './memberbc-create.component.scss',
})
export class MemberbcCreateComponent implements OnInit {
  memberId: number;

  constructor(
    private _activateRoute: ActivatedRoute,
    private _router: Router
  ) {}

  ngOnInit() {
    this._activateRoute.paramMap.subscribe((params) => {
      this.memberId = +params.get('id');
    });
  }
  goToListPage() {
    this._router.navigate(['memberbc/list']);
  }
}
