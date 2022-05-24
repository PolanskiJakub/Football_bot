const puppeteer = require("puppeteer");
fs = require("fs");
var admin = require("firebase-admin");
var serviceAccount = require("./footballBot.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
(async () => {
  let checkAuthorizationVariable = 1;
  let trueLeagueName = [
    "Premier League",
    "Ligue 1",
    "Bundesliga",
    "Serie A",
    "LaLiga",
    "Ekstraklasa",
  ];
  let trueUrl = [
    "https://www.flashscore.com/football/england/premier-league/",
    "https://www.flashscore.com/football/france/ligue-1/",
    "https://www.flashscore.com/football/germany/bundesliga/",
    "https://www.flashscore.com/football/italy/serie-a/",
    "https://www.flashscore.com/football/spain/laliga/",
    "https://www.flashscore.com/football/poland/ekstraklasa/",
  ];
  let matchResult = ["W", "D", "L"];
  let checkVariable = 1;
  let previousCheckVariable = 0;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  url = "https://www.flashscore.com";
  try {
    await page.goto(url);
  } catch (err) {
    await page.goto(url);
  }
  await page.setViewport({ width: 1821, height: 1010 });
  const leaguesNames = await page.evaluate(() =>
    Array.from(document.querySelectorAll("span.leftMenu__text")).map(function (
      firstChild
    ) {
      return firstChild.innerText;
    })
  );
  for (let x = 0; x < trueUrl.length; x++) {
    let trueTeamsIDHome, trueTeamsIDAway;
    await page.goto(trueUrl[x], { waitUntil: "networkidle2" });
    await page.setViewport({ width: 1821, height: 1010 });
    const teamsUrl = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("a.tableCellParticipant__image")
      ).map(function (firstChild) {
        return firstChild.href + "results/";
      })
    );
    const trueTeamName = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a.tableCellParticipant__name")).map(
        function (firstChild) {
          return firstChild.innerText;
        }
      )
    );
    for (let y = 0; y < teamsUrl.length; y++) {
      let urlNumber1,
        urlNumber2,
        urlValidation1 = 1,
        urlValidation2 = 1;
      let allResults = [];
      await page.goto(teamsUrl[y], { waitUntil: "networkidle2" });
      const teamResults = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "span.event__title--name, span.wld.wld--d, span.wld.wld--l,span.wld.wld--w, span.wld.wld--lo, span.wld.wld--wo"
          )
        ).map(function (firstChild) {
          return firstChild.innerText;
        })
      );
      const allLeagues = await page.evaluate(() =>
        Array.from(document.querySelectorAll("span.event__title--name")).map(
          function (firstChild) {
            return firstChild.innerText;
          }
        )
      );
      const awayMatches = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "div.event__participant.event__participant--away"
          )
        ).map(function (firstChild) {
          return firstChild.innerText;
        })
      );
      const homeMatches = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "div.event__participant.event__participant--home"
          )
        ).map(function (firstChild) {
          return firstChild.innerText;
        })
      );
      const teamsId = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "div.event__match.event__match--static.event__match--twoLine"
          )
        ).map(function (firstChild) {
          return firstChild.id;
        })
      );
      for (let z = 0; z < teamResults.length; z++) {
        if (urlValidation1 === 1 && homeMatches[z] === trueTeamName[y]) {
          urlNumber1 = z;
          urlValidation1 = 0;
        }
        if (urlValidation2 === 1 && awayMatches[z] === trueTeamName[y]) {
          urlNumber2 = z;
          urlValidation2 = 0;
        }
      }
      for (let z = 0; z < teamResults.length; z++) {
        if (teamResults[z] === trueLeagueName[x]) {
          checkVariable = 1;
          previousCheckVariable = 0;
          continue;
        }
        if (
          teamResults != leaguesNames[x] &&
          teamResults[z].length > 2 &&
          previousCheckVariable === 1
        ) {
          previousCheckVariable = 0;
          urlValidation1 = 0;
          continue;
        }

        if (
          checkVariable === 1 ||
          (teamResults[z].length < 2 && previousCheckVariable === 1)
        ) {
          for (let a = 0; a < matchResult.length; a++) {
            if (teamResults[z] == matchResult[a])
              allResults.push(teamResults[z]);
          }
          previousCheckVariable = 1;
          continue;
        }
      }
      // console.log(allResults);
      let temporaryVariable = teamsId[urlNumber1].slice(
        4,
        teamsId[urlNumber1].length
      );
      let temporaryVariable2 = teamsId[urlNumber2].slice(
        4,
        teamsId[urlNumber2].length
      );
      trueTeamsIDHome = temporaryVariable;
      trueTeamsIDAway = temporaryVariable2;
      console.log(trueTeamsIDAway);
      let homeURL =
        "https://www.flashscore.com/match/" + trueTeamsIDHome + "/#/h2h/home";
      let awayURL =
        "https://www.flashscore.com/match/" + trueTeamsIDAway + "/#/h2h/away";
      await page.goto(homeURL, { waitUntil: "networkidle0" });
      await page.screenshot({ path: "example.png" });

      // for (let z = 0; z < 1; z++) {
      //   await page.waitForSelector(
      //     "#detail > .h2hSection > .h2h > .h2h__section:nth-child(1) > .h2h__showMore"
      //   );
      //   await page.click(
      //     "#detail > .h2hSection > .h2h > .h2h__section:nth-child(1) > .h2h__showMore"
      //   );
      //   await page.waitForTimeout(500);
      // }

      const homeResults = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "div.wld.wld--d, div.wld.wld--l,div.wld.wld--w, div.wld.wld--lo, div.wld.wld--wo"
          )
        ).map(function (firstChild) {
          return firstChild.innerText;
        })
      );
      await page.goto(awayURL, { waitUntil: "networkidle0" });
      await page.screenshot({ path: "example2.png" });
      const awayResults = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll(
            "div.wld.wld--d, div.wld.wld--l,div.wld.wld--w, div.wld.wld--lo, div.wld.wld--wo"
          )
        ).map(function (firstChild) {
          return firstChild.innerText;
        })
      );
      // console.log(awayResults);
      // console.log(homeResults);
      // console.log(trueTeamName[y]);
      let data = {
        teamName: trueTeamName[y],
        teamResults: allResults,
        place: y + 1,
        homeMatches: homeResults,
        awayMatches: awayResults,
      };
      db.collection(trueLeagueName[x]).doc(data.teamName.toString()).set(data);
    }
  }
  await browser.close();
})();
