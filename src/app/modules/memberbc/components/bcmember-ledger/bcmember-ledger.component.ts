import { Component, Input, OnInit } from '@angular/core';
import { MemberbcService } from '../../services/memberbc.service';

@Component({
  selector: 'app-bcmember-ledger',
  standalone: false,
  templateUrl: './bcmember-ledger.component.html',
  styleUrl: './bcmember-ledger.component.scss',
})
export class BcmemberLedgerComponent implements OnInit {
  @Input() memberId: any;
  memberLedgerDetails: any;
  collectionSize: any;
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(private service: MemberbcService) {}

  ngOnInit() {
    this.memberLedgerInfoById();
  }

  memberLedgerInfoById() {
    this.service
      .getMemberLedgerList(this.memberId, this.currentPage, this.pageSize)
      .subscribe(
        (res) => {
          if (!res.HasError) {
            this.memberLedgerDetails = res.DataList;
            this.collectionSize = res.DataCount;
          }
        },
        (error: any) => {
          error.Messages.forEach((element: any) => {
            console.log(element);
          });
        }
      );
  }

  loadForLegerPagination(currentPage) {
    this.currentPage = currentPage;
    this.memberLedgerInfoById();
  }
}
