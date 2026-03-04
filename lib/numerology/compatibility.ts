/**
 * Numerology Compatibility Calculator
 *
 * Compares two Pythagoras psychomatrices to determine relationship
 * compatibility across 9 dimensions. Each position is compared and
 * scored based on the difference in digit counts.
 */

import { calculateMatrix, type MatrixResult } from './calculate';

export interface CompatibilityDimension {
    position: number;
    person1Count: number;
    person2Count: number;
    difference: number;
    /** 0-100 compatibility score for this position */
    score: number;
    level: 'excellent' | 'good' | 'moderate' | 'challenging';
}

export interface CompatibilityResult {
    person1Matrix: MatrixResult;
    person2Matrix: MatrixResult;
    dimensions: CompatibilityDimension[];
    /** Overall compatibility 0-100 */
    overallScore: number;
    overallLevel: 'excellent' | 'good' | 'moderate' | 'challenging';
}

/**
 * Score a single position's compatibility.
 * Identical counts = 100, each step of difference reduces score.
 */
function scorePosition(count1: number, count2: number): number {
    const diff = Math.abs(count1 - count2);
    if (diff === 0) return 100;
    if (diff === 1) return 80;
    if (diff === 2) return 55;
    if (diff === 3) return 30;
    return 15; // diff >= 4
}

function getLevel(score: number): 'excellent' | 'good' | 'moderate' | 'challenging' {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'moderate';
    return 'challenging';
}

/**
 * Calculate compatibility between two people based on their birthdates.
 */
export function calculateCompatibility(
    person1: { day: number; month: number; year: number },
    person2: { day: number; month: number; year: number }
): CompatibilityResult {
    const person1Matrix = calculateMatrix(person1.day, person1.month, person1.year);
    const person2Matrix = calculateMatrix(person2.day, person2.month, person2.year);

    const dimensions: CompatibilityDimension[] = [];

    for (let pos = 1; pos <= 9; pos++) {
        const p1Count = person1Matrix.grid[pos].length;
        const p2Count = person2Matrix.grid[pos].length;
        const difference = Math.abs(p1Count - p2Count);
        const score = scorePosition(p1Count, p2Count);

        dimensions.push({
            position: pos,
            person1Count: p1Count,
            person2Count: p2Count,
            difference,
            score,
            level: getLevel(score),
        });
    }

    // Overall score = weighted average across all 9 positions
    const totalScore = dimensions.reduce((sum, d) => sum + d.score, 0);
    const overallScore = Math.round(totalScore / 9);

    return {
        person1Matrix,
        person2Matrix,
        dimensions,
        overallScore,
        overallLevel: getLevel(overallScore),
    };
}

// ---------------------------------------------------------------------------
// Bilingual Compatibility Interpretations
// ---------------------------------------------------------------------------

export interface CompatibilityInterpretation {
    title: string;
    person1Label: string;
    person2Label: string;
    description: string;
}

const positionNames: Record<number, { de: string; ru: string }> = {
    1: { de: 'Charakter & Willenskraft', ru: 'Характер и сила воли' },
    2: { de: 'Energie & Bioenergie', ru: 'Энергия и биоэнергия' },
    3: { de: 'Kreativität & Interessen', ru: 'Творчество и интересы' },
    4: { de: 'Gesundheit', ru: 'Здоровье' },
    5: { de: 'Logik & Intuition', ru: 'Логика и интуиция' },
    6: { de: 'Arbeit & Handwerk', ru: 'Труд и мастерство' },
    7: { de: 'Glück & Schicksal', ru: 'Удача и судьба' },
    8: { de: 'Pflicht & Verantwortung', ru: 'Долг и ответственность' },
    9: { de: 'Intelligenz & Gedächtnis', ru: 'Интеллект и память' },
};

type CompatTexts = Record<'excellent' | 'good' | 'moderate' | 'challenging', { de: string; ru: string }>;

const compatibilityTexts: Record<number, CompatTexts> = {
    1: {
        excellent: {
            de: 'Eure Charakterstärken sind sehr ähnlich – ihr versteht euch auf einer tiefen Ebene und könnt gemeinsam Großes erreichen.',
            ru: 'Ваши характеры очень схожи — вы понимаете друг друга на глубоком уровне и можете вместе достичь многого.',
        },
        good: {
            de: 'Eure Willenskraft ergänzt sich gut. Kleine Unterschiede schaffen eine gesunde Dynamik in der Partnerschaft.',
            ru: 'Ваша сила воли хорошо дополняет друг друга. Небольшие различия создают здоровую динамику в отношениях.',
        },
        moderate: {
            de: 'Zwischen euren Charakteren gibt es deutliche Unterschiede. Offene Kommunikation und Kompromissbereitschaft sind wichtig.',
            ru: 'Между вашими характерами есть заметные различия. Важны открытое общение и готовность к компромиссам.',
        },
        challenging: {
            de: 'Eure Charaktere sind sehr verschieden – das kann zu Machtkämpfen führen. Lernt, die Stärke des anderen zu respektieren.',
            ru: 'Ваши характеры очень разные — это может приводить к борьбе за власть. Учитесь уважать силу друг друга.',
        },
    },
    2: {
        excellent: {
            de: 'Euer Energieniveau ist harmonisch abgestimmt – ihr gebt euch gegenseitig Kraft und fühlt euch wohl miteinander.',
            ru: 'Ваш энергетический уровень гармонично сбалансирован — вы даёте друг другу силу и чувствуете себя комфортно.',
        },
        good: {
            de: 'Die Energiebalance zwischen euch ist gut. Einer kann den anderen in Phasen der Erschöpfung auffangen.',
            ru: 'Энергетический баланс между вами хороший. Один может поддержать другого в периоды усталости.',
        },
        moderate: {
            de: 'Unterschiedliches Energieniveau kann zu Spannungen führen. Achtet darauf, den Partner nicht zu überfordern oder zu bremsen.',
            ru: 'Разный уровень энергии может вызывать напряжение. Следите за тем, чтобы не перегружать и не сдерживать партнёра.',
        },
        challenging: {
            de: 'Starke Energieunterschiede – einer ist ständig aktiv, der andere braucht Ruhe. Findet einen Rhythmus, der beiden passt.',
            ru: 'Сильные энергетические различия — один постоянно активен, другому нужен покой. Найдите ритм, который подходит обоим.',
        },
    },
    3: {
        excellent: {
            de: 'Eure kreative Wellenlänge stimmt perfekt überein. Gemeinsame Projekte und Hobbys werden euch verbinden.',
            ru: 'Ваши творческие волны идеально совпадают. Совместные проекты и хобби будут вас объединять.',
        },
        good: {
            de: 'Gute kreative Kompatibilität. Ihr inspiriert euch gegenseitig und habt genug gemeinsame Interessen.',
            ru: 'Хорошая творческая совместимость. Вы вдохновляете друг друга и у вас достаточно общих интересов.',
        },
        moderate: {
            de: 'Verschiedene kreative Bedürfnisse. Der eine braucht Kunst, der andere Logik – respektiert eure unterschiedlichen Talente.',
            ru: 'Разные творческие потребности. Одному нужно искусство, другому логика — уважайте таланты друг друга.',
        },
        challenging: {
            de: 'Sehr verschiedene Interessen – einer lebt kreativ, der andere praktisch. Schafft Raum für die individuellen Leidenschaften.',
            ru: 'Очень разные интересы — один живёт творчеством, другой практикой. Создайте пространство для индивидуальных увлечений.',
        },
    },
    4: {
        excellent: {
            de: 'Eure Einstellung zur Gesundheit passt zusammen. Gemeinsamer Sport und gesunder Lebensstil verbinden euch.',
            ru: 'Ваше отношение к здоровью совпадает. Совместный спорт и здоровый образ жизни вас объединяют.',
        },
        good: {
            de: 'Gute Gesundheitskompatibilität. Einer kann den anderen zu einem gesünderen Lebensstil motivieren.',
            ru: 'Хорошая совместимость в здоровье. Один может мотивировать другого вести более здоровый образ жизни.',
        },
        moderate: {
            de: 'Unterschiedliche körperliche Konstitution. Akzeptiert, dass ihr verschiedene Bedürfnisse habt.',
            ru: 'Разная физическая конституция. Примите, что у вас разные потребности.',
        },
        challenging: {
            de: 'Einer ist körperlich sehr aktiv, der andere weniger. Dies erfordert Verständnis und separate Aktivitäten.',
            ru: 'Один физически очень активен, другой менее. Это требует понимания и раздельных активностей.',
        },
    },
    5: {
        excellent: {
            de: 'Eure logische Denkart ist sehr ähnlich – ihr versteht die Argumente des anderen auf Anhieb.',
            ru: 'Ваш логический стиль мышления очень схож — вы мгновенно понимаете аргументы друг друга.',
        },
        good: {
            de: 'Gute intellektuelle Verbindung. Eure verschiedenen Perspektiven bereichern Diskussionen.',
            ru: 'Хорошая интеллектуальная связь. Ваши разные перспективы обогащают дискуссии.',
        },
        moderate: {
            de: 'Einer denkt analytisch, der andere intuitiv. Lernt, die Denkart des Partners zu schätzen.',
            ru: 'Один мыслит аналитически, другой интуитивно. Учитесь ценить способ мышления партнёра.',
        },
        challenging: {
            de: 'Sehr unterschiedliches Denkmuster. Missverständnisse sind häufig – erklärt eure Standpunkte geduldig.',
            ru: 'Очень разные модели мышления. Недоразумения часты — терпеливо объясняйте свою позицию.',
        },
    },
    6: {
        excellent: {
            de: 'Ihr habt die gleiche Arbeitsmoral und Einstellung zum Fleiß. Das Team funktioniert perfekt.',
            ru: 'У вас одинаковая рабочая этика и отношение к труду. Команда работает идеально.',
        },
        good: {
            de: 'Eure Arbeitswerte ergänzen sich. Einer plant, der andere setzt um – eine starke Kombination.',
            ru: 'Ваши рабочие ценности дополняют друг друга. Один планирует, другой исполняет — сильная комбинация.',
        },
        moderate: {
            de: 'Verschiedene Einstellungen zur Arbeit. Klärt Erwartungen, wer welche Verantwortung im Alltag übernimmt.',
            ru: 'Разное отношение к работе. Обсудите ожидания, кто какую ответственность берёт в повседневной жизни.',
        },
        challenging: {
            de: 'Einer ist ein Workaholic, der andere legt Wert auf Freizeit. Findet den Mittelweg im gemeinsamen Alltag.',
            ru: 'Один трудоголик, другой ценит свободное время. Найдите средний путь в совместном быту.',
        },
    },
    7: {
        excellent: {
            de: 'Euer gemeinsames Glück multipliziert sich! Zusammen zieht ihr positive Ereignisse an.',
            ru: 'Ваше совместное везение умножается! Вместе вы притягиваете позитивные события.',
        },
        good: {
            de: 'Eine gute Schicksalsverbindung. Gemeinsame Entscheidungen führen oft zu guten Ergebnissen.',
            ru: 'Хорошая связь по судьбе. Совместные решения часто приводят к хорошим результатам.',
        },
        moderate: {
            de: 'Unterschiedliches Glücksempfinden. Einer scheint vom Glück begünstigt, der andere muss härter arbeiten.',
            ru: 'Разное ощущение удачи. Одному везёт больше, другому приходится больше трудиться.',
        },
        challenging: {
            de: 'Verschiedene Schicksalswege. Akzeptiert, dass Glück für jeden anders aussieht und unterstützt euch gegenseitig.',
            ru: 'Разные судьбы. Примите, что удача для каждого выглядит по-разному, и поддерживайте друг друга.',
        },
    },
    8: {
        excellent: {
            de: 'Gleiches Verantwortungsbewusstsein stärkt eure Partnerschaft. Ihr könnt euch blind aufeinander verlassen.',
            ru: 'Одинаковое чувство ответственности укрепляет ваши отношения. Вы можете слепо доверять друг другу.',
        },
        good: {
            de: 'Gute Balance zwischen Pflichtgefühl und Freiheit. Ihr teilt Verantwortung fair auf.',
            ru: 'Хороший баланс между чувством долга и свободой. Вы справедливо распределяете ответственность.',
        },
        moderate: {
            de: 'Einer übernimmt mehr Verantwortung als der andere. Achtet auf eine faire Aufgabenverteilung.',
            ru: 'Один берёт на себя больше ответственности, чем другой. Следите за справедливым распределением обязанностей.',
        },
        challenging: {
            de: 'Einer fühlt sich überlastet, der andere zu frei. Besprecht offen, wer welche Pflichten übernimmt.',
            ru: 'Один чувствует перегрузку, другой слишком свободен. Открыто обсуждайте, кто какие обязанности берёт на себя.',
        },
    },
    9: {
        excellent: {
            de: 'Gleich hohe Intelligenz und Gedächtnisleistung – tiefgründige Gespräche werden euch immer verbinden.',
            ru: 'Одинаково высокий интеллект и память — глубокие разговоры будут вас всегда объединять.',
        },
        good: {
            de: 'Gute geistige Verbindung. Einer bringt Tiefe, der andere Breite – zusammen wisst ihr alles.',
            ru: 'Хорошая интеллектуальная связь. Один приносит глубину, другой широту — вместе вы знаете всё.',
        },
        moderate: {
            de: 'Verschiedene kognitive Stärken. Respektiert die Art, wie der andere Informationen verarbeitet.',
            ru: 'Разные когнитивные сильные стороны. Уважайте способ обработки информации друг друга.',
        },
        challenging: {
            de: 'Sehr unterschiedliche intellektuelle Ansätze. Geduld und gegenseitiges Erklären sind der Schlüssel.',
            ru: 'Очень разные интеллектуальные подходы. Терпение и взаимные объяснения — ключ к пониманию.',
        },
    },
};

const overallTexts: Record<'excellent' | 'good' | 'moderate' | 'challenging', { de: string; ru: string }> = {
    excellent: {
        de: 'Eure Matrizen zeigen eine außergewöhnlich hohe Kompatibilität! Ihr ergänzt euch auf fast allen Ebenen und habt das Potenzial für eine tiefe, beständige Verbindung.',
        ru: 'Ваши матрицы показывают исключительно высокую совместимость! Вы дополняете друг друга почти на всех уровнях и имеете потенциал для глубокой и устойчивой связи.',
    },
    good: {
        de: 'Eine gute Kompatibilität! Eure Stärken ergänzen sich gut, und die kleinen Unterschiede machen eure Beziehung lebendig. Arbeitet an den Bereichen mit im Verbesserungspotenzial.',
        ru: 'Хорошая совместимость! Ваши сильные стороны хорошо дополняют друг друга, а небольшие различия делают отношения живыми. Работайте над областями с потенциалом улучшения.',
    },
    moderate: {
        de: 'Moderate Kompatibilität – eure Beziehung erfordert bewusste Arbeit. Die Unterschiede können euch wachsen lassen, wenn ihr offen kommuniziert und Kompromisse findet.',
        ru: 'Умеренная совместимость — ваши отношения требуют осознанной работы. Различия могут помочь вам расти, если вы открыто общаетесь и находите компромиссы.',
    },
    challenging: {
        de: 'Herausfordernde Kompatibilität – eure Persönlichkeiten sind auf vielen Ebenen verschieden. Das bedeutet nicht, dass eine Beziehung unmöglich ist, aber sie erfordert tiefes Verständnis und starke Kompromissbereitschaft.',
        ru: 'Непростая совместимость — ваши личности различаются на многих уровнях. Это не означает, что отношения невозможны, но они требуют глубокого понимания и готовности к компромиссам.',
    },
};

/**
 * Get bilingual interpretation for a single compatibility dimension.
 */
export function getCompatibilityInterpretation(
    dimension: CompatibilityDimension,
    locale: 'de' | 'ru'
): CompatibilityInterpretation {
    const posName = positionNames[dimension.position]?.[locale] ?? `Position ${dimension.position}`;
    const texts = compatibilityTexts[dimension.position]?.[dimension.level];
    const description = texts?.[locale] ?? '';

    return {
        title: posName,
        person1Label: `${dimension.person1Count}x`,
        person2Label: `${dimension.person2Count}x`,
        description,
    };
}

/**
 * Get the overall compatibility summary text.
 */
export function getOverallText(level: CompatibilityResult['overallLevel'], locale: 'de' | 'ru'): string {
    return overallTexts[level]?.[locale] ?? '';
}
