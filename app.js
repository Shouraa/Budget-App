// ------------------------ BUDGET CONTROLLER MODULE -----------------------------

const budgetController = (function() {
  const Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  const Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  const claculateTotal = type => {
    let sum = 0;
    data.allItems[type].forEach(ele => {
      sum += ele.value;
    });
    data.totals[type] = sum;
  };

  let data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: (type, des, val) => {
      let newItem, ID;

      // Create new ID

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type
      if (type === "exp") {
        newItem = new Expense(ID, des, val);
      } else if (type === "inc") {
        newItem = new Income(ID, des, val);
      }

      // Push it into our data structure
      data.allItems[type].push(newItem);

      // Return the new element
      return newItem;
    },

    deleteItem: (type, id) => {
      let ids, index;

      ids = data.allItems[type].map(ele => {
        return ele.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: () => {
      // Calculate total income and expenses

      claculateTotal("exp");
      claculateTotal("inc");
      // Claculate the budget: income - expenses

      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent

      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: () => {
      data.allItems.exp.forEach(cur => {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: () => {
      let allPerc = data.allItems.exp.map(cur => {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: () => {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    }
  };
})();

//--------------------UI CONTROLLER MODULE--------------------------

const UIController = (function() {
  let DOMStrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };

  const formatNumber = (num, type) => {
    let numSplit, int, dec;

    num = Math.abs(num);

    num = num.toFixed(2);

    numSplit = num.split(".");

    int = numSplit[0];
    dec = numSplit[1];

    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMStrings.inputType).value,
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    addListItem: (obj, type) => {
      let html, newHtml, element;
      // Create HTML strings with placeholder text

      if (type === "inc") {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"> <i class="ion-ios-close-outline" /> </button> </div> </div> </div>';
      } else if (type === "exp") {
        element = DOMStrings.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
      }

      // Replace the placeholder text with some actual data

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value));

      // Insert the HTML into the DOM

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: selectorID => {
      let el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      let fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ", " + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach((currentEle, index, entireArray) => {
        currentEle.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: obj => {
      let type;

      obj.budget > 0 ? type === "inc" : type === "exp";
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMStrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: percentages => {
      let fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      const nodeListForEach = (nodeList, callback) => {
        for (let i = 0; i < nodeList.length; i++) {
          callback(nodeList[i], i);
        }
      };

      nodeListForEach(fields, (cur, index) => {
        if (percentages[index] > 0) {
          cur.textContent = percentages[index] + "%";
        } else {
          cur.textContent = "---";
        }
      });
    },

    displayTime: () => {
      let now, year, month, months;

      now = new Date();

      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "June",
        "July",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"
      ];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent =
        months[month] + " " + year;
    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };
})();

//-------------------------- GLOBAL APP CONTROLLER MODULE ----------------------------

const controller = (function(budgetCtrl, UICtrl) {
  const setupEventListeners = () => {
    let DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", event => {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
  };

  const updateBudget = () => {
    // 1. Calculate the budget

    budgetCtrl.calculateBudget();

    // 2. Return the budget

    let budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI

    UIController.displayBudget(budget);
  };

  const updatePercentages = () => {
    // 1. Calculate the percentages

    budgetController.calculatePercentages();

    // 2. Read percentages from the budget controller

    let percentages = budgetController.getPercentages();

    // 3. Update the UI with the new percentages

    UICtrl.displayPercentages(percentages);
  };

  const ctrlAddItem = () => {
    let input, newItem;
    // 1. Get tge field input data

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller

      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add the item to the UI

      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields

      UICtrl.clearFields();

      // 5. Calculate and update budget

      updateBudget();

      // 6. Calculate and update percentages

      updatePercentages();
    }
  };

  const ctrlDeleteItem = event => {
    let itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. delete the item from the data structure

      budgetCtrl.deleteItem(type, ID);

      // 2. delete the item from the UI

      UIController.deleteListItem(itemID);

      // 3. Update and show the new budget

      updateBudget();

      // 4. Calculate and update percentages

      updatePercentages();
    }
  };

  return {
    init: () => {
      console.log("App is started");
      UICtrl.displayTime();
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });

      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
