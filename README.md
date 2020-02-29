# prstv.js
JavaScript implementaion of Irish-flavoured preferential voting

## What's this?

PR-STV is a term used to describe the voting system in Ireland, and other countries. This project aims to implement --- as accurately as possible --- the process of counting ballot papers and determining the winner(s) of an election.

The project began after the Irish General Election of 2020, which was the first general election I voted in (or could vote in). I noticed a lot of confusion about how seats are filled during the count, how surpluses are distributed, how candidates are eliminated. I, too, was one of the confused.

I wanted to help demystify PR-STV, first of all by implementing it as code (what you're seeing here), and secondly as a website that allows you to 

### Use cases

*	Creating an election simulator (what it's designed for)
*	Conducting electronic voting with PR-STV, but generally --- _[please don't](https://xkcd.com/2030)_. It's not under the license terms, but do not use this code for evil!

## Installation

	npm install prstv

## Current Status

This module is in its early stages! It's very much a work in progress. The implementation isn't fully correct, but it's a starting point.

## Usage

```js
const Election = require("prstv")

// how many seats we should fill
const seats = 2

// list of candidates
const candidates = ["John Doe", "Jane Doe"]

// ballot papers
const ballots = [
	{
		1: "Jane Doe"
	},
	{
		1: "John Doe"
	},
	{
		1: "Jane Doe",
		2: "John Doe"
	},
	{
		1: "John Doe",
		2: "Jane Doe"
	}
]

// feed it into a new Election object
const election = new Election(candidates, seats, ballots)

// create a generator to step through the count process
// from start to end
const count = election.countGenerator()

// event for the first step in the count process
console.log(count.next())

// etc...
console.log(count.next())
```