const Election = require("../")

let candidates = ["Fionn", "Jamie", "Hannah", "Jessica"]

let ballots = [
	{
		1: "Hannah",
		2: "Jamie"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jamie"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jamie"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie",
		3: "Jessica",
		4: "Hannah"
	},
	{
		1: "Hannah",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jessica"
	},
	{
		1: "Hannah",
		2: "Jessica"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie",
		3: "Jessica",
		4: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jessica",
		3: "Fionn"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jessica",
		3: "Fionn"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jessica",
		3: "Fionn"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jessica",
		2: "Jamie"
	},
	{
		1: "Hannah",
		2: "Jessica",
		3: "Fionn"
	},
	{
		1: "Fionn"
	},
	{
		1: "Hannah"
	},
	{
		1: "Fionn"
	},
	{
		1: "Fionn"
	},
	{
		1: "Fionn"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jessica"
	},
	{
		1: "Fionn",
		2: "Jessica"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Fionn",
		2: "Jamie"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
	{
		1: "Jamie",
		2: "Hannah"
	},
]

let election = new Election(candidates, 3, ballots)

let g = election.count()
console.log(g)