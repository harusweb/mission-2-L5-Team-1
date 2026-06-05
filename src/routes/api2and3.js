import express from "express";
const router = express.Router();

router.post("/risk-rating", (req, res) => {
  const claim_history = req.body.claim_history;

  if (typeof claim_history !== "string" || claim_history === "") {
    return res.status(400).json({ error: "there is an error" });
  }

  const keywords = ["collide", "crash", "scratch", "bump", "smash"];
  let keywordCount = 0;
  const lowerText = claim_history.toLowerCase();

  for (let i = 0; i < keywords.length; i++) {
    const word = keywords[i];
    let position = lowerText.indexOf(word);

    while (position !== -1) {
      keywordCount = keywordCount + 1;
      position = lowerText.indexOf(word, position + 1);
    }
  }

  let risk_rating = keywordCount;
  if (risk_rating < 1) risk_rating = 1;
  if (risk_rating > 5) risk_rating = 5;

  return res.status(200).json({ risk_rating: risk_rating });
});

//***********API 3***************//

router.post("/quote", (req, res) => {
  const car_value = req.body.car_value;
  const risk_rating = req.body.risk_rating;

  if (typeof car_value !== "number" || car_value <= 0) {
    return res.status(400).json({ error: "there is an error" });
  }

  if (typeof risk_rating !== "number" || risk_rating < 1 || risk_rating > 5) {
    return res.status(400).json({ error: "there is an error" });
  }

  const yearly_premium = Math.floor((car_value * risk_rating) / 100);
  const monthly_premium = yearly_premium / 12;

  const finalYearly = Number(yearly_premium.toFixed(2));
  const finalMonthly = Number(monthly_premium.toFixed(2));

  return res
    .status(200)
    .json({ monthly_premium: finalMonthly, yearly_premium: finalYearly });
});

export default router;
