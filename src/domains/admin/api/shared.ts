export const baseUrl = "https://api.themoviedb.org/3";

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};
