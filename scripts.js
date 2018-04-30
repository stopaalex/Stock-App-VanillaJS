
const header = document.querySelector('#headerText');
const currentPrice = document.querySelector('#immediatePricing .current-price');
const searchBtn = document.querySelector('#search');
const repeatBtn = document.querySelector('#repeat');
const saveBtn = document.querySelector('#save');
const symbolSearch = document.querySelector('#symbolInput');
const newsCont = document.querySelector('.news-container');
const newsHeader = document.querySelector('.news-header');
const chartCont = document.querySelector('#chartContainer');
const EODPriceChange = document.querySelector('#daysChange');
const displayTypeahead = document.querySelector('.display-typeahead');
// const highPrice = document.querySelector('#high .price');
// const lowPrice = document.querySelector('#low .price');

var avAPIkey = '22RLQBUD3O1DBUDY';
var symbol = 'FB'
var stockUpdater;
var updateLoop = false;
var exactMatchArray = [];
var matchArray = [];
var companies = [];
var selectedListEle;
var symbolsSaved = [];

function getStockQuote() {
    var symbolSearch = document.querySelector('#symbolInput');
    if (!symbolSearch.value) {
        symbol = 'FB';
    } else {
        symbol = symbolSearch.value;
    }

    var quoteURL = 'https://api.iextrading.com/1.0/stock/' + symbol + '/batch?types=quote,news,chart&range=1m&last=10';

    fetch(quoteURL)
        .then(function (blob) {
            return blob.json()
                .then(function (data) {

                    var stock = data.quote;
                    
                    // console.log(data);

                    var stockInfo = {
                        info: {
                            symbol: stock.symbol,
                            name: stock.companyName,
                            exchange: stock.primaryExchange
                        },
                        prices: {
                            open: stock.open,
                            prevClose: stock.close,
                            current: stock.latestPrice,
                            high: stock.high,
                            week52High: stock.week52High,
                            week52Low: stock.week52Low,
                            marketCap: stock.marketCap,
                            low: stock.low,
                        },
                        news: data.news,
                        chartInfo: data.chart
                    }

                    header.innerHTML = '<span class="symbol">' + stockInfo.info.symbol + '</span>' + '<span class="name">' + stockInfo.info.name + '</span>' + '<span class="exchange">' + stockInfo.info.exchange + '</span>';

                    // CURRENT PRICE
                    // CURRENT PRICE
                    var currentChange = Math.round(((Math.round(stockInfo.prices.current * 100) / 100) - (Math.round(stockInfo.prices.prevClose * 100) / 100)) * 100) / 100;
                    var changeDir = '';
                    var changeDirArrow = '';
                    if (currentChange >= 0) {
                        changeDir = '+';
                        changeDirArrow = 'arrow-up';
                    } else {
                        changeDir = '';
                        changeDirArrow = 'arrow-down';
                    }

                    var currentPriceCurrent = currentPrice.querySelector('.current');
                    currentPriceCurrent.innerHTML = '<div class="adjust-color price-display"> $' + Math.round(stockInfo.prices.current * 100) / 100 + '</div>' + '<span class="price-underline">' + ' USD ' + ' <div class="adjust-color price-change">' + changeDir + currentChange + '<i class="fa fa-' + changeDirArrow + '" style="font-size:0.75em"></i>' + '</div>' + '</span>';
                    var currentPricePrev = currentPrice.querySelector('.prev-close');
                    currentPricePrev.textContent = '$' + (Math.round(stockInfo.prices.prevClose * 100) / 100);

                    var adjustColors = document.querySelectorAll('.adjust-color');
                    if (changeDir === '+') {
                        adjustColors.forEach(function (color) {
                            color.style.color = 'green';
                        });
                    } else {
                        adjustColors.forEach(function (color) {
                            color.style.color = 'red';
                        });
                    }

                    // CHART INFO
                    // CHART INFO
                    stockInfo.chartInfo.push({
                        close: stockInfo.prices.current
                    });

                    var chartMax = 0;
                    var chartMin = 0;
                    stockInfo.chartInfo.forEach(function (bar, index) {
                        if (index === 0) {
                            chartMin = bar.close;
                        } else if (index > 0) {
                            if (bar.close < chartMin) {
                                chartMin = bar.close - (bar.close * .05);
                                if ((bar.close * .05) < 5) {
                                    chartMin = bar.close - 5;
                                }
                            }
                        }

                        if (bar.close > chartMax) {
                            chartMax = bar.close + 1;
                        }
                    });

                    var diff = chartMax - chartMin;

                    var previousBar = 0;
                    var chartHTML = stockInfo.chartInfo.map(function (bar, index) {
                        var color = 'rgba(0,150,0,0.5)';
                        var textColor;
                        if (index === 0) {
                            previousBar = bar.close
                        } else if (index > 0) {
                            if (bar.close > previousBar) {
                                color = 'rgba(0,150,0,0.5)';
                            } else {
                                color = 'rgba(150,0,0,0.5)'
                            }
                        }
                        if (index === stockInfo.chartInfo.length - 1) {
                            if (bar.close > previousBar) {
                                color = 'rgba(0,150,0,0.75)';
                                textColor = '#FFFFFF';
                            } else {
                                color = 'rgba(150,0,0,0.75)'
                                textColor = '#FFFFFF';
                            }
                        }
                        var distanceFromMin = bar.close - chartMin;
                        var percent = distanceFromMin / diff;
                        previousBar = bar.close;
                        return '<div class="bar" style="height:' + percent * 100 + '%;background:' + color + '; width: calc(4.16% - 0px);margin: 0 1px; display: inline-block; position: relative">' + '<div style="font-size: 0.7em; transform:rotate(-90deg); position: absolute; top: 20px; left: -0%; color:' + textColor + '">' + (Math.round(bar.close * 100) / 100).toFixed(2) + '</div>' + '</div>'
                    }).join('');

                    chartCont.innerHTML = chartHTML;

                    // DAY CHANGE
                    // DAY CHANGE
                    var prevDay = EODPriceChange.querySelector('.previous-day');
                    var today = EODPriceChange.querySelector('.today');
                    var change = EODPriceChange.querySelector('.change');
                    var todayNum = stockInfo.chartInfo.length - 1;
                    var previousDayNum = stockInfo.chartInfo.length - 2;
                    var color;

                    prevDay.innerHTML = '$' + stockInfo.chartInfo[previousDayNum].close + ' - ';
                    today.innerHTML = '$' + stockInfo.chartInfo[todayNum].close + ' = ';
                    if ((Math.round((stockInfo.chartInfo[todayNum].close - stockInfo.chartInfo[previousDayNum].close) * 100) / 100) > 0) {
                        color = 'green';
                    } else {
                        color = 'red';
                    }
                    change.innerHTML = '<span style="color:' + color + '">$' + Math.round((stockInfo.chartInfo[todayNum].close - stockInfo.chartInfo[previousDayNum].close) * 100) / 100 + '</span>'

                    var dayHigh = document.querySelector('#dayHigh');
                    var Week52High = document.querySelector('#week52High');
                    var dayLow = document.querySelector('#dayLow');
                    var week52Low = document.querySelector('#week52Low');

                    dayHigh.innerHTML = '<div class="price-label">Day High: </div><div class="price">' + stockInfo.prices.high + '</div>';
                    week52High.innerHTML = '<div class="price-label">52 Week High: </div><div class="price">' + stockInfo.prices.week52High + '</div>';
                    dayLow.innerHTML = '<div class="price-label">Day Low: </div><div class="price">' + stockInfo.prices.low + '</div>';
                    week52Low.innerHTML = '<div class="price-label"> 52 Week Low: </div><div class="price">' + stockInfo.prices.week52Low + '</div>';

                    // NEWS NEWS NEWS NEWS
                    // NEWS NEWS NEWS NEWS
                    var newsHtml = stockInfo.news.map(function (newsItem) {
                        // console.log(newsItem);
                        return '<div><a href="' + newsItem.url + '" target="_blank">' + newsItem.headline + '</a></div>';
                    }).join('');

                    // console.log(newsHtml);
                    newsCont.innerHTML = newsHtml;
                    newsHeader.textContent = 'News about ' + stockInfo.info.name;

                });
        });
}

function setUpdateLoop() {
    if (!updateLoop) {
        stockUpdater = setInterval(function () {
            getStockQuote();
        }, 2000);
        repeatBtn.querySelector('i').classList.add('fa-pause');
        repeatBtn.querySelector('i').classList.remove('fa-undo');
    } else {
        clearInterval(stockUpdater);
        updateLoop = !updateLoop;
        repeatBtn.querySelector('i').classList.remove('fa-pause');
        repeatBtn.querySelector('i').classList.add('fa-undo');
    }
    updateLoop = !updateLoop;
}

function isEnterPressed(e) {
    var inputFocused = (document.activeElement === (document.querySelector('#symbolInput')));
    
    if (e.key === 'Enter' && inputFocused) {
        getStockQuote();
    } else if (e.key !== 'Enter' && inputFocused) {
        searchCompaniesForMatch(e)
    } else if (e.key === 'Enter' && !inputFocused && displayTypeahead.style.opacity === '1') {
        var listItemSelected = (document.activeElement === (document.querySelector('#' + selectedListEle.id)));
        document.querySelector('#symbolInput').value = selectedListEle.id;
        selectCompany(selectedListEle.id);
    } else {
        return
    }
}

function searchCompaniesForMatch(e) {
    displayTypeahead.style.opacity = '1';
    var matchedList = document.querySelector('.display-typeahead #matched-list');
    var inputText = document.querySelector('#symbolInput').value;
    if (e.key === 'Backspace') {
        inputText = inputText.toUpperCase();
    } else {
        inputText = (inputText + e.key).toUpperCase();
    }
    exactMatchArray = [];
    matchArray = [];
    exactMatchArrayName = [];
    matchArrayName = [];
    
    companies = NasdaqCompanies.concat(NYSECompanies);
    
    companies.forEach(function(company) {
        // console.clear();
        if (company.Symbol === inputText) {
            exactMatchArray.push(company);
        }
        if (company.Symbol.includes(inputText)) {
            matchArray.push(company);
        }
    });
    var matches = exactMatchArray.concat(matchArray);

    companies.forEach(function(company) {
        if ((company.Name).toUpperCase() === inputText) {
            exactMatchArrayName.push(company);
        }
        if (company.Name.toUpperCase().includes(inputText)) {
            matchArrayName.push(company);
        }
    });
    var nameMatches = exactMatchArrayName.concat(matchArrayName);  

    var allMatches = matches.concat(nameMatches);
    // if (matches.length === 0) {
    //     matches = nameMatches;
    // }

    var listHTML = allMatches.map(function(match) {
        return '<li class="matched-company" tabindex="-1" id="' + match.Symbol + '" onclick="selectCompany(this.id)"> ' + match.Symbol + ' | ' + match.Name + '</li>'
    }).join('');
    var noListHTML = '<li class="matched-company">No Matches...</li>';
    matchedList.innerHTML = listHTML;
    if (!listHTML) {
        matchedList.innerHTML = noListHTML;
    }
}

function navigateMatchedLi(e) {
    if (e.key === 'Backspace') {
        searchCompaniesForMatch(e);
        return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        console.log(e.key);
    } else {
        return
    }

    var list = Array.from(document.querySelectorAll('.matched-company'));
    var inputFocused = (document.activeElement === (document.querySelector('#symbolInput')));


    if (e.key === 'ArrowDown' && displayTypeahead.style.opacity === '1') {
        if (inputFocused) {
            selectedListEle = list[0];
        } else {
            selectedListEle = selectedListEle.nextElementSibling;
        }
        setTimeout(function() {
            selectedListEle.focus();
        }, 100);
    } else if (e.key === 'ArrowUp' && displayTypeahead.style.opacity === '1') {
        if (!selectedListEle.previousElementSibling) {
            document.querySelector('#symbolInput').focus();
        }
        selectedListEle = selectedListEle.previousElementSibling
        setTimeout(function() {
            selectedListEle.focus();
        }, 100);
    } else {
        return
    }
}

function selectCompany(symbol) {
    document.querySelector('#symbolInput').value = symbol;
    displayTypeahead.style.opacity = '0';
    exactMatchArray = [];
    matchArray = [];
    getStockQuote();
}

function saveStockToLocalStorage() {
    var symbolAlreadySaved = false;
    var symbolToSave = {
        symbol: document.querySelector('.symbol').textContent
    }
   symbolsSaved.forEach(function(symbol) {
       if (symbolToSave.symbol === symbol.symbol) {
           symbolAlreadySaved = true;
       }
   });
   if (!symbolAlreadySaved) {
       symbolsSaved.push(symbolToSave);
   } else {
       return
   }
    window.localStorage.setItem('savedStockSymbols', JSON.stringify(symbolsSaved));
}

function getSavedStocks() {
    symbolsSaved = JSON.parse(window.localStorage.getItem('savedStockSymbols'));
    if (!symbolsSaved) {
        symbolsSaved = [];
    }
    getSavedStockInfo();
}

function getSavedStockInfo() {
    var symbolString = symbolsSaved.map(function(symbol) {
        return symbol.symbol;
    }).join(',');
    
    var savedStockUrl = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=' + symbolString+ '&types=quote,news,chart&range=1m&last=5';

    fetch(savedStockUrl)
        .then(function(blob) {
            return blob.json()
            .then(function(data) {
                console.log(data);
            });
        });
}

function initialize() {
    getStockQuote();

    getSavedStocks();

    searchBtn.addEventListener('click', getStockQuote);
    repeatBtn.addEventListener('click', setUpdateLoop);
    saveBtn.addEventListener('click', saveStockToLocalStorage);

    window.addEventListener('keypress', isEnterPressed);
    window.addEventListener('keydown', navigateMatchedLi);
}

initialize();