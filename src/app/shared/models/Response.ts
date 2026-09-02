export class Response {
    DataCount: number;
    Count: number;
    DataList: [];
    Data: [];
    HasError: boolean;
    Messages: [];
  
    constructor() {
      this.DataCount = 0;
      this.Count = 0;
      this.DataList = [];
      this.HasError = false;
      this.Messages = [];
      this.Data = [];
    }
  }