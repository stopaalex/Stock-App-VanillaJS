
const header = document.querySelector('#headerText');
const currentPrice = document.querySelector('#immediatePricing .current-price');
const searchBtn = document.querySelector('#search');
const symbolSearch = document.querySelector('#symbolInput');
// const highPrice = document.querySelector('#high .price');
// const lowPrice = document.querySelector('#low .price');

var avAPIkey = '22RLQBUD3O1DBUDY';
var symbol = 'FB'




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
                            low: stock.low
                        }
                    }

                    var currentChange = Math.round(((Math.round(stockInfo.prices.current * 100) / 100) - (Math.round(stockInfo.prices.prevClose * 100) / 100)) * 100) / 100;
                    var changeDir = '';
                    if (currentChange >= 0) {
                        changeDir = '+';
                    } else {
                        changeDir = '';
                    }

                    header.innerHTML = '<span class="symbol">' + stockInfo.info.symbol + '</span>' + '<span class="name">' + stockInfo.info.name + '</span>' + '<span class="exchange">' + stockInfo.info.exchange + '</span>';
                    var currentPriceCurrent = currentPrice.querySelector('.current');
                    currentPriceCurrent.innerHTML = '<div class="adjust-color price-display">' + Math.round(stockInfo.prices.current * 100) / 100 + '</div>' + '<span class="price-underline">' + ' <div class="adjust-color price-change">' + ' $' + changeDir + currentChange + '</div>' + '</span>';
                    var currentPricePrev = currentPrice.querySelector('.prev-close');
                    currentPricePrev.textContent = (Math.round(stockInfo.prices.prevClose * 100) / 100);

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

                });
        });
}


function originalGetStockQuote() {
    // var urlCurrent = 'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=' + symbol + '&interval=1min&apikey=' + avAPIkey + '';
    // var urlDaily = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=' + symbol + '&interval=1min&apikey=' + avAPIkey + '';

    // var apiArray = [
    //     fetch(urlCurrent)
    //         .then(function (blob) {
    //             return blob.json()
    //                 .then(function (data) {
    //                     return data;
    //                 })
    //         }),
    //     fetch(urlDaily)
    //         .then(function (blob) {
    //             return blob.json()
    //                 .then(function (data) {
    //                     return data;
    //                 })
    //         })
    // ]

    // Promise.all(apiArray)
    //     .then(function (data) {

    //         var tempDate = new Date();
    //         var date = {
    //             year: tempDate.getFullYear(),
    //             month: tempDate.getMonth() + 1,
    //             day: tempDate.getDate(),
    //             hour: tempDate.getHours(),
    //             min: tempDate.getMinutes(),
    //         }
    //         var dateFormated = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2);
    //         var prevDateFormated = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + (date.day - 1)).slice(-2);
    //         var dateTimeFormated = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + date.hour).slice(-2) + ':' + ('0' + date.min).slice(-2) + ':00';

    //         var dailyQuotes = {
    //             info: data[1]['Meta Data'],
    //             prices: data[1]['Time Series (Daily)']
    //         };

    //         var currentQuotes = {
    //             info: data[0]['Meta Data'],
    //             prices: data[0]['Time Series (1min)']
    //         };

    //         // changing date if price isn't updated in time to previous minute
    //         if (currentQuotes.prices[dateTimeFormated] === undefined) {
    //             var dateTimeFormated = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + ' ' + ('0' + date.hour).slice(-2) + ':' + ('0' + (date.min - 1)).slice(-2) + ':00';
    //         }

    //         var stockInfo = {
    //             info: {
    //                 name: dailyQuotes.info['2. Symbol']
    //             },
    //             prices: {
    //                 open: dailyQuotes.prices[dateFormated]['1. open'],
    //                 prevClose: dailyQuotes.prices[prevDateFormated]['4. close'],
    //                 current: currentQuotes.prices[dateTimeFormated]['1. open'],
    //                 high: dailyQuotes.prices[dateFormated]['2. high'],
    //                 low: dailyQuotes.prices[dateFormated]['3. low']
    //             }
    //         }

    //         console.log(stockInfo);
    //         // console.log(dailyQuotes);
    //         // console.log(currentQuotes);



    //     });
}

function initialize() {
    // originalGetStockQuote();
    getStockQuote();

    searchBtn.addEventListener('click', getStockQuote);
}

initialize();