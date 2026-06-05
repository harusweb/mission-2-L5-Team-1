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
