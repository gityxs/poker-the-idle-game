import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import chip from './poker-chip.svg';
import back from './back_optm.svg';

import { Analytics } from '@vercel/analytics/react';

import Decimal from 'break_eternity.js';
import useInterval from './useInterval';

import useSound from 'use-sound';
import bigWin from './sounds/bigWin.mp3';
import dealingCard from './sounds/dealingCard.mp3';
import chips from './sounds/chips.mp3';
import plunger from './sounds/plunger.mp3';
import bite from './sounds/bite.mp3';
import pops from './sounds/rising-pops.mp3';
import pop from './sounds/pop.mp3';

import { deserialize, deserializeArray, instanceToPlain, plainToClass, plainToInstance, serialize } from "class-transformer";

import { Splide, SplideSlide, SplideTrack } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const Hand = require("pokersolver").Hand;

const deck: string[] = ["2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "10c", "Jc", "Qc", "Kc", "Ac",
                        "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "10d", "Jd", "Qd", "Kd", "Ad",
                        "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "Jh", "Qh", "Kh", "Ah",
                        "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "10s", "Js", "Qs", "Ks", "As"];

const cardFaces: string[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];

let ascendedCardsDict: { [cardCode: string]: boolean } = {
  "2c": false,
  "3c": false,
  "4c": false,
  "5c": false,
  "6c": false,
  "7c": false,
  "8c": false,
  "9c": false,
 "10c": false,
  "Jc": false,
  "Qc": false,
  "Kc": false,
  "Ac": false,
  "2d": false,
  "3d": false,
  "4d": false,
  "5d": false,
  "6d": false,
  "7d": false,
  "8d": false,
  "9d": false,
 "10d": false,
  "Jd": false,
  "Qd": false,
  "Kd": false,
  "Ad": false,
  "2h": false,
  "3h": false,
  "4h": false,
  "5h": false,
  "6h": false,
  "7h": false,
  "8h": false,
  "9h": false,
 "10h": false,
  "Jh": false,
  "Qh": false,
  "Kh": false,
  "Ah": false,
  "2s": false,
  "3s": false,
  "4s": false,
  "5s": false,
  "6s": false,
  "7s": false,
  "8s": false,
  "9s": false,
 "10s": false,
  "Js": false,
  "Qs": false,
  "Ks": false,
  "As": false
}

const suffixes_short: string[] = ["", "k", "M", "B", "T", "qd", "Qn", "sx", "Sp", "O", "N", "de", "Ud", "DD", "tdD", "qdD", "QnD", "sxD", "SpD", "Ocd", "NvD", "Vgn", "UVg", "DVg", "TVg", "qtV", "QnV", "SeV", "SPG", "OVG", "NVG", "PLSTOP"];
const suffixes_long: string[] = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintilion", "Sextillion", "Septillion", "Octillion", "Nonillion",
                                     "Decillion", "Undecillion", "Duodecillion", "Tredecillion", "Quattuordecillion", "Quindecillion", "Sedecillion", "Septendecillion", "Octodecillion", "Novemdecillion",
                                     "Vigintillion", "Unvigintillion", "Duovigintillion", "Tresvigintillion", "Quattuorvigintillion", "Quinvigintillion", "Sesvigintillion", "Septemvigintillion", "Octovigintilion", "Novemvigintillion", "PLEASESTOP"];

const rankMultiplierDict: { [rank: string]: number} = {
  "High Card": 1,
  "Pair": 10,
  "Two Pair": 100,
  "Three Pair": 500,
  "Three of a Kind": 1_000,
  "Two Three Of a Kind": 5000,
  "Straight": 10_000,
  "Flush": 100_000,
  "Full House": 1_000_000,
  "Three of a Kind with Two Pair": 5_000_000,
  "Four of a Kind": 10_000_000,
  "Five of a Kind": 50_000_000,
  "Straight Flush": 100_000_000,
  "Royal Flush": 1_000_000_000,
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function displayDecimal(num: Decimal):string {
  if(!num)
    return "ERROR";

  let counterDivision = 0;
  while (num.cmp(new Decimal(1000)) >= 0) {
    num = num.div(1000);
    counterDivision += 1;
  }

  return Math.round((num.mag + Number.EPSILON) * 100) / 100 + "" + suffixes_short[counterDivision];
}

function getLongPrefix(num: Decimal):string {
  let counterDivision = 0;

  while (num.cmp(new Decimal(1000)) >= 0) {
    num = num.div(1000);
    counterDivision += 1;
  }

  return Math.round((num.mag + Number.EPSILON) * 100) / 100 + " " + suffixes_long[counterDivision];
}

const COST_MULT:number = 1.08;

// function costForN(cost: Decimal, amount: number):Decimal {
//   let partial = new Decimal(cost);
//   let result = new Decimal(0);

//   for(let i = 0; i < amount; i++) {
//     result = result.add(partial);
//     partial = partial.times(COST_MULT).round();
//   }
//   return result;
// }

// function costAfterN(cost: Decimal, amount: number):Decimal {
//   let partial = new Decimal(cost);

//   for(let i = 0; i < amount; i++) {
//     partial = partial.times(COST_MULT).round();
//   }
    
//   return partial;
// }

function costForN(cost: Decimal, amount: number):Decimal {
  return cost.times(1 + (COST_MULT*(Math.pow(COST_MULT, amount-1)-1)/(COST_MULT-1)));
}


function costAfterN(cost: Decimal, amount: number): Decimal {
  return cost.times(Math.pow(COST_MULT, amount));
}

function calcMaxBuyable(cost: Decimal, totalChips: Decimal): number {
  let count = 1;
  while(totalChips.cmp(costForN(cost, count)) > 0)
    count += 1;
  return Math.max(1, count-1);
}

const baseIncrementHandSizeCost = new Decimal(10);
const baseDealerInterval = 15_000;
const baseDealerDecreaseTimeCost = new Decimal(100_000);
const baseAnimDuration = 300;
const baseDecreaseAnimDuration = new Decimal(100_000);
const baseSuitUpgradeCost = new Decimal(100_000);

const ascendedCardMultiplier = new Decimal(1_000_000);

class CardSlot {
  id: number;
  cardCode: string;
  multiplier: Decimal;
  result: Decimal;
  upgradeCost: Decimal;

  constructor(id: number, cardCode: string, multiplier: Decimal, result: Decimal, upgradeCost: Decimal) {
    this.id = id;
    this.cardCode = cardCode;
    this.multiplier = multiplier;
    this.result = result;
    this.upgradeCost = upgradeCost;
  }
}

enum Suit {
  Clubs = 'c',
  Diamonds = 'd',
  Hearts = 'h',
  Spades = 's'
}

class SideUpgrade {
  cost: Decimal;
  multiplier: Decimal;

  constructor(cost: Decimal, multiplier: Decimal) {
    this.cost = cost;
    this.multiplier = multiplier;
  }
}

class SuitUpgrade extends SideUpgrade {
  suit: Suit;
  symbol: string;

  constructor(suit: Suit, symbol: string, cost: Decimal, multiplier: Decimal) {
    super(cost, multiplier);
    this.suit = suit;
    this.symbol = symbol;
  }
}

// ---- bugs
// DONE no duplicate cards on deal 
// DONE better caching images (each roll sends requests) (perhaps create every possible image and then conditionally render it (dict with cardCode: <img>))
// DONE allinea chip
// DONE disable dealer cost button
// DONE displayString on result over cards
// DONE reset anim delay
// TODO fix overflow (currently hidden)

// ---- features
// NOPE next rows (the ??? upgrade)
// DONE buy 1x 10x 100x
// DONE auto dealer
// DONE cards upgrades (left side)
// DONE dealer upgrades (right side)
// DONE progression 
// DONE progress indicator (7/52)
// DONE side upgrades
// DONE multiple buy left upgrades
// DONE prestige
// DONE saving
// DONE animation delay system
// DONE sound settings
// DONE ascension system
// DONE buy MAX
// TODO pluses between results
// TODO rebalance (game too fast) (either COST_MULT or the hand rank multipliers)

let allCardsImages = Object.assign({}, ...deck.map((card, index) => ({[card]: <img key={index} src={require("./out/"+card+".svg")} alt="card"/>})));
allCardsImages["back"] = <img key={-1} src={back} alt="card"/>

let lastTime = 0;
let dealDelay = 500;

function useForceUpdate(){
  const [value, setValue] = useState(0); // integer state
  return () => setValue(value => value + 1); // update state to force render
  // An function that increment 👆🏻 the previous state like here 
  // is better than directly setting `value + 1`
}

function App() {
  const forceUpdate = useForceUpdate();

  // permanent state
  const [handCardCodes, setHandCardCodes] = useState<string[]>([]);
  const [handMultipliers, setHandMultipliers] = useState<Decimal[]>([]);
  const [handResults, setHandResults] = useState<Decimal[]>([]);
  const [handUpgradeCosts, setHandUpgradeCosts] = useState<Decimal[]>([]);

  const [totalChips, setTotalChips] = useState<Decimal>(new Decimal(10));
  const [totalChipsGenerated, setTotalChipsGenerated] = useState<Decimal>(new Decimal(0));
  const [incrementHandSizeCost, setIncrementHandSizeCost] = useState<Decimal>(baseIncrementHandSizeCost);
  const [isLeftUpgradesBought, setLeftUpgradeBought] = useState(false);
  const [isRightUpgradesBought, setRightUpgradeBought] = useState(false);
  const [suitsUpgrades, setSuitsUpgrades] = useState<SuitUpgrade[]>([
    new SuitUpgrade(Suit.Hearts,  '♥️', new Decimal(100_000), new Decimal(1)),
    new SuitUpgrade(Suit.Clubs,   '♣️', new Decimal(100_000), new Decimal(1)),
    new SuitUpgrade(Suit.Diamonds,'♦️', new Decimal(100_000), new Decimal(1)),
    new SuitUpgrade(Suit.Spades,  '♠️', new Decimal(100_000), new Decimal(1)),
  ]);
  const [hasBoughtDealer, setHasBoughtDealer] = useState(false);
  const [dealerInterval, setDealerInterval] = useState(baseDealerInterval);
  const [dealerDecreaseTimeCost, setDealerDecreaseTimeCost] = useState(baseDealerDecreaseTimeCost);
  const [animDuration, setAnimDuration] = useState<number>(300);
  const [decreaseAnimDurationCost, setDecreaseAnimDurationCost] = useState<Decimal>(baseDecreaseAnimDuration);

  const [prestigeMultiplier, setPrestigeMultiplier] = useState(new Decimal(1));
  const [globalBonusMultiplier, setGlobalBonusMultiplier] = useState(new Decimal(1));
  const [ascendedCardsCount, setAscendedCardsCount] = useState<number>(0);

  // on the fly
  const [handRank, setHandRank] = useState<string>("");
  const [totalResult, setTotalResult] = useState<Decimal>(new Decimal(0));
  const [buyAmount, setBuyAmount] = useState(1);
  const [canBuyLeftUpgrades, setCanBuyLeftUpgrades] = useState(false);
  const [canBuyRightUpgrades, setCanBuyRightUpgrades] = useState(false);
  const [isSoundEnabled, setSoundEnabled] = useState(true);

  const totalChipsDiv = useRef<HTMLDivElement>(null);
  const rankSection = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLDivElement>(null);
  const prestigeModal = useRef<HTMLDivElement>(null);
  const infoModal = useRef<HTMLDivElement>(null);
  const ascensionModal = useRef<HTMLDivElement>(null);
  const buyAmountButton1   = useRef<HTMLButtonElement>(null);
  const buyAmountButton10  = useRef<HTMLButtonElement>(null);
  const buyAmountButton100 = useRef<HTMLButtonElement>(null);
  const buyAmountButtonMax = useRef<HTMLButtonElement>(null);

  const leftUpgradesCost = new Decimal(50_000_000);
  const rightUpgradesCost = new Decimal(50_000_000_000);

  const [playDealingCard] = useSound(dealingCard, {soundEnabled: isSoundEnabled});
  const [playBigWin] = useSound(bigWin, {soundEnabled: isSoundEnabled});
  const [playChips] = useSound(chips, {soundEnabled: isSoundEnabled});
  const [playPlunger] = useSound(plunger, {soundEnabled: isSoundEnabled});
  const [playBite] = useSound(bite, {soundEnabled: isSoundEnabled});
  const [playPops] = useSound(pops, {soundEnabled: isSoundEnabled});
  const [playPop] = useSound(pop, {soundEnabled: isSoundEnabled});

  function resetProgressBar() {
    if (progressBar.current) {
      progressBar.current.classList.remove("goToFullWidth");
      void progressBar.current.offsetWidth;
      progressBar.current.classList.add("goToFullWidth");
    }
  }

  useEffect(() => {
    setPrestigeMultiplier(totalChipsGenerated.div(1_000_000_000_000).floor())
  }, [totalChipsGenerated]);

  useEffect(() => {
    setTimeout(handleSave, 500);
    if (totalChips.cmp(leftUpgradesCost.times(0.8)) > 0)
      setCanBuyLeftUpgrades(true);
    if (totalChips.cmp(rightUpgradesCost.times(0.8)) > 0)
      setCanBuyRightUpgrades(true);
  }, [totalChips]);

  useEffect(() => {
    dealDelay = Math.round(50 + animDuration + (handCardCodes.length-1) * animDuration/6);
  }, [handCardCodes.length, animDuration]);

  useInterval(() => {
    if (!hasBoughtDealer)
      return;
    resetProgressBar();
    handleDeal();
  }, dealerInterval);

  useEffect(() => {
    setTimeout(() => prestigeModal.current?.classList.remove("invisible"), 2000);
    setTimeout(() => infoModal.current?.classList.remove("invisible"), 2000);
    setTimeout(() => ascensionModal.current?.classList.remove("invisible"), 2000);
    handleLoad();
  }, []);

  function handleDealPlayer() {
    if (Date.now() - lastTime < dealDelay)
      return
    lastTime = Date.now();
    handleDeal();
  }

  function handleDeal() {
    if (handCardCodes.length === 0)
      return;

    playDealingCard();

    shuffleDeck();
    const dealtCards = deck.slice(0, handCardCodes.length);
    
    setHandCardCodes(dealtCards);
    const results = dealtCards.map((cardDealt, index) => new Decimal(cardFaces.indexOf(cardDealt.slice(0, -1)) + 2)
                                                                      .times(handMultipliers[index])
                                                                      .times(suitsUpgrades.find((upgrade) => upgrade.suit === dealtCards[index].slice(-1))!.multiplier)
                                                                      .times((ascendedCardsDict[dealtCards[index]] ? ascendedCardMultiplier : 1)));
    setHandResults(results);

    const rank = Hand.solve(dealtCards).name;
    setHandRank(rank);

    const total = results.reduce((prev, curr) => prev.add(curr), new Decimal(0)).times(rankMultiplierDict[rank]).times(globalBonusMultiplier).round();
    setTotalResult(total);
    setTotalChips((prev) => prev.add(total));
    setTotalChipsGenerated((prev) => prev.add(total));

    if (rankSection.current) {
      rankSection.current.className = ""
      void rankSection.current.offsetWidth;
      if (rank === "High Card")
        rankSection.current.className = "pop"
      else if (rank === "Pair")
        rankSection.current.className = "pop-big"
      else {
        playBigWin();
        rankSection.current.className = "pop-huge"
      }
    }
    if (totalChipsDiv.current) {
      totalChipsDiv.current.className = "";
      void totalChipsDiv.current.offsetWidth;
      totalChipsDiv.current.className = "shake";
    }
  }

  function handleIncrementHandSizeNew() {
    if (handCardCodes.length >= 52)
      return;
    if (totalChips.cmp(incrementHandSizeCost) < 0)
      return
    setTotalChips(totalChips.sub(incrementHandSizeCost));

    setHandCardCodes([...handCardCodes, "back"]);
    setHandMultipliers([...handMultipliers, new Decimal(1)]);
    setHandResults([...handResults, new Decimal(2)]);
    setHandUpgradeCosts([...handUpgradeCosts, incrementHandSizeCost]);

    setIncrementHandSizeCost((prev) => prev.mul(10));
    
    playPop();
  }
  //
  function handleUpgradeNew(id: number, amount: number) {
    amount = (amount === -1 ? calcMaxBuyable(handUpgradeCosts[id], totalChips) : amount);
    if (totalChips.cmp(costForN(handUpgradeCosts[id], amount)) < 0)
      return;
    forceUpdate();
    playChips();

    setTotalChips(totalChips.sub(costForN(handUpgradeCosts[id], amount)));

    handMultipliers[id] = handMultipliers[id].add(amount);
    setHandMultipliers(handMultipliers);
    
    handUpgradeCosts[id] = costAfterN(handUpgradeCosts[id], amount);
    setHandUpgradeCosts(handUpgradeCosts);
  }

  function handleChangeBuyAmount(amount: number) {
    setBuyAmount(amount);
    playBite();
    switch (amount) {
      case 1:
        buyAmountButton1.current?.classList.add("btn-disabled");
        buyAmountButton10.current?.classList.remove("btn-disabled");
        buyAmountButton100.current?.classList.remove("btn-disabled");
        buyAmountButtonMax.current?.classList.remove("btn-disabled");
        break;
      case 10:
        buyAmountButton1.current?.classList.remove("btn-disabled");
        buyAmountButton10.current?.classList.add("btn-disabled");
        buyAmountButtonMax.current?.classList.remove("btn-disabled");
        buyAmountButton100.current?.classList.remove("btn-disabled");
        break;
      case 100:
        buyAmountButton1.current?.classList.remove("btn-disabled");
        buyAmountButton10.current?.classList.remove("btn-disabled");
        buyAmountButton100.current?.classList.add("btn-disabled");
        buyAmountButtonMax.current?.classList.remove("btn-disabled");
        break;
      case -1:
        buyAmountButton1.current?.classList.remove("btn-disabled");
        buyAmountButton10.current?.classList.remove("btn-disabled");
        buyAmountButton100.current?.classList.remove("btn-disabled");
        buyAmountButtonMax.current?.classList.add("btn-disabled");
    }
  }

  function handleUpgradeSuit(suit: Suit, amount: number) {
    const new_suitUpgrade = suitsUpgrades.find(upgrade => upgrade.suit === suit);
    if (!new_suitUpgrade)
      return;
    amount = (amount === -1 ? calcMaxBuyable(new_suitUpgrade.cost, totalChips) : amount);
    
    if (totalChips.cmp(costForN(new_suitUpgrade.cost, amount)) < 0)
      return;
    playChips();
    setTotalChips(totalChips.sub(costForN(new_suitUpgrade.cost, amount)));
    new_suitUpgrade.cost = costAfterN(new_suitUpgrade.cost, amount);
    new_suitUpgrade.multiplier = new_suitUpgrade.multiplier.add(amount);
    setSuitsUpgrades(suitsUpgrades.map((suitUpgrade) => {
      if (suitUpgrade.suit !== suit)
        return suitUpgrade;
      return new_suitUpgrade;
    }));
    
  }

  function handleBuyLeftUpgrades() {
    if (isLeftUpgradesBought)
      return;
    if (totalChips.cmp(leftUpgradesCost) < 0)
      return;
    playPlunger();
    setTotalChips(totalChips.sub(leftUpgradesCost));
    setLeftUpgradeBought(true);
  }

  function handleBuyRightUpgrades() {
    if (isRightUpgradesBought)
      return;
    if (totalChips.cmp(rightUpgradesCost) < 0)
      return;
    playPlunger();
    setTotalChips(totalChips.sub(rightUpgradesCost));
    setHasBoughtDealer(true);
    resetProgressBar();
    setDealerInterval(baseDealerInterval);
    setRightUpgradeBought(true);
  }

  function handleDecreseDealerTime() {
    if (totalChips.cmp(dealerDecreaseTimeCost) < 0)
      return;
    if (dealerInterval <= 3_000)
      return;
    playChips();
    setTotalChips(totalChips.sub(dealerDecreaseTimeCost));
    setDealerInterval((prev) => prev * 0.95);
    resetProgressBar();
    setDealerDecreaseTimeCost((prev) => prev.times(5));
  }

  function prestigeReset() {
    setPrestigeMultiplier(new Decimal(0));
    setTotalChipsGenerated(new Decimal(0));

    setHandCardCodes([]);
    setHandMultipliers([]);
    setHandResults([]);
    setHandUpgradeCosts([]);

    setTotalChips(new Decimal(10));
    setIncrementHandSizeCost(baseIncrementHandSizeCost);
    setLeftUpgradeBought(false);
    setRightUpgradeBought(false);
    setSuitsUpgrades([
      new SuitUpgrade(Suit.Hearts,  '♥️', baseSuitUpgradeCost, new Decimal(1)),
      new SuitUpgrade(Suit.Clubs,   '♣️', baseSuitUpgradeCost, new Decimal(1)),
      new SuitUpgrade(Suit.Diamonds,'♦️', baseSuitUpgradeCost, new Decimal(1)),
      new SuitUpgrade(Suit.Spades,  '♠️', baseSuitUpgradeCost, new Decimal(1)),
    ]);
    setHasBoughtDealer(false);
    setDealerInterval(baseDealerInterval);
    setDealerDecreaseTimeCost(baseDealerDecreaseTimeCost);
    setAnimDuration(baseAnimDuration);
    setDecreaseAnimDurationCost(baseDealerDecreaseTimeCost);
    setHandRank("");
    setTotalResult(new Decimal(0));
    progressBar.current?.classList.remove("goToFullWidth");
  }

  function ascensionReset() {
    prestigeReset();
    setGlobalBonusMultiplier(new Decimal(1));
  }

  function handleDoPrestige() {
    if (prestigeMultiplier.cmp(1) < 1)
      return
    handleToggleModal(prestigeModal);
    setGlobalBonusMultiplier(globalBonusMultiplier.add(prestigeMultiplier));
    prestigeReset();
    playPops();
  }

  function handleDecreaseAnimTime() {
    if (totalChips.cmp(decreaseAnimDurationCost) < 0)
      return;
    if (animDuration <= 100)
      return;
    playChips();
    setTotalChips(totalChips.sub(decreaseAnimDurationCost));
    setAnimDuration((prev) => prev * 0.95);
    setDecreaseAnimDurationCost((prev) => prev.times(5));
  }

  function handleDoAscend() {
    if (handCardCodes.length < 52)
      return;
    if (ascendedCardsCount >= 52)
      return;
    while(ascendedCardsDict[deck[0]]) 
      shuffleDeck()
    ascensionReset();
    playPops();
    handleToggleModal(ascensionModal);
    setAscendedCardsCount(ascendedCardsCount+1);
    ascendedCardsDict[deck[0]] = true;
  }

  function handleSave() {
    window.localStorage.setItem("hand-codes", JSON.stringify(handCardCodes));
    window.localStorage.setItem("hand-mult", JSON.stringify(instanceToPlain(handMultipliers)));
    window.localStorage.setItem("hand-res", JSON.stringify(instanceToPlain(handResults)));
    window.localStorage.setItem("hand-costs", JSON.stringify(instanceToPlain(handUpgradeCosts)));

    window.localStorage.setItem("total-chips", JSON.stringify(instanceToPlain(totalChips)));
    window.localStorage.setItem("total-chips-generated", JSON.stringify(instanceToPlain(totalChipsGenerated)));
    window.localStorage.setItem("increment-hand-cost", JSON.stringify(instanceToPlain(incrementHandSizeCost)));
    window.localStorage.setItem("is-left-bought", JSON.stringify(isLeftUpgradesBought));
    window.localStorage.setItem("is-right-bought", JSON.stringify(isRightUpgradesBought));

    window.localStorage.setItem("hearts-multip", JSON.stringify(instanceToPlain(suitsUpgrades[0].multiplier)));
    window.localStorage.setItem("clubs-multip", JSON.stringify(instanceToPlain(suitsUpgrades[1].multiplier)));
    window.localStorage.setItem("diamonds-multip", JSON.stringify(instanceToPlain(suitsUpgrades[2].multiplier)));
    window.localStorage.setItem("spades-multip", JSON.stringify(instanceToPlain(suitsUpgrades[3].multiplier)));
    window.localStorage.setItem("hearts-cost", JSON.stringify(instanceToPlain(suitsUpgrades[0].cost)));
    window.localStorage.setItem("clubs-cost", JSON.stringify(instanceToPlain(suitsUpgrades[1].cost)));
    window.localStorage.setItem("diamonds-cost", JSON.stringify(instanceToPlain(suitsUpgrades[2].cost)));
    window.localStorage.setItem("spades-cost", JSON.stringify(instanceToPlain(suitsUpgrades[3].cost)));

    window.localStorage.setItem("has-dealer", JSON.stringify(hasBoughtDealer));
    window.localStorage.setItem("dealer-interval", JSON.stringify(dealerInterval));
    window.localStorage.setItem("dealer-decrease-time-cost", JSON.stringify(instanceToPlain(dealerDecreaseTimeCost)));
    window.localStorage.setItem("anim-duration", JSON.stringify(animDuration));
    window.localStorage.setItem("decrease-anim-duration-cost", JSON.stringify(instanceToPlain(decreaseAnimDurationCost)));

    window.localStorage.setItem("prestige-multip", JSON.stringify(instanceToPlain(prestigeMultiplier)));
    window.localStorage.setItem("global-bonus-multip", JSON.stringify(instanceToPlain(globalBonusMultiplier)));

    window.localStorage.setItem("ascended-dict", JSON.stringify(ascendedCardsDict));
    window.localStorage.setItem("ascended-cards-count", JSON.stringify(ascendedCardsCount));
  }

  function handleLoad() {
    const saveHandCardCodes = window.localStorage.getItem("hand-codes");
    const loadHandCardCodes: string[] =  saveHandCardCodes ? JSON.parse(saveHandCardCodes) : [];
    setHandCardCodes(loadHandCardCodes);
    const saveHandMultipliers = window.localStorage.getItem("hand-mult");
    const loadHandMultipliers: Decimal[] =  saveHandMultipliers ? deserializeArray(Decimal, saveHandMultipliers) : [];
    setHandMultipliers(loadHandMultipliers);
    const saveHandResults = window.localStorage.getItem("hand-res");
    const loadHandResults: Decimal[] =  saveHandResults ? deserializeArray(Decimal, saveHandResults) : [];
    setHandResults(loadHandResults);
    const saveHandUpgradeCosts = window.localStorage.getItem("hand-costs");
    const loadHandUpgradeCosts: Decimal[] =  saveHandUpgradeCosts ? deserializeArray(Decimal, saveHandUpgradeCosts) : [];
    setHandUpgradeCosts(loadHandUpgradeCosts);

    const saveTotalChips = window.localStorage.getItem("total-chips");
    const loadTotalChips: Decimal =  saveTotalChips ? deserialize(Decimal, saveTotalChips) : new Decimal(10);
    setTotalChips(loadTotalChips);
    const saveTotalChipsGenerated = window.localStorage.getItem("total-chips-generated");
    const loadTotalChipsGenerated: Decimal =  saveTotalChipsGenerated ? deserialize(Decimal, saveTotalChipsGenerated) : new Decimal(0);
    setTotalChipsGenerated(loadTotalChipsGenerated);
    const saveIncrementHandSizeCost = window.localStorage.getItem("increment-hand-cost");
    const loadIncrementHandSizeCost: Decimal =  saveIncrementHandSizeCost ? deserialize(Decimal, saveIncrementHandSizeCost) : baseIncrementHandSizeCost;
    setIncrementHandSizeCost(loadIncrementHandSizeCost);
    const saveIsLeftUpgradesBought = window.localStorage.getItem("is-left-bought");
    const loadIsLeftUpgradesBought: boolean =  saveIsLeftUpgradesBought ? JSON.parse(saveIsLeftUpgradesBought) : false;
    setLeftUpgradeBought(loadIsLeftUpgradesBought);
    const saveIsRightUpgradesBought = window.localStorage.getItem("is-right-bought");
    const loadIsRightUpgradesBought: boolean =  saveIsRightUpgradesBought ? JSON.parse(saveIsRightUpgradesBought) : false;
    setRightUpgradeBought(loadIsRightUpgradesBought);

    const saveHeartsUpgrades = window.localStorage.getItem("hearts-multip");
    const loadHeartsUpgrades: Decimal =  saveHeartsUpgrades ? deserialize(Decimal, saveHeartsUpgrades) : new Decimal(1);
    const saveClubsUpgrades = window.localStorage.getItem("clubs-multip");
    const loadClubsUpgrades: Decimal =  saveClubsUpgrades ? deserialize(Decimal, saveClubsUpgrades) : new Decimal(1);
    const saveDiamondsUpgrades = window.localStorage.getItem("diamonds-multip");
    const loadDiamondsUpgrades: Decimal =  saveDiamondsUpgrades ? deserialize(Decimal, saveDiamondsUpgrades) : new Decimal(1);
    const saveSpadesUpgrades = window.localStorage.getItem("spades-multip");
    const loadSpadesUpgrades: Decimal =  saveSpadesUpgrades ? deserialize(Decimal, saveSpadesUpgrades) : new Decimal(1);
    const saveHeartsCost = window.localStorage.getItem("hearts-cost");
    const loadHeartsCost: Decimal =  saveHeartsCost ? deserialize(Decimal, saveHeartsCost) : baseSuitUpgradeCost;
    const saveClubsCost = window.localStorage.getItem("clubs-cost");
    const loadClubsCost: Decimal =  saveClubsCost ? deserialize(Decimal, saveClubsCost) : baseSuitUpgradeCost;
    const saveDiamondsCost = window.localStorage.getItem("diamonds-cost");
    const loadDiamondsCost: Decimal =  saveDiamondsCost ? deserialize(Decimal, saveDiamondsCost) : baseSuitUpgradeCost;
    const saveSpadesCost = window.localStorage.getItem("spades-cost");
    const loadSpadesCost: Decimal =  saveSpadesCost ? deserialize(Decimal, saveSpadesCost) : baseSuitUpgradeCost;
    setSuitsUpgrades([
      new SuitUpgrade(Suit.Hearts,  '♥️', loadHeartsCost, loadHeartsUpgrades),
      new SuitUpgrade(Suit.Clubs,   '♣️', loadClubsCost, loadClubsUpgrades),
      new SuitUpgrade(Suit.Diamonds,'♦️', loadDiamondsCost, loadDiamondsUpgrades),
      new SuitUpgrade(Suit.Spades,  '♠️', loadSpadesCost, loadSpadesUpgrades),
    ]);
    
    const saveHasBoughtDealer = window.localStorage.getItem("has-dealer");
    const loadHasBoughtDealer: boolean =  saveHasBoughtDealer ? JSON.parse(saveHasBoughtDealer) : false;
    setHasBoughtDealer(loadHasBoughtDealer);
    const saveDealerInterval = window.localStorage.getItem("dealer-interval");
    const loadDealerInterval: number =  saveDealerInterval ? JSON.parse(saveDealerInterval) : baseDealerInterval;
    setDealerInterval(loadDealerInterval);
    const saveDealerDecreaseTimeCost = window.localStorage.getItem("dealer-decrease-time-cost");
    const loadDealerDecreaseTimeCost: Decimal =  saveDealerDecreaseTimeCost ? deserialize(Decimal, saveDealerDecreaseTimeCost) : baseDealerDecreaseTimeCost;
    setDealerDecreaseTimeCost(loadDealerDecreaseTimeCost);
    const saveAnimDuration = window.localStorage.getItem("anim-duration");
    const loadAnimDuration: number =  saveAnimDuration ? JSON.parse(saveAnimDuration) : baseAnimDuration;
    setAnimDuration(loadAnimDuration);
    const saveDecreaseAnimDurationCost = window.localStorage.getItem("decrease-anim-duration-cost");
    const loadDecreaseAnimDurationCost: Decimal =  saveDecreaseAnimDurationCost ? deserialize(Decimal, saveDecreaseAnimDurationCost) : baseDecreaseAnimDuration;
    setDecreaseAnimDurationCost(loadDecreaseAnimDurationCost);

    const savePrestigeMultiplier = window.localStorage.getItem("prestige-multip");
    const loadPrestigeMultiplier: Decimal =  savePrestigeMultiplier ? deserialize(Decimal, savePrestigeMultiplier) : new Decimal(0);
    setPrestigeMultiplier(loadPrestigeMultiplier);
    const saveGlobalBonusMultiplier = window.localStorage.getItem("global-bonus-multip");
    const loadGlobalBonusMultiplier: Decimal =  saveGlobalBonusMultiplier ? deserialize(Decimal, saveGlobalBonusMultiplier) : new Decimal(1);
    setGlobalBonusMultiplier(loadGlobalBonusMultiplier);

    const saveAscendedCardsDict = window.localStorage.getItem("ascended-dict");
    const loadAscendedCardsDict: {[cardCode: string]: boolean} =  saveAscendedCardsDict ? JSON.parse(saveAscendedCardsDict) : ascendedCardsDict;
    ascendedCardsDict = loadAscendedCardsDict;
    const saveAscendedCardsCount = window.localStorage.getItem("ascended-cards-count");
    const loadAscendedCardsCount: number =  saveAscendedCardsCount ? JSON.parse(saveAscendedCardsCount) : 0;
    setAscendedCardsCount(loadAscendedCardsCount);
  }

  function handleToggleSound() {
    setSoundEnabled((prev) => !prev);
  }

  function handleToggleModal(modal: React.RefObject<HTMLDivElement>) {
    modal.current?.classList.toggle("exitModal");
    modal.current?.classList.toggle("enterModal");
    modal.current?.classList.toggle("!z-40");
  }

  let oneCardPerSlide: JSX.Element[] = [];
  for(let i = 0; i < handCardCodes.length; i++) {
    const cs: CardSlot = new CardSlot(i, handCardCodes[i], handMultipliers[i], handResults[i], handUpgradeCosts[i]);
    oneCardPerSlide.push(<SplideSlide key={i} className="w-fit !mr-3 last:!mr-0"><Card cardSlot={cs} handleUpgrade={handleUpgradeNew} buyAmount={buyAmount} totalChips={totalChips} animDuration={animDuration}/></SplideSlide>)
  }
  const suitsUpgradesComponents = suitsUpgrades.map((suitUpgrade, index) => <SuitUpgradeComponent key={index} suitUpgrade={suitUpgrade} handleUpgradeSuit={handleUpgradeSuit}  totalChips={totalChips} buyAmount={buyAmount} />)

  return (
    <>
      <div className="select-none">
        <div ref={prestigeModal} className="modal exitModal invisible">
          Are you sure you want to gain prestige?<br/>
          This will reset all your progress (except ascension) and grant you a bonus multiplier of <span className="text-purple-700">{getLongPrefix(prestigeMultiplier)}</span><br/>
          Current multiplier: <span className="text-purple-700">{getLongPrefix(globalBonusMultiplier)}</span><br/>
          New multiplier: <span className="text-purple-700">{getLongPrefix(globalBonusMultiplier.add(prestigeMultiplier))}</span><br/>
          <br/>
          <button onClick={handleDoPrestige} className="btn-purple px-10 py-3 bg-gradient-to-r from-purple-500 mr-3 text-white">Yes</button>
          <button onClick={() => handleToggleModal(prestigeModal)} className="btn drop-shadow-2xl px-10 py-3">No</button>
        </div>
        <div ref={infoModal} className="modal exitModal invisible">
          Thanks to these awesome projects:<br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://totalnonsense.com/open-source-vector-playing-cards/">Vector playing cards</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://github.com/typestack/class-transformer">class-transformer</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://github.com/Patashu/break_eternity.js">breaketernity.js</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://github.com/goldfire/pokersolver">pokersolver</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://overreacted.io/making-setinterval-declarative-with-react-hooks/">useInterval</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://github.com/joshwcomeau/use-sound">useSound</a><br/>
          <a className="link" target="_blank" rel="noreferrer" href="https://splidejs.com/">splidejs</a><br/>
          <br/>
          Buy me a beer! <br/>
          <form action="https://www.paypal.com/donate" method="post" target="_top">
            <input type="hidden" name="hosted_button_id" value="SVMZJM37V8Q5G" />
            <input type="image" formTarget="_blank" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif" name="submit" title="PayPal - The safer, easier way to pay online!" alt="Donate with PayPal button" />
            <img alt="" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
          </form>

          <br/>
          <button onClick={() => handleToggleModal(infoModal)} className="w-full btn drop-shadow-2xl px-10 py-3 ">Close</button>
        </div>
        <div ref={ascensionModal} className="modal exitModal invisible">
          Are you sure you want to ascend?<br/>
          You will reset all your progress and gain an <span className="text-purple-700 drop-shadow-[0px_0px_8px_purple]">ascended card</span> that grants a huge multiplier! <br/>
          You current have {ascendedCardsCount}/52 <span className="text-purple-700 drop-shadow-[0px_0px_8px_purple]">ascended cards</span><br/>
          <br/>
          <button onClick={handleDoAscend} className="btn-purple px-10 py-3 bg-gradient-to-r from-purple-500 mr-3 text-white">Yes</button>
          <button onClick={() => handleToggleModal(ascensionModal)} className="btn drop-shadow-2xl px-10 py-3">No</button>
        </div>
        <button onClick={handleBuyLeftUpgrades}
                className={"side-btn rounded-l-none rounded-r-full hover:translate-x-3 top-28 -left-5 " +
                            (isLeftUpgradesBought ? "peer/left " : ((totalChips.cmp(leftUpgradesCost) === -1) ? "btn-disabled " : ""))}>
          <span className="text-3xl">{isLeftUpgradesBought ? "Suit Upgrades" : (canBuyLeftUpgrades ? <Chips amount={leftUpgradesCost} /> : "🔒")}</span>
        </button>
        <div className="side-card w-[450px] bg-white absolute -left-[450px] rounded-r-3xl peer-hover/left:translate-x-[450px] hover:translate-x-[450px] ">
          {suitsUpgradesComponents}
        </div>
        <button onClick={handleBuyRightUpgrades}
                className={"side-btn rounded-l-full rounded-r-none hover:-translate-x-3 top-28 -right-5 " +
                            (isRightUpgradesBought ? "peer/right " : ((totalChips.cmp(rightUpgradesCost) === -1) ? "btn-disabled " : ""))}>
          <span className="text-3xl">{isRightUpgradesBought ? "Dealer Upgrades" : (canBuyRightUpgrades ? <Chips amount={rightUpgradesCost} /> : "🔒")}</span>
        </button>
        <div className="side-card w-[450px] bg-white absolute -right-[450px] rounded-l-3xl peer-hover/right:-translate-x-[450px] hover:-translate-x-[450px] ">
          <span className="text-xl font-bold">Auto-dealer speed +5%</span>
          <div className="flex flex-row w-full justify-between items-center pr-2">
            <button onClick={handleDecreseDealerTime} className={"btn px-10 py-5 drop-shadow-2xl " + ((totalChips.cmp(dealerDecreaseTimeCost) === -1 || dealerInterval <= 3_000) ? "btn-disabled " : "")}>
              {dealerInterval <= 3_000 ? <span className="text-3xl">MAX</span> : <Chips amount={dealerDecreaseTimeCost} />}
            </button>
            <span className="text-2xl h-fit">{Math.round(dealerInterval/1000*100)/100}s</span>
          </div>
          <span className="text-xl font-bold">Animation duration -5%</span>
          <div className="flex flex-row w-full justify-between items-center pr-2">
            <button onClick={handleDecreaseAnimTime} className={"btn px-10 py-5 drop-shadow-2xl " + ((totalChips.cmp(decreaseAnimDurationCost) === -1 || animDuration <= 100) ? "btn-disabled " : "")}>
              {animDuration <= 100 ? <span className="text-3xl">MAX</span> : <Chips amount={decreaseAnimDurationCost} />}
            </button>
            <span className="text-2xl h-fit">{Math.round(animDuration)/100}s</span>
          </div>
        </div>
        
      </div>
      <div className="w-full h-screen flex flex-col text-xl p-8 text-white select-none overflow-hidden">
        <section className="flex flex-row relative">
          <div className="absolute top-0 left-0">
            <button ref={buyAmountButton1}   onClick={() => handleChangeBuyAmount(1)}   className="btn w-20 h-12 mr-2 btn-disabled">1x</button>
            <button ref={buyAmountButton10}  onClick={() => handleChangeBuyAmount(10)}  className="btn w-20 h-12 mr-2">10x</button>
            <button ref={buyAmountButton100} onClick={() => handleChangeBuyAmount(100)} className="btn w-20 h-12 mr-2">100x</button>
            <button ref={buyAmountButtonMax} onClick={() => handleChangeBuyAmount(-1)}  className="btn w-20 h-12 mr-2">MAX</button>
          </div>
          <div className="w-fit mx-auto">
            <div ref={totalChipsDiv} className="shake">
              <span className="font-bold text-3xl mr-2">{getLongPrefix(totalChips)}</span><img className="inline-block align-sub" width="32" src={chip} alt="C"/>
            </div>
          </div>
          <div className="absolute top-0 right-0">
            <button onClick={() => handleToggleModal(infoModal)} className="btn w-12 h-12 text-3xl mr-2">i</button>
            <button onClick={handleToggleSound} className="btn w-20 h-12 text-3xl">{isSoundEnabled ? "🔊" : "🔈"}</button>
          </div>
        </section>
        <section className={"my-10 " + ((handRank === "") && "invisible")}>
          <div ref={rankSection} className="pop">
            <div className="w-fit mx-auto">
              {handRank} ({rankMultiplierDict[handRank]}x) {(globalBonusMultiplier.cmp(1) == 1) &&<span className="text-purple-500">({displayDecimal(globalBonusMultiplier)}x)</span>}
            </div>
            <div className="w-fit mx-auto">
              +{getLongPrefix(totalResult)}
            </div>
          </div>
        </section>
        <section className="grow flex flex-col justify-center mb-10">
          <Splide hasTrack={ false } aria-label="My Favorite Images" options={{fixedWidth: "fit-content"}} className="text-center mb-10">
            <SplideTrack style={{ overflow: "visible" }}>
              {oneCardPerSlide}
            </SplideTrack>
            <div className="splide__arrows mt-24"></div>
          </Splide>
        </section>
        <div className="absolute bottom-8 left-8">
          <button onClick={() => {if(handCardCodes.length >= 52) handleToggleModal(ascensionModal)}}
                  className={"btn px-8 py-3 text-2xl " + (handCardCodes.length >= 52 ? " !bg-black drop-shadow-[0px_0px_8px_purple]" : "btn-disabled ")}>
            {(handCardCodes.length >= 52 ? <span className="text-white">ASCEND</span> : (handCardCodes.length +"/52🔒"))}
          </button>
        </div>
        <section className="text-center w-fit absolute bottom-8 left-0 right-0 mx-auto">
          <button className="btn w-64 py-5 mr-5 text-4xl font-bold overflow-hidden" onClick={handleDealPlayer}>
            <div ref={progressBar} className="h-full left-0 top-0 bg-lime-600 absolute -z-10" style={{animationDuration: dealerInterval + "ms"}}></div>
            DEAL 🎰
          </button>
          <button className={"btn w-64 py-5 " + ((totalChips.cmp(incrementHandSizeCost) === -1) ? "btn-disabled" : "")} onClick={handleIncrementHandSizeNew}>
            <Chips amount={incrementHandSizeCost} /> <span className="text-4xl">[+🃏]</span>
          </button>
        </section>
        <div className="absolute bottom-8 right-8">
          <button className={"btn px-8 py-3 text-2xl " + (prestigeMultiplier.cmp(1) < 1 && "btn-disabled")} onClick={() => handleToggleModal(prestigeModal)} ><span className="text-purple-700">+{displayDecimal(prestigeMultiplier)}x</span> Prestige</button>
        </div>
      </div>
      <Analytics />
    </>
  );
}

function Card({cardSlot, handleUpgrade, buyAmount, totalChips, animDuration}: {cardSlot: CardSlot, handleUpgrade: Function, buyAmount: number, totalChips: Decimal, animDuration: number}) {
  const imageDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageDiv.current) {
      imageDiv.current.classList.remove("cardEntry");
      void imageDiv.current.offsetWidth;
      imageDiv.current.classList.add("cardEntry");
    }
  }, [cardSlot.result])

  return (
    <div className="h-fit w-fit flex flex-col gap-5">
      <span className="text-center">{displayDecimal(cardSlot.result)}</span>
      <div
        ref={imageDiv}
        style={{animationDelay: (cardSlot.cardCode === "back" ? "0ms" : cardSlot.id*animDuration/6+"ms"), animationDuration: animDuration + "ms"}}
        className={"cardEntry h-64 w-48 max-w-[12rem] " + (ascendedCardsDict[cardSlot.cardCode] ? "special-card " : "")}>
        {allCardsImages[cardSlot.cardCode]}
      </div>
      <span className="text-center">Multiplier: {displayDecimal(cardSlot.multiplier)}x</span>
      <button
        onClick={() => handleUpgrade(cardSlot.id, buyAmount)}
        className={"btn py-2 " + ((totalChips.cmp(costForN(cardSlot.upgradeCost, (buyAmount === -1 ? calcMaxBuyable(cardSlot.upgradeCost, totalChips) : buyAmount))) === -1) ? "btn-disabled" : "")}>
          <Chips amount={costForN(cardSlot.upgradeCost, (buyAmount === -1 ? calcMaxBuyable(cardSlot.upgradeCost, totalChips) : buyAmount))} />
      </button>
    </div>
  );
}

function SuitUpgradeComponent({suitUpgrade, handleUpgradeSuit, totalChips, buyAmount}: {suitUpgrade: SuitUpgrade, handleUpgradeSuit: Function, totalChips: Decimal, buyAmount: number}) {
  return (
    <div className="flex flex-row w-full justify-between items-center pr-2">
      <button onClick={() => handleUpgradeSuit(suitUpgrade.suit, buyAmount)} className={"btn px-10 py-5 drop-shadow-2xl " + ((totalChips.cmp(costForN(suitUpgrade.cost, (buyAmount === -1 ? calcMaxBuyable(suitUpgrade.cost, totalChips) : buyAmount))) === -1) ? "btn-disabled " : "")}>
        <Chips amount={costForN(suitUpgrade.cost, (buyAmount === -1 ? calcMaxBuyable(suitUpgrade.cost, totalChips) : buyAmount))} />
      </button>
      <span className="text-2xl h-fit">{suitUpgrade.symbol} {displayDecimal(suitUpgrade.multiplier)}x</span>
    </div>
  );
}

function Chips({amount}: {amount: Decimal}) {
  return (
    <><span className="font-bold text-3xl mr-2">{displayDecimal(amount)}</span><img className="inline-block align-sub" width="32" src={chip} alt="C"/></>
  );
} 

export default App;
