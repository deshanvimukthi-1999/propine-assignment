import fetch from 'node-fetch';
import csv from 'csv-parser';
import fs from 'fs';

const API_KEY = '8ad3ade66be1534e7faf2103d8dd3623911992d42b4e82048844c2695312342f'; // replace with your CryptoCompare API key
const CSV_FILE = './data/transactions.csv'; // replace with the path to your CSV file

// Define a function to fetch the latest price for a given token
async function getTokenPrice(token) {
  const response = await fetch(`https://min-api.cryptocompare.com/data/price?fsym=${token}&tsyms=USD&api_key=${API_KEY}`);
  const data = await response.json();
  return data.USD;
}

// Define a function to calculate the portfolio value in USD
async function calculatePortfolioValue() {
  const portfolio = {};
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on('data', (row) => {
      const { timestamp, transaction_type, token, amount } = row;
      const balance = portfolio[token] || 0;
      if (transaction_type === 'DEPOSIT') {
        portfolio[token] = balance + parseFloat(amount);
      } else if (transaction_type === 'WITHDRAWAL') {
        portfolio[token] = balance - parseFloat(amount);
      }
    })
    .on('end', async () => {
      const prices = {};
      for (const token in portfolio) {
        prices[token] = await getTokenPrice(token);
      }
      const portfolioValue = {};
      for (const token in portfolio) {
        portfolioValue[token] = portfolio[token] * prices[token];
      }
      console.log(portfolioValue);
    });
}

calculatePortfolioValue();
