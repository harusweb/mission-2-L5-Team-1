import request from "supertest";

import { server } from "../server.js";

describe("POST /api/car-value", () => {
  // this is the normal sunny day example from the task sheet
  test("Test 1 returns 6620 for Civic, 2020", async () => {
    const response = await request(server)
      .post("/api/car-value")
      .send({ model: "Civic", year: 2020 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ car_value: 6620 });
  });

  // numbers are allowed in the model, they just do not add anything to the letter score
  test("Test 2 returns the year only for 911, 2020", async () => {
    const response = await request(server)
      .post("/api/car-value")
      .send({ model: "911", year: 2020 }); // "911" has no letters, so the letter score is 0 and the car value should just be the year

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ car_value: 2020 });
  });

  // negative years should fail because the car year cannot be below zero
  test("Test 3 rejects Task-Force, -987 because the year is negative", async () => {
    const response = await request(server)
      .post("/api/car-value")
      .send({ model: "Task-Force", year: -987 }); // -987 is a negative number, so it should be rejected

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Year must be a non-negative integer." // the error message should indicate that the year cannot be negative
    });
  });

  // this checks the task example where the year is text instead of a number
  test("Test 4 rejects C200, twenty twenty because the year is text", async () => {
    const response = await request(server)
      .post("/api/car-value")
      .send({ model: "C200", year: "twenty twenty" }); // "twenty twenty" is not a number, so it should be rejected

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Year can't be a text." // this one is text, not a negative number
    });
  });

  // this is my extra boundary case: the year must be a whole number, not a decimal
  test("Test 5 rejects Civic, 2020.5 because the year is not whole", async () => {
    const response = await request(server)
      .post("/api/car-value")
      .send({ model: "Civic", year: 2020.5 }); // 2020.5 is not a safe integer, so it should be rejected

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Year must be a whole number." // the year is a number, but not a whole number
    });

    const postmanStyleResponse = await request(server)
      .post("/api/car-value")
      .send({ model: "Civic", year: "2020.5" }); // if Postman sends it with quotes, show the same whole-number message

    expect(postmanStyleResponse.status).toBe(400);
    expect(postmanStyleResponse.body).toEqual({
      error: "Year must be a whole number."
    });
  });
});
