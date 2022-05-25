fs = require("fs");
var admin = require("firebase-admin");
var serviceAccount = require("./footballBot.json");
const { match } = require("assert");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();
let leagues = ["Ekstraklasa", "LaLiga", "Premier League", "Serie A"];
(async () => {
  for (let x = 0; x < leagues.length; x++) {
    let leagueRef = db.collection(leagues[x]);
    let teamNames = await leagueRef.get().then((querySnapshot) => {
      let teamNames = [];
      querySnapshot.forEach((document) => {
        teamNames.push(document.data().teamName);
      });
      return teamNames;
    });
    let avarageWinratio = await db
      .collection("LeagueInformations")
      .doc(leagues[x])
      .get()
      .then((doc) => {
        return doc.data().avarageWinratio;
      });
    console.log(avarageWinratio);
    for (let y = 0; y < teamNames.length; y++) {
      let teamStatus;
      let value = 0,
        valueAway = 0,
        valueHome = 0;
      let matchesResults = await db
        .collection(leagues[x])
        .doc(teamNames[y])
        .get()
        .then((doc) => {
          return doc.data().teamResults;
        });
      let matchesResultsHome = await db
        .collection(leagues[x])
        .doc(teamNames[y])
        .get()
        .then((doc) => {
          return doc.data().homeMatches;
        });
      let matchesResultsAway = await db
        .collection(leagues[x])
        .doc(teamNames[y])
        .get()
        .then((doc) => {
          return doc.data().awayMatches;
        });
      for (let z = 0; z < matchesResults.length; z++) {
        if (matchesResults[z] === "W") {
          value++;
        }
        if (z === matchesResults.length - 1) {
          value = value / matchesResults.length;
        }
      }
      for (let z = 0; z < matchesResultsHome.length; z++) {
        if (matchesResultsHome[z] === "W") {
          valueHome++;
        }
        if (z === matchesResultsHome.length - 1) {
          valueHome = valueHome / matchesResultsHome.length;
        }
      }
      for (let z = 0; z < matchesResultsAway.length; z++) {
        if (matchesResultsAway[z] === "W") {
          valueAway++;
        }
        if (z === matchesResultsAway.length - 1) {
          valueAway = valueAway / matchesResultsAway.length;
        }
      }
      if (value > avarageWinratio + 0.4 * avarageWinratio)
        teamStatus = "Strong Team";
      else if (value < avarageWinratio - 0.1 * avarageWinratio)
        teamStatus = "Weak Team";
      else teamStatus = "Avarage Team";
      let data = {
        winratio: value,
        winratioHome: valueHome,
        winratioAway: valueAway,
        teamStatus: teamStatus,
      };
      await db.collection(leagues[x]).doc(teamNames[y]).update(data);
    }
  }
})();
