/* ==========================================================================
   Appliance Energy Calculator (televisions page)
   Keeps the four result tiles in sync with the form as the user types and
   shows a message under each field that needs attention.
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#energy-calculator");
  if (!form) return;

  const model = form.querySelector("#model");
  const watts = form.querySelector("#watts");
  const hours = form.querySelector("#hours");
  const price = form.querySelector("#price");
  const results = document.querySelector("#calculator-results");
  const status = document.querySelector("#form-status");

  /* Wattage loaded by each reference model. */
  const presets = {
    studio: 65,
    family: 110,
    cinema: 165,
    custom: ""
  };

  /* Each numeric field with the message element shown directly under it. */
  const errorFields = {
    watts: { input: watts, message: document.getElementById("watts-error") },
    hours: { input: hours, message: document.getElementById("hours-error") },
    price: { input: price, message: document.getElementById("price-error") }
  };

  /* Show or clear one field's error message and invalid state. */
  const setFieldError = (name, message) => {
    const field = errorFields[name];
    if (message) {
      field.input.setAttribute("aria-invalid", "true");
      field.message.textContent = message;
      field.message.hidden = false;
    } else {
      field.input.removeAttribute("aria-invalid");
      field.message.textContent = "";
      field.message.hidden = true;
    }
  };

  /* Render the four result tiles. */
  const showResults = (daily, monthly, yearly, yearlyCost) => {
    results.innerHTML = `
      <h3 id="results-title">Your estimated usage</h3>
      <p class="results-intro">
        Based on ${Number(watts.value).toFixed(0)} W for ${Number(hours.value).toFixed(1)} hours each day.
      </p>
      <div class="result-grid" aria-labelledby="results-title">
        <div class="result-value">
          <strong>${daily.toFixed(2)} kWh</strong>
          <span>Daily energy</span>
        </div>
        <div class="result-value">
          <strong>${monthly.toFixed(1)} kWh</strong>
          <span>Monthly energy</span>
        </div>
        <div class="result-value">
          <strong>${yearly.toFixed(1)} kWh</strong>
          <span>Yearly energy</span>
        </div>
        <div class="result-value">
          <strong>$${yearlyCost.toFixed(2)}</strong>
          <span>Estimated yearly cost</span>
        </div>
      </div>`;
  };

  /* Recalculate from the current field values. */
  const calculate = (event) => {
    if (event) event.preventDefault();

    status.textContent = "";

    const wattValue = Number(watts.value);
    const hourValue = Number(hours.value);
    const priceValue = Number(price.value);

    /* A day only has 24 hours, so anything above that cannot be a real duty cycle. */
    let hoursMessage = "";
    if (!Number.isFinite(hourValue) || hourValue <= 0) {
      hoursMessage = "Enter a daily run time above 0.";
    } else if (hourValue > 24) {
      hoursMessage = "Hours per day cannot exceed 24.";
    }

    setFieldError("watts", !Number.isFinite(wattValue) || wattValue <= 0
      ? "Enter a wattage above 0."
      : "");
    setFieldError("hours", hoursMessage);
    setFieldError("price", !Number.isFinite(priceValue) || priceValue <= 0
      ? "Enter a price above 0."
      : "");

    const invalid = Object.values(errorFields).some((field) =>
      field.input.hasAttribute("aria-invalid"));

    if (invalid) {
      status.textContent = "Complete the highlighted fields to see an estimate.";
      results.innerHTML = "<h3>Waiting for valid details</h3><p class=\"results-intro\">Complete each field to see your estimate.</p>";
      return;
    }

    const daily = (wattValue * hourValue) / 1000;
    const monthly = daily * 30;
    const yearly = daily * 365;
    showResults(daily, monthly, yearly, yearly * (priceValue / 100));
  };

  model.addEventListener("change", () => {
    watts.value = presets[model.value];
    calculate();
  });

  /* No submit button by design — results are live; this only guards Enter. */
  form.addEventListener("submit", calculate);

  [watts, hours, price].forEach((input) => input.addEventListener("input", calculate));

  calculate();
});
