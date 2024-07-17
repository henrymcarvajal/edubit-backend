import { Engine, Rule } from 'json-rules-engine';
import { arrayEmpty } from '../../../../../../util/arrays.mjs';

// Create engine
const engine = new Engine([], { allowUndefinedFacts: true, replaceFactsInEventParams: true });

// Rule for Open Building Apartment
const openBuildingApartmentRule = new Rule({
  order: 1,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'OPEN_BUILDING_APARTMENT'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.5
    }
  }
});

// Rule for Closed Complex Apartment
const closedComplexApartmentRule = new Rule({
  order: 2,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'CLOSED_COMPLEX_APARTMENT'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.6
    }
  }
});

// Rule for Tourism Apartment
const tourismApartmentRule = new Rule({
  order: 3,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'TOURISM_APARTMENT'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 1.2
    }
  }
});

// Rule for Urban Land Lot
const urbanLandLotRule = new Rule({
  order: 4,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'URBAN_LAND_LOT'
      }
    ]
  },
  event: { //(no income)
    type: 'monthly-income',
    params: {
      incomePercentage: 0
    }
  }
});

// Rule for Rural Land Lot
const ruralLandLotRule = new Rule({
  order: 5,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'RURAL_LAND_LOT'
      }
    ]
  },
  event: { //(no income)
    type: 'monthly-income',
    params: {
      incomePercentage: 0
    }
  }
});

// Rule for Open Building House
const openBuildingHouseRule = new Rule({
  order: 6,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'OPEN_BUILDING_HOUSE'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.6
    }
  }
});

// Rule for Closed Complex House
const closedComplexHouseRule = new Rule({
  order: 7,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'CLOSED_COMPLEX_HOUSE'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.6
    }
  }
});

// Rule for Commercial Office
const commercialOfficeRule = new Rule({
  order: 8,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'COMMERCIAL_OFFICE'
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 1.0
    }
  }
});

// Rule for House on Urban Land Lot
const houseOnUrbanLandLotRule = new Rule({
  order: 9,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'HOUSE_ON_URBAN_LAND_LOT'
      },
      {
        fact: 'ownsUrbanLandLot',
        operator: 'equal',
        value: true
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.8
    }
  }
});

// Rule for Rural House on Rural Land Lot
const houseOnRuralLandLotRule = new Rule({
  order: 10,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'HOUSE_ON_RURAL_LAND_LOT'
      },
      {
        fact: 'ownsRuralLandLot',
        operator: 'equal',
        value: true
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 0.6
    }
  }
});

// Rule for Franchise
const franchiseRule = new Rule({
  order: 11,
  conditions: {
    all: [
      {
        fact: 'asset',
        operator: 'equal',
        value: 'FRANCHISE'
      },
      {
        fact: 'elapsedTime',
        operator: 'greaterThanInclusive',
        value: 30
      }
    ]
  },
  event: {
    type: 'monthly-income',
    params: {
      incomePercentage: 1.5
    }
  }
});


// Add rules to engine
engine.addRule(openBuildingApartmentRule); // 1
engine.addRule(closedComplexApartmentRule); // 2
engine.addRule(tourismApartmentRule); // 3
engine.addRule(urbanLandLotRule); // 4
engine.addRule(ruralLandLotRule); // 5
engine.addRule(openBuildingHouseRule); // 6
engine.addRule(closedComplexHouseRule); // 7
engine.addRule(commercialOfficeRule); // 8
engine.addRule(houseOnUrbanLandLotRule); // 9
engine.addRule(houseOnRuralLandLotRule); // 10
engine.addRule(franchiseRule); // 11

// Function to calculate monthly income
export const calculatePassiveIncome = async (assets, elapsedTime) => {
  if (arrayEmpty(assets)) return 0;

  let totalMonthlyIncome = 0;

  // Check if the player owns urban land lot
  const urbanLandLotValue = assets.find(p => p.type === 'URBAN_LAND_LOT')?.value || 0;
  const ownsUrbanLandLot = !!urbanLandLotValue;

  // Check if the player owns rural land lot
  const ruralLandLotValue = assets.find(p => p.type === 'RURAL_LAND_LOT')?.value || 0;
  const ownsRuralLandLot = !!ruralLandLotValue;

  // Loop in player's every asset
  for (const asset of assets) {
    const facts = {
      asset: asset.type,
    };

    if (asset.type === 'HOUSE_ON_URBAN_LAND_LOT' && ownsUrbanLandLot) {
      facts.ownsUrbanLandLot = ownsUrbanLandLot;
    } else if (asset.type === 'HOUSE_ON_RURAL_LAND_LOT' && ownsRuralLandLot) {
      facts.ownsRuralLandLot = ownsRuralLandLot;
    } else if (asset.type === 'FRANCHISE') {
      facts.elapsedTime = elapsedTime;
    }

    const results = await engine.run(facts);
    results.events.forEach(event => {
      const incomePercentage = event.params.incomePercentage;
      const totalUnitsValue = (asset.value * asset.count);
      if (asset.type === 'HOUSE_ON_URBAN_LAND_LOT' && ownsUrbanLandLot) {
        totalMonthlyIncome += incomePercentage * (totalUnitsValue + urbanLandLotValue);
      } else if (asset.type === 'HOUSE_ON_RURAL_LAND_LOT' && ownsRuralLandLot) {
        totalMonthlyIncome += incomePercentage * (totalUnitsValue + ruralLandLotValue);
      } else if (asset.type === 'FRANCHISE') {
        totalMonthlyIncome += (incomePercentage + getFranchiseMonthlyIncrease(elapsedTime)) * (totalUnitsValue);
      } else {
        totalMonthlyIncome += incomePercentage * totalUnitsValue;
      }
    });
  }

  return totalMonthlyIncome / 100;
};

const getFranchiseMonthlyIncrease = (elapsedTime) => {
  const minimumTime = 30;
  return elapsedTime < minimumTime ? 0 : 0.2 * Math.floor((elapsedTime - minimumTime) / 10);
};
