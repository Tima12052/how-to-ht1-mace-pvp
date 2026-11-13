import { useState } from "react";

export default function Home() {
  const [showMore1, setShowMore1] = useState(false);
  const [showMore2, setShowMore2] = useState(false);
  const [showMore3, setShowMore3] = useState(false);
  const [showMore4, setShowMore4] = useState(false);
  const [showMore5, setShowMore5] = useState(false);

  return (<div className="home-page">
    <h1>A way to ht1 mace</h1>
    <div className="gapbet"></div>
    <h2>Mace techniques</h2>
    <p>how to deal more damage, counter sheild and have more controle over the opponent</p>

    <ul className="technique-list">
      <li>
        <p>Attribute swapping</p>
        <p>it takes the cooldown and the damage from the first item and attributes like what type of hit and what enchantments form the second item</p>
        <button type="button" onClick={() => setShowMore1((visible) => !visible)}>
          {showMore1 ? "close" : "Learn more"}
        </button>
        {showMore1 && (
          <p>
            you have to click on the first item and switch to the second one within 50ms
          </p>
        )}
      </li>
      <li>
        <p>Stun slamming</p>
        <p>it lets you break opponents shield and hit them with the mace</p>
        <button type="button" onClick={() => setShowMore2((visible) => !visible)}>
          {showMore2 ? "close" : "Learn more"}
        </button>
        {showMore2 && (
          <p>
            you click with an axe to break the shield (in spear-mace, swap from sword to axe to deal more damage) and switch to mace and hit them the second time
          </p>
        )}
      </li>
      <li>
        <p>Backstep</p>
        <p>you move to the bach of your opponent and hit their back</p>
        <button type="button" onClick={() => setShowMore3((visible) => !visible)}>
          {showMore3 ? "close" : "Learn more"}
        </button>
        {showMore3 && (
          <p>
            if you fall on a player holding a shield, quickly move behind them and hit their back because the shield only works at 100 degree in each direction
          </p>
        )}
      </li>
      <li>
        <p>Pearl catching</p>
        <p>you throw your ender pearl up and quicly throw a wind charge in the same direction so you teleport to your pearl</p>
        <button type="button" onClick={() => setShowMore4((visible) => !visible)}>
          {showMore4 ? "close" : "Learn more"}
        </button>
        {showMore4 && (
          <p>
            you can also throw a wind charge under you to send your pearl higher, there is also a thing called insta pearl catching that needs you to hold your wind charge in the second hand but if you can swap to your wind charge fast enough you can keep it in your hotbar. and if you want to go higher with the pearl on the elytra you need to learn double click
          </p>
        )}
      </li>
      <li>
        <p>Armor/shield drain</p>
        <p>if you go up enough and then hit the opponent with density mace it will do a huge amount/shield of durability to their armour</p>
        <button type="button" onClick={() => setShowMore5((visible) => !visible)}>
          {showMore5 ? "close" : "Learn more"}
        </button>
        {showMore5 && (
          <p>
            you can go high enough using wind charges (if you go fast enough up you can hit yourself with the wind charge to go higher)
          </p>
        )}
      </li>
    </ul>
  </div>)
}
