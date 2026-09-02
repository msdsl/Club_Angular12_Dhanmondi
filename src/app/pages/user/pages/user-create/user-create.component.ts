import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.css']
})
export class UserCreateComponent implements OnInit {

  userId: number;

  constructor(
    private activateRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    
    this.activateRoute.paramMap.subscribe((params) => {
      this.userId = +params.get('id');
    });
  }

}
