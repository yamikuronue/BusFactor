# BusFactor
Calculate the bus factor for a repository

[![Build Status](https://travis-ci.org/yamikuronue/BusFactor.svg?branch=master)](https://travis-ci.org/yamikuronue/BusFactor)  [![Coverage Status](https://coveralls.io/repos/yamikuronue/BusFactor/badge.svg?branch=master&service=github)](https://coveralls.io/github/yamikuronue/BusFactor?branch=master)

##What is a bus factor?
From Wikipedia:

>In software development, a project's bus factor is the number of developers it would need to lose to destroy its institutional memory and halt its progress. It is [...] a measurement of the concentration of information in individual team members. A high bus factor means that many individuals know enough to carry on and the project could still succeed even in very adverse events.

>"Getting hit by a bus" could take many different forms where the project would retain information (such as source code or other systems) with which no remaining team member is familiar with, including anything that suddenly and substantially prevented the individual from working on the project. This could be a person taking a new job, having a baby, changing their lifestyle or life status: the effect would be the same.

##How is this calculated?
It's a pretty naive algorithm, to be honest. For each file, it calculates the owner of the file (the single contributor who has written the most lines in the file). Then, it simulates a bus hitting the contributors in order of most files owned. When 50% of the files are orphaned, it determines that the project is "dead"

##How can I calculate the bus number?
Run with `node index.js`

Options:

```
Options:
  -r, --repo  Repository to scan                             [string] [required]

  -t, --type  Type of repository. Accepts "git", "svn", "hg", or "auto"
                                                      [string] [default: "auto"]

```

##Why doesn't it support [insert source control product here]?
PRs accepted.