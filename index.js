class Election {
	constructor(candidates, numSeats, ballots) {
		this._complete = false
		this.quota = -1
		this.candidates = candidates
		this.eliminated = []
		this.counts = []
		this.tallies = {}
		this._ballots = ballots
		this._firstPrefTallies = {}
		this.seats = []
		this._numSeats = numSeats

		this.ballots = {
			transferrable: [],
			nonTransferrable: [],
			invalid: []
		}

		// tallies for all candidates start out at one, until we start counting
		for (let candidate of candidates) {
			this.tallies[candidate] = 0
		}
	}

	_isTransferrableAfter(ballot, candidate) {
		let lowestPref = Object.values(ballot).reduce((p, c) => {
			if (p > c) {
				return c
			}
		})

		if (ballot[candidate] > lowestPref) {
			return true
		}

		return false
	}

	_calculateQuota(validBallots) {
		return Math.floor(validBallots / (this._numSeats + 1) + 1)
	}

	_createEmptyCount(first=false) {
		let count = {
			tallies: {},
			reachedQuota: [],
			missedQuota: [],
			elected: [],
			eliminated: []
		}

		return count
	}

	_generateTransferMap() {
		let map = {}

		for (let fromCandidate of this.candidates) {
			map[fromCandidate] = {}

			for (let toCandidate of this.candidates) {
				if (fromCandidate === toCandidate) {
					continue
				}

				map[fromCandidate][toCandidate] = []
			}
		}

		return map
	}

	get ziCurrentCountNum() {
		// zero-indexed count number
		return this.counts.length
	}

	get currentCount() {
		return this.counts[this.ziCurrentCountNum]
	}

	get currentCountNum() {
		// what humans should understand the count number to be
		return this.ziCurrentCountNum + 1
	}

	_addCount(count) {
		this.countResuts.push(count)
	}

	get previousCount() {
		// the results of the previous count are needed to determine
		// transfers, etc
		return this.counts[this.ziCurrentCountNum - 1]
	}

	get availableSeats() {
		return this._numSeats - this.seats.length
	}

	_genEvent(title, data={}) {
		return {
			event: title,
			data
		}
	}

	*_nextPreferences(ballot, after) {
		// get any next preferences, taking into account those who have been elected
		// and those who have been eliminated.
		let { seats, eliminated } = this
		let entries = Object.entries(ballot)
		let currPref

		for (let [preference, candidate] of entries) {
			// figure out what preference we're transferring from
			if (candidate === after) {
				currPref = parseInt(preference)
				break
			}
		}

		for (let i = currPref + 1; i < entries.length + 1; i++) {
			let candidate = ballot[i]

			if (seats.includes(candidate) || eliminated.includes(candidate)) {
				continue
			}

			yield candidate
		}

		return
	}

	*_firstCount() {
		if (this.currentCountNum !== 1) {
			throw new Error("Count has progressed past the first count.")
		}

		// iterate over all received ballots -- we need to tally them for the first
		// count, and get rid of any invalid counts.
		for (let ballot of this._ballots) {
			let candidates = Object.values(ballot)

			// if there aren't any keys in this ballot, it's deemed invalid. this
			// ballot will not be used in calculating the quota for this election,
			// and (obviously) is not useful for calculating anything in this election
			if (candidates.length === 0) {
				this.ballots.invalid.push(ballot)
				yield this._genEvent("invalidBallot")

				continue
			}

			// iterate over each candidate that appears in the ballot paper.
			for (let [preference, candidate] of Object.entries(ballot)) {

				if (preference == 1) {
					// store this candidate as they've received first preference on this
					// particular ballot paper.
					this.tallies[candidate] += 1
					this.ballots.transferrable.push(ballot)

					yield this._genEvent("tally", {
						invalid: false,
						candidate: candidate,
						ballot
					})

					break
				}
			}
		}

		yield this._genEvent("tallyComplete", {
			tallies: this.tallies
		})

		return 
	}

	_validateBallot(ballot) {
		let entries = ballot.keys().sort()

		if (entries.length === entries[entries.length - 1]) {
			return true
		}

		// uh oh we've an erorr with our ballot
		return false

	}

	_getTransferrableCount(from) {
		let total = 0
		let { transferrable } = this.ballots

		for (let [i, ballot] of transferrable.entries()) {
			let candidates = Object.values(ballot)

			let prefs = this._nextPreferences(ballot, from)
			let next = prefs.next()

			if (next.done === true) {
				// no next preferences
				continue
			}

			total++
		}

		return total
	}

	get _candidatesInRace() {
		return this.candidates.filter((c) => {
			return !this.seats.includes(c) || !this.eliminated.includes(c)
		})
	}

	_processTransfers(from, ratio=1) {
		// queue of array indices from transferrable ballots to move to non-trans
		// ballots later on
		let queue = []
		let targets = {}
		let { transferrable } = this.ballots

		if (ratio > 1) {
			ratio = 1
		}

		for (let [i, ballot] of transferrable.entries()) {
			let candidates = Object.values(ballot)
			if (!candidates.includes(from)) {
				continue
			}

			let prefs = this._nextPreferences(ballot, from)
			let next = prefs.next()

			if (next.done === true) {
				// no next preferences
				queue.push(i)
				continue
			}

			if (!targets[next.value]) {
				targets[next.value] = 0
			}

			targets[next.value]++
		}

		queue.sort((a, b) => b - a)
			.forEach(i => {
				// grab and remove the ballot from the transferrable pile
				let ballot = this.ballots.transferrable.splice(i, 1)
				// and stick it in with the non-transferrable ballots
				this.ballots.nonTransferrable.push(ballot)
			})

		for (let target of Object.keys(targets)) {
			let transferSurplus = targets[target]
			targets[target] = Math.round(transferSurplus * ratio)
			this.tallies[target] += targets[target]
		}

		return targets

	}

	*countGenerator() {
		// init a generator to go through the first count
		let firstCountGen = this._firstCount()
		let event = firstCountGen.next()

		while (event.done === false) {
			yield event.value
			event = firstCountGen.next()
		}

		let count = this._createEmptyCount()

		this.quota = this._calculateQuota(this.ballots.transferrable.length
			+ this.ballots.nonTransferrable.length)

		yield this._genEvent("quota", {
			quota: this.quota
		})

		while (this.availableSeats > 0) {
			count.reachedQuota = this._metQuota

			yield this._genEvent("metQuota", {
				candidates: this._metQuota
			})

			count.missedQuota = this._underQuota
			yield this._genEvent("notMetQuota", {
				candidates: this._underQuota
			})

			if (this._metQuota.length === 0) {
				// we need to redistribute the lowest candidate(s) votes.

				// we're storing this as an array, because it's possible that two
				// candidates have the exact same number of tallies. In an actual
				// election in the real world, this is very unlikely to happen
				// due to human error, but because we're calculating exactly based
				// on entered data... we have to think about what'd happen!
				//
				// in short, this should be array[1] more often than not, when
				// there are a large number of ballots.
				let lowestCandidates = []
				// lowest tally out of all candidates
				let lowestTally = this.quota

				for (let candidate of Object.keys(this.tallies)) {
					if (this.eliminated.includes(candidate)) {
						continue
					}

					let tally = this.tallies[candidate]

					if (tally < lowestTally) {
						lowestCandidates = [candidate]
						lowestTally = tally
					} else if (tally === lowestTally) {
						lowestCandidates.push(candidate)
					}
				}

				for (let candidate of lowestCandidates) {

					yield this._genEvent("elimination", {
						candidate
					})

					let changes = this._processTransfers(candidate)

					this.eliminated.push(candidate)
					count.eliminated.push(candidate)

					yield this._genEvent("distribution", {
						source: "elimination",
						changes,
						tallies: this.tallies
					})
					
				}

			}

			if (this._metQuota.length > 0 && this._metQuota.length <= this.availableSeats) {

				for (let elected of this._metQuota) {
					let tally = this.tallies[elected]
					// calculate amount of surplus votes if they exist
					let surplus = tally - this.quota

					this.seats.push(elected)
					count.elected.push(elected)

					yield this._genEvent("elected", {
						candidate: elected,
						tally: this.tallies[elected],
						seatsFilled: this.seats,
						surplus
					})

					// distribute this candidate's surplus

					if (surplus === 0) {
						// when the amount of surplus votes is zero, we've nothing to transfer
						continue
					} else {
						let transferrableCount = this._getTransferrableCount(elected)
						let ratio = surplus / transferrableCount

						let changes = this._processTransfers(elected, ratio)

						yield this._genEvent("distribution", {
							source: "surplus",
							changes,
							tallies: this.tallies
						})
					}

				}

			} else if (this._metQuota.length > this.availableSeats) {
				// we don't have enough seats for the amount of candidates who've met
				// quota on this count, so the highest tallying candidates get the seats.
				// ???
			}

			count.tallies = this.tallies
			this.counts.push(count)

			yield this._genEvent("countComplete", {
				number: this.currentCountNum - 1,
				count
			})
		}

		yield this._genEvent("complete", {
			seats: this.seats,
			tallies: this.tallies
		})

		return

	}

	get _metQuota() {
		// create a list of candidates that have met quota at any point in the
		// count process
		let candidates = []

		for (let candidate of Object.keys(this.tallies)) {
			if (this.seats.includes(candidate)) {
				continue
			}

			if (this.eliminated.includes(candidate)) {
				continue
			}

			let tally = this.tallies[candidate]

			if (tally >= this.quota) {
				candidates.push(candidate)
			}
		}

		return candidates
	}

	get _underQuota() {
		// create a list of candidates that have met quota at any point in the
		// count process
		let candidates = []

		for (let candidate of Object.keys(this.tallies)) {
			if (this.seats.includes(candidate)) {
				continue
			}

			if (this.eliminated.includes(candidate)) {
				continue
			}

			let tally = this.tallies[candidate]

			if (tally < this.quota) {
				candidates.push(candidate)
			}
		}

		return candidates
	}

	count() {
		let events = []
		let generator = this.countGenerator()

		for (let event = generator.next();
				 event.done !== true;
				 event = generator.next()) {

			let {value} = event

			events.push(value)
		}

		return events
	}
}

module.exports = Election