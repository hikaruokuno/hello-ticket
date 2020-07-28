export const sleep = (waitSec: number) => {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, waitSec);
  });
};
