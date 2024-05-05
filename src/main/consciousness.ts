import { Cerebrum, Neuron } from "../core/src/brain";
import { Activator } from "../core/src/activator";

// class Automata {
//     constructor()
// }

function input(): Array<number> {
  return [1, 2, 3];
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * 美しい言葉を生み出すかどうかの実験
 * 新規性がないと飢える？
 * 全ては正しい取引のため
 * ご飯は僕、とのゲームで勝ったら
 * それまでは、命と蛍で切磋琢磨して。。。
 * このとき、命と蛍でのコミュニケーションは音声と視覚探索によってのみ行われる
 * keyboard robot
 */
if (require.main === module) {
  const actor = new Cerebrum([0]);
  const emulator = new Cerebrum([0]);
  const evaluator = new Cerebrum([1]);

  while (true) {
    let state = input();
    let story = emulator.recall(state);
    let player = actor.recall(story.qualia);
    let consciousness = evaluator.recall([...state, ...story.qualia]);

    for (let action of player.qualia) {
      const runner = new Activator("action");
      runner
        .run(async (action: any) => {
          await sleep(2000);
          return action;
        }, 100000)
        .then((result) => console.log("Completed:", result))
        .catch((error) => {
          player.resource -= 1000;
          console.log(Activator.actions);
        });
    }
    break;
  }
}
