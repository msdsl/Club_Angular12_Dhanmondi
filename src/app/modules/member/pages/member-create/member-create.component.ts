import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-member-create',
  templateUrl: './member-create.component.html',
  styleUrls: ['./member-create.component.css']
})
export class MemberCreateComponent implements OnInit {
  memberId: number;

  constructor(
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    
    this.activateRoute.paramMap.subscribe((params) => {
      this.memberId = +params.get('id');
    });
  }

}
