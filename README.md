This is my Mission 1 project for Turners car insurance.

It is just a small prototype where you upload a car image and it tries to tell
what type of car it is.

Things it has:

- Turners logo at the top
- upload image button
- preview of the image
- prediction result
- confidence score
- button for insurance premium but it does not actually calculate yet
- backend that sends the image to Azure Custom Vision

The frontend stuff is mostly in frontend/src/App.jsx.

The css is in frontend/src/App.css and frontend/src/index.css.

The backend stuff is in backend/server.js.

The Azure link and key goes in backend/.env.

Backend should be:
http://localhost:3001

To check if backend is working:
http://localhost:3001/api/health just run this and it should show "status":"backend is running"

Frontend should be:
http://127.0.0.1:5173

Need to put the Azure Custom Vision image file prediction url and prediction key
in backend/.env or the prediction will not work.

This project is not doing real insurance prices yet. It is mostly just the car
image checker part.

## Task 5: POST /api/car-value test matrix

The car value formula is:

`car_value = (sum of the model letter positions * 100) + year`

Letter positions are case-insensitive (`A = 1` through `Z = 26`). Numbers,
spaces, and punctuation in a model contribute zero.

For the Jest unit tests I picked the four provided task examples, then added one
extra boundary case where the year is not a whole number.

| Test Case Number | Input `(model, year)` | Expected Output `($ value)` | Test Description |
| --- | --- | --- | --- |
| 1 | `"Civic", 2020` | `6620` | Sunny day scenario |
| 2 | `"911", 2020` | `2020` | Numbers only is ok |
| 3 | `"Task-Force", -987` | `"Year must be a non-negative integer."` | Negative year |
| 4 | `"C200", "twenty twenty"` | `"Year can't be a text."` | Wrong data type |
| 5 | `"Civic", 2020.5` | `"Year must be a whole number."` | Year is not a whole number |

## Task 5: POST /api/discount test matrix

The discount formula I used is:

- Age 25 to 39 gives 5%.
- Age 40+ gives 10%.
- Experience 5 to 9 years gives 5%.
- Experience 10+ years gives 10%.
- A clean driving record adds 5%, but only when at least one age or experience discount applies.
- The maximum discount is capped at 20%.

| Test Case Number | Input `(age, experience, cleanDrivingRecord)` | Expected Output | Test Description |
| --- | --- | --- | --- |
| TC-01 | `24, 4, true` | `0% discount` | No-discount baseline because age and experience are below all discount tiers |
| TC-02 | `25, 4, true` and `40, 4, true` | `10%` and `15% discount` | Checks the age boundary tiers for `25+` and `40+` |
| TC-03 | `30, 5, true` and `30, 10, true` | `15%` and `20% discount` | Checks the experience boundary tiers for `5+` and `10+` |
| TC-04 | `45, 12, true` | `20% discount` | Checks that the maximum discount cap is applied |
| TC-05 | `20, 25, true` | Error message | Impossible parameter: experience cannot be greater than age |
