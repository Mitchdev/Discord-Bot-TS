export default interface Olympics {
    medals: Country[];
}

interface Country {
    disciplines: Discipline[];
    organisation: string;
    description: string;
    longDescription: string;
    nameOrder: number;
    longNameOrder: number;
    protocolOrder: number;
    rank: number;
    rankEqual: boolean;
    sortRank: number;
    rankTotal: number;
    rankTotalEqual: boolean;
    sortTotalRank: number;
    medalsNumber: Medals[];
}

interface Medals {
    type: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
}

interface Discipline {
    code: string;
    name: string;
    gold: number;
    silver: number;
    bronze: number;
    total: number;
    medalWinners: Winners[];
}

interface Winners {
    disciplineCode: string;
    eventCode: string;
    eventCategory: string;
    eventDescription: string;
    eventOrder: number;
    medalType: string;
    official: boolean;
    competitorCode: string;
    competitorType: string;
    competitorOrder: number;
    competitorDisplayName: string;
    competitorDisplayPrintInitialName: string;
    competitorDisplayTvName: string;
    competitorDisplayPrintName: string;
    date: string;
    extraData: {
        detailUrl: string;
    };
}