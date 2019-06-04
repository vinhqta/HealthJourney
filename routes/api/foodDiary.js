const express = require('express');
const request = require('request');
const config = require('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator/check');

const FoodDiary = require('../../models/FoodDiary');
const User = require('../../models/User');

// @route  GET api/foodDiary/day
// @desc   Get current user's food diary for specific day
// @access Private
router.get('/day', auth, async (req, res) => {
  try {
    const diary = await FoodDiary.findOne({ user: req.user.id });

    console.log(diary);

    if (!diary) {
      return res
        .status(400)
        .json({ msg: 'There is no diary for this user day' });
    }
    res.json(diary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route  POST api/foodDiary
// @desc   Create or Updates a food diary for a specific day
// @access Private
router.post(
  '/',
  [
    auth,
    [
      check('day', 'Day of the week is required')
        .not()
        .isEmpty()
    ]
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ erros: errors.array() });
    }
    const { day } = req.body;
    console.log(req.body);

    const diaryFields = {};
    diaryFields.user = req.user.id;
    if (day) diaryFields.day = day;

    try {
      let diary = await FoodDiary.findOne({ user: req.user.id, day: day });

      if (diary) {
        diary = await FoodDiary.findOneAndUpdate({
          user: req.user.id,
          day: day
        });
      }

      diary = new FoodDiary(diaryFields);
      await diary.save();

      res.json(diary);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route  PUT api/foodDiary/entry
// @desc   Add entry
// @access Private
router.put('/entry', auth, async (req, res) => {
  console.log(req.body);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { foodName, servings, part, day } = req.body;

  const newEntry = { foodName, servings, part };

  try {
    const diary = await FoodDiary.findOne({ user: req.user.id, day: day });

    diary.foodEaten.unshift(newEntry);
    diary.save();
    res.json(diary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route  DELETE api/foodDiary/entry/:entry_id
// @desc   Delete entry
// @access Private
router.delete('/entry/:entry_id', auth, async (req, res) => {
  const { day } = req.body;
  console.log(req.body);
  try {
    const diary = await FoodDiary.findOne({ user: req.user.id, day: day });

    // Get remove index
    const removeIndex = diary.foodEaten
      .map(entry => entry.id)
      .indexOf(req.params.entry_id);

    diary.foodEaten.splice(removeIndex, 1);

    await diary.save();

    res.json(diary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
