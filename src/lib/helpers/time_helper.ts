export default class TimeHelper {
  public static sleep = (milliseconds: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
}
