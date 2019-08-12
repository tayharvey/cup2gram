var MEASUREMENT_TYPE = {
  LITERS : "L",
  GRAMS : "g",
}

var X_TO_CUP_CONVERSION_TABLE = {
  "tsp" : 48.0,
  "tbsp" : 16.0,
  "cup": 1.0
}

var MEASUREMENT_KEYWORDS = {
  "tsp"  : ["tsp", "teaspoon", "teaspoons", "tea spoons", "tea spoon"],
  "tbsp" : ["tbsp", "tablespoon", "tablespoons", "table spoons", "table spoon"],
  "cup"  : ["cup", "cups"]
}

var INGREDIENT_CONVERSION_TABLE = {
  "flour" : {
    "keywords": ["flour"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 120
  },
  "rice" : {
    "keywords": ["rice"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 225
  },
  "brown_sugar" : {
    "keywords": ["brown sugar", "sugar"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 213
  },
  "white_sugar" : {
    "keywords": ["white sugar", "sugar"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 200
  },
  "butter" : {
    "keywords": ["butter"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 226
  },
  "baking_powder" : {
    "keywords": ["baking powder"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 192
  },
  "baking_soda" : {
    "keywords": ["baking soda"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 288
  },
  "instant_yeast" : {
    "keywords": ["yeast"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 150
  },
  "corn_starch" : {
    "keywords": ["starch"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 112
  },
  "cocoa_powder" : {
    "keywords": ["cocoa powder", "cocoa"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 85
  },
  "chocolate_chips" : {
    "keywords": ["chocolate", "chocolate chips", "chopped chocolate"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 170
  },
  "molasses" : {
    "keywords": ["molasses"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 340
  },
  "rolled_oats" : {
    "keywords": ["oats", "oatmeal"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 99
  },
  "peanut_butter" : {
    "keywords": ["peanut butter"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 270
  },
  "cream_cheese" : {
    "keywords": ["cream cheese"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 227
  },
  "evaporated_milk" : {
    "keywords": ["evaporated milk"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 256
  },
  "ground_cinnamon" : {
    "keywords": ["cinnamon"],
    "typical_measure" : MEASUREMENT_TYPE.GRAMS,
    "measure_in_cup" : 144
  },
  "generic_liquids" : {
    "keywords": ["water", "milk", "juice", "honey", "oil", "syrup", "extract", "buttermilk", "yogurt", "yoghurt", "yoghourt", "cream", "mayo", "mayonnaise"],
    "typical_measure" : MEASUREMENT_TYPE.LITERS,
    "measure_in_cup" : 0.25
  }
}

function findIngredientInText(text) {
  // Clean punctuation and numbers https://stackoverflow.com/a/4328722
  // var cleanText = text.replace(/[0-9]/g, "").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ");
  var potential_ingredient_categories = {undefined:0};

  var ingredient_category;
  for (ingredient_category in INGREDIENT_CONVERSION_TABLE) {
    var ingredient_category_keywords = INGREDIENT_CONVERSION_TABLE[ingredient_category]["keywords"];
    var number_of_matches = 0;
    var ingredient_category_keywords_index;
    for (ingredient_category_keywords_index in ingredient_category_keywords) {
      if (text.search(ingredient_category_keywords[ingredient_category_keywords_index]) > -1) {
        number_of_matches++;
      }
    }
    if (number_of_matches > 0) {
      potential_ingredient_categories[ingredient_category] = number_of_matches;
    }
  }

  return Object.keys(potential_ingredient_categories).reduce(function(a,b){return potential_ingredient_categories[a] > potential_ingredient_categories[b] ? a : b});
}

function findUnitValueInText(text) {
  var unit_position = undefined;
  var unit_value_obj = {
    unit_type      : undefined,
    fraction_str   : undefined,
    fraction_value : undefined
  }

  // Find first unit occurrence in text
  var unit_type;
  for (unit_type in MEASUREMENT_KEYWORDS) {
    if (unit_value_obj.unit_type != undefined) {
      break;
    }
    var unit_type_keywords = MEASUREMENT_KEYWORDS[unit_type];
    var unit_type_keywords_index;
    for (unit_type_keywords_index in unit_type_keywords) {
      unit_position = text.search(unit_type_keywords[unit_type_keywords_index]);
      if (unit_position > -1) {
        unit_value_obj.unit_type = unit_type;
        break;
      }
    }
  }

  // Find last fraction digit, right before the unit_position. Iterate backwards
  var last_fraction_digit_index = undefined;
  var first_fraction_digit_index = undefined;

  for (var i = unit_position-1; i >= 0; i--) {
    var current_char = text.charAt(i);
    if ('0123456789'.indexOf(current_char) !== -1) {
      last_fraction_digit_index = i;
      first_fraction_digit_index = i;
      break;
    }
  }

  // Find first digit of the fraction. Account for spaces and / fractions
  for (var i = last_fraction_digit_index-1; i >= 0; i--) {
    var current_char = text.charAt(i);
    if ('0123456789 /'.indexOf(current_char) !== -1) {
      first_fraction_digit_index = i;
    } else {
      break;
    }
  }

  // Obtain substring with the fraction before the unit
  unit_value_obj.fraction_str = text.substr(first_fraction_digit_index, last_fraction_digit_index+1).trim();

  // Parse fraction string into float
  unit_value_obj.fraction_value = numericQuantity(unit_value_obj.fraction_str);

  return unit_value_obj;
}

var TARGET_HTML_ELEMENTS = ["li", "p"]

function toCups(value, unit) {
  return value / X_TO_CUP_CONVERSION_TABLE[unit];
}


function textToMetric(text) {
  // 1. Find measurement occurrence, and value
  var unit_value_obj = findUnitValueInText(text);
  console.log(unit_value_obj.fraction_value);
  if(isNaN(unit_value_obj.fraction_value) || unit_value_obj.fraction_value <= 0) return;

  // 2. Find matching ingredient
  var ingredient = findIngredientInText(text);
  if(ingredient == "undefined") return;
  // we check for "undefined" as string, as it's parsed when we reduce the object

  // 3. Convert
  var metric_unit = INGREDIENT_CONVERSION_TABLE[ingredient]["typical_measure"];
  var cups = toCups(unit_value_obj.fraction_value, unit_value_obj.unit_type);
  var metric_value = cups * INGREDIENT_CONVERSION_TABLE[ingredient]["measure_in_cup"];

  // 4. Craft result string (recipe ingredient entry)
  var result = metric_value.toFixed(2) + metric_unit;

  return result;
}

var elements = document.getElementsByTagName('*');

for (var i = 0; i < elements.length; i++) {
    var element = elements[i];

    for (var j = 0; j < element.childNodes.length; j++) {
        var node = element.childNodes[j];

        if (node.nodeType === 3) {
            var text = node.nodeValue;
            var conversion_result = textToMetric(text);
            // TODO: break inline phrases based on punctuation.
            //var replacedText = text.replace(/cup/gi, "grams");

            if (conversion_result !== undefined) {
              var replacedText = text.concat(" (" + conversion_result + ")");
              element.replaceChild(document.createTextNode(replacedText), node);
            }
        }
    }
}
