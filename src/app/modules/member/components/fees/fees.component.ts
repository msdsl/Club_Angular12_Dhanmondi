import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { MemberService } from '../../services/member.service';
import { MemberFeesService } from 'src/app/modules/setup/services/member-fees.service';

@Component({
  selector: 'app-fees',
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.css']
})
export class FeesComponent implements OnInit {

  @Input() memberId: any;
  memberFeesData: any;
  memFeeRes: any= new Object();
  memberFeesMapReqs: any = {};
  member: any;

  constructor(
    private service: MemberService,
    private memberFeesService: MemberFeesService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {

    if (this.memberId) {
      this.getMemberInfoById(this.memberId)
    }
  }

  getMemberInfoById(memberId) {
    this.service.getMemberInfoById(memberId).subscribe(
      (data) => {
        console.log(data);
        this.member = data;
        this.memberShipFees(data)
      },
      (err) => {
        console.log(err);

      }
    )
  }

  memberShipFees(data: any) {
    if (data.MemberTypeId > 0) {
      this.memberFeesService.getMemberFeesPagination(1, 1000).subscribe(
        (res) => {
          

          this.memberFeesData = res.Data.filter(c=>c.MemberTypeId==this.member.MemberTypeId);
          if (data.Id > 0) {
            this.memberFeesData.forEach(
              (item) =>
              (item.IsChecked = data.MemberFeesMapRess.find((x) => x.MemberShipFeeId == item.Id)?.IsChecked
                ? true
                : false)
            );
          }
          console.log(this.memberFeesData);
          this.cdr.detectChanges()
          

        },
        (error: any) => {
          error.Messages.forEach((element: any) => {
            // this._alertService.error(element);
          });
        }
      );
    }
  }

  saveRegistrationFees() {
    
    let totalFees = 0;
    this.memFeeRes.MemberFeesMapReqs = [] 

    this.memberFeesData?.forEach((item) => {
      if (item.IsChecked === true) {
        totalFees += item.Amount;

        this.memberFeesMapReqs.MemberFeesTitle = item.Title;
        this.memberFeesMapReqs.Amount = item.Amount;
        this.memberFeesMapReqs.MemberShipFeeId = item.Id;
        this.memberFeesMapReqs.RegisterMemberId = this.member.Id;
        this.memberFeesMapReqs.PaymentDate = new Date();

        this.memFeeRes?.MemberFeesMapReqs.push(this.memberFeesMapReqs);
        this.memberFeesMapReqs = {};
      }
    });

    this.memFeeRes.PaymentDate = new Date();
    this.memFeeRes.PaymentAmount = totalFees;
    this.memFeeRes.MemberId = this.member.Id;

    this.service.saveMemberFeeInfo(this.memFeeRes).subscribe((res) => {
      if (res.HasError) {
        res.Messages.forEach((element) => {
        });
      } else {
        this.getMemberInfoById(this.member.Id)
      }
    });
  }

}
