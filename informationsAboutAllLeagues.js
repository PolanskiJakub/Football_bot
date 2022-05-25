var serviceAccount = require("./footballBot.json");
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
(async () => {
  let leagues = ["Ekstraklasa", "LaLiga", "Premier League", "Serie A"];
  for (let x = 0; x < leagues.length; x++) {
    let avarageWinratio = 0;
    let leagueRef = db.collection(leagues[x]);
    teamNames = await leagueRef.get().then((querySnapshot) => {
      let teamNames = [];
      querySnapshot.forEach((document) => {
        teamNames.push(document.data().teamName);
      });
      return teamNames;
    });
    for (let y = 0; y < teamNames.length; y++) {
      let winratio = await db
        .collection(leagues[x])
        .doc(teamNames[y])
        .get()
        .then((doc) => {
          return doc.data().winratio;
        });
      avarageWinratio += winratio;
      if (y === teamNames.length - 1) {
        avarageWinratio = avarageWinratio / teamNames.length;
      }
    }
    let data = {
      avarageWinratio: avarageWinratio,
    };
    db.collection("LeagueInformations").doc(leagues[x]).set(data);
  }
})();
