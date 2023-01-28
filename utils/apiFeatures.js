class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // excludedFields.forEach(el => delete queryObj[el]);
    Object.keys(queryObj).forEach(key => {
      if (excludedFields.includes(key.toLowerCase())) {
        delete queryObj[key];
      }
    });
    //1.2) Advanced Filtering
    //{ duration: { gte: '4.5' }, difficulty: easy, Page: '1', limit: '5' } from
    //{ duration: { $gte: 4.5 }, difficulty: easy, Page: '1', limit: '5' } to
    // gte,gt,lte,lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = JSON.parse(
      queryStr.replace(
        /\b(gte|gt|lt|lte)\b/gi,
        match => `$${match.toLowerCase()}`
      )
    );
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
