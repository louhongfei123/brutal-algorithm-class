import { AIUnit } from "../logic/unit";
import * as card from "../logic/card";
import { Deque } from "../logic/math";
import { EquippmentCard } from "../logic/interfaces"


export function SchoolBully(): AIUnit {
    return new AIUnit(
        "校霸",
        {
            drawPile: new Deque(
                new card.Attack(3),
                new card.Attack(4),
                new card.Attack(5),
            ),
            equipped: new Deque<EquippmentCard>(
                new card.Health(10),
                new card.Agility(10),
            ),
        }
    );
}


export function MartialArtBeginner(): AIUnit {
    return new AIUnit(
        "武学习徒",
        {
            drawPile: new Deque(
                new card.Attack(5),
                new card.Attack(6),
                new card.Attack(7),
            ),
            equipped: new Deque(
                new card.Health(15)
            )
        }
    );
}


// export function ExternalDisciple(): AIUnit {
//     return new AIUnit(
//         "外门弟子",
//         {
//             drawPile: new Deque(
//                 new card.Attack4(),
//                 new card.Attack5(),
//                 new card.FollowUpAttack()
//             ),
//             equipped: new Deque(
//                 new card.Health(15)
//             )
//         }
//     );
// }

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
