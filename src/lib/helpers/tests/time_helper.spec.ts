import TimeHelper from "@lib/helpers/time_helper";

describe("time helper", () => {
  it("ensures that time helper waits the specified number of milliseconds", async () => {
    const time = performance.now();
    await TimeHelper.sleep(75);
    expect(performance.now() - time).toBeGreaterThanOrEqual(75);
    expect(performance.now() - time).toBeLessThanOrEqual(250);
  });
});
