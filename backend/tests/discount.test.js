import request from "supertest";

import { server } from "../server.js";

describe("POST /api/discount", () => {
  // this is the baseline, no age or experience tier has kicked in yet
  test("Test 1 returns 0 percent when age and experience are below the discount tiers", async () => {
    const response = await request(server)
      .post("/api/discount")
      .send({ age: 24, experience: 4, cleanDrivingRecord: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ discount: 0 });
  });

  // this checks the two age boundaries together because the UI can use dropdown tiers
  test("Test 2 applies the 25+ and 40+ age tier discounts", async () => {
    const age25Response = await request(server) //this tier is for drivers aged 25 to 39, so it should get the 5 percent discount for being over 25.
      .post("/api/discount")
      .send({ age: 25, experience: 4, cleanDrivingRecord: true });

    const age40Response = await request(server)
      .post("/api/discount")
      .send({ age: 40, experience: 4, cleanDrivingRecord: true }); //this tier is for drivers aged 40 and above, so it should get the 10 percent discount for being over 40.

    expect(age25Response.status).toBe(200);
    expect(age25Response.body).toEqual({ discount: 10 });

    expect(age40Response.status).toBe(200);
    expect(age40Response.body).toEqual({ discount: 15 });
  });

  // this checks the two experience boundaries together for the same reason
  test("Test 3 applies the 5+ and 10+ experience tier discounts", async () => {
    const fiveYearsResponse = await request(server) //
      .post("/api/discount")
      .send({ age: 30, experience: 5, cleanDrivingRecord: true });

    const tenYearsResponse = await request(server)
      .post("/api/discount")
      .send({ age: 30, experience: 10, cleanDrivingRecord: true });

    expect(fiveYearsResponse.status).toBe(200);
    expect(fiveYearsResponse.body).toEqual({ discount: 15 });

    expect(tenYearsResponse.status).toBe(200);
    expect(tenYearsResponse.body).toEqual({ discount: 20 });
  });

  // this makes sure the total discount never goes over the business cap
  test("Test 4 caps the maximum discount at 20 percent", async () => {
    const response = await request(server)
      .post("/api/discount")
      .send({ age: 45, experience: 12, cleanDrivingRecord: true });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ discount: 20 });
  });

  // this catches impossible data, because experience should not be higher than age
  test("Test 5 rejects experience greater than age", async () => {
    const response = await request(server)
      .post("/api/discount")
      .send({ age: 20, experience: 25, cleanDrivingRecord: true });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Experience cannot be greater than age."
    });
  });
});
