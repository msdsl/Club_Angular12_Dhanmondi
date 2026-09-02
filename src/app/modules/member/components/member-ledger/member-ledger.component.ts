import { Component, Input, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';

@Component({
  selector: 'app-member-ledger',
  templateUrl: './member-ledger.component.html',
  styleUrls: ['./member-ledger.component.css']
})
export class MemberLedgerComponent implements OnInit {
  @Input() memberId: any;
  memberLedgerDetails: any;
  collectionSize: any;
  currentPage: number = 1;
  pageSize: number = 10;

  constructor(
    private service: MemberService,
  ) { }

  ngOnInit() {
    this.memberLedgerInfoById()
  }

  memberLedgerInfoById() {
    this.service.getMemberLedgerList(this.memberId, this.currentPage, this.pageSize).subscribe(
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

  loadForLegerPagination(currentPage){
    this.currentPage = currentPage;
    this.memberLedgerInfoById()
  }

}
