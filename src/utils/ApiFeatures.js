export class ApiFeatures {
    constructor(queryData, queryStr) {
      this.queryData = queryData;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            name: {
              $regex: this.queryStr.keyword,
              $options: "i",
            },
          }
        : {};
      return this;
    }
  
    filter() {
      return this;
    }
  
    pagination(resultPerPage) {
      return this;
    }
  }