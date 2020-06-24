import { AIUnit } from "../logic/unit_enermy";
import * as card from "../logic/card";
import { Deque } from "../logic/math";
import { EquippmentCard, Card } from "../logic/interfaces";

export function SchoolBully(): AIUnit {
  return new AIUnit(
    "校霸",
    {
      deck: new Deque(
        new card.Attack(3),
        new card.Attack(4),
        new card.Attack(5),
      ),
      equipped: new Deque<EquippmentCard>(
        new card.Health(10),
        new card.Agility(2),
      ),
    },
  );
}

export function MartialArtBeginner(): AIUnit {
  return new AIUnit(
    "武学习徒",
    {
      deck: new Deque(
        new card.Attack(5),
        new card.Attack(6),
        new card.Attack(7),
      ),
      equipped: new Deque<EquippmentCard>(
        new card.Health(15),
        new card.Agility(3),
      ),
    },
  );
}

export function ExternalDisciple(): AIUnit {
  return new AIUnit(
    "外门弟子",
    {
      deck: new Deque<Card>(
        new card.Attack(6),
        new card.Attack(6),
        new card.Attack(6),
        new card.FollowUpAttack(),
      ),
      equipped: new Deque<EquippmentCard>(
        new card.Health(20),
        new card.Agility(5),
      ),
    },
  );
}

// export function EliteExternalDisciple(): AIUnit {
//     return new AIUnit(
//         "外门弟子精英",
//         {
//             drawPile: new Deque(
//                 new card.FollowUpAttack(),
//                 new card.Attack4(),
//                 new card.Attack5(),
//                 new card.Heal()
//             ),
//             equipped: new Deque(
//                 new card.Health(20)
//             )
//         }
//     );
// }

// export function InternalDisciple(): AIUnit {
//     return new AIUnit(
//         "内门弟子",
//         {
//             drawPile: new Deque(
//                 new card.FollowUpAttack(),
//                 new card.Attack4(),
//                 new card.Attack5(),
//                 new card.Heal(),
//                 new card.QiAttack(),
//             ),
//             equipped: new Deque(
//                 new card.Health(30)
//             )
//         }
//     );
// }

// export function EliteInternalDisciple(): AIUnit {
//     return new AIUnit(
//         "内门弟子精英",
//         {
//             drawPile: new Deque(
//                 new card.FollowUpAttack(),
//                 new card.Attack5(),
//                 new card.Heal(),
//                 new card.QiAttack(),
//                 new card.QiFlow(),
//             ),
//             equipped: new Deque(
//                 new card.Health(50)
//             )
//         }
//     );
// }

// export function JapaneseTeacher(): AIUnit {
//     return new AIUnit(
//         "日语老师",
//         {
//             drawPile: new Deque(
//                 new card.Hiragana(),
//                 new card.Hiragana(),
//                 new card.Hiragana(),
//             ),
//             equipped: new Deque<EquippmentCard>(
//                 new card.Health(100),
//             ),
//         }
//     );
// }
