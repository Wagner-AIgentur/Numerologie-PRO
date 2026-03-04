/**
 * Pythagoras Psychomatrix Interpretation Engine
 *
 * Provides bilingual (DE/RU) interpretations for all 9 matrix positions
 * and all 8 lines (3 rows, 3 columns, 2 diagonals).
 */

export interface Interpretation {
  title: string;
  description: string;
  strength: 'none' | 'weak' | 'normal' | 'strong' | 'dominant';
}

export interface TieredInterpretation extends Interpretation {
  /** Short teaser text (2-3 sentences, always visible for free) */
  teaser: string;
  /** Full interpretation text (visible after email unlock) */
  full: string;
}

// ---------------------------------------------------------------------------
// Position Interpretations (1-9) in DE and RU
// ---------------------------------------------------------------------------

type PositionEntry = {
  title: string;
  description: string;
  teaser: string;
  /** Extended full interpretation (premium content for logged-in users & PDF) */
  full?: string;
  strength: Interpretation['strength'];
};

type PositionData = Record<
  number,
  {
    de: Record<string, PositionEntry>;
    ru: Record<string, PositionEntry>;
  }
>;

const positionInterpretations: PositionData = {
  1: {
    de: {
      '0': {
        title: 'Charakter & Willenskraft',
        teaser: 'Dein Charakter zeigt eine weiche, anpassungsfähige Seite. Du lässt anderen oft den Vortritt.',
        description: 'Keine Einsen in der Matrix deuten auf einen egoistischen Charakter hin, der sich schwer durchsetzen kann. Du neigst dazu, die Meinung anderer zu übernehmen und vermeidest Konfrontationen.',
        full: 'Keine Einsen in der Matrix deuten auf einen unentschlossenen Charakter hin. Du bist ein Nachahmer, der selten eigene Ideen einbringt und lieber die Meinungen anderer übernimmt. Du vermeidest Konfrontationen und lässt anderen den Vortritt, selbst wenn du anderer Meinung bist. Das macht dich anpassungsfähig, aber auch manipulierbar. Dein Weg zur Stärke führt über bewusste Entscheidungen und den Mut, für deine Überzeugungen einzustehen. Lerne, deine eigene Stimme zu finden, anstatt immer dem Strom zu folgen.',
        strength: 'none',
      },
      '1': {
        title: 'Charakter & Willenskraft',
        teaser: 'Ein sanfter Charakter mit Potenzial. Du bist einfühlsam, aber könntest mehr für dich einstehen.',
        description: 'Eine Eins zeigt einen sanften Charakter mit Entwicklungspotenzial. Du bist einfühlsam und kompromissbereit, solltest aber lernen, klarer für deine Überzeugungen einzustehen.',
        full: 'Eine Eins zeigt einen sanften, aber schwachen Willen. Du triffst ungern Entscheidungen alleine und brauchst den Rat anderer. Du teilst Verantwortung gerne und bist ein hervorragender Teamplayer, der Konflikte meidet. Allerdings neigst du dazu, deine eigenen Bedürfnisse zurückzustellen. Dir fehlt manchmal die Fähigkeit, dich klar abzugrenzen. Um dich weiterzuentwickeln, solltest du lernen, auch unpopuläre Entscheidungen zu treffen und für deine Überzeugungen einzustehen — auch wenn es unbequem ist.',
        strength: 'weak',
      },
      '2': {
        title: 'Charakter & Willenskraft',
        teaser: 'Ein ausgeglichener Charakter. Du kennst deinen Wert und setzt dich diplomatisch durch.',
        description: 'Zwei Einsen zeigen einen ausgeglichenen Charakter. Du kennst deinen Wert, ohne überheblich zu sein. Du setzt dich durch, wenn es nötig ist, und bist dabei diplomatisch.',
        full: 'Zwei Einsen zeigen einen weichen, aber stabilen Charakter. Du brauchst die Unterstützung eines Kollektivs oder Teams, um dein volles Potenzial zu entfalten. Du bist ein Teamplayer, der diplomatisch agiert und Konflikte konstruktiv löst. Du lobst dich selbst und andere gerne — manchmal zu oft. In Beziehungen suchst du nach Harmonie und bist bereit, Kompromisse einzugehen. Deine Stärke liegt in der Fähigkeit, Menschen zusammenzubringen und unterschiedliche Meinungen zu moderieren.',
        strength: 'normal',
      },
      '3': {
        title: 'Charakter & Willenskraft',
        teaser: 'Starke Persönlichkeit mit ausgeprägter Willenskraft. Du bist ein geborener Anführer.',
        description: 'Drei Einsen deuten auf eine starke Persönlichkeit mit ausgeprägter Willenskraft hin. Du bist ein geborener Anführer, der seine Ziele mit Entschlossenheit verfolgt.',
        full: 'Drei Einsen zeigen einen flexiblen, anpassungsfähigen Charakter. Du kannst sowohl im Team als auch alleine arbeiten und wechselst mühelos zwischen beiden Modi. Du bist ideal für mittlere Führungspositionen geeignet — genug Durchsetzungskraft für Verantwortung, aber auch genug Empathie für Teamarbeit. Du findest schnell Lösungen und passt dich an veränderte Umstände an. Deine größte Stärke ist die Vielseitigkeit: Du kannst in fast jeder Situation bestehen.',
        strength: 'strong',
      },
      '4': {
        title: 'Charakter & Willenskraft',
        teaser: 'Sehr starker Wille. Entschlossen, unabhängig und perfektionistisch — ein natürlicher Anführer.',
        description: 'Vier Einsen zeigen einen willensstarken, entschlossenen Charakter. Du bist unabhängig, perfektionistisch und lässt dich von niemandem von deinem Weg abbringen.',
        full: 'Vier Einsen zeigen einen willensstarken, entschlossenen Charakter. Du bist unabhängig und perfektionistisch — du akzeptierst keine halben Sachen. Du triffst Entscheidungen selbstständig und lässt dich von niemandem beeinflussen. Als Teamplayer funktionierst du weniger gut, da du deine eigenen Standards durchsetzen willst. Du bist ein natürlicher Einzelkämpfer und Unternehmertyp. Achte darauf, dass dein starker Wille nicht zu Starrheit wird — manchmal ist Flexibilität der bessere Weg zum Ziel.',
        strength: 'strong',
      },
      '5': {
        title: 'Charakter & Willenskraft',
        teaser: 'Dominanter Charakter. Enormer Führungsdrang, der in die richtige Bahn gelenkt werden muss.',
        description: 'Fünf oder mehr Einsen zeigen einen dominanten Charakter mit übermäßigem Führungsdrang. Du verlangst absolute Kontrolle über dein Umfeld.',
        full: 'Fünf oder mehr Einsen zeigen einen despotischen Charakter. Du sehnst dich danach, alles und jeden zu kontrollieren. Du akzeptierst keine Autoritäten über dir und willst immer die Oberhand behalten. Das kann zu Konflikten in Beziehungen und im Beruf führen. Gleichzeitig hast du enorme Durchsetzungskraft und kannst Berge versetzen, wenn du ein Ziel verfolgst. Die Herausforderung liegt darin, deine Macht verantwortungsvoll einzusetzen und andere nicht zu erdrücken. Lerne, Kontrolle auch mal abzugeben.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Характер и сила воли',
        teaser: 'Ваш характер показывает мягкую, адаптивную сторону. Вы часто уступаете другим.',
        description: 'Отсутствие единиц указывает на эгоистичный характер, которому сложно отстаивать свою позицию. Вы склонны перенимать чужое мнение и избегать конфронтаций.',
        full: 'Отсутствие единиц указывает на нерешительный характер. Вы — подражатель, который редко вносит собственные идеи и предпочитает перенимать мнения других. Вы избегаете конфронтаций и уступаете другим, даже если не согласны. Это делает вас адаптивным, но также легко управляемым. Ваш путь к силе лежит через осознанные решения и смелость отстаивать свои убеждения. Учитесь находить свой голос, а не всегда следовать за потоком.',
        strength: 'none',
      },
      '1': {
        title: 'Характер и сила воли',
        teaser: 'Мягкий характер с потенциалом. Вы чуткий человек, но могли бы больше отстаивать себя.',
        description: 'Одна единица указывает на мягкий характер с потенциалом развития. Вы чуткий и компромиссный человек, но вам стоит научиться отстаивать свои убеждения.',
        full: 'Одна единица показывает мягкую, но слабую волю. Вы неохотно принимаете решения самостоятельно и нуждаетесь в совете окружающих. Вы охотно делите ответственность и являетесь отличным командным игроком, избегающим конфликтов. Однако вы склонны отодвигать свои потребности на второй план. Вам не хватает способности чётко выстраивать границы. Для развития учитесь принимать непопулярные решения и отстаивать свои убеждения — даже если это неудобно.',
        strength: 'weak',
      },
      '2': {
        title: 'Характер и сила воли',
        teaser: 'Уравновешенный характер. Вы знаете себе цену и дипломатично добиваетесь своего.',
        description: 'Две единицы показывают уравновешенный характер. Вы знаете себе цену, не проявляя высокомерия. Вы умеете настоять на своём, оставаясь дипломатичным.',
        full: 'Две единицы показывают мягкий, но стабильный характер. Вам нужна поддержка коллектива или команды, чтобы раскрыть свой потенциал. Вы командный игрок, действующий дипломатично и конструктивно решающий конфликты. Вы охотно хвалите себя и других — иногда слишком часто. В отношениях вы ищете гармонию и готовы идти на компромиссы. Ваша сила — в способности объединять людей и модерировать различные мнения.',
        strength: 'normal',
      },
      '3': {
        title: 'Характер и сила воли',
        teaser: 'Сильная личность с выраженной волей. Вы прирождённый лидер.',
        description: 'Три единицы указывают на сильную личность с выраженной волей. Вы прирождённый лидер, который достигает целей с решительностью и упорством.',
        full: 'Три единицы показывают гибкий, адаптивный характер. Вы можете работать как в команде, так и самостоятельно, легко переключаясь между режимами. Вы идеально подходите для руководящих позиций среднего звена — достаточно решительны для ответственности, но и достаточно эмпатичны для командной работы. Вы быстро находите решения и адаптируетесь к изменяющимся обстоятельствам. Ваша главная сила — универсальность: вы можете устоять практически в любой ситуации.',
        strength: 'strong',
      },
      '4': {
        title: 'Характер и сила воли',
        teaser: 'Очень сильная воля. Решительный, независимый и перфекционист — прирождённый лидер.',
        description: 'Четыре единицы показывают волевой, решительный характер. Вы независимы, перфекционист и никому не позволите сбить вас с пути.',
        full: 'Четыре единицы показывают волевой, решительный характер. Вы независимы и перфекционист — не принимаете половинчатых результатов. Вы принимаете решения самостоятельно и не поддаётесь чужому влиянию. Как командный игрок вы менее эффективны, так как стремитесь навязать свои стандарты. Вы прирождённый одиночка и предпринимательский тип. Следите, чтобы ваша сильная воля не превратилась в упрямство — иногда гибкость — лучший путь к цели.',
        strength: 'strong',
      },
      '5': {
        title: 'Характер и сила воли',
        teaser: 'Доминирующий характер. Огромная тяга к лидерству, требующая правильного направления.',
        description: 'Пять и более единиц показывают доминирующий характер с чрезмерной тягой к лидерству. Вы требуете абсолютного контроля.',
        full: 'Пять и более единиц показывают деспотичный характер. Вы стремитесь контролировать всё и всех. Вы не признаёте авторитетов над собой и всегда хотите держать верх. Это может вести к конфликтам в отношениях и на работе. Одновременно у вас огромная сила воли, способная сдвинуть горы на пути к цели. Задача — использовать свою власть ответственно и не подавлять окружающих. Учитесь отпускать контроль.',
        strength: 'dominant',
      },
    },
  },

  2: {
    de: {
      '0': {
        title: 'Energie & Bioenergie',
        teaser: 'Niedriges Energieniveau. Du erschöpfst dich schnell und brauchst bewusste Erholung.',
        description: 'Keine Zweien bedeuten ein niedriges Energieniveau. Du erschöpfst dich schnell und brauchst regelmäßige Erholung. Energiespender wie Natur und Bewegung sind besonders wichtig.',
        full: 'Keine Zweien bedeuten ein sehr niedriges Energieniveau. Du bist oft müde, faul und neigst zu Konflikten, um Energie von anderen zu „stehlen". Du brauchst die Aufmerksamkeit anderer wie einen Energiebooster. Sport und Naturaufenthalte sind für dich überlebenswichtig. Du bevorzugst Antiquitäten und gebrauchte Gegenstände, weil sie gespeicherte Energie anderer Menschen enthalten. Baue dir bewusst Energiequellen auf: regelmäßige Bewegung, Meditation und Zeit in der Natur.',
        strength: 'none',
      },
      '1': {
        title: 'Energie & Bioenergie',
        teaser: 'Durchschnittliches Energieniveau. Genug Kraft für den Alltag, aber achte auf deine Reserven.',
        description: 'Eine Zwei zeigt ein durchschnittliches Energieniveau. Du hast genug Kraft für den Alltag, solltest aber auf deine Energiereserven achten und Überanstrengung vermeiden.',
        full: 'Eine Zwei zeigt eine schwache Energiereserve. Du ermüdest schnell und vermeidest Konflikte, weil sie dich energetisch erschöpfen. Du neigst zur Introversion und brauchst regelmäßige Pausen. Überanstrengung kann bei dir zu Krankheit führen. Achte besonders auf deine Energiebilanz: Was gibt dir Kraft, was zieht sie ab? Sport, Naturaufenthalte und bewusste Ruhephasen sind für dich nicht optional, sondern essenziell.',
        strength: 'weak',
      },
      '2': {
        title: 'Energie & Bioenergie',
        teaser: 'Gute Bioenergie. Starke Ausstrahlung, du steckst andere mit deiner Energie an.',
        description: 'Zwei Zweien deuten auf gute Bioenergie hin. Du hast eine starke Ausstrahlung und kannst andere mit deiner Energie anstecken. Du erholst dich schnell nach Belastungen.',
        full: 'Zwei Zweien zeigen die optimale Energiebalance. Du hast die beste Energiereserve aller Kombinationen. Du bist ein ausgezeichneter Kommunikator, ein unermüdlicher Arbeiter und ein guter Zuhörer. Menschen fühlen sich in deiner Nähe wohl. Du erholst dich schnell nach Belastungen und kannst andere mit deiner Energie anstecken. Du bist für jede Art von Beruf geeignet, besonders für solche mit viel Menschenkontakt.',
        strength: 'normal',
      },
      '3': {
        title: 'Energie & Bioenergie',
        teaser: 'Überdurchschnittliches Energieniveau mit magnetischer Ausstrahlung und heilenden Fähigkeiten.',
        description: 'Drei Zweien zeigen ein überdurchschnittliches Energieniveau. Du besitzt heilende Fähigkeiten und eine magnetische Ausstrahlung.',
        full: 'Drei Zweien zeigen extrasensorische Energie. Du besitzt die Fähigkeit, andere energetisch zu beeinflussen — positiv oder negativ. Du neigst dazu, Konflikte zu provozieren, weil du dadurch Energie austauschst. Du bist ein natürlicher Heiler, aber auch ein Hypochonder, der sich zu viele Sorgen um die eigene Gesundheit macht. Nutze deine außergewöhnliche Energie konstruktiv: Heilberufe, Coaching oder therapeutische Arbeit liegen dir besonders.',
        strength: 'strong',
      },
      '4': {
        title: 'Energie & Bioenergie',
        teaser: 'Sehr starke Bioenergie. Du bist ein natürlicher Energiegeber und Heiler.',
        description: 'Vier oder mehr Zweien zeigen eine sehr starke Energie. Du bist ein natürlicher Heiler und Energiegeber.',
        full: 'Vier oder mehr Zweien zeigen eine extrem starke Energie. Du bist ein „Energiespender" — Menschen kommen zu dir, um sich aufzuladen. Du liebst Konflikte über Gerechtigkeit und brauchst abwechslungsreiche Arbeit, sonst langweilst du dich schnell. Du neigst dazu, dich für andere aufzuopfern, was langfristig deine eigene Energie erschöpft. Achte darauf, deine Energie bewusst zu steuern und nicht jedem zu geben, der danach fragt. Du bist für Berufe mit viel Abwechslung und Menschenkontakt geschaffen.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Энергия и биоэнергия',
        teaser: 'Низкий уровень энергии. Вы быстро истощаетесь и нуждаетесь в осознанном отдыхе.',
        description: 'Отсутствие двоек означает низкий уровень энергии. Вы быстро истощаетесь и нуждаетесь в регулярном отдыхе.',
        full: 'Отсутствие двоек означает очень низкий уровень энергии. Вы часто уставший, ленивый и склонны к конфликтам, чтобы «красть» энергию у других. Вам нужно внимание окружающих как энергетический ускоритель. Спорт и пребывание на природе для вас жизненно необходимы. Вы предпочитаете антиквариат и бывшие в употреблении вещи, так как они содержат накопленную энергию других людей. Стройте осознанные источники энергии: регулярное движение, медитация и время на природе.',
        strength: 'none',
      },
      '1': {
        title: 'Энергия и биоэнергия',
        teaser: 'Средний уровень энергии. Достаточно сил для повседневности, но следите за резервами.',
        description: 'Одна двойка указывает на средний уровень энергии. У вас достаточно сил для повседневной жизни.',
        full: 'Одна двойка показывает слабый энергетический резерв. Вы быстро устаёте и избегаете конфликтов, так как они вас энергетически истощают. Вы склонны к интроверсии и нуждаетесь в регулярных паузах. Перенапряжение может привести к болезни. Особенно следите за энергетическим балансом: что даёт вам силы, что их забирает? Спорт, природа и осознанные паузы для вас не опция, а необходимость.',
        strength: 'weak',
      },
      '2': {
        title: 'Энергия и биоэнергия',
        teaser: 'Хорошая биоэнергия. Сильная аура, вы заряжаете окружающих своей энергией.',
        description: 'Две двойки указывают на хорошую биоэнергию. У вас сильная аура.',
        full: 'Две двойки показывают оптимальный энергетический баланс. У вас лучший запас энергии из всех комбинаций. Вы отличный коммуникатор, неутомимый работник и хороший слушатель. Люди чувствуют себя рядом с вами комфортно. Вы быстро восстанавливаетесь после нагрузок и можете заряжать других своей энергией. Вы подходите для любой профессии, особенно связанной с общением.',
        strength: 'normal',
      },
      '3': {
        title: 'Энергия и биоэнергия',
        teaser: 'Мощный энергетический потенциал с магнетической аурой и целительными способностями.',
        description: 'Три двойки показывают мощный энергетический потенциал. Вы обладаете целительными способностями.',
        full: 'Три двойки показывают экстрасенсорную энергию. Вы способны энергетически влиять на других — позитивно или негативно. Вы склонны провоцировать конфликты, так как через них обмениваетесь энергией. Вы природный целитель, но и ипохондрик, слишком много беспокоящийся о своём здоровье. Используйте необычную энергию конструктивно: целительство, коучинг или терапевтическая работа вам особенно подходят.',
        strength: 'strong',
      },
      '4': {
        title: 'Энергия и биоэнергия',
        teaser: 'Очень сильная биоэнергия. Вы природный энергодонор и целитель.',
        description: 'Четыре и более двоек показывают очень сильную энергию. Вы природный целитель и энергодонор.',
        full: 'Четыре и более двоек показывают экстремально сильную энергию. Вы «энергодонор» — люди приходят к вам, чтобы подзарядиться. Вы любите конфликты о справедливости и нуждаетесь в разнообразной работе. Вы склонны жертвовать собой ради других, что долгосрочно истощает вашу энергию. Следите за тем, чтобы осознанно управлять энергией и не отдавать всем, кто просит. Вы созданы для профессий с разнообразием и контактом с людьми.',
        strength: 'dominant',
      },
    },
  },

  3: {
    de: {
      '0': {
        title: 'Disziplin & Interessen',
        teaser: 'Wenig Disziplin. Chaotisch, aber kreativ — du brauchst klare Strukturen.',
        description: 'Keine Dreien zeigen einen eher undisziplinierten Menschen. Du springst von Interesse zu Interesse.',
        full: 'Keine Dreien zeigen einen undisziplinierten, chaotischen Menschen. Du brauchst klare Algorithmen und Strukturen, um produktiv zu sein. Deine Interessen wechseln ständig, und du bleibst selten lange bei einer Sache. Du bist eher geisteswissenschaftlich orientiert und hast eine Abneigung gegen exakte Wissenschaften. Dein Schlüssel zum Erfolg: Schaffe dir klare Routinen und halte dich konsequent daran.',
        strength: 'none',
      },
      '1': {
        title: 'Disziplin & Interessen',
        teaser: 'Schwache Disziplin, aber vielseitige Interessen. Du weißt von vielem ein bisschen.',
        description: 'Eine Drei deutet auf schwache Disziplin, aber vielseitige Interessen hin.',
        full: 'Eine Drei zeigt schwache Disziplin und zersplitterte Interessen. Du weißt von vielen Dingen ein bisschen, aber selten genug von einer Sache. Dein Wissen ist breit, aber oberflächlich. Du wechselst häufig zwischen Themen und kannst dich schlecht auf eine Sache konzentrieren. Um Erfolg zu haben, musst du lernen, Prioritäten zu setzen und mindestens eine Fähigkeit wirklich zu meistern.',
        strength: 'weak',
      },
      '2': {
        title: 'Disziplin & Interessen',
        teaser: 'Gute Disziplin. Methodisch, ordentlich und mit echtem Interesse an Technik und Wissenschaft.',
        description: 'Zwei Dreien zeigen gute Disziplin und methodisches Vorgehen.',
        full: 'Zwei Dreien zeigen echte Disziplin und methodisches Denken. Du bist ordentlich, liebst Details und hast ein starkes Interesse an Technik und Naturwissenschaften. Du arbeitest systematisch und erreichst deine Ziele durch Ausdauer. In deinem Umfeld bist du der „Organisator", der Struktur reinbringt. Du lernst am besten durch Praxis und schrittweises Vorgehen.',
        strength: 'normal',
      },
      '3': {
        title: 'Disziplin & Interessen',
        teaser: 'Bedingte Disziplin. Wenn dich etwas interessiert, bist du fokussiert — sonst nicht.',
        description: 'Drei Dreien zeigen bedingte Disziplin. Dein Fokus hängt vom Interesse ab.',
        full: 'Drei Dreien zeigen bedingte Disziplin. Wenn ein Thema dich nicht interessiert, wirst du faul und unkonzentriert. Aber in Krisenzeiten oder bei echtem Interesse kannst du dich extrem fokussieren und Höchstleistungen bringen. Du bist ein „On-Off"-Arbeiter: Entweder 100% oder gar nicht. Nutze diese Eigenschaft, indem du dir Arbeit suchst, die dich wirklich begeistert.',
        strength: 'strong',
      },
      '4': {
        title: 'Disziplin & Interessen',
        teaser: 'Sehr hohe Disziplin. Erfinder-Typ mit eigenen Methoden und Systemen.',
        description: 'Vier Dreien zeigen sehr hohe Disziplin. Du entwickelst eigene Systeme und Methoden.',
        full: 'Vier Dreien zeigen sehr hohe Disziplin. Du entwickelst eigene Methoden und Systeme. Du bist ein Erfinder-Typ, der bestehende Ansätze verbessert und neue Wege findet. Deine Arbeitsweise ist ungewöhnlich, aber extrem effektiv. Du brauchst Freiheit in deiner Methodik — starre Vorgaben frustrieren dich. Am besten entfaltest du dich in kreativen oder wissenschaftlichen Berufen.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Дисциплина и интересы',
        teaser: 'Мало дисциплины. Хаотичный, но творческий — нужны чёткие структуры.',
        description: 'Отсутствие троек указывает на недисциплинированного человека.',
        full: 'Отсутствие троек показывает недисциплинированного, хаотичного человека. Вам нужны чёткие алгоритмы и структуры для продуктивности. Ваши интересы постоянно меняются, и вы редко задерживаетесь надолго на одном деле. Вы скорее гуманитарий с неприязнью к точным наукам. Ваш ключ к успеху: создайте чёткие рутины и строго их придерживайтесь.',
        strength: 'none',
      },
      '1': {
        title: 'Дисциплина и интересы',
        teaser: 'Слабая дисциплина, но разносторонние интересы. Знаете обо всём понемногу.',
        description: 'Одна тройка указывает на слабую дисциплину и разбросанные интересы.',
        full: 'Одна тройка показывает слабую дисциплину и разбросанные интересы. Вы знаете о многом понемногу, но редко что-то глубоко. Ваши знания широкие, но поверхностные. Вы часто переключаетесь между темами. Чтобы достичь успеха, научитесь расставлять приоритеты и по-настоящему освоить хотя бы один навык.',
        strength: 'weak',
      },
      '2': {
        title: 'Дисциплина и интересы',
        teaser: 'Хорошая дисциплина. Методичный, аккуратный, с интересом к технике и науке.',
        description: 'Две тройки показывают хорошую дисциплину и методичность.',
        full: 'Две тройки показывают настоящую дисциплину и методичное мышление. Вы аккуратны, любите детали и имеете сильный интерес к технике и естественным наукам. Вы работаете систематично и достигаете целей через упорство. В окружении вы «организатор», вносящий структуру. Лучше всего учитесь через практику и пошаговый подход.',
        strength: 'normal',
      },
      '3': {
        title: 'Дисциплина и интересы',
        teaser: 'Условная дисциплина. Если интересно — сфокусированы, иначе — нет.',
        description: 'Три тройки показывают условную дисциплину.',
        full: 'Три тройки показывают условную дисциплину. Если тема не интересна, вы ленивы и несобранны. Но при настоящем интересе или в кризисных ситуациях вы способны на экстремальную концентрацию и максимальную отдачу. Вы работник типа «вкл-выкл»: либо 100%, либо ничего. Используйте это свойство, выбирая работу, которая по-настоящему вдохновляет.',
        strength: 'strong',
      },
      '4': {
        title: 'Дисциплина и интересы',
        teaser: 'Очень высокая дисциплина. Тип изобретателя с собственными методами.',
        description: 'Четыре тройки показывают очень высокую дисциплину.',
        full: 'Четыре тройки показывают очень высокую дисциплину. Вы разрабатываете собственные методы и системы. Вы тип изобретателя, улучшающий существующие подходы и находящий новые пути. Ваш стиль работы необычен, но крайне эффективен. Вам нужна свобода в методике — жёсткие предписания вас фрустрируют. Лучше всего раскрываетесь в творческих или научных профессиях.',
        strength: 'strong',
      },
    },
  },

  4: {
    de: {
      '0': {
        title: 'Gesundheit & Körper',
        teaser: 'Schwache körperliche Konstitution. Besondere Aufmerksamkeit auf Gesundheit ist wichtig.',
        description: 'Keine Vieren signalisieren eine schwache körperliche Konstitution von Geburt an.',
        full: 'Keine Vieren signalisieren eine schwache körperliche Konstitution von Geburt an. Du bist anfälliger für Krankheiten und musst besonders auf deinen Körper achten. Regelmäßiger Sport, gesunde Ernährung und Stressvermeidung sind für dich keine Option, sondern Pflicht. Du neigst dazu, körperliche Schwäche zu ignorieren, bis es zu spät ist. Investiere in Prävention und höre auf die Signale deines Körpers.',
        strength: 'none',
      },
      '1': {
        title: 'Gesundheit & Körper',
        teaser: 'Gesundheit vorhanden, aber Aufmerksamkeit nötig. Du achtest auf dein Äußeres.',
        description: 'Eine Vier zeigt vorhandene Gesundheit, die aber Aufmerksamkeit braucht.',
        full: 'Eine Vier zeigt, dass Gesundheit vorhanden ist, aber gepflegt werden muss. Du achtest auf dein Äußeres und legst Wert auf ein gepflegtes Erscheinungsbild. Wenn du krank wirst, solltest du die Ursache nicht ignorieren, denn ohne Prävention können sich chronische Probleme entwickeln. Sport und Bewegung halten dich fit. Du hast ein gutes Körperbewusstsein, das du stärker nutzen solltest.',
        strength: 'weak',
      },
      '2': {
        title: 'Gesundheit & Körper',
        teaser: 'Robuste Gesundheit. Starke Konstitution, schöner Körper, sportliches Naturell.',
        description: 'Zwei Vieren deuten auf eine robuste Gesundheit und starke Konstitution hin.',
        full: 'Zwei Vieren zeigen starke Gesundheit und einen schönen Körper. Du hast eine kräftige Konstitution und erholst dich schnell von Krankheiten. Sport und körperliche Arbeit liegen dir natürlich. Wenn du jedoch krank wirst, dann ernsthaft — halbe Sachen gibt es bei dir nicht. Du besitzt physische Stärke und Ausstrahlung. Berufe mit körperlichem Einsatz liegen dir besonders.',
        strength: 'normal',
      },
      '3': {
        title: 'Gesundheit & Körper',
        teaser: 'Außergewöhnlich starke Konstitution. Interesse an Menschen und Gesellschaft.',
        description: 'Drei oder mehr Vieren zeigen außergewöhnliche Gesundheit mit sozialem Interesse.',
        full: 'Drei oder mehr Vieren zeigen eine außergewöhnlich starke Konstitution. Zusätzlich entwickelst du ein starkes Interesse an Menschen und Gesellschaft. Du bist ideal für Berufe im Gesundheitswesen, Rettungsdienst oder sozialen Bereich geeignet. Deine körperliche Stärke kombiniert mit deinem sozialen Interesse macht dich zu einem natürlichen Helfer. Du besitzt Widerstandskraft, die andere beeindruckt.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Здоровье и тело',
        teaser: 'Слабая физическая конституция. Особое внимание к здоровью необходимо.',
        description: 'Отсутствие четвёрок сигнализирует о слабой физической конституции от рождения.',
        full: 'Отсутствие четвёрок сигнализирует о слабой физической конституции от рождения. Вы более подвержены болезням и должны особенно заботиться о теле. Регулярный спорт, здоровое питание и избежание стресса для вас не выбор, а обязанность. Вы склонны игнорировать физическую слабость, пока не станет слишком поздно. Инвестируйте в профилактику и слушайте сигналы тела.',
        strength: 'none',
      },
      '1': {
        title: 'Здоровье и тело',
        teaser: 'Здоровье есть, но требует внимания. Вы следите за внешностью.',
        description: 'Одна четвёрка показывает имеющееся здоровье, требующее внимания.',
        full: 'Одна четвёрка показывает, что здоровье есть, но его нужно поддерживать. Вы следите за внешностью и придаёте значение ухоженному виду. При болезни не игнорируйте причины, иначе могут развиться хронические проблемы. Спорт и движение поддерживают вашу форму. У вас хорошее чувство тела, которое стоит использовать сильнее.',
        strength: 'weak',
      },
      '2': {
        title: 'Здоровье и тело',
        teaser: 'Крепкое здоровье. Сильная конституция, красивое тело, спортивная натура.',
        description: 'Две четвёрки указывают на крепкое здоровье и сильную конституцию.',
        full: 'Две четвёрки показывают крепкое здоровье и красивое тело. У вас мощная конституция и быстрое восстановление. Спорт и физический труд даются вам естественно. Но если вы болеете, то серьёзно — полумер не бывает. Вы обладаете физической силой и харизмой. Профессии с физической нагрузкой вам особенно подходят.',
        strength: 'normal',
      },
      '3': {
        title: 'Здоровье и тело',
        teaser: 'Исключительно крепкая конституция. Интерес к людям и обществу.',
        description: 'Три и более четвёрок показывают исключительное здоровье с социальным интересом.',
        full: 'Три и более четвёрок показывают исключительно крепкую конституцию. Дополнительно у вас развивается сильный интерес к людям и обществу. Вы идеально подходите для профессий в здравоохранении, спасательных службах или социальной сфере. Ваша физическая сила в сочетании с социальным интересом делает вас прирождённым помощником.',
        strength: 'strong',
      },
    },
  },

  5: {
    de: {
      '0': {
        title: 'Logik & Planung',
        teaser: 'Ein Träumer mit starkem Bauchgefühl. Logisches Denken ist nicht deine Stärke.',
        description: 'Keine Fünfen deuten auf einen Träumer hin, der Schwierigkeiten mit logischem Denken hat.',
        full: 'Keine Fünfen deuten auf einen Träumer hin. Du hast Schwierigkeiten mit logischem Denken und Planen. Du kannst nicht gut mit Geld umgehen und bist für exakte Wissenschaften ungeeignet. Dafür hast du ein starkes Bauchgefühl und verlässt dich auf Intuition statt auf Analyse. Dein Weg zum Erfolg führt über kreative und intuitive Berufe, nicht über Zahlen und Logik.',
        strength: 'none',
      },
      '1': {
        title: 'Logik & Planung',
        teaser: 'Schwache Logik. Du planst maximal Tage oder Wochen voraus.',
        description: 'Eine Fünf zeigt schwache Logik. Du kannst kurzfristig planen, aber nicht langfristig.',
        full: 'Eine Fünf zeigt schwache Logik. Du kannst nur kurzfristig planen — maximal Tage, Wochen oder einen Monat voraus. Langfristige Strategien überfordern dich. Du analysierst Situationen nur oberflächlich und verpasst oft wichtige Details. Um dich zu verbessern, übe bewusst langfristiges Denken und schreibe deine Pläne auf, anstatt sie im Kopf zu behalten.',
        strength: 'weak',
      },
      '2': {
        title: 'Logik & Planung',
        teaser: 'Starke Logik. Guter Analyst und Planer, der Familienprobleme löst.',
        description: 'Zwei Fünfen zeigen starke Logik und analytisches Denkvermögen.',
        full: 'Zwei Fünfen zeigen starke Logik und ausgeprägtes analytisches Denkvermögen. Du bist ein guter Analyst und Planer, der auch komplexe Familienprobleme lösen kann. Du erklärst Dinge detailliert und nachvollziehbar. Du planst langfristig und berücksichtigst viele Faktoren. Berufe in Analyse, Beratung oder Finanzen liegen dir besonders.',
        strength: 'normal',
      },
      '3': {
        title: 'Logik & Planung',
        teaser: 'Starke Logik mit Intuition. Fokussiert auf Familiensicherheit.',
        description: 'Drei Fünfen zeigen eine Kombination aus Logik und Intuition.',
        full: 'Drei Fünfen zeigen paradoxerweise eine schwächere Logik als zwei Fünfen, dafür aber eine starke Intuition. Du fokussierst dich auf Familiensicherheit und triffst in Krisensituationen intuitiv die richtigen Entscheidungen. Dein logisches Denken wird durch emotionale Faktoren beeinflusst, was sowohl Stärke als auch Schwäche sein kann.',
        strength: 'strong',
      },
      '4': {
        title: 'Logik & Planung',
        teaser: 'Überstarke Logik. Kann Ergebnisse vorhersagen, frustriert von anderen.',
        description: 'Vier oder mehr Fünfen zeigen überstarke Logik mit Frustrationspotenzial.',
        full: 'Vier oder mehr Fünfen zeigen überstarke Logik. Du kannst Ergebnisse voraussagen und Zusammenhänge sehen, die andere nicht erkennen. Das führt oft zu Frustration, weil du nicht verstehst, warum andere so langsam denken. Du neigst zu Depressionen, wenn deine logischen Analysen von niemandem verstanden werden. Suche dir ein Umfeld, das dein Denkniveau teilt.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Логика и планирование',
        teaser: 'Мечтатель с сильной интуицией. Логическое мышление — не ваша сильная сторона.',
        description: 'Отсутствие пятёрок указывает на мечтателя с трудностями в логическом мышлении.',
        full: 'Отсутствие пятёрок указывает на мечтателя. У вас сложности с логическим мышлением и планированием. Вы плохо обращаетесь с деньгами и не подходите для точных наук. Зато у вас сильная интуиция, и вы полагаетесь на чувства, а не на анализ. Ваш путь к успеху — через творческие и интуитивные профессии.',
        strength: 'none',
      },
      '1': {
        title: 'Логика и планирование',
        teaser: 'Слабая логика. Планируете максимум на дни или недели вперёд.',
        description: 'Одна пятёрка показывает слабую логику и краткосрочное планирование.',
        full: 'Одна пятёрка показывает слабую логику. Вы способны планировать только краткосрочно — максимум на дни, недели или месяц. Долгосрочные стратегии вас перегружают. Вы анализируете ситуации поверхностно и часто упускаете важные детали. Для улучшения практикуйте долгосрочное мышление и записывайте планы.',
        strength: 'weak',
      },
      '2': {
        title: 'Логика и планирование',
        teaser: 'Сильная логика. Хороший аналитик и планировщик.',
        description: 'Две пятёрки указывают на сильную логику и аналитические способности.',
        full: 'Две пятёрки показывают сильную логику и выраженные аналитические способности. Вы хороший аналитик и планировщик, способный решать сложные семейные проблемы. Объясняете вещи детально и понятно. Планируете долгосрочно и учитываете множество факторов. Профессии в анализе, консалтинге или финансах вам особенно подходят.',
        strength: 'normal',
      },
      '3': {
        title: 'Логика и планирование',
        teaser: 'Сильная логика с интуицией. Фокус на безопасности семьи.',
        description: 'Три пятёрки показывают комбинацию логики и интуиции.',
        full: 'Три пятёрки парадоксально показывают более слабую логику, чем две пятёрки, но сильную интуицию. Вы фокусируетесь на безопасности семьи и в кризисных ситуациях интуитивно принимаете правильные решения. Ваше логическое мышление подвержено влиянию эмоций — это и сила, и слабость одновременно.',
        strength: 'strong',
      },
      '4': {
        title: 'Логика и планирование',
        teaser: 'Сверхсильная логика. Предсказывает результаты, фрустрирован окружающими.',
        description: 'Четыре и более пятёрок показывают сверхсильную логику.',
        full: 'Четыре и более пятёрок показывают сверхсильную логику. Вы способны предсказывать результаты и видеть связи, недоступные другим. Это часто ведёт к фрустрации — вы не понимаете, почему другие мыслят так медленно. Склонны к депрессии, когда ваш анализ не находит понимания. Ищите окружение, разделяющее ваш уровень мышления.',
        strength: 'dominant',
      },
    },
  },

  6: {
    de: {
      '0': {
        title: 'Arbeit & Handwerk',
        teaser: 'Keine Neigung zur Arbeit. Du arbeitest nur aus Pflicht, nicht aus Liebe.',
        description: 'Keine Sechsen bedeuten keine natürliche Neigung zur körperlichen Arbeit.',
        full: 'Keine Sechsen bedeuten, dass du keine Neigung zur körperlichen Arbeit hast. Du arbeitest nur aus Pflicht und Notwendigkeit, nicht aus innerer Motivation. Du bist ein Künstlertyp, der sich eher kreativ als praktisch ausdrückt. Zwinge dich nicht in handwerkliche Berufe — wähle stattdessen eine Tätigkeit, die deinen geistigen und kreativen Stärken entspricht.',
        strength: 'none',
      },
      '1': {
        title: 'Arbeit & Handwerk',
        teaser: 'Stimmungsabhängige Arbeit. Qualität variiert mit Begeisterung.',
        description: 'Eine Sechs zeigt stimmungsabhängige Arbeitsbereitschaft.',
        full: 'Eine Sechs zeigt, dass du stimmungsabhängig arbeitest. Wenn dich eine Aufgabe begeistert, lieferst du Spitzenqualität. Wenn nicht, ist das Ergebnis mittelmäßig. Du brauchst eine Aufgabe, die dich emotional bewegt, um dein volles Potenzial zu entfalten. Monotone Routinearbeit ist dein Feind — suche dir Aufgaben mit Abwechslung und Bedeutung.',
        strength: 'weak',
      },
      '2': {
        title: 'Arbeit & Handwerk',
        teaser: 'Goldene Hände. Meister im Handwerk, liebt es, Dinge zu erschaffen.',
        description: 'Zwei Sechsen deuten auf einen Meister im Handwerk hin.',
        full: 'Zwei Sechsen zeigen „goldene Hände". Du bist ein Meister im Handwerk und liebst es, mit deinen Händen zu arbeiten. Du findest sogar Freude an monotoner Arbeit, weil du den Prozess genießt. Deine Werke haben eine besondere Qualität, die andere bewundern. Du bist zuverlässig, geduldig und ergebnisorientiert. Handwerkliche und praktische Berufe sind deine Berufung.',
        strength: 'normal',
      },
      '3': {
        title: 'Arbeit & Handwerk',
        teaser: 'Arbeitsbesessen. Natürlicher Geschäftsmann — Vorsicht vor Gier.',
        description: 'Drei oder mehr Sechsen zeigen Arbeitsliebe und Geschäftssinn.',
        full: 'Drei oder mehr Sechsen zeigen einen Menschen, der Arbeit liebt. Du bist ein natürlicher Geschäftsmann mit starkem Antrieb. Im positiven Fall erreichst du durch harte Arbeit außergewöhnlichen Erfolg. Im negativen Fall kann dies zu Gier, Härte und Manipulation führen. Achte darauf, dass dein Arbeitsethos nicht zur Besessenheit wird. Kreative und unternehmerische Tätigkeiten liegen dir am besten.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Труд и мастерство',
        teaser: 'Нет тяги к труду. Работаете только по долгу, а не из любви.',
        description: 'Отсутствие шестёрок означает отсутствие тяги к физическому труду.',
        full: 'Отсутствие шестёрок означает, что у вас нет тяги к физическому труду. Вы работаете только по долгу и необходимости, а не по внутренней мотивации. Вы творческий тип, выражающийся скорее креативно, чем практически. Не заставляйте себя заниматься ремёслами — выбирайте деятельность, соответствующую вашим умственным и творческим сильным сторонам.',
        strength: 'none',
      },
      '1': {
        title: 'Труд и мастерство',
        teaser: 'Работа зависит от настроения. Качество меняется с энтузиазмом.',
        description: 'Одна шестёрка показывает зависимость работоспособности от настроения.',
        full: 'Одна шестёрка показывает, что вы работаете по настроению. Когда задача вдохновляет, вы выдаёте высшее качество. Если нет — результат посредственный. Вам нужна задача, которая эмоционально трогает, чтобы раскрыть потенциал. Монотонная рутина — ваш враг. Ищите задачи с разнообразием и смыслом.',
        strength: 'weak',
      },
      '2': {
        title: 'Труд и мастерство',
        teaser: 'Золотые руки. Мастер ремесла, любящий создавать вещи.',
        description: 'Две шестёрки указывают на мастера ремесла.',
        full: 'Две шестёрки показывают «золотые руки». Вы мастер ремесла, любящий работать руками. Вы находите удовольствие даже в монотонной работе, наслаждаясь процессом. Ваши изделия имеют особое качество, которым другие восхищаются. Вы надёжны, терпеливы и ориентированы на результат. Ремесленные и практические профессии — ваше призвание.',
        strength: 'normal',
      },
      '3': {
        title: 'Труд и мастерство',
        teaser: 'Одержимы работой. Природный бизнесмен — осторожно с жадностью.',
        description: 'Три и более шестёрок показывают любовь к труду и деловую хватку.',
        full: 'Три и более шестёрок показывают человека, любящего труд. Вы природный бизнесмен с сильным драйвом. В позитиве вы достигаете выдающегося успеха через упорный труд. В негативе это может привести к жадности, жёсткости и манипуляциям. Следите, чтобы трудовая этика не превратилась в одержимость. Творческая и предпринимательская деятельность подходит лучше всего.',
        strength: 'strong',
      },
    },
  },

  7: {
    de: {
      '0': {
        title: 'Glück & Schicksal',
        teaser: 'Wenig Glück vom Schicksal. Dein Weg erfordert eigene Anstrengung — das macht dich stark.',
        description:
          'Keine Siebenen bedeuten, dass du wenig Glück vom Schicksal erhältst. Dein Weg erfordert eigene Anstrengung. Aber genau das macht dich stark und unabhängig.',
        full: 'Keine Siebenen bedeuten, dass du keine Zeichen der Wahrheit vom Schicksal erhältst. Du musst alles durch Versuch und Irrtum lernen — es gibt keine innere Stimme, die dich leitet. Das macht deinen Weg steiniger, aber auch authentischer. Jeder Erfolg ist dein eigener Verdienst. Du wirst nicht von höheren Mächten geführt, sondern musst deinen eigenen Kompass entwickeln. Das ist keine Schwäche, sondern eine Einladung, vollständig selbstbestimmt zu leben. Deine Lebenserfahrung wird dein wertvollster Berater.',
        strength: 'none',
      },
      '1': {
        title: 'Glück & Schicksal',
        teaser: 'Leichtes Glückszeichen. Das Schicksal gibt dir Hinweise — du musst sie nur erkennen.',
        description:
          'Eine Sieben zeigt ein leichtes Glückszeichen. Das Schicksal gibt dir Hinweise, aber du musst sie erkennen und nutzen. Vertraue auf deine innere Stimme.',
        full: 'Eine Sieben zeigt, dass das Schicksal dir schwache, aber vorhandene Zeichen gibt. Du bekommst gelegentlich Hinweise — ein Bauchgefühl, eine zufällige Begegnung, ein wiederkehrendes Muster. Die Herausforderung liegt darin, diese feinen Signale von bloßen Zufällen zu unterscheiden. Entwickle deine Intuition durch Achtsamkeit und Reflexion. Wenn du lernst, auf diese leisen Zeichen zu hören, werden sie stärker und deutlicher. Du bist auf dem richtigen Weg, aber der Weg erfordert Aufmerksamkeit.',
        strength: 'weak',
      },
      '2': {
        title: 'Glück & Schicksal',
        teaser: 'Ausgeprägtes Glück. Du bist oft zur richtigen Zeit am richtigen Ort.',
        description:
          'Zwei Siebenen deuten auf ein ausgeprägtes Glück hin. Du befindest dich oft zur richtigen Zeit am richtigen Ort. Chancen kommen auf dich zu, die andere nicht erhalten.',
        full: 'Zwei Siebenen zeigen ein stark ausgeprägtes Glücks-Potenzial. Das Schicksal sendet dir regelmäßig klare Zeichen — glückliche Fügungen, intuitive Durchbrüche und Situationen, in denen alles zusammenpasst. Du hast eine natürliche Antenne für Gelegenheiten und spürst instinktiv, wann der richtige Moment gekommen ist. Andere bewundern oft dein scheinbares Glück, aber in Wahrheit ist es deine Fähigkeit, die Zeichen der Zeit zu lesen. Nutze dieses Geschenk bewusst und teile dein Glück mit anderen.',
        strength: 'normal',
      },
      '3': {
        title: 'Glück & Schicksal',
        teaser: 'Ein echter Glückspilz. Das Universum scheint dich zu bevorzugen — nutze dieses Geschenk.',
        description:
          'Drei oder mehr Siebenen zeigen einen echten Glückspilz. Das Universum scheint dich zu bevorzugen. Nutze dieses Geschenk weise, um auch anderen zu helfen.',
        full: 'Drei Siebenen zeigen einen Menschen mit außergewöhnlichem Glück und einer tiefen Verbindung zum Schicksal. Das Universum sendet dir ständig klare Botschaften — durch Synchronizitäten, Träume und intuitive Einsichten. Du kannst Ereignisse oft vorausahnen und triffst instinktiv die richtigen Entscheidungen. Dieses Geschenk bringt aber auch Verantwortung: Nutze dein Glück nicht nur für dich selbst, sondern hilf auch anderen, ihren Weg zu finden. Du bist ein natürlicher Berater und Wegweiser für dein Umfeld.',
        strength: 'strong',
      },
      '4': {
        title: 'Glück & Schicksal',
        teaser: 'Überwältigendes Schicksalsglück. Du lebst in einem ständigen Strom glücklicher Fügungen.',
        description: 'Vier Siebenen sind extrem selten und zeigen ein überwältigendes Schicksalsglück, das dein gesamtes Leben durchdringt.',
        full: 'Vier Siebenen sind eine extrem seltene Konstellation und zeigen ein überwältigendes Schicksalsglück. Du lebst in einem ständigen Strom glücklicher Fügungen — fast so, als würde das Universum dich persönlich an die Hand nehmen. Deine Intuition ist so stark, dass sie fast übersinnlich wirkt. Die Gefahr liegt darin, dich zu sehr auf dein Glück zu verlassen und eigene Anstrengungen zu vernachlässigen. Bleib geerdet und vergiss nicht: Auch das größte Glück braucht Demut und harte Arbeit als Fundament.',
        strength: 'dominant',
      },
      '5': {
        title: 'Glück & Schicksal',
        teaser: 'Absolutes Schicksalsglück. Eine der seltensten Konstellationen — das Leben scheint magisch zu fließen.',
        description: 'Fünf oder mehr Siebenen sind die seltenste aller Konstellationen — ein fast übernatürliches Maß an Glück und schicksalhafter Führung.',
        full: 'Fünf oder mehr Siebenen sind eine der seltensten Konstellationen überhaupt. Du bist ein Mensch, dem das Glück regelrecht nachläuft. Dein Leben scheint wie von einer unsichtbaren Hand gelenkt — immer zum Besseren. Diese Gabe ist ein zweischneidiges Schwert: Einerseits öffnen sich dir Türen, die anderen verschlossen bleiben. Andererseits kann es schwer sein, den Wert eigener Anstrengung zu schätzen, wenn alles wie von selbst läuft. Deine Aufgabe ist es, dieses immense Glück sinnvoll einzusetzen — nicht nur für dich, sondern als Inspiration und Hilfe für andere.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Удача и судьба',
        teaser: 'Мало везения от судьбы. Ваш путь требует собственных усилий — это делает вас сильным.',
        description:
          'Отсутствие семёрок означает, что вы получаете мало везения от судьбы. Ваш путь требует собственных усилий. Но именно это делает вас сильным и независимым.',
        full: 'Отсутствие семёрок означает, что вы не получаете знаков истины от судьбы. Вам приходится всё постигать методом проб и ошибок — нет внутреннего голоса, который ведёт вас. Это делает ваш путь труднее, но и подлиннее. Каждый успех — исключительно ваша заслуга. Вас не ведут высшие силы, и вам нужно развить собственный компас. Это не слабость, а приглашение жить полностью самостоятельно. Ваш жизненный опыт станет вашим самым ценным советчиком.',
        strength: 'none',
      },
      '1': {
        title: 'Удача и судьба',
        teaser: 'Небольшой знак удачи. Судьба даёт подсказки — нужно их распознать.',
        description:
          'Одна семёрка показывает небольшой знак удачи. Судьба даёт вам подсказки, но вы должны их распознать и использовать. Доверяйте внутреннему голосу.',
        full: 'Одна семёрка показывает, что судьба даёт вам слабые, но существующие знаки. Вы получаете периодические подсказки — интуитивное чувство, случайная встреча, повторяющийся паттерн. Задача — отличить тонкие сигналы от простых совпадений. Развивайте интуицию через осознанность и рефлексию. Когда научитесь слышать эти тихие знаки, они станут сильнее и отчётливее. Вы на правильном пути, но путь требует внимательности.',
        strength: 'weak',
      },
      '2': {
        title: 'Удача и судьба',
        teaser: 'Выраженное везение. Вы часто оказываетесь в нужном месте в нужное время.',
        description:
          'Две семёрки указывают на выраженное везение. Вы часто оказываетесь в нужном месте в нужное время. К вам приходят возможности, которые другие не получают.',
        full: 'Две семёрки показывают сильно выраженный потенциал удачи. Судьба регулярно посылает вам ясные знаки — счастливые совпадения, интуитивные озарения и ситуации, когда всё складывается идеально. У вас природная антенна для возможностей, и вы инстинктивно чувствуете нужный момент. Другие часто восхищаются вашей кажущейся удачей, но на самом деле это ваша способность читать знаки времени. Используйте этот дар осознанно и делитесь везением с окружающими.',
        strength: 'normal',
      },
      '3': {
        title: 'Удача и судьба',
        teaser: 'Настоящий везунчик. Вселенная словно благоволит вам — используйте этот дар мудро.',
        description:
          'Три и более семёрок показывают настоящего везунчика. Вселенная словно благоволит вам. Используйте этот дар мудро, помогая и другим.',
        full: 'Три семёрки показывают человека с необычайным везением и глубокой связью с судьбой. Вселенная постоянно посылает вам ясные послания — через синхронистичности, сны и интуитивные озарения. Вы часто предчувствуете события и инстинктивно принимаете правильные решения. Этот дар несёт ответственность: используйте своё везение не только для себя, но и помогайте другим найти свой путь. Вы — природный советчик и проводник для окружающих.',
        strength: 'strong',
      },
      '4': {
        title: 'Удача и судьба',
        teaser: 'Подавляющее везение от судьбы. Вы живёте в непрерывном потоке счастливых совпадений.',
        description: 'Четыре семёрки крайне редки и показывают подавляющее везение от судьбы, пронизывающее всю вашу жизнь.',
        full: 'Четыре семёрки — крайне редкая комбинация, показывающая подавляющее везение от судьбы. Вы живёте в непрерывном потоке счастливых совпадений — словно Вселенная лично ведёт вас за руку. Ваша интуиция настолько сильна, что кажется почти сверхъестественной. Опасность в том, чтобы слишком полагаться на везение и пренебрегать собственными усилиями. Оставайтесь приземлёнными и помните: даже величайшее везение нуждается в смирении и труде как основе.',
        strength: 'dominant',
      },
      '5': {
        title: 'Удача и судьба',
        teaser: 'Абсолютное везение. Одна из редчайших комбинаций — жизнь течёт словно волшебная река.',
        description: 'Пять и более семёрок — редчайшая из всех комбинаций, почти сверхъестественный уровень везения и судьбоносного руководства.',
        full: 'Пять и более семёрок — одна из редчайших комбинаций. Вы — человек, за которым удача буквально бежит. Ваша жизнь словно управляется невидимой рукой — всегда к лучшему. Этот дар — палка о двух концах: с одной стороны, перед вами открываются двери, закрытые для других. С другой стороны, трудно ценить собственные усилия, когда всё идёт само собой. Ваша задача — использовать это огромное везение осмысленно — не только для себя, но как вдохновение и помощь для других.',
        strength: 'dominant',
      },
    },
  },

  8: {
    de: {
      '0': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Freiheitsliebend und im Moment lebend. Langfristige Verpflichtungen fallen dir schwer.',
        description:
          'Keine Achten zeigen einen freiheitsliebenden Menschen, der Verantwortung meidet. Du lebst im Moment und tust dich schwer mit langfristigen Verpflichtungen.',
        full: 'Keine Achten zeigen einen Menschen ohne angeborenes Pflichtgefühl. Du hast wenig Geduld, Toleranz und Nachsicht gegenüber anderen. Es fällt dir schwer, dich an Verpflichtungen zu halten — sowohl beruflich als auch privat. Du bevorzugst Freiheit und Flexibilität über Struktur und Routine. Das bedeutet nicht, dass du unverantwortlich bist, aber du brauchst externe Motivation und klare Konsequenzen, um Verpflichtungen einzuhalten. Arbeite an deinem Pflichtbewusstsein, indem du kleine, überschaubare Versprechen machst und sie konsequent einhältst.',
        strength: 'none',
      },
      '1': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Wachsendes Pflichtbewusstsein. Zuverlässig, wenn es darauf ankommt.',
        description:
          'Eine Acht deutet auf ein wachsendes Pflichtbewusstsein hin. Du bist zuverlässig, wenn es darauf ankommt, brauchst aber manchmal einen Anstoß von außen.',
        full: 'Eine Acht zeigt ein vorhandenes, aber noch entwicklungsfähiges Pflichtgefühl. Du hast ein grundlegendes Verständnis für Verantwortung und kannst zuverlässig sein, wenn die Situation es erfordert. Allerdings brauchst du manchmal einen externen Anstoß oder eine klare Deadline, um in Aktion zu treten. Du arbeitest am besten in Strukturen mit klaren Erwartungen. Deine Herausforderung ist es, proaktiver zu werden und Verantwortung zu übernehmen, bevor jemand dich darum bittet. Wenn du das schaffst, wirst du als verlässlicher Partner geschätzt.',
        strength: 'weak',
      },
      '2': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Starkes Verantwortungsbewusstsein. Du bist der Fels, auf den sich andere verlassen.',
        description:
          'Zwei Achten zeigen ein starkes Verantwortungsbewusstsein. Du bist der Fels in der Brandung, auf den sich andere verlassen können. Pflicht und Ehre sind dir wichtig.',
        full: 'Zwei Achten zeigen ein starkes, natürliches Pflichtgefühl. Du bist von Natur aus zuverlässig und übernimmst gerne Verantwortung — für dich selbst, deine Familie und dein Umfeld. Andere können sich blind auf dich verlassen. Du hältst deine Versprechen und empfindest es als persönliches Versagen, wenn du Erwartungen nicht erfüllst. Pflicht und Ehre sind keine leeren Worte für dich, sondern gelebte Werte. Achte darauf, dass du dich nicht übernimmst — auch du brauchst Erholung und Entlastung.',
        strength: 'normal',
      },
      '3': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Außergewöhnlich starkes Pflichtgefühl. Du opferst dich für andere auf — vergiss dich selbst nicht.',
        description:
          'Drei oder mehr Achten weisen auf einen Menschen mit außergewöhnlich starkem Pflichtgefühl hin. Du opferst dich für andere auf, musst aber auch auf deine eigenen Bedürfnisse achten.',
        full: 'Drei Achten zeigen ein außergewöhnlich starkes Pflichtgefühl, das dein gesamtes Leben prägt. Du fühlst dich verantwortlich für alles und jeden um dich herum — Familie, Freunde, Kollegen. Du bist der Mensch, der immer da ist, der nie „Nein" sagt und der sich aufopfert, um anderen zu helfen. Das ist eine bewundernswerte Eigenschaft, aber sie birgt die Gefahr des Burnouts. Du musst lernen, auch „Nein" zu sagen und deine eigenen Grenzen zu respektieren. Selbstfürsorge ist keine Selbstsucht — sie ist die Grundlage dafür, dass du auch weiterhin für andere da sein kannst.',
        strength: 'strong',
      },
      '4': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Übermäßiges Pflichtgefühl. Du trägst die Last der ganzen Welt auf deinen Schultern.',
        description: 'Vier Achten zeigen ein übermäßiges Pflichtgefühl, das zur Selbstaufgabe führen kann.',
        full: 'Vier Achten zeigen ein übermäßiges Pflichtgefühl, das zur Selbstaufgabe führen kann. Du fühlst dich für alles und jeden verantwortlich und kannst Verantwortung kaum ablehnen. Du trägst die Last der ganzen Welt auf deinen Schultern und vergisst dabei deine eigenen Bedürfnisse. Andere nutzen deine Gutmütigkeit möglicherweise aus, ohne es zu merken. Du musst dringend lernen, Grenzen zu setzen und Verantwortung zu delegieren. Deine Großzügigkeit ist eine Stärke, aber nur wenn sie nicht auf Kosten deiner eigenen Gesundheit und deines Wohlbefindens geht.',
        strength: 'dominant',
      },
      '5': {
        title: 'Pflicht & Verantwortung',
        teaser: 'Absolutes Pflichtgefühl. Dein Leben ist vollständig dem Dienst an anderen gewidmet.',
        description: 'Fünf oder mehr Achten sind extrem selten und zeigen ein fast absolutistisches Pflichtgefühl.',
        full: 'Fünf oder mehr Achten zeigen ein fast absolutistisches Pflichtgefühl. Dein gesamtes Leben dreht sich um die Erfüllung von Pflichten und den Dienst an anderen. Du bist unfähig, eine Bitte abzulehnen, und opferst dich bis zur Erschöpfung. Diese extreme Ausprägung kann zu chronischem Stress und ernsthaften Gesundheitsproblemen führen. Es ist absolut notwendig, professionelle Unterstützung zu suchen, um gesunde Grenzen zu entwickeln. Lerne, dass du nicht jedem helfen kannst — und dass das in Ordnung ist. Dein Wert als Mensch hängt nicht davon ab, wie viel du für andere tust.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Долг и ответственность',
        teaser: 'Свободолюбивый, живущий моментом. Долгосрочные обязательства даются с трудом.',
        description:
          'Отсутствие восьмёрок показывает свободолюбивого человека, избегающего ответственности. Вы живёте моментом и с трудом берёте на себя долгосрочные обязательства.',
        full: 'Отсутствие восьмёрок показывает человека без врождённого чувства долга. У вас мало терпения, толерантности и снисходительности к другим. Вам трудно придерживаться обязательств — как в профессиональной, так и в личной жизни. Вы предпочитаете свободу и гибкость структуре и рутине. Это не значит, что вы безответственны, но вам нужна внешняя мотивация и ясные последствия, чтобы выполнять обещания. Работайте над чувством долга, давая маленькие, обозримые обещания и последовательно их выполняя.',
        strength: 'none',
      },
      '1': {
        title: 'Долг и ответственность',
        teaser: 'Развивающееся чувство долга. Надёжны, когда это необходимо.',
        description:
          'Одна восьмёрка указывает на развивающееся чувство долга. Вы надёжны, когда это необходимо, но иногда вам нужен внешний толчок.',
        full: 'Одна восьмёрка показывает присутствующее, но развивающееся чувство долга. У вас есть базовое понимание ответственности, и вы можете быть надёжным, когда ситуация этого требует. Однако иногда вам нужен внешний толчок или чёткий дедлайн, чтобы начать действовать. Вы лучше всего работаете в структурах с ясными ожиданиями. Ваша задача — стать более проактивным и брать ответственность до того, как кто-то попросит. Если вы этого достигнете, вас будут ценить как надёжного партнёра.',
        strength: 'weak',
      },
      '2': {
        title: 'Долг и ответственность',
        teaser: 'Сильное чувство ответственности. Вы — скала, на которую могут положиться окружающие.',
        description:
          'Две восьмёрки показывают сильное чувство ответственности. Вы — скала, на которую могут положиться окружающие. Долг и честь для вас важны.',
        full: 'Две восьмёрки показывают сильное, природное чувство долга. Вы от природы надёжны и охотно берёте ответственность — за себя, свою семью и окружение. На вас можно слепо положиться. Вы держите обещания и воспринимаете как личное поражение, если не оправдываете ожидания. Долг и честь — не пустые слова для вас, а прожитые ценности. Следите, чтобы не перегружать себя — вам тоже нужен отдых и разгрузка.',
        strength: 'normal',
      },
      '3': {
        title: 'Долг и ответственность',
        teaser: 'Исключительно сильное чувство долга. Вы жертвуете собой — не забывайте о себе.',
        description:
          'Три и более восьмёрок указывают на человека с исключительно сильным чувством долга. Вы жертвуете собой ради других, но должны помнить и о своих потребностях.',
        full: 'Три восьмёрки показывают исключительно сильное чувство долга, пронизывающее всю вашу жизнь. Вы чувствуете ответственность за всех и всё вокруг — семью, друзей, коллег. Вы тот человек, который всегда рядом, никогда не говорит «нет» и жертвует собой ради помощи другим. Это восхитительное качество, но оно несёт риск выгорания. Вам нужно научиться говорить «нет» и уважать собственные границы. Забота о себе — не эгоизм, а основа для того, чтобы продолжать быть рядом с другими.',
        strength: 'strong',
      },
      '4': {
        title: 'Долг и ответственность',
        teaser: 'Чрезмерное чувство долга. Вы несёте на плечах тяжесть всего мира.',
        description: 'Четыре восьмёрки показывают чрезмерное чувство долга, которое может привести к самоотречению.',
        full: 'Четыре восьмёрки показывают чрезмерное чувство долга, которое может привести к полному самоотречению. Вы чувствуете ответственность за всё и за всех и не можете отказаться от обязательств. Вы несёте тяжесть всего мира на своих плечах и забываете о собственных потребностях. Другие могут пользоваться вашей добротой, не осознавая этого. Вам необходимо научиться устанавливать границы и делегировать ответственность. Ваша щедрость — сила, но только если она не в ущерб вашему здоровью и благополучию.',
        strength: 'dominant',
      },
      '5': {
        title: 'Долг и ответственность',
        teaser: 'Абсолютное чувство долга. Вся ваша жизнь посвящена служению другим.',
        description: 'Пять и более восьмёрок крайне редки и показывают почти абсолютистское чувство долга.',
        full: 'Пять и более восьмёрок показывают почти абсолютистское чувство долга. Вся ваша жизнь вращается вокруг выполнения обязанностей и служения другим. Вы не способны отказать в просьбе и жертвуете собой до изнеможения. Эта крайняя выраженность может привести к хроническому стрессу и серьёзным проблемам со здоровьем. Необходимо обратиться за профессиональной поддержкой для развития здоровых границ. Поймите, что невозможно помочь каждому — и это нормально. Ваша ценность как человека не зависит от того, сколько вы делаете для других.',
        strength: 'dominant',
      },
    },
  },

  9: {
    de: {
      '0': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Praktiker statt Theoretiker. Du lernst durch Erfahrung, nicht durch Bücher.',
        description:
          'Keine Neunen sind extrem selten und deuten auf ein begrenztes Erinnerungsvermögen hin. Du lernst durch Erfahrung, nicht durch Theorie. Praktisches Wissen liegt dir besser.',
        full: 'Keine Neunen sind extrem selten und zeigen, dass Intelligenz und Gedächtnis nicht deine primären Stärken sind. Du bist ein Praktiker — Theorie und abstraktes Denken liegen dir weniger. Du lernst am besten durch Erfahrung, Ausprobieren und konkrete Anwendung. Bücherwissen bleibt bei dir schwer haften, aber was du einmal praktisch erlernt hast, vergisst du nie. Nutze diesen Lernstil bewusst: Suche dir praktische Beispiele, Workshops und Hands-on-Erfahrungen statt trockener Theorie. Deine Stärke liegt in der Umsetzung, nicht in der Abstraktion.',
        strength: 'none',
      },
      '1': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Normales Gedächtnis. Du merkst dir Fakten, musst sie aber auffrischen. Wiederholung ist dein Schlüssel.',
        description:
          'Eine Neun zeigt eine normale Gedächtnisleistung. Du kannst dir Fakten merken, musst sie aber regelmäßig auffrischen. Wiederholung ist dein Schlüssel zum Lernen.',
        full: 'Eine Neun zeigt eine durchschnittliche Gedächtnisleistung und grundlegende analytische Fähigkeiten. Du kannst Informationen aufnehmen und verarbeiten, aber sie verblassen ohne regelmäßige Wiederholung. Dein Gedächtnis funktioniert am besten mit Struktur — Notizen, Zusammenfassungen und Wiederholungszyklen helfen dir enorm. Du bist kein natürliches Genie, aber ein fleißiger Lerner, der durch Ausdauer und Methodik viel erreichen kann. Nutze moderne Lerntools und -techniken, um dein Gedächtnis zu unterstützen und dein Wissen zu vertiefen.',
        strength: 'weak',
      },
      '2': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Gutes Gedächtnis und scharfer Verstand. Intellektuelle Herausforderungen motivieren dich.',
        description:
          'Zwei Neunen deuten auf ein gutes Gedächtnis und scharfen Verstand hin. Du merkst dir Zusammenhänge leicht und denkst analytisch. Intellektuelle Herausforderungen motivieren dich.',
        full: 'Zwei Neunen zeigen ein gutes Gedächtnis und einen scharfen, analytischen Verstand. Du erfasst Zusammenhänge schnell und kannst komplexe Informationen strukturiert verarbeiten. Intellektuelle Herausforderungen motivieren dich — du liebst es, Rätsel zu lösen und neue Konzepte zu verstehen. Du merkst dir nicht nur Fakten, sondern auch die Verbindungen zwischen ihnen. Das macht dich zu einem wertvollen Denker in Teams und Projekten. Achte darauf, dein Wissen auch praktisch anzuwenden und nicht nur theoretisch anzusammeln.',
        strength: 'normal',
      },
      '3': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Überdurchschnittliche Intelligenz mit fotografischem Gedächtnis. Komplexe Themen sind dein Spielfeld.',
        description:
          'Drei oder mehr Neunen zeigen eine überdurchschnittliche Intelligenz. Du hast ein fotografisches Gedächtnis und erfasst komplexe Themen spielend. Wissenschaft und Forschung liegen dir.',
        full: 'Drei Neunen zeigen eine überdurchschnittliche Intelligenz mit einem nahezu fotografischen Gedächtnis. Du erfasst komplexe Zusammenhänge im Handumdrehen und kannst riesige Mengen an Informationen speichern und abrufen. Wissenschaft, Forschung und intellektuelle Arbeit sind deine natürliche Domäne. Du denkst in Systemen und siehst Muster, wo andere nur Chaos sehen. Die Gefahr ist, dass du dich in intellektuellen Höhen verlierst und den Bezug zur Praxis verlierst. Versuche, dein Wissen auch praktisch nutzbar zu machen und mit anderen zu teilen.',
        strength: 'strong',
      },
      '4': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Geniale Intelligenz. Dein Verstand arbeitet auf einem Niveau, das andere kaum nachvollziehen können.',
        description: 'Vier Neunen zeigen eine geniale Intelligenz, die weit über dem Durchschnitt liegt.',
        full: 'Vier Neunen zeigen eine geniale Intelligenz, die weit über dem Durchschnitt liegt. Dein Verstand arbeitet auf einem Niveau, das andere kaum nachvollziehen können. Du siehst Lösungen sofort, erfasst die tiefste Essenz eines Problems und vergisst praktisch nichts. Diese Gabe kann aber auch einsam machen: Du wirst von anderen möglicherweise nicht verstanden oder als arrogant wahrgenommen. Die Herausforderung liegt darin, deine Intelligenz mit Empathie und Geduld zu verbinden. Nutze deine Gabe, um komplexe Probleme für die Allgemeinheit zu lösen.',
        strength: 'dominant',
      },
      '5': {
        title: 'Intelligenz & Gedächtnis',
        teaser: 'Außergewöhnliches Genie. Dein Gedächtnis und Verstand sind nahezu grenzenlos.',
        description: 'Fünf oder mehr Neunen sind extrem selten und zeigen ein außergewöhnliches Genie mit nahezu grenzenlosem Verstand.',
        full: 'Fünf oder mehr Neunen zeigen ein außergewöhnliches Genie — eine extrem seltene Konstellation. Dein Gedächtnis und dein analytischer Verstand sind nahezu grenzenlos. Du kannst alles lernen, alles verstehen und alles behalten. Allerdings birgt diese extreme Intelligenz auch die Gefahr der Isolation: Du denkst schneller als alle anderen und wirst oft missverstanden. Es kann schwer sein, gleichgesinnte Menschen zu finden. Deine Aufgabe ist es, deine Genialität mit Menschlichkeit zu verbinden und dein Wissen in den Dienst anderer zu stellen. Die Welt braucht deinen Verstand — aber auch dein Herz.',
        strength: 'dominant',
      },
    },
    ru: {
      '0': {
        title: 'Интеллект и память',
        teaser: 'Практик, а не теоретик. Вы учитесь через опыт, а не по книгам.',
        description:
          'Отсутствие девяток крайне редко и указывает на ограниченную способность запоминания. Вы учитесь через опыт, а не теорию. Практические знания вам ближе.',
        full: 'Отсутствие девяток крайне редко и показывает, что интеллект и память — не ваши основные сильные стороны. Вы практик — теория и абстрактное мышление даются вам с трудом. Вы лучше всего учитесь через опыт, эксперименты и конкретное применение. Книжные знания плохо задерживаются, но то, что вы освоили практически, вы не забудете никогда. Используйте этот стиль обучения осознанно: ищите практические примеры, мастер-классы и практический опыт вместо сухой теории. Ваша сила — в реализации, а не в абстракции.',
        strength: 'none',
      },
      '1': {
        title: 'Интеллект и память',
        teaser: 'Обычная память. Вы запоминаете факты, но нужно их повторять. Повторение — ваш ключ.',
        description:
          'Одна девятка показывает обычную память. Вы можете запоминать факты, но их нужно регулярно повторять. Повторение — ваш ключ к обучению.',
        full: 'Одна девятка показывает среднюю память и базовые аналитические способности. Вы можете воспринимать и обрабатывать информацию, но она тускнеет без регулярного повторения. Ваша память лучше всего работает со структурой — заметки, конспекты и циклы повторения помогают вам невероятно. Вы не прирождённый гений, но усердный ученик, который может многого добиться настойчивостью и методичностью. Используйте современные инструменты обучения и техники для поддержки памяти и углубления знаний.',
        strength: 'weak',
      },
      '2': {
        title: 'Интеллект и память',
        teaser: 'Хорошая память и острый ум. Интеллектуальные вызовы вас мотивируют.',
        description:
          'Две девятки указывают на хорошую память и острый ум. Вы легко запоминаете взаимосвязи и мыслите аналитически. Интеллектуальные вызовы вас мотивируют.',
        full: 'Две девятки показывают хорошую память и острый, аналитический ум. Вы быстро схватываете взаимосвязи и можете структурированно обрабатывать сложную информацию. Интеллектуальные вызовы мотивируют вас — вам нравится решать головоломки и понимать новые концепции. Вы запоминаете не только факты, но и связи между ними. Это делает вас ценным мыслителем в командах и проектах. Следите за тем, чтобы применять знания практически, а не только накапливать их теоретически.',
        strength: 'normal',
      },
      '3': {
        title: 'Интеллект и память',
        teaser: 'Незаурядный интеллект с фотографической памятью. Сложные темы — ваша стихия.',
        description:
          'Три и более девяток показывают незаурядный интеллект. У вас фотографическая память и вы легко осваиваете сложные темы. Наука и исследования — ваша стихия.',
        full: 'Три девятки показывают незаурядный интеллект с почти фотографической памятью. Вы схватываете сложные взаимосвязи мгновенно и можете хранить и воспроизводить огромные объёмы информации. Наука, исследования и интеллектуальная работа — ваша природная стихия. Вы мыслите системами и видите паттерны там, где другие видят только хаос. Опасность в том, что вы можете потеряться в интеллектуальных высотах и утратить связь с практикой. Старайтесь делать знания практически полезными и делиться ими с другими.',
        strength: 'strong',
      },
      '4': {
        title: 'Интеллект и память',
        teaser: 'Гениальный интеллект. Ваш разум работает на уровне, который другим трудно постичь.',
        description: 'Четыре девятки показывают гениальный интеллект, значительно превышающий средний уровень.',
        full: 'Четыре девятки показывают гениальный интеллект, значительно превышающий средний уровень. Ваш разум работает на уровне, который другим трудно постичь. Вы видите решения мгновенно, схватываете глубинную суть проблемы и практически ничего не забываете. Этот дар может быть одиноким: другие могут вас не понимать или считать высокомерным. Задача — соединить свой интеллект с эмпатией и терпением. Используйте свой дар для решения сложных проблем на благо общества.',
        strength: 'dominant',
      },
      '5': {
        title: 'Интеллект и память',
        teaser: 'Исключительный гений. Ваша память и разум практически безграничны.',
        description: 'Пять и более девяток крайне редки и показывают исключительного гения с практически безграничным разумом.',
        full: 'Пять и более девяток показывают исключительного гения — крайне редкую комбинацию. Ваша память и аналитический разум практически безграничны. Вы можете выучить всё, понять всё и запомнить всё. Однако этот экстремальный интеллект несёт риск изоляции: вы думаете быстрее всех остальных и часто бываете непонятым. Найти единомышленников может быть сложно. Ваша задача — соединить гениальность с человечностью и поставить знания на службу другим. Миру нужен ваш разум — но также и ваше сердце.',
        strength: 'dominant',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Line Interpretations
// ---------------------------------------------------------------------------

type LineData = Record<
  string,
  {
    de: Record<string, { title: string; description: string; strength: Interpretation['strength'] }>;
    ru: Record<string, { title: string; description: string; strength: Interpretation['strength'] }>;
  }
>;

const lineInterpretations: LineData = {
  row1: {
    de: {
      '0': {
        title: 'Selbstwertgefühl (Zeile 1)',
        description: 'Kein Selbstwertgefühl in der Matrix. Du neigst dazu, dich selbst zu unterschätzen und brauchst Bestätigung von außen.',
        strength: 'none',
      },
      low: {
        title: 'Selbstwertgefühl (Zeile 1)',
        description: 'Ein geringes Selbstwertgefühl. Du zweifelst oft an deinen Fähigkeiten. Arbeite daran, deine Stärken bewusst wahrzunehmen.',
        strength: 'weak',
      },
      mid: {
        title: 'Selbstwertgefühl (Zeile 1)',
        description: 'Ein ausgeglichenes Selbstwertgefühl. Du kennst deinen Wert und kannst realistisch einschätzen, was du erreichen kannst.',
        strength: 'normal',
      },
      high: {
        title: 'Selbstwertgefühl (Zeile 1)',
        description: 'Ein sehr starkes Selbstwertgefühl. Du glaubst fest an dich und deine Ziele. Achte darauf, dass Selbstvertrauen nicht in Überheblichkeit umschlägt.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Самооценка (Строка 1)',
        description: 'Отсутствие самооценки в матрице. Вы склонны недооценивать себя и нуждаетесь в подтверждении извне.',
        strength: 'none',
      },
      low: {
        title: 'Самооценка (Строка 1)',
        description: 'Низкая самооценка. Вы часто сомневаетесь в своих способностях. Работайте над осознанием своих сильных сторон.',
        strength: 'weak',
      },
      mid: {
        title: 'Самооценка (Строка 1)',
        description: 'Сбалансированная самооценка. Вы знаете свою ценность и реалистично оцениваете, чего можете достичь.',
        strength: 'normal',
      },
      high: {
        title: 'Самооценка (Строка 1)',
        description: 'Очень сильная самооценка. Вы твёрдо верите в себя и свои цели. Следите, чтобы уверенность не превратилась в высокомерие.',
        strength: 'strong',
      },
    },
  },
  row2: {
    de: {
      '0': {
        title: 'Familienlinie (Zeile 2)',
        description: 'Kein Familienwert. Partnerschaft und Familie haben für dich keine hohe Priorität. Du bist eher ein Einzelgänger.',
        strength: 'none',
      },
      low: {
        title: 'Familienlinie (Zeile 2)',
        description: 'Schwacher Familiensinn. Du schätzt deine Unabhängigkeit, solltest aber daran arbeiten, engere Bindungen zuzulassen.',
        strength: 'weak',
      },
      mid: {
        title: 'Familienlinie (Zeile 2)',
        description: 'Guter Familiensinn. Familie und Partnerschaft sind dir wichtig, und du investierst gerne in stabile Beziehungen.',
        strength: 'normal',
      },
      high: {
        title: 'Familienlinie (Zeile 2)',
        description: 'Sehr starker Familiensinn. Du bist ein Familienmensch, der alles für seine Liebsten tut. Familie ist dein Lebensmittelpunkt.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Семья (Строка 2)',
        description: 'Отсутствие семейных ценностей. Партнёрство и семья не являются для вас приоритетом. Вы скорее одиночка.',
        strength: 'none',
      },
      low: {
        title: 'Семья (Строка 2)',
        description: 'Слабое чувство семьи. Вы цените независимость, но стоит работать над допуском близких отношений.',
        strength: 'weak',
      },
      mid: {
        title: 'Семья (Строка 2)',
        description: 'Хорошее чувство семьи. Семья и партнёрство для вас важны, и вы охотно инвестируете в стабильные отношения.',
        strength: 'normal',
      },
      high: {
        title: 'Семья (Строка 2)',
        description: 'Очень сильное чувство семьи. Вы семейный человек, который делает всё для близких. Семья — центр вашей жизни.',
        strength: 'strong',
      },
    },
  },
  row3: {
    de: {
      '0': {
        title: 'Stabilität (Zeile 3)',
        description: 'Keine Stabilität. Du bist unbeständig und magst keine Routine. Veränderungen machen dir keine Angst, aber Beständigkeit ist schwer.',
        strength: 'none',
      },
      low: {
        title: 'Stabilität (Zeile 3)',
        description: 'Geringe Stabilität. Du bist flexibel, brauchst aber mehr Struktur in deinem Leben, um deine Ziele zu erreichen.',
        strength: 'weak',
      },
      mid: {
        title: 'Stabilität (Zeile 3)',
        description: 'Gute Stabilität. Du findest die Balance zwischen Flexibilität und Beständigkeit. Gewohnheiten geben dir Sicherheit.',
        strength: 'normal',
      },
      high: {
        title: 'Stabilität (Zeile 3)',
        description: 'Starke Stabilität. Du bist ein Fels in der Brandung und veränderst ungern deine Gewohnheiten. Routinen geben dir Kraft.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Стабильность (Строка 3)',
        description: 'Отсутствие стабильности. Вы непостоянны и не любите рутину. Перемены вас не пугают, но постоянство даётся с трудом.',
        strength: 'none',
      },
      low: {
        title: 'Стабильность (Строка 3)',
        description: 'Низкая стабильность. Вы гибки, но вам нужно больше структуры в жизни для достижения целей.',
        strength: 'weak',
      },
      mid: {
        title: 'Стабильность (Строка 3)',
        description: 'Хорошая стабильность. Вы находите баланс между гибкостью и постоянством. Привычки дают вам уверенность.',
        strength: 'normal',
      },
      high: {
        title: 'Стабильность (Строка 3)',
        description: 'Сильная стабильность. Вы — скала, неохотно меняющая привычки. Рутина даёт вам силу.',
        strength: 'strong',
      },
    },
  },
  col1: {
    de: {
      '0': {
        title: 'Selbsteinschätzung (Spalte 1)',
        description: 'Keine Selbsteinschätzung. Du weißt nicht, wer du bist und was du wert bist. Selbstreflexion würde dir helfen.',
        strength: 'none',
      },
      low: {
        title: 'Selbsteinschätzung (Spalte 1)',
        description: 'Niedrige Selbsteinschätzung. Du neigst dazu, dich zu unterschätzen. Lerne, deine Erfolge bewusst wahrzunehmen.',
        strength: 'weak',
      },
      mid: {
        title: 'Selbsteinschätzung (Spalte 1)',
        description: 'Gesunde Selbsteinschätzung. Du kennst deine Stärken und Schwächen und gehst realistisch mit dir um.',
        strength: 'normal',
      },
      high: {
        title: 'Selbsteinschätzung (Spalte 1)',
        description: 'Überhöhte Selbsteinschätzung. Du bist sehr selbstbewusst und glaubst fest an deine Fähigkeiten.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Самооценка (Столбец 1)',
        description: 'Отсутствие самооценки. Вы не знаете, кто вы и чего стоите. Саморефлексия вам поможет.',
        strength: 'none',
      },
      low: {
        title: 'Самооценка (Столбец 1)',
        description: 'Низкая самооценка. Вы склонны себя недооценивать. Учитесь осознанно замечать свои успехи.',
        strength: 'weak',
      },
      mid: {
        title: 'Самооценка (Столбец 1)',
        description: 'Здоровая самооценка. Вы знаете свои сильные и слабые стороны и реалистично к себе относитесь.',
        strength: 'normal',
      },
      high: {
        title: 'Самооценка (Столбец 1)',
        description: 'Завышенная самооценка. Вы очень уверены в себе и крепко верите в свои способности.',
        strength: 'strong',
      },
    },
  },
  col2: {
    de: {
      '0': {
        title: 'Finanzlinie (Spalte 2)',
        description: 'Kein Finanzsinn. Geld kommt und geht, ohne dass du es kontrollieren kannst. Finanzielle Bildung ist sehr empfehlenswert.',
        strength: 'none',
      },
      low: {
        title: 'Finanzlinie (Spalte 2)',
        description: 'Geringer Finanzsinn. Du verdienst Geld, gibst es aber schnell aus. Budgetplanung würde dir helfen.',
        strength: 'weak',
      },
      mid: {
        title: 'Finanzlinie (Spalte 2)',
        description: 'Guter Finanzsinn. Du gehst verantwortungsvoll mit Geld um und kannst finanzielle Stabilität aufbauen.',
        strength: 'normal',
      },
      high: {
        title: 'Finanzlinie (Spalte 2)',
        description: 'Ausgeprägter Finanzsinn. Du hast ein Talent für Geld und finanzielles Wachstum. Investitionen liegen dir.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Финансы (Столбец 2)',
        description: 'Отсутствие финансового чутья. Деньги приходят и уходят без вашего контроля. Финансовое образование очень рекомендуется.',
        strength: 'none',
      },
      low: {
        title: 'Финансы (Столбец 2)',
        description: 'Слабое финансовое чутьё. Вы зарабатываете, но быстро тратите. Планирование бюджета вам поможет.',
        strength: 'weak',
      },
      mid: {
        title: 'Финансы (Столбец 2)',
        description: 'Хорошее финансовое чутьё. Вы ответственно относитесь к деньгам и можете построить финансовую стабильность.',
        strength: 'normal',
      },
      high: {
        title: 'Финансы (Столбец 2)',
        description: 'Выраженное финансовое чутьё. У вас талант к деньгам и финансовому росту. Инвестиции — ваша стихия.',
        strength: 'strong',
      },
    },
  },
  col3: {
    de: {
      '0': {
        title: 'Talent-Linie (Spalte 3)',
        description: 'Kein natürliches Talent sichtbar. Das bedeutet nicht, dass du keine Talente hast - sie müssen nur entdeckt und entwickelt werden.',
        strength: 'none',
      },
      low: {
        title: 'Talent-Linie (Spalte 3)',
        description: 'Leichte Talente vorhanden. Du hast Anlagen, die durch Übung und Hingabe zu echten Stärken werden können.',
        strength: 'weak',
      },
      mid: {
        title: 'Talent-Linie (Spalte 3)',
        description: 'Deutliche Talente. Du hast natürliche Begabungen, die dir Türen öffnen. Nutze sie bewusst.',
        strength: 'normal',
      },
      high: {
        title: 'Talent-Linie (Spalte 3)',
        description: 'Außergewöhnliche Talente. Du bist vielseitig begabt und kannst in verschiedenen Bereichen Spitzenleistungen erbringen.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Таланты (Столбец 3)',
        description: 'Природные таланты не видны. Это не значит, что их нет — их нужно открыть и развить.',
        strength: 'none',
      },
      low: {
        title: 'Таланты (Столбец 3)',
        description: 'Небольшие таланты. У вас есть задатки, которые через практику и усердие могут стать настоящими сильными сторонами.',
        strength: 'weak',
      },
      mid: {
        title: 'Таланты (Столбец 3)',
        description: 'Заметные таланты. У вас есть природные способности, которые открывают двери. Используйте их осознанно.',
        strength: 'normal',
      },
      high: {
        title: 'Таланты (Столбец 3)',
        description: 'Выдающиеся таланты. Вы разносторонне одарены и можете достигать вершин в различных областях.',
        strength: 'strong',
      },
    },
  },
  diagonalDown: {
    de: {
      '0': {
        title: 'Spirituelle Linie (Diagonale \\)',
        description: 'Keine Spiritualität. Du bist ein rein rational denkender Mensch. Meditation und Achtsamkeit könnten dir neue Perspektiven eröffnen.',
        strength: 'none',
      },
      low: {
        title: 'Spirituelle Linie (Diagonale \\)',
        description: 'Leichte spirituelle Anlage. Du spürst manchmal eine höhere Kraft und bist offen für tiefere Lebensfragen.',
        strength: 'weak',
      },
      mid: {
        title: 'Spirituelle Linie (Diagonale \\)',
        description: 'Ausgeprägte Spiritualität. Du hast einen natürlichen Zugang zur spirituellen Welt und findest in Meditation und Selbstreflexion Kraft.',
        strength: 'normal',
      },
      high: {
        title: 'Spirituelle Linie (Diagonale \\)',
        description: 'Tiefe Spiritualität. Du bist mit der Quelle verbunden und hast eine starke intuitive Begabung. Spirituelle Praxis ist Teil deines Wesens.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Духовность (Диагональ \\)',
        description: 'Отсутствие духовности. Вы мыслите чисто рационально. Медитация и осознанность могут открыть новые перспективы.',
        strength: 'none',
      },
      low: {
        title: 'Духовность (Диагональ \\)',
        description: 'Небольшие духовные задатки. Вы иногда ощущаете высшую силу и открыты к глубоким вопросам жизни.',
        strength: 'weak',
      },
      mid: {
        title: 'Духовность (Диагональ \\)',
        description: 'Выраженная духовность. У вас естественный доступ к духовному миру, и вы находите силу в медитации и саморефлексии.',
        strength: 'normal',
      },
      high: {
        title: 'Духовность (Диагональ \\)',
        description: 'Глубокая духовность. Вы связаны с источником и обладаете сильной интуицией. Духовная практика — часть вашей сущности.',
        strength: 'strong',
      },
    },
  },
  diagonalUp: {
    de: {
      '0': {
        title: 'Temperament (Diagonale /)',
        description: 'Kein ausgeprägtes Temperament. Du bist ruhig und gleichmütig. Leidenschaft muss bei dir erst geweckt werden.',
        strength: 'none',
      },
      low: {
        title: 'Temperament (Diagonale /)',
        description: 'Mildes Temperament. Du bist ausgeglichen und lässt dich selten provozieren. In der Liebe brauchst du Zeit zum Auftauen.',
        strength: 'weak',
      },
      mid: {
        title: 'Temperament (Diagonale /)',
        description: 'Gutes Temperament. Du bist leidenschaftlich, ohne impulsiv zu sein. In Beziehungen zeigst du Wärme und Hingabe.',
        strength: 'normal',
      },
      high: {
        title: 'Temperament (Diagonale /)',
        description: 'Starkes Temperament. Du bist feurig und leidenschaftlich in allem, was du tust. Deine Energie ist ansteckend.',
        strength: 'strong',
      },
    },
    ru: {
      '0': {
        title: 'Темперамент (Диагональ /)',
        description: 'Невыраженный темперамент. Вы спокойны и уравновешены. Страсть в вас нужно пробудить.',
        strength: 'none',
      },
      low: {
        title: 'Темперамент (Диагональ /)',
        description: 'Мягкий темперамент. Вы сбалансированны и редко поддаётесь провокациям. В любви вам нужно время, чтобы раскрыться.',
        strength: 'weak',
      },
      mid: {
        title: 'Темперамент (Диагональ /)',
        description: 'Хороший темперамент. Вы страстны, но не импульсивны. В отношениях проявляете тепло и преданность.',
        strength: 'normal',
      },
      high: {
        title: 'Темперамент (Диагональ /)',
        description: 'Сильный темперамент. Вы огненны и страстны во всём, что делаете. Ваша энергия заразительна.',
        strength: 'strong',
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Maps a digit count to an interpretation key for positions.
 * Supports tiers: 0, 1, 2, 3, 4, 5+
 */
function getPositionKey(count: number): string {
  if (count === 0) return '0';
  if (count === 1) return '1';
  if (count === 2) return '2';
  if (count === 3) return '3';
  if (count === 4) return '4';
  return '5'; // 5 or more
}

/**
 * Maps a line count to an interpretation key for lines.
 */
function getLineKey(count: number): string {
  if (count === 0) return '0';
  if (count <= 2) return 'low';
  if (count <= 4) return 'mid';
  return 'high'; // 5+
}

/**
 * Returns the interpretation for a specific matrix position.
 */
export function getPositionInterpretation(
  position: number,
  count: number,
  locale: 'de' | 'ru'
): Interpretation {
  const posData = positionInterpretations[position];
  if (!posData) {
    return {
      title: 'Unbekannt',
      description: 'Position nicht gefunden.',
      strength: 'none',
    };
  }

  const key = getPositionKey(count);
  const localeData = posData[locale];
  const entry = localeData[key];

  if (!entry) {
    return {
      title: 'Unbekannt',
      description: 'Interpretation nicht verfügbar.',
      strength: 'none',
    };
  }

  return {
    title: entry.title,
    description: entry.description,
    strength: entry.strength,
  };
}

/**
 * Returns the tiered interpretation for a specific matrix position.
 * Includes teaser (free) and full (email-gated) text.
 */
export function getPositionTieredInterpretation(
  position: number,
  count: number,
  locale: 'de' | 'ru'
): TieredInterpretation {
  const posData = positionInterpretations[position];
  if (!posData) {
    return {
      title: 'Unbekannt',
      description: 'Position nicht gefunden.',
      teaser: '',
      full: '',
      strength: 'none',
    };
  }

  const key = getPositionKey(count);
  const localeData = posData[locale];
  const entry = localeData[key];

  if (!entry) {
    return {
      title: 'Unbekannt',
      description: 'Interpretation nicht verfügbar.',
      teaser: '',
      full: '',
      strength: 'none',
    };
  }

  return {
    title: entry.title,
    description: entry.description,
    teaser: entry.teaser,
    full: entry.full || entry.description,
    strength: entry.strength,
  };
}

/**
 * Returns the interpretation for a specific line type.
 *
 * @param lineType - One of: row1, row2, row3, col1, col2, col3, diagonalDown, diagonalUp
 * @param count - Total digit count for that line
 * @param locale - 'de' or 'ru'
 */
export function getLineInterpretation(
  lineType: string,
  count: number,
  locale: 'de' | 'ru'
): Interpretation {
  const lineData = lineInterpretations[lineType];
  if (!lineData) {
    return {
      title: 'Unbekannt',
      description: 'Linie nicht gefunden.',
      strength: 'none',
    };
  }

  const key = getLineKey(count);
  const localeData = lineData[locale];
  const entry = localeData[key];

  if (!entry) {
    return {
      title: 'Unbekannt',
      description: 'Interpretation nicht verfügbar.',
      strength: 'none',
    };
  }

  return {
    title: entry.title,
    description: entry.description,
    strength: entry.strength,
  };
}
