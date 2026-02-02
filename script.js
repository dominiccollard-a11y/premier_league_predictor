const teams = [
  { name: "Arsenal", points: 58, played: 27 },
  { name: "Aston Villa", points: 52, played: 27 },
  { name: "Bournemouth", points: 36, played: 27 },
  { name: "Brentford", points: 34, played: 27 },
  { name: "Brighton & Hove Albion", points: 41, played: 27 },
  { name: "Burnley", points: 27, played: 27 },
  { name: "Chelsea", points: 45, played: 27 },
  { name: "Crystal Palace", points: 32, played: 27 },
  { name: "Everton", points: 30, played: 27 },
  { name: "Fulham", points: 39, played: 27 },
  { name: "Liverpool", points: 61, played: 27 },
  { name: "Luton Town", points: 26, played: 27 },
  { name: "Manchester City", points: 59, played: 27 },
  { name: "Manchester United", points: 44, played: 27 },
  { name: "Newcastle United", points: 43, played: 27 },
  { name: "Nottingham Forest", points: 29, played: 27 },
  { name: "Sheffield United", points: 19, played: 27 },
  { name: "Tottenham Hotspur", points: 53, played: 27 },
  { name: "West Ham United", points: 40, played: 27 },
  { name: "Wolverhampton Wanderers", points: 37, played: 27 }
];

const form = document.getElementById("form");
const fixture = document.getElementById("fixture");
const history = document.getElementById("history");
const weightForm = document.getElementById("weight-form");
const weightFixture = document.getElementById("weight-fixture");
const weightHistory = document.getElementById("weight-history");

const fixtureOutput = document.getElementById("fixture-output");
const historyOutput = document.getElementById("history-output");
const weightFormOutput = document.getElementById("weight-form-output");
const weightFixtureOutput = document.getElementById("weight-fixture-output");
const weightHistoryOutput = document.getElementById("weight-history-output");

const teamSelect = document.getElementById("team");
const predictedPosition = document.getElementById("predicted-position");
const resultTeam = document.getElementById("result-team");
const projectedPoints = document.getElementById("projected-points");
const confidence = document.getElementById("confidence");
const confidenceBar = document.getElementById("confidence-bar");
const insightList = document.getElementById("insight-list");

const stageBenchmarks = [
  { position: 1, points: 88 },
  { position: 2, points: 82 },
  { position: 3, points: 75 },
  { position: 4, points: 70 },
  { position: 5, points: 66 },
  { position: 6, points: 62 },
  { position: 7, points: 58 },
  { position: 8, points: 55 },
  { position: 9, points: 52 },
  { position: 10, points: 49 },
  { position: 11, points: 46 },
  { position: 12, points: 44 },
  { position: 13, points: 42 },
  { position: 14, points: 40 },
  { position: 15, points: 38 },
  { position: 16, points: 36 },
  { position: 17, points: 34 },
  { position: 18, points: 31 },
  { position: 19, points: 28 },
  { position: 20, points: 22 }
];

const formatPosition = (position) => {
  if (position === 1) return "1st";
  if (position === 2) return "2nd";
  if (position === 3) return "3rd";
  return `${position}th`;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getConfidence = (fixtureDifficulty, formPpg, historyDelta) => {
  const base = 62;
  const formBoost = (formPpg - 1.4) * 12;
  const fixturePenalty = (fixtureDifficulty - 3) * 6;
  const historyBoost = historyDelta * 2.5;
  return clamp(Math.round(base + formBoost - fixturePenalty + historyBoost), 45, 90);
};

const predict = () => {
  const selectedTeam = teams[teamSelect.selectedIndex];
  const formPpg = Number.parseFloat(form.value);
  const fixtureDifficulty = Number.parseFloat(fixture.value);
  const historyDelta = Number.parseFloat(history.value);
  const weightFormValue = Number.parseFloat(weightForm.value);
  const weightFixtureValue = Number.parseFloat(weightFixture.value);
  const weightHistoryValue = Number.parseFloat(weightHistory.value);

  const remainingMatches = 38 - selectedTeam.played;
  const fixtureModifier = 1.2 - fixtureDifficulty * 0.12;
  const historyModifier = 1 + historyDelta / 20;

  const weightedPpg =
    formPpg * weightFormValue +
    1.4 * weightFixtureValue * fixtureModifier +
    1.3 * weightHistoryValue * historyModifier;

  const projectedTotal = Math.round(selectedTeam.points + weightedPpg * remainingMatches);
  const match = stageBenchmarks.find((benchmark) => projectedTotal >= benchmark.points);
  const position = match ? match.position : 20;

  const confidenceScore = getConfidence(fixtureDifficulty, formPpg, historyDelta);

  predictedPosition.textContent = formatPosition(position);
  resultTeam.textContent = selectedTeam.name;
  projectedPoints.textContent = projectedTotal;
  confidence.textContent = `${confidenceScore}%`;
  confidenceBar.style.width = `${confidenceScore}%`;

  const insights = [
    `Current form contributes ${Math.round(formPpg * weightFormValue * 10)}% of projected points.`,
    `Fixture difficulty score of ${fixtureDifficulty.toFixed(1)} adjusts run-in expectations.`,
    `Historical matchups add ${historyDelta >= 0 ? "a boost" : "a drag"} of ${historyDelta} points.`
  ];

  insightList.innerHTML = "";
  insights.forEach((text) => {
    const li = document.createElement("li");
    li.textContent = text;
    insightList.appendChild(li);
  });
};

const syncOutputs = () => {
  fixtureOutput.textContent = Number.parseFloat(fixture.value).toFixed(1);
  historyOutput.textContent = `${Number.parseFloat(history.value) >= 0 ? "+" : ""}${Number.parseFloat(
    history.value
  ).toFixed(1)}`;
  weightFormOutput.textContent = Number.parseFloat(weightForm.value).toFixed(2);
  weightFixtureOutput.textContent = Number.parseFloat(weightFixture.value).toFixed(2);
  weightHistoryOutput.textContent = Number.parseFloat(weightHistory.value).toFixed(2);
};

const populateTeams = () => {
  teams.forEach((team) => {
    const option = document.createElement("option");
    option.textContent = team.name;
    teamSelect.appendChild(option);
  });
  teamSelect.selectedIndex = teams.findIndex((team) => team.name === "Tottenham Hotspur");
};

[form, fixture, history, weightForm, weightFixture, weightHistory, teamSelect].forEach((input) => {
  input.addEventListener("input", () => {
    syncOutputs();
    predict();
  });
});

document.getElementById("predictor-form").addEventListener("submit", (event) => {
  event.preventDefault();
  syncOutputs();
  predict();
});

populateTeams();
syncOutputs();
predict();
