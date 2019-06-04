const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FoodDiarySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  day: {
    type: Date
  },
  foodEaten: [
    {
      foodName: {
        type: String,
        requried: true
      },
      servings: {
        type: Number,
        required: true
      },
      part: {
        type: String,
        required: true
      }
    }
  ]
});

module.exports = FoodDiary = mongoose.model('foodDiary', FoodDiarySchema);
