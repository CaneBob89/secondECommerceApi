const agg = [
    {
      $match: {
        product: new ObjectId('64959d19efb3ab31d77485b7')
      }
    }, {
      $group: {
        _id: null, 
        averageRating: {
          $avg: rating
        }, 
        numOfReviews: {
          $sum: 1
        }
      }
    }
  ];