import { sleep } from '../utils/timer';
import { loginInfo } from './constants';
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto('https://www.up-fc.jp/helloproject/fanclub_Login.php');
  await page.type('input[name="User_No"]', loginInfo.userNo);
  await page.type('input[name="User_LoginPassword"]', loginInfo.password);
  await page.click(
    '#main > div.contents-body > div:nth-child(2) > div > table > tbody > tr:nth-child(2) > td > form > p:nth-child(5) > input[type=checkbox]'
  );
  await page.click('input[name="@Control_Name@"]');
  await sleep(1000);
  await page.goto(
    'https://www.up-fc.jp/helloproject/fan_AllEventTour_List.php'
  );
  await sleep(1000);
  // TODO: 現状、プロト作成のため期間を取得するのに、ループをたくさんしている
  // もっと良い方法（パフォーマンス的に）がないか検討する
  interface TitleAndLink {
    title: string;
    link: string;
  }

  const titlesAndLinks: TitleAndLink[] = await page.evaluate(() => {
    const dataList: TitleAndLink[] = [];
    const nodeList: NodeListOf<HTMLBaseElement> = document.querySelectorAll(
      'tr a'
    );

    nodeList.forEach((_node) => {
      // 現在受付中ものの、リンクを取得する
      if (_node.innerText.indexOf('受付中') != -1) {
        const acceptedTitlesAndLinks: TitleAndLink = {
          title: _node.innerText.replace('[受付中]', ''),
          link: _node.href,
        };
        dataList.push(acceptedTitlesAndLinks);
      }
    });
    return dataList;
  });
  // '受付中'の公演の数だけくり返す
  for (const data of titlesAndLinks) {
    // 申込期間、当落確認期間、入金締切日のページ
    await page.goto(data.link);

    // タイトルを取得する
    const title: string = data.title;

    // TODO：innerTextを取得してから申込期間を取得する？
    // 申込期間を取得する
    const getApplicationPeriod = await page.evaluate(() => {
      const tableText = document
        .querySelectorAll('table')[1]
        .querySelectorAll('tbody tr td')[0].innerText;
      // const tableText = document
      //   .querySelectorAll('table')[1]
      //   .querySelectorAll('tbody tr td')[0].innerText;
      const numberOfCharactersToTheFirstLineBreak =
        tableText.indexOf('\n', 0) - 1;
      const applicationPeriod = tableText.substr(
        1,
        numberOfCharactersToTheFirstLineBreak
      );
      return applicationPeriod;
    });

    // 当選落選確認期間を取得する
    const getConfirmationPeriodForWinningAndLosing = await page.evaluate(() => {
      const tableText = document
        .querySelectorAll('table')[1]
        .querySelectorAll('tbody tr td')[1].innerText;
      const numberOfCharactersToTheFirstLineBreak = tableText.indexOf('\n', 0);
      const winningAndLosingPeriod = tableText.substr(
        0,
        numberOfCharactersToTheFirstLineBreak
      );
      return winningAndLosingPeriod;
    });

    // 入金締切日を取得する
    const getDepositDeadline = await page.evaluate(() => {
      const tdSelector = document
        .querySelectorAll('table')[1]
        .querySelectorAll('tbody tr td');
      const tableText =
        tdSelector.length > 3 ? tdSelector[3].innerText : ' 当日入金';
      // const numberOfCharactersToTheFirstLineBreak = tableText.indexOf('\n', 0);
      const depositDeadline = tableText.substr(1);
      return depositDeadline;
    });

    // 公演選択のページ
    await page.click(
      '#main > div.contents-body > div > p:nth-child(2) > a > img'
    );
    await sleep(1000);

    // 公演を選択して、公演開催日のページへ
    const selectPerformance = page.evaluate(() => {
      document.querySelectorAll(
        'select[name="Event_ID"]'
      )[0].options[1].selected = true;
    });
    await selectPerformance;
    await page.click('input[name="@Control_Name@"]');
    await sleep(1000);

    // 公演の数だけループして、公演の情報を取得する
    const performances = await page.evaluate(() => {
      const formEntry = document.querySelectorAll('form[name="form_Entry"]');
      const performances = [];
      for (const entry of formEntry) {
        const tableInfo = entry.querySelectorAll('table tbody tr td');
        const performanceDay = '公演日: '.concat(tableInfo[2].innerText);
        const meetingPlace = '会場: '.concat(
          tableInfo[3].innerText.replace('\n', ' ')
        );
        const openingTime = tableInfo[4].innerText.replace('\n', ': ');
        const startTime = tableInfo[5].innerText.replace('\n', ': ');

        const performanceInfo = {
          performanceDay: performanceDay,
          meetingPlace: meetingPlace,
          openingTime: openingTime,
          startTime: startTime,
        };
        performances.push(performanceInfo);
      }
      return performances;
    });
    console.log(title);
    console.log(getApplicationPeriod);
    console.log(getConfirmationPeriodForWinningAndLosing);
    console.log(getDepositDeadline);
    console.log(performances);
  }
  // 申込期間、当落確認期間、入金締切日のページ
  // await page.goto(scrapingData[0]);

  // // 公演選択のページ
  // await page.click(
  //   '#main > div.contents-body > div > p:nth-child(2) > a > img'
  // );
  // sleep(1000);

  // // 公演を選択して、公演開催日のページへ
  // const selectPerformance = page.evaluate(() => {
  //   document.querySelectorAll(
  //     'select[name="Event_ID"]'
  //   )[0].options[1].selected = true;
  // });
  // await selectPerformance;
  // await page.click('input[name="@Control_Name@"]');
  // sleep(1000);

  // // 公演の数だけループして、公演の情報を取得する
  // const performances = await page.evaluate(() => {
  //   const formEntry = document.querySelectorAll('form[name="form_Entry"]');
  //   const performances = [];
  //   for (const entry of formEntry) {
  //     const tableInfo = entry.querySelectorAll('table tbody tr td');
  //     const meetingPlace = tableInfo[3].innerText.replace('\n', ' ');
  //     const openingTime = tableInfo[4].innerText.substr(
  //       tableInfo[4].innerText.indexOf('\n', 0) + 1
  //     );
  //     const startTime = tableInfo[5].innerText.substr(
  //       tableInfo[5].innerText.indexOf('\n', 0) + 1
  //     );
  //     const performanceInfo = {
  //       performanceDay: tableInfo[2].innerText,
  //       meetingPlace: meetingPlace,
  //       openingTime: openingTime,
  //       startTime: startTime,
  //     };
  //     performances.push(performanceInfo);
  //   }
  //   return performances;
  // });

  // console.log(performances);
  // await page.screenshot({ path: './result.png' });

  // TODO: '受付中'の公演の数だけ繰り返す

  // // タイトルを取得する
  // const title = await page.evaluate(() => {
  //   return document.querySelectorAll('td.Body_M9')[1].innerText;
  // });

  // // 申込期間を取得する
  // const getApplicationPeriod = await page.evaluate(() => {
  //   const tableText = document
  //     .querySelectorAll('table')[1]
  //     .querySelectorAll('tbody tr td')[0].innerText;
  //   const numberOfCharactersToTheFirstLineBreak =
  //     tableText.indexOf('\n', 0) - 1;
  //   const applicationPeriod = tableText.substr(
  //     1,
  //     numberOfCharactersToTheFirstLineBreak
  //   );
  //   return applicationPeriod;
  // });

  // // 当選落選確認期間を取得する
  // const getConfirmationPeriodForWinningAndLosing = await page.evaluate(() => {
  //   const tableText = document
  //     .querySelectorAll('table')[1]
  //     .querySelectorAll('tbody tr td')[1].innerText;
  //   const numberOfCharactersToTheFirstLineBreak = tableText.indexOf('\n', 0);
  //   const winningAndLosingPeriod = tableText.substr(
  //     0,
  //     numberOfCharactersToTheFirstLineBreak
  //   );
  //   return winningAndLosingPeriod;
  // });

  // // 入金締切日を取得する
  // const getDepositDeadline = await page.evaluate(() => {
  //   const tableText = document
  //     .querySelectorAll('table')[1]
  //     .querySelectorAll('tbody tr td')[3].innerText;
  //   // const numberOfCharactersToTheFirstLineBreak = tableText.indexOf('\n', 0);
  //   const depositDeadline = tableText.substr(1);
  //   return depositDeadline;
  // });

  // console.log(title);
  // console.log('申込期間： ', getApplicationPeriod);
  // console.log('当選落選確認期間： ', getConfirmationPeriodForWinningAndLosing);
  // console.log('入金締切日： ', getDepositDeadline);
  // await page.screenshot({ path: './result.png' });

  await browser.close();
})();

// 申込期間を取得する
// const GetApplicationPeriod = () => {
//   const tableText = document
//     .querySelectorAll('table')[1]
//     .querySelectorAll('tbody tr td')[0].innerText;
//   const numberOfCharactersToTheFirstLineBreak = tableText.indexOf('\n', 0);
//   const applicationPeriod = numberOfCharactersToTheFirstLineBreak.substr(
//     1,
//     firstRowEndPos
//   );
//   return applicationPeriod;
// };

// タイトル取得
// document.querySelectorAll('td.Body_M9')[1].innerText;

// テキスト取得
// const elm = await page.$('h2');
// let value = await(await elm.getProperty('textContent')).jsonValue();
// console.log(value);

// const scrapingData = await page.evaluate(() => {
//   const dataList = [];
//   const nodeList = document.querySelectorAll('tr');
//   nodeList.forEach((_node) => {
//     dataList.push(_node.innerText);
//   });
//   return dataList;
// });
