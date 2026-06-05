import request from "supertest";
import app from "../../app.js";

describe("Insurance Car API Tests", () => {
  //API 2 Test
  it("API 2 should correctly count claim keywords", async () => {
    const res = await request(app).post("/api/risk-rating").send({
      claim_history:
        "My only claim was a crash into my house's garage door that left a scratch on my car. There are no other crashes.",
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ risk_rating: 3 });
  });

  //API 3 Test
  it("API 3 should calculate exact premium quote", async () => {
    const res = await request(app)
      .post("/api/quote")
      .send({ car_value: 6614, risk_rating: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ monthly_premium: 27.5, yearly_premium: 330 });
  });
});
