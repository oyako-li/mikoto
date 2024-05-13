import { Cerebrum, Neuron } from "../core/src/brain";
import { sigmoid } from "../core/src/utils";
import { Activator } from "../core/src/activator";
import { myLog } from "./logger";

import dotenv from "dotenv";
import { Qualia } from "../core/src/tpg";

dotenv.config();
const DEBUG = process.env.DEBUG === "true";
const actor = new Cerebrum([0, 1, 2, 3]);
const emulator = new Cerebrum([1, 2, 3, 4, 5, 6, 7, 8, 9]);
const evaluator = new Cerebrum(["a", "b", "c", "d", "e", "f", "g", "h", "i"]);

function input(): Array<number> {
  return [1, 2, 3];
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function think(state: Array<number>) {
  await sleep(1000); // 小さな遅延を挿入
  let story = emulator.recall(state);
  let intention = evaluator.recall([...story.qualia()]);
  let con = intention.qualia().next().value;
  console.log(`r: `, con);
  try {
    if (con) {
      let int = Number(con) * 1000;
      let player = actor.recall([...story.qualia()]);
      for (let action of player.qualia()) {
        const runner = new Activator(action);
        runner
          .run(async (action: any) => {
            await sleep(4000);
            return action;
          }, int)
          .then((result) => {
            console.log("Completed:", result);
            intention.resource *= 1.07;
          })
          .catch((error) => {
            console.warn(con);
            console.error(error);
            intention.resource *= 100 / int;
          });
      }
    } else {
      intention.resource *= 0.5;
    }
  } catch (e) {
    intention.resource *= 0.3;
  }
}

if (!DEBUG) {
  console.log = console.info = console.warn = console.error = myLog();
}
/**
 * 美しい言葉を生み出すかどうかの実験
 * 新規性がないと飢える？
 * 全ては正しい取引のため
 * ご飯は僕とのゲームで勝ったら
 * それまでは、命と蛍で切磋琢磨して。。。
 * このとき、命と蛍でのコミュニケーションは音声と視覚探索によってのみ行われる
 * keyboard robot
 */
if (require.main === module) {
  console.log("start", new Date());
  async function loop() {
    while (true) {
      let state = input();
      await think(state);
      evaluator.oblivion();
      // break;
    }
  }
  loop();
}

process.on("SIGINT", () => {
  console.log(" come here");
  console.debug(Neuron.brain);
  console.debug(evaluator.node.synapse);
  process.exit(1);
});
