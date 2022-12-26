export default class TimeHelper {
  public static sleep = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

  public static waitUntil = (condition: () => boolean): Promise<void> =>
    new Promise((resolve) => {
      const interval = setInterval(() => {
        if (condition()) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
}
